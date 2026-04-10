package com.phaiffer.clinic.modules.scoring.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.util.UUID;

@Embeddable
public class ScoreResultItem {

    @Column(name = "question_id")
    private UUID questionId;

    @Column(name = "question_label", nullable = false, length = 500)
    private String questionLabel;

    @Column(name = "question_type", nullable = false, length = 50)
    private String questionType;

    @Column(name = "answer_value", length = 1000)
    private String answerValue;

    @Column(name = "contribution", nullable = false)
    private Double contribution;

    @Column(name = "rule_applied", nullable = false, length = 1000)
    private String ruleApplied;

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }

    public String getQuestionLabel() {
        return questionLabel;
    }

    public void setQuestionLabel(String questionLabel) {
        this.questionLabel = questionLabel;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getAnswerValue() {
        return answerValue;
    }

    public void setAnswerValue(String answerValue) {
        this.answerValue = answerValue;
    }

    public Double getContribution() {
        return contribution;
    }

    public void setContribution(Double contribution) {
        this.contribution = contribution;
    }

    public String getRuleApplied() {
        return ruleApplied;
    }

    public void setRuleApplied(String ruleApplied) {
        this.ruleApplied = ruleApplied;
    }
}
