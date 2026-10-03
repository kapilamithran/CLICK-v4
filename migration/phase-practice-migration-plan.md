# Practice Migration Plan: Updated S0–S9 Content into NEW (dry run, not executed)

Dry-run plan only. Nothing was inserted, updated, deleted, deployed, committed, or pushed. OLD and NEW were read but not modified. The source is the verified export in `migration/.local-practice-export/` (70 questions, 402 tests, 44 prerequisite rows, 332 hidden tests).

## 1. NEW current state (read-only)

| Item | NEW now | Export (target) |
|---|---|---|
| `practice_bank` questions | 70 (STG001=10, STG002=10, STG003=15, STG004=15, STG005=10, STG006=10) | 70 (S0=5, S1=5, S2=5, S3=5, S4=5, S5=6, S6=11, S7=6, S8=15, S9=7) |
| `practice_tests` | 234 (139 hidden, 95 public) | 402 (332 hidden, 70 public) |
| `practice_mistakes` | 0 | 0 |
| `prerequisites` | 10 rows, none Practice-related (all `CH0117`–`CH0128` chapter unlocks) | 44 rows, 15 Practice-related |
| `practice_progress` | **0** | not exported (student data) |
| `attempts` | 0 | not in scope |
| `users` | 1 (the new test account) | not in scope |

The one account on NEW has **no** Practice progress: `practice_progress` is empty.

Per-stage tests in NEW: STG001 29 (19 hidden), STG002 30 (20), STG003 45 (30), STG004 60 (30), STG005 40 (20), STG006 30 (20). No orphan tests.

## 2. Schema: foreign keys, uniqueness, indexes

**Foreign keys that reference Practice questions** (three, all `ON DELETE CASCADE`):
- `practice_tests.practice_id` → `practice_bank.practice_id`
- `practice_mistakes.practice_id` → `practice_bank.practice_id`
- `practice_progress.practice_id` → `practice_bank.practice_id`

**Foreign key from Practice questions:** `practice_bank.stage_id` → `stages.stage_id` (cascade).

**Uniqueness:**
- `practice_bank` primary key `practice_id`.
- `practice_tests` primary key `test_id`.
- `practice_progress` unique `(user_id, practice_id)`.
- `prerequisites` primary key `(target_id, prerequisite_id)`. No foreign keys.

**Indexes:** `idx_practice_bank_stage`, `idx_practice_tests_practice`, `idx_practice_mistakes_practice`, `idx_practice_progress_user`, `idx_practice_progress_completed_at`, `idx_prerequisites_target`.

**Other tables referencing Practice IDs:** none. `prerequisites` stores Practice IDs as plain text with no foreign key, but NEW has no Practice-related prerequisite rows, so nothing depends on them.

## 3. Content comparison (IDs and counts only)

| | Count |
|---|---|
| NEW question IDs | 70 |
| Export question IDs | 70 |
| **Overlapping question IDs** | **0** |
| NEW-only question IDs | 70 (`S0-Q1` style) |
| Export-only question IDs | 70 (`S0-C1-Q1` style) |
| NEW test IDs | 234 (`S0-Q1-T1` style) |
| Export test IDs | 402 (`S0-C1-Q1-T1` style) |
| Overlapping test IDs | 0 |

The export IDs are the authoritative IDs. None of them exist in NEW, so inserting them can't collide with current rows. However, inserting them **alongside** the current rows would leave 140 questions in Practice with two ID schemes. The current S0–S5 rows have to be removed.

## 4. Replacement safety

1. **Can NEW Practice questions be deleted?** Yes. No `practice_progress` rows reference them. The only dependents are the 234 tests (cascade), and 0 mistake rules.
2. **Must tests be deleted first?** Not for correctness, since they cascade. Delete them explicitly first anyway, so the row counts are auditable.
3. **Do prerequisites reference questions?** No. NEW has no Practice-related prerequisites.
4. **Does `practice_progress` reference questions?** No rows exist, so nothing references them.
5. **Does any student or test account have Practice progress?** No. The table is empty.
6. **Cascading deletes?** Yes, all three dependent foreign keys cascade. Deleting questions removes their tests automatically.
7. **Can IDs be preserved exactly?** Yes. Export IDs are used as-is.

