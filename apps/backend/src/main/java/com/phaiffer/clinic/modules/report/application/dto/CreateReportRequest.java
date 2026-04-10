package com.phaiffer.clinic.modules.report.application.dto;

import com.phaiffer.clinic.modules.report.domain.model.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CreateReportRequest(
        UUID anamnesisRecordId,
        UUID scoreResultId,
        List<UUID> selectedPhotoIds,
        @NotBlank @Size(max = 255) String title,
        @Size(max = 3000) String summary,
        @NotNull ReportType reportType
) {
}
