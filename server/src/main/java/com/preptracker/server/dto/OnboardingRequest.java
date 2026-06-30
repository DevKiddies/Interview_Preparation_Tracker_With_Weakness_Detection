package com.preptracker.server.dto;

// Request body for POST /api/users/onboarding.
// Collects the user's goal information shown during the first-login onboarding flow.
// focusTopics arrives as a List and is stored as a comma-separated string in UserProfile.

import lombok.Data;
import java.util.List;

@Data
public class OnboardingRequest {
    private String targetCompany;
    private String interviewDate;
    private String experienceLevel;
    private List<String> focusTopics;
    private String username;
    private String avatarUrl;
}