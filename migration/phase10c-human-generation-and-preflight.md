# PHASE 10C HUMAN LOCAL GENERATION AND FINAL PREFLIGHT

## 1. Execution Environment
Agent-run (Claude Code session), 2026-10-03, working directory `C:\Users\Andry\Click-NewTrial\Click-V3`,
branch `unified-chapter-experience`, HEAD `ab090063b059d892c619192b5d654a767d73fe20` (unchanged).

**Local generation was NOT performed by the agent in this session.** The generator
(`migration/phase10c-generate-migration-sql.js`) fetches the full `users` table, which includes
`password_hash`/`password_salt`. That exact fetch was blocked by this environment's credential-leakage
protection on three earlier occasions. Per this prompt's own rule ("do not attempt to bypass
credential-leakage protections") it was not attempted again. Generation must be run by the human
operator on their own machine (see §14).

## 2. Source / Destination
- Source (read-only): `jnxevalckgitxuunjcvv` (OLD)
- Destination (read-only, not written): `eyevmykfavooeiklzebe` (NEW)
- CLI link (`supabase/.temp/project-ref`): `eyevmykfavooeiklzebe`, unchanged. The generator passes
  `OLD_REF` explicitly via `--project-ref` and never relies on the link file.
- `zwdmredbjktvecvpfurx`: never referenced.

## 3. Population Verification
Re-queried OLD this phase (aggregate counts only, no row content):

| Check | Result |
|---|---|
| OLD users | 354 |
| Protected accounts (`U1A8B0A6D8810`, `U485B9DDDA04E`) | 2 |
| Approved population | **352** (matches) |

Population check passed. The approved population is 352, so the STOP condition does not apply.

## 4. Fresh Source Snapshot
Counts observed directly from OLD during this phase (aggregate only). These are informational, not a
captured snapshot:

| Table | Observed now | Phase 10B | Phase 10C recon |
|---|---|---|---|
| users (approved) | 352 | 352 | 352 |
| test_runs | 828 | 805 | 807 |
| attempts | 4,840 | 4,688 | 4,720 |
| learn_progress | 464 | 450 | 450 |
| practice_progress | 5 | 5 | 5 |
| student_section_assignments | 352 | 352 | 352 |

OLD is live production, and the counts continue to grow between queries. `learn_progress` rose from
450 to 464 since the last reconciliation, which is new in this phase.

No fresh snapshot was captured by the generator (it was not run by the agent). Consistency therefore
cannot be asserted for any dataset in this report.

## 5. Snapshot Consistency
**Not established.** The generator's design (sequential per-table extraction, timestamps around
extraction, in-memory foreign-key self-consistency filtering, post-extraction drift re-check, and a
hard stop only if the `users` population changes) is in place and was validated in Phase 10C-D on
synthetic data. It has not been run against live data by this agent.

## 6. Generated Dataset Counts
Not produced by this agent. The human operator's local run will report captured counts for each table.
Per the prompt, generated counts must equal captured source counts, with a difference of 0 for every
table.

## 7. Foreign-Key Validation
Not performed on any generated dataset (none exists in this session). The generator applies the
foreign-key self-consistency check to its captured data and excludes any orphaned child rows, recording
the counts in the SQL header. Those counts are for the human operator to read from their local run.

## 8. Authentication Data Availability
Not re-measured this phase. It was last confirmed in Phase 10C live reconciliation: 352/352 hash
present, 352/352 salt present, 0 missing. Re-verifying it requires fetching `users` rows, which this
session does not do.

## 9. Exclusion Validation
Checked against live OLD where it can be done with aggregates:

| Scope | Result |
|---|---|
| Approved-population STG000 `learn_progress` rows | 0 (Phase 10C recon) |
| Approved-population STG007–STG011 `test_runs` rows | 0 (Phase 10C recon) |
| E-prefix practice rows | 0 (Phase 10C recon) |
| sessions / practice_pairings / activity_attempts / staff / curriculum | Not in the generator's `TABLES` list (static) |

These are exclusion checks against live data from the earlier reconciliation. The generated dataset
itself has not been checked.

## 10. Generated SQL Structural Validation
Not applicable: no SQL was generated in this session. The generator's static structure was confirmed
(see §12): the table list is `users`, `test_runs`, `attempts`, `learn_progress`, `practice_progress`,
`student_section_assignments`, in that order, with no other tables.

## 11. NEW Database Preflight
Read-only, run this phase:

| Check | Result |
|---|---|
| users | 0 |
| learn_progress | 0 |
| test_runs | 0 |
| attempts | 0 |
| practice_progress | 0 |
| student_section_assignments | 0 |
| stages | 13 |
| chapters | 98 |
| STG000 present | No |

NEW is student-free and its curriculum is intact.

## 12. Credential Safety
- Credential values were not printed.
- Credential values were not included in any report or JSON summary.
- No `users` row was fetched in this session.
- Generated SQL: none exists in this session. The human operator's local output, when produced, stays
  at `migration/.local-migration-output/phase10c-migration-data.sql`.
- Generated SQL was not committed.
- Generated SQL was not executed.
- Generated SQL contents were not displayed or pasted into chat.

## 13. Git Safety
- `git status`: `.gitignore` modified (the one-line output-directory rule). Untracked: `migration/`,
  `.gitattributes`, `supabase-new-details.md`, `supabase/migrations/20260910130000_add_missing_legacy_glossary_terms.sql`.
  Modified: the same 26 migration files from prior phases (line-ending normalization and the
  `activity_attempts` RLS line). No application, frontend, backend, schema, Edge Function, or
  unrelated files changed.
- `git diff --check`: clean (exit 0).
- Output path ignored: `git check-ignore -v migration/.local-migration-output/phase10c-migration-data.sql`
  matches `.gitignore:12`.
- HEAD unchanged: `ab090063b059d892c619192b5d654a767d73fe20`.
- Commit: NONE. Push: NONE.

## 14. Execution Status
- Local generation by agent: **NOT PERFORMED** (credential-protection constraint, §1).
- Generation by human operator: **PENDING**.

**To run it locally (human operator):**
1. Open a terminal in `C:\Users\Andry\Click-NewTrial\Click-V3`.
2. `node migration\phase10c-generate-migration-sql.js`
3. If it stops with a row-count or orphan message, read the printed counts. Do not edit the SQL.
4. When it completes, the file is `migration\.local-migration-output\phase10c-migration-data.sql`.
   Do not open it in chat, do not commit it, do not push it.
5. Run the read-only preflight queries in `migration/phase10c-preflight-and-validation.sql`
   (Section A) against OLD and NEW.
6. Return the aggregate results (counts, pass/fail, the header's orphan and snapshot numbers). Do not
   return credential values or SQL.

## 15. Final Gate

**BLOCKED.**

Reason: READY FOR EXPLICIT EXECUTION requires an actually captured and validated generated dataset
(conditions 2-7), and no dataset was generated in this session. Blocking is not a data or safety
failure: every condition this session could check passed.

Once the human operator's local run completes and its aggregate results are returned, the gate can be
re-evaluated in a separate phase.

---

PHASE 10C HUMAN LOCAL GENERATION + FINAL PREFLIGHT: BLOCKED
