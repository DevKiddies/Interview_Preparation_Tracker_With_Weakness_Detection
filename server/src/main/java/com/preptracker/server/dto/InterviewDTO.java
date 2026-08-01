package com.preptracker.server.dto;

// Row shape for GET /api/interviews — one entry per interview track for the
// current user. Matches what the interview-history UI renders (InterviewCard).
// The aggregate fields (confidence, accuracy, questionsSolved, weakTopics,
// duration) are computed on the fly from test_attempts/user_attempts that fall
// inside the interview's date window [start_date, interview_date] — nothing
// except the track definition itself is persisted on the interviews table.

import java.time.LocalDate;
import java.util.List;

public record InterviewDTO(
        Long id,
        String targetCompany,
        String experience,
        LocalDate startDate,
        LocalDate interviewDate,
        String status,       // ACTIVE | COMPLETED | ARCHIVED
        String result,       // SELECTED | NOT_SELECTED | ARCHIVED | DELETED (nullable)
        Integer confidence,
        Integer accuracy,
        Integer questionsSolved,
        Integer duration,    // days between start_date and interview_date
        List<String> weakTopics
) {}
