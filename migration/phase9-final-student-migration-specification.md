# Phase 9 — Final Student Migration Specification

This is a specification and design document only. **No migration was executed. No student was
inserted, updated, or copied. No credential was moved.**

## Section 7 — Final 352-student population

| | Count |
|---|---|
| Total OLD users | 354 |
| Protected dev/QA accounts | 2 (`U1A8B0A6D8810`, `U485B9DDDA04E`) |
| Real students (migration population) | 352 |

**Deterministic selection rule** (re-usable SQL predicate, not a manually copied list):

```sql
select * from users where user_id not in ('U1A8B0A6D8810', 'U485B9DDDA04E');
```

This is the exact same predicate `supabase/migrations/20260924000000_clear_test_accounts.sql` uses to
protect these two accounts — reusing an already-established, reviewed exclusion rule rather than
inventing a new one. All 354 users have `status='active'` (Phase 8), so `status` cannot be used to
distinguish the 2 protected accounts from the 352 real students — the explicit ID-list predicate above
is the only correct selection mechanism. No personal information beyond the two already-protected IDs is
reproduced here.

## Section 8 — Final student table mapping (overview)

| Table | Source rows (OLD) | Destination | Ready? |
|---|---|---|---|
| `users` | 352 (selection rule above) | `users` | READY |
| `test_runs` | all rows where `user_id` in the 352-student set | `test_runs` | READY |
| `attempts` | all rows where `user_id` in the 352-student set | `attempts` | READY |
| `learn_progress` | all rows where `user_id` in the 352-student set | `learn_progress` | READY |
| `practice_progress` | all rows where `user_id` in the 352-student set (5 rows, 2 students — Phase 8) | `practice_progress` | READY |
| `student_section_assignments` | 352 (all, `assigned_by` forced `NULL`) | `student_section_assignments` | READY |

No table in this list requires row EXCLUSION beyond the 2 protected accounts — Phase 8 found zero
STG000/STG007-011/Experiment/orphan rows among the 352 real students in any of these tables, so the
per-table "excluded rows" count is uniformly 0 beyond the protected-account filter already applied at
the `users` level (and inherited by every table whose rows are selected via `user_id in (352-student
set)`).

## Section 9 — `users` column-by-column mapping

| Column | Classification | Notes |
|---|---|---|
| `user_id` | COPY AS-IS | Primary key, preserved unchanged (Phase 8: ID translation not required) |
| `name` | COPY AS-IS | |
| `roll_no` | COPY AS-IS | UNIQUE on both sides — verify no collision before insert (none expected: NEW is empty) |
| `department` | COPY AS-IS | Free-text, no CHECK constraint on either side; ~35 messy "AIDS" spelling variants copy through unchanged (Phase 8 §3, cosmetic only) |
| `email` | COPY AS-IS | UNIQUE on both sides |
| `phone` | COPY AS-IS | |
| `password_hash` | COPY AS-IS | Safe per Phase 9 §6 — verified identical hashing implementation |
| `password_salt` | COPY AS-IS | Same |
| `joined_at` | COPY AS-IS | Preserve real signup history |
| `last_login` | COPY AS-IS | Preserve |
| `last_logout` | COPY AS-IS | Preserve |
| `total_xp` | COPY AS-IS | Historical value — do not recompute (per task instruction) |
| `streak` | COPY AS-IS | Historical value |
| `current_stage` | COPY AS-IS | Plain text, no FK (Phase 7/8) — even the 253 dormant accounts' stale `"STG000"` default copies through harmlessly; it was never a real engagement signal (Phase 8 §4) |
| `current_chapter` | COPY AS-IS | Same reasoning; confirmed 0 real students have a legacy-range value here |
| `hearts` | COPY AS-IS | Historical value |
| `tests_completed` | COPY AS-IS | Historical value |
| `questions_attempted` | COPY AS-IS | Historical value |
| `correct_answers` | COPY AS-IS | Historical value |
| `accuracy_percent` | COPY AS-IS | Historical value — do not recompute |
| `onboarding_completed` | COPY AS-IS | |
| `status` | COPY AS-IS | All 354 are `'active'` |
| `stages_completed` | COPY AS-IS | Historical value |
| `last_completed_stage` | COPY AS-IS | Confirmed 0 real students reference `STG000`/legacy range here |
| `last_learn_stage` | COPY AS-IS | Same |
| `last_learn_chapter` | COPY AS-IS | Same |
| `heart_recovery_stage_id` | COPY AS-IS | Confirmed 0 real students reference legacy range |
| `heart_recovery_chapter_id` | COPY AS-IS | Same |
| `role` | COPY AS-IS | All 354 are `'student'` |
| `username` | COPY AS-IS | UNIQUE, nullable — NEW's schema already supports `NULL` (added by `20260907130000_add_username.sql`, which back-fills existing rows as `NULL`); copy OLD's value (`NULL` or set) directly |

