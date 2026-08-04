package com.preptracker.server.model;

// Stores the onboarding data collected from a user after their first login.
// Kept separate from the User entity because not every user completes onboarding,
// and this data can be updated independently without touching core auth fields.
// focusTopics is stored as a comma-separated string (e.g. "DSA,System Design").

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column
    private String targetCompany;

    @Column
    private LocalDate interviewDate;

    // The day this current goal began (first time a target company was set).
    // Kept stable across edits; cleared when the goal is cleared. Copied into the
    // interview snapshot at closure so history reports an accurate duration.
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column
    private String experienceLevel;

    // comma-separated list e.g. "DSA,System Design,OS" — split on the frontend before rendering.
    // TEXT so there's no implicit cap on how many focus topics a user can select.
    @Column(columnDefinition = "TEXT")
    private String focusTopics;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
