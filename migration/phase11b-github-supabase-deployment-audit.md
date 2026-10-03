# Phase 11B — GitHub → Supabase / Cloudflare deployment audit (read-only)

Repository: `Andryandurai/Click-NewTrial`, branch `main`.
Audit basis: `main` tree at `656ab78` (a revert of PR #1 merge `d539355`). The tree is identical to `9c365bf`.
Date: 2026-10-03.

No secrets were added, no workflow was changed, nothing was deployed, migrated, or pushed to Supabase, and no OLD or NEW database was contacted by this audit.

## Executive Summary

- Three GitHub Actions workflows run on push to `main`: Cloudflare frontend deploy, Supabase Edge Function deploy, and Supabase migration push.
- No GitHub secrets exist in this repo (`gh secret list` returns none), so all three fail before touching anything. The failure logs confirm this for the Cloudflare and Edge Function jobs.
- The migration workflow runs `supabase db push --yes` against whatever project `SUPABASE_PROJECT_ID` names. It applies every pending migration with no approval step.
- **Blocker:** `supabase/migrations/20260924000000_clear_test_accounts.sql` runs `delete from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')`. If that migration is still pending on OLD, adding `SUPABASE_PROJECT_ID` = OLD plus `SUPABASE_DB_PASSWORD` would delete all students except two, with cascades. OLD had 354 users and 352 approved students at the last read.
- Supabase's native GitHub integration is attached to this repo and points at NEW (`eyevmykfavooeiklzebe`), per the "Supabase Preview" check on `d539355`.
- Branch protection and rulesets are unavailable on this private repo's plan (HTTP 403). Nothing gates a push to `main`.

**Recommendation:** do not add `SUPABASE_PROJECT_ID`, `SUPABASE_DB_PASSWORD`, or `SUPABASE_ACCESS_TOKEN` until the blockers in the last section are resolved.

## Current Production Branch

| Item | Value |
|---|---|
| `main` HEAD | `656ab78` (revert of PR #1 merge `d539355`) |
| Tree | identical to `9c365bf` (verified: `git diff 9c365bf 656ab78` empty) |
| Frontend `BACKEND_URL` | `https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend` (OLD, production) |
| `wrangler.jsonc` `name` | `puc-v2` (production Worker) |
| `supabase/config.toml` `project_id` | `jnxevalckgitxuunjcvv` (OLD) |
| NEW test refs on `main` | none (`eyevmykfavooeiklzebe` absent from `index.html`) |

Why the revert: PR #1 (`new-supabase-test` into `main`) brought `index.html` pointing at NEW, changed `wrangler.jsonc` to `click-test`, and merged the test migration package. The production Cloudflare job deploys whatever `wrangler.jsonc` names on `main`, so that merge would have overwritten the test Worker's name and pointed production at the test database.

## Workflow Inventory

| File | Trigger | Paths filter | Jobs | Secrets referenced | Last run on `main` |
|---|---|---|---|---|---|
| `cloudflare-frontend.yml` | push `main`; `workflow_dispatch` | `paths-ignore`: `supabase/**`, `admin-tools/**`, `vscode-extension/**`, `desktop-app/**`, `CSVs/**`, `CLICK - Google Play package/**`, `appscript-code.txt`, `.github/workflows/supabase-*.yml` | `deploy` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | failure (no token) — run `37099077528` |
| `supabase-functions.yml` | push `main`; `workflow_dispatch` | `supabase/functions/**`, `supabase/config.toml` | `deploy` | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` | failure (no token) — run `37099077522` |
| `supabase-migrations.yml` | push `main`; `workflow_dispatch` | `supabase/migrations/**` | `migrate` | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID` | failure (no token) — run `37098808143` (from the 9c365bf push) |

Other observations:
- `pull_request` triggers: none.
- Environments: none (`gh api .../environments` returned no entries). Secrets are repo-level only.
- `cloudflare-frontend.yml` does not exclude `migration/**`, so a push that only touches `migration/` triggers a Cloudflare run. It fails the same way until a token exists.
- Supabase's native GitHub integration (not a workflow): the "Supabase Preview" check on `d539355` succeeded and links to project `eyevmykfavooeiklzebe` (NEW). Whether this integration also applies migrations or deploys on `main` is not visible from the repo. Check Dashboard → project `eyevmykfavooeiklzebe` → Integrations → GitHub.

## Supabase Function Deployment Path

Workflow `supabase-functions.yml`, job `deploy`:

1. `actions/checkout@v4`, then `supabase/setup-cli@v1` (`latest`).
2. `supabase functions deploy click-backend --project-ref "$SUPABASE_PROJECT_ID"`.

Findings:
- Only `click-backend` is deployed. No other function is deployed.
- `--project-ref` is explicit and comes from the `SUPABASE_PROJECT_ID` secret. `config.toml`'s `project_id` is not used for targeting here.
- `verify_jwt = false` is applied from `supabase/config.toml` (`[functions.click-backend]`). The workflow does not pass `--no-verify-jwt`.
- No secrets are injected into the function's runtime environment by this workflow. Runtime secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_RESET_KEY`) must already be set in the Supabase project.
- Missing secret behaviour: fails. Confirmed in run `37099077522`: `Access token not provided`. If the token were set but `SUPABASE_PROJECT_ID` were empty, `--project-ref ""` would be passed. I did not test how the CLI handles an empty ref, so treat that case as unverified.

**If `SUPABASE_PROJECT_ID` = OLD (`jnxevalckgitxuunjcvv`):** the `click-backend` on production OLD is replaced with the code from `main` (currently the same code as `9c365bf`, which includes the Practice S-number labels and the Practice helper). The `main` frontend already calls OLD, so this is consistent with production.

**If `SUPABASE_PROJECT_ID` = NEW (`eyevmykfavooeiklzebe`):** NEW's `click-backend` is replaced with `main`'s code. That is the wrong target for production, because the frontend on `main` calls OLD.

## Supabase Migration Deployment Path

Workflow `supabase-migrations.yml`, job `migrate`:

1. `supabase link --project-ref "$SUPABASE_PROJECT_ID"`.
2. `supabase migration list` (visible in the run log; not a gate).
3. `supabase db push --yes`.

Findings:
- `db push` applies every migration in `supabase/migrations/` that is not yet recorded in the target's migration history. There is no approval step and no dry-run gate.
- Project target is explicit, from the `SUPABASE_PROJECT_ID` secret. `config.toml` is not used.
- The workflow does not run `migration repair`, `db reset`, or `migration up`.
- `supabase/supabase_details.md` says the baseline-repair commands in its Part A must be run against `jnxevalckgitxuunjcvv` before the first push that touches `supabase/migrations/`. Those commands are not in this workflow.
- Missing secret behaviour: fails. Run `37098808143` (from the `9c365bf` push) failed with the same missing-token error.
- The 45 migration files on `main` are the full set. The `db push` result depends entirely on the target's existing history, which this audit has not read.

## Secret / Environment Variable Requirements

| Secret | Used by | Currently set | Purpose |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare frontend | no | Wrangler auth |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare frontend | no | Account for the Worker |
| `SUPABASE_ACCESS_TOKEN` | Edge Functions, migrations | no | Supabase CLI auth |
| `SUPABASE_PROJECT_ID` | Edge Functions, migrations | no | Target project ref |
| `SUPABASE_DB_PASSWORD` | Migrations | no | Database password for `db push` |

Repo-level variables: none. Repo-level secrets: none. Secrets are not readable from here, only their names (none).

## Project Target Resolution

| Concern | Target on `main` today | Source |
|---|---|---|
| Production frontend (Cloudflare Worker `puc-v2`) | OLD backend (`jnxevalckgitxuunjcvv`) | `index.html` constant; `wrangler.jsonc` name |
| Production Edge Function | not set (job fails) | `SUPABASE_PROJECT_ID` secret |
| Production migrations | not set (job fails) | `SUPABASE_PROJECT_ID` secret |
| Test frontend (Cloudflare Worker `click-test`) | not deployed by any workflow | manual `wrangler deploy` from `new-supabase-test` (blocked) |
| Test backend | NEW (`eyevmykfavooeiklzebe`), deployed manually | manual `supabase functions deploy --project-ref` |
| NEW project | Supabase native GitHub integration (preview check) | Supabase dashboard |

`supabase/config.toml` `project_id = "jnxevalckgitxuunjcvv"`: CI always passes an explicit ref, so this value does not drive the CI jobs. It still drives any local CLI command run without `--project-ref`, which is why the repo's own docs warn against plain `supabase functions deploy`.

### Answers to the explicit questions

- **If `SUPABASE_PROJECT_ID` = OLD:** the Edge Function job deploys `click-backend` to OLD. The migrations job links OLD and applies every pending migration to OLD, including the destructive ones listed below.
- **If `SUPABASE_PROJECT_ID` = NEW:** both jobs act on NEW. The Edge Function job deploys to NEW. The migrations job applies pending migrations to NEW. NEW is believed to have all 45 applied, so the migrations job would be a no-op. The Edge Function job would still change NEW's runtime code, which is intended for testing.

## Migration File Risk Audit

Scope: the 45 files in `supabase/migrations/` on `main`. Nothing was executed.

### Statement-type classification

Read by pattern search over the file contents. Counts are matches, not exact statements.

| File(s) | Types | Notes |
|---|---|---|
| `20260101000000_baseline_schema.sql` | CREATE TABLE (no `IF NOT EXISTS`, 8 tables checked), RLS enable | Fails on a database that already has these tables. Safe only if OLD's history already records it. |
| `20260907090000_remove_stage0_practice_challenges.sql` | DELETE (`practice_bank`) | Cascades to `practice_progress` and `practice_tests` |
| `20260907090100_update_codefill_questions.sql` | UPDATE (curriculum) | Data transformation |
| `20260907120000_experiments_practice_columns.sql` | ALTER TABLE (`practice_bank`) | Adds columns |
| `20260907120100_seed_experiments_practice_bank.sql` | INSERT | Seed rows |
| `20260907130000_add_username.sql` | ALTER TABLE (`users`) | Adds a column |
| `20260910120000_content_stage0_foundations.sql` | INSERT / UPSERT curriculum | Large content load |
| `20260910130000_add_missing_legacy_glossary_terms.sql` | INSERT (`on conflict do nothing`) | Idempotent |
| `20260911120000_content_stage123.sql` | ALTER TABLE (`chapters`), INSERT | Curriculum |
| `20260912120000_content_stage45.sql` | INSERT | Curriculum |
| `20260913120000_content_practice_stage0to5.sql` | INSERT | Practice content |
| `20260913130000_practice_stage0_hints.sql` | UPDATE (Practice) | Data transformation |
| `20260914120000_staff_monitoring.sql` | CREATE TABLE, RLS enable (`staff_users`, `staff_sessions`, `sections`, `student_section_assignments`) | New tables |
| `20260915120000_practice_stage0to5_hidden_tests.sql` | INSERT (Practice tests) | Practice content |
| `20260916120000_remove_experiments.sql` | DELETE (`practice_mistakes`, `practice_tests`, `practice_progress`, `practice_bank`) | **Deletes student progress rows** for experiment items |
| `20260917120000_stage6to10_placeholders.sql` | INSERT | Placeholder curriculum |
| `20260918120000_stage5_loops_blank_to_codefill.sql` | UPDATE | Data transformation |
| `20260919130000_match_following_to_codefill.sql` | DELETE (`options`, 2 question IDs), UPDATE | Removes answer options |
| `20260919140000_ch0035_question_limit_fix.sql` | UPDATE | Data fix |
| `20260920100000_staff_messages.sql` | CREATE TABLE, RLS enable (`staff_messages`) | New table |
| `20260921000000_staff_messages_seen.sql` | ALTER TABLE (`staff_messages`) | Adds column |
| `20260922000000_insert_ch_else_if.sql` | INSERT | Curriculum |
| `20260923000000_content_fixes.sql` | UPDATE | Data fix |
| `20260924000000_clear_test_accounts.sql` | **DELETE (`users`)** | **Critical, see below** |
| `20260926150000_learn_content_corrections.sql` | not classified (no match for the pattern set); reviewed by name only | Learn content corrections |
| `20260927000000_content_stage6_arrays.sql` | INSERT | Curriculum |
| `20260928000000_unlock_stage6_arrays.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20260928020000_content_stage8_searching_sorting.sql` | INSERT | Curriculum |
| `20260928030000_unlock_stage8_searching_sorting.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20260928040000_content_stage7_strings.sql` | INSERT | Curriculum |
| `20260928050000_unlock_stage7_strings.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20260928060000_content_stage9_functions.sql` | INSERT | Curriculum |
| `20260928070000_unlock_stage9_functions.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20260929000000_structure_number_crunching_patterns.sql` | ALTER / UPDATE (structure) | Stage structure |
| `20260929010000_content_stage7_patterns.sql` | INSERT | Curriculum |
| `20260929020000_unlock_stage7_patterns.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20260930000000_content_stage6_number_crunching.sql` | INSERT | Curriculum |
| `20260930010000_unlock_stage6_number_crunching.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20261001000000_content_stage12_pointers.sql` | INSERT | Curriculum |
| `20261001010000_unlock_stage12_pointers.sql` | DELETE (`prerequisites`, self-lock rule) | Changes gating |
| `20261001020000_fix_stage6_chapter_order.sql` | DELETE (`prerequisites`), UPDATE | Changes gating and order |
| `20261001030000_activity_attempts.sql` | RLS enable (`activity_attempts`) | Access change |

No `DROP` statements (table, column, policy, function, trigger, index, schema, type, view) were found in any file.

### Critical findings

1. **`20260924000000_clear_test_accounts.sql`**: `delete from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E');`
   - The file's own comment says it clears "dev-team/QA test accounts and a handful of early signups from before the real 490-student rollout".
   - Every table keyed on `users(user_id)` cascades: sessions, attempts, test_runs, learn_progress, practice_progress, practice_pairings, student_section_assignments, staff_messages.
   - The last OLD read showed 354 users and 352 approved students (excluding the two protected accounts). This migration would delete about 352 students and their progress if OLD had not yet recorded it.
   - Whether it is already recorded on OLD is not known from this audit. Read `supabase migration list` against OLD (read-only) before adding any production secret.

2. **`20260916120000_remove_experiments.sql`** and **`20260907090000_remove_stage0_practice_challenges.sql`**: both delete `practice_bank` rows. `practice_progress` cascades from `practice_bank`, so student Practice progress for those items would be deleted on OLD.

3. **Eight migrations that delete `prerequisites` rows** (seven `unlock_*` files: `20260928000000`, `20260928030000`, `20260928050000`, `20260928070000`, `20260929020000`, `20260930010000`, `20261001010000`; plus `20261001020000_fix_stage6_chapter_order.sql`): each deletes `prerequisites` rows. The Phase 11 decision was to exclude the five STG007–011 self-lock rows. Applying these on OLD would change which students can open which stages.

4. **Baseline** (`20260101000000`): `create table` without `if not exists`. On OLD this errors and stops the `db push` run if OLD has no recorded baseline. It is a safe failure, but it means the first OLD run would fail for the reason above, not because of content.

5. **RLS enabled without policies** (`20260914120000`, `20260920100000`, `20261001030000`): RLS blocks any direct PostgREST access by `anon` or `authenticated`. The backend uses the service role, which bypasses RLS. This is only safe if no client reads these tables directly. This audit did not verify that.

### Ordering and conditions

- `db push` applies in timestamp order. The 2026-10-01 corrective migrations depend on the content migrations before them.
- `20261001020000_fix_stage6_chapter_order.sql` assumes the chapter rows from `20260930000000` exist.
- Data-changing migrations (`update`, `delete`) are not idempotent. A second run would not repeat their effect, but a rebuilt database may differ.

## OLD vs NEW Target Matrix

| Workflow / command | Trigger | Project source | Explicit ref? | Could target OLD? | Could target NEW? | Migration? | Function deploy? |
|---|---|---|---|---|---|---|---|
| `cloudflare-frontend.yml` → Worker `puc-v2` | push `main` | `wrangler.jsonc` name | n/a (Worker name) | no (Worker, not Supabase) | no | no | no |
| `supabase-functions.yml` | push `main` (`supabase/functions/**`, `config.toml`) | `SUPABASE_PROJECT_ID` secret | yes | yes, if secret = OLD | yes, if secret = NEW | no | yes (`click-backend` only) |
| `supabase-migrations.yml` | push `main` (`supabase/migrations/**`) | `SUPABASE_PROJECT_ID` secret | yes (`link`) | yes, if secret = OLD | yes, if secret = NEW | yes (`db push --yes`) | no |
| Supabase native GitHub integration (preview) | PR / branch events | Supabase dashboard | unknown | not from repo | yes (preview check links NEW) | unknown | unknown |
| Manual `supabase functions deploy` (local) | manual | `config.toml` `project_id` unless `--project-ref` | only if passed | **yes**, if run without `--project-ref` | yes, with `--project-ref` | no | yes |

## Test vs Production Separation

- `new-supabase-test` is not deployed by any workflow. Its frontend change is not on `main`.
- `main` contains no `eyevmykfavooeiklzebe` reference (verified: `git grep` for the NEW ref on `main` returns nothing).
- The NEW Edge Function was deployed manually, not by CI. The Supabase native integration is attached to NEW.
- The Cloudflare test Worker `click-test` is not deployed by any workflow. The deploy was attempted manually and blocked (see Blockers).

## Findings

1. **No secrets exist.** All three workflows fail at authentication. That is the current safe state.
2. **`main` pushes already triggered the workflows twice** (`9c365bf`, PR merge `d539355`, revert `656ab78`). Each push produced red checks. Pushing any change under `supabase/`, `wrangler.jsonc`, `index.html`, or `migration/` (not excluded) will produce more.
3. **Production frontend target is OLD on `main`**, which is correct. The test merge briefly pointed it at NEW and was reverted.
4. **The migration workflow applies all pending migrations without approval.** Combined with item 1 in Critical findings, this is the main hazard.
5. **Branch protection and rulesets are not available** on this private repo (HTTP 403). There is no review gate on `main`.
6. **`config.toml` names OLD** (`project_id = "jnxevalckgitxuunjcvv"`). CI passes explicit refs, but any local command without `--project-ref` targets OLD.
7. **The Supabase native integration is attached to NEW** and also reacts to `main` pushes (preview check).
8. **The `supabase_details.md` warning about REC-ACADEMIC** (`zwdmredbjktvecvpfurx`, a project connected by mistake earlier) was not verified against the Supabase dashboard. If that connection still exists, it should be removed.

## Blockers

- **B1.** `20260924000000_clear_test_accounts.sql` on the migration path to OLD. Must be resolved before any `SUPABASE_PROJECT_ID` = OLD secret is added.
- **B2.** OLD's migration history is unknown. Read it with `supabase migration list` against OLD (read-only), using an access token, before deciding the migration path.
- **B3.** No production target decision is recorded for Edge Functions and migrations.
- **B4.** Phase 11A Cloudflare test deploy was denied by the auto-mode classifier and is not done.

## Required Actions Before Adding Secrets

1. Read OLD's migration history (`supabase migration list`, read-only) and record which of the 45 files are applied.
2. For each pending file, decide: apply, mark as applied (`migration repair`), or remove. Decide `20260924000000_clear_test_accounts.sql` explicitly. Do not let it run by default.
3. Confirm the baseline's state on OLD before any `db push`.
4. Add environment protection: a GitHub `production` environment with required reviewers, and move the secrets into it, so a push cannot deploy without approval.
5. Make the migration and function jobs assert the expected project ref (refuse to run if `SUPABASE_PROJECT_ID` is not the intended value).
6. Remove the REC-ACADEMIC native integration if it is still connected.
7. Decide whether Supabase's native integration should be disconnected from the repo (it currently reacts to NEW only).

## Recommended Next Phase

- Read-only: `supabase migration list` against OLD with an access token supplied interactively, not stored in the repo.
- Decide the `clear_test_accounts` migration with the owner.
- Add the production environment and assertions before any secret is added.

## Secret Values

None are recorded here. Only names and presence (none set) are reported.

## Exact recommended secret configuration (for later)

- Environment `production` (GitHub → Settings → Environments), with required reviewers.
- Secrets in that environment: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` = `jnxevalckgitxuunjcvv` (only after B1–B3 are resolved), `SUPABASE_DB_PASSWORD`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Do not set `SUPABASE_PROJECT_ID` to `eyevmykfavooeiklzebe` on `main`.

## Explicit statement

**Which project should NOT receive production secrets yet:** NEW (`eyevmykfavooeiklzebe`) must not receive production secrets, because it is the test project. OLD (`jnxevalckgitxuunjcvv`) must not receive the migration secrets until B1 and B2 are resolved, because the pending `clear_test_accounts` migration would delete its students.
