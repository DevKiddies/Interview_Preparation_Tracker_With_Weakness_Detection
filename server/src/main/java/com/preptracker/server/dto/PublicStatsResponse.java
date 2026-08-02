package com.preptracker.server.dto;

// Response body for GET /api/public/stats — the landing page hero's live counters.

public record PublicStatsResponse(long totalUsers, long totalQuestions) {
}
