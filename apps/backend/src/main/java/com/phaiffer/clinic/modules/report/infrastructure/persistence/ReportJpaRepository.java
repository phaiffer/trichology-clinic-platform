package com.phaiffer.clinic.modules.report.infrastructure.persistence;

import com.phaiffer.clinic.modules.report.domain.model.Report;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReportJpaRepository extends JpaRepository<Report, UUID> {

    @EntityGraph(attributePaths = {
            "patient",
            "anamnesisRecord",
            "anamnesisRecord.template",
            "scoreResult",
            "selectedPhotoIds"
    })
    List<Report> findAllByPatientIdOrderByGeneratedAtDescCreatedAtDesc(UUID patientId);

    @EntityGraph(attributePaths = {
            "patient",
            "anamnesisRecord",
            "anamnesisRecord.template",
            "scoreResult",
            "selectedPhotoIds"
    })
    Optional<Report> findByIdAndPatientId(UUID id, UUID patientId);
}
