// Backend tests for the unified chapter run: the REAL click-backend edge function, an in-memory database that enforces the same unique
// constraints Postgres does, and CLICK's real production content. Covers XP-once, hearts, unlocking and every legacy student state.
//
//   deno test --allow-read --allow-env --import-map=tests/backend/import_map.json tests/backend/unified.test.ts
//   (or through node:  node --test tests/backend/run.test.js   -- it is skipped when Deno is not installed)
import assert from "node:assert/strict";
import { addStudent, bootBackend, content, correctAnswer, freshWorld, legacyLearned, legacyTested, questionsOf, table, WRONG } from "./harness.ts";

type Row = Record<string, any>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const stageOf = (cid: string) => content.chapters.find((c: Row) => c.chapter_id === cid).stage_id;
const xpOf = (q: Row) => Math.min(2, Math.max(1, Number(q.xp || 1)));
const C1 = "CH0031", C2 = "CH0032", C3 = "CH0033", C4 = "CH0034", C5 = "CH0035";

async function world(settings: Record<string, string> = {}) { freshWorld(settings); return await bootBackend(); }
const start = (call: any, tok: string, cid: string, unified = true) => call("startTest", { session_token: tok, stage_id: stageOf(cid), chapter_id: cid, ...(unified ? { unified: true } : {}) });
const answer = (call: any, tok: string, run: Row, q: Row, ok = true) => call("saveTestAnswer", { session_token: tok, test_run_id: run.test_run_id, question_id: q.question_id, answer: ok ? correctAnswer(q.question_id) : WRONG });
const finish = (call: any, tok: string, runId: string, unified = true) => call("finishTest", { session_token: tok, test_run_id: runId, ...(unified ? { unified: true, pages_viewed: 8 } : {}) });
const review = (call: any, tok: string, cid: string) => call("completeLearn", { session_token: tok, stage_id: stageOf(cid), chapter_id: cid, pages_viewed: 8, unified: true });
const boot = async (call: any, tok: string) => (await call("bootstrap", { session_token: tok }));
const cp = (app: Row, cid: string) => app.chapter_progress.find((p: Row) => p.chapter_id === cid);
const user = (uid: string) => table("users").find((u) => u.user_id === uid)!;
const learnRow = (uid: string, cid: string): Row => table("learn_progress").find((r) => r.user_id === uid && r.chapter_id === cid) as Row;

async function passRun(call: any, tok: string, cid: string) {
  const run = await start(call, tok, cid);
  assert.equal(run.ok, true, run.error);
  for (const q of run.questions) await answer(call, tok, run, q);
  return { run, fin: await finish(call, tok, run.test_run_id) };
}

Deno.test("a new student can start a chapter with no separate Learn; callers that do not send `unified` keep the old rule", async () => {
  const call = await world(); const tok = addStudent("u1");
  const run = await start(call, tok, C1);
  assert.equal(run.ok, true, run.error);
  assert.equal(run.unified, true);
  assert.equal(run.questions.length, 5, "CH0031 serves its 5 questions");
  const old = await start(call, tok, C1, false);
  assert.equal(old.ok, false);
  assert.match(old.error, /Complete this chapter in Learn before taking its test/, "the legacy Learn-then-test rule is untouched for old clients");
});

Deno.test("unlocking is unchanged: the next chapter opens only after this chapter is completed", async () => {
  const call = await world(); const tok = addStudent("u1");
  const locked = await start(call, tok, C2);
  assert.equal(locked.ok, false);
  assert.match(locked.error, /previous micro-chapter/i);
  let app = await boot(call, tok);
  assert.equal(cp(app, C1).unlocked, true); assert.equal(cp(app, C2).unlocked, false);
  assert.equal(cp(app, C1).learn_completed, false); assert.equal(cp(app, C1).test_completed, false);

  const { fin } = await passRun(call, tok, C1);
  assert.equal(fin.completed, true);
  app = await boot(call, tok);
  assert.equal(cp(app, C1).learn_completed, true, "finishing the unified run also records the Learn side");
  assert.equal(cp(app, C1).test_completed, true);
  assert.equal(cp(app, C2).unlocked, true, "the next chapter is now open");
  assert.equal(cp(app, C3).unlocked, false, "and only that one");
});

