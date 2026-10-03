# Phase 13 — Final blocker resolution, OLD freeze preparation, snapshot status

Date: 2026-10-03. Baseline: `main` at `455bded`. Production stays on OLD. Nothing was migrated. NEW was not changed.

## Summary

| Item | Status |
|---|---|
| OLD | **LIVE** (click-backend version 52, unchanged) |
| Freeze | preflight complete; **not deployed** (needs your written authorization) |
| Snapshot | **NOT CAPTURED** (only after a verified freeze) |
| Student migration | **NOT EXECUTED** |
| NEW student data | unchanged (1 test account) |
| Production | **still OLD**; production host **unknown** |
| Cloudflare test | PASS (Phase 12, not changed) |
| Browser S0–S9 | **NOT RUN** (login-dependent; user-assisted) |
| Extension | PASS (build and tests, 14/14) |
| Final status | **NOT READY** |

## Production Host

**UNKNOWN.** Evidence checked, read-only:

- `wrangler.jsonc` on `main`: `name = "puc-v2"`. The deploy workflow labels its step "Deploy to Cloudflare Workers (puc-v2)".
- The `puc-v2` Worker is **not on the Cloudflare account this session uses** (Wrangler: "This Worker does not exist on your account", code 10007).
- Cloudflare Pages on that account: `wrangler pages project list` returned no projects.
- The repo contains no production domain. `index.html`'s external hosts are LinkedIn, fonts, the Visual Studio Code and MSYS2 links, and the OLD Supabase URL. `manifest.json` uses relative paths (`start_url: "./"`), so it names no domain. There is no `CNAME` file.
- GitHub repo `Andryandurai/Click-NewTrial`: no homepage, no GitHub Pages site, no deployment records.
- DNS was not checked: no domain is recorded in any source that could be queried.

Conclusion: the production host cannot be determined from available evidence. It may be on another Cloudflare account, under another Worker name, or on another host entirely. **Please tell me where production is served** (the exact URL, and the Cloudflare account it belongs to, if known). Nothing was created or deployed to replace it.

Current production deployment mechanism (as configured): the `cloudflare-frontend.yml` workflow runs wrangler on push to `main` with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Both secrets are absent, so the job is skipped. Its target is the Worker named in `wrangler.jsonc` (`puc-v2`), which does not exist on the current account. If the secrets were added now, the workflow would create a new `puc-v2` Worker on this account, not update the real production site.

## Learn Content Decision

**ALREADY SATISFIED IN NEW.** No NEW row was changed.

Method: apply the migration's exact replacements (`20260926150000_learn_content_corrections.sql`) to OLD's current `pages_text` for the seven chapters, in file order, with the migration's own exact-once guard. Compare the result with NEW's `pages_text` byte for byte.

| Chapter | Guards pass on OLD | OLD + migration equals NEW exactly |
|---|---|---|
| L_CH0031 | yes | **yes** |
| L_CH0035 | yes | **yes** |
| L_CH0037 | yes | **yes** |
| L_CH0042 | yes | **yes** |
| L_CH0055 | yes | **yes** |
| L_CH0059 | yes | **yes** |
| L_CH0061 | yes | **yes** |

Result: for all seven chapters, NEW's text is exactly what the migration produces. Each page has the same page count (5), and no other content differs.

Why the earlier "discrepancy" was not real: several of the migration's `new_t` strings end with the `old_t` text. For example, `L_CH0031`'s new block ends with "Easy Analogy / Programmer = Person speaking English.", and `L_CH0035`'s new block ends with the "Memory Trick" heading. A substring count therefore shows the old text as present, even when the correction is applied. Applying the migration literally to NEW would duplicate the block, which is why it must not be applied to NEW.

## clear_test_accounts Historical Finding

**Not provable from read-only evidence. Recorded here as an uncertainty, not as a finding about students.**

What is established:
- `20260924000000_clear_test_accounts` is recorded on OLD. Every one of OLD's 26 recorded migrations stores its statement text in `supabase_migrations.schema_migrations.statements` (none are null). The clear migration has its single statement stored. That pattern fits a normal apply; a manual repair would not normally store statement text. This is inference, not proof.
- The protected accounts (`U1A8B0A6D8810`, `U485B9DDDA04E`) joined 2026-09-03 07:22 UTC. Both are present.
- The earliest **non-protected** account joined 2026-09-16 09:08:32 UTC. There are 352 non-protected accounts, all joined on or after that date.

