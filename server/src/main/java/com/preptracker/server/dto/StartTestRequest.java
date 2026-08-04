package com.preptracker.server.dto;

// Request body for POST /api/tests/start. Carries enough info to snapshot the
// started test so an abandoned session can later be persisted as a real
// test_attempts row (score 0) without needing the answers. testId is null for
// topic practice sessions (the frontend uses the literal route "topic").

public record StartTestRequest(
        Long testId,       // null for topic-practice sessions
        String type,       // MOCK | TOPIC
        Integer total,     // number of questions in this test
        String category    // dominant category label for history/abandon row
) {}
