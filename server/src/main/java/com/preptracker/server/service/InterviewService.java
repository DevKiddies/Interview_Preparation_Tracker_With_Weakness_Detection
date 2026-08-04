package com.preptracker.server.service;

// Business logic behind GET /api/interviews and interview result marking.
// The interviews table stores only the track definition (target company, dates,
// status); the aggregate stats the UI shows (confidence, accuracy, questions
// solved, weak topics, duration) are computed here on the fly by folding in the
// user's test_attempts/user_attempts that fall inside the interview's date
// window [start_date, interview_date].
//
// Also owns the "keep interviews in sync with onboarding" flow: when a goal is
// saved (POST /api/users/onboarding), upsertFromOnboarding() updates the user's
// active interview (or creates a fresh ACTIVE track if none is open). When a
// result is confirmed (SELECTED / NOT_SELECTED / ARCHIVED / DELETED), the active
// track is closed accordingly.

import com.preptracker.server.dto.InterviewDTO;
import com.preptracker.server.model.ConfidenceState;
import com.preptracker.server.model.Interview;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.Topic;
import com.preptracker.server.model.UserAttempt;
import com.preptracker.server.model.UserProfile;
import com.preptracker.server.repository.InterviewRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TopicRepository;
import com.preptracker.server.repository.UserAttemptRepository;
import com.preptracker.server.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private static final List<ConfidenceState> WEAK_STATES = List.of(
            ConfidenceState.BLIND_SPOT, ConfidenceState.CLEAR_WEAKNESS);

    private final InterviewRepository interviewRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final TopicRepository topicRepository;
    private final UserProfileRepository userProfileRepository;
    private final DashboardStatsService dashboardStatsService;

    public List<InterviewDTO> getInterviews(UUID userId) {
        List<Interview> interviews = interviewRepository.findByUserIdOrderByStartDateDesc(userId);
        if (interviews.isEmpty()) return List.of();

        List<TestAttempt> attempts = testAttemptRepository.findByUserId(userId);
        if (attempts.isEmpty()) return interviews.stream().map(i -> toDTO(i, List.of())).toList();

        // Only fold in attempts that fall inside an interview window.
        List<Long> relevantIds = attempts.stream().map(TestAttempt::getId).toList();
        List<UserAttempt> allUserAttempts = userAttemptRepository.findByTestAttemptIdIn(relevantIds);
        Map<Long, List<UserAttempt>> byAttempt = allUserAttempts.stream()
                .collect(Collectors.groupingBy(UserAttempt::getTestAttemptId));

        Map<Long, String> topicNames = topicNames(allUserAttempts);

        List<InterviewDTO> result = new ArrayList<>();
        for (Interview i : interviews) {
            LocalDate start = i.getStartDate();
            LocalDate end = i.getInterviewDate();
            List<TestAttempt> inWindow = attempts.stream()
                    .filter(a -> inWindow(a.getTakenAt(), start, end))
                    .toList();
            List<UserAttempt> uas = inWindow.stream()
                    .flatMap(a -> byAttempt.getOrDefault(a.getId(), List.of()).stream())
                    .toList();
            result.add(toDTO(i, inWindow, uas, topicNames));
        }
        return result;
    }

    // Closes the current preparation: snapshots the live goal (from user_profiles)
    // into an immutable interviews row and, except for DELETED, clears the goal so
    // a new prep cycle can begin. This table is history only — it never holds an
    // ACTIVE row, and nothing in it is ever mutated after creation.
    @Transactional
    public InterviewDTO snapshotCurrentGoal(UUID userId, String result) {
        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);

        if ("DELETED".equals(result)) {
            // Delete = "don't record this cycle". Just clear the goal.
            if (profile != null) clearGoal(profile);
            return null;
        }

        String targetCompany = profile == null ? null : profile.getTargetCompany();
        if (targetCompany == null || targetCompany.isBlank()) {
            // No active goal to snapshot — nothing to record.
            return null;
        }

        // Freeze readiness BEFORE clearing, so it reflects the goal being closed.
        Integer readiness = dashboardStatsService.interviewReadiness(userId);

        Interview snapshot = new Interview();
        snapshot.setUserId(userId);
        snapshot.setTargetCompany(targetCompany);
        snapshot.setExperienceLevel(profile.getExperienceLevel());
        snapshot.setStartDate(profile.getStartDate());
        snapshot.setInterviewDate(profile.getInterviewDate());
        snapshot.setFocusTopics(profile.getFocusTopics());
        snapshot.setResult(result);
        snapshot.setStatus("ARCHIVED".equals(result) ? "ARCHIVED" : "COMPLETED");
        snapshot.setInterviewReadiness(readiness == null ? null : BigDecimal.valueOf(readiness));
        Interview saved = interviewRepository.save(snapshot);

        if (profile != null) clearGoal(profile);

        return getInterviews(userId).stream()
                .filter(dto -> dto.id().equals(saved.getId()))
                .findFirst().orElse(null);
    }

    // Wipes the current goal off the profile so the prep card reads empty and the
    // next interview starts from a clean slate. History is untouched.
    private void clearGoal(UserProfile profile) {
        profile.setTargetCompany(null);
        profile.setExperienceLevel(null);
        profile.setInterviewDate(null);
        profile.setFocusTopics(null);
        profile.setStartDate(null);
        userProfileRepository.save(profile);
    }

    // ---- helpers ----

    private InterviewDTO toDTO(Interview i, List<TestAttempt> inWindow, List<UserAttempt> uas,
                               Map<Long, String> topicNames) {
        List<UserAttempt> answered = uas.stream()
                .filter(ua -> ua.getConfidenceState() != ConfidenceState.NOT_ATTEMPTED)
                .toList();

        Integer confidence = answered.isEmpty() ? null
                : (int) Math.round(answered.stream().mapToInt(UserAttempt::getConfidenceScore)
                .average().orElse(0));
        Integer accuracy = inWindow.isEmpty() ? null
                : (int) Math.round(inWindow.stream().mapToDouble(TestAttempt::getAccuracy)
                .average().orElse(0));
        Integer questionsSolved = uas.isEmpty() ? null : answered.size();
        Integer duration = computeDuration(i);
        List<String> weakTopics = weakTopics(answered, topicNames);

        return new InterviewDTO(
                i.getId(),
                i.getTargetCompany(),
                i.getExperienceLevel(),
                i.getStartDate(),
                i.getInterviewDate(),
                i.getFocusTopics() == null || i.getFocusTopics().isBlank()
                        ? List.of()
                        : List.of(i.getFocusTopics().split(",")),
                i.getStatus(),
                i.getResult(),
                confidence,
                accuracy,
                questionsSolved,
                duration,
                weakTopics,
                i.getInterviewReadiness() == null ? null : i.getInterviewReadiness().intValue()
        );
    }

    private InterviewDTO toDTO(Interview i, List<TestAttempt> inWindow) {
        return toDTO(i, inWindow, List.of(), Map.of());
    }

    private Integer computeDuration(Interview i) {
        if (i.getStartDate() == null) return null;
        LocalDate end = i.getInterviewDate() != null ? i.getInterviewDate() : LocalDate.now();
        if (end.isBefore(i.getStartDate())) end = LocalDate.now();
        return (int) ChronoUnit.DAYS.between(i.getStartDate(), end);
    }

    private List<String> weakTopics(List<UserAttempt> answered, Map<Long, String> topicNames) {
        Map<String, int[]> byTopic = new LinkedHashMap<>();
        for (UserAttempt ua : answered) {
            if (!WEAK_STATES.contains(ua.getConfidenceState())) continue;
            String name = topicNames.getOrDefault(ua.getTopicId(), "Unknown");
            byTopic.computeIfAbsent(name, k -> new int[]{0, 0})[0]++;
            byTopic.get(name)[1]++;
        }
        return byTopic.entrySet().stream()
                .filter(e -> e.getValue()[0] > 0)
                .sorted((a, b) -> Integer.compare(b.getValue()[0], a.getValue()[0]))
                .map(Map.Entry::getKey)
                .toList();
    }

    private Map<Long, String> topicNames(List<UserAttempt> userAttempts) {
        if (userAttempts.isEmpty()) return Map.of();
        List<Long> ids = userAttempts.stream().map(UserAttempt::getTopicId)
                .distinct().toList();
        Map<Long, String> names = new HashMap<>();
        for (Topic t : topicRepository.findAllById(ids)) names.put(t.getId(), t.getName());
        return names;
    }

    private boolean inWindow(LocalDateTime takenAt, LocalDate start, LocalDate end) {
        if (takenAt == null) return false;
        LocalDateTime s = start != null ? start.atStartOfDay() : null;
        LocalDateTime e = end != null ? end.plusDays(1).atStartOfDay() : null;
        if (s != null && takenAt.isBefore(s)) return false;
        return e == null || !takenAt.isAfter(e);
    }
}
