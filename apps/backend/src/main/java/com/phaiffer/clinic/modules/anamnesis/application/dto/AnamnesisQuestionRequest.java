package com.phaiffer.clinic.modules.anamnesis.application.dto;

import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AnamnesisQuestionRequest(
        @NotBlank @Size(max = 500) String label,
        @Size(max = 1000) String helperText,
        @NotNull QuestionType type,
        @NotNull Boolean required,
        @NotNull Integer displayOrder,
        Double scoringWeight,
        List<@NotBlank @Size(max = 255) String> options
) {
}

