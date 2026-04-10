package com.phaiffer.clinic.modules.anamnesis.application.dto;

import java.time.Instant;
import java.util.UUID;

public record PatientAnamnesisRecordListItemResponse(
        UUID id,
        UUID patientId,
        UUID templateId,
        String templateName,
        Instant createdAt
) {
}

