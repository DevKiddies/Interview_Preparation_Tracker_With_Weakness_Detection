package com.preptracker.server.dto;

// Full payload for the admin Analytics > Platform Overview page.
import java.util.List;

public record AdminPlatformOverviewDTO(
        KpiDTO totalUsers,
        KpiDTO totalTests,
        KpiDTO avgAccuracy,
        KpiDTO passRate,
        long totalQuestions,
        long activeThisWeek,
        List<MonthlyPointDTO> monthlyGrowth,
        List<TopicPerformanceDTO> topicPerformance,
        PlatformHealthDTO platformHealth
) {}
