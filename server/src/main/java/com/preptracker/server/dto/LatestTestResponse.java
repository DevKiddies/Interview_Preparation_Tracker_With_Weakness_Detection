package com.preptracker.server.dto;

// Response body for GET /api/tests/latest — the authenticated user's most
// recent mock test attempt, used to show real "last result" data instead of
// a placeholder (e.g. the landing page hero's "Test Passed" card).

public record LatestTestResponse(int score, int total, double accuracy, String category) {
}
