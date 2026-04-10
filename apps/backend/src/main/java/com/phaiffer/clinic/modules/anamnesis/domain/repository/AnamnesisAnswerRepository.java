package com.phaiffer.clinic.modules.anamnesis.domain.repository;

import java.util.UUID;

public interface AnamnesisAnswerRepository {

    boolean existsByQuestionId(UUID questionId);
}
