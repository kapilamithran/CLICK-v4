# Final cutover master report — CLICK OLD → NEW

Date: 2026-10-03. Repository: `Andryandurai/Click-NewTrial`.

## Final status

**NOT READY**

Production remains on OLD (`jnxevalckgitxuunjcvv`). No student data was migrated. No production deployment happened. The hard gates (student reconciliation, student authorization, production cutover) were not passed.

Why it stopped:
- The live OLD source no longer matches the figures in the master plan, and the protected-account state differs (section I).
- The Cloudflare test deploy was denied by the auto-mode permission classifier, so the test frontend could not be verified in a browser (section E).
- Production GitHub environment protection cannot be established from this tooling (section H).

## A. Starting state

| Item | Value |
|---|---|
| Working branch (not switched) | `new-supabase-test` |
| `main` HEAD at start | `cff2af8` (verified in the Phase 11D commit history) |
| Production frontend on `main` | OLD backend (`jnxevalckgitxuunjcvv`); NEW ref absent |
| Production Worker name on `main` | `puc-v2` |
| `supabase/config.toml` `project_id` | OLD (`jnxevalckgitxuunjcvv`) |
| Untracked | `test-click.html` (left untouched, not committed) |
| Baseline recorded in | `migration/final-cutover-state.json` |

No uncommitted user work was overwritten. `main` was not changed in this workflow before the final documentation commit.

## B. Phase 11D findings — with a correction

The Phase 11D report contained an error that this stage corrects.

- **Corrected:** `20260927000000_content_stage6_arrays.sql` does **not** insert 12 chapter rows. Its only chapter insert is one row, `CH0116` (Capstone Project: Using Arrays, stage `STG007`). `CH0116` is absent on OLD, so there is no primary-key conflict. The earlier "11 existing rows conflict" finding was wrong. The 11 rows it appeared to conflict with (`CH0062`–`CH0072`) are inserted by `20260917120000_stage6to10_placeholders.sql`, not by the arrays file.
- **Confirmed:** the stage 6–10 chapter shells on OLD come from `20260917120000_stage6to10_placeholders.sql`, which is recorded as applied on OLD. Its header says it adds "stage + chapter metadata only", so the shells have no learn content or questions by design.
- **Confirmed:** `CH0117`–`CH0128` and `STG012`/`STG013` are absent on OLD. `20260929000000` creates them.
- **Confirmed:** the 5 self-lock prerequisite rows (`STG007`–`STG011`) exist on OLD. The other 3 prerequisite deletions depend on the structure migration.
- **Corrected in this stage:** the 17 learn-content corrections are not all already present on NEW. See section D.

The correction is recorded in the Phase 11D report on `main` (see section R).

## C. OLD migration strategy

Goal: decide which OLD migrations are needed, not to make OLD catch up with NEW.

| Migration group | OLD | NEW | Action |
|---|---|---|---|
| 1 glossary (`20260910130000`) | `TERM024` present | present | historical; no action |
| 2 learn corrections (`20260926150000`) | old text present exactly once for all 17 replacements | 14 of 17 corrected; 2 ambiguous; 1 substring artifact | requires explicit decision (section D) |
| 3 arrays content (`20260927000000`) | chapter `CH0116` absent; content absent | content present | no action on OLD; NEW authoritative |
| 4, 6, 8, 10, 17 unlock rules (self-lock) | 5 rows present | 0 rows | no action on OLD; NEW authoritative |
| 5, 7, 9, 12, 14, 16 content | content absent on OLD | content present | no action on OLD; NEW authoritative |
| 5, 14, 16 question limits | `null` on all affected chapters | `6/7/7/6/6` | no action on OLD; NEW authoritative |
| 11 structure (`20260929000000`) | absent | present (13 stages, 98 chapters) | no action on OLD; NEW authoritative |
| 13, 15, 18 dependent | depend on 11 | present | no action on OLD |
| 19 activity_attempts | table absent | present, RLS on | no action on OLD; NEW authoritative |

Decision basis: NEW is the rebuilt authoritative curriculum, and OLD becomes a read-only historical source after cutover. Applying OLD's pending migrations to OLD would change a production database that is about to be retired. No pending migration was applied, repaired, or marked.

Result: no OLD migration needs to run for the cutover. This is a recommendation; the owner must confirm it.

## D. NEW curriculum validation (read-only)

