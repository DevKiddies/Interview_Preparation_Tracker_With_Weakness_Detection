package com.preptracker.server.controller;

// Reference data for the admin Question Bank / Categories & Topics pages'
// filters and dropdowns (category -> topic -> technique cascades, companies).
// Mostly read-only, plus topic create/delete for the Categories & Topics page.
// Gated by ROLE_ADMIN via SecurityConfig.

import com.preptracker.server.dto.TopicRequest;
import com.preptracker.server.exception.ConflictException;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.model.Category;
import com.preptracker.server.model.Company;
import com.preptracker.server.model.Technique;
import com.preptracker.server.model.TechniqueTopic;
import com.preptracker.server.model.Topic;
import com.preptracker.server.repository.CategoryRepository;
import com.preptracker.server.repository.CompanyRepository;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TechniqueRepository;
import com.preptracker.server.repository.TechniqueTopicRepository;
import com.preptracker.server.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminMetadataController {

    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;
    private final TechniqueRepository techniqueRepository;
    private final CompanyRepository companyRepository;
    private final TechniqueTopicRepository techniqueTopicRepository;
    private final QuestionRepository questionRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTopics() {
        return ResponseEntity.ok(topicRepository.findAll());
    }

    // Backs the "Add Topic" modal on the admin Categories & Topics page.
    @PostMapping("/topics")
    public ResponseEntity<Topic> createTopic(@RequestBody TopicRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Topic name is required");
        }
        if (request.categoryId() == null || !categoryRepository.existsById(request.categoryId())) {
            throw new NotFoundException("Category not found");
        }
        // `topics.name` is unique across the whole table (not just per-category),
        // matching the live Supabase schema — check up front for a clean 409
        // instead of letting a duplicate insert surface as a raw SQL error.
        if (topicRepository.findByName(request.name().trim()).isPresent()) {
            throw new ConflictException("A topic named \"" + request.name().trim() + "\" already exists.");
        }
        Topic topic = new Topic();
        topic.setName(request.name().trim());
        topic.setCategory(categoryRepository.getReferenceById(request.categoryId()));
        return ResponseEntity.ok(topicRepository.save(topic));
    }

    // topic_id is a NOT NULL FK on questions, so a topic still in use can't be
    // deleted (there's nothing sensible to fall back to) — reject with a 409
    // instead of leaving the admin to hit a raw DB constraint error.
    @DeleteMapping("/topics/{id}")
    public ResponseEntity<String> deleteTopic(@PathVariable Long id) {
        if (!topicRepository.existsById(id)) {
            throw new NotFoundException("Topic not found");
        }
        long questionCount = questionRepository.countByTopic_Id(id);
        if (questionCount > 0) {
            throw new ConflictException(
                    questionCount + " question" + (questionCount > 1 ? "s are" : " is")
                            + " tagged with this topic. Reassign or delete them first.");
        }
        topicRepository.deleteById(id);
        return ResponseEntity.ok("Topic deleted successfully");
    }

    @GetMapping("/techniques")
    public ResponseEntity<List<Technique>> getTechniques() {
        return ResponseEntity.ok(techniqueRepository.findAll());
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @GetMapping("/technique-topics")
    public ResponseEntity<List<TechniqueTopic>> getTechniqueTopics() {
        return ResponseEntity.ok(techniqueTopicRepository.findAll());
    }
}
