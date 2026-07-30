package com.preptracker.server.controller;

// Admin Test Management endpoints under /api/admin/tests.
// Gated by ROLE_ADMIN via SecurityConfig.

import com.preptracker.server.dto.AdminMockTestDTO;
import com.preptracker.server.service.AdminMockTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/tests")
public class AdminMockTestController {

    private final AdminMockTestService adminMockTestService;

    @GetMapping
    public ResponseEntity<List<AdminMockTestDTO>> getAllTests() {
        return ResponseEntity.ok(adminMockTestService.getAllTests());
    }

    @PostMapping
    public ResponseEntity<AdminMockTestDTO> createTest(@RequestBody AdminMockTestDTO request) {
        return ResponseEntity.ok(adminMockTestService.createTest(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminMockTestDTO> updateTest(@PathVariable Long id, @RequestBody AdminMockTestDTO request) {
        return ResponseEntity.ok(adminMockTestService.updateTest(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTest(@PathVariable Long id) {
        adminMockTestService.deleteTest(id);
        return ResponseEntity.ok("Test deleted successfully");
    }
}
