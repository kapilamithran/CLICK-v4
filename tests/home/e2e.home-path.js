#!/usr/bin/env node
/* Real-browser tests for the Home learning path (the map that opens every chapter).
 *
 *   npm i --no-save playwright-core
 *   node tests/home/e2e.home-path.js
 *   (env: CLICK_BROWSER=<chrome/edge/chromium>, CLICK_SHOT_DIR=<screenshots>)
 *
 * The app runs in demo mode on CLICK's real production chapters (see tests/e2e/lib.js). The chapter run itself is covered by
 * tests/chapter/e2e.chapters.js; here we test the map: navigation, what it shows, what tapping does, layout, themes, accessibility.
 */
"use strict";
const path = require("path");
const L = require("../e2e/lib.js");
const { t, section, assert, noErrors, fx } = L;

const S0 = "STG001", S1 = "STG002", S2 = "STG003";
const MID = { tested: [...L.ids(S0), ...L.ids(S1, 0, 3)] };   // stage 1 done (5/5), stage 2 has 3 of 5 tested -> the 4th chapter is current
const CUR = L.chaptersOf(S1)[3].chapter_id;
const TOTAL = fx.chapters.length;

// ------------------------------------------------------------------ in-page geometry (current stage): overlaps, off-screen, stray connectors
const GEOMETRY = () => {
  const R = (el) => { const r = el.getBoundingClientRect(); return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY }; };
  const hit = (a, b, pad = 0) => a.l < b.r - pad && b.l < a.r - pad && a.t < b.b - pad && b.t < a.b - pad;
  const strips = (el) => {
    const r = R(el), cs = getComputedStyle(el), bt = parseFloat(cs.borderTopWidth), br = parseFloat(cs.borderRightWidth), bb = parseFloat(cs.borderBottomWidth), bl = parseFloat(cs.borderLeftWidth), out = [];
    if (bt) out.push({ l: r.l, t: r.t, r: r.r, b: r.t + bt });
    if (br) out.push({ l: r.r - br, t: r.t, r: r.r, b: r.b });
    if (bb) out.push({ l: r.l, t: r.b - bb, r: r.r, b: r.b });
    if (bl) out.push({ l: r.l, t: r.t, r: r.l + bl, b: r.b });
    return out;
  };
  const steps = [...document.querySelectorAll(".lp-stage.is-current .lp-step")].filter((s) => s.offsetParent !== null);
  const info = steps.map((s, i) => ({ i, face: R(s.querySelector(".lp-face")), text: R(s.querySelector(".lp-text")), link: s.querySelector(".lp-link") }));
  const problems = [], W = document.documentElement.clientWidth;
  info.forEach((a) => {
    if (a.face.l < 0 || a.face.r > W) problems.push("node " + a.i + " outside viewport");
    if (a.text.l < 0 || a.text.r > W) problems.push("label " + a.i + " outside viewport [" + Math.round(a.text.l) + "," + Math.round(a.text.r) + "] of " + W);
    info.forEach((b) => {
      if (b.i <= a.i) return;
      if (hit(a.face, b.face, 2)) problems.push("faces " + a.i + "/" + b.i + " overlap");
      if (hit(a.text, b.text, 2)) problems.push("labels " + a.i + "/" + b.i + " overlap");
      if (hit(a.face, b.text, 2)) problems.push("face " + a.i + " / label " + b.i + " overlap");
      if (hit(b.face, a.text, 2)) problems.push("face " + b.i + " / label " + a.i + " overlap");
    });
    if (hit(a.face, a.text, 0)) problems.push("face and label of " + a.i + " overlap");
  });
  info.forEach((a) => {
    if (!a.link) return;
    strips(a.link).forEach((s) => info.forEach((b) => {
      if (hit(s, b.text, 2)) problems.push("connector " + a.i + " crosses label " + b.i);
      if (b.i !== a.i && b.i !== a.i + 1 && hit(s, b.face, 2)) problems.push("connector " + a.i + " crosses node " + b.i);
    }));
  });
  const trunc = [...document.querySelectorAll(".lp-step .lp-title")].filter((e) => e.offsetParent !== null && e.scrollHeight > e.clientHeight + 1).length;
  return { problems, steps: steps.length, hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth, trunc };
};
const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const parseRGB = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

