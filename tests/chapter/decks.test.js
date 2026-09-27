// Validates every chapter deck in assets/chapter/defs/ against CLICK's real content. Node only, no browser.
//   node --test "tests/chapter/*.test.js"
//   CHAPTERS=CH0034,CH0035 node --test tests/chapter/decks.test.js     (only those decks, handy while authoring)
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const H = require("./helpers.js");
const LH = require("../learn/helpers.js"); // the Learn suite's interpreter + gcc helpers

const only = process.env.CHAPTERS ? process.env.CHAPTERS.toUpperCase().split(",").map((s) => s.trim()) : null;
const activities = H.loadActivities();
const decks = H.loadDecks(only);
const { Chapter, Explorer } = H.loadChapterLayer();
const populated = H.fixture.chapters.map((c) => c.chapter_id).filter((id) => !only || only.includes(id));

test("every populated chapter has a deck (no chapter is left on the old Learn -> Test flow)", () => {
  const missing = populated.filter((id) => !decks[id]);
  assert.deepStrictEqual(missing, [], "chapters without a deck: " + missing.join(", "));
});

test("no deck exists for a chapter that has no content (future stages stay empty, nothing is invented)", () => {
  const known = new Set(H.fixture.chapters.map((c) => c.chapter_id));
  const stray = Object.keys(decks).filter((id) => !known.has(id));
  assert.deepStrictEqual(stray, []);
});

