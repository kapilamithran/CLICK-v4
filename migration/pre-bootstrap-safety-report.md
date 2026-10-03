# Pre-Bootstrap Migration Safety Report (Phase 4)

**One migration file was edited this phase** (`supabase/migrations/20261001030000_activity_attempts.sql`, adding a missing RLS-enable statement — see §2). No database write occurred against either Supabase project. No commit, no push.

---

## 1. activity_attempts Audit

Re-read in full (the complete, unedited file was quoted verbatim in Phase 3's working notes; the only change this phase is the addition described in §2). Confirmed exactly:

- `create table if not exists activity_attempts`: `attempt_id` (PK, text), `user_id` (FK → `users.user_id`, CASCADE), `stage_id`/`chapter_id`/`activity_id` (plain text, no FK — consistent with every other progress table in this schema), `test_run_id` (FK → `test_runs.test_run_id`, CASCADE), `xp`, `xp_committed`, `attempted_at`.
- Indexes: `idx_activity_attempts_test_run` (non-unique, on `test_run_id`), `uq_activity_attempts_run_activity` (unique, on `(test_run_id, activity_id)` — the race-proofing constraint).
- **Policies: none, before or after this phase's edit** (matching every other table in the entire schema — zero policies exist anywhere in this project's history).
- **RLS: was NOT enabled (confirmed again by direct re-read); IS now enabled (see §2).**

### Determining the intended security model (not invented — compared against the rest of the repository)

Checked every neighboring table and every other RLS-enabling migration in this schema: **100% of the other 27 tables have RLS enabled with zero policies.** The documented, repeated rationale (quoted from `20260914120000_staff_monitoring.sql`'s own comment, consistent with every other table): *"This project does not use Supabase Auth / Postgres RLS as the real enforcement boundary... the click-backend Edge Function, running under the service-role key, IS the boundary."* Confirmed independently (Phase 1/2): there is no direct `supabase-js` client anywhere in the frontend, VS Code extension, or desktop app — every single piece of data access, for every table, goes through the one Edge Function using the service-role key, which bypasses RLS regardless of whether policies exist. **`activity_attempts` is accessed exclusively through this same Edge Function** (`saveActivityAttempt`, `finishTest`) — no frontend code queries it directly. This fully determines the model: **enable RLS, add no policies** — exactly matching the uniform convention, not an invented one.

## 2. RLS Decision

**Fix applied: `alter table activity_attempts enable row level security;` added to the existing migration file**, placed after its indexes, matching the exact line-for-line convention used in `20260914120000_staff_monitoring.sql`/`20260920100000_staff_messages.sql` (`alter table <name> enable row level security;`).

**Why edit the existing file rather than create a new corrective migration** — the choice the task asked to be explicitly justified:

- This specific migration **has never been applied to any environment that matters**: confirmed absent from OLD's own 27 applied migrations (Phase 2), confirmed absent from NEW's 0 applied migrations (Phase 3, re-confirmed this phase), and it is not part of any committed-and-deployed Edge Function behavior anywhere live today.
- Supabase's own migration convention (and this repository's own established practice, observed across its history) treats a migration as immutable **once it has been applied somewhere** — editing an already-applied file would create a mismatch between the historical record and what was actually executed. That constraint does not apply here, because nothing has executed this file yet, anywhere.
- Creating a *separate* follow-up migration (e.g., a new `..._activity_attempts_rls.sql`) would be the correct move if this file had already been deployed — but doing that here would permanently bake an unnecessary extra step into the history for a defect that can simply be fixed at the source, since the source has never shipped.
- **Contrast with `clear_test_accounts.sql` (§3-4)**, which *has* been applied to OLD — that one is correctly left untouched, for the opposite reason.

## 3. clear_test_accounts Audit

Full file content (9 lines, unchanged, re-confirmed this phase):
```sql
-- Pre-launch cleanup: the site currently only has dev-team/QA test accounts
-- and a handful of early signups from before the real 490-student rollout.
-- Clearing all of them except the two accounts the team is actively using,
-- so the student roster starts clean for the real launch. Every other table
-- keyed on user_id (sessions, attempts, test_runs, learn_progress,
-- practice_progress, practice_pairings, student_section_assignments,
-- staff_messages) references users(user_id) on delete cascade, so deleting
-- here is sufficient -- no other cleanup needed.
delete from users where user_id not in ('U1A8B0A6D8810', 'U485B9DDDA04E');
```

