package com.phaiffer.clinic.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.phaiffer.clinic.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ScoringWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Test
    void shouldCalculatePersistAndRetrieveScoreHistoryWithStableStoredDetails() throws Exception {
        JsonNode patient = createPatient("score-history");
        JsonNode template = createTemplate("Score Template");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        UUID firstQuestionId = UUID.fromString(template.get("questions").get(0).get("id").asText());
        UUID secondQuestionId = UUID.fromString(template.get("questions").get(1).get("id").asText());
        UUID thirdQuestionId = UUID.fromString(template.get("questions").get(2).get("id").asText());
        UUID fourthQuestionId = UUID.fromString(template.get("questions").get(3).get("id").asText());
        UUID fifthQuestionId = UUID.fromString(template.get("questions").get(4).get("id").asText());

        JsonNode record = createRecord(
                patientId,
                templateId,
                List.of(
                        answer(firstQuestionId, "High"),
                        answer(secondQuestionId, true),
                        answer(thirdQuestionId, List.of("Frontal", "Crown")),
                        answer(fourthQuestionId, 8),
                        answer(fifthQuestionId, "Scoring baseline")
                )
        );
        UUID recordId = uuid(record, "id");

        JsonNode createdScore = calculateScore(patientId, recordId);
        UUID scoreId = uuid(createdScore, "id");

        assertThat(createdScore.get("totalScore").asDouble()).isEqualTo(17.0);
        assertThat(createdScore.get("classification").asText()).isEqualTo("MODERATE");
        assertThat(createdScore.get("items").size()).isEqualTo(4);
        assertThat(createdScore.get("items").get(0).get("questionLabel").asText()).isEqualTo("Hair shedding severity");
        assertThat(createdScore.get("items").get(0).get("contribution").asDouble()).isEqualTo(6.0);

        JsonNode scoreHistory = json(
                mockMvc.perform(get("/api/patients/{patientId}/scores", patientId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(scoreHistory.size()).isEqualTo(1);
        assertThat(scoreHistory.get(0).get("id").asText()).isEqualTo(scoreId.toString());

        JsonNode fetchedScore = json(
                mockMvc.perform(get("/api/patients/{patientId}/scores/{scoreId}", patientId, scoreId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(fetchedScore.get("totalScore").asDouble()).isEqualTo(17.0);
        assertThat(fetchedScore.get("items").get(2).get("answerValue").asText()).contains("Frontal");

        Map<String, Object> updatePayload = new LinkedHashMap<>();
        updatePayload.put("name", "Score Template v2");
        updatePayload.put("description", "Changed after scoring");
        updatePayload.put("active", true);
        updatePayload.put("questions", List.of(
                templateQuestionUpdate(
                        firstQuestionId,
                        "Updated shedding severity",
                        "SINGLE_CHOICE",
                        true,
                        1,
                        4.0,
                        List.of("Low", "High"),
                        Map.of("Low", 10.0, "High", 10.0)
                ),
                templateQuestionUpdate(
                        secondQuestionId,
                        "Updated itching episodes",
                        "BOOLEAN",
                        true,
                        2,
                        10.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        thirdQuestionId,
                        "Updated affected regions",
                        "MULTIPLE_CHOICE",
                        false,
                        3,
                        10.0,
                        List.of("Frontal", "Crown"),
                        Map.of("Frontal", 10.0, "Crown", 10.0)
                ),
                templateQuestionUpdate(
                        fourthQuestionId,
                        "Updated daily hair loss count",
                        "NUMBER",
                        false,
                        4,
                        10.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        fifthQuestionId,
                        "Updated clinical notes",
                        "TEXTAREA",
                        false,
                        5,
                        null,
                        List.of(),
                        Map.of()
                )
        ));

        mockMvc.perform(put("/api/anamnesis/templates/{id}", templateId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(updatePayload)))
                .andExpect(status().isOk());

        JsonNode storedScoreAfterTemplateChange = json(
                mockMvc.perform(get("/api/patients/{patientId}/scores/{scoreId}", patientId, scoreId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(storedScoreAfterTemplateChange.get("totalScore").asDouble()).isEqualTo(17.0);
        assertThat(storedScoreAfterTemplateChange.get("items").get(0).get("questionLabel").asText())
                .isEqualTo("Hair shedding severity");
        assertThat(storedScoreAfterTemplateChange.get("items").get(0).get("ruleApplied").asText())
                .contains("question weight")
                .contains("1");

        JsonNode recalculatedScore = calculateScore(patientId, recordId);
        assertThat(recalculatedScore.get("totalScore").asDouble()).isEqualTo(17.0);
        assertThat(recalculatedScore.get("items").get(0).get("questionLabel").asText()).isEqualTo("Hair shedding severity");
    }

    @Test
    void shouldEnforceScoreOwnershipOnRetrieval() throws Exception {
        JsonNode firstPatient = createPatient("score-owner");
        JsonNode secondPatient = createPatient("score-other-owner");
        JsonNode template = createTemplate("Ownership Template");

        UUID firstPatientId = uuid(firstPatient, "id");
        UUID secondPatientId = uuid(secondPatient, "id");
        UUID templateId = uuid(template, "id");

        JsonNode record = createRecord(
                firstPatientId,
                templateId,
                List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "High"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true)
                )
        );

        JsonNode score = calculateScore(firstPatientId, uuid(record, "id"));

        mockMvc.perform(get("/api/patients/{patientId}/scores/{scoreId}", secondPatientId, uuid(score, "id")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Score result not found: " + score.get("id").asText()));

        mockMvc.perform(post("/api/patients/{patientId}/anamnesis-records/{recordId}/scores", secondPatientId, uuid(record, "id")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient anamnesis record not found: " + record.get("id").asText()));
    }
}
