package com.phaiffer.clinic.modules.media.presentation;

import com.phaiffer.clinic.modules.media.application.dto.PatientPhotoResponse;
import com.phaiffer.clinic.modules.media.application.usecase.PatientPhotoService;
import com.phaiffer.clinic.modules.media.domain.model.PhotoCategory;
import jakarta.validation.constraints.NotNull;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("/api/patients/{patientId}/photos")
public class PatientPhotoController {

    private final PatientPhotoService patientPhotoService;

    public PatientPhotoController(PatientPhotoService patientPhotoService) {
        this.patientPhotoService = patientPhotoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public List<PatientPhotoResponse> uploadPhotos(
            @PathVariable UUID patientId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(required = false) UUID anamnesisRecordId,
            @RequestParam @NotNull PhotoCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate captureDate,
            @RequestParam(required = false) String notes
    ) {
        return patientPhotoService.uploadPhotos(
                patientId,
                files,
                anamnesisRecordId,
                category,
                captureDate,
                notes
        );
    }

    @GetMapping
    public List<PatientPhotoResponse> listPhotos(
            @PathVariable UUID patientId,
            @RequestParam(required = false) PhotoCategory category
    ) {
        return patientPhotoService.listPhotos(patientId, category);
    }

    @GetMapping("/{photoId}")
    public PatientPhotoResponse getPhoto(
            @PathVariable UUID patientId,
            @PathVariable UUID photoId
    ) {
        return patientPhotoService.getPhoto(patientId, photoId);
    }

    @GetMapping("/{photoId}/file")
    public ResponseEntity<Resource> getPhotoFile(
            @PathVariable UUID patientId,
            @PathVariable UUID photoId
    ) {
        PatientPhotoResponse patientPhoto = patientPhotoService.getPhoto(patientId, photoId);
        Resource resource = patientPhotoService.getPhotoFile(patientId, photoId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(patientPhoto.contentType()))
                .contentLength(patientPhoto.fileSize())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(patientPhoto.originalFileName()).build().toString()
                )
                .body(resource);
    }

    @DeleteMapping("/{photoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhoto(
            @PathVariable UUID patientId,
            @PathVariable UUID photoId
    ) {
        patientPhotoService.deletePhoto(patientId, photoId);
    }
}
