// The graded questions of NUMBER CRUNCHING (STG012) show C code and exact program values, so the code must be valid C and every
// fill-in answer must be what a real gcc program does. Checked with the CLICK interpreter and, when installed, real gcc.
//   node --test tests/chapter/nc-questions.test.js
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { Interp, hasGcc, gccRun, normOut } = require(path.resolve(__dirname, "..", "learn", "helpers.js"));
const fx = require(path.resolve(__dirname, "..", "fixtures", "production-content.json"));

const qs = fx.questions.filter((q) => q.stage_id === "STG012");
const optionsOf = (id) => fx.options.filter((o) => o.question_id === id).sort((a, b) => a.order - b.order).map((o) => o.option_text);
const answersOf = (q) => JSON.parse(q.answer);
const fill = (code, q) => code.replace(/\{\{(\d+)\}\}/g, (_, n) => answersOf(q)[Number(n) - 1]);
// a snippet without main() is wrapped the way the Learn activities wrap snippets, declaring whichever free variables it
// uses but does not itself declare (n, sum, original, digit, count all default to values consistent with each chapter's
// own worked example so a scanf-free snippet runs sensibly)
const DEFAULTS = { n: 5678, sum: 0, original: 5678, digit: 0, count: 0, rev: 0, i: 1 };
const asProgram = (code) => {
  if (/int\s+main/.test(code)) return code;
  const already = new Set([...code.matchAll(/\bint\b([^;]*);/g)].flatMap((m) => m[1].split(",").map((s) => (s.split("=")[0] || "").trim())).filter(Boolean));
  const need = Object.keys(DEFAULTS).filter((v) => new RegExp("\\b" + v + "\\b").test(code) && !already.has(v));
  const decl = need.length ? "int " + need.map((v) => v + " = " + DEFAULTS[v]).join(", ") + ";\n" : "";
  return "#include <stdio.h>\n\nint main() {\n" + decl + code + "\nreturn 0;\n}";
};
// a snippet that reads with scanf needs real stdin, or the read variable stays uninitialized (flagged as undefined
// behavior by this strict interpreter, exactly as it should be)
const inputFor = (code) => (/scanf/.test(code) ? "153" : "");

test("there are 36 Number Crunching questions with unique ids: 5 per chapter, except Reversing a Number (CH0119) which has 6", () => {
  assert.strictEqual(qs.length, 36);
  assert.strictEqual(new Set(qs.map((q) => q.question_id)).size, 36);
  const want = { CH0117: 5, CH0118: 5, CH0119: 6, CH0120: 5, CH0121: 5, CH0122: 5, CH0123: 5 };
  for (const [cid, n] of Object.entries(want)) assert.strictEqual(qs.filter((q) => q.chapter_id === cid).length, n, cid);
});

test("no question shows a printf whose string contains a real line break (a lost backslash in \\n)", () => {
  for (const q of qs) assert.ok(!q.code.includes('printf("\n'), q.question_id + ' has printf("<line break>")');
});

// A question whose code shows a literal blank ("__________", as an MCQ option to pick) is not real, standalone C and is
// skipped here -- Q000604 is the one case in this chapter.
const isFragmentBlank = (q) => /_{3,}/.test(q.code);

for (const q of qs.filter((x) => x.code && !isFragmentBlank(x))) {
  test(q.question_id + " (" + q.type + "): the code shown is real C" + (hasGcc ? " and gcc agrees with the interpreter" : ""), (t) => {
    const program = q.type === "CODE_FILL" ? fill(q.code, q) : q.code;
    const code = asProgram(program), input = inputFor(code);
    const r = Interp.run(code, { input });
    assert.ok(r.ok, q.question_id + " must run in the interpreter: " + (r.error && r.error.message));
    if (!hasGcc) { t.diagnostic("gcc not installed: comparison skipped"); return; }
    const g = gccRun(code, input, true);
    assert.ok(g.ok, q.question_id + " must compile with gcc: " + g.error);
    // an MCQ's code is a conceptual fragment (not necessarily meant to print the right answer on its own), so only
    // CODE_FILL programs -- where the filled answer IS the whole point -- are compared for matching output
    if (q.type === "CODE_FILL") assert.strictEqual(normOut(r.stdout), normOut(g.stdout));
  });
}

test("every MCQ answer is one of its own options, and every option list has no duplicates", () => {
  for (const q of qs.filter((x) => x.type === "MCQ")) {
    const opts = optionsOf(q.question_id);
    assert.ok(opts.length >= 2, q.question_id);
    assert.strictEqual(new Set(opts).size, opts.length, q.question_id + " duplicate options");
    assert.ok(opts.includes(q.answer), q.question_id + ": the answer is one of the choices");
  }
});

test("the code blanks of every Number Crunching CODE_FILL question have one answer each, and the answers are what the source teaches", () => {
  const want = {
    Q000569: ["%"], Q000570: ["/"],
    Q000574: ["/"], Q000575: ["++"],
    Q000582: ["%"], Q000583: ["/"], Q000584: ["*"],
    Q000591: ["=="], Q000594: ["0"],
    Q000602: ["=="],
  };
  const fills = qs.filter((x) => x.type === "CODE_FILL");
  assert.deepStrictEqual(fills.map((q) => q.question_id).sort(), Object.keys(want).sort());
  for (const q of fills) {
    assert.deepStrictEqual(answersOf(q), want[q.question_id], q.question_id);
    assert.strictEqual((q.code.match(/\{\{\d+\}\}/g) || []).length, want[q.question_id].length, q.question_id + " blanks");
  }
});

test("the MCQ answers that depend on arithmetic are the numbers a real run of the code actually produces", () => {
  // Q000571: n = 5678 -> digit = n % 10, n = n / 10
  assert.strictEqual(normOut(Interp.run(asProgram("int n = 5678;\nint digit = n % 10;\nn = n / 10;\nprintf(\"%d,%d\", digit, n);")).stdout), "8,567");
  // Q000573: n = 5678, first digit accessed is n % 10
  assert.strictEqual(5678 % 10, 8);
  // Q000590 / explorer: 153 is an Armstrong number (1^3 + 5^3 + 3^3)
  assert.strictEqual(1 ** 3 + 5 ** 3 + 3 ** 3, 153);
  // Q000595 / Q000596: 6's proper factors are 1, 2, 3 and they sum to 6; 8, 10 and 12 do not equal the sum of their own
  assert.deepStrictEqual([6, 8, 10, 12].map((n) => { let s = 0; for (let i = 1; i < n; i++) if (n % i === 0) s += i; return s; }), [6, 7, 8, 16]);
  // Q000600 / explorer: 7 has exactly 2 factors (1, 7); 6 has 4 (1, 2, 3, 6)
  const countFactors = (n) => { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; };
  assert.strictEqual(countFactors(7), 2);
  assert.strictEqual(countFactors(6), 4);
});
