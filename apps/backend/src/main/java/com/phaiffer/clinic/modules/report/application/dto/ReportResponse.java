package com.phaiffer.clinic.modules.report.application.dto;

import com.phaiffer.clinic.modules.report.domain.model.ReportType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReportResponse(
        UUID id,
        UUID patientId,
        String patientName,
        UUID anamnesisRecordId,
        String anamnesisTemplateName,
        UUID scoreResultId,
        String scoreType,
        Double scoreValue,
        String scoreClassification,
        String scoreInterpretation,
        String title,
        String summary,
        Instant generatedAt,
        String fileName,
        ReportType reportType,
        Instant createdAt,
        int selectedPhotosCount,
        List<ReportPhotoSelectionResponse> selectedPhotos,
        String fileUrl
) {
}
