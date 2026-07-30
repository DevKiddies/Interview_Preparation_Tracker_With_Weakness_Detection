package com.preptracker.server.model;

// An admin-defined mock test template (Test Management > All Tests / Create Mock Test).
// categoryId is the top-level subject (DB `categories`, e.g. "DSA"); the specific
// topics it draws from live in the `test_topics` join table (see TestTopic).
// NOTE: test_attempts has no FK back to this table yet — attemptCount/avgScore
// can't be computed from real data until that linkage exists (see AdminMockTestService).

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount;

    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes;

    @Column(nullable = false)
    private String difficulty; // "Easy" | "Medium" | "Hard" | "Mixed"

    @Column(name = "difficulty_easy", nullable = false)
    private Integer difficultyEasy;

    @Column(name = "difficulty_medium", nullable = false)
    private Integer difficultyMedium;

    @Column(name = "difficulty_hard", nullable = false)
    private Integer difficultyHard;

    @Column(nullable = false)
    private Boolean randomize;

    @Column(nullable = false)
    private String status; // "Active" | "Draft"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
