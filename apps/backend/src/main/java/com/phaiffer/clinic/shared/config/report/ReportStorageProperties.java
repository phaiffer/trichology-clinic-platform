package com.phaiffer.clinic.shared.config.report;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.report")
public class ReportStorageProperties {

    private String storageRoot = "./storage/reports";
    private String clinicTitle = "Phaiffer Tech Trichology Clinic";

    public String getStorageRoot() {
        return storageRoot;
    }

    public void setStorageRoot(String storageRoot) {
        this.storageRoot = storageRoot;
    }

    public String getClinicTitle() {
        return clinicTitle;
    }

    public void setClinicTitle(String clinicTitle) {
        this.clinicTitle = clinicTitle;
    }
}
