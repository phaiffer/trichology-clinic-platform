package com.phaiffer.clinic.modules.media.infrastructure.persistence;

import com.phaiffer.clinic.modules.media.domain.model.PatientPhoto;
import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;
import com.phaiffer.clinic.modules.media.domain.repository.PatientPhotoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PatientPhotoRepositoryAdapter implements PatientPhotoRepository {

    private final PatientPhotoJpaRepository patientPhotoJpaRepository;

    public PatientPhotoRepositoryAdapter(PatientPhotoJpaRepository patientPhotoJpaRepository) {
        this.patientPhotoJpaRepository = patientPhotoJpaRepository;
    }

    @Override
    public List<PatientPhoto> findByPatientId(UUID patientId, PhotoCategory category) {
        if (category == null) {
            return patientPhotoJpaRepository.findAllByPatientIdOrderByCaptureDateDescCreatedAtDesc(patientId);
        }

        return patientPhotoJpaRepository.findAllByPatientIdAndCategoryOrderByCaptureDateDescCreatedAtDesc(patientId, category);
    }

    @Override
    public Optional<PatientPhoto> findByIdAndPatientId(UUID photoId, UUID patientId) {
        return patientPhotoJpaRepository.findByIdAndPatientId(photoId, patientId);
    }

    @Override
    public List<PatientPhoto> findAllByPatientIdAndIds(UUID patientId, Collection<UUID> photoIds) {
        if (photoIds == null || photoIds.isEmpty()) {
            return List.of();
        }

        return patientPhotoJpaRepository.findAllByPatientIdAndIdIn(patientId, photoIds);
    }

    @Override
    public PatientPhoto save(PatientPhoto patientPhoto) {
        return patientPhotoJpaRepository.save(patientPhoto);
    }

    @Override
    public void delete(PatientPhoto patientPhoto) {
        patientPhotoJpaRepository.delete(patientPhoto);
    }
}
