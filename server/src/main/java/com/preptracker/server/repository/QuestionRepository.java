package com.preptracker.server.repository;

// Database access layer for the Question entity.
// Provides filtered queries by topic (e.g. "DSA") and category (e.g. "Arrays")
// used by QuestionService when building a test session.

import com.preptracker.server.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTopic(String topic);
    List<Question> findByCategory(String category);
}
