package com.preptracker.server.dto;

// Row shape for GET /api/admin/results — one row per persisted TestAttempt,
// matching the AdminUserResults page. "topic" holds the attempt's dominant
// category name (there's no persisted named-test concept, so unlike the old
// mock data there is no fabricated test title here).

import java.time.LocalDateTime;
import java.util.UUID;

public record AdminTestResultDTO(
        Long id,
        UUID userId,
        String userName,
        String email,
        String topic,
        int score,     // accuracy %, rounded
        int correct,
        int total,
        int timeTaken,  // minutes
        LocalDateTime date,
        String status,  // "pass" | "fail"
        String completionStatus  // "COMPLETE" | "ABANDONED" | "ABORTED"
) {}
