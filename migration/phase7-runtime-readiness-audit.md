# Phase 7 — Runtime & Backend Readiness Audit

Read-only audit. No code, schema, secrets, or deployment state changed. OLD = `jnxevalckgitxuunjcvv`
(current production). NEW = `eyevmykfavooeiklzebe` (45/45 migrations applied, 0 users, per Phase 6).

## 1. Supabase linkage — verified

| Check | Finding | Evidence |
|---|---|---|
| CLI local link (`.temp/project-ref`) | `eyevmykfavooeiklzebe` (NEW) | Confirmed at start and end of this phase |
| Repo's committed `supabase/config.toml` | `project_id = "jnxevalckgitxuunjcvv"` (**OLD**) | `supabase/config.toml:13` — comment at lines 10-12 explains it was set deliberately when OLD was confirmed as production; **not updated for the NEW cutover** |
| CI deploy target (migrations + Edge Function) | Controlled by GitHub Actions secret `SUPABASE_PROJECT_ID` — **value not visible to this audit** | `.github/workflows/supabase-migrations.yml:19,28`, `.github/workflows/supabase-functions.yml:19,28` both `supabase link/deploy --project-ref "$SUPABASE_PROJECT_ID"` |
| Frontend runtime target | Hardcoded to **OLD** | `index.html:1276` (`BACKEND_URL` fallback literal), `index.html:1277` (`SUPABASE_ANON_KEY`, JWT payload decodes to `"ref":"jnxevalckgitxuunjcvv"`) |
| Any reference to the unrelated/mistaken project `zwdmredbjktvecvpfurx` | **None found** anywhere in the repo | Grepped during this and prior phases |

**Classification of every OLD-ref (`jnxevalckgitxuunjcvv`) occurrence found in this phase:**

| File:Line | Classification |
|---|---|
| `index.html:1276`, `index.html:1277` | **runtime** — actually executed in every browser session today |
| `supabase/config.toml:13` | **historical/audit** (already-known discrepancy, CLI-link metadata only, not read by the deploy workflow) |
| `vscode-extension/package.json` (2 occurrences) | **other-product default** — a separate VS Code extension's default setting, not part of the deployed web frontend |
| `admin-tools/reset-student-password.ps1`, `admin-tools/build-content-migration.js` | **migration tooling** |
| `supabase_details.md`, `supabase-new-details.md`, `migration/*.md`/`*.json` | **documentation / historical-audit** |

**Conclusion: the frontend and the repo's committed CLI config both currently target OLD, not NEW.
The actual CI deploy target is an opaque GitHub secret this audit cannot read.** No OLD reference was
removed or modified — per the task's explicit instruction, a reference to OLD may legitimately exist
in migration tooling/documentation and was left untouched.

## 2. Frontend Supabase configuration

| Component | File | Configuration | Current Target | Intended Target | Status |
|---|---|---|---|---|---|
| Edge Function URL | `index.html:1276` | Hardcoded literal fallback (checked after two runtime overrides that are never populated anywhere in this repo: `window.AndroidBridge.getBackendUrl()`, `localStorage.getItem('clickBackendUrl')`) | OLD | NEW | **Must be edited + redeployed** before cutover |
| Supabase anon key | `index.html:1277` | Hardcoded JWT literal | OLD | NEW | **Must be edited + redeployed** before cutover |
| Dispatch mechanism | `index.html:1484` | `fetch(BACKEND_URL, {...})` — frontend calls only the Edge Function; `createClient`/`supabase-js` does not appear anywhere in frontend code | N/A | N/A | Confirmed: no direct Postgres/PostgREST access from the browser |
| Build step | `wrangler.jsonc`, `.github/workflows/cloudflare-frontend.yml` | None — fully static, no `package.json` at repo root, no bundler; deployed byte-for-byte | neither | neither | Confirmed: there is no env-var-substitution mechanism available to avoid hand-editing the two literals above |
| Desktop wrapper (context only) | `desktop-app/main.js:3` | Loads the already-deployed live site URL; carries no separate backend config of its own | inherits whatever `index.html` says | inherits | Not an independent configuration point |

## 3. Backend / Edge Function architecture

