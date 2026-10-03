# Phase 12 — OLD freeze procedure (design only; NOT executed)

Date: 2026-10-03. Project: OLD `jnxevalckgitxuunjcvv`. Status: **design; requires explicit approval before any step is run.**

## 1. What exists today (verified, read-only)

| Mechanism searched | Result |
|---|---|
| Maintenance mode in the frontend (`index.html`) | none |
| Read-only or lock mode in the backend (`click-backend/index.ts`) | none |
| Registration/login disable | none. Signup is restricted only by email domain (`.aids@rajalakshmi.edu.in`) in the frontend |
| OLD `settings` table keys | `APP_NAME`, `CHARACTER_NAME`, `CONTENT_CACHE_SECONDS`, `DEFAULT_HEARTS`, `DEVELOPER`, `MIN_PASSWORD_LENGTH`, `PRACTICE_PAIR_MINUTES`, `PRACTICE_TIMEOUT_MS`, `QUESTIONS_PER_CHAPTER`, `SCHEMA_VERSION`, `SESSION_HOURS`, `SOURCE_NOTE`, `TAGLINE`, `TEST_CONTENT_CACHE_SECONDS` |
| Frontend-only production gate on `puc-v2` | not applicable: `puc-v2` does not exist on the current Cloudflare account (Wrangler: code 10007) |

**Conclusion:** no supported freeze switch exists. A freeze must be a controlled change, and the change must be approved first.

## 2. Why a frontend-only freeze is not enough

- The VS Code extension calls `click-backend` directly, with its own device token, so it writes `practice_progress` and pairings without the web app.
- Any client that holds a valid session token can call `click-backend` directly.
- Therefore the freeze must block writes **in the backend**, not in the page.

## 3. Writes that must stop

All of these are performed by `click-backend` actions on OLD:

| Table | Writes come from (actions) |
|---|---|
| `users` | `signup`, `completeOnboarding`, `setUsername`, `studentReplyToMessage`, `adminResetPassword` (staff), profile updates |
| `sessions` | `login`, `logout`, session refresh |
| `test_runs` | `startTest`, `finishTest` |
| `attempts` | `saveTestAnswer`, `finishTest` |
| `learn_progress` | `completeLearn` |
| `practice_progress` | `completePractice`, `practiceExtensionSync` (updates) |
| `practice_pairings` | `createPracticePairing`, `claimPracticePairing` |
| `student_section_assignments` | `staffAssignSection` |
| `staff_messages` | `staffSendMessage`, `markMessagesDelivered`, `markMessagesRead`, `studentDismissMessage` |
| `activity_attempts` | not present on OLD (migration 19 pending) |

## 4. Minimum controlled procedure

**Gate 0 — approval.** Explicit written approval from the owner for each step below. Nothing in this document is approved by default.

**Step 1 — prepare, no effect on users.** Write a read-only-mode version of `click-backend` (a copy of the current function with a guard at the top of the dispatcher that returns `{ok:false, error:"Maintenance: CLICK is read-only during migration."}` for every action in section 3 and allows read actions). Test the copy locally with the existing test harness (`tests/backend`). Do not deploy yet.

**Step 2 — announce.** Tell students and staff the window (time, expected length). Use the existing announcements mechanism only if approved; do not write to `announcements` without approval.

**Step 3 — freeze (the first OLD write).** Deploy the read-only build of `click-backend` to OLD with an explicit project ref: `supabase functions deploy click-backend --project-ref jnxevalckgitxuunjcvv`. Note that `config.toml` still names OLD, so the explicit flag is mandatory. Record the deployed version.

**Step 4 — verify the freeze.** Read-only checks only:
- a write action (for example `saveTestAnswer` with a dummy session) returns the maintenance error and writes nothing;
- row counts of the 6 tables in section 3 are recorded at T0, then re-read at T0+5 min and T0+15 min. They must be identical.

**Step 5 — capture the snapshot (section 5 below).** Only after step 4 passes.

**Step 6 — verify snapshot consistency.** Recompute counts and checksums after the snapshot. They must match.

**Step 7 — release only after the migration is validated.** Either (a) the migration succeeds and OLD becomes read-only historical (the normal end state), or (b) the migration fails and the read-only build is rolled back to the saved version of `click-backend` (redeploy the recorded previous version). Record which path was taken.

## 5. Snapshot capture (after the freeze is verified)

Run as read-only selects against OLD, ordered by primary key:

1. `users` for the selected set (352 users; protected accounts excluded by explicit ID list).
2. `test_runs` for the selected users.
3. `attempts` for the selected users.
4. `learn_progress` for the selected users.
5. `practice_progress` for the selected users.
6. `student_section_assignments` for the selected users.

Store the export only under a gitignored local folder (for example `migration/.local-student-snapshot/`). Never commit it. Never print password hashes or salts. Record per file: row count, SHA-256 of the file, and the capture timestamp, in a manifest that contains no credentials.

## 6. Rollback

- Before migration: redeploy the previous `click-backend` version on OLD (recorded in step 3). This restores writes.
- After a failed migration: the snapshot remains on disk and unchanged; OLD keeps its frozen state until the owner decides.
- No row on OLD is deleted or modified by any step in this procedure.

## 7. What this procedure does not do

- It does not run `clear_test_accounts`.
- It does not migrate students.
- It does not change `puc-v2`, the production frontend, or the extension default.
- It does not alter any migration file.

## 8. Required before approval

1. Owner decision on the freeze window and whether students are told in advance.
2. Owner decision on the protected-account rule (2 accounts, both present on OLD).
3. Confirmation of the target Cloudflare production host, since `puc-v2` does not exist on this account.
4. Approval of the read-only `click-backend` build (step 1) after review.
