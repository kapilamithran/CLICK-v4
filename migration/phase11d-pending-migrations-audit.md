# Phase 11D — Read-only audit of the 19 pending OLD migrations

> **Correction (final cutover stage, 2026-10-03).** The chapter-conflict finding below is wrong. `20260927000000_content_stage6_arrays.sql` contains a single chapter insert, `CH0116`, which is absent on OLD. It does not insert `CH0062`–`CH0072`. Those 11 chapter rows are created by `20260917120000_stage6to10_placeholders.sql` (recorded on OLD), and the arrays file only references them. The file therefore does not conflict with OLD on chapter IDs. The "11 existing rows" blocker, the "12 chapter rows" description of file 3, and blocker 1 in the Remaining blockers section are superseded. The rest of this report stands, except that the learn-content corrections are not all present on NEW (see `final-cutover-master-report.md`, section D).

Date: 2026-10-03. Repository: `Andryandurai/Click-NewTrial`, `main` at `6a92374` before this report.

Nothing was applied, repaired, deleted, renamed, or marked. No secrets were added. No deployment ran. No student data was read beyond aggregate counts. OLD (`jnxevalckgitxuunjcvv`) and NEW (`eyevmykfavooeiklzebe`) were only read with guarded `SELECT` statements.

Plan gate, stated before the remote reads: targets OLD and NEW; every query was a `SELECT` (checked by a guard before running); no migration executed; no data changed; no credentials printed.

## Executive summary

- The 19 pending files were established from OLD's migration history (26 recorded, 45 local, 19 not recorded). Nothing was inferred from file order.
- `20260924000000_clear_test_accounts.sql` is recorded as applied on OLD and also on NEW. It is not in the pending set and was not touched.
- **Blocker for applying the set to OLD as written:** `20260927000000_content_stage6_arrays.sql` inserts 12 chapter rows, and 11 of them (`CH0062`–`CH0072`) already exist on OLD. The insert has no `on conflict`, so it would stop with a primary-key conflict. This is inferred from the data. Nothing was run.
- OLD already has 53 chapter rows for stages 6–10 (`STG007`–`STG011`), but no learn content and no questions for those stages. NEW has the content for all of its chapters.
- **Structure dependency:** `20260929000000_structure_number_crunching_patterns.sql` creates `STG012`, `STG013` and chapters `CH0117`–`CH0128`. Several later files update or delete rows that only exist after it runs. OLD has none of those rows yet.
- The eight prerequisite deletions remove stage-level self-lock rows and chapter-chain rows. Five of them remove rows that exist on OLD today (`STG007`–`STG011`). NEW has no self-lock rows at all, which matches the earlier decision to exclude them.
- None of the 19 files deletes student rows, drops anything, creates functions or triggers, or changes auth. `20261001030000` adds a new table and enables RLS.
- The learn-content corrections file has 17 exact-text replacements. All 17 match exactly once on OLD, so its safety guard would pass there. It was not run.

## OLD migration history

| Item | Result |
|---|---|
| Recorded on OLD | 26 |
| Local files | 45 |
| Pending (local, not recorded) | 19 |
| Recorded on OLD but not local | 0 |
| `20260924000000_clear_test_accounts` | recorded (APPLIED) |

Method: `SELECT version, name FROM supabase_migrations.schema_migrations` through `supabase db query --linked --project-ref jnxevalckgitxuunjcvv`. The table has no timestamp column, so the time each migration was recorded is not available.

## The 19 pending migrations

Ordered by timestamp. "Rows" are counts of inserted rows from the `insert into` statements.

