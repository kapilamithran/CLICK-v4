-- PHASE 10C -- PRE-FLIGHT (Section A) and POST-MIGRATION VALIDATION (Section C).
-- Contains no real student data -- only query templates, safe to commit/share.
-- The data-filled write statements (Section B) are produced separately by running
-- phase10c-generate-migration-sql.js yourself; they are never embedded here.

-- ============================================================
-- SECTION A -- PRE-FLIGHT READ-ONLY VALIDATION
-- ============================================================

-- A1. Run against OLD (jnxevalckgitxuunjcvv).
select
  (select count(*) from users) as total_users,
  (select count(*) from users where user_id in ('U1A8B0A6D8810','U485B9DDDA04E')) as protected,
  (select count(*) from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as selected_students,
  (select count(distinct user_id) from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as distinct_user_id,
  (select count(distinct roll_no) from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as distinct_roll_no,
  (select count(distinct email) from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as distinct_email,
  (select count(*) from test_runs where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as source_test_runs,
  (select count(*) from attempts where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as source_attempts,
  (select count(*) from learn_progress where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as source_learn_progress,
  (select count(*) from practice_progress where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as source_practice_progress,
  (select count(*) from student_section_assignments where student_id not in ('U1A8B0A6D8810','U485B9DDDA04E')) as source_section_assignments,
  (select count(*) from learn_progress where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E') and (stage_id='STG000' or chapter_id between 'CH0001' and 'CH0030')) as stg000_rows,
  (select count(*) from test_runs where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E') and stage_id in ('STG007','STG008','STG009','STG010','STG011')) as stg7_11_rows,
  (select count(*) from practice_progress where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E') and practice_id like 'E%') as e_prefix_rows,
  (select count(*) from practice_progress where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E') and practice_id not in (select practice_id from practice_bank)) as invalid_practice_refs;
-- Expected: total_users=354, protected=2, selected_students=352, distinct_user_id=352, distinct_roll_no=352,
-- distinct_email=352, source_test_runs=805, source_attempts=4688, source_learn_progress=450,
-- source_practice_progress=5, source_section_assignments=352, stg000_rows=0, stg7_11_rows=0,
-- e_prefix_rows=0, invalid_practice_refs=0.
-- If ANY value differs from this, STOP. Do not proceed to Section B.

-- A2. Run against NEW (eyevmykfavooeiklzebe).
select
  (select count(*) from users) as new_users,
  (select count(*) from test_runs) as new_test_runs,
  (select count(*) from attempts) as new_attempts,
  (select count(*) from learn_progress) as new_learn_progress,
  (select count(*) from practice_progress) as new_practice_progress,
  (select count(*) from student_section_assignments) as new_section_assignments,
  (select count(*) from stages) as new_stages,
  (select count(*) from chapters) as new_chapters,
  (select count(*) from stages where stage_id='STG000') as new_stg000_present;
-- Expected: new_users=0, new_test_runs=0, new_attempts=0, new_learn_progress=0, new_practice_progress=0,
-- new_section_assignments=0, new_stages=13, new_chapters=98, new_stg000_present=0.
-- If NEW is not empty, or curriculum differs, STOP. Do not proceed to Section B. Do not reset NEW.

-- A3. Auth-data-completeness check, run against OLD.
select count(*) filter (where password_hash is not null and password_hash != '') as hash_present,
  count(*) filter (where password_salt is not null and password_salt != '') as salt_present
  from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E');
-- Expected: hash_present=352, salt_present=352.

-- ============================================================
-- SECTION B -- MIGRATION WRITES
-- ============================================================
-- Not included in this file (contains no real data by design). Produce it by running
-- `node phase10c-generate-migration-sql.js` (in this same migration/ folder) on a machine where the
-- Supabase CLI is already linkable, exactly as this session used it. That produces
-- `phase10c-migration-data.sql`, which you should open and read before running it against NEW.

-- ============================================================
-- SECTION C -- POST-MIGRATION VALIDATION
-- ============================================================

-- C1. Row counts, run against NEW.
select
  (select count(*) from users) as new_users,
  (select count(*) from test_runs) as new_test_runs,
  (select count(*) from attempts) as new_attempts,
  (select count(*) from learn_progress) as new_learn_progress,
  (select count(*) from practice_progress) as new_practice_progress,
  (select count(*) from student_section_assignments) as new_section_assignments;
-- Expected: new_users=352, new_test_runs=805, new_attempts=4688, new_learn_progress=450,
-- new_practice_progress=5, new_section_assignments=352.

-- C2. Protected accounts / staff / excluded-data sanity, run against NEW. Every value must be 0.
select
  (select count(*) from users where user_id in ('U1A8B0A6D8810','U485B9DDDA04E')) as protected_accounts_migrated,
  (select count(*) from staff_users) as staff_users_migrated,
  (select count(*) from staff_messages) as staff_messages_migrated,
  (select count(*) from sessions) as sessions_migrated,
  (select count(*) from practice_pairings) as practice_pairings_migrated,
  (select count(*) from activity_attempts) as activity_attempts_migrated,
  (select count(*) from learn_progress where stage_id='STG000' or chapter_id between 'CH0001' and 'CH0030') as new_stg000_rows,
  (select count(*) from test_runs where stage_id in ('STG007','STG008','STG009','STG010','STG011')) as new_stg7_11_rows,
  (select count(*) from practice_progress where practice_id like 'E%') as new_e_prefix_rows;

-- C3. Collision / referential-integrity checks, run against NEW. Every value must be 0.
select
  (select count(*) from users) - (select count(distinct user_id) from users) as user_id_dupes,
  (select count(*) from users) - (select count(distinct roll_no) from users) as roll_no_dupes,
  (select count(*) from users) - (select count(distinct email) from users) as email_dupes,
  (select count(*) filter (where username is not null) from users) - (select count(distinct username) filter (where username is not null) from users) as username_dupes,
  (select count(*) from attempts where test_run_id not in (select test_run_id from test_runs)) as orphan_attempt_test_run,
  (select count(*) from attempts where user_id not in (select user_id from users)) as orphan_attempt_user,
  (select count(*) from test_runs where user_id not in (select user_id from users)) as orphan_test_run_user,
  (select count(*) from learn_progress where user_id not in (select user_id from users)) as orphan_learn_progress_user,
  (select count(*) from practice_progress where user_id not in (select user_id from users)) as orphan_practice_progress_user,
  (select count(*) from practice_progress where practice_id not in (select practice_id from practice_bank)) as orphan_practice_id,
  (select count(*) from student_section_assignments where student_id not in (select user_id from users)) as orphan_assignment_student,
  (select count(*) from student_section_assignments where section_id not in (select section_id from sections)) as orphan_assignment_section,
  (select count(*) from student_section_assignments where assigned_by is not null) as unexpected_non_null_assigned_by;

-- C4. Authentication fidelity check -- NEVER prints an individual hash/salt. Run on OLD, then on NEW, and
-- compare the two resulting checksum strings for EXACT equality. A character-for-character match proves
-- all 352 hashes and all 352 salts were copied byte-for-byte unchanged, without ever displaying one.
-- Run against OLD:
select md5(string_agg(user_id || ':' || password_hash || ':' || password_salt, ',' order by user_id)) as old_auth_checksum
  from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E');
-- Run against NEW:
select md5(string_agg(user_id || ':' || password_hash || ':' || password_salt, ',' order by user_id)) as new_auth_checksum
  from users;
-- old_auth_checksum must equal new_auth_checksum exactly. If they differ, STOP and report -- do not try to
-- identify which row(s) differ by printing credentials; escalate for manual review instead.

-- C5. Per-student reconciliation -- aggregate checksum of (user_id, per-table counts, key aggregates),
-- compared the same way as C4. Uses the backend's actual completion semantics; see Phase 10B's note on
-- the validation-query bug that omitted completed_repeat -- this query does not need that status at all,
-- since it compares raw per-table row counts and the users-table rollup columns directly, not a
-- recomputed "tests completed" figure.
-- Run against OLD:
select md5(string_agg(
  u.user_id || ':' ||
  coalesce((select count(*) from learn_progress lp where lp.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from test_runs tr where tr.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from attempts a where a.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from practice_progress pp where pp.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from student_section_assignments ssa where ssa.student_id=u.user_id),0) || ':' ||
  u.total_xp || ':' || u.hearts || ':' || u.tests_completed || ':' || u.questions_attempted || ':' || u.correct_answers
  , ',' order by u.user_id)) as old_reconciliation_checksum
  from users u where u.user_id not in ('U1A8B0A6D8810','U485B9DDDA04E');
-- Run against NEW (identical query, no exclusion needed since NEW only ever has the 352 selected students):
select md5(string_agg(
  u.user_id || ':' ||
  coalesce((select count(*) from learn_progress lp where lp.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from test_runs tr where tr.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from attempts a where a.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from practice_progress pp where pp.user_id=u.user_id),0) || ':' ||
  coalesce((select count(*) from student_section_assignments ssa where ssa.student_id=u.user_id),0) || ':' ||
  u.total_xp || ':' || u.hearts || ':' || u.tests_completed || ':' || u.questions_attempted || ':' || u.correct_answers
  , ',' order by u.user_id)) as new_reconciliation_checksum
  from users u;
-- old_reconciliation_checksum must equal new_reconciliation_checksum exactly. A mismatch means at least
-- one student's row counts or XP/hearts/tests_completed/questions_attempted/correct_answers differ
-- between OLD and NEW -- investigate before declaring success, but do not alter data to force a match.

-- C6. OLD immutability re-check. Run against OLD. Expect total_users=354 (unchanged).
select count(*) as total_users from users;
