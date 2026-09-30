// Curriculum STRUCTURE tests: Number Crunching (Stage 6, 7 chapters) and Patterns (Stage 7, 5 chapters) sit between
// Loops and Arrays, both with real content now, and nothing that already exists moved, was renamed or lost.
//   node --test tests/home/structure.test.js
// The data comes from tests/fixtures/curriculum-structure.json: every active stage/chapter/prerequisite row after applying
// supabase/migrations to the CSV seed (rebuild with `node tests/fixtures/build-production-content.mjs`). The live prerequisite rows
// that were entered directly in the database are not in the repo, so the "future rules" test below is a projection, not a claim
// about production.
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { S, range, CURRICULUM, chaptersOf, stagesInOrder, appFor, through } = require("./structure-app.js");
const HP = require(path.resolve(__dirname, "..", "..", "assets", "home", "path.js"));

// ---- the shape of the curriculum
test("stages: the whole curriculum is in the intended order with the intended numbers and names", () => {
  assert.deepStrictEqual(stagesInOrder().map((s) => [s.stage_no, s.stage_id, s.title]), CURRICULUM.map((c) => [c.no, c.id, c.title]));
});
test("stages: Loops -> Number Crunching -> Patterns -> Arrays (the order the backend sorts by, and the number Home prints)", () => {
  const seq = stagesInOrder().map((s) => s.title);
  const at = (t) => seq.indexOf(t);
  assert.ok(at("Loops") + 1 === at("NUMBER CRUNCHING") && at("NUMBER CRUNCHING") + 1 === at("PATTERNS") && at("PATTERNS") + 1 === at("ARRAYS"), seq.join(" > "));
  assert.deepStrictEqual(seq.slice(at("ARRAYS")), ["ARRAYS", "STRINGS", "SEARCHING & SORTING", "FUNCTIONS", "POINTERS"]);
});
test("stages: numbers and sort orders are unique and equal the position (0..12); no duplicate stage ids", () => {
  const list = stagesInOrder();
  assert.deepStrictEqual(list.map((s) => s.stage_no), list.map((_, i) => i));
  assert.deepStrictEqual(list.map((s) => s.order), list.map((_, i) => i));
  assert.strictEqual(new Set(S.stages.map((s) => s.stage_id)).size, S.stages.length);
});
test("Number Crunching has 7 chapter slots and Patterns has 5", () => {
  assert.strictEqual(chaptersOf("STG012").length, 7);
  assert.strictEqual(chaptersOf("STG013").length, 5);
});
test("every stage has exactly the chapters it had: existing stage ids and chapter ids are preserved, none renamed, moved or lost", () => {
  for (const c of CURRICULUM) assert.deepStrictEqual(chaptersOf(c.id).map((x) => x.chapter_id).sort(), [...c.chapters].sort(), c.id + " " + c.title);
  assert.strictEqual(S.chapters.length, CURRICULUM.reduce((n, c) => n + c.chapters.length, 0));
});
test("no chapter id is used twice, and every chapter belongs to a stage that exists", () => {
  assert.strictEqual(new Set(S.chapters.map((c) => c.chapter_id)).size, S.chapters.length);
  const stageIds = new Set(S.stages.map((s) => s.stage_id));
  assert.ok(S.chapters.every((c) => stageIds.has(c.stage_id)));
});
test("existing chapters keep their number and order inside their stage", () => {
  for (const c of CURRICULUM) {
    const list = chaptersOf(c.id);
    assert.deepStrictEqual(list.map((x) => x.chapter_no), list.map((_, i) => i + 1), c.title);
  }
});

