package com.preptracker.server.model;

// Represents a single login session for a user.
// A new session is created whenever the user logs in.
// When the user logs out, logoutTime is populated and PostgreSQL
// automatically calculates the session duration (in seconds).

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime = LocalDateTime.now();

    @Column(name = "logout_time")
    private LocalDateTime logoutTime;

    // Automatically calculated by PostgreSQL as the difference
    // between logoutTime and loginTime (stored in seconds).
    // Read-only from the application's perspective.
    @Column(name = "duration", insertable = false, updatable = false)
    private Integer duration;
}