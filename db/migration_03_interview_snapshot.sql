-- ============================================================================
-- Migration 03: Interviews become an immutable history snapshot table
-- Applies to schema "public". Idempotent-safe.
--
-- Model change (approved): user_profiles is the SINGLE source of truth for the
-- current preparation goal. The interviews table is history ONLY — a row is
-- created at closure time (archive / result), snapshotted from the current goal,
-- and never mutated afterwards. There is no "ACTIVE" interview row anymore.
--
-- 1. Add interviews.focus_topics — the frozen syllabus this preparation cycle
--    targeted, copied from user_profiles at closure.
-- 2. Backfill user_profiles.start_date from the soon-to-be-removed ACTIVE rows
--    so the current goal keeps its original start date (used for history
--    duration).
-- 3. Delete the legacy ACTIVE interview rows. They duplicated the profile and
--    are exactly what caused the archive/desync bug. The profile already holds
--    the same goal, so no data is lost.
--
-- Run with: psql "$DATABASE_URL" -f db/migration_03_interview_snapshot.sql
-- ============================================================================

BEGIN;

ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS focus_topics TEXT;

-- The JPA entity maps user_profiles.interview_date as LocalDate, but the column
-- was historically created as varchar. Hibernate's ddl-auto=update tries to cast
-- it to date on every boot and fails ("cannot be cast automatically"). Fix it
-- once with an explicit USING cast. Idempotent: no-op once the type is date.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'interview_date'
          AND data_type <> 'date'
    ) THEN
        ALTER TABLE user_profiles
            ALTER COLUMN interview_date TYPE date USING interview_date::date;
    END IF;
END $$;

-- Backfill the profile's goal start date from the legacy ACTIVE rows, keeping
-- the earliest start per user so a re-created goal doesn't inherit a later date.
UPDATE user_profiles p
SET start_date = sub.earliest_start
FROM (
    SELECT user_id, MIN(start_date) AS earliest_start
    FROM interviews
    WHERE status = 'ACTIVE' AND start_date IS NOT NULL
    GROUP BY user_id
) sub
WHERE p.user_id = sub.user_id
  AND p.start_date IS NULL
  AND p.target_company IS NOT NULL;

-- The current goal now lives exclusively in user_profiles; remove the ACTIVE
-- duplicate rows that used to mirror it.
DELETE FROM interviews WHERE status = 'ACTIVE';

COMMIT;
