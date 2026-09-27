// Shared loading for the chapter-deck tests (Node only, no browser).
const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..", "..");
const CH_DIR = path.join(REPO, "assets", "chapter");
const LEARN_DIR = path.join(REPO, "assets", "learn");
const fixture = JSON.parse(fs.readFileSync(path.join(REPO, "tests", "fixtures", "production-content.json"), "utf8"));

// Mirrors the server's rule for how many questions a unified chapter run serves: the chapter's question_limit (default
// QUESTIONS_PER_CHAPTER = 5), capped at UNIFIED_MAX_QUESTIONS (default 8), taken in `order`.
const UNIFIED_MAX_QUESTIONS = 8;
const DEFAULT_QUESTIONS = 5;
function servedFor(chapterId) {
  const ch = fixture.chapters.find((c) => c.chapter_id === chapterId);
  const limit = Math.min(Math.max(1, Number(ch && ch.question_limit) || DEFAULT_QUESTIONS), UNIFIED_MAX_QUESTIONS);
  return fixture.questions.filter((q) => q.chapter_id === chapterId).sort((a, b) => Number(a.order) - Number(b.order)).slice(0, limit).map((q) => q.question_id);
}

function loadChapterLayer() {
  globalThis.ClickGlossary = require(path.join(CH_DIR, "glossary.js"));
  globalThis.ClickExplorer = require(path.join(CH_DIR, "explorer.js"));
  return { Glossary: globalThis.ClickGlossary, Explorer: globalThis.ClickExplorer, Chapter: (globalThis.ClickChapter = require(path.join(CH_DIR, "chapter.js"))) };
}

// The real Learn engine + every existing activity definition (chapter decks reference these by id).
function loadActivities() {
  globalThis.ClickInterp = require(path.join(LEARN_DIR, "c-interp.js"));
  for (const f of ["engine.js", "kinds-visual.js", "kinds-code.js"]) require(path.join(LEARN_DIR, f));
  for (const f of fs.readdirSync(path.join(LEARN_DIR, "defs")).sort()) if (/^ch\d{4}\.js$/.test(f)) require(path.join(LEARN_DIR, "defs", f));
  const out = {};
  globalThis.ClickLearn.defs.forEach((d, id) => { out[id] = { chapter: d.chapter, kind: d.kind, page: d.page, title: d.title }; });
  return out;
}

// Deck files call ClickChapter.define(...); load them all and return { chapterId: deck }.
function loadDecks(only) {
  const { Chapter } = loadChapterLayer();
  const dir = path.join(CH_DIR, "defs"), decks = {};
  if (!fs.existsSync(dir)) return decks;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^ch\d{4}\.js$/.test(f)) continue;
    if (only && !only.includes(f.slice(0, 6).toUpperCase())) continue;
    require(path.join(dir, f));
  }
  for (const f of fs.readdirSync(dir)) { const id = f.slice(0, 6).toUpperCase(); const d = Chapter.get(id); if (d) decks[id] = d; }
  return decks;
}

function ctxFor(chapterId, activities) {
  const questions = {};
  fixture.questions.forEach((q) => { questions[q.question_id] = q; });
  return { questions, activities, served: servedFor(chapterId) };
}

module.exports = { REPO, CH_DIR, fixture, servedFor, loadChapterLayer, loadActivities, loadDecks, ctxFor, UNIFIED_MAX_QUESTIONS, DEFAULT_QUESTIONS };
