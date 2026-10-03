# Phase 8 — OLD Row-Level Reconnaissance & Migration Gate

Read-only. Every query below is a `SELECT` executed via `supabase db query --linked --project-ref
<ref>` (Management API — confirmed this leaves `supabase/.temp/project-ref` untouched; verified by
re-checking the file after every call). No `INSERT`/`UPDATE`/`DELETE`/`ALTER`/`DROP`/`CREATE`/`TRUNCATE`
was ever issued. No credential value (password hash, salt, session token) was retrieved, printed, or
recorded anywhere in this report.

## Step 1 — Query mechanism

The CLI's `.temp/project-ref` remained `eyevmykfavooeiklzebe` (NEW) throughout this entire phase —
confirmed before, during (spot-checked), and after. `supabase db query --linked --project-ref <ref>`
queries the *specified* project via the Management API without altering that link file — verified by a
calibration test: the same `select count(*) from users` returned `354` against
`jnxevalckgitxuunjcvv` and `0` against `eyevmykfavooeiklzebe`, with the link file unchanged after both.
This is the mechanism used for every OLD query in this phase.

## Step 2 — OLD migration state

| Migration | OLD Status | NEW Status | Relevance to Student Migration |
|---|---|---|---|
| `20260101000000_baseline_schema.sql` | Applied | Applied | Schema — both share it |
| `20260101000001_baseline_grants.sql` | Applied | Applied | Grants — both share it |
| `20260907090000`–`20260924000000` (18 more files, see Phase 6/7 reports for full names) | Applied | Applied | Content/practice/structural fixes through STG001-STG011 shells + `clear_test_accounts` |
| `20260910130000_add_missing_legacy_glossary_terms.sql` | **Not applied** | Applied | NEW-only corrective fix — irrelevant to OLD, which already has `TERM024`/`TERM028` natively (pre-migration-history hand-seeded data, confirmed via the signup/content audit in Phase 5/6) |
| `20260926150000_learn_content_corrections.sql` | Not applied | Applied | Content-only fix; no student-table impact |
| `20260927000000_content_stage6_arrays.sql` | Not applied | Applied | Curriculum content (Arrays) — OLD lacks this content; irrelevant to already-recorded student progress, which never reaches this stage (see Step 5) |
| `20260928000000_unlock_stage6_arrays.sql`, `20260928030000_unlock_stage8_searching_sorting.sql`, `20260928050000_unlock_stage7_strings.sql`, `20260928070000_unlock_stage9_functions.sql`, `20260929020000_unlock_stage7_patterns.sql`, `20260930010000_unlock_stage6_number_crunching.sql`, `20261001010000_unlock_stage12_pointers.sql` | Not applied | Applied | Unlock-gating only, no student rows |
| `20260928020000_content_stage8_searching_sorting.sql`, `20260928040000_content_stage7_strings.sql`, `20260928060000_content_stage9_functions.sql` | Not applied | Applied | Curriculum content, stages with zero real-student activity (Step 5) |
| `20260929000000_structure_number_crunching_patterns.sql` | **Not applied — `STG012`/`STG013` do not exist on OLD at all** | Applied | Confirmed via live `select stage_id from stages` — OLD has only `STG000`-`STG011` |
| `20260929010000_content_stage7_patterns.sql`, `20260930000000_content_stage6_number_crunching.sql`, `20261001000000_content_stage12_pointers.sql` | Not applied | Applied | Content for stages that don't exist on OLD |
| `20261001020000_fix_stage6_chapter_order.sql` | Not applied | Applied | Structural fix, no student rows |
| `20261001030000_activity_attempts.sql` | **Not applied — table does not exist on OLD** | Applied | Confirmed via live `information_schema.tables` query — zero rows to migrate by construction (see Step 9) |

**Exact count, live-verified twice this engagement (end of Phase 7, start of Phase 8): 26 of 45 applied
on OLD, unchanged both times.** This resolves the discrepancy flagged in Phase 7 between two of this
engagement's own earlier documents (28 vs 26) — 26/45 is correct and current.

