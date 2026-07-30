package com.preptracker.server.dto;

// Full question shape for the admin Question Bank page — unlike the public
// QuestionDTO, this includes correctAnswer since admins manage answers directly.

public record AdminQuestionDTO(
        Long id,
        String question,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String correctAnswer,
        Long categoryId,
        Long topicId,
        String difficulty,
        String questionType,
        Long techniqueId,
        Long companyId
) {}
