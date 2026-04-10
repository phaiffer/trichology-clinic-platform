package com.phaiffer.clinic.modules.anamnesis.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnamnesisTemplateResponse(
        UUID id,
        String name,
        String description,
        boolean active,
        Instant createdAt,
        List<AnamnesisQuestionResponse> questions
) {
}

