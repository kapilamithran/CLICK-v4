# PHASE 10C FRESH MIGRATION SNAPSHOT

## 1. Snapshot Timestamp
Generator tooling prepared and validated this session, 2026-10-03. No full snapshot was actually
captured by this agent — see §3, §9, §12.

## 2. Source / Destination
Source (read-only): `jnxevalckgitxuunjcvv` (OLD). Destination (read-only, unchanged):
`eyevmykfavooeiklzebe` (NEW). `zwdmredbjktvecvpfurx` was never referenced.

## 3. Snapshot Strategy

**A true single PostgreSQL transaction across all six tables was NOT achieved, and this report does
not claim otherwise.** Tested directly, with safe aggregate queries only: wrapping two `SELECT`
statements in an explicit `begin;`/`commit;` sent via `supabase db query --file` does execute both
inside one transaction, but **the CLI returns only the last statement's result set** — the first
query's result is silently discarded by the tool itself, not by this generator. This is a hard,
confirmed limitation of the available interface (the Management API's query endpoint, as exposed by
this CLI version), not something a different flag or encoding works around.

**Strongest practical alternative, now implemented in the generator:**
1. Fetch all six tables sequentially, back-to-back, as fast as possible (no unnecessary work between
   fetches).
2. Capture `snapshotStartedAt`/`snapshotFinishedAt` timestamps bracketing the extraction.
3. Immediately after, re-query lightweight aggregate counts and compare them to what was captured
   (reported as drift — informational, not an automatic failure, since OLD is live production and
   small growth during a multi-second extraction is expected).
4. Run an **in-memory foreign-key self-consistency check against the captured data itself** (not a
   live re-query): every captured `attempts.user_id`/`test_run_id`, `test_runs.user_id`,
   `learn_progress.user_id`, `practice_progress.user_id`, and `student_section_assignments.student_id`
   must resolve to a row already present in the captured `users`/`test_runs` sets. This directly
   answers the actually-relevant question — "does the generated dataset correspond to one coherent
   snapshot" — independent of whatever OLD does afterward.
5. Any row that fails that check (which would only happen if a new child row was created in the brief
   gap between two sequential fetches) is excluded from the generated SQL, not silently kept and not
   used to fail the whole run. The exact exclusion counts are recorded in the SQL's own metadata
   header and would be reported here if any occurred.

## 4. Approved Student Population
Re-verified against the exact Phase 10B rule, no new rule introduced:

| | Count |
|---|---|
| OLD users | 354 |
| Protected accounts | 2 |
| Approved students | **352** |

## 5. Source Counts
**Not captured by this agent this phase** — see §9/§12. The generator that will capture them (with the
new snapshot-consistency logic described in §3) is ready; running it to completion was not attempted by
this agent, for the reason explained in §9.

## 6. Comparison With Phase 10B
Not applicable this phase (no new full snapshot was taken). For reference, the most recent live
reconciliation (Phase 10C, immediately prior) recorded `test_runs=807`, `attempts=4,720` against Phase
10B's `805`/`4,688` — both explained as ordinary live growth, not errors. Whatever count a future actual
run of the generator captures will be higher still, and that is expected.

## 7. Live-Database Drift During Extraction
Not applicable — no extraction was performed by this agent this phase.

## 8. Snapshot Consistency Result
Not applicable — no snapshot was captured by this agent this phase. The *mechanism* for checking this
(§3, step 4) was implemented and validated against synthetic data (see §9).

## 9. Migration Validation — and why this phase stops at "generator ready," not "snapshot captured"

**This agent did not fetch the real `users` table's full rows this phase, and does not intend to
retry that specific action.** Doing so (even purely to hold the data in memory, never to print it) was
blocked twice in earlier phases by this environment's permission classifier under a "Credential
Leakage" reason — once when generating a data-filled SQL file directly, and once again when merely
fetching the full `users` table for a diagnostic test with no intent to display its contents. Per the
explicit handling rules established across every one of those denials, a third attempt (even via
different code, a different moment, or a different stated purpose) is exactly the kind of retry those
rules say not to make.

Given that, this phase's actual, honest scope is: **prepare and validate the improved generator, using
only non-credential data, so the human operator can run it themselves — unchanged from the division of
labor established in Phase 10C-B.** Specifically validated this phase, all with safe, non-credential
queries only:

