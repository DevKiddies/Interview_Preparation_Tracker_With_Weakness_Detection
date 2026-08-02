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

    // Rows of [categoryId, categoryName, confidence, weakCount, questionCount,
    // recentConf, prevConf] for the "Confidence by Category" widget. Trend is
    // computed in Java from recentConf vs prevConf (last 7 days vs the 7 before).
    @Query(value = """
            SELECT c.id, c.name,
              AVG(CASE WHEN ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS confidence,
              COALESCE(SUM(CASE WHEN ua.confidence_state IN ('BLIND_SPOT','CLEAR_WEAKNESS') THEN 1 ELSE 0 END), 0) AS weak_count,
              COUNT(*) AS q_count,
              AVG(CASE WHEN ua.created_at >= :thisStart AND ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS recent_conf,
              AVG(CASE WHEN ua.created_at >= :prevStart AND ua.created_at < :thisStart AND ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS prev_conf
            FROM user_attempts ua
            JOIN topics t ON t.id = ua.topic_id
            JOIN categories c ON c.id = t.category_id
            WHERE ua.user_id = :userId
            GROUP BY c.id, c.name
            ORDER BY q_count DESC
            """, nativeQuery = true)
    List<Object[]> findCategoryConfidence(@Param("userId") UUID userId,
                                          @Param("thisStart") LocalDateTime thisStart,
                                          @Param("prevStart") LocalDateTime prevStart);

    // Rows of [topicId, confidence, accuracy, questionCount] — used by the
    // Confidence Explorer's topic-level table. questionCount counts every
    // attempt, while confidence only averages answered (non-NOT_ATTEMPTED)
    // scores and accuracy averages correctness over all attempts.
    @Query(value = """
            SELECT t.id,
              AVG(CASE WHEN ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS confidence,
              AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) AS accuracy,
              COUNT(*) AS q_count
            FROM user_attempts ua
            JOIN topics t ON t.id = ua.topic_id
            WHERE ua.user_id = :userId
            GROUP BY t.id
            """, nativeQuery = true)
    List<Object[]> findTopicStats(@Param("userId") UUID userId);

    // Rows of [topicId, techniqueId, confidence, accuracy, questionCount] —
    // per-topic technique stats scoped to the topic the attempt actually
    // happened in. Used by the Confidence Explorer so a technique's numbers
    // reflect only the attempts inside that topic, not the technique's global
    // total across all the other topics it hangs under. accuracy is 0-1
    // (scaled to 0-100 in Java).
    @Query(value = """
            SELECT ua.topic_id, q.technique_id,
              AVG(CASE WHEN ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS confidence,
              AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) AS accuracy,
              COUNT(*) AS q_count
            FROM user_attempts ua
            JOIN questions q ON q.id = ua.question_id
            WHERE ua.user_id = :userId AND q.technique_id IS NOT NULL
            GROUP BY ua.topic_id, q.technique_id
            """, nativeQuery = true)
    List<Object[]> findTechniqueStatsByTopic(@Param("userId") UUID userId);

    // Rows of [topicId, difficulty, accuracy] — the user's per-topic accuracy
    // split by question difficulty (easy/medium/hard), used by the Accuracy
    // Heatmap widget. accuracy is 0-1 (scaled to 0-100 in Java).
    @Query(value = """
            SELECT ua.topic_id, q.difficulty,
              AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) AS accuracy
            FROM user_attempts ua
            JOIN questions q ON q.id = ua.question_id
            WHERE ua.user_id = :userId
            GROUP BY ua.topic_id, q.difficulty
            """, nativeQuery = true)
    List<Object[]> findAccuracyByDifficulty(@Param("userId") UUID userId);

    // Rows of [topicName, blindSpotCount] — the top 7 topics ranked by how many
    // times the user was overconfident (BLIND_SPOT: high confidence + wrong) on
    // that topic. Backs the "Blind Spot Analysis" widget, which deliberately
    // shows exactly seven rows even if fewer topics have data.
    @Query(value = """
            SELECT t.name,
              COUNT(*) AS blind_count
            FROM user_attempts ua
            JOIN topics t ON t.id = ua.topic_id
            WHERE ua.user_id = :userId AND ua.confidence_state = 'BLIND_SPOT'
            GROUP BY t.name
            ORDER BY blind_count DESC
            LIMIT 7
            """, nativeQuery = true)
    List<Object[]> findBlindSpots(@Param("userId") UUID userId);

    // Rows of [day, confidence, accuracy, attemptCount] — one row per calendar
    // day that had at least one attempt, used by the Confidence & Accuracy trend
    // chart. The Java side re-buckets these into daily (7D), weekly (30D) and
    // monthly (90D) series so the client only ever deals with pre-aggregated
    // points. attemptCount lets the weekly/monthly aggregates be weighted by how
    // many attempts actually happened on each day.
    @Query(value = """
            SELECT DATE_TRUNC('day', ua.created_at) AS day,
              AVG(CASE WHEN ua.confidence_state <> 'NOT_ATTEMPTED' THEN ua.confidence_score END) AS confidence,
              AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) AS accuracy,
              COUNT(*) AS attempt_count
            FROM user_attempts ua
            WHERE ua.user_id = :userId AND ua.created_at >= :start
            GROUP BY DATE_TRUNC('day', ua.created_at)
            ORDER BY day ASC
            """, nativeQuery = true)
    List<Object[]> findDailyTrend(@Param("userId") UUID userId,
                                  @Param("start") LocalDateTime start);
}
