package com.phaiffer.clinic.modules.anamnesis.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AnamnesisTemplateUpdateRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 1000) String description,
        Boolean active,
        @NotEmpty List<@Valid AnamnesisTemplateQuestionUpdateRequest> questions
) {
}
