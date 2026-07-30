package com.preptracker.server.controller;

// Exposes persisted test-attempt results under /api/admin/results, for the
// admin "User Results" page. Gated by ROLE_ADMIN via SecurityConfig.

import com.preptracker.server.dto.AdminTestResultDTO;
import com.preptracker.server.service.AdminTestResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/results")
public class AdminTestResultController {

    private final AdminTestResultService adminTestResultService;

    @GetMapping
    public ResponseEntity<List<AdminTestResultDTO>> getAllResults() {
        return ResponseEntity.ok(adminTestResultService.getAllResults());
    }
}
