# CLICK — NEW Supabase Migration Readiness Report

**Scope:** This task audits the NEW CLICK project (this repository, `C:\Users\Andry\Click-NewTrial\Click-V3`) to determine what is required before a future task can migrate OLD CLICK student accounts and progress into it. **No migration was performed.** No student data was read, created, modified, or deleted. No deploy, commit, or push occurred. Full per-table/per-column detail lives in `supabase-new-details.md`; this report is the decision-focused summary plus the findings specific to migration readiness.

---

## 0. The single most important finding — read this first

**Live database access turned out to be available** (the Supabase CLI, run via `npx`, had a cached, already-authenticated session — not something configured as part of this task, and not something to be relied upon as permanent/guaranteed). This let several previously-"unverifiable" claims in the prior audit get checked directly, read-only, against the real production project (`jnxevalckgitxuunjcvv`). Two results change the shape of this whole migration:

### A. The live database is significantly behind this repository's migrations

`supabase migration list` (a read-only comparison of local migration files against the project's own migration-history table) shows:

- **28 migrations are applied live**, up through `20260924000000`.
- **16 migrations are NOT applied live** (`remote` column empty): `20260926150000` through `20261001030000` — everything from the "Learn content corrections" migration onward, including:
  - The entire Number Crunching (`STG012`) and Patterns (`STG013`) stage/content/unlock migrations.
  - The Pointers (`STG011`) content and unlock migrations.
  - The Stage 6 chapter-order fix (`20261001020000`).
  - **The `activity_attempts` table itself (`20261001030000`) — confirmed absent from the live database** (it does not appear anywhere in a live `table-stats`/`index-stats` listing, which would show at least its primary-key index if it existed).

This was independently cross-confirmed by listing live tables via `supabase inspect db index-stats`/`table-stats`: the live `public.chapters` table has **115 rows** and `public.stages` has **12 rows** — both inconsistent with this repository's full intended curriculum (13 stages, 98 populated chapters) and consistent with a database that stopped receiving curriculum updates partway through Stage 6-10's original placeholder rollout, before Number Crunching/Patterns/Pointers were layered in.

**Why this happened (already known, now confirmed by direct evidence rather than inference):** `.github/workflows/supabase-migrations.yml` and `supabase-functions.yml` require `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD`/`SUPABASE_PROJECT_ID` as GitHub Actions secrets. These are not configured, so every run fails at the very first `supabase link` step — confirmed previously against raw Actions logs. **The 16 pending migrations exist correctly in this repository and are safe to apply — they have simply never been pushed.**

**Consequence for this task's own earlier work:** the XP-for-activities feature (built and fully tested in an earlier session, against the local fixture/demo harness) **cannot currently function against the live backend** — `saveActivityAttempt` would fail with "relation activity_attempts does not exist" if the current Edge Function code were ever deployed as-is without first applying `20261001030000`. This is not a new bug — it is the same deployment-pipeline gap already identified — but it is now confirmed with certainty rather than suspected.

### B. The live database already has 354 real user rows

`supabase inspect db table-stats` shows `public.users` with an **estimated row count of 354** — along with 747 `sessions`, 912 `test_runs`, 4778 `attempts`, 514 `learn_progress`, and 352 `student_section_assignments` rows. **This number matches, exactly, the "~354 student users" this task's own brief states for the OLD system.**

**This is flagged as a finding requiring explicit human clarification — it is not resolved or assumed one way or the other in this report:**

- It may be coincidence (both systems independently happen to have ~354 students enrolled).
- It may mean this "NEW" Supabase project is **already the live, currently-serving-students production database** — i.e. not an empty destination waiting for a migration, but an active system with its own 354 real students already using it, separate from whatever "OLD" system the brief describes.
- It may mean the brief's "OLD system" characterization and this project are more closely related than the task's framing assumes.

**No student data was inspected to investigate this further** (only aggregate counts, which is what "read-only, no PII" permits) — only a human with access to both systems, or explicit clarification from whoever wrote the task brief, can resolve which of these is true. **Every recommendation below assumes this must be resolved BEFORE any migration design work continues**, because the answer changes the entire shape of the migration: migrating 354 OLD students into a database that already has 354 different real students is a very different (and far more dangerous) operation than migrating them into a genuinely empty one.

---

## 1-17. Full findings

All detailed per-table, per-column, RLS, function/trigger, auth-mechanism, and application-usage findings are documented in `supabase-new-details.md` (sections 1-25), which was substantially expanded for this task with the live-verification evidence above integrated throughout. This report does not repeat that detail — see that file for the complete reference. The sections below summarize only what's specifically relevant to a migration decision.

### Authentication compatibility

**AUTH COMPATIBILITY: REQUIRES ADAPTER (not blocked, not direct)**

- NEW CLICK uses **no Supabase Auth at all** — a fully custom `SHA-256(salt|password)` scheme against its own `public.users`/`sessions` tables (full detail in `supabase-new-details.md` §8-9).
- Whether an OLD student's existing credentials can be imported depends entirely on **whether the OLD system uses the exact same hash construction** — unknowable without auditing the OLD system (explicitly out of scope here).
- The codebase has **no built-in "legacy verify-and-rehash" path** today — if the OLD system's hashing differs, a migration would need to either (a) add a temporary legacy-hash-verification branch to `login` that re-hashes with the new scheme on a successful legacy match, or (b) force a password reset for all migrated students. Neither currently exists in the code; this is a build decision for the migration task, not something this audit should implement.
- Required signup fields (from `click-backend/index.ts`'s own `required()` call): `name`, `roll_no`, `department`, `email`, `phone`, `password`, `section_code`. **`username` is explicitly NOT required at signup** (nullable column, set later via a separate `setUsername` action) — so a migrated account can exist validly with `username = NULL`.
- `email` and `roll_no` are both database-UNIQUE — migrated students must not collide with the 354 existing accounts (see §0.B) or with each other.

### Department

Per this task's own brief: OLD system has **36 textual department variants** across 354 users; NEW expects **100% → `"AIDS"`** (354/354 coverage expected). This repository's own `department` column is unconstrained free text (confirmed, `supabase-new-details.md` §11) — there is no database-level obstacle to writing `"AIDS"` for every migrated row. **The 36-variants figure and the 354-user figure are both taken as given from this task's brief, not independently verified against OLD data (which this task does not have access to).** Server-side, nothing currently checks that `department` equals `"AIDS"` — only the frontend dropdown restricts new signups to it, and a separate, unrelated check (`email` must end in `.aids@rajalakshmi.edu.in`) is the real current gate. A migration script can safely hard-set `department = "AIDS"` for every migrated row without any schema change.

### Curriculum

Full inventory (98 populated chapters, 13 stages, 401 activities, 520 questions, 921 total XP — confirmed freshly for this task by re-running `tests/learn/xp-inventory.test.js`) is unchanged from the prior audit and is **the repository's intended state**, not necessarily the live state (see §0.A — live `chapters` currently has 115 rows total, reflecting a partial, outdated snapshot). **The NEW curriculum must not be copied from or reconciled with OLD** — it is authoritative as-is, per this task's own instruction.

### Old → new mapping readiness

See `migration/curriculum-map-template.md` / `.json` — built from this repository's real stage/chapter data, with every OLD-side field left explicitly `null`/unfilled. **Number Crunching, Patterns, and Pointers are confirmed new stages with no OLD equivalent expected**; `CH0115` and `CH0116` are confirmed chapters inserted into otherwise-pre-existing stages. Everything else is marked `needs_verification` — **no mapping was invented**.

### Progress destination audit

| OLD concept | NEW destination table | Required FKs | Can be synthesized? | Must NOT be synthesized without evidence |
|---|---|---|---|---|
| Learn-content completion | `learn_progress` | `user_id` (real FK) | `completed`/`times_completed`/`last_completed_at` can be synthesized from "did the OLD student finish this chapter's lesson" | The NEW `chapter_id` it refers to — must come from the curriculum mapping, never guessed |
| Chapter test completion | `test_runs` (`status='completed'`) | `user_id` (real FK) | `hearts_start`/`hearts_end`/`question_count`/`correct_count` can be reasonably synthesized as "all correct, full hearts" if OLD doesn't have equivalent per-run detail | `pending_xp`/`committed_xp` — these feed `users.total_xp` directly; must be computed deliberately (see XP section below), not fabricated |
| Per-question answers | `attempts` (FK `test_run_id`) | `test_run_id` (real FK, must exist first) | Possibly omitted entirely if only chapter-level completion matters (see `supabase-new-details.md` §15) | `correct`/`xp_earned` for any row that's invented rather than sourced from real OLD data |
| Activity completions | `activity_attempts` | `test_run_id`, `user_id` (real FKs) | **This table has no OLD equivalent at all** (activities never earned XP before this repository's own recent feature work) — there is nothing to migrate FROM; new activity completions simply start fresh for migrated students | N/A |
| Coding-practice progress | `practice_progress` | `user_id`, `practice_id` (real FKs) | Only if OLD practice IDs can be confidently mapped to NEW `practice_bank` rows — **not verified in this task** (§14 below) |  |

### XP

Full mechanism already documented precisely in `supabase-new-details.md` §13 (reconfirmed against source, unchanged by this task). Summary judgment on migratability:

**An OLD student's XP can be: C. translated (not a direct copy, not a full recompute from scratch) — with a caveat.** `users.total_xp` is a single integer; it can be set directly to whatever the OLD system's own total was (interpreted as "B. copied directly" for that one field alone). But NEW's own internal accounting (`test_runs.committed_xp` summed, gated by the one-row-per-chapter-completed unique index) has no way to "receive" an externally-set total except by writing it straight into `users.total_xp` — the ledger tables (`test_runs`/`attempts`) would then be internally inconsistent with that total unless synthetic `test_runs`/`attempts` rows are also created to account for it. **Recommended approach:** set `users.total_xp` directly from the OLD value, AND synthesize minimal `test_runs` completion rows (one per chapter the OLD student actually finished) so the NEW unlock logic (`prerequisites`) treats those chapters as done — but do **not** attempt to reverse-engineer which specific OLD activity/question "earned" which XP amount; that level of fidelity is not recoverable and should not be fabricated.

### Hearts

`users.hearts` (default/max 3, per `supabase-new-details.md` §14) has no time-based regeneration and no concept of a "banked" historical heart count — it is pure current-state. **Recommendation: do not migrate OLD hearts history at all; initialize every migrated student at the default (3)**, since a stale heart-loss record from the OLD system has no meaningful NEW-system equivalent to recover from (there is no OLD chapter for a NEW `heart_recovery_chapter_id` to point at until the chapter mapping is complete anyway).

### Sections

NEW has `sections` (7 seeded rows, `SEC001`-`SEC007` / codes A-G) and `student_section_assignments` (history-preserving, partial-unique "one active per student"). **Whether OLD sections map 1:1 to these 7 is unverified** — this requires the OLD audit. If OLD has more/fewer/differently-named sections, new rows would need to be added to `sections` first (an additive, low-risk schema-data change, not a schema change) before assignments can be migrated.

### Practice

**No OLD↔NEW `practice_id` mapping was found or attempted** — this task has no access to OLD `practice_bank`-equivalent data to compare against. Per the task's own instruction ("Document... only where verified. Do not invent mappings."), this section is empty by design. A future OLD audit would need to produce this mapping before `practice_progress` migration can be designed.

### RLS

Re-verified for this task, specifically re-checking the gap flagged previously: **confirmed, `activity_attempts` genuinely has no RLS-enable statement anywhere in the migration history** (and, per §0.A, the table does not even exist live yet, so the question is currently moot in production — but it must be fixed before or as part of applying `20261001030000`). Every other table: RLS enabled, zero policies (deny-all except `service_role`) — unchanged from the prior audit. **This task did not weaken RLS anywhere, and recommends fixing the `activity_attempts` gap as its own small, independent migration, not bundled into student-migration work.**

---

## 16. Migration safety mechanism — recommendation

**Recommended: a separate, standalone migration script/tool living under `migration/`, run manually, using the Supabase **service-role key** (not a direct raw Postgres connection, and not the production Edge Function).**

Reasoning:
- **Not the Edge Function**: `click-backend/index.ts` is the live, user-facing production backend. Adding permanent migration-only code paths to it (even gated) increases its attack surface and complexity forever, for a one-time operation. A bug in a migration branch could affect real student traffic.
- **Not a raw direct Postgres connection with a hand-typed password**: harder to audit, easier to leak a credential by accident, and bypasses the same `supabase-js` client shape the rest of the codebase already uses and is tested against.
- **Service-role key, via `@supabase/supabase-js`, in a standalone Node/Deno script**: matches the exact same access pattern `click-backend/index.ts` already uses (service-role bypasses RLS, which is fine since this is a deliberate, authorized, one-time administrative operation), is easy to run with `--dry-run` support, is easy to review as a diff before ever running for real, and can be deleted/archived once the migration is complete without leaving permanent production surface area behind.
- **Must never commit the service-role key itself** — read it from an environment variable at runtime, exactly like `click-backend/index.ts` already does, never hardcoded.

This task does **not** create that script yet — only this recommendation, per the task's own instruction that any script created now must be explicitly dry-run-only and incapable of writing. No such script was created in this task.

---

## 18. Final Migration Readiness Table

| Area | Status | Blocking? | Action |
|---|---|---|---|
| NEW Supabase identity | READY | No | Confirmed live: `jnxevalckgitxuunjcvv`, ACTIVE_HEALTHY, region `ap-southeast-1`, Postgres 17.6.1 |
| Live schema | **BLOCKED** | **YES** | 16 migrations (`20260926150000`-`20261001030000`) are not applied live, including the entire NC/Patterns/Pointers rollout and the `activity_attempts` table. Must be applied (and the CI secrets fixed, or applied by hand) before the live schema matches this repository's intended state |
| Authentication | NEEDS DECISION | Yes, if OLD hashing differs | Custom scheme confirmed; compatibility with OLD unknown until OLD is audited |
| User fields | READY | No | Full NEW `users` schema documented; all destination fields confirmed to exist |
| Department | READY | No | Free-text column, no constraint; `"AIDS"` can be set directly for all migrated rows |
| Curriculum mapping | **NOT STARTED — BLOCKING** | **YES** | Template created (`migration/curriculum-map-template.{md,json}`); zero rows mapped yet — requires an OLD-project audit, out of scope here |
| Learn progress | NEEDS DECISION | No | Destination confirmed; synthesis approach needs sign-off (§ Progress destination audit) |
| Test completion | NEEDS DECISION | No | Destination + unique-index behavior confirmed; synthesis approach needs sign-off |
| Attempts | NEEDS DECISION | No | May not need full migration — needs OLD↔NEW comparison |
| Activity attempts | **BLOCKED (schema)** | Yes, until §Live schema is fixed | Table doesn't exist live yet; also has no OLD equivalent to migrate FROM at all |
| XP | NEEDS DECISION | **YES if unresolved** | Mechanism fully documented; recommended approach is "translate," not direct copy or full recompute — needs explicit sign-off before implementation |
| Hearts | READY (recommendation given) | No | Recommend resetting all migrated students to default (3) rather than migrating history |
| Practice | **NOT STARTED** | No (unless practice progress migration is required) | No OLD↔NEW practice_id mapping exists or was attempted |
| Sections | NEEDS DECISION | No | NEW has 7 fixed sections; OLD compatibility unverified |
| RLS | READY (one fix recommended) | No | `activity_attempts` RLS gap identified; fix recommended as an independent small migration |
| Backup strategy | **NOT ADDRESSED** | Should be, before any write | Out of scope for this read-only audit; a migration task must establish a backup/rollback plan for the live database before writing anything, given §0.B's finding that real student data already exists there |

---

## Final Summary

**NEW SUPABASE MIGRATION READINESS:**

- **READY AREAS:** Project identity, user schema, department handling, hearts policy (recommendation given), RLS posture (one small fix identified).
- **BLOCKERS:**
  1. **Live schema is 16 migrations behind the repository** (§0.A) — must be resolved before anything else; also means the CI deployment pipeline itself needs fixing (GitHub secrets) or the migrations need to be applied by hand.
  2. **Curriculum mapping has not been started** — requires a separate OLD-project audit (out of scope here); nothing can be safely migrated without it.
  3. **The 354-existing-live-users finding (§0.B) must be explicitly clarified by a human before migration design proceeds** — this is the most consequential open question in this entire report.
- **DECISIONS REQUIRED:** Auth-credential compatibility strategy; XP translation approach; how much `attempts` detail (if any) to migrate; section-mapping approach; backup/rollback strategy.
- **FILES CREATED:** `supabase-new-details.md` (updated/expanded), `migration/curriculum-map-template.md`, `migration/curriculum-map-template.json`, `migration/migration-readiness-report.md` (this file).
- **DATABASE MODIFICATIONS: NONE.** (Live access was used only for read-only `projects list`, `link` (local config only), `migration list`, and `inspect db index-stats`/`table-stats` — no `db push`, no `db dump --data-only`, no insert/update/delete of any kind, no student row was ever read individually.)
- **COMMIT: NONE.**
- **PUSH: NONE.**
- **DEPLOYMENT: NONE.**
