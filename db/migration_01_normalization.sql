-- ============================================================================
-- Migration 01: Normalization & datatype hardening (Supabase / Postgres)
-- Applies to schema "public". Idempotent-safe for the current state.
--
-- Summary of changes:
--   1. user_profiles.focus_topics  varchar(255) -> text   (removes 12-topic cap)
--   2. user_profiles.interview_date varchar(255) -> date  (was storing ISO dates as strings)
--   3. questions.correct_answer     varchar(255) -> varchar(1) + CHECK (stores 'A'|'B'|'C'|'D')
--   4. CHECK constraints on all enum-as-varchar columns (value sets verified
--      against both live data AND every value the application code writes)
--   5. Missing FKs: categories.category_id (self-parent), tests.category_id
--   6. NOTE (deferred, high-break): exams table is dead (no entity/repo/rows in use);
--      left in place intentionally. user_attempts.user_id, questions.category_id,
--      interviews.target_company and users.auth_provider stay as deliberate
--      denormalization / free-text fields.
--
-- Run with: psql "$DATABASE_URL" -f db/migration_01_normalization.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. focus_topics: no longer cap the number of selectable focus topics.
--    Application still stores/reads a comma-separated string (UserProfile maps
--    this to @Column(columnDefinition="TEXT")).
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles ALTER COLUMN focus_topics TYPE TEXT;

-- ---------------------------------------------------------------------------
-- 2. interview_date: real date type. Existing values are ISO dates; the
--    ALTER would fail loudly (and roll back) if any row were not a valid date.
-- ---------------------------------------------------------------------------
ALTER TABLE user_profiles ALTER COLUMN interview_date TYPE date USING interview_date::date;

-- ---------------------------------------------------------------------------
-- 3. correct_answer: single option letter. All 1830 rows are 'A'/'B'/'C'/'D'.
-- ---------------------------------------------------------------------------
ALTER TABLE questions ALTER COLUMN correct_answer TYPE varchar(1);
ALTER TABLE questions ADD CONSTRAINT chk_questions_correct_answer
    CHECK (correct_answer IN ('A', 'B', 'C', 'D'));

-- ---------------------------------------------------------------------------
-- 4. Enum CHECK constraints (all verified against code + live data).
-- ---------------------------------------------------------------------------
-- test_attempts
ALTER TABLE test_attempts ADD CONSTRAINT chk_test_attempts_type
    CHECK (type IN ('MOCK', 'TOPIC'));
ALTER TABLE test_attempts ADD CONSTRAINT chk_test_attempts_completion_status
    CHECK (completion_status IN ('COMPLETE', 'ABORTED', 'ABANDONED'));

-- test_sessions
ALTER TABLE test_sessions ADD CONSTRAINT chk_test_sessions_type
    CHECK (type IN ('MOCK', 'TOPIC'));
ALTER TABLE test_sessions ADD CONSTRAINT chk_test_sessions_completion_status
    CHECK (completion_status IN ('ACTIVE', 'COMPLETE', 'ABANDONED'));

-- user_attempts
ALTER TABLE user_attempts ADD CONSTRAINT chk_user_attempts_confidence_state
    CHECK (confidence_state IN ('CONFIDENT_CORRECT', 'BLIND_SPOT',
           'UNDERCONFIDENT_CORRECT', 'CLEAR_WEAKNESS', 'NOT_ATTEMPTED'));

-- questions
ALTER TABLE questions ADD CONSTRAINT chk_questions_question_type
    CHECK (question_type IN ('theory', 'snippet'));
ALTER TABLE questions ADD CONSTRAINT chk_questions_difficulty
    CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- tests
ALTER TABLE tests ADD CONSTRAINT chk_tests_difficulty
    CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Mixed'));
ALTER TABLE tests ADD CONSTRAINT chk_tests_status
    CHECK (status IN ('Active', 'Draft'));

-- interviews
ALTER TABLE interviews ADD CONSTRAINT chk_interviews_status
    CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED'));
ALTER TABLE interviews ADD CONSTRAINT chk_interviews_result
    CHECK (result IS NULL OR result IN ('SELECTED', 'NOT_SELECTED', 'ARCHIVED', 'DELETED'));
ALTER TABLE interviews ADD CONSTRAINT chk_interviews_experience_level
    CHECK (experience_level IS NULL OR experience_level IN ('fresher', 'mid', 'senior'));

-- user_profiles
ALTER TABLE user_profiles ADD CONSTRAINT chk_user_profiles_experience_level
    CHECK (experience_level IS NULL OR experience_level IN ('fresher', 'mid', 'senior'));

-- notifications
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type
    CHECK (type IN ('TEST_RESULT', 'WELCOME', 'SECURITY', 'ONBOARDING'));

-- ---------------------------------------------------------------------------
-- 5. Missing foreign keys (verified: no orphans today).
-- ---------------------------------------------------------------------------
ALTER TABLE categories ADD CONSTRAINT fk_categories_parent
    FOREIGN KEY (category_id) REFERENCES categories (id);

ALTER TABLE tests ADD CONSTRAINT fk_tests_category
    FOREIGN KEY (category_id) REFERENCES categories (id);

COMMIT;
