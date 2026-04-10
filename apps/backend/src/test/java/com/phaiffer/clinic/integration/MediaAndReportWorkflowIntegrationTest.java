package com.phaiffer.clinic.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.phaiffer.clinic.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MediaAndReportWorkflowIntegrationTest extends AbstractIntegrationTest {

    @Test
    void shouldUploadListRetrieveAndDeletePatientPhotoWithFileCleanup() throws Exception {
        JsonNode patient = createPatient("media-workflow");
        UUID patientId = uuid(patient, "id");

        JsonNode uploadedPhoto = uploadPhoto(patientId, "baseline-photo.png", "image/png");
        UUID photoId = uuid(uploadedPhoto, "id");

        assertThat(uploadedPhoto.get("originalFileName").asText()).isEqualTo("baseline-photo.png");
        assertThat(uploadedPhoto.get("contentType").asText()).isEqualTo("image/png");
        assertThat(fileExists(PHOTO_STORAGE_ROOT, uploadedPhoto.get("fileName").asText())).isTrue();

        JsonNode photoList = json(
                mockMvc.perform(get("/api/patients/{patientId}/photos", patientId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(photoList.size()).isEqualTo(1);
        assertThat(photoList.get(0).get("id").asText()).isEqualTo(photoId.toString());

        JsonNode fetchedPhoto = json(
                mockMvc.perform(get("/api/patients/{patientId}/photos/{photoId}", patientId, photoId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(fetchedPhoto.get("notes").asText()).isEqualTo("Baseline capture");

        mockMvc.perform(delete("/api/patients/{patientId}/photos/{photoId}", patientId, photoId))
                .andExpect(status().isNoContent());

        assertThat(fileExists(PHOTO_STORAGE_ROOT, uploadedPhoto.get("fileName").asText())).isFalse();

        mockMvc.perform(get("/api/patients/{patientId}/photos/{photoId}", patientId, photoId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient photo not found: " + photoId));
    }

    @Test
    void shouldRejectInvalidFileTypeAndCrossPatientPhotoAccess() throws Exception {
        JsonNode patient = createPatient("media-invalid-type");
        JsonNode otherPatient = createPatient("media-other-owner");
        UUID patientId = uuid(patient, "id");
        UUID otherPatientId = uuid(otherPatient, "id");

        MockMultipartFile invalidFile = new MockMultipartFile(
                "files",
                "notes.txt",
                "text/plain",
                "plain text".getBytes()
        );

        mockMvc.perform(multipart("/api/patients/{patientId}/photos", patientId)
                        .file(invalidFile)
                        .param("category", "BEFORE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported file type: text/plain"));

        JsonNode photo = uploadPhoto(patientId, "cross-owner.png", "image/png");

        mockMvc.perform(get("/api/patients/{patientId}/photos/{photoId}", otherPatientId, uuid(photo, "id")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient photo not found: " + photo.get("id").asText()));
    }

    @Test
    void shouldGenerateRetrieveAndDeleteReportWithFileCleanup() throws Exception {
        JsonNode patient = createPatient("report-workflow");
        JsonNode template = createTemplate("Report Template");
        UUID patientId = uuid(patient, "id");
        UUID templateId = uuid(template, "id");

        JsonNode record = createRecord(
                patientId,
                templateId,
                List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "High"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true),
                        answer(UUID.fromString(template.get("questions").get(2).get("id").asText()), List.of("Frontal")),
                        answer(UUID.fromString(template.get("questions").get(3).get("id").asText()), 5)
                )
        );
        JsonNode score = calculateScore(patientId, uuid(record, "id"));
        JsonNode photo = uploadPhoto(patientId, "report-photo.png", "image/png");

        JsonNode report = createReport(
                patientId,
                uuid(record, "id"),
                uuid(score, "id"),
                List.of(uuid(photo, "id")),
                "Clinical Evaluation Report"
        );
        UUID reportId = uuid(report, "id");

        assertThat(report.get("anamnesisRecordId").asText()).isEqualTo(record.get("id").asText());
        assertThat(report.get("scoreResultId").asText()).isEqualTo(score.get("id").asText());
        assertThat(report.get("selectedPhotosCount").asInt()).isEqualTo(1);
        assertThat(fileExists(REPORT_STORAGE_ROOT, report.get("fileName").asText())).isTrue();

        JsonNode reportList = json(
                mockMvc.perform(get("/api/patients/{patientId}/reports", patientId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(reportList.size()).isEqualTo(1);
        assertThat(reportList.get(0).get("id").asText()).isEqualTo(reportId.toString());

        JsonNode fetchedReport = json(
                mockMvc.perform(get("/api/patients/{patientId}/reports/{reportId}", patientId, reportId))
                        .andExpect(status().isOk())
                        .andReturn()
        );

        assertThat(fetchedReport.get("title").asText()).isEqualTo("Clinical Evaluation Report");
        assertThat(fetchedReport.get("selectedPhotos").size()).isEqualTo(1);

        mockMvc.perform(get("/api/patients/{patientId}/reports/{reportId}/file", patientId, reportId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        mockMvc.perform(delete("/api/patients/{patientId}/reports/{reportId}", patientId, reportId))
                .andExpect(status().isNoContent());

        assertThat(fileExists(REPORT_STORAGE_ROOT, report.get("fileName").asText())).isFalse();

        mockMvc.perform(get("/api/patients/{patientId}/reports/{reportId}", patientId, reportId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Report not found: " + reportId));
    }

    @Test
    void shouldValidateSelectedAnamnesisScoreAndPhotoOwnershipForReports() throws Exception {
        JsonNode firstPatient = createPatient("report-owner");
        JsonNode secondPatient = createPatient("report-other-owner");
        JsonNode template = createTemplate("Report Ownership Template");

        UUID firstPatientId = uuid(firstPatient, "id");
        UUID secondPatientId = uuid(secondPatient, "id");
        UUID templateId = uuid(template, "id");

        JsonNode firstRecord = createRecord(
                firstPatientId,
                templateId,
                List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "High"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), true)
                )
        );
        JsonNode firstScore = calculateScore(firstPatientId, uuid(firstRecord, "id"));
        JsonNode firstPhoto = uploadPhoto(firstPatientId, "first-owner.png", "image/png");

        JsonNode secondRecord = createRecord(
                secondPatientId,
                templateId,
                List.of(
                        answer(UUID.fromString(template.get("questions").get(0).get("id").asText()), "Low"),
                        answer(UUID.fromString(template.get("questions").get(1).get("id").asText()), false)
                )
        );
        JsonNode secondScore = calculateScore(secondPatientId, uuid(secondRecord, "id"));
        JsonNode secondPhoto = uploadPhoto(secondPatientId, "second-owner.png", "image/png");

        mockMvc.perform(post("/api/patients/{patientId}/reports", firstPatientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(
                                java.util.Map.of(
                                        "anamnesisRecordId", uuid(secondRecord, "id"),
                                        "title", "Wrong anamnesis owner",
                                        "summary", "summary",
                                        "reportType", "CLINICAL_EVALUATION"
                                )
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Patient anamnesis record not found: " + secondRecord.get("id").asText()));

        mockMvc.perform(post("/api/patients/{patientId}/reports", firstPatientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(
                                java.util.Map.of(
                                        "scoreResultId", uuid(secondScore, "id"),
                                        "title", "Wrong score owner",
                                        "summary", "summary",
                                        "reportType", "CLINICAL_EVALUATION"
                                )
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Score result not found: " + secondScore.get("id").asText()));

        mockMvc.perform(post("/api/patients/{patientId}/reports", firstPatientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(
                                java.util.Map.of(
                                        "selectedPhotoIds", List.of(uuid(secondPhoto, "id")),
                                        "title", "Wrong photo owner",
                                        "summary", "summary",
                                        "reportType", "CLINICAL_EVALUATION"
                                )
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("One or more selected patient photos were not found"));

        mockMvc.perform(post("/api/patients/{patientId}/reports", firstPatientId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(
                                java.util.Map.of(
                                        "anamnesisRecordId", uuid(firstRecord, "id"),
                                        "scoreResultId", uuid(secondScore, "id"),
                                        "selectedPhotoIds", List.of(uuid(firstPhoto, "id")),
                                        "title", "Mismatched score owner",
                                        "summary", "summary",
                                        "reportType", "CLINICAL_EVALUATION"
                                )
                        )))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Score result not found: " + secondScore.get("id").asText()));
    }
}
