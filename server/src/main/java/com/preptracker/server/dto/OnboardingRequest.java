package com.preptracker.server.dto;

import lombok.Data;
import java.util.List;

@Data
public class OnboardingRequest {
    private String targetCompany;
    private String interviewDate;
    private String experienceLevel;
    private List<String> focusTopics;
}