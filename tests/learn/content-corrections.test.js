// Regression tests for supabase/migrations/20260926150000_learn_content_corrections.sql.
//
// No database is used. The migration's replacements are parsed out of the SQL file and applied to
// tests/learn/content-baseline.json (the Learn text as it was before the migration), then the CORRECTED text is checked:
// every changed C example is compiled and run with gcc and compared with the output the page displays, and each of the
// eight reported problems has its own assertions. The activity definitions that overlap those pages are checked against
// the corrected text too. Run: node --test "tests/learn/*.test.js"
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const crypto = require("node:crypto");
const { loadLayer, hasGcc, snapshot, Interp } = require("./helpers.js");

const MIGRATION = path.join(__dirname, "..", "..", "supabase", "migrations", "20260926150000_learn_content_corrections.sql");
const sqlText = fs.readFileSync(MIGRATION, "utf8").replace(/\r/g, "");
const baseline = require("./content-baseline.json").chapters;
const SEP = "//.//";
const md5 = (s) => crypto.createHash("md5").update(s).digest("hex");
const CL = loadLayer();

// ---------------------------------------------------------------- migration -> corrected pages
const fixes = [...sqlText.matchAll(/\('(L_CH\d{4})',\s*(\d+),\s*\$o\$([\s\S]*?)\$o\$,\s*\$n\$([\s\S]*?)\$n\$\)/g)]
  .map((m) => ({ chapter: m[1].slice(2), page: +m[2], old: m[3], neu: m[4] }));
const fixed = {};
for (const [id, c] of Object.entries(baseline)) {
  let text = c.pages.join(SEP);
  for (const f of fixes.filter((x) => x.chapter === id)) text = text.replace(f.old, () => f.neu); // uniqueness is asserted in the first test
  fixed[id] = text.split(SEP);
}
const page = (ch, p) => fixed[ch][p - 1];
const cBlocks = (text) => [...text.matchAll(/```c\n([\s\S]*?)```/g)].map((m) => m[1]);
const shownOutput = (text) => { const m = text.match(/\*\*Output\*\*\n```\n([\s\S]*?)\n```/); return m ? m[1] : null; };
const lines = (s) => s.replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).filter((l, i, a) => !(i === a.length - 1 && l === ""));

let tmpN = 0;
function compileRun(code, { wrap = true } = {}) {
  const src = wrap && !/\bmain\s*\(/.test(code) ? "#include <stdio.h>\n\nint main() {\n" + code + "\nreturn 0;\n}\n" : code;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "click-content-"));
  const f = path.join(dir, "t" + ++tmpN + ".c"), exe = path.join(dir, "t.exe");
  fs.writeFileSync(f, src);
  const c = cp.spawnSync("gcc", ["-std=gnu17", "-Wall", "-Wextra", "-o", exe, f], { encoding: "utf8", timeout: 60000 });
  let out = "";
  if (c.status === 0) out = String(cp.spawnSync(exe, [], { encoding: "utf8", timeout: 5000 }).stdout || "").replace(/\r/g, "");
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
  return { ok: c.status === 0, clean: c.status === 0 && !c.stderr.trim(), warnings: c.stderr, out };
}
const gcc = (t) => { if (!hasGcc) t.skip("gcc is not installed"); return hasGcc; };

// ---------------------------------------------------------------- the migration itself
test("migration: baseline matches its recorded hash and every replacement matches exactly one place", () => {
  assert.equal(fixes.length, 17, "expected 17 replacements");
  for (const [id, c] of Object.entries(baseline)) {
    assert.equal(md5(c.pages.join(SEP)), c.md5, id + " baseline changed");
    assert.ok(sqlText.includes(id === "" ? "" : `L_${id}  ${c.md5}`), id + " md5 not recorded in the migration header");
  }
  for (const f of fixes) {
    const whole = baseline[f.chapter].pages.join(SEP);
    assert.equal(whole.split(f.old).length - 1, 1, `${f.chapter} p${f.page}: old text must appear exactly once (checked on the text as the migration sees it)`);
    assert.ok(baseline[f.chapter].pages[f.page - 1].includes(f.old) || fixes.some((g) => g !== f && g.chapter === f.chapter && g.page === f.page), `${f.chapter}: old text not on page ${f.page}`);
  }
});
test("migration: data only (no DDL, no other tables) and touches only learn_content", () => {
  const code = sqlText.replace(/--.*$/gm, "").replace(/\$o\$[\s\S]*?\$o\$/g, "").replace(/\$n\$[\s\S]*?\$n\$/g, "");
  assert.ok(!/\b(create|alter|drop|truncate|grant|revoke)\b/i.test(code), "must not contain DDL");
  // table references are only "update <table>" and "from <table>" ("into hits" is a PL/pgSQL variable, not a table)
  assert.deepEqual([...new Set([...code.matchAll(/\b(?:update|from)\s+([a-z_]+)/gi)].map((m) => m[1].toLowerCase()))].sort(), ["learn_content"]);
  assert.ok(!/\b(questions|options|users|learn_progress|attempts|test_runs)\b/i.test(code), "must not touch questions, users or progress");
});
test("corrected text keeps the page count and every page heading (so the activities still mount)", () => {
  for (const [id, c] of Object.entries(baseline)) {
    assert.equal(fixed[id].length, c.pages.length, id + " page count");
    fixed[id].forEach((p, i) => {
      assert.equal(p.split("\n")[0], c.pages[i].split("\n")[0], `${id} p${i + 1} heading`);
      assert.equal(p.split("\n")[0].trim(), snapshot.chapters[id].headings[i].trim(), `${id} p${i + 1} vs the live-content snapshot`);
    });
  }
});

