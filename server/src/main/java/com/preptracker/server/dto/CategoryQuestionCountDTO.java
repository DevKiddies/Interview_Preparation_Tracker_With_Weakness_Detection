package com.preptracker.server.dto;

// How many questions the question bank holds per category, for the admin
// dashboard's "Questions by Category" distribution chart.
public record CategoryQuestionCountDTO(String name, long count) {}
