-- Chapter-completion XP must be awarded at most once per (user, chapter),
-- even under a race (two test_runs for the same chapter finishing at the
-- same instant, e.g. two open tabs, or a duplicated/retried request).
--
-- test_runs already allows multiple rows per (user_id, chapter_id) by
-- design (attempt_no tracks legitimate retakes), so the constraint must be
-- scoped to "completed" rows only: at most one row per (user_id, chapter_id)
-- may ever hold status = 'completed'. Postgres enforces this atomically at
-- the database level, so the backend's UPDATE ... SET status = 'completed'
-- for a second test_run on an already-completed chapter fails with a
-- unique_violation (23505) that click-backend/index.ts's finishTest()
-- catches and turns into a zero-XP "completed_repeat" outcome instead.
--
-- Pre-flight audit (2026-09-19, against production): the OLD finishTest
-- code had no such guard, so real duplicate 'completed' rows already exist
-- -- 7 distinct (user_id, chapter_id) pairs, 9 extra rows total, across 3
-- users (each already legitimately completed that chapter; the extras are
-- from repeat attempts that used to also re-award XP, which is exactly the
-- bug this migration closes). Creating the unique index below would fail
-- outright against that data, so this first reclassifies every extra row
-- for each duplicate pair to 'completed_repeat' -- the SAME status
-- finishTest() now uses going forward for a non-first completion -- keeping
-- only the chronologically FIRST 'completed' row per pair. This is a status
-- relabel only: no row is deleted, no committed_xp/xp_earned figures on
-- existing rows are touched, and users.total_xp is deliberately left alone
-- (a retroactive XP clawback is a separate, more sensitive decision that
-- wasn't asked for here and wasn't made unilaterally).
--
-- Safe to re-apply: the reclassification only ever touches rows still
-- sitting at rn > 1 within a status = 'completed' group, which becomes
-- empty after the first run, and CREATE UNIQUE INDEX IF NOT EXISTS is a
-- no-op once it exists.
with ranked as (
  select test_run_id,
         row_number() over (
           partition by user_id, chapter_id
           order by finished_at asc nulls last, started_at asc
         ) as rn
  from test_runs
  where status = 'completed'
)
update test_runs
set status = 'completed_repeat'
where test_run_id in (select test_run_id from ranked where rn > 1);

create unique index if not exists idx_test_runs_one_completed_per_chapter
  on test_runs (user_id, chapter_id)
  where status = 'completed';
