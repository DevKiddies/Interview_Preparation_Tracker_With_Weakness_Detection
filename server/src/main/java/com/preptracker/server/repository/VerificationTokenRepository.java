package com.preptracker.server.repository;

import com.preptracker.server.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByOtp(String otp);
    Optional<VerificationToken> findByUserId(UUID userId);
    boolean existsByOtp(String otp);
    Optional<VerificationToken> findByUsed(boolean used);
}
