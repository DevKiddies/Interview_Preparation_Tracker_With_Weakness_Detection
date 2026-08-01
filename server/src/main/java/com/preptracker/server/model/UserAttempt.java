package com.preptracker.server.model;

// One row = one user's answer to one question during one test submission.
// This is the per-question behavioral detail layer beneath test_attempts:
//   test_attempts  = "how did the user perform on this test?"  (summary)
//   user_attempts  = "how did the user behave on each question?" (detail)
// topicId is denormalized from questions.topic so dashboard queries
// (AVG(confidence_score) GROUP BY topic_id) need no joins. technique_id and
// category_id are deliberately NOT duplicated here — they are reachable via
// question -> topic -> category and question -> technique.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_attempts", indexes = {
        @Index(name = "idx_user_attempts_user_id", columnList = "user_id"),
        @Index(name = "idx_user_attempts_test_attempt_id", columnList = "test_attempt_id"),
        @Index(name = "idx_user_attempts_topic_id", columnList = "topic_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_attempt_id", nullable = false)
    private Long testAttemptId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    // Denormalized from questions.topic so per-topic confidence needs no join
    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    // Position of the question in the submitted questionIds array (display order)
    @Column(name = "selection_sequence", nullable = false)
    private Integer selectionSequence;

    // The option text the user finally selected (may be null if left unanswered)
    @Column(name = "final_answer", columnDefinition = "TEXT")
    private String finalAnswer;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    // Number of times the user changed their selection for this question
    @Column(name = "switch_count", nullable = false)
    private Integer switchCount;

    @Column(name = "is_flagged", nullable = false)
    private Boolean isFlagged;

    @Column(name = "time_taken_seconds", nullable = false)
    private Integer timeTakenSeconds;

    @Column(name = "confidence_score", nullable = false)
    private Integer confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_state", nullable = false, length = 40)
    private ConfidenceState confidenceState;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
