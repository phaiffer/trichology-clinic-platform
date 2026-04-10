package com.phaiffer.clinic.modules.scoring.domain.model;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "score_results")
public class ScoreResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anamnesis_record_id")
    private AnamnesisRecord anamnesisRecord;

    @Column
    private Double totalScore;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private ScoreClassification classification;

    @Column(length = 1000)
    private String summary;

    @Column(length = 80)
    private String scoreType;

    @Column
    private Double scoreValue;

    @Column(length = 1000)
    private String interpretation;

    @Column(nullable = false)
    private Instant calculatedAt = Instant.now();

    @ElementCollection
    @CollectionTable(name = "score_result_items", joinColumns = @JoinColumn(name = "score_result_id"))
    @OrderColumn(name = "item_order")
    private List<ScoreResultItem> items = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public AnamnesisRecord getAnamnesisRecord() {
        return anamnesisRecord;
    }

    public void setAnamnesisRecord(AnamnesisRecord anamnesisRecord) {
        this.anamnesisRecord = anamnesisRecord;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public ScoreClassification getClassification() {
        return classification;
    }

    public void setClassification(ScoreClassification classification) {
        this.classification = classification;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public String getScoreType() {
        return scoreType;
    }

    public void setScoreType(String scoreType) {
        this.scoreType = scoreType;
    }

    public Double getScoreValue() {
        return scoreValue;
    }

    public void setScoreValue(Double scoreValue) {
        this.scoreValue = scoreValue;
    }

    public String getInterpretation() {
        return interpretation;
    }

    public void setInterpretation(String interpretation) {
        this.interpretation = interpretation;
    }

    public List<ScoreResultItem> getItems() {
        return items;
    }

    public void setItems(List<ScoreResultItem> items) {
        this.items = items;
    }

    public Double resolveTotalScore() {
        return totalScore != null ? totalScore : scoreValue;
    }

    public String resolveClassification() {
        return classification != null ? classification.name() : null;
    }

    public String resolveSummary() {
        return summary != null ? summary : interpretation;
    }

    public String resolveLabel() {
        if (anamnesisRecord != null) {
            return anamnesisRecord.getTemplate().getName() + " score";
        }
        return scoreType;
    }
}
