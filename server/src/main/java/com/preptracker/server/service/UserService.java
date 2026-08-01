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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserProfileRepository userProfileRepository;
    private final InterviewService interviewService;

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
        profile.setInterviewDate(request.getInterviewDate());
        return userProfileRepository.save(profile);
    }

    public void completeOnboarding(UUID userId, OnboardingRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());

        profile.setUserId(userId);
        profile.setTargetCompany(request.getTargetCompany());
        profile.setInterviewDate(request.getInterviewDate());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setFocusTopics(String.join(",", request.getFocusTopics()));
        userProfileRepository.save(profile);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setIsOnboarded(true);

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

        // Keep interview history in sync: every saved goal becomes (or updates)
        // the user's active interview track; an empty goal archives it.
        interviewService.upsertFromOnboarding(userId, request.getTargetCompany(),
                request.getExperienceLevel(), request.getInterviewDate());
    }
}