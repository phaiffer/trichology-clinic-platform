package com.phaiffer.clinic.modules.report.application.dto;

import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;

import java.time.LocalDate;
import java.util.UUID;

public record ReportPhotoSelectionResponse(
        UUID id,
        String originalFileName,
        PhotoCategory category,
        LocalDate captureDate,
        String notes,
        String fileUrl
) {
}
