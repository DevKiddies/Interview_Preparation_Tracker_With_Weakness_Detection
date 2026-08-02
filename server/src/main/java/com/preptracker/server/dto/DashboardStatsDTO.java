package com.preptracker.server.dto;

// Aggregate stats backing the four dashboard stat cards.
// confidence/accuracy are 0-100, deltas are this-week minus previous-week
// (null when there is no prior data to compare against).

public record DashboardStatsDTO(
        Integer overallConfidence,
        Integer overallAccuracy,
        int questionsSolved,
        int studyStreak,
        Integer confidenceDelta,
        Integer accuracyDelta,
        int solvedThisWeek
) {
}
