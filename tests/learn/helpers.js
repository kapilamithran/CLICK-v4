// Shared helpers for the Learn activity tests (Node, no browser needed).
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");
const crypto = require("crypto");

const LEARN_DIR = path.resolve(__dirname, "..", "..", "assets", "learn");
const Interp = require(path.join(LEARN_DIR, "c-interp.js"));

// Load the activity layer into this Node process (kinds register their schemas; nothing touches a DOM).
function loadLayer(opts) {
  opts = opts || {};
  globalThis.ClickInterp = Interp;
  for (const f of ["engine.js", "kinds-visual.js", "kinds-code.js"]) require(path.join(LEARN_DIR, f));
  const CL = globalThis.ClickLearn;
  if (opts.defs !== false) {
    const dir = path.join(LEARN_DIR, "defs");
    // CHAPTERS=CH0032,CH0033 limits loading to those chapter files (handy while authoring one chapter)
    const only = process.env.CHAPTERS ? process.env.CHAPTERS.toLowerCase().split(",").map((s) => s.trim()) : null;
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) if (/^ch\d{4}\.js$/.test(f) && (!only || only.includes(f.slice(0, 6)))) require(path.join(dir, f));
  }
  return CL;
}

const hasGcc = (() => { try { return cp.spawnSync("gcc", ["--version"], { timeout: 15000 }).status === 0; } catch (e) { return false; } })();
const gccCache = new Map();
// Compile a snippet or program with real gcc and run it with the given stdin. Returns { ok, stdout, error }.
function gccRun(code, input, raw) {
  // raw = compile the source exactly as written (a "complete program" attempt), not wrapped like a snippet
  const key = crypto.createHash("sha1").update((raw ? "raw:" : "") + code + "\u0000" + (input || "")).digest("hex");
  if (gccCache.has(key)) return gccCache.get(key);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "click-gcc-"));
  const src = path.join(dir, "t.c"), exe = path.join(dir, "t.exe");
  fs.writeFileSync(src, raw ? code : Interp.asProgram(code));
  let res;
  const c = cp.spawnSync("gcc", ["-std=gnu17", "-w", "-o", exe, src], { encoding: "utf8", timeout: 60000 });
  if (c.status !== 0) res = { ok: false, stdout: "", error: (c.stderr || "").split("\n").find((l) => /error/.test(l)) || "compile failed" };
  else {
    const r = cp.spawnSync(exe, [], { input: input || "", encoding: "utf8", timeout: 5000 });
    res = { ok: r.status === 0 || r.status === null ? r.error == null : true, stdout: String(r.stdout || "").replace(/\r/g, ""), error: r.error ? String(r.error.message) : "", timedOut: !!(r.error && /ETIMEDOUT/.test(r.error.message)) };
  }
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* temp cleanup is best effort */ }
  gccCache.set(key, res);
  return res;
}

const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, "learn-content-snapshot.json"), "utf8"));
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "audit-recommendations.json"), "utf8"));

const normOut = (s) => String(s == null ? "" : s).replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

module.exports = { Interp, loadLayer, hasGcc, gccRun, snapshot, audit, normOut, LEARN_DIR };