| # | File | Timestamp |
|---|---|---|
| 1 | `20260910130000_add_missing_legacy_glossary_terms.sql` | 2026-09-10 13:00:00 |
| 2 | `20260926150000_learn_content_corrections.sql` | 2026-09-26 15:00:00 |
| 3 | `20260927000000_content_stage6_arrays.sql` | 2026-09-27 00:00:00 |
| 4 | `20260928000000_unlock_stage6_arrays.sql` | 2026-09-28 00:00:00 |
| 5 | `20260928020000_content_stage8_searching_sorting.sql` | 2026-09-28 02:00:00 |
| 6 | `20260928030000_unlock_stage8_searching_sorting.sql` | 2026-09-28 03:00:00 |
| 7 | `20260928040000_content_stage7_strings.sql` | 2026-09-28 04:00:00 |
| 8 | `20260928050000_unlock_stage7_strings.sql` | 2026-09-28 05:00:00 |
| 9 | `20260928060000_content_stage9_functions.sql` | 2026-09-28 06:00:00 |
| 10 | `20260928070000_unlock_stage9_functions.sql` | 2026-09-28 07:00:00 |
| 11 | `20260929000000_structure_number_crunching_patterns.sql` | 2026-09-29 00:00:00 |
| 12 | `20260929010000_content_stage7_patterns.sql` | 2026-09-29 01:00:00 |
| 13 | `20260929020000_unlock_stage7_patterns.sql` | 2026-09-29 02:00:00 |
| 14 | `20260930000000_content_stage6_number_crunching.sql` | 2026-09-30 00:00:00 |
| 15 | `20260930010000_unlock_stage6_number_crunching.sql` | 2026-09-30 01:00:00 |
| 16 | `20261001000000_content_stage12_pointers.sql` | 2026-10-01 00:00:00 |
| 17 | `20261001010000_unlock_stage12_pointers.sql` | 2026-10-01 01:00:00 |
| 18 | `20261001020000_fix_stage6_chapter_order.sql` | 2026-10-01 02:00:00 |
| 19 | `20261001030000_activity_attempts.sql` | 2026-10-01 03:00:00 |

## Detailed migration-by-migration audit

Flags: schema = DDL present; ins = inserts; upd = updates; del = deletes; RLS, fn, trg = RLS, functions, triggers. "none" means no matching statement was found.

**1. `20260910130000_add_missing_legacy_glossary_terms`**
- Operations: insert 2 glossary rows (`TERM024`, `TERM028`), `on conflict (term_id) do nothing`.
- Schema-only: no. Ins: yes. Upd, del, RLS, fn, trg: none.
- Tables: `glossary` (curriculum support). Student, practice, prerequisite, auth: none.
- Destructive: no. Reversible: partly. `TERM024` already exists on OLD, so reverting this file would delete a row that predates it. Only `TERM028` would be cleanly reversible, and OLD's `TERM028` was not checked.
- Appropriate for OLD: yes; idempotent. Its own header says OLD already had these rows out-of-band.
- NEW: `TERM024` present (migration recorded on NEW).
- Classification: curriculum support, historical on OLD (effectively a no-op for `TERM024`).

**2. `20260926150000_learn_content_corrections`**
- Operations: 17 exact-text `replace()` edits to `learn_content.pages_text` for seven chapters (`CH0031`, `CH0035`, `CH0037`, `CH0042`, `CH0055`, `CH0059`, `CH0061`), in one `do` block. Each edit raises an error and aborts the whole file unless its old text matches exactly once.
- Schema-only: no. Upd: yes (17 text replacements). Ins, del, RLS, fn, trg: none.
- Tables: `learn_content` (curriculum text). No progress, XP, or question changes ("DATA ONLY" per its header).
- Student impact: the text students read in those chapters changes. Progress is not touched.
- OLD check (read-only): all 17 old texts occur exactly once on OLD, so the guard would pass.
- Reversible: yes, by replacing the new text back with the old text, which the file itself records.
- NEW: unknown. NEW has learn content for every chapter, but this audit did not compare the corrected text on NEW.
- Classification: curriculum correction, production-relevant candidate.

**3. `20260927000000_content_stage6_arrays`**
- Operations: insert 12 `chapters` rows (`CH0062`–`CH0072`, `CH0116`, stage `STG007`), 12 `learn_content`, 60 `questions`, 148 `options`, 60 `test_hints`, 49 `glossary`, 49 `question_terms`.
- No `on conflict` clause anywhere in the file.
- OLD conflict: 11 chapter rows (`CH0062`–`CH0072`) already exist on OLD, so the chapter insert would fail with a primary-key conflict. No other row in this file conflicts on OLD (questions, learn content, options, hints, glossary, and question terms for these IDs are absent on OLD).
- Schema-only: no. Ins: yes. Upd, del, RLS, fn, trg: none.
- Tables: `chapters`, `learn_content`, `questions`, `options`, `test_hints`, `glossary`, `question_terms` (all curriculum).
- Student impact: none directly. Content only.
- Destructive: no. Reversible: yes, by deleting the inserted rows; no pre-existing rows would be affected.
- Appropriate for OLD as written: no (chapter conflict).
- NEW: equivalent present. NEW has 12 chapters and 12 learn-content rows for `STG007`.
- Classification: curriculum content, production-relevant, blocked by the chapter conflict.

