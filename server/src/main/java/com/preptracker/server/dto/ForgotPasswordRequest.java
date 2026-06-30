package com.preptracker.server.dto;

// Request body for POST /api/auth/forgot-password (step 1 of the reset flow).
// AuthService will invalidate any existing OTPs for this user and send a new one.

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;
}
