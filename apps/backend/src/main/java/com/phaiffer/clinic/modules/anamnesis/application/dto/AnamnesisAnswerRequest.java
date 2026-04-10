package com.phaiffer.clinic.modules.anamnesis.application.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AnamnesisAnswerRequest(
        @NotNull UUID questionId,
        Object value
) {
}