// ---------------------------------------------------------------- CH0037 float & double
test("CH0037 p4: the displayed float output is what gcc prints, and the page explains the difference", (t) => {
  const p4 = page("CH0037", 4);
  assert.equal(shownOutput(p4), "Price: 99.989998");
  assert.ok(!p4.includes("99.990000"), "the incorrect output must be gone");
  assert.match(p4, /stores decimal values only approximately/);
  if (!gcc(t)) return;
  const code = cBlocks(p4).find((b) => b.includes("float price = 99.99"));
  const r = compileRun(code, { wrap: false });
  assert.ok(r.ok, r.warnings);
  assert.equal(r.out.trim(), "Price: 99.989998");
  const two = compileRun('float price = 99.99;\nprintf("Price: %.2f", price);');
  assert.equal(two.out.trim(), "Price: 99.99", "the %.2f line on the page must still be true");
});
test("CH0037 p3-p5: one consistent printf/scanf specifier rule, no contradiction", (t) => {
  const p3 = page("CH0037", 3), all = [3, 4, 5].map((n) => page("CH0037", n)).join("\n");
  assert.ok(!/a double is also displayed using %f\./.test(p3), "the old one-sided rule must be gone");
  assert.match(p3, /a double can be displayed using %lf/);
  assert.match(p3, /%f also works for a double and prints exactly the same result/);
  assert.match(p3, /double\s+%lf \(or %f\)\s+%lf/, "second table: printf accepts both, scanf needs %lf");
  assert.match(p3, /printf\(\)\s+%f\s+%lf/, "first table row unchanged");
  assert.match(all, /printf\("%lf", pi\)/, "p4/p5 examples use %lf for a double, as the chapter test does");
  assert.ok(!/only %f/i.test(all));
  if (!gcc(t)) return;
  const a = compileRun('double pi = 3.1415926535;\nprintf("%f\\n", pi);\nprintf("%lf\\n", pi);\nprintf("%.4f\\n", pi);');
  assert.ok(a.clean, "%lf in printf must compile without warnings: " + a.warnings);
  assert.deepEqual(lines(a.out), ["3.141593", "3.141593", "3.1416"], "%f and %lf print the same, as the page says");
  assert.match(p3, /Output: `3\.141593`/); assert.match(p3, /Output: `3\.1416`/);
});

// ---------------------------------------------------------------- CH0061 nested loops
test("CH0061 p2: the code's output and the output shown are the same two rows", (t) => {
  const p2 = page("CH0061", 2), code = cBlocks(p2)[0];
  assert.match(code, /printf\("\\n"\);/, "a newline after the inner loop");
  assert.deepEqual(lines(shownOutput(p2)), ["11 12 13", "21 22 23"]);
  if (!gcc(t)) return;
  const r = compileRun(code);
  assert.ok(r.clean, r.warnings);
  assert.deepEqual(lines(r.out), lines(shownOutput(p2)));
});

// ---------------------------------------------------------------- CH0059 break
test("CH0059 p4: the code prints Found! for box 3 and stops; the output and the story agree", (t) => {
  const p4 = page("CH0059", 4), code = cBlocks(p4)[0];
  assert.match(p4, /3 → Found!/);
  assert.match(code, /Box %d: Found!/);
  assert.ok(code.indexOf("Found!") < code.indexOf("break;"), "announce, then break");
  assert.deepEqual(lines(shownOutput(p4)), ["Box 1: Not found", "Box 2: Not found", "Box 3: Found!"]);
  if (!gcc(t)) return;
  const r = compileRun(code);
  assert.ok(r.clean, r.warnings);
  assert.deepEqual(lines(r.out), lines(shownOutput(p4)));
  assert.equal(lines(r.out).filter((l) => /Found!/.test(l)).length, 1);
});

