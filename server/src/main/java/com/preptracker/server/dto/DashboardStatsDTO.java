package com.preptracker.server.dto;

// Aggregate stats backing the four dashboard stat cards.
// confidence/accuracy are 0-100, deltas are this-week minus previous-week
// (null when there is no prior data to compare against).
// readinessScope is the scope the readiness number was computed against:
// "OVERALL" (every topic in the syllabus) when there is no active interview,
// or "INTERVIEW" (only the active interview's focus topics) when there is one.

public record DashboardStatsDTO(
        Integer overallConfidence,
        Integer overallAccuracy,
        int testsAttempted,
        int questionsSolved,
        int studyStreak,
        Integer confidenceDelta,
        Integer accuracyDelta,
        int solvedThisWeek,
        String readinessScope
) {}
