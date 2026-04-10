package com.phaiffer.clinic.modules.anamnesis.domain.model;

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

    @Column(name = "question_label_snapshot", nullable = false, length = 500)
    private String questionLabelSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type_snapshot", nullable = false, length = 50)
    private QuestionType questionTypeSnapshot;

    @Column(name = "question_display_order_snapshot", nullable = false)
    private Integer questionDisplayOrderSnapshot;

    @Column(name = "question_scoring_weight_snapshot")
    private Double questionScoringWeightSnapshot;

    @Column(name = "question_option_scores_snapshot", length = 4000)
    private String questionOptionScoresSnapshot;

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

    public String getQuestionLabelSnapshot() {
        return questionLabelSnapshot;
    }

    public void setQuestionLabelSnapshot(String questionLabelSnapshot) {
        this.questionLabelSnapshot = questionLabelSnapshot;
    }

    public QuestionType getQuestionTypeSnapshot() {
        return questionTypeSnapshot;
    }

    public void setQuestionTypeSnapshot(QuestionType questionTypeSnapshot) {
        this.questionTypeSnapshot = questionTypeSnapshot;
    }

    public Integer getQuestionDisplayOrderSnapshot() {
        return questionDisplayOrderSnapshot;
    }

    public void setQuestionDisplayOrderSnapshot(Integer questionDisplayOrderSnapshot) {
        this.questionDisplayOrderSnapshot = questionDisplayOrderSnapshot;
    }

    public Double getQuestionScoringWeightSnapshot() {
        return questionScoringWeightSnapshot;
    }

    public void setQuestionScoringWeightSnapshot(Double questionScoringWeightSnapshot) {
        this.questionScoringWeightSnapshot = questionScoringWeightSnapshot;
    }

    public String getQuestionOptionScoresSnapshot() {
        return questionOptionScoresSnapshot;
    }

    public void setQuestionOptionScoresSnapshot(String questionOptionScoresSnapshot) {
        this.questionOptionScoresSnapshot = questionOptionScoresSnapshot;
    }

    public String getAnswerValue() {
        return answerValue;
    }

    public void setAnswerValue(String answerValue) {
        this.answerValue = answerValue;
    }

    public String resolveQuestionLabel() {
        if (questionLabelSnapshot != null && !questionLabelSnapshot.isBlank()) {
            return questionLabelSnapshot;
        }

        return question != null ? question.getLabel() : null;
    }

    public QuestionType resolveQuestionType() {
        return questionTypeSnapshot != null ? questionTypeSnapshot : question != null ? question.getType() : null;
    }

    public Integer resolveQuestionDisplayOrder() {
        return questionDisplayOrderSnapshot != null
                ? questionDisplayOrderSnapshot
                : question != null ? question.getDisplayOrder() : null;
    }

    public Double resolveQuestionScoringWeight() {
        return questionScoringWeightSnapshot != null
                ? questionScoringWeightSnapshot
                : question != null ? question.getScoringWeight() : null;
    }
}
