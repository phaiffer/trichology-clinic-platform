package com.phaiffer.clinic.modules.patient.presentation;

import com.phaiffer.clinic.modules.patient.application.dto.PatientPageResponse;
import com.phaiffer.clinic.modules.patient.application.dto.PatientRequest;
import com.phaiffer.clinic.modules.patient.application.dto.PatientResponse;
import com.phaiffer.clinic.modules.patient.application.usecase.PatientService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public PatientPageResponse listPatients(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size
    ) {
        return patientService.listPatients(search, page, size);
    }

    @GetMapping("/{id}")
    public PatientResponse getPatient(@PathVariable UUID id) {
        return patientService.getPatient(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse createPatient(@Valid @RequestBody PatientRequest request) {
        return patientService.createPatient(request);
    }

    @PutMapping("/{id}")
    public PatientResponse updatePatient(@PathVariable UUID id, @Valid @RequestBody PatientRequest request) {
        return patientService.updatePatient(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
    }
}
