# Phase 12 — Test deployment, content reconciliation, and student-freeze preparation

Date: 2026-10-03. Baseline: `main` at `2e136c3`. Production remains on OLD. No student migration was executed. Production `puc-v2` was not deployed.

## 1. Cloudflare test result — PASS

| Check | Result |
|---|---|
| Worker deployed | `click-test` (name passed explicitly and confirmed in `wrangler.jsonc`) |
| Source | export of commit `50d1248` (the NEW test frontend), not the working tree |
| Upload | 173 files, version `ffd66774-79e1-4a06-b942-8e17f8a85922` |
| URL | https://click-test.clickv2-new.workers.dev |
| HTTP status | 200 |
| NEW ref `eyevmykfavooeiklzebe` in HTML | present |
| OLD ref `jnxevalckgitxuunjcvv` in HTML | absent |
| NEW `click-backend` URL in HTML | present |
| `migration/`, `supabase/config.toml`, `tests/` served | no; HTTP 404 (excluded by `.assetsignore`) |
| Downloaded HTML | scratch folder only; not committed |

Production check: `puc-v2` is **not found on this Cloudflare account** (Wrangler error 10007, "This Worker does not exist on your account"). This is recorded as a finding (section 9). Nothing was deployed to any production Worker.

## 2. Browser test result — PARTIAL

Tool: headless Chrome via `playwright-core`, read-only, no account created, no data written.

| Check | Result |
|---|---|
| Page loads (HTTP 200, title `CLICK v16 — click → learn → practice`) | PASS |
| Auth gate visible before login | PASS |
| Requests to OLD Supabase (`jnxevalckgitxuunjcvv`) | **0** |
| Requests to NEW Supabase | yes (see CORS probe) |
| Console errors at load | 0 |
| Page errors | 0 |
| Browser reaches NEW `click-backend` from the test origin (read-only `session` probe with an invalid token) | PASS: HTTP 200, normal JSON error, so CORS is allowed |
| Login | **NOT RUN** — no test-account password is available to this session; not requested through chat |
| Session, dashboard, stage navigation, chapters, learn content, progress | **NOT RUN** (behind login) |
| Practice S0–S9 existence in the browser | **NOT RUN** (behind login) |
| Practice question open, workspace behaviour | **NOT RUN** |

Practice S0–S9 is verified at the data and backend level instead: NEW has 70 Practice questions across S0–S9, 402 tests, and the backend tests check the S-labels for S0–S9 (section 4).

To complete the browser login tests, the owner needs to log in at the test URL with the existing test account, or provide an approved way for this session to use it. The password must not be pasted into chat.

## 3. Learn-content discrepancies — NO CHANGE MADE

The three pages were checked against the migration's exact `old_t` and `new_t` values (`migration/20260926150000_learn_content_corrections.sql`).

| Row | NEW state | Decision |
|---|---|---|
| `L_CH0035` p5 | corrected (new text present, old absent) | no action |
| `L_CH0061` p2 | corrected; the old sentence is a substring of the new sentence, so the earlier count was an artifact | no action |
| `L_CH0031` p2 | the corrected 4-step block is already present; the old "Easy Analogy" paragraph is still there | **not applied**: the migration's replacement would insert a second copy of the block. The intended final text can't be established confidently. |
| `L_CH0035` p4 | the corrected "Showing them with printf()" block is already present; the old "Memory Trick" heading is still there | **not applied**: the replacement would duplicate the block and remove the "Memory Trick" heading. |

Result: no NEW row was changed. The two open rows need an owner decision on whether the leftover "Easy Analogy" and "Memory Trick" sections should stay. Nothing was invented.

Curriculum count after this phase: 98 learn-content rows, unchanged.

## 4. NEW curriculum final check — PASS

| Check | Result |
|---|---|
| Stages | 13 |
| Chapters | 98 |
| Learn content | 98 (every chapter has content) |
| Orphan learn content / chapters / questions | 0 / 0 / 0 |
| `STG000` | absent |
| Practice questions | 70 (all in S0–S9) |
| Practice tests | 402 (332 hidden, 70 public) |
| Practice orphan tests | 0 |
| Practice prerequisites | 0 |
| Migrations recorded | 45 |

## 5. VS Code extension — PASS (build and tests); default backend NOT changed

| Check | Result |
|---|---|
| Compile (`tsc`) | clean |
| Tests | 14 / 14 pass |
| Labels | S0–S9 come from the server's `practice_stage_label` (backend-tested for S0–S9) |
| Default `click.backendUrl` | **still OLD** — `https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend` |

**CUTOVER TASK — NOT YET EXECUTED:** change the default `click.backendUrl` to the NEW `click-backend` at final cutover. Not changed in this phase.

