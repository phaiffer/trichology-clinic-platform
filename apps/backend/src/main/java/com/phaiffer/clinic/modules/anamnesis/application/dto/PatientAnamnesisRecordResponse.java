package com.phaiffer.clinic.modules.anamnesis.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PatientAnamnesisRecordResponse(
        UUID id,
        UUID patientId,
        String patientName,
        UUID templateId,
        String templateName,
        Instant createdAt,
        List<AnamnesisAnswerResponse> answers
) {
}
