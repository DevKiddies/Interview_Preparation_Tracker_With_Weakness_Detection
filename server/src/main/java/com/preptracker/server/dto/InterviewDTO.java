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
        List<String> focusTopics,  // frozen at closure; empty when none were set
        String status,       // COMPLETED | ARCHIVED (history is never ACTIVE)
        String result,       // SELECTED | NOT_SELECTED | ARCHIVED (nullable)
        Integer confidence,
        Integer accuracy,
        Integer questionsSolved,
        Integer duration,    // days between start_date and interview_date
        List<String> weakTopics,
        Integer interviewReadiness   // frozen snapshot for closed interviews
) {}
