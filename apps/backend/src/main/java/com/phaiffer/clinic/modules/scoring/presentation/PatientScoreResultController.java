package com.phaiffer.clinic.modules.scoring.presentation;

import com.phaiffer.clinic.modules.scoring.application.dto.ScoreResultResponse;
import com.phaiffer.clinic.modules.scoring.application.usecase.ScoreResultService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/score-results")
public class PatientScoreResultController {

    private final ScoreResultService scoreResultService;

    public PatientScoreResultController(ScoreResultService scoreResultService) {
        this.scoreResultService = scoreResultService;
    }

    @GetMapping
    public List<ScoreResultResponse> listByPatient(@PathVariable UUID patientId) {
        return scoreResultService.listByPatient(patientId);
    }

    @GetMapping("/{scoreResultId}")
    public ScoreResultResponse getByPatient(
            @PathVariable UUID patientId,
            @PathVariable UUID scoreResultId
    ) {
        return scoreResultService.getByPatient(patientId, scoreResultId);
    }
}
