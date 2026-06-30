package com.preptracker.server.service;

// Business logic for admin authentication.
// Admins can log in with either their email or username. On success, returns a JWT
// that carries a "role: ADMIN" claim, which SecurityConfig uses to gate /api/admin/** routes.

import com.preptracker.server.dto.AdminLoginRequest;
import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.model.Admin;
import com.preptracker.server.repository.AdminRepository;
import com.preptracker.server.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(AdminLoginRequest request) {
        Admin admin;

        if (request.getIdentifier().contains("@")) {
            admin = adminRepository.findByEmail(request.getIdentifier())
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        } else {
            admin = adminRepository.findByUsername(request.getIdentifier())
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new AuthResponse(jwtUtil.generateAdminToken(admin));
    }
}
