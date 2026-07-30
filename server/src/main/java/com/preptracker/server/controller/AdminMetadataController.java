package com.preptracker.server.controller;

// Read-only reference data for the admin Question Bank page's filters and
// edit-modal dropdowns (category -> topic -> technique cascades, companies).
// Gated by ROLE_ADMIN via SecurityConfig.

import com.preptracker.server.model.Category;
import com.preptracker.server.model.Company;
import com.preptracker.server.model.Technique;
import com.preptracker.server.model.TechniqueTopic;
import com.preptracker.server.model.Topic;
import com.preptracker.server.repository.CategoryRepository;
import com.preptracker.server.repository.CompanyRepository;
import com.preptracker.server.repository.TechniqueRepository;
import com.preptracker.server.repository.TechniqueTopicRepository;
import com.preptracker.server.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getTopics() {
        return ResponseEntity.ok(topicRepository.findAll());
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
