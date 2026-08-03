package com.preptracker.server.service;

import com.preptracker.server.model.TestSession;
import com.preptracker.server.repository.TestSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestSessionService {

    private final TestSessionRepository testSessionRepository;

    /**
     * Creates a new test session when the user starts a test.
     * Returns the generated session ID.
     */
    @Transactional
    public UUID startSession(UUID userId, Long testId) {

        TestSession session = new TestSession();

        session.setUserId(userId);
        session.setTestId(testId);

        // startedAt and completed are already initialized in the entity.

        session = testSessionRepository.save(session);

        return session.getId();
    }

    /**
     * Marks a test session as completed.
     * (We'll implement this in the next step.)
     */
    // @Transactional
    // public void completeSession(UUID sessionId) {

    // testSessionRepository.findById(sessionId)
    // .ifPresent(session -> {
    // session.setCompleted(true);
    // session.setCompletedAt(LocalDateTime.now());

    // testSessionRepository.save(session);
    // });
    // }
    @Transactional
    public void completeSession(UUID sessionId) {

        TestSession session = testSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Test session not found"));

        session.setCompleted(true);
        session.setCompletedAt(LocalDateTime.now());

        testSessionRepository.save(session);
    }
}