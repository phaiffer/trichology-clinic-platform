package com.phaiffer.clinic.modules.scoring.application.dto;

import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;

public final class ScoreResultMapper {

    private ScoreResultMapper() {
    }

    public static ScoreResultResponse toResponse(ScoreResult scoreResult) {
        return new ScoreResultResponse(
                scoreResult.getId(),
                scoreResult.getPatient().getId(),
                scoreResult.getScoreType(),
                scoreResult.getScoreValue(),
                scoreResult.getClassification(),
                scoreResult.getInterpretation(),
                scoreResult.getCalculatedAt()
        );
    }
}
