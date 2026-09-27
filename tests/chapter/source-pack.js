#!/usr/bin/env node
/* Prints everything an author needs to write a chapter deck: the old Learn pages (source material), the graded questions the server
 * serves for a run (each needs a question slide), and the existing interactive activities that can be reused by id.
 *
 *   node tests/chapter/source-pack.js CH0035
 */
"use strict";
const H = require("./helpers.js");

const acts = H.loadActivities();
const ids = process.argv.slice(2).map((s) => s.toUpperCase());
if (!ids.length) { console.error("usage: node tests/chapter/source-pack.js CH0035 [CH0036 ...]"); process.exit(2); }

const defs = [...globalThis.ClickLearn.defs.values()];
for (const id of ids) {
  const c = H.fixture.chapters.find((x) => x.chapter_id === id);
  if (!c) { console.error("unknown chapter " + id); continue; }
  const stage = H.fixture.stages.find((s) => s.stage_id === c.stage_id);
  const pages = H.fixture.learn_content.find((l) => l.chapter_id === id).pages_text.split("//.//");
  const all = H.fixture.questions.filter((q) => q.chapter_id === id).sort((a, b) => Number(a.order) - Number(b.order));
  const served = H.servedFor(id);
  let md = "# " + id + " — " + c.title + "\nStage " + stage.stage_id + ' "' + stage.title + '" (stage_no ' + stage.stage_no + "), chapter " + c.chapter_no + "\n\n## OLD LEARN CONTENT (source material; " + pages.length + " pages)\n";
  pages.forEach((p, i) => { md += "\n### Page " + (i + 1) + "\n" + p.trim() + "\n"; });
  md += "\n## GRADED QUESTIONS SERVED IN A RUN (" + served.length + "; every one MUST get a question slide, in any order you choose)\n";
  all.filter((q) => served.includes(q.question_id)).forEach((q) => {
    const opts = H.fixture.options.filter((o) => o.question_id === q.question_id).sort((a, b) => Number(a.order) - Number(b.order));
    const terms = H.fixture.question_terms.filter((t) => t.question_id === q.question_id).map((t) => t.display_text);
    md += "\n- " + q.question_id + " [" + q.type + "] xp=" + q.xp + "\n  prompt: " + JSON.stringify(q.prompt) + "\n" + (q.code ? "  code: " + JSON.stringify(q.code) + "\n" : "") + (opts.length ? "  options: " + JSON.stringify(opts.map((o) => o.option_text)) + "\n" : "") + "  answer: " + JSON.stringify(q.answer) + "\n  explanation: " + JSON.stringify(q.explanation) + "\n" + (terms.length ? "  question-terms: " + JSON.stringify(terms) + "\n" : "");
  });
  const spare = all.filter((q) => !served.includes(q.question_id));
  if (spare.length) md += "\n(" + spare.length + " more questions exist in the bank (" + spare.map((q) => q.question_id + "/" + q.type).join(", ") + ") but are NOT served in a unified run: do not use them.)\n";
  md += "\n## EXISTING INTERACTIVE ACTIVITIES FOR THIS CHAPTER (reuse by id for activity slides; ungraded; use 1 to 4)\n";
  defs.filter((a) => a.chapter === id).forEach((a) => {
    const code = a.code ? (typeof a.code === "string" ? a.code : a.code.join("\n")) : "";
    md += "\n- " + a.id + " [" + a.kind + '] "' + a.title + '" (old page ' + a.page + ': "' + a.heading + '")\n' + (a.intro ? "  intro: " + JSON.stringify(a.intro).slice(0, 260) + "\n" : "") + (a.question ? "  question: " + JSON.stringify(a.question).slice(0, 260) + "\n" : "") + (code ? "  code: " + JSON.stringify(code).slice(0, 320) + "\n" : "");
  });
  console.log(md);
}
