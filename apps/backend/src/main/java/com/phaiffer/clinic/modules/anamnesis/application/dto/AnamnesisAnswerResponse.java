package com.phaiffer.clinic.modules.anamnesis.application.dto;

import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;

import java.util.UUID;

public record AnamnesisAnswerResponse(
        UUID id,
        UUID questionId,
        String questionLabel,
        QuestionType questionType,
        Object value
) {
}

