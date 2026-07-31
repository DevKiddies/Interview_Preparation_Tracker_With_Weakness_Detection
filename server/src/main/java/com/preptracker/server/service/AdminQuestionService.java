package com.preptracker.server.service;

// Business logic behind the admin Question Bank page: listing every question
// with its full shape (including the correct answer), creating (single/bulk),
// editing, and deleting.

import com.preptracker.server.dto.AdminQuestionDTO;
import com.preptracker.server.dto.QuestionBankStatsDTO;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.model.Question;
import com.preptracker.server.model.QuestionType;
import com.preptracker.server.repository.CategoryRepository;
import com.preptracker.server.repository.CompanyRepository;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TechniqueRepository;
import com.preptracker.server.repository.TopicRepository;
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
    private static final QuestionType DEFAULT_QUESTION_TYPE = QuestionType.theory;

    // Only these fields are safe/meaningful to sort by; anything else (or a
    // client typo) silently falls back to "id" rather than throwing.
    private static final Set<String> SORTABLE_FIELDS = Set.of("id", "category.id", "difficulty");

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;
    private final TechniqueRepository techniqueRepository;
    private final CompanyRepository companyRepository;

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
            Specification<Question> textMatch = (root, query, cb) -> cb.like(cb.lower(root.get("question")), like);
            try {
                long id = Long.parseLong(trimmed);
                Specification<Question> idMatch = (root, query, cb) -> cb.equal(root.get("id"), id);
                spec = spec.and(textMatch.or(idMatch));
            } catch (NumberFormatException e) {
                spec = spec.and(textMatch);
            }
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }
        if (topicId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("topic").get("id"), topicId));
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
        q.setQuestion(request.question());
        q.setOptionA(request.optionA());
        q.setOptionB(request.optionB());
        q.setOptionC(request.optionC());
        q.setOptionD(request.optionD());
        q.setCorrectAnswer(request.correctAnswer());
        q.setCategory(categoryRepository.getReferenceById(request.categoryId()));
        q.setTopic(topicRepository.getReferenceById(request.topicId()));
        q.setDifficulty(request.difficulty());
        q.setQuestionType(parseQuestionType(request.questionType()));
        q.setTechnique(request.techniqueId() != null ? techniqueRepository.getReferenceById(request.techniqueId()) : null);
        q.setCompany(request.companyId() != null ? companyRepository.getReferenceById(request.companyId()) : null);
        return q;
    }

    private QuestionType parseQuestionType(String value) {
        if (value == null || value.isBlank()) {
            return DEFAULT_QUESTION_TYPE;
        }
        try {
            return QuestionType.valueOf(value.trim().toLowerCase());
        } catch (IllegalArgumentException e) {
            return DEFAULT_QUESTION_TYPE;
        }
    }

    private AdminQuestionDTO toDTO(Question q) {
        return new AdminQuestionDTO(
                q.getId(), q.getQuestion(),
                q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
                q.getCorrectAnswer(), q.getCategory().getId(), q.getTopic().getId(),
                q.getDifficulty(), q.getQuestionType().name(),
                q.getTechnique() != null ? q.getTechnique().getId() : null,
                q.getCompany() != null ? q.getCompany().getId() : null
        );
    }
}
