package com.phaiffer.clinic.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.phaiffer.clinic.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

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

@WithMockUser(roles = "ADMIN")
class PatientAnamnesisWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Test
    void shouldCreateRecordPreserveSnapshotsAndExposeHistoryAndDetails() throws Exception {
        JsonNode patient = createPatient("anamnesis-history");
        JsonNode template = createTemplate("History Template");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        UUID firstQuestionId = UUID.fromString(template.get("questions").get(0).get("id").asText());
        UUID secondQuestionId = UUID.fromString(template.get("questions").get(1).get("id").asText());
        UUID thirdQuestionId = UUID.fromString(template.get("questions").get(2).get("id").asText());
        UUID fourthQuestionId = UUID.fromString(template.get("questions").get(3).get("id").asText());
        UUID fifthQuestionId = UUID.fromString(template.get("questions").get(4).get("id").asText());

        JsonNode createdRecord = createRecord(
                patientId,
                templateId,
                List.of(
                        answer(firstQuestionId, "High"),
                        answer(secondQuestionId, true),
                        answer(thirdQuestionId, List.of("Frontal", "Crown")),
                        answer(fourthQuestionId, 8),
                        answer(fifthQuestionId, "Observed thinning around the crown")
                )
        );
        UUID recordId = uuid(createdRecord, "id");

        assertThat(createdRecord.get("templateName").asText()).isEqualTo("History Template");
        assertThat(createdRecord.get("answers").size()).isEqualTo(5);
        assertThat(createdRecord.get("answers").get(0).get("questionLabel").asText()).isEqualTo("Hair shedding severity");
        assertThat(createdRecord.get("answers").get(2).get("value").size()).isEqualTo(2);

        Map<String, Object> updatePayload = new LinkedHashMap<>();
        updatePayload.put("name", "History Template v2");
        updatePayload.put("description", "Updated after first record");
        updatePayload.put("active", true);
        updatePayload.put("questions", List.of(
                templateQuestionUpdate(
                        firstQuestionId,
                        "Shedding severity updated",
                        "SINGLE_CHOICE",
                        true,
                        1,
                        3.0,
                        List.of("Low", "High", "Severe"),
                        Map.of("Low", 1.0, "High", 7.0, "Severe", 9.0)
                ),
                templateQuestionUpdate(
                        secondQuestionId,
                        "Itching episodes updated",
                        "BOOLEAN",
                        true,
                        2,
                        1.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        thirdQuestionId,
                        "Affected regions updated",
                        "MULTIPLE_CHOICE",
                        false,
                        3,
                        2.0,
                        List.of("Frontal", "Crown"),
                        Map.of("Frontal", 1.0, "Crown", 1.0)
                ),
                templateQuestionUpdate(
                        fourthQuestionId,
                        "Daily hair loss count updated",
                        "NUMBER",
                        false,
                        4,
                        1.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        fifthQuestionId,
                        "Clinical notes updated",
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

        JsonNode anamnesisHistory = json(
                mockMvc.perform(get("/api/patients/{patientId}/anamnesis-records", patientId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(anamnesisHistory.size()).isEqualTo(1);
        assertThat(anamnesisHistory.get(0).get("id").asText()).isEqualTo(recordId.toString());
        assertThat(anamnesisHistory.get(0).get("templateName").asText()).isEqualTo("History Template");

        JsonNode fetchedRecord = json(
                mockMvc.perform(get("/api/patients/{patientId}/anamnesis-records/{recordId}", patientId, recordId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(fetchedRecord.get("templateName").asText()).isEqualTo("History Template");
        assertThat(fetchedRecord.get("answers").get(0).get("questionLabel").asText()).isEqualTo("Hair shedding severity");
        assertThat(fetchedRecord.get("answers").get(0).get("value").asText()).isEqualTo("High");
        assertThat(fetchedRecord.get("answers").get(2).get("value").get(0).asText()).isEqualTo("Frontal");
    }

    @Test
    void shouldRejectMissingRequiredAnswer() throws Exception {
        JsonNode patient = createPatient("anamnesis-required");
        JsonNode template = createTemplate("Required Template");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        Map<String, Object> payload = Map.of(
                "templateId", templateId,
                "answers", List.of(answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true))
        );

        mockMvc.perform(post("/api/patients/{patientId}/anamnesis-records", patientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Required question is missing an answer: Hair shedding severity"));
    }
}
