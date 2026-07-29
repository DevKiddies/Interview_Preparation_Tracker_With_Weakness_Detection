package com.preptracker.server.repository;

import com.preptracker.server.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    Optional<Topic> findByName(String name);
    List<Topic> findByNameIn(List<String> names);
    List<Topic> findByCategoryId(Long categoryId);
}
