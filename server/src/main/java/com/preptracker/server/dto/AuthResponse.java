package com.preptracker.server.dto;

// Returned by login, OTP verification, OAuth login, and logout endpoints.
// On success, token holds a signed JWT the client should send as "Authorization: Bearer <token>".
// On logout, token holds a plain message string ("Logged Out Successfully") instead.

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
}
