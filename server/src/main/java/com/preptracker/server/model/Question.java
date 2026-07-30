package com.preptracker.server.model;

// Represents a single multiple-choice question in the question bank.
// Each question has four options (A–D) and a correctAnswer field that stores
// the letter of the right option ("A", "B", "C", or "D").
// Questions are tagged by categoryId/topicId (FKs into Category/Topic), and
// optionally by techniqueId/companyId — matching the live Supabase schema.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "option_a", nullable = false)
    private String optionA;

    @Column(name = "option_b", nullable = false)
    private String optionB;

    @Column(name = "option_c", nullable = false)
    private String optionC;

    @Column(name = "option_d", nullable = false)
    private String optionD;

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer; // "A", "B", "C", or "D"

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    @Column(nullable = false)
    private String difficulty;

    // NOT NULL in the live table despite being an "optional" field in the admin
    // UI — AdminQuestionService defaults it to "General" when left blank.
    @Column(name = "question_type", nullable = false)
    private String questionType;

    @Column(name = "technique_id")
    private Long techniqueId;

    @Column(name = "company_id")
    private Long companyId;
}
