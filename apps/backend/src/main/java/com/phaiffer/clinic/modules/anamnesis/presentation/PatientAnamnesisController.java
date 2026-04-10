package com.phaiffer.clinic.modules.anamnesis.presentation;

import com.phaiffer.clinic.modules.anamnesis.application.dto.AnamnesisRecordRequest;
import com.phaiffer.clinic.modules.anamnesis.application.dto.PatientAnamnesisRecordListItemResponse;
import com.phaiffer.clinic.modules.anamnesis.application.dto.PatientAnamnesisRecordResponse;
import com.phaiffer.clinic.modules.anamnesis.application.usecase.PatientAnamnesisService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/anamnesis-records")
public class PatientAnamnesisController {

    private final PatientAnamnesisService patientAnamnesisService;

    public PatientAnamnesisController(PatientAnamnesisService patientAnamnesisService) {
        this.patientAnamnesisService = patientAnamnesisService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientAnamnesisRecordResponse createRecord(
            @PathVariable UUID patientId,
            @Valid @RequestBody AnamnesisRecordRequest request
    ) {
        return patientAnamnesisService.createRecord(patientId, request);
    }

    @GetMapping
    public List<PatientAnamnesisRecordListItemResponse> listRecords(@PathVariable UUID patientId) {
        return patientAnamnesisService.listRecords(patientId);
    }

    @GetMapping("/{recordId}")
    public PatientAnamnesisRecordResponse getRecord(
            @PathVariable UUID patientId,
            @PathVariable UUID recordId
    ) {
        return patientAnamnesisService.getRecord(patientId, recordId);
    }
}