**4. `20260928000000_unlock_stage6_arrays`**
- Operations: delete 1 `prerequisites` row, `target_id = prerequisite_id = 'STG007'` (self-lock).
- OLD: row present (verified).
- Effect: removes the stage-level lock on Stage 6 (`STG007`). Students then open it on the normal rule for the previous stage.
- Reversible: yes, by re-inserting the self-lock row.
- NEW: equivalent state present (NEW has 0 self-lock rows).
- Classification: prerequisite cleanup (curriculum gating, not student rows).

**5. `20260928020000_content_stage8_searching_sorting`**
- Operations: insert 76 `questions`, 148 `options`, 76 `test_hints`, 76 `glossary`, 76 `question_terms`, 15 `learn_content`. Update `chapters.question_limit = 6` for `CH0086`. One `do` block.
- OLD conflict on inserts: none (questions, learn content, and glossary IDs absent on OLD).
- Student impact: `CH0086`'s question limit changes. The current OLD value was not read.
- Reversible: yes, by restoring the previous value (not recorded in the file).
- NEW: content counts match (`STG009` has 15 chapters and 15 learn-content rows).
- Classification: curriculum content, production-relevant.

**6. `20260928030000_unlock_stage8_searching_sorting`**
- Operations: delete 1 `prerequisites` row, `STG009` self-lock.
- OLD: present. NEW: absent (equivalent state).
- Classification: prerequisite cleanup.

**7. `20260928040000_content_stage7_strings`**
- Operations: insert 30 `questions`, 88 `options`, 30 `test_hints`, 55 `glossary`, 55 `question_terms`, 6 `learn_content`. One `do` block. No chapter insert; `CH0073`–`CH0078` already exist on OLD as shells.
- OLD conflict: none on inserts.
- NEW: content counts match (`STG008` has 6 chapters and 6 learn-content rows).
- Classification: curriculum content, production-relevant.

**8. `20260928050000_unlock_stage7_strings`**
- Operations: delete 1 `prerequisites` row, `STG008` self-lock.
- OLD: present. NEW: absent (equivalent state).
- Classification: prerequisite cleanup.

**9. `20260928060000_content_stage9_functions`**
- Operations: insert 45 `questions`, 107 `options`, 45 `test_hints`, 45 `glossary`, 45 `question_terms`, 9 `learn_content`. One `do` block.
- The grep hits for "create function" are prose in lesson text, not SQL. No functions or triggers are created.
- No chapter insert; `CH0094`–`CH0102` already exist on OLD as shells. No conflicts on inserts.
- NEW: content counts match (`STG010` has 9 chapters and 9 learn-content rows).
- Classification: curriculum content, production-relevant.

**10. `20260928070000_unlock_stage9_functions`**
- Operations: delete 1 `prerequisites` row, `STG010` self-lock.
- OLD: present. NEW: absent.
- Classification: prerequisite cleanup.

**11. `20260929000000_structure_number_crunching_patterns`**
- Operations, all in one guarded `do` block (skips if `STG012` already exists; it does not on OLD):
  - update `stages` `stage_no` and `"order"` by +2 for `STG007`–`STG011`. On OLD these become 8–12 (currently 6–10).
  - insert 2 `stages`: `STG012` (stage_no 6, NUMBER CRUNCHING), `STG013` (stage_no 7, PATTERNS).
  - insert 12 `chapters`: `CH0117`–`CH0123` (stage `STG012`), `CH0124`–`CH0128` (stage `STG013`), titles "Content coming soon".
  - insert 12 `prerequisites`: 2 self-lock rows (`STG012`, `STG013`) and 10 chapter-chain rows.
- OLD conflict: none. `STG012`, `STG013`, and `CH0117`–`CH0128` are absent on OLD (verified).
- Student impact: the displayed stage numbers of the five stages after Loops change. No student rows are touched. Students see two new locked stages labelled as coming soon.
- Destructive: no. Reversible: yes, by reversing the updates and deleting the inserted rows.
- NEW: equivalent present. NEW has 13 stages (`STG001`–`STG013`), with 7 chapters for `STG012` and 5 for `STG013`, each with matching learn-content counts.
- Classification: curriculum structure, production-relevant. Every later file in this set depends on it.

