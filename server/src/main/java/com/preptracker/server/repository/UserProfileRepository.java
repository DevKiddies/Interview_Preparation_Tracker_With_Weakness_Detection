package com.preptracker.server.repository;

// Database access layer for the UserProfile entity.
// The main query here is findByUserId, used to load or update a user's onboarding
// data (target company, interview date, focus topics, etc.).

import com.preptracker.server.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByUserId(UUID userId);
}