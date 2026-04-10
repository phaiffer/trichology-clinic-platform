package com.phaiffer.clinic.modules.anamnesis.domain.model;

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
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "anamnesis_questions")
public class AnamnesisQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AnamnesisTemplate template;

    @Column(nullable = false, length = 500)
    private String label;

    @Column(length = 1000)
    private String helperText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private QuestionType type;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private boolean required;

    private Double scoringWeight;

    @ElementCollection
    @CollectionTable(name = "anamnesis_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @OrderColumn(name = "option_order")
    @Column(name = "option_value", nullable = false, length = 255)
    private List<String> options = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "anamnesis_question_option_scores", joinColumns = @JoinColumn(name = "question_id"))
    @MapKeyColumn(name = "option_value", length = 255)
    @Column(name = "score_value", nullable = false)
    private Map<String, Double> optionScores = new LinkedHashMap<>();

    public UUID getId() {
        return id;
    }

    public AnamnesisTemplate getTemplate() {
        return template;
    }

    public void setTemplate(AnamnesisTemplate template) {
        this.template = template;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getHelperText() {
        return helperText;
    }

    public void setHelperText(String helperText) {
        this.helperText = helperText;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public Double getScoringWeight() {
        return scoringWeight;
    }

    public void setScoringWeight(Double scoringWeight) {
        this.scoringWeight = scoringWeight;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Map<String, Double> getOptionScores() {
        return optionScores;
    }

    public void setOptionScores(Map<String, Double> optionScores) {
        this.optionScores = optionScores;
    }
}
