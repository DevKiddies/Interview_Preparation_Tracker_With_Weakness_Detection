package com.preptracker.server.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    private long totalUsers;
    private long totalQuestions;
    private long totalUsersActiveToday;
    private long totalTestsTaken;
    private double averageScore;
    private long bannedUsers;

    private double averageSessionDuration;// in minutes
    private double questionPassRate;
    private double testCompletionRate;

    // ── Chart data (real, computed from persisted rows) ─────────────────────

    private List<UserGrowthPointDTO> userGrowth;
    private List<DailyActiveDTO> dailyActive;
    private List<CategoryQuestionCountDTO> questionsByCategory;
    private List<TopicPerformanceDTO> topicPerformance;
    private PlatformHealthDTO platformHealth;
    private List<RecentActivityDTO> recentActivity;
}
