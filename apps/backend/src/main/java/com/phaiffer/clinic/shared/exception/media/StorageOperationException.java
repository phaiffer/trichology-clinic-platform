package com.phaiffer.clinic.shared.exception.media;

public class StorageOperationException extends RuntimeException {

    public StorageOperationException(String message) {
        super(message);
    }

    public StorageOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
