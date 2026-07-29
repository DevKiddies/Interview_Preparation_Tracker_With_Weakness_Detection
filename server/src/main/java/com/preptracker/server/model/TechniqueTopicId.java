package com.preptracker.server.model;

// Composite key for TechniqueTopic — the many-to-many join has no surrogate id column,
// just the (technique_id, topic_id) pair as its primary key.

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechniqueTopicId implements Serializable {
    private Long techniqueId;
    private Long topicId;
}
