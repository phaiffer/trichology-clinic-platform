package com.phaiffer.clinic.modules.anamnesis.application.usecase;

import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisMapper;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisQuestionRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateResponse;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisQuestion;
import com.phaiffer.clinic.modules.anamnesis.domain.model.AnamnesisTemplate;
import com.phaiffer.clinic.modules.anamnesis.domain.model.QuestionType;
import com.phaiffer.clinic.modules.anamnesis.domain.repository.AnamnesisTemplateRepository;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AnamnesisTemplateService {

    private final AnamnesisTemplateRepository templateRepository;

    public AnamnesisTemplateService(AnamnesisTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
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

    public AnamnesisTemplate findTemplate(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anamnesis template not found: " + id));
    }

    private AnamnesisQuestion toQuestion(AnamnesisQuestionRequest request) {
        AnamnesisQuestion question = new AnamnesisQuestion();
        question.setLabel(request.label().trim());
        question.setHelperText(request.helperText());
        question.setType(request.type());
        question.setRequired(request.required());
        question.setDisplayOrder(request.displayOrder());
        question.setScoringWeight(request.scoringWeight());
        question.setOptions(normalizeOptions(request.options()));
        question.setOptionScores(normalizeOptionScores(request.optionScores(), question.getOptions()));
        return question;
    }

    private void validateQuestionConfiguration(List<AnamnesisQuestionRequest> questions) {
        for (AnamnesisQuestionRequest question : questions) {
            boolean choiceType = question.type() == QuestionType.SINGLE_CHOICE
                    || question.type() == QuestionType.MULTIPLE_CHOICE;
            List<String> options = normalizeOptions(question.options());

            if (choiceType && options.isEmpty()) {
                throw new IllegalArgumentException("Choice-based questions must define at least one option");
            }

            if (!choiceType && !options.isEmpty()) {
                throw new IllegalArgumentException("Only choice-based questions can define options");
            }

            Map<String, Double> optionScores = normalizeOptionScores(question.optionScores(), options);
            if (!choiceType && !optionScores.isEmpty()) {
                throw new IllegalArgumentException("Only choice-based questions can define option scores");
            }
        }
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
}