// ---------------------------------------------------------------- CH0042 assignment
test("CH0042 p4: every '// Output:' comment is the value the line really prints", (t) => {
  const p4 = page("CH0042", 4), code = cBlocks(p4).find((b) => b.includes("a &= b"));
  assert.match(p4, /Each line below starts again with a = 60 and b = 13\./);
  assert.ok(!/\(a=60\)/.test(p4), "the old scattered '(a=60)' hints are gone");
  const claimed = [...code.matchAll(/\/\/ Output: (\d+)/g)].map((m) => m[1]);
  assert.deepEqual(claimed, ["12", "61", "49", "240", "15"]);
  assert.equal((code.match(/a = 60;/g) || []).length, 5, "each line sets a = 60 first");
  if (!gcc(t)) return;
  const r = compileRun(code);
  assert.ok(r.clean, r.warnings);
  assert.deepEqual(lines(r.out), claimed);
});

// ---------------------------------------------------------------- CH0055 nested if-else
test("CH0055: every example declares its variables, compiles cleanly and shows the else branches", (t) => {
  const cases = [
    { p: 1, tweak: [["int age = 25;", "int age = 10;", "Not eligible: below 18"], ["int age = 25;", "int age = 70;", "Not eligible: above 60"], ["int age = 25;", "int age = 25;", "Eligible"]] },
    { p: 3, tweak: [["int password = 1;", "int password = 0;", "Wrong password"], ["int username = 1;", "int username = 0;", "Wrong username"], ["int username = 1;", "int username = 1;", "Login successful"]] },
    { p: 4, tweak: [["int id = 1;", "int id = 0;", "Entry denied"], ["int student = 1;", "int student = 0;", "Entry denied"], ["int id = 1;", "int id = 1;", "Entry allowed"]] },
  ];
  for (const c of cases) {
    const p = page("CH0055", c.p), code = cBlocks(p)[0];
    assert.ok((code.match(/\belse\b/g) || []).length >= 2, `p${c.p}: an inner and an outer else`);
    assert.match(code, /^int \w+ = \d+;/m, `p${c.p}: variables are declared and initialised`);
    if (!hasGcc) continue;
    const base = compileRun(code);
    assert.ok(base.clean, `p${c.p}: ` + base.warnings);
    for (const [from, to, expected] of c.tweak) {
      assert.ok(code.includes(from), `p${c.p}: expected '${from}' in the example`);
      assert.equal(compileRun(code.replace(from, to)).out.trim(), expected, `p${c.p} with ${to}`);
    }
  }
  if (!hasGcc) return t.skip("gcc is not installed");
  assert.ok(compileRun(cBlocks(page("CH0055", 2))[0]).clean, "p2 example (unchanged) still compiles");
});

// ---------------------------------------------------------------- CH0031 Edit / Compile / Link / Run
test("CH0031 p2: Edit, Compile, Link, Run are taught, in order, with the test's own vocabulary", () => {
  const p2 = page("CH0031", 2);
  assert.match(p2, /hello\.c → Edit → Compile → Link → Run → Output/);
  assert.match(p2, /EDIT → COMPILE → LINK → RUN/);
  const at = ["1. **Edit** (editing)", "2. **Compile** (compilation)", "3. **Link** (linking)", "4. **Run** (execution)"].map((s) => p2.indexOf(s));
  assert.ok(at.every((i) => i >= 0), "all four numbered steps with the test's noun forms: " + at);
  assert.deepEqual(at, [...at].sort((a, b) => a - b), "in order");
  assert.ok(p2.indexOf("**From code to output: 4 steps**") < p2.indexOf("**Easy Analogy**"), "before the analogy, not replacing it");
  assert.match(p2, /Compiler = Code Translator/, "the existing compiler lesson is kept");
});
test("CH0031: the interactive pipeline uses the same four stage names as the page text", () => {
  const stages = CL.defs.get("CH0031.p2.build-pipeline").stages.map((s) => s.label);
  assert.deepEqual(stages, ["Edit", "Compile", "Link", "Run"]);
  for (const s of stages) assert.ok(page("CH0031", 2).includes(`**${s}**`), s + " is named on the page");
});
test("CH0031 p2: the four steps really work with the compiler tools (compile, then link, then run)", (t) => {
  if (!gcc(t)) return;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "click-pipeline-"));
  const hello = '#include <stdio.h>\n\nint main() {\n   printf("Hello World!");\n   return 0;\n}\n';
  fs.writeFileSync(path.join(dir, "hello.c"), hello);
  const c = cp.spawnSync("gcc", ["-c", "hello.c", "-o", "hello.o"], { cwd: dir, encoding: "utf8" });
  assert.equal(c.status, 0, c.stderr); assert.ok(fs.existsSync(path.join(dir, "hello.o")), "compile makes object code");
  const l = cp.spawnSync("gcc", ["hello.o", "-o", "hello.exe"], { cwd: dir, encoding: "utf8" });
  assert.equal(l.status, 0, l.stderr);
  assert.equal(cp.spawnSync(path.join(dir, "hello.exe"), [], { encoding: "utf8" }).stdout, "Hello World!");
  fs.writeFileSync(path.join(dir, "bad.c"), hello.replace('!");', '!")'));
  assert.notEqual(cp.spawnSync("gcc", ["-c", "bad.c"], { cwd: dir }).status, 0, "a missing ; is a compile-stage error");
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* best effort */ }
});

