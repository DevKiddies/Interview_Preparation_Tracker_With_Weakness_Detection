package com.preptracker.server.repository;

import com.preptracker.server.model.TechniqueTopic;
import com.preptracker.server.model.TechniqueTopicId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TechniqueTopicRepository extends JpaRepository<TechniqueTopic, TechniqueTopicId> {
    List<TechniqueTopic> findByTopicId(Long topicId);
    List<TechniqueTopic> findByTechniqueId(Long techniqueId);

    // Rows of [techniqueId, topicId, techniqueName] for the Confidence Explorer
    // tree (which techniques hang under which topic).
    @Query(value = """
            SELECT tt.technique_id, tt.topic_id, t.name
            FROM technique_topics tt
            JOIN techniques t ON t.id = tt.technique_id
            ORDER BY tt.topic_id, t.name
            """, nativeQuery = true)
    List<Object[]> findAllWithTopicAndName();
}
