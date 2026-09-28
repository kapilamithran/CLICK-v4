/*
 * CLICK Learn activity layer - kinds that execute C with the in-browser interpreter.
 *   run         editable code + Run
 *   lab         live experiment: controls change the code, output and executed lines update
 *   trace       step through a program one step at a time
 *   tracetable  fill in the trace table (values derived from a real run)
 *   challenge   write code, Check against tests, hint ladder, solution after an attempt
 *
 * Execution is in a Web Worker with a hard timeout (falls back to the interpreter's own
 * step/time/output limits on the page when workers are unavailable).
 */
(function (root) {
  "use strict";
  var CL = root.ClickLearn;
  if (!CL) throw new Error("engine.js must load before kinds-code.js");
  var h = function () { return CL.ui.h.apply(null, arguments); };
  var script = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : "";
  var BASE = script ? script.replace(/[^/]*$/, "") : "assets/learn/";
  var HARD_TIMEOUT_MS = 3500, MAX_SOURCE_CHARS = 20000;

  function friendlyError(err) {
    if (!err) return "";
    var where = err.line ? " (line " + err.line + ")" : "";
    var head = err.kind === "syntax" ? "Compile error (simulated)" : err.kind === "link" ? "Link error (simulated)" : err.kind === "limit" ? "Stopped" : err.kind === "ub" ? "Undefined behavior in real C" : err.kind === "unsupported" ? "Not supported by this simulator" : "Run-time error";
    return head + where + ": " + err.message;
  }

  // Run C source in a worker; always resolves with an interpreter result object.
  CL.exec = function (code, opts) {
    opts = opts || {};
    // No Worker available: run on the page itself, so use tighter limits to keep the page responsive.
    function direct() { try { return root.ClickInterp.run(code, Object.assign({}, opts, { limits: Object.assign({ steps: 400000, ms: 800 }, opts.limits || {}) })); } catch (e) { return { ok: false, stdout: "", error: { kind: "runtime", message: "The simulator hit an unexpected problem.", line: 0 } }; } }
    return new Promise(function (resolve) {
      if (String(code).length > MAX_SOURCE_CHARS) { resolve({ ok: false, stdout: "", error: { kind: "limit", message: "That program is longer than " + MAX_SOURCE_CHARS.toLocaleString("en-US") + " characters, which is too long for this simulator.", line: 0 }, steps: 0 }); return; }
      if (typeof Worker === "undefined" || typeof document === "undefined") { resolve(direct()); return; }
      var w, done = false, timer;
      function finish(r) { if (done) return; done = true; clearTimeout(timer); try { w.terminate(); } catch (e) { /* already gone */ } resolve(r); }
      try {
        w = new Worker(BASE + "c-interp-worker.js");
        timer = setTimeout(function () { finish({ ok: false, stdout: "", error: { kind: "limit", message: "The program took too long to run, so the simulator stopped it. Check the loop condition.", line: 0 }, steps: 0 }); }, HARD_TIMEOUT_MS);
        w.onmessage = function (e) { finish(e.data); };
        w.onerror = function () { if (!done) { done = true; clearTimeout(timer); try { w.terminate(); } catch (e2) { /* ignore */ } resolve(direct()); } };
        w.postMessage({ code: code, opts: opts });
      } catch (e) { resolve(direct()); }
    });
  };

  // Activities that set `spaces: true` (pattern programs, where alignment is made of spaces) get a "Show spaces as ·" switch on their output.
  function spaceState(d) { if (!d.spaces) return null; var st = { spaces: true, spacesOn: true, onSpaces: function (v) { st.spacesOn = v; } }; return st; }
  function outputView(api, res, label, sp) {
    var box;
    if (res.stdout || res.ok) {
      // A runaway program (for example a recursion with no base case) can print a wall of text; show the start and say so.
      var text = res.stdout || "(the program printed nothing)", MAX_SHOWN = 300, cut = text.length > MAX_SHOWN;
      box = api.outBox(cut ? text.slice(0, MAX_SHOWN).replace(/\S*$/, "").replace(/\s+$/, "") + " …" : text, label, res.stdout ? sp : null);
      if (cut) box.appendChild(h("p", { class: "la-note", text: "The program printed " + text.length + " characters before it stopped. Only the start is shown." }));
    } else box = h("div", { class: "la-outbox" }, h("div", { class: "la-outlabel", text: label || "Output" }));
    if (res.error) box.appendChild(h("div", { class: "la-err", role: "alert", text: friendlyError(res.error) }));
    return box;
  }
  function editor(api, key, initial, rows) {
    var ta = h("textarea", { class: "la-editor la-mono", rows: rows || Math.min(16, Math.max(4, initial.split("\n").length + 1)), spellcheck: "false", autocomplete: "off", autocapitalize: "off", "aria-label": "C code you can edit" });
    ta.value = api.draft.get(key, initial);
    ta.addEventListener("input", function () { api.draft.set(key, ta.value); });
    // Tab indents inside the editor, which would trap a keyboard user (WCAG 2.1.2). Escape releases it: Escape, then Tab, moves on.
    var tabMoves = false;
    ta.setAttribute("aria-description", "Tab indents the code. To leave the editor with the keyboard, press Escape and then Tab.");
    ta.addEventListener("blur", function () { tabMoves = false; });
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { tabMoves = true; return; }
      if (e.key === "Tab" && !e.shiftKey) {
        if (tabMoves) { tabMoves = false; return; }   // let the browser move focus to the next control
        e.preventDefault(); var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; api.draft.set(key, ta.value);
      } else if (e.key !== "Shift" && e.key !== "Tab") tabMoves = false;
    });
    return ta;
  }
  // A button that is disabled while it works loses keyboard focus; give it back once it is usable again (only if focus was there and nothing else took it).
  function keepFocus(had, btn) { if (had && (!document.activeElement || document.activeElement === document.body)) btn.focus({ preventScroll: true }); }
  function editorTip() { return h("p", { class: "la-note la-editor-tip", text: "Keyboard tip: Tab indents your code. To leave the editor, press Esc and then Tab." }); }
  function tasksList(api, tasks) {
    if (!tasks || !tasks.length) return null;
    var ul = h("ul", { class: "la-tasks" }); tasks.forEach(function (t) { ul.appendChild(h("li", { html: api.md(t) })); });
    return h("div", null, h("div", { class: "la-outlabel", text: "Things to try" }), ul);
  }

  // ----------------------------------------------------------------- run
  CL.kind("run", {
    required: ["code"],
    needs: ["interp"],
    render: function (d, api) {
      var ta = editor(api, "code", d.code), stdin = null, outHost = h("div"), sp = spaceState(d);
      if (d.tasks) api.body.appendChild(tasksList(api, d.tasks));
      api.body.appendChild(ta); api.body.appendChild(editorTip());
      if (d.input !== undefined) {
        stdin = h("textarea", { class: "la-input la-mono", rows: 2, "aria-label": "Keyboard input for scanf", spellcheck: "false" }); stdin.value = api.draft.get("stdin", d.input);
        stdin.addEventListener("input", function () { api.draft.set("stdin", stdin.value); });
        api.body.appendChild(h("div", { class: "la-outlabel", text: "Keyboard input (what the user types)" })); api.body.appendChild(stdin);
      }
      var first = null;
      var runBtn = api.btn("Run", function () {
        var had = document.activeElement === runBtn;
        runBtn.disabled = true; runBtn.textContent = "Running…";
        CL.exec(ta.value, { input: stdin ? stdin.value : "" }).then(function (res) {
          runBtn.disabled = false; runBtn.textContent = "Run";
          keepFocus(had, runBtn);
          outHost.textContent = ""; outHost.appendChild(outputView(api, res, null, sp));
          if (first === null && res.ok) first = res.stdout;
          if (!res.ok) { api.say("soft", "The program did not run.", "Read the message above. It names the line to look at."); return; }
          var g = d.goal, ok = true;
          if (g) ok = g.contains !== undefined ? res.stdout.indexOf(g.contains) >= 0 : g.equals !== undefined ? api.normOut(res.stdout) === api.normOut(g.equals) : g.changed ? first !== null && res.stdout !== d.initialOutput : true;
          if (g && !ok) { api.say("info", "Ran fine, but not the goal yet.", api.md(d.goalHint || "Change the code and run it again.")); return; }
          api.say("good", g ? "That reached the goal." : "It ran.", api.md(d.explanation || "Change something and run it again to see what changes.")); api.done();
        });
      });
      var reset = api.btn("Reset code", function () { ta.value = d.code; api.draft.set("code", d.code); if (stdin) { stdin.value = d.input; api.draft.set("stdin", d.input); } outHost.textContent = ""; api.clear(); }, true);
      api.body.appendChild(api.actions(runBtn, reset)); api.body.appendChild(outHost);
    },
  });

  // ----------------------------------------------------------------- lab
  function fillTemplate(tpl, values) { return tpl.replace(/\{\{(\w+)\}\}/g, function (_, k) { return values[k] !== undefined ? values[k] : ""; }); }
  CL.kind("lab", {
    required: ["controls"],
    needs: ["interp"],
    check: function (d) {
      var e = [], tpls = d.variants ? d.variants.map(function (v) { return v.code; }) : [d.code];
      if (!d.variants && !d.code) e.push("needs code or variants");
      var ids = d.controls.map(function (c) { return c.id; });
      tpls.forEach(function (t) { (String(t || "").match(/\{\{(\w+)\}\}/g) || []).forEach(function (m) { var k = m.slice(2, -2); if (ids.indexOf(k) < 0) e.push("template uses {{" + k + "}} but there is no control '" + k + "'"); }); });
      d.controls.forEach(function (c, i) {
        if (["range", "select", "toggle", "number"].indexOf(c.type) < 0) e.push("control " + (i + 1) + " has an unknown type");
        if (c.type === "select" && (!c.options || !c.options.length)) e.push("select control " + c.id + " needs options");
        if (c.type === "range" && !(c.min <= c.max)) e.push("range control " + c.id + " needs min<=max");
        if (c.type === "toggle" && (c.on === undefined || c.off === undefined)) e.push("toggle control " + c.id + " needs on and off");
      });
      return e;
    },
    render: function (d, api) {
      var sp = spaceState(d), values = {}, ctl = h("div", { class: "la-controls" }), results = h("div", { class: "la-labout" }), token = 0, timer = null, changes = 0;
      function init(c) { return c.type === "toggle" ? (c.checked ? c.on : c.off) : c.value; }
      d.controls.forEach(function (c) {
        var saved = api.draft.get("c_" + c.id, undefined); var val = saved !== undefined ? saved : init(c); values[c.id] = val;
        var wrap = h("div", { class: "la-control" }), lab = h("label", { class: "la-controllabel" }), out = h("span", { class: "la-controlval" }), input;
        var id = "la-c-" + d.id.replace(/\W/g, "-") + "-" + c.id;
        lab.setAttribute("for", id); lab.appendChild(h("span", { text: c.label }));
        function show() { out.textContent = c.type === "range" || c.type === "number" ? String(values[c.id]) : ""; }
        if (c.type === "range" || c.type === "number") {
          input = h("input", { type: c.type === "range" ? "range" : "number", id: id, min: String(c.min), max: String(c.max), step: String(c.step || 1), value: String(val), class: c.type === "range" ? "la-range" : "la-input la-num" });
          input.addEventListener("input", function () { var v = input.value === "" ? "" : Number(input.value); if (v === "" || isNaN(v)) return; values[c.id] = String(v); api.draft.set("c_" + c.id, values[c.id]); show(); schedule(); });
          values[c.id] = String(val);
        } else if (c.type === "select") {
          input = h("select", { id: id, class: "la-select" });
          c.options.forEach(function (o) { var op = h("option", { value: o.v, text: o.l }); if (String(o.v) === String(val)) op.selected = true; input.appendChild(op); });
          input.addEventListener("change", function () { values[c.id] = input.value; api.draft.set("c_" + c.id, input.value); schedule(); });
          values[c.id] = String(val);
        } else {
          input = h("input", { type: "checkbox", id: id, role: "switch", class: "la-check" }); input.checked = val === c.on;
          input.addEventListener("change", function () { values[c.id] = input.checked ? c.on : c.off; api.draft.set("c_" + c.id, values[c.id]); schedule(); });
        }
        show(); wrap.appendChild(lab); if (c.type === "range" || c.type === "number") lab.appendChild(out); wrap.appendChild(input);
        if (c.type === "toggle") { var l2 = h("span", { class: "la-switchtext", text: c.label }); wrap.removeChild(lab); wrap.appendChild(h("label", { class: "la-switch", for: id }, input, l2)); }
        ctl.appendChild(wrap);
      });
      // A lab with only a couple of possible settings (one switch, a two-choice dropdown) is done once every setting has been seen;
      // a bigger lab is done after three changes. (Otherwise a one-switch lab could never enable Continue.)
      var totalStates = d.controls.reduce(function (n, c) { return n * (c.type === "toggle" ? 2 : c.type === "select" ? c.options.length : Infinity); }, 1), seen = {};
      function noteState() { seen[JSON.stringify(values)] = 1; }
      noteState();
      function schedule() { changes++; noteState(); clearTimeout(timer); timer = setTimeout(update, 120); if (changes >= 3 || Object.keys(seen).length >= totalStates) api.done(); }
      function update() {
        var my = ++token, variants = d.variants || [{ label: "", code: d.code }];
        Promise.all(variants.map(function (v) { var code = fillTemplate(v.code, values); return CL.exec(code, { trace: !!(d.show && d.show.indexOf("lines") >= 0), input: d.input || "" }).then(function (r) { return { v: v, code: code, r: r }; }); })).then(function (list) {
          if (my !== token) return;
          results.textContent = "";
          var grid = h("div", { class: "la-variants" + (list.length > 1 ? " multi" : "") });
          list.forEach(function (x) {
            var col = h("div", { class: "la-variant" });
            if (x.v.label) col.appendChild(h("div", { class: "la-varlabel", text: x.v.label }));
            var pre = api.codeBlock(x.code, { label: "Program" });
            if (x.r.trace) { var hl = {}; x.r.trace.forEach(function (ev) { hl[ev.line] = 1; }); api.setLines(pre, hl, 0); }
            col.appendChild(pre); col.appendChild(outputView(api, x.r, "Output", sp)); grid.appendChild(col);
          });
          results.appendChild(grid);
          if (d.summary && list[0].r.ok) results.appendChild(h("p", { class: "la-summary", html: api.md(fillTemplate(d.summary, Object.assign({}, values, { out: (list[0].r.stdout.split("\n")[0] || "").trim() }))) }));
        });
      }
      if (d.observe) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.observe) }));
      api.body.appendChild(ctl); api.body.appendChild(results);
      if (d.explanation) api.body.appendChild(h("p", { class: "la-note", html: api.md(d.explanation) }));
      update();
    },
  });

  // --------------------------------------------------------------- trace
  function stepText(ev) {
    if (ev.note) return ev.note;
    if (ev.kind === "decl") return "Run: " + ev.text;
    if (ev.kind === "expr") return "Run: " + ev.text;
    return ev.text || ev.kind;
  }
  // The functions running after the first n trace steps: main at the bottom, every call on top of its caller, taken off again
  // by its return. A call is labelled with the values its parameters received, e.g. count(3).
  function callFrames(trace, n) {
    var stack = [{ name: "main", label: "main()" }];
    for (var k = 0; k < n; k++) {
      var e = trace[k];
      if (e.kind === "call") {
        var name = String(e.text).split("(")[0].trim();
        stack.push({ name: name, label: name + "(" + e.vars.filter(function (v) { return v.scope >= 1; }).map(function (v) { return v.value; }).join(", ") + ")" });
      } else if (e.kind === "return" && stack.length > 1) stack.pop();
    }
    return stack;
  }
  // Optional per-activity extras (off unless the definition asks): scopeColumn adds a Global / Local column to the variable table,
  // callStack lists the calls in progress (so recursion and returns can be seen).
  CL.kind("trace", {
    required: ["code"],
    needs: ["interp"],
    render: function (d, api) {
      var res = null, i = 0, timer = null, playing = false, sp = spaceState(d);
      var codeHost = h("div", { class: "la-codeholder" }), narr = h("div", { class: "la-explain", role: "region", "aria-live": "polite" }), varsHost = h("div", { class: "la-vartable" }), callHost = h("div", { class: "la-callhost" }), outHost = h("div"), counter = h("span", { class: "la-note la-counter" });
      var prev = api.btn("Back", function () { go(i - 1); }, true), next = api.btn("Next step", function () { go(i + 1); }), play = api.btn("Play", function () { togglePlay(); }, true), reset = api.btn("Restart", function () { stop(); go(0); }, true);
      var reduced = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduced) play.hidden = true;
      function stop() { playing = false; clearInterval(timer); play.textContent = "Play"; }
      function togglePlay() { if (playing) { stop(); return; } playing = true; play.textContent = "Pause"; timer = setInterval(function () { if (!go(i + 1)) stop(); }, 900); }
      function go(n) {
        if (!res || n < 0 || n > res.trace.length) return false;
        var before = i; i = n; paint(before); return i < res.trace.length;
      }
      function paint(before) {
        var ev = i === 0 ? null : res.trace[i - 1], prevEv = i <= 1 ? null : res.trace[i - 2];
        codeHost.textContent = ""; var pre = api.codeBlock(d.code, { label: "Program" }); var hl = {}; if (ev) hl[ev.line] = 1; api.setLines(pre, hl, ev ? ev.line : 0); codeHost.appendChild(pre);
        narr.textContent = ""; narr.appendChild(h("p", { html: api.md(ev ? "**Step " + i + ".** " + stepText(ev) : "**Before the program starts.** Press Next step to run the first line.") }));
        if (d.notes && ev && d.notes[ev.line]) narr.appendChild(h("p", { class: "la-note", html: api.md(d.notes[ev.line]) }));
        varsHost.textContent = ""; callHost.textContent = "";
        var vars = ev ? ev.vars : [], prevVars = prevEv ? prevEv.vars : [];
        var frames = d.callStack || d.scopeColumn ? callFrames(res.trace, i) : null;
        if (vars.length) {
          var head = h("tr", null, h("th", { text: "Variable" }), h("th", { text: "Type" }), h("th", { text: "Value" })); if (d.scopeColumn) head.appendChild(h("th", { text: "Where" }));
          var tbl = h("table", { class: "la-table" }, h("thead", null, head));
          var tb = h("tbody"); vars.forEach(function (v) {
            var pv = prevVars.find(function (p) { return p.name === v.name && p.scope === v.scope; });
            var row = h("tr", { class: !pv || pv.value !== v.value ? "chg" : "" }, h("td", null, h("code", { text: v.name })), h("td", { text: v.type }), h("td", null, h("code", { text: v.value })));
            if (d.scopeColumn) row.appendChild(h("td", { text: v.scope === 0 ? "global" : "local in " + frames[frames.length - 1].name + "()" }));
            tb.appendChild(row);
          }); tbl.appendChild(tb); varsHost.appendChild(tbl);
        } else varsHost.appendChild(h("p", { class: "la-note", text: "No variables yet." }));
        if (d.callStack) {
          var ol = h("ol", { class: "la-callstack", "aria-label": "Calls in progress, oldest first" });
          frames.forEach(function (f, k) { ol.appendChild(h("li", { class: k === frames.length - 1 ? "top" : "", text: f.label })); });
          callHost.appendChild(h("div", { class: "la-outlabel", text: "Calls in progress" })); callHost.appendChild(ol);
        }
        outHost.textContent = ""; outHost.appendChild(api.outBox(ev ? res.stdout.slice(0, ev.outLen) : "", "Output so far", sp));
        counter.textContent = "Step " + i + " of " + res.trace.length;
        prev.disabled = i === 0; next.disabled = i >= res.trace.length;
        if (i >= res.trace.length) { api.done(); if (res.error) narr.appendChild(h("div", { class: "la-err", role: "alert", text: friendlyError(res.error) })); else narr.appendChild(h("p", { class: "la-note", text: "The program has finished." })); stop(); }
      }
      api.body.appendChild(h("p", { class: "la-note", text: "Follow the program one step at a time. The highlighted line is the one that just ran." }));
      api.body.appendChild(codeHost); api.body.appendChild(narr); api.body.appendChild(varsHost); api.body.appendChild(callHost); api.body.appendChild(outHost); api.body.appendChild(counter);
      api.body.appendChild(api.actions(prev, next, play, reset));
      next.disabled = prev.disabled = true;
      CL.exec(d.code, { trace: true, input: d.input || "", limits: { trace: 400 } }).then(function (r) {
        if (!r.trace) { api.body.appendChild(h("div", { class: "la-err", text: friendlyError(r.error) || "This example could not be traced." })); return; }
        if (!r.trace.length && r.error) { api.body.appendChild(h("div", { class: "la-err", text: friendlyError(r.error) })); return; }
        res = r; go(0);
      });
    },
  });

  // ---------------------------------------------------------- tracetable
  CL.kind("tracetable", {
    required: ["code", "columns", "fill"],
    needs: ["interp"],
    check: function (d) {
      var e = [], keys = d.columns.map(function (c) { return c.key; });
      d.fill.forEach(function (k) { if (keys.indexOf(k) < 0) e.push("fill column '" + k + "' is not in columns"); });
      d.columns.forEach(function (c, i) { if (["var", "cond", "out"].indexOf(c.kind) < 0) e.push("column " + (i + 1) + " has an unknown kind"); if (c.kind === "var" && !c.var) e.push("var column " + c.key + " needs var"); });
      return e;
    },
    render: function (d, api) {
      var rows = null, cells = [], tblHost = h("div", { class: "la-tablewrap" });
      var check = api.btn("Check", function () {
        if (!rows) return;
        var bad = 0, empty = 0;
        cells.forEach(function (c) {
          var got = c.el.value.trim(); if (!got) empty++;
          var ok = c.kind === "cond" ? got === c.exp : api.norm(got.replace(/\\n/g, " ")) === api.norm(String(c.exp).replace(/\n/g, " "));
          c.el.classList.toggle("ok", ok && !!got); c.el.classList.toggle("no", !ok && !!got); if (!ok) bad++;
        });
        api.state.attempts++;
        if (empty === cells.length) { api.say("info", "Fill in some cells first.", ""); return; }
        if (!bad) { api.say("good", "Every cell is right.", api.md(d.explanation || "")); api.done(); check.disabled = true; showBtn.hidden = true; return; }
        api.say("soft", bad + " cell" + (bad === 1 ? " is" : "s are") + " not right yet.", api.md(d.hint || "Trace the loop one round at a time: check the condition first, then run the body."));
        if (api.state.attempts >= 2) showBtn.hidden = false;
      });
      var showBtn = api.btn("Show the answers", function () { cells.forEach(function (c) { c.el.value = c.kind === "cond" ? c.exp : String(c.exp).replace(/\n/g, " "); c.el.classList.remove("no"); c.el.classList.add("ok"); }); api.say("info", "This is the completed trace.", api.md(d.explanation || "")); check.disabled = true; showBtn.hidden = true; }, true); showBtn.hidden = true;
      var reset = api.btn("Reset", function () { cells.forEach(function (c) { c.el.value = ""; c.el.classList.remove("ok", "no"); }); check.disabled = false; api.state.attempts = 0; showBtn.hidden = true; api.clear(); }, true);
      api.body.appendChild(api.codeBlock(d.code, { label: "Program" }));
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      api.body.appendChild(tblHost); api.body.appendChild(api.actions(check, showBtn, reset));
      CL.exec(d.code, { trace: true, input: d.input || "" }).then(function (r) {
        if (!r.trace) { tblHost.appendChild(h("div", { class: "la-err", text: friendlyError(r.error) })); return; }
        var conds = r.trace.filter(function (ev) { return ev.kind === "cond"; });
        var line = d.loopLine || (conds[0] && conds[0].line); conds = conds.filter(function (ev) { return ev.line === line; });
        rows = conds.map(function (ev, k) {
          var next = r.trace.find(function (e2) { return e2.n > ev.n && e2.kind === "cond" && e2.line === line; });
          var outText = next ? r.stdout.slice(ev.outLen, next.outLen) : r.stdout.slice(ev.outLen, ev.outLen);
          return { ev: ev, out: outText.replace(/\n$/, ""), n: k + 1 };
        });
        var tbl = h("table", { class: "la-table trace" }), thead = h("thead"), hr = h("tr"); hr.appendChild(h("th", { text: "Round" }));
        d.columns.forEach(function (c) { hr.appendChild(h("th", { text: c.label })); }); thead.appendChild(hr); tbl.appendChild(thead);
        var tb = h("tbody");
        rows.forEach(function (row) {
          var tr = h("tr"); tr.appendChild(h("td", { text: String(row.n) }));
          d.columns.forEach(function (c) {
            var exp = c.kind === "var" ? ((row.ev.vars.find(function (v) { return v.name === c.var; }) || {}).value || "") : c.kind === "cond" ? (row.ev.result ? "True" : "False") : row.out;
            var td = h("td");
            if (d.fill.indexOf(c.key) < 0) td.appendChild(h("code", { text: exp === "" ? "—" : exp }));
            else {
              var el = c.kind === "cond" ? h("select", { class: "la-select inline", "aria-label": c.label + ", round " + row.n }, h("option", { value: "", text: "?" }), h("option", { value: "True", text: "True" }), h("option", { value: "False", text: "False" })) : h("input", { type: "text", class: "la-cell", "aria-label": c.label + ", round " + row.n, autocomplete: "off", size: 8 });
              el.addEventListener("input", function () { el.classList.remove("ok", "no"); }); el.addEventListener("change", function () { el.classList.remove("ok", "no"); });
              cells.push({ el: el, kind: c.kind, exp: exp }); td.appendChild(el);
            }
            tr.appendChild(td);
          });
          tb.appendChild(tr);
        });
        tbl.appendChild(tb); tblHost.appendChild(h("div", { class: "la-scroll" }, tbl));
      });
    },
  });

  // ----------------------------------------------------------- challenge
  function firstDiff(exp, got) {
    var a = exp.split("\n"), b = got.split("\n");
    for (var i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] || "") !== (b[i] || "")) return { line: i + 1, exp: a[i] || "(nothing)", got: b[i] === undefined ? "(nothing)" : b[i] };
    return null;
  }
  // Source with comments and string/char literals blanked out, so a keyword only counts when it is really used.
  function stripCode(src) {
    var s = String(src), out = "", i = 0, BS = String.fromCharCode(92), NL = String.fromCharCode(10);
    while (i < s.length) {
      var c = s[i], n = s[i + 1];
      if (c === "/" && n === "/") { while (i < s.length && s[i] !== NL) i++; out += " "; }
      else if (c === "/" && n === "*") { i += 2; while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) i++; i += 2; out += " "; }
      else if (c === '"' || c === "'") { var q = c; i++; while (i < s.length && s[i] !== q && s[i] !== NL) { if (s[i] === BS) i++; i++; } i++; out += q + q; }
      else { out += c; i++; }
    }
    return out;
  }
  // d.uses: [{re, ask}] - constructs the student's code must contain (the output alone can be hard-coded).
  function missingUses(d, code) {
    var clean = stripCode(code);
    return (d.uses || []).filter(function (u) { return !new RegExp(u.re).test(clean); });
  }
  CL.stripCode = stripCode; CL.missingUses = missingUses;
  CL.kind("challenge", {
    required: ["prompt", "starter", "tests", "solution"],
    needs: ["interp"],
    check: function (d) { var e = []; (d.uses || []).forEach(function (u, i) { try { new RegExp(u.re); } catch (x) { e.push("uses " + (i + 1) + " has an invalid pattern"); } if (!u.ask) e.push("uses " + (i + 1) + " needs ask"); }); if (!d.tests.length) e.push("needs tests"); d.tests.forEach(function (t, i) { if (t.expected === undefined) e.push("test " + (i + 1) + " needs expected"); }); return e; },
    render: function (d, api) {
      var hintsShown = 0, solved = false;
      api.body.appendChild(h("p", { class: "la-q", html: api.md(d.prompt) }));
      var ta = editor(api, "code", d.starter, Math.max(6, d.starter.split("\n").length + 2));
      var hintEl = h("div", { class: "la-hints" }), resHost = h("div"), solHost = h("div");
      function reveal() {
        if (typeof root.learnRevealSpoiler === "function") root.learnRevealSpoiler(d.chapter, d.page);
        if (!solHost.firstChild) { solHost.appendChild(h("div", { class: "la-outlabel", text: "One way to solve it" })); solHost.appendChild(api.codeBlock(d.solution, { label: "Solution" })); if (d.solutionExplain) solHost.appendChild(h("p", { html: api.md(d.solutionExplain) })); }
      }
      var check = api.btn("Check my code", function () {
        var had = document.activeElement === check;
        check.disabled = true; check.textContent = "Checking…";
        var i = 0, bad = null, last = null;
        function nextTest() {
          if (i >= d.tests.length) return finish();
          var t = d.tests[i++];
          CL.exec(ta.value, { input: t.input || "" }).then(function (r) { last = r; if (!r.ok) { bad = { err: r.error }; return finish(); } if (api.normOut(r.stdout) !== api.normOut(t.expected)) { bad = { diff: firstDiff(api.normOut(t.expected), api.normOut(r.stdout)), got: r.stdout }; return finish(); } nextTest(); });
        }
        function finish() {
          check.disabled = false; check.textContent = "Check my code"; keepFocus(had, check); api.state.attempts++; resHost.textContent = "";
          var lacking = bad ? [] : missingUses(d, ta.value);
          if (!bad && lacking.length) { resHost.appendChild(api.outBox(last ? last.stdout : "", "Your program's output")); api.say("soft", "The output is right, but not the method yet.", api.md("This challenge asks you to " + lacking.map(function (u) { return u.ask; }).join(" and ") + ". Printing the answer by hand would not help you next time." + String.fromCharCode(10) + "Use a hint if you are stuck. You can also open the solution any time.")); return; }
          if (!bad) { solved = true; resHost.appendChild(api.outBox(last ? last.stdout : "", "Your program's output")); api.say("good", "You solved it.", api.md((d.explanation || "Your program printed exactly what the challenge asked for.") + "\nThe worked solution is now open below.")); api.done(); reveal(); return; }
          if (bad.err) { resHost.appendChild(h("div", { class: "la-err", role: "alert", text: friendlyError(bad.err) })); api.say("soft", "Your code did not run yet.", api.md("Fix the message above, then check again.")); return; }
          resHost.appendChild(api.outBox(bad.got, "Your program's output"));
          api.say("soft", "Close, but not yet.", api.md("Line " + bad.diff.line + " of the output should be `" + bad.diff.exp + "` but yours is `" + bad.diff.got + "`.\nUse a hint if you are stuck. You can also open the solution any time."));
        }
        nextTest();
      });
      var hintBtn = api.btn("Give me a hint", function () { if (hintsShown < (d.hints || []).length) { hintEl.appendChild(h("p", { class: "la-hint", html: api.md("**Hint " + (hintsShown + 1) + ":** " + d.hints[hintsShown]) })); hintsShown++; } if (hintsShown >= (d.hints || []).length) hintBtn.disabled = true; }, true);
      if (!(d.hints && d.hints.length)) hintBtn.hidden = true;
      var showBtn = api.btn("Show the solution", function () { reveal(); api.say("info", "Here is one way to do it.", api.md(d.explanation || "Compare it with your own code.")); }, true);
      var reset = api.btn("Reset", function () { ta.value = d.starter; api.draft.set("code", d.starter); resHost.textContent = ""; api.clear(); }, true);
      api.body.appendChild(ta); api.body.appendChild(editorTip()); api.body.appendChild(api.actions(check, hintBtn, showBtn, reset)); api.body.appendChild(hintEl); api.body.appendChild(resHost); api.body.appendChild(solHost);
    },
  });

  CL.friendlyError = friendlyError;
  CL.fillTemplate = fillTemplate;
  if (typeof module === "object" && module.exports) module.exports = { fillTemplate: fillTemplate };
})(typeof window !== "undefined" ? window : globalThis);
