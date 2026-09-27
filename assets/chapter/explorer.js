/* CLICK Code Explorer: the mandatory first slide of every chapter ("Tap any underlined part of the code").
 *
 * A slide gives the code as ONE string in which each tappable part is wrapped like «id|text»:
 *
 *     int «age|age» = «val|20»;        -> the code is `int age = 20;`, with two tappable parts
 *
 * so a target's position is derived from the text itself and can never drift out of sync with the code if a line is reformatted
 * (no character offsets are stored anywhere). Each id maps to { title, explain, example?, mistake?, terms?: [glossary ids] }.
 *
 *   ClickExplorer.parse(markup)          -> { code, tokens:[{id,text,start,end,line}], problems:[] }   (pure)
 *   ClickExplorer.validate(slide)        -> [error strings]                                            (pure)
 *   ClickExplorer.render(box, slide, o)  builds the accessible code block; o.onProgress({opened,total,done})
 *
 * Opening an explanation is only a read: no hearts, no XP, and it never blocks Continue beyond the slide's own "tap N parts" goal.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ClickExplorer = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const MAX_LINES = 14;   // keep the example small enough to read on a phone
  const MAX_COLS = 44;    // ... and narrow enough to fit a 360px screen without sideways scrolling
  const DEFAULT_MIN_TAPS = 2;

  function parse(markup) {
    const src = String(markup == null ? "" : markup), re = /«([a-z][a-z0-9-]*)\|([^«»]*)»/g;
    const tokens = [], problems = [];
    let code = "", last = 0, m;
    while ((m = re.exec(src))) {
      code += src.slice(last, m.index);
      const start = code.length;
      code += m[2];
      if (m[2] === "") problems.push("empty target text for '" + m[1] + "'");
      if (/\n/.test(m[2])) problems.push("target '" + m[1] + "' spans a line break");
      tokens.push({ id: m[1], text: m[2], start, end: code.length, line: (code.slice(0, start).match(/\n/g) || []).length + 1 });
      last = re.lastIndex;
    }
    code += src.slice(last);
    if (/[«»]/.test(code)) problems.push("unbalanced or nested «» marker in the code");
    return { code, tokens, problems };
  }

  function validate(slide) {
    const errs = [];
    if (!slide || typeof slide.code !== "string" || !slide.code.trim()) return ["explorer slide needs `code`"];
    const p = parse(slide.code);
    p.problems.forEach((x) => errs.push(x));
    const targets = slide.targets || {}, ids = new Set(p.tokens.map((t) => t.id));
    if (!p.tokens.length) errs.push("no tappable parts: wrap them like «id|text»");
    ids.forEach((id) => { if (!targets[id]) errs.push("marker '" + id + "' has no entry in `targets`"); });
    Object.keys(targets).forEach((id) => {
      const t = targets[id];
      if (!ids.has(id)) errs.push("target '" + id + "' is never used in the code");
      if (!t || !String(t.title || "").trim()) errs.push("target '" + id + "' needs a title");
      if (!t || String(t.explain || "").trim().length < 20) errs.push("target '" + id + "' needs a real beginner explanation (`explain`)");
    });
    const lines = p.code.replace(/\s+$/, "").split("\n");
    if (lines.length > MAX_LINES) errs.push("code is " + lines.length + " lines; keep it to " + MAX_LINES + " or fewer");
    lines.forEach((l, i) => { if (l.replace(/\t/g, "  ").length > MAX_COLS) errs.push("line " + (i + 1) + " is " + l.length + " characters; keep lines to " + MAX_COLS + " or fewer so a phone does not scroll sideways"); });
    const mt = slide.minTaps == null ? DEFAULT_MIN_TAPS : slide.minTaps;
    if (!Number.isInteger(mt) || mt < 1 || mt > Math.max(1, ids.size)) errs.push("minTaps must be between 1 and the number of distinct targets (" + ids.size + ")");
    return errs;
  }

  function minTapsFor(slide) {
    const distinct = new Set(parse(slide.code).tokens.map((t) => t.id)).size;
    return Math.min(slide.minTaps == null ? DEFAULT_MIN_TAPS : slide.minTaps, Math.max(1, distinct));
  }

  // ------------------------------------------------------------------ DOM
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function render(box, slide, opts) {
    opts = opts || {};
    const G = opts.glossary || root.ClickGlossary;
    const p = parse(slide.code), targets = slide.targets || {}, opened = new Set(), need = minTapsFor(slide), distinct = new Set(p.tokens.map((t) => t.id)).size;
    box.textContent = "";
    const wrap = el("div", "ce");
    wrap.appendChild(el("p", "ce-hint", slide.prompt || "Tap any underlined part of the code to see what it does."));
    const pre = el("pre", "ce-code"), code = el("code");
    pre.setAttribute("aria-label", "C code. The underlined parts are buttons that explain them.");
    let pos = 0;
    p.tokens.forEach((t) => {
      code.appendChild(document.createTextNode(p.code.slice(pos, t.start)));
      const b = el("button", "ce-target", t.text);
      b.type = "button"; b.dataset.target = t.id;
      b.setAttribute("aria-haspopup", "dialog");
      b.setAttribute("aria-label", "Explain " + t.text + (targets[t.id] && targets[t.id].title && targets[t.id].title !== t.text ? " (" + targets[t.id].title + ")" : ""));
      code.appendChild(b);
      pos = t.end;
    });
    code.appendChild(document.createTextNode(p.code.slice(pos)));
    pre.appendChild(code); wrap.appendChild(pre);
    const prog = el("p", "ce-progress"); prog.setAttribute("aria-live", "polite");
    wrap.appendChild(prog); box.appendChild(wrap);

    function status() {
      const done = opened.size >= need, left = Math.max(0, need - opened.size);
      prog.textContent = done ? "Nice: you explored " + opened.size + " of " + distinct + " parts. Tap more if you like." : "Explored " + opened.size + " of " + need + " needed" + (left === 1 ? " (tap 1 more)" : " (tap " + left + " more)");
      prog.classList.toggle("is-done", done);
      if (opts.onProgress) opts.onProgress({ opened: opened.size, total: distinct, need, done });
    }
    pre.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest(".ce-target");
      if (!b) return;
      const id = b.dataset.target, t = targets[id];
      if (!t || !G) return;
      pre.querySelectorAll(".ce-target").forEach((x) => x.classList.toggle("is-active", x.dataset.target === id));
      opened.add(id); status();
      G.openEntry({ title: t.title, explain: t.explain, example: t.example, mistake: t.mistake, remember: t.remember, related: t.terms, kicker: "About this code" }, {
        returnFocus: b,
        onClose: () => { pre.querySelectorAll(".ce-target.is-active").forEach((x) => x.classList.remove("is-active")); status(); },
      });
      b.classList.add("was-opened");
      pre.querySelectorAll('.ce-target[data-target="' + id + '"]').forEach((x) => x.classList.add("was-opened"));
    });
    status();
    return { opened: () => new Set(opened), need, status };
  }

  return { MAX_LINES, MAX_COLS, DEFAULT_MIN_TAPS, parse, validate, minTapsFor, render };
});
