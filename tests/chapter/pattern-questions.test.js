// The graded questions of PATTERNS (STG013) show C code and exact program output, so the code must be valid C and every predicted output must be
// what the program really prints (spaces and line breaks included). Checked with the CLICK interpreter and, when installed, real gcc.
//   node --test tests/chapter/pattern-questions.test.js
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { Interp, hasGcc, gccRun, normOut } = require(path.resolve(__dirname, "..", "learn", "helpers.js"));
const fx = require(path.resolve(__dirname, "..", "fixtures", "production-content.json"));

const qs = fx.questions.filter((q) => q.stage_id === "STG013");
const optionsOf = (id) => fx.options.filter((o) => o.question_id === id).sort((a, b) => a.order - b.order).map((o) => o.option_text);
const answersOf = (q) => JSON.parse(q.answer);
const fill = (code, q) => code.replace(/\{\{(\d+)\}\}/g, (_, n) => answersOf(q)[Number(n) - 1]);
// a snippet without main() is wrapped the way the Learn activities wrap snippets; a declaration of n is added where the snippet uses one
const asProgram = (code) => /int\s+main/.test(code) ? code : "#include <stdio.h>\n\nint main() {\n" + (/\bn\b/.test(code) && !/\bint\s+n\b/.test(code) ? "int n = 5;\n" : "") + code + "\n}";
const OUTPUT_MARK = "\n\nOutput:\n";

test("there are 25 Patterns questions, 5 per chapter, with unique ids", () => {
  assert.strictEqual(qs.length, 25);
  assert.strictEqual(new Set(qs.map((q) => q.question_id)).size, 25);
  for (const cid of ["CH0124", "CH0125", "CH0126", "CH0127", "CH0128"]) assert.strictEqual(qs.filter((q) => q.chapter_id === cid).length, 5, cid);
});

test("no question shows a printf whose string contains a real line break (a lost backslash in \\n)", () => {
  for (const q of qs) assert.ok(!q.code.includes('printf("\n'), q.question_id + ' has printf("<line break>")');
});

for (const q of qs.filter((x) => x.code && x.type !== "MCQ")) {
  test(q.question_id + " (" + q.type + "): the code shown is real C" + (hasGcc ? " and gcc agrees with the interpreter" : ""), (t) => {
    // Q000551 shows the program followed by the output the student completes ("Output:" and two blanks): the program part is compiled
    // and what it prints must equal the lines that fill the blanks.
    const parts = q.code.split(OUTPUT_MARK);
    const isOutputFill = parts.length === 2;
    const program = q.type === "CODE_FILL" && !isOutputFill ? fill(q.code, q) : parts[0];
    const code = asProgram(program);
    const r = Interp.run(code, {});
    assert.ok(r.ok, q.question_id + " must run in the interpreter: " + (r.error && r.error.message));
    if (isOutputFill) assert.strictEqual(normOut(r.stdout), normOut(fill(parts[1], q)), q.question_id + ": the completed output is what the program prints");
    if (!hasGcc) { t.diagnostic("gcc not installed: comparison skipped"); return; }
    const g = gccRun(code, "", true);
    assert.ok(g.ok, q.question_id + " must compile with gcc: " + g.error);
    assert.strictEqual(normOut(r.stdout), normOut(g.stdout));
    if (q.type === "PREDICT_OUTPUT") assert.strictEqual(normOut(r.stdout), normOut(q.answer), q.question_id + ": the marked answer is what the program prints");
  });
}

test("every PREDICT_OUTPUT question has distinct choices, and exactly one of them is what the program really prints (spaces matter)", () => {
  for (const q of qs.filter((x) => x.type === "PREDICT_OUTPUT")) {
    const opts = optionsOf(q.question_id);
    assert.ok(opts.length >= 3 && new Set(opts).size === opts.length, q.question_id);
    assert.ok(opts.includes(q.answer), q.question_id + ": the answer is one of the choices");
    const real = normOut(Interp.run(asProgram(q.code), {}).stdout);
    assert.deepStrictEqual(opts.filter((o) => normOut(o) === real), [q.answer], q.question_id);
  }
});

test("the code blanks of every Patterns CODE_FILL question have one answer each, and the answers are what the source teaches", () => {
  const want = { Q000551: ["23", "456"], Q000552: ["%c"], Q000556: ["n - i"], Q000557: ["2 * i - 1"], Q000558: ["n - i"], Q000561: ["n"], Q000562: ["=="], Q000563: ["n + 1"], Q000566: ["i"], Q000567: ["i"], Q000568: ["n - 1"] };
  const fills = qs.filter((x) => x.type === "CODE_FILL");
  assert.deepStrictEqual(fills.map((q) => q.question_id).sort(), Object.keys(want).sort());
  for (const q of fills) {
    assert.deepStrictEqual(answersOf(q), want[q.question_id], q.question_id);
    assert.strictEqual((q.code.match(/\{\{\d+\}\}/g) || []).length, want[q.question_id].length, q.question_id + " blanks");
  }
});

test("the three CH0128 code blanks do not give their answer away: no other line of the shown code is already the completed line", () => {
  for (const q of qs.filter((x) => ["Q000566", "Q000567", "Q000568"].includes(x.question_id))) {
    const ans = answersOf(q)[0], lines = q.code.split("\n");
    const blankLine = lines.find((l) => l.includes("{{1}}")), done = blankLine.replace("{{1}}", ans).trim();
    assert.ok(!lines.filter((l) => l !== blankLine).some((l) => l.trim() === done), q.question_id + " shows its own answer elsewhere");
  }
});
