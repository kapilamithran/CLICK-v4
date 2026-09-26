// Run with: npm test   (compiles first, then uses Node's built-in test runner)
const test = require("node:test");
const assert = require("node:assert/strict");
const { splitSampleCases, SAMPLE_CASE_DELIMITER } = require("../out/sampleCases.js");
const { QuestionViewProvider } = require("../out/questionViewProvider.js");

const D = SAMPLE_CASE_DELIMITER;

test("delimiter constant is //.//", () => {
  assert.equal(D, "//.//");
});

test("one sample stays one case", () => {
  assert.deepEqual(splitSampleCases("A", "X"), [{ input: "A", output: "X" }]);
});

test("three samples stay paired by position", () => {
  assert.deepEqual(splitSampleCases(`A${D}B${D}C`, `X${D}Y${D}Z`), [
    { input: "A", output: "X" },
    { input: "B", output: "Y" },
    { input: "C", output: "Z" },
  ]);
});

test("real screenshot question: 18 / -7 / 0 with two-line outputs", () => {
  const cases = splitSampleCases(
    `18${D}-7${D}0`,
    `Parity : Even\nSign   : Positive${D}Parity : Odd\nSign   : Negative${D}Parity : Even\nSign   : Zero`
  );
  assert.equal(cases.length, 3);
  assert.deepEqual(cases[0], { input: "18", output: "Parity : Even\nSign   : Positive" });
  assert.deepEqual(cases[1], { input: "-7", output: "Parity : Odd\nSign   : Negative" });
  assert.deepEqual(cases[2], { input: "0", output: "Parity : Even\nSign   : Zero" });
});

test("no input at all: null/undefined/empty input still yields the output", () => {
  for (const noInput of [null, undefined, ""]) {
    assert.deepEqual(splitSampleCases(noInput, "Hello"), [{ input: "", output: "Hello" }]);
  }
});

test("nothing to show yields no cases", () => {
  assert.deepEqual(splitSampleCases(null, null), []);
  assert.deepEqual(splitSampleCases("", ""), []);
});

test("multi-line inputs and significant leading whitespace are preserved (never trimmed)", () => {
  const cases = splitSampleCases(`2 3\n1 2 3\n4 5 6${D}1 1\n9`, `     1     2     3\n     4     5     6${D}     9`);
  assert.equal(cases[0].input, "2 3\n1 2 3\n4 5 6");
  assert.equal(cases[0].output, "     1     2     3\n     4     5     6");
  assert.equal(cases[1].input, "1 1\n9");
  assert.equal(cases[1].output, "     9");
});

test("strings and negative numbers survive splitting", () => {
  const cases = splitSampleCases(`hello world${D}-5 -10`, `HELLO WORLD${D}-15`);
  assert.deepEqual(cases, [
    { input: "hello world", output: "HELLO WORLD" },
    { input: "-5 -10", output: "-15" },
  ]);
});

test("mismatched counts stay positional: nothing is duplicated and nothing is dropped", () => {
  assert.deepEqual(splitSampleCases(`A${D}B`, "X"), [
    { input: "A", output: "X" },
    { input: "B", output: "" },
  ]);
  assert.deepEqual(splitSampleCases("A", `X${D}Y${D}Z`), [
    { input: "A", output: "X" },
    { input: "", output: "Y" },
    { input: "", output: "Z" },
  ]);
});

test("only the exact //.// separator splits (near-misses are left alone)", () => {
  assert.deepEqual(splitSampleCases("a//b", "a/./b"), [{ input: "a//b", output: "a/./b" }]);
  assert.deepEqual(splitSampleCases("x // . // y", "//./"), [{ input: "x // . // y", output: "//./" }]);
});

function renderPanel(question) {
  const view = { webview: { options: {}, cspSource: "vscode-resource:", html: "", onDidReceiveMessage() {} } };
  const provider = new QuestionViewProvider({}, () => {});
  provider.resolveWebviewView(view);
  provider.setPaired(true);
  provider.setQuestion(question);
  return view.webview.html;
}

const baseQuestion = {
  practice_id: "T-1",
  stage_id: "STG001",
  title: "Test question",
  objective: "obj",
  problem_statement: "stmt",
  constraints: "",
  starter_code: "",
  visible_tests: [],
  hidden_tests: [],
  mistake_rules: [],
  hints: [],
  success_message: "",
  technique_after_success: "",
  order: 1,
};

test("panel: single sample keeps the original single Example layout", () => {
  const html = renderPanel({ ...baseQuestion, sample_input: "5", sample_output: "25" });
  assert.match(html, /<h3>Example<\/h3><p><strong>Input<\/strong><\/p><pre><code>5<\/code><\/pre><p><strong>Output<\/strong><\/p><pre><code>25<\/code><\/pre>/);
  assert.doesNotMatch(html, /class="sample-case"/);
  assert.doesNotMatch(html, /\/\/\.\/\//);
});

test("panel: three samples render three numbered, correctly paired blocks", () => {
  const html = renderPanel({ ...baseQuestion, sample_input: `18${D}-7${D}0`, sample_output: `E${D}O${D}Z` });
  const blocks = [...html.matchAll(/<div class="sample-case" data-sample-case="(\d+)">(.*?)<\/div>/g)];
  assert.equal(blocks.length, 3);
  const pairs = blocks.map((b) => ({
    n: b[1],
    input: b[2].match(/Input<\/strong><\/p><pre><code>([^<]*)<\/code>/)[1],
    output: b[2].match(/Output<\/strong><\/p><pre><code>([^<]*)<\/code>/)[1],
  }));
  assert.deepEqual(pairs, [
    { n: "1", input: "18", output: "E" },
    { n: "2", input: "-7", output: "O" },
    { n: "3", input: "0", output: "Z" },
  ]);
  assert.doesNotMatch(html, /\/\/\.\/\//, "the raw delimiter must never leak into the panel");
});

test("panel: sample text is HTML-escaped", () => {
  const html = renderPanel({ ...baseQuestion, sample_input: `<b>${D}"q"`, sample_output: `a&b${D}'c'` });
  assert.match(html, /&lt;b&gt;/);
  assert.match(html, /a&amp;b/);
  assert.doesNotMatch(html, /<b>/);
});

test("panel: a no-input single sample shows only the output, as before", () => {
  const html = renderPanel({ ...baseQuestion, sample_input: "", sample_output: "Hello" });
  assert.match(html, /<h3>Example<\/h3><p><strong>Output<\/strong><\/p><pre><code>Hello<\/code><\/pre>/);
  assert.doesNotMatch(html, /<strong>Input<\/strong>/);
});