**Verdict: SAFE TO REPLACE, with a precondition.** The replacement is only safe if `practice_progress` is still empty at execution time. If a student has started Practice before the migration runs, STOP. Do not cascade-delete their progress.

## 5. Stage mapping

| Practice label | stage_id | Exists in NEW | Active | NEW global `stage_no` (do not use for labels) |
|---|---|---|---|---|
| S0 | STG001 | yes | yes | 0 |
| S1 | STG002 | yes | yes | 1 |
| S2 | STG003 | yes | yes | 2 |
| S3 | STG004 | yes | yes | 3 |
| S4 | STG005 | yes | yes | 4 |
| S5 | STG006 | yes | yes | 5 |
| S6 | STG007 | yes | yes | 8 |
| S7 | STG008 | yes | yes | 9 |
| S8 | STG009 | yes | yes | 10 |
| S9 | STG010 | yes | yes | 11 |

All ten stages exist and are active. **Labels must use the Practice S-number**, which is the `S{n}` prefix of `practice_id`. Do not use `stages.stage_no`. NEW's global numbering puts STG012 and STG013 at 6 and 7, so S6–S9 would display as 8–11. No curriculum stage is changed.

## 6. Tests

- Export total: **402** tests. All belong to the 70 updated questions. Orphans: 0. Duplicate test IDs: 0.
- Every question has between 4 and 6 tests.
- Per stage (tests / hidden / public): S0 21/16/5, S1 25/20/5, S2 27/22/5, S3 30/25/5, S4 30/25/5, S5 36/30/6, S6 66/55/11, S7 35/29/6, S8 90/75/15, S9 42/35/7.
- **Public tests: 70. Hidden tests: 332.** The full set of 402 is migrated, not only the hidden ones.

## 7. Prerequisite analysis (15 Practice-related rows)

| Row | Source (prerequisite) | Target | Target exists in S0–S9 set? | Source exists? | Recommendation | Evidence |
|---|---|---|---|---|---|---|
| P001 ← STG001 | STG001 | P001 | target no (P001 is not a question ID) | yes | **B. Exclude (orphaned)** | Target matches no `practice_bank` ID |
| P002 ← P001 | P001 | P002 | no | no | **B. Exclude (orphaned)** | Neither end matches a question |
| P003 ← P002 | P002 | P003 | no | no | **B. Exclude (orphaned)** | Same |
| P004 ← P003 | P003 | P004 | no | no | **B. Exclude (orphaned)** | Same |
| P005 ← P004 | P004 | P005 | no | no | **B. Exclude (orphaned)** | Same |
| P006 ← P005 | P005 | P006 | no | no | **B. Exclude (orphaned)** | Same |
| P007 ← P006 | P006 | P007 | no | no | **B. Exclude (orphaned)** | Same |
| P008 ← P007 | P007 | P008 | no | no | **B. Exclude (orphaned)** | Same |
| P009 ← P008 | P008 | P009 | no | no | **B. Exclude (orphaned)** | Same |
| P010 ← P009 | P009 | P010 | no | no | **B. Exclude (orphaned)** | Same |
| STG007 ← STG007 | STG007 | STG007 | stage exists | yes | **C. Manual decision** | Self-lock: the stage requires itself. NEW's unlock migrations removed exactly this row. |
| STG008 ← STG008 | STG008 | STG008 | stage exists | yes | **C. Manual decision** | Same |
| STG009 ← STG009 | STG009 | STG009 | stage exists | yes | **C. Manual decision** | Same |
| STG010 ← STG010 | STG010 | STG010 | stage exists | yes | **C. Manual decision** | Same |
| STG011 ← STG011 | STG011 | STG011 | stage exists | yes | **C. Manual decision** | Same |

- **Safe to migrate: 0.**
- **Orphaned: 10** (the P-chain). Exclude.
- **Requires decision: 5** (the STG007–STG011 self-locks). Recommended default is exclude, because NEW's own unlock migrations intentionally removed them. This row set controls stage unlocking, so confirm before any change.

The `P001 ← STG001` row is the only one whose source exists. Its target is orphaned, so it is excluded with the chain.

The export keeps all 44 rows exactly as they are. None are deleted from NEW in this plan.

## 8. Operation order (dry run)

Each step is one statement or one table. The whole content change runs in **a single transaction**, so it either fully applies or fully rolls back. The rows are small (70 questions, 402 tests), so one transaction is safe.

