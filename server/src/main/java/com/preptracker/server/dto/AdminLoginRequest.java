package com.preptracker.server.dto;

// Request body for POST /api/admin/auth/login.
// identifier accepts email or username, same pattern as the regular user login.

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginRequest {

    @NotBlank(message = "Email or username is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
