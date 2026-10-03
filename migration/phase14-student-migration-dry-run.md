# Phase 14 — Student migration dry run

Status: **BLOCKED** by one NEW collision. **No migration SQL was generated.** Nothing was executed, and NEW is unchanged.

Source: the frozen OLD snapshot (`migration/phase14-snapshot-manifest.md`).

## Counts (frozen source → migration)

| Table | SOURCE FROZEN | MIGRATION SELECTED | MIGRATION EXCLUDED | NEW PRE-EXISTING |
|---|---:|---:|---:|---:|
| users | 354 | 352 | 2 (protected accounts) | 1 (test account) |
| test_runs | 954 | 835 | 119 (protected accounts) | 5 |
| attempts | 5080 | 4894 | 186 (protected accounts) | 2 |
| learn_progress | 539 | 465 | 74 (protected accounts) | 0 |
| practice_progress | 5 | 5 | 0 | 0 |
| student_section_assignments | 352 | 352 | 0 | 1 |

Every exclusion is explained: the two protected accounts and their rows. The 119 test runs, 186 attempts, and 74 learn-progress rows that are excluded include all 92 `STG000` test runs and all 60 `STG000` learn-progress rows.

## Validation

| Check | Result |
|---|---|
| Duplicate user IDs, usernames, emails | 0 |
| Duplicate roll numbers within the selected 352 | 0 |
| Password hash and salt present (352 of 352) | yes |
| Test runs / attempts / progress / assignments reference selected users | yes (0 orphans) |
| Attempts' user matches their test run's owner | yes (0 mismatches) |
| Per-student counts match the frozen source (352 students) | yes (0 mismatches) |
| Selected + excluded = frozen total (every table) | yes |
| `STG000` or `STG007`–`STG011` rows for selected students | 0 |
| Protected accounts selected | 0 |
| NEW test account ID selected | 0 |
| NEW test account ID collides with a selected user ID | no |
| NEW test account username or email collides with a selected user | no |
| NEW test-run, attempt, progress, and assignment IDs collide with snapshot IDs | no |
| **NEW roll number collides with a selected user's roll number** | **YES: one collision** |

## The blocking collision

NEW enforces a unique constraint on `users.roll_no`. The NEW test account holds one roll number that is also held by one selected OLD student (an active student who joined on 2026-09-26). Inserting that student would fail with a unique-violation.

The earlier check that reported "0 roll-number collisions" was wrong. It looked up the NEW account's roll number in OLD's table, where the NEW account does not exist, so it could never find a match.

The identifiers for the colliding student are kept only in the gitignored file `migration/.local-migration-output/phase14-collision-local.json`.

## Options (each needs your decision)

1. **Change the NEW test account's roll number.** This modifies a NEW row, so it needs your explicit approval. The test account is not deleted.
2. **Give the OLD student a different roll number in NEW.** This changes migrated data, so it needs your explicit approval and a documented mapping.
3. **Exclude that one student.** This creates an explicit, documented exclusion, so it needs your approval.
4. **Treat the two accounts as the same person** and merge them. Not recommended without your confirmation of identity.

Until one option is approved, the dry run cannot pass, and the student migration cannot proceed.

## Not included in this migration (by specification)

sessions, practice_pairings, activity_attempts (absent on OLD), curriculum, protected accounts, staff data.

## Stop

Per the phase rules, the dry run is not valid while a collision exists, so no SQL was generated and nothing was run.
