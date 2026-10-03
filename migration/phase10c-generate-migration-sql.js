// PHASE 10C-B -- human-run generator for the data-filled migration SQL.
//
// WHY THIS FILE EXISTS INSTEAD OF A FINISHED .sql FILE:
// Claude attempted to generate the data-filled migration SQL directly and was blocked by this
// environment's permission classifier with reason "[Credential Leakage]" -- materializing 352 real
// password_hash/password_salt values into any file, even one meant for human review and manual
// execution, is treated as a credential-leakage outcome regardless of downstream intent. That
// restriction is NOT something to route around (no smaller batches, no different tool/location/format
// were attempted). This file contains ZERO real data -- only column lists, table names, and SQL
// templates -- and is therefore safe for Claude to write. Run it yourself, outside Claude's restricted
// execution path, to produce the actual data-filled SQL.
//
// PREREQUISITES: Node.js, and the Supabase CLI logged in / linkable the same way this session used it
// (`npx supabase db query --linked --project-ref <ref> "<sql>"` must already work from this machine).
//
// USAGE:
//   node phase10c-generate-migration-sql.js
// Run it from anywhere -- it shells out to `npx supabase` itself. It writes
// `phase10c-migration-data.sql` next to this file. That output file will contain real student PII and
// credentials (password_hash, password_salt) in plaintext SQL -- treat it with the same care as a
// database backup: do not commit it, do not push it, delete it once the migration is verified complete.
//
// This script only ever READS from OLD (jnxevalckgitxuunjcvv) via SELECT. It never writes to any
// database. The INSERT statements it generates are written to a local file for YOU to review and run.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { parseStreamJsonRows } = require('./phase10c-parse-query-output');

const OLD_REF = 'jnxevalckgitxuunjcvv';
// Kept outside the tracked migration/ tree and covered by a dedicated .gitignore entry (see
// phase10c-fresh-migration-snapshot.md) so a careless `git add` can never stage real credentials.
const OUT_DIR = path.join(__dirname, '.local-migration-output');
const OUT = path.join(OUT_DIR, 'phase10c-migration-data.sql');
const EXCLUDE = "('U1A8B0A6D8810','U485B9DDDA04E')";

function queryJSON(sql) {
  // Passing SQL as a positional CLI argument is unreliable across shells (spaces inside the query get
  // split into separate "Unexpected positional arguments"). Writing it to a temp file and using
  // `--file` sidesteps shell quoting entirely -- the CLI only ever sees a single file-path argument.
  const tmp = path.join(os.tmpdir(), `phase10c-query-${process.pid}-${Date.now()}.sql`);
  fs.writeFileSync(tmp, sql);
  let res;
  try {
    // stream-json is the CLI's documented machine-readable format: one envelope per line,
    // {"type":"result","data":{"rows":[...]}}. Parsed line by line by parseStreamJsonRows, which
    // rejects any stray text, extra values, unexpected envelope types, or missing rows.
    res = spawnSync('npx', ['supabase', '--output-format', 'stream-json', 'db', 'query', '--linked', '--project-ref', OLD_REF, '--file', tmp], {
      encoding: 'utf8', maxBuffer: 1024 * 1024 * 400, shell: true,
    });
  } finally {
    fs.unlinkSync(tmp);
  }

  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  // Diagnostics never include a substring of stdout: a partially received row for a
  // credential-bearing table could contain part of a real password_hash or password_salt.
  // stderr only carries the CLI's own log/error lines (e.g. "Initialising login role...").
  if (res.status !== 0) {
    throw new Error(`supabase db query exited with status ${res.status}. stdout_length=${stdout.length}, stderr=${JSON.stringify(stderr.slice(0, 500))}`);
  }
  try {
    return parseStreamJsonRows(stdout);
  } catch (e) {
    throw new Error(`${e.message}. stdout_length=${stdout.length}, stderr_length=${stderr.length}`);
  }
}

function sqlLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function buildInsertBatches(table, columns, rows, batchSize) {
  const batches = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const values = chunk.map((r) => '(' + columns.map((c) => sqlLiteral(r[c])).join(',') + ')').join(',\n');
    batches.push(`insert into ${table} (${columns.join(',')}) values\n${values};`);
  }
  return batches;
}

