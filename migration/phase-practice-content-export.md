# Practice Content Export (OLD, read-only)

Read-only extraction of the updated Practice curriculum from the live OLD database. Every statement was a `SELECT`. OLD and NEW were not modified. No code was modified. Nothing was committed or pushed.

Files are local only, in `migration/.local-practice-export/`. That folder is gitignored (`.gitignore`, `migration/.local-practice-export/`) and excluded from the Cloudflare upload (`.assetsignore`, `migration/**`). Question content is curriculum, not personal data. No credentials, keys, or student rows were exported.

## 1. OLD Practice table structure

| Table | Primary key | Foreign keys | Rows | Notes |
|---|---|---|---|---|
| `practice_bank` | `practice_id` | `stage_id` → `stages.stage_id` (cascade) | 70 | The questions. No `stage_no` or label column. The S-label comes from the `practice_id` prefix. |
| `practice_tests` | `test_id` | `practice_id` → `practice_bank.practice_id` (cascade) | 402 | Visible and hidden test cases. 332 hidden. |
| `practice_mistakes` | `mistake_id` | `practice_id` → `practice_bank.practice_id` (cascade) | 0 | Empty on both databases. |
| `prerequisites` | `(target_id, prerequisite_id)` | none | 44 | Unlock rules for chapters, stages, and practice. No foreign keys. |
| `practice_progress` | `progress_id` | `user_id` → `users`, `practice_id` → `practice_bank`; unique `(user_id, practice_id)` | 5 | **Student-owned, not exported.** It belongs to the student migration. |
| `stages` (read only) | `stage_id` | none | 13 | Used only for the stage mapping. |

**Columns in `practice_bank`:** `practice_id`, `stage_id`, `title`, `objective`, `problem_statement`, `constraints`, `sample_input`, `sample_output`, `starter_code`, `hint_1`, `hint_2`, `hint_3`, `success_message`, `technique_after_success`, `order`, `active`, `difficulty`, `marks`, `time_limit_seconds`, `memory_limit_mb`, `workspace_folder`, `experiment_number`, `input_format`, `output_format`.

**Columns in `practice_tests`:** `test_id`, `practice_id`, `name`, `input`, `expected_output`, `hidden`, `timeout_ms`, `active`, `order`.

**Columns in `prerequisites`:** `target_id`, `prerequisite_id`, `condition`, `description`, `active`.

**Correct answers and explanations:** there are no answer-key or explanation columns. Grading happens by running the code against `practice_tests` (`completePractice` in the backend). Correct answers are the expected outputs of those tests.

**Correction to the previous audit:** the stage-number mismatch I reported (S6–S9 showing as "Stage 8–11") is caused by NEW's numbering, not OLD's. On OLD, `stages.stage_no` is 0–9 for STG001–STG010, which matches the S-labels exactly. NEW inserts STG012 and STG013 at stage_no 6 and 7, which shifts STG007–STG010 to 8–11.

## 2. Updated Practice stage mapping (verified against live OLD)

| Practice label | stage_id | OLD stage_no | OLD title |
|---|---|---|---|
| S0 | STG001 | 0 | Foundations |
| S1 | STG002 | 1 | Datatypes |
| S2 | STG003 | 2 | Operators |
| S3 | STG004 | 3 | Input |
| S4 | STG005 | 4 | Decision Making |
| S5 | STG006 | 5 | Loops |
| S6 | STG007 | 6 | ARRAYS |
| S7 | STG008 | 7 | STRINGS |
| S8 | STG009 | 8 | SEARCHING & SORTING |
| S9 | STG010 | 9 | FUNCTIONS |

## 3. Actual question counts (live)

| Stage | Questions | Expected (prior audit) | Match | Tests linked |
|---|---|---|---|---|
| S0 / STG001 | 5 | 5 | yes | see summary file |
| S1 / STG002 | 5 | 5 | yes | |
| S2 / STG003 | 5 | 5 | yes | |
| S3 / STG004 | 5 | 5 | yes | |
| S4 / STG005 | 5 | 5 | yes | |
| S5 / STG006 | 6 | 6 | yes | |
| S6 / STG007 | 11 | 11 | yes | |
| S7 / STG008 | 6 | 6 | yes | |
| S8 / STG009 | 15 | 15 | yes | |
| S9 / STG010 | 7 | 7 | yes | |
| **Total** | **70** | **70** | **yes** | |

Out-of-scope rows in `practice_bank`: 0. The full table is exactly the 70 questions in S0–S9.

## 4. Hidden-test count (live)

- `practice_tests` total: **402**
- Hidden (`hidden = true`): **332**
- Visible: 70
- All 402 tests reference an exported question.

## 5. Prerequisite rows (exported exactly, not repaired)

All 44 rows are in `practice-prerequisites.json` and `.csv`. Fifteen of them relate to Practice or the STG007–STG011 self-locks:

- **P-chain (10 rows):** `P001 ← STG001`, `P002 ← P001`, … `P010 ← P009`, all `completed`, all active.
  - None of the `P0xx` IDs match a `practice_bank.practice_id` (the questions use `S{n}-C{c}-Q{n}` or `S{n}-Q{n}`). These rows reference nothing in the question set.
- **Self-locks (5 rows):** `STG007 ← STG007`, … `STG011 ← STG011`. These are the rows that the unlock migrations would remove, and those migrations are not applied on OLD.

These 15 rows are preserved exactly, pending a decision on whether they are obsolete.

## 6. Exported files

Directory: `migration/.local-practice-export/` (gitignored). The `manifest.json` in that directory records the same values.

