/* CLICK unified chapter decks.
 *
 * A chapter is no longer "read a lesson, then take a test": it is one short run of 5-10 slides that teaches, practises and assesses
 * at the same time. This file holds the deck data model, its validator (used by the tests and by authors), the planner that merges a
 * deck with the questions the server actually serves for a run, and the lazy loader for one chapter's deck.
 *
 *   ClickChapter.define(deck)                       register a chapter deck (assets/chapter/defs/chNNNN.js calls this)
 *   ClickChapter.validate(deck, ctx)                -> [error strings]   ctx: { questions, served, activities }
 *   ClickChapter.plan(deck, runQuestions)           -> slides in play order (question slides bound to real questions)
 *   ClickChapter.load(chapterId)                    -> Promise<deck>     (lazy: only this chapter's files are downloaded)
 *
 * Slide kinds
 *   explorer  "Tap any underlined part of the code" (always slide 1)       -> ClickExplorer + ClickGlossary
 *   activity  an existing interactive activity from assets/learn (by id)  -> ClickLearn engine, ungraded
 *   question  one of the chapter's real questions (by id)                 -> the existing graded question UI (3 attempts, hearts, XP once)
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ClickChapter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  const MIN_SLIDES = 5, MAX_SLIDES = 10, MAX_TERMS_PER_SLIDE = 4, MAX_ACTIVITIES = 4, MAX_REFERENCES = 3;
  const KINDS = ["explorer", "activity", "question"];
  const decks = new Map();
  const YT = /^https:\/\/(www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}|youtu\.be\/[A-Za-z0-9_-]{11})(&[\w=&%-]*)?$/;

  function define(deck) {
    if (!deck || !deck.chapter) throw new Error("chapter deck needs `chapter`");
    decks.set(deck.chapter, deck);
    return deck;
  }
  function get(chapter) { return decks.get(chapter) || null; }

  const explorer = () => root.ClickExplorer || (typeof require === "function" ? require("./explorer.js") : null);
  const refsIn = (text) => [...String(text || "").matchAll(/\{\{([a-z0-9][a-z0-9-]*)(?:\|[^}]*)?\}\}/g)].map((m) => m[1]);
  const len = (s) => String(s == null ? "" : s).trim().length;

  function validate(deck, ctx) {
    ctx = ctx || {};
    const errs = [], add = (m) => errs.push(m);
    if (!deck || typeof deck !== "object") return ["deck is not an object"];
    if (!/^CH\d{4}$/.test(deck.chapter || "")) add("chapter must look like CH0034");
    if (!/^STG\d{3}$/.test(deck.stage || "")) add("stage must look like STG001");
    if (len(deck.title) < 2) add("missing title");
    if (len(deck.goal) < 20) add("goal: one sentence saying what the student will be able to do (20+ characters)");

    // ---- references: chapter-level, real YouTube links only
    const refs = deck.references;
    if (!Array.isArray(refs) || !refs.length) add("references: at least one YouTube reference is required");
    else {
      if (refs.length > MAX_REFERENCES) add("references: at most " + MAX_REFERENCES);
      const seen = new Set();
      refs.forEach((r, i) => {
        if (!r || !YT.test(String(r.url || ""))) add("references[" + i + "].url must be a YouTube watch link (https://www.youtube.com/watch?v=ID)");
        if (len(r && r.title) < 3) add("references[" + i + "].title missing (use the video's real title)");
        if (len(r && r.channel) < 2) add("references[" + i + "].channel missing (use the video's real channel)");
        if (r && seen.has(r.url)) add("references[" + i + "] duplicates another link");
        if (r) seen.add(r.url);
      });
    }

    // ---- glossary
    const glossary = deck.glossary && typeof deck.glossary === "object" ? deck.glossary : {};
    if (!Object.keys(glossary).length) add("glossary: needs entries (beginner explanations of the words each slide uses)");
    Object.keys(glossary).forEach((id) => {
      const g = glossary[id];
      if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) add("glossary '" + id + "': id must be lowercase letters, digits and dashes");
      if (!g || len(g.term) < 1) add("glossary '" + id + "': missing term");
      if (!g || len(g.short) < 8 || len(g.short) > 140) add("glossary '" + id + "': `short` should be one plain sentence (8-140 characters)");
      if (!g || len(g.explain) < 40 || len(g.explain) > 480) add("glossary '" + id + "': `explain` is the beginner explanation (40-480 characters)");
      if (g && g.example != null && len(g.example) < 2) add("glossary '" + id + "': empty example");
      ["mistake", "remember"].forEach((k) => { if (g && g[k] != null && len(g[k]) < 8) add("glossary '" + id + "': `" + k + "` is too short to help"); });
      (g && g.related || []).forEach((r) => { if (!glossary[r]) add("glossary '" + id + "': related '" + r + "' does not exist"); });
    });

    // ---- slides
    const slides = Array.isArray(deck.slides) ? deck.slides : [];
    if (slides.length < MIN_SLIDES || slides.length > MAX_SLIDES) add("slides: " + slides.length + " found; a chapter has " + MIN_SLIDES + "-" + MAX_SLIDES);
    const usedTerms = new Set(), ids = new Set(), actIds = new Set(), qIds = new Set();
    let activities = 0;
    slides.forEach((s, i) => {
      const at = "slide " + (i + 1) + (s && s.id ? " (" + s.id + ")" : "");
      if (!s || typeof s !== "object") return add(at + ": not an object");
      if (!/^s\d+$/.test(s.id || "")) add(at + ": id must look like s1");
      if (ids.has(s.id)) add(at + ": duplicate id");
      ids.add(s.id);
      if (!KINDS.includes(s.kind)) add(at + ": kind must be one of " + KINDS.join(", "));
      if (i === 0 && s.kind !== "explorer") add(at + ": the first slide of every chapter must be the Code Explorer (kind 'explorer')");
      if (i > 0 && s.kind === "explorer") add(at + ": only slide 1 is a Code Explorer");
      if (len(s.title) < 3 || len(s.title) > 60) add(at + ": title must be 3-60 characters");
      if (len(s.objective) < 15) add(at + ": objective: what the student learns from this slide (15+ characters)");
      const terms = s.glossary || [];
      if (!Array.isArray(terms) || !terms.length) add(at + ": glossary: list the 1-" + MAX_TERMS_PER_SLIDE + " words this slide needs explained");
      if (terms.length > MAX_TERMS_PER_SLIDE) add(at + ": at most " + MAX_TERMS_PER_SLIDE + " glossary terms per slide (keep it contextual, not a giant list)");
      terms.forEach((t) => { if (!glossary[t]) add(at + ": glossary term '" + t + "' is not defined in this chapter's glossary"); usedTerms.add(t); });
      refsIn(s.lead).concat(refsIn(s.takeaway)).forEach((t) => { if (!glossary[t]) add(at + ": {{" + t + "}} in the text is not in the glossary"); usedTerms.add(t); });
      if (s.lead != null && len(s.lead) < 8) add(at + ": lead is too short");

      if (s.kind === "explorer") {
        const ex = explorer();
        if (ex) ex.validate(s).forEach((e) => add(at + ": " + e));
        Object.keys(s.targets || {}).forEach((id) => { ((s.targets[id] || {}).terms || []).forEach((t) => { if (!glossary[t]) add(at + ": target '" + id + "' links to unknown glossary term '" + t + "'"); usedTerms.add(t); }); });
      } else if (s.kind === "activity") {
        activities++;
        if (!s.activity) add(at + ": activity: the id of an existing activity (for example CH0034.p2.build-declaration)");
        else {
          if (actIds.has(s.activity)) add(at + ": activity " + s.activity + " is used twice");
          actIds.add(s.activity);
          if (ctx.activities) {
            const a = ctx.activities[s.activity];
            if (!a) add(at + ": activity '" + s.activity + "' does not exist in assets/learn/defs");
            else if (a.chapter !== deck.chapter) add(at + ": activity " + s.activity + " belongs to " + a.chapter + ", not " + deck.chapter);
          }
        }
      } else if (s.kind === "question") {
        if (!s.question) add(at + ": question: the id of one of this chapter's questions (for example Q000123)");
        else {
          if (qIds.has(s.question)) add(at + ": question " + s.question + " is used twice");
          qIds.add(s.question);
          if (ctx.questions) {
            const q = ctx.questions[s.question];
            if (!q) add(at + ": question '" + s.question + "' does not exist");
            else if (q.chapter_id !== deck.chapter) add(at + ": question " + s.question + " belongs to " + q.chapter_id + ", not " + deck.chapter);
            else if (s.blankLabels != null) {
              const blanks = (String(q.code || "").match(/\{\{\d+\}\}/g) || []).length;
              if (q.type !== "CODE_FILL") add(at + ": blankLabels only applies to a CODE_FILL question");
              else if (!Array.isArray(s.blankLabels) || s.blankLabels.length !== blanks || s.blankLabels.some((t) => len(t) < 2)) add(at + ": blankLabels needs one short label for each of the " + blanks + " blanks");
            }
          }
        }
      }
    });
    if (activities < 1) add("slides: include at least one activity slide (a visual or hands-on interaction), not only questions");
    if (activities > MAX_ACTIVITIES) add("slides: at most " + MAX_ACTIVITIES + " activity slides");
    Object.keys(glossary).forEach((id) => { if (!usedTerms.has(id)) add("glossary '" + id + "' is never used by any slide (remove it or attach it)"); });

    // ---- graded questions: the deck must place EXACTLY the questions the server serves for a run
    if (ctx.served) {
      ctx.served.forEach((q) => { if (!qIds.has(q)) add("question " + q + " is served in a run but the deck has no slide for it"); });
      qIds.forEach((q) => { if (!ctx.served.includes(q)) add("question " + q + " is in the deck but is not among the questions served for this chapter"); });
    }
    return errs;
  }

  // Merge the deck with the questions this run really has. A question the server serves that the deck forgot is appended (a run can
  // only finish once every served question is answered); a deck question the server did not serve is skipped.
  function plan(deck, runQuestions) {
    const byId = new Map((runQuestions || []).map((q) => [q.question_id, q]));
    const used = new Set(), out = [];
    (deck.slides || []).forEach((s) => {
      if (s.kind !== "question") return out.push(s);
      const q = byId.get(s.question);
      if (!q) return;
      used.add(s.question);
      out.push(Object.assign({}, s, { q }));
    });
    (runQuestions || []).forEach((q) => {
      if (used.has(q.question_id)) return;
      out.push({ id: "sx" + (out.length + 1), kind: "question", question: q.question_id, title: "Check yourself", objective: "Use what you just learned.", glossary: [], q });
    });
    return out;
  }

  // Many question explanations in the bank still end in "Refers to: Slide 3" or "Related: Slide 1 & 3" from the old Learn layout. Those
  // slides no longer exist, so such pointers are dropped at display time (the database is untouched). Only a pointer that names a slide
  // is removed. Returns "" when nothing useful is left; the caller then shows the slide's own `takeaway` instead.
  function cleanExplanation(text) {
    return String(text == null ? "" : text).replace(/\s*(?:Refers?\s+to|Related|See)\s*:\s*Slides?\b[^.\n]*\.?/gi, " ").replace(/\s{2,}/g, " ").trim();
  }

  const escHtml = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // The reference-links block shown at the bottom of EVERY slide. Chapter-level, real videos, opened only when tapped (never embedded or autoplayed).
  function refsHTML(deck) {
    const refs = (deck && deck.references) || [];
    if (!refs.length) return "";
    const play = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.78 2 12 2 12s0 3.22.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77c.4-1.58.4-4.8.4-4.8s0-3.22-.4-4.8zM10 15V9l5.2 3z"/></svg>';
    return '<section class="cc-refs" aria-label="Reference links"><p class="cc-refs-title">Reference links<span>Need another explanation? Watch one on YouTube.</span></p><ul>' +
      refs.map((r) => '<li><a class="cc-ref" href="' + escHtml(r.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escHtml(r.title + " by " + r.channel + ", opens YouTube in a new tab") + '">' + play +
        '<span class="cc-ref-text">' + escHtml(r.title) + "<small>" + escHtml(r.channel) + " · YouTube</small></span><span class=\"cc-ext\">Opens YouTube ↗</span></a></li>").join("") + "</ul></section>";
  }

  // ------------------------------------------------------------------ lazy loading (browser)
  const BASE = (function () {
    try { const me = document.currentScript; if (me && me.src) return me.src.replace(/[^/]*$/, ""); } catch (e) { /* not in a page */ }
    return "assets/chapter/";
  })();
  const VERSION = "1";
  const pending = new Map();

  function script(url) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = url; s.async = false;
      s.onload = res; s.onerror = () => rej(new Error("Could not load " + url));
      document.head.appendChild(s);
    });
  }

  function load(chapterId) {
    if (decks.has(chapterId)) return Promise.resolve(decks.get(chapterId));
    if (pending.has(chapterId)) return pending.get(chapterId);
    const p = script(BASE + "defs/" + String(chapterId).toLowerCase() + ".js?v=" + VERSION).then(() => {
      const deck = decks.get(chapterId);
      if (!deck) throw new Error("No chapter content is available for " + chapterId + " yet.");
      const needsActivities = (deck.slides || []).some((s) => s.kind === "activity");
      return needsActivities && root.ClickLearnLoader && root.ClickLearnLoader.ensure ? root.ClickLearnLoader.ensure(chapterId).then(() => deck) : deck;
    }).catch((e) => { pending.delete(chapterId); throw e; });
    pending.set(chapterId, p);
    return p;
  }

  return { MIN_SLIDES, MAX_SLIDES, MAX_TERMS_PER_SLIDE, MAX_ACTIVITIES, MAX_REFERENCES, define, get, validate, plan, load, cleanExplanation, refsHTML, YT };
});
