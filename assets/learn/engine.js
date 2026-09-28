/*
 * CLICK Learn activity layer - engine + Phase 1 component kinds.
 *
 * The existing Learn pages stay the source of truth. Activities are configuration
 * (assets/learn/defs/*.js) that this engine draws underneath the page text, keyed by
 * chapter + page. Nothing here touches XP, hearts, progress, Take Test or Next/Back.
 *
 * Kinds in this file need no code execution:
 *   mcq, predict, fill, order, error, assign, builder, reveal
 * More kinds: kinds-visual.js (pipeline, buffer, bits, evalorder) and
 *             kinds-code.js   (run, lab, trace, tracetable, challenge - use c-interp.js)
 *
 * See assets/learn/README.md for the activity data model.
 */
(function (root) {
  "use strict";
  var CL = (root.ClickLearn = root.ClickLearn || {});
  if (CL.engineLoaded) return;
  CL.engineLoaded = true;
  CL.version = "1.0.0";
  CL.defs = new Map();
  CL.kinds = {};
  CL.invalid = [];
  var byPage = {};

  // ---------------------------------------------------------------- helpers
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // Tiny markup for authored text: **bold**, `code`, newline -> <br>. Everything else is escaped.
  function md(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) for (var k in props) {
      var v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    }
    return el;
  }
  function hash(str) { var x = 2166136261; for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function shuffled(arr, seed) {
    var a = arr.slice(), s = seed >>> 0 || 1;
    for (var i = a.length - 1; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; var j = s % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  // Normalise typed code/text for comparison: trim, unify newlines, collapse runs of spaces.
  function norm(s) { return String(s == null ? "" : s).replace(/\r/g, "").split("\n").map(function (l) { return l.replace(/\s+/g, " ").trim(); }).join("\n").trim(); }
  function normOut(s) { return String(s == null ? "" : s).replace(/\r/g, "").split("\n").map(function (l) { return l.replace(/\s+$/, ""); }).join("\n").replace(/\n+$/, ""); }
  function pick(id) { return document.getElementById(id); }
  // Typed C lines: ignore spacing around punctuation ("int a=1;" equals "int a = 1;") but keep word spaces.
  function codeNorm(s) { return String(s == null ? "" : s).replace(/\s*([=;,(){}<>+\-*\/%&|^!?:])\s*/g, "$1").replace(/\s+/g, " ").trim(); }

  function codeBlock(text, opts) {
    opts = opts || {};
    var pre = h("pre", { class: "la-code" + (opts.numbers === false ? " nonum" : ""), tabindex: "0", "aria-label": opts.label || "Code" });
    var lines = String(text).replace(/\n+$/, "").split("\n");
    lines.forEach(function (ln, i) {
      var line = h("span", { class: "l", "data-n": i + 1, "data-line": i + 1 });
      // A hyphen is a legal place to break a line, so on a phone `i--` could wrap as `i-` / `-)`. Operators made of a hyphen stay in one piece.
      (ln.length ? ln.split(/(--|->|-=)/) : [" "]).forEach(function (part, k) {
        if (!part) return;
        if (k % 2) line.appendChild(h("span", { class: "la-nb", text: part })); else line.appendChild(document.createTextNode(part));
      });
      pre.appendChild(line);
    });
    return pre;
  }
  function setLines(pre, hl, cur) {
    var spans = pre.querySelectorAll(".l");
    for (var i = 0; i < spans.length; i++) {
      var n = i + 1;
      spans[i].classList.toggle("hl", !!(hl && hl[n]));
      spans[i].classList.toggle("cur", cur === n);
    }
  }
  // opts (optional, used by activities that set `spaces: true`): { spacesOn, onSpaces } adds a "Show spaces" switch. With it on, every space is
  // drawn as a dot over the real space character (the space is still there, so copying and screen readers are unchanged).
  function outBox(text, label, opts) {
    var t = text == null ? "" : String(text), pre = h("pre", { class: "la-out" });
    if (opts && opts.spaces) {
      var buf = "";
      for (var i = 0; i < t.length; i++) {
        if (t.charAt(i) === " ") { if (buf) { pre.appendChild(document.createTextNode(buf)); buf = ""; } pre.appendChild(h("span", { class: "la-sp", text: " " })); }
        else buf += t.charAt(i);
      }
      if (buf) pre.appendChild(document.createTextNode(buf));
    } else pre.textContent = t;
    var b = h("div", { class: "la-outbox" }, h("div", { class: "la-outlabel", text: label || "Output" }));
    if (opts && opts.spaces) {
      var on = opts.spacesOn !== false, id = "la-sp-" + Math.random().toString(36).slice(2, 9), cb = h("input", { type: "checkbox", id: id, class: "la-check", role: "switch" });
      cb.checked = on; b.classList.toggle("la-showsp", on);
      cb.addEventListener("change", function () { b.classList.toggle("la-showsp", cb.checked); if (opts.onSpaces) opts.onSpaces(cb.checked); });
      b.appendChild(h("label", { class: "la-spacetoggle", for: id }, cb, h("span", { text: "Show spaces as ·" })));
    }
    b.appendChild(pre);
    return b;
  }

  // ------------------------------------------------------------- persistence
  var memory = {};
  function storeKey() { return "click_learn_activity_v1:" + (CL.userId || "anon"); }
  function readStore() { try { return JSON.parse(localStorage.getItem(storeKey()) || "{}") || {}; } catch (e) { return {}; } }
  function isDone(id) { return !!(readStore()[id] && readStore()[id].done); }
  function markDone(id) { try { var s = readStore(); if (!s[id]) s[id] = {}; s[id].done = 1; s[id].at = Date.now(); localStorage.setItem(storeKey(), JSON.stringify(s)); } catch (e) { /* storage unavailable: progress is simply not remembered */ } }

  // --------------------------------------------------------------- registry
  var COMMON_REQUIRED = ["id", "stage", "chapter", "page", "heading", "kind", "title"];
  CL.kind = function (name, spec) { CL.kinds[name] = spec; };
  CL.validate = function (d, kinds) {
    var errs = [], K = kinds || CL.kinds;
    if (!d || typeof d !== "object") return ["definition is not an object"];
    COMMON_REQUIRED.forEach(function (k) { if (d[k] === undefined || d[k] === "") errs.push("missing " + k); });
    if (d.page !== undefined && !(Number.isInteger(d.page) && d.page >= 1)) errs.push("page must be a positive integer");
    if (d.id && !/^CH\d{4}\.p\d+\.[a-z0-9-]+$/.test(d.id)) errs.push("id must look like CH0035.p4.sort-types");
    if (d.id && d.chapter && d.page && d.id.indexOf(d.chapter + ".p" + d.page + ".") !== 0) errs.push("id must start with chapter.pPage.");
    var spec = K[d.kind];
    if (!spec) errs.push("unknown kind '" + d.kind + "'");
    else {
      (spec.required || []).forEach(function (k) { if (d[k] === undefined) errs.push("kind " + d.kind + " needs '" + k + "'"); });
      if (spec.check) { try { (spec.check(d) || []).forEach(function (e) { errs.push(e); }); } catch (e) { errs.push("check failed: " + e.message); } }
    }
    return errs;
  };
  CL.define = function (list) {
    (Array.isArray(list) ? list : [list]).forEach(function (d) {
      if (CL.defs.has(d && d.id)) { CL.invalid.push({ id: d.id, errs: ["duplicate id"] }); return; }
      // A kind that is not loaded yet (for example the interpreter kinds on a page that does not
      // need them) is validated later, when the activity is actually mounted.
      var known = !!CL.kinds[d && d.kind];
      var errs = known ? CL.validate(d) : COMMON_REQUIRED.filter(function (k) { return !d || d[k] === undefined || d[k] === ""; }).map(function (k) { return "missing " + k; });
      if (errs.length) { CL.invalid.push({ id: d && d.id, errs: errs }); if (root.console) console.warn("[learn-activity] skipped " + (d && d.id) + ": " + errs.join("; ")); return; }
      CL.defs.set(d.id, d);
      var key = d.chapter + ":" + d.page;
      (byPage[key] = byPage[key] || []).push(d);
    });
  };
  CL.forPage = function (chapter, page) { return byPage[chapter + ":" + page] || []; };

  // ----------------------------------------------------------- activity shell
  var KIND_LABEL = { mcq: "Concept check", predict: "Predict the output", fill: "Fill in the code", order: "Build it in order", error: "Spot the mistake", assign: "Match and sort", builder: "Build the statement", reveal: "Explore", pipeline: "Watch it happen", buffer: "Input simulator", bits: "Bit lab", evalorder: "What runs first?", run: "Try it", lab: "Experiment", trace: "Step through", tracetable: "Fill in the trace", challenge: "Challenge" };

  function makeApi(def, body, fb, headTick, onDone) {
    var st = (memory[def.id] = memory[def.id] || { attempts: 0, draft: {} });
    var api = {
      def: def, body: body, fb: fb, h: h, md: md, esc: esc, codeBlock: codeBlock, setLines: setLines, outBox: outBox, norm: norm, normOut: normOut, shuffled: shuffled, hash: hash,
      state: st,
      say: function (type, title, html) {
        fb.className = "la-feedback show " + type;
        fb.innerHTML = "";
        if (title) fb.appendChild(h("b", { class: "la-fbtitle", html: md(title) }));
        if (html) fb.appendChild(h("div", { class: "la-fbbody", html: html }));
      },
      clear: function () { fb.className = "la-feedback"; fb.innerHTML = ""; },
      done: function () { markDone(def.id); headTick.hidden = false; if (onDone) { var f = onDone; onDone = null; f(def); } },
      draft: {
        get: function (k, d) { return st.draft[k] !== undefined ? st.draft[k] : d; },
        set: function (k, v) { st.draft[k] = v; },
      },
      actions: function () {
        var row = h("div", { class: "la-actions" });
        for (var i = 0; i < arguments.length; i++) if (arguments[i]) row.appendChild(arguments[i]);
        return row;
      },
      btn: function (label, onclick, ghost, attrs) {
        return h("button", Object.assign({ type: "button", class: "btn" + (ghost ? " ghost" : ""), onclick: onclick, text: label }, attrs || {}));
      },
    };
    return api;
  }

  function renderActivity(def, onDone) {
    var spec = CL.kinds[def.kind];
    var tick = h("span", { class: "la-done", title: "You have completed this before", "aria-label": "Completed before" }, "✓");
    tick.hidden = !isDone(def.id);
    var tid = "la-t-" + def.id.replace(/\./g, "-");
    var head = h("header", { class: "la-head" }, h("span", { class: "la-badge", text: KIND_LABEL[def.kind] || def.kind }), h("h4", { class: "la-title", id: tid, text: def.title }), tick);
    var body = h("div", { class: "la-body" });
    var fb = h("div", { class: "la-feedback", role: "status", "aria-live": "polite" });
    var sec = h("section", { class: "la la-k-" + def.kind, "aria-labelledby": tid, "data-activity": def.id, "data-kind": def.kind }, head);
    if (def.intro) sec.appendChild(h("p", { class: "la-intro", html: md(def.intro) }));
    sec.appendChild(body); sec.appendChild(fb);
    var api = makeApi(def, body, fb, tick, onDone);
    try { spec.render(def, api); }
    catch (e) {
      body.innerHTML = ""; body.appendChild(h("p", { class: "la-intro", text: "This activity could not load. You can keep learning without it." }));
      if (root.console) console.warn("[learn-activity] " + def.id + " failed to render", e);
    }
    return sec;
  }

  // Draw every activity configured for this chapter page into `container`.
  CL.mountPage = function (container, ctx) {
    if (ctx && ctx.userId) CL.userId = ctx.userId;
    var list = CL.forPage(ctx.chapter, ctx.page).filter(function (d) {
      if (d.stage !== ctx.stage || norm(d.heading) !== norm(ctx.heading || d.heading)) return false;
      if (!CL.kinds[d.kind]) return false;
      var errs = CL.validate(d);
      if (errs.length) { if (root.console) console.warn("[learn-activity] skipped " + d.id + ": " + errs.join("; ")); return false; }
      return true;
    });
    var drifted = CL.forPage(ctx.chapter, ctx.page).length - list.length;
    if (drifted && root.console) console.warn("[learn-activity] " + drifted + " activity(ies) skipped on " + ctx.chapter + " page " + ctx.page + ": the page heading no longer matches the activity's heading.");
    container.textContent = "";
    if (!list.length) { container.hidden = true; return 0; }
    container.hidden = false;
    var wrap = h("div", { class: "la-wrap" },
      h("div", { class: "la-wraphead" }, h("b", { text: "Try it yourself" }), h("span", { class: "la-note", text: "Optional. No hearts, no XP. You can skip this and keep going." })));
    list.forEach(function (d) { wrap.appendChild(renderActivity(d)); });
    container.appendChild(wrap);
    return list.length;
  };

  // Draw ONE activity, chosen by id, into `container` (the unified chapter run mounts the activities a chapter deck names).
  // There is no page-heading guard here: the deck names the activity explicitly, so it cannot land on the wrong page.
  // opts: { userId, onDone(def) }  -> onDone fires once, when the student completes it. Each mount starts with a clean attempt counter.
  CL.mountActivity = function (container, id, opts) {
    opts = opts || {};
    if (opts.userId) CL.userId = opts.userId;
    container.textContent = "";
    var d = CL.defs.get(id);
    if (!d || !CL.kinds[d.kind]) return null;
    var errs = CL.validate(d);
    if (errs.length) { if (root.console) console.warn("[learn-activity] skipped " + id + ": " + errs.join("; ")); return null; }
    delete memory[d.id];
    var sec = renderActivity(d, opts.onDone);
    container.appendChild(sec);
    return sec;
  };

  // ---------------------------------------------------------- kind: mcq
  function attemptsGate(api, max) { return api.state.attempts >= (max || 2); }

  CL.kind("mcq", {
    required: ["question", "choices"],
    check: function (d) {
      var e = [], c = d.choices || [];
      if (c.length < 2) e.push("needs at least 2 choices");
      if (c.filter(function (x) { return x.correct; }).length !== 1) e.push("needs exactly one correct choice");
      return e;
    },
    render: function (d, api) {
      var sel = api.draft.get("sel", -1), locked = false;
      api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      if (d.code) api.body.appendChild(api.codeBlock(d.code));
      var group = h("div", { class: "la-choices", role: "radiogroup", "aria-label": "Answer choices" });
      var btns = d.choices.map(function (c, i) {
        var b = h("button", { type: "button", role: "radio", "aria-checked": "false", class: "la-choice", html: api.md(c.text), onclick: function () { if (locked) return; sel = i; api.draft.set("sel", i); paint(); } });
        group.appendChild(b); return b;
      });
      function paint() { btns.forEach(function (b, i) { b.setAttribute("aria-checked", String(i === sel)); b.classList.toggle("sel", i === sel); }); }
      paint();
      var check = api.btn("Check", function () {
        if (sel < 0) { api.say("info", "Pick an answer first.", ""); return; }
        api.state.attempts++;
        var c = d.choices[sel];
        if (c.correct) {
          locked = true; btns[sel].classList.add("ok"); api.say("good", "Correct.", api.md((c.why || "") + (d.explanation ? "\n" + d.explanation : ""))); api.done(); check.disabled = true; reveal.hidden = true;
        } else {
          btns[sel].classList.add("no"); btns[sel].disabled = true;
          api.say("soft", "Not quite.", api.md((c.why || "Look at the question again and compare each option with the page above.") + (attemptsGate(api) ? "" : "\nTry another option.")));
          if (attemptsGate(api)) reveal.hidden = false;
          sel = -1; paint();
        }
      });
      var reveal = api.btn("Show me the answer", function () {
        var i = d.choices.findIndex(function (c) { return c.correct; });
        locked = true; btns[i].classList.add("ok"); api.say("info", "The answer is: " + d.choices[i].text, api.md((d.choices[i].why || "") + (d.explanation ? "\n" + d.explanation : ""))); check.disabled = true; reveal.hidden = true;
      }, true); reveal.hidden = true;
      var reset = api.btn("Try again", function () { locked = false; sel = -1; api.state.attempts = 0; api.draft.set("sel", -1); btns.forEach(function (b) { b.disabled = false; b.classList.remove("ok", "no"); }); check.disabled = false; reveal.hidden = true; api.clear(); paint(); }, true);
      api.body.appendChild(group); api.body.appendChild(api.actions(check, reveal, reset));
    },
  });

  // ------------------------------------------------------- kind: predict
  CL.kind("predict", {
    required: ["code", "expected"],
    check: function (d) {
      var e = [];
      if (d.choices) {
        if (d.choices.length < 2) e.push("needs at least 2 choices");
        if (d.choices.indexOf(d.expected) < 0) e.push("choices must include the expected output");
        if (new Set(d.choices).size !== d.choices.length) e.push("choices must be distinct");
      } else if (!d.typed) e.push("needs either choices or typed:true");
      return e;
    },
    render: function (d, api) {
      api.body.appendChild(api.codeBlock(d.code, { label: "Program" }));
      if (d.input) api.body.appendChild(api.outBox(d.input, "Keyboard input"));
      api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question || "What will this program print?") }));
      var sel = api.draft.get("sel", null), ta = null, locked = false, btns = [];
      if (d.choices) {
        var group = h("div", { class: "la-choices", role: "radiogroup", "aria-label": "Possible outputs" });
        btns = d.choices.map(function (c, i) {
          var b = h("button", { type: "button", role: "radio", "aria-checked": "false", class: "la-choice la-mono", onclick: function () { if (locked) return; sel = i; api.draft.set("sel", i); paint(); } }, h("pre", { class: "la-choice-pre", text: c }));
          group.appendChild(b); return b;
        });
        api.body.appendChild(group);
      } else {
        ta = h("textarea", { class: "la-input la-mono", rows: Math.max(2, d.expected.split("\n").length), "aria-label": "Type the output", spellcheck: "false", autocomplete: "off", placeholder: "Type exactly what the program prints" });
        ta.value = api.draft.get("typed", "");
        ta.addEventListener("input", function () { api.draft.set("typed", ta.value); });
        api.body.appendChild(ta);
      }
      function paint() { btns.forEach(function (b, i) { b.setAttribute("aria-checked", String(i === sel)); b.classList.toggle("sel", i === sel); }); }
      paint();
      function showActual() { api.body.querySelectorAll(".la-actual").forEach(function (n) { n.remove(); }); var box = api.outBox(d.expected, "What the program really prints"); box.classList.add("la-actual"); api.body.insertBefore(box, api.body.querySelector(".la-actions")); }
      var check = api.btn("Check", function () {
        var ok, empty;
        if (d.choices) { empty = sel === null || sel < 0; ok = !empty && d.choices[sel] === d.expected; }
        else { empty = !ta.value.trim(); ok = api.normOut(ta.value) === api.normOut(d.expected); }
        if (empty) { api.say("info", "Make a prediction first.", "Predicting before you look is what makes this useful."); return; }
        api.state.attempts++;
        showActual();
        if (ok) { locked = true; api.say("good", "Correct.", api.md(d.explanation || "")); api.done(); check.disabled = true; }
        else { api.say("soft", "Not quite.", api.md((d.hint ? d.hint + "\n" : "") + "Compare your prediction with the real output above, then read the explanation.\n" + (d.explanation || ""))); if (btns.length) { sel = null; paint(); } }
      });
      var reset = api.btn("Try again", function () { locked = false; sel = null; api.draft.set("sel", null); api.state.attempts = 0; if (ta) { ta.value = ""; api.draft.set("typed", ""); } api.body.querySelectorAll(".la-actual").forEach(function (n) { n.remove(); }); check.disabled = false; api.clear(); paint(); }, true);
      api.body.appendChild(api.actions(check, reset));
    },
  });

  // ---------------------------------------------------------- kind: fill
  CL.kind("fill", {
    required: ["code", "blanks"],
    check: function (d) {
      var n = (d.code.match(/___/g) || []).length, e = [];
      if (n !== d.blanks.length) e.push("code has " + n + " blanks (___) but blanks[] has " + d.blanks.length);
      d.blanks.forEach(function (b, i) { if (!b.answers || !b.answers.length) e.push("blank " + (i + 1) + " needs answers[]"); });
      return e;
    },
    render: function (d, api) {
      var pre = h("pre", { class: "la-code nonum la-fill", "aria-label": "Code with blanks" });
      var parts = d.code.split("___"), inputs = [];
      // Typed code lines get one common width (longest answer + slack) so the box does not leak the answer length.
      var codeWidth = d.blanks.reduce(function (m, b) { return b.code ? Math.max(m, (b.answers[0] || "").length + 6) : m; }, 0);
      parts.forEach(function (p, i) {
        pre.appendChild(document.createTextNode(p));
        if (i < d.blanks.length) {
          var b = d.blanks[i];
          var inp = h("input", { type: "text", class: "la-blank", "aria-label": "Blank " + (i + 1) + " of " + d.blanks.length + (b.label ? ": " + b.label : ""), autocomplete: "off", autocapitalize: "off", spellcheck: "false", size: b.code ? codeWidth : Math.max(4, (b.answers[0] || "").length + 1), placeholder: b.placeholder || "" });
          inp.value = api.draft.get("b" + i, "");
          inp.addEventListener("input", function () { api.draft.set("b" + i, inp.value); inp.classList.remove("ok", "no"); });
          inp.addEventListener("keydown", function (e) { if (e.key === "Enter") check.click(); });
          inputs.push(inp); pre.appendChild(inp);
        }
      });
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      api.body.appendChild(pre);
      // Optional per-blank `label` (+ `expects`): a visible key saying what each blank is for, so the learner never has to guess.
      if (d.blanks.some(function (b) { return b.label; })) {
        var key = h("ol", { class: "la-blank-key", "aria-label": "What each blank is for" });
        d.blanks.forEach(function (b, i) { if (b.label) key.appendChild(h("li", null, h("b", { text: "Blank " + (i + 1) + ": " + b.label }), b.expects ? h("span", { html: " – " + api.md(b.expects) }) : null)); });
        api.body.appendChild(key);
      }
      var check = api.btn("Check", function () {
        if (inputs.every(function (i) { return !i.value.trim(); })) { api.say("info", "Type something into the blanks first.", ""); return; }
        api.state.attempts++;
        var wrong = [];
        inputs.forEach(function (inp, i) {
          var b = d.blanks[i], nf = b.code ? codeNorm : api.norm, got = nf(inp.value), ok = b.answers.some(function (a) { return nf(a) === got; });
          inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok); if (!ok) wrong.push(i);
        });
        if (!wrong.length) { api.say("good", "Correct.", api.md(d.explanation || "")); api.done(); check.disabled = true; showBtn.hidden = true; return; }
        var lines = wrong.map(function (i) { return "Blank " + (i + 1) + ": " + (d.blanks[i].hint || "check this part against the page above."); }).join("\n");
        api.say("soft", wrong.length === inputs.length ? "Not quite yet." : "Some blanks are right.", api.md(lines));
        if (api.state.attempts >= 2) showBtn.hidden = false;
      });
      var showBtn = api.btn("Show the answers", function () {
        inputs.forEach(function (inp, i) { inp.value = d.blanks[i].answers[0]; inp.classList.remove("no"); inp.classList.add("ok"); api.draft.set("b" + i, inp.value); });
        api.say("info", "Here is the completed code.", api.md(d.explanation || "")); check.disabled = true; showBtn.hidden = true;
      }, true); showBtn.hidden = true;
      var reset = api.btn("Reset", function () { inputs.forEach(function (inp, i) { inp.value = ""; inp.classList.remove("ok", "no"); api.draft.set("b" + i, ""); }); check.disabled = false; api.state.attempts = 0; showBtn.hidden = true; api.clear(); }, true);
      api.body.appendChild(api.actions(check, showBtn, reset));
    },
  });

  // --------------------------------------------------------- kind: order
  CL.kind("order", {
    required: ["lines"],
    check: function (d) { var e = []; if (d.lines.length < 2) e.push("needs at least 2 lines"); return e; },
    render: function (d, api) {
      var solutions = [d.lines].concat(d.alternatives || []);
      var all = d.lines.concat(d.distractors || []).map(function (t, i) { return { t: t, id: i }; });
      var pool = api.shuffled(all, api.hash(d.id)).slice(), chosen = [];
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      var poolEl = h("div", { class: "la-pool", role: "group", "aria-label": "Available lines" });
      var ansEl = h("ol", { class: "la-answer", "aria-label": "Your program, in order" });
      var hintEl = h("p", { class: "la-note" }, "Tap a line to add it. Tap a line in your program to take it back out.");
      // Every tap rebuilds the buttons, which would drop keyboard focus to the top of the page: hand it to the next useful control.
      function paint(focusAfter) {
        poolEl.textContent = ""; ansEl.textContent = "";
        pool.forEach(function (p) { poolEl.appendChild(h("button", { type: "button", class: "la-piece la-mono", text: p.t, onclick: function () { var at = pool.indexOf(p); pool = pool.filter(function (x) { return x !== p; }); chosen.push(p); paint(pool.length ? { pool: Math.min(at, pool.length - 1) } : { check: true }); } })); });
        chosen.forEach(function (p, i) { ansEl.appendChild(h("li", null, h("button", { type: "button", class: "la-piece placed la-mono", "aria-label": "Line " + (i + 1) + ": " + p.t + ". Remove", text: p.t, onclick: function () { chosen = chosen.filter(function (x) { return x !== p; }); pool.push(p); api.clear(); paint({ pool: pool.length - 1 }); } }))); });
        if (!chosen.length) ansEl.appendChild(h("li", { class: "la-empty", text: "Your program is empty." }));
        check.disabled = false;
        if (focusAfter) { var target = focusAfter.check ? check : poolEl.querySelectorAll("button")[focusAfter.pool]; if (target && target.focus) target.focus({ preventScroll: true }); }
      }
      var check = api.btn("Check", function () {
        if (!chosen.length) { api.say("info", "Add some lines first.", ""); return; }
        api.state.attempts++;
        var seq = chosen.map(function (p) { return p.t; });
        var ok = solutions.some(function (s) { return s.length === seq.length && s.every(function (l, i) { return l === seq[i]; }); });
        if (ok) { api.say("good", "Correct.", api.md(d.explanation || "")); api.done(); check.disabled = true; showBtn.hidden = true; return; }
        var best = 0; solutions.forEach(function (s) { var k = 0; while (k < s.length && k < seq.length && s[k] === seq[k]) k++; best = Math.max(best, k); });
        var msg = best === 0 ? "The first line is not right yet. Think about what a C program needs to do first." : best >= seq.length ? "So far so good, but the program is not finished yet." : "The first " + best + " line" + (best > 1 ? "s are" : " is") + " in place. Line " + (best + 1) + " does not belong there yet.";
        api.say("soft", "Not quite.", api.md(msg + (d.distractors && seq.some(function (l) { return d.distractors.indexOf(l) >= 0; }) ? "\nOne of the lines you used does not belong in this program." : "")));
        if (api.state.attempts >= 2) showBtn.hidden = false;
      });
      var showBtn = api.btn("Show the order", function () { chosen = d.lines.map(function (t) { return all.find(function (a) { return a.t === t; }); }); pool = all.filter(function (a) { return chosen.indexOf(a) < 0; }); paint(); api.say("info", "This is the correct order.", api.md(d.explanation || "")); check.disabled = true; showBtn.hidden = true; }, true); showBtn.hidden = true;
      var reset = api.btn("Reset", function () { pool = api.shuffled(all, api.hash(d.id)).slice(); chosen = []; api.state.attempts = 0; showBtn.hidden = true; api.clear(); paint(); }, true);
      api.body.appendChild(poolEl); api.body.appendChild(ansEl); api.body.appendChild(hintEl); api.body.appendChild(api.actions(check, showBtn, reset));
      paint();
    },
  });

  // --------------------------------------------------------- kind: error
  CL.kind("error", {
    required: ["mode"],
    check: function (d) {
      var e = [];
      if (d.mode === "find") { if (!d.lines || !d.lines.length) e.push("find mode needs lines[]"); if (!(d.bug >= 0 && d.bug < (d.lines || []).length)) e.push("bug must be a valid line index"); if (!d.diagnostic) e.push("needs diagnostic"); if (d.fixed === undefined) e.push("needs fixed (the corrected line)"); }
      else if (d.mode === "toggle") { if (!d.broken || !d.fixed) e.push("toggle mode needs broken and fixed code"); if (!d.diagnostic) e.push("needs diagnostic"); }
      else e.push("mode must be find or toggle");
      return e;
    },
    render: function (d, api) {
      var diag = function (t) { return h("div", { class: "la-diag" }, h("div", { class: "la-outlabel", text: "Simulated compiler message" }), h("pre", { class: "la-out", text: t })); };
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      if (d.mode === "find") {
        var group = h("div", { class: "la-lines", role: "group", "aria-label": "Program lines. Choose the line with the mistake." });
        var locked = false;
        var rows = d.lines.map(function (ln, i) {
          var b = h("button", { type: "button", class: "la-lineBtn", "aria-label": "Line " + (i + 1) + ": " + ln, onclick: function () {
            if (locked) return;
            api.state.attempts++;
            if (i === d.bug) { locked = true; b.classList.add("ok"); api.say("good", "Found it.", api.md("**Message:** " + d.diagnostic + "\n**Fix:** `" + d.fixed + "`\n" + (d.explanation || ""))); api.done(); }
            else { b.classList.add("no"); b.disabled = true; api.say("soft", "That line is fine.", api.md((d.hint || "Read each line slowly and compare it with the rules on the page.") + (api.state.attempts >= 2 ? "" : "\nTry another line."))); if (api.state.attempts >= 2) showBtn.hidden = false; }
          } }, h("span", { class: "n", text: String(i + 1) }), h("code", { text: ln.length ? ln : " " }));
          group.appendChild(b); return b;
        });
        var showBtn = api.btn("Show me", function () { locked = true; rows[d.bug].classList.add("ok"); api.say("info", "The mistake is on line " + (d.bug + 1) + ".", api.md("**Message:** " + d.diagnostic + "\n**Fix:** `" + d.fixed + "`\n" + (d.explanation || ""))); showBtn.hidden = true; }, true); showBtn.hidden = true;
        var reset = api.btn("Reset", function () { locked = false; api.state.attempts = 0; rows.forEach(function (r) { r.classList.remove("ok", "no"); r.disabled = false; }); showBtn.hidden = true; api.clear(); }, true);
        api.body.appendChild(group); api.body.appendChild(api.actions(showBtn, reset));
      } else {
        var fixed = false, pre = api.codeBlock(d.broken), slot = h("div"), holder = h("div", { class: "la-codeholder" }, pre);
        var compile = api.btn("Compile", function () {
          slot.textContent = "";
          if (!fixed) { slot.appendChild(diag(d.diagnostic)); api.say("soft", "The compiler stops here.", api.md(d.explanation || "Read the message: it names the problem. Then press \"Apply the fix\".")); }
          else { slot.appendChild(h("div", { class: "la-diag ok" }, h("div", { class: "la-outlabel", text: "Simulated compiler message" }), h("pre", { class: "la-out", text: "Compiled successfully. No errors." }))); if (d.outputAfterFix !== undefined) slot.appendChild(api.outBox(d.outputAfterFix, "Program output")); api.say("good", "Now it compiles.", api.md(d.fixNote || "The program is valid C again.")); api.done(); }
        });
        var fixBtn = api.btn("Apply the fix", function () { fixed = !fixed; holder.textContent = ""; pre = api.codeBlock(fixed ? d.fixed : d.broken); holder.appendChild(pre); fixBtn.textContent = fixed ? "Break it again" : "Apply the fix"; slot.textContent = ""; api.clear(); }, true);
        api.body.appendChild(holder); api.body.appendChild(api.actions(compile, fixBtn)); api.body.appendChild(slot);
      }
    },
  });

  // -------------------------------------------------------- kind: assign
  CL.kind("assign", {
    required: ["items", "buckets"],
    check: function (d) {
      var e = [], ids = d.buckets.map(function (b) { return b.id; });
      d.items.forEach(function (it, i) { if (ids.indexOf(it.bucket) < 0) e.push("item " + (i + 1) + " has an unknown bucket"); });
      return e;
    },
    render: function (d, api) {
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      var list = h("ul", { class: "la-assign" }), selects = [];
      api.shuffled(d.items.map(function (it, i) { return { it: it, i: i }; }), api.hash(d.id)).forEach(function (o) {
        var sel = h("select", { class: "la-select", "aria-label": "Where does " + o.it.text + " belong?" }, h("option", { value: "", text: "Choose…" }));
        d.buckets.forEach(function (b) { sel.appendChild(h("option", { value: b.id, text: b.label })); });
        sel.value = api.draft.get("s" + o.i, "");
        sel.addEventListener("change", function () { api.draft.set("s" + o.i, sel.value); sel.parentNode.classList.remove("ok", "no"); });
        var li = h("li", { class: "la-assignrow" }, h("code", { class: "la-assigntext", text: o.it.text }), sel);
        selects.push({ sel: sel, li: li, idx: o.i }); list.appendChild(li);
      });
      var check = api.btn("Check", function () {
        if (selects.every(function (s) { return !s.sel.value; })) { api.say("info", "Choose a place for each item first.", ""); return; }
        api.state.attempts++;
        var bad = [];
        selects.forEach(function (s) { var it = d.items[s.idx], ok = s.sel.value === it.bucket; s.li.classList.toggle("ok", ok); s.li.classList.toggle("no", !ok && !!s.sel.value); if (!ok) bad.push(s); });
        if (!bad.length) { api.say("good", "All correct.", api.md(d.explanation || "")); api.done(); check.disabled = true; showBtn.hidden = true; return; }
        api.say("soft", bad.length + " to go.", api.md(bad.filter(function (s) { return s.sel.value; }).map(function (s) { return "`" + d.items[s.idx].text + "`: " + (d.items[s.idx].why || "think again about what this is."); }).join("\n") || "Choose a place for every item."));
        if (api.state.attempts >= 2) showBtn.hidden = false;
      });
      var showBtn = api.btn("Show the answers", function () { selects.forEach(function (s) { s.sel.value = d.items[s.idx].bucket; s.li.classList.remove("no"); s.li.classList.add("ok"); }); api.say("info", "These are the right places.", api.md(d.explanation || "")); check.disabled = true; showBtn.hidden = true; }, true); showBtn.hidden = true;
      var reset = api.btn("Reset", function () { selects.forEach(function (s) { s.sel.value = ""; s.li.classList.remove("ok", "no"); api.draft.set("s" + s.idx, ""); }); check.disabled = false; api.state.attempts = 0; showBtn.hidden = true; api.clear(); }, true);
      api.body.appendChild(list); api.body.appendChild(api.actions(check, showBtn, reset));
    },
  });

  // ------------------------------------------------------- kind: builder
  var NONE = "__none__";   // internal value of a builder option that is deliberately empty
  CL.kind("builder", {
    required: ["template", "slots"],
    check: function (d) {
      var e = [], names = (d.template.match(/\{(\w+)\}/g) || []).map(function (s) { return s.slice(1, -1); });
      names.forEach(function (n) { if (!d.slots[n]) e.push("template uses {" + n + "} but slots has no '" + n + "'"); });
      Object.keys(d.slots).forEach(function (k) { var s = d.slots[k]; if (!s.options || s.options.indexOf(s.answer) < 0) e.push("slot '" + k + "' answer must be one of its options"); });
      return e;
    },
    render: function (d, api) {
      if (d.question) api.body.appendChild(h("p", { class: "la-q", html: api.md(d.question) }));
      var line = h("div", { class: "la-build la-mono", role: "group", "aria-label": "Statement being built" }), sels = {};
      d.template.split(/(\{\w+\})/).forEach(function (part) {
        var m = /^\{(\w+)\}$/.exec(part);
        if (!m) { if (part) line.appendChild(h("span", { class: "la-lit", text: part })); return; }
        var s = d.slots[m[1]];
        var sel = h("select", { class: "la-select inline", "aria-label": s.label || m[1] }, h("option", { value: "", text: s.label || m[1] }));
        // An option of "" means "leave this part out" (for example no cast). Give it a visible label so the dropdown never shows a blank row.
        api.shuffled(s.options, api.hash(d.id + m[1])).forEach(function (o) { sel.appendChild(h("option", { value: o === "" ? NONE : o, text: o === "" ? (s.emptyLabel || "(nothing)") : o })); });
        sel.value = api.draft.get("s_" + m[1], "");
        sel.addEventListener("change", function () { api.draft.set("s_" + m[1], sel.value); sel.classList.remove("ok", "no"); preview(); });
        sels[m[1]] = sel; line.appendChild(sel);
      });
      var prev = h("div", { class: "la-preview" });
      function chosen(k) { return sels[k].value === NONE ? "" : sels[k].value; }
      function preview() { var t = d.template.replace(/\{(\w+)\}/g, function (_, k) { return sels[k].value ? chosen(k) : "…"; }); prev.textContent = ""; prev.appendChild(h("span", { class: "la-outlabel", text: "Your statement" })); prev.appendChild(h("code", { text: t })); }
      preview();
      var check = api.btn("Check", function () {
        if (Object.keys(sels).every(function (k) { return !sels[k].value; })) { api.say("info", "Choose the parts first.", ""); return; }
        api.state.attempts++;
        var wrong = [];
        Object.keys(sels).forEach(function (k) { var ok = chosen(k) === d.slots[k].answer; sels[k].classList.toggle("ok", ok); sels[k].classList.toggle("no", !ok); if (!ok) wrong.push(k); });
        if (!wrong.length) { api.say("good", "That is valid C.", api.md(d.explanation || "")); api.done(); check.disabled = true; return; }
        api.say("soft", "Not quite.", api.md(wrong.map(function (k) { return "**" + (d.slots[k].label || k) + ":** " + (d.slots[k].why || "check this part."); }).join("\n")));
      });
      var reset = api.btn("Reset", function () { Object.keys(sels).forEach(function (k) { sels[k].value = ""; sels[k].classList.remove("ok", "no"); api.draft.set("s_" + k, ""); }); preview(); check.disabled = false; api.clear(); }, true);
      api.body.appendChild(line); api.body.appendChild(prev); api.body.appendChild(api.actions(check, reset));
    },
  });

  // -------------------------------------------------------- kind: reveal
  CL.kind("reveal", {
    required: [],
    check: function (d) {
      var e = [];
      if (!d.code && !d.cards) e.push("needs code+notes or cards");
      if (d.code) { if (!d.notes || !d.notes.length) e.push("needs notes[]"); else d.notes.forEach(function (n, i) { if (d.code.indexOf(n.text) < 0) e.push("note " + (i + 1) + " text is not found in the code"); }); }
      return e;
    },
    render: function (d, api) {
      var opened = {}, total = 0, box = h("div", { class: "la-explain", role: "region", "aria-live": "polite" }, h("p", { class: "la-note", text: d.code ? "Tap any underlined part of the code." : "Open each card." }));
      var prog = h("p", { class: "la-note la-prog" });
      function update() { var n = Object.keys(opened).length; prog.textContent = "Explored " + n + " of " + total; if (n === total) { api.done(); } }
      if (d.code) {
        total = d.notes.length;
        var pre = h("pre", { class: "la-code nonum la-reveal", "aria-label": "Code with explanations" });
        var ranges = [];
        d.notes.forEach(function (n, i) { var at = d.code.indexOf(n.text); if (at >= 0) ranges.push({ s: at, e: at + n.text.length, i: i }); });
        ranges.sort(function (a, b) { return a.s - b.s; });
        var pos = 0;
        ranges.forEach(function (r) {
          if (r.s < pos) return;
          pre.appendChild(document.createTextNode(d.code.slice(pos, r.s)));
          var note = d.notes[r.i];
          pre.appendChild(h("button", { type: "button", class: "la-token", text: note.text, "aria-label": "Explain: " + note.text, onclick: function () {
            opened[r.i] = 1; pre.querySelectorAll(".la-token").forEach(function (t) { t.classList.remove("cur"); }); this.classList.add("cur");
            box.textContent = ""; box.appendChild(h("code", { class: "la-explaincode", text: note.text })); box.appendChild(h("p", { html: api.md(note.note) })); update();
          } }));
          pos = r.e;
        });
        pre.appendChild(document.createTextNode(d.code.slice(pos)));
        api.body.appendChild(pre);
      } else {
        total = d.cards.length;
        var list = h("div", { class: "la-cards" });
        d.cards.forEach(function (c, i) {
          var open = false, cbody = h("div", { class: "la-cardbody", hidden: true, html: api.md(c.body) });
          var b = h("button", { type: "button", class: "la-cardhead", "aria-expanded": "false", onclick: function () { open = !open; b.setAttribute("aria-expanded", String(open)); cbody.hidden = !open; if (open) { opened[i] = 1; update(); } } }, h("span", { text: c.label }));
          list.appendChild(h("div", { class: "la-card" }, b, cbody));
        });
        api.body.appendChild(list);
      }
      api.body.appendChild(box); api.body.appendChild(prog); update();
      if (d.explanation) api.body.appendChild(h("p", { class: "la-note", html: api.md(d.explanation) }));
    },
  });

  // ------------------------------------------------------------- exports
  CL.ui = { codeNorm: codeNorm, h: h, md: md, esc: esc, codeBlock: codeBlock, setLines: setLines, outBox: outBox, norm: norm, normOut: normOut, shuffled: shuffled, hash: hash, pick: pick };
  CL.store = { isDone: isDone, markDone: markDone };
  CL.KIND_LABEL = KIND_LABEL;
  if (typeof module === "object" && module.exports) module.exports = CL;
})(typeof window !== "undefined" ? window : globalThis);
