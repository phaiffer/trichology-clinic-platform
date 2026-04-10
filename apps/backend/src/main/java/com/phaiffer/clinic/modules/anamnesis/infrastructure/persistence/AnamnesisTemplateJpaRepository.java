package com.phaiffer.clinic.modules.anamnesis.infrastructure.persistence;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnamnesisTemplateJpaRepository extends JpaRepository<AnamnesisTemplate, UUID> {

    @Override
    @EntityGraph(attributePaths = {"questions", "questions.options"})
    List<AnamnesisTemplate> findAll();

    @Override
    @EntityGraph(attributePaths = {"questions", "questions.options"})
    Optional<AnamnesisTemplate> findById(UUID id);
}

