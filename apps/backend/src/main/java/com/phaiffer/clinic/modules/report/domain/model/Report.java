package com.phaiffer.clinic.modules.report.domain.model;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anamnesis_record_id")
    private AnamnesisRecord anamnesisRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "score_result_id")
    private ScoreResult scoreResult;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 3000)
    private String summary;

    @Column(nullable = false)
    private Instant generatedAt;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 500)
    private String storagePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ReportType reportType;

    @ElementCollection
    @CollectionTable(name = "report_selected_photo_ids", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "photo_id", nullable = false)
    @OrderColumn(name = "display_order")
    private List<UUID> selectedPhotoIds = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

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

    public ScoreResult getScoreResult() {
        return scoreResult;
    }

    public void setScoreResult(ScoreResult scoreResult) {
        this.scoreResult = scoreResult;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public List<UUID> getSelectedPhotoIds() {
        return selectedPhotoIds;
    }

    public void setSelectedPhotoIds(List<UUID> selectedPhotoIds) {
        this.selectedPhotoIds = selectedPhotoIds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
