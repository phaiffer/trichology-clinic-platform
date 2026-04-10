package com.phaiffer.clinic.modules.anamnesis.application.dto;

import jakarta.validation.constraints.NotNull;

public record AnamnesisTemplateStatusRequest(
        @NotNull Boolean active
) {
}
