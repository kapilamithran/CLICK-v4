#!/usr/bin/env node
/* Prints, per populated chapter: slide count, the sequence of slide types, glossary size, code targets, references; then how often each
 * activity kind and question type is used.     node tests/chapter/coverage-report.js [--md]
 */
"use strict";
const H = require("./helpers.js");
const md = process.argv.includes("--md");
const acts = H.loadActivities();
const decks = H.loadDecks();
const { Explorer } = H.loadChapterLayer();
const qType = Object.fromEntries(H.fixture.questions.map((q) => [q.question_id, q.type]));
const stageOf = Object.fromEntries(H.fixture.stages.map((s) => [s.stage_id, s]));
const ABBR = { explorer: "Explorer", mcq: "mcq", predict: "predict", fill: "fill", order: "order", error: "error", assign: "assign", builder: "builder", reveal: "reveal", pipeline: "pipeline", buffer: "buffer", bits: "bits", evalorder: "evalorder", run: "run", lab: "lab", trace: "trace", tracetable: "tracetable", challenge: "challenge" };

const useAct = {}, useQ = {};
const rows = [];
for (const c of H.fixture.chapters) {
  const d = decks[c.chapter_id];
  if (!d) { rows.push([stageOf[c.stage_id].title, c.chapter_no + ". " + c.title, "MISSING"]); continue; }
  const seq = d.slides.map((s) => {
    if (s.kind === "explorer") return "Explorer";
    if (s.kind === "activity") { const k = acts[s.activity].kind; useAct[k] = (useAct[k] || 0) + 1; return ABBR[k] + "*"; }
    const t = qType[s.question]; useQ[t] = (useQ[t] || 0) + 1; return t;
  });
  rows.push([stageOf[c.stage_id].title, c.chapter_no + ". " + c.title + " (" + c.chapter_id + ")", String(d.slides.length), seq.join(" · "), String(Object.keys(d.glossary).length), String(Explorer.parse(d.slides[0].code).tokens.length), d.references.map((r) => r.channel + ": " + r.title).join(" | ")]);
}
const head = ["Stage", "Chapter", "Slides", "Slide types (* = interactive activity)", "Glossary terms", "Code targets", "Reference links"];
if (md) { console.log("| " + head.join(" | ") + " |\n|" + head.map(() => "---").join("|") + "|"); rows.forEach((r) => console.log("| " + r.join(" | ") + " |")); }
else rows.forEach((r) => console.log(r.join("  |  ")));
const tot = (o) => Object.values(o).reduce((a, b) => a + b, 0);
console.log("\nactivity kinds used (" + tot(useAct) + " activity slides): " + Object.entries(useAct).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + " ×" + v).join(", "));
console.log("question types used (" + tot(useQ) + " graded question slides): " + Object.entries(useQ).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + " ×" + v).join(", "));
const slides = Object.values(decks).map((d) => d.slides.length);
console.log("chapters: " + Object.keys(decks).length + " · slides: " + tot(Object.fromEntries(slides.map((n, i) => [i, n]))) + " (min " + Math.min(...slides) + ", max " + Math.max(...slides) + ") · glossary entries: " + Object.values(decks).reduce((n, d) => n + Object.keys(d.glossary).length, 0) + " · code targets: " + Object.values(decks).reduce((n, d) => n + Explorer.parse(d.slides[0].code).tokens.length, 0) + " · references: " + Object.values(decks).reduce((n, d) => n + d.references.length, 0));
