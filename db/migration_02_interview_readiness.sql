-- ============================================================================
-- Migration 02: Interview readiness snapshot
-- Applies to schema "public". Idempotent-safe.
--
-- Adds interviews.interview_readiness — a frozen historical snapshot of the
-- interview's readiness (coverage-aware, focus-topic scope), captured once when
-- the interview is completed or archived. It is intentionally NOT recomputed:
-- later practice, focus-topic edits or syllabus growth must not change history.
-- Active interviews keep this column NULL; their readiness is derived live for
-- the dashboard. Existing closed interviews are left NULL (no backfill) so we
-- never attribute a readiness to an interview whose focus topics are unknown.
--
-- Run with: psql "$DATABASE_URL" -f db/migration_02_interview_readiness.sql
-- ============================================================================

BEGIN;

ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS interview_readiness NUMERIC(5,2);

COMMIT;