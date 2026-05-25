package com.preptracker.server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUsernameRequest {

    @NotBlank(message = "New username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 to 20 characters")
    private String newUsername;
}