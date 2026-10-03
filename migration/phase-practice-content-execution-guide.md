# Practice Content Migration: Execution Guide (NOT executed)

This guide describes how to run the Practice content replacement in NEW (`eyevmykfavooeiklzebe`). **Nothing here has been executed.** Every command targets NEW explicitly with `--project-ref eyevmykfavooeiklzebe`. Never use the OLD ref (`jnxevalckgitxuunjcvv`) for any command in this guide.

## What it does

Replaces NEW's 70 legacy Practice questions (S0–S5, IDs like `S0-Q1`) and 234 tests with the verified updated set: 70 questions across S0–S9 (IDs like `S0-C1-Q1`) and 402 tests (332 hidden, 70 public). IDs come exactly from the verified export. It is **content only**: no schema change, no student data, and no change to `practice_progress`, `stages`, or chapters. The 15 legacy Practice prerequisite rows are not migrated.

## Files

| File | Purpose | Tracked? |
|---|---|---|
| `migration/phase-practice-content-migration.sql` | The replacement (one transaction, guarded) | yes |
| `migration/phase-practice-content-rollback.sql` | Restores the pre-migration content (guarded) | yes |
| `migration/phase-practice-migration-validation.sql` | Read-only checks, run before and after | yes |
| `migration/.local-practice-export/` | Source snapshot (70 questions, 402 tests), checksums in `manifest.json` | no (gitignored) |
| `migration/.local-practice-new-before-replacement/` | Pre-migration backup of NEW (70 questions, 234 tests, 0 mistakes), checksums in `manifest.json` | no (gitignored) |

## 1. Preflight (read-only)

Run this immediately before the migration, not earlier:

```
npx supabase db query --linked --project-ref eyevmykfavooeiklzebe "select (select count(*) from practice_progress) as practice_progress, (select count(*) from practice_bank) as questions, (select count(*) from practice_tests) as tests, (select count(*) from practice_tests where hidden) as hidden_tests, (select count(*) from practice_mistakes) as mistakes;"
```

**Expected:** `practice_progress` = **0**, `questions` = **70**, `tests` = **234**, `hidden_tests` = **139**, `mistakes` = **0**.

Also confirm the local snapshot checksums are unchanged from the manifest. If the snapshot file was edited, stop.

## 2. Migration execution

```
npx supabase db query --linked --project-ref eyevmykfavooeiklzebe --file migration/phase-practice-content-migration.sql
```

The file is one `begin ... commit` transaction. It has eight guard blocks that raise an error and abort, and the transaction rolls back, if any check fails. A clean run ends with no error output.

## 3. Post-migration validation (read-only)

```
npx supabase db query --linked --project-ref eyevmykfavooeiklzebe --file migration/phase-practice-migration-validation.sql
```

Note: the CLI returns only the last statement's result for a multi-statement file. To see each check, run its queries one at a time, or check the expected counts with the single-value query below.

```
npx supabase db query --linked --project-ref eyevmykfavooeiklzebe "select (select count(*) from practice_bank) as questions, (select count(*) from practice_tests) as tests, (select count(*) from practice_tests where hidden) as hidden_tests, (select count(*) from practice_tests where not hidden) as public_tests, (select count(*) from practice_progress) as practice_progress;"
```

## 4. Expected counts

| Check | Expected |
|---|---|
| Questions | 70 |
| Tests | 402 |
| Hidden tests | 332 |
| Public tests | 70 |
| Questions per stage (S0–S9) | S0 5, S1 5, S2 5, S3 5, S4 5, S5 6, S6 11, S7 6, S8 15, S9 7 |
| Orphan tests | 0 |
| Duplicate IDs | 0 |
| `practice_progress` | 0 |
| Prerequisite rows changed | 0 (none migrated) |

## 5. Rollback

Only if the migration succeeded and must be reverted:

```
npx supabase db query --linked --project-ref eyevmykfavooeiklzebe --file migration/phase-practice-content-rollback.sql
```

The rollback restores the 70 questions, 234 tests, and 0 mistake rules from the backup. It also refuses to run if `practice_progress` has any rows, because deleting the updated questions would cascade-delete that progress.

## 6. Stop conditions

Stop and do not continue if any of these hold:

- `practice_progress` is greater than 0 at preflight. Stop immediately and report the count. Do not run the migration.
- The preflight counts differ from section 1 (not 70 / 234 / 139 / 0).
- The snapshot checksums differ from `manifest.json`.
- The migration command reports any error. The transaction does not commit, so the database is unchanged. Confirm with the post-migration query before doing anything else.
- The command's `--project-ref` is anything other than `eyevmykfavooeiklzebe`.
- After migration, any count in section 4 differs.
- Any student has started updated Practice after the migration. Do **not** roll back, because that would erase their progress. Report it instead.

## 7. Confirmation: OLD is untouched

Every statement in this migration package is a read or is scoped to NEW. The migration file, the rollback file, and the validation file contain no reference to OLD's ref. The local snapshot and backup were produced by `SELECT`-only queries against OLD and NEW. OLD's `practice_bank`, `practice_tests`, `prerequisites`, and `practice_progress` were read, never written.

## 8. Practical notes

- Running the migration writes to NEW. In this session that action has been blocked by the auto-mode permission classifier, so it is expected that **you** run section 2 yourself from a terminal in `C:\Users\Andry\Click-NewTrial\Click-V3`.
- Code changes for the S0–S9 labels are a **separate** step, after the content migration. They are not part of this package.
