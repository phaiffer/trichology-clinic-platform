package com.phaiffer.clinic.modules.report.infrastructure.persistence;

import com.phaiffer.clinic.modules.report.domain.model.Report;
import com.phaiffer.clinic.modules.report.domain.repository.ReportRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ReportRepositoryAdapter implements ReportRepository {

    private final ReportJpaRepository reportJpaRepository;

    public ReportRepositoryAdapter(ReportJpaRepository reportJpaRepository) {
        this.reportJpaRepository = reportJpaRepository;
    }

    @Override
    public Report save(Report report) {
        return reportJpaRepository.save(report);
    }

    @Override
    public List<Report> findByPatientId(UUID patientId) {
        return reportJpaRepository.findAllByPatientIdOrderByGeneratedAtDescCreatedAtDesc(patientId);
    }

    @Override
    public Optional<Report> findByIdAndPatientId(UUID reportId, UUID patientId) {
        return reportJpaRepository.findByIdAndPatientId(reportId, patientId);
    }

    @Override
    public void delete(Report report) {
        reportJpaRepository.delete(report);
    }
}
