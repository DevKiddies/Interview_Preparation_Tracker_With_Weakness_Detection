package com.preptracker.server.service;

// Business logic behind the admin Platform Overview page: platform-wide KPIs,
// a 12-month activity trend, per-topic performance, and platform health
// percentages — all computed from real persisted rows (users, test_attempts,
// questions, topics) rather than fabricated snapshots.

import com.preptracker.server.dto.AdminPlatformOverviewDTO;
import com.preptracker.server.dto.KpiDTO;
import com.preptracker.server.dto.MonthlyPointDTO;
import com.preptracker.server.dto.PlatformHealthDTO;
import com.preptracker.server.dto.TopicPerformanceDTO;
import com.preptracker.server.model.Question;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.Topic;
import com.preptracker.server.model.User;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TopicRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    // A test attempt below this accuracy is considered a fail — matches AdminTestResultService.
    private static final int PASS_THRESHOLD = 50;
    // A topic needs at least this many questions to count as "covered".
    private static final int MIN_QUESTIONS_PER_TOPIC = 3;
    // "Active" mirrors AdminUserService's definition (last_active_at, falling
    // back to signup date, within a week) so the two pages agree on the word.
    private static final int ACTIVE_WITHIN_DAYS = 7;
    private static final int TREND_WINDOW_DAYS = 30;
    private static final int MONTHS_OF_HISTORY = 12;

    private final UserRepository userRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;

    public AdminPlatformOverviewDTO getOverview() {
        List<User> users = userRepository.findAll();
        List<TestAttempt> attempts = testAttemptRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long totalQuestions = questionRepository.count();
        long activeThisWeek = users.stream()
                .filter(u -> !Boolean.TRUE.equals(u.getIsBanned()))
                .filter(u -> lastActive(u).isAfter(now.minusDays(ACTIVE_WITHIN_DAYS)))
                .count();

        LocalDateTime windowStart = now.minusDays(TREND_WINDOW_DAYS);
        LocalDateTime prevWindowStart = now.minusDays(2L * TREND_WINDOW_DAYS);

        long usersLast = users.stream().filter(u -> inRange(u.getCreatedAt(), windowStart, now)).count();
        long usersPrev = users.stream().filter(u -> inRange(u.getCreatedAt(), prevWindowStart, windowStart)).count();

        List<TestAttempt> attemptsLast = attempts.stream().filter(a -> inRange(a.getTakenAt(), windowStart, now)).toList();
        List<TestAttempt> attemptsPrev = attempts.stream().filter(a -> inRange(a.getTakenAt(), prevWindowStart, windowStart)).toList();

        KpiDTO totalUsersKpi = new KpiDTO(users.size(), relativeTrendPct(usersLast, usersPrev));
        KpiDTO totalTestsKpi = new KpiDTO(attempts.size(), relativeTrendPct(attemptsLast.size(), attemptsPrev.size()));
        KpiDTO avgAccuracyKpi = new KpiDTO(round1(avgAccuracy(attempts)), pointTrend(avgAccuracy(attemptsLast), avgAccuracy(attemptsPrev), attemptsLast, attemptsPrev));
        KpiDTO passRateKpi = new KpiDTO(round1(passRate(attempts)), pointTrend(passRate(attemptsLast), passRate(attemptsPrev), attemptsLast, attemptsPrev));

        return new AdminPlatformOverviewDTO(
                totalUsersKpi, totalTestsKpi, avgAccuracyKpi, passRateKpi,
                totalQuestions, activeThisWeek,
                monthlyGrowth(users, attempts, now),
                topicPerformance(attempts),
                platformHealth(users)
        );
    }

    private List<MonthlyPointDTO> monthlyGrowth(List<User> users, List<TestAttempt> attempts, LocalDateTime now) {
        YearMonth current = YearMonth.from(now);
        List<MonthlyPointDTO> points = new ArrayList<>();
        for (int i = MONTHS_OF_HISTORY - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();

            long newUsers = users.stream().filter(u -> inRange(u.getCreatedAt(), start, end)).count();
            List<TestAttempt> monthAttempts = attempts.stream().filter(a -> inRange(a.getTakenAt(), start, end)).toList();

            points.add(new MonthlyPointDTO(
                    ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    newUsers, monthAttempts.size(),
                    round1(avgAccuracy(monthAttempts)), round1(passRate(monthAttempts))
            ));
        }
        return points;
    }

    private List<TopicPerformanceDTO> topicPerformance(List<TestAttempt> attempts) {
        Map<String, List<TestAttempt>> byTopic = attempts.stream()
                .filter(a -> a.getCategory() != null && !a.getCategory().isBlank())
                .collect(Collectors.groupingBy(TestAttempt::getCategory));

        return byTopic.entrySet().stream()
                .map(e -> new TopicPerformanceDTO(
                        e.getKey(), round1(avgAccuracy(e.getValue())), e.getValue().size(), round1(passRate(e.getValue()))))
                .sorted(Comparator.comparingLong(TopicPerformanceDTO::attempts).reversed())
                .toList();
    }

    private PlatformHealthDTO platformHealth(List<User> users) {
        double onboardingRate = users.isEmpty() ? 0
                : 100.0 * users.stream().filter(u -> Boolean.TRUE.equals(u.getIsOnboarded())).count() / users.size();
        double emailVerificationRate = users.isEmpty() ? 0
                : 100.0 * users.stream().filter(u -> Boolean.TRUE.equals(u.getIsVerified())).count() / users.size();

        List<Topic> topics = topicRepository.findAll();
        Map<Long, Long> questionsPerTopic = questionRepository.findAll().stream()
                .collect(Collectors.groupingBy(Question::getTopicId, Collectors.counting()));
        double questionCoverage = topics.isEmpty() ? 0
                : 100.0 * topics.stream().filter(t -> questionsPerTopic.getOrDefault(t.getId(), 0L) >= MIN_QUESTIONS_PER_TOPIC).count() / topics.size();

        return new PlatformHealthDTO(round1(questionCoverage), round1(onboardingRate), round1(emailVerificationRate));
    }

    private LocalDateTime lastActive(User u) {
        return u.getLastActiveAt() != null ? u.getLastActiveAt() : u.getCreatedAt();
    }

    private boolean inRange(LocalDateTime t, LocalDateTime startInclusive, LocalDateTime endExclusive) {
        return t != null && !t.isBefore(startInclusive) && t.isBefore(endExclusive);
    }

    private double avgAccuracy(List<TestAttempt> list) {
        return list.isEmpty() ? 0 : list.stream().mapToDouble(TestAttempt::getAccuracy).average().orElse(0);
    }

    private double passRate(List<TestAttempt> list) {
        return list.isEmpty() ? 0 : 100.0 * list.stream().filter(a -> a.getAccuracy() >= PASS_THRESHOLD).count() / list.size();
    }

    private double relativeTrendPct(long current, long previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return round1(100.0 * (current - previous) / previous);
    }

    // Percentage-point difference between two rate values — only meaningful
    // when both windows actually have data, otherwise 0 rather than a
    // misleading swing against an empty baseline.
    private double pointTrend(double currentRate, double previousRate, List<TestAttempt> current, List<TestAttempt> previous) {
        if (current.isEmpty() || previous.isEmpty()) return 0;
        return round1(currentRate - previousRate);
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
