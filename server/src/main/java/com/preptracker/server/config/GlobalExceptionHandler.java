package com.preptracker.server.config;

// Central place where all exceptions thrown by controllers get converted into proper
// HTTP responses. This keeps controllers clean — they just throw, and this class
// decides what status code and message the client receives.
// To handle a new exception type, simply add a new @ExceptionHandler method here.

import com.preptracker.server.exception.ConflictException;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Catches exceptions thrown anywhere in the controller layer and converts them
// to proper HTTP responses. Add a new @ExceptionHandler here to handle any new
// custom exception type without touching individual controllers.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<String> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<String> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(401).body(ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<String> handleConflict(ConflictException ex) {
        return ResponseEntity.status(409).body(ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(400).body(ex.getMessage());
    }
}
