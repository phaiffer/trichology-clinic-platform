package com.phaiffer.clinic.modules.scoring.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ScoreResultResponse(
        UUID id,
        UUID patientId,
        String patientName,
        UUID anamnesisRecordId,
        String anamnesisTemplateName,
        Double totalScore,
        String classification,
        String summary,
        Instant calculatedAt,
        List<ScoreResultItemResponse> items
) {
}
