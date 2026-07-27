package com.preptracker.server.controller;

// Exposes the question bank under /api/questions.
// Supports optional filtering by topic (e.g. "DSA") and category (e.g. "Arrays"),
// and a limit on how many questions to return. The service layer shuffles the results
// so each request gets a different question order.

import com.preptracker.server.dto.QuestionDTO;
import com.preptracker.server.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getQuestions(
            @RequestParam(required = false) List<String> topic,
            @RequestParam(required = false) List<String> category,
            @RequestParam(defaultValue = "50") int limit
    ) {
        List<String> topics = (topic == null || topic.isEmpty()) ? List.of("DSA") : topic;
        return ResponseEntity.ok(questionService.getQuestions(topics, category, limit));
    }
}
