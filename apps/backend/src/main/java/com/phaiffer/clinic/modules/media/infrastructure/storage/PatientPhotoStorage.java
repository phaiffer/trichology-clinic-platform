package com.phaiffer.clinic.modules.media.infrastructure.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface PatientPhotoStorage {

    StoredPatientPhotoFile store(UUID patientId, MultipartFile file);

    Resource loadAsResource(String storagePath);

    void delete(String storagePath);
}
