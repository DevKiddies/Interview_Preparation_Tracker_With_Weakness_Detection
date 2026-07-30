package com.preptracker.server.dto;

// Request body for creating a topic under a category from the admin
// Categories & Topics page.
public record TopicRequest(String name, Long categoryId) {}
