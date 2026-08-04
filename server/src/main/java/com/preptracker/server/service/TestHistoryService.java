package com.preptracker.server.service;

// Business logic behind GET /api/tests/history — the persisted mock-test /
// topic-test history for the current user. Each row is built from a
// TestAttempt plus its UserAttempt detail rows: the attempt's average
// confidence (answered questions only, NOT_ATTEMPTED excluded) and its weak
// topics (BLIND_SPOT / CLEAR_WEAKNESS states) are derived here.
// Title is synthesized from the attempt's type + dominant category since the
// original mock tests aren't named in the schema.

import com.preptracker.server.dto.TestHistoryDTO;
import com.preptracker.server.model.ConfidenceState;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.Topic;
import com.preptracker.server.model.UserAttempt;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TopicRepository;
import com.preptracker.server.repository.UserAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestHistoryService {

    private static final List<ConfidenceState> WEAK_STATES = List.of(
            ConfidenceState.BLIND_SPOT, ConfidenceState.CLEAR_WEAKNESS);

    private final TestAttemptRepository testAttemptRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final TopicRepository topicRepository;

    public List<TestHistoryDTO> getHistory(UUID userId) {
        List<TestAttempt> attempts = testAttemptRepository.findByUserIdOrderByTakenAtDesc(userId);
        if (attempts.isEmpty()) return List.of();

        List<Long> attemptIds = attempts.stream().map(TestAttempt::getId).toList();
        List<UserAttempt> allUserAttempts = userAttemptRepository.findByTestAttemptIdIn(attemptIds);
        Map<Long, List<UserAttempt>> byAttempt = allUserAttempts.stream()
                .collect(Collectors.groupingBy(UserAttempt::getTestAttemptId));
        Map<Long, String> topicNames = topicNames(allUserAttempts);

        List<TestHistoryDTO> result = new ArrayList<>();
        for (TestAttempt a : attempts) {
            List<UserAttempt> uas = byAttempt.getOrDefault(a.getId(), List.of());
            List<UserAttempt> answered = uas.stream()
                    .filter(ua -> ua.getConfidenceState() != ConfidenceState.NOT_ATTEMPTED)
                    .toList();

            Integer confidence = answered.isEmpty() ? null
                    : (int) Math.round(answered.stream().mapToInt(UserAttempt::getConfidenceScore)
                    .average().orElse(0));

            String type = a.getType() != null ? a.getType() : "MOCK";
            String title = titleFor(type, a.getCategory());

            // The attempt only persists its submission time (takenAt); the start
            // time isn't stored, but the timer runs continuously from quiz mount,
            // so it reconstructs accurately as takenAt - timeTakenSeconds.
            LocalDateTime submittedAt = a.getTakenAt();
            LocalDateTime startedAt = (a.getTimeTakenSeconds() != null && submittedAt != null)
                    ? submittedAt.minusSeconds(a.getTimeTakenSeconds())
                    : submittedAt;

            result.add(new TestHistoryDTO(
                    a.getId(),
                    title,
                    type,
                    startedAt,
                    submittedAt,
                    statusLabel(a.getCompletionStatus()),
                    a.getTotal(),
                    a.getTimeTakenSeconds() != null ? Math.max(1, Math.round(a.getTimeTakenSeconds() / 60f)) : null,
                    a.getScore(),
                    a.getAccuracy(),
                    confidence,
                    weakTopics(answered, topicNames)
            ));
        }
        return result;
    }

    private String titleFor(String type, String category) {
        // No type suffix here: the history card already renders a dedicated
        // "Mock Test" / "Topic Test" badge next to the title, so appending
        // "(Topic Test)" would just duplicate it.
        return category != null && !category.isBlank() ? category : "Assessment";
    }

    // Maps the persisted completion_status to the label the history UI renders.
    private String statusLabel(String completionStatus) {
        if (completionStatus == null) return "COMPLETED";
        return switch (completionStatus.toUpperCase()) {
            case "ABANDONED" -> "ABANDONED";
            case "ABORTED" -> "ABORTED";
            default -> "COMPLETED";
        };
    }

    private List<String> weakTopics(List<UserAttempt> answered, Map<Long, String> topicNames) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (UserAttempt ua : answered) {
            if (!WEAK_STATES.contains(ua.getConfidenceState())) continue;
            String name = topicNames.getOrDefault(ua.getTopicId(), "Unknown");
            counts.merge(name, 1, Integer::sum);
        }
        return counts.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .toList();
    }

    private Map<Long, String> topicNames(List<UserAttempt> userAttempts) {
        if (userAttempts.isEmpty()) return Map.of();
        List<Long> ids = userAttempts.stream().map(UserAttempt::getTopicId).distinct().toList();
        Map<Long, String> names = new java.util.HashMap<>();
        for (Topic t : topicRepository.findAllById(ids)) names.put(t.getId(), t.getName());
        return names;
    }
}
