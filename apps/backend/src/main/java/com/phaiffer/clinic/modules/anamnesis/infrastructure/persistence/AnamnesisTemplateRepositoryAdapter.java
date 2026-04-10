package com.phaiffer.clinic.modules.anamnesis.infrastructure.persistence;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisTemplateRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class AnamnesisTemplateRepositoryAdapter implements AnamnesisTemplateRepository {

    private final AnamnesisTemplateJpaRepository templateJpaRepository;

    public AnamnesisTemplateRepositoryAdapter(AnamnesisTemplateJpaRepository templateJpaRepository) {
        this.templateJpaRepository = templateJpaRepository;
    }

    @Override
    public List<AnamnesisTemplate> findAll() {
        return templateJpaRepository.findAll();
    }

    @Override
    public Optional<AnamnesisTemplate> findById(UUID id) {
        return templateJpaRepository.findById(id);
    }

    @Override
    public AnamnesisTemplate save(AnamnesisTemplate template) {
        return templateJpaRepository.save(template);
    }
}
