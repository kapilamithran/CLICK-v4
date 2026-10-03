# Practice Curriculum Audit: PUC-V2 (live OLD) vs Click-NewTrial (NEW)

Audit only. Nothing was changed except this report. Nothing was committed, pushed, deployed, or written to any database. Practice content was compared by question ID and content hash only, so no question text is reproduced here.

## 1. Current Click Practice architecture
- **UI:** `index.html`, Practice tab. The header is hardcoded at line 2240: "Real C coding questions from the Stage 0–5 curriculum". The CSS comment at line 933 also says "Stage 0-5".
- **Content:** database-backed. There are no static question files. Questions live in `practice_bank` (question, hints, starter code), with `practice_tests` (visible and hidden tests) and `practice_mistakes` (rules, empty on both databases).
- **Backend:** `supabase/functions/click-backend/index.ts`. It reads `practice_bank`, `practice_tests`, and `practice_mistakes` (lines 406–408, 1225, 1292), normalizes each question with `normalizePracticeQuestion`, and gates each one with `prerequisiteStatus("PRACTICE", ...)`.
- **Progress:** `practice_progress`, per student.
- **VS Code extension:** `vscode-extension/src/practiceTreeProvider.ts` and `extension.ts`. It labels questions by `stage_no` and has Stage 0–5-specific logic (`extension.ts` lines 63–68 and 284–292).

## 2. Updated PUC-V2 Practice architecture
- **Same architecture.** It is also database-backed. The extension and frontend code match Click's, apart from a line-ending difference in `practiceTreeProvider.ts` (identical with `--strip-trailing-cr`).
- **Where the updated content lives:** the **live OLD database** (`jnxevalckgitxuunjcvv`), in `practice_bank`. It is **not** in the GitHub repo.
  - Git `main` (`118904e`) is the only branch on `darshansathish2006/PUC-V2`. Its Practice migrations match Click's byte-for-byte.
  - `CSVs/CLICK v2 - PracticeBank.csv` is 182 bytes, a header row only, in both repos.
  - So the updated Stage 0–9 questions have no git source. They were added to the live database directly, not through a migration.

## 3. Stage comparison (Stage 0–9)
Stage names come from NEW's `stages` table. OLD's stage titles were not queried, but the stage IDs and numbers come from the same migrations.

| Practice label | stage_id | Curriculum stage (stage_no) | OLD questions | NEW questions | In current Click | Count |
|---|---|---|---|---|---|---|
| S0 | STG001 | Foundations (0) | 5 | 10 | yes | differs |
| S1 | STG002 | Datatypes (1) | 5 | 10 | yes | differs |
| S2 | STG003 | Operators (2) | 5 | 15 | yes | differs |
| S3 | STG004 | Input (3) | 5 | 15 | yes | differs |
| S4 | STG005 | Decision Making (4) | 5 | 10 | yes | differs |
| S5 | STG006 | Loops (5) | 6 | 10 | yes | differs |
| S6 | STG007 | Arrays (8) | 11 | 0 | no | new in updated |
| S7 | STG008 | Strings (9) | 6 | 0 | no | new in updated |
| S8 | STG009 | Searching & Sorting (10) | 15 | 0 | no | new in updated |
| S9 | STG010 | Functions (11) | 7 | 0 | no | new in updated |

- Practice labels S0–S9 map to stage IDs STG001–STG010 on OLD.
- Current Click has Practice only for S0–S5 (STG001–STG006), which is why the deployed site stops at Stage 0–5.
- **Stages 6 and 7** (Number Crunching and Patterns, STG012/STG013) have no Practice on either database.
- **Stage numbering mismatch.** Practice labels S6–S9 sit on curriculum stages whose `stage_no` is 8–11. If the UI labels Practice by `stage_no`, the S6 Arrays questions would display as "Stage 8". The extension labels by `stage_no` too, so this needs a decision before any rollout.
- Every stage's question count differs between OLD and NEW, and no question ID is shared, so the S0–S5 content was rewritten, not just extended.

## 4. Question-count comparison
| | OLD (updated) | NEW (current Click) |
|---|---|---|
| Total questions | 70 | 70 |
| Stages covered | 10 (S0–S9) | 6 (S0–S5) |
| Practice IDs shared with NEW | 0 | 0 |
| Hidden tests (`practice_tests.hidden`) | 332 | 139 |
| Total tests | 402 | 234 |
| Mistake rules | 0 | 0 |
| Student progress rows | 5 | 0 |

The two sets share **no** question IDs. OLD uses `S{n}-C{chapter}-Q{n}` (for example `S0-C1-Q1`). NEW uses `S{n}-Q{n}` (for example `S0-Q1`).

## 5. Exact source files
- Current Click Practice data: `supabase/migrations/20260913120000_content_practice_stage0to5.sql`, `20260913130000_practice_stage0_hints.sql`, `20260915120000_practice_stage0to5_hidden_tests.sql`, `20260907120100_seed_experiments_practice_bank.sql`, `20260916120000_remove_experiments.sql`.
- Updated Practice data: **none in git.** The live OLD `practice_bank`, `practice_tests`, and `prerequisites` hold it.
- UI: `index.html` lines 933 and 2240, plus the Practice rendering code.
- Backend: `supabase/functions/click-backend/index.ts` (lines 406–408, 587–588, 947, 1163, 1225–1228, 1248–1249, 1292–1296).
- Extension: `vscode-extension/src/extension.ts` (63–68, 193, 284–292) and `practiceTreeProvider.ts`.

