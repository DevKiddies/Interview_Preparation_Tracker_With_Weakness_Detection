package com.preptracker.server.service;

import com.preptracker.server.model.User;
import com.preptracker.server.model.UserSession;
import com.preptracker.server.repository.UserRepository;
import com.preptracker.server.repository.UserSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new login session for the user.
     * logoutTime remains null until the user explicitly logs out.
     */
    @Transactional
    public void startSession(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        UserSession session = new UserSession();
        session.setUser(user);
        session.setLoginTime(LocalDateTime.now());

        userSessionRepository.save(session);
    }

    /**
     * Closes the user's current active session.
     * If no active session exists, nothing happens.
     */
    @Transactional
    public void endSession(UUID userId) {
        userSessionRepository
                .findTopByUserIdAndLogoutTimeIsNullOrderByLoginTimeDesc(userId)
                .ifPresent(session -> {
                    session.setLogoutTime(LocalDateTime.now());
                    userSessionRepository.save(session);
                });
    }

    public Double getAverageSessionDurationMinutes() {
        Double average = userSessionRepository.getAverageSessionDuration();
    
        if (average == null) {
            return 0.0;
        }
    
        return average / 60.0;
    }
}