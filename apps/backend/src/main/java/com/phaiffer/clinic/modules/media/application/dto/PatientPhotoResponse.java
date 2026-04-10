package com.phaiffer.clinic.modules.media.application.dto;

import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PatientPhotoResponse(
        UUID id,
        UUID patientId,
        UUID anamnesisRecordId,
        String anamnesisTemplateName,
        String fileName,
        String originalFileName,
        String contentType,
        long fileSize,
        PhotoCategory category,
        LocalDate captureDate,
        String notes,
        Instant createdAt,
        String fileUrl
) {
}
