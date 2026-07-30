package com.preptracker.server.controller;

// Admin question-bank management endpoints under /api/admin/questions.
// Gated by ROLE_ADMIN via SecurityConfig.

import com.preptracker.server.dto.AdminQuestionDTO;
import com.preptracker.server.dto.QuestionBankStatsDTO;
import com.preptracker.server.service.AdminQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/questions")
public class AdminQuestionController {

    private final AdminQuestionService adminQuestionService;

    @GetMapping
    public ResponseEntity<List<AdminQuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(adminQuestionService.getAllQuestions());
    }

    // Paginated/filtered listing for the admin Question Bank table — unlike
    // the plain GET above (still used by AdminCreateMockTest to count
    // questions per topic), this only returns one page of rows at a time.
    @GetMapping("/search")
    public ResponseEntity<Page<AdminQuestionDTO>> searchQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortField,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) String difficulty
    ) {
        return ResponseEntity.ok(adminQuestionService.searchQuestions(
                page, size, sortField, sortDir, search, categoryId, topicId, difficulty));
    }

    @GetMapping("/stats")
    public ResponseEntity<QuestionBankStatsDTO> getStats() {
        return ResponseEntity.ok(adminQuestionService.getStats());
    }

    @PostMapping
    public ResponseEntity<AdminQuestionDTO> createQuestion(@RequestBody AdminQuestionDTO request) {
        return ResponseEntity.ok(adminQuestionService.createQuestion(request));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AdminQuestionDTO>> createQuestions(@RequestBody List<AdminQuestionDTO> requests) {
        return ResponseEntity.ok(adminQuestionService.createQuestions(requests));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminQuestionDTO> updateQuestion(@PathVariable Long id, @RequestBody AdminQuestionDTO request) {
        return ResponseEntity.ok(adminQuestionService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuestion(@PathVariable Long id) {
        adminQuestionService.deleteQuestion(id);
        return ResponseEntity.ok("Question deleted successfully");
    }
}