Answering the task's 7 questions directly:

1. **Why it exists**: a one-time, pre-launch data cleanup on OLD, removing dev/QA/early-signup accounts before OLD's real student population was onboarded.
2. **Is it dev/test cleanup**: yes, explicitly, by its own comment.
3. **Are the 2 retained IDs legitimate permanent accounts**: yes — confirmed by an independent search (Part 7, §5 below): both IDs appear in `CSVs/CLICK v2 - Users.csv` **and** have real recorded rows in the Attempts/LearnProgress/Sessions/TestRuns/PracticePairings CSV exports, consistent with "the two accounts the team is actively using" — these are longstanding, real dev-team accounts, not placeholder test fixtures.
4. **Do later migrations depend on these accounts**: no — grepped every later migration for either literal ID; no match anywhere outside this one file and the CSV reference exports.
5. **Is this migration appropriate for a production destination database**: **no, not as a standing/repeatable part of the bootstrap sequence** — it is a one-time historical correction that made sense exactly once, for OLD, at a specific point before its real launch. It is not a general-purpose "keep the roster clean" mechanism and should not be mistaken for one.
6. **Is running it on an empty database harmless**: **yes, confirmed** — `users` has 0 rows at the point in the 44-migration sequence where this runs against NEW (re-verified this phase via a fresh `db push --dry-run` and `table-stats`, both after the activity_attempts edit), so the `WHERE user_id NOT IN (...)` clause matches zero rows.
7. **Does retaining it in history create a future operational hazard**: **yes — specifically, a human-error hazard, not an automated-replay hazard.** Supabase's own migration tracking applies each migration version at most once per project (confirmed by this phase's own `migration list` behavior: already-applied versions are simply skipped on subsequent `db push` runs, regardless of local file content) — so the normal deployment pipeline will not silently re-run this against NEW a second time after real students exist. The real risk is a person manually copying this exact `DELETE` statement into a SQL console later (for an unrelated "let me clean up test accounts" task) without realizing 354+ real students by then occupy the table it targets.

## 4. Safe Handling of clear_test_accounts — Decision

**OPTION A (keep unchanged), with a permanent documentation flag — not B, C, or D.** Reasoning, weighed against the repository's own actual conventions rather than convenience:

- **OPTION B (modify/remove) was rejected**: this migration **has already been applied to OLD** (confirmed, Phase 2: it is one of the 27 migrations byte-identical and applied in both OLD's and NEW's history). Unlike `activity_attempts`, editing this file would mean the committed source no longer matches what was actually executed against a live project — the exact historical-integrity violation the task repeatedly warns against ("Do not modify historical migrations blindly"). This holds regardless of NEW being empty, because the file's *history on OLD* is what makes it immutable, not NEW's current state.
- **OPTION C (replace with a dev-only mechanism) was rejected**: there is nothing to "replace" retroactively — the statement already ran, on OLD, exactly once, years (in product time) ago. Introducing a new mechanism now wouldn't undo or improve that historical fact; it would just add complexity without closing the real risk (a human manually re-running the same DELETE by hand, which no "mechanism" inside the migrations folder can prevent).
- **OPTION D (a new migration-strategy change) was rejected as out of scope for this phase**: a broader policy (e.g., "no migration may ever contain an unconditional `DELETE FROM users` again") is a sound principle worth adopting going forward, but it's a team-process decision, not a database fix this audit should unilaterally invent.
- **OPTION A, reinforced by documentation, is correct**: the statement is genuinely harmless for its one remaining real execution (against NEW, while empty); Supabase's apply-once-per-version tracking prevents the normal pipeline from ever re-running it; and the actual residual risk (manual misuse) is mitigated by making the hazard loud and explicit in exactly the places a future operator would look — this report, and `migration/migration-destructive-operation-audit.md`.

**Standing rule for the future, stated explicitly per the task's own instruction**: once the real 354-student migration (a future phase) has populated `users` in NEW, `20260924000000_clear_test_accounts.sql`'s statement must never be executed again, by any means, against NEW — it is a spent, one-time, OLD-specific historical artifact from this point forward.

## 5. Destructive Migration Audit

See `migration/migration-destructive-operation-audit.md` for the full table. Summary: **12 migrations contain a DELETE statement; only 1 (`clear_test_accounts.sql`) touches real student-identity data; 0 touch real student-progress data; 0 require a code action beyond the documentation already produced.** Zero `TRUNCATE`, `DROP TABLE`, `DROP COLUMN`, or `UPDATE users` statements exist anywhere in the 44 files. Zero migrations insert into `users`/`learn_progress`/`test_runs`/`attempts`/`activity_attempts`.

