package com.phaiffer.clinic.modules.patient.infrastructure.persistence;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.shared.pagination.PageResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class PatientRepositoryAdapter implements PatientRepository {

    private final PatientJpaRepository patientJpaRepository;

    public PatientRepositoryAdapter(PatientJpaRepository patientJpaRepository) {
        this.patientJpaRepository = patientJpaRepository;
    }

    @Override
    public PageResult<Patient> findAll(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Patient> patientPage = search == null
                ? patientJpaRepository.findAll(pageRequest)
                : patientJpaRepository.search(search, pageRequest);

        return new PageResult<>(
                patientPage.getContent(),
                patientPage.getNumber(),
                patientPage.getSize(),
                patientPage.getTotalElements(),
                patientPage.getTotalPages(),
                patientPage.hasNext(),
                patientPage.hasPrevious()
        );
    }

    @Override
    public Optional<Patient> findById(UUID id) {
        return patientJpaRepository.findById(id);
    }

    @Override
    public Optional<Patient> findByEmail(String email) {
        return patientJpaRepository.findByEmail(email);
    }

    @Override
    public Patient save(Patient patient) {
        return patientJpaRepository.save(patient);
    }

    @Override
    public void delete(Patient patient) {
        patientJpaRepository.delete(patient);
    }
}
