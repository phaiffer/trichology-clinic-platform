package com.phaiffer.clinic.modules.anamnesis.application.usecase;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisAnswerRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisMapper;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisRecordRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.PatientAnamnesisRecordListItemResponse;
import com.phaiffer.clinic.modules.anamnesis.application.dto.PatientAnamnesisRecordResponse;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisAnswer;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisQuestion;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisRecord;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;
import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisRecordRepository;
import com.phaiffer.clinic.modules.patient.domain.model.Patient;
import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PatientAnamnesisService {

    private final PatientRepository patientRepository;
    private final AnamnesisRecordRepository recordRepository;
    private final AnamnesisTemplateService templateService;
    private final ObjectMapper objectMapper;

    public PatientAnamnesisService(
            PatientRepository patientRepository,
            AnamnesisRecordRepository recordRepository,
            AnamnesisTemplateService templateService,
            ObjectMapper objectMapper
    ) {
        this.patientRepository = patientRepository;
        this.recordRepository = recordRepository;
        this.templateService = templateService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public PatientAnamnesisRecordResponse createRecord(UUID patientId, AnamnesisRecordRequest request) {
        Patient patient = findPatient(patientId);
        AnamnesisTemplate template = templateService.findTemplate(request.templateId());
        if (!template.isActive()) {
            throw new IllegalArgumentException("Inactive templates cannot be used for new anamnesis submissions");
        }

        Map<UUID, AnamnesisQuestion> questionsById = new HashMap<>();

        for (AnamnesisQuestion question : template.getQuestions()) {
            questionsById.put(question.getId(), question);
        }

        validateAnswers(template.getQuestions(), request.answers(), questionsById);

        AnamnesisRecord record = new AnamnesisRecord();
        record.setPatient(patient);
        record.setTemplate(template);
        record.setTemplateNameSnapshot(template.getName());

        for (AnamnesisAnswerRequest answerRequest : request.answers()) {
            AnamnesisQuestion question = questionsById.get(answerRequest.questionId());
            AnamnesisAnswer answer = new AnamnesisAnswer();
            answer.setQuestion(question);
            answer.setQuestionLabelSnapshot(question.getLabel());
            answer.setQuestionTypeSnapshot(question.getType());
            answer.setQuestionDisplayOrderSnapshot(question.getDisplayOrder());
            answer.setQuestionScoringWeightSnapshot(question.getScoringWeight());
            answer.setQuestionOptionScoresSnapshot(serializeAnswer(question.getOptionScores()));
            answer.setAnswerValue(serializeAnswer(answerRequest.value()));
            record.addAnswer(answer);
        }

        return AnamnesisMapper.toRecordResponse(recordRepository.save(record), objectMapper);
    }

    @Transactional(readOnly = true)
    public List<PatientAnamnesisRecordListItemResponse> listRecords(UUID patientId) {
        findPatient(patientId);
        return recordRepository.findByPatientId(patientId).stream()
                .map(AnamnesisMapper::toRecordListItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientAnamnesisRecordResponse getRecord(UUID patientId, UUID recordId) {
        findPatient(patientId);
        AnamnesisRecord record = recordRepository.findByIdAndPatientId(recordId, patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient anamnesis record not found: " + recordId));

        return AnamnesisMapper.toRecordResponse(record, objectMapper);
    }

    private Patient findPatient(UUID patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + patientId));
    }

    private void validateAnswers(
            List<AnamnesisQuestion> questions,
            List<AnamnesisAnswerRequest> answers,
            Map<UUID, AnamnesisQuestion> questionsById
    ) {
        Map<UUID, AnamnesisAnswerRequest> answersByQuestionId = new HashMap<>();

        for (AnamnesisAnswerRequest answer : answers) {
            AnamnesisQuestion question = questionsById.get(answer.questionId());
            if (question == null) {
                throw new IllegalArgumentException("Answer references a question outside the selected template");
            }

            if (answersByQuestionId.put(answer.questionId(), answer) != null) {
                throw new IllegalArgumentException("Each question can only be answered once per record");
            }

            validateAnswerValue(question, answer.value());
        }

        for (AnamnesisQuestion question : questions) {
            if (question.isRequired() && !answersByQuestionId.containsKey(question.getId())) {
                throw new IllegalArgumentException("Required question is missing an answer: " + question.getLabel());
            }
        }
    }

    private void validateAnswerValue(AnamnesisQuestion question, Object value) {
        if (value == null) {
            if (question.isRequired()) {
                throw new IllegalArgumentException("Required question is missing a value: " + question.getLabel());
            }
            return;
        }

        switch (question.getType()) {
            case TEXT, TEXTAREA, DATE -> {
                if (!(value instanceof String stringValue) || stringValue.isBlank()) {
                    throw new IllegalArgumentException("Question requires a non-empty text value: " + question.getLabel());
                }
            }
            case NUMBER -> {
                if (!(value instanceof Number)) {
                    throw new IllegalArgumentException("Question requires a numeric value: " + question.getLabel());
                }
            }
            case BOOLEAN -> {
                if (!(value instanceof Boolean)) {
                    throw new IllegalArgumentException("Question requires a boolean value: " + question.getLabel());
                }
            }
            case SINGLE_CHOICE -> {
                if (!(value instanceof String option) || option.isBlank() || !question.getOptions().contains(option)) {
                    throw new IllegalArgumentException("Question requires a valid single option: " + question.getLabel());
                }
            }
            case MULTIPLE_CHOICE -> {
                if (!(value instanceof List<?> options) || options.isEmpty()) {
                    throw new IllegalArgumentException("Question requires one or more selected options: " + question.getLabel());
                }

                for (Object option : options) {
                    if (!(option instanceof String optionValue) || !question.getOptions().contains(optionValue)) {
                        throw new IllegalArgumentException("Question contains an invalid option: " + question.getLabel());
                    }
                }
            }
            default -> throw new IllegalArgumentException("Unsupported question type");
        }
    }

    private String serializeAnswer(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Unable to store anamnesis answer");
        }
    }
}
