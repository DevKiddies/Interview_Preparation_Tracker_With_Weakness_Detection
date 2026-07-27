package com.preptracker.server.repository;

// Database access layer for the VerificationToken entity.
// findByUserIdAndOtp is the core lookup used during OTP verification and password reset.
// findAllByUserId is used when we need to invalidate all existing OTPs before issuing a new one.

import com.preptracker.server.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, UUID> {
    Optional<VerificationToken> findByUserIdAndOtp(UUID userId, String otp);
    List<VerificationToken> findAllByUserId(UUID userId);
}
