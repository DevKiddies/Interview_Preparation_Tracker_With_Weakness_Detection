package com.preptracker.server.dto;

// Request body for POST /api/admin/users/{id}/ban.
// duration is one of "7", "14", "30" (days) or "permanent".

import jakarta.validation.constraints.NotBlank;

public record AdminBanUserRequest(
        @NotBlank String reason,
        @NotBlank String duration,
        String note
) {}
