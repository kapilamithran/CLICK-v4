# Supabase Details

This document covers two things:

1. **The automated GitHub → Supabase deployment pipeline** (`.github/workflows/`,
   `supabase/config.toml`, `supabase/migrations/`) — set up so that pushing to
   `main` deploys database migrations and the `click-backend` Edge Function
   automatically, instead of you running SQL/deploying the function by hand.
2. **What each pending change is, why it matters, and how to verify it landed**
   — kept from the original version of this doc, now updated to reflect that
   most of these are deployed by CI once it's enabled, rather than run by hand.

Project ref (confirmed against the live app's `BACKEND_URL`, **not** the
"REC-ACADEMIC" project that was connected to GitHub by mistake — see the
warning at the end of this doc): `jnxevalckgitxuunjcvv`
Dashboard: `https://supabase.com/dashboard/project/jnxevalckgitxuunjcvv`

---

## Part A — The automated pipeline

### How it works

```
Claude Code / VS Code edits a file
        ↓
git commit
        ↓
git push origin main
        ↓
GitHub Actions (only if relevant files changed)
        ↓
  supabase/migrations/**  → .github/workflows/supabase-migrations.yml → supabase db push
  supabase/functions/**   → .github/workflows/supabase-functions.yml  → supabase functions deploy
        ↓
Production Supabase project (jnxevalckgitxuunjcvv) updated
```

Two separate workflows, each triggered only by the paths it cares about, so
an unrelated push (say, an `index.html` frontend change) never touches
Supabase at all:

| Workflow | Triggers on changes to | Runs |
|---|---|---|
| `.github/workflows/supabase-migrations.yml` | `supabase/migrations/**` | `supabase link` → `supabase migration list` (visible in the log) → `supabase db push --yes` |
| `.github/workflows/supabase-functions.yml` | `supabase/functions/**`, `supabase/config.toml` | `supabase functions deploy click-backend` |

Both use the official `supabase/setup-cli@v1` GitHub Action (verified against
Supabase's own current documentation and example repository, not from memory)
to install the CLI — no Docker, no local Supabase install required on the
runner.

### GitHub Secrets required

Set these under **GitHub repo → Settings → Secrets and variables → Actions →
New repository secret**. Names only — I never had or printed the actual
values:

| Secret name | Used by | What it is |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | both workflows | A personal access token from your Supabase account (Dashboard → your avatar → Account → Access Tokens). Authenticates the CLI to the Supabase *management* API. |
| `SUPABASE_PROJECT_ID` | both workflows | `jnxevalckgitxuunjcvv` — tells the CLI which project to target. This is not secret in the sense of being sensitive (it's already visible in `index.html`'s `BACKEND_URL`), but it's stored as a secret anyway so it's not duplicated as a literal string inside the workflow files. |
| `SUPABASE_DB_PASSWORD` | migrations workflow only | Your project's Postgres database password (Dashboard → Project Settings → Database → Database password — reset it there if you don't have it, since Supabase never shows it again after project creation). Required because `supabase db push` connects directly to Postgres, which the management-API access token alone can't authenticate to. |

The Edge Function workflow does **not** need `SUPABASE_DB_PASSWORD` — deploying
a function goes through the management API only, never a direct Postgres
connection.

### ⚠️ Before you enable this: establish the migration baseline (one-time, manual, and required)

**This is the step that protects your existing production data. Do not skip
it or enable the workflow before doing it.**

Your production database already has all the tables, from `schema.sql` and
`fix_grants.sql` having been run by hand in the SQL Editor, long before this
migration system existed. I copied those two files verbatim into
`supabase/migrations/20260101000000_baseline_schema.sql` and
`supabase/migrations/20260101000001_baseline_grants.sql` so the full schema
history is represented in the repo — but if the migrations workflow's first
run tried to actually *execute* them, `db push` would attempt to `create
table stages (...)` etc. against tables that already exist, and fail (in the
best case) or, in some other project, silently do the wrong thing. Both files
have a loud comment header saying the same thing.

