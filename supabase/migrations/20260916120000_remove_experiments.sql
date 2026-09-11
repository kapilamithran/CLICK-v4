-- Removes all Experiment 0-16 data. Experiments are being removed as a
-- CLICK feature entirely (frontend, backend, and VS Code extension code
-- that served them was removed in the same change as this migration).
--
-- Scope: ONLY rows tied to an Experiment practice_bank row, identified by
-- practice_bank.experiment_number IS NOT NULL. This column is additive-only
-- (added in 20260907120000_experiments_practice_columns.sql) and, verified
-- live against production data immediately before writing this migration,
-- is null for every Stage 0-5 and plain Practice Bank row and non-null for
-- exactly the 57 Experiment questions - there is zero overlap with Stage
-- 0-5 (which always has stage_id set) or any other practice content.
--
-- Verified immediately before this migration (production, via
-- `supabase db query --linked`):
--   practice_bank total = 127 (57 experiment / 70 non-experiment)
--   practice_tests total = 347 (113 experiment / 234 non-experiment)
--   practice_mistakes referencing an experiment practice_id = 0
--   practice_progress referencing an experiment practice_id = 0
-- i.e. no real student ever attempted an Experiment question - this removes
-- unused content, not anyone's progress or history.
--
-- Explicitly NOT dropping any columns (difficulty, marks, time_limit_seconds,
-- memory_limit_mb, workspace_folder, experiment_number, input_format,
-- output_format) or relaxing/re-tightening practice_bank.stage_id's
-- nullability from 20260907120000_experiments_practice_columns.sql - those
-- are additive, backward-compatible schema changes with no functional cost
-- to keep, and several of the columns (difficulty, marks, time/memory
-- limits, workspace_folder, input_format, output_format) are actively used
-- by the Stage 0-5 practice questions. Only experiment_number becomes
-- permanently unused data (not dropped, since column drops are unnecessary
-- schema churn for a data-cleanup migration).
--
-- Deleted in dependency order (practice_bank last, since practice_tests,
-- practice_mistakes and practice_progress all reference it).

delete from practice_mistakes
where practice_id in (select practice_id from practice_bank where experiment_number is not null);

delete from practice_tests
where practice_id in (select practice_id from practice_bank where experiment_number is not null);

delete from practice_progress
where practice_id in (select practice_id from practice_bank where experiment_number is not null);

delete from practice_bank
where experiment_number is not null;
