package com.preptracker.server.repository;

import com.preptracker.server.model.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {
    List<UserAttempt> findByUserId(UUID userId);
    List<UserAttempt> findByTestAttemptId(Long testAttemptId);
    List<UserAttempt> findByTestAttemptIdIn(Collection<Long> testAttemptIds);

    // One row: [overallConfidence, overallAccuracy, questionsSolved,
    // solvedThisWeek, recentConf, prevConf, recentAcc, prevAcc].
    // recent* = the last 7 days, prev* = the 7 days before that (for the
    // week-over-week deltas the stat cards display). All aggregation happens
    // in the database so only a single row crosses the wire.
            @Query(value = """
            SELECT
              AVG(CASE WHEN ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS overall_conf,
              AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) AS overall_acc,
              COUNT(*) AS solved,
              COALESCE(SUM(CASE WHEN ua.created_at >= :thisStart THEN 1 ELSE 0 END), 0) AS solved_week,
              AVG(CASE WHEN ua.created_at >= :thisStart AND ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS recent_conf,
              AVG(CASE WHEN ua.created_at >= :prevStart AND ua.created_at < :thisStart AND ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS prev_conf,
              AVG(CASE WHEN ua.created_at >= :thisStart THEN (CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) END) AS recent_acc,
              AVG(CASE WHEN ua.created_at >= :prevStart AND ua.created_at < :thisStart THEN (CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) END) AS prev_acc
            FROM user_attempts ua
            WHERE ua.user_id = :userId
            """, nativeQuery = true)
    List<Object[]> findDashboardStats(@Param("userId") UUID userId,
                                      @Param("thisStart") LocalDateTime thisStart,
                                      @Param("prevStart") LocalDateTime prevStart);
}
