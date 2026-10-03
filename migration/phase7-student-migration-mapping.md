# Phase 7 — Student Migration Table Mapping

Read-only, static analysis only (plus the live OLD-migration-count re-check in
`phase7-runtime-readiness-audit.md` §7). No data was copied, inserted, or moved. 28 tables total exist
in the schema that OLD and NEW both run (same `create table` statements — zero PK/FK type differences
anywhere in the 45-migration history; only additive nullable columns were ever added).

## 1. Table classification (28 tables)

**Curriculum/content — 15 tables, authoritative on NEW, must never be overwritten by OLD data:**
`stages`, `chapters`, `learn_content`, `questions`, `options`, `test_hints`, `glossary`, `question_terms`,
`practice_bank`, `practice_tests`, `practice_mistakes`, `announcements`, `kabi_phrases`, `prerequisites`,
`settings`.

**Student-owned — 9 tables:** `users`, `sessions`, `learn_progress`, `test_runs`, `attempts`,
`practice_progress`, `practice_pairings`, `student_section_assignments`, `activity_attempts`.

**Staff/admin-org — 4 tables:** `staff_users`, `staff_sessions`, `sections` (curriculum-like — 7 fixed
seed rows `SEC001`-`SEC007`, identical on NEW), `staff_messages`.

## 2. Migration mapping table (student-owned tables)

| OLD Table | NEW Table | Migrate? | Reason | Key Mapping | Notes |
|---|---|---|---|---|---|
| `users` | `users` | **Yes**, excluding the 2 protected dev/QA IDs (§3) | Anchor for all progress FKs | `user_id` (text PK) unchanged | `current_stage`/`current_chapter`/etc. are plain text, no FK — a dangling legacy value here is a soft/display-only issue, not a DB error. `roll_no`/`email`/`username` are UNIQUE — check for collisions before insert. |
| `learn_progress` | `learn_progress` | Yes, scoped to NEW's active 98-chapter set | Per-chapter completion history | `user_id` hard FK (must land after `users`); `chapter_id`/`stage_id` soft text, unenforced | `unique(user_id, chapter_id)` must hold |
| `test_runs` | `test_runs` | Yes, same scoping | Per-test-session history | `user_id` hard FK | Must insert before `attempts`/`activity_attempts` (cascade FK to `test_run_id`) |
| `attempts` | `attempts` | Yes, same scoping | Per-question answer history | `user_id` + `test_run_id` hard FK | `test_runs` row must exist first |
| `activity_attempts` | `activity_attempts` | Nothing to migrate | OLD's Edge Function has no `saveActivityAttempt` action at all — this is a NEW-only feature added this engagement; OLD has zero rows by construction | N/A | Re-verify live at actual migration time in case this changes |
| `practice_progress` | `practice_progress` | Yes, excluding any `E`-prefixed (Experiment) `practice_id` rows | Per-challenge VS Code practice history | `user_id` + `practice_id` hard FK (practice_bank already exists on NEW as curriculum) | `20260916120000_remove_experiments.sql` states 0 such rows existed on OLD at authoring time — a point-in-time claim, worth a live re-check before the real migration |
| `practice_pairings` | `practice_pairings` | **Recommend no** | Ephemeral device-pairing codes/tokens tied to a specific backend instance; meaningless on a new project ref | `user_id` hard FK only | Devices simply re-pair on next use |
| `student_section_assignments` | `student_section_assignments` | **Conditional** on the staff-migration decision (§3) | Preserves section membership | `student_id`→`users`, `section_id`→`sections` (hard FKs); `assigned_by`→`staff_users.staff_id`, nullable but hard FK | If staff `staff_id` values aren't preserved identically, `assigned_by` **must be set NULL** or the insert will hard-fail |

## 3. Explicit exclusions — what must NOT migrate, and why

- **`sessions` (all rows)** — ephemeral/security-sensitive; every student re-authenticates against the
  new backend regardless, so carrying tokens forward serves no purpose.
- **`practice_pairings` (all rows)** — same ephemeral/device-credential reasoning.
- **The two dev/QA accounts `U1A8B0A6D8810` and `U485B9DDDA04E`** (IDs only, no other data looked up) —
  protected by `20260924000000_clear_test_accounts.sql`, confirmed by `migration/pre-bootstrap-safety-report.md`
  as longstanding real dev-team accounts, not part of the 354-real-student population.
