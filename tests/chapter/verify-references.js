#!/usr/bin/env node
/* Checks every chapter reference link against YouTube itself (needs internet; not part of the offline test run).
 *
 *   node tests/chapter/verify-references.js                 all decks
 *   node tests/chapter/verify-references.js CH0034 CH0035   only those
 *
 * For each link it asks YouTube's oEmbed endpoint for the video's real title and channel and requires that the deck states exactly
 * those, so a link that is dead, private, embedding-disabled, mistyped or mislabelled is reported. Exit code 1 if any link fails.
 */
"use strict";
const H = require("./helpers.js");

const only = process.argv.slice(2).map((s) => s.toUpperCase());
const decks = H.loadDecks(only.length ? only : null);
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();

async function check(ref) {
  const url = "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(ref.url.split("&")[0]);
  let res;
  try { res = await fetch(url, { signal: AbortSignal.timeout(20000) }); } catch (e) { return { ok: false, why: "network error: " + e.message }; }
  if (!res.ok) return { ok: false, why: "YouTube answered " + res.status + " (video missing, private or not embeddable)" };
  const j = await res.json();
  const problems = [];
  if (norm(j.title) !== norm(ref.title)) problems.push('title should be "' + j.title + '"');
  if (norm(j.author_name) !== norm(ref.channel)) problems.push('channel should be "' + j.author_name + '"');
  return problems.length ? { ok: false, why: problems.join("; "), real: j } : { ok: true, real: j };
}

(async () => {
  let bad = 0, total = 0;
  const seen = new Map();
  for (const id of Object.keys(decks).sort()) {
    for (const ref of decks[id].references || []) {
      total++;
      const r = await check(ref);
      (seen.get(ref.url) || seen.set(ref.url, []).get(ref.url)).push(id);
      if (r.ok) console.log("  ok    " + id + "  " + ref.channel + " — " + ref.title);
      else { bad++; console.log("  FAIL  " + id + "  " + ref.url + "\n        " + r.why); }
    }
  }
  const shared = [...seen.entries()].filter(([, c]) => c.length > 3);
  shared.forEach(([u, c]) => console.log("  note  " + u + " is used by " + c.length + " chapters (" + c.join(", ") + "): prefer topic-specific videos"));
  console.log("\n" + (total - bad) + "/" + total + " references verified");
  process.exitCode = bad ? 1 : 0; // (not process.exit(): on Windows that can trip a libuv assertion while fetch sockets are closing)
})();
