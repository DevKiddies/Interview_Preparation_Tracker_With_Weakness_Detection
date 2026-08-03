package com.preptracker.server.dto;

import java.util.List;

// Payload for the admin User Reports page (GET /api/admin/analytics/users):
// headline stats, 12-month growth, demographic breakdowns, engagement tiers,
// and the top-performers leaderboard.
public record AdminUserReportsDTO(
        long totalUsers,
        long newThisMonth,
        double retentionRate,
        double avgTestsPerUser,
        List<UserGrowthPointDTO> monthlyGrowth,
        List<CountBreakdownDTO> experienceLevels,
        List<CountBreakdownDTO> authProviders,
        List<CountBreakdownDTO> targetCompanies,
        List<CountBreakdownDTO> engagementTiers,
        List<TopPerformerDTO> topPerformers
) {}
