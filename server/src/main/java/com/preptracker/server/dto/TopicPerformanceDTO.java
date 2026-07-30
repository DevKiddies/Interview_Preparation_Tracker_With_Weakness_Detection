package com.preptracker.server.dto;

// Aggregate performance for one topic (TestAttempt.category), across every
// persisted attempt tagged with it.
public record TopicPerformanceDTO(
        String topic,
        double avgAccuracy,
        long attempts,
        double passRate
) {}
