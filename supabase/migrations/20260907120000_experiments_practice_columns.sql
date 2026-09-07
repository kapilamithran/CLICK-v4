-- Extends the existing practice_bank table so Experiment 0-16 questions can
-- become real, reusable practice_bank rows instead of a second/parallel
-- challenge system. Purely additive: every new column is nullable, so every
-- existing practice_bank row (and every existing reader of this table) is
-- completely unaffected.
--
-- stage_id is relaxed to nullable because Experiments are not part of the
-- Stage system -- a NULL foreign key is simply exempt from the FK check
-- (standard SQL, not a workaround), and the existing Practice-tab/Progress
-- code already only ever matches practice_bank rows against a real,
-- non-null selected stage_id, so NULL-stage_id rows are naturally invisible
-- there with no further changes needed.

alter table practice_bank
  add column if not exists difficulty text,
  add column if not exists marks integer,
  add column if not exists time_limit_seconds integer,
  add column if not exists memory_limit_mb integer,
  add column if not exists workspace_folder text,
  add column if not exists experiment_number integer,
  add column if not exists input_format text,
  add column if not exists output_format text;

alter table practice_bank
  alter column stage_id drop not null;
