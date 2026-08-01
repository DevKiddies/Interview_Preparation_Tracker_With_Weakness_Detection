package com.preptracker.server.dto;

// Flat wire shape for Topic, avoiding a lazy Category proxy in the JSON
// response (spring.jpa.open-in-view=false means the Hibernate session is
// closed by the time Jackson would otherwise try to serialize topic.category).
public record TopicDTO(Long id, String name, Long categoryId) {

    public static TopicDTO from(com.preptracker.server.model.Topic topic) {
        return new TopicDTO(topic.getId(), topic.getName(), topic.getCategory().getId());
    }
}
