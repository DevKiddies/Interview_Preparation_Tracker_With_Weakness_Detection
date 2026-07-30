package com.preptracker.server.controller;

// Exposes platform-wide analytics under /api/admin/analytics, for the admin
// "Platform Overview" page. Gated by ROLE_ADMIN via SecurityConfig.

import com.preptracker.server.dto.AdminPlatformOverviewDTO;
import com.preptracker.server.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AdminPlatformOverviewDTO> getOverview() {
        return ResponseEntity.ok(adminAnalyticsService.getOverview());
    }
}
