package com.preptracker.server.repository;

import com.preptracker.server.model.Technique;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechniqueRepository extends JpaRepository<Technique, Long> {
    Optional<Technique> findByName(String name);
}
