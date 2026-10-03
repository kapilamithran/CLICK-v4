# CLICK-NewTrial — NEW Supabase Bootstrap + Schema Deployment Audit (Phase 3)

**Read-only through dry-run only.** The CLI's local link was switched from OLD to NEW (an explicitly-requested, verified, reversible local-config change — see §3). Every subsequent database operation was either a read-only inspection or an explicit `--dry-run`. Nothing was written to either Supabase project. No file was edited except the four new/updated documentation files listed in §17.

---

## 1. NEW Project Identity

| | Value |
|---|---|
| Project ref | `eyevmykfavooeiklzebe` |
| Project name | `Click-V2` |
| Organization | `bxmtvxlkirixqbqykcxl` (same org as the previously-flagged "REC Academic" project, a different org from OLD's `irlfjfrakudsubapedys`) |
| Region | `ap-southeast-1` (same region as OLD) |
| Postgres version | `17.11.0.002` (OLD is `17.6.1.166` — same major engine version `17`, newer point release) |
| Status | `ACTIVE_HEALTHY` |
| Created | `2026-10-02T13:42:32Z` (today; did not exist when Phase 2's `supabase projects list` was run earlier the same day — confirmed by its absence from that earlier output and presence now) |

All confirmed live via `supabase projects list`.

## 2. OLD Project Identity

| | Value |
|---|---|
| Project ref | `jnxevalckgitxuunjcvv` |
| Name | `darshansathish2006's Project` |
| Organization | `irlfjfrakudsubapedys` |
| Region | `ap-southeast-1` |
| Postgres version | `17.6.1.166` |
| Status | `ACTIVE_HEALTHY` |

Unchanged from Phase 1/2's findings; re-confirmed, not re-written to, this phase.

## 3. Confirmation They Are Separate

Different `ref`, different `organization_id`, different `created_at`, different Postgres point-version, different `database.host`. **Confirmed structurally separate projects**, not an alias or a read-replica of the same database. The local CLI link was switched from OLD to NEW via `supabase link --project-ref eyevmykfavooeiklzebe`, and independently re-verified three ways after switching: (a) `supabase/.temp/project-ref` now reads `eyevmykfavooeiklzebe`; (b) `supabase projects list` now shows `eyevmykfavooeiklzebe` with `"linked":true` and `jnxevalckgitxuunjcvv` with `"linked":false`; (c) every subsequent `--linked` command in this phase (table-stats, index-stats, migration list, db push --dry-run) connected to a database that returned **zero existing tables**, which is only possible against the brand-new NEW project, not OLD (which has 115 chapter rows, 354 users, etc.).

## 4. NEW Initial Row Counts

`supabase inspect db table-stats --linked` and `index-stats --linked` against NEW both returned **`{"rows":[],"message":"..."}`** — i.e., **no tables exist in the `public` schema at all yet**, not merely zero rows in existing tables. There is no `users` table, so there is no "354 OLD students" to find, overwrite, or worry about. **`users` count: 0 (table does not yet exist).** No STOP condition was triggered (Step 4's STOP is for `users > 0`, which cannot be true when the table itself doesn't exist).

## 5. NEW Project Identity — Confirmed Not OLD

Re-stated for clarity against the task's explicit Step 5 ask: ref `eyevmykfavooeiklzebe` ≠ `jnxevalckgitxuunjcvv`, confirmed by every piece of evidence in §1/§3 above.

## 6. Local Migration Count

**44** (`ls supabase/migrations/*.sql | wc -l`, cross-confirmed by the JSON array length from `supabase migration list`). **This repository is not "18 migrations" in total** — 18 is the count of migrations that exist in this repo but not in OLD's own history (a Phase 2 finding, about drift *relative to OLD*, which already had the other 26 applied). For a truly empty destination like NEW, **all 44** are relevant, not just 18 — see §8/§9 for why this distinction matters.

## 7. NEW Remote Migration Count

**0.** `supabase migration list` against the NEW-linked project shows all 44 local migration filenames with an empty `remote` field for every single one — none have ever been applied to NEW (expected and correct for a project created today).

## 8. Dry-Run Result

**PASS.** `supabase db push --dry-run` completed cleanly with no errors: `{"upToDate":false,"dryRun":true,"seeds":[],"roles":[],"message":"Finished supabase db push."}`. It proposes applying **all 44 migrations**, in exact chronological filename order, nothing skipped, nothing out of order. No actual write occurred (dry-run mode).

## 9. Migrations Proposed

All 44, in order — the first 26 are the ones already live on OLD (baseline schema, grants, and incremental fixes/content through `20260924000000`); the remaining 18 are the ones previously identified as "drift" relative to OLD. For NEW, this distinction is cosmetic — **every one of the 44 is pending and would be applied** on a real (non-dry-run) push, since NEW starts from nothing.

## 10. Migration Classifications

| Migration (or group) | Classification |
|---|---|
| `20260101000000_baseline_schema.sql`, `20260101000001_baseline_grants.sql` | **schema creation** (all 28 original tables, indexes, constraints; grants) |
| `20260907130000_add_username.sql`, `20260911120000_content_stage123.sql` + other `content_*`/`content_stageN_*` files (18 files total across the full 44) | **curriculum** |
| `20260907090000_remove_stage0_practice_challenges.sql`, `20260907120000_experiments_practice_columns.sql`, `20260907120100_seed_experiments_practice_bank.sql`, `20260916120000_remove_experiments.sql`, `20260913120000/130000/15120000_practice_*` | **practice** |
| `20260914120000_staff_monitoring.sql` | **sections** + **staff/monitoring** (creates `sections`, `student_section_assignments`, `staff_users`, `staff_sessions`, and adds 5 activity-timestamp indexes to existing tables) |
| `20260919120000_test_runs_one_completion_per_chapter.sql` | **XP** (the partial unique index that makes chapter-completion XP atomic) |
| `20260920100000_staff_messages.sql`, `20260921000000_staff_messages_seen.sql` | **staff/monitoring** |
| `20260924000000_clear_test_accounts.sql` | **progress/auth-adjacent — DESTRUCTIVE BY DESIGN, see §13** |
| `20260929000000_structure_number_crunching_patterns.sql` | **curriculum** (structural: new stages + chapter shells + a display-field update to 5 existing stage rows) |
| `20260928000000/030000/050000/070000`, `20260929020000`, `20260930010000`, `20261001010000` (unlock files) | **progress** (removes a stage self-lock `prerequisites` row — enables access, does not touch any student row) |
| `20261001020000_fix_stage6_chapter_order.sql` | **curriculum** |
| `20261001030000_activity_attempts.sql` | **activity system** (new table) — **RLS gap, see §11** |

No migration falls under **auth** (none touch `users.password_hash`/`password_salt`/`sessions` structurally — only `20260924000000` touches `users` at all, as a data operation, not a schema one), **hearts** (no migration alters `users.hearts` or the heart-recovery columns), or **functions/triggers** (confirmed in Phase 1: this database has zero Postgres functions and zero triggers anywhere in its entire history — all logic lives in the Edge Function).

## 11. Activity_attempts Status

**Will be created** by `20261001030000_activity_attempts.sql` if the (not-yet-run) real push proceeds. Table shape and indexes confirmed by direct re-read of the file this phase (quoted in full in the findings above): `attempt_id` PK, `user_id`/`test_run_id` real FKs (CASCADE), `stage_id`/`chapter_id`/`activity_id` plain text (no FK, consistent with every other progress table in this schema), `xp`/`xp_committed`, a non-unique index on `test_run_id`, and a unique index on `(test_run_id, activity_id)` for race-proof once-per-run XP.

## 12. RLS Status

**ACTIVITY_ATTEMPTS RLS GAP — confirmed, not fixed.** The migration file contains no `alter table activity_attempts enable row level security` statement of any kind — re-confirmed by a direct, full re-read of the file this phase (its complete contents are quoted in this phase's working notes; every other statement in the file was reviewed and none enables RLS). Every other table this project's migrations create does have such a statement, either via the baseline schema's one-time loop or an explicit `alter table ... enable row level security` in the migration that creates it. **This is the one schema object that would be created without RLS if the current migration set is pushed as-is.** Per this task's explicit instruction, this has **not** been silently fixed — it is reported here for an explicit decision. The concrete fix, if approved, is a one-line addition: `alter table activity_attempts enable row level security;` (either appended to this migration before it's ever applied anywhere, since it has never been applied to any project yet, or as a new follow-up migration).

## 13. Curriculum Status

**READY**, with one important, explicit caveat flagged per Step 9's instruction to scrutinize DELETE/UPDATE statements closely:

- The dry-run-proposed migration set builds exactly the Click-NewTrial curriculum described in this task (13 stages, 98 populated chapters after all 44 are applied) — confirmed against this repo's own `tests/fixtures/curriculum-structure.json`/`tests/learn/xp-inventory.test.js` output from the prior phases (13 stages, 98 chapters, 401 activities, 520 questions, 921 total XP).
- **`STG000` (OLD's legacy, inactive stage) is never created by any of these 44 migrations** — confirmed by grep: no migration in this repository's history ever inserts a stage row with id `STG000`. The task's instruction "Do NOT import STG000" is already satisfied by the existing migration set as written; no action was or needs to be taken to exclude it.
- **`20260924000000_clear_test_accounts.sql` contains a hardcoded, unconditional `delete from users where user_id not in ('U1A8B0A6D8810', 'U485B9DDDA04E');`** — quoted here in full because it is the single most important finding of this phase's SQL audit. This statement was originally authored as a **one-time cleanup against OLD**, before OLD's real 354-student rollout. Run now, against NEW's currently-empty `users` table, it is a pure no-op (0 rows match, 0 rows deleted) — **but it is destructive by design, not by accident**, and its safety here depends entirely on NEW's `users` table being empty at the exact point in the migration sequence where it runs (which it is, since this is a from-scratch bootstrap with no real students created yet). **This must never be run again, by hand or otherwise, once real students exist in NEW** — it would delete every one of them except the two hardcoded IDs. No action was taken on this file (editing it is out of scope for a read-only audit and not requested), but it is flagged here explicitly so a human decision-maker is aware before approving the real push.
- No other `delete from users`/`practice_progress`/any student table was found to have this characteristic — `20260916120000_remove_experiments.sql`'s `delete from practice_progress` is explicitly scoped (by its own comment, verified at authoring time against OLD) to rows referencing the specific "Experiments" `practice_id`s being removed, and is likewise a guaranteed no-op against NEW's empty tables.

## 14. Student-Data Status

**Confirmed: none of the 44 migrations create user-specific data.** No migration inserts a row into `users`, `sessions`, `learn_progress`, `test_runs`, `attempts`, `activity_attempts`, `practice_progress`, or `student_section_assignments` (confirmed by an exhaustive grep of every migration file for `insert into`/`update ... set`/`delete from` against each of these table names — the only two hits across all 44 files are the two already analyzed in §13, both confirmed to be no-ops against an empty database and neither of which *creates* any student data — one deletes, conditioned on an empty table; the other is a narrowly-scoped historical delete, also conditioned on emptiness). **No STOP condition from Step 12 was triggered.**

## 15. Edge Function Status

| | |
|---|---|
| Function | `click-backend` (`supabase/functions/click-backend/index.ts`, 1919 lines) |
| Purpose | The entire application backend: custom auth/sessions, chapter Learn+test+XP/hearts, VS Code practice pairing/grading, staff monitoring/messaging |
| Required secrets | `SUPABASE_URL` (auto-injected by the platform on deploy), `SUPABASE_SERVICE_ROLE_KEY` (must be set as an Edge Function secret for the **NEW** project specifically — this is a *different* key than OLD's, since they are different projects), `ADMIN_RESET_KEY` (app-defined, must also be set for NEW if the admin-only actions are needed there) |
| Database dependencies | All 28 tables (29 once `activity_attempts` is applied) |
| **Not deployed this phase** | Confirmed — no `supabase functions deploy` command was run against either project. |

## 16. Frontend Configuration Status

Every file referencing OLD's ref (`jnxevalckgitxuunjcvv`), classified:

| File | Classification | Notes |
|---|---|---|
| `index.html` | **Actual runtime configuration** | Hardcoded `BACKEND_URL` default — the one students' browsers actually call. Must be updated to the NEW project's Edge Function URL before any real cutover, but was **not** changed this phase. |
| `vscode-extension/package.json` | **Actual runtime configuration** | VS Code extension's own default backend URL setting; same caveat. |
| `admin-tools/build-content-migration.js`, `admin-tools/reset-student-password.ps1` | **Actual runtime configuration** (operator tooling) | Hardcoded defaults for ad-hoc admin scripts; would need updating when operators start managing NEW instead of OLD. |
| `supabase/config.toml` | **Source configuration** | Still hardcodes `project_id = "jnxevalckgitxuunjcvv"` (line 13). **This phase changed only the local, gitignored `.temp/project-ref` via the CLI `link` command — it did NOT edit this committed file.** A future, deliberate commit will need to update this line to `eyevmykfavooeiklzebe` once the team is ready to make NEW the default target for every contributor who clones the repo — not done here, consistent with "no commit, no push" for this phase. |
| `supabase/supabase_details.md`, `supabase-new-details.md`, `migration/migration-readiness-report.md`, `migration/shared-database-compatibility-report.md`, `migration/shared-database-compatibility.json` | **Documentation / historical reference** | Prior audit artifacts describing OLD as "the" production project at the time they were written — now superseded in part by this document. Not edited this phase (editing them retroactively would blur the historical record of what was known when); this new report is the current source of truth going forward. |

**No file was edited in this phase** — per the task's explicit "do not blindly replace them" and "do not deploy the frontend in this phase."

## 17. Blockers

1. **`activity_attempts` RLS gap (§12)** — needs an explicit decision before the real push, not a silent fix.
2. **`20260924000000_clear_test_accounts.sql`'s destructive-by-design DELETE (§13)** — safe today only because NEW is empty; needs human awareness so it is never manually replayed after real students exist in NEW.
3. **NEW project's own Edge Function secrets are not yet configured** (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_RESET_KEY` for the NEW project specifically — these are necessarily different values than OLD's, since they're different projects) — required before any Edge Function deploy to NEW, not addressed this phase.
4. **`supabase/config.toml` still points at OLD** — the real push in this phase's sequence would still work (since the local CLI link, not config.toml, determines the target of `db push`), but the committed default would mislead a future contributor until it's deliberately updated.

## 18. Next Action

The dry-run is clean and the SQL audit found no fabricated student data and no unexpected schema surprises. The **recommended immediate next step** (not performed in this phase, pending the human decisions in §17 items 1-2): add the `activity_attempts` RLS-enable statement, explicitly accept or address the `clear_test_accounts` finding, then run the real `supabase db push` (not `--dry-run`) against the currently-linked NEW project to actually create the 44-migration schema — followed by configuring NEW's own Edge Function secrets and deploying `click-backend` to NEW, and only then (in a later phase) beginning the actual student-data migration from OLD.
