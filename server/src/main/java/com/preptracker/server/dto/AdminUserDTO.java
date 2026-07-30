package com.preptracker.server.dto;

// Row shape for GET /api/admin/users — matches the fields the AdminAllUsers page
// (and its user-detail modal) renders. status is derived server-side from
// isBanned/lastActiveAt rather than stored directly.

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminUserDTO(
        UUID id,
        String name,
        String email,
        LocalDateTime joinDate,
        LocalDateTime lastActive,
        String status, // "active" | "inactive" | "banned"
        boolean verified,
        int testsAttempted,
        int avgScore,
        int streak,
        String targetCompany,
        String experience
) {}
