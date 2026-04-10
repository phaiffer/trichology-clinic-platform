package com.phaiffer.clinic.modules.anamnesis.presentation;

import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateResponse;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateStatusRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisTemplateUpdateRequest;
import com.phaiffer.clinic.modules.anamnesis.application.usecase.AnamnesisTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/anamnesis/templates")
public class AnamnesisTemplateController {

    private final AnamnesisTemplateService templateService;

    public AnamnesisTemplateController(AnamnesisTemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AnamnesisTemplateResponse createTemplate(@Valid @RequestBody AnamnesisTemplateRequest request) {
        return templateService.createTemplate(request);
    }

    @GetMapping
    public List<AnamnesisTemplateResponse> listTemplates() {
        return templateService.listTemplates();
    }

    @GetMapping("/{id}")
    public AnamnesisTemplateResponse getTemplate(@PathVariable UUID id) {
        return templateService.getTemplate(id);
    }

    @PutMapping("/{id}")
    public AnamnesisTemplateResponse updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody AnamnesisTemplateUpdateRequest request
    ) {
        return templateService.updateTemplate(id, request);
    }

    @PatchMapping("/{id}/status")
    public AnamnesisTemplateResponse updateTemplateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AnamnesisTemplateStatusRequest request
    ) {
        return templateService.updateTemplateStatus(id, request);
    }
}
