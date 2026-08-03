package com.preptracker.server.repository;

import com.preptracker.server.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    Optional<Topic> findByName(String name);

    // Rows of [topicId, topicName, categoryId] for the Confidence Explorer tree.
    @Query(value = """
            SELECT t.id, t.name, t.category_id
            FROM topics t
            ORDER BY t.category_id, t.name
            """, nativeQuery = true)
    List<Object[]> findAllWithCategory();
}
