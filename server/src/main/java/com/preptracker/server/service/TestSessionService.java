package com.preptracker.server.service;

import com.preptracker.server.dto.AbandonTestRequest;
import com.preptracker.server.dto.StartTestRequest;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.TestSession;
import com.preptracker.server.repository.TestAttemptRepository;
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
    private final TestAttemptRepository testAttemptRepository;

    /**
     * Creates a new test session when the user starts a test.
     * Returns the generated session ID.
     */
    @Transactional
    public UUID startSession(UUID userId, Long testId) {
        TestSession session = new TestSession();
        session.setUserId(userId);
        session.setTestId(testId);
        session = testSessionRepository.save(session);
        return session.getId();
    }

    /**
     * Creates a test session with a snapshot of what the started test contains
     * (question count, type, category), so an abandoned session can later be
     * persisted as a real test_attempts row (score 0) via the pagehide beacon.
     */
    @Transactional
    public UUID startSession(UUID userId, StartTestRequest request) {
        TestSession session = new TestSession();
        session.setUserId(userId);
        session.setTestId(request.testId());
        session.setTotal(request.total());
        session.setType(request.type() != null ? request.type() : "MOCK");
        session.setCategory(request.category());
        session = testSessionRepository.save(session);
        return session.getId();
    }

    /**
     * Marks a test session as completed.
     */
    @Transactional
    public void completeSession(UUID userId, UUID sessionId) {
        TestSession session = testSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Test session not found"));
        if (!userId.equals(session.getUserId())) {
            throw new RuntimeException("Test session does not belong to this user");
        }
        session.setCompleted(true);
        session.setCompletedAt(LocalDateTime.now());
        testSessionRepository.save(session);
    }

    /**
     * Handles the pagehide beacon: closes the session and persists an ABANDONED
     * test_attempts row (score 0) so the closed-tab test shows up in history and
     * admin results without polluting score averages/streaks.
     */
    @Transactional
    public void abandonSession(UUID userId, AbandonTestRequest request) {
        TestSession session = testSessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new RuntimeException("Test session not found"));
        if (!userId.equals(session.getUserId())) {
            throw new RuntimeException("Test session does not belong to this user");
        }
        if (Boolean.TRUE.equals(session.getCompleted())) return;

        TestAttempt attempt = new TestAttempt();
        attempt.setUserId(userId);
        attempt.setScore(0);
        attempt.setTotal(session.getTotal() != null ? session.getTotal() : 0);
        attempt.setAccuracy(0.0);
        attempt.setTimeTakenSeconds(request.timeTaken());
        attempt.setType(session.getType() != null ? session.getType() : "MOCK");
        attempt.setCategory(session.getCategory());
        attempt.setCompletionStatus("ABANDONED");
        testAttemptRepository.save(attempt);

        session.setCompleted(true);
        session.setCompletionStatus("ABANDONED");
        session.setCompletedAt(LocalDateTime.now());
        testSessionRepository.save(session);
    }
}
