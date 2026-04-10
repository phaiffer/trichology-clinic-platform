package com.phaiffer.clinic.modules.anamnesis.infrastructure.persistence;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisRecordRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class AnamnesisRecordRepositoryAdapter implements AnamnesisRecordRepository {

    private final AnamnesisRecordJpaRepository recordJpaRepository;

    public AnamnesisRecordRepositoryAdapter(AnamnesisRecordJpaRepository recordJpaRepository) {
        this.recordJpaRepository = recordJpaRepository;
    }

    @Override
    public List<AnamnesisRecord> findByPatientId(UUID patientId) {
        return recordJpaRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Override
    public Optional<AnamnesisRecord> findByIdAndPatientId(UUID recordId, UUID patientId) {
        return recordJpaRepository.findByIdAndPatientId(recordId, patientId);
    }

    @Override
    public AnamnesisRecord save(AnamnesisRecord record) {
        return recordJpaRepository.save(record);
    }
}

