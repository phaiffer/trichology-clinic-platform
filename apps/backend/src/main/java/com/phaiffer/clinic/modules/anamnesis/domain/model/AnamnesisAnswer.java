package com.phaiffer.clinic.modules.anamnesis.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "anamnesis_answers")
public class AnamnesisAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private AnamnesisRecord record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private AnamnesisQuestion question;

    @Column(nullable = false, length = 4000)
    private String answerValue;

    public UUID getId() {
        return id;
    }

    public AnamnesisRecord getRecord() {
        return record;
    }

    public void setRecord(AnamnesisRecord record) {
        this.record = record;
    }

    public AnamnesisQuestion getQuestion() {
        return question;
    }

    public void setQuestion(AnamnesisQuestion question) {
        this.question = question;
    }

    public String getAnswerValue() {
        return answerValue;
    }

    public void setAnswerValue(String answerValue) {
        this.answerValue = answerValue;
    }
}
