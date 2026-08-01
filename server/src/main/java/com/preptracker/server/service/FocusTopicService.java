package com.preptracker.server.service;

// Business logic behind GET /api/users/me/focus-topics/stats — the live focus
// tracker for the sidebar. For each focus topic the user selected during
// onboarding / interview setup, this computes real performance from
// user_attempts (accuracy = % correct, confidence = avg confidence_score),
// a derived state (ON_TRACK / WEAK / NO_DATA), plus an overall streak from the
// consecutive days the user attempted at least one test.

import com.preptracker.server.dto.FocusTopicStatDTO;
import com.preptracker.server.dto.FocusTopicStatsDTO;
import com.preptracker.server.model.Topic;
import com.preptracker.server.model.UserProfile;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TopicRepository;
import com.preptracker.server.repository.UserAttemptRepository;
import com.preptracker.server.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FocusTopicService {

    private final UserProfileRepository userProfileRepository;
    private final TopicRepository topicRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final TestAttemptRepository testAttemptRepository;

    public FocusTopicStatsDTO getStats(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
        List<String> focusNames = profile != null && profile.getFocusTopics() != null
                ? List.of(profile.getFocusTopics().split(","))
                : List.of();

        // Batched lookups — the previous N+1 pattern (per-topic findByName +
        // findByUserIdAndTopicId, ~2 queries per focus topic) was hammering a
        // remote DB and made the sidebar widget take 10-20s.
        List<Topic> focusTopics = topicRepository.findByNameIn(focusNames.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .toList());
        Map<String, Topic> topicByName = focusTopics.stream()
                .collect(Collectors.toMap(Topic::getName, topic -> topic));
        Map<Long, Object[]> statsByTopic = userAttemptRepository.aggregateStatsByTopic(userId)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> row));

        List<FocusTopicStatDTO> topics = new ArrayList<>();
        for (String rawName : focusNames) {
            String name = rawName.trim();
            if (name.isEmpty()) continue;

            Topic topic = topicByName.get(name);
            Object[] row = topic == null ? null : statsByTopic.get(topic.getId());
            if (topic == null || row == null) {
                // Focus topic selected but never attempted (or absent from the bank).
                topics.add(new FocusTopicStatDTO(name, 0, null, null, "NO_DATA"));
                continue;
            }

            long count = ((Number) row[1]).longValue();
            int accuracy = (int) Math.round(((Number) row[2]).doubleValue() * 100);
            int confidence = (int) Math.round(((Number) row[3]).doubleValue());
            String state = accuracy >= 60 ? "ON_TRACK" : "WEAK";

            topics.add(new FocusTopicStatDTO(name, (int) count, accuracy, confidence, state));
        }

        List<FocusTopicStatDTO> withData = topics.stream()
                .filter(t -> t.accuracy() != null)
                .toList();
        Integer avgAccuracy = withData.isEmpty() ? null
                : (int) Math.round(withData.stream().mapToInt(FocusTopicStatDTO::accuracy)
                .average().orElse(0));
        Integer avgConfidence = withData.isEmpty() ? null
                : (int) Math.round(withData.stream().mapToInt(FocusTopicStatDTO::confidence)
                .average().orElse(0));

        return new FocusTopicStatsDTO(topics, avgAccuracy, avgConfidence, computeStreak(userId));
    }

    private int computeStreak(UUID userId) {
        Set<LocalDate> days = testAttemptRepository.findDistinctAttemptTimestamps(userId)
                .stream()
                .map(ts -> ts.toLocalDate())
                .collect(Collectors.toSet());
        if (days.isEmpty()) return 0;

        LocalDate cursor = LocalDate.now();
        if (!days.contains(cursor)) {
            cursor = cursor.minusDays(1); // streak is still alive if the last activity was yesterday
        }

        int streak = 0;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
