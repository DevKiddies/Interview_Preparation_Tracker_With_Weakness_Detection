package com.preptracker.server.controller;

// Handles mock test submission under /api/tests/submit.
// The controller stays thin: it only passes the request to TestService, which
// grades each question, computes confidence, and persists the results. No
// grading logic lives here anymore (see TestService).

import com.preptracker.server.dto.AvailableTestResponse;
import com.preptracker.server.dto.LatestTestResponse;
import com.preptracker.server.dto.TestResultResponse;
import com.preptracker.server.dto.TestSubmissionRequest;
import com.preptracker.server.service.TestHistoryService;
import com.preptracker.server.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final TestHistoryService testHistoryService;

    @PostMapping("/submit")
    public ResponseEntity<TestResultResponse> submitTest(@RequestBody TestSubmissionRequest request) {
        return ResponseEntity.ok(testService.submitTest(request));
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

    // Backs the "Full Assessments" grid on the mock test selection page.
    @GetMapping("/available")
    public ResponseEntity<List<AvailableTestResponse>> availableTests() {
        return ResponseEntity.ok(testService.getAvailableTests());
    }
}