Exactly **one** Edge Function exists: `supabase/functions/click-backend/index.ts` (confirmed via directory
listing — no `_shared/`, no second function). It has **36 dispatch actions** (full switch statement at
`index.ts:1875-1914`): 18 student-facing (signup, login, session, logout, message read/reply/dismiss,
onboarding, username, bootstrap, preloadTestData, completeLearn, startTest, saveTestAnswer,
saveActivityAttempt, finishTest, and the 6 practice-pairing/sync actions), 12 staff-facing (staffLogin/
Session/Logout, dashboard/sections/students/studentDetail, assignSection, sendMessage,
studentMessages, unseenReplies), and 3 admin-key-gated utility actions (adminResetPassword,
adminGetMaxIds, adminUpsertStaff). There is no health-check/ping action.

| Function | Purpose | Supabase Access | Secrets Needed | OLD Ref? | NEW Ready? | Deployment Needed? |
|---|---|---|---|---|---|---|
| `click-backend` | Entire backend: custom auth, student learn/test/practice flow, VS Code practice pairing, staff dashboard/admin | service-role only (`index.ts:8-11`) — RLS bypassed by design | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (standard, auto-injected by Supabase per-project), `ADMIN_RESET_KEY` (custom — **not provisioned anywhere in this repo**) | No — zero hardcoded project ref/URL inside `supabase/functions/` (grepped for both refs and `supabase.co`; only hit is an `esm.sh` library CDN import) | Yes, code-wise — every table access is generic/schema-driven, no hardcoded IDs; the one sentinel literal (`current_stage: "STG000"` on signup, `index.ts:287`) is a plain-text display value only — confirmed no FK exists on `users.current_stage` (`baseline_schema.sql:207`, plain `text`, no `references` clause), so it poses zero DB-level risk on NEW | Yes — currently deployed only to OLD (confirmed `ACTIVE`, version 52, live `functions list` check); **not deployed to NEW at all** (`functions list --project-ref eyevmykfavooeiklzebe` → empty) |

**Live-verified secrets/deployment state (read-only `supabase secrets list` / `functions list`, names only —
no values retrieved or recorded):**

| Project | Edge Functions deployed | Secrets configured |
|---|---|---|
| OLD (`jnxevalckgitxuunjcvv`) | `click-backend`, ACTIVE, version 52 | `ADMIN_RESET_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (7 of 8 are Supabase's standard auto-injected platform secrets; only `ADMIN_RESET_KEY` was manually set) |
| NEW (`eyevmykfavooeiklzebe`) | **none** | **none** |

## 4. Environment / secret readiness

| Variable | Used By | Required? | Secret? | NEW Configuration Needed? | Status |
|---|---|---|---|---|---|
| `SUPABASE_URL` | `click-backend` (`index.ts:9`) | Yes | No (public) | Auto-provisioned by Supabase once the function is deployed to NEW | Not yet applicable — function not deployed |
| `SUPABASE_SERVICE_ROLE_KEY` | `click-backend` (`index.ts:10`) | Yes | **Yes** | Auto-provisioned by Supabase once the function is deployed to NEW | Not yet applicable — function not deployed |
| `ADMIN_RESET_KEY` | `click-backend` (`index.ts:345,368,1453`) — gates `adminResetPassword`, `adminGetMaxIds`, `adminUpsertStaff` | Yes, for those 3 actions only | **Yes** | **Must be manually set** via `supabase secrets set ADMIN_RESET_KEY=<value> --project-ref eyevmykfavooeiklzebe` — confirmed absent from NEW's secrets list | **Blocker for admin tooling** until set |
| `SUPABASE_PROJECT_ID` | `.github/workflows/supabase-migrations.yml`, `supabase-functions.yml` | Yes, for CI deploys | No (an identifier, not a credential, though treated as a secret in this repo) | **Must be repointed to `eyevmykfavooeiklzebe`** for CI to ever deploy to NEW | Current value unknown to this audit (GitHub secret, not repo-readable) |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` | same two workflows | Yes, for CI deploys | **Yes** | May need to be scoped/valid for NEW depending on how the current token is scoped | Unknown — GitHub secrets, not repo-readable |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `.github/workflows/cloudflare-frontend.yml` | Yes, for frontend deploy | **Yes** | Unaffected by the Supabase cutover — frontend deploy has no Supabase-related secret at all | N/A to this migration |
| No `.env`/`.env.example` files exist anywhere in the repo | — | — | — | — | Confirmed via glob; nothing to update there |

