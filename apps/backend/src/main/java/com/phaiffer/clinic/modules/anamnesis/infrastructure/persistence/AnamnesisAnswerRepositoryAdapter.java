package com.phaiffer.clinic.modules.anamnesis.infrastructure.persistence;

import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisAnswerRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class AnamnesisAnswerRepositoryAdapter implements AnamnesisAnswerRepository {

    private final AnamnesisAnswerJpaRepository answerJpaRepository;

    public AnamnesisAnswerRepositoryAdapter(AnamnesisAnswerJpaRepository answerJpaRepository) {
        this.answerJpaRepository = answerJpaRepository;
    }

    @Override
    public boolean existsByQuestionId(UUID questionId) {
        return answerJpaRepository.existsByQuestionId(questionId);
    }
}
