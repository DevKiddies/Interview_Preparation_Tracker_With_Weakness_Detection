package com.preptracker.server.repository;

import com.preptracker.server.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUserId(UUID userId);
    List<TestAttempt> findByUserIdOrderByTakenAtDesc(UUID userId);
    Optional<TestAttempt> findFirstByUserIdOrderByTakenAtDesc(UUID userId);
}
