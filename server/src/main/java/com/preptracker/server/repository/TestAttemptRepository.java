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
    @Query("SELECT DISTINCT ta.takenAt FROM TestAttempt ta WHERE ta.userId = :userId")
    List<LocalDateTime> findDistinctAttemptTimestamps(@Param("userId") UUID userId);
}
