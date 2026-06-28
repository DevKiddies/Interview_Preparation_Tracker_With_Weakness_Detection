package com.preptracker.server.dto;

// Request body for POST /api/auth/verify-otp.
// Used after registration to confirm the user's email. On success, the account
// is marked verified and a JWT is returned so the user is logged in immediately.

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class VerifyOtpRequest {
    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Email is required")
    private String email;
}
