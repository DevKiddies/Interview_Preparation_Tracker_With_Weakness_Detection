package com.preptracker.server.repository;

// Database access layer for the Admin entity.
// Supports lookup by email or username so admins can log in with either.

import com.preptracker.server.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByUsername(String username);
}
