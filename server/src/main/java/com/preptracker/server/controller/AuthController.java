package com.preptracker.server.controller;

import com.preptracker.server.dto.RegisterRequest;
import com.preptracker.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
