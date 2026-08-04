package com.preptracker.server.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "test_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "test_id")
    private Long testId;

    // Snapshot of what the started test contains, so an abandoned session can be
    // persisted as a proper test_attempts row (score 0) even if the frontend
    // never submitted answers.
    @Column
    private Integer total;

    @Column(name = "type")
    private String type = "MOCK";

    @Column
    private String category;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "completion_status", nullable = false, columnDefinition = "varchar(20) default 'ABANDONED'")
    private String completionStatus = "ABANDONED";

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}