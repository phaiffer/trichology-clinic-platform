package com.phaiffer.clinic.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.phaiffer.clinic.modules.auth.domain.model.RoleNames;
import com.phaiffer.clinic.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Test
    void shouldLoginAndExposeCurrentAuthenticatedUser() throws Exception {
        createUser("clinician@example.com", "Secret123!", "Dr. Clinician", RoleNames.CLINICIAN);

        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "email", "clinician@example.com",
                                "password", "Secret123!"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("clinician@example.com"))
                .andExpect(jsonPath("$.roles[0]").value(RoleNames.CLINICIAN))
                .andReturn()
                .getRequest()
                .getSession(false);

        JsonNode currentUser = json(
                mockMvc.perform(get("/api/auth/me").session(session))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(currentUser.get("fullName").asText()).isEqualTo("Dr. Clinician");
        assertThat(currentUser.get("roles").size()).isEqualTo(1);
    }

    @Test
    void shouldRejectInvalidLogin() throws Exception {
        createUser("staff@example.com", "Secret123!", "Clinic Staff", RoleNames.STAFF);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "email", "staff@example.com",
                                "password", "wrong-password"
                        ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void shouldRejectUnauthenticatedAccessToProtectedEndpoints() throws Exception {
        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication is required"));
    }

    @Test
    void shouldAllowAuthenticatedAccessToProtectedEndpoint() throws Exception {
        createUser("admin@example.com", "Secret123!", "System Admin", RoleNames.ADMIN);

        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "email", "admin@example.com",
                                "password", "Secret123!"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getRequest()
                .getSession(false);

        mockMvc.perform(get("/api/patients").session(session))
                .andExpect(status().isOk());
    }

    @Test
    void shouldRejectForbiddenRouteForStaffRole() throws Exception {
        createUser("staff@example.com", "Secret123!", "Clinic Staff", RoleNames.STAFF);

        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "email", "staff@example.com",
                                "password", "Secret123!"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getRequest()
                .getSession(false);

        mockMvc.perform(post("/api/anamnesis/templates")
                        .session(session)
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "name", "Restricted template",
                                "description", "forbidden",
                                "active", true,
                                "questions", List.of()
                        ))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access is denied"));
    }

    @Test
    void shouldLogoutAndInvalidateSession() throws Exception {
        createUser("admin@example.com", "Secret123!", "System Admin", RoleNames.ADMIN);

        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(Map.of(
                                "email", "admin@example.com",
                                "password", "Secret123!"
                        ))))
                .andExpect(status().isOk())
                .andReturn()
                .getRequest()
                .getSession(false);

        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Authentication is required"));
    }
}
