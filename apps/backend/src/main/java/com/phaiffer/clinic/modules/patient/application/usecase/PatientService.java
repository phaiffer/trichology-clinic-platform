package com.phaiffer.clinic.modules.patient.application.usecase;

import com.phaiffer.clinic.modules.patient.application.dto.PatientMapper;
import com.phaiffer.clinic.modules.patient.application.dto.PatientPageResponse;
import com.phaiffer.clinic.modules.patient.application.dto.PatientRequest;
import com.phaiffer.clinic.modules.patient.application.dto.PatientResponse;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.shared.exception.ResourceConflictException;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import com.phaiffer.clinic.shared.pagination.PageResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public PatientPageResponse listPatients(String search, int page, int size) {
        String normalizedSearch = normalizeSearch(search);
        PageResult<Patient> patientPage = patientRepository.findAll(normalizedSearch, page, size);

        return new PatientPageResponse(
                patientPage.content().stream().map(PatientMapper::toResponse).toList(),
                patientPage.page(),
                patientPage.size(),
                patientPage.totalElements(),
                patientPage.totalPages(),
                patientPage.hasNext(),
                patientPage.hasPrevious(),
                normalizedSearch
        );
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatient(UUID id) {
        return PatientMapper.toResponse(findPatient(id));
    }

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        ensureEmailAvailable(request.email(), null);
        Patient patient = new Patient();
        apply(patient, request);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponse updatePatient(UUID id, PatientRequest request) {
        Patient patient = findPatient(id);
        ensureEmailAvailable(request.email(), patient.getId());
        apply(patient, request);
        return PatientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional
    public void deletePatient(UUID id) {
        patientRepository.delete(findPatient(id));
    }

    private Patient findPatient(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));
    }

    private void apply(Patient patient, PatientRequest request) {
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setEmail(normalizeEmail(request.email()));
        patient.setPhone(request.phone());
        patient.setBirthDate(request.birthDate());
        patient.setGender(request.gender());
        patient.setNotes(request.notes());
        patient.setConsentAccepted(request.consentAccepted());
        patient.setActive(request.active() == null || request.active());
    }

    private void ensureEmailAvailable(String rawEmail, UUID currentPatientId) {
        String normalizedEmail = normalizeEmail(rawEmail);

        patientRepository.findByEmail(normalizedEmail).ifPresent(existingPatient -> {
            if (currentPatientId == null || !existingPatient.getId().equals(currentPatientId)) {
                throw new ResourceConflictException("Patient email is already registered: " + normalizedEmail);
            }
        });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeSearch(String search) {
        if (search == null) {
            return null;
        }

        String normalized = search.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
