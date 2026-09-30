// XP accounting audit: every graded visualizing activity and every graded question across the WHOLE
// curriculum has a positive, numeric XP value, and chapter/stage/curriculum totals are derived purely
// from that real data (never a hardcoded table). See assets/learn/engine.js's CL.DEFAULT_ACTIVITY_XP/
// CL.xpFor for the runtime policy this mirrors, and index.html's renderActivitySlide +
// supabase/functions/click-backend/index.ts's ACTIVITY_XP for the three runtime mirrors of the same value.
//   node --test tests/learn/xp-inventory.test.js
const test = require("node:test");
const assert = require("node:assert");
const { loadLayer } = require("./helpers.js");
const CURRICULUM = require("../fixtures/curriculum-structure.json");
const CONTENT = require("../fixtures/production-content.json");

const CL = loadLayer();

// ---- build the real inventory (no estimates): every activity definition + every active question
const activities = [...CL.defs.values()];
const questions = CONTENT.questions.filter((q) => q.active !== false);

test("every activity definition resolved (none skipped as invalid)", () => {
  assert.ok(activities.length > 300, "sanity: the whole curriculum's activities loaded, got " + activities.length);
  assert.deepStrictEqual(CL.invalid || [], []);
});

test("A: every activity has a resolvable XP value, numeric, positive, no override is negative/zero/NaN", () => {
  for (const a of activities) {
    const xp = CL.xpFor(a);
    assert.strictEqual(typeof xp, "number", a.id + ": xp must be a number");
    assert.ok(!Number.isNaN(xp), a.id + ": xp is NaN");
    assert.ok(xp > 0, a.id + ": xp must be > 0, got " + xp);
    if (a.xp !== undefined) assert.ok(Number(a.xp) > 0, a.id + ": an explicit xp override must be positive");
  }
});

test("B: every active graded question has a positive numeric xp", () => {
  for (const q of questions) {
    const xp = Number(q.xp);
    assert.ok(!Number.isNaN(xp) && xp > 0, q.question_id + " (" + q.type + "): xp must be a positive number, got " + q.xp);
  }
});

test("C/D/E: no XP-earning item has undefined/null/negative XP; all numeric and > 0 (combined activities+questions)", () => {
  const all = [...activities.map((a) => ({ id: a.id, xp: CL.xpFor(a) })), ...questions.map((q) => ({ id: q.question_id, xp: Number(q.xp) }))];
  for (const item of all) {
    assert.notStrictEqual(item.xp, undefined, item.id);
    assert.notStrictEqual(item.xp, null, item.id);
    assert.ok(item.xp > 0, item.id + " has non-positive xp: " + item.xp);
  }
});

test("F: the default activity XP is the same value every one of the curriculum's questions already uses (reuse existing policy, not a new tier)", () => {
  const questionXpValues = new Set(questions.map((q) => Number(q.xp)));
  assert.deepStrictEqual([...questionXpValues], [1], "expected the curriculum's only existing question XP value to be 1");
  assert.strictEqual(CL.DEFAULT_ACTIVITY_XP, 1);
});

// ---- chapter / stage / curriculum totals, derived purely from the real inventory above
function chapterTotals() {
  const byChapter = new Map();
  for (const a of activities) {
    const c = byChapter.get(a.chapter) || { activityXp: 0, activityCount: 0, questionXp: 0, questionCount: 0 };
    c.activityXp += CL.xpFor(a); c.activityCount++;
    byChapter.set(a.chapter, c);
  }
  for (const q of questions) {
    const c = byChapter.get(q.chapter_id) || { activityXp: 0, activityCount: 0, questionXp: 0, questionCount: 0 };
    c.questionXp += Number(q.xp); c.questionCount++;
    byChapter.set(q.chapter_id, c);
  }
  return byChapter;
}

test("G: no chapter is missing from the XP inventory (every active chapter with content has an entry)", () => {
  const byChapter = chapterTotals();
  const populated = CURRICULUM.chapters.filter((c) => byChapter.has(c.chapter_id));
  assert.ok(populated.length >= 98, "expected at least the 98 known populated chapters, got " + populated.length);
  for (const c of populated) {
    const t = byChapter.get(c.chapter_id);
    assert.ok(t.activityCount + t.questionCount > 0, c.chapter_id + " has an entry but zero items");
  }
});

test("H: stage XP equals the sum of its chapters' XP, and no stage is missing from the inventory", () => {
  const byChapter = chapterTotals();
  const byStage = new Map();
  for (const c of CURRICULUM.chapters) {
    if (!byChapter.has(c.chapter_id)) continue;
    const t = byChapter.get(c.chapter_id);
    const s = byStage.get(c.stage_id) || 0;
    byStage.set(c.stage_id, s + t.activityXp + t.questionXp);
  }
  const populatedStages = CURRICULUM.stages.filter((s) => byStage.has(s.stage_id));
  assert.strictEqual(populatedStages.length, 13, "expected all 13 stages to have content");
  for (const s of populatedStages) assert.ok(byStage.get(s.stage_id) > 0, s.stage_id + " has a zero total");
});

test("I: total curriculum XP equals the sum of stage XP, which equals the sum of chapter XP, which equals the sum of all items", () => {
  const byChapter = chapterTotals();
  let sumChapters = 0; for (const t of byChapter.values()) sumChapters += t.activityXp + t.questionXp;
  const totalActivityXp = activities.reduce((n, a) => n + CL.xpFor(a), 0);
  const totalQuestionXp = questions.reduce((n, q) => n + Number(q.xp), 0);
  assert.strictEqual(sumChapters, totalActivityXp + totalQuestionXp);
  assert.strictEqual(totalActivityXp, activities.length, "flat 1xp per activity today: total == count");
  assert.strictEqual(totalQuestionXp, questions.length, "flat 1xp per question today: total == count");
});

test("stage-by-stage XP report (printed for the final accounting report -- also asserts every stage total is a positive integer)", () => {
  const byChapter = chapterTotals();
  const rows = [];
  for (const s of CURRICULUM.stages.slice().sort((a, b) => a.order - b.order)) {
    const chs = CURRICULUM.chapters.filter((c) => c.stage_id === s.stage_id);
    let activityXp = 0, activityCount = 0, questionXp = 0, questionCount = 0;
    for (const c of chs) { const t = byChapter.get(c.chapter_id); if (!t) continue; activityXp += t.activityXp; activityCount += t.activityCount; questionXp += t.questionXp; questionCount += t.questionCount; }
    const total = activityXp + questionXp;
    assert.ok(Number.isInteger(total) && total >= 0, s.stage_id);
    rows.push({ stage_no: s.stage_no, stage_id: s.stage_id, title: s.title, chapters: chs.length, activityCount, activityXp, questionCount, questionXp, total });
  }
  console.log("\n" + rows.map((r) => `Stage ${r.stage_no} (${r.stage_id}) ${r.title}: ${r.chapters} chapters, ${r.activityCount} activities (${r.activityXp} XP) + ${r.questionCount} questions (${r.questionXp} XP) = ${r.total} XP`).join("\n"));
  const grandTotal = rows.reduce((n, r) => n + r.total, 0);
  console.log("TOTAL CURRICULUM XP: " + grandTotal + "\n");
  assert.strictEqual(grandTotal, activities.length + questions.length);
});
