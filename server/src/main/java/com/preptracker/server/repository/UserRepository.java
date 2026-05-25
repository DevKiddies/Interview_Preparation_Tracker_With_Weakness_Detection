package com.preptracker.server.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.preptracker.server.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);      //boolean
    Optional<User> findByUsername(String username); // ADD THIS (needed for UserService)
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}