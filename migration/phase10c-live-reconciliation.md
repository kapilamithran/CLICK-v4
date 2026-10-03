# PHASE 10C LIVE RECONCILIATION

## 1. Reconciliation Date / Time
2026-10-02, this session (OLD's live clock shows activity through at least 2026-10-02 19:03 UTC —
see §6).

## 2. Source / Destination
Source (read-only): `jnxevalckgitxuunjcvv` (OLD). Destination (read-only, unchanged): `eyevmykfavooeiklzebe`
(NEW). The unrelated project `zwdmredbjktvecvpfurx` was never referenced.

## 3. Approved Student Population
Reused the exact Phase 10B selection rule — no new rule invented, no change to the protected-account
exclusion: `select * from users where user_id not in ('U1A8B0A6D8810','U485B9DDDA04E')`.

| | Count |
|---|---|
| Total OLD users | 354 |
| Protected accounts | 2 |
| Selected students | **352** (matches the approved population exactly) |

## 4. Phase 10B Snapshot (for comparison only, not edited)

| Table | Phase 10B |
|---|---|
| users | 352 |
| learn_progress | 450 |
| test_runs | 805 |
| attempts | 4,688 |
| practice_progress | 5 |
| student_section_assignments | 352 |

## 5. Current OLD Counts (freshly queried this phase)

| Table | Current | Delta from Phase 10B |
|---|---|---|
| users | 352 | 0 |
| learn_progress | 450 | 0 |
| test_runs | 807 | **+2** |
| attempts | 4,720 | **+32** (see note) |
| practice_progress | 5 | 0 |
| student_section_assignments | 352 | 0 |

**Note on the `attempts` figure:** this count increased twice more *during this same reconciliation
session* — 4,688 (Phase 10B) → 4,707 (observed mid Phase 10C-B testing) → 4,720 (this phase's Phase 2
query) — confirming OLD is live production actively receiving real student submissions in real time,
even within the span of this one reconciliation. The 4,720 figure above is the most current reading;
any later re-check will likely show a still-higher number, and that is expected, not a fault.

**Per-student distribution** (aggregate only, no row content):

| Table | Min | Max | Avg | Students with 0 |
|---|---|---|---|---|
| test_runs | 0 | 85 | 2.29 | 264 |
| attempts | 0 | 372 | 13.41 | 269 |
| learn_progress | 0 | 32 | 1.28 | 253 |
| practice_progress | 0 | 4 | 0.01 | 350 |
| student_section_assignments | 1 | 1 | 1.00 | 0 (every student has exactly one) |

The 253 students with zero `learn_progress` matches exactly the "253 dormant accounts" finding from
Phase 8 (users whose `current_stage` never moved past its signup default because they've never engaged
with any content) — consistent, not a new concern.

## 6. Data Drift

- **`test_runs`: 805 → 807 (+2).** The two newest rows (by `started_at`) are both on `STG001`/`CH0035`,
  with today's timestamps (`2026-10-02`), valid `status` values (`active`/`failed`), and a `finished_at`
  consistent with each status. Both belong to users within the approved 352.
- **`attempts`: 4,688 → 4,720 (+32, and still climbing).** The newest rows are all on `STG001`/`CH0035`,
  question IDs `Q000178`-`Q000184` (all real, valid questions for that chapter), with a realistic mix of
  `correct=true/false`, and timestamps through `2026-10-02 19:03 UTC`.
- In the last 6 hours alone: **14 test_runs and 132 attempts**, from **5-6 distinct students** (safe
  identifier count only — no names/emails/hashes examined or printed).
- **This is fully explained as ongoing, legitimate student activity** — a small number of currently-active
  students working through `CH0035` — not a data-integrity problem, not any excluded-scope leakage
  (`CH0035`/`STG001` is a normal, in-scope, already-migratable chapter), and not an anomaly.

## 7. Per-Student Reconciliation

