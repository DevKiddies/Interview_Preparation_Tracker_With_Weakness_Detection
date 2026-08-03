package com.preptracker.server.service;

// Builds the aggregate numbers behind the four dashboard stat cards from the
// current user's persisted attempts. The heavy lifting (confidence, accuracy,
// counts, week-over-week deltas) happens inside a single GROUP BY query so only
// one small result row crosses the wire; the study streak is derived from the
// distinct dates the user took any test.

import com.preptracker.server.dto.AccuracyHeatmapRowDTO;
import com.preptracker.server.dto.ActivityDayDTO;
import com.preptracker.server.dto.ActivityHeatmapDTO;
import com.preptracker.server.dto.BlindSpotDTO;
import com.preptracker.server.dto.CategoryConfidenceDTO;
import com.preptracker.server.dto.ConfidenceNodeDTO;
import com.preptracker.server.dto.ConfidenceTreeDTO;
import com.preptracker.server.dto.DashboardStatsDTO;
import com.preptracker.server.dto.TrendPointDTO;
import com.preptracker.server.model.Category;
import com.preptracker.server.repository.CategoryRepository;
import com.preptracker.server.repository.TechniqueTopicRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TopicRepository;
import com.preptracker.server.repository.UserAttemptRepository;
import com.preptracker.server.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardStatsService {

    private static final int WEEK_DAYS = 7;

    // How many distinct answered questions it takes before a topic's behavioral
    // confidence is treated as fully credible. A user who answered 1 question
    // gets only ~10% of that confidence displayed; someone who answered 10+
    // distinct questions gets the full amount. This is deliberately based on
    // EVIDENCE COLLECTED, not on the question bank size, so adding more
    // questions to a topic never lowers a user's displayed confidence.
    private static final int EVIDENCE_TARGET = 10;

    private final UserAttemptRepository userAttemptRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;
    private final TechniqueTopicRepository techniqueTopicRepository;
    private final UserProfileRepository userProfileRepository;
public DashboardStatsDTO getStats(UUID userId) {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime thisStart = now.minusDays(WEEK_DAYS);
    LocalDateTime prevStart = now.minusDays(2L * WEEK_DAYS);

    List<Object[]> rows = userAttemptRepository.findDashboardStats(userId, thisStart, prevStart);
    List<LocalDateTime> attemptTimestamps = testAttemptRepository.findDistinctAttemptTimestamps(userId);

    if (rows == null || rows.isEmpty()) {
        return new DashboardStatsDTO(
                null,
                null,
                0, // testsAttempted
                0, // questionsSolved
                computeStreak(attemptTimestamps),
                null,
                null,
                0
        );
    }

    Object[] row = rows.get(0);

    Integer confidence = round(row[0]);
    Integer accuracy = round100(row[1]);

    int testsAttempted = ((Number) row[2]).intValue();
    int solved = ((Number) row[3]).intValue();
    int solvedThisWeek = ((Number) row[4]).intValue();

    Integer recentConf = round(row[5]);
    Integer prevConf = round(row[6]);
    Integer recentAcc = round100(row[7]);
    Integer prevAcc = round100(row[8]);

    return new DashboardStatsDTO(
            confidence,
            accuracy,
            testsAttempted,
            solved,
            computeStreak(attemptTimestamps),
            delta(recentConf, prevConf),
            delta(recentAcc, prevAcc),
            solvedThisWeek
    );
}

    public List<CategoryConfidenceDTO> getCategoryConfidence(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisStart = now.minusDays(WEEK_DAYS);
        LocalDateTime prevStart = now.minusDays(2L * WEEK_DAYS);

        // Per-topic confidence across all attempts, plus the full topic→category
        // mapping, so a category's confidence can reflect how much of the
        // category the user has actually covered (see coverageConfidence). Topic
        // confidence here is already evidence-weighted so the category mean
        // matches what the Confidence Explorer tree shows.
        Map<Long, Integer> topicConfidence = new HashMap<>();
        Map<Long, Integer> topicAccuracy = new HashMap<>();
        Map<Long, Integer> topicQuestions = new HashMap<>();
        for (Object[] r : userAttemptRepository.findTopicStats(userId)) {
            Long topicId = ((Number) r[0]).longValue();
            int distinct = ((Number) r[4]).intValue();
            topicConfidence.put(topicId, weightConfidence(round(r[1]), distinct));
            topicAccuracy.put(topicId, round100(r[2]));
            topicQuestions.put(topicId, ((Number) r[3]).intValue());
        }
        Map<Long, List<Long>> topicsByCategory = new HashMap<>();
        for (Object[] r : topicRepository.findAllWithCategory()) {
            topicsByCategory.computeIfAbsent(((Number) r[2]).longValue(), k -> new ArrayList<>())
                    .add(((Number) r[0]).longValue());
        }

        List<Object[]> rows = userAttemptRepository.findCategoryConfidence(userId, thisStart, prevStart);

        // Aggregate rows only cover categories the user has attempts in, but the
        // chart shows EVERY category, so merge per-category aggregates into a map
        // and fall back to zeros for categories with no activity yet.
        Map<Long, Object[]> aggregateById = new HashMap<>();
        for (Object[] r : rows) {
            aggregateById.put(((Number) r[0]).longValue(), r);
        }

        List<CategoryConfidenceDTO> out = new ArrayList<>();
        for (Category category : categoryRepository.findAll()) {
            Long id = category.getId();
            Object[] r = aggregateById.get(id);
            int weakTopics = r == null ? 0 : ((Number) r[3]).intValue();
            int questionCount = r == null ? 0 : ((Number) r[4]).intValue();
            Integer recentConf = r == null ? null : round(r[5]);
            Integer prevConf = r == null ? null : round(r[6]);

            // Category accuracy mirrors the Confidence Explorer tree: weighted by
            // attempts across EVERY topic in the category (attempted or not), null
            // when the category has no attempts yet.
            double accWeighted = 0;
            int accCount = 0;
            for (Long topicId : topicsByCategory.getOrDefault(id, List.of())) {
                Integer acc = topicAccuracy.get(topicId);
                int q = topicQuestions.getOrDefault(topicId, 0);
                if (acc != null) {
                    accWeighted += acc * q;
                    accCount += q;
                }
            }
            Integer accuracy = accCount == 0 ? null : (int) Math.round(accWeighted / accCount);

            out.add(new CategoryConfidenceDTO(id, category.getName(),
                    coverageConfidence(topicsByCategory.getOrDefault(id, List.of()), topicConfidence),
                    accuracy,
                    weakTopics, trendOf(recentConf, prevConf), questionCount));
        }
        // Keep the data-first ordering the SQL used to provide (most questions
        // attempted at the top) now that empty categories are included too.
        out.sort(Comparator.comparingInt(CategoryConfidenceDTO::questionCount).reversed());
        return out;
    }

    // Mean confidence across EVERY topic in the category, counting topics the
    // user has never attempted (or has no answered confidence for) as 0%.
    // Claiming 90% confidence in a category should require ~90% topic coverage,
    // not just high scores on the handful of topics that were attempted.
    private Integer coverageConfidence(List<Long> topicIds, Map<Long, Integer> topicConfidence) {
        if (topicIds.isEmpty()) return null;
        double sum = 0;
        for (Long topicId : topicIds) {
            Integer conf = topicConfidence.get(topicId);
            sum += conf == null ? 0 : conf;
        }
        return (int) Math.round(sum / topicIds.size());
    }

    // Scales a raw behavioral confidence down until the user has enough evidence
    // (distinct answered questions) to back it up. A single answered question is
    // not enough to claim "100% confident" — the original bug — so a topic with
    // 1 answer shows ~10% until more questions are answered. Uses a linear ramp
    // to EVIDENCE_TARGET: smooth, no arbitrary bands, never above the raw value,
    // and independent of how many questions exist in the topic's bank.
    private Integer weightConfidence(Integer rawConfidence, int distinctAnswered) {
        if (rawConfidence == null) return null;
        double weight = Math.min(1.0, distinctAnswered / (double) EVIDENCE_TARGET);
        return (int) Math.round(rawConfidence * weight);
    }

    // Full category → topic → technique tree with per-node confidence, accuracy
    // and question counts, for the Confidence Explorer. Built from three small
    // aggregate queries plus the (tiny) reference tables, all merged in memory.
    public ConfidenceTreeDTO getConfidenceTree(UUID userId) {
        Map<Long, Integer> topicConfidence = new HashMap<>();
        Map<Long, Integer> topicAccuracy = new HashMap<>();
        Map<Long, Integer> topicQuestions = new HashMap<>();
        Map<Long, Integer> topicDistinctAnswered = new HashMap<>();
        for (Object[] r : userAttemptRepository.findTopicStats(userId)) {
            Long topicId = ((Number) r[0]).longValue();
            topicConfidence.put(topicId, round(r[1]));
            topicAccuracy.put(topicId, round100(r[2]));
            topicQuestions.put(topicId, ((Number) r[3]).intValue());
            topicDistinctAnswered.put(topicId, ((Number) r[4]).intValue());
        }

        // topicId -> (techniqueId -> [confidence, accuracy, questionCount,
        // distinctAnswered]) scoped to the topic the attempt actually happened in.
        Map<Long, Map<Long, double[]>> techniqueStatsByTopic = new HashMap<>();
        for (Object[] r : userAttemptRepository.findTechniqueStatsByTopic(userId)) {
            Long topicId = ((Number) r[0]).longValue();
            Long techniqueId = ((Number) r[1]).longValue();
            double conf = r[2] == null ? Double.NaN : ((Number) r[2]).doubleValue();
            double acc = r[3] == null ? Double.NaN : ((Number) r[3]).doubleValue();
            int count = ((Number) r[4]).intValue();
            int distinct = ((Number) r[5]).intValue();
            techniqueStatsByTopic.computeIfAbsent(topicId, k -> new HashMap<>())
                    .put(techniqueId, new double[]{conf, acc, count, distinct});
        }

        // technique_id -> topic_id (a technique can hang under several topics,
        // keep the first encountered as the canonical parent for the explorer).
        Map<Long, Long> techniqueParent = new HashMap<>();
        Map<Long, String> techniqueNames = new HashMap<>();
        for (Object[] r : techniqueTopicRepository.findAllWithTopicAndName()) {
            Long techniqueId = ((Number) r[0]).longValue();
            techniqueParent.putIfAbsent(techniqueId, ((Number) r[1]).longValue());
            techniqueNames.putIfAbsent(techniqueId, (String) r[2]);
        }

        // category_id -> list of [topicId, topicName]
        Map<Long, List<ConfidenceNodeDTO>> topicsByCategory = new HashMap<>();
        for (Object[] r : topicRepository.findAllWithCategory()) {
            Long topicId = ((Number) r[0]).longValue();
            String topicName = (String) r[1];
            Long categoryId = ((Number) r[2]).longValue();

            List<ConfidenceNodeDTO> techniques = new ArrayList<>();
            int topicDistinct = topicDistinctAnswered.getOrDefault(topicId, 0);
            topicsByCategory.computeIfAbsent(categoryId, k -> new ArrayList<>()).add(new ConfidenceNodeDTO(
                    topicId, topicName, "topic",
                    weightConfidence(topicConfidence.get(topicId), topicDistinct),
                    topicAccuracy.get(topicId),
                    topicQuestions.getOrDefault(topicId, 0),
                    techniques));

            // Collect this topic's attached techniques first, accumulating the
            // RAW (unweighted) stats so the "General Questions" remainder can be
            // computed exactly as before and still reconcile the topic's totals.
            Map<Long, double[]> topicTechniqueStats = techniqueStatsByTopic.getOrDefault(topicId, Map.of());
            List<Long> attachedTechniques = new ArrayList<>();
            for (Map.Entry<Long, Long> e : techniqueParent.entrySet()) {
                if (e.getValue().equals(topicId)) attachedTechniques.add(e.getKey());
            }

            int techniqueQuestions = 0;
            int techniqueDistinct = 0;
            double techniqueConfWeighted = 0;
            int techniqueConfCount = 0;
            double techniqueAccWeighted = 0;
            int techniqueAccCount = 0;
            for (Long techniqueId : attachedTechniques) {
                double[] s = topicTechniqueStats.get(techniqueId);
                int q = s == null ? 0 : (int) s[2];
                techniqueQuestions += q;
                techniqueDistinct += s == null ? 0 : (int) s[3];
                if (s != null && !Double.isNaN(s[0])) {
                    techniqueConfWeighted += s[0] * q;
                    techniqueConfCount += q;
                }
                if (s != null && !Double.isNaN(s[1])) {
                    techniqueAccWeighted += s[1] * 100 * q;
                    techniqueAccCount += q;
                }
            }

            // "General Questions" row capturing everything the technique rows
            // above don't, so the topic's totals reconcile exactly. Computed as
            // the remainder in Java (never trusting SQL membership) because a
            // technique's canonical parent may live in another topic.
            int topicTotal = topicQuestions.getOrDefault(topicId, 0);
            int generalQuestions = topicTotal - techniqueQuestions;
            Integer generalRawConf = null;
            Integer generalAcc = null;
            if (generalQuestions > 0) {
                Integer topicConf = topicConfidence.get(topicId);
                Integer topicAcc = topicAccuracy.get(topicId);
                if (topicConf != null) {
                    if (techniqueConfCount == topicTotal) {
                        generalRawConf = topicConf; // degenerate: only listed techniques
                    } else {
                        generalRawConf = (int) Math.round((topicConf * topicTotal - techniqueConfWeighted) / generalQuestions);
                    }
                }
                if (topicAcc != null) {
                    if (techniqueAccCount == topicTotal) {
                        generalAcc = topicAcc; // degenerate: only listed techniques
                    } else {
                        generalAcc = (int) Math.round((topicAcc * topicTotal - techniqueAccWeighted) / generalQuestions);
                    }
                }
            }
            // Evidence left over for the general bucket once the attached
            // techniques have claimed theirs (per-technique distinct counts).
            int generalEvidence = Math.max(0, topicDistinct - techniqueDistinct);

            // Attach the techniques (as their canonical parent) using stats
            // scoped to THIS topic's attempts, each weighted by its own evidence.
            for (Long techniqueId : attachedTechniques) {
                double[] s = topicTechniqueStats.get(techniqueId);
                Integer rawConf = s == null || Double.isNaN(s[0]) ? null : (int) Math.round(s[0]);
                techniques.add(new ConfidenceNodeDTO(
                        techniqueId, techniqueNames.getOrDefault(techniqueId, "Technique"), "technique",
                        weightConfidence(rawConf, s == null ? 0 : (int) s[3]),
                        s == null || Double.isNaN(s[1]) ? null : (int) Math.round(s[1] * 100),
                        s == null ? 0 : (int) s[2],
                        null));
            }

            if (generalQuestions > 0) {
                techniques.add(new ConfidenceNodeDTO(
                        -1L, "General Questions", "general",
                        weightConfidence(generalRawConf, generalEvidence),
                        generalAcc, generalQuestions, null));
            }
        }

        // Aggregate category-level confidence from the topic rows (which include
        // every topic, attempted or not). Confidence is coverage-aware: topics
        // the user has never attempted count as 0%, so a category reads ~90%
        // only when ~90% of its topics are actually covered. Accuracy stays
        // question-weighted over attempted questions (reflects actual progress).
        Map<Long, Integer> categoryQuestions = new HashMap<>();
        Map<Long, Double> categoryAccuracy = new HashMap<>();
        for (Map.Entry<Long, List<ConfidenceNodeDTO>> e : topicsByCategory.entrySet()) {
            for (ConfidenceNodeDTO t : e.getValue()) {
                categoryQuestions.merge(e.getKey(), t.questionCount(), Integer::sum);
                if (t.accuracy() != null) {
                    categoryAccuracy.merge(e.getKey(), (double) t.accuracy() * t.questionCount(), Double::sum);
                }
            }
        }

        List<ConfidenceNodeDTO> categories = new ArrayList<>();
        for (Category c : categoryRepository.findAll()) {
            List<ConfidenceNodeDTO> topics = topicsByCategory.getOrDefault(c.getId(), new ArrayList<>());
            Integer confidence = null;
            if (!topics.isEmpty()) {
                double sum = 0;
                for (ConfidenceNodeDTO t : topics) {
                    sum += t.confidence() == null ? 0 : t.confidence();
                }
                confidence = (int) Math.round(sum / topics.size());
            }
            int catQuestions = categoryQuestions.getOrDefault(c.getId(), 0);
            Double accWeighted = categoryAccuracy.get(c.getId());
            Integer accuracy = (accWeighted == null || catQuestions == 0) ? null
                    : (int) Math.round(accWeighted / catQuestions);
            categories.add(new ConfidenceNodeDTO(
                    c.getId(), c.getName(), "category",
                    confidence, accuracy,
                    catQuestions,
                    topics));
        }
        return new ConfidenceTreeDTO(categories);
    }

    // Confidence & accuracy over time for the trend chart. One daily-bucket query
    // feeds all three ranges; 7D keeps per-day points (with gaps for inactive
    // days), 30D rolls those up to 4 weekly points and 90D to 3 monthly points.
    public Map<String, List<TrendPointDTO>> getConfidenceTrend(UUID userId) {
        LocalDateTime start = LocalDateTime.now().minusDays(90);
        List<Object[]> rows = userAttemptRepository.findDailyTrend(userId, start);

        // LocalDate -> [confidence, accuracy, attemptCount]
        Map<LocalDate, double[]> byDay = new HashMap<>();
        for (Object[] r : rows) {
            LocalDate day = ((java.sql.Timestamp) r[0]).toLocalDateTime().toLocalDate();
            double confidence = r[1] == null ? Double.NaN : ((Number) r[1]).doubleValue();
            double accuracy = r[2] == null ? Double.NaN : ((Number) r[2]).doubleValue() * 100;
            int count = ((Number) r[3]).intValue();
            byDay.put(day, new double[]{confidence, accuracy, count});
        }

        Map<String, List<TrendPointDTO>> trend = new LinkedHashMap<>();
        trend.put("7D", dailySeries(byDay, 7));
        trend.put("30D", weeklySeries(byDay, 4));
        trend.put("90D", monthlySeries(byDay, 3));
        return trend;
    }

    // Last `days` days, one point per calendar day (oldest → newest). Days with
    // no attempts yield null confidence/accuracy so the chart shows a gap.
    private List<TrendPointDTO> dailySeries(Map<LocalDate, double[]> byDay, int days) {
        List<TrendPointDTO> out = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            double[] v = byDay.get(day);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            out.add(new TrendPointDTO(label,
                    v == null || Double.isNaN(v[0]) ? null : (int) Math.round(v[0]),
                    v == null || Double.isNaN(v[1]) ? null : (int) Math.round(v[1])));
        }
        return out;
    }

    // Last 4 calendar weeks, one weighted point per week (oldest → newest).
    private List<TrendPointDTO> weeklySeries(Map<LocalDate, double[]> byDay, int weeks) {
        LocalDate today = LocalDate.now();
        // Week boundaries aligned to Monday so the labels read naturally.
        LocalDate end = today;
        int daysBack = end.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue(); // days to last Monday
        LocalDate lastMonday = end.minusDays(daysBack).plusDays(7);
        List<TrendPointDTO> out = new ArrayList<>();
        for (int w = weeks - 1; w >= 0; w--) {
            LocalDate weekEnd = lastMonday.minusDays(7L * w);       // exclusive
            LocalDate weekStart = weekEnd.minusDays(7);              // inclusive
            double[] v = aggregate(byDay, weekStart, weekEnd);
            out.add(new TrendPointDTO("W" + (weeks - w),
                    Double.isNaN(v[0]) ? null : (int) Math.round(v[0]),
                    Double.isNaN(v[1]) ? null : (int) Math.round(v[1])));
        }
        return out;
    }

    // Last 3 calendar months (including the current one), one weighted point per
    // month (oldest → newest).
    private List<TrendPointDTO> monthlySeries(Map<LocalDate, double[]> byDay, int months) {
        // Exclusive end = first day of next month, so the newest bucket covers the
        // current month's attempts.
        LocalDate end = LocalDate.now().withDayOfMonth(1).plusMonths(1);
        List<TrendPointDTO> out = new ArrayList<>();
        for (int m = months - 1; m >= 0; m--) {
            LocalDate monthEnd = end.minusMonths(m);          // exclusive
            LocalDate monthStart = monthEnd.minusMonths(1);   // inclusive
            double[] v = aggregate(byDay, monthStart, monthEnd);
            out.add(new TrendPointDTO("M" + (months - m),
                    Double.isNaN(v[0]) ? null : (int) Math.round(v[0]),
                    Double.isNaN(v[1]) ? null : (int) Math.round(v[1])));
        }
        return out;
    }

    // Weighted mean of confidence & accuracy across [start, end) using each day's
    // attempt count as the weight. Returns NaN for a metric with no data.
    private double[] aggregate(Map<LocalDate, double[]> byDay, LocalDate start, LocalDate end) {
        double confSum = 0, accSum = 0;
        int confWeight = 0, accWeight = 0;
        for (LocalDate d = start; d.isBefore(end); d = d.plusDays(1)) {
            double[] v = byDay.get(d);
            if (v == null) continue;
            if (!Double.isNaN(v[0])) { confSum += v[0] * v[2]; confWeight += v[2]; }
            if (!Double.isNaN(v[1])) { accSum += v[1] * v[2]; accWeight += v[2]; }
        }
        return new double[]{
                confWeight == 0 ? Double.NaN : confSum / confWeight,
                accWeight == 0 ? Double.NaN : accSum / accWeight,
        };
    }

    // Top 7 topics ranked by overconfidence (BLIND_SPOT) events for the
    // "Blind Spot Analysis" widget. Kept at exactly 7 rows to match the chart's
    // fixed layout.
    public List<BlindSpotDTO> getBlindSpots(UUID userId) {
        List<BlindSpotDTO> out = new ArrayList<>();
        for (Object[] r : userAttemptRepository.findBlindSpots(userId)) {
            out.add(new BlindSpotDTO((String) r[0], ((Number) r[1]).intValue()));
        }
        return out;
    }

    // Accuracy per topic and difficulty (easy/medium/hard) for the Accuracy
    // Heatmap widget. Rows are limited to the topics the user selected during
    // onboarding (falling back to every topic if none were selected) so the
    // heatmap reflects what the user actually cares about.
    public List<AccuracyHeatmapRowDTO> getAccuracyHeatmap(UUID userId) {
        // topicId -> accuracy per difficulty (0-100); only difficulties that
        // actually appear in the user's attempts are present.
        Map<Long, double[]> accByTopic = new HashMap<>();
        for (Object[] r : userAttemptRepository.findAccuracyByDifficulty(userId)) {
            Long topicId = ((Number) r[0]).longValue();
            String difficulty = (String) r[1];
            double accuracy = ((Number) r[2]).doubleValue() * 100;
            double[] bucket = accByTopic.computeIfAbsent(topicId, k -> new double[]{-1, -1, -1});
            switch (difficulty) {
                case "easy" -> bucket[0] = accuracy;
                case "medium" -> bucket[1] = accuracy;
                case "hard" -> bucket[2] = accuracy;
                default -> { }
            }
        }

        // All topics, ordered by category then name (mirrors the heatmap layout).
        Map<Long, String> topicName = new LinkedHashMap<>();
        for (Object[] r : topicRepository.findAllWithCategory()) {
            topicName.put(((Number) r[0]).longValue(), (String) r[1]);
        }

        // Keep only topics the user picked during onboarding, preserving the
        // canonical category/name order.
        java.util.Set<Long> focusIds = new java.util.LinkedHashSet<>();
        userProfileRepository.findByUserId(userId).ifPresent(p -> {
            String raw = p.getFocusTopics();
            if (raw != null && !raw.isBlank()) {
                for (String name : raw.split(",")) {
                    String trimmed = name.trim();
                    topicName.forEach((id, n) -> {
                        if (n.equals(trimmed)) focusIds.add(id);
                    });
                }
            }
        });

        List<AccuracyHeatmapRowDTO> out = new ArrayList<>();
        for (Map.Entry<Long, String> e : topicName.entrySet()) {
            if (!focusIds.isEmpty() && !focusIds.contains(e.getKey())) continue;
            double[] bucket = accByTopic.get(e.getKey());
            out.add(new AccuracyHeatmapRowDTO(
                    e.getValue(),
                    bucket == null || bucket[0] < 0 ? null : (int) Math.round(bucket[0]),
                    bucket == null || bucket[1] < 0 ? null : (int) Math.round(bucket[1]),
                    bucket == null || bucket[2] < 0 ? null : (int) Math.round(bucket[2])));
        }
        return out;
    }

    // Per-day study activity for the profile "Study Consistency" heatmap. Merges
    // per-day attempt stats with per-day test time (test_attempts), then derives
    // current + longest streaks from the days that actually have activity. No
    // synthesized/fabricated data — every number comes from real attempts.
    public ActivityHeatmapDTO getActivityHeatmap(UUID userId) {
        LocalDateTime start = LocalDate.now().minusYears(3).atStartOfDay();

        Map<LocalDate, ActivityDayDTO> byDay = new HashMap<>();
        for (Object[] r : userAttemptRepository.findDailyActivity(userId, start)) {
            LocalDate day = ((java.sql.Timestamp) r[0]).toLocalDateTime().toLocalDate();
            int attempts = ((Number) r[1]).intValue();
            int answered = ((Number) r[2]).intValue();
            Integer confidence = r[3] == null ? null : (int) Math.round(((Number) r[3]).doubleValue());
            Integer accuracy = r[4] == null ? null : (int) Math.round(((Number) r[4]).doubleValue() * 100);
            byDay.put(day, new ActivityDayDTO(day.toString(), attempts, answered, confidence, accuracy, 0));
        }
        for (Object[] r : testAttemptRepository.findDailyStudyTime(userId, start)) {
            LocalDate day = ((java.sql.Timestamp) r[0]).toLocalDateTime().toLocalDate();
            int studySeconds = ((Number) r[1]).intValue();
            ActivityDayDTO dto = byDay.get(day);
            if (dto != null) {
                byDay.put(day, new ActivityDayDTO(dto.date(), dto.attempts(), dto.questions(),
                        dto.confidence(), dto.accuracy(), studySeconds / 60));
            }
        }

        List<ActivityDayDTO> days = new ArrayList<>(byDay.values());
        days.sort(Comparator.comparing(ActivityDayDTO::date));

        List<LocalDate> active = new ArrayList<>();
        for (ActivityDayDTO d : days) {
            if (d.attempts() > 0) active.add(LocalDate.parse(d.date()));
        }
        Set<LocalDate> activeSet = new HashSet<>(active);

        int current = 0;
        if (!activeSet.isEmpty()) {
            // A streak stays alive if the user practiced yesterday but not yet today.
            LocalDate cursor = LocalDate.now();
            if (!activeSet.contains(cursor)) cursor = cursor.minusDays(1);
            while (activeSet.contains(cursor)) {
                current++;
                cursor = cursor.minusDays(1);
            }
        }

        int longest = 0;
        LocalDate prev = null;
        int run = 0;
        for (LocalDate d : active) {
            if (prev != null && d.equals(prev.plusDays(1))) run++;
            else run = 1;
            if (run > longest) longest = run;
            prev = d;
        }

        return new ActivityHeatmapDTO(days, current, longest);
    }

    private String trendOf(Integer recent, Integer prev) {
        if (recent == null || prev == null) return "flat";
        int diff = recent - prev;
        if (diff > 1) return "up";
        if (diff < -1) return "down";
        return "flat";
    }

    private int computeStreak(List<LocalDateTime> attemptTimestamps) {
        if (attemptTimestamps == null || attemptTimestamps.isEmpty()) return 0;

        Map<LocalDate, Boolean> days = new HashMap<>();
        for (LocalDateTime ts : attemptTimestamps) days.put(ts.toLocalDate(), Boolean.TRUE);

        LocalDate cursor = LocalDate.now();
        // A streak stays alive if the user practiced yesterday but not yet today.
        if (!days.containsKey(cursor)) cursor = cursor.minusDays(1);

        int streak = 0;
        while (days.containsKey(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private Integer delta(Integer recent, Integer prev) {
        if (recent == null || prev == null) return null;
        return recent - prev;
    }

    private Integer round(Object value) {
        if (value == null) return null;
        return (int) Math.round(((Number) value).doubleValue());
    }

    private Integer round100(Object value) {
        if (value == null) return null;
        return (int) Math.round(((Number) value).doubleValue() * 100);
    }
}
