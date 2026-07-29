package com.preptracker.server.model;

// Many-to-many join: which techniques are commonly tagged for which topic,
// e.g. "Two Pointers" <-> "Arrays". No columns beyond the composite key.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "technique_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TechniqueTopicId.class)
public class TechniqueTopic {

    @Id
    @Column(name = "technique_id")
    private Long techniqueId;

    @Id
    @Column(name = "topic_id")
    private Long topicId;
}
