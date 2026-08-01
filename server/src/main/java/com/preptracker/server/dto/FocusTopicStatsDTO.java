package com.preptracker.server.dto;

// Aggregate response for GET /api/users/me/focus-topics/stats.
// topics holds one row per focus topic (computed from real user_attempts data),
// avgAccuracy / avgConfidence are overall averages across focus topics that
// have data, and streak is the number of consecutive days with at least one
// test attempt ending today (or yesterday).
public record FocusTopicStatsDTO(
        java.util.List<FocusTopicStatDTO> topics,
        Integer avgAccuracy,
        Integer avgConfidence,
        int streak
) {}
