package com.phaiffer.clinic.modules.anamnesis.domain.repository;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnamnesisRecordRepository {

    List<AnamnesisRecord> findByPatientId(UUID patientId);

    Optional<AnamnesisRecord> findByIdAndPatientId(UUID recordId, UUID patientId);

    AnamnesisRecord save(AnamnesisRecord record);
}

