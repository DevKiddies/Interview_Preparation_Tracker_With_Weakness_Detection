package com.preptracker.server.controller;

// Handles mock test submission under /api/tests/submit.
// The controller stays thin: it only passes the request to TestService, which
// grades each question, computes confidence, and persists the results. No
// grading logic lives here anymore (see TestService).

import com.preptracker.server.dto.TestHistoryDTO;
import com.preptracker.server.dto.TestResultResponse;
import com.preptracker.server.dto.TestSubmissionRequest;
import com.preptracker.server.service.TestHistoryService;
import com.preptracker.server.service.TestService;
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

    @PostMapping("/submit")
    public ResponseEntity<TestResultResponse> submitTest(@RequestBody TestSubmissionRequest request) {
        return ResponseEntity.ok(testService.submitTest(request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<TestHistoryDTO>> getHistory() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(testHistoryService.getHistory(UUID.fromString(principal)));
    }
}
