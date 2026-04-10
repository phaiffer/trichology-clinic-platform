package com.phaiffer.clinic.modules.anamnesis.domain.model;

import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "anamnesis_records")
public class AnamnesisRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AnamnesisTemplate template;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<AnamnesisAnswer> answers = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    public void addAnswer(AnamnesisAnswer answer) {
        answer.setRecord(this);
        answers.add(answer);
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

    public AnamnesisTemplate getTemplate() {
        return template;
    }

    public void setTemplate(AnamnesisTemplate template) {
        this.template = template;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<AnamnesisAnswer> getAnswers() {
        return answers;
    }
}

