package com.phaiffer.clinic.modules.anamnesis.application.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisAnswer;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisQuestion;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;

import java.util.List;
import java.util.Map;

public final class AnamnesisMapper {

    private AnamnesisMapper() {
    }

    public static AnamnesisTemplateResponse toTemplateResponse(AnamnesisTemplate template) {
        return new AnamnesisTemplateResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                template.isActive(),
                template.getCreatedAt(),
                template.getQuestions().stream().map(AnamnesisMapper::toQuestionResponse).toList()
        );
    }

    public static AnamnesisQuestionResponse toQuestionResponse(AnamnesisQuestion question) {
        return new AnamnesisQuestionResponse(
                question.getId(),
                question.getLabel(),
                question.getHelperText(),
                question.getType(),
                question.isRequired(),
                question.getDisplayOrder(),
                question.getScoringWeight(),
                List.copyOf(question.getOptions()),
                Map.copyOf(question.getOptionScores())
        );
    }

    public static PatientAnamnesisRecordListItemResponse toRecordListItemResponse(AnamnesisRecord record) {
        return new PatientAnamnesisRecordListItemResponse(
                record.getId(),
                record.getPatient().getId(),
                record.getTemplate().getId(),
                record.resolveTemplateName(),
                record.getCreatedAt()
        );
    }

    public static PatientAnamnesisRecordResponse toRecordResponse(
            AnamnesisRecord record,
            ObjectMapper objectMapper
    ) {
        return new PatientAnamnesisRecordResponse(
                record.getId(),
                record.getPatient().getId(),
                record.getPatient().getFirstName() + " " + record.getPatient().getLastName(),
                record.getTemplate().getId(),
                record.resolveTemplateName(),
                record.getCreatedAt(),
                record.getAnswers().stream()
                        .sorted((left, right) -> Integer.compare(
                                left.resolveQuestionDisplayOrder(),
                                right.resolveQuestionDisplayOrder()
                        ))
                        .map(answer -> toAnswerResponse(answer, objectMapper))
                        .toList()
        );
    }

    private static AnamnesisAnswerResponse toAnswerResponse(AnamnesisAnswer answer, ObjectMapper objectMapper) {
        return new AnamnesisAnswerResponse(
                answer.getId(),
                answer.getQuestion().getId(),
                answer.resolveQuestionLabel(),
                answer.resolveQuestionType(),
                deserializeAnswer(answer.getAnswerValue(), objectMapper)
        );
    }

    private static Object deserializeAnswer(String answerValue, ObjectMapper objectMapper) {
        try {
            return objectMapper.readValue(answerValue, Object.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to read stored anamnesis answer");
        }
    }
}
