#!/usr/bin/env node
/* Real-browser regression for the XP-earning visualizing-activity pipeline (index.html's renderActivitySlide
 * finish() -> queueActivityAttempt -> saveActivityAttempt, committed by the existing finishTest call).
 * Activities previously never earned XP by design (assets/learn/README.md: "learning interactions, not
 * assessments"); this locks in the current, intended behavior: a graded activity, actually completed
 * correctly (not skipped), earns its configured XP exactly once per chapter run, through the same
 * pending_xp/finishTest commit a graded question already uses.
 *
 * Unlike tests/chapter/e2e.chapters.js's own "every populated chapter" smoke test -- which engages each
 * activity with one exploratory click and then takes the Skip button once it appears, so it never actually
 * solves an activity and therefore never earns activity XP -- this file drives the REAL correct interaction
 * for each activity kind, so `onDone` genuinely fires and XP is genuinely earned.
 *
 *   npm i --no-save playwright-core
 *   node tests/chapter/e2e.activity-xp.js
 *   CH_ONLY=CH0034,CH0044 node tests/chapter/e2e.activity-xp.js     only those chapters
 *
 * See tests/e2e/lib.js for how the app is run (demo mode + CLICK's real production chapters/questions).
 */
"use strict";
const path = require("path");
const L = require("../e2e/lib.js");
const H = require("./helpers.js");
const { t, section, assert, noErrors } = L;
const decks = H.loadDecks();

// One or two representative chapters per activity kind family that reference it as a graded slide (found by
// cross-referencing each deck's `kind:"activity"` slides against assets/learn/defs/*.js's own `kind` field).
// tracetable (CH0056) needs `CL.exec`'s worker round trip to resolve before its cells populate -- handled below.
const CHAPTERS = (process.env.CH_ONLY ? process.env.CH_ONLY.split(",") : ["CH0031", "CH0032", "CH0034", "CH0035", "CH0039", "CH0044", "CH0045", "CH0047", "CH0056"]);

function expectedForChapter(cid) {
  const d = decks[cid];
  const acts = d.slides.filter((s) => s.kind === "activity").map((s) => s.activity);
  const served = H.servedFor(cid);
  return { activities: acts, questionCount: served.length, activityCount: acts.length, expectedXp: served.length + acts.length };
}

async function openChapter(spec, cid, viewport, opt) {
  const w = await L.open({ tested: L.before(cid), ...spec }, viewport, opt);
  const node = L.node(w.page, cid);
  // A chapter whose whole stage is now fully completed (e.g. it is the stage's LAST chapter and we seeded
  // it + everything before it as tested, for a review run) renders its stage collapsed on Home
  // (assets/home/path.js isOpen()); expand it first, exactly like tests/home/e2e.home-path.js does.
  if (!(await node.isVisible())) {
    const toggle = w.page.locator('.lp-stage:has(.lp-node[data-chapter="' + cid + '"]) .lp-toggle');
    if (await toggle.count()) await toggle.click();
  }
  await node.scrollIntoViewIfNeeded();
  await node.click();
  await w.page.waitForSelector("#testPage:not(.hidden) #testExercise");
  return w;
}
const stat = (page) => page.evaluate(() => ({ hearts: app.user.hearts, xp: app.user.total_xp }));

