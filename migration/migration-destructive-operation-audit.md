# Migration Destructive-Operation Audit (all 44 files)

Exhaustive search across every migration in `supabase/migrations/` for `DELETE FROM`, `TRUNCATE`, `DROP TABLE`, `DROP COLUMN`, `UPDATE users`, and `INSERT INTO` against any student-data table. No destructive statement was executed as part of this audit — read-only grep of file contents only.

**Result: zero `TRUNCATE`/`DROP TABLE`/`DROP COLUMN`/`UPDATE users` statements exist anywhere in the 44 files.** The 4 "truncate" grep hits are all false positives — the English word inside comments ("truncates", "truncated"), never an actual SQL `TRUNCATE` statement (verified by reading each hit's context). Zero `INSERT INTO users`/`learn_progress`/`test_runs`/`attempts`/`activity_attempts` exists anywhere — **no migration creates any student-specific row.**

## Every DELETE statement found (12 files)

| Migration | Operation | Table | Purpose | Safe on empty NEW db? | Safe after student migration? | Action required |
|---|---|---|---|---|---|---|
| `20260907090000_remove_stage0_practice_challenges.sql` | `delete from practice_bank where title in (...)` | `practice_bank` | Removes 10 retired practice challenges by exact title | **Yes** — curriculum content, not student data | **Yes** — still a scoped, by-title delete; unaffected by student rows existing | None |
| `20260916120000_remove_experiments.sql` | `delete from practice_mistakes/practice_tests/practice_progress/practice_bank where practice_id like 'E%'` | `practice_mistakes`, `practice_tests`, `practice_progress`, `practice_bank` | Removes the retired "Experiments" feature's 57 challenges and their cascade data | **Yes** — scoped by `practice_id` prefix, confirmed (by this migration's own comment, written at authoring time against OLD) to match zero real `practice_progress` rows | **Yes** — same scoping holds regardless of how many students exist, since it only ever matches Experiment-prefixed IDs | None |
| `20260919130000_match_following_to_codefill.sql` | `delete from options where question_id in ('Q000175','Q000242')` | `options` | Removes stale options for 2 questions being converted to a different question type | **Yes** — content-only, not student data | **Yes** — scoped to 2 specific question IDs | None |
| **`20260924000000_clear_test_accounts.sql`** | `delete from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')` | **`users`** | **Pre-launch cleanup of dev/QA/early-signup accounts on OLD, before the real student rollout** | **Yes, currently** — NEW's `users` table is empty when this runs in sequence, so 0 rows match | **NO — would delete every real student except the 2 hardcoded IDs if ever manually re-run after migration** | **See `migration/pre-bootstrap-safety-report.md` §3 for the full decision — not edited, kept as an accurate historical record (already applied to OLD); flagged permanently instead** |
| `20260928000000_unlock_stage6_arrays.sql` | `delete from prerequisites where target_id='STG007' and prerequisite_id='STG007'` | `prerequisites` | Removes Arrays' stage self-lock | **Yes** — curriculum-unlock metadata, not student data | **Yes** | None |
| `20260928030000_unlock_stage8_searching_sorting.sql` | same pattern, `STG009` | `prerequisites` | Removes Searching & Sorting's self-lock | **Yes** | **Yes** | None |
| `20260928050000_unlock_stage7_strings.sql` | same pattern, `STG008` | `prerequisites` | Removes Strings' self-lock | **Yes** | **Yes** | None |
| `20260928070000_unlock_stage9_functions.sql` | same pattern, `STG010` | `prerequisites` | Removes Functions' self-lock | **Yes** | **Yes** | None |
| `20260929020000_unlock_stage7_patterns.sql` | same pattern, `STG013` | `prerequisites` | Removes Patterns' self-lock | **Yes** | **Yes** | None |
| `20260930010000_unlock_stage6_number_crunching.sql` | same pattern, `STG012` | `prerequisites` | Removes Number Crunching's self-lock | **Yes** | **Yes** | None |
| `20261001010000_unlock_stage12_pointers.sql` | same pattern, `STG011` | `prerequisites` | Removes Pointers' self-lock | **Yes** | **Yes** | None |
| `20261001020000_fix_stage6_chapter_order.sql` | `delete from prerequisites where target_id='CH0118' and prerequisite_id='CH0117'` (+ one more edge) | `prerequisites` | Re-chains 2 chapter-unlock edges as part of the Stage 6 chapter-order fix | **Yes** | **Yes** | None |

## Summary

- **Destructive migrations found: 12** (by the task's broad definition of "contains a DELETE").
- **Migrations affecting real student-identity data: 1** (`clear_test_accounts.sql`).
- **Migrations affecting student-progress data: 0** (the one `practice_progress` delete is scoped to retired, never-populated practice IDs).
- **Migrations requiring action before bootstrap: 0** (the one real concern is handled by documentation + permanent flagging, not a code change — see the safety report).
