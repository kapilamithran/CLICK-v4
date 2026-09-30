/* CLICK Home learning path.
 *
 * Home is the visual map; a chapter is one unified run of slides (learning + questions, see assets/chapter). This file only
 *   (a) derives a display model from the EXISTING progress state the backend already returns
 *       (stages, chapters, stage_progress, chapter_progress -- including unlocked / lock_reason), and
 *   (b) renders that model as stage checkpoints with connected chapter nodes.
 * It creates no progress data and keeps no second unlock rule: tapping a node calls back into index.html, which opens the chapter run
 * (a graded first run for a chapter that is not finished yet, an ungraded review for one that is).
 *
 * Works in the browser (window.ClickHomePath) and in Node (require) so the model can be unit-tested.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ClickHomePath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const COURSE_TITLE = "Programming in C";
  // Snake path: centre, right, centre, left ... (see path.css for the connector geometry).
  const LANES = ["c", "r", "c", "l"];
  const DEFAULT_LOCK = "Complete prerequisite content first.";

  // ---------------------------------------------------------------- model (pure, no DOM)

  // Same lookups, with the same defaults, as prog() / chapterProg() / stageChapters() in index.html.
  // index.html passes its own functions to build() so there is a single source of truth in the app;
  // these are only the fallback used by tests and by callers that pass nothing.
  function lookups(app) {
    const stageRows = app.stage_progress || [];
    const chapterRows = app.chapter_progress || [];
    return {
      prog: (sid) => stageRows.find((p) => p.stage_id === sid) || { completed_chapters: 0, total_chapters: 0, progress_percent: 0, test_completed: false, best_xp: 0 },
      chapterProg: (cid) => chapterRows.find((p) => p.chapter_id === cid) || { learn_completed: false, learn_times: 0, test_completed: false, best_xp: 0, failed_attempts: 0, unlocked: false, lock_reason: DEFAULT_LOCK },
      stageChapters: (sid) => (app.chapters || []).filter((c) => c.stage_id === sid).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    };
  }

  function linkState(from, to) {
    if (from.state === "completed" && to.state === "completed") return "done";
    if (from.state === "completed" && to.state !== "locked") return "active";
    return "future";
  }

  function build(app, helpers) {
    const L = Object.assign(lookups(app || {}), helpers || {});
    const stages = ((app && app.stages) || []).map((stage, stageIndex) => {
      const sp = L.prog(stage.stage_id);
      const stageOpen = sp.unlocked !== false;
      const stageLock = sp.lock_reason || "";
      const nodes = L.stageChapters(stage.stage_id).map((ch, i) => {
        const cp = L.chapterProg(ch.chapter_id);
        const enterable = stageOpen && cp.unlocked !== false;
        // One chapter = one run. Finished (its questions were passed) -> review; open -> start; otherwise locked.
        // A student who only ever did the old "Learn" half (legacy) simply starts the chapter run: nothing is lost, nothing is reset.
        let state = "locked", phase = "locked";
        if (enterable && cp.test_completed) { state = "completed"; phase = "review"; }
        else if (enterable) { state = "available"; phase = "start"; }
        return {
          chapterId: ch.chapter_id,
          stageId: stage.stage_id,
          chapterNo: ch.chapter_no != null && ch.chapter_no !== "" ? ch.chapter_no : i + 1,
          title: String(ch.title == null ? "" : ch.title),
          index: i,
          lane: LANES[i % LANES.length],
          state, // completed | current | available | locked
          phase, // start | review | locked
          learned: !!cp.learn_completed,
          tested: !!cp.test_completed,
          xp: Number(cp.best_xp || 0),
          lockReason: state === "locked" ? (cp.lock_reason || stageLock || DEFAULT_LOCK) : "",
          link: "future",
        };
      });
      const total = nodes.length;
      const done = nodes.filter((n) => n.state === "completed").length;
      return {
        stage,
        stageId: stage.stage_id,
        stageNo: stage.stage_no != null && stage.stage_no !== "" ? stage.stage_no : stageIndex,
        title: String(stage.title == null ? "" : stage.title),
        index: stageIndex,
        status: !stageOpen ? "locked" : (total > 0 && done === total ? "completed" : "available"),
        lockReason: stageOpen ? "" : (stageLock || "Complete the required earlier stage first."),
        total, done, learned: nodes.filter((n) => n.learned).length,
        percent: total ? Math.round((done * 100) / total) : 0,
        nodes,
        current: null,
      };
    });

    // The current chapter is the first chapter the student can actually enter and hasn't finished,
    // in the first stage that has one. Only that stage becomes the "current" checkpoint.
    let current = null;
    for (const s of stages) {
      if (s.status === "locked" || s.status === "completed") continue;
      const node = s.nodes.find((n) => n.state === "available");
      if (node) { node.state = "current"; s.current = node; s.status = "current"; current = { stageId: s.stageId, chapterId: node.chapterId, stageIndex: s.index, nodeIndex: node.index }; break; }
    }
    for (const s of stages) for (let i = 0; i < s.nodes.length - 1; i++) s.nodes[i].link = linkState(s.nodes[i], s.nodes[i + 1]);

    applyLighting(stages);
    return { course: COURSE_TITLE, stages, current, allComplete: stages.length > 0 && stages.every((s) => s.status === "completed") };
  }

  // Progressive lighting: a purely visual "journey" cue -- NOT a claim that later chapters are better, and never a
  // second unlock signal (state/lockReason above remain the only source of truth for locked/current/completed).
  // The curriculum order already comes from `stages` (backend stage.order) and each stage's own chapter `order`
  // (see stageChapters() above), so flattening that existing sequence -- rather than a hardcoded table -- means a
  // newly added stage or chapter is automatically included next time build() runs.
  const LIGHT_MIN = 0.15, LIGHT_MAX = 1;
  function lightCurve(t) { return LIGHT_MIN + (LIGHT_MAX - LIGHT_MIN) * Math.pow(Math.max(0, Math.min(1, t)), 0.85); }
  function applyLighting(stages) {
    const flat = [];
    for (const s of stages) for (const n of s.nodes) flat.push(n);
    const last = flat.length - 1;
    flat.forEach((n, gi) => { n.globalIndex = gi; n.lightIntensity = Math.round(lightCurve(last > 0 ? gi / last : 1) * 1000) / 1000; });
  }

  function nodeSub(n) {
    if (n.state === "completed") return "Completed · " + n.xp + " XP";
    if (n.state === "locked") return "Locked";
    return n.state === "current" ? "Start chapter" : "Open chapter";
  }

  function nodeAria(n) {
    const head = "Chapter " + n.chapterNo + ", " + n.title + ", ";
    if (n.state === "completed") return head + "completed. Tap to review the chapter.";
    if (n.state === "locked") return head + "locked. " + n.lockReason;
    return head + (n.state === "current" ? "current, " : "available, ") + "tap to start the chapter.";
  }

  // ---------------------------------------------------------------- rendering

  const ICON = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.6l4.3 4.3L19 7.2" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.2 5.2v13.6a.9.9 0 0 0 1.38.76l10.6-6.8a.9.9 0 0 0 0-1.52L9.58 4.44A.9.9 0 0 0 8.2 5.2z" fill="currentColor"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5.2" y="10.4" width="13.6" height="10.4" rx="2.6" fill="currentColor"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Which stages the student has expanded/collapsed. Survives re-renders (the app re-renders Home on every state refresh).
  const expandedByStage = {};
  const isOpen = (s) => (expandedByStage[s.stageId] !== undefined ? expandedByStage[s.stageId] : (s.status === "current" || s.status === "available"));

  function nodeIcon(n) {
    if (n.state === "completed") return ICON.check;
    if (n.state === "locked") return ICON.lock;
    return ICON.play;
  }

  function nodeHTML(n, nextLane) {
    const link = nextLane ? '<span class="lp-link lk-' + n.lane + nextLane + " is-" + n.link + '" aria-hidden="true"></span>' : "";
    const locked = n.state === "locked";
    return '<li class="lp-step lp-' + n.lane + '" data-state="' + n.state + '" style="--chapter-light-intensity:' + n.lightIntensity + '">' + link +
      '<button type="button" class="lp-node" data-lp="node" data-stage="' + esc(n.stageId) + '" data-chapter="' + esc(n.chapterId) + '" data-phase="' + n.phase + '"' +
      (locked ? ' aria-disabled="true"' : "") + (n.state === "current" ? ' aria-current="step"' : "") +
      ' aria-label="' + esc(nodeAria(n)) + '">' +
      '<span class="lp-face">' + nodeIcon(n) + "</span>" +
      '<span class="lp-text"><span class="lp-title">' + esc(n.chapterNo) + ". " + esc(n.title) + '</span><span class="lp-sub">' + esc(nodeSub(n)) + "</span></span>" +
      "</button></li>";
  }

  const BADGE = { current: "You are here", completed: "✓ Complete", locked: "Locked", available: "Unlocked" };

  function cardHTML(s, open) {
    const cur = s.current;
    const eyebrow = esc(COURSE_TITLE) + " · Stage " + esc(s.stageNo);
    const collapsible = s.nodes.length > 0 && (s.status === "completed" || s.status === "locked");
    let toggle = "";
    if (collapsible) {
      const label = s.status === "completed" ? (open ? "Hide chapters" : "Review chapters (" + s.total + ")") : (open ? "Show fewer" : "Show all " + s.total + " chapters");
      toggle = '<button type="button" class="lp-toggle" data-lp="toggle" aria-expanded="' + open + '" aria-controls="lpPath-' + esc(s.stageId) + '">' + label + "</button>";
    }
    const now = cur
      ? '<div class="lp-now"><span class="lp-now-text"><span class="lp-now-k">Current</span> ' + esc(cur.chapterNo) + ". " + esc(cur.title) + "</span>" +
        '<button type="button" class="btn lp-cta" data-lp="cta" data-stage="' + esc(cur.stageId) + '" data-chapter="' + esc(cur.chapterId) + '" data-phase="' + cur.phase + '">' + "Start chapter" + "</button></div>"
      : "";
    const lock = s.status === "locked" ? '<p class="lp-lock-note">' + ICON.lock + "<span>" + esc(s.lockReason) + "</span></p>" : "";
    const empty = s.nodes.length === 0 ? '<p class="lp-lock-note"><span>No chapters in this stage yet.</span></p>' : "";
    return '<header class="lp-card"' + (cur ? ' id="lpCheckpoint"' : "") + ">" +
      '<div class="lp-card-top"><span class="lp-eyebrow">' + eyebrow + '</span><span class="lp-badge">' + BADGE[s.status] + "</span></div>" +
      '<h3 class="lp-card-title">' + esc(s.title) + "</h3>" +
      '<div class="lp-progress"><div class="bar" role="progressbar" aria-label="Stage progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.percent + '"><div class="fill" style="width:' + s.percent + '%"></div></div>' +
      '<span class="lp-progress-text">' + s.done + " / " + s.total + " chapters completed</span></div>" +
      now + lock + empty + toggle + "</header>";
  }

  function stageHTML(s, isLast) {
    const open = isOpen(s);
    // completed + collapsed hides the path entirely; locked + collapsed shows the first 3 nodes as a teaser (CSS)
    const collapsed = (s.status === "locked" || s.status === "completed") && !open;
    const list = s.nodes.length
      ? '<ol class="lp-path' + (collapsed ? " is-collapsed" : "") + '" data-first="' + s.nodes[0].state + '" id="lpPath-' + esc(s.stageId) + '" aria-label="' + esc("Stage " + s.stageNo + ": " + s.title + " chapters") + '">' +
        s.nodes.map((n, i) => nodeHTML(n, s.nodes[i + 1] && s.nodes[i + 1].lane)).join("") + "</ol>"
      : "";
    return '<section class="lp-stage is-' + s.status + '" data-stage-section="' + esc(s.stageId) + '" data-status="' + s.status + '">' +
      cardHTML(s, open) + list + (isLast ? "" : '<div class="lp-join is-' + (s.status === "completed" ? "done" : "future") + '" aria-hidden="true">' + ICON.down + "</div>") + "</section>";
  }

  function modelHTML(model) {
    const banner = model.allComplete ? '<p class="lp-allclear">🎉 You finished every stage. Open any stage to review its chapters.</p>' : "";
    return banner + model.stages.map((s, i) => stageHTML(s, i === model.stages.length - 1)).join("");
  }

  function render(host, model, opts) {
    host.innerHTML = modelHTML(model);
    const nodeOf = (sid, cid) => { for (const s of model.stages) if (s.stageId === sid) return s.nodes.find((n) => n.chapterId === cid); return null; };

    host.onclick = (e) => {
      const t = e.target.closest("[data-lp]");
      if (!t || !host.contains(t)) return;
      const act = t.dataset.lp;
      if (act === "toggle") {
        const section = t.closest(".lp-stage");
        const s = model.stages.find((x) => x.stageId === section.dataset.stageSection);
        const open = t.getAttribute("aria-expanded") !== "true";
        expandedByStage[s.stageId] = open;
        t.setAttribute("aria-expanded", String(open));
        t.textContent = s.status === "completed" ? (open ? "Hide chapters" : "Review chapters (" + s.total + ")") : (open ? "Show fewer" : "Show all " + s.total + " chapters");
        section.querySelector(".lp-path").classList.toggle("is-collapsed", s.status === "completed" ? !open : (s.status === "locked" && !open));
        return;
      }
      const n = nodeOf(t.dataset.stage, t.dataset.chapter);
      if (!n) return;
      if (n.state === "locked") { opts.onLocked(n.lockReason); return; }
      // Finished chapters open as an ungraded review (no XP, no hearts); everything else starts the chapter run.
      if (act !== "cta" && n.phase === "review") opts.onReview(n.stageId, n.chapterId);
      else opts.onStart(n.stageId, n.chapterId);
    };
  }

  // "Back on Home after finishing a chapter": return that chapter's node, first expanding its stage if the student had collapsed it.
  function reveal(host, chapterId) {
    const node = host.querySelector('.lp-node[data-chapter="' + String(chapterId).replace(/["\\]/g, "\\$&") + '"]');
    if (!node) return null;
    const path = node.closest(".lp-path");
    if (path && path.classList.contains("is-collapsed")) {
      const toggle = node.closest(".lp-stage").querySelector(".lp-toggle");
      if (toggle) toggle.click();
    }
    return node;
  }

  return { COURSE_TITLE, LANES, lookups, build, nodeSub, nodeAria, render, reveal, modelHTML };
});
