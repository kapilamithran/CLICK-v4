# Phase 11C — CI gating and OLD migration-history audit

Date: 2026-10-03. Repository: `Andryandurai/Click-NewTrial`.

Not done in this phase: no Supabase write, no migration applied or repaired, no secret added, no deployment (Cloudflare or Edge Functions), no student data changed, no account deleted, no file deleted.

## 1. Git State

| Item | Value |
|---|---|
| Local working branch (not switched) | `new-supabase-test` |
| Local untracked files | `test-click.html` only (not committed) |
| `main` HEAD | `fd91039` (CI gating) on top of `0820485` (Phase 11B audit) on top of `656ab78` (revert) |
| `main` contains `656ab78` | yes |
| `50d1248` in `main` history | yes, as the second parent of the reverted merge `d539355`. Its content is **not** in `main`'s tree. |
| NEW ref (`eyevmykfavooeiklzebe`) in `main` `index.html` | 0 occurrences |
| OLD ref (`jnxevalckgitxuunjcvv`) in `main` `index.html` | 1 occurrence (production target, correct) |
| `main` `wrangler.jsonc` name | `puc-v2` |

`50d1248` is an ancestor of `main` only through the reverted merge. The tree shows none of its changes, so the production frontend is not the test frontend.

## 2. Workflow Inventory (on `main`)

