package com.phaiffer.clinic.modules.media.application.dto;

import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;

public final class PatientPhotoMapper {

    private PatientPhotoMapper() {
    }

    public static PatientPhotoResponse toResponse(PatientPhoto patientPhoto) {
        return new PatientPhotoResponse(
                patientPhoto.getId(),
                patientPhoto.getPatient().getId(),
                patientPhoto.getAnamnesisRecord() != null ? patientPhoto.getAnamnesisRecord().getId() : null,
                patientPhoto.getAnamnesisRecord() != null ? patientPhoto.getAnamnesisRecord().getTemplate().getName() : null,
                patientPhoto.getFileName(),
                patientPhoto.getOriginalFileName(),
                patientPhoto.getContentType(),
                patientPhoto.getFileSize(),
                patientPhoto.getCategory(),
                patientPhoto.getCaptureDate(),
                patientPhoto.getNotes(),
                patientPhoto.getCreatedAt(),
                "/api/patients/" + patientPhoto.getPatient().getId() + "/photos/" + patientPhoto.getId() + "/file"
        );
    }
}
