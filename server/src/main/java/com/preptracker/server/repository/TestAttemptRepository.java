package com.preptracker.server.repository;

import com.preptracker.server.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUserId(UUID userId);
    List<TestAttempt> findByUserIdOrderByTakenAtDesc(UUID userId);

    // Only the timestamps of activity — the streak logic only needs these dates,
    // so loading full TestAttempt rows (score, answers, etc.) was wasted work.
    @Query("SELECT DISTINCT ta.takenAt FROM TestAttempt ta WHERE ta.userId = :userId")
    List<LocalDateTime> findDistinctAttemptTimestamps(@Param("userId") UUID userId);
}
