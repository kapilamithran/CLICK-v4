# Phase 15 — Test-account deletion (OLD and NEW)

Date: 2026-10-03. Authorized by the owner in this session, after a read-only review and a second confirmation.

Scope: only accounts the owner identified as test accounts. Real students, the two protected accounts, and all other data were not touched. The migration clause `clear_test_accounts` was **not** run; this was a targeted deletion of the accounts named by the owner.

## OLD (`jnxevalckgitxuunjcvv`, production, frozen)

Deleted: 3 unprotected accounts identified as test accounts. Deletion ran as a single guarded transaction; every table's deleted-row count was checked against the backup before commit.

| Table | Before | Deleted | After |
|---|---:|---:|---:|
| users | 354 | 3 | 351 |
| test_runs | 954 | 3 | 951 |
| attempts | 5080 | 12 | 5068 |
| learn_progress | 539 | 2 | 537 |
| sessions | 754 | 4 | 750 |
| student_section_assignments | 352 | 3 | 349 |
| practice_progress | 5 | 0 | 5 |
| practice_pairings | 32 | 0 | 32 |

Post-check: the 3 deleted accounts have 0 remaining rows; both protected accounts are present.

## NEW (`eyevmykfavooeiklzebe`, test)

Deleted: the NEW test account (1 user) and its dependent rows (5 test runs, 2 attempts, 1 assignment, 4 sessions). Guarded transaction, checked against the backup.

Post-check: NEW has 0 users. Curriculum unchanged: 13 stages, 98 chapters, 98 learn-content rows, 70 Practice questions, 402 Practice tests.

## Consequences

- **The frozen snapshot predates this deletion.** It still lists the 3 deleted accounts as selected students. Before any migration, either exclude those 3 accounts from the snapshot (a documented exclusion), or recapture the snapshot from OLD while it remains frozen. Recapture is recommended.
- **The roll-number collision with the NEW test account no longer exists**, because the NEW test account was deleted.
- **OLD remains frozen** (click-backend v53). It is not unfrozen by this step.
- Backups of the deleted rows are stored only in the gitignored local folder `migration/.local-migration-output/phase15-backup/`.