**12. `20260929010000_content_stage7_patterns`**
- Operations: insert 25 `questions`, 52 `options`, 25 `test_hints`, 23 `glossary`, 23 `question_terms`, 5 `learn_content`. One `update chapters` (set titles for `CH0124`–`CH0128` via `case`). One `do` block.
- Dependency: the update targets chapters created by file 11. If it ran before file 11, it would silently update nothing. Timestamp order prevents this.
- NEW: content counts match (`STG013` has 5 chapters and 5 learn-content rows).
- Classification: curriculum content, production-relevant, dependent on file 11.

**13. `20260929020000_unlock_stage7_patterns`**
- Operations: delete 1 `prerequisites` row, `STG013` self-lock. The row is created by file 11, so it exists on OLD only after file 11 runs.
- NEW: absent (equivalent state).
- Classification: prerequisite cleanup, dependent on file 11.

**14. `20260930000000_content_stage6_number_crunching`**
- Operations: insert 36 `questions`, 104 `options`, 36 `test_hints`, 35 `glossary`, 35 `question_terms`, 7 `learn_content`. Update `chapters` titles for `CH0117`–`CH0123` (`case`). Update `chapters.question_limit = 6` for `CH0119`. One `do` block.
- Dependency: needs file 11's chapters.
- NEW: content counts match (`STG012` has 7 chapters and 7 learn-content rows).
- Classification: curriculum content, production-relevant, dependent on file 11.

**15. `20260930010000_unlock_stage6_number_crunching`**
- Operations: delete 1 `prerequisites` row, `STG012` self-lock (created by file 11).
- NEW: absent. Classification: prerequisite cleanup, dependent on file 11.

**16. `20261001000000_content_stage12_pointers`**
- Operations: insert 66 `questions`, 220 `options`, 66 `test_hints`, 66 `glossary`, 66 `question_terms`, 12 `learn_content`. Update `chapters.question_limit` for `CH0103` (6), `CH0104` (7), `CH0105` (7), `CH0108` (6). One `do` block.
- OLD: chapters `CH0103`–`CH0114` exist as shells. No conflicts on inserts. The current OLD `question_limit` values were not read.
- NEW: content counts match (`STG011` has 12 chapters and 12 learn-content rows).
- Classification: curriculum content, production-relevant.

**17. `20261001010000_unlock_stage12_pointers`**
- Operations: delete 1 `prerequisites` row, `STG011` self-lock.
- OLD: present. NEW: absent.
- Classification: prerequisite cleanup.

**18. `20261001020000_fix_stage6_chapter_order`**
- Operations: update `chapters` `chapter_no` and `"order"` for `CH0117` (2) and `CH0118` (1); delete 2 `prerequisites` rows (`CH0118`←`CH0117`, `CH0119`←`CH0118`); insert 2 chain rows (`CH0117`←`CH0118`, `CH0119`←`CH0117`), each guarded by `not exists`.
- Dependency: all targets are created by file 11, so this must run after it. On OLD today every statement is a no-op.
- Idempotent: yes, per its header.
- NEW: equivalent state present. On NEW, `CH0118` has chapter_no 1, `CH0117` has chapter_no 2, and the prerequisite rows are exactly `CH0117`←`CH0118` and `CH0119`←`CH0117`.
- Classification: curriculum order fix (prerequisite cleanup), dependent on file 11.

**19. `20261001030000_activity_attempts`**
- Operations: create table `activity_attempts` (`if not exists`), with foreign keys to `users(user_id)` and `test_runs(test_run_id)` (both cascade on delete); create 2 indexes (`if not exists`, one unique on `(test_run_id, activity_id)`); enable RLS with no policies.
- Schema-only: yes. No existing rows change.
- Student impact: adds a new table. Rows are deleted if their user or test run is deleted. There are no rows on OLD for it yet, since the table is absent.
- Reversible: yes, by dropping the table, which holds no pre-existing data.
- RLS: enabled with no policies. Only the service role can read or write the table. The backend uses the service role.
- NEW: equivalent present. The table exists, RLS is on, and it holds 1 row (from NEW testing).
- Classification: schema addition, production-relevant (additive).

## Eight prerequisite deletions

