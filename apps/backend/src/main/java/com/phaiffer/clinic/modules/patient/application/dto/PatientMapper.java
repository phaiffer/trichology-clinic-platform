package com.phaiffer.clinic.modules.patient.application.dto;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;

public final class PatientMapper {

    private PatientMapper() {
    }

    public static PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getBirthDate(),
                patient.getGender(),
                patient.getNotes(),
                patient.isConsentAccepted(),
                patient.isActive(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }
}

