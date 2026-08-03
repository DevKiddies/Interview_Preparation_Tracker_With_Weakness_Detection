package com.preptracker.server.service;

import com.preptracker.server.dto.CategoryConfidenceDTO;
import java.util.List;

import com.preptracker.server.dto.DashboardStatsDTO;
import com.preptracker.server.dto.ai.UserAnalysisContext;
import com.preptracker.server.model.User;
import com.preptracker.server.model.UserProfile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AiCoachService {

        private final GeminiService geminiService;
        private final UserService userService;
        private final DashboardStatsService dashboardStatsService;

        public AiCoachService(
                        GeminiService geminiService,
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
                DashboardStatsDTO stats = dashboardStatsService.getStats(userId);
                var categoryConfidence = dashboardStatsService.getCategoryConfidence(userId);

                List<String> strongTopics = categoryConfidence.stream()
                                .filter(category -> category.confidence() != null && category.confidence() >= 70)
                                .map(CategoryConfidenceDTO::name)
                                .toList();

                List<String> weakTopics = categoryConfidence.stream()
                                .filter(category -> category.confidence() != null
                                                && category.confidence() < 50)
                                .map(CategoryConfidenceDTO::name)
                                .toList();

                UserAnalysisContext context = new UserAnalysisContext();

                context.setUsername(user.getUsername());

                context.setTotalTests(stats.testsAttempted());
                context.setQuestionsSolved(stats.questionsSolved());

                if (stats.overallAccuracy() != null) {
                        context.setAverageScore(stats.overallAccuracy());
                }
                if (stats.overallConfidence() != null) {
                        context.setAverageConfidence(stats.overallConfidence());
                }
                context.setStrongTopics(strongTopics);
                context.setWeakTopics(weakTopics);
                if (profile != null) {
                        context.setTargetRole(profile.getTargetCompany());
                }

                context.setCurrentQuestion(userQuestion);

                String prompt = buildPrompt(context);

                System.out.println("========== AI PROMPT ==========");
                System.out.println(prompt);
                System.out.println("================================");

                return geminiService.generateResponse(prompt);
        }

        private String buildPrompt(UserAnalysisContext context) {

                StringBuilder prompt = new StringBuilder();

                prompt.append("""
                                You are an expert AI Interview Preparation Coach.

                                Your job is to analyze the student's interview preparation data and answer based on that data.

                                Guidelines:
                                - Personalize every response using the student's statistics.
                                - Mention strong topics when they are relevant.
                                - Encourage improvement on weak topics when appropriate.
                                - If the user asks for a study plan, prioritize weak topics first.
                                - Keep responses practical, concise, and actionable.
                                - If the question is unrelated to interview preparation, answer briefly and steer the conversation back toward interview preparation.

                                Student Profile:

                                """);

                prompt.append("Student Name: ")
                                .append(context.getUsername())
                                .append("\n");

                prompt.append("Target Role: ")
                                .append(context.getTargetRole())
                                .append("\n");

                prompt.append("Total Tests Attempted: ")
                                .append(context.getTotalTests())
                                .append("\n");

                prompt.append("Questions Solved: ")
                                .append(context.getQuestionsSolved())
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