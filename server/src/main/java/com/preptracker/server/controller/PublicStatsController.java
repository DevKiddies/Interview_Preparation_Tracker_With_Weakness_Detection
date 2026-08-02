package com.preptracker.server.controller;

// Public, unauthenticated stats for the landing page hero section (active users,
// question bank size). No sensitive data — just aggregate counts anyone can see
// without logging in.

import com.preptracker.server.dto.PublicStatsResponse;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class PublicStatsController {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsResponse> stats() {
        return ResponseEntity.ok(new PublicStatsResponse(
                userRepository.count(),
                questionRepository.count()
        ));
    }
}
