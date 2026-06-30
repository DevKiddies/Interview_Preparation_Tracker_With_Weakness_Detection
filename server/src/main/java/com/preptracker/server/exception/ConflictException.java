package com.preptracker.server.exception;

// Thrown when a resource already exists and creating a duplicate would violate uniqueness.
// Example: registering with an email or username that's already taken.
// GlobalExceptionHandler maps this to HTTP 409 Conflict.
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
