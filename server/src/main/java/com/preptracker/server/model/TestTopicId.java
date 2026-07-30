package com.preptracker.server.model;

// Composite key for TestTopic — the many-to-many join has no surrogate id column,
// just the (test_id, topic_id) pair as its primary key.

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestTopicId implements Serializable {
    private Long testId;
    private Long topicId;
}
