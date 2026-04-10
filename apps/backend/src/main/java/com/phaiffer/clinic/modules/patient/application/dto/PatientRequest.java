package com.phaiffer.clinic.modules.patient.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientRequest(
        @NotBlank @Size(max = 120) String firstName,
        @NotBlank @Size(max = 120) String lastName,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 30) String phone,
        @Past LocalDate birthDate,
        @Size(max = 30) String gender,
        @Size(max = 1000) String notes,
        @NotNull Boolean consentAccepted,
        Boolean active
) {
}

