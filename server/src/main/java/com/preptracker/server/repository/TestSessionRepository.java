package com.preptracker.server.repository;

import com.preptracker.server.model.TestSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TestSessionRepository extends JpaRepository<TestSession, UUID> {

    long countByCompletedTrue();

    Optional<TestSession> findById(UUID id);

}