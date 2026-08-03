package com.preptracker.server.dto;

// One row of the admin User Reports "Top Performers" leaderboard.
public record TopPerformerDTO(
        int rank,
        String name,
        String email,
        int tests,
        double avgScore,
        int streak,
        String topic
) {}
