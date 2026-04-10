package com.phaiffer.clinic.modules.anamnesis.infrastructure.persistence;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnamnesisRecordJpaRepository extends JpaRepository<AnamnesisRecord, UUID> {

    @EntityGraph(attributePaths = {
            "patient",
            "template",
            "answers",
            "answers.question"
    })
    List<AnamnesisRecord> findAllByPatientIdOrderByCreatedAtDesc(UUID patientId);

    @EntityGraph(attributePaths = {
            "patient",
            "template",
            "answers",
            "answers.question"
    })
    Optional<AnamnesisRecord> findByIdAndPatientId(UUID id, UUID patientId);
}

