package com.preptracker.server.controller;

import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.dto.LoginRequest;
import com.preptracker.server.dto.RegisterRequest;
import com.preptracker.server.dto.VerifyOtpRequest;
import com.preptracker.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request){ // Without @Valid the validation annotations in RegisterRequest never trigger.
        authService.register(request);
        return ResponseEntity.status(201).body("User Registered!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request){
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader("Authorization") String authHeader) {
        AuthResponse response = authService.logout(authHeader);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("You are authenticated!");
    }
}