0. **Preflight (read-only).** Confirm NEW `practice_progress` = 0. Confirm NEW `practice_bank` = 70 and `practice_tests` = 234. Verify the export checksums in `manifest.json`. If anything differs, STOP.
1. **Back up NEW's current Practice rows** to a gitignored local file (70 questions, 234 tests, 0 mistakes). This is read-only.
2. **Delete dependent tests** for the current 70 questions (234 rows). This is explicit, so the counts can be checked.
3. **Delete mistake rules** for the current questions (0 rows, for completeness).
4. **Delete current S0–S5 questions** (70 rows).
5. **Insert the 70 updated questions** with their exported IDs, `stage_id` values, and every column (`difficulty`, `marks`, `time_limit_seconds`, `memory_limit_mb`, `workspace_folder`, `experiment_number`, `input_format`, `output_format`, `order`, `active`).
6. **Insert the 402 updated tests**, including `hidden`, `timeout_ms`, `active`, and `order`. This runs after step 5 so the foreign keys resolve.
7. **Prerequisites:** insert 0 rows. The 15 Practice-related rows stay in the export only, pending the decisions in section 7.
8. **Validate** with `migration/phase-practice-migration-validation.sql`. Expected: 70 questions, 402 tests, 332 hidden, S0–S9 distribution as in section 3, 0 orphans, 0 duplicates, `practice_progress` still 0.

**Do not** cascade-delete `practice_bank` directly. Explicit table deletes are clearer and safer.

## 9. Schema change

**NO.** The tables, columns, keys, and indexes already exist and match the export. This is a content migration only.

## 10. Code impact

**Required changes** (needed for S0–S9 to display correctly):
- `supabase/functions/click-backend/index.ts` line 1177: `normalizePracticeQuestion` sets `stage_no` from the global `stages.stage_no`. Add a Practice-specific label derived from the `practice_id` prefix (`S{n}`), and have the UI use it.
- `index.html` line 2225 (breadcrumb `Stage ${stage?.stage_no}`), line 2270 (`Stage ${s.stage_no}`), and line 2303 (`Stage ${s.stage_no}`): switch to the Practice label.
- `index.html` line 2240: hardcoded header text "Real C coding questions from the Stage 0–5 curriculum". Change to S0–S9.
- `vscode-extension/src/practiceTreeProvider.ts` lines 9–10: `Stage ${question.stage_no}`. Switch to the Practice label.
- `vscode-extension/src/questionViewProvider.ts` line 223: `Stage ${q.stage_no}` and `stage_title`. Switch to the Practice label.

**Optional changes** (decide before or after the migration):
- `vscode-extension/src/extension.ts` lines 79–82: every question has `workspace_folder`, so every S6–S9 question gets the Programming-C folder layout. Keep, or limit to S0–S5.
- `extension.ts` lines 287–291: the auto-next filter (`!q.stage_id`). Confirm the intended behavior for S6–S9.
- Comments only: `extension.ts` lines 65, 66, 193, 287 and `index.html` line 933. Update the wording, but there's no behavior change.
- `click-backend/index.ts` line 1192 comment.

**No-change areas:** NEW schema, RLS, authentication, student progress, `stages` (do not change `stage_no`), chapters, `learn_content`, and the curriculum prerequisite rows (`CH0117`–`CH0128`).

## 11. Risks

- **Stage-label mismatch** (section 5) is the main UI risk if the label is not changed in the same release.
- **Mixed ID schemes** if the migration is run in two parts. Run it as one transaction.
- **Student progress.** If `practice_progress` gains rows before the migration runs, the cascade would erase it. The preflight check must stop the migration in that case.
- **Prerequisite gating.** The 5 self-locks are a decision. Excluding them is consistent with NEW's current design, but it changes the stage-unlock behavior, so it needs sign-off.
- **Single copy of OLD content.** The export is the only source. Keep the export and the backup.

## 12. Readiness

- **SAFE TO REPLACE NEW PRACTICE:** YES, if the `practice_progress` precondition holds at execution time.
- **Prerequisites:** safe to migrate 0; orphaned 10; requires decision 5.
- **Migration ready:** NO. Two decisions are still open: the 5 self-locks, and the Practice label source in the code.
