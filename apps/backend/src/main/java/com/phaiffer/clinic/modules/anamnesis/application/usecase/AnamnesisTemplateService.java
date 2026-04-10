package com.phaiffer.clinic.modules.anamnesis.application.usecase;

import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisMapper;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisQuestionRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateQuestionUpdateRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateStatusRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateResponse;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateUpdateRequest;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisQuestion;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;
import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisAnswerRepository;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisTemplateRepository;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class AnamnesisTemplateService {

    private final AnamnesisTemplateRepository templateRepository;
    private final AnamnesisAnswerRepository answerRepository;

    public AnamnesisTemplateService(
            AnamnesisTemplateRepository templateRepository,
            AnamnesisAnswerRepository answerRepository
    ) {
        this.templateRepository = templateRepository;
        this.answerRepository = answerRepository;
    }

    @Transactional
    public AnamnesisTemplateResponse createTemplate(AnamnesisTemplateRequest request) {
        validateQuestionConfiguration(request.questions());

        AnamnesisTemplate template = new AnamnesisTemplate();
        template.setName(request.name().trim());
        template.setDescription(request.description());
        template.setActive(request.active() == null || request.active());

        request.questions().stream()
                .sorted((left, right) -> Integer.compare(left.displayOrder(), right.displayOrder()))
                .map(this::toQuestion)
                .forEach(template::addQuestion);

        return AnamnesisMapper.toTemplateResponse(templateRepository.save(template));
    }

    @Transactional(readOnly = true)
    public List<AnamnesisTemplateResponse> listTemplates() {
        return templateRepository.findAll().stream().map(AnamnesisMapper::toTemplateResponse).toList();
    }

    @Transactional(readOnly = true)
    public AnamnesisTemplateResponse getTemplate(UUID id) {
        return AnamnesisMapper.toTemplateResponse(findTemplate(id));
    }

    @Transactional
    public AnamnesisTemplateResponse updateTemplate(UUID id, AnamnesisTemplateUpdateRequest request) {
        validateUpdateQuestionConfiguration(request.questions());

        AnamnesisTemplate template = findTemplate(id);
        Map<UUID, AnamnesisQuestion> existingQuestionsById = new HashMap<>();

        for (AnamnesisQuestion question : template.getQuestions()) {
            existingQuestionsById.put(question.getId(), question);
        }

        for (AnamnesisTemplateQuestionUpdateRequest questionRequest : sortQuestions(request.questions())) {
            if (questionRequest.id() == null) {
                template.addQuestion(toQuestion(questionRequest));
                continue;
            }

            AnamnesisQuestion existingQuestion = existingQuestionsById.remove(questionRequest.id());
            if (existingQuestion == null) {
                throw new IllegalArgumentException(
                        "Question does not belong to the selected template: " + questionRequest.id()
                );
            }

            updateExistingQuestion(existingQuestion, questionRequest);
        }

        for (AnamnesisQuestion removedQuestion : existingQuestionsById.values()) {
            ensureQuestionRemovalIsSafe(removedQuestion);
        }

        template.setName(request.name().trim());
        template.setDescription(normalizeText(request.description()));
        template.setActive(request.active() == null || request.active());
        template.getQuestions().removeIf(question -> existingQuestionsById.containsKey(question.getId()));
        AnamnesisTemplate savedTemplate = templateRepository.save(template);

        return AnamnesisMapper.toTemplateResponse(savedTemplate);
    }

    @Transactional
    public AnamnesisTemplateResponse updateTemplateStatus(UUID id, AnamnesisTemplateStatusRequest request) {
        AnamnesisTemplate template = findTemplate(id);
        template.setActive(request.active());
        return AnamnesisMapper.toTemplateResponse(templateRepository.save(template));
    }

    public AnamnesisTemplate findTemplate(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnesis template not found: " + id));
    }

    private AnamnesisQuestion toQuestion(AnamnesisQuestionRequest request) {
        AnamnesisQuestion question = new AnamnesisQuestion();
        question.setLabel(request.label().trim());
        question.setHelperText(normalizeText(request.helperText()));
        question.setType(request.type());
        question.setRequired(request.required());
        question.setDisplayOrder(request.displayOrder());
        question.setScoringWeight(request.scoringWeight());
        question.setOptions(normalizeOptions(request.options()));
        question.setOptionScores(normalizeOptionScores(request.optionScores(), question.getOptions()));
        return question;
    }

    private AnamnesisQuestion toQuestion(AnamnesisTemplateQuestionUpdateRequest request) {
        AnamnesisQuestion question = new AnamnesisQuestion();
        applyQuestionValues(question, request);
        return question;
    }

    private AnamnesisQuestion updateExistingQuestion(
            AnamnesisQuestion question,
            AnamnesisTemplateQuestionUpdateRequest request
    ) {
        boolean questionHasStoredAnswers = answerRepository.existsByQuestionId(question.getId());
        if (questionHasStoredAnswers && question.getType() != request.type()) {
            throw new IllegalArgumentException(
                    "Question type cannot be changed after the question has stored patient answers: "
                            + question.getLabel()
            );
        }

        applyQuestionValues(question, request);
        return question;
    }

    private void applyQuestionValues(AnamnesisQuestion question, AnamnesisTemplateQuestionUpdateRequest request) {
        question.setLabel(request.label().trim());
        question.setHelperText(normalizeText(request.helperText()));
        question.setType(request.type());
        question.setRequired(request.required());
        question.setDisplayOrder(request.displayOrder());
        question.setScoringWeight(request.scoringWeight());
        question.setOptions(normalizeOptions(request.options()));
        question.setOptionScores(normalizeOptionScores(request.optionScores(), question.getOptions()));
    }

    private void ensureQuestionRemovalIsSafe(AnamnesisQuestion question) {
        if (answerRepository.existsByQuestionId(question.getId())) {
            throw new IllegalArgumentException(
                    "Question cannot be removed because it already has stored patient answers: " + question.getLabel()
            );
        }
    }

    private void validateQuestionConfiguration(List<AnamnesisQuestionRequest> questions) {
        ensureDisplayOrdersAreUnique(questions.stream().map(AnamnesisQuestionRequest::displayOrder).toList());
        for (AnamnesisQuestionRequest question : questions) {
            validateQuestionConfiguration(question.type(), question.options(), question.optionScores());
        }
    }

    private void validateUpdateQuestionConfiguration(List<AnamnesisTemplateQuestionUpdateRequest> questions) {
        ensureDisplayOrdersAreUnique(questions.stream().map(AnamnesisTemplateQuestionUpdateRequest::displayOrder).toList());
        ensureQuestionIdsAreUnique(questions.stream().map(AnamnesisTemplateQuestionUpdateRequest::id).filter(Objects::nonNull).toList());

        for (AnamnesisTemplateQuestionUpdateRequest question : questions) {
            validateQuestionConfiguration(question.type(), question.options(), question.optionScores());
        }
    }

    private void validateQuestionConfiguration(
            QuestionType type,
            List<String> rawOptions,
            Map<String, Double> rawOptionScores
    ) {
        boolean choiceType = type == QuestionType.SINGLE_CHOICE || type == QuestionType.MULTIPLE_CHOICE;
        List<String> options = normalizeOptions(rawOptions);

        if (choiceType && options.isEmpty()) {
            throw new IllegalArgumentException("Choice-based questions must define at least one option");
        }

        if (!choiceType && !options.isEmpty()) {
            throw new IllegalArgumentException("Only choice-based questions can define options");
        }

        Map<String, Double> optionScores = normalizeOptionScores(rawOptionScores, options);
        if (!choiceType && !optionScores.isEmpty()) {
            throw new IllegalArgumentException("Only choice-based questions can define option scores");
        }
    }

    private void ensureDisplayOrdersAreUnique(List<Integer> displayOrders) {
        long distinctCount = displayOrders.stream().distinct().count();
        if (distinctCount != displayOrders.size()) {
            throw new IllegalArgumentException("Question displayOrder values must be unique within a template");
        }
    }

    private void ensureQuestionIdsAreUnique(List<UUID> questionIds) {
        long distinctCount = questionIds.stream().distinct().count();
        if (distinctCount != questionIds.size()) {
            throw new IllegalArgumentException("Question ids must be unique within the update request");
        }
    }

    private List<AnamnesisTemplateQuestionUpdateRequest> sortQuestions(
            List<AnamnesisTemplateQuestionUpdateRequest> questions
    ) {
        return questions.stream()
                .sorted((left, right) -> Integer.compare(left.displayOrder(), right.displayOrder()))
                .toList();
    }

    private List<String> normalizeOptions(List<String> options) {
        if (options == null) {
            return List.of();
        }

        return options.stream()
                .map(String::trim)
                .filter(option -> !option.isBlank())
                .toList();
    }

    private Map<String, Double> normalizeOptionScores(Map<String, Double> optionScores, List<String> options) {
        if (optionScores == null || optionScores.isEmpty()) {
            return Map.of();
        }

        Map<String, Double> normalizedOptionScores = new LinkedHashMap<>();
        for (Map.Entry<String, Double> entry : optionScores.entrySet()) {
            String option = entry.getKey() == null ? "" : entry.getKey().trim();
            Double score = entry.getValue();

            if (option.isBlank()) {
                throw new IllegalArgumentException("Option score keys cannot be blank");
            }

            if (score == null) {
                throw new IllegalArgumentException("Option scores cannot be null");
            }

            if (!options.contains(option)) {
                throw new IllegalArgumentException("Option scores must reference declared options");
            }

            normalizedOptionScores.put(option, score);
        }

        return normalizedOptionScores;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