The fix is to tell Supabase's remote migration-history table "these two are
already applied" without running them — this is Supabase's own documented
process for adopting an existing database into migrations, not something
improvised for this project. Run this **yourself, once, from a terminal with
the Supabase CLI**, before merging/enabling the workflow:

```
supabase login
supabase link --project-ref jnxevalckgitxuunjcvv
supabase migration list
```

`migration list` shows two columns — local migrations (everything in
`supabase/migrations/`) and remote migrations (what the project's history
table currently thinks is applied, almost certainly empty right now). Confirm
the two baseline files show as local-only, then mark them applied:

```
supabase migration repair 20260101000000 --status applied
supabase migration repair 20260101000001 --status applied
```

Run `supabase migration list` again to confirm both now show as applied on
the remote side too. **Only after this** is it safe to push to `main` and let
the migrations workflow run — at that point, the only migrations left for it
to actually execute are the two pending data changes below (§1 and §2 in
Part B), which were designed to be safe to run automatically either way (see
each section for why).

I did not run any of this myself — I have no Supabase credentials in this
environment. This whole subsection is a set of exact commands for you to run.

---

## Part B — What's pending, and what it does

Once the baseline above is established and the workflow is enabled, the items
below happen automatically on push. If you'd rather not enable full
automation yet, everything here can still be run by hand exactly as described
(Dashboard SQL Editor / Edge Functions page, or the CLI commands shown).

---

### 1. `click-backend` Edge Function changes

**File:** `supabase/functions/click-backend/index.ts`
**Auto-deploys via:** `supabase-functions.yml`, on any push touching this file

Two changes are in this file that the live function doesn't have yet:

1. **`stage_title` / `stage_no` added to `normalizePracticeQuestion()`** — lets
   the Practice list show a human-readable stage name/number instead of just
   the raw `stage_id`. Currently has no visible effect because the practice
   bank is empty, but it's a correctness fix that should still ship.
2. **`CODE_FILL` branch added to `isAnswerCorrect()`** — the server-side
   scoring authority (awards XP, decides heart loss, marks a question done —
   see the `saveTestAnswer` action). **Without this deployed, a student who
   correctly answers a `CODE_FILL` question sees "✓ Correct!" client-side, but
   the server falls back to a raw `expected === actual` string comparison,
   which almost always fails for a JSON-array answer.** That silently costs
   the student an attempt and XP for a genuinely correct answer. This is the
   most user-impacting item in this document.

**Manual fallback** (if not using the automated workflow yet): Dashboard →
Edge Functions → `click-backend` → paste the file's contents → Deploy; or CLI
`supabase functions deploy click-backend` after linking.

**Verify:** Function Logs tab shows a fresh invocation with no errors after a
deploy; the CODE_FILL fix specifically needs §2 below done too, since there's
no live CODE_FILL question to test against otherwise.

---

### 2. Sync the 10 CODE_FILL question rows

**File:** `supabase/migrations/20260907090100_update_codefill_questions.sql`
(same content as the original `supabase/update_codefill_questions.sql`, now
also living in `migrations/` so CI applies it)
**Auto-deploys via:** `supabase-migrations.yml`

Ten questions (`Q000004`, `Q000009`, `Q000014`, `Q000019`, `Q000024`,
`Q000029`, `Q000034`, `Q000039`, `Q000044`, `Q000049`) were converted from
`TYPE_CODE` to `CODE_FILL` in the local `CSVs/CLICK v2 - Questions.csv`
reference file — but the app reads the live `questions` table, not that CSV.
Until this runs, these 10 questions keep behaving as plain "type your code"
questions for real students.

**What it changes:** `type`, `prompt`, `code`, `answer`, `explanation`, `hint`
columns on exactly those 10 rows. `stage_id`, `chapter_id`, `xp`, `order`,
`active` untouched. Does not delete or reset any existing `attempts` history.