// ---- Number Crunching has its real content (from assets/Contents/Number Crunching) and is unlocked like Stages 6-9
test("Number Crunching: Chapter 1 is Counting Digits (CH0118) and Chapter 2 is Accessing Digits (CH0117), by the canonical order/chapter_no columns, not just by displayed text", () => {
  const list = chaptersOf("STG012");
  assert.deepStrictEqual(list.slice(0, 2).map((c) => [c.chapter_no, c.chapter_id, c.title]), [
    [1, "CH0118", "Counting Digits"],
    [2, "CH0117", "Accessing Digits"],
  ]);
});
test("Number Crunching: Chapter 1 -> Chapter 2 -> Chapter 3 progression still works after the swap (no broken chain, no stale prerequisite edge)", () => {
  assert.deepStrictEqual(S.prerequisites.filter((p) => p.target_id === "CH0117" && p.active).map((p) => p.prerequisite_id), ["CH0118"], "CH0117 (now slot 2) requires CH0118 (now slot 1)");
  assert.strictEqual(S.prerequisites.filter((p) => p.target_id === "CH0118" && p.active).length, 0, "CH0118 (now slot 1) has no chapter prerequisite of its own (only the stage gate)");
  assert.deepStrictEqual(S.prerequisites.filter((p) => p.target_id === "CH0119" && p.active).map((p) => p.prerequisite_id), ["CH0117"], "CH0119 (slot 3, unchanged) now requires slot 2's real chapter, CH0117");
  assert.strictEqual(S.prerequisites.some((p) => p.target_id === "CH0118" && p.prerequisite_id === "CH0117" && p.active), false, "the old, now-backwards edge is gone");
});
test("Number Crunching: the seven chapters carry the titles of the Number Crunching source PDFs, each with one learn text and its own question count", () => {
  const want = CURRICULUM.find((c) => c.id === "STG012").titles;
  assert.deepStrictEqual(chaptersOf("STG012").map((c) => c.title), want);
  const list = chaptersOf("STG012");
  for (const c of list) assert.strictEqual(S.content[c.chapter_id].learn, 1, c.chapter_id);
  // every chapter has 5 questions except Reversing a Number, whose own source repeats "3" in its quiz numbering and has 6
  assert.deepStrictEqual(list.map((c) => S.content[c.chapter_id].questions), [5, 5, 6, 5, 5, 5, 5]);
});
test("Number Crunching is unlocked the same way as the other populated stages: no self-lock, and the chapters keep their slot-to-slot chain", () => {
  assert.strictEqual(S.prerequisites.filter((p) => p.target_id === "STG012").length, 0);
});
// ---- Patterns has its real content (from assets/Contents/Patterns) and is unlocked like Stages 6-9
test("Patterns: the five chapters carry the titles of the Patterns source PDFs, each with one learn text and five questions", () => {
  const want = CURRICULUM.find((c) => c.id === "STG013").titles;
  assert.deepStrictEqual(chaptersOf("STG013").map((c) => c.title), want);
  for (const c of chaptersOf("STG013")) assert.deepStrictEqual(S.content[c.chapter_id], { learn: 1, questions: 5 }, c.chapter_id);
});
test("Patterns is unlocked the same way as the other populated stages: no self-lock, and the Patterns chapters keep their slot-to-slot chain", () => {
  assert.strictEqual(S.prerequisites.filter((p) => p.target_id === "STG013").length, 0);
});
test("Pointers is unlocked the same way as the other populated stages: no self-lock", () => {
  assert.strictEqual(S.prerequisites.filter((p) => p.target_id === "STG011").length, 0);
});
test("the existing chapter unlock mechanism is ready: each new slot requires the previous slot", () => {
  for (const sid of ["STG012", "STG013"]) {
    const list = chaptersOf(sid);
    list.slice(1).forEach((c, i) => {
      const rows = S.prerequisites.filter((p) => p.target_id === c.chapter_id && p.active);
      assert.deepStrictEqual(rows.map((p) => p.prerequisite_id), [list[i].chapter_id]);
    });
    assert.strictEqual(S.prerequisites.filter((p) => p.target_id === list[0].chapter_id).length, 0, "the first slot is gated by its stage");
  }
});
test("the existing Stage 6-9 unlock rows are untouched: Arrays, Strings, Searching & Sorting and Functions have no self-lock", () => {
  for (const sid of ["STG007", "STG008", "STG009", "STG010"]) assert.strictEqual(S.prerequisites.filter((p) => p.target_id === sid && p.prerequisite_id === sid).length, 0, sid);
});

