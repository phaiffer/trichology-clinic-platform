package com.phaiffer.clinic.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.phaiffer.clinic.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PatientWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Test
    void shouldCreateSearchGetUpdateAndDeletePatient() throws Exception {
        JsonNode createdPatient = createPatient("patient-workflow");
        UUID patientId = uuid(createdPatient, "id");

        assertThat(createdPatient.get("email").asText()).isEqualTo("alice.patient-workflow@example.com");
        assertThat(createdPatient.get("active").asBoolean()).isTrue();

        JsonNode patientList = json(
                mockMvc.perform(get("/api/patients")
                                .queryParam("search", "Alice")
                                .queryParam("page", "0")
                                .queryParam("size", "10"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.totalElements").value(1))
                        .andReturn()
        );

        assertThat(patientList.get("content").size()).isEqualTo(1);
        assertThat(patientList.get("content").get(0).get("id").asText()).isEqualTo(patientId.toString());

        JsonNode fetchedPatient = json(
                mockMvc.perform(get("/api/patients/{id}", patientId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(fetchedPatient.get("firstName").asText()).isEqualTo("Alice");

        Map<String, Object> updatePayload = defaultPatientRequest("patient-workflow");
        updatePayload.put("firstName", "Alicia");
        updatePayload.put("phone", "+55 11 98888-7777");
        updatePayload.put("notes", "Updated patient notes");
        updatePayload.put("active", false);

        JsonNode updatedPatient = json(
                mockMvc.perform(put("/api/patients/{id}", patientId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(updatePayload)))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(updatedPatient.get("firstName").asText()).isEqualTo("Alicia");
        assertThat(updatedPatient.get("phone").asText()).isEqualTo("+55 11 98888-7777");
        assertThat(updatedPatient.get("active").asBoolean()).isFalse();

        mockMvc.perform(delete("/api/patients/{id}", patientId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/patients/{id}", patientId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient not found: " + patientId));

        JsonNode emptyList = json(
                mockMvc.perform(get("/api/patients").queryParam("search", "Alicia"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.totalElements").value(0))
                        .andReturn()
        );

        assertThat(emptyList.get("content").size()).isZero();
    }

    @Test
    void shouldRejectDuplicateEmailIgnoringCase() throws Exception {
        createPatient("duplicate-email");

        Map<String, Object> duplicatePayload = defaultPatientRequest("another");
        duplicatePayload.put("email", "ALICE.DUPLICATE-EMAIL@example.com");

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(duplicatePayload)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Patient email is already registered: alice.duplicate-email@example.com"));
    }
}
