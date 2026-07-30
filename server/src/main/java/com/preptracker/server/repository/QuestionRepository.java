package com.preptracker.server.repository;

// Database access layer for the Question entity.
// Provides filtered queries by topicId/categoryId used by QuestionService when
// building a test session (name -> id resolution happens in the service layer).

import com.preptracker.server.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTopicId(Long topicId);
    List<Question> findByTopicIdIn(List<Long> topicIds);
    List<Question> findByCategoryId(Long categoryId);
    List<Question> findByCategoryIdIn(List<Long> categoryIds);
}
