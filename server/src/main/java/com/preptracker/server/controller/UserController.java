package com.preptracker.server.controller;

// Manages authenticated user profile operations under /api/users.
// All mutating endpoints enforce that a user can only modify their own account
// (see requireSelf). Covers: fetching profile, updating username/password,
// deleting account, setting interview date, and completing onboarding.
// The /me endpoint is a convenience shortcut to get the current user's full profile
// without needing to know their UUID.

import com.preptracker.server.dto.AccuracyHeatmapRowDTO;
import com.preptracker.server.dto.BlindSpotDTO;
import com.preptracker.server.dto.CategoryConfidenceDTO;
import com.preptracker.server.dto.ConfidenceTreeDTO;
import com.preptracker.server.dto.DashboardStatsDTO;
import com.preptracker.server.dto.OnboardingRequest;
import com.preptracker.server.dto.TrendPointDTO;
import com.preptracker.server.dto.UpdateAvatarRequest;
import com.preptracker.server.dto.UpdateInterviewDateRequest;
import com.preptracker.server.dto.UpdatePasswordRequest;
import com.preptracker.server.dto.UpdateUsernameRequest;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.exception.UnauthorizedException;
import com.preptracker.server.model.User;
import com.preptracker.server.model.UserProfile;
import com.preptracker.server.service.DashboardStatsService;
import com.preptracker.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final DashboardStatsService dashboardStatsService;

    private UUID authenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }

    // Guards against IDOR — ensures a user can only read/modify their own data,
    // not another user's by swapping the ID in the URL path.
    private void requireSelf(UUID id) {
        if (!authenticatedUserId().equals(id)) {
            throw new RuntimeException("Access denied: you can only modify your own account");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable UUID id) {
        requireSelf(id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/username")
    public ResponseEntity<User> updateUsername(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUsernameRequest request) {
        requireSelf(id);
        return ResponseEntity.ok(userService.updateUsername(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePasswordRequest request) {
        requireSelf(id);
        userService.updatePassword(id, request);
        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable UUID id) {
        requireSelf(id);
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PutMapping("/{id}/avatar")
    public ResponseEntity<Map<String, Object>> updateAvatar(
            @PathVariable UUID id,
            @RequestBody UpdateAvatarRequest request) {
        requireSelf(id);
        User user = userService.updateAvatarUrl(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("avatarUrl", user.getAvatarUrl());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/interview-date")
    public ResponseEntity<Map<String, Object>> updateInterviewDate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateInterviewDateRequest request) {
        requireSelf(id);
        var profile = userService.updateInterviewDate(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("interviewDate", profile.getInterviewDate());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/onboarding")
    public ResponseEntity<String> completeOnboarding(@RequestBody OnboardingRequest request) {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        userService.completeOnboarding(UUID.fromString(userId), request);
        return ResponseEntity.ok("Onboarding complete!");
    }
    // Aggregate numbers for the four dashboard stat cards (confidence, accuracy,
    // questions solved, study streak) plus week-over-week deltas.
    @GetMapping("/me/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(dashboardStatsService.getStats(authenticatedUserId()));
    }

    // Per-category confidence/weak-topic data for the "Confidence by Category"
    // widget on the dashboard.
    @GetMapping("/me/dashboard/categories")
    public ResponseEntity<List<CategoryConfidenceDTO>> getCategoryConfidence() {
        return ResponseEntity.ok(dashboardStatsService.getCategoryConfidence(authenticatedUserId()));
    }

    // Full category → topic → technique confidence tree for the Confidence
    // Explorer page (drill-down from the dashboard chart).
    @GetMapping("/me/dashboard/confidence-tree")
    public ResponseEntity<ConfidenceTreeDTO> getConfidenceTree() {
        return ResponseEntity.ok(dashboardStatsService.getConfidenceTree(authenticatedUserId()));
    }

    // Confidence & accuracy series for the trend chart, bucketed as "7D" (daily),
    // "30D" (weekly) and "90D" (monthly) points.
    @GetMapping("/me/dashboard/trend")
    public ResponseEntity<Map<String, List<TrendPointDTO>>> getConfidenceTrend() {
        return ResponseEntity.ok(dashboardStatsService.getConfidenceTrend(authenticatedUserId()));
    }

    // Top 7 topics ranked by overconfidence events for the "Blind Spot Analysis"
    // widget.
    @GetMapping("/me/dashboard/blind-spots")
    public ResponseEntity<List<BlindSpotDTO>> getBlindSpots() {
        return ResponseEntity.ok(dashboardStatsService.getBlindSpots(authenticatedUserId()));
    }

    // Per-topic accuracy split by difficulty for the "Accuracy Heatmap" widget,
    // covering the user's focus topics.
    @GetMapping("/me/dashboard/accuracy-heatmap")
    public ResponseEntity<List<AccuracyHeatmapRowDTO>> getAccuracyHeatmap() {
        return ResponseEntity.ok(dashboardStatsService.getAccuracyHeatmap(authenticatedUserId()));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe() {
        UUID uid = authenticatedUserId();
        User user;
        try {
            user = userService.getUserById(uid);
        } catch (NotFoundException e) {
            // JWT is valid but the user record no longer exists — force re-login
            throw new UnauthorizedException("Session is no longer valid. Please log in again.");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("username", user.getUsername());
        response.put("onboarded", user.getIsOnboarded());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("authProvider", user.getAuthProvider());

        UserProfile profile = userService.getUserProfile(uid);
        if (profile != null) {
            response.put("targetCompany", profile.getTargetCompany());
            response.put("interviewDate", profile.getInterviewDate());
            response.put("experienceLevel", profile.getExperienceLevel());
            response.put("focusTopics", profile.getFocusTopics() != null
                    ? List.of(profile.getFocusTopics().split(","))
                    : List.of());
        }

        return ResponseEntity.ok(response);
    }
}