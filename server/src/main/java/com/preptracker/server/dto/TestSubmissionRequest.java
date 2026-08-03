package com.preptracker.server.dto;

// Request body for POST /api/tests/submit.
// questionIds preserves the order the user saw questions in (DB fetch order may differ).
// answers maps questionId -> the full option text the user selected (e.g. "O(1)", not "A"/"B")
// so result comparison works without re-fetching questions. timeTaken is in seconds.
//
// Confidence/behavioral inputs (all keyed by questionId):
//   switchCounts   -> how many times the user changed their answer for that question
//   flaggedIds     -> questionIds the user flagged (marked for review)
//   questionTime   -> seconds the user spent on that specific question
// Controllers pass these straight through to ConfidenceService — no logic here.
//
// Maps are optional/null-safe: a request that omits them (e.g. old clients) is
// treated as switchCount=0, not-flagged, time=0.

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record TestSubmissionRequest(
        String category,
        String topic,
        String type,
        int timeTaken,
        List<Long> questionIds,
        Map<Long, String> answers,
        Map<Long, Integer> switchCounts,
        List<Long> flaggedIds,
        Map<Long, Integer> questionTime,
        // Optional: the test session id returned by POST /api/tests/start/{testId}.
        // When present, the server marks that session completed on submission.
        UUID sessionId
) {}