## Step 3 — OLD user population

| Metric | Value |
|---|---|
| Total users | 354 |
| Active | 354 |
| Inactive | 0 |
| Role = student | 354 |
| Role ≠ student | 0 |
| Null/empty `email` | 0 |
| Null/empty `roll_no` | 0 |
| Null/empty `password_hash` | 0 |
| Null/empty `password_salt` | 0 |

**Real migration population: 352** (354 total − 2 protected dev/QA accounts, `U1A8B0A6D8810` and
`U485B9DDDA04E`, confirmed by ID only). No null critical identity fields anywhere — no data-quality
blocker here.

**Incidental observation (not a blocker):** `department` contains ~35 distinct free-text spelling
variants of "AIDS" (e.g. "AIDS", "Aids", "AI&DS", "Artificial intelligence and data science", etc.).
`department` is a plain `text` column with no `CHECK` constraint, so every variant copies into NEW
without any technical issue — purely a cosmetic data-quality note, not a migration blocker.

## Step 4 — STG000 / CH0001–CH0030 reconnaissance (the most important step)

| Table | Protected-account rows | Other (real-student) rows | Other distinct students |
|---|---|---|---|
| `learn_progress` | 60 | **0** | **0** |
| `test_runs` | 92 | **0** | **0** |
| `attempts` | 91 | **0** | **0** |

**Users pointer fields** (excluding the 2 protected accounts): `current_chapter` in `CH0001`-`CH0030`: 0.
`last_completed_stage='STG000'`: 0. `last_learn_stage='STG000'` or `last_learn_chapter` in range: 0.
`heart_recovery_stage_id='STG000'` or `heart_recovery_chapter_id` in range: 0.

**One field did initially look non-zero and required follow-up:** 253 of the 352 real students have
`users.current_stage = 'STG000'`. Investigation (reading `click-backend/index.ts`'s write sites for this
column) showed `current_stage` is set at signup to the literal `"STG000"` sentinel (`index.ts:287`) and
is only ever updated afterward by `completeLearn`/`saveTestAnswer`/`finishTest` — i.e., only when a
student actually engages with *any* chapter's Learn content or test. A direct follow-up query confirmed
**all 253** of these users have **zero** rows in `learn_progress`, `test_runs`, and `attempts` — they are
simply dormant accounts that signed up and never engaged with any content at all, real or legacy. This is
a stale, inert default value, not evidence of legacy-content engagement, and poses no migration risk
(it has a deterministic destination: copy as-is, or reset to NEW's equivalent default — either is a
trivial, non-decision transformation).

**Conclusion: zero real students have any STG000/CH0001-CH0030 engagement in any table. All 243 rows and
all pointer-field references are 100% attributable to the 2 already-protected accounts.** This fully
resolves Phase 7 blocker #5's STG000 half.

## Step 5 — STG007–STG011 reconnaissance

| Stage | Real Student Rows | Distinct Students | Evidence |
|---|---|---|---|
| STG007 | 0 | 0 | `learn_progress`/`test_runs`/`attempts` all zero |
| STG008 | 0 | 0 | same |
| STG009 | 0 | 0 | same |
| STG010 | 0 | 0 | same |
| STG011 | 0 | 0 | same |

Users' `current_stage`/`last_completed_stage`/`last_learn_stage` pointer fields referencing
`STG007`-`STG011`: all **0** (excluding protected accounts). **Zero real students have any activity in
STG007-STG011, stated explicitly as the task requires.** This fully resolves the second half of Phase 7
blocker #5.

**Curriculum extent actually used by real students (Step 11):** `max(stage_id)` referenced in
`test_runs` = `STG006`; `max(chapter_id)` = `CH0115` (a late-numbered chapter that belongs to STG005/006
content added after the initial CH0031-CH0061 sequence — not a contradiction, just non-sequential
chapter-ID allocation from later content additions. Confirmed both values exist identically on NEW.)

## Step 6 — Practice progress