## 6. Data flow comparison
- **Current:** NEW `practice_bank` (S0–S5) → backend `normalizePracticeQuestion` → `practice` in bootstrap → Practice tab. Hidden tests run server-side in `completePractice`.
- **Updated:** OLD `practice_bank` (S0–S9, 70 rows) → the same path. Nothing else differs in the code path, so the updated content would appear automatically once it's in NEW.
- **Gating difference:** OLD has 44 `prerequisites` rows, 15 of them practice-related. NEW has 10 rows, none practice-related.
  - A `P001`→`P010` chain (10 rows) points at `P0xx` IDs. No `practice_bank` row uses that scheme, so these rows are unmatched and effectively dead.
  - `STG007`–`STG011` self-locks (5 rows) are the rows removed by the unlock migrations. Those migrations are not applied on OLD, so the rows still exist there. They are unrelated to Practice.

## 7. Supabase change required
**YES, content only. No schema change.** The updated 70 questions and their tests (402 rows) need to be inserted into NEW's `practice_bank`, `practice_tests`, and possibly `prerequisites`, after the current S0–S5 rows are removed or replaced.
- This is option **B**, database-backed content. It belongs in NEW Supabase, not in static files. The backend, progress tracking, hidden-test grading, and extension all read it from the database.
- The learning curriculum (`stages`, `chapters`, `learn_content`) stays authoritative and is not changed.
- Student progress: 5 OLD `practice_progress` rows reference the updated IDs. Those belong to the separate student migration, not this content change.

## 8. Recommended implementation approach
1. **Export the updated content from OLD read-only** into a reviewable SQL migration on a branch. Include `practice_bank`, `practice_tests`, and the matching `prerequisites` rows.
2. **Decide the stage mapping** before inserting. Either (a) keep S0–S9 on STG001–STG010 and change the UI and extension to label by practice number instead of `stage_no`, or (b) remap S6–S9 to the correct curriculum stages.
3. **Replace, don't merge.** Remove the NEW S0–S5 rows (and their tests and hints) in the same migration, so the two sets can't mix.
4. **Keep the UI and extension changes minimal.** Update the hardcoded "Stage 0–5" copy at `index.html` 933 and 2240, and review the `extension.ts` 284–292 exclusion.
5. **Do not touch** authentication, student progress, the Edge Function, or the schema.

## 9. Files that would need to change
- New migration: `supabase/migrations/<timestamp>_practice_updated_stage0to9.sql` (content only).
- `index.html`: lines 933 and 2240 (copy only).
- `vscode-extension/src/extension.ts`: the Stage 0-5 logic at lines 63–68 and 284–292, only if the label or exclusion behavior should change.
- Possibly `supabase/functions/click-backend/index.ts` line 1192 (a comment mentioning Stage 0-5). No logic change is expected.

## 10. Verification / test plan
- **Row counts on NEW after the migration:** `practice_bank` = 70 across S0–S9, `practice_tests` = 402 with 332 hidden.
- **Foreign keys:** every `practice_tests` and `practice_progress` row references an existing `practice_bank` ID (orphan count = 0).
- **Content check:** compare each `practice_bank` row's content hash with OLD. All 70 must match.
- **Backend smoke test:** `bootstrap` returns the 70 questions with correct stage labels.
- **Hidden-test grading:** `completePractice` on a sample question from each stage.
- **Browser check:** the Practice tab shows S0–S9 and the corrected header.
- **Extension check:** the question list and folder naming for a Stage 6+ question.

## 11. Risks and compatibility issues
- **Stage-label mismatch** (section 3). A Practice label of "Stage 8" for Arrays would confuse students.
- **Replace vs merge.** Mixing S0–S5 with the updated set would produce duplicate or conflicting questions.
- **Dead prerequisite chain.** The `P001`→`P010` rules point nowhere. If the new gating depends on prerequisites, they need rewriting.
- **Extension behavior.** All 70 questions have `workspace_folder` set, so the extension treats every one as Stage 0–5 curriculum. That affects folder naming and the auto-"next" exclusion.
- **Single source of truth.** The updated content exists only in the live OLD database. Export it before any change, or it can't be recovered from git.
- **Live drift.** OLD's `practice_progress` is still changing, so the export should be taken at a known time.

## Summary
- **CURRENT PRACTICE:** OLD (Click shows Stage 0–5; the live OLD database has the updated Stage 0–9).
- **UPDATED PUC-V2 PRACTICE FOUND:** YES, in the live OLD database. NO in the GitHub repo.
- **STAGES FOUND:** S0–S9 (stage IDs STG001–STG010).
- **SUPABASE CHANGE REQUIRED:** YES, content only (no schema change).
- **IMPLEMENTATION READY:** NO. The stage-label decision and the export are still needed.
