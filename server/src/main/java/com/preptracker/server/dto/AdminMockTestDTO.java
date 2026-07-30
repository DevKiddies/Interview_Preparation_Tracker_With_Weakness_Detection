package com.preptracker.server.dto;

// Full mock-test-template shape for the admin Test Management pages (All Tests,
// Create Mock Test). attemptCount/avgScore are placeholders (always 0) until
// test_attempts carries a test_id FK back to this table.

import java.time.LocalDateTime;
import java.util.List;

public record AdminMockTestDTO(
        Long id,
        String name,
        String description,
        Long categoryId,
        List<Long> topicIds,
        Integer questionCount,
        Integer timeLimitMinutes,
        String difficulty,
        Integer difficultyEasy,
        Integer difficultyMedium,
        Integer difficultyHard,
        Boolean randomize,
        String status,
        LocalDateTime createdAt,
        Integer attemptCount,
        Double avgScore
) {}
