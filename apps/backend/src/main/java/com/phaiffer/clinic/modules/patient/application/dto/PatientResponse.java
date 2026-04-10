package com.phaiffer.clinic.modules.patient.application.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        LocalDate birthDate,
        String gender,
        String notes,
        boolean consentAccepted,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}

