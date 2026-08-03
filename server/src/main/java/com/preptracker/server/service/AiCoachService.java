package com.preptracker.server.service;

import com.preptracker.server.dto.ai.UserAnalysisContext;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.preptracker.server.model.User;
import com.preptracker.server.model.UserProfile;
import java.util.UUID;

@Service
public class AiCoachService {

        private final GeminiService geminiService;
        private final UserService userService;
        private final DashboardStatsService dashboardStatsService;

        public AiCoachService(GeminiService geminiService,
                      UserService userService,
                      DashboardStatsService dashboardStatsService) {

    this.geminiService = geminiService;
    this.userService = userService;
    this.dashboardStatsService = dashboardStatsService;
}

        private String getCurrentUserId() {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                return (String) authentication.getPrincipal();
        }

        public String generateFeedback(String userQuestion) {

                UUID userId = UUID.fromString(getCurrentUserId());

                User user = userService.getUserById(userId);
                UserProfile profile = userService.getUserProfile(userId);

                UserAnalysisContext context = new UserAnalysisContext();

                context.setUsername(user.getUsername());
                if (profile != null) {
                        context.setTargetRole(profile.getTargetCompany());
                }
                context.setCurrentQuestion(userQuestion);

                return geminiService.generateResponse(buildPrompt(context));
        }

        private String buildPrompt(UserAnalysisContext context) {

                StringBuilder prompt = new StringBuilder();

                prompt.append("You are an AI Interview Preparation Coach.\n\n");

                prompt.append("Student Name: ")
                                .append(context.getUsername())
                                .append("\n");

                prompt.append("Target Role: ")
                                .append(context.getTargetRole())
                                .append("\n");

                prompt.append("Total Tests Attempted: ")
                                .append(context.getTotalTests())
                                .append("\n");

                prompt.append("Average Score: ")
                                .append(context.getAverageScore())
                                .append("%\n");

                prompt.append("Average Confidence: ")
                                .append(context.getAverageConfidence())
                                .append("%\n");

                prompt.append("Strong Topics: ")
                                .append(context.getStrongTopics())
                                .append("\n");

                prompt.append("Weak Topics: ")
                                .append(context.getWeakTopics())
                                .append("\n\n");

                prompt.append("User Question:\n");
                prompt.append(context.getCurrentQuestion());

                return prompt.toString();
        }
}