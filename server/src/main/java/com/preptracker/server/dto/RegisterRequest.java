package com.preptracker.server.dto;

// Request body for POST /api/auth/register.
// Validation is enforced here via Jakarta annotations — password must meet
// the strength requirement (8+ chars, upper, lower, digit, special character).
// The service layer additionally checks that password and confirmPassword match.

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 to 20 characters")
    private String username;

    @NotBlank(message="Email is required")
    @Email(message = "Invalid Email Format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*]).{8,}$",
            message = "Password must be 8 characters long, include uppercase, lowercase, number and special character"
    )
    private String password;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;

}
