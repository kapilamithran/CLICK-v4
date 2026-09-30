-- Adds a minimal, purpose-built table for visualizing-activity XP attempts (assets/learn/), kept entirely
-- separate from the existing question-focused `attempts` table: `attempts.question_id` is NOT NULL, and its
-- other columns (question_attempt_no, correct, hearts_before/after) describe a graded QUESTION, not a
-- learning activity. This way no existing column, constraint, row or query on `attempts` changes at all.
--
-- Activities have never awarded XP before this (see assets/learn/README.md: activities are documented as
-- "learning interactions, not assessments"). This migration only adds a new, empty table -- no existing
-- user's data changes, and no XP is fabricated for anything a student has already done. The unique index
-- on (test_run_id, activity_id) is what makes "already earned this activity's XP" race-proof server side,
-- the same pattern the existing partial unique index on test_runs(user_id, chapter_id) uses for chapter
-- completion (see 20260919120000_test_runs_one_completion_per_chapter.sql).
--
-- Safe to re-run: every statement uses IF NOT EXISTS.

create table if not exists activity_attempts (
  attempt_id   text primary key,
  user_id      text not null references users(user_id) on delete cascade,
  stage_id     text not null,
  chapter_id   text not null,
  activity_id  text not null,
  test_run_id  text not null references test_runs(test_run_id) on delete cascade,
  xp           integer not null default 0,
  xp_committed boolean not null default false,
  attempted_at timestamptz not null default now()
);
create index if not exists idx_activity_attempts_test_run on activity_attempts(test_run_id);
create unique index if not exists uq_activity_attempts_run_activity on activity_attempts(test_run_id, activity_id);
