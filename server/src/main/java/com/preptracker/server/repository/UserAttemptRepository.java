package com.preptracker.server.repository;

import com.preptracker.server.model.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {
    List<UserAttempt> findByUserId(UUID userId);
    List<UserAttempt> findByUserIdAndTopicId(UUID userId, Long topicId);
    List<UserAttempt> findByTestAttemptId(Long testAttemptId);
    List<UserAttempt> findByTestAttemptIdIn(Collection<Long> testAttemptIds);

    // One round trip for the whole focus-tracker: rows of [topicId, attemptCount,
    // avgAccuracy, avgConfidence] for every topic the user has attempted. Replaces
    // the previous per-topic findByUserIdAndTopicId N+1 pattern that made the
    // sidebar widget take 10-20s against a remote database.
    @Query("""
            SELECT ua.topicId,
                   COUNT(ua),
                   AVG(CASE WHEN ua.isCorrect = true THEN 1.0 ELSE 0.0 END),
                   AVG(ua.confidenceScore)
            FROM UserAttempt ua
            WHERE ua.userId = :userId
            GROUP BY ua.topicId
            """)
    List<Object[]> aggregateStatsByTopic(@Param("userId") UUID userId);
}
