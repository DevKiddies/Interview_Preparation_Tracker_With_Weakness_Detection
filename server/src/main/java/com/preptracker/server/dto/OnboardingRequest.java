package com.preptracker.server.dto;

// Request body for POST /api/users/onboarding.
// Collects the user's goal information shown during the first-login onboarding flow.
// focusTopics arrives as a List and is stored as a comma-separated string in UserProfile.
// The endpoint is called once per completed step; 'completed' is true only for the
// final submit, which is what marks the user onboarded.

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
    private boolean completed;
}