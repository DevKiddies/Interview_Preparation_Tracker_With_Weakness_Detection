package com.preptracker.server.repository;

import com.preptracker.server.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUserId(UUID userId);

    List<TestAttempt> findByUserIdOrderByTakenAtDesc(UUID userId);

    Optional<TestAttempt> findFirstByUserIdOrderByTakenAtDesc(UUID userId);

    // Distinct dates (as LocalDateTime values) on which the user attempted any
    // test, used to compute the study streak. Returns LocalDateTime instead of
    // a distinct date type to avoid native-query type-conversion issues.
    @Query("SELECT DISTINCT ta.takenAt FROM TestAttempt ta WHERE ta.userId = :userId")
    List<LocalDateTime> findDistinctAttemptTimestamps(@Param("userId") UUID userId);

    // Rows of [day, studySeconds] — total test time per calendar day from
    // test_attempts, used by the profile "Study Consistency" heatmap's
    // "Study Duration" metric.
    @Query(value = """
            SELECT DATE_TRUNC('day', ta.taken_at) AS day,
              COALESCE(SUM(ta.time_taken_seconds), 0) AS study_seconds
            FROM test_attempts ta
            WHERE ta.user_id = :userId AND ta.taken_at >= :start
            GROUP BY DATE_TRUNC('day', ta.taken_at)
            """, nativeQuery = true)
    List<Object[]> findDailyStudyTime(@Param("userId") UUID userId,
            @Param("start") LocalDateTime start);
}