**Safe to auto-apply regardless of whether you already ran it by hand**: every
`update` sets fixed final values by `question_id` — re-running it is a no-op
if it already happened.

**Verify:** the `select` at the top of the file, re-run, shows `type =
CODE_FILL` for all 10; in the app, take Stage 0 Chapters 1–10 and confirm the
fill-in-the-blank editor appears.

---

### 3. Remove the retired Stage 0 practice challenges

**File:** `supabase/migrations/20260907090000_remove_stage0_practice_challenges.sql`
(same content as the original `supabase/remove_stage0_practice_challenges.sql`)
**Auto-deploys via:** `supabase-migrations.yml`

Ten Stage 0 practice challenges ("A Name C Will Accept" through "Choose
Enough Range") were removed from the app's UI/content earlier; this deletes
their rows from `practice_bank` (cascading to `practice_tests` /
`practice_mistakes` / `practice_progress`).

**Safe to auto-apply regardless of prior manual runs**: the `delete` matches
specific titles — if they're already gone, it deletes zero rows.

**Verify:** re-run the `select` at the top — should return zero rows.

---

### 4. Experiments 0–16 (57 questions) — still not ready to script

Unchanged from before: this is genuinely blocked on a schema decision, not
just undeployed. `practice_bank` is missing columns for `difficulty`, `marks`,
time/memory limits, and the exact VS Code `workspaceFolder`/`file` mapping
that Experiments questions need. See the two options previously laid out (extend
`practice_bank`, or add dedicated `experiments`/`experiment_questions`
tables) — once you pick one, I can write the migration and seed data for it.
This is **not** something the new CI pipeline changes; it still needs that
decision first, then a hand-written migration (which the pipeline will then
deploy like any other).

---

### 5. Reference only — do not turn into a migration, do not re-run

**Files:** `supabase/schema.sql`, `supabase/fix_grants.sql` (the originals —
their content now also lives in the two baseline migration files, see Part A)

Kept as standalone files for readability/disaster-recovery reference. Their
*content* is what's now represented by the baseline migrations, but as loose
files they're informational only — don't paste them into the SQL Editor
again on the live project (schema.sql has no `if not exists` guards and would
error on tables that already exist).

---

## Important: the "REC-ACADEMIC" mix-up

Earlier, GitHub was connected to a Supabase project called **REC-ACADEMIC**
(ref `zwdmredbjktvecvpfurx`) via the Dashboard's native GitHub integration.
That is a **different, unrelated project** — it currently has zero deployed
Edge Functions and there's no evidence it shares CLICK's schema. You confirmed
`jnxevalckgitxuunjcvv` is the real production project.

Two things follow from this:
1. **`config.toml`, both workflows, and the migrations above all target
   `jnxevalckgitxuunjcvv`** — set your `SUPABASE_PROJECT_ID` secret to that
   value, not REC-ACADEMIC's ref.
2. If REC-ACADEMIC's Dashboard-native GitHub integration ("Deploy to
   production" / branching) is still connected, it's watching for a
   `supabase/migrations/` folder same as ours now has — meaning it could try
   to apply *our* migrations to the *wrong* project. Consider disconnecting
   that integration (Dashboard → REC-ACADEMIC project → Settings →
   Integrations → GitHub → disconnect) unless you have another actual use for
   REC-ACADEMIC, to avoid two systems both reacting to the same repo.

---

## Summary checklist

**One-time, manual, before enabling anything:**
- [ ] Confirm/reset `SUPABASE_DB_PASSWORD` in the Dashboard, note it down
- [ ] Create a `SUPABASE_ACCESS_TOKEN` in the Dashboard (Account → Access Tokens)
- [ ] Add all three GitHub Secrets to the repo (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID=jnxevalckgitxuunjcvv`)
- [ ] Run the baseline-repair commands in Part A against `jnxevalckgitxuunjcvv` (**do this before the first push that touches `supabase/migrations/`**)
- [ ] Decide what to do about REC-ACADEMIC's GitHub connection (see above)

**After that, on every push to `main`:**
- [ ] Changes to `supabase/functions/**` or `supabase/config.toml` → Edge Function auto-deploys (covers §1)
- [ ] Changes to `supabase/migrations/**` → migrations auto-apply (covers §2, §3, and any future migration)
- [ ] §4 (Experiments) still needs a schema decision before it can become a migration at all

---

## Part C — Unified chapter run (Learn + chapter test in one)

A chapter is now one run of 5–10 slides (see `assets/chapter/README.md`): a Code Explorer, hands-on activities and the chapter's real
questions. The frontend needs **no schema change and no data migration**; the edge function got two small, backward-compatible changes. They
deploy with the normal pipeline (changes under `supabase/functions/**`), and nothing runs until the new frontend sends `unified`.

### What changed in `click-backend`

| Action | Change | Callers that do not send `unified` |
|---|---|---|
| `startTest` | `unified: true` skips the "complete this chapter in Learn first" check, and caps the questions served at `UNIFIED_MAX_QUESTIONS` (settings table, default **8**). Prerequisites and the hearts check are unchanged. | unchanged (a tab still running the old app behaves exactly as before) |
| `finishTest` | `unified: true` also records the Learn side: it inserts `learn_progress(completed = true)` if that student has no row, stamped with the run's **start** time. An existing row is left exactly as it was. | unchanged |
| `completeLearn` | only the wording of the message differs when `unified` is sent. Hearts, refill logic and timestamps are untouched. | unchanged |
| `isAnswerCorrect` | multiple-choice text is compared with line endings normalised (`\r\n` = `\n`). Browsers store CRLF as LF in HTML attributes, so an option with a line break in it could never be marked correct. | identical for single-line answers |

Everything else that matters is the **existing** machinery, reused rather than duplicated: `test_runs` / `attempts` (3 attempts per question, a heart
lost when all three fail), the partial unique index `idx_test_runs_one_completed_per_chapter` (XP paid once per chapter, atomically), and
`prerequisites` (a chapter unlocks when the previous chapter's test is completed).

### Why the learn row is stamped at the run's start

Hearts are refilled only by reviewing the chapter where they were lost (`completeLearn`). "Owed" hearts are the losses recorded **after**
`learn_progress.last_completed_at`. Stamping the new row at the run's start keeps a heart lost during the run owed, so passing a chapter never
quietly refills hearts. Stamping it at completion time would have erased that debt.

### `UNIFIED_MAX_QUESTIONS`

Only chapters with more than 8 questions are affected. Today that is CH0035 (15 questions; a unified run serves the first 8 by `order`). Per-question
XP is unchanged. To serve more or fewer, change the setting; no deploy is needed (the function caches settings for 30 s).

### Legacy students (nothing is reset)

| Before | After |
|---|---|
| `learn_completed` and `test_completed` | still completed; the chapter opens as an ungraded **review**; a stray run pays 0 XP |
| `learn_completed` only (learned, never tested) | the chapter is the current one; its first graded run pays XP once; their learn row is untouched |
| neither | first graded run; the learn row appears when the run completes |
| hearts owed from old test attempts | still owed; reviewing the chapter refills them, exactly as before |

### Testing the backend without a database

`tests/backend/` boots the **real** `index.ts` under Deno with an in-memory stand-in for the Supabase client (`fake-supabase.ts`) that enforces the same
primary keys and unique indexes, seeded with the real production content (`tests/fixtures/production-content.json`, rebuilt from these migrations by
`tests/fixtures/build-production-content.mjs`):

```
npm i --no-save deno          # or install Deno; then:
node --test tests/backend/run.test.js
# or directly:
deno test --allow-read --allow-env --import-map=tests/backend/import_map.json tests/backend/unified.test.ts
```

The `prerequisites` rows live in the database, not in this repo, so the tests model the documented rules (chapters unlock in order, a stage after the previous one).
