#!/usr/bin/env node
/*
 * Regenerates the MANIFEST block inside loader.js from the definitions in defs/.
 * The manifest tells the loader which chapter pages have activities (and whether the page
 * needs the interpreter), so pages without activities download nothing extra.
 *
 *   node assets/learn/build-manifest.js          # rewrite loader.js
 *   node assets/learn/build-manifest.js --check  # exit 1 if loader.js is out of date
 */
const fs = require("fs");
const path = require("path");
const { loadLayer, LEARN_DIR } = require("../../tests/learn/helpers.js");

const INTERP_KINDS = new Set(["run", "lab", "trace", "tracetable", "challenge", "evalorder"]);
const CL = loadLayer();
const manifest = {};
for (const d of CL.defs.values()) {
  const c = (manifest[d.chapter] = manifest[d.chapter] || { stage: d.stage, pages: {} });
  const p = (c.pages[d.page] = c.pages[d.page] || { n: 0 });
  p.n++;
  if (INTERP_KINDS.has(d.kind)) p.interp = true;
}
const sorted = {};
Object.keys(manifest).sort().forEach((k) => { sorted[k] = manifest[k]; });
const json = JSON.stringify(sorted);
const file = path.join(LEARN_DIR, "loader.js");
const src = fs.readFileSync(file, "utf8");
const next = src.replace(/\/\*MANIFEST\*\/ var MANIFEST = [\s\S]*?; \/\*END-MANIFEST\*\//, "/*MANIFEST*/ var MANIFEST = " + json + "; /*END-MANIFEST*/");
if (process.argv.includes("--check")) {
  if (next !== src) { console.error("loader.js MANIFEST is out of date. Run: node assets/learn/build-manifest.js"); process.exit(1); }
  console.log("loader.js MANIFEST is up to date.");
} else {
  fs.writeFileSync(file, next);
  const chapters = Object.keys(sorted).length, pages = Object.values(sorted).reduce((n, c) => n + Object.keys(c.pages).length, 0);
  console.log("Manifest written: " + CL.defs.size + " activities, " + chapters + " chapters, " + pages + " pages.");
}
