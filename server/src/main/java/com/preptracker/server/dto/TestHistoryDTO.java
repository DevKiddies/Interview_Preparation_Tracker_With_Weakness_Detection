package com.preptracker.server.dto;

// Row shape for GET /api/tests/history — one entry per persisted TestAttempt
// for the current user. Mirrors the fields the mock-test-history UI renders
// (MockTestCard). Confidence and weak topics are derived from the attempt's
// user_attempts detail rows; title/type come from the persisted attempt.

import java.time.LocalDateTime;
import java.util.List;

public record TestHistoryDTO(
        Long id,
        String title,
        String type,          // MOCK | TOPIC
        LocalDateTime startedAt,
        LocalDateTime completedAt,  // submission/abandon time
        String status,        // COMPLETED | ABANDONED | ABORTED (from completionStatus)
        int questionCount,
        int duration,         // minutes
        int score,
        double accuracy,
        Integer confidence,   // avg of answered confidence scores, null if none
        List<String> weakTopics
) {}