// Runs entirely in the browser: completes the CURRENT activity slide for real (not a skip), picking the
// kind-appropriate interaction so that onDone really fires and (outside review) queueActivityAttempt is called.
const COMPLETE_ACTIVITY_JS = async function () {
  function $all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function fire(el, type) { el.dispatchEvent(new Event(type, { bubbles: true })); }
  function findBtn(root, text) { return $all(root, "button").find((b) => b.textContent.trim() === text); }
  function clickBtn(root, text) { const b = findBtn(root, text); if (b && !b.disabled) b.click(); return b; }
  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
  async function waitFor(pred, timeout) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) { if (pred()) return true; await sleep(50); }
    return pred();
  }

  const s = currentSlide();
  const def = ClickLearn.defs.get(s.activity);
  const root = document.querySelector("#testExercise .la-k-" + def.kind) || document.querySelector("#testExercise section.la");
  if (!root) return { ok: false, reason: "activity section not found" };
  const kind = def.kind;

  if (kind === "mcq") {
    const idx = def.choices.findIndex((c) => c.correct);
    $all(root, ".la-choice")[idx].click();
    clickBtn(root, "Check");
  } else if (kind === "predict") {
    if (def.choices) {
      const idx = def.choices.indexOf(def.expected);
      $all(root, ".la-choice")[idx].click();
    } else {
      const ta = root.querySelector("textarea.la-input");
      ta.value = def.expected; fire(ta, "input");
    }
    clickBtn(root, "Check");
  } else if (kind === "fill") {
    const inputs = $all(root, ".la-blank");
    inputs.forEach((inp, i) => { inp.value = def.blanks[i].answers[0]; fire(inp, "input"); });
    clickBtn(root, "Check");
  } else if (kind === "order") {
    def.lines.forEach((text) => {
      const btn = $all(root, ".la-pool .la-piece").find((b) => b.textContent === text);
      if (btn) btn.click();
    });
    clickBtn(root, "Check");
  } else if (kind === "assign") {
    $all(root, ".la-assignrow").forEach((row) => {
      const text = row.querySelector("code").textContent;
      const item = def.items.find((it) => it.text === text);
      const sel = row.querySelector("select");
      sel.value = item.bucket; fire(sel, "change");
    });
    clickBtn(root, "Check");
  } else if (kind === "builder") {
    $all(root, "select").forEach((sel) => {
      const label = sel.getAttribute("aria-label");
      const key = Object.keys(def.slots).find((k) => (def.slots[k].label || k) === label);
      const ans = def.slots[key].answer;
      sel.value = ans === "" ? "__none__" : ans; fire(sel, "change");
    });
    clickBtn(root, "Check");
  } else if (kind === "reveal") {
    if (def.code) $all(root, ".la-token").forEach((btn) => btn.click());
    else $all(root, ".la-cardhead").forEach((btn) => btn.click());
  } else if (kind === "pipeline") {
    const threshold = Math.min(def.scenarios.length, 3);
    for (let i = 0; i < threshold; i++) {
      if (i > 0) { const radios = $all(root, "[role=radio]"); if (radios[i]) radios[i].click(); }
      clickBtn(root, "Run everything");
    }
  } else if (kind === "buffer") {
    for (let i = 0; i < 3; i++) { clickBtn(root, "Run all"); clickBtn(root, "Reset"); }
  } else if (kind === "bits") {
    const bit = root.querySelector(".la-bit:not(.ro)");
    for (let i = 0; i < 4; i++) if (bit) bit.click();
  } else if (kind === "evalorder") {
    // A successful click calls paint(), which rebuilds every .la-op button from scratch (exprEl.textContent = "" then
    // re-appended), so a captured element reference goes stale immediately -- checking ITS .disabled after the click
    // is checking a detached node and never reflects success. Detect progress from a fresh query instead: only a
    // successful apply() increases the number of .la-op.done buttons (a failed/not-ready click leaves the DOM alone).
    for (let guard = 0; guard < 50; guard++) {
      const candidates = $all(root, ".la-op:not(.done)");
      if (!candidates.length) break;
      let progressed = false;
      for (const b of candidates) {
        const before = $all(root, ".la-op.done").length;
        b.click();
        if ($all(root, ".la-op.done").length > before) { progressed = true; break; }
      }
      if (!progressed) break;
    }
  } else if (kind === "run") {
    const ta = root.querySelector("textarea.la-editor");
    if (def.goal && def.goal.changed) {
      ta.value = ta.value.replace(/"([^"]*)"/, (m, p1) => '"' + p1 + " (edited)\"");
      fire(ta, "input");
    }
    clickBtn(root, "Run");
  } else if (kind === "lab") {
    const first = root.querySelector(".la-control input, .la-control select");
    if (first) {
      if (first.type === "checkbox") { for (let i = 0; i < 3; i++) { first.checked = !first.checked; fire(first, "change"); } }
      else if (first.tagName === "SELECT") { for (let i = 0; i < Math.min(3, first.options.length); i++) { first.selectedIndex = i; fire(first, "change"); } }
      else { for (let i = 0; i < 3; i++) { first.value = String(Number(first.value || 0) + 1); fire(first, "input"); } }
    }
  } else if (kind === "challenge") {
    const ta = root.querySelector("textarea.la-editor");
    ta.value = def.solution; fire(ta, "input");
    clickBtn(root, "Check my code");
  } else if (kind === "trace") {
    // render() kicks off CL.exec(...) (a Worker round trip) and only enables "Next step" once it resolves.
    await waitFor(() => { const b = findBtn(root, "Next step"); return !!b && !b.disabled; }, 8000);
    for (let guard = 0; guard < 500; guard++) {
      const next = findBtn(root, "Next step");
      if (!next || next.disabled) break;
      next.click();
      await sleep(10);
    }
  } else if (kind === "error") {
    // Not itself one of the primary kinds under test here, but some chosen decks interleave it, so it still
    // needs to be completed to reach the chapter's end. Mirrors engine.js's own two modes.
    if (def.mode === "find") {
      const rows = $all(root, ".la-lineBtn");
      rows[def.bug].click();
    } else {
      clickBtn(root, "Compile");
      clickBtn(root, "Apply the fix");
      clickBtn(root, "Compile");
    }
  } else if (kind === "tracetable") {
    // Same: the table's cells are only populated once the mount-time CL.exec(...) resolves.
    await waitFor(() => $all(root, ".la-tablewrap .la-cell, .la-tablewrap select.la-select.inline").length > 0, 8000);
    clickBtn(root, "Show the answers");
    await sleep(50);
    const cells = $all(root, ".la-cell, select.la-select.inline").filter((e) => e.closest(".la-tablewrap"));
    const captured = cells.map((c) => c.value);
    clickBtn(root, "Reset");
    await sleep(50);
    const cells2 = $all(root, ".la-cell, select.la-select.inline").filter((e) => e.closest(".la-tablewrap"));
    cells2.forEach((c, i) => { c.value = captured[i]; fire(c, "input"); fire(c, "change"); });
    clickBtn(root, "Check");
  } else {
    return { ok: false, reason: "unhandled kind " + kind };
  }
  return { ok: true, kind, activity: s.activity };
};

