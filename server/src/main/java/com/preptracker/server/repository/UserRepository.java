package com.preptracker.server.repository;

import com.preptracker.server.model.User;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
