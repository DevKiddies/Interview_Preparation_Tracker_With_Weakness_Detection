package com.preptracker.server.model;

// Represents a user account in the system. Supports three login methods:
//   LOCAL  — registered with email + password (verified via OTP)
//   GOOGLE — signed in via Google OAuth
//   GITHUB — signed in via GitHub OAuth
// A user can link multiple providers to one account (authProvider stores them
// comma-separated, e.g. "LOCAL,GOOGLE"). OAuth users have password = null.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    // null for OAuth-only accounts (Google/GitHub) — they don't have a local password
    @Column
    private String password;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "github_id")
    private String githubId;

    // comma-separated when the account is linked to multiple providers, e.g. "LOCAL,GOOGLE"
    @Column(name = "auth_provider", nullable = false)
    private String authProvider = "LOCAL";

    @Column(name = "is_onboarded", nullable = false)
    private Boolean isOnboarded = false;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;
}
