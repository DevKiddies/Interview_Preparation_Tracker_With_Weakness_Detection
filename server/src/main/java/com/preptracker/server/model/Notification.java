package com.preptracker.server.model;

// A single in-app notification for a user (bell icon in the navbar). Created by
// NotificationService whenever something notification-worthy happens elsewhere in
// the app (account verified, password changed, test results ready, ...).
// userId is a plain UUID column (not a @ManyToOne to User) to match the existing
// convention used by TestAttempt/UserAttempt in this codebase.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // WELCOME, SECURITY, ONBOARDING, TEST_RESULT, SYSTEM — lets the frontend
    // pick an icon/color without parsing the title.
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    // Optional in-app route the frontend navigates to when the notification is clicked.
    @Column
    private String link;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
