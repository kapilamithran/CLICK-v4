# CLICK-NewTrial / PUC-V2 — Shared Supabase Database Compatibility Report

**Phase 2 — read-only.** This report corrects the framing of the previous phase: OLD (PUC-V2, `C:\Users\Andry\Click\PUC-V2`) and NEW (Click-NewTrial, this repo) are **not two separate systems with separately-populated databases that happen to match** — they are **the same codebase lineage, pointed at the same live Supabase project, at two different points in its history.** The real question this phase answers is not "how do we migrate OLD users into NEW" (no such migration exists or is needed) but **"what must happen to the shared live database and the shared Edge Function before NEW's additional code can be safely deployed."**

Every finding below was cross-verified at least twice, from independent angles (my own direct live Supabase CLI queries; a sibling audit session's independent live queries in the OLD repo; a byte-for-byte static diff of both repos' migrations and Edge Function source). Where a claim could only be corroborated from one angle, that is stated explicitly rather than presented as settled.

---

## 1. Executive Summary

- **One live database, one `users` table, 354 real student rows** — confirmed independently three separate ways (my own `supabase inspect db table-stats`; the OLD-side session's live MD5 set-hash fingerprints; both repos' identical `project-ref`/`config.toml`/`BACKEND_URL`). **There is no user migration to design.** `old_user_id == new_user_id` for all 354 rows because they are the same row, read through two different codebases.
- **The live database currently reflects OLD's schema exactly** — confirmed to the row: live `stages`=12, `chapters`=115 matches OLD's own 11 active + 1 inactive-legacy stage, 85 active + 30 inactive-legacy chapters, exactly.
- **18 migrations exist in NEW but not OLD and have never been applied to the live database** (corrected from an earlier, miscounted "16" in this repo's own `supabase-new-details.md` — independently caught by two different reviewers this phase; verified fresh via `supabase migration list` three times). Of these, **17 are pure curriculum content/unlock additions** (new stages, new chapters, content for already-existing-but-empty chapter shells) and **1 creates a genuinely new table** (`activity_attempts`).
- **The OLD/NEW "code comparison" largely dissolves**: auth, sessions, hearts, the entire chapter-XP commit pipeline (including the partial-unique-index that guarantees XP is paid once per chapter), sections, and staff-monitoring are **byte-identical** between the two repos — they are shared, inherited code, not something that changed. The only genuine Edge Function differences are 7 small hunks covering two features (`unified`-chapter mode, and Learn-activity XP) plus one CRLF bugfix.
- **Zero existing student progress touches any of the 18 pending migrations' subject matter.** Real student activity (514 `learn_progress`, 912 `test_runs`, 4,778 `attempts` rows) is concentrated entirely in `STG001`-`STG006` (Foundations through Loops) plus a small amount of legacy `STG000` activity from 2 accounts. `STG007`-`STG011` (Arrays through Pointers) have **zero** recorded student activity of any kind, live, today. This makes applying their pending content/unlock migrations structurally low-risk for existing data — the real risk is operational (see §21), not data-corruption.

---

## 2. Shared Supabase Identity

| | Value | Verified by |
|---|---|---|
| Project ref | `jnxevalckgitxuunjcvv` | Both repos' `supabase/.temp/project-ref` (identical), both `config.toml` line 13 (identical), both `index.html` `BACKEND_URL` (identical), live `supabase projects list` (ACTIVE_HEALTHY) |
| Region | `ap-southeast-1` | Live `supabase projects list` |
| Postgres version | 17.6.1 | Live `supabase projects list` |
| Organization | `irlfjfrakudsubapedys` | Live `supabase projects list` |
| **Explicitly NOT** | `zwdmredbjktvecvpfurx` | This ref does not appear in either repo's current configuration; it is documented in `supabase/supabase_details.md` as a past accidental GitHub-integration connection to an unrelated project, and was not touched by this phase |

**One piece of evidence not independently re-verified by me**: the OLD-side session's claim of byte-identical live MD5 set-hash fingerprints (five separate hashes over `user_id`/`roll_no`/`email`/`username`/a combined row fingerprint, each run twice from each repo's own linked CLI session) is the single strongest piece of DB-level evidence for "same live rows," but I have no way to re-run that exact query myself without risking a non-read-only session (and it was already performed, read-only, by the other session). Every other angle I *can* verify independently (static config, live aggregate row counts, live migration-list state) is fully consistent with it.

---

## 3. OLD vs NEW Repository Relationship