// Exact approved scope and order (Phase 9 / 10A / 10B / 10C). Do not add or reorder tables.
// OLD is live production -- test_runs/attempts/learn_progress/practice_progress/student_section_assignments
// grow continuously from real student activity, so (per Phase 10C's live-reconciliation finding) NONE of
// them have a fixed "expected" row count any more. Only `users` keeps a hard expected count: it is the
// approved, deterministically-selected population identity (354 total minus the 2 protected accounts),
// not a growing activity log, so any deviation from 352 there is a real stop condition, not live drift.
const TABLES = [
  {
    name: 'users',
    cols: ['user_id','name','roll_no','department','email','phone','password_hash','password_salt',
      'joined_at','last_login','last_logout','total_xp','streak','current_stage','current_chapter','hearts',
      'tests_completed','questions_attempted','correct_answers','accuracy_percent','onboarding_completed','status',
      'stages_completed','last_completed_stage','last_learn_stage','last_learn_chapter','heart_recovery_stage_id',
      'heart_recovery_chapter_id','role','username'],
    sql: `select * from users where user_id not in ${EXCLUDE} order by user_id;`,
    expected: 352,
    batch: 50,
  },
  {
    name: 'test_runs',
    cols: ['test_run_id','user_id','stage_id','chapter_id','started_at','finished_at','status','hearts_start',
      'hearts_end','pending_xp','committed_xp','correct_count','question_count','attempt_no'],
    sql: `select * from test_runs where user_id in (select user_id from users where user_id not in ${EXCLUDE}) order by test_run_id;`,
    batch: 200,
  },
  {
    name: 'attempts',
    cols: ['attempt_id','user_id','stage_id','chapter_id','question_id','question_attempt_no','answer','correct',
      'hearts_before','hearts_after','xp_earned','response_ms','device','attempted_at','test_run_id','question_xp','xp_committed'],
    sql: `select * from attempts where user_id in (select user_id from users where user_id not in ${EXCLUDE}) order by attempt_id;`,
    batch: 200,
  },
  {
    name: 'learn_progress',
    cols: ['learn_progress_id','user_id','stage_id','chapter_id','times_completed','last_completed_at','pages_viewed','completed','updated_at'],
    sql: `select * from learn_progress where user_id in (select user_id from users where user_id not in ${EXCLUDE}) order by learn_progress_id;`,
    batch: 200,
  },
  {
    name: 'practice_progress',
    cols: ['progress_id','user_id','practice_id','stage_id','status','attempt_count','last_result','completed_at','updated_at'],
    sql: `select * from practice_progress where user_id in (select user_id from users where user_id not in ${EXCLUDE}) order by progress_id;`,
    batch: 50,
  },
  {
    name: 'student_section_assignments',
    cols: ['assignment_id','student_id','section_id','assigned_at','assigned_by','active'],
    sql: `select * from student_section_assignments where student_id not in ${EXCLUDE} order by assignment_id;`,
    batch: 200,
  },
];

// ---- extraction ----
// No single-transaction, multi-table snapshot is available through this CLI: tested directly by
// wrapping two SELECTs in one explicit begin/commit sent via --file -- the transaction itself works,
// but the tool only returns the LAST statement's result set, discarding the rest. So each table below
// is fetched as its own independent query, back-to-back, as fast as possible, and the snapshot's
// internal coherence is verified afterward (see "self-consistency check") rather than assumed.
const snapshotStartedAt = new Date().toISOString();
const captured = {};
for (const t of TABLES) {
  const rows = queryJSON(t.sql);
  console.log(t.name, ': fetched', rows.length, 'rows');
  if (t.name === 'users' && rows.length !== t.expected) {
    console.log(`STOP: selected population is ${rows.length}, expected exactly ${t.expected}. Not writing output file.`);
    process.exit(1);
  }
  captured[t.name] = rows;
}
const snapshotFinishedAt = new Date().toISOString();

// ---- self-consistency check on the CAPTURED data (not a live re-query) ----
// This is the question that actually matters for a live source: not "did OLD stay perfectly still"
// (it won't -- it's production), but "does every captured child row's parent exist in this same
// captured snapshot." A row created in the gap between two of the sequential fetches above is the one
// scenario that could violate this, and it is checked for explicitly rather than assumed absent.
const capturedUserIds = new Set(captured.users.map((r) => r.user_id));
const capturedTestRunIds = new Set(captured.test_runs.map((r) => r.test_run_id));
const orphans = { test_runs: [], attempts_user: [], attempts_test_run: [], learn_progress: [], practice_progress: [], student_section_assignments: [] };
captured.test_runs.forEach((r) => { if (!capturedUserIds.has(r.user_id)) orphans.test_runs.push(r.test_run_id); });
captured.attempts.forEach((r) => {
  if (!capturedUserIds.has(r.user_id)) orphans.attempts_user.push(r.attempt_id);
  if (!capturedTestRunIds.has(r.test_run_id)) orphans.attempts_test_run.push(r.attempt_id);
});
captured.learn_progress.forEach((r) => { if (!capturedUserIds.has(r.user_id)) orphans.learn_progress.push(r.learn_progress_id); });
captured.practice_progress.forEach((r) => { if (!capturedUserIds.has(r.user_id)) orphans.practice_progress.push(r.progress_id); });
captured.student_section_assignments.forEach((r) => { if (!capturedUserIds.has(r.student_id)) orphans.student_section_assignments.push(r.assignment_id); });

