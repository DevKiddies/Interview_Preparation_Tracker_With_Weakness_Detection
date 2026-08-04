package com.preptracker.server.controller;

// Exposes the current user's interview history under /api/interviews.
// GET returns the full history list (with derived aggregate stats).
// POST /result closes the CURRENT preparation goal with a result (SELECTED /
// NOT_SELECTED / ARCHIVED / DELETED): the goal is snapshotted into an immutable
// history row (or, for DELETED, dropped without record) and then cleared so a new
// interview can begin. There is no per-interview close — interviews are immutable.

import com.preptracker.server.dto.InterviewDTO;
import com.preptracker.server.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    private UUID authenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }

    @GetMapping
    public ResponseEntity<List<InterviewDTO>> getInterviews() {
        return ResponseEntity.ok(interviewService.getInterviews(authenticatedUserId()));
    }

    @PostMapping("/result")
    public ResponseEntity<Map<String, Object>> snapshotResult(
            @RequestBody Map<String, String> body) {
        String result = body.get("result");
        InterviewDTO dto = interviewService.snapshotCurrentGoal(authenticatedUserId(), result);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("deleted", dto == null);
        if (dto != null) response.put("interview", dto);
        return ResponseEntity.ok(response);
    }
}
