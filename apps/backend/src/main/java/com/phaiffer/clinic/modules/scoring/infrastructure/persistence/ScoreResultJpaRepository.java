package com.phaiffer.clinic.modules.scoring.infrastructure.persistence;

import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreResultJpaRepository extends JpaRepository<ScoreResult, UUID> {

    @EntityGraph(attributePaths = {"patient"})
    List<ScoreResult> findAllByPatientIdOrderByCalculatedAtDesc(UUID patientId);

    @EntityGraph(attributePaths = {"patient"})
    Optional<ScoreResult> findByIdAndPatientId(UUID id, UUID patientId);
}
