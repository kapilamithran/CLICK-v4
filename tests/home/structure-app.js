// Shared by tests/home/structure.test.js (offline) and tests/home/e2e.home-path.js (real browser): the curriculum structure
// (tests/fixtures/curriculum-structure.json = every active stage/chapter/prerequisite row after applying supabase/migrations) and a
// helper that turns it into the progress state the Home path reads. The live prerequisite rows entered directly in the database are
// not in the repo, so this reflects what the repo's migrations define.
"use strict";
const S = require("../fixtures/curriculum-structure.json");

const range = (a, b) => { const out = []; for (let n = Number(a.slice(2)); n <= Number(b.slice(2)); n++) out.push("CH0" + String(n).padStart(3, "0")); return out; };

// The curriculum, in learning order. Internal ids are permanent; only `no` (the number shown as "Stage N") follows this order.
const CURRICULUM = [
  { no: 0, id: "STG001", title: "Foundations", chapters: range("CH0031", "CH0035") },
  { no: 1, id: "STG002", title: "Datatypes", chapters: range("CH0036", "CH0040") },
  { no: 2, id: "STG003", title: "Operators", chapters: range("CH0041", "CH0045") },
  { no: 3, id: "STG004", title: "Input", chapters: range("CH0046", "CH0050") },
  { no: 4, id: "STG005", title: "Decision Making", chapters: [...range("CH0051", "CH0055"), "CH0115"] },
  { no: 5, id: "STG006", title: "Loops", chapters: range("CH0056", "CH0061") },
  { no: 6, id: "STG012", title: "NUMBER CRUNCHING", chapters: range("CH0117", "CH0123"), pending: true },
  { no: 7, id: "STG013", title: "PATTERNS", chapters: range("CH0124", "CH0128"), titles: ["Pattern Basics & Simple Patterns", "Number & Character Patterns", "Spaces, Alignment & Pyramids", "Hollow Patterns & Conditions", "Combining Patterns & Problem Solving"] },
  { no: 8, id: "STG007", title: "ARRAYS", chapters: [...range("CH0062", "CH0072"), "CH0116"] },
  { no: 9, id: "STG008", title: "STRINGS", chapters: range("CH0073", "CH0078") },
  { no: 10, id: "STG009", title: "SEARCHING & SORTING", chapters: range("CH0079", "CH0093") },
  { no: 11, id: "STG010", title: "FUNCTIONS", chapters: range("CH0094", "CH0102") },
  { no: 12, id: "STG011", title: "POINTERS", chapters: range("CH0103", "CH0114") },
];
const chaptersOf = (sid) => S.chapters.filter((c) => c.stage_id === sid).sort((a, b) => a.order - b.order);
const stagesInOrder = () => [...S.stages].sort((a, b) => a.order - b.order);

// A minimal mirror of the backend's prerequisiteStatus(): every active rule for the target must be met; no rule = unlocked.
function statusFor(rules, targetId, facts) {
  for (const r of rules.filter((x) => x.active && x.target_id === targetId)) {
    const met = r.prerequisite_id.startsWith("STG") ? facts.stageComplete.has(r.prerequisite_id) : facts.chapterDone.has(r.prerequisite_id);
    if (!met) return { unlocked: false, lock_reason: r.description || "Complete " + r.prerequisite_id + " first." };
  }
  return { unlocked: true, lock_reason: "" };
}
// The app state (stages, chapters, stage_progress, chapter_progress) for a student who has completed `doneChapters`.
function appFor(rules, doneChapters) {
  const chapterDone = new Set(doneChapters);
  const stageComplete = new Set(S.stages.filter((s) => chaptersOf(s.stage_id).length && chaptersOf(s.stage_id).every((c) => chapterDone.has(c.chapter_id))).map((s) => s.stage_id));
  const facts = { chapterDone, stageComplete };
  return {
    stages: stagesInOrder(),
    chapters: S.chapters,
    stage_progress: S.stages.map((s) => { const cs = chaptersOf(s.stage_id), done = cs.filter((c) => chapterDone.has(c.chapter_id)).length; return Object.assign({ stage_id: s.stage_id, completed_chapters: done, total_chapters: cs.length, progress_percent: cs.length ? Math.round(done * 100 / cs.length) : 0, test_completed: cs.length > 0 && done === cs.length }, statusFor(rules, s.stage_id, facts)); }),
    chapter_progress: S.chapters.map((c) => Object.assign({ chapter_id: c.chapter_id, stage_id: c.stage_id, learn_completed: chapterDone.has(c.chapter_id), test_completed: chapterDone.has(c.chapter_id), best_xp: 0 }, statusFor(rules, c.chapter_id, facts))),
  };
}
// every real chapter of the stages up to and including display stage `lastStageNo` (the content-pending stages have none to finish)
const through = (lastStageNo) => CURRICULUM.filter((c) => c.no <= lastStageNo && !c.pending).flatMap((c) => c.chapters);

module.exports = { S, range, CURRICULUM, chaptersOf, stagesInOrder, statusFor, appFor, through };
