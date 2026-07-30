package com.preptracker.server.dto;

// Bank-wide question counts for the admin Question Bank page's stat cards —
// computed with COUNT queries instead of loading every row.

public record QuestionBankStatsDTO(
        long total,
        long easy,
        long medium,
        long hard
) {}