**No field requires a decision, transformation, exclusion, or default.** Every one of the 30 columns is
a straight copy.

## Section 10 — Progress table mapping (`learn_progress`, `test_runs`, `attempts`, `practice_progress`)

General rule for all four tables, per the task's explicit instruction: **preserve original primary key,
`user_id`, stage/chapter/question/practice IDs (even though these have no enforced FK — Phase 8 §11 —
every real-student value was confirmed to resolve to a real NEW row anyway), timestamps, completion
state, XP values, heart values, attempt numbers, and response metadata. Do not recompute historical XP
or accuracy.**

| Table | PK preserved | Hard FKs (must satisfy insert order) | Soft refs (no FK, preserved as-is) | Derived value needing post-migration recompute |
|---|---|---|---|---|
| `learn_progress` | `learn_progress_id` | `user_id` → `users` | `stage_id`, `chapter_id` | None |
| `test_runs` | `test_run_id` | `user_id` → `users` | `stage_id`, `chapter_id` | None |
| `attempts` | `attempt_id` | `user_id` → `users`, `test_run_id` → `test_runs` | `stage_id`, `chapter_id`, `question_id` | None |
| `practice_progress` | `progress_id` | `user_id` → `users`, `practice_id` → `practice_bank` (already exists on NEW as curriculum) | `stage_id` | None |

**No derived value should be silently recalculated.** `users.total_xp`/`accuracy_percent`/
`questions_attempted`/`correct_answers` and every per-row `xp_earned`/`xp_committed`/`accuracy_percent`
column are historical facts, not formulas to re-derive — copying them preserves exactly what each
student actually experienced.

## Section 11 — Student section assignments

Confirmed (Phase 8, re-stated here, not re-queried — no new write or read needed beyond what Phase 8
already established as current): 352 assignments, all active, `assigned_by = NULL` for all 352.

| Column | Mapping |
|---|---|
| `student_id` | → `users.user_id` (unchanged) |
| `section_id` | → `sections.section_id` (unchanged — NEW already seeds identical `SEC001`-`SEC007`) |
| `assigned_by` | **NULL** (matches OLD's actual value for all 352 rows — not a transformation, a pass-through) |
| `assigned_at` | preserve |
| `active` | preserve |

Because every real `assigned_by` value is already `NULL`, this table has **zero dependency** on the
Section 13 staff decision — it can migrate regardless of which staff option is eventually chosen.

## Section 12 — Excluded data (explicitly NOT migrated; remains untouched in OLD)

| Excluded | Reason |
|---|---|
| `sessions` (all rows) | Ephemeral/security-sensitive; every student re-authenticates against NEW's backend regardless once deployed |
| `practice_pairings` (all rows) | Ephemeral device-pairing codes/tokens tied to a specific backend instance; devices simply re-pair |
| `activity_attempts` | Table does not exist on OLD (Phase 8 §9) — nothing to exclude, there is no source data |
| The 2 protected dev/QA accounts | Per `clear_test_accounts.sql` / Phase 4-5's established decision; not part of the real-student population |
| STG000 legacy progress | Zero real-student rows exist (Phase 8 §4) — there is nothing to exclude in practice, but the selection rule inherently excludes it anyway since it was never present |
| STG007–STG011 progress | Zero real-student rows exist (Phase 8 §5) — same as above |
| Obsolete Experiment (`E%`) practice progress | Zero rows exist (Phase 8 §6) — same as above |
| Staff data (`staff_users`, `staff_sessions`, `staff_messages`) | Not part of student migration; separate operational decision (Section 13) |

**"Excluded from migration" means these records are simply never selected by the migration's queries —
they remain exactly as they are in OLD. Nothing is deleted, modified, or touched in OLD by this
exclusion.**

## Section 13 — Staff decision (not made here)

Phase 8 found: 1 `staff_users` row, 4 `staff_messages` rows, and — critically — all 352
`student_section_assignments.assigned_by` values are `NULL`. **Student migration does not depend on the
staff decision in any way.**

- **Option A:** Recreate the staff account fresh on NEW (new `staff_id`). Simplest; the 4 existing
  `staff_messages` rows would have no destination (NOT NULL FK to `staff_users.staff_id`) and would be
  left behind in OLD, unmigrated, under this option.
- **Option B:** Migrate `staff_users` with its identical `staff_id` first, enabling `staff_messages` to
  migrate unchanged afterward.

**This is marked SEPARATE OPERATIONAL DECISION.** No staff data was inspected beyond the aggregate
counts already recorded in Phase 8. No staff password or credential was read this phase.

## Section 14 — Migration order (validated against actual schema constraints, not assumed)

1. **Preflight** (Section 16)
2. `users` (no dependency)
3. `student_section_assignments` (FK → `users` only, in practice — `assigned_by` is NULL for all real
   rows, so there is no actual staff-ordering dependency; placed early since it has no other dependency)
4. `test_runs` (FK → `users`)
5. `attempts` (FK → `users`, **and** `test_run_id` → `test_runs` — must follow step 4)
6. `learn_progress` (FK → `users` only — could run any time after step 2, placed after `attempts` to
   keep the "testing" tables grouped, not for a dependency reason)
7. `practice_progress` (FK → `users`, `practice_id` → `practice_bank`; `practice_bank` is curriculum,
   already present on NEW, so this has no new dependency introduced by migration)
8. **Post-migration validation** (Section 17)

This refines the task's own suggested conceptual order in exactly one place: `attempts` must strictly
follow `test_runs` (hard FK on `test_run_id`, confirmed in the baseline schema), whereas
`learn_progress` has no FK relationship to `test_runs` at all and could run in either order — it is
sequenced after `attempts` here purely for grouping clarity, not because the schema requires it.

## Section 15 — Transaction / batching strategy (design only)

Recommend **per-table, per-batch transactions**, not one single all-or-nothing transaction across all
352 students and 6 tables: Supabase's Management API query execution (used throughout this phase's
reconnaissance) and the Edge Function's own `supabase-js` client both have practical statement/payload
size limits, and a single giant transaction spanning tens of thousands of rows (Phase 8: 352 users + an
unestablished-but-likely-larger number of progress rows) risks timeout or lock contention. Recommended
shape for a future Phase 10:

- One transaction per table (so `users` either fully inserts or fully rolls back as a unit, then
  `student_section_assignments`, etc.) — **not** one transaction per student, which would be far slower
  and provide no additional safety given no table depends on partial-student-state from another table
  mid-migration.
- Batch size within a table: a few hundred rows per `insert` statement, well under any practical
  payload limit, rather than 352+ individual single-row inserts.
- **`--dry-run` must execute every SELECT this migration would use for its real run, and print the
  exact row counts it would insert per table, without issuing any write.**
- **Verify NEW is empty (`select count(*) from users` = 0) as the very first action of `--execute` mode,
  every time, not just once during planning** — if it is not 0, refuse to proceed.
- **Never write to OLD, under any mode** — every OLD interaction in both `--dry-run` and `--execute`
  modes should be a `SELECT` only.
- Stop immediately on any row-count or FK-validation discrepancy (Section 17) rather than continuing
  partially.

## Section 16 — Pre-migration snapshot (required preflight checks for a future Phase 10)

**NEW must show, immediately before any write:**
`users=0`, `learn_progress=0`, `test_runs=0`, `attempts=0`, `practice_progress=0`,
`student_section_assignments=0`; 13 stages; 98 chapters; `STG000` absent.

**OLD must show (read-only):**
`users=354`; protected accounts=2; real students=352; real-student STG000 rows=0; real-student
STG007-STG011 rows=0; `E%` practice rows=0.

