#!/usr/bin/env node
// Converts a content draft (see content-raw/_DRAFT_SCHEMA.md) into a ready-to-apply
// SQL migration file under supabase/migrations/, using the CLICK backend's admin
// action to fetch current max IDs and the existing glossary (for dedup).
//
// Usage:
//   node admin-tools/build-content-migration.js content-raw/stage-01/draft.json
//
// After it runs, review the printed summary + the generated migration file,
// then apply with: npx supabase db push

const fs = require("fs");
const path = require("path");

const BACKEND_URL = "https://jnxevalckgitxuunjcvv.supabase.co/functions/v1/click-backend";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpueGV2YWxja2dpdHh1dW5qY3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg2OTYsImV4cCI6MjEwNDA3NDY5Nn0.AtbnOxi8sDI-jTQ1gYJy4_e5tXuHr2yG6OrJ5uYcANo";

const VALID_TYPES = ["ORDER", "TYPE_CODE", "PREDICT_OUTPUT", "FIND_ERROR", "BLANK", "MCQ", "TRUE_FALSE", "CODE_FILL"];
const OPTIONS_TYPES = new Set(["ORDER", "PREDICT_OUTPUT", "FIND_ERROR", "MCQ", "TRUE_FALSE"]);

function sql(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function pad(n, width) {
  return String(n).padStart(width, "0");
}

async function getAdminKey() {
  const keyFile = path.join(__dirname, ".admin-key");
  if (fs.existsSync(keyFile)) return fs.readFileSync(keyFile, "utf-8").trim();
  throw new Error("admin-tools/.admin-key not found. Run reset-student-password.ps1 once to set it up, or create that file with the ADMIN_RESET_KEY.");
}

async function callBackend(action, payload) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: "Bearer " + ANON_KEY },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error("Backend call failed: " + data.error);
  return data;
}