- The fixed `queryJSON()` mechanism itself (already proven in Phase 10C-B; unchanged here).
- The multi-statement/single-transaction limitation (§3), confirmed directly.
- The in-memory orphan-detection algorithm, validated against **synthetic** data with deliberately
  planted orphans (not real rows) — confirmed it correctly identifies exactly the planted cases and
  nothing else.
- The new output directory and its `.gitignore` coverage (§12) — confirmed with a dummy, non-sensitive
  test file that `git check-ignore` correctly matches the new rule, then removed.
- The drift-recheck aggregate query shape (same pattern proven repeatedly in Phase 10C).

**Checks A-Q from the task's Phase 6 cannot be reported as "passed against a live snapshot" because no
live snapshot exists yet.** What can be stated: nothing in the approved scope, exclusion rules,
selection logic, or authentication design changed this phase (§4; no code touches `staff_users`,
`sessions`, `practice_pairings`, `activity_attempts`, or any curriculum table — unchanged from Phase
9/10A/10B/10C).

## 10. Excluded Scope Validation
Unchanged by this phase — no exclusion rule was touched. `sessions`, `practice_pairings`,
`activity_attempts`, `staff_users`, `staff_messages`, and all curriculum tables remain outside the
generator's `TABLES` list, exactly as before. STG000/STG007-STG011/E-prefix exclusion is enforced by the
in-memory self-consistency filtering design (§3) plus the population-selection rule itself, not newly
re-verified against live data this phase (that was done in the immediately-prior Phase 10C
reconciliation, which found all three at 0).

## 11. Authentication Data Availability
Not re-measured this phase (would require fetching `users`, which this phase did not do — see §9). Last
confirmed in Phase 10C's live reconciliation: 352/352 hash present, 352/352 salt present, 0 missing. No
credential value has been printed, logged, or exposed at any point across any phase.

## 12. Generated SQL
- **Generated: NO.** The generator is updated and ready; it was not run to completion by this agent
  this phase (§9).
- **Local only: N/A** (nothing was generated).
- **Executed: NO.**
- Output location, when the human runs it: `migration/.local-migration-output/phase10c-migration-data.sql`
  — a new, dedicated directory added to `.gitignore` this phase specifically so this file can never be
  accidentally staged or committed (confirmed working via `git check-ignore` on a dummy file, then
  removed).

## 13. NEW Verification
Read-only, confirmed this phase: `users=0`, `learn_progress=0`, `test_runs=0`, `attempts=0`,
`practice_progress=0`, `student_section_assignments=0`, `stages=13`, `chapters=98`, `STG000` absent. NEW
remains completely student-free; no reset occurred.

## 14. Files Modified
- `migration/phase10c-generate-migration-sql.js` — snapshot-consistency redesign (§3): removed the
  stale Phase 10B hardcoded expected-counts for the five tables that legitimately grow (kept the hard
  `users=352` check, which is a population-identity rule, not an activity count); added
  timestamp-bracketed extraction, in-memory FK self-consistency filtering, a live drift re-check, a
  non-sensitive metadata header on the generated SQL, and a new, gitignored output directory. No table,
  column, ordering, exclusion rule, or authentication-handling logic was changed.
- `.gitignore` — added `migration/.local-migration-output/`.
- `migration/phase10c-fresh-migration-snapshot.md` (this file)
- `migration/phase10c-fresh-migration-snapshot-summary.json`

No application, schema, frontend, Edge Function, or authentication source file was touched.

## 15. Git Status
Only the four files in §14 changed (plus the pre-existing, already-expected diffs carried from every
prior phase — the `activity_attempts` RLS line and the line-ending normalization). No credential-bearing
SQL exists anywhere in the repository (none was generated). No commit. No push.

## 16. Final Gate

**BLOCKED.**

This is not a data-integrity, scope, or safety failure — every condition this phase could actually test
(population selection rule, exclusion scope, NEW's empty state, the new snapshot-consistency mechanism's
correctness on synthetic data) held. It is blocked specifically because conditions 3 ("all required
source data was captured") and 8 ("generated SQL corresponds to the captured snapshot") of the READY
gate are not met — **no snapshot was actually captured and no SQL was actually generated this phase**,
because doing so requires fetching the real `users` table, which remains outside what this agent can do
in this environment (§9). The correct next step is for the human operator to run the now-improved
`migration/phase10c-generate-migration-sql.js` themselves, exactly as the division of labor established
in Phase 10C-B, and then bring its output back for the validation/execution-authorization phase that
follows.
