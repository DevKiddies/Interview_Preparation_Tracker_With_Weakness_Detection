package com.preptracker.server.service;

import com.preptracker.server.dto.AdminDashboardDTO;
import com.preptracker.server.dto.CategoryQuestionCountDTO;
import com.preptracker.server.dto.DailyActiveDTO;
import com.preptracker.server.dto.PlatformHealthDTO;
import com.preptracker.server.dto.RecentActivityDTO;
import com.preptracker.server.dto.TopicPerformanceDTO;
import com.preptracker.server.dto.UserGrowthPointDTO;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.TestAttemptRepository.QuestionPassRateProjection;
import com.preptracker.server.repository.TestSessionRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

        private final UserRepository userRepository;
        private final QuestionRepository questionRepository;
        private final TestAttemptRepository testAttemptRepository;
        private final TestSessionRepository testSessionRepository;
        private final UserSessionService userSessionService;
        private final AdminAnalyticsService adminAnalyticsService;

        public AdminDashboardDTO getDashboardStats() {

                long totalUsers = userRepository.count();

                long totalQuestions = questionRepository.count();

                long totalUsersActiveToday = userRepository.countByLastActiveAtAfter(
                                LocalDateTime.now().minusDays(1));

                long totalTestsTaken = testAttemptRepository.count();

                Double avg = testAttemptRepository.getAverageAccuracy();
                double averageScore = (avg == null) ? 0.0 : avg;

                // Count the number of banned users
                long bannedUsers = userRepository.countByIsBannedTrue();

                // Calculate average session duration in minutes
                Double averageSessionDuration = userSessionService.getAverageSessionDurationMinutes();

                // Calculate question pass rate
                QuestionPassRateProjection passRateData = testAttemptRepository.getQuestionPassRateData();
                double questionPassRate = 0.0;
                if (passRateData != null
                                && passRateData.getTotalQuestions() != null
                                && passRateData.getTotalQuestions() > 0) {

                        questionPassRate = (passRateData.getTotalCorrect() * 100.0)
                                        / passRateData.getTotalQuestions();
                }

                // Calculate test completion rate
                long totalSessions = testSessionRepository.count();
                long completedSessions = testSessionRepository.countByCompletedTrue();
                double testCompletionRate = 0.0;
                if (totalSessions > 0) {
                        testCompletionRate = (completedSessions * 100.0) / totalSessions;
                }

                // ── Chart data (real, computed from persisted rows) ─────────────
                List<UserGrowthPointDTO> userGrowth = adminAnalyticsService.getUserGrowth();
                List<DailyActiveDTO> dailyActive = adminAnalyticsService.getDailyActive(14);
                List<CategoryQuestionCountDTO> questionsByCategory =
                                adminAnalyticsService.getQuestionsByCategory();
                List<TopicPerformanceDTO> topicPerformance =
                                adminAnalyticsService.getTopicPerformance();
                PlatformHealthDTO platformHealth = adminAnalyticsService.getPlatformHealth();
                List<RecentActivityDTO> recentActivity = adminAnalyticsService.getRecentActivity(10);

                return new AdminDashboardDTO(
                                totalUsers,
                                totalQuestions,
                                totalUsersActiveToday,
                                totalTestsTaken,
                                averageScore,
                                bannedUsers,
                                averageSessionDuration,
                                questionPassRate,
                                testCompletionRate,
                                userGrowth,
                                dailyActive,
                                questionsByCategory,
                                topicPerformance,
                                platformHealth,
                                recentActivity
                );
        }
}
