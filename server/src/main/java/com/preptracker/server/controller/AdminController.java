package com.preptracker.server.controller;

// Admin authentication endpoint under /api/admin/auth.
// This is the only admin route that's publicly accessible — all other /api/admin/**
// routes are locked down to ROLE_ADMIN by SecurityConfig.
// Admin accounts are managed manually in the DB (no self-registration endpoint).

import com.preptracker.server.dto.AdminLoginRequest;
import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/auth")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminService.login(request));
    }
}
