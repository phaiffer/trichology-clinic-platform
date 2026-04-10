package com.phaiffer.clinic.modules.anamnesis.domain.model;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "clinical_evaluations")
public class ClinicalEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(length = 4000)
    private String summary;

    @Column(length = 4000)
    private String diagnosisHypothesis;

    @Column(nullable = false)
    private Instant evaluatedAt = Instant.now();
}