| File | Row deleted | OLD today | NEW today | Source | Curriculum cleanup or student data |
|---|---|---|---|---|---|
| 4 `20260928000000` | `STG007` self-lock | present | absent | file 4's own header: a placeholder row from `20260917120000` | curriculum gating |
| 6 `20260928030000` | `STG009` self-lock | present | absent | inferred: same self-lock pattern as file 4 (source not checked individually) | curriculum gating |
| 8 `20260928050000` | `STG008` self-lock | present | absent | inferred: same self-lock pattern as file 4 | curriculum gating |
| 10 `20260928070000` | `STG010` self-lock | present | absent | inferred: same self-lock pattern as file 4 | curriculum gating |
| 13 `20260929020000` | `STG013` self-lock | absent until file 11 runs | absent | created by file 11 | curriculum gating |
| 15 `20260930010000` | `STG012` self-lock | absent until file 11 runs | absent | created by file 11 | curriculum gating |
| 17 `20261001010000` | `STG011` self-lock | present | absent | inferred: same self-lock pattern as file 4 | curriculum gating |
| 18 `20261001020000` | `CH0118`←`CH0117` and `CH0119`←`CH0118` | absent until file 11 runs | the post-fix pair is present | created by file 11 | curriculum order |

Student impact: none of the eight deletes touches a student row. Each changes which stage or chapter a student can open. OLD's current stage-level rules are the five self-lock rows listed above and nothing else. No stage-to-stage rules exist for stages 0–5, consistent with the platform's default of unlocked when no rule exists.

## Student impact

- Files 4, 6, 8, 10, 17 open stages 6–10 for students on OLD, depending on where each student is.
- Files 13 and 15 operate only on rows that file 11 creates, so they open nothing on their own.
- File 11 changes the stage numbers students see for stages 6–10 (6–10 become 8–12) and adds two locked stages.
- File 2 changes text students read.
- File 16 changes question limits for four chapters. File 14 changes one. File 5 changes one.
- No file deletes or updates a row in `users`, `sessions`, `learn_progress`, `test_runs`, `attempts`, `practice_progress`, `practice_pairings`, `student_section_assignments`, or `staff_messages`.
- File 19 adds an empty table that references `users` and `test_runs`.

## Curriculum impact

- OLD already has the chapter shells for stages 6–10 (53 chapters), but no learn content and no questions for those stages. Files 3, 5, 7, 9, 12, 14, and 16 would fill that content. File 3 is blocked by its own chapter insert.
- File 11 adds Number Crunching and Patterns as locked, coming-soon structure.
- Files 2 and 14 change existing chapter titles or text.
- OLD also has a stage `STG000` ("Constants, Variables and Data Types", 30 chapters). It is created by `20260910120000_content_stage0_foundations.sql`, which is already recorded on OLD. NEW has no `STG000` (13 stages, `STG001`–`STG013`). None of the 19 pending files touches `STG000`.

## NEW comparison

NEW state read through guarded `SELECT`s:
- 45 migrations recorded, including all 19 pending ones and `20260924000000`.
- 13 stages, 98 chapters, 98 learn-content rows, 520 questions, 0 self-lock prerequisite rows, 1 user.
- `CH0117`, `CH0118`, `CH0119` match the post-fix state of file 18.
- `activity_attempts` exists with RLS on and 1 row.

Category per file:
- **A (already present in NEW):** files 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. Each file's intended end state is present on NEW, verified by counts or by the specific rows checked above. NEW was rebuilt from the same migration set, so these are equivalent, not necessarily produced by these exact files.
- **B (intentionally excluded from NEW):** the five self-lock rows for `STG007`–`STG011`. The earlier decision to exclude them is consistent with NEW having none.
- **C (missing from NEW):** none found.
- **D (unknown):** file 2's corrected learn-content text on NEW (not compared).

## clear_test_accounts status

- `supabase/migrations/20260924000000_clear_test_accounts.sql` is present locally.
- OLD's migration history records it as applied, and NEW's history does too.
- It is therefore not one of the 19 pending migrations, and it is not in this audit's scope.
- No action was taken on it. No speculation is made about when it was applied.

## Historical vs production-relevant classification

| Classification | Files |
|---|---|
| OLD historical | 1 (glossary; effectively a no-op on OLD) |
| Curriculum/schema, production-relevant | 3, 5, 7, 9, 11, 12, 14, 16 (content and structure) |
| Learn-content correction, production-relevant | 2 |
| Prerequisite cleanup | 4, 6, 8, 10, 13, 15, 17, 18 |
| RLS/security (additive) | 19 |
| Student-data modification | none |
| Unknown | none |

## Production decision matrix

