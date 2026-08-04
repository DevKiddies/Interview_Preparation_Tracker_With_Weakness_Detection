package com.preptracker.server.dto;

import java.util.UUID;

// Request body for POST /api/tests/abandon — the pagehide beacon the frontend
// fires when the user closes the tab/browser mid-test. The server looks up the
// session, persists an ABANDONED test_attempts row (score 0) and closes it.

public record AbandonTestRequest(
        UUID sessionId,
        int timeTaken    // seconds elapsed when the page died
) {}
