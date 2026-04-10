package com.phaiffer.clinic.modules.media.infrastructure.persistence;

import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;
import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientPhotoJpaRepository extends JpaRepository<PatientPhoto, UUID> {

    @EntityGraph(attributePaths = {
            "patient",
            "anamnesisRecord",
            "anamnesisRecord.template"
    })
    List<PatientPhoto> findAllByPatientIdOrderByCaptureDateDescCreatedAtDesc(UUID patientId);

    @EntityGraph(attributePaths = {
            "patient",
            "anamnesisRecord",
            "anamnesisRecord.template"
    })
    List<PatientPhoto> findAllByPatientIdAndCategoryOrderByCaptureDateDescCreatedAtDesc(UUID patientId, PhotoCategory category);

    @EntityGraph(attributePaths = {
            "patient",
            "anamnesisRecord",
            "anamnesisRecord.template"
    })
    Optional<PatientPhoto> findByIdAndPatientId(UUID id, UUID patientId);

    @EntityGraph(attributePaths = {
            "patient",
            "anamnesisRecord",
            "anamnesisRecord.template"
    })
    List<PatientPhoto> findAllByPatientIdAndIdIn(UUID patientId, Collection<UUID> ids);
}
