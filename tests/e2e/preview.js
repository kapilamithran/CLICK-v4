#!/usr/bin/env node
/* Try the unified chapter experience by hand, with CLICK's REAL chapters and questions and no backend:
 *
 *   node tests/e2e/preview.js [port] [--open-all]
 *
 * Serves the app in its built-in demo mode, with the demo dataset swapped for the production content (tests/fixtures/production-content.json).
 * Open the printed link and log in with the demo admin account shown on the login screen (admin@click.demo / KabiAdmin123!). Progress is kept in
 * your browser only (localStorage "clickDemoStateV13"); clear it to start over. Nothing is sent anywhere.
 */
"use strict";
const http = require("http");
const L = require("./lib.js");

L.serve().then(({ srv }) => {
  srv.close(); // lib.serve() picks a random port; re-listen on a stable one for a preview
  const port = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a))) || 3391;
  // --open-all: preview with no stage/chapter locks, so any chapter can be opened straight away (the real unlock rules are otherwise modelled).
  const demo = L.demoData();
  if (process.argv.includes("--open-all")) demo.prerequisites = [];
  const data = JSON.stringify(demo);
  const fs = require("fs"), path = require("path");
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".svg": "image/svg+xml" };
  http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split("?")[0]), file = path.join(L.REPO, p === "/" ? "index.html" : p);
    if (!file.startsWith(L.REPO) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    if (path.basename(file) === "index.html" && path.dirname(file) === L.REPO) return res.end(fs.readFileSync(file, "utf8").replace(/const DEMO_DATA=.*(\r?\n)/, () => "const DEMO_DATA=" + data + ";\n"));
    fs.createReadStream(file).pipe(res);
  }).listen(port, "127.0.0.1", () => console.log("CLICK preview (real chapters, demo mode, no backend): http://127.0.0.1:" + port + "/?demo=1"));
});
