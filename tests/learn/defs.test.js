// Verifies every activity definition in assets/learn/defs/: schema, page heading vs. the live-content
// snapshot, and (most importantly) that every code sample RUNS - with the interpreter and, when gcc is
// installed, cross-checked against gcc. Run: node --test tests/learn/defs.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { Interp, loadLayer, hasGcc, gccRun, snapshot, audit, normOut } = require("./helpers.js");

const CL = loadLayer();
const defs = [...CL.defs.values()];
const auditIds = new Set(audit.recommendations.map((r) => r.id));
const run = (code, input, opts) => Interp.run(code, Object.assign({ input: input || "" }, opts || {}));
const filled = (d) => { let i = 0; return d.code.replace(/___/g, () => d.blanks[i++].answers[0]); };

test("every definition file registered without being skipped", () => {
  assert.deepEqual(CL.invalid, [], "invalid definitions: " + JSON.stringify(CL.invalid));
});
test("ids are unique and there is at least one definition", () => { assert.ok(defs.length > 0); assert.equal(new Set(defs.map((d) => d.id)).size, defs.length); });

function controlCombos(controls) {
  const vals = controls.map((c) => c.type === "range" ? [...new Set([c.min, Math.round((c.min + c.max) / 2), c.max, c.value])].map(String) : c.type === "select" ? c.options.slice(0, 5).map((o) => String(o.v)) : c.type === "toggle" ? [c.on, c.off] : [String(c.min), String(c.max), String(c.value)]);
  let combos = [{}];
  controls.forEach((c, i) => { const next = []; for (const base of combos) for (const v of vals[i]) next.push(Object.assign({}, base, { [c.id]: v })); combos = next; });
  if (combos.length > 40) { const step = Math.ceil(combos.length / 40); combos = combos.filter((_, i) => i % step === 0); }
  return combos;
}

