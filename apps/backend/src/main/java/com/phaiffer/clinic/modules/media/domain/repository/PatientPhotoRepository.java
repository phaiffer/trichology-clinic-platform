package com.phaiffer.clinic.modules.media.domain.repository;

import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;
import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientPhotoRepository {

    List<PatientPhoto> findByPatientId(UUID patientId, PhotoCategory category);

    Optional<PatientPhoto> findByIdAndPatientId(UUID photoId, UUID patientId);

    List<PatientPhoto> findAllByPatientIdAndIds(UUID patientId, Collection<UUID> photoIds);

    PatientPhoto save(PatientPhoto patientPhoto);

    void delete(PatientPhoto patientPhoto);
}
