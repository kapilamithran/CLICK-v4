/*
 * CLICK Learn activity layer - visual explorer kinds (no code execution).
 *   pipeline   Edit -> Compile -> Link -> Run, with scenarios that fail at different stages
 *   buffer     keyboard input buffer vs scanf / fgets, with the " %c" fix
 *   bits       8-bit flipper for & | ^ ~ << >> and n & 1
 *   evalorder  which operator runs first (uses ClickInterp.parseExpression)
 */
(function (root) {
  "use strict";
  var CL = root.ClickLearn;
  if (!CL) throw new Error("engine.js must load before kinds-visual.js");
  var h = function () { return CL.ui.h.apply(null, arguments); };
  // Shared by every exploratory kind in this file (pipeline/buffer/bits/evalorder): marks the activity done after N interactions,
  // not N *correct* interactions. That is intentional, matching assets/learn/README.md ("learning interactions, not assessments":
  // a student can skip, get it wrong, and still continue) -- these kinds have no pass/fail concept, only "explored enough."
  var interactions = function (api, n) { var c = 0; return function () { c++; if (c >= (n || 3)) api.done(); }; };

  // ------------------------------------------------------------ pipeline
  CL.kind("pipeline", {
    required: ["stages", "scenarios"],
    check: function (d) {
      var e = [], ids = d.stages.map(function (s) { return s.id; });
      d.scenarios.forEach(function (s, i) {
        if (!s.code) e.push("scenario " + (i + 1) + " needs code");
        if (s.fails && ids.indexOf(s.fails) < 0) e.push("scenario " + (i + 1) + " fails at unknown stage");
        if (s.fails && !s.message) e.push("scenario " + (i + 1) + " needs a message");
        if (!s.fails && s.output === undefined) e.push("scenario " + (i + 1) + " needs output");
      });
      return e;
    },
    render: function (d, api) {
      var scen = d.scenarios[0], step = -1, seen = {};
      var tick = interactions(api, Math.min(d.scenarios.length, 3));
      var radios = h("div", { class: "la-choices", role: "radiogroup", "aria-label": "Choose a program" });
      var codeHolder = h("div", { class: "la-codeholder" });
      var row = h("ol", { class: "la-pipe", "aria-label": "Build pipeline" });
      var info = h("div", { class: "la-explain", role: "region", "aria-live": "polite" });
      var next = api.btn("Next stage", function () { advance(); });
      var all = api.btn("Run everything", function () { while (advance(true)); }, true);
      var reset = api.btn("Start over", function () { step = -1; paint(); }, true);
      function stageState(i) {
        var fi = scen.fails ? d.stages.findIndex(function (s) { return s.id === scen.fails; }) : -1;
        if (i > step) return "todo";
        if (fi === i) return "fail";
        return "ok";
      }
      function paint() {
        codeHolder.textContent = ""; codeHolder.appendChild(api.codeBlock(scen.code, { label: "Program" }));
        row.textContent = "";
        d.stages.forEach(function (s, i) {
          var st = stageState(i), fi = scen.fails ? d.stages.findIndex(function (x) { return x.id === scen.fails; }) : 99;
          var dead = fi >= 0 && i > fi;
          row.appendChild(h("li", { class: "la-stage " + (dead ? "dead" : st), "aria-current": i === step ? "step" : null }, h("b", { text: s.label }), h("span", { class: "la-stagemark", text: dead ? "not reached" : st === "ok" ? "✓ done" : st === "fail" ? "✗ stopped" : "waiting" })));
        });
        info.textContent = "";
        if (step < 0) info.appendChild(h("p", { class: "la-note", text: "Press \"Next stage\" to send this program through the pipeline one stage at a time." }));
        else {
          var s = d.stages[step], st = stageState(step);
          info.appendChild(h("p", { html: api.md("**" + s.label + ".** " + s.what) }));
          if (st === "fail") info.appendChild(h("div", { class: "la-diag" }, h("div", { class: "la-outlabel", text: "Simulated " + s.label.toLowerCase() + " message" }), h("pre", { class: "la-out", text: scen.message }), h("p", { class: "la-note", html: api.md(scen.lesson || "The pipeline stops at this stage. You fix the source and start again at Edit.") })));
          else if (step === d.stages.length - 1 && !scen.fails) info.appendChild(api.outBox(scen.output, "Program output"));
        }
        var finished = step >= d.stages.length - 1 || (scen.fails && d.stages.findIndex(function (x) { return x.id === scen.fails; }) <= step);
        next.disabled = !!finished; all.disabled = !!finished;
        if (finished) { seen[scen.id || scen.label] = 1; tick(); }
      }
      function advance() {
        if (step >= d.stages.length - 1) return false;
        var fi = scen.fails ? d.stages.findIndex(function (x) { return x.id === scen.fails; }) : 99;
        if (step >= fi) return false;
        step++; paint(); return step < d.stages.length - 1 && step < fi;
      }
      d.scenarios.forEach(function (s, i) {
        var b = h("button", { type: "button", role: "radio", "aria-checked": String(i === 0), class: "la-choice" + (i === 0 ? " sel" : ""), text: s.label, onclick: function () { scen = s; step = -1; radios.querySelectorAll(".la-choice").forEach(function (x, j) { x.setAttribute("aria-checked", String(j === i)); x.classList.toggle("sel", j === i); }); paint(); } });
        radios.appendChild(b);
      });
      api.body.appendChild(radios); api.body.appendChild(codeHolder); api.body.appendChild(row); api.body.appendChild(info); api.body.appendChild(api.actions(next, all, reset));
      if (d.explanation) api.body.appendChild(h("p", { class: "la-note", html: api.md(d.explanation) }));
      paint();
    },
  });

  // -------------------------------------------------------------- buffer
  function simulate(calls, input, useFix) {
    var p = 0, steps = [], vals = {};
    function isWs(c) { return c === " " || c === "\t" || c === "\n" || c === "\r"; }
    calls.forEach(function (c) {
      var fmt = useFix && c.fixFmt ? c.fixFmt : c.fmt, start = p, consumed = [], note = "", value = null, ok = true;
      var skipWs = function () { while (p < input.length && isWs(input[p])) { consumed.push(p); p++; } };
      if (fmt === "fgets") {
        var n = c.size || 50, taken = 0;
        while (p < input.length && taken < n - 1) { consumed.push(p); taken++; var ch = input[p++]; if (ch === "\n") break; }
        value = input.slice(start, p); note = value.indexOf("\n") >= 0 ? "fgets reads the whole line, including the newline it ends with." : "fgets read " + taken + " characters.";
        if (start >= input.length) { ok = false; note = "Nothing left to read."; }
      } else if (/^\s*%c$/.test(fmt)) {
        if (fmt[0] === " ") skipWs();
        if (p < input.length) { consumed.push(p); value = input[p++]; note = value === "\n" ? "%c reads ANY character, even the newline that is still waiting from pressing Enter. That is why the letter you typed seems to be skipped." : fmt[0] === " " ? "The space in the format told scanf to skip whitespace (including the leftover newline) before reading a character." : "%c took the next character."; }
        else { ok = false; note = "No input left."; }
      } else if (fmt === "%d" || fmt === "%f" || fmt === "%lf") {
        skipWs();
        var skippedWs = consumed.length > 0; // skipWs() above already recorded any skipped whitespace positions; nothing was added since
        var re = fmt === "%d" ? /^[+-]?\d+/ : /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/, m = re.exec(input.slice(p));
        if (m) { for (var k = 0; k < m[0].length; k++) consumed.push(p + k); p += m[0].length; value = m[0]; note = (skippedWs ? fmt + " skipped the leading whitespace, then read \"" : fmt + " read \"") + m[0] + "\" and stopped at the next character."; }
        else { ok = false; note = p >= input.length ? "No input left." : "\"" + input[p] + "\" is not a number, so " + fmt + " stops here and reads nothing."; }
      } else if (fmt === "%s") {
        skipWs(); var q = p; while (q < input.length && !isWs(input[q])) { consumed.push(q); q++; } value = input.slice(p, q); p = q; note = "%s reads one word: it stops at the first space or newline.";
        if (!value) { ok = false; note = "No input left."; }
      }
      vals[c.var] = { value: ok ? value : null, ok: ok, fmt: fmt };
      steps.push({ call: c, fmt: fmt, from: start, to: p, consumed: consumed, value: ok ? value : null, ok: ok, note: note, after: p });
    });
    return steps;
  }
  function show(ch) { return ch === "\n" ? "↵" : ch === " " ? "␣" : ch === "\t" ? "⇥" : ch; }
  function display(v) { if (v === null) return "(unchanged)"; return JSON.stringify(v).replace(/^"|"$/g, "'").replace(/\\n/g, "\\n"); }

  CL.kind("buffer", {
    required: ["code", "calls", "input"],
    check: function (d) {
      var e = [];
      d.calls.forEach(function (c, i) { if (!c.fmt || !c.var) e.push("call " + (i + 1) + " needs fmt and var"); if (["%d", "%f", "%lf", "%c", " %c", "%s", "fgets"].indexOf(c.fmt) < 0) e.push("call " + (i + 1) + " has an unsupported fmt"); if (c.fixFmt && ["%c", " %c"].indexOf(c.fixFmt) < 0) e.push("fixFmt must be %c or ' %c'"); });
      return e;
    },
    render: function (d, api) {
      var tick = interactions(api, 3), input = d.input, fix = false, upto = 0;
      var inputBox = h("textarea", { class: "la-input la-mono", rows: 2, "aria-label": "What the user types. Press Enter to add a new line.", spellcheck: "false" }); inputBox.value = input;
      inputBox.addEventListener("input", function () { input = inputBox.value; upto = 0; paint(); });
      var codeEl = h("div", { class: "la-codeholder" }), bufEl = h("div", { class: "la-buf", role: "group", "aria-label": "Keyboard input buffer" }), varsEl = h("div", { class: "la-vars" }), memEl = h("div", { class: "la-mem" }), noteEl = h("div", { class: "la-explain", role: "region", "aria-live": "polite" });
      var sw = d.fixToggle ? h("label", { class: "la-switch" }, h("input", { type: "checkbox", "aria-label": "Use the version with a space before %c", onchange: function () { fix = this.checked; upto = 0; tick(); paint(); } }), h("span", { html: api.md("Use the fix: `\" %c\"` (with a space)") })) : null;
      var nextBtn = api.btn("Run next input call", function () { upto = Math.min(upto + 1, d.calls.length); tick(); paint(); });
      var allBtn = api.btn("Run all", function () { upto = d.calls.length; tick(); paint(); }, true);
      var resetBtn = api.btn("Reset", function () { upto = 0; paint(); }, true);
      function paint() {
        var steps = simulate(d.calls, input, fix), last = steps[upto - 1];
        var codeLines = d.code.slice();
        codeEl.textContent = ""; var pre = api.codeBlock(codeLines.map(function (l, i) { var c = d.calls.findIndex(function (x) { return x.line === i + 1; }); if (c >= 0 && fix && d.calls[c].fixFmt) return l.replace(/"[^"]*"/, function (s) { return "\"" + d.calls[c].fixFmt + "\""; }); return l; }).join("\n"), { label: "Program" });
        if (last) api.setLines(pre, (function () { var o = {}; o[last.call.line] = 1; return o; })(), last.call.line);
        codeEl.appendChild(pre);
        var consumedNow = {}, consumedBefore = {};
        steps.forEach(function (s, i) { s.consumed.forEach(function (ix) { if (i < upto - 1) consumedBefore[ix] = 1; else if (i === upto - 1) consumedNow[ix] = 1; }); });
        bufEl.textContent = "";
        if (!input.length) bufEl.appendChild(h("span", { class: "la-note", text: "Nothing typed yet." }));
        for (var i = 0; i < input.length; i++) bufEl.appendChild(h("span", { class: "la-chip" + (consumedBefore[i] ? " gone" : consumedNow[i] ? " now" : ""), "aria-label": input[i] === "\n" ? "newline" : input[i] === " " ? "space" : input[i], text: show(input[i]) }));
        varsEl.textContent = "";
        d.calls.forEach(function (c, i) { var s = steps[i], got = i < upto; varsEl.appendChild(h("div", { class: "la-var" + (got && s.value === "\n" ? " warn" : "") }, h("code", { text: c.var }), h("span", { text: got ? (s.ok ? display(s.value) : "(nothing read)") : "?" }))); });
        memEl.textContent = "";
        if (last && last.fmt === "fgets" && last.ok && typeof last.value === "string") {
          // fgets stores its line in a char array: show one box per character, the newline it kept, and the end marker.
          var row = h("div", { class: "la-memrow", role: "list", "aria-label": "Characters stored in the string" });
          var NL = String.fromCharCode(10), BS = String.fromCharCode(92);
          last.value.split("").forEach(function (ch) { row.appendChild(h("span", { class: "la-memcell" + (ch === NL ? " warn" : ""), role: "listitem", "aria-label": ch === NL ? "newline" : ch === " " ? "space" : ch, text: ch === NL ? BS + "n" : ch === " " ? "␣" : ch })); });
          row.appendChild(h("span", { class: "la-memcell end", role: "listitem", "aria-label": "end of string marker", text: BS + "0" }));
          memEl.appendChild(h("div", { class: "la-outlabel", text: "Stored in the string, one box per character  (" + BS + "n = newline, " + BS + "0 = end of string)" })); memEl.appendChild(row);
        }
        noteEl.textContent = "";
        if (!last) noteEl.appendChild(h("p", { class: "la-note", text: "The characters you type wait in a buffer. Each input call takes what it needs and leaves the rest. Press \"Run next input call\" to watch." }));
        else noteEl.appendChild(h("p", { html: api.md("**`" + (last.fmt === "fgets" ? "fgets" : "scanf(\"" + last.fmt + "\")") + "`** → `" + last.call.var + "`.\n" + last.note) }));
        nextBtn.disabled = upto >= d.calls.length; allBtn.disabled = upto >= d.calls.length;
      }
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      api.body.appendChild(codeEl);
      api.body.appendChild(h("div", { class: "la-outlabel", text: "What the user types (edit it and watch what changes)" })); api.body.appendChild(inputBox);
      api.body.appendChild(h("div", { class: "la-outlabel", text: "Input buffer  (↵ = newline, ␣ = space)" })); api.body.appendChild(bufEl);
      api.body.appendChild(h("div", { class: "la-outlabel", text: "Variables" })); api.body.appendChild(varsEl); api.body.appendChild(memEl);
      api.body.appendChild(noteEl);
      api.body.appendChild(api.actions(nextBtn, allBtn, resetBtn, sw));
      if (d.explanation) api.body.appendChild(h("p", { class: "la-note", html: api.md(d.explanation) }));
      paint();
    },
  });
  CL.simulateBuffer = simulate;

  // ---------------------------------------------------------------- bits
  var W = 8;
  function bitsOf(n) { var a = []; for (var i = W - 1; i >= 0; i--) a.push((n >> i) & 1); return a; }
  function toNum(arr) { return arr.reduce(function (s, b) { return s * 2 + b; }, 0); }

  CL.kind("bits", {
    required: ["mode"],
    check: function (d) { return ["ops", "not", "shift", "parity"].indexOf(d.mode) < 0 ? ["mode must be ops, not, shift or parity"] : []; },
    render: function (d, api) {
      var tick = interactions(api, 4);
      var A = (d.a === undefined ? 5 : d.a) & 255, B = (d.b === undefined ? 3 : d.b) & 255, op = (d.ops && d.ops[0]) || "&", sh = d.shift === undefined ? 1 : d.shift, dir = "<<";
      var host = h("div", { class: "la-bits" });
      function row(label, val, onFlip) {
        var line = h("div", { class: "la-bitrow" }, h("span", { class: "la-bitlabel", text: label }));
        var cells = h("span", { class: "la-bitcells" });
        bitsOf(val).forEach(function (b, i) {
          var pos = W - 1 - i;
          var el = onFlip ? h("button", { type: "button", role: "switch", "aria-checked": String(!!b), "aria-label": label + " bit " + pos + " is " + b + ". Press to flip.", class: "la-bit" + (b ? " on" : ""), text: String(b), onclick: function () { onFlip(pos); tick(); paint(); } }) : h("span", { class: "la-bit ro" + (b ? " on" : ""), text: String(b), "aria-label": "bit " + pos + " is " + b });
          cells.appendChild(el);
        });
        line.appendChild(cells); line.appendChild(h("span", { class: "la-bitdec", text: "= " + val }));
        return line;
      }
      function paint() {
        host.textContent = "";
        if (d.mode === "ops") {
          var sel = h("select", { class: "la-select inline", "aria-label": "Operator", onchange: function () { op = this.value; tick(); paint(); } });
          (d.ops || ["&", "|", "^"]).forEach(function (o) { var opt = h("option", { value: o, text: o }); if (o === op) opt.selected = true; sel.appendChild(opt); });
          host.appendChild(row("A", A, function (p) { A ^= 1 << p; })); host.appendChild(h("div", { class: "la-bitop" }, h("span", { text: "Operator:" }), sel)); host.appendChild(row("B", B, function (p) { B ^= 1 << p; }));
          var R = op === "&" ? A & B : op === "|" ? A | B : A ^ B;
          host.appendChild(row("A " + op + " B", R, null));
          var why = op === "&" ? "1 only where BOTH bits are 1." : op === "|" ? "1 where AT LEAST ONE bit is 1." : "1 where the bits are DIFFERENT.";
          host.appendChild(h("p", { class: "la-note", html: api.md("`" + A + " " + op + " " + B + "` = `" + R + "`. " + why) }));
        } else if (d.mode === "not") {
          host.appendChild(row("A", A, function (p) { A ^= 1 << p; })); host.appendChild(row("~A (8 bits)", (~A) & 255, null));
          host.appendChild(h("p", { class: "la-note", html: api.md("`~` flips every bit. Shown here on 8 bits. In C an `int` has 32 bits, so `~" + A + "` is really `" + (~A) + "`; the decimal depends on the integer size.") }));
        } else if (d.mode === "shift") {
          var dsel = h("select", { class: "la-select inline", "aria-label": "Shift direction", onchange: function () { dir = this.value; tick(); paint(); } });
          [["<<", "Left shift <<"], [">>", "Right shift >>"]].forEach(function (o) { var opt = h("option", { value: o[0], text: o[1] }); if (o[0] === dir) opt.selected = true; dsel.appendChild(opt); });
          var slider = h("input", { type: "range", min: "0", max: "7", value: String(sh), class: "la-range", "aria-label": "Shift by how many places", oninput: function () { sh = +this.value; tick(); paint(); } });
          host.appendChild(row("A", A, function (p) { A ^= 1 << p; }));
          host.appendChild(h("div", { class: "la-bitop" }, dsel, h("label", { class: "la-slider" }, h("span", { text: "by " + sh + " place" + (sh === 1 ? "" : "s") }), slider)));
          var S = dir === "<<" ? (A << sh) & 255 : A >> sh;
          host.appendChild(row("A " + dir + " " + sh, S, null));
          host.appendChild(h("p", { class: "la-note", html: api.md(dir === "<<" ? "Each step left multiplies by 2 (as long as no 1 falls off the end): `" + A + " << " + sh + "` = `" + S + "`." : "Each step right divides by 2 and drops the remainder: `" + A + " >> " + sh + "` = `" + S + "`.") }));
        } else {
          var inp = h("input", { type: "number", min: "0", max: "255", value: String(A), class: "la-input la-num", "aria-label": "Number from 0 to 255", oninput: function () { var v = parseInt(this.value, 10); if (isNaN(v)) return; A = Math.max(0, Math.min(255, v)); tick(); paintRows(); } });
          var out = h("div");
          host.appendChild(h("label", { class: "la-slider" }, h("span", { text: "n = " }), inp)); host.appendChild(out);
          function paintRows() { out.textContent = ""; out.appendChild(row("n", A, function (p) { A ^= 1 << p; inp.value = String(A); paintRows(); })); out.appendChild(row("n & 1", A & 1, null)); out.appendChild(h("p", { class: "la-note", html: api.md("The last bit is `" + (A & 1) + "`, so `" + A + " & 1` = `" + (A & 1) + "`: " + ((A & 1) ? "**odd**" : "**even**") + ".") })); }
          paintRows();
        }
      }
      paint();
      api.body.appendChild(host);
      if (d.explanation) api.body.appendChild(h("p", { class: "la-note", html: api.md(d.explanation) }));
    },
  });

  // ----------------------------------------------------------- evalorder
  function collectOps(n, out) {
    if (!n || typeof n !== "object") return;
    if (n.t === "bin") { collectOps(n.l, out); collectOps(n.r, out); out.push(n); }
    else if (n.t === "un") { collectOps(n.e, out); out.push(n); }
    else if (n.t === "cond") { collectOps(n.c, out); collectOps(n.a, out); collectOps(n.b, out); }
  }
  function applyOp(op, a, b) {
    var fl = a.f || b.f, x = a.v, y = b.v, r;
    switch (op) {
      case "+": r = x + y; break; case "-": r = x - y; break; case "*": r = x * y; break;
      case "/": r = fl ? x / y : Math.trunc(x / y); break; case "%": r = x % y; break;
      case "<": r = +(x < y); fl = false; break; case "<=": r = +(x <= y); fl = false; break; case ">": r = +(x > y); fl = false; break; case ">=": r = +(x >= y); fl = false; break;
      case "==": r = +(x === y); fl = false; break; case "!=": r = +(x !== y); fl = false; break;
      case "&&": r = +(x !== 0 && y !== 0); fl = false; break; case "||": r = +(x !== 0 || y !== 0); fl = false; break;
      case "&": r = x & y; break; case "|": r = x | y; break; case "^": r = x ^ y; break; case "<<": r = x << y; break; case ">>": r = x >> y; break;
      default: throw new Error("unsupported operator " + op);
    }
    return { v: r, f: fl };
  }
  function fmtNum(x) { return x.f ? String(+x.v.toPrecision(12)) : String(x.v); }

  CL.kind("evalorder", {
    required: ["expr"],
    needs: ["interp"],
    check: function (d) {
      var e = [];
      try {
        var I = root.ClickInterp || (typeof require === "function" ? require("./c-interp.js") : null);
        if (I) {
          var n = I.parseExpression(d.expr), ops = []; collectOps(n, ops);
          if (ops.length < 2) e.push("needs at least two operators");
          var vals = d.vars || {};
          (function ev(x) { if (x.t === "bin") { var a = ev(x.l), b = ev(x.r); return applyOp(x.op, a, b); } if (x.t === "un") { var v = ev(x.e); return { v: x.op === "-" ? -v.v : x.op === "!" ? +(v.v === 0) : x.op === "~" ? ~v.v : v.v, f: v.f }; } if (x.t === "num") return { v: x.v, f: x.ty !== "int" }; if (x.t === "id") { if (!(x.name in vals)) throw new Error("unknown name " + x.name); return { v: vals[x.name], f: false }; } throw new Error("unsupported " + x.t); })(n);
        }
      } catch (err) { e.push("expr: " + err.message); }
      return e;
    },
    render: function (d, api) {
      var I = root.ClickInterp, ast = I.parseExpression(d.expr), ops = []; collectOps(ast, ops);
      var vals = d.vars || {}, results = new Map(), log = [], tick = interactions(api, ops.length);
      function valueOf(n) { if (results.has(n)) return results.get(n); if (n.t === "num") return { v: n.v, f: n.ty !== "int" }; if (n.t === "id") return { v: vals[n.name], f: false }; return null; }
      function isReady(n) { return n.t === "bin" ? valueOf(n.l) && valueOf(n.r) : n.t === "un" ? valueOf(n.e) : false; }
      function apply(n) {
        if (n.t === "bin") { var a = valueOf(n.l), b = valueOf(n.r), r = applyOp(n.op, a, b); results.set(n, r); log.push(fmtNum(a) + " " + n.op + " " + fmtNum(b) + " = " + fmtNum(r)); }
        else { var v = valueOf(n.e), r2 = { v: n.op === "-" ? -v.v : n.op === "!" ? +(v.v === 0) : n.op === "~" ? ~v.v : v.v, f: v.f }; results.set(n, r2); log.push(n.op + fmtNum(v) + " = " + fmtNum(r2)); }
      }
      var exprEl = h("div", { class: "la-expr la-mono", role: "group", "aria-label": "Expression. Choose the operator that runs next." });
      var logEl = h("ol", { class: "la-steps", "aria-label": "Steps so far" });
      var fbTop = h("div");
      function whyNot(n) {
        var blockers = []; [n.l, n.r, n.e].forEach(function (c) { if (c && (c.t === "bin" || c.t === "un") && !results.has(c)) blockers.push(c); });
        if (!blockers.length) return "";
        var b = blockers[0], txt = d.expr.slice(b.s, b.en).trim();
        return "`" + n.op + "` cannot run yet: one of its sides, `" + txt + "`, still has to be worked out first" + (n.op !== b.op ? ", because `" + b.op + "` is applied before `" + n.op + "` (higher precedence, or it is in parentheses)." : ".");
      }
      function paint() {
        exprEl.textContent = "";
        var sorted = ops.slice().sort(function (a, b) { return a.opPos - b.opPos; }), pos = 0;
        sorted.forEach(function (n) {
          var oplen = (n.op || "").length;
          exprEl.appendChild(document.createTextNode(d.expr.slice(pos, n.opPos)));
          var done = results.has(n), ready = !done && isReady(n);
          // `text: n.op` already sets the button's whole label; h() ALSO appends any trailing argument as a further child,
          // so passing n.op a second time there doubled the glyph on screen ("+" rendered as "++", "*" as "**").
          exprEl.appendChild(h("button", { type: "button", class: "la-op" + (done ? " done" : ""), disabled: done, "aria-label": "Operator " + n.op + (done ? ", already worked out" : ""), text: n.op, onclick: function () {
            if (isReady(n)) { apply(n); api.clear(); paint(); tick(); if (results.size === ops.length) { api.say("good", "The result is " + fmtNum(results.get(ast)) + ".", api.md(d.explanation || "")); } else api.say("good", "Yes, that one is ready.", "Now pick the next operator."); }
            else { api.say("soft", "Not yet.", api.md(whyNot(n) || "Work out the parts inside first.")); }
          } }));
          pos = n.opPos + oplen;
        });
        exprEl.appendChild(document.createTextNode(d.expr.slice(pos)));
        logEl.textContent = ""; log.forEach(function (l) { logEl.appendChild(h("li", { class: "la-mono", text: l })); });
        if (!log.length) logEl.appendChild(h("li", { class: "la-note", text: "Nothing worked out yet." }));
      }
      var reset = api.btn("Start over", function () { results = new Map(); log = []; api.clear(); paint(); }, true);
      api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question || "Tap the operator that C works out first, then the next, until the value is known.") }));
      api.body.appendChild(exprEl); api.body.appendChild(logEl); api.body.appendChild(api.actions(reset)); paint();
    },
  });

  if (typeof module === "object" && module.exports) module.exports = { simulate: simulate };
})(typeof window !== "undefined" ? window : globalThis);
