package com.preptracker.server.service;

// Business logic behind the admin Platform Overview page: platform-wide KPIs,
// a 12-month activity trend, per-topic performance, and platform health
// percentages — all computed from real persisted rows (users, test_attempts,
// questions, topics) rather than fabricated snapshots.

import com.preptracker.server.dto.AdminPlatformOverviewDTO;
import com.preptracker.server.dto.AdminUserReportsDTO;
import com.preptracker.server.dto.CategoryQuestionCountDTO;
import com.preptracker.server.dto.CountBreakdownDTO;
import com.preptracker.server.dto.DailyActiveDTO;
import com.preptracker.server.dto.KpiDTO;
import com.preptracker.server.dto.MonthlyPointDTO;
import com.preptracker.server.dto.PlatformHealthDTO;
import com.preptracker.server.dto.RecentActivityDTO;
import com.preptracker.server.dto.TopPerformerDTO;
import com.preptracker.server.dto.TopicPerformanceDTO;
import com.preptracker.server.dto.UserGrowthPointDTO;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.Topic;
import com.preptracker.server.model.User;
import com.preptracker.server.model.UserProfile;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TopicRepository;
import com.preptracker.server.repository.UserProfileRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
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
    private static final int TOP_PERFORMERS_LIMIT = 10;

    private final UserRepository userRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final UserProfileRepository userProfileRepository;

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

    public AdminUserReportsDTO getUserReports() {
        List<User> users = userRepository.findAll();
        List<TestAttempt> attempts = testAttemptRepository.findAll();
        Map<UUID, UserProfile> profileByUserId = userProfileRepository.findAll().stream()
                .collect(Collectors.toMap(UserProfile::getUserId, p -> p));
        Map<UUID, List<TestAttempt>> attemptsByUserId = attempts.stream()
                .collect(Collectors.groupingBy(TestAttempt::getUserId));
        LocalDateTime now = LocalDateTime.now();

        YearMonth currentMonth = YearMonth.from(now);
        long newThisMonth = users.stream()
                .filter(u -> u.getCreatedAt() != null && YearMonth.from(u.getCreatedAt()).equals(currentMonth))
                .count();

        long engagedUsers = users.stream()
                .filter(u -> !attemptsByUserId.getOrDefault(u.getId(), List.of()).isEmpty())
                .count();
        double retentionRate = users.isEmpty() ? 0 : round1(100.0 * engagedUsers / users.size());
        double avgTestsPerUser = users.isEmpty() ? 0 : round1((double) attempts.size() / users.size());

        return new AdminUserReportsDTO(
                users.size(),
                newThisMonth,
                retentionRate,
                avgTestsPerUser,
                userGrowth(users, now),
                breakdown(users, u -> profileValue(profileByUserId.get(u.getId()), UserProfile::getExperienceLevel)),
                authProviderBreakdown(users),
                breakdown(users, u -> profileValue(profileByUserId.get(u.getId()), UserProfile::getTargetCompany)),
                engagementTiers(users, attemptsByUserId),
                topPerformers(users, attemptsByUserId)
        );
    }

    // Cumulative total-users-as-of-month-end alongside that month's new signups,
    // for the admin dashboard "User Activity" growth chart (same 12-month
    // window as the Platform Overview growth series).
    public List<UserGrowthPointDTO> getUserGrowth() {
        return userGrowth(userRepository.findAll(), LocalDateTime.now());
    }

    // Per-topic completion & score for the dashboard "Test Completion by Topic"
    // chart — mirrors the Platform Overview topic performance list.
    public List<TopicPerformanceDTO> getTopicPerformance() {
        return topicPerformance(testAttemptRepository.findAll());
    }

    // Question coverage / onboarding / email-verification percentages for the
    // dashboard's Platform Health section.
    public PlatformHealthDTO getPlatformHealth() {
        return platformHealth(userRepository.findAll());
    }

    // Per-day count of users whose last_active_at landed on that day, for the
    // "Daily Active" bar chart. Includes zero-fill days so the axis reads cleanly.
    public List<DailyActiveDTO> getDailyActive(int days) {
        List<User> users = userRepository.findAll();
        LocalDate today = LocalDate.now();

        Map<LocalDate, Long> counts = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            counts.put(today.minusDays(i), 0L);
        }
        for (User u : users) {
            if (u.getLastActiveAt() == null) continue;
            LocalDate day = u.getLastActiveAt().toLocalDate();
            counts.computeIfPresent(day, (k, v) -> v + 1);
        }

        return counts.entrySet().stream()
                .map(e -> new DailyActiveDTO(
                        e.getKey().format(java.time.format.DateTimeFormatter.ofPattern("MMM d")),
                        e.getValue()))
                .toList();
    }

    // Question bank size per category, for the dashboard's distribution pie.
    // Only categories that actually contain questions appear.
    public List<CategoryQuestionCountDTO> getQuestionsByCategory() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (var q : questionRepository.findAll()) {
            String name = q.getCategory() != null ? q.getCategory().getName() : "Uncategorized";
            counts.merge(name, 1L, Long::sum);
        }
        return counts.entrySet().stream()
                .map(e -> new CategoryQuestionCountDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(CategoryQuestionCountDTO::count).reversed())
                .toList();
    }

    // Latest platform events for the "Recent Activity" feed: newest signups,
    // completed test attempts, and applied bans, merged and sorted newest-first.
    public List<RecentActivityDTO> getRecentActivity(int limit) {
        List<User> users = userRepository.findAll();
        List<TestAttempt> attempts = testAttemptRepository.findAll();

        List<RecentActivityDTO> items = new ArrayList<>();

        for (User u : users) {
            if (u.getCreatedAt() != null) {
                items.add(new RecentActivityDTO(
                        "user_registered",
                        "New user registered",
                        u.getEmail(),
                        relativeTime(u.getCreatedAt()),
                        "success"));
            }
            if (Boolean.TRUE.equals(u.getIsBanned()) && u.getBannedAt() != null) {
                items.add(new RecentActivityDTO(
                        "user_banned",
                        "User account suspended",
                        u.getEmail() + (u.getBanReason() == null ? "" : " — " + u.getBanReason()),
                        relativeTime(u.getBannedAt()),
                        "warning"));
            }
        }

        for (TestAttempt a : attempts) {
            items.add(new RecentActivityDTO(
                    "test_completed",
                    "Test attempt submitted",
                    (a.getCategory() == null ? "Mock test" : a.getCategory())
                            + " — " + round1(a.getAccuracy()) + "% accuracy",
                    relativeTime(a.getTakenAt()),
                    "info"));
        }

        // Events aren't stored with a single shared timestamp column, so sort by
        // the raw age embedded in each relative string (works because the feed
        // is recent and we build the strings from real timestamps below).
        items.sort(Comparator.comparingLong(AdminAnalyticsService::ageMillis));
        return items.stream().limit(limit).toList();
    }

    // Seconds since epoch, extracted from a relative time string ("5 min ago").
    // Used purely to order the recent-activity feed newest-first.
    private static long ageMillis(RecentActivityDTO dto) {
        String time = dto.time();
        try {
            if (time.endsWith(" min ago")) {
                return Long.parseLong(time.split(" ")[0]) * 60_000L;
            }
            if (time.endsWith(" hr ago")) {
                return Long.parseLong(time.split(" ")[0]) * 3_600_000L;
            }
            if (time.endsWith(" days ago")) {
                return Long.parseLong(time.split(" ")[0]) * 86_400_000L;
            }
            if (time.endsWith(" sec ago")) {
                return Long.parseLong(time.split(" ")[0]) * 1_000L;
            }
        } catch (NumberFormatException ignored) { }
        return Long.MAX_VALUE;
    }

    // "5 min ago" style label for a past timestamp.
    private static String relativeTime(LocalDateTime at) {
        Duration d = Duration.between(at, LocalDateTime.now());
        long seconds = Math.max(0, d.getSeconds());
        if (seconds < 60) return "just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + " min ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + " hr ago";
        long days = hours / 24;
        return days == 1 ? "1 day ago" : days + " days ago";
    }

    // Cumulative total-users-as-of-month-end alongside that month's new signups,
    // for the User Growth area chart (two series, same 12-month window as Platform Overview).
    private List<UserGrowthPointDTO> userGrowth(List<User> users, LocalDateTime now) {
        YearMonth current = YearMonth.from(now);
        List<UserGrowthPointDTO> points = new ArrayList<>();
        for (int i = MONTHS_OF_HISTORY - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
            LocalDateTime start = ym.atDay(1).atStartOfDay();

            long newUsers = users.stream().filter(u -> inRange(u.getCreatedAt(), start, end)).count();
            long totalUsers = users.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isBefore(end)).count();

            points.add(new UserGrowthPointDTO(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), newUsers, totalUsers));
        }
        return points;
    }

    private String profileValue(UserProfile profile, java.util.function.Function<UserProfile, String> getter) {
        String value = profile != null ? getter.apply(profile) : null;
        return (value == null || value.isBlank()) ? "unspecified" : value;
    }

    private List<CountBreakdownDTO> breakdown(List<User> users, java.util.function.Function<User, String> classifier) {
        Map<String, Long> counts = users.stream().collect(Collectors.groupingBy(classifier, Collectors.counting()));
        return counts.entrySet().stream()
                .map(e -> new CountBreakdownDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(CountBreakdownDTO::count).reversed())
                .toList();
    }

    // A user can be linked to multiple providers (authProvider stores them
    // comma-separated, e.g. "LOCAL,GOOGLE"), so counts here can sum to more than
    // the total user count.
    private List<CountBreakdownDTO> authProviderBreakdown(List<User> users) {
        Map<String, Long> counts = new java.util.LinkedHashMap<>();
        for (User u : users) {
            if (u.getAuthProvider() == null) continue;
            for (String provider : u.getAuthProvider().split(",")) {
                String key = provider.trim();
                if (!key.isEmpty()) counts.merge(key, 1L, Long::sum);
            }
        }
        return counts.entrySet().stream()
                .map(e -> new CountBreakdownDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(CountBreakdownDTO::count).reversed())
                .toList();
    }

    private List<CountBreakdownDTO> engagementTiers(List<User> users, Map<UUID, List<TestAttempt>> attemptsByUserId) {
        long power = 0, active = 0, moderate = 0, casual = 0, inactive = 0;
        for (User u : users) {
            int count = attemptsByUserId.getOrDefault(u.getId(), List.of()).size();
            if (count >= 10) power++;
            else if (count >= 5) active++;
            else if (count >= 2) moderate++;
            else if (count == 1) casual++;
            else inactive++;
        }
        return List.of(
                new CountBreakdownDTO("Power Users", power),
                new CountBreakdownDTO("Active", active),
                new CountBreakdownDTO("Moderate", moderate),
                new CountBreakdownDTO("Casual", casual),
                new CountBreakdownDTO("Inactive", inactive)
        );
    }

    private List<TopPerformerDTO> topPerformers(List<User> users, Map<UUID, List<TestAttempt>> attemptsByUserId) {
        record Scored(User user, List<TestAttempt> attempts, double avgScore) {}

        List<Scored> scored = users.stream()
                .map(u -> new Scored(u, attemptsByUserId.getOrDefault(u.getId(), List.of()), 0.0))
                .filter(s -> !s.attempts().isEmpty())
                .map(s -> new Scored(s.user(), s.attempts(), round1(avgAccuracy(s.attempts()))))
                .sorted(Comparator.comparingDouble(Scored::avgScore).reversed())
                .limit(TOP_PERFORMERS_LIMIT)
                .toList();

        List<TopPerformerDTO> result = new ArrayList<>();
        for (int i = 0; i < scored.size(); i++) {
            Scored s = scored.get(i);
            result.add(new TopPerformerDTO(
                    i + 1, s.user().getUsername(), s.user().getEmail(),
                    s.attempts().size(), s.avgScore(), computeStreak(s.attempts()), dominantTopic(s.attempts())
            ));
        }
        return result;
    }

    private String dominantTopic(List<TestAttempt> attempts) {
        return attempts.stream()
                .filter(a -> a.getCategory() != null && !a.getCategory().isBlank())
                .collect(Collectors.groupingBy(TestAttempt::getCategory, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    // Consecutive days (walking back from today) with at least one test attempt — mirrors AdminUserService.computeStreak.
    private int computeStreak(List<TestAttempt> attempts) {
        var attemptDates = attempts.stream().map(a -> a.getTakenAt().toLocalDate()).collect(Collectors.toSet());

        LocalDate day = LocalDate.now();
        if (!attemptDates.contains(day)) {
            day = day.minusDays(1);
            if (!attemptDates.contains(day)) return 0;
        }

        int streak = 0;
        while (attemptDates.contains(day)) {
            streak++;
            day = day.minusDays(1);
        }
        return streak;
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
                .collect(Collectors.groupingBy(q -> q.getTopic().getId(), Collectors.counting()));
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
