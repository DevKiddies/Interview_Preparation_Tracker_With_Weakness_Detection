package com.preptracker.server.controller;

// Backs the bell icon in the navbar. All endpoints operate on the authenticated
// user's own notifications — there's no path parameter for user id, so there's
// nothing to guard against IDOR here (unlike UserController's requireSelf).
// No explicit SecurityConfig entry needed: it falls under the default
// anyRequest().authenticated() rule, same as every other non-auth/non-admin route.

import com.preptracker.server.model.Notification;
import com.preptracker.server.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    private UUID authenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> list() {
        return ResponseEntity.ok(notificationService.getRecent(authenticatedUserId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(authenticatedUserId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, authenticatedUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(authenticatedUserId());
        return ResponseEntity.noContent().build();
    }
}
