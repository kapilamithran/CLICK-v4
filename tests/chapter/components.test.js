// Unit tests for the reusable chapter components' pure logic (no browser): Code Explorer parsing/validation, glossary linking, the
// stale-explanation cleanup and the reference-links markup.   node --test "tests/chapter/*.test.js"
const test = require("node:test");
const assert = require("node:assert");
const H = require("./helpers.js");
const { Glossary, Explorer, Chapter } = H.loadChapterLayer();

// ---------------------------------------------------------------- Code Explorer
test("explorer: the code shown is the text with the markers removed, and each target's range points at its own text", () => {
  const p = Explorer.parse("int «a|age» = «v|18»;\nreturn «r|0»;");
  assert.strictEqual(p.code, "int age = 18;\nreturn 0;");
  assert.deepStrictEqual(p.problems, []);
  assert.deepStrictEqual(p.tokens.map((t) => [t.id, t.text, p.code.slice(t.start, t.end), t.line]), [["a", "age", "age", 1], ["v", "18", "18", 1], ["r", "0", "0", 2]]);
});

test("explorer: targets stay accurate when the code is reformatted (positions are derived, never stored)", () => {
  const compact = Explorer.parse("«t|int» «n|x»=«v|5»;"), spaced = Explorer.parse("«t|int»    «n|x»   =   «v|5»;");
  for (const p of [compact, spaced]) p.tokens.forEach((t) => assert.strictEqual(p.code.slice(t.start, t.end), t.text));
  assert.notStrictEqual(compact.tokens[1].start, spaced.tokens[1].start, "different formatting, different offsets, still correct");
});

test("explorer: operators that look like markup (|| and |) and brackets survive as target text", () => {
  const p = Explorer.parse("if (a > 0 «or|||» b[0] == 1) {}");
  assert.strictEqual(p.code, "if (a > 0 || b[0] == 1) {}");
  assert.strictEqual(p.tokens[0].text, "||");
});

test("explorer: broken markup is reported, not silently rendered", () => {
  assert.match(Explorer.parse("int «a|x").problems.join(), /unbalanced/);
  assert.match(Explorer.parse("«a|«b|x»»").problems.join(), /unbalanced|nested/);
  assert.match(Explorer.parse("«a|»").problems.join(), /empty target/);
  assert.match(Explorer.parse("«a|x\ny»").problems.join(), /unbalanced|spans a line/);
});

const good = { code: "int «a|x» = «b|5»;\nint «c|y» = 1;", targets: { a: { title: "x", explain: "A variable name that holds the value." }, b: { title: "5", explain: "A whole number stored in the variable." }, c: { title: "y", explain: "Another variable name in the same program." } }, minTaps: 2 };
test("explorer: a well-formed slide validates", () => assert.deepStrictEqual(Explorer.validate(good), []));

test("explorer: validation catches a marker with no explanation, an unused explanation, thin explanations and bad minTaps", () => {
  const clone = () => JSON.parse(JSON.stringify(good));
  let s = clone(); delete s.targets.b; assert.match(Explorer.validate(s).join(), /marker 'b' has no entry/);
  s = clone(); s.targets.zzz = { title: "z", explain: "This is never used anywhere in the code." }; assert.match(Explorer.validate(s).join(), /never used/);
  s = clone(); s.targets.a.explain = "short"; assert.match(Explorer.validate(s).join(), /beginner explanation/);
  s = clone(); s.targets.a.title = ""; assert.match(Explorer.validate(s).join(), /needs a title/);
  s = clone(); s.minTaps = 9; assert.match(Explorer.validate(s).join(), /minTaps/);
  s = clone(); s.code = "«a|x»\n".repeat(15) + "«b|y» «c|z»"; assert.match(Explorer.validate(s).join(), /keep it to 14 or fewer/);
  s = clone(); s.code = "int «a|x» = «b|5»; " + "x".repeat(50) + "\n«c|y»"; assert.match(Explorer.validate(s).join(), /phone does not scroll sideways/);
});

test("explorer: minTaps is capped by the number of distinct targets, so a slide can never be impossible to finish", () => {
  assert.strictEqual(Explorer.minTapsFor({ code: "«a|x» «a|x»", minTaps: 5 }), 1);
  assert.strictEqual(Explorer.minTapsFor(good), 2);
  assert.strictEqual(Explorer.minTapsFor({ code: "«a|x» «b|y» «c|z»" }), Explorer.DEFAULT_MIN_TAPS);
});

