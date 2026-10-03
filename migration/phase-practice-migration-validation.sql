-- Read-only validation for the updated Practice (S0-S9) content migration.
-- Every statement below is a SELECT. Run against NEW (eyevmykfavooeiklzebe) after the migration.
-- Expected values are noted beside each query. Any mismatch means STOP and report.

-- V1. Counts: questions, tests, hidden/public, mistake rules, prerequisites.
-- Expected: questions 70, tests 402, hidden 332, public 70, mistakes 0.
select
  (select count(*) from practice_bank) as questions,
  (select count(*) from practice_tests) as tests,
  (select count(*) from practice_tests where hidden) as hidden_tests,
  (select count(*) from practice_tests where not hidden) as public_tests,
  (select count(*) from practice_mistakes) as mistake_rules;

-- V2. S0-S9 distribution by stage_id (questions, tests, hidden).
-- Expected: STG001 5, STG002 5, STG003 5, STG004 5, STG005 5, STG006 6, STG007 11, STG008 6, STG009 15, STG010 7.
select pb.stage_id,
  count(distinct pb.practice_id) as questions,
  count(t.test_id) as tests,
  count(t.test_id) filter (where t.hidden) as hidden_tests
from practice_bank pb
left join practice_tests t on t.practice_id = pb.practice_id
group by pb.stage_id
order by pb.stage_id;

-- V3. Every question uses the updated S{n}-C{c}-Q{n} ID scheme. Expected: 0 non-matching IDs.
select count(*) as non_matching_question_ids
from practice_bank
where practice_id !~ '^S[0-9]+-C[0-9]+-Q[0-9]+$';

-- V4. Every test uses the updated S{n}-C{c}-Q{n}-T{n} scheme. Expected: 0 non-matching IDs.
select count(*) as non_matching_test_ids
from practice_tests
where test_id !~ '^S[0-9]+-C[0-9]+-Q[0-9]+-T[0-9]+$';

-- V5. Duplicate IDs. Expected: 0 for both.
select
  (select count(*) - count(distinct practice_id) from practice_bank) as duplicate_question_ids,
  (select count(*) - count(distinct test_id) from practice_tests) as duplicate_test_ids;

-- V6. Orphan tests (test whose question does not exist). Expected: 0.
select count(*) as orphan_tests
from practice_tests t
where not exists (select 1 from practice_bank pb where pb.practice_id = t.practice_id);

-- V7. Orphan questions (question whose stage does not exist). Expected: 0.
select count(*) as orphan_questions_bad_stage
from practice_bank pb
where not exists (select 1 from stages s where s.stage_id = pb.stage_id);

-- V8. Stage mapping: every question's stage_id must be one of STG001-STG010. Expected: 0 outside the set.
select count(*) as questions_outside_s0_s9
from practice_bank
where stage_id not in ('STG001','STG002','STG003','STG004','STG005','STG006','STG007','STG008','STG009','STG010');

-- V9. Practice label check: the S-number from practice_id must agree with stage_id. Expected: 0 mismatches.
-- S0->STG001 ... S9->STG010
select count(*) as label_stage_mismatches
from practice_bank
where not (
  (substring(practice_id from '^S([0-9]+)-')::int = 0 and stage_id = 'STG001') or
  (substring(practice_id from '^S([0-9]+)-')::int = 1 and stage_id = 'STG002') or
  (substring(practice_id from '^S([0-9]+)-')::int = 2 and stage_id = 'STG003') or
  (substring(practice_id from '^S([0-9]+)-')::int = 3 and stage_id = 'STG004') or
  (substring(practice_id from '^S([0-9]+)-')::int = 4 and stage_id = 'STG005') or
  (substring(practice_id from '^S([0-9]+)-')::int = 5 and stage_id = 'STG006') or
  (substring(practice_id from '^S([0-9]+)-')::int = 6 and stage_id = 'STG007') or
  (substring(practice_id from '^S([0-9]+)-')::int = 7 and stage_id = 'STG008') or
  (substring(practice_id from '^S([0-9]+)-')::int = 8 and stage_id = 'STG009') or
  (substring(practice_id from '^S([0-9]+)-')::int = 9 and stage_id = 'STG010')
);

-- V10. Old S0-S5 scheme must be gone. Expected: 0.
select count(*) as old_scheme_questions
from practice_bank
where practice_id ~ '^S[0-9]+-Q[0-9]+$';

-- V11. Prerequisite references. Expected: 0 Practice-related rows (none migrated yet; decisions pending).
select count(*) as practice_related_prerequisites
from prerequisites
where target_id ~ '^P[0-9]+$' or prerequisite_id ~ '^P[0-9]+$'
   or target_id in (select practice_id from practice_bank)
   or prerequisite_id in (select practice_id from practice_bank);

-- V12. Practice progress references. Expected: 0 rows in practice_progress that reference a question
-- that is no longer present, and 0 rows overall while the migration is pending.
select
  (select count(*) from practice_progress) as practice_progress_rows,
  (select count(*) from practice_progress pp where not exists (select 1 from practice_bank pb where pb.practice_id = pp.practice_id)) as progress_orphans;

-- V13. Foreign-key consistency: every dependent Practice table points at an existing question.
-- Expected: 0 for each.
select
  (select count(*) from practice_mistakes m where not exists (select 1 from practice_bank pb where pb.practice_id = m.practice_id)) as mistake_orphans,
  (select count(*) from practice_progress pp where not exists (select 1 from practice_bank pb where pb.practice_id = pp.practice_id)) as progress_fk_orphans,
  (select count(*) from practice_tests t where not exists (select 1 from practice_bank pb where pb.practice_id = t.practice_id)) as test_fk_orphans;

-- V14. Test-per-question spread. Expected: min 4, max 6, and every question has at least one test.
select
  min(n) as min_tests_per_question,
  max(n) as max_tests_per_question,
  count(*) as questions_with_tests
from (
  select pb.practice_id, count(t.test_id) as n
  from practice_bank pb
  left join practice_tests t on t.practice_id = pb.practice_id
  group by pb.practice_id
) x;

-- V15. Student-data guard. Expected: no change in practice_progress from the value recorded in preflight.
-- Replace :pre_progress_count with the count recorded in the preflight step before running.
select count(*) as practice_progress_now from practice_progress;