| Metric | Value |
|---|---|
| Total rows | 5 |
| Distinct users | 2 (both real students, not protected accounts) |
| `E`-prefixed (Experiment) rows | 0 |
| `practice_id` not present in `practice_bank` | 0 |
| Duplicate `(user_id, practice_id)` combinations | 0 |

Clean, trivial dataset. No Experiment-era orphans, no invalid references, no duplicates.

## Step 7 — Student section assignments

| Metric | Value |
|---|---|
| Total | 352 |
| Active | 352 |
| Distinct students | 352 (matches the real migration population exactly) |
| Distinct sections | 7 (matches NEW's seeded `SEC001`-`SEC007`) |
| `assigned_by IS NULL` | **352 (all of them)** |
| `assigned_by` referencing an existing staff user | 0 |
| Dangling `assigned_by` (non-null, no matching staff) | 0 |

**Key finding: every single section assignment has `assigned_by = NULL`.** This table has **zero
dependency** on whether staff accounts are migrated — it can migrate independently of the staff
decision in Step 8.

## Step 8 — Staff relationship reconnaissance

| Metric | Value |
|---|---|
| `staff_users` count | 1 |
| `staff_messages` count | 4 |
| Distinct staff IDs referenced by messages | 1 |
| Distinct students referenced by messages | 2 |
| Dangling staff references in messages | 0 |

The staff footprint on OLD is minimal: one staff account, four messages. The staff-migration decision
(recreate fresh on NEW vs. migrate with identical `staff_id`) remains a genuine, low-stakes product
decision — low-stakes specifically because (a) `student_section_assignments` has zero dependency on it
(Step 7) and (b) the total affected data is just 1 staff row + 4 message rows.

## Step 9 — activity_attempts on OLD

**ABSENT.** Confirmed via `information_schema.tables` — no such table exists on OLD at all (consistent
with OLD having only 26/45 migrations, and `activity_attempts` being migration #45). Zero rows to
migrate, by construction — not a finding that requires any decision.

## Step 10 — Authentication data compatibility (schema-level only, no values)

| Column | Data type | Nullable |
|---|---|---|
| `password_hash` | text | NO |
| `password_salt` | text | NO |
| `email` | text | NO |
| `roll_no` | text | NO |
| `username` | text | YES |

Unique constraints confirmed: `users_email_key` (email), `users_roll_no_key` (roll_no),
`users_username_key` (username). This schema is identical to NEW's (same migration files) — no
discrepancy found.

**AUTH COMPATIBILITY: externally confirmed but not independently verified.** Phase 7's conclusion
("directly compatible, conditioned on one externally sourced claim that OLD's hashing code is
identical") is **not upgraded** by this phase — this phase had no access to OLD's actual
`click-backend/index.ts` source to diff against NEW's, and did not retrieve or compare any actual
credential value (by design, per this phase's explicit prohibition). The schema-level facts above are
consistent with compatibility but do not themselves prove the hashing *code* matches. This remains the
single most important unresolved verification step before any real credential migration.

## Step 11 — ID / curriculum compatibility

**Database FK validity vs. application/curriculum validity — kept distinct, as instructed:**
`learn_progress`/`test_runs`/`attempts`/`activity_attempts`/`practice_progress`'s `chapter_id`/`stage_id`
columns have **no foreign-key constraint** to `chapters`/`stages` (confirmed in Phase 7's schema read,
re-confirmed here) — a dangling chapter/stage reference would be a soft, application-level display
issue, never a PostgreSQL FK violation. The only hard, DB-enforced FKs on student tables are
`user_id`→`users`, `test_run_id`→`test_runs`, `practice_id`→`practice_bank`, `section_id`→`sections`,
`staff_id`→`staff_users` (nullable).

No orphan `question_id` references found in `attempts` for real students (0, checked directly against
OLD's own `questions` table). No orphan `practice_id` references found (Step 6). Real-student curriculum
usage tops out at `STG006`/`CH0115`, both of which exist identically on NEW.

**ID translation: NOT REQUIRED.** Schema is identical; no OLD ID collides with or needs remapping into a
different NEW identifier space.

## Step 12 — Real-student migration eligibility

Applying the explicit, factual rules (no subjective severity, no ranking):

- **CLEAN (352 of 352 real students):** every real student's `users`, `learn_progress`, `test_runs`,
  `attempts`, `practice_progress`, and `student_section_assignments` data maps directly to NEW with no
  orphan reference, no dangling FK, no STG000/STG007-011 engagement, and no null critical identity
  field. **0 students fall into REQUIRES TRANSFORMATION. 0 students fall into BLOCKED.**
- The 2 protected dev/QA accounts (`U1A8B0A6D8810`, `U485B9DDDA04E`) are explicitly **excluded** from the
  "real student" population per `clear_test_accounts.sql` and Phase 4/5's established decision — not
  classified here, as they are not part of this migration's scope.

## Step 13 — Migration order validation

Based on the actual FK constraints confirmed live and in Phase 7's schema read:

1. `users` (no dependency)
2. `student_section_assignments` (FK → `users`; `assigned_by` uniformly NULL on OLD, so no staff
   ordering dependency exists in practice)
3. `test_runs` (FK → `users`)
4. `attempts` (FK → `users`, `test_runs` — must follow `test_runs`)
5. `learn_progress` (FK → `users` only)
6. `practice_progress` (FK → `users`, `practice_bank` — `practice_bank` is curriculum, already present
   on NEW)
7. `activity_attempts` — no OLD source data exists; not applicable to an OLD→NEW migration today

This matches the task's expected conceptual order, with one confirmed refinement: `attempts` must follow
`test_runs` specifically (hard FK on `test_run_id`), and `student_section_assignments` has no actual
staff-ordering dependency given the live data (all `assigned_by` are NULL).

## Step 14 — Final OLD safety verification

Every command executed against OLD this phase, classified:

| Command | Type |
|---|---|
| `supabase db query --linked --project-ref jnxevalckgitxuunjcvv "select ..."` (×~20 calls, all `SELECT` only) | Read-only |
| `supabase migration list --project-ref jnxevalckgitxuunjcvv` (×1, start and end of phase) | Read-only |

No `INSERT`/`UPDATE`/`DELETE`/`ALTER`/`DROP`/`CREATE`/`TRUNCATE` statement was ever constructed or sent.
**Evidence basis for this claim:** every query issued is reproduced verbatim in this phase's command
history (visible in the session transcript) and each began with `select`; additionally, OLD's applied
migration count was re-checked at the very start and very end of this phase and found identical (26/45
both times) — if any schema-altering statement had somehow executed, this count or the live
`information_schema` reads would have reflected it. This is the strongest evidence this tooling can
provide; it is not a cryptographic guarantee, but no tool available in this environment offers one.

## Step 15 — NEW safety verification

Re-confirmed via `supabase inspect db table-stats --linked` at the end of this phase: 45/45 migrations
applied, 13 stages, 98 chapters, 98 `learn_content` rows, `STG000` absent, and `users` / `sessions` /
`learn_progress` / `test_runs` / `attempts` / `practice_progress` / `practice_pairings` /
`student_section_assignments` / `staff_sessions` / `staff_users` / `staff_messages` all **0**. No test
student or any other row was inserted during this phase.

## Decision gate reasoning

Per the task's explicit rules: the gate is **not BLOCKED** — no real student has STG000/STG007-011 data
requiring a product decision, no real student references curriculum lacking a safe destination, no
required FK dependency is unsatisfiable, and no other concrete data-integrity blocker was found. The gate
is **not fully OPEN** either, because two unresolved items remain that the task's own OPEN criterion
("no unresolved migration decision remains") rules out: (1) the auth-compatibility hashing-code claim is
still only externally sourced, not independently verified; (2) the staff-provisioning approach (recreate
fresh vs. migrate with identical IDs) is a genuine, still-open product decision, even though it is now
known to be low-stakes (1 staff row, 4 messages, zero `student_section_assignments` dependency).

**STUDENT MIGRATION GATE: OPEN WITH CONDITIONS.**
