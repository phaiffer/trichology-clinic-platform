package com.phaiffer.clinic.modules.report.infrastructure.storage;

import org.springframework.core.io.Resource;

import java.util.UUID;

public interface ReportFileStorage {

    StoredReportFile store(UUID patientId, String requestedFileName, byte[] content);

    Resource loadAsResource(String storagePath);

    void delete(String storagePath);
}