| File | Rows | Bytes | SHA-256 |
|---|---|---|---|
| `practice-questions.json` | 70 | 239842 | `0f54ccf63a7f277596b51a704ea1ffedc88f4ae2305a7b35f04d6b9abef439de` |
| `practice-questions.csv` | 70 | 200471 | `b7f3ccfb59de946533775e4125cb4591db612a22a99ae17f4887ebf690c5be02` |
| `practice-tests.json` | 402 | 140885 | `de49c000b5dff7db2129d118674e6ad63b35a6a93afae17ebb1715ece9e15959` |
| `practice-tests.csv` | 402 | 72713 | `90fdcaf3bdc0c891cbf758f3971a65d3cbf7706c65df4be4a90e83da83db993f` |
| `practice-mistakes.json` | 0 | 3 | `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` |
| `practice-prerequisites.json` | 44 | 8307 | `baca6f07b8603f34332ece96226aec7222791979c697a0615112ae37461fa511` |
| `practice-prerequisites.csv` | 44 | 3475 | `d087114005261e2a6f1811ef9fb512e61084ca9ce64cc8e03e467ac6ae538b09` |
| `practice-stage-summary.json` | 10 | 1580 | `5bc11770c161484bd1ace19322df919bca2183678bc74b895fe4e219bc2fdda9` |
| `manifest.json` | — | 2306 | (records the above; not self-hashed) |

**Extraction timestamp:** 2026-10-03T04:27:49Z. **Source:** OLD `jnxevalckgitxuunjcvv`. **Read-only:** true.

**Not exported:** `practice_progress` (5 student rows, out of scope for a content export).

## 7. Self-consistency results

| Check | Result |
|---|---|
| Every exported question has a valid S0–S9 stage | pass (0 out of scope) |
| Every hidden test references an exported question | pass (0 orphaned tests) |
| No duplicate question IDs | pass (0) |
| No duplicate test IDs | pass (0) |
| No missing required fields (`practice_id`, `stage_id`, `title`, `problem_statement`, `order`, `active`) | pass (0) |
| S0–S9 total = 70 | pass |
| Hidden-test count reported | 332 |
| S6–S9 included | pass (STG007–STG010, 39 questions) |
| All JSON files re-parsed successfully | pass |
| OLD rows modified | none (SELECT only) |
| NEW modified | none. NEW still has 70 rows across 6 stages (STG001–STG006), unchanged |

## 8. Extension Stage 0–5 assumptions (no changes made)

Searched `vscode-extension/src` for stage ranges, STG IDs, `workspace_folder`, and the ID formats.

| File:line | Assumption | Impact on S0–S9 |
|---|---|---|
| `vscode-extension/src/extension.ts:65` | Comment: `workspace_folder` marks "the Stage 0-5 curriculum questions". | Comment only, but it states the wrong scope. |
| `vscode-extension/src/extension.ts:66` | Comment on the folder structure. | Comment only. |
| `vscode-extension/src/extension.ts:79–82` | Any question with `workspace_folder` gets the `Programming-C/<folder>/` layout. | All 70 questions have `workspace_folder` set, so every S6–S9 question would get that layout. Verify this is intended. |
| `vscode-extension/src/extension.ts:193` | Comment: "Practice Bank and Stage 0-5". | Comment only. |
| `vscode-extension/src/extension.ts:287–291` | Comment and filter: the "next" pick excludes questions with `stage_id` set (`!q.stage_id`). | This filter is the Stage 0–5 exclusion. If `stage_id` is set on all questions, auto-next picks nothing staged, including S6–S9. Verify the intended behavior. |
| `vscode-extension/src/practiceTreeProvider.ts:9–10` | Labels questions `Stage ${stage_no}`. | On NEW, S6–S9 would show as Stage 8–11 because of NEW's numbering. On OLD they show correctly. This is the main label risk. |
| `vscode-extension/src/questionViewProvider.ts:223` | Shows `Stage ${stage_no}` and `stage_title`. | Same label risk. |
| `vscode-extension/src/types.ts:19, 42` | Declares `stage_no` and `workspace_folder` as optional. | No hardcoded range. |

**Format assumptions:** none found. No code parses `S0-C1-Q1` or `S0-Q1` IDs. The IDs are treated as opaque strings, so both formats work without change.

**Stage 0–5 hardcoding outside the extension** (for completeness): `index.html:2240` header copy and `index.html:933` CSS comment. The backend has a comment at `click-backend/index.ts:1192`, and it has no range logic.

## 9. Recommended next implementation steps

1. **Decide the label source before any migration.** Either derive the S-number from the `practice_id` prefix, or make NEW's `stage_no` for STG007–STG010 match OLD (6–9). Changing NEW's numbering would break the `STG012`/`STG013` placement, so the prefix approach is safer.
2. **Decide the content migration strategy.** Replace NEW's S0–S5 Practice rows with these 70 questions and their 402 tests, in one migration. Don't mix the two ID schemes.
3. **Decide on the 15 prerequisite rows.** The P-chain is dead and the self-locks belong to the unlock migrations. Confirm before removing anything.
4. **Decide the extension behaviors** flagged in section 8: `workspace_folder` layout for S6+, and the auto-next filter.
5. **Update the copy** at `index.html` 933 and 2240 for S0–S9.
6. **Keep this export as the source of truth.** Keep the gitignored folder and its manifest, and recheck the SHA-256 values before any import. OLD's practice content is not in git.

## Status

- **OLD READ-ONLY:** PASS
- **UPDATED PRACTICE EXPORTED:** YES
- **S0–S9 EXPORTED:** YES
- **QUESTION COUNT:** 70
- **HIDDEN TEST COUNT:** 332 (402 tests total)
- **NEW MODIFIED:** NO
- **CODE MODIFIED:** NO (only `.gitignore`, to exclude the export folder)
- **READY FOR PRACTICE MIGRATION:** NO. The label source, the content strategy, and the prerequisite decision are still open.
