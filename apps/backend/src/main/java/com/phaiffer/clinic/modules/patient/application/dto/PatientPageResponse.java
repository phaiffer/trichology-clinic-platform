package com.phaiffer.clinic.modules.patient.application.dto;

import java.util.List;

public record PatientPageResponse(
        List<PatientResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious,
        String search
) {
}

