package com.phaiffer.clinic.modules.scoring.application.dto;

import java.util.UUID;

public record ScoreResultItemResponse(
        UUID questionId,
        String questionLabel,
        String questionType,
        String answerValue,
        Double contribution,
        String ruleApplied
) {
}
