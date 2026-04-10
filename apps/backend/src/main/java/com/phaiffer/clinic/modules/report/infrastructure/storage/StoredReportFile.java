package com.phaiffer.clinic.modules.report.infrastructure.storage;

public record StoredReportFile(
        String fileName,
        String storagePath
) {
}
