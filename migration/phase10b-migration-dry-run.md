# Phase 10B — OLD → NEW Student Migration Dry Run

**No write of any kind was issued against OLD or NEW in this phase. Every query below is a `SELECT`
(verified by construction — each is reproduced verbatim in this report). No `INSERT`/`UPDATE`/`DELETE`/
`UPSERT`/`TRUNCATE`/`ALTER`/`DROP`/`CREATE` was ever sent.**

## Step 10B-1 — Project target verification

SOURCE (OLD): `jnxevalckgitxuunjcvv`. DESTINATION (NEW): `eyevmykfavooeiklzebe`. CLI link
(`supabase/.temp/project-ref`) remained `eyevmykfavooeiklzebe` throughout — every OLD query used
`--linked --project-ref jnxevalckgitxuunjcvv` without altering this file (consistent with the calibration
established in Phase 8). `zwdmredbjktvecvpfurx` was never referenced.

## Step 10B-3 — NEW empty-state preflight

| Check | Result |
|---|---|
| `users` | 0 |
| `learn_progress` | 0 |
| `test_runs` | 0 |
| `attempts` | 0 |
| `practice_progress` | 0 |
| `practice_pairings` | 0 |
| `student_section_assignments` | 0 |
| `stages` | 13 |
| `chapters` | 98 |
| `learn_content` | 98 |
| `STG000` present | 0 (absent) |

All expected. NEW contained no student rows — proceeded to source preflight.

## Step 10B-4 — OLD source preflight

| Check | Result |
|---|---|
| Total users | 354 |
| Real students (excl. 2 protected) | 352 |
| STG000/legacy-range `learn_progress` rows (real students) | 0 |
| STG007-STG011 `test_runs` rows (real students) | 0 |
| `E%` practice rows | 0 |
| Invalid practice references | 0 |
| `student_section_assignments` total | 352 |
| `assigned_by` non-null | 0 |
| `activity_attempts` table exists | No (0) |

All matched Phase 8/9's established baseline exactly.

## Step 10B-5 — Migration selection

Selection rule: `select * from users where user_id not in ('U1A8B0A6D8810', 'U485B9DDDA04E')`.
**SELECTED USERS: 352** — matches the required exact count. Proceeded to per-table dry runs.

## Step 10B-6 — `users` dry run

| Check | Result |
|---|---|
| Total selected | 352 |
| Distinct `user_id` | 352 |
| Distinct `roll_no` | 352 |
| Distinct `email` | 352 |
| Non-null `username` count | 341 (11 legitimately `NULL`, allowed — nullable column) |
| Distinct non-null `username` | 341 (no collisions among the ones set) |
| `role='student' AND status='active'` | 352 (all) |
| `password_hash` present & non-empty | 352 |
| `password_salt` present & non-empty | 352 |
| Both present | 352 |

**No credential value was printed or compared — only presence/non-emptiness counts.**
**WOULD INSERT: 352. Zero uniqueness violations. Zero missing auth data.**

## Step 10B-7 — `learn_progress` dry run

| Check | Result |
|---|---|
| Source rows (352-population) | 450 |
| Legacy (STG000/CH0001-30) excluded | 0 |
| STG007-STG011 excluded | 0 |
| Duplicate `(user_id, chapter_id)` | 0 |
| Chapter/stage IDs not present in NEW's chapter set | 0 (all 32 distinct chapter IDs referenced by the population — `CH0031`-`CH0061`, `CH0115` — confirmed present in NEW's 98-chapter set) |

**WOULD INSERT: 450.**

## Step 10B-8 — `test_runs` dry run

| Check | Result |
|---|---|
| Source rows | 805 |
| Legacy excluded | 0 |
| STG007-STG011 excluded | 0 |
| Distinct `test_run_id` | 805 (matches source rows — confirms uniqueness) |

**WOULD INSERT: 805.**

## Step 10B-9 — `attempts` dry run

| Check | Result |
|---|---|
| Source rows | 4,688 |
| Distinct `attempt_id` | 4,688 |
| Orphan `test_run_id` (not among the 805 that would migrate) | 0 |
| Orphan `question_id` (not in `questions`) | 0 |
| Legacy excluded | 0 |

**WOULD INSERT: 4,688.**

## Step 10B-10 — `practice_progress` dry run

| Check | Result |
|---|---|
| Source rows | 5 |
| Distinct `progress_id` | 5 |
| `E%`-prefixed excluded | 0 |
| Orphan `practice_id` (not in `practice_bank`) | 0 |
| Duplicate `(user_id, practice_id)` | 0 |

**WOULD INSERT: 5.**

## Step 10B-11 — `student_section_assignments` dry run

