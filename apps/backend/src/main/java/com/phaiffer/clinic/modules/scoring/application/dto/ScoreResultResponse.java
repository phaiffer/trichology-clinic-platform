package com.phaiffer.clinic.modules.scoring.application.dto;

import java.time.Instant;
import java.util.UUID;

public record ScoreResultResponse(
        UUID id,
        UUID patientId,
        String scoreType,
        Double scoreValue,
        String classification,
        String interpretation,
        Instant calculatedAt
) {
}