Deno.test("XP: awarded exactly once, on chapter completion; a reload, a repeated finish and a second run add nothing", async () => {
  const call = await world(); const tok = addStudent("u1");
  const expected = questionsOf(C1).slice(0, 5).reduce((n: number, q: Row) => n + xpOf(q), 0);
  const { run, fin } = await passRun(call, tok, C1);
  assert.equal(fin.committed_xp, expected);
  assert.equal(user("u1").total_xp, expected);
  assert.match(fin.message, /Chapter complete! \d+ XP added/);

  assert.equal((await finish(call, tok, run.test_run_id)).committed_xp, expected, "asking again reports the same result");
  assert.equal(user("u1").total_xp, expected, "...but adds nothing");
  assert.equal((await boot(call, tok)).user.total_xp, expected, "a reload changes nothing");

  // a second run of the same chapter (a second tab, or a hand-made request): finishes, but is a repeat
  const again = await start(call, tok, C1); assert.equal(again.ok, true);
  for (const q of again.questions) await answer(call, tok, again, q);
  const dup = await finish(call, tok, again.test_run_id);
  assert.equal(dup.committed_xp, 0);
  assert.match(dup.message, /already completed/i);
  assert.equal(user("u1").total_xp, expected, "XP is still exactly one chapter's worth");
  assert.equal(table("test_runs").filter((r) => r.user_id === "u1" && r.status === "completed").length, 1);
});

Deno.test("XP: two tabs finishing the same chapter at once cannot both be paid (the unique index decides)", async () => {
  const call = await world(); const tok = addStudent("u1");
  const a = await start(call, tok, C1), b = await start(call, tok, C1);
  for (const q of a.questions) await answer(call, tok, a, q);
  for (const q of b.questions) await answer(call, tok, b, q);
  const [fa, fb] = await Promise.all([finish(call, tok, a.test_run_id), finish(call, tok, b.test_run_id)]);
  assert.deepEqual([fa.committed_xp, fb.committed_xp].sort(), [0, questionsOf(C1).slice(0, 5).reduce((n: number, q: Row) => n + xpOf(q), 0)].sort());
  assert.equal(table("test_runs").filter((r) => r.status === "completed").length, 1);
});

Deno.test("reviewing a completed chapter never awards XP and never costs a heart", async () => {
  const call = await world(); const tok = addStudent("u1");
  await passRun(call, tok, C1);
  const xp = user("u1").total_xp, before = learnRow("u1", C1).times_completed;
  for (let i = 0; i < 3; i++) { const r = await review(call, tok, C1); assert.equal(r.ok, true, r.error); assert.equal(r.refilled, false); }
  assert.equal(user("u1").total_xp, xp);
  assert.equal(user("u1").hearts, 3);
  assert.equal(learnRow("u1", C1).times_completed, before + 3, "reviews are counted, nothing else changes");
  assert.equal(table("test_runs").filter((r) => r.chapter_id === C1).length, 1, "a review creates no test run and no attempts");
  assert.equal(table("attempts").length, 5, "only the 5 real answers from the graded run exist");
});

Deno.test("hearts: a correct answer costs nothing; a question failed 3 times costs one; passing does not refill it; a review refills it once", async () => {
  const call = await world(); const tok = addStudent("u1");
  const run = await start(call, tok, C1); await sleep(15);
  const [q0, ...rest] = run.questions;
  const first = await answer(call, tok, run, q0, false); assert.equal(first.heart_lost, false); assert.equal(first.attempts_remaining, 2);
  await answer(call, tok, run, q0, false);
  const third = await answer(call, tok, run, q0, false);
  assert.equal(third.heart_lost, true); assert.equal(third.hearts, 2); assert.equal(third.question_done, true);
  for (const q of rest) { const r = await answer(call, tok, run, q); assert.equal(r.correct, true); assert.equal(r.hearts, 2, "correct answers never cost a heart"); }
  const fin = await finish(call, tok, run.test_run_id);
  assert.equal(fin.completed, true);
  assert.equal(user("u1").hearts, 2, "passing the chapter does not refill hearts");
  let app = await boot(call, tok);
  assert.deepEqual(app.heart_recovery_chapters.map((c: Row) => c.chapter_id), [C1], "the chapter is owed a review");

  const r1 = await review(call, tok, C1);
  assert.equal(r1.refilled, true); assert.equal(r1.hearts, 3);
  assert.equal(user("u1").hearts, 3);
  app = await boot(call, tok);
  assert.deepEqual(app.heart_recovery_chapters, [], "nothing is owed after the review");
  assert.equal((await review(call, tok, C1)).refilled, false, "a second review has nothing left to refill");
});