- **STG000 / `CH0001`-`CH0030` legacy chapters, and any progress tied to them** — NEW's 45 migrations
  never create a `STG000` stage row (confirmed: zero `insert into stages` for it anywhere; the only
  migration mentioning it deactivates a pre-existing row). A static CSV check this phase found all
  located STG000-referencing rows (2 in LearnProgress, 7 in Attempts, 4 in TestRuns) belong entirely to
  the protected `U485B9DDDA04E` account — but the available CSV export is narrow (only those 2 accounts'
  data), so it **cannot** confirm whether any of the other 352 real students also have STG000-era
  progress. **UNKNOWN — requires a live query against OLD**:
  `select count(*) from learn_progress where chapter_id between 'CH0001' and 'CH0030' and user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')`
  (repeat for `attempts`, `test_runs`, and for `users` where any `*_chapter`/`*_stage` column falls in
  that range). A non-zero result means those students' legacy progress has no destination on NEW and
  needs an explicit decision before the real migration.
- **`staff_*` tables as a migration source** — an open decision, not resolvable from static files alone.
  Two coherent paths: (1) recreate staff accounts fresh on NEW with new IDs — simplest, but then
  `staff_messages` (NOT NULL FK to `staff_users.staff_id`) cannot migrate without a remapping step and
  message history would be lost; or (2) migrate `staff_users` first with identical `staff_id` values,
  which then allows `staff_messages` and `student_section_assignments.assigned_by` to migrate unchanged.
- **Obsolete "Experiments" practice content** — already deleted (both OLD and NEW ran
  `20260916120000_remove_experiments.sql`); its own pre-check comment states 0 real `practice_progress`
  rows referenced it at authoring time, worth one live re-check (`select count(*) from practice_progress where practice_id like 'E%'`) rather than assuming it's still 0.
- **`clear_test_accounts.sql` as a precedent** — confirmed (prior phase) this must never be executed
  again by any means once real students exist on NEW.

## 4. ID / foreign-key compatibility

**Schema-wise: IDs can be preserved completely unchanged.** OLD and NEW run the identical `create table`
statements — zero PK/FK type differences anywhere in the 45-file history.

**Row-value / FK-enforcement reality is more permissive than often assumed:** `chapter_id`/`stage_id` on
`learn_progress`, `test_runs`, `attempts`, `activity_attempts`, and `practice_progress` are plain
`text not null` with **no foreign-key constraint** to `chapters`/`stages` (confirmed by direct read of
each `create table` statement). Postgres will not reject an insert with an orphaned chapter/stage value —
a dangling legacy reference is an application-level display issue, not a migration-blocking database
error. The only hard, DB-enforced FKs on student tables are `user_id`→`users.user_id`,
`test_run_id`→`test_runs.test_run_id`, `practice_id`→`practice_bank.practice_id`,
`section_id`→`sections.section_id`, and `staff_id`→`staff_users.staff_id` (nullable).

**Curriculum boundary, independently re-counted this phase:** NEW's 13 stages / 98 chapters come from an
exhaustive, directly-verified set of migrations (zero `insert into chapters`/`insert into stages` exist
outside the ones identified). **OLD currently has only 26 of these 45 migrations applied** (live-verified
fresh this phase, resolving a discrepancy between two of this engagement's own earlier documents — see
`phase7-runtime-readiness-audit.md` §7) — meaning OLD is missing roughly the newest 19 migrations: full
content for Number Crunching (`STG012`) and Patterns (`STG013`) don't exist on OLD at all yet, along with
the Stage-6 chapter-order fix and `activity_attempts`. OLD's real student activity is concentrated in
`STG001`-`STG006` (`CH0031`-`CH0061`), a range that exists byte-for-byte identically in both databases
regardless of which newer migrations OLD has applied, since these are among the earliest migrations in
the shared sequence. Whether any real student has since progressed into `STG007`-`STG011` (which DO
exist as shells on OLD, per the 26 applied) is **UNKNOWN — requires a live row-level query against OLD**,
not resolvable from static files.

**Bottom line for IDs: preserve unchanged, do not translate.** `user_id`, `chapter_id`, `stage_id`,
`question_id`, `test_run_id`, `practice_id`, `section_id` all keep their exact OLD string values on
insert into NEW. The two genuinely open items — real-student STG000 progress, and real-student
STG007-011 progress — both require a live, read-only query against OLD that this audit-only phase did
not run (out of this phase's scope; no student data was queried at the row level).
