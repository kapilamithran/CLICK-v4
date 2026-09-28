#!/usr/bin/env node
/* Real-browser tests for the unified chapter experience (Home -> chapter -> slides -> complete -> next chapter).
 *
 *   npm i --no-save playwright-core
 *   node tests/chapter/e2e.chapters.js               everything (about 3-4 minutes)
 *   CHAPTERS=CH0034,CH0044 node tests/chapter/e2e.chapters.js     only the every-chapter run for those
 *
 * See tests/e2e/lib.js for how the app is run (demo mode + CLICK's real production chapters and questions).
 */
"use strict";
const path = require("path");
const L = require("../e2e/lib.js");
const H = require("./helpers.js");
const { t, section, assert, noErrors, fx } = L;
const decks = H.loadDecks();
const { Explorer } = H.loadChapterLayer();
const strip = (s) => String(s).replace(/`/g, "");
const num = (s) => Number(String(s).replace(/[^\d]/g, ""));

const C_SIMPLE = "CH0034";                    // Variables: a deck of 8 slides, the exemplar
const SEED_XP = 120;
const servedXp = (cid) => L.servedOf(cid).reduce((n, q) => n + L.xpOf(q), 0);

const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgb = (s) => (String(s).match(/[\d.]+/g) || []).slice(0, 3).map(Number);

async function openChapter(spec, cid, viewport, opt) {
  const w = await L.open({ tested: L.before(cid), ...spec }, viewport, opt);
  await L.node(w.page, cid).scrollIntoViewIfNeeded();
  await L.node(w.page, cid).click();
  await w.page.waitForSelector("#testPage:not(.hidden) #testExercise");
  return w;
}
const stat = (page) => page.evaluate(() => ({ hearts: app.user.hearts, xp: app.user.total_xp }));

async function main() {
  const S = await L.start();
  console.log("Unified chapter e2e · " + S.base + " · " + path.basename(S.exe));

  // ================================================================ A. entry, Code Explorer, glossary, references
  section("A. From Home into a chapter: Code Explorer, glossary, references");
  {
    const deck = decks[C_SIMPLE], ex = deck.slides[0], parsed = Explorer.parse(ex.code);
    const { ctx, page, errors } = await openChapter({}, C_SIMPLE, { width: 390, height: 844 }, { mobile: true });
    await t("tapping the current chapter opens Slide 1 of the chapter run, not the old Learn page or a test", async () => {
      assert.equal(await page.locator("#learn.active").count(), 0);
      assert.equal(await page.locator("#testPage.hidden").count(), 0);
      assert.equal(await page.locator("#testTypeLabel").textContent(), "CODE EXPLORER");
      assert.equal((await page.locator("#testRoundNo").textContent()).trim(), "1/" + deck.slides.length);
      assert.equal(await page.locator("#testQuestionTitle").textContent(), ex.title);
    });
    await t("slide 1 is the Code Explorer showing the deck's code, with one underlined button per marked part", async () => {
      assert.equal(await page.locator(".ce-target").count(), parsed.tokens.length);
      const shown = (await page.locator(".ce-code code").textContent()).replace(/ /g, " ");
      assert.equal(shown, parsed.code);
      assert.match(await page.locator(".ce-hint").textContent(), /Tap any underlined part/);
    });
    await t("slide progress is announced as a progress bar and is a slide counter (1/8), not a chapter or stage percentage", async () => {
      const a = await page.evaluate(() => { const p = document.querySelector("#testPage .progress"); return [p.getAttribute("role"), p.getAttribute("aria-valuenow"), p.getAttribute("aria-valuemax"), p.getAttribute("aria-label")]; });
      assert.deepEqual(a, ["progressbar", "1", String(deck.slides.length), "Slide progress"]);
      assert.equal(await page.locator("#testRoundNo").getAttribute("aria-label"), "Slide 1 of " + deck.slides.length);
    });
    await t("Continue stays disabled until enough different parts were opened, then opens", async () => {
      const need = Explorer.minTapsFor(ex);
      assert.equal(await page.locator("#testCheck").isDisabled(), true);
      const seen = new Set(), tg = page.locator(".ce-target");
      for (let i = 0; i < (await tg.count()) && seen.size < need; i++) {
        const id = await tg.nth(i).getAttribute("data-target"); if (seen.has(id)) continue;
        assert.equal(await page.locator("#testCheck").isDisabled(), true, "still locked after " + seen.size + " of " + need);
        seen.add(id); await tg.nth(i).click(); await page.keyboard.press("Escape");
      }
      await page.waitForFunction(() => !document.getElementById("testCheck").disabled);
      assert.match(await page.locator(".ce-progress").textContent(), /Nice: you explored/);
    });
    await t("every target opens ITS explanation (title, beginner text, example) and closes with 'Got it'", async () => {
      const before = await stat(page);
      for (const id of Object.keys(ex.targets)) {
        const tg = ex.targets[id];
        await page.locator('.ce-target[data-target="' + id + '"]').first().click();
        await page.waitForSelector("dialog.cg-sheet[open]");
        assert.equal((await page.locator("#cgTitle").textContent()).trim(), tg.title, "title of " + id);
        const body = strip(await page.locator("#cgBody").textContent());
        assert.ok(body.includes(strip(tg.explain).slice(0, 40)), "explanation of " + id);
        if (tg.example) assert.ok((await page.locator("#cgBody .cg-code").textContent()).includes(tg.example.split("\n")[0]), "example of " + id);
        assert.equal(await page.locator('.ce-target[data-target="' + id + '"].is-active').count() > 0, true, "the tapped part is highlighted while its explanation is open");
        await page.locator("#cgClose").click();
        await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]"));
        // (the native `close` event that clears the highlight fires just after the dialog closes)
        await page.waitForFunction(() => !document.querySelector(".ce-target.is-active"), null, { timeout: 3000 });
      }
      assert.deepEqual(await stat(page), before, "reading explanations changes no hearts and no XP");
      assert.equal((await page.locator("#testRoundNo").textContent()).trim(), "1/" + deck.slides.length, "and never advances or answers anything");
    });
    await t("'Words to know' chips open glossary entries; related terms swap the sheet in place", async () => {
      const chips = await page.locator("#testGlossary .cg-chip").allTextContents();
      assert.deepEqual(chips.map((s) => s.trim().toLowerCase()), ex.glossary.map((id) => deck.glossary[id].term.toLowerCase()));
      await page.locator("#testGlossary .cg-chip").first().click();
      await page.waitForSelector("dialog.cg-sheet[open]");
      const g = deck.glossary[ex.glossary[0]];
      assert.equal((await page.locator("#cgTitle").textContent()).trim(), g.term);
      assert.ok(strip(await page.locator("#cgBody").textContent()).includes(strip(g.short)));
      await page.keyboard.press("Escape");
    });
    await t("reference links are at the bottom of the slide: real YouTube links, open in a new tab, never embedded or autoplayed", async () => {
      const links = await page.locator("#testRefs a.cc-ref").evaluateAll((as) => as.map((a) => ({ href: a.href, target: a.target, rel: a.rel, label: a.getAttribute("aria-label"), h: a.getBoundingClientRect().height })));
      assert.deepEqual(links.map((l) => l.href), deck.references.map((r) => r.url));
      links.forEach((l, i) => { assert.equal(l.target, "_blank"); assert.match(l.rel, /noopener/); assert.match(l.label, /opens YouTube in a new tab/); assert.ok(l.h >= 44, "touch target " + l.h); assert.match(l.label, new RegExp(deck.references[i].channel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))); });
      assert.equal(await page.locator("#testRefs iframe, #testRefs video, #testRefs embed").count(), 0, "nothing is embedded or autoplayed");
      assert.equal(await page.locator("iframe[src*='youtube'], video[autoplay]").count(), 0);
    });
    await t("no JS errors", async () => noErrors(errors));
    await ctx.close();
  }

  // ================================================================ B. keyboard and accessibility
  section("B. Keyboard and screen-reader access");
  {
    const deck = decks[C_SIMPLE];
    const { ctx, page, errors } = await openChapter({}, C_SIMPLE, { width: 1280, height: 800 });
    await t("a code target can be focused, opened with Enter, read, closed with Esc, and focus returns to it", async () => {
      const first = page.locator(".ce-target").first();
      await page.locator("#testGlossary .cg-chip").last().focus();
      await page.keyboard.press("Tab"); // real keyboard modality, so :focus-visible applies
      assert.equal(await page.evaluate(() => document.activeElement.className.includes("ce-target")), true, "Tab from the chips reaches the first code part");
      assert.match(await first.getAttribute("aria-label"), /^Explain /);
      assert.equal(await first.getAttribute("aria-haspopup"), "dialog");
      const ring = await first.evaluate((e) => { const c = getComputedStyle(e); return c.outlineStyle + " " + c.outlineWidth; });
      assert.match(ring, /solid 3px/, "visible focus ring: " + ring);
      await page.keyboard.press("Enter");
      await page.waitForSelector("dialog.cg-sheet[open]");
      assert.equal(await page.evaluate(() => document.querySelector("dialog.cg-sheet").contains(document.activeElement)), true, "focus moves into the dialog");
      assert.equal(await page.getAttribute("dialog.cg-sheet", "aria-labelledby"), "cgTitle");
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]"));
      assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.className.includes("ce-target")), true, "focus is back on the code part");
    });
    await t("Space also opens a target, and Tab reaches every target in reading order", async () => {
      const tg = page.locator(".ce-target"), n = await tg.count();
      await tg.first().focus();
      const order = [];
      for (let i = 0; i < n; i++) { order.push(await page.evaluate(() => document.activeElement.textContent)); await page.keyboard.press("Tab"); }
      assert.deepEqual(order, (await tg.allTextContents()), "Tab order follows the code");
      await tg.first().focus(); await page.keyboard.press("Space");
      await page.waitForSelector("dialog.cg-sheet[open]"); await page.keyboard.press("Escape");
    });
    await t("glossary sheet content is real text a screen reader gets; the term button labels are descriptive", async () => {
      await page.locator("#testGlossary .cg-chip").first().click(); await page.waitForSelector("dialog.cg-sheet[open]");
      assert.ok((await page.locator("dialog.cg-sheet").innerText()).length > 60);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator('#testGlossary [role="group"], #testGlossary .cg-chips[role="group"]').count(), 1);
    });
    await t("no JS errors", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const { ctx, page } = await openChapter({}, C_SIMPLE, { width: 390, height: 844 }, { mobile: true, reducedMotion: "reduce" });
    await t("prefers-reduced-motion: the explanation sheet and code parts use no animation", async () => {
      await page.locator(".ce-target").first().click(); await page.waitForSelector("dialog.cg-sheet[open]");
      const anim = await page.evaluate(() => [document.querySelector("dialog.cg-sheet"), document.querySelector(".ce-target")].map((e) => getComputedStyle(e).animationName));
      assert.deepEqual(anim, ["none", "none"]);
      await page.keyboard.press("Escape");
    });
    await ctx.close();
  }

  // ================================================================ C. slides: activities, questions, feedback
  section("C. Activities and graded questions inside the chapter run");
  {
    const deck = decks[C_SIMPLE];
    const { ctx, page, errors } = await openChapter({}, C_SIMPLE, { width: 390, height: 844 }, { mobile: true });
    const kinds = deck.slides.map((s) => s.kind);
    await page.evaluate(() => { document.getElementById("testCheck").disabled = false; }); // (test-only shortcut past slide 1's tap goal; the goal itself is tested above)
    await page.locator("#testCheck").click();
    await t("slide 2 is the chapter's first hands-on activity (existing engine, by id), Continue locked until it is done or tried and skipped", async () => {
      assert.equal(kinds[1], "activity");
      await page.waitForSelector("#testExercise .la");
      assert.equal(await page.locator("#testExercise .la").getAttribute("data-activity"), deck.slides[1].activity);
      assert.equal(await page.locator("#testCheck").isDisabled(), true);
      assert.equal(await page.locator("#testSkip").isHidden(), true, "Skip is not offered before the student has tried it");
      assert.match(await page.locator("#testLead").innerText(), /variable/i);
      assert.equal(await page.locator("#testLead .cg-term").count() > 0, true, "the lead's glossary words are tappable");
    });
    await t("trying the activity offers Skip; skipping enables Continue, and no heart or XP is involved", async () => {
      const b = await stat(page);
      await page.locator("#testExercise").click({ position: { x: 6, y: 6 } });
      await page.waitForSelector("#testSkip:not([hidden])");
      await page.locator("#testSkip").click();
      assert.equal(await page.locator("#testCheck").isDisabled(), false);
      assert.deepEqual(await stat(page), b);
      await page.locator("#testCheck").click();
    });
    await t("a graded question slide keeps the existing rules: chips, XP tag, feedback with the slide's takeaway (the bank explanation is empty)", async () => {
      await page.waitForFunction(() => currentSlide().kind === "question");
      const s = deck.slides[2];
      assert.equal(await page.locator("#testSlideMeta .cc-kicker").textContent(), s.title);
      assert.match(await page.locator("#testQuestionExplain").textContent(), /1 XP/);
      assert.deepEqual((await page.locator("#testGlossary .cg-chip").allTextContents()).map((x) => x.trim().toLowerCase()), s.glossary.map((id) => deck.glossary[id].term.toLowerCase()));
      await L.answerQuestion(page, s.question, true);
      await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent));
      assert.ok(strip(await page.locator("#testFeedbackV11 .cc-takeaway").textContent()).includes(strip(s.takeaway).slice(0, 25)));
      assert.equal(await page.locator("#testPendingText").textContent(), "1");
    });
    await t("stale 'Refers to: Slide N' notes from the old Learn layout are never shown", async () => {
      const bad = await page.evaluate(() => /Refers?\s+to:\s*Slides?/i.test(document.getElementById("testFeedbackV11").textContent));
      assert.equal(bad, false);
    });
    await t("no JS errors", async () => noErrors(errors));
    await ctx.close();
  }

  // ================================================================ D. hearts, XP, review
  section("D. Hearts, XP-once, review, recovery");
  {
    const cid = C_SIMPLE, xp = servedXp(cid);
    const { ctx, page, errors } = await openChapter({ xp: SEED_XP }, cid, { width: 390, height: 844 }, { mobile: true });
    let seen;
    await t("a question missed three times costs exactly one heart; correct answers, glossary and navigation cost none", async () => {
      seen = await L.playToEnd(page, { wrong: 3 });
      assert.equal(await page.locator("#testHeartsText").textContent(), "2");
      assert.equal(await page.evaluate(() => app.user.hearts), 2);
    });
    await t("the chapter completes; XP is awarded once (questions answered correctly only), hearts are NOT refilled by passing", async () => {
      const lost = L.servedOf(cid)[0];
      const expected = xp - L.xpOf(lost);
      const after = await stat(page);
      assert.equal(after.hearts, 2);
      assert.equal(after.xp, SEED_XP + expected, "XP = the correctly answered questions");
      assert.match(await page.locator("#testQuestionTitle").textContent(), /Chapter complete!/);
      assert.match(await page.locator(".test-complete-full p").textContent(), new RegExp("Chapter complete! " + expected + " XP added"));
    });
    await t("back on Home the chapter is completed and the next one is open", async () => {
      await page.locator("#testCheck").click();
      await page.waitForSelector("#home.active");
      const cp = await page.evaluate((c) => chapterProg(c), cid);
      assert.equal(cp.test_completed, true); assert.equal(cp.learn_completed, true);
      assert.match(await L.node(page, cid).getAttribute("aria-label"), /completed\. Tap to review the chapter/);
      assert.match(await L.node(page, L.after(cid)).getAttribute("aria-label"), /current, tap to start the chapter/);
    });
    await t("a state refresh (reload) never pays again", async () => {
      const b = await stat(page);
      await page.evaluate(async () => { await loadApp(true); });
      assert.deepEqual(await stat(page), b);
    });
    await t("tapping the completed chapter opens a REVIEW: same slides, no XP shown, no hearts at stake", async () => {
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage.is-review");
      assert.equal(await page.locator(".cc-review-badge").isVisible(), true);
      assert.equal(await page.locator(".xp-mini").isVisible(), false);
      assert.equal(await page.evaluate(() => testState.mode), "review");
      assert.equal(await page.evaluate(() => testState.slides.length), decks[cid].slides.length, "the same chapter, not a shortened one");
    });
    await t("reviewing the chapter where the heart was lost refills it (the existing rule) and pays no XP", async () => {
      const b = await stat(page);
      assert.equal(b.hearts, 2);
      await L.playToEnd(page, { wrong: 3 });
      assert.match(await page.locator("#testQuestionTitle").textContent(), /Chapter reviewed!/);
      assert.match(await page.locator(".test-complete-full p").textContent(), /hearts were refilled/i);
      await page.locator("#testCheck").click(); await page.waitForSelector("#home.active");
      assert.deepEqual(await stat(page), { hearts: 3, xp: b.xp }, "hearts back to 3, XP untouched");
    });
    await t("further reviews never award XP and missing review questions three times costs no heart", async () => {
      const b = await stat(page);
      for (let i = 0; i < 2; i++) { await L.node(page, cid).click(); await page.waitForSelector("#testPage.is-review"); await L.playToEnd(page, { wrong: 3 }); await page.locator("#testCheck").click(); await page.waitForSelector("#home.active"); }
      assert.deepEqual(await stat(page), b, "identical after repeated reviews, even with wrong answers");
    });
    await t("no JS errors", async () => noErrors(errors));
    await ctx.close();
  }
  {
    // a finished chapter that owes nothing reviews freely: skip forward, go back, nothing is at stake
    const cid = C_SIMPLE, n = decks[cid].slides.length;
    const { ctx, page, errors } = await L.open({ tested: [...L.before(cid), cid], xp: 77 }, { width: 390, height: 844 }, { mobile: true });
    await t("review of a finished chapter is free navigation: Continue is open on slide 1, slides can be skipped and revisited", async () => {
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage.is-review .ce-target");
      assert.equal(await page.evaluate(() => testState.free), true);
      assert.equal(await page.locator("#testCheck").isDisabled(), false, "no tap goal in a free review");
      assert.equal(await page.locator("#testPrev").isHidden(), true, "nothing before slide 1");
      assert.equal((await page.locator("#testSkip").textContent()).trim(), "Skip slide →");
      await page.locator("#testSkip").click(); await page.locator("#testSkip").click();
      assert.equal((await page.locator("#testRoundNo").textContent()).trim(), "3/" + n);
      await page.locator("#testPrev").click();
      assert.equal((await page.locator("#testRoundNo").textContent()).trim(), "2/" + n);
    });
    await t("skipping to the end completes the review with no XP, no heart change and no attempt recorded", async () => {
      for (let i = 2; i <= n; i++) { await page.locator("#testSkip").click(); await page.waitForTimeout(40); }
      await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE", null, { timeout: 8000 });
      assert.match(await page.locator("#testQuestionTitle").textContent(), /Chapter reviewed!/);
      assert.deepEqual(await stat(page), { hearts: 3, xp: 77 });
      assert.equal(await page.evaluate(() => Object.keys(testState.questionAttempts).length), 0);
    });
    await t("no JS errors", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const cid = C_SIMPLE;
    const { ctx, page } = await L.open({ tested: [...L.before(cid), cid], hearts: 2, recChapter: cid }, { width: 390, height: 844 }, { mobile: true });
    await t("heart recovery: the Home notice names the chapter, and its review needs the real interactions (hearts cannot be refilled by skipping)", async () => {
      assert.match(await page.locator("#homeRecovery").innerText(), /Hearts do not refill after a test/);
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage.is-review .ce-target");
      assert.equal(await page.evaluate(() => testState.free), false);
      assert.equal(await page.locator("#testSkip").isHidden(), true);
      assert.equal(await page.locator("#testCheck").isDisabled(), true, "the Code Explorer's tap goal applies");
    });
    await t("heart recovery: reviewing the chapter where a heart was lost refills it (the existing rule)", async () => {
      await L.playToEnd(page);
      assert.match(await page.locator(".test-complete-full p").textContent(), /hearts were refilled/i);
      assert.equal(await page.evaluate(() => app.user.hearts), 3);
    });
    await ctx.close();
  }
  {
    const cid = C_SIMPLE;
    const { ctx, page } = await L.open({ tested: L.before(cid), hearts: 1 }, { width: 390, height: 844 }, { mobile: true });
    await t("losing the last heart fails the run (no XP) and offers to review this chapter, which starts the same chapter in review mode", async () => {
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage:not(.hidden) #testExercise");
      const qid = await page.evaluate(() => currentSlide().kind === "explorer" ? null : 1);
      await page.evaluate(() => { document.getElementById("testCheck").disabled = false; });
      await page.locator("#testCheck").click();                       // explorer -> activity
      await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); await page.waitForSelector("#testSkip:not([hidden])"); await page.locator("#testSkip").click(); await page.locator("#testCheck").click();
      await page.waitForFunction(() => currentSlide().kind === "question");
      const q = await page.evaluate(() => currentSlide().q.question_id);
      for (let i = 0; i < 3; i++) { await L.answerQuestion(page, q, false); await page.waitForFunction(() => /Try again|Three attempts/.test(document.getElementById("testFeedbackV11").textContent)); if (i < 2) await page.waitForFunction(() => document.getElementById("testCheck").textContent === "CHECK" && !document.getElementById("testCheck").disabled); }
      assert.match(await page.locator("#testFeedbackV11").textContent(), /No XP was added/);
      assert.equal(await page.locator("#testCheck").textContent(), "REVIEW THE CHAPTER");
      const xp = await page.evaluate(() => app.user.total_xp);
      await page.locator("#testCheck").click();
      await page.waitForSelector("#testPage.is-review");
      assert.equal(await page.evaluate(() => testState.chapter_id), cid);
      assert.equal(await page.evaluate(() => app.user.total_xp), xp);
    });
    await ctx.close();
  }
  {
    const cid = C_SIMPLE;
    const { ctx, page } = await L.open({ tested: L.before(cid), hearts: 0 }, { width: 390, height: 844 }, { mobile: true });
    await t("with no hearts a graded run cannot start: a clear message, nothing opens", async () => {
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#toastStack .toast");
      assert.match(await page.locator("#toastStack .toast").first().innerText(), /No hearts left/);
      assert.equal(await page.locator("#testPage.hidden").count(), 1);
    });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open({ tested: L.ids("STG001", 0, 3) }, { width: 390, height: 844 }, { mobile: true });
    await t("a locked chapter explains why and opens nothing", async () => {
      const locked = L.ids("STG001", 4, 5)[0];
      await L.node(page, locked).scrollIntoViewIfNeeded(); await L.node(page, locked).click({ force: true });
      await page.waitForSelector("#toastStack .toast");
      assert.equal(await page.locator("#testPage.hidden").count(), 1);
      assert.equal(await page.locator("#home.active").count(), 1);
    });
    await ctx.close();
  }
  {
    // legacy: learned under the old flow but never tested
    const cid = C_SIMPLE;
    const { ctx, page } = await L.open({ tested: L.before(cid), learned: [cid] }, { width: 390, height: 844 }, { mobile: true });
    await t("legacy: a student who only did the old Learn half starts the chapter run; XP is paid once", async () => {
      assert.match(await L.node(page, cid).getAttribute("aria-label"), /current, tap to start the chapter/);
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage:not(.hidden) #testExercise");
      assert.equal(await page.evaluate(() => testState.mode), "graded");
      await L.playToEnd(page);
      assert.equal(await page.evaluate(() => app.user.total_xp), SEED_XP + servedXp(cid));
    });
    await ctx.close();
  }
  {
    // rollout safety: the frontend can go live a moment before the updated edge function
    const cid = C_SIMPLE;
    const { ctx, page, errors } = await L.open({ tested: L.before(cid), xp: SEED_XP }, { width: 390, height: 844 }, { mobile: true });
    await t("rollout safety: against a backend that does not know `unified` yet, the chapter still runs and XP is still paid once", async () => {
      await page.evaluate(() => { const orig = post; post = (a, p) => orig(a, ["startTest", "finishTest", "completeLearn"].includes(a) ? { ...p, unified: undefined } : p); });
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage:not(.hidden) .ce-target");   // startTest was refused once (Learn first), satisfied, and retried
      assert.equal(await page.evaluate(() => testState.mode), "graded");
      await L.playToEnd(page);
      assert.equal(await page.evaluate(() => app.user.total_xp), SEED_XP + servedXp(cid));
      assert.equal(await page.evaluate((c) => chapterProg(c).test_completed && chapterProg(c).learn_completed, cid), true);
      noErrors(errors);
    });
    await ctx.close();
  }
  {
    // legacy: a student who had already completed both halves keeps everything
    const cid = C_SIMPLE;
    const { ctx, page } = await L.open({ tested: [...L.before(cid), cid], learned: [cid], xp: 77 }, { width: 390, height: 844 }, { mobile: true });
    await t("legacy: a fully completed chapter stays completed, opens as a review, and pays nothing", async () => {
      assert.match(await L.node(page, cid).getAttribute("aria-label"), /completed\. Tap to review the chapter/);
      assert.match(await L.node(page, L.after(cid)).getAttribute("aria-label"), /current/);
      await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
      await page.waitForSelector("#testPage.is-review");
      await L.playToEnd(page);
      assert.equal(await page.evaluate(() => app.user.total_xp), 77);
    });
    await ctx.close();
  }

  // ================================================================ E. EVERY chapter, played to completion
  section("E. Every populated chapter: play all slides in a real browser (first run, all correct)");
  {
    const want = (process.env.CHAPTERS ? process.env.CHAPTERS.toUpperCase().split(",") : fx.chapters.map((c) => c.chapter_id)).filter((c) => decks[c]);
    const out = {};
    async function one(cid) {
      const deck = decks[cid], ex = deck.slides[0];
      const r = { cid, errors: [], problems: [] };
      const { ctx, page, errors } = await openChapter({ xp: SEED_XP }, cid, { width: 390, height: 844 }, { mobile: true });
      try {
        r.total = await page.evaluate(() => testState.slides.length);
        r.targets = await page.locator(".ce-target").count();
        r.refs = await page.locator("#testRefs a.cc-ref").evaluateAll((as) => as.map((a) => a.href));
        r.chips = await page.locator("#testGlossary .cg-chip").count();
        // every distinct target of slide 1 opens its own explanation
        for (const id of Object.keys(ex.targets)) {
          await page.locator('.ce-target[data-target="' + id + '"]').first().click();
          await page.waitForSelector("dialog.cg-sheet[open]");
          const title = (await page.locator("#cgTitle").textContent()).trim();
          if (title !== ex.targets[id].title) r.problems.push("target " + id + " opened '" + title + "'");
          await page.keyboard.press("Escape");
          await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]"));
        }
        // play; count activity slides that could not mount (the fallback message)
        const seen = [];
        for (let guard = 0; guard < 30; guard++) {
          await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE" || !!document.querySelector("#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta"), null, { timeout: 15000 });
          if (await page.evaluate(() => document.getElementById("testTypeLabel").textContent === "COMPLETE")) break;
          const s = await L.slideKind(page); seen.push(s.kind);
          if (s.kind === "activity" && (await page.locator("#testExercise p.meta").count())) r.problems.push("activity " + s.activity + " could not load");
          if (s.kind === "explorer") { const need = Explorer.minTapsFor(ex); const tg = page.locator(".ce-target"); const done = new Set(); for (let i = 0; i < (await tg.count()) && done.size < need; i++) { const id = await tg.nth(i).getAttribute("data-target"); if (done.has(id)) continue; done.add(id); await tg.nth(i).click(); await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]")); } await page.locator("#testCheck").click(); }
          else if (s.kind === "activity") { await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); await page.waitForFunction(() => !document.getElementById("testCheck").disabled || !document.getElementById("testSkip").hidden, null, { timeout: 5000 }); if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click(); await page.locator("#testCheck").click(); }
          else { await L.answerQuestion(page, s.qid, true); await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent)); await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent)); await page.locator("#testCheck").click(); }
        }
        await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent === "COMPLETE", null, { timeout: 15000 });
        r.kinds = seen;
        r.after = await page.evaluate((c) => ({ xp: app.user.total_xp, hearts: app.user.hearts, cp: chapterProg(c), title: document.getElementById("testQuestionTitle").textContent }), cid);
        await page.locator("#testCheck").click(); await page.waitForSelector("#home.active");
        const nxt = L.after(cid);
        if (nxt) r.next = await L.node(page, nxt).getAttribute("aria-label");
      } catch (e) { r.problems.push("run failed: " + String(e.message).split("\n")[0]); }
      r.errors = errors; await ctx.close();
      out[cid] = r;
    }
    const queue = want.slice();
    await Promise.all([0, 1, 2, 3].map(async () => { while (queue.length) await one(queue.shift()); }));
    for (const cid of want) {
      const deck = decks[cid], r = out[cid];
      await t(cid + " " + deck.title + ": all " + deck.slides.length + " slides play; questions, XP, unlocking and glossary all work", async () => {
        assert.deepEqual(r.problems, []);
        assert.equal(r.total, deck.slides.length);
        assert.equal(r.targets, Explorer.parse(deck.slides[0].code).tokens.length);
        assert.deepEqual(r.refs, deck.references.map((x) => x.url));
        assert.ok(r.chips >= 1);
        assert.deepEqual(r.kinds, deck.slides.map((s) => s.kind), "slides play in the deck's order");
        assert.equal(r.after.xp, SEED_XP + servedXp(cid), "chapter XP: the served questions, once");
        assert.equal(r.after.hearts, 3);
        assert.equal(r.after.cp.test_completed && r.after.cp.learn_completed, true);
        assert.equal(r.after.title, "Chapter complete!");
        if (L.after(cid)) assert.match(r.next, /current, tap to start the chapter|locked/);
        noErrors(r.errors);
      });
    }
  }

  // ================================================================ G. loading and C execution
  section("G. Lazy loading and C execution inside a chapter");
  {
    const cid = "CH0034";
    const { ctx, page } = await L.open({ tested: L.before(cid) }, { width: 390, height: 844 }, { mobile: true });
    const reqs = [];
    page.on("request", (r) => { const u = r.url(); if (/\/assets\/(chapter|learn)\//.test(u)) reqs.push(u.replace(/^.*\/assets\//, "assets/").split("?")[0]); });
    await L.node(page, cid).scrollIntoViewIfNeeded(); await L.node(page, cid).click();
    await page.waitForSelector("#testPage:not(.hidden) .ce-target");
    await L.passExplorer(page);
    await page.waitForSelector("#testExercise .la, #testExercise .option");
    await t("opening a chapter downloads only THAT chapter's deck and activity definitions, never the rest of the course", async () => {
      assert.deepEqual(reqs.filter((r) => /assets\/chapter\/defs\//.test(r)), ["assets/chapter/defs/ch0034.js"]);
      assert.deepEqual(reqs.filter((r) => /assets\/learn\/defs\//.test(r)), ["assets/learn/defs/ch0034.js"]);
      assert.equal(reqs.filter((r) => /defs\/ch\d{4}\.js/.test(r) && !/ch0034/.test(r)).length, 0);
    });
    await ctx.close();
  }
  {
    // a chapter whose hands-on slide RUNS C: the sandboxed interpreter executes the student's program in the browser
    const cid = "CH0031", act = decks[cid].slides.findIndex((s) => s.kind === "activity" && /change-greeting/.test(s.activity));
    const { ctx, page, errors } = await openChapter({}, cid, { width: 390, height: 844 }, { mobile: true });
    await t("C execution: the 'run' activity compiles and runs the student's program in the browser and shows its real output", async () => {
      assert.ok(act > 0, "the deck contains the run activity");
      await L.passExplorer(page);
      await page.evaluate((i) => { testState.index = i; renderTest(); }, act);   // jump to that slide (navigation is tested elsewhere)
      await page.waitForSelector('#testExercise .la-k-run');
      await page.locator("#testExercise .la-k-run button", { hasText: /^Run$/ }).click();
      await page.waitForFunction(() => /Hello/.test(document.querySelector("#testExercise .la-k-run").innerText), null, { timeout: 15000 });
      // edit the program: the output follows the edit
      await page.locator("#testExercise .la-k-run textarea").first().fill('#include <stdio.h>\nint main() { printf("Chapter run works"); return 0; }');
      await page.locator("#testExercise .la-k-run button", { hasText: /^Run$/ }).click();
      await page.waitForFunction(() => /Chapter run works/.test(document.querySelector("#testExercise .la-k-run").innerText), null, { timeout: 15000 });
      assert.equal(await page.evaluate(() => typeof Worker !== "undefined"), true);
    });
    await t("no JS errors while running C", async () => noErrors(errors));
    await ctx.close();
  }

  // ================================================================ F. layout and contrast: 6 viewports x 2 themes, representative chapters
  section("F. Responsive layout and theme contrast (Code Explorer, activity, question, sheet, references)");
  {
    const VIEWPORTS = [[360, 800], [390, 844], [412, 915], [1280, 720], [1440, 900], [1920, 1080]];
    // simple, datatype, operator (bit visualiser), input (buffer simulator), decision, loop (C interpreter), loop lab, glossary-heavy,
    // 2D array (widest code: nested nested-bracket declaration + nested loops), and Searching & Sorting: binary search (while loop
    // + trace), bubble sort (nested loops + trace), a comparison chapter (reveal/assign/order/builder activities)
    // REPS=CH0079,CH0080 (env) replaces this list, e.g. to run the layout checks over a whole stage.
    const REPS = process.env.REPS ? process.env.REPS.toUpperCase().split(",").map((s) => s.trim()).filter((c) => decks[c]) : ["CH0031", "CH0036", "CH0044", "CH0047", "CH0052", "CH0056", "CH0058", "CH0035", "CH0069", "CH0086", "CH0090", "CH0093", "CH0073", "CH0074", "CH0075", "CH0076", "CH0077", "CH0078"];
    const layout = () => {
      const W = document.documentElement.clientWidth, out = [];
      if (document.documentElement.scrollWidth > W + 1) out.push("horizontal scroll " + document.documentElement.scrollWidth + " > " + W);
      const inView = (el, name) => { if (!el || !el.getBoundingClientRect().width) return; const r = el.getBoundingClientRect(); if (r.left < -0.5 || r.right > W + 0.5) out.push(name + " outside the screen [" + Math.round(r.left) + "," + Math.round(r.right) + "] of " + W); };
      inView(document.querySelector("#testLessonCard"), "card");
      document.querySelectorAll(".ce-code, #testExercise .la, .test-v11-code, #testRefs .cc-ref, #testCheck, .cg-chip, #testExercise .option, #testExercise .la pre").forEach((e, i) => inView(e, e.className.split(" ")[0] + "#" + i));
      document.querySelectorAll(".ce-code, .test-v11-code, #testExercise .la pre").forEach((e, i) => { if (e.scrollWidth > e.clientWidth + 1) out.push("code block scrolls sideways (" + e.className.split(" ")[0] + "#" + i + ": " + e.scrollWidth + " > " + e.clientWidth + ")"); });
      const chk = document.getElementById("testCheck").getBoundingClientRect(); if (chk.height < 44) out.push("Check/Continue is only " + Math.round(chk.height) + "px tall");
      document.querySelectorAll("#testRefs .cc-ref").forEach((a) => { if (a.getBoundingClientRect().height < 44) out.push("reference link under 44px"); });
      return out;
    };
    const theme_ = (page) => page.evaluate(() => {
      const stops = (el) => { const cs = getComputedStyle(el); return (cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []).concat(cs.backgroundImage === "none" ? [cs.backgroundColor] : []).map((x) => x.match(/[\d.]+/g).slice(0, 3).map(Number)); };
      const col = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).color : null; };
      return { card: stops(document.getElementById("testLessonCard")), code: stops(document.querySelector(".ce-code") || document.body), page: getComputedStyle(document.body).backgroundColor,
        target: col(".ce-target"), hint: col(".ce-hint"), progress: col(".ce-progress"), goal: col("#testQuestionExplain"), chip: col(".cg-chip"), chipBg: (document.querySelector(".cg-chip") ? getComputedStyle(document.querySelector(".cg-chip")).backgroundColor : null), lead: col("#testLead"), refTitle: col(".cc-refs-title"), refSmall: col(".cc-ref-text small"), refText: col(".cc-ref-text") };
    });
    for (const theme of ["dark", "light"]) {
      for (const cid of REPS) {
        const deck = decks[cid];
        const { ctx, page, errors } = await openChapter({ theme }, cid, { width: 390, height: 844 }, {});
        const problems = [];
        const checkAll = async (label) => {
          for (const [w, h] of VIEWPORTS) {
            await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(60);
            const p = await page.evaluate(layout); p.forEach((x) => problems.push(w + "x" + h + " " + label + ": " + x));
          }
          await page.setViewportSize({ width: 390, height: 844 });
        };
        await checkAll("explorer");
        if (cid === "CH0031") { await L.shot(page, "ch-" + theme + "-explorer-390"); }
        // the explanation sheet at every size
        await page.locator(".ce-target").nth(1).click(); await page.waitForSelector("dialog.cg-sheet[open]");
        for (const [w, h] of VIEWPORTS) {
          await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(60);
          const r = await page.evaluate(() => { const d = document.querySelector("dialog.cg-sheet").getBoundingClientRect(); return { l: d.left, r: d.right, t: d.top, b: d.bottom, W: innerWidth, H: innerHeight }; });
          if (r.l < -0.5 || r.r > r.W + 0.5 || r.t < -0.5 || r.b > r.H + 0.5) problems.push(w + "x" + h + " sheet outside the screen " + JSON.stringify(r));
        }
        await L.shot(page, "ch-" + theme + "-" + cid + "-sheet"); await page.setViewportSize({ width: 390, height: 844 });
        const col = await theme_(page);
        await page.keyboard.press("Escape");
        // contrast on the explorer slide
        const minOn = (fg, bgs) => Math.min(...bgs.map((b) => ratio(rgb(fg), b)));
        const cs = [["code target on the code block", minOn(col.target, col.code)], ["hint text on the card", minOn(col.hint, col.card)], ["progress text on the card", minOn(col.progress, col.card)], ["goal line on the card", minOn(col.goal, col.card)], ["chip text on its chip", ratio(rgb(col.chip), rgb(col.chipBg))], ["reference title on the page", ratio(rgb(col.refTitle), rgb(col.page))], ["reference channel on the page", ratio(rgb(col.refSmall), rgb(col.page))], ["reference link on the page", ratio(rgb(col.refText), rgb(col.page))]];
        cs.forEach(([name, v]) => { if (v < 4.5) problems.push(theme + " contrast " + v.toFixed(2) + ":1 for " + name); });
        // the sheet itself: text and label colours against the dialog background
        await page.locator(".ce-target").nth(1).click(); await page.waitForSelector("dialog.cg-sheet[open]");
        const sh = await page.evaluate(() => { const d = document.querySelector("dialog.cg-sheet"), bg = getComputedStyle(d).backgroundColor, c = (s) => { const e = d.querySelector(s); return e ? getComputedStyle(e).color : null; }; return { bg, body: c("#cgBody p"), kicker: c("#cgKicker"), title: c("#cgTitle code") }; });
        [["sheet body text", sh.body], ["sheet kicker", sh.kicker], ["sheet title", sh.title]].forEach(([name, fg]) => { if (fg) { const v = ratio(rgb(fg), rgb(sh.bg)); if (v < 4.5) problems.push(theme + " contrast " + v.toFixed(2) + ":1 for " + name); } });
        await page.keyboard.press("Escape"); await page.waitForFunction(() => !document.querySelector("dialog.cg-sheet[open]"));
        // an activity slide and a question slide
        await L.passExplorer(page);
        await page.waitForFunction(() => currentSlide().kind !== "explorer");
        const k2 = (await L.slideKind(page)).kind;
        await page.waitForSelector("#testExercise .la, #testExercise .option, #testTextAnswer, #testExercise .test-code-fill-box, #testExercise .test-v11-token, #testExercise p.meta");
        await checkAll(k2); await L.shot(page, "ch-" + theme + "-" + cid + "-slide2");
        // walk to the first question slide
        for (let g = 0; g < 8 && (await L.slideKind(page)).kind !== "question"; g++) {
          if ((await L.slideKind(page)).kind === "activity") { await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); await page.waitForFunction(() => !document.getElementById("testCheck").disabled || !document.getElementById("testSkip").hidden, null, { timeout: 5000 }); if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click(); await page.locator("#testCheck").click(); await page.waitForFunction(() => document.getElementById("testTypeLabel").textContent !== "TRY IT" || true); await page.waitForTimeout(150); }
        }
        if ((await L.slideKind(page)).kind === "question") {
          await checkAll("question"); await L.shot(page, "ch-" + theme + "-" + cid + "-question");
          const q = await theme_(page);
          const v = Math.min(...[q.goal, q.lead].filter(Boolean).map((c) => minOn(c, q.card)));
          if (v < 4.5) problems.push(theme + " contrast " + v.toFixed(2) + ":1 for question-slide goal/lead text");
        }
        await t(theme + " " + cid + " " + deck.title + ": explorer, activity, question and sheet lay out cleanly at 360/390/412/1280/1440/1920 with readable contrast", async () => { assert.deepEqual(problems, []); noErrors(errors); });
        await ctx.close();
      }
    }
    await t("Code Explorer parts are big enough to tap: at least 24px tall (WCAG 2.2 target size), and the sheet close button is 44px+", async () => {
      const { ctx, page } = await openChapter({}, "CH0044", { width: 360, height: 800 }, { mobile: true });
      const small = await page.locator(".ce-target").evaluateAll((els) => els.map((e) => ({ t: e.textContent, h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 24));
      assert.deepEqual(small, []);
      await page.locator(".ce-target").first().click(); await page.waitForSelector("dialog.cg-sheet[open]");
      assert.ok((await page.locator("#cgClose").boundingBox()).height >= 44);
      await ctx.close();
    });
  }

  // ================================================================ H. QA-fix regression: evalorder glyph, buffer wording; pipeline left unchanged
  section("H. QA-fix regression: evalorder operator glyphs, buffer whitespace wording, pipeline unchanged");
  {
    const { ctx, page, errors } = await openChapter({}, "CH0045", { width: 390, height: 844 }, { mobile: true });
    await t("evalorder (CH0045 'Which operator runs first?'): operator buttons show the real glyph exactly once, not doubled", async () => {
      await L.passExplorer(page);
      assert.equal((await L.slideKind(page)).activity, "CH0045.p4.order-multiply-first");
      const glyphs = await page.locator("#testExercise .la-op").allTextContents();
      assert.deepEqual(glyphs, ["+", "*"], "exactly the real operators, undoubled (this previously rendered as ++ / **)");
      const labels = await page.locator("#testExercise .la-op").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
      assert.deepEqual(labels, ["Operator +", "Operator *"], "aria-label was already correct and stays correct");
    });
    await t("evalorder: an out-of-order click is rejected without completing the activity", async () => {
      await page.locator("#testExercise .la-op", { hasText: "+" }).click(); // + depends on * being resolved first -- not ready yet
      await page.waitForFunction(() => /Not yet/.test(document.querySelector("#testExercise .la-feedback").textContent));
      assert.equal(await page.evaluate(() => { const d = document.querySelector("#testExercise .la-done"); return d ? d.hidden : null; }), true, "not marked done from an unready click");
    });
    await t("evalorder: keyboard activation (Tab + Enter) still works, and the correct order completes the activity with the right result", async () => {
      await page.locator("#testExercise .la-op", { hasText: "*" }).focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => /ready/.test(document.querySelector("#testExercise .la-feedback").textContent));
      await page.locator("#testExercise .la-op", { hasText: "+" }).click();
      await page.waitForFunction(() => /The result is 14/.test(document.querySelector("#testExercise .la-feedback").textContent));
      assert.equal(await page.evaluate(() => !document.querySelector("#testExercise .la-done").hidden), true, "done tick shows once the value is fully worked out");
    });
    await t("no JS errors on the evalorder slide", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const { ctx, page, errors } = await openChapter({}, "CH0047", { width: 390, height: 844 }, { mobile: true });
    const note = () => page.locator("#testExercise .la-explain p").textContent();
    const chips = () => page.locator("#testExercise .la-chip").evaluateAll((els) => els.map((e) => ({ ch: e.getAttribute("aria-label"), now: e.classList.contains("now") })));
    const runNext = () => page.locator("#testExercise button", { hasText: "Run next input call" }).click();
    await t("buffer (CH0047 'Watch a number flow in'): default input '85\\n' has no leading whitespace, so the note must not claim one was skipped", async () => {
      await L.passExplorer(page);
      assert.equal((await L.slideKind(page)).activity, "CH0047.p2.watch-marks-flow");
      assert.equal(await page.locator("#testExercise .la-input").inputValue(), "85\n");
      await runNext();
      const n = await note();
      assert.doesNotMatch(n, /skip/i, "no leading whitespace in \"85\\n\" -- must not claim one was skipped: " + n);
      assert.match(n, /read "85"/, "still reports the value it read");
      // the buffer visualization/consumed-character logic must be unaffected by the wording fix
      assert.deepEqual(await chips(), [{ ch: "8", now: true }, { ch: "5", now: true }, { ch: "newline", now: false }], "scanf(\"%d\") stops before the trailing newline, unchanged");
    });
    await t("buffer: another no-whitespace input ('7\\n') also gets no false whitespace claim, and consumed characters stay correct", async () => {
      await page.locator("#testExercise .la-input").fill("7\n");
      await runNext();
      const n = await note();
      assert.doesNotMatch(n, /skip/i, n);
      assert.match(n, /read "7"/);
      assert.deepEqual(await chips(), [{ ch: "7", now: true }, { ch: "newline", now: false }]);
    });
    await t("buffer: real leading whitespace (' 42\\n') DOES get the whitespace-skip explanation, and consumed characters are still correct", async () => {
      await page.locator("#testExercise .la-input").fill(" 42\n");
      await runNext();
      const n = await note();
      assert.match(n, /skip/i, "real leading whitespace must still be explained: " + n);
      assert.match(n, /read "42"/);
      assert.deepEqual(await chips(), [{ ch: "space", now: true }, { ch: "4", now: true }, { ch: "2", now: true }, { ch: "newline", now: false }]);
    });
    await t("buffer: the activity still reaches completion after enough interactions, unrelated to the wording fix", async () => {
      // 3 "Run next input call" clicks have now happened (85\n, 7\n, " 42\n"), matching this kind's interactions(api,3) rule
      assert.equal(await page.evaluate(() => !document.querySelector("#testExercise .la-done").hidden), true);
      assert.equal(await page.evaluate(() => !document.getElementById("testCheck").disabled), true, "the slide's own Continue also enables");
    });
    await t("no JS errors on the buffer slide", async () => noErrors(errors));
    await ctx.close();
  }
  {
    const { ctx, page, errors } = await openChapter({}, "CH0031", { width: 390, height: 844 }, { mobile: true });
    await t("pipeline (CH0031 'Send code through the pipeline'): left unchanged -- a correct scenario still reaches real Run-stage output", async () => {
      await L.passExplorer(page);
      const q = (await L.slideKind(page)).qid;
      await L.answerQuestion(page, q, true);
      await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent));
      await page.locator("#testCheck").click();
      assert.equal((await L.slideKind(page)).activity, "CH0031.p2.build-pipeline");
      await page.locator("#testExercise button", { hasText: "Run everything" }).click();
      await page.waitForFunction(() => /Program output/i.test(document.querySelector("#testExercise .la-explain")?.textContent || ""));
      assert.match(await page.locator("#testExercise .la-explain").textContent(), /Hello World!/, "a correct scenario still reaches real Run-stage output");
    });
    await t("no JS errors on the pipeline slide", async () => noErrors(errors));
    await ctx.close();
  }

  // ================================================================ I. UX-bug regression: Home mid-chapter, unlabeled fill blanks, clipped choices, clipped CODE_FILL blank
  section("I. UX-fix regression: Home reachable mid-chapter, blank roles visible, predict choices not clipped, CODE_FILL blanks stay in view");
  {
    const ANY = "#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta";
    const goTo = async (page, match) => {
      for (let g = 0; g < 12; g++) {
        await page.waitForFunction((sel) => !!document.querySelector(sel), ANY, { timeout: 15000 });
        const s = await L.slideKind(page);
        if (match(s)) return s;
        if (s.kind === "explorer") await L.passExplorer(page);
        else if (s.kind === "activity") { await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); await page.waitForFunction(() => !document.getElementById("testCheck").disabled || !document.getElementById("testSkip").hidden, null, { timeout: 5000 }); if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click(); await page.locator("#testCheck").click(); }
        else { await L.answerQuestion(page, s.qid, true); await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent)); await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent)); await page.locator("#testCheck").click(); }
      }
      throw new Error("slide not found");
    };
    const homeProbe = () => { const b = document.getElementById("testBack"), r = b.getBoundingClientRect(), el = document.elementFromPoint(Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1), Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1)); return { inViewport: r.top >= -0.5 && r.bottom <= innerHeight + 0.5, hit: el === b || b.contains(el), w: r.width, h: r.height, y: Math.round(scrollY), scrolls: document.documentElement.scrollHeight > innerHeight + 20 }; };

    for (const vp of [[390, 844], [1280, 720]]) {
      const { ctx, page, errors } = await openChapter({}, "CH0032", { width: vp[0], height: vp[1] }, { mobile: vp[0] < 800 });
      await t("Stage 1 Ch.2 'Only one \\n' at " + vp.join("x") + ": the Words to Know are the chapter's own terms, and the answer choices are fully drawn (first glyph of each line not clipped)", async () => {
        await goTo(page, (s) => s.activity === "CH0032.p4.predict-newline-middle");
        assert.deepEqual(await page.locator("#testGlossary .cg-chip").allTextContents().then((a) => a.map((x) => x.trim())), ["\\n (new line)", "output"], "Words to Know come from the chapter's glossary");
        const ov = await page.evaluate(() => [...document.querySelectorAll(".la-choice-pre")].map((p) => getComputedStyle(p).overflowX + "/" + getComputedStyle(p).overflowY));
        assert.equal(ov.length, 4); assert.ok(ov.every((o) => o === "visible/visible"), "choice <pre> must not be a scroll container (it clipped the first glyph of every line): " + ov.join(","));
        assert.deepEqual(await page.locator(".la-choice-pre").allTextContents(), ["CatDogBird", "Cat\nDog\nBird", "Cat\nDogBird", "Cat Dog Bird"], "the four real choices, unchanged");
      });
      await t("Home stays reachable at " + vp.join("x") + " after scrolling down a long slide (top, middle and bottom), with a real 44px tap target", async () => {
        for (const frac of [0, 0.5, 1]) {
          await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), frac); await page.waitForTimeout(60);
          const p = await page.evaluate(homeProbe);
          assert.ok(p.inViewport && p.hit, "Home not reachable at scrollY " + p.y + ": " + JSON.stringify(p));
          assert.ok(p.w >= 44 && p.h >= 44, "Home tap target " + p.w + "x" + p.h);
        }
      });
      await t("the sticky header never hides what you are working on at " + vp.join("x") + ": an exercise scrolled under it can still be clicked, and Tab never lands a control beneath it", async () => {
        assert.match(await page.evaluate(() => getComputedStyle(document.documentElement).scrollPaddingTop), /^\d+(\.\d+)?px$/, "scroll-padding-top leaves room for the header");
        await page.evaluate(() => { const ex = document.getElementById("testExercise"); window.scrollTo(0, window.scrollY + ex.getBoundingClientRect().top - 20); }); await page.waitForTimeout(100);
        await page.locator("#testExercise").click({ position: { x: 6, y: 6 }, timeout: 4000 });
        await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
        for (let i = 0; i < 30; i++) {
          await page.keyboard.press("Tab");
          const r = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body || e.closest(".lessonbar")) return null; const b = e.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, barBottom: document.querySelector(".lessonbar").getBoundingClientRect().bottom }; });
          if (r) assert.ok(!(r.bottom > 0 && r.top < r.barBottom - 1), "a focused control is hidden under the sticky header: " + JSON.stringify(r));
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      });
      await t("Home is a labelled, keyboard-reachable button with a visible focus ring, and clicking it mid-chapter returns to Home without touching progress", async () => {
        assert.equal(await page.getAttribute("#testBack", "aria-label"), "Back to Home");
        await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
        await page.mouse.click(3, 3); // restart keyboard navigation from the top of the page (a click sets the browser's focus starting point)
        let reached = false; for (let i = 0; i < 6 && !reached; i++) { await page.keyboard.press("Tab"); reached = await page.evaluate(() => document.activeElement.id === "testBack"); }
        assert.ok(reached, "Tab reaches Home");
        assert.ok(await page.evaluate(() => { const c = getComputedStyle(document.activeElement); return c.outlineStyle !== "none" && parseFloat(c.outlineWidth) >= 2; }), "visible focus ring");
        const before = await stat(page); const done0 = await page.evaluate(() => chapterProg("CH0032").test_completed);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(60);
        await page.locator("#testBack").click();
        await page.waitForSelector("#home.active");
        assert.deepEqual(await stat(page), before, "leaving mid-chapter changes neither XP nor hearts");
        assert.equal(await page.evaluate(() => chapterProg("CH0032").test_completed), done0, "and does not mark the chapter completed");
        await L.node(page, "CH0032").scrollIntoViewIfNeeded(); await L.node(page, "CH0032").click(); await page.waitForSelector("#testPage:not(.hidden) .ce-target");
      });
      await t("no JS errors (Stage 1 Ch.2 slide, " + vp.join("x") + ")", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0054", { width: 390, height: 844 }, { mobile: true });
      await t("Stage 4 Ch.5 'Build the ternary': each blank says what it is for (placeholder + written key), and the existing typed answers still validate", async () => {
        await goTo(page, (s) => s.activity === "CH0054.p1.build-ternary");
        assert.deepEqual(await page.locator("#testExercise input.la-blank").evaluateAll((els) => els.map((e) => e.getAttribute("placeholder"))), ["condition", "TRUE choice", "FALSE choice"]);
        assert.deepEqual(await page.locator("#testExercise input.la-blank").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label"))), ["Blank 1 of 3: condition", "Blank 2 of 3: TRUE choice", "Blank 3 of 3: FALSE choice"]);
        const key = (await page.locator("#testExercise .la-blank-key").innerText()).replace(/\s+/g, " ");
        assert.match(key, /Blank 1: condition/); assert.match(key, /Blank 2: TRUE choice/); assert.match(key, /Blank 3: FALSE choice/); assert.match(key, /double quotes/);
        const boxes = page.locator("#testExercise input.la-blank");
        await boxes.nth(0).fill("marks < 40"); await boxes.nth(1).fill("Pass"); await boxes.nth(2).fill("Fail");
        await page.locator("#testExercise .la-actions button", { hasText: /^Check$/ }).click();
        await page.waitForFunction(() => /Blank 1|Blank 2|Blank 3/.test(document.querySelector("#testExercise .la-feedback").textContent));
        await page.locator("#testExercise .la-actions button", { hasText: /^Reset$/ }).click();
        assert.deepEqual(await boxes.evaluateAll((els) => els.map((e) => e.value)), ["", "", ""], "Reset clears every blank");
        await boxes.nth(0).fill("marks > 39"); await boxes.nth(1).fill('"Pass"'); await boxes.nth(2).fill('"Fail"'); // an accepted alternative answer
        await page.locator("#testExercise .la-actions button", { hasText: /^Check$/ }).click();
        await page.waitForFunction(() => /Correct/.test(document.querySelector("#testExercise .la-feedback").textContent));
      });
      await t("no JS errors (Stage 4 Ch.5 fill)", async () => noErrors(errors));
      await ctx.close();
    }
    for (const vp of [[360, 800], [390, 844], [1280, 720]]) {
      const { ctx, page, errors } = await openChapter({}, "CH0056", { width: vp[0], height: vp[1] }, { mobile: vp[0] < 800 });
      await t("Stage 5 Ch.1 CODE_FILL at " + vp.join("x") + ": all three blanks sit inside the card (none pushed off the edge), each named in a key, and typing the answers is accepted", async () => {
        await goTo(page, (s) => s.qid === "Q000293");
        const r = await page.evaluate(() => { const card = document.getElementById("testLessonCard").getBoundingClientRect(); return { bad: [...document.querySelectorAll("#testExercise .test-code-fill-box")].filter((e) => { const b = e.getBoundingClientRect(); return b.left < card.left - 1 || b.right > card.right + 1; }).length, n: document.querySelectorAll("#testExercise .test-code-fill-box").length, key: document.querySelector("#testExercise .test-blank-key").innerText.replace(/\s+/g, " ") }; });
        assert.equal(r.n, 3); assert.equal(r.bad, 0, "a blank is outside the card"); assert.match(r.key, /Blank 1: initialization.*Blank 2: condition.*Blank 3: update/);
        assert.deepEqual(await page.locator("#testExercise .test-code-fill-box").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label"))), ["Code blank 1: initialization", "Code blank 2: condition", "Code blank 3: update"]);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, "no horizontal page scroll");
        await L.answerQuestion(page, "Q000293", true);
        await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent));
      });
      await t("no JS errors (Stage 5 Ch.1 CODE_FILL, " + vp.join("x") + ")", async () => noErrors(errors));
      await ctx.close();
    }
  }

  // ================================================================ J. Stage 6-8 QA regression: blank builder choice, unlabeled blanks, editor Tab trap, ORDER focus, favicon
  section("J. Stage 6-8 QA regression: no blank dropdown choice, blank roles, no keyboard trap in the code editor, ORDER keeps focus, page icon");
  {
    const ANY = "#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta";
    const goTo = async (page, match) => {
      for (let g = 0; g < 12; g++) {
        await page.waitForFunction((sel) => !!document.querySelector(sel), ANY, { timeout: 15000 });
        const s = await L.slideKind(page);
        if (match(s)) return s;
        if (s.kind === "explorer") await L.passExplorer(page);
        else if (s.kind === "activity") { await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); await page.waitForFunction(() => !document.getElementById("testCheck").disabled || !document.getElementById("testSkip").hidden, null, { timeout: 5000 }); if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click(); await page.locator("#testCheck").click(); }
        else { await L.answerQuestion(page, s.qid, true); await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent)); await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent)); await page.locator("#testCheck").click(); }
      }
      throw new Error("slide not found");
    };
    const restartFocus = async (page) => { await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); }); await page.mouse.click(3, 3); };
    const tabUntil = async (page, pred, max = 60) => { for (let i = 0; i < max; i++) { await page.keyboard.press("Tab"); if (await page.evaluate(pred)) return true; } return false; };

    {
      const { ctx, page, errors } = await openChapter({}, "CH0067", { width: 390, height: 844 }, { mobile: true });
      await t("CH0067 builder: no dropdown choice is blank; 'leave it out' is a visible choice, usable, and the statement preview and answer check treat it correctly", async () => {
        assert.ok(await page.evaluate(() => !!document.querySelector('link[rel~="icon"]')), "the page declares an icon (otherwise every load requests /favicon.ico and gets a 404)");
        await goTo(page, (s) => s.activity === "CH0067.p3.build-average-line");
        H.loadActivities();
        const d = globalThis.ClickLearn.defs.get("CH0067.p3.build-average-line"), keys = [...d.template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
        const sels = page.locator("#testExercise .la-build select.la-select");
        const opts = await sels.evaluateAll((s) => s.map((x) => [...x.options].map((o) => o.text)));
        opts.forEach((o) => assert.ok(o.every((x) => x.trim()), "a dropdown row renders blank: " + JSON.stringify(o)));
        const ci = keys.indexOf("cast"); assert.ok(opts[ci].includes("(nothing)"), "the empty option is labelled: " + JSON.stringify(opts[ci]));
        for (let i = 0; i < keys.length; i++) await sels.nth(i).selectOption(i === ci ? { label: "(nothing)" } : d.slots[keys[i]].answer);
        const shown = await page.locator("#testExercise .la-preview code").innerText();
        assert.ok(!/…/.test(shown) && !/\(float\)|\(int\)/.test(shown), "choosing '(nothing)' shows the statement without a cast: " + shown);
        await page.locator("#testExercise .la-actions button", { hasText: /^Check$/ }).click();
        await page.waitForFunction(() => /Not quite/.test(document.querySelector("#testExercise .la-feedback").textContent));
        assert.match(await page.locator("#testExercise .la-feedback").innerText(), /cast/i, "the feedback explains the cast");
        await page.locator("#testExercise .la-actions button", { hasText: /^Reset$/ }).click();
        for (let i = 0; i < keys.length; i++) await sels.nth(i).selectOption(d.slots[keys[i]].answer);
        await page.locator("#testExercise .la-actions button", { hasText: /^Check$/ }).click();
        await page.waitForFunction(() => /valid C/.test(document.querySelector("#testExercise .la-feedback").textContent));
      });
      await t("no JS errors (CH0067 builder)", async () => noErrors(errors));
      await ctx.close();
    }
    for (const [cid, qid, roles] of [["CH0069", "Q000370", ["row index", "column index"]], ["CH0070", "Q000375", ["row variable", "column variable"]]]) {
      const { ctx, page, errors } = await openChapter({}, cid, { width: 390, height: 844 }, { mobile: true });
      await t(cid + " " + qid + ": the two blanks say what they are for (key + accessible names) and the existing answer is accepted", async () => {
        await goTo(page, (s) => s.qid === qid);
        const key = (await page.locator("#testExercise .test-blank-key").innerText()).replace(/\s+/g, " ");
        assert.match(key, new RegExp("Blank 1: " + roles[0])); assert.match(key, new RegExp("Blank 2: " + roles[1]));
        assert.deepEqual(await page.locator("#testExercise .test-code-fill-box").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label"))), ["Code blank 1: " + roles[0], "Code blank 2: " + roles[1]]);
        await L.answerQuestion(page, qid, true);
        await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent));
      });
      await t("no JS errors (" + cid + " " + qid + ")", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0078", { width: 1280, height: 720 }, {});
      await t("CH0078 code editor: Tab still indents, but Escape then Tab leaves the editor (no keyboard trap) and Run is reachable; the tip is shown", async () => {
        await goTo(page, (s) => s.activity === "CH0078.p1.change-and-run");
        assert.ok(await page.locator("#testExercise .la-editor-tip").isVisible(), "the keyboard tip is visible under the editor");
        const ta = page.locator("#testExercise textarea").first(); await ta.focus();
        const before = (await ta.inputValue()).length;
        await page.keyboard.press("Tab");
        assert.equal((await ta.inputValue()).length, before + 4, "Tab indents by four spaces");
        assert.ok(await page.evaluate(() => document.activeElement.tagName === "TEXTAREA"), "focus stays in the editor after an indenting Tab");
        await page.keyboard.press("Escape"); await page.keyboard.press("Tab");
        assert.ok(await page.evaluate(() => document.activeElement.tagName !== "TEXTAREA"), "Escape then Tab moves focus out of the editor");
        const onRun = () => /^Run$/.test((document.activeElement.innerText || "").trim());
        assert.ok((await page.evaluate(onRun)) || (await tabUntil(page, onRun, 6)), "the Run button is reachable by keyboard");
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => /Ran fine|reached the goal|did not run/.test((document.querySelector("#testExercise .la-feedback") || {}).textContent || ""));
        assert.equal(await page.evaluate(() => (document.activeElement.innerText || "").trim()), "Run", "after Run finishes, keyboard focus is still on the Run button (it was dropped to the page body while the button was disabled)");
        await ta.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
        assert.equal((await ta.inputValue()).length, before + 12, "after leaving and returning, each Tab indents again by four (the release is one-shot): 4 from the first Tab + 2 x 4");
      });
      await t("no JS errors (CH0078 editor)", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0062", { width: 1280, height: 720 }, {});
      await t("graded ORDER question (Q000336): activating a line with Enter keeps keyboard focus on the next line, then on CHECK", async () => {
        await goTo(page, (s) => s.qid === "Q000336");
        const n = await page.locator("#testExercise .test-v11-token").count(); assert.ok(n >= 3);
        await restartFocus(page); assert.ok(await tabUntil(page, () => document.activeElement.matches(".test-v11-token"), 30), "a line is reachable by Tab");
        for (let i = 0; i < n; i++) {
          await page.keyboard.press("Enter");
          const where = await page.evaluate(() => { const e = document.activeElement; return e === document.body ? "body" : e.id || e.className.split(" ")[0]; });
          assert.notEqual(where, "body", "focus was dropped after line " + (i + 1) + " of " + n);
          if (i < n - 1) assert.equal(where, "test-v11-token", "focus moves to the next available line (was " + where + ")");
        }
        assert.equal(await page.evaluate(() => document.activeElement.id), "testCheck", "with every line used, focus lands on CHECK");
      });
      await t("no JS errors (ORDER question)", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0076", { width: 1280, height: 720 }, {});
      await t("Learn order activity (CH0076): tapping a line with Enter keeps focus in the pool, then moves to Check", async () => {
        await goTo(page, (s) => s.activity === "CH0076.p3.order-count-steps");
        const n = await page.locator("#testExercise .la-pool button.la-piece").count(); assert.ok(n >= 3);
        await restartFocus(page); assert.ok(await tabUntil(page, () => document.activeElement.matches(".la-pool button.la-piece"), 30), "a line is reachable by Tab");
        for (let i = 0; i < n; i++) {
          await page.keyboard.press("Enter");
          const where = await page.evaluate(() => { const e = document.activeElement; return e === document.body ? "body" : (e.closest(".la-pool") ? "pool" : (e.textContent || "").trim()); });
          assert.notEqual(where, "body", "focus was dropped after line " + (i + 1) + " of " + n);
          if (i < n - 1) assert.equal(where, "pool", "focus stays on a remaining line");
        }
        assert.match(await page.evaluate(() => document.activeElement.textContent), /^Check$/, "with every line used, focus lands on Check");
      });
      await t("no JS errors (Learn order activity)", async () => noErrors(errors));
      await ctx.close();
    }
  }

  // ================================================================ K. Stage 9 (Functions): one-switch labs finish, runaway output is cut short, calls in progress, Where column, stage on Home
  section("K. Stage 9 (Functions): one-switch lab completes, runaway recursion output is cut short, calls in progress and the Where column, Home shows the stage");
  {
    const ANY = "#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta";
    const goTo = async (page, match) => {
      for (let g = 0; g < 12; g++) {
        await page.waitForFunction((sel) => !!document.querySelector(sel), ANY, { timeout: 15000 });
        const s = await L.slideKind(page);
        if (match(s)) return s;
        if (s.kind === "explorer") await L.passExplorer(page);
        else if (s.kind === "activity") { await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click(); await page.locator("#testCheck").click(); }
        else { await L.answerQuestion(page, s.qid, true); await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent)); await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent)); await page.locator("#testCheck").click(); }
      }
      throw new Error("slide not found");
    };
    const stack = async (page) => { await page.waitForSelector("#testExercise .la-callstack li", { timeout: 15000 }); return page.locator("#testExercise .la-callstack li").allInnerTexts(); };
    {
      const { ctx, page, errors } = await openChapter({}, "CH0095", { width: 390, height: 844 }, { mobile: true });
      await t("CH0095 one-switch lab: flipping the switch once is enough to enable CONTINUE (it used to need three changes, which a one-switch lab cannot give)", async () => {
        await goTo(page, (s) => s.activity === "CH0095.p2.defined-not-called");
        assert.equal(await page.locator("#testCheck").isDisabled(), true, "Continue is locked before the student has tried the lab");
        await page.waitForFunction(() => /printed nothing/i.test((document.querySelector("#testExercise .la-labout") || {}).innerText || ""), null, { timeout: 8000 });
        await page.locator("#testExercise label.la-switch").first().click();
        await page.waitForFunction(() => !document.getElementById("testCheck").disabled, null, { timeout: 5000 });
        await page.waitForFunction(() => /Tea is ready/.test(document.querySelector("#testExercise .la-labout").innerText), null, { timeout: 5000 });
      });
      await t("no JS errors (one-switch lab)", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0094", { width: 390, height: 844 }, { mobile: true });
      await t("CH0094 lab with two switches: each extra call adds another Hello Student line, and the lab finishes", async () => {
        await goTo(page, (s) => s.activity === "CH0094.p2.reuse-lab");
        const lines = async () => (await page.locator("#testExercise .la-labout .la-out").first().innerText()).trim().split("\n").filter(Boolean).length;
        assert.equal(await lines(), 1, "one call prints one line");
        const sw = page.locator("#testExercise label.la-switch");
        await sw.nth(0).click(); await page.waitForFunction(() => (document.querySelector("#testExercise .la-labout .la-out").innerText.trim().split("\n").length) === 2, null, { timeout: 5000 });
        await sw.nth(1).click(); await page.waitForFunction(() => (document.querySelector("#testExercise .la-labout .la-out").innerText.trim().split("\n").length) === 3, null, { timeout: 5000 });
        assert.equal(await page.locator("#testCheck").isDisabled(), true, "a four-setting lab still asks for a third change");
        await sw.nth(0).click(); await page.waitForFunction(() => (document.querySelector("#testExercise .la-labout .la-out").innerText.trim().split("\n").length) === 2, null, { timeout: 5000 });
        await page.waitForFunction(() => !document.getElementById("testCheck").disabled, null, { timeout: 5000 });
      });
      await t("CH0094 trace: 'Calls in progress' lists main() then greet() while it runs, and greet() is taken off when it returns", async () => {
        await goTo(page, (s) => s.activity === "CH0094.p4.trace-greet");
        assert.deepEqual(await stack(page), ["main()"], "before the program starts only main() is running");
        const next = page.locator("#testExercise button", { hasText: /^Next step$/ });
        await next.click();
        assert.deepEqual(await stack(page), ["main()", "greet()"], "after the call greet() is on top of main()");
        assert.equal(await page.locator("#testExercise .la-callstack li.top").innerText(), "greet()", "the newest call is highlighted");
        while (await next.isEnabled()) await next.click();
        assert.deepEqual(await stack(page), ["main()"], "when greet() has returned only main() is left");
      });
      await t("no JS errors (call stack)", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0100", { width: 390, height: 844 }, { mobile: true });
      await t("CH0100 trace: the Where column says global for count and 'local in show()' for marks, and marks is gone after show() returns", async () => {
        await goTo(page, (s) => s.activity === "CH0100.p3.trace-scope");
        const next = page.locator("#testExercise button", { hasText: /^Next step$/ });
        await page.waitForSelector("#testExercise .la-counter", { timeout: 15000 });
        await next.click();
        let seenLocal = false;
        for (let i = 0; i < 8 && (await next.isEnabled()); i++) {
          const rows = await page.locator("#testExercise .la-vartable tbody tr").evaluateAll((trs) => trs.map((tr) => [...tr.querySelectorAll("td")].map((td) => td.innerText.trim())));
          const head = await page.locator("#testExercise .la-vartable th").allInnerTexts();
          assert.match(head[3], /^where$/i, "the variable table has a Where column");
          rows.forEach((r) => { if (r[0] === "count") assert.equal(r[3], "global"); if (r[0] === "marks") { seenLocal = true; assert.equal(r[3], "local in show()"); } });
          await next.click();
        }
        assert.ok(seenLocal, "marks appeared as a local variable of show()");
        const last = await page.locator("#testExercise .la-vartable tbody tr").evaluateAll((trs) => trs.map((tr) => tr.querySelector("td").innerText.trim()));
        assert.deepEqual(last, ["count"], "after show() returns only the global count is left");
      });
      await t("no JS errors (Where column)", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await openChapter({}, "CH0102", { width: 360, height: 800 }, { mobile: true });
      await t("CH0102 recursion trace at 360px: the calls pile up main() > count(3) > count(2) > count(1) > count(0) and never overflow their box", async () => {
        await goTo(page, (s) => s.activity === "CH0102.p3.trace-count");
        await stack(page);
        const next = page.locator("#testExercise button", { hasText: /^Next step$/ });
        let deepest = [];
        for (let i = 0; i < 30 && (await next.isEnabled()); i++) {
          await next.click(); const s = await stack(page); if (s.length > deepest.length) deepest = s;
          const fits = await page.locator("#testExercise .la-callstack").evaluate((ol) => { const b = ol.getBoundingClientRect(); return [...ol.querySelectorAll("li")].every((li) => { const r = li.getBoundingClientRect(); return r.right <= b.right + 0.5 && r.left >= b.left - 0.5; }) && ol.scrollWidth <= ol.clientWidth + 1; });
          assert.ok(fits, "the calls in progress overflow their box at 360px: " + JSON.stringify(s));
          const arrows = await page.locator("#testExercise .la-callstack li").evaluateAll((lis) => lis.map((li, k) => [getComputedStyle(li, "::after").content, getComputedStyle(li, "::before").content, k === lis.length - 1]));
          arrows.forEach(([after, before, last]) => { assert.equal(after.includes("→"), !last, "an arrow follows every call except the newest (it used to hang at the start of a wrapped line): " + after); assert.ok(before === "none" || before === "normal", "no arrow is drawn before a call: " + before); });
        }
        assert.deepEqual(deepest, ["main()", "count(3)", "count(2)", "count(1)", "count(0)"]);
        assert.deepEqual(await stack(page), ["main()"], "all calls have returned at the end");
      });
      await t("CH0102 no-base-case lab: switching the base case off shows only the start of the runaway output plus a clear stop message (not a screenful of numbers)", async () => {
        await goTo(page, (s) => s.activity === "CH0102.p4.no-base-case");
        assert.match(await page.locator("#testExercise .la-labout .la-out").first().innerText(), /^3 2 1\s*$/, "with the base case on: 3 2 1");
        await page.locator("#testExercise label.la-switch").first().click();
        await page.waitForFunction(() => !!document.querySelector("#testExercise .la-labout .la-err"), null, { timeout: 8000 });
        const out = await page.locator("#testExercise .la-labout .la-out").first().innerText();
        assert.ok(out.length <= 320, "the output panel shows " + out.length + " characters (expected the start only)");
        assert.match(out, /^3 2 1 0 -1/, "the visible start shows the count going past zero");
        assert.match(await page.locator("#testExercise .la-labout .la-note").first().innerText(), /printed \d+ characters before it stopped/);
        assert.match(await page.locator("#testExercise .la-labout .la-err").innerText(), /endless recursion/i);
        assert.equal(await page.locator("#testCheck").isDisabled(), false, "the lab is finished after both settings were seen");
      });
      await t("no JS errors (recursion)", async () => noErrors(errors));
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await L.open({ tested: L.before("CH0094") }, { width: 390, height: 844 }, { mobile: true });
      await t("Home lists Stage 9 FUNCTIONS as the current stage with its 9 chapters, once Stage 8 is complete", async () => {
        const st = await page.evaluate(() => { const s = document.querySelector('[data-stage-section="STG010"]'); return s ? { status: s.dataset.status, nodes: s.querySelectorAll(".lp-node").length, title: (s.querySelector(".lp-card-title") || {}).textContent } : null; });
        assert.ok(st, "the FUNCTIONS stage is on Home");
        assert.equal(st.nodes, 9); assert.match(st.title, /FUNCTIONS/i); assert.ok(["current", "available"].includes(st.status), "status is " + st.status);
        assert.equal(await page.locator('.lp-node[data-chapter="CH0094"]').first().getAttribute("aria-label").then((a) => /current|start/.test(a)), true);
        assert.equal(await page.locator('.lp-node[data-chapter="CH0095"]').first().getAttribute("aria-label").then((a) => /locked/.test(a)), true, "CH0095 waits for CH0094");
      });
      await t("no JS errors (Home, Stage 9)", async () => noErrors(errors));
      await ctx.close();
    }
  }

  // ================================================================ L. Stage 7 (Patterns): output choices keep their spaces, the "Show spaces" switch draws dots
  section("L. Stage 7 (Patterns): multi-line output choices keep their spaces, and the correct answer is shown the same way after three misses");
  {
    const ANY = "#testExercise .ce-target, #testExercise .la, #testExercise .option, #testExercise .test-v11-token, #testExercise .test-code-fill-box, #testTextAnswer, #testExercise p.meta";
    const goTo = async (page, match) => {
      for (let g = 0; g < 12; g++) {
        await page.waitForFunction((sel) => !!document.querySelector(sel), ANY, { timeout: 15000 });
        const s = await L.slideKind(page);
        if (match(s)) return s;
        if (s.kind === "explorer") await L.passExplorer(page);
        else if (s.kind === "activity") { await page.locator("#testExercise").click({ position: { x: 6, y: 6 } }); if (await page.locator("#testSkip:not([hidden])").count()) await page.locator("#testSkip").click(); await page.locator("#testCheck").click(); }
        else { await L.answerQuestion(page, s.qid, true); await page.waitForFunction(() => /Correct!/.test(document.getElementById("testFeedbackV11").textContent)); await page.waitForFunction(() => !document.getElementById("testCheck").disabled && /CONTINUE|FINISH/.test(document.getElementById("testCheck").textContent)); await page.locator("#testCheck").click(); }
      }
      throw new Error("slide not found");
    };
    const RIGHT = ["   *", "  **", " ***", "****"].join("\n");   // Q000555: what the right-aligned triangle really prints for n = 4
    const { ctx, page, errors } = await openChapter({}, "CH0126", { width: 390, height: 844 }, { mobile: true });
    await t("Q000555 (right-aligned triangle): every output choice is drawn as preformatted monospace text, so the right-aligned choice is visibly different from the left-aligned one", async () => {
      await goTo(page, (s) => s.qid === "Q000555");
      const opts = await page.locator("#testExercise .option").evaluateAll((els) => els.map((e) => ({ cls: e.className, text: e.querySelector(".opt-pre") ? e.querySelector(".opt-pre").textContent : null, ws: e.querySelector(".opt-pre") ? getComputedStyle(e.querySelector(".opt-pre")).whiteSpace : null, mono: e.querySelector(".opt-pre") ? /mono|Menlo|Consolas|courier/i.test(getComputedStyle(e.querySelector(".opt-pre")).fontFamily) : false, first: e.querySelector(".opt-pre") ? e.querySelector(".opt-pre").getBoundingClientRect().width : 0 })));
      assert.equal(opts.length, 4);
      opts.forEach((o) => { assert.match(o.cls, /option-pre/); assert.equal(o.ws, "pre"); assert.ok(o.mono, "monospace font"); assert.ok(o.text && o.text.includes("\n"), "keeps its line breaks"); });
      assert.ok(opts.some((o) => o.text === RIGHT), "the correct choice keeps its leading spaces: " + JSON.stringify(opts.map((o) => o.text)));
      assert.ok(opts.some((o) => o.text === ["*", "**", "***", "****"].join("\n")), "the left-aligned choice is a different text");
    });
    await t("after three wrong choices the correct answer is shown in the same monospace layout (spaces and line breaks intact)", async () => {
      for (let k = 0; k < 3; k++) {
        const all = await page.locator("#testExercise .option:not([disabled])").evaluateAll((els) => els.map((e, i) => ({ i, t: e.querySelector(".opt-pre").textContent })));
        const wrong = all.find((o) => o.t !== RIGHT);
        await page.locator("#testExercise .option:not([disabled])").nth(wrong.i).click();
        await page.locator("#testCheck").click();
        await page.waitForFunction(() => /Not quite|Three attempts|wrong|✗|✓/i.test(document.getElementById("testFeedbackV11").textContent) || document.getElementById("testFeedbackV11").className.includes("show"));
        if (k < 2) await page.waitForFunction(() => !document.getElementById("testCheck").disabled && document.getElementById("testCheck").textContent.trim() === "CHECK", null, { timeout: 8000 });
      }
      await page.waitForSelector("#testFeedbackV11 .feedback-pre", { timeout: 8000 });
      assert.equal(await page.locator("#testFeedbackV11 .feedback-pre").textContent(), RIGHT);
    });
    await t("no JS errors (Patterns output choices)", async () => noErrors(errors));
    await ctx.close();
    {
      const w2 = await openChapter({}, "CH0126", { width: 390, height: 844 }, { mobile: true });
      const pg = w2.page;
      await t("CH0126 trace with spaces: 'Show spaces as ·' is on by default, draws a dot over every printed space, keeps the real characters, and stays off once switched off", async () => {
        await goTo(pg, (s) => s.activity === "CH0126.p2.trace-right-aligned");
        await pg.waitForSelector("#testExercise .la-counter", { timeout: 15000 });
        const next = pg.locator("#testExercise button", { hasText: /^Next step$/ });
        const state = () => pg.evaluate(() => { const box = document.querySelector("#testExercise .la-outbox"), pre = box.querySelector(".la-out"); return { on: box.classList.contains("la-showsp"), checked: box.querySelector(".la-spacetoggle input").checked, text: pre.textContent, dots: pre.querySelectorAll(".la-sp").length, label: box.querySelector(".la-spacetoggle").textContent.trim(), before: getComputedStyle(pre.querySelector(".la-sp") || pre, "::before").content }; });
        let s0 = await state();
        for (let i = 0; i < 60 && !/^ +\*/m.test((await state()).text); i++) await next.click();
        const s1 = await state();
        assert.equal(s1.label, "Show spaces as ·"); assert.ok(s1.checked && s1.on, "the switch is on by default");
        assert.ok(s1.dots >= 1, "at least one space is drawn as a dot");
        assert.equal(s1.dots, (s1.text.match(/ /g) || []).length, "one dot per real space");
        assert.ok(!s1.text.includes("·"), "the real text still holds spaces, not dots (copying and screen readers are unchanged)");
        assert.match(s1.before, /·/, "the dot is drawn by the switch's styling");
        await pg.locator("#testExercise .la-spacetoggle").click();
        const off = await state(); assert.ok(!off.on && !off.checked, "switched off");
        await next.click();
        const after = await state(); assert.ok(!after.on && !after.checked, "the choice is kept when the next step is drawn");
      });
      await t("CH0126 lab with spaces: the output panel has the same switch and toggling the lab keeps it", async () => {
        const w3 = await openChapter({}, "CH0126", { width: 390, height: 844 }, { mobile: true });
        await goTo(w3.page, (s) => s.activity === "CH0126.p1.spaces-lab");
        await w3.page.waitForSelector("#testExercise .la-spacetoggle", { timeout: 15000 });
        const dots = () => w3.page.evaluate(() => document.querySelectorAll("#testExercise .la-outbox .la-sp").length);
        const before = await dots();
        await w3.page.locator("#testExercise label.la-switch").first().click();
        await w3.page.waitForFunction((n) => document.querySelectorAll("#testExercise .la-outbox .la-sp").length !== n, before, { timeout: 8000 });
        assert.ok((await dots()) !== before, "printing spaces before the stars changes the dots shown");
        await w3.ctx.close();
      });
      await t("no JS errors (spaces switch)", async () => noErrors(w2.errors));
      await w2.ctx.close();
    }
    await t("the test library orders chapters by the curriculum (stage order), not by stage id: Loops, then Patterns (STG013), then Arrays (STG007)", async () => {
      const seq = [...new Set(L.ORDERED.map((c) => c.stage_id))];
      assert.deepEqual(seq, fx.stages.slice().sort((a, b) => a.order - b.order).map((s) => s.stage_id));
      assert.ok(seq.indexOf("STG013") > seq.indexOf("STG006") && seq.indexOf("STG013") < seq.indexOf("STG007"), seq.join(" > "));
      assert.ok(L.before("CH0062").includes("CH0128") && !L.before("CH0124").includes("CH0062"));
    });
    for (const [w, h] of [[360, 800], [390, 844]]) {
      const errs = [];
      await t("(" + w + "x" + h + ") Code Explorer programs of up to 44 columns stay on one line each, so no tap target drops below its indentation (CH0127, CH0128, CH0078, CH0087)", async () => {
        for (const cid of ["CH0127", "CH0128", "CH0078", "CH0087"]) {
          const w3 = await openChapter({}, cid, { width: w, height: h }, { mobile: true });
          await w3.page.evaluate(() => document.fonts.ready);
          await w3.page.waitForTimeout(300);
          const r = await w3.page.evaluate(() => { const pre = document.querySelector(".ce-code"), code = pre.querySelector("code"), lh = parseFloat(getComputedStyle(pre).lineHeight); return { lines: code.textContent.split("\n").length, visual: Math.round(code.getBoundingClientRect().height / lh) }; });
          errs.push(...w3.errors);
          await w3.ctx.close();
          assert.equal(r.visual, r.lines, cid + " draws " + r.lines + " source lines on " + r.visual + " visual lines at " + w + "px");
        }
      });
      await t("(" + w + "x" + h + ") no JS errors (Explorer width)", async () => noErrors(errs));
    }
    {
      const w4 = await openChapter({}, "CH0128", { width: 390, height: 844 }, { mobile: true });
      await t("CH0128 diamond trace at 390px: a hyphen operator such as i-- is never split across two lines, and the listing text is unchanged", async () => {
        await goTo(w4.page, (s) => s.activity === "CH0128.p2.diamond-trace");
        await w4.page.waitForSelector("#testExercise .la-code .l", { timeout: 15000 });
        const r = await w4.page.evaluate(() => {
          const lines = [...document.querySelectorAll("#testExercise .la-code .l")], out = { texts: lines.map((l) => l.textContent), split: [], nb: document.querySelectorAll("#testExercise .la-code .la-nb").length };
          for (const l of lines) { const nb = l.querySelector(".la-nb"); if (!nb) continue; const rects = [...(() => { const g = document.createRange(); g.selectNodeContents(nb); return g.getClientRects(); })()]; out.split.push(new Set(rects.map((x) => Math.round(x.top))).size > 1); }
          return out;
        });
        assert.ok(r.nb >= 1, "the -- operator is wrapped in a no-break span");
        assert.ok(r.split.every((s) => s === false), "an operator is split across lines");
        assert.ok(r.texts.some((t) => t.includes("i >= 1; i--) {")), "the visible text is still the program text: " + JSON.stringify(r.texts.filter((t) => t.includes("i >="))));
      });
      await t("no JS errors (listing operators)", async () => noErrors(w4.errors));
      await w4.ctx.close();
    }
  }

  await L.stop(S);
  L.finish();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
