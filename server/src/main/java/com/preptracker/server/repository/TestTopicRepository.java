package com.preptracker.server.repository;

import com.preptracker.server.model.TestTopic;
import com.preptracker.server.model.TestTopicId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestTopicRepository extends JpaRepository<TestTopic, TestTopicId> {
    List<TestTopic> findByTestId(Long testId);
    void deleteByTestId(Long testId);
}
