package com.preptracker.server.dto;

// Platform-wide health percentages for the admin Platform Overview page.
// There's no "test completion rate" here (started-but-abandoned tests aren't
// persisted — a TestAttempt row only ever represents a finished submission),
// unlike the old mock which fabricated one.
public record PlatformHealthDTO(
        double questionCoverage,      // % of topics with at least a handful of questions
        double onboardingRate,        // % of users who completed onboarding
        double emailVerificationRate  // % of users with a verified email
) {}
