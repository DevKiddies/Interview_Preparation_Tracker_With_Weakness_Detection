package com.preptracker.server.dto;

// The profile "Study Consistency" heatmap payload: real per-day activity plus
// the streak summary computed across it (current = consecutive active days
// ending today/yesterday, longest = best run anywhere in the fetched range).

import java.util.List;

public record ActivityHeatmapDTO(
        List<ActivityDayDTO> days,
        int currentStreak,
        int longestStreak
) {
}