const orphanCounts = Object.fromEntries(Object.entries(orphans).map(([k, v]) => [k, v.length]));
console.log('self-consistency orphan counts (0 everywhere means the snapshot is internally coherent):', JSON.stringify(orphanCounts));

// Orphans (almost certainly rows created in the brief gap between two sequential fetches, given OLD's
// live traffic) cannot be migrated from THIS snapshot -- their captured parent row doesn't exist in it,
// so inserting them into NEW would violate its foreign keys regardless. They are excluded from the
// generated SQL rather than silently kept or silently used to fail the whole run; the exact counts
// above (never row content) are the record of that exclusion.
const attemptsOrphanIds = new Set([...orphans.attempts_user, ...orphans.attempts_test_run]);
const filtered = {
  users: captured.users,
  test_runs: captured.test_runs.filter((r) => !orphans.test_runs.includes(r.test_run_id)),
  attempts: captured.attempts.filter((r) => !attemptsOrphanIds.has(r.attempt_id)),
  learn_progress: captured.learn_progress.filter((r) => !orphans.learn_progress.includes(r.learn_progress_id)),
  practice_progress: captured.practice_progress.filter((r) => !orphans.practice_progress.includes(r.progress_id)),
  student_section_assignments: captured.student_section_assignments.filter((r) => !orphans.student_section_assignments.includes(r.assignment_id)),
};

// ---- lightweight live drift re-check (informational, not a failure condition) ----
const driftSql = `select
  (select count(*) from users where user_id not in ${EXCLUDE}) as users,
  (select count(*) from test_runs where user_id in (select user_id from users where user_id not in ${EXCLUDE})) as test_runs,
  (select count(*) from attempts where user_id in (select user_id from users where user_id not in ${EXCLUDE})) as attempts,
  (select count(*) from learn_progress where user_id in (select user_id from users where user_id not in ${EXCLUDE})) as learn_progress,
  (select count(*) from practice_progress where user_id in (select user_id from users where user_id not in ${EXCLUDE})) as practice_progress,
  (select count(*) from student_section_assignments where student_id not in ${EXCLUDE}) as student_section_assignments;`;
const liveNow = queryJSON(driftSql)[0];
const drift = {};
for (const t of TABLES) drift[t.name] = { captured: captured[t.name].length, live_now: liveNow[t.name], delta: liveNow[t.name] - captured[t.name].length };
console.log('drift since extraction (captured vs re-queried live count just now):', JSON.stringify(drift));
if (drift.users.delta !== 0) {
  console.log('STOP: the approved population itself changed during extraction (users delta != 0). Not writing output file.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let out = [];
out.push('-- PHASE 10C migration data (generated locally -- contains real student PII and credentials).');
out.push(`-- source_project: jnxevalckgitxuunjcvv`);
out.push(`-- snapshot_started_at: ${snapshotStartedAt}`);
out.push(`-- snapshot_finished_at: ${snapshotFinishedAt}`);
out.push(`-- approved_student_count: ${filtered.users.length}`);
out.push(`-- captured_counts: ${JSON.stringify(Object.fromEntries(TABLES.map((t) => [t.name, filtered[t.name].length])))}`);
out.push(`-- orphan_rows_excluded: ${JSON.stringify(orphanCounts)}`);
out.push('-- snapshot_strategy: sequential per-table extraction (no single cross-table transaction is available via');
out.push('-- this CLI -- confirmed: multi-statement --file runs do execute in one transaction, but only the last');
out.push('-- statement\'s result is returned), with an in-memory foreign-key self-consistency check applied to the');
out.push('-- captured data itself afterward. Orphaned rows (if any) are excluded above, not silently kept.');
out.push('-- Run this against NEW (eyevmykfavooeiklzebe) ONLY, after Section A of phase10c-preflight-and-validation.sql passes.');
out.push('-- Do not commit this file. Do not push this file. Delete it after the migration is verified (Section C).');
out.push('');

let total = 0;
for (const t of TABLES) {
  const rows = filtered[t.name];
  out.push(`-- ${t.name} (${rows.length} rows)`);
  out.push('begin;');
  for (const b of buildInsertBatches(t.name, t.cols, rows, t.batch)) out.push(b);
  out.push('commit;');
  out.push('');
  total += rows.length;
}

fs.writeFileSync(OUT, out.join('\n') + '\n');
console.log('Wrote', OUT, '--', total, 'total rows across', TABLES.length, 'tables.');
console.log('Next: review this file, then run Section A of phase10c-preflight-and-validation.sql against both');
console.log('projects, then run this generated file against NEW only, then run Section C.');
