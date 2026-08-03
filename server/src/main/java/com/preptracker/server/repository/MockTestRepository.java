package com.preptracker.server.repository;

import com.preptracker.server.model.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MockTestRepository extends JpaRepository<MockTest, Long> {
    List<MockTest> findByStatus(String status);
}
