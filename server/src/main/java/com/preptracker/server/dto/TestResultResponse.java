package com.preptracker.server.dto;

// Response returned after a test is submitted to POST /api/tests/submit.
// Contains the overall score, accuracy, time taken, and two levels of detail:
//   - results: per-question feedback (what the user answered vs. what was correct)
//   - categoryBreakdown: how many questions the user got right per category (e.g. "Arrays": 3/5)
// Used by the frontend to render the results page and identify weak areas.

import java.util.List;
import java.util.Map;

public record TestResultResponse(
        int score,
        int total,
        int timeTaken,
        double accuracy,
        List<QuestionResult> results,
        Map<String, CategoryStats> categoryBreakdown
) {
    public record QuestionResult(
            long id,
            String text,
            List<String> options,
            String yourAnswer,
            String correctAnswer,
            boolean correct,
            String category,
            String difficulty
    ) {}

    public record CategoryStats(int correct, int total) {}
}
