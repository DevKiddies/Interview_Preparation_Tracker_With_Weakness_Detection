package com.preptracker.server.dto;

// One month's worth of platform activity, for the Platform Overview growth chart.
public record MonthlyPointDTO(
        String month,
        long newUsers,
        long testsRun,
        double avgAccuracy,
        double passRate
) {}
