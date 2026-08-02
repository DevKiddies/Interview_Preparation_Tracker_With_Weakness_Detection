package com.preptracker.server.repository;

import com.preptracker.server.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop30ByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Notification> findByUserIdAndIsReadFalse(UUID userId);
    long countByUserIdAndIsReadFalse(UUID userId);
}
