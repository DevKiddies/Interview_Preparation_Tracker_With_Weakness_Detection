package com.preptracker.server.service;

// Creates and reads in-app notifications (the bell icon in the navbar).
// create() is called from other services (AuthService, UserService, TestService)
// whenever something notification-worthy happens — it never throws, so a
// notification failure can't take down the action that triggered it (e.g. a
// test submission must still succeed even if writing its notification fails).

import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.exception.UnauthorizedException;
import com.preptracker.server.model.Notification;
import com.preptracker.server.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void create(UUID userId, String type, String title, String message, String link) {
        try {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setLink(link);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.out.println("Failed to create notification (" + type + ") for user " + userId + ": " + e.getMessage());
        }
    }

    public List<Notification> getRecent(UUID userId) {
        return notificationRepository.findTop30ByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id, UUID userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied: this notification does not belong to you");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
