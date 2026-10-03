# Click-NewTrial / Click V2
# New Supabase Project Details

**Mode:** Read-only discovery and migration-readiness audit. Initially built from static repository analysis only; **later extended with limited, read-only LIVE verification** once a usable, already-authenticated Supabase CLI session was found to be available (via `npx supabase`, run read-only: `projects list`, `link` (local config only, does not alter the remote project), `migration list`, and `inspect db index-stats`/`table-stats`). No `db push`, no data-only dump, no insert/update/delete, and no individual student row was ever read — only aggregate counts and schema/migration metadata. Where live evidence and repository-derived inference disagreed, live evidence is authoritative and is called out explicitly (see §0 below and §30). No Supabase data was modified. No student PII appears anywhere in this document.

---

## 0. Critical live-verification findings (read this first)

### 0.A — The live database is 16 migrations behind this repository

`supabase migration list` (read-only; compares local migration files against the project's own migration-history table) confirms: **28 migrations are applied live, through `20260924000000`.** **16 migrations are NOT applied live**: every file from `20260926150000` onward, including —

- The entire Number Crunching (`STG012`) and Patterns (`STG013`) stage/content/unlock migrations.
- The Pointers (`STG011`) content and unlock migrations.
- The Stage 6 chapter-order fix (`20261001020000`).
- **`activity_attempts` (`20261001030000`) — confirmed absent from the live database.** `supabase inspect db index-stats`/`table-stats` list every live table's indexes; `activity_attempts_pkey` does not appear anywhere, confirming the table itself does not exist live (every other table's primary-key index does appear).

Cross-confirmed by live row counts: `public.stages` = **12** rows, `public.chapters` = **115** rows live — inconsistent with this repository's full intended curriculum (13 stages, 98 populated chapters; see §17), consistent with a database frozen partway through the Stage 6-10 placeholder rollout, before Number Crunching/Patterns/Pointers content was layered in.

**Root cause (confirmed, not inferred):** the GitHub Actions secrets `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD`/`SUPABASE_PROJECT_ID` required by `.github/workflows/supabase-migrations.yml`/`supabase-functions.yml` are not configured — every workflow run fails at the first `supabase link` step. The 16 pending migrations are themselves correct and ready; they have simply never been pushed.

**Practical consequence:** the activity-XP feature built in this repository (see §13) cannot function against the live backend yet — `saveActivityAttempt` would fail with "relation does not exist" if the current Edge Function code were deployed without first applying `20261001030000`.

### 0.B — The live database already has 354 real user rows

`supabase inspect db table-stats` shows `public.users` with an estimated **354** rows live, alongside 747 `sessions`, 912 `test_runs`, 4778 `attempts`, 514 `learn_progress`, 352 `student_section_assignments`. **This project is not an empty destination waiting for data — it is an active database, already serving real students, on a schema that is 16 migrations behind this repository.**

**This number was not independently chosen — it exactly matches a "~354 student users" figure given elsewhere as describing a separate OLD system.** Whether that is coincidence, or whether it means this NEW project and that OLD description are more closely related than assumed, **is not resolved in this document and must not be guessed at.** No individual user row was read to investigate further (only the aggregate count, which read-only/no-PII discovery permits). This is flagged as the single most consequential open question for any future migration work.

---

---

## 1. Project Identity

| Field | Value |
|---|---|
| Project name | CLICK (the live Click-NewTrial / Click V2 production project) |
| Project ref | `jnxevalckgitxuunjcvv` |
| Project URL (functions) | `https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend` |
| Dashboard | `https://supabase.com/dashboard/project/jnxevalckgitxuunjcvv` |
| Region | **`ap-southeast-1`** — confirmed live via `supabase projects list` |
| Database engine/version | **Postgres 17.6.1** (engine `17`, release channel `ga`) — confirmed live |
| Project status | **`ACTIVE_HEALTHY`** — confirmed live |
| Organization | `irlfjfrakudsubapedys` (shown as "darshansathish2006's Project") — confirmed live |
| Created | 2026-09-04 — confirmed live |
| Current environment | Production (single environment — no staging/dev project reference found anywhere) |
| Repository branch/environment that uses it | `main` (via `.github/workflows/supabase-migrations.yml` / `supabase-functions.yml`, both triggered only on push to `main`); the `unified-chapter-experience` development branch targets the same project ref through the same `config.toml` — there is only one configured project, used by both branches |

### Multiple Supabase references found — classified

| Project ref | Classification | Evidence |
|---|---|---|
| `jnxevalckgitxuunjcvv` | **CURRENT NEW SUPABASE** (the one this app actually uses) | `supabase/config.toml:13` (`project_id = "jnxevalckgitxuunjcvv"`); identical value hardcoded in `index.html`'s `BACKEND_URL`; confirmed in `supabase/supabase_details.md` as verified against the live app's `BACKEND_URL`, explicitly as the project to use, not REC-ACADEMIC |
| `zwdmredbjktvecvpfurx` ("REC-ACADEMIC") | **UNKNOWN/UNUSED — explicitly a mistake, per repo documentation** | `supabase/supabase_details.md`, "Important: the 'REC-ACADEMIC' mix-up" section: GitHub's Dashboard-native GitHub integration was connected to this *different, unrelated* project by mistake. **Note:** live `supabase projects list` (same account) shows a project literally named "REC Academic" under ref **`kuzjdhvyvsgiweayrarg`** — a *different* ref than the one named in the repo's own documentation. Either the project was recreated under a new ref at some point, there are two separate REC-Academic projects, or the documented ref was itself slightly wrong. Not investigated further (genuinely out of scope) — flagged here only so it isn't mistaken for a typo in this document. |
| `dagviuixvbtojmfufouw` ("titans") | **UNKNOWN/UNUSED — not mentioned anywhere in this repository** | Found live via `supabase projects list` (same account/organization, region `ap-northeast-2`, created 2026-09-28). No reference to this project exists anywhere in the codebase. Flagged for completeness; not investigated further. |