function validateChapter(ch, chapterLabel) {
  const errors = [];
  if (!ch.title) errors.push(`${chapterLabel}: missing title`);
  if (!Array.isArray(ch.pages) || ch.pages.length !== 5) errors.push(`${chapterLabel}: must have exactly 5 pages, got ${ch.pages?.length ?? 0}`);
  if (!Array.isArray(ch.questions) || ch.questions.length !== 5) errors.push(`${chapterLabel}: must have exactly 5 questions, got ${ch.questions?.length ?? 0}`);
  (ch.questions || []).forEach((q, i) => {
    const label = `${chapterLabel} Q${i + 1}`;
    if (!VALID_TYPES.includes(q.type)) errors.push(`${label}: invalid type "${q.type}" (must be one of ${VALID_TYPES.join(", ")})`);
    if (!q.prompt) errors.push(`${label}: missing prompt`);
    if (q.type === "CODE_FILL") {
      const placeholders = [...(q.code || "").matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
      let answerArr;
      try { answerArr = JSON.parse(q.answer); } catch { answerArr = null; }
      if (!Array.isArray(answerArr)) errors.push(`${label}: CODE_FILL answer must be a JSON array string, got: ${q.answer}`);
      else if (answerArr.length !== placeholders.length) errors.push(`${label}: CODE_FILL has ${placeholders.length} {{n}} placeholders but answer array has ${answerArr.length} entries`);
    }
    if (OPTIONS_TYPES.has(q.type) && (!Array.isArray(q.options) || q.options.length < 2)) {
      errors.push(`${label}: type ${q.type} usually needs an options array with 2+ entries (got ${q.options?.length ?? 0}) -- fix if this is unintentional`);
    }
  });
  return errors;
}

async function main() {
  const draftPath = process.argv[2];
  if (!draftPath) { console.error("Usage: node build-content-migration.js <path-to-draft.json>"); process.exit(1); }
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf-8"));

  const adminKey = await getAdminKey();
  const state = await callBackend("adminGetMaxIds", { admin_key: adminKey });
  const maxIds = state.max_ids;
  const existingGlossary = new Map((state.glossary || []).map((g) => [g.term.trim().toLowerCase(), g.term_id]));
  const existingStages = state.stages || [];

  // ---- validation pass ----
  const errors = [];
  (draft.chapters || []).forEach((ch, i) => errors.push(...validateChapter(ch, `Chapter ${i + 1} (${ch.title || "untitled"})`)));
  const practiceCount = (draft.practice || []).length;
  if (practiceCount && (practiceCount < 5 || practiceCount > 10)) {
    console.warn(`WARNING: ${practiceCount} practice challenges provided; spec calls for 5-10.`);
  }
  if (errors.length) {
    console.error("Validation failed:\n" + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
  }

  // ---- ID counters ----
  let nextChapterNum = Number((maxIds.chapters || "CH0000").replace("CH", "")) ;
  let nextQuestionNum = Number((maxIds.questions || "Q000000").replace("Q", ""));
  let nextOptionNum = Number((maxIds.options || "O0000000").replace("O", ""));
  let nextTermNum = Number((maxIds.glossary || "TERM000").replace("TERM", ""));
  let nextStageNum = existingStages.length ? Math.max(...existingStages.map((s) => Number(s.stage_no))) : -1;

  const summary = { stage: null, chapters: [], practice: [], glossary: [] };
  const stmts = { stages: [], chapters: [], learn_content: [], questions: [], options: [], test_hints: [], glossary: [], question_terms: [], practice_bank: [], practice_tests: [] };

  // ---- stage ----
  let stageId = draft.stage_id;
  let chapterNoStart = 1;
  if (draft.stage) {
    nextStageNum += 1;
    stageId = "STG" + pad(nextStageNum, 3);
    stmts.stages.push(`insert into stages (stage_id, stage_no, title, "order", active) values (${sql(stageId)}, ${nextStageNum}, ${sql(draft.stage.title)}, ${nextStageNum}, true);`);
    summary.stage = { stage_id: stageId, stage_no: nextStageNum, title: draft.stage.title };
  } else if (!stageId) {
    console.error("Draft must have either a \"stage\" block (new stage) or a \"stage_id\" (existing stage).");
    process.exit(1);
  } else {
    const existing = existingStages.find((s) => s.stage_id === stageId);
    if (!existing) { console.error(`stage_id ${stageId} not found among existing stages.`); process.exit(1); }
    chapterNoStart = draft.chapter_no_start || 1; // no per-stage chapter count lookup yet -- specify explicitly if appending
  }

  // ---- glossary (dedup by term text) ----
  const termIdByText = new Map(existingGlossary);
  function resolveTerm(termText) {
    const key = termText.trim().toLowerCase();
    if (termIdByText.has(key)) return termIdByText.get(key);
    return null;
  }
  for (const g of draft.glossary || []) {
    const key = g.term.trim().toLowerCase();
    if (termIdByText.has(key)) continue; // already exists, skip
    nextTermNum += 1;
    const termId = "TERM" + pad(nextTermNum, 3);
    termIdByText.set(key, termId);
    stmts.glossary.push(`insert into glossary (term_id, term, definition, color, aliases, active) values (${sql(termId)}, ${sql(g.term)}, ${sql(g.definition)}, ${sql(g.color || "#2563EB")}, ${sql(g.aliases || "")}, true);`);
    summary.glossary.push({ term_id: termId, term: g.term });
  }

  // ---- chapters, learn_content, questions, options, hints, question_terms ----
  (draft.chapters || []).forEach((ch, idx) => {
    nextChapterNum += 1;
    const chapterId = "CH" + pad(nextChapterNum, 4);
    const chapterNo = chapterNoStart + idx;
    stmts.chapters.push(`insert into chapters (chapter_id, stage_id, chapter_no, title, "order", active) values (${sql(chapterId)}, ${sql(stageId)}, ${chapterNo}, ${sql(ch.title)}, ${chapterNo}, true);`);

    const learnId = "L_" + chapterId;
    const pagesText = ch.pages.join("\n//.//.\n");
    stmts.learn_content.push(`insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values (${sql(learnId)}, ${sql(stageId)}, ${sql(chapterId)}, ${sql(ch.title)}, ${sql(pagesText)}, true);`);

    const chapterSummary = { chapter_id: chapterId, title: ch.title, questions: [] };

    ch.questions.forEach((q, qi) => {
      nextQuestionNum += 1;
      const questionId = "Q" + pad(nextQuestionNum, 6);
      stmts.questions.push(
        `insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values (${sql(questionId)}, ${sql(stageId)}, ${sql(chapterId)}, ${sql(q.type)}, ${sql(q.prompt)}, ${sql(q.code || "")}, ${sql(q.answer)}, ${sql(q.explanation || "")}, ${sql(q.hint || "")}, ${q.xp || 1}, ${qi + 1}, true);`
      );

      if (q.hint) {
        stmts.test_hints.push(`insert into test_hints (hint_id, question_id, hint_text, active, "order") values (${sql("H_" + questionId)}, ${sql(questionId)}, ${sql(q.hint)}, true, 1);`);
      }

      (q.options || []).forEach((optText, oi) => {
        nextOptionNum += 1;
        const optionId = "O" + pad(nextOptionNum, 7);
        stmts.options.push(`insert into options (option_id, question_id, option_text, "order", active) values (${sql(optionId)}, ${sql(questionId)}, ${sql(optText)}, ${oi + 1}, true);`);
      });

      (q.terms || []).forEach((t, ti) => {
        const termId = resolveTerm(t.term);
        if (!termId) throw new Error(`Question "${q.prompt?.slice(0, 40)}..." references glossary term "${t.term}" which doesn't exist and wasn't in this draft's "glossary" list.`);
        stmts.question_terms.push(`insert into question_terms (question_id, term_id, display_text, "order", active) values (${sql(questionId)}, ${sql(termId)}, ${sql(t.display_text || t.term)}, ${ti + 1}, true);`);
      });

      chapterSummary.questions.push({ question_id: questionId, type: q.type });
    });

    summary.chapters.push(chapterSummary);
  });

  // ---- stage-wise practice bank ----
  (draft.practice || []).forEach((p, pi) => {
    const practiceId = `${stageId}-P${pi + 1}`;
    stmts.practice_bank.push(
      `insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active) values (${sql(practiceId)}, ${sql(stageId)}, ${sql(p.title)}, ${sql(p.objective)}, ${sql(p.problem_statement)}, ${sql(p.constraints || "")}, ${sql(p.sample_input || "")}, ${sql(p.sample_output || "")}, ${sql(p.starter_code || "")}, ${sql(p.hints?.[0] || "")}, ${sql(p.hints?.[1] || "")}, ${sql(p.hints?.[2] || "")}, ${sql(p.success_message || "")}, ${sql(p.technique_after_success || "")}, ${pi + 1}, true);`
    );
    (p.tests || []).forEach((t, ti) => {
      const testId = `${practiceId}-T${ti + 1}`;
      stmts.practice_tests.push(
        `insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values (${sql(testId)}, ${sql(practiceId)}, ${sql(t.name || testId)}, ${sql(t.input || "")}, ${sql(t.expected_output || "")}, ${t.hidden ? "true" : "false"}, ${t.timeout_ms || 5000}, true, ${ti + 1});`
      );
    });
    summary.practice.push({ practice_id: practiceId, title: p.title });
  });

  // ---- write migration file ----
  const order = ["stages", "glossary", "chapters", "learn_content", "questions", "options", "test_hints", "question_terms", "practice_bank", "practice_tests"];
  const allSql = order.filter((t) => stmts[t].length).map((t) => `-- ${t}\n` + stmts[t].join("\n")).join("\n\n");

  const now = new Date();
  const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1, 2) + pad(now.getUTCDate(), 2) + pad(now.getUTCHours(), 2) + pad(now.getUTCMinutes(), 2) + pad(now.getUTCSeconds(), 2);
  const slug = path.basename(draftPath, ".json").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  const outPath = path.join(__dirname, "..", "supabase", "migrations", `${stamp}_content_${slug}.sql`);
  fs.writeFileSync(outPath, `-- Content import generated from ${draftPath}\n\n${allSql}\n`);

  console.log("Migration written to:", outPath);
  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nReview the migration file, then apply with: npx supabase db push");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