for (const id of Object.keys(decks).sort()) {
  const deck = decks[id];
  const ch = H.fixture.chapters.find((c) => c.chapter_id === id);

  test(id + " " + deck.title + ": deck is valid (5-10 slides, Code Explorer first, real questions/activities, glossary, references)", () => {
    const errs = Chapter.validate(deck, H.ctxFor(id, activities));
    assert.deepStrictEqual(errs, [], "\n  - " + errs.join("\n  - "));
  });

  test(id + ": deck matches the chapter's database record", () => {
    assert.ok(ch, "chapter exists in the content");
    assert.strictEqual(deck.stage, ch.stage_id, "stage");
    assert.strictEqual(deck.title.toLowerCase(), ch.title.toLowerCase(), "title should match the chapter title");
  });

  test(id + ": Code Explorer targets map to the code and every one has an explanation", () => {
    const s = deck.slides[0];
    const p = Explorer.parse(s.code);
    assert.deepStrictEqual(p.problems, []);
    p.tokens.forEach((t) => {
      assert.strictEqual(p.code.slice(t.start, t.end), t.text, "token " + t.id + " offsets point at its own text");
      assert.ok(s.targets[t.id], "target " + t.id);
    });
    for (let i = 1; i < p.tokens.length; i++) assert.ok(p.tokens[i].start >= p.tokens[i - 1].end, "targets do not overlap");
    assert.ok(p.tokens.length >= 3, "a Code Explorer needs a handful of meaningful targets (found " + p.tokens.length + ")");
    assert.ok(p.tokens.length <= 14, "too many targets to be a curated list (" + p.tokens.length + ")");
  });

  test(id + ": the Code Explorer example is real C: it runs in the interpreter, and matches gcc when gcc is installed", () => {
    const s = deck.slides[0], code = Explorer.parse(s.code).code, input = s.input || "";
    const src = LH.Interp.asProgram(code);
    const r = LH.Interp.run(src, { input });
    if (!r.ok && s.mayNotRun) return; // an example that is deliberately not runnable (say, it shows a compile error) must opt out explicitly
    assert.ok(r.ok, "the interpreter could not run the example: " + JSON.stringify(r.error) + "\n" + code);
    if (LH.hasGcc) {
      const g = LH.gccRun(code, input, /\bmain\s*\(/.test(code));
      assert.ok(g.ok, "gcc could not compile/run the example: " + g.error);
      assert.strictEqual(LH.normOut(r.stdout), LH.normOut(g.stdout), "interpreter and gcc disagree on the example's output");
    }
  });

  test(id + ": beginner-first glossary hygiene (no circular definitions, no empty filler)", () => {
    const bad = [];
    Object.entries(deck.glossary).forEach(([gid, g]) => {
      const term = String(g.term).toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
      const short = String(g.short).toLowerCase();
      if (g.short.trim().toLowerCase() === g.explain.trim().toLowerCase()) bad.push(gid + ": short and explain are identical");
      if (term && /^(a|an|the) /.test(short) === false && short.split(" ").length < 3) bad.push(gid + ": short is too thin");
      if (/\b(tbd|todo|lorem)\b/i.test(g.explain + g.short)) bad.push(gid + ": placeholder text");
    });
    assert.deepStrictEqual(bad, []);
  });

  test(id + ": every question in the deck is a real active question of this chapter, and each is used once", () => {
    const qids = deck.slides.filter((s) => s.kind === "question").map((s) => s.question);
    assert.strictEqual(new Set(qids).size, qids.length);
    assert.deepStrictEqual([...qids].sort(), [...H.servedFor(id)].sort(), "the deck must place exactly the questions the server serves for a run");
  });

  test(id + ": planning a run keeps every question slide and never drops the Code Explorer", () => {
    const run = H.servedFor(id).map((qid) => ({ question_id: qid }));
    const plan = Chapter.plan(deck, run);
    assert.strictEqual(plan.length, deck.slides.length);
    assert.strictEqual(plan[0].kind, "explorer");
    assert.deepStrictEqual(plan.filter((s) => s.kind === "question").map((s) => s.question).sort(), [...H.servedFor(id)].sort());
  });
}

test("a served question the deck forgot is appended, and a deck question the server did not serve is skipped (robust to bank edits)", () => {
  const deck = { slides: [{ id: "s1", kind: "explorer" }, { id: "s2", kind: "question", question: "QA" }, { id: "s3", kind: "question", question: "QGONE" }] };
  const out = Chapter.plan(deck, [{ question_id: "QA" }, { question_id: "QNEW" }]);
  assert.deepStrictEqual(out.map((s) => s.kind + ":" + (s.question || "")), ["explorer:", "question:QA", "question:QNEW"]);
});

test("validator rejects the problems it exists to catch", () => {
  const ok = decks.CH0034;
  if (!ok) return; // exemplar not present (filtered run)
  const clone = () => JSON.parse(JSON.stringify(ok));
  const ctx = H.ctxFor("CH0034", activities);
  const cases = [
    ["first slide not an explorer", (d) => { d.slides[0].kind = "activity"; }, /first slide/],
    ["too few slides", (d) => { d.slides = d.slides.slice(0, 3); }, /slides:/],
    ["unknown glossary term on a slide", (d) => { d.slides[2].glossary = ["nope"]; }, /not defined/],
    ["orphan glossary entry", (d) => { d.glossary.extra = { term: "extra", short: "An unused entry here.", explain: "This entry is never attached to any slide at all, so it is dead weight." }; }, /never used/],
    ["fabricated (non-YouTube) reference", (d) => { d.references[0].url = "https://example.com/video"; }, /YouTube/],
    ["missing question slide", (d) => { d.slides = d.slides.filter((s) => s.question !== "Q000170"); d.slides[d.slides.length - 1].id = "s7"; }, /served in a run/],
    ["question from another chapter", (d) => { d.slides[2].question = "Q000001"; }, /does not exist|belongs to/],
    ["explorer marker without a target", (d) => { d.slides[0].code = d.slides[0].code.replace("«semi|;»", "«ghost|;»"); }, /no entry in `targets`/],
    ["activity that does not exist", (d) => { d.slides[1].activity = "CH0034.p9.nope"; }, /does not exist/],
  ];
  for (const [name, mutate, re] of cases) {
    const d = clone(); mutate(d);
    const errs = Chapter.validate(d, ctx).join(" | ");
    assert.match(errs, re, name + " should be reported (got: " + errs.slice(0, 200) + ")");
  }
});