There is no evidence anywhere in the repository of an "OLD SUPABASE" project reference — the old project (the one this task's *future* migration will read FROM) is not configured, linked, or referenced in this codebase at all. Its identity, schema, and connection details will need to come from wherever that old project/app's own repository or credentials live — **outside the scope of this document** (see §30).

---

## 2. Repository Integration

The application talks to Supabase in exactly one way: the frontend (`index.html`, the VS Code extension, the desktop Electron wrapper) makes plain `fetch()` POST requests to a single Edge Function, `click-backend`, passing an `action` name and a JSON payload. There is no direct `@supabase/supabase-js` client use anywhere in the frontend — all `createClient`/database access happens exclusively inside the Edge Function (`supabase/functions/click-backend/index.ts`), which runs under the **service-role key** and is the only thing that ever talks to Postgres directly.

```
Browser / VS Code extension / Desktop app
        │  fetch(BACKEND_URL, { body: { action, ...payload } })
        ▼
Supabase Edge Function: click-backend (Deno, service-role key)
        │  supabase.from("<table>")...   (no .rpc() calls anywhere)
        ▼
Postgres (public schema only — no auth.*, no storage.* usage)
```

No `.rpc()` calls exist anywhere in `click-backend/index.ts` (confirmed by exhaustive grep) — every single piece of data access is a plain `supabase.from(table)` call. There are no Postgres functions or triggers in the database at all (see §20, §21) — **100% of business logic (auth, XP, hearts, unlocking, grading, staff dashboards) lives in this one Deno Edge Function**, not in the database.

---

## 3. Environment Variables

No secret *values* appear below — only variable names, where each is read, where it is configured (as discoverable from the repo), and whether it is a secret or a public value.

### 3.1 Frontend

| Variable / constant | Read at | Configured at | Kind |
|---|---|---|---|
| `SUPABASE_ANON_KEY` | Hardcoded literal constant in `index.html` (~line 1277) | Hand-pasted into `index.html` | Public (Supabase's anon/publishable key — intended to ship to browsers) |
| `BACKEND_URL` | Hardcoded default in `index.html` (~line 1276): `https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend`; overridable via `window.AndroidBridge.getBackendUrl()` or `localStorage.getItem('clickBackendUrl')` | Hardcoded in `index.html`; same pattern duplicated in `vscode-extension/package.json` (config default), `admin-tools/reset-student-password.ps1`, `admin-tools/build-content-migration.js` | Public (project ref + function path; not sensitive) |

No `.env` or `.env.example` file exists anywhere in the repository (confirmed). `wrangler.jsonc` (repo root) is pure Cloudflare Workers static-asset config and contains no Supabase configuration at all.

### 3.2 Backend (Edge Function runtime)

| Variable | Read at | Configured at | Kind |
|---|---|---|---|
| `SUPABASE_URL` | `Deno.env.get("SUPABASE_URL")!` in `click-backend/index.ts` | Auto-injected by the Supabase Edge Function runtime for every deployed function (standard Supabase platform behavior, not a repo-managed secret) | Not secret (same value as the public project URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | `Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!` in `click-backend/index.ts` | Must be set as an Edge Function secret in the live Supabase project (Dashboard → Edge Functions → Secrets, or `supabase secrets set`). **Not present anywhere in this repository** (confirmed — good). | **Secret.** Full-privilege service-role key; bypasses RLS entirely. "Configured externally — value intentionally omitted." |
| `ADMIN_RESET_KEY` | `click-backend/index.ts`, gates the `adminGetMaxIds`, `adminResetPassword`, `adminUpsertStaff` actions | Must be set as an Edge Function secret. Locally referenced (never printed) by `admin-tools/reset-student-password.ps1` (prompts the operator interactively) and expected in a gitignored `admin-tools/.admin-key` file read by `admin-tools/build-content-migration.js`. | **Secret.** A bespoke, app-defined admin-bypass key (not a Supabase-provided credential). "Configured externally — value intentionally omitted." |

### 3.3 Deployment

| Variable | Used by | Configured at | Kind |
|---|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | `.github/workflows/supabase-functions.yml`, `supabase-migrations.yml` | Intended GitHub Actions repository secret (documented in `supabase/supabase_details.md`). **Confirmed NOT configured** — every workflow run observed in Actions history fails immediately at the `supabase link` step with this value empty (see §30 for how this was verified). | **Secret** (Supabase personal access token / management API) |
| `SUPABASE_DB_PASSWORD` | `.github/workflows/supabase-migrations.yml` | Same — GitHub Actions secret, documented, **not configured**. | **Secret** (Postgres database password) |
| `SUPABASE_PROJECT_ID` | Both Supabase workflows | GitHub Actions secret, documented, **not configured**. Value would be `jnxevalckgitxuunjcvv` (non-sensitive — already public in `BACKEND_URL` — stored as a secret only for convenience/non-duplication, per the project's own doc). | Non-sensitive identifier |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | `.github/workflows/cloudflare-frontend.yml` | GitHub Actions secrets | **Secrets**, but unrelated to Supabase — deploys the static frontend only. Flagged for completeness since this workflow lives alongside the Supabase ones. |

**Important safety finding (see §30 for full detail): because `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD`/`SUPABASE_PROJECT_ID` are all unconfigured, every push to `main` that touches `supabase/migrations/**` or `supabase/functions/**` triggers these workflows, but they fail at the very first step (`supabase link`) before ever reaching `supabase db push` or `supabase functions deploy`. Confirmed directly against GitHub Actions run history and raw logs: every relevant run shows `completed / failure`, and the log shows `SUPABASE_ACCESS_TOKEN:`, `SUPABASE_DB_PASSWORD:`, `SUPABASE_PROJECT_ID:` as empty strings at the `actions/checkout` step. No migration has ever actually been pushed to the live database by this pipeline, and no Edge Function deploy has ever actually succeeded through it.** This means **the live Supabase project's actual current schema state may lag behind what `supabase/migrations/` describes** — see §30.

---

## 4. Database Schemas

| Schema | Used? | Evidence |
|---|---|---|
| `public` | **Yes — exclusively.** All 28 application tables live here. | Every `create table` statement across `schema.sql`/migrations |
| `auth` | **No.** Never referenced. | Exhaustive repo-wide grep for `auth.`, `schema auth` returned zero matches in `supabase/`; confirmed independently by both audits performed for this document |
| `storage` | **No.** Never referenced. | Exhaustive grep for `storage.`/`supabase.storage` returned zero matches (excluding unrelated JS variables/comments literally named "storage" describing simulated C-program memory in the teaching content, and `localStorage`/`sessionStorage` browser APIs) |
| `graphql_public` | Declared in `config.toml`'s `[api] schemas` list (Supabase CLI default), but never used by the application — no GraphQL queries anywhere in the repo | `config.toml` |
| Extensions schema | No extension is ever created (`create extension` — zero matches across the whole repo) | — |

**Summary: this is a plain, single-schema (`public`) Postgres application with no Supabase Auth, no Supabase Storage, and no Postgres extensions.**

---

## 5. Tables

All 28 tables are in `public`. RLS is **enabled** on 27 of them (see §19 for the one exception) with **zero policies defined anywhere** — meaning `anon`/`authenticated` roles are denied all access by default, and only `service_role` (used exclusively by the Edge Function) can read or write any row. No table has a trigger. No table has a CHECK constraint. No table uses a UUID/identity primary key except one (`question_terms.id`); every other primary key is an application-generated `text` string.

| # | Table | Purpose (one line) |
|---|---|---|
| 1 | `stages` | Top-level curriculum units (e.g. Loops, Arrays) |
| 2 | `chapters` | Sub-units of a stage; the scope of one Learn + test run |
| 3 | `learn_content` | Lesson text/pages for a chapter |
| 4 | `questions` | Quiz/test questions per chapter |
| 5 | `options` | Multiple-choice options for a question |
| 6 | `test_hints` | Ordered hint text(s) for a question |
| 7 | `glossary` | Programming-term glossary entries |
| 8 | `question_terms` | Join: which glossary terms a question's text should highlight |
| 9 | `practice_bank` | VS Code "Practice" coding challenges |
| 10 | `practice_tests` | Input/expected-output test cases for a practice challenge |
| 11 | `practice_mistakes` | Pattern-based mistake-feedback rules for a practice challenge |
| 12 | `announcements` | Global (untargeted) announcements |
| 13 | `kabi_phrases` | Short flavor-text phrases (exact UI usage not confirmed — see §30) |
| 14 | `prerequisites` | Generic polymorphic unlock-graph edges (stage/chapter/practice) |
| 15 | `settings` | Global key/value app configuration |
| 16 | `users` | **The app's own student account table** — not `auth.users` |
| 17 | `sessions` | Student login sessions (custom token auth) |
| 18 | `learn_progress` | Per-student, per-chapter Learn-tab completion |
| 19 | `test_runs` | One row per chapter-test attempt |
| 20 | `attempts` | One row per individual question-answer attempt |
| 21 | `practice_progress` | Per-student progress on a practice challenge |
| 22 | `practice_pairings` | VS Code device-pairing records |
| 23 | `staff_users` | Staff/admin accounts (deliberately separate from `users`) |
| 24 | `staff_sessions` | Staff login sessions |
| 25 | `sections` | Class/section groupings (Section A–G) |
| 26 | `student_section_assignments` | Student ↔ section links, with history preserved |
| 27 | `staff_messages` | Targeted one-to-one staff → student messages |
| 28 | `activity_attempts` | XP tracking for Learn "activity" completions (newest table, added for this session's XP feature) |

---

## 6. Column Definitions

Full per-table column documentation (type, nullable, default, PK/FK/unique, purpose) is given table-by-table below. Where a purpose could not be conclusively determined from repository evidence, it is marked explicitly rather than guessed.

### 6.1 `stages`
PK: `stage_id`. No FKs.

| Column | Type | Null | Default | PK/FK/Unique | Purpose |
|---|---|---|---|---|---|
| stage_id | text | NOT NULL | — | PK | Stable string ID, e.g. `STG001` |
| stage_no | integer | NULL | — | | Display number ("Stage N") |
| title | text | NOT NULL | — | | Stage name |
| order | integer | NOT NULL | 0 | | Sort order (not always equal to stage_no — stages were reordered as new content was inserted between existing ones) |
| active | boolean | NOT NULL | true | | Soft-delete / visibility flag |

### 6.2 `chapters`
PK: `chapter_id`. FK: `stage_id → stages.stage_id` (ON DELETE CASCADE).

| Column | Type | Null | Default | PK/FK/Unique | Purpose |
|---|---|---|---|---|---|
| chapter_id | text | NOT NULL | — | PK | e.g. `CH0031` |
| stage_id | text | NOT NULL | — | FK | Parent stage |
| chapter_no | integer | NULL | — | | Display number within its stage |
| title | text | NOT NULL | — | | Chapter name |
| order | integer | NOT NULL | 0 | | Sort order within stage |
| active | boolean | NOT NULL | true | | |
| question_limit | integer | NULL | — | | Per-chapter override of the global `QUESTIONS_PER_CHAPTER` setting; NULL = use the global default |

### 6.3 `learn_content`
PK: `learn_id`. FKs: `stage_id → stages`, `chapter_id → chapters` (both CASCADE).

| Column | Type | Null | Default | Purpose |
|---|---|---|---|---|
| learn_id | text | NOT NULL | — | PK |
| stage_id | text | NOT NULL | — | |
| chapter_id | text | NOT NULL | — | |
| title | text | NULL | — | |
| pages_text | text | NULL | — | The actual lesson content shown in the Learn tab |
| active | boolean | NOT NULL | true | |
| updated_at | timestamptz | NOT NULL | now() | |

### 6.4 `questions`
PK: `question_id`. FKs: `stage_id → stages`, `chapter_id → chapters` (both CASCADE).

| Column | Type | Null | Default | Purpose |
|---|---|---|---|---|
| question_id | text | NOT NULL | — | PK, e.g. `Q000151` |
| stage_id | text | NOT NULL | — | |
| chapter_id | text | NOT NULL | — | |
| type | text | NOT NULL | 'MCQ' | Free-text, no enum/CHECK. Observed historical values: `MCQ`, `TYPE_CODE`, `CODE_FILL`, `BLANK`, `MATCH_FOLLOWING`. **The complete live value set cannot be confirmed from SQL alone** — see §30. |
| prompt | text | NULL | — | |
| code | text | NULL | — | |
| answer | text | NULL | — | |
| explanation | text | NULL | — | |
| hint | text | NULL | — | |
| xp | integer | NOT NULL | 1 | XP awarded for a correct answer, clamped 1-2 server-side (`Math.min(2, Math.max(1, xp||1))`); every live row observed in migrations is exactly `1` |
| order | integer | NOT NULL | 0 | |
| active | boolean | NOT NULL | true | |

### 6.5 `options`
PK: `option_id`. FK: `question_id → questions` (CASCADE).

| Column | Type | Null | Default |
|---|---|---|---|
| option_id | text | NOT NULL | — (PK) |
| question_id | text | NOT NULL | — |
| option_text | text | NULL | — |
| order | integer | NOT NULL | 0 |
| active | boolean | NOT NULL | true |

### 6.6 `test_hints`
PK: `hint_id`. FK: `question_id → questions` (CASCADE). Supports multiple ordered hints per question, distinct from the single `questions.hint` column.

| Column | Type | Null | Default |
|---|---|---|---|
| hint_id | text | NOT NULL | — (PK) |
| question_id | text | NOT NULL | — |
| hint_text | text | NULL | — |
| active | boolean | NOT NULL | true |
| order | integer | NOT NULL | 0 |

### 6.7 `glossary`
PK: `term_id`. No FKs.

| Column | Type | Null | Default |
|---|---|---|---|
| term_id | text | NOT NULL | — (PK) |
| term | text | NOT NULL | — |
| definition | text | NULL | — |
| color | text | NULL | — (hex color for UI tooltip highlight) |
| aliases | text | NULL | — |
| active | boolean | NOT NULL | true |

### 6.8 `question_terms`
PK: `id` (the **only** surrogate/identity PK in the whole schema). FKs: `question_id → questions`, `term_id → glossary` (both CASCADE).

| Column | Type | Null | Default |
|---|---|---|---|
| id | bigint | NOT NULL | generated always as identity (PK) |
| question_id | text | NOT NULL | — |
| term_id | text | NOT NULL | — |
| display_text | text | NULL | — |
| order | integer | NOT NULL | 0 |
| active | boolean | NOT NULL | true |

### 6.9 `practice_bank`
PK: `practice_id`. FK: `stage_id → stages` (CASCADE, **nullable** — see §30 finding).

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| practice_id | text | NOT NULL | — | PK |
| stage_id | text | **NULL** | — | Originally NOT NULL; relaxed to nullable to support a since-removed "Experiments" feature (see below) |
| title | text | NULL | — | |
| objective | text | NULL | — | |
| problem_statement | text | NULL | — | |
| constraints | text | NULL | — | |
| sample_input | text | NULL | — | |
| sample_output | text | NULL | — | |
| starter_code | text | NULL | — | |
| hint_1 / hint_2 / hint_3 | text | NULL | — | |
| success_message | text | NULL | — | |
| technique_after_success | text | NULL | — | |
| order | integer | NOT NULL | 0 | |
| active | boolean | NOT NULL | true | |
| difficulty | text | NULL | — | Added for a removed "Experiments" feature; per migration comment, still actively used by Stage 0-5 practice questions |
| marks | integer | NULL | — | Same as above |
| time_limit_seconds | integer | NULL | — | Same as above |
| memory_limit_mb | integer | NULL | — | Same as above |
| workspace_folder | text | NULL | — | Same as above |
| experiment_number | integer | NULL | — | Per migration comment, this one specifically is now **permanently unused/vestigial** |
| input_format | text | NULL | — | Per migration comment, still actively used |
| output_format | text | NULL | — | Per migration comment, still actively used |

### 6.10 `practice_tests`
PK: `test_id`. FK: `practice_id → practice_bank` (CASCADE).

| Column | Type | Null | Default |
|---|---|---|---|
| test_id | text | NOT NULL | — (PK) |
| practice_id | text | NOT NULL | — |
| name | text | NULL | — |
| input | text | NULL | — |
| expected_output | text | NULL | — |
| hidden | boolean | NOT NULL | false |
| timeout_ms | integer | NULL | 5000 |
| active | boolean | NOT NULL | true |
| order | integer | NOT NULL | 0 |

### 6.11 `practice_mistakes`
PK: `mistake_id`. FK: `practice_id → practice_bank` (CASCADE).

| Column | Type | Null | Default |
|---|---|---|---|
| mistake_id | text | NOT NULL | — (PK) |
| practice_id | text | NOT NULL | — |
| rule_type | text | NULL | 'source_regex' |
| pattern | text | NULL | — |
| message | text | NULL | — |
| order | integer | NOT NULL | 0 |
| active | boolean | NOT NULL | true |

### 6.12 `announcements`
PK: `announcement_id`. No FKs.

| Column | Type | Null | Default |
|---|---|---|---|
| announcement_id | text | NOT NULL | — (PK) |
| title | text | NULL | — |
| message | text | NULL | — |
| category | text | NULL | — |
| active | boolean | NOT NULL | true |
| publish_date | date | NULL | — |
| expire_date | date | NULL | — |

### 6.13 `kabi_phrases`
PK: `phrase_id`. No FKs. **Purpose: "Not determined from current repository/database evidence"** beyond the inference that these are short flavor-text/mascot phrases — the exact UI consumption point was not located with certainty.

| Column | Type | Null | Default |
|---|---|---|---|
| phrase_id | text | NOT NULL | — (PK) |
| category | text | NULL | — |
| phrase | text | NOT NULL | — |
| active | boolean | NOT NULL | true |

### 6.14 `prerequisites`
PK: composite (`target_id`, `prerequisite_id`). **Intentionally no FKs** — the schema's own comment states `target_id`/`prerequisite_id` are polymorphic (can point at a stage, chapter, or practice id), so a foreign key would be incorrect.

| Column | Type | Null | Default |
|---|---|---|---|
| target_id | text | NOT NULL | — (PK part) |
| prerequisite_id | text | NOT NULL | — (PK part) |
| condition | text | NULL | 'completed' |
| description | text | NULL | — |
| active | boolean | NOT NULL | true |

### 6.15 `settings`
PK: `key`. No FKs. Known keys referenced in application code: `QUESTIONS_PER_CHAPTER`, `UNIFIED_MAX_QUESTIONS`, `SESSION_HOURS`, `MIN_PASSWORD_LENGTH`, `DEFAULT_HEARTS` (names confirmed from `click-backend/index.ts` usage; the full live key set is not confirmable from SQL migrations alone since rows are inserted via application/admin tooling, not just migrations).

| Column | Type | Null | Default |
|---|---|---|---|
| key | text | NOT NULL | — (PK) |
| value | text | NULL | — |
| description | text | NULL | — |

### 6.16 `users` — the app's own account table (NOT `auth.users`)
PK: `user_id`. No FKs (does not reference `auth.users` — there is no relationship to Supabase Auth anywhere).

| Column | Type | Null | Default | Unique? | Purpose |
|---|---|---|---|---|---|
| user_id | text | NOT NULL | — | PK | |
| name | text | NOT NULL | — | | |
| roll_no | text | NOT NULL | — | **UNIQUE** | |
| department | text | NULL | — | | Free-text; see §11 |
| email | text | NOT NULL | — | **UNIQUE** | Also has a separate case-insensitive functional index (`lower(email)`) for login lookups |
| phone | text | NULL | — | | |
| password_hash | text | NOT NULL | — | | SHA-256(`salt|password`) — custom, not Supabase Auth |
| password_salt | text | NOT NULL | — | | Random per-account salt (`crypto.randomUUID()`-derived) |
| joined_at | timestamptz | NOT NULL | now() | | |
| last_login | timestamptz | NULL | — | | |
| last_logout | timestamptz | NULL | — | | |
| total_xp | integer | NOT NULL | 0 | | Authoritative, persisted total; see §13 |
| streak | integer | NOT NULL | 0 | | |
| current_stage | text | NULL | — | | |
| current_chapter | text | NULL | — | | |
| hearts | integer | NOT NULL | 3 | | See §14 |
| tests_completed | integer | NOT NULL | 0 | | |
| questions_attempted | integer | NOT NULL | 0 | | |
| correct_answers | integer | NOT NULL | 0 | | |
| accuracy_percent | numeric(5,2) | NOT NULL | 0 | | |
| onboarding_completed | boolean | NOT NULL | false | | |
| status | text | NOT NULL | 'active' | | Gates login (`login` rejects non-`active` accounts) |
| stages_completed | integer | NOT NULL | 0 | | |
| last_completed_stage | text | NULL | — | | |
| last_learn_stage | text | NULL | — | | |
| last_learn_chapter | text | NULL | — | | |
| heart_recovery_stage_id | text | NULL | — | | Which chapter's review would refill a lost heart |
| heart_recovery_chapter_id | text | NULL | — | | |
| role | text | NOT NULL | 'student' | | Per migration comment: "has only ever held 'student' and is not read anywhere for authorization" — staff authorization is entirely separate (see `staff_users`) |
| username | text | NULL | — | **UNIQUE** | Display name for leaderboard; NULL = student must still choose one (added later migration) |

### 6.17 `sessions`
PK: `session_id`. FK: `user_id → users` (CASCADE).

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| session_id | text | NOT NULL | — | PK |
| session_token | text | NOT NULL | — | **UNIQUE** (column-level) |
| user_id | text | NOT NULL | — | FK |
| login_time | timestamptz | NOT NULL | now() | |
| last_seen | timestamptz | NOT NULL | now() | |
| logout_time | timestamptz | NULL | — | |
| device | text | NULL | — | |
| active | boolean | NOT NULL | true | |
| duration_sec | integer | NULL | — | |

### 6.18 `learn_progress`
PK: `learn_progress_id`. FK: `user_id → users` (CASCADE). `stage_id`/`chapter_id` are plain `text`, **not** foreign keys (see §22).

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| learn_progress_id | text | NOT NULL | — | PK |
| user_id | text | NOT NULL | — | FK |
| stage_id | text | NOT NULL | — | no FK |
| chapter_id | text | NOT NULL | — | no FK |
| times_completed | integer | NOT NULL | 0 | |
| last_completed_at | timestamptz | NULL | — | |
| pages_viewed | integer | NULL | 0 | |
| completed | boolean | NOT NULL | false | |
| updated_at | timestamptz | NOT NULL | now() | |
| **UNIQUE (user_id, chapter_id)** | | | | one row per student per chapter |

### 6.19 `test_runs`
PK: `test_run_id`. FK: `user_id → users` (CASCADE).

| Column | Type | Null | Default |
|---|---|---|---|
| test_run_id | text | NOT NULL | — (PK) |
| user_id | text | NOT NULL | — |
| stage_id | text | NOT NULL | — (no FK) |
| chapter_id | text | NOT NULL | — (no FK) |
| started_at | timestamptz | NOT NULL | now() |
| finished_at | timestamptz | NULL | — |
| status | text | NOT NULL | 'active' |
| hearts_start | integer | NULL | — |
| hearts_end | integer | NULL | — |
| pending_xp | integer | NOT NULL | 0 |
| committed_xp | integer | NOT NULL | 0 |
| correct_count | integer | NOT NULL | 0 |
| question_count | integer | NOT NULL | 0 |
| attempt_no | integer | NOT NULL | 1 |

`status` free-text values observed: `active`, `completed`, `completed_repeat`, and `failed` (used when hearts reach zero). See §22 for the critical partial-unique index on this table.

### 6.20 `attempts`
PK: `attempt_id`. FKs: `user_id → users` (CASCADE), `test_run_id → test_runs` (CASCADE). `question_id` is plain `text`, **not** a foreign key to `questions`.

| Column | Type | Null | Default |
|---|---|---|---|
| attempt_id | text | NOT NULL | — (PK) |
| user_id | text | NOT NULL | — |
| stage_id | text | NOT NULL | — (no FK) |
| chapter_id | text | NOT NULL | — (no FK) |
| question_id | text | NOT NULL | — (no FK) |
| question_attempt_no | integer | NOT NULL | 1 |
| answer | text | NULL | — |
| correct | boolean | NOT NULL | false |
| hearts_before | integer | NULL | — |
| hearts_after | integer | NULL | — |
| xp_earned | integer | NOT NULL | 0 |
| response_ms | integer | NULL | — |
| device | text | NULL | — |
| attempted_at | timestamptz | NOT NULL | now() |
| test_run_id | text | NOT NULL | — |
| question_xp | integer | NOT NULL | 0 |
| xp_committed | boolean | NOT NULL | false |

### 6.21 `practice_progress`
PK: `progress_id`. FKs: `user_id → users` (CASCADE), `practice_id → practice_bank` (CASCADE).

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| progress_id | text | NOT NULL | — | PK |
| user_id | text | NOT NULL | — | |
| practice_id | text | NOT NULL | — | |
| stage_id | text | NOT NULL | — (no FK) | |
| status | text | NOT NULL | 'in_progress' | |
| attempt_count | integer | NOT NULL | 0 | |
| last_result | text | NULL | — | |
| completed_at | timestamptz | NULL | — | |
| updated_at | timestamptz | NOT NULL | now() | |
| **UNIQUE (user_id, practice_id)** | | | | |

### 6.22 `practice_pairings`
PK: `pairing_id`. FK: `user_id → users` (CASCADE).

| Column | Type | Null | Default |
|---|---|---|---|
| pairing_id | text | NOT NULL | — (PK) |
| pair_code | text | NULL | — (no DB-level uniqueness — see §22) |
| user_id | text | NOT NULL | — |
| status | text | NOT NULL | 'pending' |
| created_at | timestamptz | NOT NULL | now() |
| expires_at | timestamptz | NULL | — |
| device_name | text | NULL | — |
| device_token_hash | text | NULL | — |
| connected_at | timestamptz | NULL | — |
| last_seen | timestamptz | NULL | — |

### 6.23 `staff_users`
PK: `staff_id`. No FKs. Deliberately separate identity table from `users` (migration comment: `users.role` "has only ever held 'student' and is not read anywhere for authorization").

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| staff_id | text | NOT NULL | — | PK |
| name | text | NOT NULL | — | |
| email | text | NOT NULL | — | **UNIQUE** via a case-insensitive functional index on `lower(email)` only (no plain column-level unique constraint — differs from `users.email`'s pattern) |
| password_hash | text | NOT NULL | — | |
| password_salt | text | NOT NULL | — | |
| role | text | NOT NULL | 'STAFF' | |
| active | boolean | NOT NULL | true | |
| created_at | timestamptz | NOT NULL | now() | |
| last_login_at | timestamptz | NULL | — | |
| last_logout_at | timestamptz | NULL | — | |

### 6.24 `staff_sessions`
PK: `session_id`. FK: `staff_id → staff_users` (CASCADE).

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| session_id | text | NOT NULL | — | PK |
| session_token | text | NOT NULL | — | **UNIQUE** via a named index only (no column-level constraint — differs from `sessions.session_token`) |
| staff_id | text | NOT NULL | — | |
| login_time | timestamptz | NOT NULL | now() | |
| last_seen | timestamptz | NOT NULL | now() | |
| logout_time | timestamptz | NULL | — | |
| device | text | NULL | — | |
| active | boolean | NOT NULL | true | |

### 6.25 `sections`
PK: `section_id`. No FKs. Seeded with 7 rows (SEC001–SEC007, codes A–G, capacity 65 each).

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| section_id | text | NOT NULL | — | PK |
| section_code | text | NOT NULL | — | **UNIQUE** |
| section_name | text | NOT NULL | — | |
| capacity | integer | NOT NULL | 65 | |
| active | boolean | NOT NULL | true | |
| order | integer | NOT NULL | 0 | |
| created_at | timestamptz | NOT NULL | now() | |

### 6.26 `student_section_assignments`
PK: `assignment_id`. FKs: `student_id → users` (CASCADE), `section_id → sections` (CASCADE), `assigned_by → staff_users` (**NO ACTION** — not CASCADE; deleting a staff account does not delete assignment history they made).

| Column | Type | Null | Default | Unique? |
|---|---|---|---|---|
| assignment_id | text | NOT NULL | — | PK |
| student_id | text | NOT NULL | — | |
| section_id | text | NOT NULL | — | |
| assigned_at | timestamptz | NOT NULL | now() | |
| assigned_by | text | NULL | — | FK, nullable |
| active | boolean | NOT NULL | true | |
| | | | | Partial unique: at most one **active** row per `student_id` (see §22) |

### 6.27 `staff_messages`
PK: `message_id`. FKs: `student_id → users` (CASCADE), `staff_id → staff_users` (CASCADE).

| Column | Type | Null | Default | Purpose |
|---|---|---|---|---|
| message_id | text | NOT NULL | — | PK |
| student_id | text | NOT NULL | — | |
| staff_id | text | NOT NULL | — | |
| message | text | NOT NULL | — | |
| sent_at | timestamptz | NOT NULL | now() | |
| delivered_at | timestamptz | NULL | — | Stamped when shown to the student |
| read_at | timestamptz | NULL | — | |
| reply | text | NULL | — | A single reply slot |
| replied_at | timestamptz | NULL | — | |
| dismissed_at | timestamptz | NULL | — | App-layer rule: only dismissible once replied to (not DB-enforced) |
| staff_seen_at | timestamptz | NULL | — | Added later; clears staff "unseen reply" badges |

### 6.28 `activity_attempts` (newest table)
PK: `attempt_id`. FKs: `user_id → users` (CASCADE), `test_run_id → test_runs` (CASCADE). `activity_id` is plain text (identifies a frontend-defined activity, not a database row) — no FK.

| Column | Type | Null | Default |
|---|---|---|---|
| attempt_id | text | NOT NULL | — (PK) |
| user_id | text | NOT NULL | — |
| stage_id | text | NOT NULL | — (no FK) |
| chapter_id | text | NOT NULL | — (no FK) |
| activity_id | text | NOT NULL | — (no FK) |
| test_run_id | text | NOT NULL | — |
| xp | integer | NOT NULL | 0 |
| xp_committed | boolean | NOT NULL | false |
| attempted_at | timestamptz | NOT NULL | now() |

**⚠️ RLS is NOT enabled on this table** — see §19.

---

## 7. Relationships

```
users
  │
  ├── sessions                         (user_id, ON DELETE CASCADE)
  ├── learn_progress                   (user_id, CASCADE)   UNIQUE(user_id, chapter_id)
  ├── test_runs                        (user_id, CASCADE)
  │     │
  │     ├── attempts                   (test_run_id, CASCADE)
  │     └── activity_attempts          (test_run_id, CASCADE)  UNIQUE(test_run_id, activity_id)
  ├── attempts                         (user_id, CASCADE)        [also FK'd via test_run_id above]
  ├── activity_attempts                (user_id, CASCADE)
  ├── practice_progress                (user_id, CASCADE)   UNIQUE(user_id, practice_id)
  ├── practice_pairings                (user_id, CASCADE)
  ├── student_section_assignments      (student_id, CASCADE)  partial-UNIQUE(student_id) WHERE active
  └── staff_messages                   (student_id, CASCADE)

stages
  │
  ├── chapters                         (stage_id, CASCADE)
  │     │
  │     ├── learn_content              (chapter_id, CASCADE)   [also FK'd via stage_id]
  │     └── questions                  (chapter_id, CASCADE)   [also FK'd via stage_id]
  │           │
  │           ├── options              (question_id, CASCADE)
  │           ├── test_hints           (question_id, CASCADE)
  │           └── question_terms       (question_id, CASCADE)
  └── practice_bank                    (stage_id, CASCADE, NULLABLE FK)
        │
        ├── practice_tests             (practice_id, CASCADE)
        └── practice_mistakes          (practice_id, CASCADE)

glossary
  │
  └── question_terms                   (term_id, CASCADE)

staff_users
  │
  ├── staff_sessions                   (staff_id, CASCADE)
  ├── staff_messages                   (staff_id, CASCADE)
  └── student_section_assignments      (assigned_by, NO ACTION — not CASCADE)

sections
  │
  └── student_section_assignments      (section_id, CASCADE)

prerequisites                           — NO FK (target_id/prerequisite_id intentionally polymorphic: stage, chapter, or practice id)
settings, announcements, kabi_phrases   — standalone, no relationships
```

**Columns that look like they should be foreign keys but are NOT** (plain `text`, enforced only in application code): `learn_progress.stage_id`/`chapter_id`, `test_runs.stage_id`/`chapter_id`, `attempts.stage_id`/`chapter_id`/`question_id`, `practice_progress.stage_id`, `activity_attempts.stage_id`/`chapter_id`/`activity_id`. This is a uniform, deliberate pattern throughout the schema's whole history — not an inconsistency introduced at one point in time. **This is migration-critical**: a future migration script cannot rely on the database to catch a stale/invalid chapter or question reference in these columns; it must validate those references itself against the curriculum tables.

---

## 8. Authentication

**This project does not use Supabase Auth at all.** It implements a completely custom, hand-rolled authentication and session scheme against its own plain Postgres tables.

- **Providers enabled:** None (no Supabase Auth providers are configured or used — email/password "login" is entirely custom application code, not Supabase Auth's email/password provider).
- **Password hashing:** `SHA-256(salt | password)`, salt = a random per-account value derived from `crypto.randomUUID()`. This is a hand-rolled scheme — not bcrypt/scrypt/Argon2, and not Supabase Auth's own hashing.
- **Password requirements:** A minimum length enforced server-side via the `settings` table's `MIN_PASSWORD_LENGTH` key (value not determinable from migrations alone — read at runtime).
- **Session tokens:** Two concatenated `crypto.randomUUID()` values — a long, random, unsigned, opaque bearer string (**not a JWT** — carries no claims/payload, cannot be decoded, has no expiry encoded in it). Stored as a row in `public.sessions` (student) or `public.staff_sessions` (staff), keyed by the token itself.
- **Session validation:** A plain row lookup by `session_token` + `active = true`, plus an application-level idle-timeout check (`SESSION_HOURS` setting, default 168 hours / 7 days) that flips the row's `active` to `false` once expired. `last_seen` is only re-stamped when more than 15 minutes have passed, to reduce write volume. There is no cryptographic verification of any kind.
- **Email confirmation:** Not implemented — `signup` creates an `active` account immediately with no verification step.
- **User metadata / app metadata:** N/A — there is no Supabase Auth user object at all; all "metadata" is just ordinary columns on `public.users`.
- **Identity handling:** One identity per student (`users` row), one separate identity type for staff (`staff_users` row) — explicitly NOT unified, by design (see §9).
- **Refresh-token behavior:** None — there is no refresh token; the same session token is used until it expires (idle timeout) or the user explicitly logs out.
- **The Supabase Edge Function gateway setting `verify_jwt = false`** (`supabase/config.toml`) is required and safe specifically *because* no caller ever carries a Supabase Auth JWT — every request instead carries the Supabase **anon key** (only to satisfy the gateway's "some `apikey`/`Authorization` header must be present" requirement) plus the app's own `session_token` inside the JSON body, which the Edge Function validates by hand via `requireSession()`.
- **Security boundary statement, verbatim from the repository** (migration comment, `20260914120000_staff_monitoring.sql`): *"This project does not use Supabase Auth / Postgres RLS as the real enforcement boundary... this file [the Edge Function], running under the service-role key, IS the boundary."*

### Staff authentication — a fully parallel, separate scheme

Staff/admin accounts use the identical design pattern (salt+SHA-256 hash, random-UUID session token, idle timeout) but against entirely separate tables (`staff_users`/`staff_sessions`), with deliberately identical error messages for "no such account" / "wrong password" / "deactivated" (to avoid leaking which case applies). `users.role` exists as a column but has only ever held the value `'student'` and is explicitly **not** read anywhere for authorization — staff privilege is determined purely by having a row in `staff_users`, not by any flag on `users`.

---

## 9. Auth Users Structure

**`auth.users` is not used by this application at all.** There is no foreign key, view, policy, or function anywhere in the codebase that references `auth.users` or the `auth` schema (confirmed by exhaustive grep across the entire repository, independently by two separate audits for this document).

The application's actual identity tables are:

```
public.users        (students — own password_hash/password_salt, own session table)
public.staff_users   (staff/admin — same pattern, deliberately separate identity)
```

Generic structural example (no real data):

```
public.users.user_id
    ↓ (ON DELETE CASCADE)
public.sessions.user_id
public.learn_progress.user_id
public.test_runs.user_id
public.attempts.user_id
public.activity_attempts.user_id
public.practice_progress.user_id
public.practice_pairings.user_id
public.student_section_assignments.student_id
public.staff_messages.student_id
```

A future migration FROM an old Supabase project will need to determine whether that old project used real Supabase Auth (`auth.users` + JWTs) or something else — **this is explicitly a question about the OLD project, not something this document can answer, since it only covers the NEW project** (see §30).

---

## 10. Student Profile

Student profile fields live directly on `public.users` (no separate `profiles` table exists — `users` *is* the profile table, combining identity, authentication, and progress-summary fields in one row).

## Student Identity Fields Required for Migration

| Field | Source (this table) | Destination | Required? | Notes |
|---|---|---|---|---|
| user_id | `users.user_id` | `users.user_id` | Yes | Primary key; old project's equivalent ID must be mapped to a new one (collision risk if both use similar ID-generation schemes — see §27) |
| name | `users.name` | `users.name` | Yes | |
| roll_no | `users.roll_no` | `users.roll_no` | Yes | UNIQUE constraint — must not collide with an existing new-project student |
| department | `users.department` | `users.department` | Yes | Free-text; see §11 |
| email | `users.email` | `users.email` | Yes | UNIQUE constraint — must not collide; also the field the new signup flow gates on (`.aids@rajalakshmi.edu.in` domain) |
| phone | `users.phone` | `users.phone` | Optional | Nullable |
| password_hash / password_salt | `users.password_hash`/`password_salt` | Same | **Needs decision** | Only safe to migrate directly if the OLD project uses the exact same SHA-256(`salt|password`) scheme; otherwise students must reset passwords, or a one-time re-hash-on-next-login shim is needed — this cannot be decided without auditing the OLD project (see §30) |
| username | `users.username` | `users.username` | Optional | UNIQUE; NULL is valid (means "must still choose one") |
| joined_at | `users.joined_at` | `users.joined_at` | Optional | Historical/cosmetic |
| status | `users.status` | `users.status` | Yes | Must be `'active'` for the migrated student to be able to log in |

No separate `profiles` table, no `department` lookup table, no year/semester/section-as-an-enum field exists — `department` is free text and section membership is a *separate* relationship (`student_section_assignments`, see §11).

---

## 11. Department

`users.department` is a plain, nullable `text` column with **no CHECK constraint, no enum type, and no foreign key to any lookup table** — confirmed by grepping every migration for "department": the only hit anywhere is this column's original definition in the baseline schema. No migration has ever added a department constraint.

**Server-side validation** (`click-backend/index.ts`): the `signup` action only requires `department` to be present/non-blank (`required(b, [..., "department", ...])`) and stores it verbatim after trimming (`department: String(b.department).trim()`). **The actual mechanism that currently makes registration AIDS-only is a separate, unrelated check: the submitted email must end in `.aids@rajalakshmi.edu.in`** — `department`'s value itself is never checked against `"AIDS"` or any other value, server-side. (The frontend's Create Account form independently restricts the dropdown to a single option, `AIDS` — but this is a client-side UI restriction only; the server does not enforce it.)

This is discovery only — no change was made to this system as part of this task.

---

## 12. Student Progress

Tables that represent learning progress, and their authority/derivation status:

| Table | Represents | Authoritative? | Derived? | Migration note |
|---|---|---|---|---|
| `learn_progress` | Has this student completed a chapter's Learn tab? | **Authoritative** — the only record of this fact | No | One row per (user, chapter); `completed`, `times_completed`, `last_completed_at` are all real, standalone state |
| `test_runs` | One graded (or review) attempt at a chapter's test | **Authoritative** for the attempt's own state (hearts/XP/question-count tracking during the run) | Partially — `committed_xp` is only meaningful once `status='completed'` | A chapter may have many `test_runs` rows (review attempts), but only one can ever reach `status='completed'` (DB-enforced, see §22) |
| `attempts` | One answer to one question within a test run | **Authoritative** — the only record of what was actually answered and whether it was correct | No | |
| `activity_attempts` | One completed "learning activity" (hands-on exercise) within a test run | **Authoritative** | No | Newest table; deliberately mirrors `test_runs.pending_xp`'s pattern rather than reusing `attempts` |
| `practice_progress` | Status of a student's attempt at a VS Code practice challenge | **Authoritative** | No | |
| `users` (total_xp, hearts, tests_completed, stages_completed, etc.) | Running summary totals | **Authoritative, but derived/committed from the above** | Yes — committed by the `finishTest` action from `test_runs.pending_xp`, not independently settable | This is the single source of truth a migration must ultimately write to for "how much XP/how many hearts does this student have now" |

All of the above are plausible **MIGRATE** candidates for a future student-progress migration, pending the old project's own schema being audited for compatibility (see §27, §29).

---

## 13. XP System

Full architecture, as actually implemented (confirmed directly from `click-backend/index.ts` across the XP feature built in this same repository):

```
Question answered correctly (saveTestAnswer)
    ↓  xp = clamp(questions.xp, 1, 2)   [server-computed from the question's own xp column — never trusted from client]
test_runs.pending_xp  +=  xp            (staged, not yet committed)
attempts row inserted  (question_xp = xp, xp_committed = false)

Activity completed (saveActivityAttempt)
    ↓  xp = ACTIVITY_XP  (a fixed server-side constant, currently 1 — never trusted from client)
test_runs.pending_xp  +=  xp            (staged)
activity_attempts row inserted  (xp = xp, xp_committed = false)

Chapter finished (finishTest)
    ↓  xp = test_runs.pending_xp         (read back from the DB — never a client-sent total)
    ↓  atomic claim: a partial UNIQUE index on test_runs(user_id, chapter_id) WHERE status='completed'
    ↓     — first test_run to reach 'completed' for that (user, chapter) wins; any other becomes 'completed_repeat' (committed_xp = 0)
users.total_xp  +=  xp   (only if this run won the atomic claim — i.e. exactly once per student per chapter, ever)
attempts.xp_earned / activity_attempts.xp_committed stamped to reflect what was actually committed
```

- **Where XP is stored:** `users.total_xp` is the one authoritative running total. `test_runs.pending_xp`/`committed_xp` and `attempts.xp_earned`/`question_xp`/`xp_committed` and `activity_attempts.xp`/`xp_committed` are the ledger/audit trail of how that total was built up.
- **Where XP is calculated:** Entirely server-side, inside the Edge Function. The client never sends a raw XP number that is trusted — the server always re-derives the amount from `questions.xp` (for questions) or a fixed constant (for activities).
- **Per-activity vs per-question vs per-chapter:** XP is earned per graded question (`questions.xp`, currently always `1` in every live row observed) and per graded activity (fixed `1`), summed per chapter, and committed to the user's total exactly once per chapter via the atomic unique-index claim described above.
- **Chapter completion bonuses:** **None exist.** The `finishTest` commit is simply the sum of that chapter's question + activity XP — there is no separate "+N for finishing the chapter" bonus anywhere in the code or schema.
- **Stage completion bonuses:** **None exist.** `users.stages_completed`/`last_completed_stage` are tracked as progress/leaderboard metadata only — they do not add any XP.
- **Review XP:** **Zero, always.** A chapter being reviewed (already completed) never accrues `pending_xp` and never calls the answer/activity-save actions in a way that stages XP — confirmed both by the `completeLearn` action (used for reviews) never touching `total_xp`, and by the atomic unique-index claim making a second "complete" of the same chapter always resolve to `completed_repeat` / `committed_xp = 0` even if somehow re-attempted as a graded run.

---

## 14. Hearts

- **Column:** `users.hearts` (integer, default 3 — this is also the "maximum"/starting value, read from `settings.DEFAULT_HEARTS` if that setting exists, else the column default).
- **Per-run tracking:** `test_runs.hearts_start`/`hearts_end` snapshot the student's heart count at the start and current point of one test run; `attempts.hearts_before`/`hearts_after` snapshot it per individual answer.
- **Loss condition:** A heart is lost when a question's 3rd attempt is still wrong (`attempts.question_attempt_no >= 3` and still incorrect) — enforced in `saveTestAnswer`.
- **Zero-hearts behavior:** If hearts reach 0 mid-run, the `test_runs.status` becomes `failed`, and `finishTest` explicitly refuses to complete a failed run (discards any `pending_xp`).
- **Refill behavior:** Hearts are refilled only by reviewing the specific chapter where they were lost (`completeLearn`, when `heart_recovery_chapter_id` matches) — never automatically, never by time-based regeneration.
- **Persistence:** `users.hearts` is the authoritative current value; everything else (`test_runs`/`attempts` hearts columns) is historical/derived snapshotting, not a second source of truth.

---

## 15. Attempts / Test Runs

| Table | Student-specific? | Contributes to current progress? | Migration recommendation |
|---|---|---|---|
| `test_runs` | Yes | Yes — the completed-run's `committed_xp` and its win of the one-per-chapter unique claim directly determine whether a chapter counts as done | **MIGRATE** (at minimum, one synthesized "completed" row per chapter the student has actually finished, so the new project's own `idx_test_runs_one_completed_per_chapter` logic correctly treats that chapter as already won) |
| `attempts` | Yes | Indirectly — informs `test_runs` completion, but once a `test_run` is already `completed`, the individual `attempts` rows are historical detail, not something re-read to determine current state | **MAY NOT NEED MIGRATION** in full detail — depends on whether per-question answer history needs to carry over for analytics/review, or whether only the chapter-level completion fact matters. **NEEDS OLD→NEW COMPARISON** to decide. |
| `activity_attempts` | Yes | Same as `attempts`, but for activities, and this table is brand new (added in this project) — an OLD project almost certainly has no equivalent table at all, since activities never earned XP before this feature | **KEEP NEW ONLY** — there is nothing to migrate FROM the old project for this table; it will simply start empty for migrated students (a migrated student who re-does a chapter's activities will earn fresh activity XP normally, since XP is only committed via the chapter's `test_run`, not independently) |
| `practice_pairings` | Yes, but device-session-specific (VS Code pairing) | No — this is ephemeral connection state, not learning progress | **NOT REQUIRED FOR STUDENT MIGRATION** — a migrated student simply re-pairs their VS Code extension |

---

## 16. Chapter / Stage References

Confirmed precisely from real migration `insert` statements:

- Stages: `STG` + 3 digits, e.g. `STG001`
- Chapters: `CH` + 4 digits, e.g. `CH0031`
- Questions: `Q` + 6 digits, e.g. `Q000151`

These are **opaque string primary keys** — the backend only normalizes them (uppercase/trim via a `normalizeId()` helper) and never parses structure out of them. `progress`-adjacent tables (`learn_progress`, `test_runs`, `attempts`, `practice_progress`, `activity_attempts`) all store `stage_id`/`chapter_id` as plain `text` matching these exact string IDs — **not** a separate numeric/slug identifier, and **not** enforced by a foreign key (see §7). `prerequisites.target_id`/`prerequisite_id` reuse the same string IDs, disambiguated by their `STG`/`CH`/`P`-prefix convention at the application level (never at the database level).

---

## 17. Curriculum Source of Truth

| Source | Path | Purpose |
|---|---|---|
| Database (authoritative structure + unlock rules) | `stages`, `chapters`, `prerequisites` tables | The real, current stage/chapter list, their order, and which chapter/stage unlocks require which other one to be completed |
| Database (content) | `learn_content`, `questions`, `options`, `test_hints`, `glossary`, `question_terms` tables | The actual lesson text and graded question bank |
| Frontend activity definitions | `assets/chapter/defs/chNNNN.js` | Code Explorer + hands-on "activity" slide definitions for the unified chapter run — one file per chapter, **keyed by the same `chapter_id`/`stage_id` string the database uses** (e.g. `assets/chapter/defs/ch0031.js` declares `chapter: "CH0031"`) |
| Frontend activity definitions (older/parallel layer) | `assets/learn/defs/chNNNN.js` | An earlier Learn-page slide/activity layer, same chapter-id-keying convention |
| Migrations themselves | `supabase/migrations/*.sql` | The append-only history of how the above database rows were created/edited — this *is* the database's own source of truth, reconstructed in this document |

**Confirmed relationship:** `CH0031` is the identical, literal identifier in the database (`chapters.chapter_id`, `questions.chapter_id`, etc.) and in the frontend's static definition files — the frontend files are a client-side content/rendering supplement keyed by the database's own IDs, not an independent numbering scheme. The backend Edge Function never reads these JS files at all; it only ever returns database rows, and the frontend is responsible for pairing a returned `chapter_id` with the matching static file by that same string.

---

## 18. Migration-Critical Identifiers

## Migration-Critical Curriculum Identifiers

A future migration script must preserve or correctly map:

| Identifier | Format | Stability |
|---|---|---|
| `stages.stage_id` | `STGnnn` | Primary, permanent identifier — `stage_no`/`order` have been renumbered/reordered multiple times in this project's history as new stages were inserted between existing ones, but `stage_id` itself has never changed for an existing stage |
| `chapters.chapter_id` | `CHnnnn` | Same — permanent; `chapter_no`/`order` can shift, `chapter_id` does not |
| `questions.question_id` | `Qnnnnnn` | Permanent |
| Frontend activity ids (e.g. `CH0031.p2.build-pipeline`) | `<chapter_id>.p<page>.<slug>` | Defined in `assets/chapter/defs/*.js` / `assets/learn/defs/*.js`, not the database — stable as long as those files aren't edited, but **not a database concept at all**, so irrelevant to a student-data migration (no student record references these strings) |

**For the purposes of migrating STUDENT progress specifically**, the identifiers that matter are `user_id`/`roll_no`/`email` (student identity), `chapter_id`/`stage_id` (what was completed), and `question_id`/`activity_id` (what was answered/attempted) — all of which are plain opaque strings with no cross-project compatibility guarantee. **A future migration will need an explicit old-chapter-id → new-chapter-id mapping table**, since there is no guarantee the OLD project used the same `CHnnnn` numbering for the same curriculum content (this cannot be determined without auditing the OLD project — see §30).

---

## 19. RLS Policies

**Project-wide posture:** every table has Row Level Security **enabled**, and **zero `create policy` statements exist anywhere in the repository** — for 27 of the 28 tables. This is a uniform, deliberate "deny-all to `anon`/`authenticated`; only `service_role` (used exclusively by the Edge Function, which bypasses RLS entirely) can touch any row" design, stated explicitly in a migration comment: *"Every table has RLS enabled with zero policies (deny-all for the anon/authenticated roles); the click-backend Edge Function is the only thing that ever talks to Postgres, and it always uses the service-role key, which bypasses RLS."*

| Table | RLS | Policies |
|---|---|---|
| All 27 tables except `activity_attempts` | **ENABLED** | **None** |
| `activity_attempts` | **⚠️ NOT ENABLED** | None (and RLS itself is off) |

**Finding — flagged, not silently fixed:** `activity_attempts` (the newest table, added `20261001030000_activity_attempts.sql` for this session's XP feature) has **no `alter table activity_attempts enable row level security` statement anywhere**, and — confirmed live, see §0.A — **the table does not exist on the live database at all yet**, since its migration has never been applied. The RLS gap is therefore currently moot in production, but must be fixed (a one-line `alter table activity_attempts enable row level security;`, added as its own small migration) either before or as part of finally applying `20261001030000`. Every other table's RLS was enabled either via the baseline schema's one-time loop (original 22 tables) or an explicit `alter table ... enable row level security` in the migration that created it (`staff_users`, `staff_sessions`, `sections`, `student_section_assignments`, `staff_messages` all have this line; `activity_attempts` does not). Since the broad `grant all` privileges from `fix_grants.sql` are still in force for `anon`/`authenticated` (see below), **this table's RLS gap means it would be the one table where the database-level grant/RLS backstop does not block direct `anon`/`authenticated` access, once it does exist live** — though in practice no `anon`/`authenticated` Supabase client exists anywhere in this app (only the service-role-authenticated Edge Function ever connects), so there is no current attack surface via the app itself even once the table is created. This should be corrected as part of the same migration that finally creates the table live, to match the project's own stated security posture from day one.

**Grants** (from `fix_grants.sql`, still in force — no later migration touches grants): `postgres`, `anon`, `authenticated`, `service_role` all receive `usage` on schema `public` and `all` privileges on all tables/sequences/functions in `public`, plus matching `alter default privileges` so future objects inherit the same grants automatically. This looks permissive at the raw SQL-grant level, but RLS (where enabled) is what actually blocks `anon`/`authenticated` from reading or writing any row directly.

No policy of any kind distinguishes "student can read own data" / "student can write own progress" / "staff access" / "public access" — **none of that exists at the database level**; it is all enforced exclusively in the Edge Function's own logic (`requireSession`/`requireStaffSession` checks, and each action handler's own `eq("user_id", uid)`-style filtering).

---

## 20. Database Functions

**None exist.** An exhaustive grep of `schema.sql`, `fix_grants.sql`, and all 44 migration files for `create function`, `create or replace function`, `language plpgsql`, `returns trigger`, and `security definer` found zero actual SQL function definitions. (The only textual hits were plain-English prose inside seeded lesson/question content teaching the C-programming concept of "functions" — e.g. an MCQ option reading `'To create functions'` — which are quiz content, not SQL.) **100% of the application's business logic lives in the Deno Edge Function**, not in Postgres.

---

## 21. Triggers

**None exist**, for the same reason as §20 — no `create trigger` statement appears anywhere in the schema history.

---

## 22. Indexes and Constraints

### Unique constraints and indexes that matter for a future migration's UPSERT logic

| Table | Unique on | Notes |
|---|---|---|
| `users` | `roll_no`, `email`, `username` (three independent unique constraints) | A migrated student's `roll_no`/`email`/`username` must not collide with any existing new-project account |
| `test_runs` | **Partial** unique index on (`user_id`, `chapter_id`) **WHERE `status = 'completed'`** | The single most important constraint for migration logic: a future migration that wants to mark a chapter as "already completed" for a migrated student must insert/ensure exactly one `test_runs` row with `status='completed'` per (user, chapter) — a second such row for the same pair will be rejected by Postgres (`23505 unique_violation`), exactly the mechanism that already protects XP from being double-awarded |
| `activity_attempts` | Unique on (`test_run_id`, `activity_id`) | Scoped to a single run, not globally per-student — less relevant to migration than the `test_runs` constraint above |
| `learn_progress` | Unique on (`user_id`, `chapter_id`) | One Learn-completion row per student per chapter |
| `practice_progress` | Unique on (`user_id`, `practice_id`) | One progress row per student per practice challenge |
| `student_section_assignments` | **Partial** unique index on (`student_id`) **WHERE `active`** | At most one active section per student — a migration assigning sections must deactivate any existing active row first |
| `sections` | Unique on `section_code` | |
| `staff_users` | Unique (functional, case-insensitive) on `lower(email)` | |

### Notable gaps

- `practice_pairings.pair_code` has **no** uniqueness constraint at the database level, despite being a human-entered pairing code — any collision-avoidance is application-level only (observation, not confirmed to be a bug).
- No table anywhere has a CHECK constraint.
- No FK exists on any `stage_id`/`chapter_id`/`question_id`/`activity_id` column outside of `chapters.stage_id`, `learn_content.*`, `questions.*`, `options.question_id`, `test_hints.question_id`, `question_terms.*`, `practice_bank.stage_id`, `practice_tests.practice_id`, `practice_mistakes.practice_id` — the *progress-tracking* tables (`learn_progress`, `test_runs`, `attempts`, `practice_progress`, `activity_attempts`) never FK their stage/chapter/question/activity pointers. A migration script must validate these references itself; Postgres will not catch a typo'd or stale chapter ID in migrated progress data.

### Performance indexes (not uniqueness-related, listed for completeness)

`idx_chapters_stage`, `idx_learn_content_chapter`, `idx_questions_chapter`, `idx_options_question`, `idx_test_hints_question`, `idx_question_terms_question`, `idx_practice_bank_stage`, `idx_practice_tests_practice`, `idx_practice_mistakes_practice`, `idx_prerequisites_target`, `idx_sessions_token` (redundant with the column-level unique constraint), `idx_sessions_user`, `idx_sessions_last_seen`, `idx_learn_progress_user`, `idx_learn_progress_updated_at`, `idx_test_runs_user_chapter` (plain, non-unique — distinct from the partial unique index above), `idx_test_runs_started_at`, `idx_attempts_test_run`, `idx_attempts_user`, `idx_attempts_attempted_at`, `idx_practice_progress_user`, `idx_practice_progress_completed_at`, `idx_practice_pairings_user`, `idx_practice_pairings_code`, `idx_practice_pairings_token`, `idx_staff_sessions_staff`, `idx_assignment_section_active` (partial, `WHERE active`), `idx_staff_messages_student`, `idx_staff_messages_staff`, `idx_activity_attempts_test_run`.

---

## 23. Storage

**Supabase Storage is not used anywhere in this application.** An exhaustive grep for `supabase.storage`/`storage.from(` across the entire repository returned zero matches. All static/binary assets (images, videos, the downloadable `.apk`/`.vsix` files) are served as plain static files from the Cloudflare Workers asset bundle (the `assets/` directory, deployed via `.github/workflows/cloudflare-frontend.yml` + `wrangler.jsonc`), not from any Supabase bucket. There are no buckets, no storage policies, and nothing to migrate in this category.

---

## 24. Edge Functions

| Name | Purpose | Used by | Auth requirement | Database tables | Secrets required | Migration relevance |
|---|---|---|---|---|---|---|
| `click-backend` | The entire application backend in one function: student auth/session, curriculum bootstrap, chapter Learn + test-taking + XP/hearts economy, VS Code practice-pairing + coding-challenge grading, staff monitoring/dashboard/messaging | Web frontend (`index.html`), VS Code extension, desktop Electron wrapper, `admin-tools/` scripts | Custom `session_token` (student) or `staff_session_token` (staff) inside the JSON body, validated by hand (`requireSession`/`requireStaffSession`); a small set of actions (`adminGetMaxIds`, `adminResetPassword`, `adminUpsertStaff`) additionally require the `ADMIN_RESET_KEY` secret | All 28 tables (see §25 for the full per-action breakdown) | `SUPABASE_URL` (auto-injected), `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_RESET_KEY` | A future migration script, if it needs to create accounts/progress through the normal application path rather than direct SQL, would call this function's actions (`signup`, or a bespoke admin-only bulk-import action that would need to be written) — alternatively, direct SQL `insert`/`upsert` against the tables above, bypassing the Edge Function entirely, is also viable since RLS is not the enforcement boundary here (service-role access is service-role access either way) |

No other Edge Function exists in this project (`supabase/functions/` contains exactly one folder).

---

## 25. Application Supabase Usage

| Application Area | Action (dispatch case) | Table(s) | Operation | Purpose |
|---|---|---|---|---|
| Signup | `signup` | `settings`, `sections`, `student_section_assignments`, `users`, `sessions` | SELECT (validation) + INSERT | Create a student account, assign a section, start a session |
| Login | `login` | `users`, `sessions` | SELECT + UPDATE + INSERT | Student email+password login |
| Session resume | `session` | `sessions`, `users` | SELECT | Validate an existing session on page load |
| Logout | `logout` | `sessions`, `users` | UPDATE | End a session |
| App bootstrap | `bootstrap` | `users`, `stages`, `chapters`, `learn_content`, `practice_bank`, `practice_tests`, `practice_mistakes`, `announcements`, `kabi_phrases`, `prerequisites`, `learn_progress`, `test_runs`, `practice_progress`, `staff_messages`, `attempts` | SELECT (many) | The main "load the whole app state" call on every page load/refresh |
| Learning — Learn tab | `completeLearn` | `chapters`, `learn_progress`, `users`, `attempts` | SELECT + INSERT/UPDATE | Mark a chapter's Learn content complete; heart-recovery refill logic |
| Learning — start test | `startTest` | `users`, `chapters`, `learn_progress`, `questions`, `options`, `test_hints`, `test_runs` | SELECT + INSERT | Begin a chapter test run, select/shuffle questions |
| Learning — answer question | `saveTestAnswer` | `test_runs`, `questions`, `test_hints`, `attempts`, `users` | SELECT + INSERT/UPDATE | Grade one answer; stage hearts/XP |
| Learning — activity XP | `saveActivityAttempt` | `test_runs`, `activity_attempts` | SELECT + INSERT/UPDATE | Record a completed Learn activity; stage its fixed XP |
| Learning — finish chapter | `finishTest` | `test_runs`, `attempts`, `activity_attempts`, `chapters`, `stages`, `users`, `learn_progress` | SELECT + UPDATE (atomic commit) | Finalize the run, commit XP exactly once |
| Practice (VS Code) | `createPracticePairing`, `practicePairingStatus`, `practiceConnectionState`, `claimPracticePairing`, `practiceExtensionSync`, `practiceWebSync`, `completePractice` | `practice_pairings`, `practice_progress`, `practice_bank`, `users` | SELECT/INSERT/UPDATE | Device pairing, sync, and server-authoritative grading of coding challenges |
| Staff — auth | `staffLogin`, `staffSession`, `staffLogout`, `adminUpsertStaff` | `staff_users`, `staff_sessions` | SELECT/INSERT/UPDATE | Staff account login/session lifecycle |
| Staff — dashboard | `staffDashboardSummary`, `staffSections`, `staffStudents`, `staffStudentDetail` | `users`, `student_section_assignments`, `sections`, `attempts`, `test_runs`, `learn_progress`, `practice_progress`, `sessions` | SELECT (aggregate) | Monitoring dashboards and rosters |
| Staff — sections | `staffAssignSection` | `users`, `sections`, `student_section_assignments` | SELECT + INSERT/UPDATE | (Re)assign a student's section |
| Staff — messaging | `staffSendMessage`, `staffStudentMessages`, `staffUnseenReplies`, `markMessagesDelivered`, `markMessagesRead`, `studentReplyToMessage`, `studentDismissMessage` | `staff_messages`, `users` | SELECT/INSERT/UPDATE | Targeted staff ↔ student messaging |
| Admin tooling | `adminGetMaxIds`, `adminResetPassword` | `stages`, `chapters`, `learn_content`, `questions`, `options`, `test_hints`, `glossary`, `practice_bank`, `practice_tests`, `practice_mistakes`, `users`, `sessions` | SELECT (max-id allocation) / UPDATE (password reset) | Supports `admin-tools/build-content-migration.js` and `admin-tools/reset-student-password.ps1` |
| Content preload | `preloadTestData` | `questions`, `options`, `test_hints`, `glossary`, `question_terms` | SELECT | Pre-cache the question bank |
| Onboarding | `completeOnboarding`, `setUsername` | `users` | UPDATE | First-run tour completion; display-name selection |

No `.rpc()` calls exist anywhere — every row above is a plain `supabase.from(table)` call inside the single Edge Function.

---

## 26. Migration-Relevant Data Classification

| Object | Classification |
|---|---|
| `users` | **A + B** — must exist (as a table) before migration; is itself the user-data destination |
| `sessions` | **E** — not required for migration; a migrated student simply logs in fresh and gets a new session |
| `learn_progress`, `test_runs`, `attempts`, `activity_attempts`, `practice_progress` | **B** — user data destination |
| `practice_pairings` | **E** — ephemeral device-connection state, not learning progress |
| `stages`, `chapters`, `learn_content`, `questions`, `options`, `test_hints`, `glossary`, `question_terms`, `practice_bank`, `practice_tests`, `practice_mistakes`, `prerequisites`, `settings`, `announcements`, `kabi_phrases` | **C** — curriculum/content source of truth; must NOT be overwritten by the migration, only read (to validate chapter/question IDs the migrated progress will reference) |
| RLS configuration, grants | **D** — infrastructure, do not replace |
| `staff_users`, `staff_sessions`, `sections`, `student_section_assignments`, `staff_messages` | **D** — current-project infrastructure (staff/section/messaging system); almost certainly has no equivalent in the OLD project and should not be touched by a student-progress migration |
| Any OLD-project-only tables (unknown — see §30) | **E**, pending audit of the OLD project |

---

## 27. Future Old → New Migration Requirements

1. **Auth migration requirements:** Determine whether the OLD project used Supabase Auth or a custom scheme. If custom and password-hash-compatible (same SHA-256(`salt|password`) construction), hashes can be copied directly; otherwise, students will need a password reset or a one-time "migrate hash on next successful old-password login" shim.
2. **UUID/ID requirements:** All IDs in the NEW project are opaque, application-generated `text` strings, not UUIDs. A future migration must either (a) preserve the OLD project's own ID format if compatible, or (b) generate new NEW-project-style IDs and maintain an old-id → new-id mapping table for referential consistency across all migrated rows (critical for `attempts.test_run_id`/`activity_attempts.test_run_id`/`activity_attempts.user_id` etc., which are real foreign keys in the new schema).
3. **Profile migration requirements:** Map OLD project's student identity fields onto `users` (§10 table) — watch for `roll_no`/`email`/`username` uniqueness collisions against existing NEW-project accounts.
4. **Department mapping:** `department` is free text with no validation either old or new (presumed, pending OLD project audit) — likely a direct string copy, but confirm the OLD project's department values don't need normalization (e.g. abbreviations vs. full names) before copying.
5. **Progress mapping:** For each migrated student, their OLD project's completed chapters must become a `test_runs` row with `status='completed'` in the NEW project (to correctly satisfy `idx_test_runs_one_completed_per_chapter` and make `prerequisites` unlock logic treat the chapter as done) — this is the single most structurally important mapping in the whole migration.
6. **Chapter mapping:** Requires an explicit OLD-chapter-id → NEW-`chapter_id` (`CHnnnn`) table — there is no guarantee the two projects numbered the same curriculum content identically. **Cannot be completed without auditing the OLD project.**
7. **Stage mapping:** Same concern as chapters, one level up (`STGnnn`).
8. **XP mapping:** A migrated student's `users.total_xp` should be set directly (it's a simple integer) — but per-chapter XP provenance (which `attempts`/`activity_attempts` contributed how much) likely cannot be reconstructed exactly unless the OLD project's own ledger structure is compatible; may be acceptable to migrate only the aggregate `total_xp` value and synthesize minimal `test_runs`/`attempts` rows just to satisfy the "chapter is completed" unlock logic, without a full historical answer-by-answer ledger.
9. **Hearts mapping:** `users.hearts` is a simple integer (0-3) — direct copy, or reset to the default (3) if the OLD project's hearts concept differs or doesn't exist.
10. **Attempts mapping:** See §15 — may not need full per-question-answer migration; needs an old→new comparison to decide.
11. **Completion mapping:** `learn_progress` (`completed`, `times_completed`, `last_completed_at`) should be set for every chapter the OLD project considers the student to have learned, independent of the test-completion mapping in item 5.
12. **Unique constraints to respect:** `users.roll_no`/`email`/`username`; the partial-unique `test_runs(user_id, chapter_id) WHERE completed`; `learn_progress`/`practice_progress`'s `(user_id, *_id)` pairs; `student_section_assignments`'s "one active section per student."
13. **Foreign key dependencies (migration order within the new schema):** `users` must exist before anything referencing `user_id`; `test_runs` must exist before `attempts`/`activity_attempts` (both FK `test_run_id`); `sections` must exist before `student_section_assignments`.
14. **RLS considerations:** None block a service-role-authenticated migration script — RLS only restricts `anon`/`authenticated`, and a migration would run with the service-role key exactly like the Edge Function does. (The `activity_attempts` RLS gap from §19 should still be fixed, independent of migration work.)
15. **Trigger considerations:** None — there are no triggers in this database at all (§21), so no migration needs to worry about trigger side-effects firing unexpectedly on inserted rows.
16. **Required migration order:** See §28.
17. **Validation requirements:** After migration, for each migrated student: (a) login succeeds, (b) `bootstrap` returns a coherent app state with no orphaned `chapter_id`/`stage_id` references, (c) previously-completed chapters show as completed on Home and do not re-unlock-gate incorrectly, (d) `total_xp`/`hearts` display correctly, (e) no duplicate `roll_no`/`email`/`username`.

---

## 28. Proposed Migration Order

**This is a proposed plan only — nothing here should be executed as part of this task.**

1. Validate the NEW schema matches this document (re-run discovery against live DB once credentials are available, to catch any drift from the fact that migrations have never actually been applied via CI — see §30).
2. Audit the OLD Supabase project with an equivalent discovery pass (out of scope for this document).
3. Build the old-chapter-id → new-`chapter_id` and old-stage-id → new-`stage_id` mapping tables (manual or scripted comparison of curriculum content).
4. Migrate `users` (student identity + auth fields), generating new `user_id`s and recording an old-id → new-id map.
5. Verify no `roll_no`/`email`/`username` collisions occurred; resolve any before proceeding.
6. Migrate `student_section_assignments` (if the OLD project has an equivalent concept) / otherwise assign a default section.
7. For each student, synthesize `learn_progress` rows for every chapter they'd completed Learn content for.
8. For each student, synthesize one `test_runs` row per completed chapter, with `status='completed'`, `committed_xp` set appropriately, satisfying the partial unique index.
9. Decide (per §15/§27 item 10) whether to migrate detailed `attempts`/`activity_attempts` history or only the chapter-completion facts above; execute accordingly.
10. Set `users.total_xp` and `users.hearts` directly from the OLD project's final values (or from the sum of synthesized `test_runs.committed_xp`, whichever is decided to be authoritative).
11. Recompute/verify `users.stages_completed`/`last_completed_stage` from the migrated `chapters`/`stages` completion state, matching the logic `finishTest` already uses.
12. Validate relationships: no migrated row references a `chapter_id`/`stage_id`/`question_id` that doesn't exist in the NEW project's curriculum tables.
13. Test login for a sample of migrated accounts.
14. Test learning continuation for a sample of migrated accounts (open Home, confirm correct unlock state, open a previously-completed chapter as a review, open the next chapter as current).

---

## 29. Data That Must Remain Untouched

# New Supabase Data That Must Remain Untouched

- **Curriculum tables**: `stages`, `chapters`, `learn_content`, `questions`, `options`, `test_hints`, `glossary`, `question_terms`, `prerequisites` — this is the current, hand-authored NEW curriculum (13 stages, 98 chapters, 520 questions, confirmed from this same repository's own content work). A student migration must only ever *read* these to validate IDs, never insert/alter/delete rows in them.
- **`practice_bank`, `practice_tests`, `practice_mistakes`** — the current VS Code practice-challenge content.
- **`settings`** — current app configuration (session length, questions-per-chapter, etc.).
- **`announcements`, `kabi_phrases`** — current app content.
- **Current RLS configuration** (enabled-with-zero-policies posture) — see §19's one known gap (`activity_attempts`), which should be fixed as its own independent change, not bundled into the student migration.
- **Current grants** (`fix_grants.sql`'s broad `all`-to-every-role grants, offset by RLS) — infrastructure, not migration-relevant.
- **`staff_users`, `staff_sessions`, `sections`, `student_section_assignments` (existing rows), `staff_messages`** — current staff/operations data, with no OLD-project equivalent expected.
- **The Edge Function itself (`click-backend/index.ts`)** — all current business logic; a migration should use/extend it, not bypass or duplicate its logic elsewhere.

---

## 30. Unknowns / Needs Verification

- ~~Region~~ — **RESOLVED**: `ap-southeast-1`, confirmed live (§0, §1).
- ~~Database engine/version~~ — **RESOLVED**: Postgres 17.6.1, confirmed live.
- ~~Whether the live database's actual current schema matches this document~~ — **RESOLVED, and the answer is NO**: confirmed live via `supabase migration list` that 16 migrations (`20260926150000` onward) are not applied, including `activity_attempts` entirely (see §0.A for full detail). This document's detailed schema sections (§4-§7, §19-§23) describe the repository's **intended** final state; §0.A is the authoritative statement of what is actually live right now.
- **NEW, critical, unresolved: the live `users` table's 354-row count exactly matches a "~354 OLD system users" figure from elsewhere** (§0.B). Not resolved here — requires explicit human clarification before any migration proceeds, since it determines whether this project is an empty migration destination or an already-active production system with its own unrelated 354 students.
- **Whether `supabase/schema.sql`/`fix_grants.sql` reference copies have drifted further from the migrations folder** than the one instance already found (§5 finding 2) — not re-verified beyond that one instance.
- **Why a usable, authenticated Supabase CLI session was available in this environment** despite no `SUPABASE_ACCESS_TOKEN` environment variable being set — not investigated (out of scope), but worth the user's awareness: this capability should not be assumed to be reliably present in a future session.
- **`kabi_phrases`'s exact UI consumption point** — purpose inferred (short flavor-text/mascot phrases) but not confirmed against a specific rendering call site.
- **`questions.type`'s complete current live value set** — historical migrations show a progressive move away from `TYPE_CODE`/`BLANK`/`MATCH_FOLLOWING` toward `CODE_FILL`/`MCQ`, but at least CH0035's `TYPE_CODE` questions are confirmed still active by a later migration's own comments. The authoritative full value set can only be confirmed by querying live data.
- **Which of `practice_bank`'s 7 non-`experiment_number` "Experiments" columns (`difficulty`, `marks`, `time_limit_seconds`, `memory_limit_mb`, `workspace_folder`, `input_format`, `output_format`) are genuinely populated/used today** — asserted by a migration comment, not independently re-verified against live data.
- **`practice_bank.stage_id` nullability** — structurally nullable (to support now-deleted Experiment rows), but per the migration's own comment no current row is actually NULL; not independently re-verified.
- **The OLD Supabase project** — entirely out of scope for this document. Its project ref, schema, auth mechanism, and ID formats are completely unknown from this repository and must be discovered by a separate, equivalent audit of wherever that project/its own codebase lives, before any field-by-field migration mapping (§27) can be finalized.
- **Whether the OLD project's password hashing is compatible** with this project's SHA-256(`salt|password`) scheme — unknowable without auditing the OLD project; determines whether passwords can migrate directly or require a reset flow.
- **Whether the OLD project used the same `CHnnnn`/`STGnnn`/`Qnnnnnn` ID conventions** for the same curriculum content — unknowable without that audit; a mapping table is assumed necessary (§18, §27) but its exact construction depends on what the OLD project actually has.

---

## 31. Verification Checklist

### Project
- [x] New Supabase project identified (`jnxevalckgitxuunjcvv`, cross-checked against the explicitly-flagged-as-wrong `zwdmredbjktvecvpfurx` "REC-ACADEMIC" project)
- [x] Project ref verified (via `config.toml`, `index.html`'s `BACKEND_URL`, `supabase/supabase_details.md`'s own prior verification note, **and live confirmed via `supabase projects list`: ACTIVE_HEALTHY**)
- [x] Project URL verified
- [x] Region verified — **`ap-southeast-1`, confirmed live**

### Repository
- [x] Supabase client identified (service-role-only, inside `click-backend/index.ts`; no client-side `supabase-js` usage)
- [x] Auth flow identified (fully custom session-token scheme, not Supabase Auth)
- [x] Database queries identified (full action → table inventory, §25)
- [x] Environment variables identified (§3), with no secret values recorded

### Database
- [x] Tables inventoried (28, §5-§6)
- [x] Columns inventoried (§6)
- [x] Foreign keys inventoried (§7)
- [x] Indexes inventoried (§22)
- [x] Constraints inventoried (§22)
- [x] Functions inventoried (§20 — confirmed none exist)
- [x] Triggers inventoried (§21 — confirmed none exist)

### Authentication
- [x] Auth providers documented (§8 — none; fully custom)
- [x] User metadata usage documented (N/A — no Supabase Auth metadata concept used)
- [x] UUID relationships documented (§9 — confirmed `auth.users` is not referenced anywhere)
- [x] Auth migration considerations documented (§27 item 1)

### Student Data
- [x] Profile tables documented (§10 — `users` itself is the profile table)
- [x] Progress tables documented (§12)
- [x] XP documented (§13)
- [x] Hearts documented (§14)
- [x] Attempts documented (§15)
- [x] Completion data documented (§12, §15)

### Security
- [x] RLS documented (§19 — including the one gap found on `activity_attempts`)
- [x] Policies documented (§19 — confirmed zero policies exist anywhere)
- [x] Service-role usage documented (§3.2, §8)
- [x] Secrets excluded from this document (§3 — names and locations only, no values)

### Migration
- [x] Migration destination tables identified (§26)
- [x] Curriculum identifiers identified (§16, §18)
- [x] Potential FK dependencies identified (§7, §22, §27 item 13)
- [x] Potential unique constraints identified (§22)
- [x] Trigger risks identified (§21 — none exist, so none)
- [x] Unknowns documented (§30)

---

## Final Audit Report Summary

1. **NEW SUPABASE PROJECT:** name: CLICK (Click-NewTrial / Click V2 production) · ref: `jnxevalckgitxuunjcvv` · URL: `https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend` · region: **`ap-southeast-1`** · status: **ACTIVE_HEALTHY** · Postgres **17.6.1** — all confirmed live.
2. **Repository Supabase integration:** frontend — plain `fetch()` to one Edge Function, no direct `supabase-js` client; backend — the Edge Function (`click-backend`) is the sole, service-role-authenticated database client; auth — fully custom session-token scheme, zero use of Supabase Auth.
3. **Important tables:** 28 total, all `public` schema — see §5 for the full list.
4. **Student-related tables:** `users`, `sessions`.
5. **Progress-related tables:** `learn_progress`, `test_runs`, `attempts`, `activity_attempts`, `practice_progress`, `practice_pairings`.
6. **XP-related tables:** `users.total_xp` (authoritative total), `test_runs.pending_xp`/`committed_xp`, `attempts.xp_earned`/`question_xp`/`xp_committed`, `activity_attempts.xp`/`xp_committed`.
7. **Auth structure:** Custom SHA-256(salt|password) + random-UUID bearer session tokens stored in `sessions`/`staff_sessions`; zero reliance on `auth.users` or Supabase Auth JWTs; `verify_jwt=false` by design.
8. **RLS:** Enabled with zero policies on 27/28 tables (deny-all except `service_role`); one gap found — `activity_attempts` has RLS not enabled at all.
9. **Functions:** 0 (none exist in the database).
10. **Triggers:** 0 (none exist in the database).
11. **Storage:** Not used anywhere.
12. **Edge Functions:** 1 (`click-backend`, monolithic, ~1919 lines, handles the entire application backend).
13. **Future migration-critical objects:** `users`, `test_runs` (and its partial unique index), `learn_progress`, `attempts`, `activity_attempts`, `chapters`/`stages` (for ID mapping), `prerequisites` (for unlock-state validation).
14. **Data that must remain untouched:** all curriculum content tables, current RLS/grants configuration, current staff/sections/messaging data, the Edge Function's own logic.
15. **Unknowns:** **the live `users` table's 354-row count matching a separately-stated "~354 OLD users" figure — unresolved, flagged as critical** (§0.B); several content-value-set questions (`questions.type`, `practice_bank`'s legacy columns); everything about the OLD Supabase project (entirely out of scope here). Region and live-schema-match are no longer unknown — both resolved via live verification (§0).
16. **Documentation created:** `supabase-new-details.md` (this file, updated with live-verification findings), `migration/curriculum-map-template.md`, `migration/curriculum-map-template.json`, `migration/migration-readiness-report.md`.

---

## Final Safety Confirmation

- **NO** Supabase data was modified. (A usable, already-authenticated `npx supabase` CLI session was found to be available and was used for exactly four read-only operations: `projects list`, `link --project-ref jnxevalckgitxuunjcvv` (writes only a local `.supabase/` config directory, does not alter the remote project), `migration list`, and `inspect db index-stats`/`table-stats`. No `db push`, no `functions deploy`, no `db dump --data-only`, no `db reset`, and no individual student row was ever queried — only aggregate table/row-count metadata.)
- **NO** users were created/deleted.
- **NO** tables were changed.
- **NO** migrations were run (`migration list` only compares; it does not apply anything).
- **NO** RLS policies were changed.
- **NO** functions were changed.
- **NO** triggers were changed.
- **NO** production configuration was changed.
- **NO** secrets were written to this document — only variable names, locations, and presence/absence.
- **NO** commit was created.
- **NO** push was performed.
- **NO** deployment was performed.

Repository changes made by this task: `supabase-new-details.md` (updated), `migration/curriculum-map-template.md` (new), `migration/curriculum-map-template.json` (new), `migration/migration-readiness-report.md` (new).
