package com.preptracker.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// Stores OTP tokens for two flows: email verification (after registration) and password reset.
// Both flows share this same table — the context is inferred by how the token is used.
// Once consumed, tokens are marked used=true rather than deleted, so a replayed OTP
// is rejected even if someone intercepts it after it was already accepted.
@Entity
@Table(name="verification_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean used = false;
}