No per-student dataset was persisted from Phase 10B (only per-table totals were recorded then), so this
phase reconciles by confirming: (a) `users`, `learn_progress`, `practice_progress`, and
`student_section_assignments` are **byte-for-byte unchanged in total count** since Phase 10B (0 delta on
all four), and (b) the only two tables that changed (`test_runs`, `attempts`) changed exclusively through
new, valid, timestamped, in-scope rows attributable to a small set of currently-active students (§6) —
not through any modification of previously-existing rows (OLD's application code never updates a
`test_runs`/`attempts` row's identity after creation; it only inserts new ones or flips `status` on the
same row, both of which are captured by the fresh counts and status-distribution checks above).

**Unexplained differences: 0.**

## 8. Migration Scope Validation

Scope unchanged from Phase 9/10A/10B: `users`, `test_runs`, `attempts`, `learn_progress`,
`practice_progress`, `student_section_assignments`. No table added or removed. Staff strategy remains
**A — fresh provisioning** (no staff migration).

## 9. Exclusion Validation

| Check | Result |
|---|---|
| STG000 `learn_progress` rows (352-population) | 0 |
| STG007-STG011 `test_runs` rows (352-population) | 0 |
| `E%`-prefixed practice rows | 0 |
| Invalid practice references | 0 |
| Max stage/chapter actually used | `STG006` / `CH0115` (unchanged from every prior phase) |

All excluded scopes remain empty for the approved population — the live drift (§6) occurred entirely
within already-in-scope, already-migratable curriculum.

## 10. Foreign-Key Validation

| Check | Result |
|---|---|
| Duplicate `user_id` | 0 |
| Duplicate `roll_no` | 0 (352 distinct) |
| Duplicate `email` | 0 (352 distinct) |
| Duplicate non-null `username` | 0 (341 distinct among 341 non-null) |
| Orphan `attempts.test_run_id` | 0 |
| Orphan `attempts.question_id` | 0 |
| Orphan `student_section_assignments.section_id` | 0 |
| Non-null `assigned_by` | 0 (all 352 still NULL) |
| Duplicate section assignment per student | 0 |
| `password_hash` present | 352/352 |
| `password_salt` present | 352/352 |

No credential value was queried, printed, or compared — only presence/non-emptiness counts.

## 11. NEW Database Verification

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

NEW remains completely student-free; no schema or curriculum reset occurred.

## 12. Safety Verification

Every query this phase was a `SELECT`. No `INSERT`/`UPDATE`/`DELETE`/`UPSERT`/`TRUNCATE`/`ALTER`/`DROP`
was issued against OLD or NEW. No migration SQL was generated or executed. No password hash, salt,
service key, access token, or full user row was printed — every query above returns only counts,
aggregates, or non-credential metadata (stage/chapter/question IDs, timestamps, status strings).

## 13. Files Modified
- `migration/phase10c-live-reconciliation.md` (this file)
- `migration/phase10c-live-reconciliation-summary.json`

No application source, frontend, backend, Supabase migration, schema, or Edge Function file was
touched.

## 14. Commit / Push Status
COMMIT: NONE. PUSH: NONE.

## 15. Final Gate

**READY FOR MIGRATION SNAPSHOT REFRESH.**

All conditions hold: approved population = 352; every reconciliation check passed; the only
differences found (test_runs +2, attempts +32-and-counting) are fully explained as legitimate,
in-scope, ongoing student activity; no unexplained exclusions; no invalid references; auth
hash/salt availability 352/352; NEW remains student-free; OLD remains unchanged (never written to);
no safety issue discovered.

**Important caveat for whatever phase regenerates the migration SQL next:** because `attempts` (and
likely `test_runs`) continue to grow between queries, any fixed "expected count" baked into a future
generator will be a snapshot of one instant, not a stable target. That future phase should either
re-query counts immediately before generating (rather than hardcoding today's numbers) or treat a
small, explained upward drift between its own count-check and its own generation step as expected,
rather than a failure.
