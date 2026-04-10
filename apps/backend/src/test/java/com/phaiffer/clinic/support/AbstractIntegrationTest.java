package com.phaiffer.clinic.support;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    private static final EmbeddedPostgres EMBEDDED_POSTGRES = startEmbeddedPostgres();
    private static final Path TEST_ROOT_DIRECTORY = createTempDirectory("trichology-clinic-integration-tests");
    protected static final Path PHOTO_STORAGE_ROOT = TEST_ROOT_DIRECTORY.resolve("patient-photos");
    protected static final Path REPORT_STORAGE_ROOT = TEST_ROOT_DIRECTORY.resolve("reports");
    private static final byte[] TINY_PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0S8AAAAASUVORK5CYII="
    );

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> jdbcUrl("postgres"));
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "postgres");
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("app.media.patient-photo-storage-root", () -> PHOTO_STORAGE_ROOT.toString());
        registry.add("app.report.storage-root", () -> REPORT_STORAGE_ROOT.toString());
    }

    @BeforeEach
    void ensureStorageRootsExist() throws IOException {
        Files.createDirectories(PHOTO_STORAGE_ROOT);
        Files.createDirectories(REPORT_STORAGE_ROOT);
    }

    @AfterEach
    void cleanState() throws IOException {
        jdbcTemplate.execute("""
                TRUNCATE TABLE
                    report_selected_photo_ids,
                    reports,
                    patient_photos,
                    score_result_items,
                    score_results,
                    clinical_evaluations,
                    anamnesis_answers,
                    anamnesis_records,
                    anamnesis_question_option_scores,
                    anamnesis_question_options,
                    anamnesis_questions,
                    anamnesis_templates,
                    patients,
                    user_roles,
                    users,
                    roles
                RESTART IDENTITY CASCADE
                """);
        clearDirectory(PHOTO_STORAGE_ROOT);
        clearDirectory(REPORT_STORAGE_ROOT);
    }

    protected JsonNode createPatient(String emailSuffix) throws Exception {
        return json(
                mockMvc.perform(post("/api/patients")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(defaultPatientRequest(emailSuffix))))
                        .andExpect(status().isCreated())
                        .andReturn()
        );
    }

    protected Map<String, Object> defaultPatientRequest(String emailSuffix) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("firstName", "Alice");
        payload.put("lastName", "Silva");
        payload.put("email", "alice." + emailSuffix + "@example.com");
        payload.put("phone", "+55 11 99999-0000");
        payload.put("birthDate", "1990-04-12");
        payload.put("gender", "FEMALE");
        payload.put("notes", "Initial registration");
        payload.put("consentAccepted", true);
        payload.put("active", true);
        return payload;
    }

    protected JsonNode createTemplate(String name) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", name);
        payload.put("description", "Template for integration coverage");
        payload.put("active", true);
        payload.put("questions", List.of(
                question("Hair shedding severity", "SINGLE_CHOICE", true, 1, 1.5, List.of("Low", "High"), Map.of("Low", 1.0, "High", 4.0)),
                question("Itching episodes", "BOOLEAN", true, 2, 2.0, null, null),
                question("Affected regions", "MULTIPLE_CHOICE", false, 3, 1.0, List.of("Frontal", "Crown"), Map.of("Frontal", 2.0, "Crown", 3.0)),
                question("Daily hair loss count", "NUMBER", false, 4, 0.5, null, null),
                question("Clinical notes", "TEXTAREA", false, 5, null, null, null)
        ));

        return json(
                mockMvc.perform(post("/api/anamnesis/templates")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(payload)))
                        .andExpect(status().isCreated())
                        .andReturn()
        );
    }

    protected JsonNode createRecord(UUID patientId, UUID templateId, List<Map<String, Object>> answers) throws Exception {
        Map<String, Object> payload = Map.of(
                "templateId", templateId,
                "answers", answers
        );

        return json(
                mockMvc.perform(post("/api/patients/{patientId}/anamnesis-records", patientId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(payload)))
                        .andExpect(status().isCreated())
                        .andReturn()
        );
    }

    protected JsonNode calculateScore(UUID patientId, UUID recordId) throws Exception {
        return json(
                mockMvc.perform(post("/api/patients/{patientId}/anamnesis-records/{recordId}/scores", patientId, recordId))
                        .andExpect(status().isCreated())
                        .andReturn()
        );
    }

    protected JsonNode uploadPhoto(UUID patientId, String originalFileName, String contentType) throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", originalFileName, contentType, TINY_PNG);

        return json(
                mockMvc.perform(multipart("/api/patients/{patientId}/photos", patientId)
                                .file(file)
                                .param("category", "BEFORE")
                                .param("captureDate", "2026-04-10")
                                .param("notes", "Baseline capture"))
                        .andExpect(status().isCreated())
                        .andReturn()
        ).get(0);
    }

    protected JsonNode createReport(
            UUID patientId,
            UUID anamnesisRecordId,
            UUID scoreResultId,
            List<UUID> selectedPhotoIds,
            String title
    ) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("anamnesisRecordId", anamnesisRecordId);
        payload.put("scoreResultId", scoreResultId);
        payload.put("selectedPhotoIds", selectedPhotoIds);
        payload.put("title", title);
        payload.put("summary", "Clinical summary");
        payload.put("reportType", "CLINICAL_EVALUATION");

        return json(
                mockMvc.perform(post("/api/patients/{patientId}/reports", patientId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsBytes(payload)))
                        .andExpect(status().isCreated())
                        .andReturn()
        );
    }

    protected Map<String, Object> answer(UUID questionId, Object value) {
        return Map.of("questionId", questionId, "value", value);
    }

    protected Map<String, Object> templateQuestionUpdate(
            UUID id,
            String label,
            String type,
            boolean required,
            int displayOrder,
            Double scoringWeight,
            List<String> options,
            Map<String, Double> optionScores
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", id);
        payload.put("label", label);
        payload.put("helperText", "Helper for " + label);
        payload.put("type", type);
        payload.put("required", required);
        payload.put("displayOrder", displayOrder);
        payload.put("scoringWeight", scoringWeight);
        payload.put("options", options == null ? List.of() : options);
        payload.put("optionScores", optionScores == null ? Map.of() : optionScores);
        return payload;
    }

    protected Map<String, Object> templateNewQuestion(
            String label,
            String type,
            boolean required,
            int displayOrder,
            Double scoringWeight,
            List<String> options,
            Map<String, Double> optionScores
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("label", label);
        payload.put("helperText", "Helper for " + label);
        payload.put("type", type);
        payload.put("required", required);
        payload.put("displayOrder", displayOrder);
        payload.put("scoringWeight", scoringWeight);
        payload.put("options", options == null ? List.of() : options);
        payload.put("optionScores", optionScores == null ? Map.of() : optionScores);
        return payload;
    }

    protected UUID uuid(JsonNode node, String field) {
        return UUID.fromString(node.get(field).asText());
    }

    protected JsonNode json(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }

    protected boolean fileExists(Path rootDirectory, String fileName) throws IOException {
        try (Stream<Path> pathStream = Files.walk(rootDirectory)) {
            return pathStream.anyMatch(path -> Files.isRegularFile(path) && path.getFileName().toString().equals(fileName));
        }
    }

    private Map<String, Object> question(
            String label,
            String type,
            boolean required,
            int displayOrder,
            Double scoringWeight,
            List<String> options,
            Map<String, Double> optionScores
    ) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("label", label);
        payload.put("helperText", "Helper for " + label);
        payload.put("type", type);
        payload.put("required", required);
        payload.put("displayOrder", displayOrder);
        payload.put("scoringWeight", scoringWeight);
        payload.put("options", options);
        payload.put("optionScores", optionScores);
        return payload;
    }

    private static EmbeddedPostgres startEmbeddedPostgres() {
        try {
            return EmbeddedPostgres.builder().start();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to start embedded PostgreSQL for integration tests", exception);
        }
    }

    private static String jdbcUrl(String databaseName) {
        return EMBEDDED_POSTGRES.getJdbcUrl("postgres", databaseName);
    }

    private static Path createTempDirectory(String prefix) {
        try {
            return Files.createTempDirectory(prefix);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to create test temp directory", exception);
        }
    }

    private static void clearDirectory(Path directory) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }

        try (Stream<Path> pathStream = Files.walk(directory)) {
            pathStream.sorted((left, right) -> right.compareTo(left))
                    .filter(path -> !path.equals(directory))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException exception) {
                            throw new IllegalStateException("Unable to clean test directory", exception);
                        }
                    });
        }
    }
}
