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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WithMockUser(roles = "ADMIN")
class AnamnesisTemplateWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Test
    void shouldCreateListGetAndSafelyUpdateTemplate() throws Exception {
        JsonNode createdTemplate = createTemplate("Initial Intake");
        UUID templateId = uuid(createdTemplate, "id");
        JsonNode firstQuestion = createdTemplate.get("questions").get(0);

        JsonNode templateList = json(
                mockMvc.perform(get("/api/anamnesis/templates"))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(templateList.size()).isEqualTo(1);
        assertThat(templateList.get(0).get("id").asText()).isEqualTo(templateId.toString());

        JsonNode fetchedTemplate = json(
                mockMvc.perform(get("/api/anamnesis/templates/{id}", templateId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(fetchedTemplate.get("name").asText()).isEqualTo("Initial Intake");

        Map<String, Object> updatePayload = new LinkedHashMap<>();
        updatePayload.put("name", "Updated Intake");
        updatePayload.put("description", "Updated description");
        updatePayload.put("active", true);
        updatePayload.put("questions", List.of(
                templateQuestionUpdate(
                        UUID.fromString(firstQuestion.get("id").asText()),
                        "Updated shedding severity",
                        "SINGLE_CHOICE",
                        true,
                        1,
                        2.0,
                        List.of("Low", "High", "Severe"),
                        Map.of("Low", 1.0, "High", 4.0, "Severe", 6.0)
                ),
                templateQuestionUpdate(
                        UUID.fromString(createdTemplate.get("questions").get(1).get("id").asText()),
                        "Itching episodes",
                        "BOOLEAN",
                        true,
                        2,
                        2.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(createdTemplate.get("questions").get(2).get("id").asText()),
                        "Affected regions",
                        "MULTIPLE_CHOICE",
                        false,
                        3,
                        1.0,
                        List.of("Frontal", "Crown"),
                        Map.of("Frontal", 2.0, "Crown", 3.0)
                ),
                templateQuestionUpdate(
                        UUID.fromString(createdTemplate.get("questions").get(3).get("id").asText()),
                        "Daily hair loss count",
                        "NUMBER",
                        false,
                        4,
                        0.5,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(createdTemplate.get("questions").get(4).get("id").asText()),
                        "Clinical notes",
                        "TEXTAREA",
                        false,
                        5,
                        null,
                        List.of(),
                        Map.of()
                ),
                templateNewQuestion(
                        "Recent stress trigger",
                        "TEXT",
                        false,
                        6,
                        null,
                        List.of(),
                        Map.of()
                )
        ));

        JsonNode updatedTemplate = json(
                mockMvc.perform(put("/api/anamnesis/templates/{id}", templateId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(updatePayload)))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(updatedTemplate.get("name").asText()).isEqualTo("Updated Intake");
        assertThat(updatedTemplate.get("questions").size()).isEqualTo(6);
        assertThat(updatedTemplate.get("questions").get(0).get("label").asText()).isEqualTo("Updated shedding severity");
        assertThat(updatedTemplate.get("questions").get(0).get("optionScores").get("Severe").asDouble()).isEqualTo(6.0);
    }

    @Test
    void shouldRejectUnsafeQuestionTypeChangeAfterAnswersExist() throws Exception {
        JsonNode patient = createPatient("template-type-lock");
        JsonNode template = createTemplate("Template Type Lock");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        createRecord(
                patientId,
                templateId,
                List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "High"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true)
                )
        );

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "Template Type Lock");
        payload.put("description", "Attempt unsafe change");
        payload.put("active", true);
        payload.put("questions", List.of(
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(0).get("id").asText()),
                        "Hair shedding severity",
                        "TEXT",
                        true,
                        1,
                        1.5,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(1).get("id").asText()),
                        "Itching episodes",
                        "BOOLEAN",
                        true,
                        2,
                        2.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(2).get("id").asText()),
                        "Affected regions",
                        "MULTIPLE_CHOICE",
                        false,
                        3,
                        1.0,
                        List.of("Frontal", "Crown"),
                        Map.of("Frontal", 2.0, "Crown", 3.0)
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(3).get("id").asText()),
                        "Daily hair loss count",
                        "NUMBER",
                        false,
                        4,
                        0.5,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(4).get("id").asText()),
                        "Clinical notes",
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
                        .content(objectMapper.writeValueAsBytes(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Question type cannot be changed after the question has stored patient answers: Hair shedding severity"));
    }

    @Test
    void shouldRejectUnsafeQuestionRemovalAfterAnswersExist() throws Exception {
        JsonNode patient = createPatient("template-removal-lock");
        JsonNode template = createTemplate("Template Removal Lock");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        createRecord(
                patientId,
                templateId,
                List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "High"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true)
                )
        );

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", "Template Removal Lock");
        payload.put("description", "Attempt unsafe removal");
        payload.put("active", true);
        payload.put("questions", List.of(
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(1).get("id").asText()),
                        "Itching episodes",
                        "BOOLEAN",
                        true,
                        2,
                        2.0,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(2).get("id").asText()),
                        "Affected regions",
                        "MULTIPLE_CHOICE",
                        false,
                        3,
                        1.0,
                        List.of("Frontal", "Crown"),
                        Map.of("Frontal", 2.0, "Crown", 3.0)
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(3).get("id").asText()),
                        "Daily hair loss count",
                        "NUMBER",
                        false,
                        4,
                        0.5,
                        List.of(),
                        Map.of()
                ),
                templateQuestionUpdate(
                        UUID.fromString(template.get("questions").get(4).get("id").asText()),
                        "Clinical notes",
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
                        .content(objectMapper.writeValueAsBytes(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Question cannot be removed because it already has stored patient answers: Hair shedding severity"));
    }

    @Test
    void shouldActivateInactivateTemplateAndRejectNewSubmissionWhenInactive() throws Exception {
        JsonNode patient = createPatient("inactive-template");
        JsonNode template = createTemplate("Inactive Template");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        JsonNode inactiveTemplate = json(
                mockMvc.perform(patch("/api/anamnesis/templates/{id}/status", templateId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(Map.of("active", false))))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(inactiveTemplate.get("active").asBoolean()).isFalse();

        Map<String, Object> recordPayload = Map.of(
                "templateId", templateId,
                "answers", List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "High"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true)
                )
        );

        mockMvc.perform(post("/api/patients/{patientId}/anamnesis-records", patientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(recordPayload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Inactive templates cannot be used for new anamnesis submissions"));

        JsonNode activeTemplate = json(
                mockMvc.perform(patch("/api/anamnesis/templates/{id}/status", templateId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(Map.of("active", true))))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(activeTemplate.get("active").asBoolean()).isTrue();
    }
}
