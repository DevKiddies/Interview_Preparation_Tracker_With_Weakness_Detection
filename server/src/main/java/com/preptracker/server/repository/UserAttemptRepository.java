package com.preptracker.server.repository;

import com.preptracker.server.model.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {
    List<UserAttempt> findByUserId(UUID userId);
    List<UserAttempt> findByTestAttemptId(Long testAttemptId);
}
