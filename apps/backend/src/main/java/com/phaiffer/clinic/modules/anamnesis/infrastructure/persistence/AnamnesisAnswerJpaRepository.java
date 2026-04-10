package com.phaiffer.clinic.modules.anamnesis.infrastructure.persistence;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnamnesisAnswerJpaRepository extends JpaRepository<AnamnesisAnswer, UUID> {

    boolean existsByQuestionId(UUID questionId);
}
