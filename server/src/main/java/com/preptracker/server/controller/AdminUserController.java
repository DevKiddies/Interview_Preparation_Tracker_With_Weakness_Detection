package com.preptracker.server.controller;

// Admin user-management endpoints under /api/admin/users.
// Gated by ROLE_ADMIN via SecurityConfig (all /api/admin/** routes).

import com.preptracker.server.dto.AdminBanUserRequest;
import com.preptracker.server.dto.AdminBannedUserDTO;
import com.preptracker.server.dto.AdminUserDTO;
import com.preptracker.server.repository.AdminRepository;
import com.preptracker.server.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AdminRepository adminRepository;

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/banned")
    public ResponseEntity<List<AdminBannedUserDTO>> getBannedUsers() {
        return ResponseEntity.ok(adminUserService.getBannedUsers());
    }

    @PostMapping("/{id}/ban")
    public ResponseEntity<String> banUser(@PathVariable UUID id, @Valid @RequestBody AdminBanUserRequest request) {
        adminUserService.banUser(id, request, authenticatedAdminUsername());
        return ResponseEntity.ok("User banned successfully");
    }

    @PostMapping("/{id}/unban")
    public ResponseEntity<String> unbanUser(@PathVariable UUID id) {
        adminUserService.unbanUser(id);
        return ResponseEntity.ok("User unbanned successfully");
    }

    private String authenticatedAdminUsername() {
        String adminId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return adminRepository.findById(UUID.fromString(adminId))
                .map(admin -> admin.getUsername())
                .orElse(null);
    }
}