What follows from that, and no more:
- If the delete ran at time T, it removed every non-protected account that existed at T. Since the earliest surviving non-protected account was created at 2026-09-16 09:08:32, T can be no later than that moment. So the delete, if it ran, did not remove any current student.
- It cannot be shown whether the delete ran before or after 2026-09-16, or whether any account created before T was removed. Deleted rows leave no trace in the database.
- The roll-number sequence cannot settle this: only 30 accounts have 10-digit roll numbers, and the other 324 use mixed formats (1–17 digits). There is no series to test for gaps.

Decision: no action was taken on the migration, the record, or OLD. The question for you: does the rollout history (the date the real student cohort started, and whether earlier accounts were deleted on purpose) match "the clear ran before the first real student"? If you can confirm that, this uncertainty is resolved. If you cannot, the migration would have to stay out of the cutover path, which it already does.

## Browser Test

**Login-dependent validation remains user-assisted.**

- No approved authentication mechanism exists that this session can use without exposing a credential. The test account's password was not available, and none was requested through chat.
- No browser session or stored login was read. That would expose credentials, so it was not done.
- No account was created, deleted, or altered.
- Phase 12's non-login checks still stand (page load, zero OLD requests, zero console errors, CORS to NEW from the test origin).

To complete this item: log in at https://click-test.clickv2-new.workers.dev with the existing test account, and confirm the dashboard, curriculum, and Practice S0–S9 by eye. Or tell me an approved way for this session to use the account.

## OLD Freeze Preflight

**Produced:** `migration/phase13-old-freeze-preflight.md`. Summary:
- Source: commit `71059e2b6c58d936fb7e8391235cd533acfeb75a`, which matches OLD's deployed click-backend (version 52) byte for byte. Built from that source, not from `main`, because `main` differs from v52 and would change production behavior beyond the freeze.
- Patch: 5 hunks, 0 schema statements, no project URL. It adds a dispatcher guard (13 reads served, all other actions refused) and stops three session helpers from updating rows.
- Rollback: redeploy `migration/phase13-old-click-backend-v52.index.ts` with an explicit project ref.
- Verification (scratch only): the freeze test passes on the v52-based build; the unmodified v52 fails the same test, as expected.

## OLD Freeze Execution

**NOT EXECUTED.** The preflight says the deployment requires explicit written authorization from you. Nothing was deployed to OLD in this phase. OLD remains on version 52.

## Frozen Snapshot

**NOT CAPTURED.** A snapshot can only be taken after a verified freeze. Without a freeze, any capture would be a live copy that keeps changing, which the plan does not allow.

## Frozen Counts

Not available (no freeze). For reference only, the live source at the time of this check:
- users 354 (2 protected, 352 selected), test_runs 954, attempts 5080, learn_progress 539, practice_progress 5, student_section_assignments 352.

These counts will change until OLD is frozen and must not be used as the final migration numbers.

## Integrity Checks

Not run on a frozen snapshot. The live-source checks from Phase 12 are still valid as of that moment: 0 orphans in each table, 352 of 352 selected accounts with password hash and salt, 0 duplicate roll numbers, emails, or usernames, 0 `STG007`–`STG011` rows and 0 `STG000` rows for selected accounts, and 0 attempts on protected accounts' test runs. All of these must be re-run on the frozen snapshot.

## Student Dry Run

Not generated against a frozen snapshot. The Phase 12 dry run (live counts, no freeze) reconciles: selected 352 accounts, 835 test runs, 4,894 attempts, 465 learn-progress rows, 5 practice-progress rows, 352 assignments; excluded 2 protected accounts, 119 test runs, 186 attempts, 74 learn-progress rows.

## Remaining Blockers

1. **OLD freeze authorization** (written, from you). Also: the freeze window and student notice.
2. **Production host** is unknown. Please tell me where production is served.
3. **Browser login checks** are user-assisted.
4. **clear_test_accounts**: the rollout-date question above.
5. **verify_jwt** on OLD must be confirmed in the Dashboard before a freeze deployment (the CLI would apply `verify_jwt = false` from `config.toml`).
6. **Frozen snapshot and checksums** must be captured after a verified freeze.
7. **Protected-account policy** (2 accounts) and **NEW test account** handling: as already decided, but the owner should confirm them for the final migration.

## Final Readiness

**NOT READY.**

The hard-gate conditions are not met: OLD is not frozen, no snapshot exists, the production host is unknown, and the browser login checks are not done. The learn-content blocker is resolved (already satisfied), and the freeze is ready to be authorized.

## Files

- `migration/phase13-final-blocker-resolution.md` (this report)
- `migration/phase13-final-blocker-summary.json`
- `migration/phase13-old-freeze-preflight.md`
- `migration/phase13-old-freeze-build.patch` (v52 → freeze)
- `migration/phase13-old-click-backend-v52.index.ts` (rollback source)
- `migration/phase13-freeze-verification.test.ts` (freeze test)
