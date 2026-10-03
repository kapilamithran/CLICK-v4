// Runs the backend scenarios (tests/backend/unified.test.ts) under Deno from `node --test`. They boot the REAL click-backend edge function on
// an in-memory database; see tests/backend/harness.ts. Skipped, with a clear message, when Deno is not installed.
//   node --test tests/backend/run.test.js          (set DENO=<path to deno> if it is not on PATH; `npm i deno` gives a local one)
const test = require("node:test");
const assert = require("node:assert");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
function findDeno() {
  const local = path.join(ROOT, "node_modules", ".bin", process.platform === "win32" ? "deno.cmd" : "deno");
  for (const c of [process.env.DENO, "deno", fs.existsSync(local) ? local : null].filter(Boolean)) {
    const r = cp.spawnSync(c, ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
    if (r.status === 0) return c;
  }
  return null;
}

test("backend: unified chapter run (XP once, hearts, unlocking, legacy students, question cap)", { timeout: 300000 }, (t) => {
  const deno = findDeno();
  if (!deno) return t.skip("Deno is not installed (npm i deno, or set DENO=<path>)");
  const r = cp.spawnSync(deno, ["test", "--allow-read", "--allow-env", "--import-map=tests/backend/import_map.json", "tests/backend/unified.test.ts"], { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
  const out = String(r.stdout || "") + String(r.stderr || "");
  assert.strictEqual(r.status, 0, out.replace(/\x1b\[[0-9;]*m/g, "").slice(-3000));
  assert.match(out.replace(/\x1b\[[0-9;]*m/g, ""), /ok \| \d+ passed \| 0 failed/);
});

test("backend: Practice S0-S9 labels come from the Practice S-number (practice_id), not the curriculum stage_no", { timeout: 300000 }, (t) => {
  const deno = findDeno();
  if (!deno) return t.skip("Deno is not installed (npm i deno, or set DENO=<path>)");
  const r = cp.spawnSync(deno, ["test", "--allow-read", "--allow-env", "--import-map=tests/backend/import_map.json", "tests/backend/practice-labels.test.ts"], { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
  const out = String(r.stdout || "") + String(r.stderr || "");
  assert.strictEqual(r.status, 0, out.replace(/\x1b\[[0-9;]*m/g, "").slice(-3000));
  assert.match(out.replace(/\x1b\[[0-9;]*m/g, ""), /ok \| \d+ passed \| 0 failed/);
});
