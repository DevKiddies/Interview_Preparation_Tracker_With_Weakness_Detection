package com.preptracker.server.repository;

import com.preptracker.server.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByStartDateDesc(UUID userId);
    Optional<Interview> findFirstByUserIdAndStatusOrderByStartDateDesc(UUID userId, String status);
}