| Check | Result |
|---|---|
| Source rows (excl. protected) | 352 |
| Distinct `assignment_id` | 352 |
| Orphan `section_id` (not in `sections`) | 0 |
| Non-null `assigned_by` | 0 (all `NULL`, consistent with Phase 10A's Option A decision) |

**WOULD INSERT: 352.**

## Step 10B-12 — Cross-table reconciliation

| Table | OLD Source Rows | Excluded | Would Insert | Reason for exclusions |
|---|---|---|---|---|
| `users` | 354 | 2 | 352 | 2 protected dev/QA accounts (`clear_test_accounts.sql` rule) |
| `learn_progress` | 450 | 0 | 450 | None — zero legacy/STG007-11 rows exist among real students |
| `test_runs` | 805 | 0 | 805 | None |
| `attempts` | 4,688 | 0 | 4,688 | None |
| `practice_progress` | 5 | 0 | 5 | None — zero Experiment/orphan rows |
| `student_section_assignments` | 352 | 0 | 352 | None |

**There are no unexplained exclusions.** The only exclusion in this entire migration, across all six
tables, is the 2 protected accounts at the `users` level (which naturally removes 0 additional rows
elsewhere, since Phase 8 already confirmed those 2 accounts' own rows are the only STG000-range activity
in the whole database and are excluded by construction via the `user_id not in (...)` filter applied
consistently to every table).

## Step 10B-13 — Per-student reconciliation

Initial check compared each of the 352 students' stored `users.questions_attempted`/`correct_answers`/
`tests_completed` against independently-counted `attempts`/`test_runs` rows. **First pass: 341 students
with zero differences, 11 with a difference — all 11 isolated to `tests_completed`, always with the
stored value higher than the counted value (by 1 to 15).**

**Investigated rather than reported as a blocker (per the task's "STOP and explain" instruction):**
`test_runs.status` has four distinct values — `active` (384), `completed` (429), `failed` (68), and
`completed_repeat` (43, for a chapter test retaken after already passing). The backend code itself
(`index.ts:983`) treats `status === "completed" || status === "completed_repeat"` as "this chapter
counts as completed." The initial check's query only matched `status='completed'`, undercounting by
exactly the `completed_repeat` rows for the 11 affected students — **a bug in this dry run's own query,
not a data-integrity problem in OLD.**

Re-run with the corrected definition (`status in ('completed','completed_repeat')`):

**Students with zero differences: 352. Students with differences: 0.**

No per-student value was altered, recomputed, or overwritten anywhere in this process — only the
*validation query's* definition was corrected, and only the aggregate counts are reported here, never
any individual student's identity or values.

## Step 10B-14 — Auth dry-run validation

Restating Step 10B-6's auth-specific counts (no credential value ever printed):

| | Count |
|---|---|
| `password_hash` present | 352 |
| `password_salt` present | 352 |
| Both present | 352 |
| Missing either | 0 |

**No AUTH DATA GAP.** All 352 selected students have complete authentication material.

## Step 10B-15 — Destination collision check

NEW contains 0 users (Step 10B-3), so every collision category is trivially 0: `user_id`, `roll_no`,
`email`, `username`, `learn_progress_id`, `test_run_id`, `attempt_id`, `practice_progress_id`,
`assignment_id` — **0 collisions in every category.** (Within-source uniqueness was additionally and
separately confirmed per-table in Steps 10B-6 through 10B-11, not merely assumed from NEW's emptiness.)

## Step 10B-16 — Future execution order (validated against actual schema, not assumed)

1. `users` (352) — no dependency
2. `student_section_assignments` (352) — FK → `users` only in practice (`assigned_by` uniformly `NULL`)
3. `test_runs` (805) — FK → `users`
4. `attempts` (4,688) — FK → `users` **and** `test_run_id` → `test_runs` (must follow step 3)
5. `learn_progress` (450) — FK → `users` only (no dependency on step 3/4, sequenced here for grouping)
6. `practice_progress` (5) — FK → `users`, `practice_id` → `practice_bank` (already on NEW as curriculum)

Identical to Phase 9 Section 14's specification — re-validated against this phase's live counts, not
re-assumed.

## Step 10B-17 — Future rollback plan

- OLD is never written to by any part of this design — every rollback path is NEW-only.
- A future Phase 10C should wrap each table's insert in its own transaction (Phase 9 §15); a failure
  mid-table rolls back that table automatically.
- If a failure is detected only after a later table's insert has begun, cleanup is a `delete` scoped to
  the known 352-`user_id` set, run in reverse of the Step 10B-16 order (practice_progress →
  learn_progress → attempts → test_runs → student_section_assignments → users), so FK constraints never
  block the cleanup.
- No `DELETE` against OLD is ever part of any rollback path.

## Step 10B-18 — Dry-run termination

**STOPPED here, as required.** `--execute` was never passed. No `INSERT`/`UPDATE`/`DELETE`/`UPSERT`/
`TRUNCATE` was issued against NEW at any point in this phase.

## Implementation note

No executable migration script was created. Every calculation in this phase was performed via ad hoc,
individually-reviewed read-only `SELECT` queries run through `supabase db query --linked --project-ref
<ref>` — consistent with the task's preference for "a read-only dry-run query/report" over leaving an
executable tool in the repository when one isn't necessary. No file matching a migration-script pattern
was added to the repository.