| Check | Result |
|---|---|
| Stages | 13 (`STG001`–`STG013`) |
| Chapters | 98 |
| Learn content | 98; every chapter has content |
| Orphan learn content | 0 |
| Orphan chapters (stage missing) | 0 |
| Orphan questions (chapter missing) | 0 |
| `STG000` | absent |
| Practice questions | 70 (all in S0–S9) |
| Practice tests | 402 (332 hidden, 70 public) |
| Practice orphan tests | 0 |
| Practice prerequisites | 0 |
| Migrations recorded | 45 |
| `clear_test_accounts` recorded | yes |
| Chapter `question_limit` | `CH0086`=6, `CH0103`=6, `CH0104`=7, `CH0105`=7, `CH0108`=6, `CH0119`=6 |
| Learn-content corrections (17) | 14 clearly corrected; `L_CH0031` p2 and `L_CH0035` p4 still contain their old text; `L_CH0061` p2 (one replacement) shows a count artifact because its new text contains its old text |

Open item: two learn-content corrections (`L_CH0031` p2, `L_CH0035` p4) appear not to be applied on NEW. NEW is the authoritative curriculum, so this is a content decision for the owner, not a migration. Nothing on NEW was changed.

Stage-level comparison of OLD vs NEW chapter metadata (stages 6–10): 48 of 53 chapters are identical in `stage_id`, `chapter_no`, `title`, `order`, `active`. The five differences are `question_limit` only, and they match the migration updates.

## E. Cloudflare test deployment — BLOCKED

- Test Worker `click-test` exists (checked read-only). Wrangler is logged in.
- The export of `50d1248` was prepared in a scratch folder, and its content matches the commit (CRs aside). The dry run succeeded.
- The actual `wrangler deploy` was **denied by the Claude Code auto-mode permission classifier**, which classified the command as a production deploy. The same denial occurred earlier. It was not retried or routed around.
- Result: **no deployment happened**. HTTP 200, HTML checks, and browser tests could not be run on a deployed test site.

To proceed, an explicit permission is needed for the `click-test` deploy (for example, a Bash permission rule for `wrangler deploy` from the scratch export, or an approval of this specific deploy).

## F. Browser S0–S9 test — NOT RUN

Blocked by section E. There is no deployed test frontend to test. Not run:
- application load, login/session, NEW backend responses, curriculum and chapter navigation, Learn content, Practice S0–S9 existence, a Practice question open, workspace behaviour, OLD-request absence, and console errors.

No account was created, and no account cleanup was run.

## G. VS Code extension test

Done locally:
- Dependencies from the lockfile (`npm ci`): installed.
- TypeScript compile: clean.
- Test suite: 14 of 14 pass.
- Local VSIX built into the scratch folder: `click-practice-local.vsix`, 11 files, about 25 KB. Not published, not committed.
- Practice labels: the S-number labels come from the backend's `practice_stage_label`, verified by the backend tests (S0–S9).
- OLD runtime dependency: the extension reads its backend URL from the `click.backendUrl` setting. **The default is still OLD** (`https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend`). That is correct for production today. The cutover must change this default to NEW.

Not verified: tree, question view, and workspace folders were checked by code path only, not by running VS Code.

## H. GitHub production configuration — NOT CONFIGURED