async function main() {
  const S = await L.start();
  console.log("Home learning path e2e · " + S.base + " · " + path.basename(S.exe));

  // ---------------------------------------------------------------- A. navigation
  section("A. Navigation");
  {
    const { ctx, page, errors } = await L.open(MID, { width: 390, height: 844 }, { mobile: true });
    await t("Learn is not a sidebar item or a bottom-tab item", async () => {
      assert.equal(await page.locator('.sidebar [data-page="learn"], .mobiletabs [data-page="learn"], #navLearn').count(), 0);
    });
    await t("bottom tab bar is Home, Practice, Profile, Leaders, News, About", async () => {
      const labels = (await page.locator(".mobiletabs button").allTextContents()).map((s) => s.trim());
      assert.deepEqual(labels, ["Home", "Practice", "Profile", "Leaders", "News", "About"]);
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector(".mobiletabs")).gridTemplateColumns.split(" ").length), 6);
    });
    await t("Home is the active page and renders the path, not the old tile grid", async () => {
      assert.equal(await page.locator("#home.active").count(), 1);
      assert.ok(await page.locator(".lp-stage").count() > 0);
      assert.equal(await page.locator(".chapter-test-tile, .chapter-test-grid").count(), 0);
      assert.equal((await page.locator("#learningPathTitle h2").textContent()).trim(), "CLICK Learning Path");
    });
    for (const [pg, label] of [["practice", "Practice"], ["progress", "Profile"], ["leadership", "Leaders"], ["announcements", "News"], ["about", "About"], ["home", "Home"]]) {
      await t("tab '" + label + "' opens #" + pg, async () => {
        await page.locator('.mobiletabs button[data-page="' + pg + '"]').click();
        assert.equal(await page.locator("#" + pg + ".active").count(), 1);
        assert.equal(await page.evaluate(() => document.body.dataset.page), pg);
      });
    }
    await t("no JS errors while switching tabs", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(MID, { width: 1440, height: 900 });
    await t("desktop sidebar: Home, Practice, Profile, Leadership, Announcements, About (no Learn)", async () => {
      const labels = (await page.locator(".sidebar .navbtn").allTextContents()).map((s) => s.replace(/[^\p{L}\s]/gu, "").trim());
      assert.deepEqual(labels, ["Home", "Practice", "Profile", "Leadership", "Announcements", "About"]);
      assert.match(await page.locator(".sidebar .navbtn.active").textContent(), /Home/);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- B. the path renders the source data
  section("B. The path renders the real stages and chapters");
  {
    const { ctx, page } = await L.open({ tested: [] });
    await t("every stage renders, in order, with its title and number", async () => {
      const got = await page.evaluate(() => [...document.querySelectorAll(".lp-stage")].map((s) => ({ id: s.dataset.stageSection, title: s.querySelector(".lp-card-title").textContent, eyebrow: s.querySelector(".lp-eyebrow").textContent })));
      assert.deepEqual(got.map((g) => g.id), fx.stages.map((s) => s.stage_id));
      assert.deepEqual(got.map((g) => g.title), fx.stages.map((s) => s.title));
      got.forEach((g, i) => assert.ok(g.eyebrow.includes("Stage " + fx.stages[i].stage_no), g.eyebrow));
    });
    await t("every chapter renders once, in stage/chapter order, as '<no>. <title>' (" + TOTAL + " chapters)", async () => {
      const got = await page.evaluate(() => [...document.querySelectorAll(".lp-node")].map((n) => ({ id: n.dataset.chapter, stage: n.dataset.stage, text: n.querySelector(".lp-title").textContent })));
      const want = fx.stages.flatMap((s) => L.chaptersOf(s.stage_id).map((c) => ({ id: c.chapter_id, stage: s.stage_id, text: c.chapter_no + ". " + c.title })));
      assert.deepEqual(got, want);
    });
    await t("the map holds no lesson text and no activity markup (chapters open in their own run)", async () => {
      assert.equal(await page.evaluate(() => document.querySelectorAll("#home .learn-page-body, #home .learn-activities, #home #walk, #home .la, #home .ce-code").length), 0);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- C. progress
  section("C. Progress, unlocking, current chapter");
  {
    const { ctx, page } = await L.open(MID);
    await t("node states come from progress: 8 completed, 1 current, the rest locked", async () => {
      const c = await page.evaluate(() => { const o = {}; document.querySelectorAll(".lp-step").forEach((s) => (o[s.dataset.state] = (o[s.dataset.state] || 0) + 1)); return o; });
      assert.deepEqual(c, { completed: 8, current: 1, locked: TOTAL - 9 });
    });
    await t("the current node is the first unfinished chapter of the first open stage", async () => {
      assert.equal(await page.locator('.lp-node[aria-current="step"]').getAttribute("data-chapter"), CUR);
      assert.equal(await page.locator(".lp-stage.is-current").getAttribute("data-stage-section"), S1);
    });
    await t("stage progress bars are accurate (5/5, 3/5, 0/5)", async () => {
      const g = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll(".lp-stage")].slice(0, 3).map((s) => [s.dataset.stageSection, [s.querySelector('[role="progressbar"]').getAttribute("aria-valuenow"), s.querySelector(".lp-progress-text").textContent, s.querySelector(".fill").style.width]])));
      assert.deepEqual(g[S0], ["100", "5 / 5 chapters completed", "100%"]);
      assert.deepEqual(g[S1], ["60", "3 / 5 chapters completed", "60%"]);
      assert.deepEqual(g[S2], ["0", "0 / 5 chapters completed", "0%"]);
    });
    await t("the checkpoint card names the current chapter and offers 'Start chapter'", async () => {
      const cur = L.chaptersOf(S1)[3];
      const txt = await page.locator("#lpCheckpoint").innerText();
      assert.match(txt, /YOU ARE HERE/i);
      assert.ok(txt.includes(cur.chapter_no + ". " + cur.title));
      assert.equal((await page.locator("#lpCheckpoint .lp-cta").textContent()).trim(), "Start chapter");
    });
    await t("a finished stage is collapsed, the current stage is open, a locked stage shows a 3-node teaser", async () => {
      const v = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll(".lp-stage")].slice(0, 3).map((s) => [s.dataset.stageSection, [...s.querySelectorAll(".lp-step")].filter((x) => x.offsetParent !== null).length])));
      assert.deepEqual(v, { [S0]: 0, [S1]: 5, [S2]: 3 });
    });
    await t("the top bar keeps showing hearts and XP from the existing state", async () => {
      assert.equal((await page.locator("#topHearts").textContent()).trim(), "3");
      assert.equal((await page.locator("#topXP").textContent()).trim(), "120");
    });
    await t("the top bar and the current checkpoint card stay in view while the path scrolls (sticky)", async () => {
      await page.evaluate(() => window.scrollTo(0, document.querySelector(".lp-stage.is-current").offsetTop + 260));
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => ({ bar: Math.round(document.querySelector(".topbar").getBoundingClientRect().top), card: Math.round(document.querySelector(".lp-stage.is-current .lp-card").getBoundingClientRect().top) }));
      assert.equal(r.bar, 0);
      assert.equal(r.card, 68, "card sits just under the 60px top bar");
    });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open({ tested: L.ids(S0, 0, 2), learned: L.ids(S0, 2, 3) });
    await t("legacy: a chapter learned under the old flow but never tested is simply the current chapter (nothing counted as completed)", async () => {
      const n = L.node(page, L.ids(S0, 2, 3)[0]);
      assert.equal(await n.getAttribute("aria-current"), "step");
      assert.equal(await n.getAttribute("data-phase"), "start");
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S0 + '"] .lp-step[data-state="completed"]').count(), 2);
    });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open({ tested: fx.chapters.map((c) => c.chapter_id) });
    await t("everything complete: every stage collapsed as complete, a congratulation banner, no current node", async () => {
      assert.equal(await page.locator(".lp-allclear").count(), 1);
      assert.equal(await page.locator(".lp-stage.is-completed").count(), fx.stages.length);
      assert.equal(await page.locator(".lp-node[aria-current]").count(), 0);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- D. tapping nodes
  section("D. Tapping nodes");
  {
    const { ctx, page, errors } = await L.open(MID, { width: 390, height: 844 }, { mobile: true });
    await t("a locked node never opens anything: it explains why (toast) and Home stays put", async () => {
      const lockedId = L.chaptersOf(S1)[4].chapter_id, n = L.node(page, lockedId);
      assert.equal(await n.getAttribute("aria-disabled"), "true");
      await n.scrollIntoViewIfNeeded();
      await n.click({ force: true }); // Playwright treats aria-disabled as "not clickable"; a real finger/mouse click does reach the handler
      await page.waitForSelector("#toastStack .toast");
      assert.match(await page.locator("#toastStack .toast").first().innerText(), /previous|chapter|complete|locked|prerequisite/i);
      assert.equal(await page.locator("#home.active").count(), 1);
      assert.equal(await page.locator("#testPage.hidden").count(), 1);
    });
    await t("tapping the current chapter opens Slide 1 (the Code Explorer) of its chapter run, not a lesson page or a test", async () => {
      await L.node(page, CUR).scrollIntoViewIfNeeded(); await L.node(page, CUR).click();
      await page.waitForSelector("#testPage:not(.hidden) .ce-target");
      assert.equal(await page.locator("#learn.active").count(), 0);
      assert.equal(await page.locator("#testTypeLabel").textContent(), "CODE EXPLORER");
      assert.equal(await page.evaluate(() => testState.mode), "graded");
      assert.equal(await page.evaluate(() => testState.chapter_id), CUR);
    });
    await t("leaving the chapter returns to Home with nothing changed (an unfinished run adds no XP)", async () => {
      const before = await page.evaluate(() => app.user.total_xp);
      await page.locator("#testBack").click(); // the confirm() is auto-accepted
      await page.waitForSelector("#home.active");
      assert.equal(await page.evaluate(() => app.user.total_xp), before);
      assert.equal(await L.node(page, CUR).getAttribute("aria-current"), "step");
    });
    await t("tapping a completed chapter opens it as a review (no sheet, no second choice)", async () => {
      const done = L.chaptersOf(S1)[0].chapter_id;
      assert.match(await L.node(page, done).getAttribute("aria-label"), /completed\. Tap to review the chapter/);
      await L.node(page, done).scrollIntoViewIfNeeded(); await L.node(page, done).click();
      await page.waitForSelector("#testPage.is-review .ce-target");
      assert.equal(await page.locator("#lpSheet").count(), 0, "the old lesson/test sheet no longer exists");
      await page.locator("#testBack").click(); await page.waitForSelector("#home.active");
    });
    await t("the checkpoint card's button starts the same chapter", async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator("#lpCheckpoint .lp-cta").click();
      await page.waitForSelector("#testPage:not(.hidden) .ce-target");
      assert.equal(await page.evaluate(() => testState.chapter_id), CUR);
      await page.locator("#testBack").click(); await page.waitForSelector("#home.active");
    });
    await t("no JS errors through Home -> chapter -> Home", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(MID, { width: 1280, height: 800 });
    await t("a finished stage is collapsed; its toggle expands/collapses it, and the choice survives a re-render", async () => {
      const sec = page.locator('.lp-stage[data-stage-section="' + S0 + '"]'), toggle = sec.locator(".lp-toggle");
      assert.match(await toggle.textContent(), /Review chapters \(5\)/);
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(await sec.locator(".lp-step").first().isVisible(), false);
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      assert.equal(await sec.locator(".lp-step").first().isVisible(), true);
      await page.evaluate(() => renderHome());
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S0 + '"] .lp-step').first().isVisible(), true, "stays open after Home re-renders");
      await page.locator('.lp-stage[data-stage-section="' + S0 + '"] .lp-toggle').click();
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S0 + '"] .lp-step').first().isVisible(), false);
    });
    await t("a locked stage shows a 3-node teaser; 'Show all 5 chapters' reveals the rest", async () => {
      const sec = page.locator('.lp-stage[data-stage-section="' + S2 + '"]');
      const visible = () => sec.locator(".lp-step").evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
      assert.equal(await visible(), 3);
      assert.match(await sec.locator(".lp-lock-note").textContent(), /previous stage/i);
      await sec.locator(".lp-toggle").click();
      assert.equal(await visible(), 5);
    });
    await t("returning to a chapter inside a collapsed stage expands it first (goHomeToChapter)", async () => {
      const done = L.chaptersOf(S0)[3].chapter_id;
      await page.evaluate((c) => goHomeToChapter("STG001", c), done);
      await page.waitForTimeout(300);
      assert.equal(await L.node(page, done).isVisible(), true);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- E. stage transition and live updates
  section("E. Stage transition and live updates");
  {
    const { ctx, page } = await L.open({ tested: L.ids(S0, 0, 4) }, { width: 390, height: 844 }, { mobile: true });
    const last = L.chaptersOf(S0)[4].chapter_id;
    await t("before: the last chapter of stage 1 is current; stage 2 is locked", async () => {
      assert.equal(await page.locator('.lp-node[aria-current="step"]').getAttribute("data-chapter"), last);
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S1 + '"]').getAttribute("data-status"), "locked");
    });
    await t("after its test is completed (state refresh, no reload): stage 1 complete, stage 2's first chapter current, stage 3 still locked", async () => {
      await page.evaluate(async (last) => {
        const d = JSON.parse(localStorage.getItem("clickDemoStateV13"));
        d.learnProgress[last] = { completed: true, times: 1 }; d.chapterProgress[last] = { test: true, xp: 6 };
        localStorage.setItem("clickDemoStateV13", JSON.stringify(d));
        await loadApp(false); // the same refresh the app runs after a chapter completes
      }, last);
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S0 + '"]').getAttribute("data-status"), "completed");
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S1 + '"]').getAttribute("data-status"), "current");
      assert.equal(await page.locator('.lp-node[aria-current="step"]').getAttribute("data-chapter"), L.chaptersOf(S1)[0].chapter_id);
      assert.equal(await page.locator('.lp-stage[data-stage-section="' + S2 + '"]').getAttribute("data-status"), "locked");
    });
    await ctx.close();
  }
  section("F. Refresh");
  {
    const { ctx, page } = await L.open(MID);
    await t("reload keeps the same current chapter, counts and progress", async () => {
      await page.reload({ waitUntil: "load" });
      await L.bootDemo(page);
      assert.equal(await page.locator('.lp-node[aria-current="step"]').getAttribute("data-chapter"), CUR);
      assert.equal(await page.locator('.lp-step[data-state="completed"]').count(), 8);
      assert.match(await page.locator('.lp-stage[data-stage-section="' + S1 + '"] .lp-progress-text').textContent(), /3 \/ 5/);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- G/H. viewports and themes
  section("G/H. Viewports and themes (no overlap, no horizontal scroll, nothing outside the screen)");
  const VIEWPORTS = [[360, 800, true], [390, 844, true], [412, 915, true], [1280, 720, false], [1440, 900, false], [1920, 1080, false]];
  for (const theme of ["dark", "light"]) {
    const { ctx, page, errors } = await L.open({ ...MID, theme }, { width: 390, height: 844 }, {});
    for (const [w, h, mobile] of VIEWPORTS) {
      await t(theme + " " + w + "x" + h + ": layout is clean", async () => {
        await page.setViewportSize({ width: w, height: h });
        await page.evaluate(() => document.querySelectorAll(".lp-toggle[aria-expanded=false]").forEach((b) => b.click())); // lay out every stage
        await page.waitForTimeout(120);
        let g = await page.evaluate(GEOMETRY);
        assert.equal(g.hScroll, false, "horizontal scroll");
        assert.deepEqual(g.problems, [], "current stage");
        assert.ok(g.steps >= 5);
        // check every other stage too: make it the "current" one for the measurement, then put things back
        try {
          for (const st of fx.stages.map((s) => s.stage_id).filter((id) => id !== S1)) {
            await page.evaluate((id) => { document.querySelectorAll(".lp-stage.is-current").forEach((s) => s.classList.remove("is-current")); document.querySelector('.lp-stage[data-stage-section="' + id + '"]').classList.add("is-current"); }, st);
            g = await page.evaluate(GEOMETRY);
            assert.deepEqual(g.problems, [], "stage " + st);
            assert.equal(g.trunc, 0, "no title is cut off in " + st);
          }
        } finally {
          await page.evaluate((id) => { document.querySelectorAll(".lp-stage.is-current").forEach((s) => s.classList.remove("is-current")); document.querySelector('.lp-stage[data-stage-section="' + id + '"]').classList.add("is-current"); }, S1);
        }
        const size = await page.evaluate(() => ({ face: document.querySelector(".lp-face").getBoundingClientRect().height, cta: document.querySelector(".lp-cta").getBoundingClientRect().height, tabs: document.querySelector(".mobiletabs") && getComputedStyle(document.querySelector(".mobiletabs")).display }));
        assert.ok(size.face >= 44 && size.cta >= 44, "touch targets >= 44px: " + JSON.stringify(size));
        if (mobile) assert.equal(size.tabs, "grid", "bottom nav visible");
        await page.evaluate(() => document.querySelector(".lp-node[aria-current]").scrollIntoView({ block: "center" }));
        await page.waitForTimeout(120);
        await L.shot(page, "home-" + theme + "-" + w + "x" + h);
      });
    }
    await t(theme + ": no JS errors at any size", async () => noErrors(errors));
    await ctx.close();
  }

  // ---------------------------------------------------------------- G2. progressive chapter lighting (visual QA)
  section("G2. Progressive chapter lighting actually reaches the DOM and visibly progresses across stages");
  for (const theme of ["dark", "light"]) {
    const { ctx, page, errors } = await L.open({ ...MID, theme }, { width: 390, height: 844 }, {});
    await page.evaluate(() => document.querySelectorAll(".lp-toggle[aria-expanded=false]").forEach((b) => b.click()));
    await t(theme + ": every rendered chapter node carries a real --chapter-light-intensity value, increasing end to end", async () => {
      const vals = await page.locator(".lp-step").evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).getPropertyValue("--chapter-light-intensity"))));
      assert.ok(vals.length > 10, "sanity: many chapter nodes are on screen");
      for (const v of vals) assert.ok(v >= 0.15 && v <= 1, "intensity out of range: " + v);
      for (let i = 1; i < vals.length; i++) assert.ok(vals[i] >= vals[i - 1] - 1e-9, "intensity dropped between node " + (i - 1) + " and " + i);
      assert.ok(vals[vals.length - 1] > vals[0], "the last on-screen chapter must read brighter than the first");
    });
    await t(theme + ": the halo is a decorative pseudo-element behind the face icon, never covering the label text", async () => {
      const z = await page.locator(".lp-face").first().evaluate((el) => getComputedStyle(el, "::after").zIndex);
      assert.equal(z, "-1");
    });
    await t(theme + ": locked chapters stay visually subtle regardless of how far along the curriculum they sit", async () => {
      const mult = await page.locator('.lp-step[data-state="locked"]').first().evaluate((el) => getComputedStyle(el.querySelector(".lp-face"), "::after").getPropertyValue("opacity"));
      assert.ok(parseFloat(mult) <= 0.2 + 1e-6, "locked chapter glow opacity too strong: " + mult);
    });
    await t(theme + ": no JS errors", async () => noErrors(errors));
    await ctx.close();
  }

  // ---------------------------------------------------------------- I. theme contrast
  section("I. Theme contrast (WCAG)");
  for (const theme of ["dark", "light"]) {
    const { ctx, page } = await L.open({ ...MID, theme }, { width: 390, height: 844 });
    await page.evaluate(() => document.querySelector('.lp-stage[data-stage-section="STG003"] .lp-toggle')?.click());
    await t(theme + ": chapter titles and status lines are readable on the page background", async () => {
      const r = await page.evaluate(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        const pick = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el).color : null; };
        return { bg, completedTitle: pick('.lp-step[data-state="completed"] .lp-title'), completedSub: pick('.lp-step[data-state="completed"] .lp-sub'), currentTitle: pick('.lp-step[data-state="current"] .lp-title'), currentSub: pick('.lp-step[data-state="current"] .lp-sub'), lockedTitle: pick('.lp-step[data-state="locked"] .lp-title'), lockedSub: pick('.lp-step[data-state="locked"] .lp-sub'), lockNote: pick(".lp-stage.is-locked .lp-lock-note") };
      });
      const bg = parseRGB(r.bg), out = {};
      for (const k of ["completedTitle", "completedSub", "currentTitle", "currentSub", "lockedTitle", "lockedSub", "lockNote"]) out[k] = Math.round(ratio(parseRGB(r[k]), bg) * 100) / 100;
      const fails = Object.entries(out).filter(([, v]) => v < 4.5).map(([k, v]) => k + "=" + v);
      assert.deepEqual(fails, [], "contrast < 4.5:1 -> " + JSON.stringify(out));
    });
    await t(theme + ": text on the stage cards is readable on the darkest AND lightest card colour", async () => {
      const r = await page.evaluate(() => {
        const rgbs = (s) => (s.match(/rgba?\([^)]*\)/g) || []).map((x) => x.match(/[\d.]+/g).slice(0, 3).map(Number));
        return ["STG001", "STG002", "STG003"].flatMap((sid) => {
          const card = document.querySelector('.lp-stage[data-stage-section="' + sid + '"] .lp-card'), cs = getComputedStyle(card);
          const stops = [...rgbs(cs.backgroundImage), ...(cs.backgroundImage === "none" ? rgbs(cs.backgroundColor) : [])];
          return [".lp-eyebrow", ".lp-progress-text", ".lp-lock-note", ".lp-card-title"].map((sel) => { const el = card.querySelector(sel); return el ? { sid, sel, color: getComputedStyle(el).color, stops } : null; }).filter(Boolean);
        });
      });
      const fails = r.map((x) => ({ ...x, worst: Math.min(...x.stops.map((s) => ratio(parseRGB(x.color), s))) })).filter((x) => x.worst < 4.5).map((x) => x.sid + " " + x.sel + "=" + x.worst.toFixed(2));
      assert.deepEqual(fails, [], "card text contrast < 4.5:1");
    });
    await t(theme + ": node shapes are distinguishable from the page (completed/current have a strong outline; fills differ)", async () => {
      const r = await page.evaluate(() => { const f = (s) => { const cs = getComputedStyle(document.querySelector(s + " .lp-face")); return { fill: cs.backgroundColor, border: cs.borderTopColor }; }; return { bg: getComputedStyle(document.body).backgroundColor, done: f('.lp-step[data-state="completed"]'), cur: f('.lp-step[data-state="current"]'), lock: f('.lp-step[data-state="locked"]') }; });
      const bg = parseRGB(r.bg);
      assert.notEqual(r.done.fill, r.bg); assert.notEqual(r.cur.fill, r.bg); assert.notEqual(r.lock.fill, r.bg);
      for (const k of ["done", "cur"]) assert.ok(Math.max(ratio(parseRGB(r[k].fill), bg), ratio(parseRGB(r[k].border), bg)) >= 3, k + " node vs page < 3:1");
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- J. accessibility
  section("J. Accessibility");
  {
    const { ctx, page, errors } = await L.open(MID, { width: 1280, height: 800 });
    await t("every chapter node is a <button> with a descriptive accessible name", async () => {
      const bad = await page.evaluate(() => [...document.querySelectorAll(".lp-node")].filter((n) => n.tagName !== "BUTTON" || !/^Chapter \d+, .+, (completed|current|available|locked)/.test(n.getAttribute("aria-label") || "")).length);
      assert.equal(bad, 0);
      const cur = L.chaptersOf(S1)[3];
      assert.match(await L.node(page, CUR).getAttribute("aria-label"), new RegExp("^Chapter " + cur.chapter_no + ", .+, current, tap to start the chapter"));
      assert.match(await L.node(page, L.chaptersOf(S1)[4].chapter_id).getAttribute("aria-label"), /, locked\. .+/);
    });
    await t("exactly one node is aria-current; locked nodes are aria-disabled but still focusable", async () => {
      assert.equal(await page.locator('.lp-node[aria-current="step"]').count(), 1);
      const info = await page.evaluate(() => { const n = document.querySelector('.lp-step[data-state="locked"] .lp-node'); return { dis: n.getAttribute("aria-disabled"), tab: n.tabIndex, disabledProp: n.disabled }; });
      assert.deepEqual(info, { dis: "true", tab: 0, disabledProp: false });
    });
    await t("progress bars are real progressbars with values", async () => {
      assert.equal(await page.locator('.lp-stage [role="progressbar"][aria-valuenow]').count(), fx.stages.length);
    });
    await t("keyboard: Tab reaches a node, the focus ring is visible, Enter opens the chapter", async () => {
      await page.locator(".lp-cta").focus();
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => { const a = document.activeElement; const face = a.querySelector && a.querySelector(".lp-face"); const cs = face && getComputedStyle(face); return { cls: a.className, ring: cs ? cs.outlineStyle + " " + cs.outlineWidth : null }; });
      assert.equal(focused.cls, "lp-node", JSON.stringify(focused));
      assert.match(focused.ring, /solid 3px/, "visible focus ring: " + focused.ring);
      await page.locator('.lp-node[aria-current="step"]').focus();
      await page.keyboard.press("Enter");
      await page.waitForSelector("#testPage:not(.hidden) .ce-target");
      assert.equal(await page.evaluate(() => testState.chapter_id), CUR);
      await page.locator("#testBack").click(); await page.waitForSelector("#home.active");
    });
    await t("keyboard: Space activates a node too, and a locked node explains itself instead of opening", async () => {
      await page.locator('.lp-step[data-state="locked"] .lp-node').first().focus();
      await page.keyboard.press("Space");
      await page.waitForSelector("#toastStack .toast");
      assert.equal(await page.locator("#testPage.hidden").count(), 1);
    });
    await t("decorative connectors and icons are hidden from assistive tech", async () => {
      assert.equal(await page.evaluate(() => [...document.querySelectorAll(".lp-link, .lp-face svg, .lp-join")].filter((e) => !(e.getAttribute("aria-hidden") === "true" || e.closest('[aria-hidden="true"]'))).length), 0);
    });
    await t("no JS errors during keyboard use", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(MID, { width: 390, height: 844 }, { mobile: true, reducedMotion: "reduce" });
    await t("prefers-reduced-motion: no pulse animation on arrival", async () => {
      await page.evaluate((c) => goHomeToChapter("STG002", c), CUR);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate((c) => getComputedStyle(document.querySelector('.lp-node[data-chapter="' + c + '"] .lp-face')).animationName, CUR), "none");
    });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(MID, { width: 390, height: 844 }, { mobile: true });
    await t("no continuously running animations or transitions on the path at rest", async () => {
      await page.waitForTimeout(3200);
      const running = await page.evaluate(() => document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest("#stageGrid") && a.playState === "running").length);
      assert.equal(running, 0);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- K. regression + performance
  section("K. Regression and performance");
  {
    const { ctx, page, errors } = await L.open(MID, { width: 390, height: 844 }, { mobile: true });
    await t("Practice, Profile, Leaderboard, News and About still render content", async () => {
      for (const pg of ["practice", "progress", "leadership", "announcements", "about"]) {
        await page.locator('.mobiletabs button[data-page="' + pg + '"]').click();
        await page.waitForTimeout(150);
        assert.ok((await page.locator("#" + pg).innerText()).trim().length > 20, pg + " is empty");
      }
      await page.locator('.mobiletabs button[data-page="home"]').click();
    });
    await t("the guided tour walks every step (no missing targets, no errors) and finishes on Home", async () => {
      await page.evaluate(() => startTour(false));
      const total = await page.evaluate(() => TOUR_STEPS.length);
      for (let i = 0; i < total; i++) {
        await page.waitForSelector("#tourOverlay:not(.hidden)");
        const step = await page.evaluate(() => ({ id: TOUR_STEPS[tourIndex].id, hl: !!document.querySelector(".tour-highlight") }));
        if (step.id) assert.equal(step.hl, true, "tour step '" + step.id + "' highlights something");
        await page.locator("#tourNext").click();
        await page.waitForTimeout(60);
      }
      assert.equal(await page.locator("#tourOverlay.hidden").count(), 1);
      assert.equal(await page.locator("#home.active").count(), 1);
    });
    await t("no JS errors across the regression pass", async () => noErrors(errors));
    await ctx.close();
  }
  section("K2. Authentication and onboarding gates (unchanged by the new Home)");
  {
    const { ctx, page } = await L.openBare();
    await t("logged out: the login screen is showing and no learning path has been rendered", async () => {
      assert.equal(await page.locator("#authGate:not(.hidden)").count(), 1);
      assert.equal(await page.locator("#loginEmail").isVisible(), true);
      assert.equal(await page.locator(".lp-stage").count(), 0);
    });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open({ ...MID, noUsername: true });
    await t("a student with no username still gets the username screen first, and no tour starts over it", async () => {
      await page.waitForSelector("#usernameGate:not(.hidden)");
      await page.waitForTimeout(900);
      assert.equal(await page.locator("#tourOverlay.hidden").count(), 1);
      assert.equal(await page.evaluate(() => { startTour(false); return document.getElementById("tourOverlay").classList.contains("hidden"); }), true);
    });
    await ctx.close();
  }
  {
    const { ctx, page, errors } = await L.open({ ...MID, onboarded: false });
    await t("a first-time student gets the guided tour on Home automatically, and can skip it", async () => {
      await page.waitForSelector("#tourOverlay:not(.hidden)", { timeout: 5000 });
      assert.equal(await page.locator("#home.active").count(), 1);
      await page.locator("#tourSkip").click();
      await page.waitForSelector("#tourOverlay.hidden", { state: "attached" });
      noErrors(errors);
    });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(MID, { width: 390, height: 844 });
    await t("performance: Home renders quickly and stays a modest DOM", async () => {
      const r = await page.evaluate(() => { const t0 = performance.now(); for (let i = 0; i < 20; i++) renderHome(); return { ms: (performance.now() - t0) / 20, nodes: document.querySelectorAll("#stageGrid *").length, svg: document.querySelectorAll("#stageGrid svg").length, chapters: document.querySelectorAll(".lp-node").length }; });
      console.log("      renderHome avg " + r.ms.toFixed(1) + "ms · " + r.nodes + " DOM nodes for " + r.chapters + " chapters · " + r.svg + " inline svg");
      assert.ok(r.ms < 60, "renderHome " + r.ms + "ms");
      assert.ok(r.nodes < 9000, "DOM size " + r.nodes);
    });
    await ctx.close();
  }

  // ---------------------------------------------------------------- Z. the full curriculum structure, now that every stage has shipped
  // Number Crunching (Stage 6), Patterns (Stage 7) and, as of this Pointers chapter, Stage 12 (POINTERS) were each content-pending in
  // turn; Pointers was the last one, so the "content is coming soon" placeholder path (neutral "N. Content coming soon" chapter labels,
  // an unconditional self-lock, and the .lp-lock-note text) no longer has any real stage left to demonstrate it against. That specific
  // behavior stays covered structurally (via the self-lock mechanism itself, see 20261001010000_unlock_stage12_pointers.sql and
  // tests/home/structure.test.js) rather than against a real example here.
  section("Z. The full 13-stage curriculum (through Pointers) is on the map, in order, and no stage is content-pending anymore");
  {
    const SA = require("./structure-app.js");
    for (const [w, h, theme] of [[390, 844, "light"], [1440, 900, "dark"]]) {
      const { ctx, page, errors } = await L.open({ tested: SA.through(5), theme }, { width: w, height: h }, { mobile: w < 800 });
      // The demo dataset only holds chapters that have learning content, so swap in the full curriculum structure (every active stage
      // and chapter, with the locks the repo's migrations define) and let the real Home renderer draw it.
      const appState = SA.appFor(SA.S.prerequisites, SA.through(5));
      await page.evaluate((a) => { app.stages = a.stages; app.chapters = a.chapters; app.stage_progress = a.stage_progress; app.chapter_progress = a.chapter_progress; renderHome(); }, appState);
      await t("(" + w + "x" + h + " " + theme + ") Home lists the 13 stages in curriculum order: ... Loops, Number Crunching, Patterns, Arrays, ..., Pointers", async () => {
        const got = await page.evaluate(() => [...document.querySelectorAll(".lp-stage")].map((s) => ({ id: s.dataset.stageSection, status: s.dataset.status, title: s.querySelector(".lp-card-title").textContent, eyebrow: s.querySelector(".lp-eyebrow").textContent, progress: s.querySelector(".lp-progress-text").textContent })));
        assert.deepEqual(got.map((g) => g.id), SA.CURRICULUM.map((c) => c.id));
        assert.deepEqual(got.map((g) => g.title), SA.CURRICULUM.map((c) => c.title));
        got.forEach((g, i) => assert.ok(g.eyebrow.endsWith("Stage " + SA.CURRICULUM[i].no), g.eyebrow));
        const at = (id) => got.find((g) => g.id === id);
        assert.equal(at("STG006").status, "completed");
        assert.notEqual(at("STG012").status, "locked", "Number Crunching has its content and opens like the other stages"); assert.equal(at("STG012").progress, "0 / 7 chapters completed");
        assert.notEqual(at("STG013").status, "locked", "Patterns has its content and opens like the other stages"); assert.equal(at("STG013").progress, "0 / 5 chapters completed");
        assert.notEqual(at("STG007").status, "locked", "Arrays keeps working exactly as before");
        assert.notEqual(at("STG011").status, "locked", "Pointers has its content and opens like the other stages"); assert.equal(at("STG011").progress, "0 / 12 chapters completed");
      });
      await t("(" + w + "x" + h + " " + theme + ") no stage shows a content-pending lock note anymore, and Pointers shows its real chapter titles", async () => {
        assert.equal(await page.locator(".lp-lock-note").count(), 0);
        // Pointers is unlocked but not yet reached (only Loops is done), so its status is "available": no completed/locked
        // toggle renders (see the `collapsible` check in assets/home/path.js) and its full node list is already visible.
        const sec = page.locator('.lp-stage[data-stage-section="STG011"]');
        const nodes = await sec.locator(".lp-node .lp-title").allTextContents();
        assert.equal(nodes.length, 12);
        assert.ok(nodes.every((title) => !/Content coming soon/i.test(title)), nodes.join(" | "));
        assert.equal(nodes[0], "1. Pointer Basics");
      });
      await t("(" + w + "x" + h + " " + theme + ") no JS errors", async () => noErrors(errors));
      await ctx.close();
    }
  }

  await L.stop(S);
  L.finish();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