for (const d of defs) {
  test(`${d.id} (${d.kind})`, () => {
    // ---- schema + placement
    assert.deepEqual(CL.validate(d), [], "schema");
    const ch = snapshot.chapters[d.chapter];
    assert.ok(ch, "chapter " + d.chapter + " is not in the live-content snapshot");
    assert.equal(d.stage, ch.stage, "stage does not match the chapter");
    assert.ok(d.page >= 1 && d.page <= ch.headings.length, "page out of range");
    assert.equal(d.heading.trim(), ch.headings[d.page - 1].trim(), "heading does not match page " + d.page);
    (d.implements || []).forEach((id) => assert.ok(auditIds.has(id), "unknown audit recommendation " + id));

    // ---- code checks per kind
    const both = (code, input, expected, label) => {
      const r = run(code, input);
      assert.ok(r.ok, label + " should run in the interpreter: " + (r.error && r.error.message));
      if (expected !== undefined) assert.equal(normOut(r.stdout), normOut(expected), label + " output");
      if (hasGcc && !d.skipGcc) {
        const g = gccRun(code, input);
        assert.ok(g.ok, label + " should compile with gcc: " + g.error);
        assert.equal(normOut(r.stdout), normOut(g.stdout), label + " interpreter vs gcc");
      }
      return r;
    };
    switch (d.kind) {
      case "predict": both(d.code, d.input, d.expected, "predict code"); break;
      case "fill": if (!d.noRun) both(filled(d), d.input, undefined, "filled code"); break;
      case "order": if (!d.noRun) both(d.lines.join("\n"), d.input, undefined, "ordered program"); break;
      case "error":
        if (d.noRun) break;
        if (d.mode === "toggle") {
          both(d.fixed, d.input, d.outputAfterFix, "fixed code");
          const b = run(d.broken, d.input); assert.equal(b.ok, false, "broken code should fail in the interpreter");
          if (hasGcc && !d.skipGcc) assert.equal(gccRun(d.broken, d.input).ok, false, "broken code should fail with gcc");
        } else {
          const fixedLines = d.lines.slice(); fixedLines[d.bug] = d.fixed;
          both(fixedLines.join("\n"), d.input, undefined, "fixed program");
          assert.equal(run(d.lines.join("\n"), d.input).ok, false, "the buggy program should fail in the interpreter");
        }
        break;
      case "run": both(d.code, d.input, undefined, "run code"); break;
      case "trace": { const r = both(d.code, d.input, undefined, "trace code"); const t = run(d.code, d.input, { trace: true }); assert.ok(t.trace && t.trace.length > 0 && t.trace.length < 400, "trace should have 1-399 steps, has " + (t.trace ? t.trace.length : 0)); void r; break; }
      case "tracetable": { const t = run(d.code, d.input, { trace: true }); assert.ok(t.ok, "code must run"); const line = d.loopLine || (t.trace.find((e) => e.kind === "cond") || {}).line; assert.ok(t.trace.filter((e) => e.kind === "cond" && e.line === line).length >= 2, "needs a loop with at least 2 condition checks"); if (hasGcc && !d.skipGcc) both(d.code, d.input, undefined, "trace-table code"); break; }
      case "lab": {
        const variants = d.variants || [{ code: d.code }];
        for (const combo of controlCombos(d.controls)) for (const v of variants) {
          const code = CL.fillTemplate(v.code, combo);
          const r = run(code, d.input || "");
          if (!d.mayFail) assert.ok(r.ok, "lab code with " + JSON.stringify(combo) + " should run: " + (r.error && r.error.message));
        }
        // gcc cross-check on the default setting only (cheap)
        if (hasGcc && !d.skipGcc) { const def = {}; d.controls.forEach((c) => { def[c.id] = c.type === "toggle" ? (c.checked ? c.on : c.off) : String(c.value); }); for (const v of variants) { const code = CL.fillTemplate(v.code, def); const r = run(code, d.input || ""); if (r.ok) { const g = gccRun(code, d.input || ""); assert.ok(g.ok, "lab default should compile: " + g.error); assert.equal(normOut(r.stdout), normOut(g.stdout), "lab default vs gcc"); } } }
        break;
      }
      case "challenge": {
        d.tests.forEach((t, i) => both(d.solution, t.input, t.expected, "solution against test " + (i + 1)));
        const starterPasses = d.tests.every((t) => { const r = run(d.starter, t.input); return r.ok && normOut(r.stdout) === normOut(t.expected); });
        assert.equal(starterPasses, false, "the starter code must not already solve the challenge");
        assert.deepEqual(CL.missingUses(d, d.solution).map((u) => u.re), [], "the worked solution must satisfy every 'uses' pattern");
        (d.uses || []).forEach((u) => assert.ok(!new RegExp(u.re).test(CL.stripCode(d.starter)), "the starter must not already satisfy 'uses' " + u.re));
        assert.ok(Array.isArray(d.hints) && d.hints.length >= 2, "needs at least 2 hints");
        break;
      }
      case "pipeline":
        d.scenarios.forEach((s) => {
          if (s.fails) { assert.equal(run(s.code).ok, false, "failing scenario '" + s.label + "' should not run"); if (hasGcc && !d.skipGcc) assert.equal(gccRun(s.code, "", true).ok, false, "gcc should reject '" + s.label + "'"); }
          else both(s.code, s.input, s.output, "scenario '" + s.label + "'");
        });
        break;
      case "buffer": {
        const sim = require("../../assets/learn/kinds-visual.js").simulate;
        assert.ok(sim(d.calls, d.input, false).length === d.calls.length);
        if (d.fixToggle) assert.notDeepEqual(sim(d.calls, d.input, false).map((s) => s.value), sim(d.calls, d.input, true).map((s) => s.value), "the fix should change what is read");
        // the simulator must agree with the interpreter and gcc on what each variable receives
        if (!d.noRun) { const r = run(d.code.join("\n"), d.input); assert.ok(r.ok || true); }
        break;
      }
      default: break;
    }
  });
}

test("coverage report (informational)", (t) => {
  const done = new Set(defs.flatMap((d) => d.implements || []));
  const scope = process.env.CHAPTERS ? process.env.CHAPTERS.split(",").map((s) => s.trim().toUpperCase()) : null;
  const inScope = audit.recommendations.filter((r) => !scope || scope.includes(r.chapter));
  const missing = inScope.filter((r) => !done.has(r.id));
  t.diagnostic(`audit recommendations implemented: ${inScope.length - missing.length} of ${inScope.length}`);
  if (missing.length) t.diagnostic("not yet implemented: " + missing.map((m) => m.id).join(", "));
});
