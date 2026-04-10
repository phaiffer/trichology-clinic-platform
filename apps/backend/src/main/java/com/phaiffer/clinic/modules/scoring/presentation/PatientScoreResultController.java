package com.phaiffer.clinic.modules.scoring.presentation;

import com.phaiffer.clinic.modules.scoring.application.dto.ScoreResultResponse;
import com.phaiffer.clinic.modules.scoring.application.usecase.ScoreResultService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}")
public class PatientScoreResultController {

    private final ScoreResultService scoreResultService;

    public PatientScoreResultController(ScoreResultService scoreResultService) {
        this.scoreResultService = scoreResultService;
    }

    @PostMapping("/anamnesis-records/{recordId}/scores")
    @ResponseStatus(HttpStatus.CREATED)
    public ScoreResultResponse calculateFromAnamnesisRecord(
            @PathVariable UUID patientId,
            @PathVariable UUID recordId
    ) {
        return scoreResultService.calculateFromAnamnesisRecord(patientId, recordId);
    }

    @GetMapping({"/scores", "/score-results"})
    public List<ScoreResultResponse> listByPatient(@PathVariable UUID patientId) {
        return scoreResultService.listByPatient(patientId);
    }

    @GetMapping({"/scores/{scoreResultId}", "/score-results/{scoreResultId}"})
    public ScoreResultResponse getByPatient(
            @PathVariable UUID patientId,
            @PathVariable UUID scoreResultId
    ) {
        return scoreResultService.getByPatient(patientId, scoreResultId);
    }
}
