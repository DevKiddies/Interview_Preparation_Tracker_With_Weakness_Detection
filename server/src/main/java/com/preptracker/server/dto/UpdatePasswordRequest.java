package com.preptracker.server.dto;

// Request body for PUT /api/users/{id}/password.
// Requires the current password (oldPassword) to confirm identity before changing.
// Not available for OAuth-only accounts — they have no local password stored.

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePasswordRequest {

    @NotBlank(message = "Old password is required")
    private String oldPassword;

    @NotBlank(message = "New password is required")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*]).{8,}$",
        message = "Password must be 8+ chars with uppercase, lowercase, number and special character"
    )
    private String newPassword;
}