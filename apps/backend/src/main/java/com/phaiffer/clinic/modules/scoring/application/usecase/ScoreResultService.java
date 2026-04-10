package com.phaiffer.clinic.modules.scoring.application.usecase;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisAnswer;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisQuestion;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisRecordRepository;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.modules.scoring.application.dto.ScoreResultMapper;
import com.phaiffer.clinic.modules.scoring.application.dto.ScoreResultResponse;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreClassification;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResultItem;
import com.phaiffer.clinic.modules.scoring.domain.repository.ScoreResultRepository;
import com.phaiffer.clinic.shared.config.scoring.ScoringProperties;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class ScoreResultService {

    private final PatientRepository patientRepository;
    private final AnamnesisRecordRepository anamnesisRecordRepository;
    private final ScoreResultRepository scoreResultRepository;
    private final ScoringProperties scoringProperties;
    private final ObjectMapper objectMapper;

    public ScoreResultService(
            PatientRepository patientRepository,
            AnamnesisRecordRepository anamnesisRecordRepository,
            ScoreResultRepository scoreResultRepository,
            ScoringProperties scoringProperties,
            ObjectMapper objectMapper
    ) {
        this.patientRepository = patientRepository;
        this.anamnesisRecordRepository = anamnesisRecordRepository;
        this.scoreResultRepository = scoreResultRepository;
        this.scoringProperties = scoringProperties;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ScoreResultResponse calculateFromAnamnesisRecord(UUID patientId, UUID recordId) {
        Patient patient = findPatient(patientId);
        AnamnesisRecord record = findPatientRecord(patientId, recordId);

        CalculationResult calculation = calculate(record);

        ScoreResult scoreResult = new ScoreResult();
        scoreResult.setPatient(patient);
        scoreResult.setAnamnesisRecord(record);
        scoreResult.setTotalScore(calculation.totalScore());
        scoreResult.setClassification(classificationFor(calculation.totalScore()));
        scoreResult.setSummary(buildSummary(record, calculation));
        scoreResult.setScoreType(getReportLabel(scoreResult));
        scoreResult.setScoreValue(calculation.totalScore());
        scoreResult.setInterpretation(scoreResult.getSummary());
        scoreResult.setItems(calculation.items());

        return ScoreResultMapper.toResponse(scoreResultRepository.save(scoreResult));
    }

    @Transactional(readOnly = true)
    public List<ScoreResultResponse> listByPatient(UUID patientId) {
        ensurePatientExists(patientId);
        return scoreResultRepository.findByPatientId(patientId).stream()
                .map(ScoreResultMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ScoreResultResponse getByPatient(UUID patientId, UUID scoreResultId) {
        ensurePatientExists(patientId);
        ScoreResult scoreResult = scoreResultRepository.findByIdAndPatientId(scoreResultId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Score result not found: " + scoreResultId));

        return ScoreResultMapper.toResponse(scoreResult);
    }

    public String getReportLabel(ScoreResult scoreResult) {
        return scoreResult.resolveLabel();
    }

    private CalculationResult calculate(AnamnesisRecord record) {
        List<ScoreResultItem> items = new ArrayList<>();
        double totalScore = 0.0;

        for (AnamnesisAnswer answer : record.getAnswers().stream()
                .sorted(Comparator.comparingInt(item -> item.resolveQuestionDisplayOrder()))
                .toList()) {
            ScoreResultItem item = calculateItem(answer);
            if (item == null) {
                continue;
            }

            items.add(item);
            totalScore += item.getContribution();
        }

        if (items.isEmpty()) {
            throw new IllegalArgumentException(
                    "This anamnesis record cannot be scored because no supported scoring configuration was found"
            );
        }

        return new CalculationResult(round(totalScore), items);
    }

    private ScoreResultItem calculateItem(AnamnesisAnswer answer) {
        Object value = deserializeAnswer(answer.getAnswerValue());
        AnamnesisQuestion question = answer.getQuestion();
        QuestionType questionType = answer.resolveQuestionType();

        return switch (questionType) {
            case BOOLEAN -> buildBooleanItem(answer, value);
            case SINGLE_CHOICE -> buildSingleChoiceItem(answer, value);
            case MULTIPLE_CHOICE -> buildMultipleChoiceItem(answer, value);
            case NUMBER -> buildNumberItem(answer, value);
            case TEXT, TEXTAREA, DATE -> null;
        };
    }

    private ScoreResultItem buildBooleanItem(AnamnesisAnswer answer, Object value) {
        Double scoringWeight = answer.resolveQuestionScoringWeight();
        if (!(value instanceof Boolean booleanValue) || scoringWeight == null) {
            return null;
        }

        double contribution = booleanValue ? scoringWeight : 0.0;
        return createItem(
                answer,
                booleanValue ? "Yes" : "No",
                contribution,
                booleanValue
                        ? "BOOLEAN answer matched the configured question weight"
                        : "BOOLEAN answer evaluated as false, so it adds zero points"
        );
    }

    private ScoreResultItem buildSingleChoiceItem(AnamnesisAnswer answer, Object value) {
        if (!(value instanceof String optionValue)) {
            return null;
        }

        Map<String, Double> optionScores = resolveOptionScores(answer);
        Double optionScore = optionScores.get(optionValue);
        if (optionScore == null) {
            return null;
        }

        double multiplier = answer.resolveQuestionScoringWeight() == null ? 1.0 : answer.resolveQuestionScoringWeight();
        double contribution = optionScore * multiplier;
        return createItem(
                answer,
                optionValue,
                contribution,
                "SINGLE_CHOICE option score %.2f multiplied by question weight %.2f"
                        .formatted(optionScore, multiplier)
        );
    }

    private ScoreResultItem buildMultipleChoiceItem(AnamnesisAnswer answer, Object value) {
        if (!(value instanceof List<?> listValue) || listValue.isEmpty()) {
            return null;
        }

        Map<String, Double> optionScores = resolveOptionScores(answer);
        List<String> selectedOptions = listValue.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .toList();
        List<String> scoredOptions = selectedOptions.stream()
                .filter(option -> optionScores.containsKey(option))
                .toList();

        if (scoredOptions.isEmpty()) {
            return null;
        }

        double baseScore = scoredOptions.stream()
                .map(optionScores::get)
                .reduce(0.0, Double::sum);
        double multiplier = answer.resolveQuestionScoringWeight() == null ? 1.0 : answer.resolveQuestionScoringWeight();
        double contribution = baseScore * multiplier;
        return createItem(
                answer,
                String.join(", ", selectedOptions),
                contribution,
                "MULTIPLE_CHOICE option score sum %.2f multiplied by question weight %.2f"
                        .formatted(baseScore, multiplier)
        );
    }

    private ScoreResultItem buildNumberItem(AnamnesisAnswer answer, Object value) {
        Double scoringWeight = answer.resolveQuestionScoringWeight();
        if (!(value instanceof Number numberValue) || scoringWeight == null) {
            return null;
        }

        double numericValue = numberValue.doubleValue();
        double contribution = numericValue * scoringWeight;
        return createItem(
                answer,
                formatNumber(numericValue),
                contribution,
                "NUMBER answer %.2f multiplied by question weight %.2f"
                        .formatted(numericValue, scoringWeight)
        );
    }

    private ScoreResultItem createItem(
            AnamnesisAnswer answer,
            String answerValue,
            double contribution,
            String ruleApplied
    ) {
        ScoreResultItem item = new ScoreResultItem();
        item.setQuestionId(answer.getQuestion().getId());
        item.setQuestionLabel(answer.resolveQuestionLabel());
        item.setQuestionType(answer.resolveQuestionType().name());
        item.setAnswerValue(answerValue);
        item.setContribution(round(contribution));
        item.setRuleApplied(ruleApplied);
        return item;
    }

    private ScoreClassification classificationFor(double totalScore) {
        if (totalScore >= scoringProperties.getHighThreshold()) {
            return ScoreClassification.HIGH;
        }

        if (totalScore >= scoringProperties.getModerateThreshold()) {
            return ScoreClassification.MODERATE;
        }

        return ScoreClassification.LOW;
    }

    private String buildSummary(AnamnesisRecord record, CalculationResult calculation) {
        ScoreResultItem highestItem = calculation.items().stream()
                .max(Comparator.comparingDouble(ScoreResultItem::getContribution))
                .orElse(null);

        String highestContribution = highestItem == null
                ? "No contributing question details were stored."
                : "Highest contribution: %s (%.2f).".formatted(
                highestItem.getQuestionLabel(),
                highestItem.getContribution()
        );

        return "Calculated from %d scored answers in template %s. %s Classification: %s."
                .formatted(
                        calculation.items().size(),
                        record.resolveTemplateName(),
                        highestContribution,
                        classificationFor(calculation.totalScore()).name()
                );
    }

    private Object deserializeAnswer(String serializedValue) {
        try {
            return objectMapper.readValue(serializedValue, Object.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to read stored anamnesis answer for scoring");
        }
    }

    private String formatNumber(double value) {
        return String.format(Locale.US, "%.2f", value);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private Map<String, Double> resolveOptionScores(AnamnesisAnswer answer) {
        String serializedOptionScores = answer.getQuestionOptionScoresSnapshot();
        if (serializedOptionScores == null || serializedOptionScores.isBlank()) {
            return answer.getQuestion().getOptionScores();
        }

        try {
            return objectMapper.readValue(
                    serializedOptionScores,
                    objectMapper.getTypeFactory().constructMapType(LinkedHashMap.class, String.class, Double.class)
            );
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to read stored option scores for scoring");
        }
    }

    private Patient findPatient(UUID patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
    }

    private AnamnesisRecord findPatientRecord(UUID patientId, UUID recordId) {
        return anamnesisRecordRepository.findByIdAndPatientId(recordId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient anamnesis record not found: " + recordId));
    }

    private void ensurePatientExists(UUID patientId) {
        if (patientRepository.findById(patientId).isEmpty()) {
            throw new ResourceNotFoundException("Patient not found: " + patientId);
        }
    }

    private record CalculationResult(
            double totalScore,
            List<ScoreResultItem> items
    ) {
    }
}
