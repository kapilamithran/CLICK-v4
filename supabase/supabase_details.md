# Supabase Details

This document lists every change made to the CLICK codebase in recent work that
**only exists locally** and has **not been applied to the live Supabase
project** yet. CLICK's architecture has no CI/CD auto-deploy step: editing
`supabase/functions/click-backend/index.ts` or a CSV in `CSVs/` on disk does
nothing to the live app by itself. Someone with access to the Supabase project
has to manually run SQL and/or redeploy the Edge Function for these changes to
actually take effect for real users.

Each section below explains: **what** to run, **why** it's needed, **how** to
run it, and **what happens** (both if you run it, and if you don't).

Project ref: `jnxevalckgitxuunjcvv` (from the `BACKEND_URL` in `index.html`).
Dashboard: `https://supabase.com/dashboard/project/jnxevalckgitxuunjcvv`

---

## How to run things (two ways, pick whichever you have)

**A. Supabase Dashboard (no install required)**
- SQL: Dashboard → **SQL Editor** → **New query** → paste → **Run**.
- Edge Function: Dashboard → **Edge Functions** → `click-backend` → open the
  code editor → paste the full contents of
  `supabase/functions/click-backend/index.ts` → **Deploy**.

**B. Supabase CLI (if you have it installed / prefer the terminal)**
```
supabase login
supabase link --project-ref jnxevalckgitxuunjcvv
```
then the specific command for each item is given below. Run `supabase link`
once per machine; `supabase login` persists your session.

Whichever method you used to deploy this Edge Function the *first* time is
the safest one to keep using (in particular, if the function was originally
deployed with JWT verification turned off for custom-auth reasons, redeploying
via the Dashboard's inline editor preserves that setting automatically; the
CLI's `--no-verify-jwt` flag is only needed if you're deploying fresh via CLI
for the first time).

---

## 1. Deploy the updated Edge Function

**File:** `supabase/functions/click-backend/index.ts`

### Why
Two changes have been made to this file locally that have **not** been pushed
to the live function yet:

1. **`stage_title` / `stage_no` added to `normalizePracticeQuestion()`** — lets
   the Practice list show a human-readable stage name/number instead of just
   the raw `stage_id`. Currently has no visible effect because the practice
   bank is empty (see §3 below), but it's a correctness fix that should still
   ship.
2. **`CODE_FILL` branch added to `isAnswerCorrect()`** — this is the function
   that decides, server-side, whether a submitted test answer is correct. It
   is the actual scoring authority: it's what awards XP, decides whether a
   heart is lost, and marks a question "done" (see
   `supabase/functions/click-backend/index.ts` around line 643, the
   `saveTestAnswer` action). **Without this deployed, a student who correctly
   answers a `CODE_FILL` question will see "✓ Correct!" in the browser (the
   client-side check already has this logic — see §7 of the git history / the
   CODE_FILL merge), but the server will independently re-check the answer
   with its own `isAnswerCorrect()` and, without this branch, will fall
   through to a raw `expected === actual` string comparison — which will
   almost always fail for a JSON-array answer, since minor formatting
   differences (e.g. `["age","18"]` vs `["age", "18"]`) don't match
   character-for-character. That means real students would silently lose an
   attempt and get no XP for a genuinely correct `CODE_FILL` answer**, even
   though nothing looks wrong in their browser. This is the most
   user-impacting item in this whole document — deploy it before pointing any
   real student at a `CODE_FILL` question (see §2, which is also required for
   the question content itself to be live).

### How
**Dashboard:** Edge Functions → `click-backend` → paste the current contents
of `supabase/functions/click-backend/index.ts` → Deploy.

**CLI:**
```
supabase functions deploy click-backend
```
(run from the repo root, after `supabase link` — see the intro above)

### What happens
The live function is replaced with the new code. There is no data migration —
this is a stateless code swap, takes effect immediately, and is trivially
reversible (redeploy the previous version if something looks wrong). All
other existing behavior (login, pairing, Check Code, progress, every other
question type) is unchanged; the diff is purely additive (see the two items
above — nothing existing was removed or altered).

### Verify it worked
After deploying, open the Function's **Logs** tab in the Dashboard and submit
a test answer in the app — you should see a fresh invocation log with no
errors. To specifically confirm the `CODE_FILL` fix, you also need §2 done
first (there's no live `CODE_FILL` question to test against until then).

---

## 2. Sync the 10 CODE_FILL question rows

**File:** `supabase/update_codefill_questions.sql`

### Why
Ten questions (`Q000004`, `Q000009`, `Q000014`, `Q000019`, `Q000024`,
`Q000029`, `Q000034`, `Q000039`, `Q000044`, `Q000049`) were converted from the
`TYPE_CODE` question type to the new `CODE_FILL` type — this was merged into
the local `CSVs/CLICK v2 - Questions.csv` reference file, but **that CSV is
not read by the running app**; the app reads the live `questions` table in
Supabase. Right now the live table still has the old `TYPE_CODE` version of
these 10 rows. Until this SQL runs, these questions will keep behaving as
plain "type your code" questions in the real app — the new fill-in-the-blank
UI (§1 above) will never appear for them, regardless of the frontend/backend
code being deployed.

### How
**Dashboard / CLI (SQL Editor either way):**
1. Open `supabase/update_codefill_questions.sql` in this repo.
2. Run the `select` at the top first — confirm it returns exactly these 10
   rows with their *current* (`TYPE_CODE`) content, so you know what you're
   about to overwrite.
3. Run the ten `update` statements below it (the whole file is safe to run in
   one paste — the `select` is just there for you to sanity-check first).

### What happens
Each of the 10 rows gets its `type`, `prompt`, `code`, `answer`,
`explanation`, and `hint` columns replaced with the CODE_FILL versions (e.g.
`Q000004`'s `code` becomes `int {{1}} = {{2}};` and its `answer` becomes the
JSON array `["age", "18"]`). `stage_id`, `chapter_id`, `xp`, `order`, and
`active` are untouched. This only affects these exact 10 `question_id`s —
nothing else in the `questions` table is touched. It does **not** delete or
reset any existing student `attempts` rows tied to these questions from
before the conversion; a student who already completed one of these under the
old `TYPE_CODE` wording keeps that history, they just won't see it offered
again unless the test resets normally.

### Verify it worked
Re-run just the `select` at the top of the file — it should now show `type =
CODE_FILL` and the new `code`/`answer` content for all 10 rows. Then, in the
app, take the relevant chapter test (Stage 0, Chapters 1–10) and confirm the
fill-in-the-blank editor appears instead of a plain textarea.

---

## 3. Remove the retired Stage 0 practice challenges

**File:** `supabase/remove_stage0_practice_challenges.sql`

### Why
Ten Stage 0 practice challenges ("A Name C Will Accept" through "Choose
Enough Range") were removed from the app's UI/content earlier — this SQL is
what actually deletes their rows from the live `practice_bank` table (and,
via `on delete cascade`, their matching `practice_tests` / `practice_mistakes`
/ `practice_progress` rows). **This may already have been run** — it was
handed to you as a manual step in an earlier session and this doc can't tell
from the repo alone whether you ran it. Run the `select` first; if it returns
zero rows, it's already done and you can skip the `delete`.

### How
Same as above: open `supabase/remove_stage0_practice_challenges.sql`, run the
`select`, confirm it lists exactly those 10 titles (or confirm it returns
nothing, meaning it's already done), then run the `delete`.

### What happens
If the 10 rows are still present: they're deleted from `practice_bank`,
and every `practice_tests`, `practice_mistakes`, and `practice_progress` row
that references them is cascade-deleted too — including any student's
recorded progress specifically on those 10 challenges. Nothing else in
`practice_bank` (any other stage) or the `stages`/`chapters` tables (Stage
0's Learn content) is touched.

### Verify it worked
Re-run the `select` — it should return zero rows.

---

## 4. Experiments 0–16 (57 questions) — not ready to script yet

This is different from the items above: it is **not a "run this SQL" task**
yet, because the mapping is genuinely undecided, not just undeployed.

### Why this is blocked
The Experiments feature (Experiment 0–16, 57 questions, built earlier) is
fully implemented in the app's UI and reads its content from a JS constant
(`EXPERIMENTS` in `index.html`) — **not from Supabase**. Clicking "Open in VS
Code" on an Experiments question currently shows *"This experiment question
is not yet available through the CLICK VS Code extension"* — this is
intentional, honest behavior, not a bug: there is nowhere in the live
database for these 57 questions to live yet.

The closest existing tables are `practice_bank` / `practice_tests` /
`practice_mistakes`, but their columns don't fully cover what an Experiments
question needs:

| Experiments question needs | `practice_bank` has? |
|---|---|
| `difficulty` (easy/medium/hard) | No matching column |
| `marks`, `timeLimitSeconds`, `memoryLimitMB` | No matching columns |
| `workspaceFolder`, `file` (exact VS Code folder/file mapping) | No matching columns |
| experiment number / week grouping | Only has `stage_id`, no experiment concept |
| multiple `publicTests[]` + `hiddenTests[]` per question | `practice_tests` *can* represent this (one row per test case, with a `hidden` boolean) — this one maps reasonably well |

### What needs to happen before this can be scripted
Someone needs to decide, and confirm, one of:
- **Option A** — extend `practice_bank` with new columns (`difficulty`,
  `marks`, `time_limit_seconds`, `memory_limit_mb`, `workspace_folder`,
  `file_name`, `experiment_number`) via an `alter table` migration, then seed
  all 57 rows into `practice_bank`/`practice_tests`/`practice_mistakes`.
- **Option B** — create dedicated `experiments` / `experiment_questions`
  tables mirroring the `EXPERIMENTS` JS structure more directly, and extend
  the Edge Function + VS Code extension to read from them.

Once you pick one, I can generate the exact `alter table`/`create table` and
`insert` SQL for all 57 questions from the existing `EXPERIMENTS` data — but
I'm not going to guess at a schema change and seed real data against it
without that decision being made first, since it's not reversible in the same
low-risk way the items above are (it changes the shape of a live table other
code also reads).

---

## 5. Reference only — do not re-run

**Files:** `supabase/schema.sql`, `supabase/fix_grants.sql`

These were used once, when the Supabase project was first set up, and are
kept in the repo for reference / disaster recovery, not as a recurring task.

- **`schema.sql`** creates every table (`stages`, `questions`, `users`,
  `practice_bank`, …) from scratch and enables Row Level Security on all of
  them. The tables already exist on the live project (that's what your
  users/login/progress are stored in right now) — running this again will
  fail with "relation already exists" errors, since it has no `if not
  exists` guards. Only use it if you are standing up a **brand-new** empty
  Supabase project from zero.
- **`fix_grants.sql`** restores default Postgres privilege grants on the
  `public` schema. You'd only need this again if the schema were ever
  dropped and recreated (which `schema.sql` alone doesn't undo) — RLS with
  zero policies already blocks the `anon`/`authenticated` keys from touching
  any row directly regardless, so this is purely a "the Edge Function's
  service-role key stopped working" recovery step, not something routine.

---

## Summary checklist

- [ ] §1 — Redeploy `click-backend` Edge Function (stage_title/stage_no + CODE_FILL checking)
- [ ] §2 — Run `update_codefill_questions.sql` (10 rows, TYPE_CODE → CODE_FILL)
- [ ] §3 — Run `remove_stage0_practice_challenges.sql` if not already done (check the SELECT first)
- [ ] §4 — Decide Option A or B for Experiments, then come back for seed SQL
- [ ] §5 — No action; reference only
