package com.phaiffer.clinic.modules.patient.domain.repository;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.shared.pagination.PageResult;

import java.util.Optional;
import java.util.UUID;

public interface PatientRepository {

    PageResult<Patient> findAll(String search, int page, int size);

    Optional<Patient> findById(UUID id);

    Optional<Patient> findByEmail(String email);

    Patient save(Patient patient);

    void delete(Patient patient);
}
