package com.preptracker.server.repository;

import com.preptracker.server.model.Topic;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    Optional<Topic> findByName(String name);

    @Override
    @EntityGraph(attributePaths = "category")
    List<Topic> findAll();
}
