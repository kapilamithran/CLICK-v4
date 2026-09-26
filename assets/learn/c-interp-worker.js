/*
 * Web Worker wrapper for the CLICK C-subset interpreter.
 * Runs student code away from the page (no DOM, no cookies, no page globals) so the
 * caller can terminate it if it ever runs too long. See c-interp.js for the language subset.
 */
importScripts("c-interp.js");
self.onmessage = function (e) {
  var msg = e.data || {};
  var result;
  try { result = self.ClickInterp.run(String(msg.code || ""), msg.opts || {}); }
  catch (err) { result = { ok: false, stdout: "", error: { kind: "runtime", message: "The simulator hit an unexpected problem: " + (err && err.message), line: 0 }, trace: null, steps: 0 }; }
  self.postMessage(result);
};
