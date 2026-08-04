package com.preptracker.server.service;

// Business logic for user account management.
// Handles fetching a user by ID, updating username/password, deleting an account,
// and managing the UserProfile (onboarding data + interview date).
// Password changes are blocked for OAuth-only accounts since they have no local password.

import com.preptracker.server.dto.OnboardingRequest;
import com.preptracker.server.dto.UpdateAvatarRequest;
import com.preptracker.server.dto.UpdateInterviewDateRequest;
import com.preptracker.server.dto.UpdatePasswordRequest;
import com.preptracker.server.dto.UpdateUsernameRequest;
import com.preptracker.server.exception.ConflictException;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.exception.UnauthorizedException;
import com.preptracker.server.model.User;
import com.preptracker.server.model.UserProfile;
import com.preptracker.server.repository.UserProfileRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;
    private final NotificationService notificationService;

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User updateUsername(UUID id, UpdateUsernameRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (userRepository.existsByUsername(request.getNewUsername())) {
            throw new ConflictException("Username '" + request.getNewUsername() + "' is already taken");
        }

        user.setUsername(request.getNewUsername());
        return userRepository.save(user);
    }

    public void updatePassword(UUID id, UpdatePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // OAuth users (Google/GitHub) have no local password stored, so we can't let
        // them set one here — they must manage credentials through their provider.
        if (user.getPassword() == null) {
            throw new RuntimeException("Password cannot be changed for OAuth accounts. Use your OAuth provider to manage credentials.");
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new UnauthorizedException("Old password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from the old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.create(user.getId(), "SECURITY", "Password changed",
                "Your password was changed successfully. If this wasn't you, contact support immediately.",
                "/profile/settings");
    }

    public User updateAvatarUrl(UUID id, UpdateAvatarRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    public UserProfile getUserProfile(UUID userId) {
        return userProfileRepository.findByUserId(userId).orElse(null);
    }

    public UserProfile updateInterviewDate(UUID userId, UpdateInterviewDateRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile p = new UserProfile();
                    p.setUserId(userId);
                    return p;
                });
        profile.setInterviewDate(parseDate(request.getInterviewDate()));
        return userProfileRepository.save(profile);
    }

    // Called once per completed onboarding step. Only non-null fields in the request
    // are written, so a stepwise save never wipes out fields collected by earlier
    // steps — and going back to change a value simply overwrites it on the next save.
    // The 'completed' flag gates everything that should happen exactly once: marking
    // the user onboarded and firing the welcome notification.
    //
    // user_profiles is the SINGLE source of truth for the current goal. It is NOT
    // mirrored into the interviews table here — that table is an immutable history
    // of closed interviews, written only when the goal is archived / a result is
    // marked (InterviewService.snapshotCurrentGoal). This removes the old
    // ACTIVE-interview row that duplicated the profile and caused desync bugs.
    public void completeOnboarding(UUID userId, OnboardingRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());

        profile.setUserId(userId);

        boolean alreadyHadGoal = hasGoal(profile);

        // Every caller sends the full goal (target company, experience level,
        // date, focus topics), so a present-but-blank value is an explicit clear —
        // e.g. Danger Zone's "Archive" / "Delete" POST all-empty to wipe the
        // current goal. Only an absent (null) field is skipped, so a partial save
        // never clobbers fields collected by earlier onboarding steps.
        if (request.getTargetCompany() != null) {
            profile.setTargetCompany(blankToNull(request.getTargetCompany()));
        }
        if (request.getInterviewDate() != null) {
            profile.setInterviewDate(parseDate(request.getInterviewDate()));
        }
        if (request.getExperienceLevel() != null) {
            profile.setExperienceLevel(blankToNull(request.getExperienceLevel()));
        }
        if (request.getFocusTopics() != null) {
            profile.setFocusTopics(String.join(",", request.getFocusTopics()));
        }

        // Remember when this goal started (stable across edits), so the eventual
        // history snapshot can report duration. Reset when the goal is cleared.
        if (hasGoal(profile) && !alreadyHadGoal) {
            profile.setStartDate(LocalDate.now());
        } else if (!hasGoal(profile)) {
            profile.setStartDate(null);
        }

        userProfileRepository.save(profile);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equals(user.getUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw new ConflictException("Username '" + newUsername + "' is already taken");
                }
                user.setUsername(newUsername);
            }
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);

        if (!request.isCompleted()) {
            return;
        }

        user.setIsOnboarded(true);
        userRepository.save(user);

        notificationService.create(userId, "ONBOARDING", "You're all set!",
                "Your profile is ready — dive into a mock test tailored to your focus areas.",
                "/practice/mock-tests");
    }

    private LocalDate parseDate(String value) {
        return value != null && !value.isBlank() ? LocalDate.parse(value) : null;
    }

    private boolean hasGoal(UserProfile profile) {
        return profile != null && profile.getTargetCompany() != null
                && !profile.getTargetCompany().isBlank();
    }

    // Normalizes an explicit empty goal field ("") to null so the cleared value
    // is stored as "not set" rather than a blank string.
    private String blankToNull(String value) {
        return value != null && !value.isBlank() ? value : null;
    }
}