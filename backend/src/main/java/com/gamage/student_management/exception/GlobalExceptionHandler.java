package com.gamage.student_management.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400: @Valid failures (blank fields, bad email, short password, ...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> {
            String field = "dateOfBirthValid".equals(e.getField()) ? "dateOfBirth" : e.getField();
            fieldErrors.putIfAbsent(field, e.getDefaultMessage());
        });
        ex.getBindingResult().getGlobalErrors().forEach(e ->
                fieldErrors.putIfAbsent(e.getObjectName(), e.getDefaultMessage()));

        String message = fieldErrors.isEmpty()
                ? "Validation failed"
                : fieldErrors.entrySet().stream()
                        .map(e -> e.getKey() + ": " + e.getValue())
                        .collect(Collectors.joining(", "));

        return build(HttpStatus.BAD_REQUEST, message, fieldErrors);
    }

    // 400: broken / unreadable JSON body
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Malformed or missing request body", null);
    }

    // 404 / 409 / 403 / 401 thrown by our services
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleStatus(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "Request failed";
        return build(ex.getStatusCode(), message, null);
    }

    // 409: database constraint violations (e.g. duplicate unique values)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIntegrity(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT, "This value conflicts with an existing record", null);
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatusCode status, String message,
                                                      Map<String, String> fieldErrors) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("message", message);
        if (fieldErrors != null && !fieldErrors.isEmpty()) {
            body.put("errors", fieldErrors);
        }
        return ResponseEntity.status(status).body(body);
    }
}