package com.phaiffer.clinic.modules.scoring.domain.repository;

import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreResultRepository {

    List<ScoreResult> findByPatientId(UUID patientId);

    Optional<ScoreResult> findByIdAndPatientId(UUID scoreResultId, UUID patientId);
}
