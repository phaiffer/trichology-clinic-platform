package com.phaiffer.clinic.modules.media.domain.model;

import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_photos")
public class PatientPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anamnesis_record_id")
    private AnamnesisRecord anamnesisRecord;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 255)
    private String originalFileName;

    @Column(nullable = false, length = 100)
    private String contentType;

    @Column(nullable = false)
    private long fileSize;

    @Column(nullable = false, length = 500)
    private String storagePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PhotoCategory category;

    private LocalDate captureDate;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public PhotoCategory getCategory() {
        return category;
    }

    public void setCategory(PhotoCategory category) {
        this.category = category;
    }

    public LocalDate getCaptureDate() {
        return captureDate;
    }

    public void setCaptureDate(LocalDate captureDate) {
        this.captureDate = captureDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
