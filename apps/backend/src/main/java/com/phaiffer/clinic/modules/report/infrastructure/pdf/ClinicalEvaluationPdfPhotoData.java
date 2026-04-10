package com.phaiffer.clinic.modules.report.infrastructure.pdf;

import java.time.LocalDate;

public record ClinicalEvaluationPdfPhotoData(
        String originalFileName,
        String category,
        LocalDate captureDate,
        String notes,
        String contentType,
        String base64Content
) {
}