// ---------------------------------------------------------------- CH0035 %d / %f / %c
test("CH0035: %d, %f, %c and %.1f are introduced before the chapter test, and the examples are right", (t) => {
  const p4 = page("CH0035", 4), p5 = page("CH0035", 5);
  for (const spec of ["%d", "%f", "%c", "%.1f"]) assert.ok(p4.includes(spec), spec + " on p4");
  assert.deepEqual(lines(shownOutput(p4)), ["18", "95.500000", "A"], "the output block shows one result per line");
  assert.match(p4, /%\.1f: `printf\("%\.1f", mark\);` → `95\.5`/);
  assert.match(p5, /%d int · %f float · %c char/);
  assert.ok(p4.indexOf("**Showing them with printf()**") < p4.indexOf("**Memory Trick**"), "placed before the memory trick");
  if (!gcc(t)) return;
  const block = cBlocks(p4).find((b) => b.includes("%c"));
  const r = compileRun(block);
  assert.ok(r.clean, r.warnings);
  assert.deepEqual(lines(r.out), lines(shownOutput(p4)), "what gcc prints is exactly the output block on the page");
  assert.equal(compileRun('float mark = 95.5;\nprintf("%.1f", mark);').out, "95.5");
});

// ---------------------------------------------------------------- activities stay in step with the corrected text
test("activities: CH0037 specifier table matches the corrected p3 rule", () => {
  const d = CL.defs.get("CH0037.p3.specifier-table"), by = Object.fromEntries(d.items.map((i) => [i.text, i.bucket]));
  assert.deepEqual(by, { "float with printf()": "f", "float with scanf()": "f", "double with printf()": "lf", "double with scanf()": "lf" });
  assert.ok(!/is for scanf\(\)/.test(JSON.stringify(d)), "no leftover claim that %lf is only for scanf");
});
test("activities: CH0061 trace is the same program as the corrected page", () => {
  const norm = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
  assert.equal(norm(CL.defs.get("CH0061.p2.step-nested").code), norm(cBlocks(page("CH0061", 2))[0]));
  assert.ok(!/adds one line/.test(CL.defs.get("CH0061.p2.step-nested").intro || ""), "the stale 'this trace adds a line' note is gone");
});
test("activities: CH0059 red-ball lab agrees with the page (found at box 3, then the loop stops)", () => {
  const d = CL.defs.get("CH0059.p4.red-ball"), code = CL.fillTemplate(d.code, { ball: "3", stop: "break;" });
  const r = Interp.run(code);
  assert.ok(r.ok, r.error && r.error.message);
  assert.match(r.stdout, /Found the red ball!/);
  assert.match(r.stdout, /Boxes checked: 3$/);
  assert.match(page("CH0059", 4), /3 → Found!/);
});
test("activities: CH0042 bitwise predict uses the same results the corrected page prints", () => {
  const d = CL.defs.get("CH0042.p4.predict-bitwise");
  const claimed = [...cBlocks(page("CH0042", 4)).find((b) => b.includes("a &= b")).matchAll(/\/\/ Output: (\d+)/g)].map((m) => m[1]);
  assert.equal(d.expected, claimed.slice(0, 3).join("\n"));
});
test("activities: CH0035 printing cards cover %d, %f, %c and %.1f exactly as the page shows", () => {
  const d = CL.defs.get("CH0035.p4.print-each");
  assert.deepEqual(d.cards.map((c) => c.label), ["int uses %d", "float uses %f", "char uses %c", "one decimal: %.1f"]);
  assert.ok(!/next stage/.test(d.intro), "no leftover 'you will meet these in the next stage'");
  assert.match(d.cards[1].body, /25\.500000/); assert.match(d.cards[3].body, /`95\.5`/);
});
test("activities: every activity on the corrected pages still has a matching page heading", () => {
  for (const d of CL.defs.values()) if (fixed[d.chapter]) assert.equal(d.heading.trim(), fixed[d.chapter][d.page - 1].split("\n")[0].trim(), d.id);
});