No other `Deno.env.get(...)` call exists in `click-backend` (verified exhaustively) — no AI-provider key, no JWT
secret, no webhook secret. No literal secret VALUE was printed, recorded, or copied into this report or
any other file at any point in this audit — only variable names and, for the `secrets list` CLI output,
one-way SHA-256 digests that the Supabase CLI itself returns in place of values (never the raw value).

## 5. Deployment readiness checklist (for a FUTURE phase — nothing here was executed)

**Required, in order:**
1. Set `ADMIN_RESET_KEY` as an Edge Function secret on NEW (`supabase secrets set ... --project-ref eyevmykfavooeiklzebe`).
2. Repoint the `SUPABASE_PROJECT_ID` GitHub Actions secret to `eyevmykfavooeiklzebe` (confirm `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD` are valid for NEW too).
3. Deploy `click-backend` to NEW (`supabase functions deploy click-backend --project-ref eyevmykfavooeiklzebe`, or let the existing CI workflow do it once step 2 is done).
4. Edit `index.html:1276-1277` to NEW's URL + NEW's anon key, then redeploy the frontend via the existing Cloudflare workflow.
5. Update `supabase/config.toml:13`'s `project_id` to `eyevmykfavooeiklzebe` for local-CLI consistency (not in the CI deploy path, but avoids future confusion/accidental `supabase link` to OLD).

**Optional:**
- Decide and resolve the `.assetsignore` gap noted below (§6) before any frontend deploy once `migration/` content grows further.

**Unknown (cannot be resolved by this audit):**
- The current value of the `SUPABASE_PROJECT_ID` GitHub secret (and whether `SUPABASE_ACCESS_TOKEN`/`SUPABASE_DB_PASSWORD` are already valid for NEW).

**Not claimed ready:** this checklist is not evidence that deployment IS ready — only that these specific,
named items are what stand between the current state and a safe deployment. None of them were acted on
in this phase.

## 6. Incidental finding (not required by this phase's scope, noted for completeness)

`.assetsignore` (repo root) does not exclude `migration/`, meaning a future Cloudflare frontend deploy
would publish this audit's own `.md`/`.json` report files as static assets under the live site unless
that's addressed first. Documented as a **REQUIRED FUTURE CHANGE**, not implemented here.

## 7. OLD database safety check (read-only)

- `supabase migration list --project-ref jnxevalckgitxuunjcvv` (re-run fresh in this phase): **26 of 45**
  local migrations applied, identical to the count recorded at the end of Phase 6 — unchanged.
- This resolves a discrepancy between two of this engagement's own earlier documents
  (`migration/shared-database-compatibility-report.md` said "28 of a then-46-counted set";
  `migration/new-supabase-clean-rebuild-summary.json` said 26 of 45). **26/45 is the current, live-verified,
  authoritative count** — the "28" figure is stale, from before later migrations (Number Crunching,
  Patterns, Pointers, the Stage-6 order fix, `activity_attempts`) were authored and the total grew to 45.
- No write, migration, or schema-altering command was run against OLD at any point in this phase — only
  `migration list`, `secrets list`, and `functions list`, all read-only.
- `click-backend` on OLD remains `ACTIVE`, version 52, untouched.

## 8. NEW database safety check (read-only, re-verified fresh this phase)

`supabase inspect db table-stats --linked` (linked to `eyevmykfavooeiklzebe`):

| Check | Result |
|---|---|
| Migrations applied | 45 / 45 |
| `stages` | 13 |
| `chapters` | 98 |
| `learn_content` | 98 |
| `glossary` | 436 |
| `activity_attempts` | present, 0 rows |
| `users` / `sessions` / `learn_progress` / `test_runs` / `attempts` / `practice_progress` / `practice_pairings` / `student_section_assignments` | all **0** |
| `staff_sessions` / `staff_users` / `staff_messages` | all **0** |

No test student or any other row was inserted during this phase.
