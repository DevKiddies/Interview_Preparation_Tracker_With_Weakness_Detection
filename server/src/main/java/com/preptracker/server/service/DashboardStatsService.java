package com.preptracker.server.service;

// Builds the aggregate numbers behind the four dashboard stat cards from the
// current user's persisted attempts. The heavy lifting (confidence, accuracy,
// counts, week-over-week deltas) happens inside a single GROUP BY query so only
// one small result row crosses the wire; the study streak is derived from the
// distinct dates the user took any test.

import com.preptracker.server.dto.AccuracyHeatmapRowDTO;
import com.preptracker.server.dto.BlindSpotDTO;
import com.preptracker.server.dto.CategoryConfidenceDTO;
import com.preptracker.server.dto.ConfidenceNodeDTO;
import com.preptracker.server.dto.ConfidenceTreeDTO;
import com.preptracker.server.dto.DashboardStatsDTO;
import com.preptracker.server.dto.TrendPointDTO;
import com.preptracker.server.model.Category;
import com.preptracker.server.model.UserProfile;
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
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardStatsService {

    private static final int WEEK_DAYS = 7;

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
            return new DashboardStatsDTO(null, null, 0, computeStreak(attemptTimestamps), null, null, 0);
        }

        Object[] row = rows.get(0);
        Integer confidence = round(row[0]);
        Integer accuracy = round100(row[1]);
        int solved = ((Number) row[2]).intValue();
        int solvedThisWeek = ((Number) row[3]).intValue();
        Integer recentConf = round(row[4]);
        Integer prevConf = round(row[5]);
        Integer recentAcc = round100(row[6]);
        Integer prevAcc = round100(row[7]);

        return new DashboardStatsDTO(
                confidence, accuracy, solved, computeStreak(attemptTimestamps),
                delta(recentConf, prevConf), delta(recentAcc, prevAcc), solvedThisWeek);
    }

    public List<CategoryConfidenceDTO> getCategoryConfidence(UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thisStart = now.minusDays(WEEK_DAYS);
        LocalDateTime prevStart = now.minusDays(2L * WEEK_DAYS);

        List<Object[]> rows = userAttemptRepository.findCategoryConfidence(userId, thisStart, prevStart);
        List<CategoryConfidenceDTO> out = new ArrayList<>();
        for (Object[] r : rows) {
            Long id = ((Number) r[0]).longValue();
            String name = (String) r[1];
            Integer confidence = round(r[2]);
            int weakTopics = ((Number) r[3]).intValue();
            int questionCount = ((Number) r[4]).intValue();
            Integer recentConf = round(r[5]);
            Integer prevConf = round(r[6]);
            out.add(new CategoryConfidenceDTO(id, name, confidence, weakTopics,
                    trendOf(recentConf, prevConf), questionCount));
        }
        return out;
    }

    // Full category → topic → technique tree with per-node confidence, accuracy
    // and question counts, for the Confidence Explorer. Built from three small
    // aggregate queries plus the (tiny) reference tables, all merged in memory.
    public ConfidenceTreeDTO getConfidenceTree(UUID userId) {
        Map<Long, Integer> topicConfidence = new HashMap<>();
        Map<Long, Integer> topicAccuracy = new HashMap<>();
        Map<Long, Integer> topicQuestions = new HashMap<>();
        for (Object[] r : userAttemptRepository.findTopicStats(userId)) {
            Long topicId = ((Number) r[0]).longValue();
            topicConfidence.put(topicId, round(r[1]));
            topicAccuracy.put(topicId, round100(r[2]));
            topicQuestions.put(topicId, ((Number) r[3]).intValue());
        }

        // topicId -> (techniqueId -> [confidence, accuracy, questionCount])
        // scoped to the topic the attempt actually happened in.
        Map<Long, Map<Long, double[]>> techniqueStatsByTopic = new HashMap<>();
        for (Object[] r : userAttemptRepository.findTechniqueStatsByTopic(userId)) {
            Long topicId = ((Number) r[0]).longValue();
            Long techniqueId = ((Number) r[1]).longValue();
            double conf = r[2] == null ? Double.NaN : ((Number) r[2]).doubleValue();
            double acc = r[3] == null ? Double.NaN : ((Number) r[3]).doubleValue();
            int count = ((Number) r[4]).intValue();
            techniqueStatsByTopic.computeIfAbsent(topicId, k -> new HashMap<>())
                    .put(techniqueId, new double[]{conf, acc, count});
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
            topicsByCategory.computeIfAbsent(categoryId, k -> new ArrayList<>()).add(new ConfidenceNodeDTO(
                    topicId, topicName, "topic",
                    topicConfidence.get(topicId),
                    topicAccuracy.get(topicId),
                    topicQuestions.getOrDefault(topicId, 0),
                    techniques));

            // Attach techniques to this topic (as their canonical parent) using
            // stats scoped to THIS topic's attempts.
            Map<Long, double[]> topicTechniqueStats = techniqueStatsByTopic.getOrDefault(topicId, Map.of());
            for (Map.Entry<Long, Long> e : techniqueParent.entrySet()) {
                if (e.getValue().equals(topicId)) {
                    Long techniqueId = e.getKey();
                    double[] s = topicTechniqueStats.get(techniqueId);
                    techniques.add(new ConfidenceNodeDTO(
                            techniqueId, techniqueNames.getOrDefault(techniqueId, "Technique"), "technique",
                            s == null || Double.isNaN(s[0]) ? null : (int) Math.round(s[0]),
                            s == null || Double.isNaN(s[1]) ? null : (int) Math.round(s[1] * 100),
                            s == null ? 0 : (int) s[2],
                            null));
                }
            }

            // "General Questions" row capturing everything the technique rows
            // above don't, so the topic's totals reconcile exactly. Computed as
            // the remainder in Java (never trusting SQL membership) because a
            // technique's canonical parent may live in another topic.
            int techniqueQuestions = 0;
            double techniqueConfWeighted = 0;
            int techniqueConfCount = 0;
            double techniqueAccWeighted = 0;
            int techniqueAccCount = 0;
            for (ConfidenceNodeDTO t : techniques) {
                techniqueQuestions += t.questionCount();
                if (t.confidence() != null) {
                    techniqueConfWeighted += (double) t.confidence() * t.questionCount();
                    techniqueConfCount += t.questionCount();
                }
                if (t.accuracy() != null) {
                    techniqueAccWeighted += (double) t.accuracy() * t.questionCount();
                    techniqueAccCount += t.questionCount();
                }
            }
            int topicTotal = topicQuestions.getOrDefault(topicId, 0);
            int generalQuestions = topicTotal - techniqueQuestions;
            if (generalQuestions > 0) {
                Integer topicConf = topicConfidence.get(topicId);
                Integer topicAcc = topicAccuracy.get(topicId);
                Integer generalConf = null;
                Integer generalAcc = null;
                if (topicConf != null) {
                    if (techniqueConfCount == topicTotal) {
                        generalConf = topicConf; // degenerate: only listed techniques
                    } else {
                        generalConf = (int) Math.round((topicConf * topicTotal - techniqueConfWeighted) / generalQuestions);
                    }
                }
                if (topicAcc != null) {
                    if (techniqueAccCount == topicTotal) {
                        generalAcc = topicAcc; // degenerate: only listed techniques
                    } else {
                        generalAcc = (int) Math.round((topicAcc * topicTotal - techniqueAccWeighted) / generalQuestions);
                    }
                }
                techniques.add(new ConfidenceNodeDTO(
                        -1L, "General Questions", "general",
                        generalConf, generalAcc, generalQuestions, null));
            }
        }

        // Aggregate category-level confidence from topic stats (simple mean for
        // consistency with the category confidence) and accuracy weighted by
        // question count (reflects actual progress).
        Map<Long, List<Integer>> categoryConfidences = new HashMap<>();
        Map<Long, Integer> categoryQuestions = new HashMap<>();
        Map<Long, Double> categoryAccuracy = new HashMap<>();
        for (Map.Entry<Long, List<ConfidenceNodeDTO>> e : topicsByCategory.entrySet()) {
            for (ConfidenceNodeDTO t : e.getValue()) {
                categoryQuestions.merge(e.getKey(), t.questionCount(), Integer::sum);
                if (t.confidence() != null) {
                    categoryConfidences.computeIfAbsent(e.getKey(), k -> new ArrayList<>()).add(t.confidence());
                }
                if (t.accuracy() != null) {
                    categoryAccuracy.merge(e.getKey(), (double) t.accuracy() * t.questionCount(), Double::sum);
                }
            }
        }

        List<ConfidenceNodeDTO> categories = new ArrayList<>();
        for (Category c : categoryRepository.findAll()) {
            List<ConfidenceNodeDTO> topics = topicsByCategory.getOrDefault(c.getId(), new ArrayList<>());
            List<Integer> confs = categoryConfidences.get(c.getId());
            Integer confidence = (confs == null || confs.isEmpty()) ? null
                    : (int) Math.round(confs.stream().mapToInt(Integer::intValue).average().orElse(0));
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