Deno.test("hearts: losing all three fails the run (no XP); no chapter can start until a review refills; then the chapter completes", async () => {
  const call = await world(); const tok = addStudent("u1");
  const run = await start(call, tok, C1); await sleep(15);
  for (const q of run.questions.slice(0, 3)) { await answer(call, tok, run, q, false); await answer(call, tok, run, q, false); var last = await answer(call, tok, run, q, false); }
  assert.equal(last.failed, true);
  assert.equal(user("u1").hearts, 0);
  const fin = await finish(call, tok, run.test_run_id);
  assert.equal(fin.completed, false); assert.equal(fin.failed, true); assert.equal(fin.committed_xp, 0);
  assert.equal(user("u1").total_xp, 0);
  const blocked = await start(call, tok, C1);
  assert.equal(blocked.ok, false); assert.match(blocked.error, /No hearts left/);
  assert.equal(learnRow("u1", C1), undefined, "a failed run does not count as having learned the chapter");

  const r = await review(call, tok, C1);
  assert.equal(r.refilled, true); assert.equal(r.hearts, 3);
  assert.equal(cp(await boot(call, tok), C1).test_completed, false, "a review does not complete the chapter");
  const { fin: second } = await passRun(call, tok, C1);
  assert.equal(second.completed, true);
  assert.ok(second.committed_xp > 0);
});

Deno.test("legacy: a student who had learned AND tested a chapter keeps everything, and a stray unified run cannot change it", async () => {
  const call = await world(); const tok = addStudent("u1", { total_xp: 7, tests_completed: 1 });
  legacyLearned("u1", C1, "2026-09-01T10:00:00.000Z", 2); legacyTested("u1", C1, 7);
  const app = await boot(call, tok);
  assert.equal(cp(app, C1).learn_completed, true); assert.equal(cp(app, C1).test_completed, true); assert.equal(cp(app, C1).best_xp, 7);
  assert.equal(cp(app, C2).unlocked, true);
  const before = structuredClone(learnRow("u1", C1)!);

  const run = await start(call, tok, C1);
  for (const q of run.questions) await answer(call, tok, run, q);
  const fin = await finish(call, tok, run.test_run_id);
  assert.equal(fin.committed_xp, 0, "no second payout");
  assert.equal(user("u1").total_xp, 7);
  assert.deepEqual(learnRow("u1", C1), before, "learn_progress is left exactly as it was");
});

Deno.test("legacy: learned-but-not-yet-tested is simply the chapter's first graded run: XP once, Learn record untouched", async () => {
  const call = await world(); const tok = addStudent("u1");
  legacyLearned("u1", C1, "2026-09-01T10:00:00.000Z", 1);
  const app = await boot(call, tok);
  assert.equal(cp(app, C1).learn_completed, true); assert.equal(cp(app, C1).test_completed, false);
  assert.equal(cp(app, C2).unlocked, false, "still locked, as before: only the test unlocks the next chapter");
  const before = structuredClone(learnRow("u1", C1)!);
  const { fin } = await passRun(call, tok, C1);
  assert.ok(fin.committed_xp > 0);
  assert.deepEqual(learnRow("u1", C1), before, "their original Learn timestamps and count are preserved");
  assert.equal(cp(await boot(call, tok), C2).unlocked, true);
});

Deno.test("legacy: hearts already owed from old test attempts stay owed, and a unified review pays them back", async () => {
  const call = await world(); const tok = addStudent("u1", { hearts: 2, heart_recovery_stage_id: stageOf(C1), heart_recovery_chapter_id: C1 });
  legacyLearned("u1", C1, "2026-09-01T10:00:00.000Z");
  table("attempts").push({ attempt_id: "A-old", user_id: "u1", stage_id: stageOf(C1), chapter_id: C1, question_id: questionsOf(C1)[0].question_id, question_attempt_no: 3, answer: "x", correct: false, hearts_before: 3, hearts_after: 2, xp_earned: 0, attempted_at: "2026-09-02T10:00:00.000Z", test_run_id: "TR-old" });
  let app = await boot(call, tok);
  assert.deepEqual(app.heart_recovery_chapters.map((c: Row) => c.chapter_id), [C1]);
  const r = await review(call, tok, C1);
  assert.equal(r.refilled, true); assert.equal(user("u1").hearts, 3);
  app = await boot(call, tok);
  assert.deepEqual(app.heart_recovery_chapters, []);
});

