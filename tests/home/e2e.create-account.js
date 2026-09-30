#!/usr/bin/env node
/* Real-browser tests for Create Account's Department field (AIDS-only dropdown).
 *
 *   npm i --no-save playwright-core
 *   node tests/home/e2e.create-account.js
 *   (env: CLICK_BROWSER=<chrome/edge/chromium>)
 *
 * The app runs in demo mode (no real backend); signup is handled locally by index.html's own demo post()
 * handler (see the `if(action==='signup')` branch), so submitting the form and then reading the resulting
 * session's user.department is a real, end-to-end check of what the UI actually sends -- not a mock.
 */
"use strict";
const path = require("path");
const L = require("../e2e/lib.js");
const { t, section, assert, noErrors } = L;

async function main() {
  const S = await L.start();
  console.log("Create Account (AIDS-only department) e2e · " + S.base + " · " + path.basename(S.exe));

  section("A. Department is an AIDS-only dropdown");
  {
    const { ctx, page } = await L.openBare();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("error: " + m.text().slice(0, 240)); });

    await t("Create Account loads from the login screen", async () => {
      await page.locator("#signupTab").click();
      assert.equal(await page.locator("#signupForm.active").count(), 1);
    });
    await t("Department is a real <select>, not a free-text input", async () => {
      assert.equal(await page.locator("#sDept").evaluate((el) => el.tagName), "SELECT");
    });
    await t("exactly one selectable department option exists: AIDS", async () => {
      const opts = await page.locator("#sDept option").evaluateAll((os) => os.map((o) => ({ value: o.value, text: o.textContent, disabled: o.disabled })));
      const selectable = opts.filter((o) => !o.disabled && o.value !== "");
      assert.deepEqual(selectable, [{ value: "AIDS", text: "AIDS", disabled: false }]);
      // a placeholder is allowed, but it must not be a selectable department value
      const placeholder = opts.find((o) => o.value === "");
      assert.ok(!placeholder || placeholder.disabled, "the placeholder option must not be a selectable value");
    });
    await t("no other department (CSE, IT, ECE, EEE, Mechanical, Civil, ...) is rendered anywhere in the dropdown", async () => {
      const text = (await page.locator("#sDept").innerText()).toUpperCase();
      for (const dept of ["CSE", "IT", "ECE", "EEE", "MECHANICAL", "CIVIL"]) assert.ok(!text.includes(dept), dept + " leaked into the department dropdown");
    });
    await t("the dropdown starts invalid (nothing selected) and becomes valid once AIDS is chosen -- required-field validation still works", async () => {
      assert.equal(await page.locator("#sDept").evaluate((el) => el.checkValidity()), false);
      await page.locator("#sDept").selectOption("AIDS");
      assert.equal(await page.locator("#sDept").evaluate((el) => el.value), "AIDS");
      assert.equal(await page.locator("#sDept").evaluate((el) => el.checkValidity()), true);
    });
    await t("no JS errors so far", async () => noErrors(errors));
    await ctx.close();
  }

  section("B. Full signup still succeeds, and the created account's department is exactly \"AIDS\"");
  {
    const { ctx, page } = await L.openBare();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("error: " + m.text().slice(0, 240)); });

    await page.locator("#signupTab").click();
    await page.locator("#sName").fill("Test Student");
    await page.locator("#sRoll").fill("AI0099");
    await page.locator("#sDept").selectOption("AIDS");
    await page.locator("#sSection").selectOption("A");
    await page.locator("#sEmail").fill("test.student.aids@rajalakshmi.edu.in");
    await page.locator("#sPhone").fill("9999999999");
    await page.locator("#sPass").fill("secret123");

    await t("submitting the form with AIDS selected succeeds: the login screen closes and Home opens", async () => {
      await page.locator('#signupForm button[type="submit"], #signupForm button:not([type])').first().click();
      await page.locator("#authGate").waitFor({ state: "hidden", timeout: 10000 });
      assert.equal(await page.locator("#authGate.hidden").count(), 1);
    });
    await t("the created account's stored department is exactly \"AIDS\" (what the signup payload actually sent)", async () => {
      const session = await page.evaluate(() => JSON.parse(localStorage.getItem("clickSession") || "{}"));
      assert.equal(session.user && session.user.department, "AIDS");
    });
    await t("existing required-field validation (email domain, section) still runs: unchanged, still active", async () => {
      // re-open a second bare signup and try a non-AIDS-domain email; the pre-existing domain check must still fire
      const { ctx: ctx2, page: page2 } = await L.openBare();
      await page2.locator("#signupTab").click();
      await page2.locator("#sName").fill("X"); await page2.locator("#sRoll").fill("X1");
      await page2.locator("#sDept").selectOption("AIDS"); await page2.locator("#sSection").selectOption("A");
      await page2.locator("#sEmail").fill("someone@gmail.com"); await page2.locator("#sPhone").fill("9999999999"); await page2.locator("#sPass").fill("secret123");
      await page2.locator('#signupForm button[type="submit"], #signupForm button:not([type])').first().click();
      await page2.waitForFunction(() => document.getElementById("signupError").textContent.length > 0);
      assert.match(await page2.locator("#signupError").textContent(), /AI&DS department students/);
      await ctx2.close();
    });
    await t("no JS errors across the signup flow", async () => noErrors(errors));
    await ctx.close();
  }

  await L.stop(S);
  L.finish();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
