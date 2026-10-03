# Phase 13 — OLD freeze preflight (NOT deployed)

Date: 2026-10-03. Status: **preflight complete; deployment NOT executed; awaiting explicit authorization.**

## 1. Exact source

| Item | Value |
|---|---|
| OLD deployed function | `click-backend`, version **52**, ACTIVE, last updated 2026-09-19 02:59:51 UTC |
| Source the freeze is built from | repo commit **`71059e2b6c58d936fb7e8391235cd533acfeb75a`** (2026-09-15 21:34 +0530) |
| Byte-level proof | OLD's deployed `index.ts` matches that commit exactly after line-ending normalization (SHA-256 `929c50e8…14ec`) |
| Why not `main` | `main`'s `click-backend` differs from v52 (111,099 vs 105,448 bytes). Building the freeze from `main` would ship every change since 2026-09-15 to production OLD, not just the freeze. |
| Rollback copy (no secrets) | `migration/phase13-old-click-backend-v52.index.ts` |

## 2. Exact OLD project and function

- Project: **`jnxevalckgitxuunjcvv`** (OLD). Never implicit.
- Function: **`click-backend`** only.
- Command that would be run after authorization:
  `npx supabase functions deploy click-backend --project-ref jnxevalckgitxuunjcvv`
- `supabase/config.toml` still names OLD; the explicit `--project-ref` is mandatory, and the command must not be run without it.
- Not NEW. The build contains no NEW reference (verified: 0 occurrences of `eyevmykfavooeiklzebe`).

## 3. Exact behavior change (the whole patch)

Patch: `migration/phase13-old-freeze-build.patch` — 71 lines, 5 hunks, **0 schema/DDL/grant statements**, no URL or key changes.

1. **Constant**: `FROZEN_READ_ONLY = true`.
2. **Dispatcher guard**: any action not in the read allowlist returns
   `{ "ok": false, "error": "CLICK is read-only during a data migration. Please try again later." }`
   without touching the database.
3. **Session helpers stop writing while frozen** (reads still verify the session):
   - `requireSession`: no `last_seen` refresh, no deactivation of expired sessions.
   - `requireStaffSession`: no staff `last_seen`/deactivation writes.
   - `requirePracticeDevice`: no `practice_pairings.last_seen` refresh.

Why step 3 is needed: the unmodified v52 writes `sessions.last_seen` and `practice_pairings.last_seen` on ordinary reads. A guard on the write actions alone would still change rows during the freeze.

## 4. Read operations preserved (13)

`session`, `bootstrap`, `preloadTestData`, `practiceWebSync`, `practiceConnectionState`, `practiceExtensionSync`, `adminGetMaxIds`, `staffSession`, `staffDashboardSummary`, `staffSections`, `staffStudents`, `staffStudentDetail`, `staffUnseenReplies`.

## 5. Write operations blocked (24 of 37 router actions in v52)

| Area | Refused actions | Table(s) that would have been written |
|---|---|---|
| Accounts | `signup`, `login`, `logout`, `completeOnboarding`, `setUsername`, `adminResetPassword` | `users`, `sessions` |
| Learning | `completeLearn` | `learn_progress`, `users` |
| Tests | `startTest`, `saveTestAnswer`, `finishTest` | `test_runs`, `attempts`, `users`, `learn_progress` |
| Practice | `completePractice`, `createPracticePairing`, `practicePairingStatus`, `claimPracticePairing` | `practice_progress`, `practice_pairings` |
| Staff | `adminUpsertStaff`, `staffLogin`, `staffLogout`, `staffAssignSection`, `staffSendMessage`, `staffStudentMessages` | `staff_users`, `staff_sessions`, `student_section_assignments`, `staff_messages` |
| Messages | `markMessagesDelivered`, `markMessagesRead`, `studentReplyToMessage`, `studentDismissMessage` | `staff_messages` |

`staffStudentMessages` is refused because it marks student messages as seen (a write), so staff cannot read a student's messages during the freeze.

## 6. Authentication and session behavior

- Existing sessions keep working for reads. Their `last_seen` no longer changes during the freeze.
- No new login or signup is possible during the freeze. This is intentional: students cannot start a write session.
- Staff cannot log in during the freeze. Staff read endpoints work only for staff sessions that already exist.
- The migration itself does not need a login; it reads the database directly.

## 7. Expected user impact

- **Students:** can open the app and view content and progress. Cannot save answers, complete tests, complete learn pages, finish Practice, complete onboarding, or change a username. Anything in progress at the moment of the freeze is not saved. Cannot log in or sign up.
- **VS Code extension:** can refresh its question list (`practiceExtensionSync`). Cannot pair a new device or complete a Practice submission.
- **Staff:** cannot log in, cannot send or mark messages, cannot assign sections.
- **Duration:** owner decision. Students should be told in advance.

## 8. Rollback

1. Redeploy the saved v52 source with the explicit project ref:
   `npx supabase functions deploy click-backend --project-ref jnxevalckgitxuunjcvv`
   after placing `migration/phase13-old-click-backend-v52.index.ts` at `supabase/functions/click-backend/index.ts` in a scratch tree (never in the repo's live function folder).
2. Confirm with a read-only check that the restored version serves a write (for example `saveTestAnswer` returns a normal, non-read-only response for a test session).
3. The rollback creates a new version number with v52's source. Version numbers only increase; the source is what matters.

## 9. Database migration

**None.** The patch contains no DDL. No `supabase db push`, `migration up`, `repair`, or `reset` is part of this procedure. OLD's tables are not modified.

## 10. Other conditions to confirm before deployment

1. **verify_jwt.** `supabase/config.toml` sets `verify_jwt = false`. The CLI applies that value on deploy. The live value on OLD could not be read here, so the owner must confirm it in the Dashboard (Edge Functions → click-backend → "Enforce JWT Verification") before deploying. If it reads `false`, nothing changes.
2. **Freeze window and student notice** (owner decision).
3. **Approval of this preflight** (owner decision).

## 11. Verification already done (scratch only, nothing deployed)

| Check | Result |
|---|---|
| Freeze build vs v52: diff | 5 hunks, 0 DDL, 0 project refs |
| Freeze test on the v52-based build (reads served, 25 write names refused, no row changed; `saveActivityAttempt` is one of the 25 and does not exist in v52) | PASS (1/1) |
| Control: unmodified v52 under the same test | FAIL, as expected (reads change `last_seen`) |
| Router check: allowlist vs v52's 37 actions | all 13 read actions exist; 24 refused |
| v52 source: hard-coded secrets | none (only environment-variable reads) |

## 12. What is NOT covered by this preflight

- Snapshot capture (only after the freeze is verified).
- Post-freeze verification of the live OLD function.
- Any production change.

## Authorization required

This preflight is a request, not a grant. The deployment in section 2 requires explicit authorization in writing from the owner. Until then, OLD stays on version 52.
