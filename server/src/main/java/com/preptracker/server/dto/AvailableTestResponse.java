package com.preptracker.server.dto;

// Response body for GET /api/tests/available — admin-created mock tests
// (Test Management > Create Mock Test) that are live for regular users to take.
// categoryName/topicNames are resolved server-side so the frontend can pass them
// straight through to /api/questions?category=...&topic=..., the same filter
// params the existing topic-practice flow already uses.

import java.util.List;

public record AvailableTestResponse(
        Long id,
        String name,
        String description,
        String categoryName,
        List<String> topicNames,
        int questionCount,
        int timeLimitMinutes,
        String difficulty
) {
}
