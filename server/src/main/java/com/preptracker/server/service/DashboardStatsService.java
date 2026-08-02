package com.preptracker.server.service;

// Builds the aggregate numbers behind the four dashboard stat cards from the
// current user's persisted attempts. The heavy lifting (confidence, accuracy,
// counts, week-over-week deltas) happens inside a single GROUP BY query so only
// one small result row crosses the wire; the study streak is derived from the
// distinct dates the user took any test.

import com.preptracker.server.dto.DashboardStatsDTO;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.UserAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardStatsService {

    private static final int WEEK_DAYS = 7;

    private final UserAttemptRepository userAttemptRepository;
    private final TestAttemptRepository testAttemptRepository;

    public DashboardStatsDTO getStats(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisStart = now.minusDays(WEEK_DAYS);
        LocalDateTime prevStart = now.minusDays(2L * WEEK_DAYS);

        List<Object[]> rows = userAttemptRepository.findDashboardStats(userId, thisStart, prevStart);
        List<LocalDateTime> attemptTimestamps = testAttemptRepository.findDistinctAttemptTimestamps(userId);

        if (rows == null || rows.isEmpty()) {
            return new DashboardStatsDTO(null, null, 0, computeStreak(attemptTimestamps), null, null, 0);
        }

        Object[] row = rows.get(0);
        Integer confidence = round(row[0]);
        Integer accuracy = round100(row[1]);
        int solved = ((Number) row[2]).intValue();
        int solvedThisWeek = ((Number) row[3]).intValue();
        Integer recentConf = round(row[4]);
        Integer prevConf = round(row[5]);
        Integer recentAcc = round100(row[6]);
        Integer prevAcc = round100(row[7]);

        return new DashboardStatsDTO(
                confidence, accuracy, solved, computeStreak(attemptTimestamps),
                delta(recentConf, prevConf), delta(recentAcc, prevAcc), solvedThisWeek);
    }

    private int computeStreak(List<LocalDateTime> attemptTimestamps) {
        if (attemptTimestamps == null || attemptTimestamps.isEmpty()) return 0;

        Map<LocalDate, Boolean> days = new HashMap<>();
        for (LocalDateTime ts : attemptTimestamps) days.put(ts.toLocalDate(), Boolean.TRUE);

        LocalDate cursor = LocalDate.now();
        // A streak stays alive if the user practiced yesterday but not yet today.
        if (!days.containsKey(cursor)) cursor = cursor.minusDays(1);

        int streak = 0;
        while (days.containsKey(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private Integer delta(Integer recent, Integer prev) {
        if (recent == null || prev == null) return null;
        return recent - prev;
    }

    private Integer round(Object value) {
        if (value == null) return null;
        return (int) Math.round(((Number) value).doubleValue());
    }

    private Integer round100(Object value) {
        if (value == null) return null;
        return (int) Math.round(((Number) value).doubleValue() * 100);
    }
}
