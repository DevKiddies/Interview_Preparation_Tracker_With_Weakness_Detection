package com.preptracker.server.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.preptracker.server.dto.UpdatePasswordRequest;
import com.preptracker.server.dto.UpdateUsernameRequest;
import com.preptracker.server.model.User;
import com.preptracker.server.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // PUT /api/users/{id}/username
    @PutMapping("/{id}/username")
    public ResponseEntity<User> updateUsername(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUsernameRequest request) {
        return ResponseEntity.ok(userService.updateUsername(id, request));
    }

    // PUT /api/users/{id}/password
    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePasswordRequest request) {
        userService.updatePassword(id, request);
        return ResponseEntity.ok("Password updated successfully");
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}