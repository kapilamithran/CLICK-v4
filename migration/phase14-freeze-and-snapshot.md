# Phase 14 — OLD freeze, immutable snapshot, and readiness

Date: 2026-10-03. Baseline: `main` at `30f8382`.

## Final output

| Item | Result |
|---|---|
| OLD | **FROZEN** (read-only build live; stays frozen) |
| OLD click-backend | **version 53** (was 52) |
| SNAPSHOT | **CAPTURED** (local, gitignored, read-only files) |
| SNAPSHOT VALIDATION | **FAIL**: all internal checks pass; one cross-check against NEW fails (roll-number collision) |
| STUDENT MIGRATION | **NOT EXECUTED** |
| NEW STUDENT DATA | **UNCHANGED** (1 test account) |
| PRODUCTION | **STILL OLD** |
| FINAL STATUS | **NOT READY** |

## Freeze authorization

Authorized in this phase by the user, for deployment of the verified read-only build to OLD `jnxevalckgitxuunjcvv`.

## verify_jwt verification

Read-only check through the Supabase CLI (`functions list`, JSON output): **`verify_jwt: false`** for OLD `click-backend`, confirmed before deployment and again after it. The gate passed.

## OLD function version

- Before freeze: **52** (ACTIVE)
- After freeze: **53** (ACTIVE, `verify_jwt: false`)
- Deployed bytes match the verified freeze build exactly (download and compare).

## Freeze timestamp

