package com.preptracker.server.service;

// Business logic behind the admin Question Bank page: listing every question
// with its full shape (including the correct answer), creating (single/bulk),
// editing, and deleting.

import com.preptracker.server.dto.AdminQuestionDTO;
import com.preptracker.server.dto.QuestionBankStatsDTO;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.model.Question;
import com.preptracker.server.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminQuestionService {

    // The live `questions` table has question_type as NOT NULL, but the admin
    // form treats it as optional — fall back to this rather than forcing admins
    // to fill it in for every question.
    private static final String DEFAULT_QUESTION_TYPE = "General";

    // Only these fields are safe/meaningful to sort by; anything else (or a
    // client typo) silently falls back to "id" rather than throwing.
    private static final Set<String> SORTABLE_FIELDS = Set.of("id", "categoryId", "difficulty");

    private final QuestionRepository questionRepository;

    public List<AdminQuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream().map(this::toDTO).toList();
    }

    // Backs the admin Question Bank table: server-side search/filter/sort/page
    // so the client only ever pulls one page of rows instead of the whole bank.
    public Page<AdminQuestionDTO> searchQuestions(
            int page, int size, String sortField, String sortDir,
            String search, Long categoryId, Long topicId, String difficulty
    ) {
        String property = SORTABLE_FIELDS.contains(sortField) ? sortField : "id";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));

        Specification<Question> spec = Specification.where(null);

        if (search != null && !search.isBlank()) {
            String trimmed = search.trim();
            String like = "%" + trimmed.toLowerCase() + "%";
            Specification<Question> textMatch = (root, query, cb) -> cb.like(cb.lower(root.get("text")), like);
            try {
                long id = Long.parseLong(trimmed);
                Specification<Question> idMatch = (root, query, cb) -> cb.equal(root.get("id"), id);
                spec = spec.and(textMatch.or(idMatch));
            } catch (NumberFormatException e) {
                spec = spec.and(textMatch);
            }
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("categoryId"), categoryId));
        }
        if (topicId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("topicId"), topicId));
        }
        if (difficulty != null && !difficulty.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("difficulty")), difficulty.toLowerCase()));
        }

        return questionRepository.findAll(spec, pageable).map(this::toDTO);
    }

    public QuestionBankStatsDTO getStats() {
        return new QuestionBankStatsDTO(
                questionRepository.count(),
                questionRepository.countByDifficultyIgnoreCase("easy"),
                questionRepository.countByDifficultyIgnoreCase("medium"),
                questionRepository.countByDifficultyIgnoreCase("hard")
        );
    }

    public AdminQuestionDTO createQuestion(AdminQuestionDTO request) {
        return toDTO(questionRepository.save(fromDTO(new Question(), request)));
    }

    public List<AdminQuestionDTO> createQuestions(List<AdminQuestionDTO> requests) {
        List<Question> toSave = requests.stream().map(r -> fromDTO(new Question(), r)).toList();
        return questionRepository.saveAll(toSave).stream().map(this::toDTO).toList();
    }

    public AdminQuestionDTO updateQuestion(Long id, AdminQuestionDTO request) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question not found"));

        return toDTO(questionRepository.save(fromDTO(q, request)));
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new NotFoundException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    private Question fromDTO(Question q, AdminQuestionDTO request) {
        q.setText(request.question());
        q.setOptionA(request.optionA());
        q.setOptionB(request.optionB());
        q.setOptionC(request.optionC());
        q.setOptionD(request.optionD());
        q.setCorrectAnswer(request.correctAnswer());
        q.setCategoryId(request.categoryId());
        q.setTopicId(request.topicId());
        q.setDifficulty(request.difficulty());
        q.setQuestionType(request.questionType() != null && !request.questionType().isBlank()
                ? request.questionType()
                : DEFAULT_QUESTION_TYPE);
        q.setTechniqueId(request.techniqueId());
        q.setCompanyId(request.companyId());
        return q;
    }

    private AdminQuestionDTO toDTO(Question q) {
        return new AdminQuestionDTO(
                q.getId(), q.getText(),
                q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
                q.getCorrectAnswer(), q.getCategoryId(), q.getTopicId(),
                q.getDifficulty(), q.getQuestionType(), q.getTechniqueId(), q.getCompanyId()
        );
    }
}