The VSIX was built earlier into the scratch folder (about 25 KB, 11 files). It was not published.

## 6. OLD freeze — procedure written, not executed

- No supported maintenance, read-only, or registration switch exists on OLD. The backend has no such mode, and the `settings` table has no lock key.
- A frontend-only freeze would not stop the VS Code extension or direct API calls, so the freeze must block writes in the backend.
- The procedure is in `migration/phase12-old-freeze-procedure.md`. It needs owner approval before the first step. Its first OLD write is deploying a read-only `click-backend` build, which is an OLD change and needs that approval.

## 7. Current live source counts (NOT the final snapshot)

These change until OLD is frozen.

| Table | Current OLD |
|---|---|
| users (total) | 354 |
| test_runs | 954 |
| attempts | 5080 |
| learn_progress | 539 |
| practice_progress | 5 |
| student_section_assignments | 352 |
| sessions (excluded by spec) | 754 |
| practice_pairings (excluded by spec) | 32 |
| staff_messages (excluded by spec) | 4 |

The earlier figures (352, 353, 828, 894, 464, 501, 4840, 4967) are superseded and were not used.

## 8. Student dry run — counts only, NOT executed

Selection: 354 users minus the 2 protected accounts = **352 students** (matches the Phase 9 specification).

| Table | Selected (migrate) | Protected (excluded) | Notes |
|---|---|---|---|
| users | 352 | 2 | `U1A8B0A6D8810`, `U485B9DDDA04E` |
| test_runs | 835 | 119 | protected includes all 92 `STG000` runs |
| attempts | 4894 | 186 | |
| learn_progress | 465 | 74 | protected includes all 60 `STG000` rows |
| practice_progress | 5 | 0 | 5 rows, 4 distinct IDs, all present in NEW `practice_bank` |
| student_section_assignments | 352 | 0 | |

Totals reconcile to the live source: 835 + 119 = 954; 4894 + 186 = 5080; 465 + 74 = 539.

Validation results:

| Check | Result |
|---|---|
| All selected users exist | yes (by selection) |
| Referenced users exist (test_runs, attempts, learn_progress, practice_progress, assignments) | 0 orphans in each |
| Attempts reference valid test runs | 0 orphans |
| Attempts of selected students on protected test runs | 0 |
| Password hash and salt present for selected users | 352 of 352 (0 missing) |
| Duplicate roll numbers, emails, usernames among selected | 0 |
| Duplicate IDs | prevented by the primary keys on OLD |
| Practice progress references valid curriculum | yes (4 distinct IDs, all in NEW `practice_bank`) |
| `STG007`–`STG011` rows for selected students | 0 |
| `STG000` rows for selected students | 0 (all `STG000` rows belong to protected accounts) |
| `E`-prefix users among selected | 0 |
| Unexplained exclusions | none |

Phase 9's spec described zero real-student `STG000` rows. That is now explained: the 60 and 92 `STG000` rows belong to the two protected accounts, not to students.

Excluded by specification (not counts from protected accounts): `sessions` 754, `practice_pairings` 32, `staff_messages` 4. `activity_attempts` does not exist on OLD.

## 9. Protected accounts and the NEW test account

- **Protected accounts** `U1A8B0A6D8810` and `U485B9DDDA04E`: both present on OLD, both excluded from the selection, and not on NEW. Not deleted.
- **NEW test account** `U5AF199A50E56` (roll `2418010202`, role `student`, status `active`): excluded from student-migration collision handling, as approved. Not on OLD, and no OLD roll number collides with it. Not deleted, not overwritten, and no truncation of NEW.

Finding: `puc-v2` does not exist on the Cloudflare account this session uses. The production host is unknown from this account, so the owner needs to confirm where production is hosted before the production cutover.

## 10. Readiness

**Status: NOT READY FOR FINAL SNAPSHOT + STUDENT MIGRATION.**

Remaining blockers:
1. The OLD freeze has not been approved. Its first step needs a read-only `click-backend` build deployed to OLD.
2. Browser login, session, progress, and Practice S0–S9 checks are not run; they need a test-account login.
3. Two learn-content pages (`L_CH0031` p2, `L_CH0035` p4) need an owner decision.
4. The production host must be confirmed, since `puc-v2` is missing from this account.
5. The snapshot export and its checksums have not been captured (they must come after the freeze).
6. The `clear_test_accounts` history question from Phase 11C is still open. It is recorded as applied; its effect on OLD is not established.

No student migration was run. Production stays on OLD. Nothing was committed from credential-bearing data.

## Files

- `migration/phase12-test-and-freeze-preparation.md` (this report)
- `migration/phase12-test-and-freeze-summary.json`
- `migration/phase12-old-freeze-procedure.md`
