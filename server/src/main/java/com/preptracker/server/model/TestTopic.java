package com.preptracker.server.model;

// Many-to-many join: which topics a mock test template (MockTest) draws
// questions from, e.g. test #3 <-> "Arrays", "Trees". No columns beyond the
// composite key.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TestTopicId.class)
public class TestTopic {

    @Id
    @Column(name = "test_id")
    private Long testId;

    @Id
    @Column(name = "topic_id")
    private Long topicId;
}
