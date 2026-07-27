package com.preptracker.server.dto;

// Request body for POST /api/tests/submit.
// questionIds preserves the order the user saw questions in (DB fetch order may differ).
// answers maps questionId -> the full option text the user selected (e.g. "O(1)", not "A"/"B")
// so result comparison works without re-fetching questions. timeTaken is in seconds.

import java.util.List;
import java.util.Map;

public record TestSubmissionRequest(
        String topic,
        int timeTaken,
        List<Long> questionIds,
        // maps questionId -> the full option text the user selected (e.g. "O(1)", not "A"/"B")
        // so result comparison works without needing to re-fetch questions
        Map<Long, String> answers
) {}