**2026-10-03T06:50:51.093Z** (the function's deployment record, UTC). Pre-freeze counts were read at 06:50:14 UTC (database clock).

## Read verification

- `session` and `bootstrap` with an invalid probe token return the normal application error (`Session expired. Please log in again.`). The read path runs, and no data was created.

## Write-block verification

- **24 of 24** write actions of v52 were refused with `CLICK is read-only during a data migration. Please try again later.` The probe used an invalid token, so no real student data was created or changed.

## Before/after freeze counts

| Table | Before (06:50:14 UTC) | After (06:51:32–06:56:13 UTC) |
|---|---:|---:|
| users | 354 | 354 |
| test_runs | 954 | 954 |
| attempts | 5080 | 5080 |
| learn_progress | 539 | 539 |
| practice_progress | 5 | 5 |
| student_section_assignments | 352 | 352 |
| sessions | 754 | 754 |
| practice_pairings | 32 | 32 |
| staff_messages | 4 | 4 |

No count changed during the freeze or the snapshot capture.

## Frozen snapshot counts

| Table | Frozen source | Selected | Exported | Match |
|---|---:|---:|---:|:---:|
| users | 354 | 352 | 352 | yes |
| test_runs | 954 | 835 | 835 | yes |
| attempts | 5080 | 4894 | 4894 | yes |
| learn_progress | 539 | 465 | 465 | yes |
| practice_progress | 5 | 5 | 5 | yes |
| student_section_assignments | 352 | 352 | 352 | yes |

The snapshot is stored in `migration/.local-migration-output/phase14-snapshot/` (gitignored; not tracked; Cloudflare excludes `migration/`). Files are read-only.

## Exclusions

| Scope | Excluded | Reason |
|---|---:|---|
| users | 2 | protected accounts |
| test_runs | 119 | owned by protected accounts (includes all 92 `STG000` runs) |
| attempts | 186 | owned by protected accounts |
| learn_progress | 74 | owned by protected accounts (includes all 60 `STG000` rows) |
| practice_progress | 0 | none |
| student_section_assignments | 0 | none |

Every exclusion is explained. Selected + excluded equals the frozen total for every table.

## Protected account handling

Both protected accounts are on OLD. Both are excluded from the selection, and neither is on NEW. They were not deleted or modified.

## NEW test-account handling

The NEW test account is unchanged. It is not selected, and its ID does not collide with any selected ID. However, **one roll number collides** with a selected OLD student. NEW enforces a unique `roll_no`, so migrating that student would fail. This is a real collision and blocks the migration. Nothing was overwritten, deleted, or truncated. The four options are in `phase14-student-migration-dry-run.md`.

Correction: the earlier "0 roll-number collisions" result was wrong. It looked up the NEW account in the wrong table.

## Integrity checks (on the snapshot files)

- Checksums of every file match the manifest: PASS.
- Unique user IDs, usernames, emails, roll numbers (within the selected set): PASS.
- Unique test-run, attempt, progress, and assignment IDs: PASS.
- Orphans: 0 for test runs, attempts, learn progress, practice progress, assignments.
- Attempts' user matches their test run's owner: 0 mismatches.
- Password hashes and salts present: 352 of 352 (no values read into any report).
- `STG000` or `STG007`–`STG011` rows for selected students: 0.
- Practice IDs in the snapshot all resolve on NEW (4 of 4).

## Per-student reconciliation

All 352 selected students were checked against the frozen OLD source: test runs, attempts, learn progress, practice progress, and assignments per student. **0 mismatches.**

## Snapshot checksums

Recorded in `migration/phase14-snapshot-manifest.md` (SHA-256 of each file). The manifest contains no password hashes or salts.

## Migration dry-run counts

See `migration/phase14-student-migration-dry-run.md`. Selected: 352 users, 835 test runs, 4894 attempts, 465 learn-progress rows, 5 practice-progress rows, 352 assignments. The dry run is **blocked** by the roll-number collision. No SQL was generated.

## NEW curriculum

Unchanged and verified: 13 stages, 98 chapters, 98 learn-content rows, 70 Practice questions, 402 tests (332 hidden, 70 public), 0 Practice prerequisites, no `STG000`.

## Rollback procedure

- Restore v52 from `migration/phase13-old-click-backend-v52.index.ts` (verified byte-equal to OLD's live v52 before the freeze), using the explicit ref and `--no-verify-jwt`.
- **Not executed.** OLD stays frozen. Do not unfreeze without an explicit instruction, because the snapshot is meant to be the source for the final migration.

## Remaining risks

1. **The freeze is in effect now.** Students cannot save progress, complete tests, or log in until OLD is unfrozen or the migration proceeds. This is the cost of keeping the snapshot consistent.
2. **Roll-number collision** with the NEW test account (blocks the migration).
3. **Production host is unknown** (`puc-v2` is not on this account).
4. **`clear_test_accounts` history** cannot be fully proven from read-only evidence (documented in Phase 13).
5. **Browser login checks** remain user-assisted (you reported the browser check as done; details were not provided to these reports).

## Final readiness

**NOT READY.**

Gate evaluation (Phase 14 section 24):

| # | Condition | Result |
|---|---|---|
| 1 | OLD freeze deployed | PASS |
| 2 | verify_jwt confirmed | PASS (false) |
| 3 | OLD read actions work | PASS |
| 4 | OLD write actions blocked | PASS (24 of 24) |
| 5 | Schema unchanged | PASS |
| 6 | Frozen timestamp recorded | PASS |
| 7 | Snapshot captured | PASS |
| 8 | Snapshot immutable and local | PASS |
| 9 | Checksums generated | PASS |
| 10 | Password hashes and salts complete | PASS |
| 11 | No orphan records | PASS |
| 12 | No duplicate IDs | PASS |
| 13 | No unexplained exclusions | PASS |
| 14 | Protected accounts excluded | PASS |
| 15 | NEW test account preserved | PASS for preservation; **FAIL** for collision (roll number) |
| 16 | NEW curriculum unchanged | PASS |
| 17 | Student dry run passes | **FAIL** (blocked by collision) |
| 18 | Frozen counts reconcile | PASS |
| 19 | Per-student reconciliation | PASS |
| 20 | No migration executed into NEW | PASS |

Conditions 15 and 17 fail, so the status is **NOT READY**.

## Not claimed

No migration has been completed, no production has been migrated, and no production cutover has occurred.
