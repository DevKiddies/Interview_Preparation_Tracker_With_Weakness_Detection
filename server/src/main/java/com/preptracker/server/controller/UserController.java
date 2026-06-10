package com.preptracker.server.controller;

import com.preptracker.server.dto.OnboardingRequest;
import com.preptracker.server.dto.UpdatePasswordRequest;
import com.preptracker.server.dto.UpdateUsernameRequest;
import com.preptracker.server.model.User;
import com.preptracker.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/username")
    public ResponseEntity<User> updateUsername(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUsernameRequest request) {
        return ResponseEntity.ok(userService.updateUsername(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(id, request);
        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @PostMapping("/onboarding")
    public ResponseEntity<String> completeOnboarding(@RequestBody OnboardingRequest request) {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        userService.completeOnboarding(UUID.fromString(userId), request);
        return ResponseEntity.ok("Onboarding complete!");
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe() {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        User user = userService.getUserById(UUID.fromString(userId));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("username", user.getUsername());
        response.put("onboarded", user.getIsOnboarded());

        return ResponseEntity.ok(response);
    }
}