// Async version for challenge/run/tracetable etc. which need to wait for CL.exec (a worker round trip) before Check/Run settles.
async function completeActivity(page) {
  const res = await page.evaluate(COMPLETE_ACTIVITY_JS);
  await page.waitForTimeout(600);
  return res;
}

async function playChapterComplete(page, dblTriggerFirstActivityOf) {
  const seen = [];
  let doubleTriggerActivityId = null;
  for (let guard = 0; guard < 40; guard++) {
    await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE" || !!document.querySelector("#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta"), null, { timeout: 20000 });
    if (await page.evaluate(() => document.getElementById("testTypeLabel").textContent === "COMPLETE")) break;
    const s = await L.slideKind(page);
    seen.push(s.kind + (s.activity ? ":" + s.activity : ""));
    if (s.kind === "explorer") {
      const t2 = page.locator(".ce-target"), n = await t2.count(), need = await page.evaluate(() => ClickExplorer.minTapsFor(currentSlide()));
      const idsSeen = new Set();
      for (let i = 0; i < n && idsSeen.size < need; i++) { const id = await t2.nth(i).getAttribute("data-target"); if (idsSeen.has(id)) continue; idsSeen.add(id); await t2.nth(i).click(); await page.waitForSelector("dialog.cg-sheet[open]"); await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]")); }
      await page.locator("#testCheck").click();
    } else if (s.kind === "activity") {
      const before = await page.evaluate(() => testState.pending);
      const r = await completeActivity(page);
      if (!r.ok) throw new Error("could not complete activity " + s.activity + " (" + s.id + "): " + r.reason);
      await page.waitForFunction(() => testState.slideDone === true, null, { timeout: 20000 });
      if (dblTriggerFirstActivityOf && s.activity === dblTriggerFirstActivityOf && !doubleTriggerActivityId) {
        doubleTriggerActivityId = s.activity;
      }
      await page.locator("#testCheck").click();
      seen.push("  (activity pending before=" + before + " after=" + (await page.evaluate(() => testState.pending)) + ")");
    } else {
      await L.answerQuestion(page, s.qid, true);
      await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent));
      await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent));
      await page.locator("#testCheck").click();
    }
  }
  await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE", null, { timeout: 15000 });
  return { seen, doubleTriggerActivityId };
}

async function clickFinish(page) {
  const label = await page.evaluate(() => document.getElementById("testTypeLabel").textContent);
  assert.equal(label, "COMPLETE");
  const btn = page.locator("#testCheck");
  if (await btn.isVisible()) await btn.click();
  await page.waitForFunction(() => document.getElementById("testPage").classList.contains("hidden") || !document.getElementById("testExercise"), null, { timeout: 15000 }).catch(() => {});
}

