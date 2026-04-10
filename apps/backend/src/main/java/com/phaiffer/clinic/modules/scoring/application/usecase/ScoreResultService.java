package com.phaiffer.clinic.modules.scoring.application.usecase;

import com.phaiffer.clinic.modules.patient.domain.repository.PatientRepository;
import com.phaiffer.clinic.modules.scoring.application.dto.ScoreResultMapper;
import com.phaiffer.clinic.modules.scoring.application.dto.ScoreResultResponse;
import com.phaiffer.clinic.modules.scoring.domain.model.ScoreResult;
import com.phaiffer.clinic.modules.scoring.domain.repository.ScoreResultRepository;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ScoreResultService {

    private final PatientRepository patientRepository;
    private final ScoreResultRepository scoreResultRepository;

    public ScoreResultService(
            PatientRepository patientRepository,
            ScoreResultRepository scoreResultRepository
    ) {
        this.patientRepository = patientRepository;
        this.scoreResultRepository = scoreResultRepository;
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

    private void ensurePatientExists(UUID patientId) {
        if (patientRepository.findById(patientId).isEmpty()) {
            throw new ResourceNotFoundException("Patient not found: " + patientId);
        }
    }
}
