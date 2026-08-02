package com.preptracker.server.controller;

// Public endpoint backing the Contact Us page's "Send us a message" form.
// No auth required — visitors don't need an account to reach out.

import com.preptracker.server.dto.ContactRequest;
import com.preptracker.server.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<String> submit(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactMessage(request);
        return ResponseEntity.ok("Message sent");
    }
}