async function main() {
  const S = await L.start();
  console.log("Activity-XP e2e · " + S.base + " · " + path.basename(S.exe));

  for (const cid of CHAPTERS) {
    const info = expectedForChapter(cid);
    section(cid + " — questions=" + info.questionCount + " activities=" + info.activityCount + " (" + info.activities.join(", ") + ") expected +" + info.expectedXp + " XP");

    // ---- fresh run: complete the full chapter, including every activity for real ----
    const { ctx, page, errors } = await openChapter({}, cid, { width: 390, height: 844 }, { mobile: true });
    const before = await stat(page);
    let dblId = info.activities[0];
    await t(cid + ": completes full chapter run (real activity interaction) without throwing", async () => { await playChapterComplete(page, dblId); });
    await t(cid + ": finish button commits XP (finishTest)", async () => { await clickFinish(page); });
    const after = await stat(page);
    await t(cid + ": total_xp increased by exactly questionCount+activityCount", async () => {
      assert.equal(after.xp - before.xp, info.expectedXp, "expected +" + info.expectedXp + " got +" + (after.xp - before.xp) + " (before=" + before.xp + " after=" + after.xp + ")");
    });
    await t(cid + ": no JS errors during full run", async () => noErrors(errors, cid + " fresh run"));
    await ctx.close();

    // ---- review run: same chapter, already completed -> no XP ----
    const r2 = await openChapter({ tested: L.before(cid).concat([cid]) }, cid, { width: 390, height: 844 }, { mobile: true });
    const beforeReview = await stat(r2.page);
    await t(cid + " (review): mode is review", async () => { assert.equal(await r2.page.evaluate(() => testState.mode), "review"); });
    await t(cid + " (review): completes full chapter run (interacting with activities again) without throwing", async () => { await playChapterComplete(r2.page, null); });
    await t(cid + " (review): finish does not award XP", async () => { await clickFinish(r2.page); });
    const afterReview = await stat(r2.page);
    await t(cid + " (review): total_xp unchanged", async () => {
      assert.equal(afterReview.xp, beforeReview.xp, "review run should not change XP: before=" + beforeReview.xp + " after=" + afterReview.xp);
    });
    await t(cid + " (review): no JS errors", async () => noErrors(r2.errors, cid + " review run"));
    await r2.ctx.close();
  }

  // ---- direct double-trigger of queueActivityAttempt for the same activity/run -> server-side guard ----
  section("Double-trigger defense: calling queueActivityAttempt twice for the same activity in one run");
  {
    const cid = CHAPTERS[0];
    const info = expectedForChapter(cid);
    const actId = info.activities[0];
    const { ctx, page, errors } = await openChapter({}, cid, { width: 390, height: 844 }, { mobile: true });
    await t(cid + ": queueActivityAttempt(" + actId + ") called twice in a row only pays XP once (demo server-side idempotency)", async () => {
      const p1 = await page.evaluate((id) => queueActivityAttempt(id).then(() => testState.pending), actId);
      const p2 = await page.evaluate((id) => queueActivityAttempt(id).then(() => testState.pending), actId);
      assert.equal(p1, p2, "second call must not add more pending XP: first=" + p1 + " second=" + p2);
    });
    await t(cid + ": no JS errors from the double-trigger probe", async () => noErrors(errors, cid + " double-trigger"));
    await ctx.close();
  }

  // ---- XP persists across a fresh browser session (new context, same seeded localStorage) ----
  section("XP persistence across a fresh browser session");
  {
    const cid = CHAPTERS[0];
    const { ctx, page, errors } = await openChapter({}, cid, { width: 390, height: 844 }, { mobile: true });
    await playChapterComplete(page, null);
    await clickFinish(page);
    const after = await stat(page);
    const ls = await page.evaluate(() => localStorage.getItem("clickDemoStateV13"));
    await noErrors(errors, cid + " persistence setup");
    await ctx.close();

    const ctx2 = await S.browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
    const page2 = await ctx2.newPage();
    const errors2 = [];
    // Same IGNORED_CONSOLE noise filter tests/e2e/lib.js's own open() applies internally -- this context is
    // hand-built (a fresh session reopen, not L.open()), so it needs the same filter spelled out here.
    const IGNORED_CONSOLE = /favicon|vibrate|fonts\.g|net::ERR|Failed to load resource|Practice connection|Could not save tour completion|Service Worker|autocomplete/;
    page2.on("pageerror", (e) => errors2.push("pageerror: " + e.message));
    page2.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !IGNORED_CONSOLE.test(m.text())) errors2.push(m.type() + ": " + m.text().slice(0, 240)); });
    await page2.addInitScript((lsVal) => { try { localStorage.setItem("clickDemoStateV13", lsVal); } catch (e) {} }, ls);
    await page2.goto(S.base + "/?demo=1", { waitUntil: "load" });
    await L.bootDemo(page2);
    const reopened = await stat(page2);
    await t(cid + ": total_xp persists after closing context and reopening a fresh session with the same seeded localStorage", async () => {
      assert.equal(reopened.xp, after.xp, "XP after reopen should equal XP right after finishing: after=" + after.xp + " reopened=" + reopened.xp);
    });
    await noErrors(errors2, cid + " persistence reopen");
    await ctx2.close();
  }

  await L.stop(S);
  L.finish();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
