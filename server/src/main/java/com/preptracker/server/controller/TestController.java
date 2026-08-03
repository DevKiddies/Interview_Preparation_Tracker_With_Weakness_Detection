package com.preptracker.server.controller;

// Handles mock test submission under /api/tests/submit.
// The controller stays thin: it only passes the request to TestService, which
// grades each question, computes confidence, and persists the results. No
// grading logic lives here anymore (see TestService).

import com.preptracker.server.dto.AvailableTestResponse;
import com.preptracker.server.dto.LatestTestResponse;
import com.preptracker.server.dto.TestHistoryDTO;
import com.preptracker.server.dto.TestResultResponse;
import com.preptracker.server.dto.TestSubmissionRequest;
import com.preptracker.server.service.TestHistoryService;
import com.preptracker.server.service.TestService;
import com.preptracker.server.service.TestSessionService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final TestHistoryService testHistoryService;

    private final TestSessionService testSessionService;

    // Creates a test session row when the user starts a test. Returns the
    // generated session id, which the frontend can submit alongside the answers
    // so the session can be marked completed (see submitTest).
    @PostMapping("/start/{testId}")
    public ResponseEntity<UUID> startTest(@PathVariable Long testId) {
        UUID sessionId = testSessionService.startSession(authenticatedUserId(), testId);
        return ResponseEntity.ok(sessionId);
    }

    private UUID authenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }

    @PostMapping("/submit")
    public ResponseEntity<TestResultResponse> submitTest(@RequestBody TestSubmissionRequest request) {
        TestResultResponse result = testService.submitTest(request);
        // Mark the test session as completed when the submission carries one
        if (request.sessionId() != null) {
            testSessionService.completeSession(request.sessionId());
        }
        return ResponseEntity.ok(result);
    }

    // Backs the landing page hero's "Test Passed" card — the user's real most
    // recent result instead of a hardcoded placeholder. 204 when they haven't
    // taken a test yet, so the frontend can fall back to a "take your first test" prompt.
    @GetMapping("/latest")
    public ResponseEntity<LatestTestResponse> latestTest() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UUID userId = UUID.fromString(principal);
        return testService.getLatestAttempt(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // Reconstructs the full per-question result for one of the current user's
    // attempts. Backs the results page when deep-linked from mock-test history
    // or a TEST_RESULT notification, where only the attempt id is known.
    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<TestResultResponse> getAttemptResult(@PathVariable Long attemptId) {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return testService.getAttemptResult(UUID.fromString(principal), attemptId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Backs the "Full Assessments" grid on the mock test selection page.
    @GetMapping("/available")
    public ResponseEntity<List<AvailableTestResponse>> availableTests() {
        return ResponseEntity.ok(testService.getAvailableTests());
    }

    // Backs the mock/topic test history timeline.
    @GetMapping("/history")
    public ResponseEntity<List<TestHistoryDTO>> history() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UUID userId = UUID.fromString(principal);
        return ResponseEntity.ok(testHistoryService.getHistory(userId));
    }
}
