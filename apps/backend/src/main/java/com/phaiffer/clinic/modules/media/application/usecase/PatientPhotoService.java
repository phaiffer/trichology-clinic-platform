package com.phaiffer.clinic.modules.media.application.usecase;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisRecordRepository;
import com.phaiffer.clinic.modules.media.application.dto.PatientPhotoMapper;
import com.phaiffer.clinic.modules.media.application.dto.PatientPhotoResponse;
import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;
import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;
import com.phaiffer.clinic.modules.media.domain.repository.PatientPhotoRepository;
import com.phaiffer.clinic.modules.media.infrastructure.storage.PatientPhotoStorage;
import com.phaiffer.clinic.modules.media.infrastructure.storage.StoredPatientPhotoFile;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.shared.config.media.MediaStorageProperties;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class PatientPhotoService {

    private static final Pattern UNSAFE_FILE_NAME_CHARS = Pattern.compile("[^a-zA-Z0-9._-]");

    private final PatientRepository patientRepository;
    private final AnamnesisRecordRepository anamnesisRecordRepository;
    private final PatientPhotoRepository patientPhotoRepository;
    private final PatientPhotoStorage patientPhotoStorage;
    private final Set<String> allowedContentTypes;
    private final long maxFileSizeBytes;

    public PatientPhotoService(
            PatientRepository patientRepository,
            AnamnesisRecordRepository anamnesisRecordRepository,
            PatientPhotoRepository patientPhotoRepository,
            PatientPhotoStorage patientPhotoStorage,
            MediaStorageProperties mediaStorageProperties
    ) {
        this.patientRepository = patientRepository;
        this.anamnesisRecordRepository = anamnesisRecordRepository;
        this.patientPhotoRepository = patientPhotoRepository;
        this.patientPhotoStorage = patientPhotoStorage;
        this.allowedContentTypes = mediaStorageProperties.getAllowedContentTypes().stream()
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .filter(value -> !value.isBlank())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        this.maxFileSizeBytes = mediaStorageProperties.getMaxFileSizeBytes();
    }

    @Transactional
    public List<PatientPhotoResponse> uploadPhotos(
            UUID patientId,
            MultipartFile[] files,
            UUID anamnesisRecordId,
            PhotoCategory category,
            LocalDate captureDate,
            String notes
    ) {
        Patient patient = findPatient(patientId);
        AnamnesisRecord anamnesisRecord = findOptionalAnamnesisRecord(patientId, anamnesisRecordId);
        validateFiles(files);

        List<PatientPhoto> savedPhotos = new ArrayList<>();
        List<String> storedPaths = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                validateFile(file);
                StoredPatientPhotoFile storedFile = patientPhotoStorage.store(patientId, file);
                storedPaths.add(storedFile.storagePath());

                PatientPhoto patientPhoto = new PatientPhoto();
                patientPhoto.setPatient(patient);
                patientPhoto.setAnamnesisRecord(anamnesisRecord);
                patientPhoto.setFileName(storedFile.fileName());
                patientPhoto.setOriginalFileName(sanitizeOriginalFileName(file.getOriginalFilename()));
                patientPhoto.setContentType(normalizeContentType(file.getContentType()));
                patientPhoto.setFileSize(file.getSize());
                patientPhoto.setStoragePath(storedFile.storagePath());
                patientPhoto.setCategory(category);
                patientPhoto.setCaptureDate(captureDate);
                patientPhoto.setNotes(normalizeNotes(notes));
                savedPhotos.add(patientPhotoRepository.save(patientPhoto));
            }
        } catch (RuntimeException exception) {
            for (String storedPath : storedPaths) {
                patientPhotoStorage.delete(storedPath);
            }
            throw exception;
        }

        return savedPhotos.stream()
                .map(PatientPhotoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PatientPhotoResponse> listPhotos(UUID patientId, PhotoCategory category) {
        findPatient(patientId);
        return patientPhotoRepository.findByPatientId(patientId, category).stream()
                .map(PatientPhotoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientPhotoResponse getPhoto(UUID patientId, UUID photoId) {
        return PatientPhotoMapper.toResponse(findPhoto(patientId, photoId));
    }

    @Transactional(readOnly = true)
    public Resource getPhotoFile(UUID patientId, UUID photoId) {
        PatientPhoto patientPhoto = findPhoto(patientId, photoId);
        return patientPhotoStorage.loadAsResource(patientPhoto.getStoragePath());
    }

    @Transactional
    public void deletePhoto(UUID patientId, UUID photoId) {
        PatientPhoto patientPhoto = findPhoto(patientId, photoId);
        patientPhotoRepository.delete(patientPhoto);
        patientPhotoStorage.delete(patientPhoto.getStoragePath());
    }

    private Patient findPatient(UUID patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
    }

    private PatientPhoto findPhoto(UUID patientId, UUID photoId) {
        findPatient(patientId);
        return patientPhotoRepository.findByIdAndPatientId(photoId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient photo not found: " + photoId));
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

    private void validateFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("At least one image file is required");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!allowedContentTypes.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type: " + contentType);
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("File exceeds the maximum allowed size of " + maxFileSizeBytes + " bytes");
        }
    }

    private String sanitizeOriginalFileName(String originalFileName) {
        String baseName = originalFileName == null ? "photo" : originalFileName.strip();
        String normalized = baseName.replace("\\", "/");
        int lastSlash = normalized.lastIndexOf('/');
        if (lastSlash >= 0) {
            normalized = normalized.substring(lastSlash + 1);
        }

        normalized = UNSAFE_FILE_NAME_CHARS.matcher(normalized).replaceAll("_");
        normalized = normalized.replace("..", "_");

        if (normalized.isBlank()) {
            return "photo";
        }

        return normalized.length() > 255 ? normalized.substring(0, 255) : normalized;
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeNotes(String notes) {
        if (notes == null) {
            return null;
        }

        String normalized = notes.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
