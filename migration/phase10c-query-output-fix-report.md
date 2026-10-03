# PHASE 10C-B QUERY OUTPUT FIX REPORT

## 1. Root Cause

`queryJSON()`'s `const idx = out.indexOf('{'); return JSON.parse(out.slice(idx)).rows;` assumed stdout
always contains the CLI's JSON payload starting at its first `{`, with no guard for the "not found"
case (`idx === -1`) and no visibility into stderr at all. When that assumption didn't hold for the
user's `users`-table run, `out.slice(-1)` silently took just the last character of stdout rather than
"from the first `{` onward," and `JSON.parse` on that fragment threw exactly `Unexpected end of JSON
input`. Static inspection alone cannot prove *why* stdout lacked a `{` in that specific run (reproducing
it would require fetching the real `users` table again, which this environment's credential-leakage
protection blocks regardless of what the code then does with the result — confirmed again this phase,
see §2). The fix therefore does not depend on pinpointing that one external cause; it makes the function
correctly handle (detect and report) the case instead of crashing opaquely.

## 2. Installed Supabase CLI Output Behavior

Confirmed directly via `npx supabase db query --help` and controlled, read-only, non-credential test
queries (a trivial `count(*)` and a large real `test_runs` fetch, 807 rows / ~700KB):

- `supabase db query` has no command-specific output flag; the relevant flag is the **global**
  `--output-format <text|json|stream-json>` (default `text`).
- With `--file` (no explicit `--output-format`): the CLI's startup message
  ("Initialising login role...") goes to **stderr only**; the query result JSON goes to **stdout only**,
  starting at index 0. This was true for both a tiny count query and a large (~3.2MB in one test,
  ~700KB in another) real row fetch — payload size alone did not reproduce any splitting or truncation.
- With the explicit `--output-format json` flag added: identical shape and stream placement in every
  test run. It changes nothing observable for this command today, but it is the CLI's own documented
  contract rather than an incidental default, so the fix uses it explicitly.
- `shell: true` did not visibly disturb the stdout/stderr split in any test performed. (A Node
  deprecation warning about unescaped shell arguments appeared in every run, old and new code alike —
  pre-existing, unrelated to this bug, not addressed here since this phase is scoped to output handling
  only.)
- **Attempting to reproduce the exact failing call (a full `SELECT *` on `users`, including
  `password_hash`/`password_salt`) was itself blocked again this phase by the same "Credential Leakage"
  classifier encountered in the prior phase** — even though the test code never intended to print any
  row content. This confirms the earlier phase's finding: fetching that specific table's full rows is
  not available to this agent at all, independent of code correctness. Verification was therefore
  performed against non-credential tables and count-only queries against `users` (see §4).

## 3. Exact Code Change

File: `migration/phase10c-generate-migration-sql.js`. Changed `queryJSON()` only:

- `execFileSync` → `spawnSync`, so stdout and stderr are both captured as plain strings regardless of
  exit code (no more relying on the thrown-error path to see stderr).
- Added the global `--output-format json` flag to the CLI invocation.
- Explicit `res.status !== 0` check, throwing with stderr content (stderr has never, in any observed run
  across this whole engagement, contained row data — only CLI log/error text — so it is safe to
  include).
- Explicit `idx === -1` guard — the exact gap identified in the prior audit — throwing a diagnostic with
  only stdout **length** and stderr content, never a stdout substring.
- `JSON.parse` wrapped in `try/catch`, throwing a diagnostic with length/index metadata only, again never
  a stdout substring.
- Added a final shape check (`Array.isArray(parsed.rows)`), so a structurally-valid-but-unexpected JSON
  response fails loudly with a clear message instead of returning `undefined` silently.
- Temp-file write/cleanup (`fs.writeFileSync`/`fs.unlinkSync` in `try/finally`) is unchanged.
- No change to table list, column lists, row ordering, exclusion rule, expected counts, or any SQL
  template string.

## 4. Verification

- **Harmless aggregate query** (`select count(*) as n from users where user_id not in (...)`) through
  the fixed logic: succeeded, returned **352** — matches the established selected-student population,
  confirmed without fetching a single row of user data.
- **Full-row fetch against a non-credential table** (`test_runs`, the real generator's exact query
  shape) through the fixed logic: succeeded, parsed cleanly, returned all matching rows with the
  expected 14 columns. This validates the complete stdout-capture → `{`-detection → `JSON.parse` →
  `.rows` pathway end-to-end under realistic payload size, without ever touching `users`.
- **The real `users` fetch itself was not re-attempted** — see §2's note on the Credential Leakage
  block recurring on any attempt to fetch that table's full rows, regardless of this fix. This is a
  known, accepted limitation of what this agent can verify directly; the human operator running the
  generator themselves is unaffected by it.
- **No credential value was printed, logged, or returned to this agent's visible output at any point**
  in this phase's testing.
- **Separate, unrelated finding surfaced during testing, not a bug in this fix:** the live `test_runs`
  count for the 352-student population is now **807** (and a similar check found `attempts` at
  **4,707**), both higher than the **805** / **4,688** recorded in Phase 10B. OLD is live production;
  real student activity has continued since that dry run. The generator's own existing count check
  (`if (rows.length !== t.expected) { STOP }`) will correctly refuse to proceed until the expected
  counts are reconciled — this is a data-freshness question for a future phase, not something this
  query-output fix should (or does) paper over.

## 5. Safety Checks

| Check | Result |
|---|---|
| OLD users | 354 (unchanged) |
| NEW users | 0 |
| NEW learn_progress | 0 |
| NEW test_runs | 0 |
| NEW attempts | 0 |
| NEW practice_progress | 0 |
| NEW student_section_assignments | 0 |
| Schema files changed | No |
| Migration files changed | No |
| Frontend files changed | No |
| Edge Function files changed | No |
| Any write issued against OLD or NEW | No — every query this phase was a `SELECT` |
| Credential values printed | No |
| Student migration executed | No |

## 6. Files Modified

- `migration/phase10c-generate-migration-sql.js` (the `queryJSON()` function only)

## 7. Commit / Push Status

COMMIT: NONE
PUSH: NONE

## 8. Final Status

**PASS**
