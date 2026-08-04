package com.preptracker.server.model;

// A record of one completed test submission, persisted so the admin panel (and
// eventually weakness-detection features) can compute per-user history like
// tests attempted, average score, and activity streaks.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "test_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer total;

    @Column(nullable = false)
    private Double accuracy;

    // The category with the most questions in this attempt (a test can mix
    // categories, so this is the dominant one, not necessarily the only one).
    @Column
    private String category;

    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;

    // Distinguishes a full mock test (MOCK) from a focused topic practice
    // session (TOPIC), so history pages can group them.
    @Column(nullable = false)
    private String type = "MOCK";

    // How the attempt ended: COMPLETE (normal/timeout submission), ABORTED
    // (auto-submitted after too many tab switches) or ABANDONED (browser/tab
    // closed before submission, recorded via a pagehide beacon).
    @Column(name = "completion_status", nullable = false, length = 20)
    private String completionStatus = "COMPLETE";

    @CreationTimestamp
    @Column(name = "taken_at", nullable = false, updatable = false)
    private LocalDateTime takenAt;
}
