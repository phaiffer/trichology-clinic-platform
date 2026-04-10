package com.phaiffer.clinic.shared.config.media;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.media")
public class MediaStorageProperties {

    private String patientPhotoStorageRoot = "./storage/patient-photos";
    private long maxFileSizeBytes = 5 * 1024 * 1024;
    private List<String> allowedContentTypes = new ArrayList<>(List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    ));

    public String getPatientPhotoStorageRoot() {
        return patientPhotoStorageRoot;
    }

    public void setPatientPhotoStorageRoot(String patientPhotoStorageRoot) {
        this.patientPhotoStorageRoot = patientPhotoStorageRoot;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    public void setMaxFileSizeBytes(long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public List<String> getAllowedContentTypes() {
        return allowedContentTypes;
    }

    public void setAllowedContentTypes(List<String> allowedContentTypes) {
        this.allowedContentTypes = allowedContentTypes;
    }
}
