package com.preptracker.server.model;

// One row = one interview preparation track for a user (a goal like "Get into
// FAANG by March"). Mirrors the data the interview-history UI renders.
// Derived stats (confidence, accuracy, questions solved, weak topics, duration)
// are computed at read time from test_attempts/user_attempts within the
// interview's date window — this table only stores the track definition.
// status: ACTIVE / COMPLETED / ARCHIVED. result: SELECTED / NOT_SELECTED /
// ARCHIVED / DELETED (set when the user marks the outcome on the settings page).

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
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "target_company")
    private String targetCompany;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column
    private String result;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
