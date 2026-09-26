#!/usr/bin/env node
/*
 * Coverage report for the Learn activity layer: per chapter, which pages have activities (and which kinds),
 * which pages stay static on purpose, and which audit recommendations are implemented or still open.
 *
 *   node tests/learn/coverage-report.js            # markdown table to stdout
 *   node tests/learn/coverage-report.js --json     # machine readable
 */
const { loadLayer, snapshot, audit } = require("./helpers.js");

const CL = loadLayer();
const defs = [...CL.defs.values()];
const chapters = Object.keys(snapshot.chapters).sort((a, b) => {
  const ca = snapshot.chapters[a], cb = snapshot.chapters[b];
  return (ca.stage_no - cb.stage_no) || (Number(a.slice(2)) - Number(b.slice(2)));
});
// The stage order in the snapshot is curriculum order; CH0115 sits inside Stage 4 out of numeric order.
const order = Object.keys(snapshot.chapters);
chapters.sort((a, b) => (snapshot.chapters[a].stage_no - snapshot.chapters[b].stage_no) || (order.indexOf(a) - order.indexOf(b)));

const implemented = new Set(defs.flatMap((d) => d.implements || []));
const rows = chapters.map((id) => {
  const ch = snapshot.chapters[id];
  const mine = defs.filter((d) => d.chapter === id);
  const pages = ch.headings.length;
  const perPage = {};
  mine.forEach((d) => { (perPage[d.page] = perPage[d.page] || []).push(d.kind); });
  const recs = audit.recommendations.filter((r) => r.chapter === id);
  const open = recs.filter((r) => !implemented.has(r.id));
  return {
    chapter: id, stage: ch.stage, stage_no: ch.stage_no, title: ch.title, pages,
    pagesWithActivities: Object.keys(perPage).map(Number).sort((a, b) => a - b),
    staticPages: Array.from({ length: pages }, (_, i) => i + 1).filter((p) => !perPage[p]),
    perPage, activities: mine.length, kinds: [...new Set(mine.map((d) => d.kind))].sort(),
    recs: recs.length, recsImplemented: recs.length - open.length, open: open.map((r) => r.id),
  };
});

const total = { chapters: rows.length, pages: rows.reduce((n, r) => n + r.pages, 0), pagesWithActivities: rows.reduce((n, r) => n + r.pagesWithActivities.length, 0), activities: defs.length, recs: audit.total, recsImplemented: audit.recommendations.filter((r) => implemented.has(r.id)).length };
const kindCounts = {}; defs.forEach((d) => { kindCounts[d.kind] = (kindCounts[d.kind] || 0) + 1; });

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ total, kindCounts, rows }, null, 2));
} else {
  console.log("| Stage | Chapter | Title | Pages | Pages with activities | Activities per page (kinds) | Static pages | Audit recs implemented | Open |");
  console.log("|---|---|---|---|---|---|---|---|---|");
  rows.forEach((r) => {
    const per = r.pagesWithActivities.map((p) => "p" + p + ": " + r.perPage[p].join("+")).join("; ") || "-";
    console.log(`| ${r.stage_no} | ${r.chapter} | ${r.title} | ${r.pages} | ${r.pagesWithActivities.length} | ${per} | ${r.staticPages.map((p) => "p" + p).join(", ") || "-"} | ${r.recsImplemented}/${r.recs} | ${r.open.join(", ") || "-"} |`);
  });
  console.log(`\nTotals: ${total.chapters} chapters, ${total.pages} pages, ${total.pagesWithActivities} pages with activities, ${total.activities} activities, audit recommendations ${total.recsImplemented}/${total.recs}.`);
  console.log("Activities by kind: " + Object.keys(kindCounts).sort().map((k) => `${k} ${kindCounts[k]}`).join(", "));
}
