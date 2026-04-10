package com.phaiffer.clinic.modules.scoring.infrastructure.persistence;

import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import com.phaiffer.clinic.modules.scoring.domain.repository.ScoreResultRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ScoreResultRepositoryAdapter implements ScoreResultRepository {

    private final ScoreResultJpaRepository scoreResultJpaRepository;

    public ScoreResultRepositoryAdapter(ScoreResultJpaRepository scoreResultJpaRepository) {
        this.scoreResultJpaRepository = scoreResultJpaRepository;
    }

    @Override
    public ScoreResult save(ScoreResult scoreResult) {
        return scoreResultJpaRepository.save(scoreResult);
    }

    @Override
    public List<ScoreResult> findByPatientId(UUID patientId) {
        return scoreResultJpaRepository.findAllByPatientIdOrderByCalculatedAtDesc(patientId);
    }

    @Override
    public Optional<ScoreResult> findByIdAndPatientId(UUID scoreResultId, UUID patientId) {
        return scoreResultJpaRepository.findByIdAndPatientId(scoreResultId, patientId);
    }
}
