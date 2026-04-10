package com.phaiffer.clinic.modules.report.application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisAnswer;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisRecordRepository;
import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;
import com.phaiffer.clinic.modules.media.domain.repository.PatientPhotoRepository;
import com.phaiffer.clinic.modules.media.infrastructure.storage.PatientPhotoStorage;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.modules.report.application.dto.CreateReportRequest;
import com.phaiffer.clinic.modules.report.application.dto.ReportListItemResponse;
import com.phaiffer.clinic.modules.report.application.dto.ReportMapper;
import com.phaiffer.clinic.modules.report.application.dto.ReportResponse;
import com.phaiffer.clinic.modules.report.domain.model.Report;
import com.phaiffer.clinic.modules.report.domain.model.ReportType;
import com.phaiffer.clinic.modules.report.domain.repository.ReportRepository;
import com.phaiffer.clinic.modules.report.infrastructure.pdf.ClinicalEvaluationPdfAnswerData;
import com.phaiffer.clinic.modules.report.infrastructure.pdf.ClinicalEvaluationPdfData;
import com.phaiffer.clinic.modules.report.infrastructure.pdf.ClinicalEvaluationPdfGenerator;
import com.phaiffer.clinic.modules.report.infrastructure.pdf.ClinicalEvaluationPdfPhotoData;
import com.phaiffer.clinic.modules.report.infrastructure.storage.ReportFileStorage;
import com.phaiffer.clinic.modules.report.infrastructure.storage.StoredReportFile;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import com.phaiffer.clinic.modules.scoring.domain.repository.ScoreResultRepository;
import com.phaiffer.clinic.shared.config.report.ReportStorageProperties;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import com.phaiffer.clinic.shared.exception.report.ReportStorageException;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ReportService {

    private static final Pattern UNSAFE_FILE_NAME_CHARS = Pattern.compile("[^a-zA-Z0-9._-]");

    private final PatientRepository patientRepository;
    private final AnamnesisRecordRepository anamnesisRecordRepository;
    private final ScoreResultRepository scoreResultRepository;
    private final PatientPhotoRepository patientPhotoRepository;
    private final PatientPhotoStorage patientPhotoStorage;
    private final ReportRepository reportRepository;
    private final ReportFileStorage reportFileStorage;
    private final ClinicalEvaluationPdfGenerator clinicalEvaluationPdfGenerator;
    private final ReportStorageProperties reportStorageProperties;
    private final ObjectMapper objectMapper;

    public ReportService(
            PatientRepository patientRepository,
            AnamnesisRecordRepository anamnesisRecordRepository,
            ScoreResultRepository scoreResultRepository,
            PatientPhotoRepository patientPhotoRepository,
            PatientPhotoStorage patientPhotoStorage,
            ReportRepository reportRepository,
            ReportFileStorage reportFileStorage,
            ClinicalEvaluationPdfGenerator clinicalEvaluationPdfGenerator,
            ReportStorageProperties reportStorageProperties,
            ObjectMapper objectMapper
    ) {
        this.patientRepository = patientRepository;
        this.anamnesisRecordRepository = anamnesisRecordRepository;
        this.scoreResultRepository = scoreResultRepository;
        this.patientPhotoRepository = patientPhotoRepository;
        this.patientPhotoStorage = patientPhotoStorage;
        this.reportRepository = reportRepository;
        this.reportFileStorage = reportFileStorage;
        this.clinicalEvaluationPdfGenerator = clinicalEvaluationPdfGenerator;
        this.reportStorageProperties = reportStorageProperties;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ReportResponse createReport(UUID patientId, CreateReportRequest request) {
        if (request.reportType() != ReportType.CLINICAL_EVALUATION) {
            throw new IllegalArgumentException("Unsupported report type: " + request.reportType());
        }

        Patient patient = findPatient(patientId);
        AnamnesisRecord anamnesisRecord = findOptionalAnamnesisRecord(patientId, request.anamnesisRecordId());
        ScoreResult scoreResult = findOptionalScoreResult(patientId, request.scoreResultId());
        List<PatientPhoto> selectedPhotos = findSelectedPhotos(patientId, request.selectedPhotoIds());
        Instant generatedAt = Instant.now();
        String normalizedTitle = normalizeTitle(request.title());
        String normalizedSummary = normalizeSummary(request.summary());

        ClinicalEvaluationPdfData pdfData = new ClinicalEvaluationPdfData(
                reportStorageProperties.getClinicTitle(),
                request.reportType(),
                normalizedTitle,
                generatedAt,
                patient.getId(),
                patient.getFirstName() + " " + patient.getLastName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getBirthDate(),
                patient.getGender(),
                patient.getNotes(),
                normalizedSummary,
                anamnesisRecord != null ? anamnesisRecord.getTemplate().getName() : null,
                anamnesisRecord != null ? anamnesisRecord.getCreatedAt() : null,
                buildAnswerData(anamnesisRecord),
                scoreResult != null ? scoreResult.getScoreType() : null,
                scoreResult != null ? scoreResult.getScoreValue() : null,
                scoreResult != null ? scoreResult.getClassification() : null,
                scoreResult != null ? scoreResult.getInterpretation() : null,
                scoreResult != null ? scoreResult.getCalculatedAt() : null,
                buildPhotoData(selectedPhotos)
        );

        byte[] pdfContent = clinicalEvaluationPdfGenerator.generate(pdfData);
        StoredReportFile storedReportFile = null;

        try {
            storedReportFile = reportFileStorage.store(
                    patientId,
                    buildRequestedFileName(patient, normalizedTitle, request.reportType(), generatedAt),
                    pdfContent
            );

            Report report = new Report();
            report.setPatient(patient);
            report.setAnamnesisRecord(anamnesisRecord);
            report.setScoreResult(scoreResult);
            report.setTitle(normalizedTitle);
            report.setSummary(normalizedSummary);
            report.setGeneratedAt(generatedAt);
            report.setFileName(storedReportFile.fileName());
            report.setStoragePath(storedReportFile.storagePath());
            report.setReportType(request.reportType());
            report.setSelectedPhotoIds(selectedPhotos.stream().map(PatientPhoto::getId).toList());

            Report savedReport = reportRepository.save(report);
            return ReportMapper.toResponse(savedReport, selectedPhotos);
        } catch (RuntimeException exception) {
            if (storedReportFile != null) {
                reportFileStorage.delete(storedReportFile.storagePath());
            }
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public List<ReportListItemResponse> listReports(UUID patientId) {
        findPatient(patientId);
        return reportRepository.findByPatientId(patientId).stream()
                .map(ReportMapper::toListItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID patientId, UUID reportId) {
        findPatient(patientId);
        Report report = findReport(patientId, reportId);
        return ReportMapper.toResponse(report, findSelectedPhotos(patientId, report.getSelectedPhotoIds()));
    }

    @Transactional(readOnly = true)
    public Resource getReportFile(UUID patientId, UUID reportId) {
        findPatient(patientId);
        Report report = findReport(patientId, reportId);
        return reportFileStorage.loadAsResource(report.getStoragePath());
    }

    @Transactional
    public void deleteReport(UUID patientId, UUID reportId) {
        findPatient(patientId);
        Report report = findReport(patientId, reportId);
        reportRepository.delete(report);
        reportFileStorage.delete(report.getStoragePath());
    }

    private Patient findPatient(UUID patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
    }

    private Report findReport(UUID patientId, UUID reportId) {
        return reportRepository.findByIdAndPatientId(reportId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));
    }

    private AnamnesisRecord findOptionalAnamnesisRecord(UUID patientId, UUID anamnesisRecordId) {
        if (anamnesisRecordId == null) {
            return null;
        }

        return anamnesisRecordRepository.findByIdAndPatientId(anamnesisRecordId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient anamnesis record not found: " + anamnesisRecordId
                ));
    }

    private ScoreResult findOptionalScoreResult(UUID patientId, UUID scoreResultId) {
        if (scoreResultId == null) {
            return null;
        }

        return scoreResultRepository.findByIdAndPatientId(scoreResultId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Score result not found: " + scoreResultId));
    }

    private List<PatientPhoto> findSelectedPhotos(UUID patientId, List<UUID> selectedPhotoIds) {
        List<UUID> requestedIds = selectedPhotoIds == null ? List.of() : selectedPhotoIds.stream()
                .filter(id -> id != null)
                .distinct()
                .toList();

        if (requestedIds.isEmpty()) {
            return List.of();
        }

        List<PatientPhoto> photos = patientPhotoRepository.findAllByPatientIdAndIds(patientId, requestedIds);
        if (photos.size() != requestedIds.size()) {
            throw new ResourceNotFoundException("One or more selected patient photos were not found");
        }

        Map<UUID, PatientPhoto> photosById = new LinkedHashMap<>();
        for (PatientPhoto photo : photos) {
            photosById.put(photo.getId(), photo);
        }

        List<PatientPhoto> orderedPhotos = new ArrayList<>();
        for (UUID photoId : requestedIds) {
            PatientPhoto photo = photosById.get(photoId);
            if (photo == null) {
                throw new ResourceNotFoundException("One or more selected patient photos were not found");
            }
            orderedPhotos.add(photo);
        }

        return orderedPhotos;
    }

    private List<ClinicalEvaluationPdfAnswerData> buildAnswerData(AnamnesisRecord anamnesisRecord) {
        if (anamnesisRecord == null) {
            return List.of();
        }

        return anamnesisRecord.getAnswers().stream()
                .sorted((left, right) -> Integer.compare(
                        left.getQuestion().getDisplayOrder(),
                        right.getQuestion().getDisplayOrder()
                ))
                .map(this::toAnswerData)
                .toList();
    }

    private ClinicalEvaluationPdfAnswerData toAnswerData(AnamnesisAnswer answer) {
        return new ClinicalEvaluationPdfAnswerData(
                answer.getQuestion().getLabel(),
                formatAnswerValue(answer.getAnswerValue())
        );
    }

    private String formatAnswerValue(String serializedValue) {
        try {
            Object value = objectMapper.readValue(serializedValue, Object.class);

            if (value instanceof List<?> listValue) {
                return listValue.stream()
                        .map(String::valueOf)
                        .reduce((left, right) -> left + ", " + right)
                        .orElse("-");
            }

            return value == null ? "-" : String.valueOf(value);
        } catch (IOException exception) {
            return serializedValue;
        }
    }

    private List<ClinicalEvaluationPdfPhotoData> buildPhotoData(List<PatientPhoto> selectedPhotos) {
        return selectedPhotos.stream()
                .map(this::toPhotoData)
                .toList();
    }

    private ClinicalEvaluationPdfPhotoData toPhotoData(PatientPhoto patientPhoto) {
        try {
            Resource resource = patientPhotoStorage.loadAsResource(patientPhoto.getStoragePath());

            try (InputStream inputStream = resource.getInputStream()) {
                return new ClinicalEvaluationPdfPhotoData(
                        patientPhoto.getOriginalFileName(),
                        patientPhoto.getCategory().name(),
                        patientPhoto.getCaptureDate(),
                        patientPhoto.getNotes(),
                        patientPhoto.getContentType(),
                        Base64.getEncoder().encodeToString(inputStream.readAllBytes())
                );
            }
        } catch (IOException exception) {
            throw new ReportStorageException("Unable to load patient photo for report generation", exception);
        }
    }

    private String buildRequestedFileName(
            Patient patient,
            String title,
            ReportType reportType,
            Instant generatedAt
    ) {
        String patientName = (patient.getFirstName() + "-" + patient.getLastName()).toLowerCase(Locale.ROOT);
        String safePatientName = sanitizeSegment(patientName);
        String safeTitle = sanitizeSegment(title.toLowerCase(Locale.ROOT));
        long timestamp = generatedAt.toEpochMilli();
        return safePatientName + "-" + safeTitle + "-" + reportType.name().toLowerCase(Locale.ROOT) + "-" + timestamp + ".pdf";
    }

    private String sanitizeSegment(String value) {
        String normalized = value == null ? "report" : value.strip();
        normalized = UNSAFE_FILE_NAME_CHARS.matcher(normalized).replaceAll("-");
        normalized = normalized.replace("..", "-");
        normalized = normalized.replaceAll("-{2,}", "-");
        normalized = normalized.replaceAll("^-|-$", "");
        return normalized.isBlank() ? "report" : normalized;
    }

    private String normalizeTitle(String title) {
        String normalized = title == null ? "" : title.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Report title is required");
        }
        return normalized;
    }

    private String normalizeSummary(String summary) {
        if (summary == null) {
            return null;
        }

        String normalized = summary.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