| Migration | OLD status | Operation | Student impact | Curriculum impact | NEW equivalent | Historical or production-relevant | Further action |
|---|---|---|---|---|---|---|---|
| 1 glossary | pending | insert 2 glossary rows, idempotent | none | glossary | present | historical | no action yet |
| 2 learn corrections | pending | 17 text replaces | text changes | 7 chapters' text | unknown | production-relevant | investigate NEW text; guard passes on OLD |
| 3 stage6 arrays | pending | content + 12 chapter inserts | none | chapter conflict on OLD | present | production-relevant | blocked: resolve chapter conflict first |
| 4 unlock arrays | pending | delete STG007 self-lock | opens stage 6 | gating | equivalent | production-relevant | decide with file 3 |
| 5 stage8 search | pending | content, one question_limit | question limit on CH0086 | content | present | production-relevant | compare current OLD question_limit |
| 6 unlock search | pending | delete STG009 self-lock | opens stage 8 | gating | equivalent | production-relevant | decide with file 5 |
| 7 stage7 strings | pending | content | none | content | present | production-relevant | no conflict; candidate after file 3 decision |
| 8 unlock strings | pending | delete STG008 self-lock | opens stage 7 | gating | equivalent | production-relevant | decide with file 7 |
| 9 stage9 functions | pending | content | none | content | present | production-relevant | no conflict; candidate after file 3 decision |
| 10 unlock functions | pending | delete STG010 self-lock | opens stage 9 | gating | equivalent | production-relevant | decide with file 9 |
| 11 structure | pending | stage +2 shift, 2 stages, 12 chapters, 12 rules | stage numbers change; locked stages added | structure | present | production-relevant | decide first; files 12–18 depend on it |
| 12 stage7 patterns | pending | content + title updates | none | content | present | production-relevant | depends on file 11 |
| 13 unlock patterns | pending | delete STG013 self-lock | opens stage 7 | gating | equivalent | production-relevant | depends on file 11 |
| 14 stage6 NC | pending | content + titles + question_limit | question limit on CH0119 | content | present | production-relevant | depends on file 11 |
| 15 unlock NC | pending | delete STG012 self-lock | opens stage 6 NC | gating | equivalent | production-relevant | depends on file 11 |
| 16 stage12 pointers | pending | content + 4 question_limits | question limits | content | present | production-relevant | compare current OLD question_limits |
| 17 unlock pointers | pending | delete STG011 self-lock | opens stage 12 | gating | equivalent | production-relevant | decide with file 16 |
| 18 fix NC order | pending | chapter order + 4 prerequisite edits | order of CH0117/0118 | order | equivalent | production-relevant | depends on file 11 |
| 19 activity_attempts | pending | new table + RLS | none | none | present | production-relevant (additive) | candidate; check no client reads table directly |

## Remaining blockers

1. **File 3 conflicts on OLD.** Its chapter insert collides with 11 existing rows. Choose between `on conflict do nothing` (which would also insert `CH0116`), removing the chapter insert after confirming those 11 rows match, or another approach. Requires a decision.
2. **OLD's stage 6–10 chapters are shells.** OLD has chapters with no content. The source of those shells is not recorded in any local migration that was checked.
3. **Structure ordering.** Files 12–18 depend on file 11. Applying any subset needs a rule for the dependency.
4. **STG000 difference.** OLD has `STG000` with 30 chapters; NEW does not. Not explained by the pending set.
5. **Unverified values:** the current OLD `question_limit` on the chapters files 5, 14, and 16 change, and file 2's corrected text on NEW.
6. **Account-cleanup history.** The `clear_test_accounts` record is a fact on both OLD and NEW. Whether the delete changed data on OLD is still unresolved, as noted in Phase 11C.

## Recommendation for next phase

- Do not run any pending migration on OLD yet.
- Read OLD's current `question_limit` for `CH0086`, `CH0103`–`CH0108`, and `CH0119` (read-only), and file 2's corrected text on NEW (read-only).
- Decide the approach for file 3's chapter conflict, then the structure dependency (file 11), before any production secret is added.
- Decide whether the stage 6–10 shells on OLD should be reconciled with NEW's content, or whether OLD should keep its current state.
- Add the production environment protection from Phase 11C before any production secret is added.

## Production secrets gate

The audit does not yet support configuring a GitHub production environment with Supabase secrets. Missing evidence:
- the chapter-conflict resolution for file 3 (blocker 1),
- the decision on the structure dependency and on the shells (blockers 2 and 3),
- the STG000 explanation (blocker 4),
- the three unverified values (blocker 5).
