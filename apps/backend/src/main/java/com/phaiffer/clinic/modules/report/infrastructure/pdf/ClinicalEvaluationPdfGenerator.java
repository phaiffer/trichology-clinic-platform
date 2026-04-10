package com.phaiffer.clinic.modules.report.infrastructure.pdf;

public interface ClinicalEvaluationPdfGenerator {

    byte[] generate(ClinicalEvaluationPdfData data);
}