| Workflow | Trigger | Secrets required | Project / target | Deploy or migration command | Push to `main` can trigger it |
|---|---|---|---|---|---|
| `cloudflare-frontend.yml` ("Deploy Cloudflare Frontend") | push `main` (except `supabase/**`, `admin-tools/**`, `vscode-extension/**`, `desktop-app/**`, `CSVs/**`, Google Play folder, `appscript-code.txt`, `supabase-*.yml`); `workflow_dispatch` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Worker named in `wrangler.jsonc` (`puc-v2`, production) | `wrangler-action@v3` with `wranglerVersion 4.131.1`, `command: deploy` | yes (also on `migration/**` and any non-excluded path) |
| `supabase-functions.yml` ("Deploy Supabase Edge Functions") | push `main` (`supabase/functions/**`, `supabase/config.toml`); `workflow_dispatch` | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID` | `SUPABASE_PROJECT_ID` secret (explicit `--project-ref`) | `supabase functions deploy click-backend --project-ref "$SUPABASE_PROJECT_ID"` | yes, on those paths |
| `supabase-migrations.yml` ("Deploy Supabase Migrations") | push `main` (`supabase/migrations/**`); `workflow_dispatch` | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID` | `SUPABASE_PROJECT_ID` secret (explicit `link --project-ref`) | `supabase link`, `supabase migration list`, `supabase db push --yes` | yes, on those paths |

Repository secrets: none (checked in Phase 11B). Environments: none. Branch protection and rulesets: unavailable on this private repo's plan (HTTP 403).

## 3. Current CI Failure Cause

Each deploy job failed at authentication because its secrets are not set:
- Cloudflare: `In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN` (runs `37099077528`, `37099346747`).
- Edge Functions: `Access token not provided` (run `37099077522`). The job env showed `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID` empty.
- Migrations: same missing-token failure (run `37098808143`).

Nothing was deployed or migrated. The red checks were the only effect.

## 4. CI Gating Change

**Changed files (commit `fd91039`, pushed to `main` as a fast-forward):**
- `.github/workflows/cloudflare-frontend.yml`
- `.github/workflows/supabase-functions.yml`
- `.github/workflows/supabase-migrations.yml`

**What changed:** each workflow gets a `credentials` job. It sets a step output `enabled=true` only when its required secrets are non-empty, and `enabled=false` otherwise. The existing deploy/migrate job now has `needs: credentials` and `if: needs.credentials.outputs.enabled == 'true'`.

**Why this is necessary:** the deploy job cannot be gated on `secrets` directly in a job-level `if:`, because the `secrets` context is not available there. The credential check therefore runs as a step, where `secrets` is available, and passes its result through `needs`.

**What stays unchanged:** deploy and migrate steps, commands, the `wrangler.jsonc` Worker name, the `--project-ref "$SUPABASE_PROJECT_ID"` targeting, `verify_jwt` from `config.toml`, and the `db push` command. The diff only adds lines (68 insertions, 0 deletions).

**Behaviour:**
- Secrets absent: `credentials` succeeds, the deploy/migrate job is **skipped** (green, no deployment).
- Secrets present: the deploy/migrate job runs exactly as before, against whatever `SUPABASE_PROJECT_ID` names.
- The gate does not choose a project and does not hardcode OLD or NEW.

**Verification:**
- YAML parsed for all three files; each has `credentials` plus the deploy job with the correct `needs` and `if`.
- The gate script was run locally in both branches with environment values unset (`enabled=false`) and with dummy non-empty values for local-only testing (`enabled=true`). No request was made.
- GitHub run `37099510325` (Cloudflare, triggered by `fd91039`): `credentials` **success**, `deploy` **skipped**, overall **success**.

**No Supabase project was contacted by the workflow change.** The Supabase workflows do not run on the `main` push, since the change does not touch their paths.

## 5. OLD Migration History

Read-only query, method: `supabase db query --linked --project-ref jnxevalckgitxuunjcvv --file <SELECT on supabase_migrations.schema_migrations>`. A guard refused any non-SELECT statement. The query returned only `version` and `name`. The CLI `migration list` command was not run: its help shows it needs `--password` for a direct connection, and no password was provided.

| Item | Result |
|---|---|
| Migrations recorded on OLD | 26 |
| Local migration files | 45 |
| Recorded on OLD but not in local files | 0 |
| Local files not recorded on OLD (pending) | 19 |
| `20260924000000` | **recorded as applied on OLD** (name `clear_test_accounts`) |

**Status of `20260924000000_clear_test_accounts.sql`: APPLIED (recorded in OLD's migration history).**

Whether its `delete` actually ran is not established by the history. `schema_migrations` has no timestamp column, so the time it was recorded is unknown.

Data evidence (aggregate read of `users`, no personal data):
- 354 users in total, all `status = active`, all `role = student`.
- The two protected accounts (`U1A8B0A6D8810`, `U485B9DDDA04E`) are both present.
- The other 352 accounts are present. The migration's `delete ... not in (...)` would have removed them if it had run after they existed.
- `joined_at` ranges from 2026-09-03 to 2026-10-02. 248 accounts joined before 2026-09-25 (the migration file's date).

Interpretation: the history records the migration as applied, but the users it targets are still there. Two explanations fit: it was applied before any of these users existed (so it removed nothing), or it was recorded without its statement having an effect. The current data cannot distinguish them. Either way, `supabase db push` will not run it again on OLD while the history record exists.

**Correction to the Phase 11B report:** that report described this migration as pending and said it would delete about 352 students if run. The history shows it as applied, so the blocker is narrower than stated. The file stays dangerous if the history record is ever removed, if the database is rebuilt, or if it is re-applied by a repair. It should not be run or repaired without a decision.

## 6. Other Pending Migrations on OLD

Nineteen local files are not recorded on OLD. If `supabase db push` ran against OLD now, these would be applied in timestamp order:

| File | Statement types (pattern search) | Notes |
|---|---|---|
| `20260910130000_add_missing_legacy_glossary_terms.sql` | INSERT (`on conflict do nothing`) | Idempotent |
| `20260926150000_learn_content_corrections.sql` | no match for the pattern set | Reviewed by name only |
| `20260927000000_content_stage6_arrays.sql` | INSERT | Curriculum |
| `20260928000000_unlock_stage6_arrays.sql` | DELETE `prerequisites` | Self-lock rule |
| `20260928020000_content_stage8_searching_sorting.sql` | INSERT | Curriculum |
| `20260928030000_unlock_stage8_searching_sorting.sql` | DELETE `prerequisites` | Self-lock rule |
| `20260928040000_content_stage7_strings.sql` | INSERT | Curriculum |
| `20260928050000_unlock_stage7_strings.sql` | DELETE `prerequisites` | Self-lock rule |
| `20260928060000_content_stage9_functions.sql` | INSERT | Curriculum |
| `20260928070000_unlock_stage9_functions.sql` | DELETE `prerequisites` | Self-lock rule |
| `20260929000000_structure_number_crunching_patterns.sql` | INSERT / UPDATE / CREATE TABLE | Stage structure |
| `20260929010000_content_stage7_patterns.sql` | INSERT | Curriculum |
| `20260929020000_unlock_stage7_patterns.sql` | DELETE `prerequisites` | Self-lock rule |
| `20260930000000_content_stage6_number_crunching.sql` | INSERT | Curriculum |
| `20260930010000_unlock_stage6_number_crunching.sql` | DELETE `prerequisites` | Self-lock rule |
| `20261001000000_content_stage12_pointers.sql` | INSERT | Curriculum |
| `20261001010000_unlock_stage12_pointers.sql` | DELETE `prerequisites` | Self-lock rule |
| `20261001020000_fix_stage6_chapter_order.sql` | DELETE `prerequisites`, UPDATE | Chapter order rules |
| `20261001030000_activity_attempts.sql` | ALTER TABLE ... ENABLE ROW LEVEL SECURITY | Access change, no data change |

## 7. Destructive Migration Findings

- **Pending on OLD, destructive to rules (not student rows):** eight migrations delete `prerequisites` rows. Their effect is to change which students can open which stage or chapter. These were written to remove self-lock rules; the five STG007–011 self-lock decision from earlier still applies.
- **Already recorded on OLD, destructive to data:** `20260924000000_clear_test_accounts.sql` (see section 5). Its effect on the current population is not established.
- **Already recorded on OLD, destructive to Practice data:** `20260916120000_remove_experiments.sql` and `20260907090000_remove_stage0_practice_challenges.sql` delete `practice_bank` rows, which cascade to student `practice_progress`. Both are recorded as applied, so `db push` will not run them again on OLD.
- **No `DROP` statements** were found in any migration.
- **RLS enabled without policies** in `20260914120000`, `20260920100000`, and `20261001030000` (the last is pending). The backend uses the service role, which bypasses RLS. Direct client reads of these tables were not checked.
- **Baseline** `20260101000000` creates tables without `IF NOT EXISTS`. It is recorded on OLD, so it will not run.

## 8. Supabase Target Safety

**OLD: `jnxevalckgitxuunjcvv` (production)**
- Frontend on `main` calls OLD. Correct.
- `supabase/config.toml` names OLD. CI passes an explicit ref, but local commands without `--project-ref` would target OLD.
- Current state: 354 active students, 26 migrations recorded, 19 pending. Nothing in this phase changed it.
- No production secret should be added until the 19 pending migrations are reviewed and the pending decisions below are made.

**NEW: `eyevmykfavooeiklzebe` (test)**
- The Supabase native GitHub integration is attached to the repo and points here (the "Supabase Preview" check on `d539355`).
- Test backend (`click-backend` version 3) is deployed here manually.
- Must not receive production secrets.

## 9. test-click.html Status

Untracked, 4,357,080 bytes, 3,536 lines, `<title>CLICK v16`. It references the NEW backend once and the OLD backend zero times. It looks like a generated copy of the frontend for the test site. It is **left untouched** and not committed, because I cannot confirm that it has no user changes.

## 10. /tmp-free-check.txt Status

Checked `/tmp-free-check.txt` (Git Bash root). **Not found.** Nothing to delete at that path. An earlier note in this session said it existed; that note was incorrect.

## 11. Git Changes

This phase's own changes (all on `main`):
- `migration/phase11c-ci-and-old-migration-history-audit.md` (this report), added by the docs commit below.
- `migration/phase11c-ci-and-old-migration-history-summary.json`, added by the same commit.

Earlier in this phase:
- `.github/workflows/cloudflare-frontend.yml`, `.github/workflows/supabase-functions.yml`, `.github/workflows/supabase-migrations.yml`: CI gating, commit `fd91039`.

Not modified: `supabase/migrations/*` (including `20260924000000_clear_test_accounts.sql`), `supabase/config.toml`, `index.html`, `wrangler.jsonc`, any Supabase or Cloudflare resource.

## 12. Next Gate

Before any Supabase production secret is added:

1. **Decide the status of `20260924000000_clear_test_accounts.sql` on OLD.** Its record says applied; the current data says its delete did not remove anyone. Confirm with the owner whether the record is genuine. Do not run `migration repair` or delete the file until that is settled.
2. **Review the 19 pending migrations on OLD.** Decide, for each: apply, mark applied, or remove. The eight prerequisite-deleting migrations need a decision about the self-lock rules.
3. **Decide the production target** for Edge Functions and migrations. It is currently undecided; the CI gate only skips deploys while the secrets are absent.
4. **Add environment protection** (`production` environment with required reviewers) before any production secret is added, so a push cannot deploy without approval.
5. **Assert the expected project ref** in the migration and function jobs, so a wrong `SUPABASE_PROJECT_ID` fails loudly.
6. **Cloudflare:** adding `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` would make the `puc-v2` production deploy run on every frontend push to `main`. Decide that deliberately.

Test deployments (Cloudflare `click-test`, and the NEW backend) are separate from these gates and were not affected by this phase.
