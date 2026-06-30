package com.preptracker.server.dto;

// Read-only view of a Question sent to the frontend during a test session.
// Intentionally omits the correctAnswer field so the answer is never exposed
// in the API response — grading happens server-side on submission.

import java.util.List;

public record QuestionDTO(
        Long id,
        String text,
        List<String> options,
        String category,
        String difficulty,
        String topic
) {}
