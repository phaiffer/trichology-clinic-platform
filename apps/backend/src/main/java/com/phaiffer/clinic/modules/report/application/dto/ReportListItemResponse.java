package com.phaiffer.clinic.modules.report.application.dto;

import com.phaiffer.clinic.modules.report.domain.model.ReportType;

import java.time.Instant;
import java.util.UUID;

public record ReportListItemResponse(
        UUID id,
        UUID patientId,
        UUID anamnesisRecordId,
        UUID scoreResultId,
        String title,
        String summary,
        Instant generatedAt,
        String fileName,
        ReportType reportType,
        Instant createdAt,
        int selectedPhotosCount,
        String fileUrl
) {
}
