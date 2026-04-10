package com.phaiffer.clinic.modules.report.infrastructure.pdf;

import com.phaiffer.clinic.modules.report.domain.model.ReportType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ClinicalEvaluationPdfData(
        String clinicTitle,
        ReportType reportType,
        String reportTitle,
        Instant generatedAt,
        UUID patientId,
        String patientName,
        String patientEmail,
        String patientPhone,
        LocalDate patientBirthDate,
        String patientGender,
        String patientNotes,
        String clinicianSummary,
        String anamnesisTemplateName,
        Instant anamnesisCreatedAt,
        List<ClinicalEvaluationPdfAnswerData> anamnesisAnswers,
        String scoreType,
        Double scoreValue,
        String scoreClassification,
        String scoreInterpretation,
        Instant scoreCalculatedAt,
        List<ClinicalEvaluationPdfPhotoData> photos
) {
}
