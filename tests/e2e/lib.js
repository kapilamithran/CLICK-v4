/* Shared helpers for CLICK's real-browser tests (tests/home/e2e.home-path.js, tests/chapter/e2e.chapters.js).
 *
 *   npm i --no-save playwright-core        (drives an installed Chrome / Edge / Chromium: no browser download)
 *   env: CLICK_BROWSER=<path to chrome/edge/chromium>   CLICK_SHOT_DIR=<dir for screenshots>
 *
 * The app runs in its built-in demo mode (?demo=1) but with CLICK's REAL production content (tests/fixtures/production-content.json:
 * the 32 populated chapters and their questions) swapped in for the demo dataset, and with progress seeded through the demo store
 * (localStorage "clickDemoStateV13"). Nothing here talks to the production backend.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
// (playwright-core is loaded only when a browser is actually started, so tests/e2e/preview.js works with no dependencies at all)
function loadChromium() {
  try { return require("playwright-core").chromium; } catch (e) { console.error("playwright-core is required: npm i --no-save playwright-core"); process.exit(2); }
}

const REPO = path.resolve(__dirname, "..", "..");
const SHOT_DIR = process.env.CLICK_SHOT_DIR || "";
if (SHOT_DIR) fs.mkdirSync(SHOT_DIR, { recursive: true });
const fx = JSON.parse(fs.readFileSync(path.join(REPO, "tests", "fixtures", "production-content.json"), "utf8"));

// ------------------------------------------------------------------ content, in the shape the app's demo backend expects
const ORDERED = fx.chapters.slice().sort((a, b) => (a.stage_id === b.stage_id ? a.order - b.order : a.stage_id.localeCompare(b.stage_id)));
const chaptersOf = (sid) => fx.chapters.filter((c) => c.stage_id === sid).sort((a, b) => a.order - b.order);
const ids = (sid, from, to) => chaptersOf(sid).slice(from, to).map((c) => c.chapter_id);
const questionsOf = (cid) => fx.questions.filter((q) => q.chapter_id === cid).sort((a, b) => a.order - b.order);
// what a unified run serves (mirrors the edge function: question_limit or 5, capped at 8, in order)
const servedOf = (cid) => { const c = fx.chapters.find((x) => x.chapter_id === cid); return questionsOf(cid).slice(0, Math.min(Number(c.question_limit) || 5, 8)); };
const xpOf = (q) => Math.min(2, Math.max(1, Number(q.xp || 1)));
const before = (cid) => ORDERED.slice(0, ORDERED.findIndex((c) => c.chapter_id === cid)).map((c) => c.chapter_id);
const after = (cid) => (ORDERED[ORDERED.findIndex((c) => c.chapter_id === cid) + 1] || {}).chapter_id;

function demoData() {
  const stages = fx.stages.map((s) => ({ stage_id: s.stage_id, stage_no: s.stage_no, title: s.title, order: s.order, active: true }));
  const glossary = Object.fromEntries(fx.glossary.map((g) => [g.term_id, g]));
  const chapter_questions = {};
  fx.questions.forEach((q) => {
    const options = fx.options.filter((o) => o.question_id === q.question_id).sort((a, b) => a.order - b.order).map((o) => ({ option_id: o.option_id, text: o.option_text, value: o.option_text, order: o.order }));
    const terms = fx.question_terms.filter((t) => t.question_id === q.question_id).sort((a, b) => a.order - b.order).map((t) => ({ term_id: t.term_id, display_text: t.display_text, term: (glossary[t.term_id] || {}).term || t.display_text, definition: (glossary[t.term_id] || {}).definition || "", color: (glossary[t.term_id] || {}).color || "#5867d8" }));
    const hint = (fx.test_hints.filter((h) => h.question_id === q.question_id).sort((a, b) => a.order - b.order)[0] || {}).hint_text || "";
    (chapter_questions[q.chapter_id] = chapter_questions[q.chapter_id] || []).push({ question_id: q.question_id, stage_id: q.stage_id, chapter_id: q.chapter_id, type: String(q.type).toUpperCase(), prompt: q.prompt || "", code: q.code || "", answer: q.answer || "", explanation: q.explanation || "", hint, terms, xp: xpOf(q), order: Number(q.order || 0), options });
  });
  Object.values(chapter_questions).forEach((l) => l.sort((a, b) => a.order - b.order));
  // The live prerequisite rows are not in the repo; model the documented rules: chapters unlock in order, a stage after the previous one.
  const prerequisites = [];
  stages.forEach((s, i) => {
    if (i) prerequisites.push({ target_id: s.stage_id, prerequisite_id: stages[i - 1].stage_id, condition: "completed", description: "Unlock this stage after the previous stage.", active: true });
    const cs = chaptersOf(s.stage_id);
    cs.forEach((c, j) => { if (j) prerequisites.push({ target_id: c.chapter_id, prerequisite_id: cs[j - 1].chapter_id, condition: "completed", description: "Complete the previous micro-chapter test first.", active: true }); });
  });
  return { stages, chapters: fx.chapters.map((c) => ({ ...c })), learn_content: fx.learn_content.map((l) => ({ ...l, active: true })), practice: [], announcements: [], phrases: [{ category: "motivation", phrase: "Small steps build strong code." }], chapter_questions, prerequisites };
}

// spec: { tested:[chapterIds], learned:[chapterIds], hearts, xp, recChapter, theme, noUsername, onboarded }
function seedState(spec) {
  const learnProgress = {}, chapterProgress = {};
  (spec.learned || []).forEach((c) => (learnProgress[c] = { completed: true, times: 1 }));
  (spec.tested || []).forEach((c) => { learnProgress[c] = { completed: true, times: 1 }; chapterProgress[c] = { test: true, xp: 6 }; });
  const rec = spec.recChapter ? fx.chapters.find((c) => c.chapter_id === spec.recChapter) : null;
  return { user: { user_id: "DEMO", name: "Tester", roll_no: "T001", department: "CSE", email: "admin@click.demo", phone: "", total_xp: spec.xp == null ? 120 : spec.xp, streak: 0, hearts: spec.hearts == null ? 3 : spec.hearts, tests_completed: 0, questions_attempted: 0, correct_answers: 0, accuracy_percent: 0, stages_completed: 0, last_completed_stage: "", last_learn_stage: "", last_learn_chapter: "", heart_recovery_stage_id: rec ? rec.stage_id : "", heart_recovery_chapter_id: rec ? rec.chapter_id : "", role: "student", username: spec.noUsername ? "" : "tester", onboarding_completed: spec.onboarded !== false }, learnProgress, chapterProgress };
}

// ------------------------------------------------------------------ static server (the app is static; index.html gets the production data)
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".svg": "image/svg+xml" };
function serve() {
  const data = JSON.stringify(demoData());
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split("?")[0]);
      const file = path.join(REPO, p === "/" ? "index.html" : p);
      if (!file.startsWith(REPO) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
      if (path.basename(file) === "index.html" && path.dirname(file) === REPO) {
        return res.end(fs.readFileSync(file, "utf8").replace(/const DEMO_DATA=.*(\r?\n)/, () => "const DEMO_DATA=" + data + ";\n"));
      }
      fs.createReadStream(file).pipe(res);
    }).listen(0, "127.0.0.1", () => resolve({ srv, base: "http://127.0.0.1:" + srv.address().port }));
  });
}
function findBrowser() {
  const c = [process.env.CLICK_BROWSER, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].filter(Boolean);
  return c.find((p) => fs.existsSync(p));
}

const IGNORED_CONSOLE = /favicon|vibrate|fonts\.g|net::ERR|Failed to load resource|Practice connection|Could not save tour completion|Service Worker|autocomplete/; // (the last few: demo-only noise, the offline backend does not implement those actions)
const ctxState = { browser: null, base: "" };
async function start() {
  const exe = findBrowser();
  if (!exe) { console.error("No Chrome/Edge/Chromium found. Set CLICK_BROWSER."); process.exit(2); }
  const { srv, base } = await serve();
  ctxState.base = base;
  ctxState.browser = await loadChromium().launch({ executablePath: exe, headless: true });
  return { srv, base, exe, browser: ctxState.browser };
}
async function stop(s) { await ctxState.browser.close(); s.srv.close(); }

// The app's own boot can't start a pre-seeded demo session: in demo mode post() resolves synchronously, so loadApp() runs before the later
// <script> that defines hideUsernameGate (pre-existing, demo-only; the real backend fetch is async). Start it after the page has loaded instead.
async function bootDemo(page) {
  await page.evaluate(async () => {
    const st = JSON.parse(localStorage.getItem("clickDemoStateV13"));
    session = { token: "DEMO", demo: true, user: st.user };
    localStorage.setItem("clickSession", JSON.stringify(session));
    document.getElementById("authGate").classList.add("hidden");
    await loadApp(true);
  });
  await page.waitForSelector("#stageGrid .lp-stage", { timeout: 20000 });
}

async function open(spec = {}, viewport = { width: 390, height: 844 }, opt = {}) {
  const ctx = await ctxState.browser.newContext({ viewport, isMobile: !!opt.mobile, hasTouch: !!opt.mobile, reducedMotion: opt.reducedMotion || "no-preference", serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (["error", "warning"].includes(m.type()) && !IGNORED_CONSOLE.test(m.text())) errors.push(m.type() + ": " + m.text().slice(0, 240)); });
  page.on("dialog", (d) => d.accept());
  const st = seedState(spec), cids = fx.chapters.map((c) => c.chapter_id);
  await page.addInitScript(([st, theme, cids]) => {
    try {
      if (!localStorage.getItem("clickDemoStateV13")) localStorage.setItem("clickDemoStateV13", JSON.stringify(st));
      localStorage.setItem("clickTheme", theme);
      localStorage.setItem("click_videos_enabled", "false"); // the app's own "Videos" preference: keeps headless runs from waiting on playback
      cids.forEach((c) => { localStorage.setItem("clickChapterVideo_intro_DEMO_" + c, "1"); localStorage.setItem("clickChapterVideo_outro_DEMO_" + c, "1"); });
    } catch (e) {}
  }, [st, spec.theme || "dark", cids]);
  await page.goto(ctxState.base + "/?demo=1", { waitUntil: "load" });
  await bootDemo(page);
  return { ctx, page, errors };
}
// A page that has loaded the app but not started a session (for the login / username gates).
async function openBare(viewport = { width: 390, height: 844 }) {
  const ctx = await ctxState.browser.newContext({ viewport, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto(ctxState.base + "/?demo=1", { waitUntil: "load" });
  return { ctx, page };
}
const shot = async (page, name) => { if (SHOT_DIR) await page.screenshot({ path: path.join(SHOT_DIR, name + ".png") }); };
const node = (page, cid) => page.locator('.lp-node[data-chapter="' + cid + '"]');

// ------------------------------------------------------------------ playing a chapter
// Answers the current question slide the way a student would, using the FIXTURE's answer (not the app's copy of it).
async function answerQuestion(page, qid, ok = true) {
  const q = fx.questions.find((x) => x.question_id === qid), t = q.type, a = q.answer;
  if (["MCQ", "PREDICT_OUTPUT", "FIND_ERROR", "TRUE_FALSE"].includes(t)) {
    const wrong = fx.options.filter((o) => o.question_id === qid && o.option_text !== a)[0];
    const lf = (s) => String(s).split("\r\n").join("\n"); // the DOM normalises CRLF to LF in attribute values
    const pick = lf(ok ? a : wrong.option_text);
    await page.locator("#testExercise .option").evaluateAll((els, v) => els.find((e) => e.dataset.value.split("\r\n").join("\n") === v).click(), pick);
  } else if (t === "BLANK" || t === "TYPE_CODE") await page.locator("#testTextAnswer").fill(ok ? a : "zzz wrong zzz");
  else if (t === "CODE_FILL") { const parts = JSON.parse(a); const boxes = page.locator("#testExercise .test-code-fill-box"); for (let i = 0; i < parts.length; i++) await boxes.nth(i).fill(ok ? parts[i] : "zzz"); }
  else if (t === "ORDER") {
    const toks = ok ? a.split("||") : a.split("||").reverse().concat("zzz").slice(0, a.split("||").length);
    for (const tok of toks) await page.locator("#testExercise .test-v11-token").evaluateAll((els, v) => { const e = els.find((x) => x.dataset.value === v && !x.disabled) || els.find((x) => !x.disabled); if (e) e.click(); }, tok);
  }
  await page.locator("#testCheck").click();
}
// Opens enough different code parts to satisfy the Code Explorer's tap goal, then presses Continue (what a student does on slide 1).
async function passExplorer(page) {
  const need = await page.evaluate(() => ClickExplorer.minTapsFor(currentSlide())), tg = page.locator(".ce-target"), done = new Set();
  for (let i = 0; i < (await tg.count()) && done.size < need; i++) { const id = await tg.nth(i).getAttribute("data-target"); if (done.has(id)) continue; done.add(id); await tg.nth(i).click(); await page.waitForSelector("dialog.cg-sheet[open]"); await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]")); }
  await page.waitForFunction(() => !document.getElementById("testCheck").disabled);
  await page.locator("#testCheck").click();
}
const slideKind = (page) => page.evaluate(() => { const s = currentSlide(); return { kind: s.kind, id: s.id, qid: s.q && s.q.question_id, activity: s.activity, index: testState.index, total: testState.slides.length }; });

// Plays the open chapter run to its end. opts: { wrong: n = wrong attempts to make on the first question (0..3) }. Returns what happened.
async function playToEnd(page, opts = {}) {
  const seen = [];
  for (let guard = 0; guard < 30; guard++) {
    await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE" || !!document.querySelector("#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta"), null, { timeout: 15000 });
    if (await page.evaluate(() => document.getElementById("testTypeLabel").textContent === "COMPLETE")) break;
    const s = await slideKind(page);
    seen.push(s.kind);
    if (s.kind === "explorer") {
      const t = page.locator(".ce-target"), n = await t.count(), need = await page.evaluate(() => ClickExplorer.minTapsFor(currentSlide()));
      const idsSeen = new Set();
      for (let i = 0; i < n && idsSeen.size < need; i++) { const id = await t.nth(i).getAttribute("data-target"); if (idsSeen.has(id)) continue; idsSeen.add(id); await t.nth(i).click(); await page.waitForSelector("dialog.cg-sheet[open]"); await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]")); }
      await page.locator("#testCheck").click();
    } else if (s.kind === "activity") {
      // an activity is a teaching aid: interact once, then it can be skipped (or it finishes on its own)
      const fallback = await page.locator("#testExercise p.meta").count();
      if (!fallback) {
        await page.locator("#testExercise").click({ position: { x: 6, y: 6 } });
        await page.waitForFunction(() => !document.getElementById("testCheck").disabled || !document.getElementById("testSkip").hidden, null, { timeout: 5000 });
        if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click();
      }
      await page.locator("#testCheck").click();
    } else {
      // opts.wrong = how many wrong attempts to make on the FIRST question (3 = use all attempts and lose a heart)
      const wrongs = seen.filter((k) => k === "question").length === 1 ? (opts.wrong || 0) : 0;
      for (let w = 0; w < wrongs; w++) {
        await answerQuestion(page, s.qid, false);
        await page.waitForFunction(() => /Try again|Three attempts/.test(document.getElementById("testFeedbackV11").textContent));
        if (w < 2) await page.waitForFunction(() => !document.getElementById("testCheck").disabled && document.getElementById("testCheck").textContent === "CHECK"); // retry re-armed
      }
      if (wrongs < 3) { await answerQuestion(page, s.qid, true); await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent)); }
      await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent));
      await page.locator("#testCheck").click();
    }
  }
  await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE", null, { timeout: 15000 });
  return seen;
}

// ------------------------------------------------------------------ tiny test runner
const results = [];
const assert = require("node:assert/strict");
async function t(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push({ name, ok: true, ms: Date.now() - t0 }); console.log("  ✔ " + name); }
  catch (e) { results.push({ name, ok: false, ms: Date.now() - t0, err: e }); console.log("  ✖ " + name + "\n      " + String(e && e.message || e).split("\n").slice(0, 8).join("\n      ")); }
}
const section = (s) => console.log("\n" + s);
const noErrors = (errors, where) => assert.deepStrictEqual(errors, [], "JS errors " + (where || "") + ": " + errors.join(" | "));
function finish() {
  const failed = results.filter((r) => !r.ok);
  console.log("\n" + (results.length - failed.length) + " passed, " + failed.length + " failed, " + results.length + " total");
  process.exitCode = failed.length ? 1 : 0;
}

module.exports = { serve, openBare, passExplorer, REPO, fx, ORDERED, chaptersOf, ids, questionsOf, servedOf, xpOf, before, after, demoData, seedState, start, stop, open, bootDemo, shot, node, answerQuestion, slideKind, playToEnd, t, section, assert, noErrors, finish, results };
