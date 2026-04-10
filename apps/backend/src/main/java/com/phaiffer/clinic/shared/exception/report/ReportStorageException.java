package com.phaiffer.clinic.shared.exception.report;

public class ReportStorageException extends RuntimeException {

    public ReportStorageException(String message) {
        super(message);
    }

    public ReportStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