Audit (current `main`):
- `cloudflare-frontend.yml`: deploys the Worker named in `wrangler.jsonc` (`puc-v2`). Skips without `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- `supabase-functions.yml`: `supabase functions deploy click-backend --project-ref "$SUPABASE_PROJECT_ID"`. Explicit project ref. Skips without `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID`.
- `supabase-migrations.yml`: `supabase link --project-ref "$SUPABASE_PROJECT_ID"`, then `supabase db push --yes`. Explicit project ref. Skips without its three secrets.
- `config.toml` still names OLD. CI passes explicit refs, so CI does not depend on it, but local commands without `--project-ref` would target OLD.
- Repo secrets: none. Environments: none. Branch protection and rulesets: unavailable on this private repo's plan (HTTP 403).

No production environment was created, and no production secret was added. Environment creation with required reviewers cannot be verified or completed from this tooling, so this is not claimed as done. Manual steps are in section R.

## I. Student reconciliation — FAILED (stop)

Current OLD source (aggregate counts only; no personal data read):

| Item | Plan value | Current OLD | Status |
|---|---|---|---|
| users | 353 | 354 | differs |
| protected accounts present | 1 (plan) | 2 (`U1A8B0A6D8810`, `U485B9DDDA04E`, one row each) | differs |
| test_runs | 894 | 954 | differs |
| attempts | 4967 | 5080 | differs |
| learn_progress | 501 | 539 | differs |
| STG000 learn_progress | 30 | 60 | differs |
| STG000 test_runs | 52 | 92 | differs |
| practice_progress | — | 5 (0 with `E` prefix) | recorded |
| practice_pairings | — | 32 | recorded |
| sessions | — | 754 | excluded by spec |
| student_section_assignments | — | 352 | recorded |
| staff_messages | — | 4 | excluded by spec |
| users missing password hash or salt | 0 expected | 0 | ok |
| non-student roles | — | 0 | ok |

Conclusion: the OLD source is live and has grown since the plan's figures. The plan's own stop conditions apply: unexpected student counts and an unexpected protected-account state. A reconciled snapshot needs a decision on freezing OLD (for example, a maintenance window) and on whether the protected-account rule still holds.

NEW collision: NEW has 1 existing user, the test account. The collision handling is not yet documented, so it fails the gate.

## J. Student migration dry run — NOT GENERATED

Not generated because section I stops the workflow first. No credential-bearing SQL was produced.

## K. Student migration execution — NOT EXECUTED

Gate 1 was not passed (section N). No student data was migrated.

## L. Post-migration validation — NOT APPLICABLE

No migration ran.

## M. Production Edge Function — NOT DEPLOYED

`click-backend` on NEW is version 3, ACTIVE, and matches the repo at `50d1248` (verified earlier). No new deployment was made, and nothing was deployed to OLD.

## N. Production Cloudflare — NOT DEPLOYED

`puc-v2` is unchanged. Production still points at OLD. The cutover gate was not passed.

## O. Production browser verification — NOT RUN

Production has not moved to NEW.

## P. OLD vs NEW runtime target

| Surface | Target now | Target after cutover |
|---|---|---|
| Production frontend (`puc-v2`, `index.html`) | OLD | NEW (not done) |
| Production Edge Function (`click-backend`) | OLD (not deployed by this workflow) | NEW (not done) |
| Test frontend (`click-test`) | NEW (not deployed) | NEW |
| Test backend | NEW (version 3) | NEW |
| VS Code extension default `click.backendUrl` | OLD | NEW (not done) |
| `supabase/config.toml` `project_id` | OLD | NEW only if changed deliberately (not done) |
| Student data | OLD (354 active students) | NEW (1 test user; not migrated) |

## Q. Final data counts

| Scope | OLD (current) | NEW |
|---|---|---|
| Users | 354 | 1 |
| Stages | 12 (incl. `STG000`) | 13 |
| Chapters | 115 | 98 |
| Learn content | 62 | 98 |
| Practice questions | not compared in this stage | 70 |
| Practice tests | not compared in this stage | 402 |
| Migrations recorded | 26 | 45 |

## R. Remaining risks and manual steps

Risks:
1. OLD is live and changing. Any migration needs a frozen snapshot.
2. Protected-account state differs from the plan. Must be resolved.
3. The extension default and the production Worker still point at OLD.
4. `supabase/config.toml` still names OLD.
5. The `clear_test_accounts` record is applied on both OLD and NEW. Whether its delete changed OLD is still unresolved.
6. Two learn-content corrections are not visible on NEW.
7. The Cloudflare test deploy and browser verification are unverified.
8. Pushing this report to `main` triggers the Cloudflare workflow, which skips without credentials.

Manual steps needed before any production secret or environment:
1. Approve the `click-test` deployment, or provide an explicit permission rule for it.
2. Decide the freeze method and the protected-account rule, then re-run the source snapshot.
3. In GitHub: Settings → Environments → New environment `production`. Add required reviewers (requires an upgraded plan on this private repo). Then add the NEW-targeted production secrets to that environment only.
4. Decide whether `supabase/config.toml` `project_id` should move to NEW, and when.
5. Decide the production-target change: `index.html` `BACKEND_URL` and `click.backendUrl` default.

## S. Final status

**NOT READY**

Evidence supporting this status:
- Section I: student reconciliation fails against the plan's figures.
- Section E: test deployment blocked; no browser evidence.
- Section H: production environment protection cannot be established here.
- Section P: production still runs on OLD.

No stage was claimed complete without evidence.
