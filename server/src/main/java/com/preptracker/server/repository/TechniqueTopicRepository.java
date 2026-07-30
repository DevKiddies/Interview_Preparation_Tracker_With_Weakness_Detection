package com.preptracker.server.repository;

import com.preptracker.server.model.TechniqueTopic;
import com.preptracker.server.model.TechniqueTopicId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TechniqueTopicRepository extends JpaRepository<TechniqueTopic, TechniqueTopicId> {
    List<TechniqueTopic> findByTopicId(Long topicId);
    List<TechniqueTopic> findByTechniqueId(Long techniqueId);
}
