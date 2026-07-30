package com.preptracker.server.dto;

// A single KPI tile's value plus its trend vs. the prior 30-day period.
// trend is a relative % change for count-based KPIs (users, tests) and a
// percentage-point difference for rate-based KPIs (accuracy, pass rate).
// 0 when there isn't enough data in the prior period to compare against.
public record KpiDTO(double value, double trend) {}
