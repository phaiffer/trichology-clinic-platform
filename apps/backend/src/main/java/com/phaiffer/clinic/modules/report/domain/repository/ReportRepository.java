package com.phaiffer.clinic.modules.report.domain.repository;

import com.phaiffer.clinic.modules.report.domain.model.Report;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReportRepository {

    Report save(Report report);

    List<Report> findByPatientId(UUID patientId);

    Optional<Report> findByIdAndPatientId(UUID reportId, UUID patientId);

    void delete(Report report);
}
