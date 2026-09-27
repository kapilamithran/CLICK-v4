// Unit tests for the Home learning-path model (assets/home/path.js). Node only, no browser.
//   node --test "tests/home/*.test.js"
// The model must only *read* the existing progress state (stages / chapters / stage_progress / chapter_progress);
// these tests pin that it never invents progress, never unlocks anything the backend didn't, and orders things like the app does.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const HP = require(path.resolve(__dirname, "..", "..", "assets", "home", "path.js"));

// The real stage/chapter data ships inside index.html (DEMO_DATA), so the tests run against CLICK's actual content.
const DATA = (() => {
  const line = fs.readFileSync(path.resolve(__dirname, "..", "..", "index.html"), "utf8").split("\n").find((l) => l.startsWith("const DEMO_DATA="));
  return eval("(" + line.slice("const DEMO_DATA=".length).replace(/;\s*\r?$/, "") + ")");
})();
const byStage = (sid) => DATA.chapters.filter((c) => c.stage_id === sid).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

// Mirrors the sequential rules the backend applies (chapter n needs chapter n-1's test; stage n needs stage n-1 complete).
// The model itself never computes this -- it only reads `unlocked` -- so the tests derive it independently, like the backend does.
function appWith({ tested = [], learned = [] }) {
  const T = new Set(tested), Lr = new Set([...learned, ...tested]);
  const stageDone = (sid) => byStage(sid).length > 0 && byStage(sid).every((c) => T.has(c.chapter_id));
  const chapter_progress = DATA.chapters.map((c, i) => {
    const stageIdx = DATA.stages.findIndex((s) => s.stage_id === c.stage_id);
    const stageOk = stageIdx === 0 || stageDone(DATA.stages[stageIdx - 1].stage_id);
    const list = byStage(c.stage_id), pos = list.findIndex((x) => x.chapter_id === c.chapter_id);
    const chapOk = pos === 0 || T.has(list[pos - 1].chapter_id);
    const unlocked = stageOk && chapOk;
    return { chapter_id: c.chapter_id, stage_id: c.stage_id, learn_completed: Lr.has(c.chapter_id), test_completed: T.has(c.chapter_id), best_xp: T.has(c.chapter_id) ? 30 : 0, unlocked, lock_reason: unlocked ? "" : (stageOk ? "Complete the previous chapter first." : "Unlock this stage after the previous stage.") };
  });
  const stage_progress = DATA.stages.map((s, i) => {
    const cs = byStage(s.stage_id), done = cs.filter((c) => T.has(c.chapter_id)).length;
    const ok = i === 0 || stageDone(DATA.stages[i - 1].stage_id);
    return { stage_id: s.stage_id, completed_chapters: done, total_chapters: cs.length, progress_percent: cs.length ? Math.round((done * 100) / cs.length) : 0, test_completed: cs.length > 0 && done === cs.length, unlocked: ok, lock_reason: ok ? "" : "Unlock this stage after the previous stage." };
  });
  return { stages: DATA.stages, chapters: DATA.chapters, stage_progress, chapter_progress };
}
const ids = (sid, from, to) => byStage(sid).slice(from, to).map((c) => c.chapter_id);
const S0 = "STG000", S1 = "STG001", S2 = "STG002";

test("a brand-new student: chapter 1 is current, everything else is locked", () => {
  const m = HP.build(appWith({}));
  assert.deepStrictEqual(m.current, { stageId: S0, chapterId: byStage(S0)[0].chapter_id, stageIndex: 0, nodeIndex: 0 });
  const states = m.stages[0].nodes.map((n) => n.state);
  assert.strictEqual(states[0], "current");
  assert.ok(states.slice(1).every((s) => s === "locked"));
  assert.strictEqual(m.stages[0].status, "current");
  assert.ok(m.stages.slice(1).every((s) => s.status === "locked"));
  assert.strictEqual(m.allComplete, false);
});

test("every stage and chapter in the source data is present, in source order, with source titles", () => {
  const m = HP.build(appWith({}));
  assert.deepStrictEqual(m.stages.map((s) => s.stageId), DATA.stages.map((s) => s.stage_id));
  assert.deepStrictEqual(m.stages.map((s) => s.title), DATA.stages.map((s) => s.title));
  assert.strictEqual(m.stages.reduce((n, s) => n + s.nodes.length, 0), DATA.chapters.length);
  for (const s of m.stages) {
    assert.deepStrictEqual(s.nodes.map((n) => n.chapterId), byStage(s.stageId).map((c) => c.chapter_id));
    assert.deepStrictEqual(s.nodes.map((n) => n.title), byStage(s.stageId).map((c) => c.title));
    assert.deepStrictEqual(s.nodes.map((n) => n.chapterNo), byStage(s.stageId).map((c) => c.chapter_no));
  }
});

