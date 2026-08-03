package com.preptracker.server.controller;

import com.preptracker.server.dto.AdminDashboardDTO;
import com.preptracker.server.service.AdminDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    
    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<AdminDashboardDTO> getDashboardStats(){
        AdminDashboardDTO dashboardStats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(dashboardStats);
    }
}