// ---- what Home shows (the app state is derived from the prerequisite rows by tests/home/structure-app.js)
const stageOf = (model, title) => model.stages.find((s) => s.title === title);

test("Home: a student who finished Loops sees Loops, then Number Crunching, then Patterns, then Arrays", () => {
  const model = HP.build(appFor(S.prerequisites, through(5)));
  assert.deepStrictEqual(model.stages.map((s) => [s.stageNo, s.title]), CURRICULUM.map((c) => [c.no, c.title]));
  assert.strictEqual(stageOf(model, "Loops").status, "completed");
  // Number Crunching and Patterns both have real content and no self-lock: they open like every other populated stage, chapter by chapter
  const nc = stageOf(model, "NUMBER CRUNCHING");
  assert.strictEqual(nc.total, 7);
  assert.notStrictEqual(nc.status, "locked");
  assert.strictEqual(nc.done, 0);
  assert.deepStrictEqual(nc.nodes.map((n) => n.title), CURRICULUM.find((c) => c.id === "STG012").titles);
  const pt = stageOf(model, "PATTERNS");
  assert.strictEqual(pt.total, 5);
  assert.notStrictEqual(pt.status, "locked");
  assert.strictEqual(pt.done, 0);
  assert.deepStrictEqual(pt.nodes.map((n) => n.title), CURRICULUM.find((c) => c.id === "STG013").titles);
});
test("Home: Number Crunching chapters open one at a time (chapter n needs chapter n-1)", () => {
  const ch = CURRICULUM.find((c) => c.id === "STG012").chapters;
  let model = HP.build(appFor(S.prerequisites, through(5)));
  assert.deepStrictEqual(stageOf(model, "NUMBER CRUNCHING").nodes.map((n) => n.state), ["current", "locked", "locked", "locked", "locked", "locked", "locked"]);
  model = HP.build(appFor(S.prerequisites, [...through(5), ch[0], ch[1]]));
  assert.deepStrictEqual(stageOf(model, "NUMBER CRUNCHING").nodes.map((n) => n.state), ["completed", "completed", "current", "locked", "locked", "locked", "locked"]);
  model = HP.build(appFor(S.prerequisites, [...through(5), ...ch]));
  assert.strictEqual(stageOf(model, "NUMBER CRUNCHING").status, "completed");
});
test("Home: Patterns chapters open one at a time (chapter n needs chapter n-1)", () => {
  const nc = CURRICULUM.find((c) => c.id === "STG012").chapters, ch = CURRICULUM.find((c) => c.id === "STG013").chapters;
  const base = [...through(5), ...nc];   // Number Crunching finished too, so Patterns becomes the highlighted "current" stage
  let model = HP.build(appFor(S.prerequisites, base));
  assert.deepStrictEqual(stageOf(model, "PATTERNS").nodes.map((n) => n.state), ["current", "locked", "locked", "locked", "locked"]);
  model = HP.build(appFor(S.prerequisites, [...base, ch[0], ch[1]]));
  assert.deepStrictEqual(stageOf(model, "PATTERNS").nodes.map((n) => n.state), ["completed", "completed", "current", "locked", "locked"]);
  model = HP.build(appFor(S.prerequisites, [...base, ...ch]));
  assert.strictEqual(stageOf(model, "PATTERNS").status, "completed");
});
test("Home: Arrays, Strings, Searching & Sorting and Functions behave exactly as before (not locked by the new stages)", () => {
  const model = HP.build(appFor(S.prerequisites, through(5)));
  for (const t of ["ARRAYS", "STRINGS", "SEARCHING & SORTING", "FUNCTIONS"]) assert.notStrictEqual(stageOf(model, t).status, "locked", t);
  // Pointers has real content now too (see 20261001010000_unlock_stage12_pointers.sql) and, like Number Crunching and
  // Patterns before it, is unlocked the same way: no self-lock means it is never reported as "locked".
  assert.notStrictEqual(stageOf(model, "POINTERS").status, "locked");
});
test("Home: a student who finished everything through Patterns has Number Crunching and Patterns both complete", () => {
  const model = HP.build(appFor(S.prerequisites, through(7)));
  assert.strictEqual(stageOf(model, "NUMBER CRUNCHING").status, "completed"); assert.strictEqual(stageOf(model, "NUMBER CRUNCHING").done, 7);
  assert.strictEqual(stageOf(model, "PATTERNS").status, "completed");
  assert.notStrictEqual(stageOf(model, "ARRAYS").status, "locked");
});
test("Home markup lists the stages in curriculum order with Stage 6 and Stage 7 for the new ones", () => {
  const html = HP.modelHTML(HP.build(appFor(S.prerequisites, through(5))));
  const order = [...html.matchAll(/data-stage-section="(STG\d+)"/g)].map((m) => m[1]);
  assert.deepStrictEqual(order, CURRICULUM.map((c) => c.id));
  assert.match(html, /Programming in C · Stage 6<\/span>[\s\S]*?NUMBER CRUNCHING/);
  assert.match(html, /Programming in C · Stage 7<\/span>[\s\S]*?PATTERNS/);
  assert.match(html, /Programming in C · Stage 8<\/span>[\s\S]*?ARRAYS/);
  assert.ok(!/NUMBER_CRUNCHING_CHAPTER|PATTERNS_CHAPTER/.test(html), "no ugly internal placeholder names reach students");
});

