package com.phaiffer.clinic.modules.scoring.application.dto;

import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResultItem;

public final class ScoreResultMapper {

    private ScoreResultMapper() {
    }

    public static ScoreResultResponse toResponse(ScoreResult scoreResult) {
        return new ScoreResultResponse(
                scoreResult.getId(),
                scoreResult.getPatient().getId(),
                scoreResult.getPatient().getFirstName() + " " + scoreResult.getPatient().getLastName(),
                scoreResult.getAnamnesisRecord() != null ? scoreResult.getAnamnesisRecord().getId() : null,
                scoreResult.getAnamnesisRecord() != null
                        ? scoreResult.getAnamnesisRecord().resolveTemplateName()
                        : scoreResult.getScoreType(),
                scoreResult.resolveTotalScore(),
                scoreResult.resolveClassification(),
                scoreResult.resolveSummary(),
                scoreResult.getCalculatedAt(),
                scoreResult.getItems().stream().map(ScoreResultMapper::toItemResponse).toList()
        );
    }

    private static ScoreResultItemResponse toItemResponse(ScoreResultItem item) {
        return new ScoreResultItemResponse(
                item.getQuestionId(),
                item.getQuestionLabel(),
                item.getQuestionType(),
                item.getAnswerValue(),
                item.getContribution(),
                item.getRuleApplied()
        );
    }
}
