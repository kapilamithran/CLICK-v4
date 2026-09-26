// Unit tests for the activity-layer engine (no browser): validation, typed-code normalisation, the
// "uses" construct check, the input-buffer simulator and the loader manifest. Run: node --test "tests/learn/*.test.js"
const test = require("node:test");
const assert = require("node:assert/strict");
const cp = require("node:child_process");
const path = require("node:path");
const { loadLayer, LEARN_DIR, snapshot } = require("./helpers.js");

const CL = loadLayer({ defs: false });
const base = { stage: "STG001", chapter: "CH0035", page: 1, heading: "Let's Recap!" };

test("validate: a well-formed mcq passes and every required rule is enforced", () => {
  const ok = Object.assign({ id: "CH0035.p1.ok", kind: "mcq", title: "T", question: "Q?", choices: [{ text: "a", correct: true }, { text: "b" }] }, base);
  assert.deepEqual(CL.validate(ok), []);
  assert.ok(CL.validate(Object.assign({}, ok, { choices: [{ text: "a" }, { text: "b" }] })).length, "needs exactly one correct choice");
  assert.ok(CL.validate(Object.assign({}, ok, { choices: [{ text: "a", correct: true }] })).length, "needs 2+ choices");
  assert.ok(CL.validate(Object.assign({}, ok, { id: "bad id" })).length, "id format is enforced");
  assert.ok(CL.validate(Object.assign({}, ok, { id: "CH0036.p1.ok" })).length, "id must start with chapter.pPage.");
  assert.ok(CL.validate(Object.assign({}, ok, { kind: "nope" })).length, "unknown kind is rejected");
});

test("validate: fill needs one answer set per ___ and reveal notes must exist in the code", () => {
  const fill = Object.assign({ id: "CH0035.p1.f", kind: "fill", title: "T", code: "int a = ___;", blanks: [{ answers: ["1"] }] }, base);
  assert.deepEqual(CL.validate(fill), []);
  assert.ok(CL.validate(Object.assign({}, fill, { blanks: [] })).length);
  const rev = Object.assign({ id: "CH0035.p1.r", kind: "reveal", title: "T", code: "int a;", notes: [{ text: "int", note: "n" }] }, base);
  assert.deepEqual(CL.validate(rev), []);
  assert.ok(CL.validate(Object.assign({}, rev, { notes: [{ text: "float", note: "n" }] })).length);
});

test("define: a bad definition is skipped, never thrown, and reported", () => {
  const before = CL.invalid.length;
  CL.define([{ id: "CH0035.p1.broken", kind: "mcq", title: "T", question: "Q", choices: [], stage: "STG001", chapter: "CH0035", page: 1, heading: "x" }]);
  assert.equal(CL.invalid.length, before + 1);
  assert.equal(CL.defs.has("CH0035.p1.broken"), false);
});

test("codeNorm: typed C lines are accepted with any reasonable spacing", () => {
  const n = CL.ui.codeNorm;
  assert.equal(n("int score=42;"), n("int score = 42;"));
  assert.equal(n("  float   speed = 3.5 ;"), n("float speed=3.5;"));
  assert.equal(n("printf( \"%d\" , x );"), n("printf(\"%d\",x);"));
  assert.notEqual(n("int score = 42;"), n("int score = 43;"));
});

test("norm/normOut: whitespace tolerant, case sensitive (C is), output compared line by line", () => {
  assert.equal(CL.ui.norm("  Hello   World "), CL.ui.norm("Hello World"));
  assert.notEqual(CL.ui.norm("Hello"), CL.ui.norm("hello"));
  assert.equal(CL.ui.normOut("1\n2\n"), CL.ui.normOut("1\n2"));
  assert.notEqual(CL.ui.normOut("1\n2"), CL.ui.normOut("1 2"));
});

test("challenge 'uses': keywords only count outside comments and strings", () => {
  globalThis.ClickInterp = require("../../assets/learn/c-interp.js");
  require(path.join(LEARN_DIR, "kinds-code.js"));
  const d = { uses: [{ re: "\\bfor\\s*\\(", ask: "use a for loop" }] };
  assert.equal(CL.missingUses(d, "for (int i = 0; i < 3; i++) {}").length, 0);
  assert.equal(CL.missingUses(d, '// for (;;)\nprintf("for (i)");').length, 1);
  assert.equal(CL.missingUses(d, "/* for ( */ int x;").length, 1);
  assert.equal(CL.missingUses({ uses: [{ re: "\\bbreak\\s*;", ask: "x" }] }, 'char c = \'"\'; break;').length, 0);
});

test("input-buffer simulator: %c takes the leftover newline, ' %c' skips it, fgets keeps the newline", () => {
  require(path.join(LEARN_DIR, "kinds-visual.js"));
  const sim = CL.simulateBuffer;
  const calls = [{ fmt: "%d", var: "age" }, { fmt: "%c", var: "grade", fixFmt: " %c" }];
  const bug = sim(calls, "18\nA\n", false);
  assert.equal(bug[0].value, "18");
  assert.equal(bug[1].value, "\n", "the famous newline problem");
  const fixed = sim(calls, "18\nA\n", true);
  assert.equal(fixed[1].value, "A");
  const line = sim([{ fmt: "fgets", var: "name", size: 50 }], "Arun Kumar\n", false);
  assert.equal(line[0].value, "Arun Kumar\n");
  assert.equal(sim([{ fmt: "%d", var: "n" }], "x\n", false)[0].ok, false, "a non-number reads nothing");
});

test("every chapter that has activities exists in the live-content snapshot", () => {
  const all = loadLayer();
  for (const d of all.defs.values()) assert.ok(snapshot.chapters[d.chapter], d.id + ": chapter is not in the snapshot");
});

test("loader.js MANIFEST is up to date with defs/ (run: node assets/learn/build-manifest.js)", () => {
  const r = cp.spawnSync(process.execPath, [path.join(LEARN_DIR, "build-manifest.js"), "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr || r.stdout);
});