// ---- the final unlock chain the architecture has to support once the real content is inserted (a PROJECTION: the self-locks are
// removed and the stage-to-stage rules added, exactly what the future content-unlock migration will do)
test("projection: with real content the chain Loops -> Number Crunching -> Patterns -> Arrays unlocks one stage at a time, chapter by chapter", () => {
  const rules = S.prerequisites.filter((p) => !(p.target_id === "STG012" && p.prerequisite_id === "STG012") && !(p.target_id === "STG013" && p.prerequisite_id === "STG013"))
    .concat([
      { target_id: "STG012", prerequisite_id: "STG006", condition: "completed", description: "Complete Stage 5 first.", active: true },
      { target_id: "STG013", prerequisite_id: "STG012", condition: "completed", description: "Complete Stage 6 first.", active: true },
      { target_id: "STG007", prerequisite_id: "STG013", condition: "completed", description: "Complete Stage 7 first.", active: true },
    ]);
  const nc = CURRICULUM[6].chapters, pt = CURRICULUM[7].chapters;
  let m = HP.build(appFor(rules, through(4)));
  assert.strictEqual(stageOf(m, "NUMBER CRUNCHING").status, "locked", "Loops not finished: Number Crunching stays locked");
  m = HP.build(appFor(rules, through(5)));
  assert.strictEqual(stageOf(m, "NUMBER CRUNCHING").status, "current", "Loops finished: Number Crunching unlocks");
  assert.deepStrictEqual(stageOf(m, "NUMBER CRUNCHING").nodes.map((n) => n.state), ["current", "locked", "locked", "locked", "locked", "locked", "locked"], "chapters open one at a time");
  assert.strictEqual(stageOf(m, "PATTERNS").status, "locked"); assert.strictEqual(stageOf(m, "ARRAYS").status, "locked");
  m = HP.build(appFor(rules, [...through(5), nc[0], nc[1]]));
  assert.deepStrictEqual(stageOf(m, "NUMBER CRUNCHING").nodes.map((n) => n.state).slice(0, 4), ["completed", "completed", "current", "locked"]);
  m = HP.build(appFor(rules, [...through(5), ...nc]));
  assert.strictEqual(stageOf(m, "NUMBER CRUNCHING").status, "completed"); assert.strictEqual(stageOf(m, "PATTERNS").status, "current", "Number Crunching finished: Patterns unlocks");
  assert.strictEqual(stageOf(m, "ARRAYS").status, "locked", "Patterns not finished: Arrays stays locked");
  m = HP.build(appFor(rules, [...through(5), ...nc, ...pt]));
  assert.strictEqual(stageOf(m, "PATTERNS").status, "completed"); assert.strictEqual(stageOf(m, "ARRAYS").status, "current", "Patterns finished: Arrays unlocks");
});