// ---------------------------------------------------------------- glossary
test("glossary: {{term}} and {{term|shown text}} become tappable words; everything else is escaped", () => {
  Glossary.clear();
  Glossary.register({ variable: { term: "variable", short: "A named box.", explain: "It holds a value for later." } });
  const html = Glossary.linkify("A {{variable}} stores <b>a</b> {{variable|number}} & `x`.");
  assert.match(html, /<button type="button" class="cg-term" data-cg-term="variable"[^>]*>variable<\/button>/);
  assert.match(html, /data-cg-term="variable"[^>]*>number<\/button>/);
  assert.ok(html.includes("&lt;b&gt;a&lt;/b&gt;") && html.includes("&amp;") && html.includes("<code>x</code>"));
  assert.ok(!html.includes("<b>"), "author text can never inject markup");
});

test("glossary: an unknown term id renders as plain text instead of breaking the slide", () => {
  Glossary.clear();
  assert.strictEqual(Glossary.linkify("Use {{nope|the box}} here"), "Use the box here");
  assert.strictEqual(Glossary.linkify("Use {{nope}} here"), "Use nope here");
});

test("glossary: 'Words to know' chips list only known terms, in the given order, and nothing for an empty list", () => {
  Glossary.clear();
  Glossary.register({ a: { term: "alpha", short: "s", explain: "e" }, b: { term: "beta <i>", short: "s", explain: "e" } });
  const html = Glossary.chips(["b", "ghost", "a"]);
  assert.deepStrictEqual([...html.matchAll(/data-cg-term="(\w+)"/g)].map((m) => m[1]), ["b", "a"]);
  assert.ok(html.includes("beta &lt;i&gt;"));
  assert.match(html, /role="group" aria-label="Words to know on this slide"/);
  assert.strictEqual(Glossary.chips([]), "");
  assert.strictEqual(Glossary.chips(["ghost"]), "");
});

// ---------------------------------------------------------------- stale explanations and references
test("stale 'Refers to: Slide N' notes are removed from every real explanation, and real sentences survive", () => {
  const bad = [];
  let emptied = 0, kept = 0;
  for (const q of H.fixture.questions) {
    const raw = q.explanation || "", clean = Chapter.cleanExplanation(raw);
    if (/Slides?\s*\d/i.test(clean)) bad.push(q.question_id + ": " + clean);
    if (/refers?\s+to/i.test(raw) && clean === "") emptied++;
    if (clean) kept++;
  }
  assert.deepStrictEqual(bad, []);
  assert.ok(emptied > 30, "many explanations were only a stale pointer (" + emptied + ")");
  assert.strictEqual(Chapter.cleanExplanation("Both %d and %i represent a decimal integer when used with printf(). Refers to: Slide 3"), "Both %d and %i represent a decimal integer when used with printf().");
  assert.strictEqual(Chapter.cleanExplanation("Refers to: Slide 3 — Loop tracing."), "");
  assert.strictEqual(Chapter.cleanExplanation("Refers to: Slides 2 & 3."), "");
  assert.strictEqual(Chapter.cleanExplanation(null), "");
  assert.ok(kept > 0);
});

test("reference links: real anchors that open a new tab, no embedding, no autoplay, and text is escaped", () => {
  const html = Chapter.refsHTML({ references: [{ title: 'Loops <b>"fast"</b>', channel: "A & B", url: "https://www.youtube.com/watch?v=abcdefghijk" }] });
  assert.match(html, /<a class="cc-ref" href="https:\/\/www\.youtube\.com\/watch\?v=abcdefghijk" target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /opens YouTube in a new tab/);
  assert.ok(!/<iframe|<video|autoplay|<embed/i.test(html));
  assert.ok(html.includes("Loops &lt;b&gt;&quot;fast&quot;&lt;/b&gt;") && html.includes("A &amp; B"));
  assert.strictEqual(Chapter.refsHTML({ references: [] }), "");
});

test("every real deck's references are watch links to distinct real-looking video ids", () => {
  const decks = H.loadDecks();
  for (const [id, d] of Object.entries(decks)) {
    assert.ok(d.references.length >= 1 && d.references.length <= 3, id);
    d.references.forEach((r) => assert.match(r.url, Chapter.YT, id + " " + r.url));
  }
});