**Not two independently-diverged codebases — one lineage, two checkouts at different commits.** Verified by byte-for-byte diff (CRLF-normalized) of every migration file in both repos:

- **27 migration files exist in OLD; all 27 exist byte-identically in NEW** (same filenames, same SQL, confirmed by full-file diff with zero output on each).
- **NEW has exactly 18 additional migration files** that do not exist in OLD at all (full list in §5).
- **Both repos' `supabase/functions/click-backend/index.ts`**: 1844 lines (OLD) vs 1919 lines (NEW). The full diff resolves to **exactly 7 functional hunks** (full list in §17) — everything else, including `signup`, `login`, `logout`, `sessionInfo`, hearts logic, the entire `saveTestAnswer`/chapter-XP pipeline, every `practice*` function, and every `staff*` function, is byte-identical.

**This means**: this is not "OLD system vs NEW system" in the sense of two products that need reconciling. It is "the live database's schema as of migration `20260924000000`" vs "that same schema plus 18 more migrations the NEW checkout has written but never deployed."

---

## 4. Live Schema State

Confirmed via live, read-only `supabase migration list` (run three times across this phase and the prior one, consistently) and `supabase inspect db index-stats`/`table-stats` (aggregate counts only — no individual row was ever read):

| | Count |
|---|---|
| Total migrations in NEW repo | 46 (28 shared-applied + 18 NEW-only-pending) — note: OLD repo has 27, of which 26 are in the "applied" set and 1 (`20260924000000_clear_test_accounts.sql`) is OLD's own last, most recent file and is also applied |
| Migrations applied live | 28 (through `20260924000000`) |
| Migrations pending (NEW only, never applied) | **18** |
| Live `stages` rows | 12 (11 active `STG001`-`STG011` + 1 inactive legacy `STG000`) |
| Live `chapters` rows | 115 (85 active + 30 inactive legacy `CH0001`-`CH0030`) |
| Live `users` rows | 354 |
| Live `learn_content` rows | 62 |
| Live `questions` rows | 332 |
| Live `activity_attempts` table | **Does not exist** |

**This is a full, independent three-way corroboration**: my own live queries (this phase and the last), the OLD-side session's live queries (`old-supabase-details.md`), and the static migration-file analysis (this phase's code-comparison agent) all agree exactly on every number above.

---

## 5. Pending Migration Inventory (18 files, NEW only)

