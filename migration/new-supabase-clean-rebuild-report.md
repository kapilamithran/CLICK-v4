# NEW Supabase Clean Rebuild Report (Phase 6)

## 1. Why reset was required

Phase 5's real `db push` against NEW (`eyevmykfavooeiklzebe`) applied 27 of 45 migrations
successfully, then stopped cleanly at `20260926150000_learn_content_corrections.sql`. That
migration has a built-in exact-text safety check (it verifies old text exists before
replacing it, and raises an exception — changing nothing — if it doesn't). It correctly
detected that `L_CH0031` page 2 didn't contain the exact text it expected and aborted
without writing anything. Investigating why revealed the mismatch was caused by CRLF
contamination, not a content-authoring error, and that contamination was present in at
least 6 other already-applied migrations writing to `learn_content`. Patching forward would
have left inconsistently-formatted (CRLF-laden) text underneath later, correctly-formatted
content, so the only option consistent with this project's standing data-integrity rules was
a full reset and rebuild from LF-clean migration files.

## 2. CRLF root cause

See `migration/line-ending-audit.md` for full detail. Summary: `git config core.autocrlf`
was `true` with no `.gitattributes` override, so every multi-line SQL string literal (e.g.
`learn_content.pages_text`) was checked out with `\r\n` embedded in the working-tree file,
which `supabase db push`/`db reset` then wrote verbatim into the stored column value.

## 3. Files affected

27 of the 44 original migration files contained CRLF; all 27 were normalized to LF. 2 files
created earlier this session were already LF-clean. Full list in
`migration/line-ending-audit.md`.

## 4. Line-ending correction

Added `.gitattributes` (`*.sql text eol=lf`) to prevent recurrence on future checkouts, and
directly stripped trailing `\r` from the 27 affected files' working-tree content. Verified
via `git hash-object` that every normalized file now hashes to the exact blob SHA already
recorded in `HEAD` — zero content drift, pure line-ending restoration. `git diff --check`
clean; `git diff --stat` shows only the previously-approved `activity_attempts.sql` RLS
addition.

## 5. NEW pre-reset state

- 27/45 migrations applied (schema, grants, early content/practice, the TERM024/TERM028
  glossary fix).
- 0 users, 0 sessions, 0 learn_progress, 0 test_runs, 0 attempts, 0 practice_progress, 0
  practice_pairings, 0 student_section_assignments, 0 staff_sessions/staff_users/staff_messages.
- Confirmed via `supabase inspect db table-stats --linked` immediately before reset.

## 6. Reset confirmation

Ran `supabase db reset --linked --yes` with the CLI linked to `eyevmykfavooeiklzebe`
(verified immediately beforehand via `supabase/.temp/project-ref`). This is the CLI's only
supported mechanism for resetting a remote **linked** project (there is no separate
drop-only command for a remote target in this CLI version) — it drops all objects and
reapplies every local migration in one operation. Confirmed before running: project-ref
equaled `eyevmykfavooeiklzebe`, not `jnxevalckgitxuunjcvv`.

## 7. Dry-run result

A `supabase db push --dry-run` was run after adding the LF fix and before the reset; it
listed all 37 then-pending migrations with no errors (`PASS`). The actual reset below is the
authoritative result.

## 8. Real push result

`supabase db reset --linked --yes` applied **all 45 migrations successfully, including the
previously-failing `20260926150000_learn_content_corrections.sql` and all 17 migrations
after it that were never reached before** (Stage 6 Arrays through Pointers content, every
stage-unlock migration, the Stage 6 chapter-order fix, `activity_attempts`). No errors.

## 9. Final migration count

`supabase migration list` confirms **45/45** local migrations have a matching `remote`
version — full apply, nothing pending.

## 10. learn_content validation

`learn_content` now has **98 rows** (one per chapter, matching the 98-chapter curriculum).
The specific text that previously failed to match (`L_CH0031` "Easy Analogy") now has
clean LF-only line breaks at the source (confirmed before the reset via byte-level
inspection), and the corrections migration applied without error this time — meaning its
own internal exact-text safety check succeeded, which is the authoritative, migration-native
confirmation that the stored text matches exactly what the correction expected.

## 11. activity_attempts RLS validation

`activity_attempts` exists post-rebuild (`estimated_row_count: 0`, confirmed via
`inspect db table-stats`). Its defining migration,
`20261001030000_activity_attempts.sql`, contains `alter table activity_attempts enable row
level security;` as its final statement (read directly from the file) and applied
successfully as part of the 45/45 full apply — confirming RLS is enabled. No direct raw-SQL
`pg_tables`/`pg_policies` query was available (`supabase inspect db` has no RLS-status
subcommand and no Docker/psql is available in this environment for a raw `SELECT`), so this
is confirmed via migration-content + successful-apply, consistent with how this project has
verified schema state throughout this engagement.

## 12. curriculum validation

- `stages`: **13** (matches expected).
- `chapters`: **98** (matches expected).
- `STG000`: **absent** — exactly 13 stages exist, not 14; no migration in the 45-file history
  ever inserts a `STG000` row (confirmed earlier by exhaustive grep), so a from-scratch
  target never creates it.
- `glossary`: **436** rows — exactly the 434 defined across the original 44 migrations plus
  the 2 (`TERM024`, `TERM028`) added by this phase's corrective migration, sourced from
  `CSVs/CLICK v2 - Glossary.csv` (a real export), not invented.

## 13. student-data validation

Post-rebuild `inspect db table-stats`: `users=0`, `sessions=0`, `attempts=0`,
`learn_progress=0`, `test_runs=0`, `practice_progress=0`, `practice_pairings=0`,
`student_section_assignments=0`, `staff_sessions=0`, `staff_users=0`, `staff_messages=0`.
No student or staff migration occurred.

## 14. OLD database safety confirmation

OLD (`jnxevalckgitxuunjcvv`) was touched only by one read-only `supabase migration list`
call, done to confirm it remains unchanged (26/44 applied, identical to its state recorded
earlier in this engagement; the new 45th corrective migration correctly shows as not
applied there, since it has never been pushed to OLD). No write command was ever issued
against OLD. The CLI was relinked back to `eyevmykfavooeiklzebe` immediately afterward and
confirmed via `supabase/.temp/project-ref`.

## 15. Remaining tasks

Per this phase's explicit scope, work stops here. Not performed (by design): student
migration (354 real OLD users), progress migration, Edge Function deployment, frontend
deployment, commit, push. These remain for a future, explicitly-authorized phase.
