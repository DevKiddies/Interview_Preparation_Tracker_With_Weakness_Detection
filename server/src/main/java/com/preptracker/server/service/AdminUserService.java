package com.preptracker.server.service;

// Business logic behind the admin "All Users" and "Banned Users" pages:
// listing users with derived activity stats, and banning/unbanning accounts.

import com.preptracker.server.dto.AdminBanUserRequest;
import com.preptracker.server.dto.AdminBannedUserDTO;
import com.preptracker.server.dto.AdminUserDTO;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.User;
import com.preptracker.server.model.UserProfile;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.UserProfileRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final int ACTIVE_WITHIN_DAYS = 7;

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final BannedUserService bannedUserService;

    public List<AdminUserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        Map<UUID, UserProfile> profilesByUserId = profilesByUserId();
        Map<UUID, List<TestAttempt>> attemptsByUserId = attemptsByUserId();

        return users.stream()
                .map(u -> toDTO(u, profilesByUserId.get(u.getId()), attemptsByUserId.getOrDefault(u.getId(), List.of())))
                .toList();
    }

    public List<AdminBannedUserDTO> getBannedUsers() {
        Map<UUID, List<TestAttempt>> attemptsByUserId = attemptsByUserId();

        return userRepository.findAll().stream()
                .filter(this::hasActiveBan)
                .map(u -> toBannedDTO(u, attemptsByUserId.getOrDefault(u.getId(), List.of())))
                .toList();
    }

    public void banUser(UUID userId, AdminBanUserRequest request, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setIsBanned(true);
        user.setBanReason(request.reason());
        user.setBanNote(request.note());
        user.setBannedAt(LocalDateTime.now());
        user.setBannedBy(adminUsername);
        user.setBanCount(user.getBanCount() + 1);
        user.setBanExpiresAt("permanent".equals(request.duration())
                ? null
                : LocalDateTime.now().plusDays(Long.parseLong(request.duration())));
        userRepository.save(user);

        // Makes the ban take effect on this user's very next request, even though
        // their existing JWT is still cryptographically valid until it expires.
        bannedUserService.ban(userId, user.getBanExpiresAt());
    }

    public void unbanUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setIsBanned(false);
        user.setBanExpiresAt(null);
        userRepository.save(user);

        bannedUserService.unban(userId);
    }

    private Map<UUID, UserProfile> profilesByUserId() {
        return userProfileRepository.findAll().stream()
                .collect(Collectors.toMap(UserProfile::getUserId, p -> p));
    }

    private Map<UUID, List<TestAttempt>> attemptsByUserId() {
        return testAttemptRepository.findAll().stream()
                .filter(AdminUserService::notAbandoned)
                .collect(Collectors.groupingBy(TestAttempt::getUserId));
    }

    // ABANDONED sessions (score 0, closed tab) are excluded from user stats so
    // they don't skew tests-attempted, average accuracy or streaks.
    private static boolean notAbandoned(TestAttempt a) {
        return !"ABANDONED".equalsIgnoreCase(a.getCompletionStatus());
    }

    private boolean hasActiveBan(User user) {
        return Boolean.TRUE.equals(user.getIsBanned())
                && (user.getBanExpiresAt() == null || user.getBanExpiresAt().isAfter(LocalDateTime.now()));
    }

    private AdminUserDTO toDTO(User user, UserProfile profile, List<TestAttempt> attempts) {
        int testsAttempted = attempts.size();
        int avgScore = averageAccuracy(attempts);

        LocalDateTime lastActive = user.getLastActiveAt() != null ? user.getLastActiveAt() : user.getCreatedAt();

        return new AdminUserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                lastActive,
                deriveStatus(user, lastActive),
                Boolean.TRUE.equals(user.getIsVerified()),
                testsAttempted,
                avgScore,
                computeStreak(attempts),
                profile != null ? profile.getTargetCompany() : null,
                profile != null ? profile.getExperienceLevel() : null
        );
    }

    private AdminBannedUserDTO toBannedDTO(User user, List<TestAttempt> attempts) {
        boolean permanent = user.getBanExpiresAt() == null;
        Integer daysRemaining = permanent ? null
                : (int) Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), user.getBanExpiresAt().toLocalDate()));

        return new AdminBannedUserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getBanReason(),
                permanent ? "permanent" : "temporary",
                user.getBannedAt(),
                user.getBannedBy(),
                user.getBanExpiresAt(),
                daysRemaining,
                Math.max(0, user.getBanCount() - 1),
                attempts.size(),
                averageAccuracy(attempts),
                0 // no user-report/abuse-flagging feature yet — placeholder until that's built
        );
    }

    private int averageAccuracy(List<TestAttempt> attempts) {
        return attempts.isEmpty() ? 0 : (int) Math.round(
                attempts.stream().mapToDouble(TestAttempt::getAccuracy).average().orElse(0.0));
    }

    private String deriveStatus(User user, LocalDateTime lastActive) {
        if (hasActiveBan(user)) return "banned";
        return lastActive.isAfter(LocalDateTime.now().minusDays(ACTIVE_WITHIN_DAYS)) ? "active" : "inactive";
    }

    // Counts consecutive days (walking back from today) that have at least one test attempt.
    private int computeStreak(List<TestAttempt> attempts) {
        if (attempts.isEmpty()) return 0;

        var attemptDates = attempts.stream()
                .map(a -> a.getTakenAt().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate day = LocalDate.now();
        if (!attemptDates.contains(day)) {
            day = day.minusDays(1);
            if (!attemptDates.contains(day)) return 0;
        }

        int streak = 0;
        while (attemptDates.contains(day)) {
            streak++;
            day = day.minusDays(1);
        }
        return streak;
    }
}