test("tested chapters are completed, the next one is current, the rest of the stage is locked", () => {
  const m = HP.build(appWith({ tested: ids(S0, 0, 3) }));
  const s = m.stages[0];
  assert.deepStrictEqual(s.nodes.slice(0, 3).map((n) => n.state), ["completed", "completed", "completed"]);
  assert.strictEqual(s.nodes[3].state, "current");
  assert.ok(s.nodes.slice(4).every((n) => n.state === "locked"));
  assert.deepStrictEqual([s.done, s.total, s.percent], [3, byStage(S0).length, Math.round((3 * 100) / byStage(S0).length)]);
  assert.strictEqual(m.current.chapterId, s.nodes[3].chapterId);
});

test("a legacy student who only did the old Learn half simply starts the chapter run: not completed, no fake progress, nothing reset", () => {
  const m = HP.build(appWith({ tested: ids(S0, 0, 2), learned: ids(S0, 2, 3) }));
  const n = m.stages[0].nodes[2];
  assert.strictEqual(n.state, "current");
  assert.strictEqual(n.phase, "start");
  assert.strictEqual(m.stages[0].done, 2, "learning a chapter is not a completed chapter");
  assert.strictEqual(HP.nodeSub(n), "Start chapter");
  const fresh = m.stages[0].nodes[3];
  assert.strictEqual(fresh.state, "locked", "learning chapter 3 must not unlock chapter 4 -- only its test does");
});

test("the current chapter starts a run; a finished chapter opens as a review; a locked one opens nothing", () => {
  const nodes = HP.build(appWith({ tested: ids(S0, 0, 1) })).stages[0].nodes;
  assert.strictEqual(nodes[0].phase, "review");
  assert.strictEqual(nodes[1].phase, "start");
  assert.strictEqual(nodes[2].phase, "locked");
  assert.strictEqual(HP.nodeSub(nodes[1]), "Start chapter");
  assert.match(HP.nodeSub(nodes[0]), /^Completed · \d+ XP$/);
});

test("locked chapters carry the backend's own lock reason, and the model never unlocks what the backend locked", () => {
  const app = appWith({});
  const n = HP.build(app).stages[0].nodes[5];
  assert.strictEqual(n.state, "locked");
  assert.strictEqual(n.lockReason, "Complete the previous chapter first.");
  assert.match(HP.nodeAria(n), /locked\. Complete the previous chapter first\./);
  // even if a later chapter is marked learned, it stays locked when the backend says unlocked:false
  const app2 = appWith({});
  app2.chapter_progress.find((c) => c.chapter_id === byStage(S0)[5].chapter_id).learn_completed = true;
  assert.strictEqual(HP.build(app2).stages[0].nodes[5].state, "locked");
});

test("a chapter the backend marks unlocked is never drawn locked (no second unlock rule)", () => {
  const app = appWith({});
  const target = byStage(S0)[7].chapter_id;
  Object.assign(app.chapter_progress.find((c) => c.chapter_id === target), { unlocked: true, lock_reason: "" });
  const nodes = HP.build(app).stages[0].nodes;
  assert.strictEqual(nodes[0].state, "current");
  assert.strictEqual(nodes[7].state, "available", "unlocked but not the first open chapter -> available, and still enterable");
});

test("a chapter with no progress row is locked with the app's default reason (same default as chapterProg())", () => {
  const app = appWith({});
  app.chapter_progress = app.chapter_progress.filter((c) => c.chapter_id !== byStage(S0)[0].chapter_id);
  const n = HP.build(app).stages[0].nodes[0];
  assert.strictEqual(n.state, "locked");
  assert.strictEqual(n.lockReason, "Complete prerequisite content first.");
});

test("finishing the last chapter of a stage completes it and makes the next stage current -- and nothing further", () => {
  const m = HP.build(appWith({ tested: byStage(S0).map((c) => c.chapter_id) }));
  assert.strictEqual(m.stages[0].status, "completed");
  assert.strictEqual(m.stages[0].percent, 100);
  assert.strictEqual(m.stages[1].status, "current");
  assert.strictEqual(m.current.stageId, S1);
  assert.strictEqual(m.current.chapterId, byStage(S1)[0].chapter_id);
  assert.strictEqual(m.stages[2].status, "locked");
  assert.ok(m.stages[2].nodes.every((n) => n.state === "locked"));
});

