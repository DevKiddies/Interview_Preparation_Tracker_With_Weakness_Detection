package com.preptracker.server.dto;

// Flat shape for /api/admin/topics — the admin frontend expects a plain
// categoryId, not the nested Category relation now on the Topic entity.
public record TopicDTO(Long id, String name, Long categoryId) {}
