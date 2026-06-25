package com.preptracker.server.controller;

import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.dto.ForgotPasswordRequest;
import com.preptracker.server.dto.GoogleAuthRequest;
import com.preptracker.server.dto.LoginRequest;
import com.preptracker.server.dto.RegisterRequest;
import com.preptracker.server.dto.ResetPasswordRequest;
import com.preptracker.server.dto.VerifyOtpRequest;
import com.preptracker.server.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${github.client-id}")
    private String githubClientId;

    @Value("${github.redirect-uri}")
    private String githubRedirectUri;

    @Value("${github.frontend-url}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(201).body("User Registered!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(authService.logout(authHeader));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request.getIdToken()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("You are authenticated!");
    }

    @GetMapping("/github")
    public void githubLogin(HttpServletResponse response) throws IOException {
        String githubAuthUrl = "https://github.com/login/oauth/authorize"
                + "?client_id=" + githubClientId
                + "&redirect_uri=" + githubRedirectUri
                + "&scope=user:email";
        response.sendRedirect(githubAuthUrl);
    }

    @GetMapping("/github/callback")
    public void githubCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
        try {
            String token = authService.loginWithGithub(code);
            response.sendRedirect(frontendUrl + "/auth/callback?token=" + token);
        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "/login?error=github_login_failed");
        }
    }
}