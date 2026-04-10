package com.phaiffer.clinic.modules.anamnesis.domain.repository;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnamnesisTemplateRepository {

    List<AnamnesisTemplate> findAll();

    Optional<AnamnesisTemplate> findById(UUID id);

    AnamnesisTemplate save(AnamnesisTemplate template);
}
