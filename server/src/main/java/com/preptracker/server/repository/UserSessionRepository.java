package com.preptracker.server.repository;

import java.util.Optional;
import com.preptracker.server.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    Optional<UserSession> findTopByUserIdAndLogoutTimeIsNullOrderByLoginTimeDesc(UUID userId);

    @Query("""
                SELECT AVG(us.duration)
                FROM UserSession us
                WHERE us.logoutTime IS NOT NULL
            """)
    Double getAverageSessionDuration();
}