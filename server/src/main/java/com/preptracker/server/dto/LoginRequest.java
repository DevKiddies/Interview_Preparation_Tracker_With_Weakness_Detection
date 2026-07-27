package com.preptracker.server.dto;

// Request body for POST /api/auth/login.
// identifier accepts either an email address or a username —
// AuthService checks which one was provided and looks up accordingly.

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    @NotBlank
    private String identifier;
    @NotBlank
    private String password;
}
