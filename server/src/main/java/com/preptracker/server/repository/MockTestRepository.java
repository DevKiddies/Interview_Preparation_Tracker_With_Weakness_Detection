package com.preptracker.server.repository;

import com.preptracker.server.model.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MockTestRepository extends JpaRepository<MockTest, Long> {
}
