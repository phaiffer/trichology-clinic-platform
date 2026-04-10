package com.phaiffer.clinic.shared.exception;

public class InvalidAuthenticationException extends RuntimeException {

    public InvalidAuthenticationException(String message) {
        super(message);
    }
}