// ---- progressive chapter lighting (a purely visual journey cue -- see applyLighting() in assets/home/path.js).
// Derived from the flattened, real stage/chapter order every time build() runs, never a hardcoded per-chapter table.
test("lighting: every chapter across every stage gets an intensity in range, and the curriculum's first chapter is dimmest, its last is brightest", () => {
  const model = HP.build(appFor(S.prerequisites, through(5)));
  const flat = model.stages.flatMap((s) => s.nodes);
  assert.ok(flat.length > 50, "sanity: the full curriculum has many chapters");
  for (const n of flat) {
    assert.ok(typeof n.lightIntensity === "number" && !Number.isNaN(n.lightIntensity), n.chapterId + " has no lighting metadata");
    assert.ok(n.lightIntensity >= 0.15 && n.lightIntensity <= 1, n.chapterId + " intensity out of range: " + n.lightIntensity);
  }
  assert.strictEqual(flat[0].lightIntensity, 0.15, "the very first chapter of the whole curriculum is at the dimmest end");
  assert.strictEqual(flat[flat.length - 1].lightIntensity, 1, "the very last chapter of the whole curriculum is at the brightest end");
  assert.ok(flat[0].lightIntensity < flat[flat.length - 1].lightIntensity);
});
test("lighting: intensity is monotonically non-decreasing end to end, including across every stage boundary (no reset)", () => {
  const model = HP.build(appFor(S.prerequisites, through(5)));
  const flat = model.stages.flatMap((s) => s.nodes);
  for (let i = 1; i < flat.length; i++) assert.ok(flat[i].lightIntensity >= flat[i - 1].lightIntensity, flat[i - 1].chapterId + " -> " + flat[i].chapterId + " went backwards");
  // specifically check a real stage boundary: Loops' last chapter -> Number Crunching's first chapter
  const loopsLast = stageOf(model, "Loops").nodes.at(-1), ncFirst = stageOf(model, "NUMBER CRUNCHING").nodes[0];
  assert.ok(ncFirst.lightIntensity > loopsLast.lightIntensity, "Number Crunching Ch.1 must continue brighter than Loops' last chapter, not reset to the curriculum's dim end");
});
test("lighting: adding/removing chapters recomputes intensity dynamically (no hardcoded table)", () => {
  const full = HP.build(appFor(S.prerequisites, through(5))).stages.flatMap((s) => s.nodes);
  const appShort = appFor(S.prerequisites, through(5));
  appShort.chapters = appShort.chapters.filter((c) => c.stage_id !== "STG011"); // drop the last stage entirely
  const short = HP.build(appShort).stages.flatMap((s) => s.nodes);
  assert.ok(short.length < full.length);
  assert.notStrictEqual(short[short.length - 1].lightIntensity, full[short.length - 1].lightIntensity, "the new shorter total must shift what 'brightest' means, proving intensity is recomputed from the live registry, not read off a fixed table");
  assert.strictEqual(short[short.length - 1].lightIntensity, 1);
});
test("lighting: is visual only -- state (locked/current/completed) stays the real source of truth, unaffected by intensity", () => {
  const model = HP.build(appFor(S.prerequisites, through(5)));
  const nc = stageOf(model, "NUMBER CRUNCHING");
  assert.strictEqual(nc.nodes[0].state, "current");
  assert.ok(nc.nodes.slice(1).every((n) => n.state === "locked"), "a bright (high-intensity) far-future chapter is still locked");
  const html = HP.modelHTML(model);
  assert.match(html, /--chapter-light-intensity:[\d.]+/, "the intensity reaches the rendered markup as a CSS custom property");
  assert.ok(!/data-state="current"[^>]*--chapter-light-intensity:0\.15/.test(html.replace(/\n/g, "")), "sanity: current-chapter rendering still carries real per-position intensity, not a stub");
});
