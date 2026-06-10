package com.preptracker.server.service;

import com.preptracker.server.dto.OnboardingRequest;
import com.preptracker.server.dto.UpdatePasswordRequest;
import com.preptracker.server.dto.UpdateUsernameRequest;
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

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUsername(UUID id, UpdateUsernameRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (userRepository.existsByUsername(request.getNewUsername())) {
            throw new RuntimeException("Username '" + request.getNewUsername() + "' is already taken");
        }

        user.setUsername(request.getNewUsername());
        return userRepository.save(user);
    }

    public void updatePassword(UUID id, UpdatePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void completeOnboarding(UUID userId, OnboardingRequest request) {
        // 1. Save/update profile in user_profiles table
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile()); 

        profile.setUserId(userId);
        profile.setTargetCompany(request.getTargetCompany());
        profile.setInterviewDate(request.getInterviewDate());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setFocusTopics(String.join(",", request.getFocusTopics()));
        userProfileRepository.save(profile);

        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsOnboarded(true);
        userRepository.save(user);
    }
}