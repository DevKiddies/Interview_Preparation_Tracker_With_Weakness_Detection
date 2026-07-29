package com.preptracker.server.dto;

// Row shape for GET /api/admin/users/banned — matches the AdminBannedUsers page.
// reportCount is hardcoded to 0 for now: there is no user-report/abuse-flagging
// feature in the app yet, so this is a placeholder until that's built.

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminBannedUserDTO(
        UUID id,
        String name,
        String email,
        String banReason,
        String banType, // "permanent" | "temporary"
        LocalDateTime bannedOn,
        String bannedBy,
        LocalDateTime expiresOn, // null when permanent
        Integer daysRemaining,   // null when permanent
        int previousBans,
        int testsAttempted,
        int avgScore,
        int reportCount
) {}
