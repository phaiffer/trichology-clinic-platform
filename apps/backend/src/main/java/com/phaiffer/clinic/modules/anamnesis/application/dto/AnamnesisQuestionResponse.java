package com.phaiffer.clinic.modules.anamnesis.application.dto;

import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;

import java.util.List;
import java.util.UUID;

public record AnamnesisQuestionResponse(
        UUID id,
        String label,
        String helperText,
        QuestionType type,
        boolean required,
        int displayOrder,
        Double scoringWeight,
        List<String> options
) {
}