| # | Migration | Lines | Type | Tables touched |
|---|---|---|---|---|
| 1 | `20260926150000_learn_content_corrections.sql` | 241 | Data-only text correction | `learn_content` (7 already-live, already-used chapters) |
| 2 | `20260927000000_content_stage6_arrays.sql` | 800 | Curriculum content | `learn_content`, `questions`, `options`, `test_hints`, `glossary`; adds 1 new chapter row `CH0116` |
| 3 | `20260928000000_unlock_stage6_arrays.sql` | 17 | Unlock (prerequisite delete) | `prerequisites` |
| 4 | `20260928020000_content_stage8_searching_sorting.sql` | 1160 | Curriculum content | same shape as #2, for `STG009` |
| 5 | `20260928030000_unlock_stage8_searching_sorting.sql` | 16 | Unlock | `prerequisites` |
| 6 | `20260928040000_content_stage7_strings.sql` | 788 | Curriculum content | same shape, `STG008` |
| 7 | `20260928050000_unlock_stage7_strings.sql` | 17 | Unlock | `prerequisites` |
| 8 | `20260928060000_content_stage9_functions.sql` | 1006 | Curriculum content | same shape, `STG010` |
| 9 | `20260928070000_unlock_stage9_functions.sql` | 16 | Unlock | `prerequisites` |
| 10 | `20260929000000_structure_number_crunching_patterns.sql` | — | **Structural + data-transform** | Creates `STG012`/`STG013` stage rows + 12 new chapter-shell rows (`CH0117`-`CH0128`); **updates `stage_no`/`"order"` on 5 already-live stage rows** (`STG007`-`STG011`, +2 shift); adds 2 new self-lock `prerequisites` rows |
| 11 | `20260929010000_content_stage7_patterns.sql` | — | Curriculum content | fills the 5 brand-new `STG013` chapter shells from #10 |
| 12 | `20260929020000_unlock_stage7_patterns.sql` | — | Unlock | `prerequisites` |
| 13 | `20260930000000_content_stage6_number_crunching.sql` | — | Curriculum content | fills the 7 brand-new `STG012` chapter shells from #10 |
| 14 | `20260930010000_unlock_stage6_number_crunching.sql` | — | Unlock | `prerequisites` |
| 15 | `20261001000000_content_stage12_pointers.sql` | — | Curriculum content | fills `STG011`'s already-existing-but-empty chapter shells `CH0103`-`CH0114` (these chapter rows/titles already exist live and in OLD, just with zero `learn_content`) |
| 16 | `20261001010000_unlock_stage12_pointers.sql` | — | Unlock | `prerequisites` |
| 17 | `20261001020000_fix_stage6_chapter_order.sql` | — | Data-transform (on brand-new rows only) | reorders `CH0117`/`CH0118` (created by #10/#13, not live) + 2 prerequisite edges |
| 18 | `20261001030000_activity_attempts.sql` | — | **New table (schema)** | `create table activity_attempts` + indexes (RLS gap — see §14) |

---

## 6. Migration Risk Classification

| Migration | Schema/Data | Affects students? | Affects progress? | Risk | Recommendation |
|---|---|---|---|---|---|
| #1 learn_content_corrections | DATA_TRANSFORM | Content display only, on chapters with heavy existing use (`STG001`-`STG006`) | No | **LOW** | Safe to apply independently; text-only, exact-match replace, every corrected example gcc-verified |
| #2, #4, #6, #8 (4× content_stageN) | CURRICULUM_CHANGE | No existing progress references these chapters (stage self-locked, zero activity recorded — §9) | No | **LOW** | Safe; apply before its paired unlock |
| #3, #5, #7, #9 (4× unlock_stageN) | PROGRESS_RELEVANT (enables access) | Makes a stage newly reachable | No (just removes a lock row) | **LOW** | Apply only after its paired content migration |
| #10 structure_NC_patterns | **CURRICULUM_CHANGE + DATA_TRANSFORM** | Updates 5 already-live stage rows' `stage_no`/`order` (display-only fields; `stage_id` never changes, no FK depends on `stage_no`) | No | **LOW**, but flagged distinctly as the one migration that mutates existing rows rather than only inserting | Apply first among the NC/Patterns group (creates the chapter shells #11/#13 fill) |
| #11, #13 (NC/Patterns content) | CURRICULUM_CHANGE | Brand-new chapters, zero possible existing progress | No | **LOW** | Apply after #10 |
| #12, #14 (NC/Patterns unlock) | PROGRESS_RELEVANT | — | No | **LOW** | After respective content |
| #15 content_stage12_pointers | CURRICULUM_CHANGE | Chapter shells already live/shared with OLD, zero existing content or progress | No | **LOW** | Safe |
| #16 unlock_stage12_pointers | PROGRESS_RELEVANT | — | No | **LOW** | After #15 |
| #17 fix_stage6_chapter_order | CURRICULUM_CHANGE | Only touches rows created in the same deploy batch (#10/#13) | No | **LOW** | Bundle with the NC rollout |
| #18 activity_attempts | **ACTIVITY_SYSTEM / schema** | No existing rows (new table) | N/A | **LOW for data; MEDIUM for security posture until fixed** | Apply, but add the missing `enable row level security` statement first (§14) |

**No migration in this set is classified UNKNOWN or AUTH_RELEVANT** — none of the 18 touch `users`, `sessions`, `password_hash`/`salt`, or any auth table.

---

## 7. Curriculum Compatibility

See `migration/curriculum-compatibility-report.md` for the full per-chapter table. Summary:

- **OLD and NEW share the exact same `STGnnn`/`CHnnnn` ID convention**, and **every chapter ID that exists in both is IDENTICAL** — there is no renumbering, no ID drift, between the two repos for any chapter that exists in both. (The only "reordering" is the `stage_no`/`order` display-number shift in migration #10, which does not touch any `chapter_id`/`stage_id` value.)
- OLD's curriculum = NEW's curriculum **minus** `STG012`/`STG013` (Number Crunching/Patterns, which don't exist in OLD at all) **minus** real content for `STG007`-`STG011` (which exist as empty chapter shells in OLD too, just never filled in) **plus** one inactive legacy stage, `STG000` (`CH0001`-`CH0030`), that does not appear anywhere in NEW's current migration set at all.

## 8. Chapter-ID Compatibility

**IDENTICAL_ID for every chapter that exists in both repos.** No `SAME_CONCEPT_DIFFERENT_ID` case was found. `CH0116` (Arrays capstone) and `CH0117`-`CH0128` (NC/Patterns) are `NEW_ONLY`. `CH0001`-`CH0030` (legacy) are `OLD_ONLY`/`LEGACY` — present live, inactive, not referenced by NEW's migrations at all, and not something NEW's curriculum needs to account for going forward (it is literally the same live rows, just `active=false` and un-mentioned in NEW's newer migrations — nothing needs to be done to it).

## 9. Stage-ID Compatibility

**IDENTICAL_ID.** `STG001`-`STG011` are the same ID, same title, same original relative order in both repos (NEW's migration #10 only changes the *display* `stage_no`/`order` of `STG007`-`STG011`, never the ID). `STG012`/`STG013` are `NEW_ONLY`. `STG000` is `OLD_ONLY`/`LEGACY` (inactive).

## 10. Question-ID Compatibility

Not separately audited at the individual-question level this phase (out of scope for a schema-compatibility pass), but structurally: `questions.question_id` uses the same `Qnnnnnn` format in both repos (confirmed via shared baseline schema + shared seed migrations), and no migration in either repo renumbers an existing `question_id`. The `question_options`/`options` table naming note in the task's own Step 5 list (it says `question_options` — **the actual live/repo table is named `options`**, confirmed in both repos; flagging this naming discrepancy from the task brief rather than silently correcting it without mention) is otherwise structurally identical in both repos.

## 11. Existing Progress Compatibility

| Pending migration group | Orphan risk for existing `learn_progress`/`test_runs`/`attempts` |
|---|---|
| Arrays/Strings/S&S/Functions content+unlock (#2-#9) | **None.** OLD's own audit confirms zero recorded activity for `STG007`-`STG011` across all of `learn_progress`/`test_runs`/`attempts`. |
| NC/Patterns structure+content+unlock (#10-#14) | **None possible** — these chapter IDs don't exist until the migration creates them. |
| Pointers content+unlock (#15-#16) | **None.** Same zero-activity finding as above; the chapter shells already exist but have never been reachable (stage self-locked) or had content to interact with. |
| Stage-order fix (#17) | **None** — only touches rows from the same unapplied batch. |
| `activity_attempts` (#18) | **None** — brand-new table, nothing to orphan. |
| `learn_content_corrections` (#1) | **N/A for FK/orphan risk** — this is the one migration touching chapters (`STG001`-`STG006`) with substantial real history (454 of 514 `learn_progress` rows), but it only edits `learn_content.pages_text` (display text), never `learn_progress`/`test_runs`/`attempts`/`questions`/`options` — no student-facing record of "what was answered" changes. |

**Calculated orphan counts: zero, across every pending migration**, because none of them delete or renumber any ID that an existing progress row references, and the stages with real activity are untouched structurally.

## 12. XP Compatibility

**COMPATIBLE — with the XP pipeline itself unchanged, not something requiring migration or reconciliation of mechanism.** The entire chapter-XP commit pipeline (`pending_xp`/`committed_xp`, the partial unique index, `completed`/`completed_repeat` semantics) is byte-identical code, already live, already governing all 354 users' existing `total_xp` values today. **Nothing about applying the 18 pending migrations changes how any existing XP value is interpreted** — none of them touch `users.total_xp`, `test_runs.committed_xp`, or `attempts.xp_earned` for any existing row.

Two items carried over from the OLD-side audit, accepted here as given (not independently re-derived, since they require live individual-row queries this phase did not re-run):
- **43 `completed_repeat` test_runs carry non-zero `committed_xp` (sum 36)**, apparently predating the `test_runs_one_completion_per_chapter` migration's effective date. This is **historical, already-committed data** — applying the 18 pending migrations does not touch it, and no action is recommended beyond awareness.
- **2 of 354 accounts have `users.total_xp` that doesn't exactly match the sum of their `attempts.xp_earned`.** Not identified (to avoid exposing which students), not explained with certainty, and **not something this phase's pending migrations affect either way.**

**Recommendation: do not attempt to "fix" either of the above as part of deploying the 18 pending migrations.** They are pre-existing characteristics of the live data, orthogonal to this deployment.

## 13. Heart Compatibility

**COMPATIBLE, unchanged.** Hearts logic (decrement on 3rd wrong attempt, refill only via reviewing the specific `heart_recovery_chapter_id`) is byte-identical code between OLD and NEW. None of the 18 pending migrations touch `users.hearts` or the heart-recovery fields. Live distribution (354 users): 0 hearts=3, 1=14, 2=21, 3(max)=316; 36 users (10.2%) currently owe a recovery. **Sentinel note carried forward from the OLD audit**: "nothing owed" is stored as empty string `''`, not `NULL`, on `heart_recovery_chapter_id` — any future tooling must check for both, not just `IS NOT NULL`.

## 14. Activity System Compatibility

**ABSENT live and in OLD; present only as unpushed code+migration in NEW.** Confirmed three ways: (1) `activity_attempts` does not appear in any OLD migration (grepped all 27 `create table` statements); (2) it does not appear in a live `inspect db index-stats` listing (no `activity_attempts_pkey`); (3) OLD's `index.ts` has no `ACTIVITY_XP` constant and no `saveActivityAttempt` function at all (confirmed by grep, zero matches).

**What breaks if the migration is not applied before the Edge Function is deployed**: any call to the new `saveActivityAttempt` action would fail at runtime with a Postgres "relation activity_attempts does not exist" error. This is purely an **additive schema change** — applying it creates a new, empty table and touches zero existing rows in any other table.

**One real gap, independently confirmed by the prior phase and re-confirmed here**: the migration has **no `alter table activity_attempts enable row level security` statement** — every other table in both repos' schemas has RLS enabled (with zero policies, service-role-only access by design). **Recommendation: add the missing RLS-enable statement to this migration (or a follow-up one) before it is ever applied**, to match the project's own established security posture from day one. This is a schema-only fix with zero data impact.

## 15. Practice Compatibility

**COMPATIBLE, unchanged.** `practice_bank`/`practice_tests`/`practice_mistakes`/`practice_progress`/`practice_pairings` and their ID conventions (`S{stage}-Q{n}` for stage challenges, `E{nn}-Q{n}` for the legacy "Experiments" set) are byte-identical between OLD and NEW — confirmed via shared, byte-identical seed migrations. None of the 18 pending migrations touch any practice table. Live: 70 `practice_bank` rows, 5 `practice_progress` rows (only 5 of 354 students have completed a practice challenge).

## 16. Section Compatibility

**COMPATIBLE, unchanged.** `sections`/`student_section_assignments` (7 seeded sections, partial-unique "one active assignment per student") are byte-identical shared infrastructure, not new to NEW. Live: 352 of 354 students have an active section assignment; 2 do not (confirmed independently by the OLD-side audit's direct query). None of the 18 pending migrations touch sections. **No action needed or recommended for the 2 unassigned students as part of this deployment** — that is a pre-existing, orthogonal data-completeness item, not a migration blocker.

## 17. Authentication Compatibility

**IDENTICAL code, both repos** — `sha256Hex`/`passwordHash` (`SHA-256(salt|password)`, single round, no stretching), session-token generation (`crypto.randomUUID() + crypto.randomUUID()`, stored and compared as plain text, never hashed), and `requireSession`'s idle-timeout check are byte-for-byte the same in OLD and NEW (confirmed by direct diff, zero difference in this code). No Supabase Auth / `auth.users` usage in either repo (confirmed live: `auth.users` = 0 rows).

**Since this is the same code against the same live `users`/`sessions` tables, existing students can already authenticate identically regardless of which codebase (OLD or NEW) serves the request** — there is no credential migration, no hash-scheme reconciliation, and no forced-reset decision needed, because nothing about auth changes between the two repos. (This supersedes this phase's own earlier framing, inherited from the previous phase's brief, that treated auth compatibility as an open decision — it is not; it was already settled by the fact that both repos run the identical auth code.)

### Complete list of actual Edge Function differences (everything else is byte-identical)

1. CRLF-tolerant multi-line-answer comparison (bugfix, NEW only).
2. `completeLearn` message wording changes only when a new `unified` flag is set (NEW only).
3. `startTest` gains a `unified` chapter mode: skips the "complete Learn first" gate, caps questions served via `settings.UNIFIED_MAX_QUESTIONS` (NEW only).
4. `ACTIVITY_XP`/`saveActivityAttempt` (NEW only — see §14).
5. `finishTest` additionally commits `activity_attempts.xp_committed` (NEW only).
6. `finishTest` auto-completes `learn_progress` for unified runs (NEW only).
7. `finishTest` message wording differs for unified vs non-unified runs (NEW only).
8. Dispatch switch gains `case "saveActivityAttempt"` (NEW only).

---

## 18. Required Changes

1. Configure the missing GitHub Actions secrets (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`) so the existing CI pipeline can actually run — or apply the 18 pending migrations by hand via the Dashboard SQL Editor, in the order given in §20.
2. Add the missing `enable row level security` statement for `activity_attempts` (§14), ideally before or in the same deploy as its creation.
3. Deploy the updated `click-backend` Edge Function **only after** the schema migrations that its new code depends on (`activity_attempts`) are live — deploying the function first would make `saveActivityAttempt` fail for every call until the table exists.

## 19. Changes That Must NOT Be Made

- Do **not** design or build any OLD-user → NEW-user migration, mapping, or ID-translation script. There are no two user populations to reconcile.
- Do **not** insert, update, or delete any row in `users`, `sessions`, `learn_progress`, `test_runs`, `attempts`, `practice_progress`, or `student_section_assignments`.
- Do **not** reset, recompute, or "correct" any student's `total_xp`, `hearts`, or heart-recovery fields — including the 2 XP-reconciliation anomalies and the 43 `completed_repeat` historical XP rows; these are pre-existing live data, not migration artifacts.
- Do **not** touch the legacy `STG000`/`CH0001`-`CH0030` rows — they are inactive, out of scope, and not referenced by any of the 18 pending migrations.
- Do **not** auto-assign the 2 unassigned students to a section as a side effect of this work.
- Do **not** weaken RLS anywhere to make deployment more convenient — the one RLS gap found (`activity_attempts`) should be *fixed to match* the existing strict posture, not used as a precedent to loosen anything else.

## 20. Recommended Migration Order

1. `20260926150000_learn_content_corrections.sql` (independent of everything else)
2. `20260927000000_content_stage6_arrays.sql` → `20260928000000_unlock_stage6_arrays.sql`
3. `20260928040000_content_stage7_strings.sql` → `20260928050000_unlock_stage7_strings.sql`
4. `20260928020000_content_stage8_searching_sorting.sql` → `20260928030000_unlock_stage8_searching_sorting.sql`
5. `20260928060000_content_stage9_functions.sql` → `20260928070000_unlock_stage9_functions.sql`
6. `20261001000000_content_stage12_pointers.sql` → `20261001010000_unlock_stage12_pointers.sql`
7. `20260929000000_structure_number_crunching_patterns.sql` (creates the NC/Patterns chapter shells) → `20260930000000_content_stage6_number_crunching.sql` → `20260930010000_unlock_stage6_number_crunching.sql` → `20260929010000_content_stage7_patterns.sql` → `20260929020000_unlock_stage7_patterns.sql`
8. `20261001020000_fix_stage6_chapter_order.sql` (must come after step 7, since it touches rows step 7 creates)
9. `20261001030000_activity_attempts.sql` **with its RLS-enable statement added first** (§14, §18)
10. Only then: deploy the updated `click-backend` Edge Function.

(Groups 2-6 are mutually independent and could be reordered or parallelized; the ordering within group 7 and the position of step 8 relative to it are the only hard sequencing constraints found.)

## 21. Blocking Decisions

1. **Who applies these migrations, and how** — by fixing the CI secrets, or by hand via the Dashboard — is a deployment-process decision outside this audit's scope.
2. **Operational risk, not a data-safety risk**: once these migrations are applied and the new Edge Function is deployed, **all future development/testing against this NEW repository is development against the exact same live production database the 354 real students use.** This was true already (OLD and NEW always shared one database), but it becomes more consequential once NEW's code is what's actually running live. No sandbox/staging project was found anywhere in either repo's configuration — if one is wanted, it does not currently exist.
3. **The `activity_attempts` RLS gap** (§14) should be resolved before deployment, as a one-line fix.

## 22. Read-Only Verification Statement

This phase performed exactly these live, read-only operations against the production Supabase project (no others): `supabase projects list`, `supabase link --project-ref jnxevalckgitxuunjcvv` (writes only a local CLI config, not the remote project), `supabase migration list` (run three times, consistent results each time), `supabase inspect db index-stats`/`table-stats` (aggregate counts only). No `db push`, no `functions deploy`, no `db dump --data-only`, no `db reset`, no `INSERT`/`UPDATE`/`DELETE`/`ALTER`/`CREATE`/`DROP`, and no individual student row (name, email, roll number, phone, password hash, or session token) was ever read, by this phase or by either of the two prior audit phases whose artifacts this report relies on. `git status --short` in this repository, confirmed after all work, shows only new/updated documentation files — no application or migration source file was modified.