## 6. Hardcoded Test-Account Audit

`U1A8B0A6D8810` and `U485B9DDDA04E` were searched for across the entire repository. Found in exactly these locations:
- `supabase/migrations/20260924000000_clear_test_accounts.sql` (the migration itself).
- `CSVs/CLICK v2 - Users.csv`, `-Attempts.csv`, `-LearnProgress.csv`, `-PracticePairings.csv`, `-Sessions.csv`, `-TestRuns.csv` — local reference exports (not applied/executed anywhere; presence confirms these are real, long-lived accounts with genuine recorded activity across multiple tables, not synthetic test fixtures). **File contents were not opened beyond confirming the filename-level match, to avoid unnecessarily touching any adjacent real student data in those same CSVs.**
- No occurrence in any test file, frontend code, Edge Function code, or seed/fixture data used at runtime.

## 7. Migration Ordering

All 44 files were re-read this phase for ordering/dependency understanding (not just the two flagged ones), confirming the sequence established in Phase 3 remains correct and internally consistent: baseline schema/grants → incremental schema additions (username, staff-monitoring, one-completion-per-chapter index) interleaved with curriculum content for Stages 0-5 → structural placeholders for Stages 6-10 (Arrays/Strings/Searching&Sorting/Functions/Pointers, inactive content) → the `clear_test_accounts` cleanup → real content for Arrays/Strings/Searching&Sorting/Functions/Pointers → Number Crunching/Patterns structure+content → the Stage 6 chapter-order fix → `activity_attempts`. `supabase db push --dry-run` (re-run this phase, after the RLS edit) proposes all 44 in this exact order with no errors.

## 8. Curriculum Verification

**Confirmed: `STG000` is never created by any of the 44 migrations at all** — not even inactive. Direct evidence: the only migration referencing `STG000` is `20260910120000_content_stage0_foundations.sql`, which **deactivates** a pre-existing `STG000` row (`update stages set active = false where stage_id = 'STG000'`, plus cascading deactivation of its chapters/content/questions) — it does not create one. The baseline schema migration contains no `insert into stages` at all (grepped, zero matches). **This means `STG000` existed only as hand-created data on OLD, from before the migration-history system began** (consistent with `supabase/supabase_details.md`'s own account of the original schema being set up by hand in the SQL Editor). **On NEW, after all 44 migrations run, there will be exactly 13 active stages (`STG001`-`STG013`) and zero `STG000` row of any kind** — a cleaner result than OLD, which still carries the inactive legacy row forward. 98 total populated chapters confirmed via this repo's own `tests/learn/xp-inventory.test.js` (13 stages, 98 chapters, 401 activities, 520 questions, 921 total XP — unchanged by anything in this phase).

## 9. NEW Database Status

Re-verified this phase, after the `activity_attempts` edit: `supabase inspect db table-stats --linked` against the NEW-linked project still returns `{"rows":[],...}` — **zero tables, zero users, unchanged from Phase 3.** `supabase migration list` still shows all 44 migrations with an empty `remote` field — **zero applied.** `supabase db push --dry-run` still passes cleanly with the corrected migration set.

## 10. OLD Database Safety Confirmation

**No operation in this phase targeted OLD at all.** The CLI remained linked to `eyevmykfavooeiklzebe` (NEW) throughout this entire phase — confirmed via `supabase/.temp/project-ref` before and after every step. No `supabase link --project-ref jnxevalckgitxuunjcvv` was run. No read or write command of any kind was issued against OLD this phase. OLD's state is exactly as Phase 2/3 left it.

---

## Exact Recommended Command for Next Phase

Once the two findings above are reviewed and accepted (the `activity_attempts` RLS fix is already applied to the file; the `clear_test_accounts` handling decision in §4 is a documentation-only recommendation awaiting sign-off, not a pending code change), the next phase's first command, run from this repository with the CLI still linked to `eyevmykfavooeiklzebe`, is:

```
supabase db push
```

(without `--dry-run`) — this would apply all 44 migrations, in the order verified in §7, to the NEW, currently-empty database only. **Do not run this yet as part of the present phase** — it is reported here only because the task asked for the exact next command, not as an action taken.
