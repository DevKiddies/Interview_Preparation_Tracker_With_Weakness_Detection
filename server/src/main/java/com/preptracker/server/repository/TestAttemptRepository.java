package com.preptracker.server.repository;

import com.preptracker.server.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    // ABANDONED sessions (score 0, no answers) never count toward a streak.
    @Query("SELECT DISTINCT ta.takenAt FROM TestAttempt ta WHERE ta.userId = :userId AND ta.completionStatus <> 'ABANDONED'")
    List<LocalDateTime> findDistinctAttemptTimestamps(@Param("userId") UUID userId);

    // Rows of [day, studySeconds] — total test time per calendar day from
    // test_attempts, used by the profile "Study Consistency" heatmap's
    // "Study Duration" metric. ABANDONED sessions are excluded — a closed-tab
    // test isn't genuine study time.
    @Query(value = """
            SELECT DATE_TRUNC('day', ta.taken_at) AS day,
              COALESCE(SUM(ta.time_taken_seconds), 0) AS study_seconds
            FROM test_attempts ta
            WHERE ta.user_id = :userId AND ta.taken_at >= :start
              AND ta.completion_status <> 'ABANDONED'
            GROUP BY DATE_TRUNC('day', ta.taken_at)
            """, nativeQuery = true)
    List<Object[]> findDailyStudyTime(@Param("userId") UUID userId,
                                      @Param("start") LocalDateTime start);

    // Admin dashboard: average accuracy across all test attempts. Double (not
    // double) so an empty table returns null instead of crashing.
    // ABANDONED sessions (always 0% accuracy) are excluded so they don't drag
    // the platform average down.
    @Query("SELECT AVG(t.accuracy) FROM TestAttempt t WHERE t.completionStatus <> 'ABANDONED'")
    Double getAverageAccuracy();

    // Admin dashboard: total correct answers and total questions across all
    // attempts, used to compute the question pass rate.
    public interface QuestionPassRateProjection {
        Long getTotalCorrect();

        Long getTotalQuestions();
    }

    @Query("""
                SELECT
                    SUM(t.score) AS totalCorrect,
                    SUM(t.total) AS totalQuestions
                FROM TestAttempt t
                WHERE t.completionStatus <> 'ABANDONED'
            """)
    QuestionPassRateProjection getQuestionPassRateData();
}