Deno.test("a unified run serves at most UNIFIED_MAX_QUESTIONS (default 8) in order; every other chapter is unaffected; legacy callers still get all", async () => {
  const call = await world(); const tok = addStudent("u1");
  table("prerequisites").length = 0; // open every chapter for this test
  const bad: string[] = [];
  for (const c of content.chapters) {
    const bank = questionsOf(c.chapter_id), want = Math.min(Math.max(1, Number(c.question_limit) || 5), 8);
    const run = await start(call, tok, c.chapter_id);
    if (!run.ok) { bad.push(c.chapter_id + ": " + run.error); continue; }
    if (run.questions.length !== want) bad.push(`${c.chapter_id}: served ${run.questions.length}, expected ${want}`);
    const ids = run.questions.map((q: Row) => q.question_id).sort();
    if (JSON.stringify(ids) !== JSON.stringify(bank.slice(0, want).map((q: Row) => q.question_id).sort())) bad.push(c.chapter_id + ": not the first questions by order");
    table("test_runs").length = 0; // (keep the throw-away runs from piling up)
  }
  assert.deepEqual(bad, []);
  const legacy = await start(call, tok, C5, false); // learn gate first for the legacy path
  assert.equal(legacy.ok, false);
  legacyLearned("u1", C5);
  const all = await start(call, tok, C5, false);
  assert.equal(all.questions.length, 15, "the old test flow still serves all 15 of CH0035");
  const small = await bootBackend2({ UNIFIED_MAX_QUESTIONS: "6" });
  assert.equal((await start(small, tok, C5)).questions.length, 6, "the cap is a setting, changeable without a deploy");
});

async function bootBackend2(settings: Record<string, string>) { freshWorld(settings); addStudent("u1"); table("prerequisites").length = 0; return await bootBackend(); }

Deno.test("nothing in the database is created or altered by a review beyond learn_progress, and no schema change is needed", async () => {
  const call = await world(); const tok = addStudent("u1");
  const before = JSON.stringify({ stages: table("stages"), chapters: table("chapters"), questions: table("questions"), options: table("options") });
  await passRun(call, tok, C1); await review(call, tok, C1); await passRun(call, tok, C1).catch(() => {});
  assert.equal(JSON.stringify({ stages: table("stages"), chapters: table("chapters"), questions: table("questions"), options: table("options") }), before, "content tables are never written");
});

Deno.test("an option whose text spans lines is marked correct whichever line ending the browser submits (CRLF stored, LF sent)", async () => {
  const call = await world(); const tok = addStudent("u1");
  table("prerequisites").length = 0;
  // Q000158 / Q000203 / Q000321 have multi-line option text; the browser sends LF even when the database stores CRLF
  for (const qid of ["Q000158", "Q000203", "Q000321"]) {
    const q = content.questions.find((x: Row) => x.question_id === qid);
    assert.ok(/\r\n|\n/.test(q.answer), qid + " has a multi-line answer");
    const run = await start(call, tok, q.chapter_id);
    for (const [label, sent] of [["stored form", q.answer], ["LF", q.answer.split("\r\n").join("\n")], ["CRLF", q.answer.split("\r\n").join("\n").split("\n").join("\r\n")]] as [string, string][]) {
      const r = await call("saveTestAnswer", { session_token: tok, test_run_id: run.test_run_id, question_id: qid, answer: sent });
      assert.equal(r.correct, true, `${qid} sent as ${label} must be correct`);
      table("attempts").length = 0; // (a question completes once answered correctly; reset so each form is tried fresh)
    }
    const wrong = await call("saveTestAnswer", { session_token: tok, test_run_id: run.test_run_id, question_id: qid, answer: q.answer + " nope" });
    assert.equal(wrong.correct, false, "a genuinely different answer is still wrong");
    table("attempts").length = 0; table("test_runs").length = 0;
  }
});