**Invalid-practice-reference check on NEW:** 0 (i.e., re-confirm no practice_id referenced by the
352-student population is absent from NEW's `practice_bank` — already 0 per Phase 8 §6, re-verify at
execution time since OLD's live state could in principle change between now and a future Phase 10).

If any of these does not match at execution time, Phase 10 must stop before writing anything.

## Section 17 — Post-migration validation specification (for a future Phase 10)

**Row counts (must match exactly):**
OLD selected `users` = NEW inserted `users` (352); same equality required for `learn_progress`,
`test_runs`, `attempts`, `practice_progress`, `student_section_assignments`.

**Integrity checks:**
- No duplicate `user_id`, `roll_no`, `email`, or `username` in NEW's `users` after insert.
- Every progress-table `user_id` resolves to an inserted `users` row.
- Every `attempts.test_run_id` resolves to an inserted `test_runs` row.
- Every `practice_progress.practice_id` resolves to an existing `practice_bank` row.
- Every `student_section_assignments.section_id` resolves to an existing `sections` row.
- No migrated row anywhere references `STG000` or `STG007`-`STG011` stage/chapter values as a *new*
  occurrence beyond what was already confirmed absent in Phase 8 (this is a re-confirmation, not an
  expectation of change).
- Zero `sessions` rows exist in NEW after migration (none should ever be inserted).
- Zero protected-account rows (`U1A8B0A6D8810`, `U485B9DDDA04E`) exist in NEW's `users` after migration.

**Per-user aggregate comparison (OLD value vs. NEW value, must be equal — not recomputed):**
`total_xp`, `hearts`, `tests_completed`, `questions_attempted`, `correct_answers`, `accuracy_percent`,
`streak`, and every stage/chapter pointer field. **These must match because they were copied, not
because they were recalculated** — a future Phase 10 must never silently recompute these during or
after migration.

## Section 18 — Rollback / recovery design

Because NEW starts and (per every phase's safety check) remains student-free until a future Phase 10
actually runs, recovery is straightforward and **NEW-only**:

- **Preflight failure:** abort before any write; nothing to roll back.
- **Partial insert within a table's transaction:** the per-table transaction (Section 15) rolls back
  automatically on any error — no partial `users` rows, for example, would ever persist.
- **Constraint failure (FK/unique violation):** same — the offending table's transaction rolls back; a
  future Phase 10 should log the exact violating row(s) and stop rather than skip-and-continue.
- **Authentication mismatch:** not expected given Phase 9's verification, but if a specific login test
  post-migration ever failed, the recovery is to NOT deploy the frontend/Edge Function to point students
  at NEW — NEW's `users` rows could be deleted and re-inserted after investigation, since no real session
  would yet exist against NEW (Edge Function isn't deployed there — Phase 7/8 blocker, still open).
- **Row-count mismatch (Section 17):** stop before proceeding to the next table in the order (Section
  14); a table-level `delete from <table>` scoped to only the rows just inserted by that run (identified
  by the known 352-student `user_id` set) is the deterministic cleanup — scoped, not a blanket truncate.
- **Validation failure after all tables inserted:** same scoped-delete approach, run in reverse
  dependency order (Section 14, reversed) so FK constraints never block the cleanup.

**Never, under any failure mode, does recovery modify OLD.** OLD is only ever read from throughout this
entire design.

## Section 19 — Migration script specification (not created as executable code this phase)

Per the task's explicit preference, this phase produces a **specification**, not an executable script —
creating a real script now would create ambiguity about whether it has been run, which this phase's
"leave the system exactly as it found it" mandate explicitly guards against.

**A future Phase 10 implementation must expose at least these flags:**
- `--dry-run` (default) — runs every planning SELECT, prints exact row counts per table it would
  migrate, writes nothing.
- `--source` — must equal `jnxevalckgitxuunjcvv`; refuse otherwise.
- `--destination` — must equal `eyevmykfavooeiklzebe`; refuse otherwise.
- `--validate-only` — runs Section 16's preflight checks and reports pass/fail, writes nothing.
- `--execute` — the only mode that writes, and only to the destination; must additionally:
  - Refuse to run unless `--execute` was passed explicitly (never implied by any other flag combination).
  - Refuse if `--source` is not exactly `jnxevalckgitxuunjcvv`.
  - Refuse if `--destination` is not exactly `eyevmykfavooeiklzebe`.
  - Refuse if NEW's `users` count is not exactly 0 at the moment `--execute` begins.
  - Never issue a write statement against `--source`, under any flag combination.
  - Print no secret value anywhere in its output or logs (consistent with every phase so far).
  - Never contain a hardcoded credential of any kind.

This specification is **complete** per the above; no executable implementation was produced in this
phase.

## Section 20 — Deployment blockers (explicitly not addressed this phase)

Recorded separately, as instructed, and not mixed into the data-migration design above:

- `ADMIN_RESET_KEY` not set on NEW
- `click-backend` not deployed to NEW
- `index.html` hardcodes OLD's URL/anon key
- `SUPABASE_PROJECT_ID` GitHub Actions secret's current value is unknown to this audit

These are **runtime/deployment work**, tracked as **POST-MIGRATION / RUNTIME DEPLOYMENT WORK** — distinct
from, and not a prerequisite blocker for, finishing the data-migration specification above (though they
clearly ARE prerequisites for students actually being able to use NEW after any future data migration
runs).
