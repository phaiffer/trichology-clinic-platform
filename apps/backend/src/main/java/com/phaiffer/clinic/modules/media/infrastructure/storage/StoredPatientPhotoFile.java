package com.phaiffer.clinic.modules.media.infrastructure.storage;

public record StoredPatientPhotoFile(
        String fileName,
        String storagePath
) {
}
