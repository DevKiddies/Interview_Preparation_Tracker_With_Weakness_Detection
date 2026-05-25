package com.preptracker.server.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.preptracker.server.dto.UpdatePasswordRequest;
import com.preptracker.server.dto.UpdateUsernameRequest;
import com.preptracker.server.model.User;
import com.preptracker.server.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor  // Lombok generates constructor injection (same style as AuthController)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Injected from SecurityConfig @Bean

    // READ - Get user by ID
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // UPDATE - Change username
    public User updateUsername(UUID id, UpdateUsernameRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (userRepository.existsByUsername(request.getNewUsername())) {
            throw new RuntimeException("Username '" + request.getNewUsername() + "' is already taken");
        }

        user.setUsername(request.getNewUsername());
        return userRepository.save(user); // @UpdateTimestamp on updatedAt auto-fires here
    }

    // UPDATE - Change password
    public void updatePassword(UUID id, UpdatePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // BCrypt check against stored hashed password (from your SecurityConfig)
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // DELETE - Remove user
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}