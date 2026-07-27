package com.preptracker.server.dto;

// Request body for PUT /api/users/{id}/interview-date.
// Date must be provided in YYYY-MM-DD format and is stored as a String in UserProfile.

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInterviewDateRequest {

    @NotBlank(message = "Interview date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Date must be in YYYY-MM-DD format")
    private String interviewDate;
}
