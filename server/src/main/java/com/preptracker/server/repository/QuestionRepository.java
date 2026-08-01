package com.preptracker.server.repository;

import com.preptracker.server.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {

    @Override
    @EntityGraph(attributePaths = {"category", "topic"})
    List<Question> findAll();

    @Override
    @EntityGraph(attributePaths = {"category", "topic"})
    Page<Question> findAll(Pageable pageable);

    // NEW FIX: For the /submit endpoint
    @Override
    @EntityGraph(attributePaths = {"category", "topic"})
    List<Question> findAllById(Iterable<Long> ids);

    @EntityGraph(attributePaths = {"category", "topic"})
    List<Question> findByTopicName(String topicName);

    @EntityGraph(attributePaths = {"category", "topic"})
    List<Question> findByTopicNameIn(List<String> topicNames);

    @EntityGraph(attributePaths = {"category", "topic"})
    List<Question> findByCategoryName(String categoryName);

    @EntityGraph(attributePaths = {"category", "topic"})
    List<Question> findByCategoryNameIn(List<String> categoryNames);

    long countByDifficultyIgnoreCase(String difficulty);

    long countByTopic_Id(Long topicId);
}
