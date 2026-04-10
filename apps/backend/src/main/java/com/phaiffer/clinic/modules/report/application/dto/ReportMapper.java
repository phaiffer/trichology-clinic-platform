package com.phaiffer.clinic.modules.report.application.dto;

import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;
import com.phaiffer.clinic.modules.report.domain.model.Report;

import java.util.List;

public final class ReportMapper {

    private ReportMapper() {
    }

    public static ReportListItemResponse toListItemResponse(Report report) {
        return new ReportListItemResponse(
                report.getId(),
                report.getPatient().getId(),
                report.getAnamnesisRecord() != null ? report.getAnamnesisRecord().getId() : null,
                report.getScoreResult() != null ? report.getScoreResult().getId() : null,
                report.getTitle(),
                report.getSummary(),
                report.getGeneratedAt(),
                report.getFileName(),
                report.getReportType(),
                report.getCreatedAt(),
                report.getSelectedPhotoIds().size(),
                buildFileUrl(report)
        );
    }

    public static ReportResponse toResponse(Report report, List<PatientPhoto> selectedPhotos) {
        return new ReportResponse(
                report.getId(),
                report.getPatient().getId(),
                report.getPatient().getFirstName() + " " + report.getPatient().getLastName(),
                report.getAnamnesisRecord() != null ? report.getAnamnesisRecord().getId() : null,
                report.getAnamnesisRecord() != null ? report.getAnamnesisRecord().resolveTemplateName() : null,
                report.getScoreResult() != null ? report.getScoreResult().getId() : null,
                report.getScoreResult() != null ? report.getScoreResult().resolveLabel() : null,
                report.getScoreResult() != null ? report.getScoreResult().resolveTotalScore() : null,
                report.getScoreResult() != null ? report.getScoreResult().resolveClassification() : null,
                report.getScoreResult() != null ? report.getScoreResult().resolveSummary() : null,
                report.getTitle(),
                report.getSummary(),
                report.getGeneratedAt(),
                report.getFileName(),
                report.getReportType(),
                report.getCreatedAt(),
                selectedPhotos.size(),
                selectedPhotos.stream().map(ReportMapper::toPhotoSelectionResponse).toList(),
                buildFileUrl(report)
        );
    }

    private static ReportPhotoSelectionResponse toPhotoSelectionResponse(PatientPhoto patientPhoto) {
        return new ReportPhotoSelectionResponse(
                patientPhoto.getId(),
                patientPhoto.getOriginalFileName(),
                patientPhoto.getCategory(),
                patientPhoto.getCaptureDate(),
                patientPhoto.getNotes(),
                "/api/patients/" + patientPhoto.getPatient().getId() + "/photos/" + patientPhoto.getId() + "/file"
        );
    }

    private static String buildFileUrl(Report report) {
        return "/api/patients/" + report.getPatient().getId() + "/reports/" + report.getId() + "/file";
    }
}
