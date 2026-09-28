#!/usr/bin/env node
/* Rebuilds tests/fixtures/production-content.json: CLICK's effective production content for the populated chapters.
 *
 *   npm i --no-save @electric-sql/pglite         (PGlite = Postgres compiled to WebAssembly; no Docker, no database server)
 *   node tests/fixtures/build-production-content.mjs [output.json]
 *
 * How: start from the state production already had before the content migrations (the original CSV-seeded tables in CSVs/, plus the
 * `question_limit` column that was added by hand), then apply every file in supabase/migrations in order. What is left in the tables is
 * what students see. Only chapters that have Learn text are kept.
 *
 * Note: the live `prerequisites` rows (which chapter unlocks which) were entered directly in the database and are not in the repo, so
 * they are not part of this fixture; the tests model the documented rules (chapters unlock in order, a stage after the previous one).
 */
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.argv[2] || path.join(ROOT, "tests", "fixtures", "production-content.json");
const MIG = path.join(ROOT, "supabase", "migrations");

function parseCsv(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  const clean = rows.filter((x) => x.length > 1 || x[0]);
  const head = clean[0];
  return clean.slice(1).map((x) => Object.fromEntries(head.map((k, i) => [k, x[i]])));
}
const csv = (name) => parseCsv(fs.readFileSync(path.join(ROOT, "CSVs", "CLICK v2 - " + name + ".csv"), "utf8").replace(/^﻿/, ""));

const db = new PGlite();
const rows = async (sql, params) => (await db.query(sql, params)).rows;

await db.exec(fs.readFileSync(path.join(MIG, "20260101000000_baseline_schema.sql"), "utf8"));
await db.exec("alter table chapters add column if not exists question_limit integer;");
async function seed(sheet, table) {
  const have = (await rows("select column_name from information_schema.columns where table_name=$1", [table])).map((r) => r.column_name);
  for (const r of csv(sheet)) {
    const keys = Object.keys(r).filter((k) => have.includes(k));
    const vals = keys.map((k) => { const v = r[k]; if (v === "") return null; if (/^(TRUE|FALSE)$/i.test(v)) return /^TRUE$/i.test(v); return v; });
    try { await db.query(`insert into ${table} (${keys.map((k) => '"' + k + '"').join(",")}) values (${keys.map((_, i) => "$" + (i + 1)).join(",")})`, vals); } catch (e) { /* a row that does not fit the current schema is skipped, as production would have */ }
  }
}
for (const [sheet, table] of [["Stages", "stages"], ["Chapters", "chapters"], ["LearnContent", "learn_content"], ["Glossary", "glossary"], ["Questions", "questions"], ["Options", "options"], ["TestHints", "test_hints"], ["QuestionTerms", "question_terms"], ["Prerequisites", "prerequisites"], ["Settings", "settings"]]) await seed(sheet, table);

const skip = new Set(["20260101000000_baseline_schema.sql", "20260101000001_baseline_grants.sql"]);
const failed = [];
for (const f of fs.readdirSync(MIG).filter((x) => x.endsWith(".sql")).sort()) {
  if (skip.has(f)) continue;
  try { await db.exec(fs.readFileSync(path.join(MIG, f), "utf8")); } catch (e) { failed.push(f + ": " + String(e.message).slice(0, 120)); }
}
if (failed.length) { console.error("migrations that did not apply:\n  " + failed.join("\n  ")); process.exit(1); }

const learn = await rows("select * from learn_content where active");
const populated = new Set(learn.filter((l) => (l.pages_text || "").trim()).map((l) => l.chapter_id));
const chapters = (await rows(`select * from chapters where active and stage_id in (select stage_id from stages where active) order by stage_id, "order"`)).filter((c) => populated.has(c.chapter_id));
const stageIds = new Set(chapters.map((c) => c.stage_id));
const questions = (await rows(`select * from questions where active order by chapter_id, "order"`)).filter((q) => populated.has(q.chapter_id));
const qids = new Set(questions.map((q) => q.question_id));
const qterms = (await rows(`select * from question_terms order by question_id, "order"`)).filter((t) => qids.has(t.question_id));
const termIds = new Set(qterms.map((t) => t.term_id));
const out = {
  _about: "Effective production content for the populated chapters, produced by applying supabase/migrations on top of the CSV seed (see build-production-content.mjs). Used by the chapter-deck validators and the browser tests.",
  stages: (await rows(`select * from stages where active order by "order"`)).filter((s) => stageIds.has(s.stage_id)),
  chapters,
  learn_content: learn.filter((l) => populated.has(l.chapter_id)).map((l) => ({ learn_id: l.learn_id, stage_id: l.stage_id, chapter_id: l.chapter_id, title: l.title, pages_text: l.pages_text })),
  questions,
  options: (await rows(`select * from options order by question_id, "order"`)).filter((o) => qids.has(o.question_id)),
  test_hints: (await rows(`select * from test_hints order by question_id, "order"`)).filter((h) => qids.has(h.question_id)),
  glossary: (await rows("select * from glossary where active")).filter((g) => termIds.has(g.term_id)),
  question_terms: qterms,
  settings: (await rows("select * from settings")).filter((s) => ["DEFAULT_HEARTS", "QUESTIONS_PER_CHAPTER"].includes(s.key)),
};
fs.writeFileSync(OUT, JSON.stringify(out));

// The curriculum STRUCTURE, including stages whose chapters have no learning content yet (placeholders): every active stage
// and chapter, the prerequisite rows the repo's migrations define, and how much content each chapter has. Used by
// tests/home/structure.test.js. (The live prerequisite rows entered directly in the database are not in the repo.)
const activeStages = await rows(`select stage_id, stage_no, title, "order" from stages where active order by "order"`);
const allChapters = await rows(`select chapter_id, stage_id, chapter_no, title, "order" from chapters where active and stage_id in (select stage_id from stages where active) order by "order", chapter_id`);
const structure = {
  _about: "Every active stage and chapter (including content-less placeholders) after applying supabase/migrations to the CSV seed; produced by build-production-content.mjs. Used by tests/home/structure.test.js.",
  stages: activeStages,
  chapters: allChapters,
  prerequisites: await rows(`select target_id, prerequisite_id, condition, description, active from prerequisites order by target_id, prerequisite_id`),
  content: Object.fromEntries(allChapters.map((c) => [c.chapter_id, {
    learn: learn.filter((l) => l.chapter_id === c.chapter_id && (l.pages_text || "").trim()).length,
    questions: (questions.filter((q) => q.chapter_id === c.chapter_id)).length,
  }])),
};
fs.writeFileSync(path.join(path.dirname(OUT), "curriculum-structure.json"), JSON.stringify(structure));
console.log("wrote tests/fixtures/curriculum-structure.json: " + activeStages.length + " stages, " + allChapters.length + " chapters");
console.log("wrote " + path.relative(ROOT, OUT) + ": " + chapters.length + " chapters, " + questions.length + " questions, " + out.options.length + " options");
