/* CLICK glossary: one reusable "tap a word, get a beginner explanation" component used by every chapter.
 *
 *   ClickGlossary.register(entries)        entries: { id: { term, short, explain, example?, mistake?, remember? } }
 *   ClickGlossary.linkify(text)            "A {{variable}} stores a {{value|number}}." -> escaped HTML with tappable terms
 *   ClickGlossary.chips(ids)               "Words to know" row of tappable chips for one slide
 *   ClickGlossary.openEntry(entry, opts)   the bottom sheet / dialog (also used by the Code Explorer for code targets)
 *
 * Opening or closing an entry is only ever a read: it never counts as an answer, never costs a heart, never awards XP and never
 * blocks Continue. Works in Node too (require) so the pure helpers can be unit-tested.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ClickGlossary = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const entries = new Map();

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // Inline `code` and line breaks are the only formatting glossary text needs.
  function rich(text) {
    return esc(text).replace(/`([^`\n]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  }

  function register(map) {
    Object.keys(map || {}).forEach((id) => entries.set(id, Object.assign({ id }, map[id])));
  }
  function clear() { entries.clear(); }
  function get(id) { return entries.get(id) || null; }
  function has(id) { return entries.has(id); }
  function ids() { return [...entries.keys()]; }

  // "{{id}}" or "{{id|shown text}}" inside authored prose. Unknown ids render as plain text so a typo can never break a slide.
  function linkify(text) {
    let out = "", last = 0;
    const src = String(text == null ? "" : text), re = /\{\{([a-z0-9][a-z0-9-]*)(?:\|([^}]*))?\}\}/g;
    let m;
    while ((m = re.exec(src))) {
      out += rich(src.slice(last, m.index));
      const e = entries.get(m[1]), shown = m[2] != null && m[2] !== "" ? m[2] : (e ? e.term : m[1]);
      out += e ? '<button type="button" class="cg-term" data-cg-term="' + esc(m[1]) + '" aria-haspopup="dialog">' + esc(shown) + "</button>" : esc(shown);
      last = re.lastIndex;
    }
    return out + rich(src.slice(last));
  }

  function chips(list) {
    const items = (list || []).map((id) => entries.get(id)).filter(Boolean);
    if (!items.length) return "";
    return '<div class="cg-chips" role="group" aria-label="Words to know on this slide"><span class="cg-chips-label">Words to know</span>' +
      items.map((e) => '<button type="button" class="cg-chip" data-cg-term="' + esc(e.id) + '" aria-haspopup="dialog">' + esc(e.term) + "</button>").join("") + "</div>";
  }

  // ---------------------------------------------------------------- the sheet (browser only)
  let dialog = null, returnFocus = null, onClose = null;

  function ensureDialog() {
    if (dialog && dialog.isConnected) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "cg-sheet";
    dialog.setAttribute("aria-labelledby", "cgTitle");
    dialog.innerHTML = '<div class="cg-sheet-in"><p class="cg-kicker" id="cgKicker"></p><h3 id="cgTitle"></h3><div id="cgBody"></div>' +
      '<div class="cg-related" id="cgRelated" hidden></div><button type="button" class="btn cg-close" id="cgClose" autofocus>Got it</button></div>';
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      const cb = onClose, f = returnFocus; onClose = null; returnFocus = null;
      if (cb) cb();
      if (f && f.isConnected) { try { f.focus({ preventScroll: true }); } catch (e) { /* element gone */ } }
    });
    dialog.querySelector("#cgClose").onclick = () => dialog.close();
    document.body.appendChild(dialog);
    return dialog;
  }

  function section(label, html, cls) { return html ? '<div class="cg-block ' + (cls || "") + '"><b>' + esc(label) + "</b>" + html + "</div>" : ""; }

  // entry: { term|title, short?, explain?, example?, mistake?, remember?, related?: [glossary ids] }
  function openEntry(entry, opts) {
    opts = opts || {};
    const d = ensureDialog();
    d.querySelector("#cgKicker").textContent = opts.kicker || (entry.kicker || "Word to know");
    d.querySelector("#cgTitle").innerHTML = "<code>" + esc(entry.term || entry.title || "") + "</code>";
    d.querySelector("#cgBody").innerHTML =
      (entry.short ? '<p class="cg-short">' + rich(entry.short) + "</p>" : "") +
      (entry.explain ? "<p>" + rich(entry.explain) + "</p>" : "") +
      (entry.example ? '<div class="cg-block"><b>Example</b><pre class="cg-code"><code>' + esc(entry.example) + "</code></pre></div>" : "") +
      section("Watch out", entry.mistake ? "<p>" + rich(entry.mistake) + "</p>" : "", "cg-warn") +
      section("Remember", entry.remember ? "<p>" + rich(entry.remember) + "</p>" : "", "cg-remember");
    const self = String(entry.term || entry.title || "").trim().toLowerCase(); // never offer "related: printf" on the printf sheet
    const rel = (entry.related || []).map((id) => entries.get(id)).filter((e) => e && String(e.term).trim().toLowerCase() !== self), relBox = d.querySelector("#cgRelated");
    relBox.hidden = !rel.length;
    relBox.innerHTML = rel.length ? '<span class="cg-chips-label">Related</span>' + rel.map((e) => '<button type="button" class="cg-chip" data-cg-term="' + esc(e.id) + '">' + esc(e.term) + "</button>").join("") : "";
    // Already open (e.g. tapping a "Related" chip): swap the content in place and keep the original focus/cleanup targets.
    // (Closing and re-opening would let the asynchronous native `close` event fire against the new state.)
    if (!d.open) {
      returnFocus = opts.returnFocus || document.activeElement;
      onClose = opts.onClose || null;
      if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    }
    const body = d.querySelector(".cg-sheet-in"); if (body) body.scrollTop = 0;
  }

  function open(id, opts) { const e = entries.get(id); if (e) openEntry(e, opts); }
  function close() { if (dialog && dialog.open) dialog.close(); }
  function isOpen() { return !!(dialog && dialog.open); }

  if (root.document && root.document.addEventListener) {
    root.document.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-cg-term]");
      if (!t) return;
      e.preventDefault();
      open(t.dataset.cgTerm, { returnFocus: t });
    });
  }

  return { register, clear, get, has, ids, linkify, chips, open, openEntry, close, isOpen, esc, rich };
});
