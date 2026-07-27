package com.preptracker.server.exception;

// Thrown when a requested resource doesn't exist in the database.
// Example: looking up a user by an ID or email that has no record.
// GlobalExceptionHandler maps this to HTTP 404 Not Found.
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
