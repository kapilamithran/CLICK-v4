# Phase 14 — OLD freeze record

Status: **OLD is FROZEN** (read-only build live). It stays frozen until the next explicitly authorized stage.

| Item | Value |
|---|---|
| OLD project | `jnxevalckgitxuunjcvv` |
| Function | `click-backend` |
| Version before freeze | **52** (ACTIVE, `verify_jwt = false`) |
| Version after freeze | **53** (ACTIVE, `verify_jwt = false`) |
| Source of the freeze build | repo commit `71059e2b6c58d936fb7e8391235cd533acfeb75a` (v52) + the freeze patch in `migration/phase13-old-freeze-build.patch` |
| Deployed bytes | identical to the verified freeze build (SHA-256 prefix `7a1d68e4e183d726`) |
| Deployment command | `supabase functions deploy click-backend --project-ref jnxevalckgitxuunjcvv --use-api --no-verify-jwt` (explicit ref; no `config.toml` reliance) |
| Freeze start (function record, UTC) | **2026-10-03T06:50:51.093Z** |
| Last pre-freeze counts (database clock) | 2026-10-03 06:50:14 UTC |
| Post-freeze counts (database clock) | 06:51:32, 06:52:06, 06:52:40, 06:56:13 UTC (unchanged) |
| Database migrations / schema changes | **none** (the patch contains no DDL; no `db push`, `migration up`, `repair`, or `reset`) |
| Frontend / Cloudflare / NEW changes | none |

## Verification

Read verification (invalid probe token, no data created):
- `session` → `{"ok":false,"error":"Session expired. Please log in again."}` (normal application contract)
- `bootstrap` → same normal contract

Write-block verification (all 24 write actions of v52, invalid probe token; refused before any database access):
- **24 of 24** returned `CLICK is read-only during a data migration. Please try again later.`
- Refused: signup, login, logout, markMessagesDelivered, markMessagesRead, studentReplyToMessage, studentDismissMessage, adminResetPassword, completeOnboarding, setUsername, completeLearn, startTest, saveTestAnswer, finishTest, createPracticePairing, practicePairingStatus, claimPracticePairing, completePractice, adminUpsertStaff, staffLogin, staffLogout, staffAssignSection, staffSendMessage, staffStudentMessages.

Stability: row counts did not change across the freeze or across the snapshot capture (see section below).

Pre-freeze counts (database clock, 06:50:14 UTC): users 354, test_runs 954, attempts 5080, learn_progress 539, practice_progress 5, student_section_assignments 352, sessions 754, practice_pairings 32, staff_messages 4.

Post-freeze counts (06:56:13 UTC, after snapshot capture): identical.

## Rollback (not executed)

Restore v52 with the explicit ref, from `migration/phase13-old-click-backend-v52.index.ts` placed in a scratch tree at `supabase/functions/click-backend/index.ts`:
`supabase functions deploy click-backend --project-ref jnxevalckgitxuunjcvv --use-api --no-verify-jwt --workdir <scratch>`

The rollback copy was verified to match OLD's live v52 by SHA-256 before the freeze (prefix `929c50e844c04ff2`).

Do not unfreeze after the snapshot. Unfreezing is a separate, explicitly authorized step, and it is required if the migration does not proceed.

## User impact while frozen

Students can open the app and view content. Saving answers, completing tests, learn pages, Practice, onboarding, and username changes are refused. New logins and signups are refused. Staff cannot log in or send, mark, or assign anything. The VS Code extension can refresh its question list but cannot pair or submit.
