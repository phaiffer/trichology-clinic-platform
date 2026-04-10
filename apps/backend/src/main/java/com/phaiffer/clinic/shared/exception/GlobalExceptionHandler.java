package com.phaiffer.clinic.shared.exception;

import com.phaiffer.clinic.shared.api.ApiError;
import com.phaiffer.clinic.shared.exception.media.StorageOperationException;
import com.phaiffer.clinic.shared.exception.report.ReportStorageException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ResourceConflictException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(buildError(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(buildError(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        List<String> details = exception.getBindingResult()
                .getAllErrors()
                .stream()
                .map(error -> error instanceof FieldError fieldError
                        ? fieldError.getField() + ": " + fieldError.getDefaultMessage()
                        : error.getDefaultMessage())
                .toList();

        return ResponseEntity.badRequest().body(buildError(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                request.getRequestURI(),
                details
        ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException exception, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(buildError(
                HttpStatus.BAD_REQUEST,
                "Constraint violation",
                request.getRequestURI(),
                exception.getConstraintViolations().stream().map(v -> v.getPropertyPath() + ": " + v.getMessage()).toList()
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(buildError(
                HttpStatus.CONFLICT,
                "Data integrity violation",
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException exception, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(buildError(
                HttpStatus.BAD_REQUEST,
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxUploadSize(MaxUploadSizeExceededException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(buildError(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Uploaded file exceeds the configured multipart size limit",
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(StorageOperationException.class)
    public ResponseEntity<ApiError> handleStorageOperation(StorageOperationException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(ReportStorageException.class)
    public ResponseEntity<ApiError> handleReportStorage(ReportStorageException exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                exception.getMessage(),
                request.getRequestURI(),
                List.of()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected internal error",
                request.getRequestURI(),
                List.of()
        ));
    }

    private ApiError buildError(HttpStatus status, String message, String path, List<String> details) {
        return new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                details
        );
    }
}
