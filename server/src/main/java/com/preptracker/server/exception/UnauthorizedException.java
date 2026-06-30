package com.preptracker.server.exception;

// Thrown for authentication or authorization failures.
// Example: wrong password, unverified email, expired OTP, or replayed OTP.
// GlobalExceptionHandler maps this to HTTP 401 Unauthorized.
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