test("locked stage: status, reason and every node locked", () => {
  const s = HP.build(appWith({})).stages[2];
  assert.strictEqual(s.status, "locked");
  assert.strictEqual(s.lockReason, "Unlock this stage after the previous stage.");
  assert.ok(s.nodes.every((n) => n.state === "locked" && n.lockReason));
});

test("everything completed: no current chapter, allComplete", () => {
  const m = HP.build(appWith({ tested: DATA.chapters.map((c) => c.chapter_id) }));
  assert.strictEqual(m.current, null);
  assert.strictEqual(m.allComplete, true);
  assert.ok(m.stages.every((s) => s.status === "completed" && s.percent === 100));
});

test("connectors follow progress: done between completed, active into the current node, future beyond", () => {
  const nodes = HP.build(appWith({ tested: ids(S0, 0, 3) })).stages[0].nodes;
  assert.deepStrictEqual(nodes.slice(0, 4).map((n) => n.link), ["done", "done", "active", "future"]);
  assert.ok(nodes.slice(4, 10).every((n) => n.link === "future"));
});

test("lanes snake centre, right, centre, left", () => {
  const nodes = HP.build(appWith({})).stages[0].nodes;
  assert.deepStrictEqual(nodes.slice(0, 8).map((n) => n.lane), ["c", "r", "c", "l", "c", "r", "c", "l"]);
});

test("chapter order follows `order` (numerically), like stageChapters() in index.html", () => {
  const app = { stages: [{ stage_id: "S", stage_no: 0, title: "T" }], chapters: [{ chapter_id: "b", stage_id: "S", order: "10", title: "ten", chapter_no: 10 }, { chapter_id: "a", stage_id: "S", order: "9", title: "nine", chapter_no: 9 }], stage_progress: [], chapter_progress: [{ chapter_id: "a", unlocked: true }, { chapter_id: "b", unlocked: true }] };
  assert.deepStrictEqual(HP.build(app).stages[0].nodes.map((n) => n.chapterId), ["a", "b"]);
});

test("injected helpers (index.html's own prog/chapterProg/stageChapters) take precedence over the fallbacks", () => {
  const app = appWith({});
  let calls = 0;
  const m = HP.build(app, { chapterProg: (cid) => { calls++; return { learn_completed: false, test_completed: cid === byStage(S0)[0].chapter_id, unlocked: true, best_xp: 5 }; } });
  assert.ok(calls > 0);
  assert.strictEqual(m.stages[0].nodes[0].state, "completed");
  assert.strictEqual(m.stages[0].nodes[0].xp, 5);
});

test("titles are HTML-escaped when rendered (chapter titles contain <, ` and quotes)", () => {
  const app = { stages: [{ stage_id: "S", stage_no: 0, title: "A <b>stage</b>" }], chapters: [{ chapter_id: "c", stage_id: "S", order: 1, title: "Including `<stdio.h>` & \"quotes\"", chapter_no: 1 }], stage_progress: [], chapter_progress: [{ chapter_id: "c", unlocked: true }] };
  const html = HP.modelHTML(HP.build(app));
  assert.ok(!html.includes("<stdio.h>"), "raw tag from a title must not reach the markup");
  assert.ok(!html.includes("<b>stage</b>"));
  assert.ok(html.includes("&lt;stdio.h&gt;") && html.includes("&quot;quotes&quot;"));
});

test("stage with no chapters renders a card and no path", () => {
  const app = { stages: [{ stage_id: "S", stage_no: 9, title: "Empty" }], chapters: [], stage_progress: [], chapter_progress: [] };
  const m = HP.build(app);
  assert.strictEqual(m.stages[0].nodes.length, 0);
  assert.strictEqual(m.stages[0].status, "available");
  const html = HP.modelHTML(m);
  assert.ok(html.includes("No chapters in this stage yet") && !html.includes("lp-path"));
});

test("accessible names say chapter, title and state, not just an icon", () => {
  const m = HP.build(appWith({ tested: ids(S0, 0, 1) }));
  const [done, cur, locked] = m.stages[0].nodes;
  assert.match(HP.nodeAria(done), /^Chapter 1, .+, completed\. Tap to review the chapter\./);
  assert.match(HP.nodeAria(cur), /^Chapter 2, .+, current, tap to start the chapter\./);
  assert.match(HP.nodeAria(locked), /^Chapter 3, .+, locked\. /);
});
