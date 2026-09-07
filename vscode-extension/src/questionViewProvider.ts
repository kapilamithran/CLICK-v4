import * as vscode from "vscode";
import { CheckSummary, PracticeQuestion } from "./types";

export type QuestionViewMessage =
  | { type: "checkCode" }
  | { type: "runVisible" }
  | { type: "openNext" }
  | { type: "refresh" }
  | { type: "pair" }
  | { type: "disconnect" }
  | { type: "resetStarter" }
  | { type: "openFile" };

function escapeHtml(value: string | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Converts already-escaped text containing lightweight Markdown emphasis (**bold**,
// *italic*, ***bold italic***) into real tags. Never spans a newline, so stray
// asterisks used as multiplication/pointer operators in surrounding prose can't
// accidentally pair up across sentences; the (?<!\/)/(?!\/) guards keep C comment
// tokens ("/*", "*/") from ever being mistaken for a delimiter.
function applyInlineEmphasis(html: string): string {
  return html
    .replace(/(?<!\/)\*\*\*([^*\n]+?)\*\*\*(?!\/)/g, "<strong><em>$1</em></strong>")
    .replace(/(?<!\/)\*\*([^*\n]+?)\*\*(?!\/)/g, "<strong>$1</strong>")
    .replace(/(?<!\/)\*([^*\n]+?)\*(?!\/)/g, "<em>$1</em>");
}

// Renders raw challenge text (objective/problem statement/constraints/hints) as safe
// HTML: escapes it first, then converts `inline code`, **bold**, *italic* and
// ***bold italic*** markers into real tags. The underlying content is never altered.
function mdInline(raw: string | undefined | null): string {
  const codeSpans: string[] = [];
  const withCode = String(raw ?? "").replace(/`([^`\n]+)`/g, (_, c: string) => `@@ICODE${codeSpans.push(c) - 1}@@`);
  let out = applyInlineEmphasis(escapeHtml(withCode));
  out = out.replace(/@@ICODE(\d+)@@/g, (_, i: string) => `<code>${escapeHtml(codeSpans[Number(i)])}</code>`);
  return out;
}

function nonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

/**
 * Sidebar WebviewView that renders the active CLICK challenge's problem statement,
 * constraints, examples and hints outside the source file, plus the last check result.
 * All actions delegate to the extension's existing commands — no logic is duplicated here.
 */
export class QuestionViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = "click.questionView";

  private view: vscode.WebviewView | null = null;
  private question: PracticeQuestion | null = null;
  private paired = false;
  private lastResult: CheckSummary | null = null;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly onMessage: (message: QuestionViewMessage) => void
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this.extensionUri] };
    webviewView.webview.onDidReceiveMessage((message: QuestionViewMessage) => this.onMessage(message));
    this.render();
  }

  setPaired(paired: boolean): void {
    this.paired = paired;
    if (!paired) {
      this.question = null;
      this.lastResult = null;
    }
    this.render();
  }

  setQuestion(question: PracticeQuestion | null): void {
    this.question = question;
    this.lastResult = null;
    this.render();
  }

  setResult(result: CheckSummary | null): void {
    this.lastResult = result;
    this.render();
  }

  private render(): void {
    if (!this.view) return;
    this.view.webview.html = this.html();
  }

  private html(): string {
    const csp = this.view!.webview.cspSource;
    const n = nonce();
    const body = !this.paired
      ? this.notPairedBody()
      : !this.question
      ? this.noQuestionBody()
      : this.questionBody(this.question);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${csp} 'unsafe-inline'; script-src 'nonce-${n}';">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 0 12px 16px; font-size: var(--vscode-font-size); }
  h2 { font-size: 1.15em; margin: 4px 0 10px; font-weight: 600; }
  h3 { font-size: 0.78em; margin: 16px 0 4px; color: var(--vscode-descriptionForeground); text-transform: uppercase; letter-spacing: 0.06em; }
  p, li { line-height: 1.45; white-space: pre-wrap; margin: 4px 0; }
  .eyebrow { font-size: 0.72em; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--vscode-descriptionForeground); margin: 8px 0 6px; line-height: 1.4; }
  .badge-row { margin: 0 0 8px; }
  .badge { display: inline-block; font-size: 0.75em; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--vscode-panel-border); color: var(--vscode-descriptionForeground); margin: 0 6px 6px 0; }
  .badge.tag { background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); border-color: transparent; display: block; width: fit-content; }
  .status { display: flex; align-items: center; gap: 6px; margin: 10px 0 12px; font-size: 0.85em; color: var(--vscode-descriptionForeground); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--vscode-testing-iconPassed, #3fb950); flex: none; }
  .dot.off { background: var(--vscode-testing-iconFailed, #f14c4c); }
  pre { background: var(--vscode-textCodeBlock-background); padding: 8px; border-radius: 4px; overflow-x: auto; margin: 4px 0; }
  code { font-family: var(--vscode-editor-font-family); font-size: 0.9em; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 14px; border-radius: 3px; cursor: pointer; margin: 0 6px 6px 0; font-size: 0.85em; }
  button:hover { background: var(--vscode-button-hoverBackground); }
  button.secondary { background: transparent; color: var(--vscode-foreground); border: 1px solid var(--vscode-panel-border); }
  button.secondary:hover { background: var(--vscode-toolbar-hoverBackground, rgba(128,128,128,0.15)); }
  button:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px; }
  .actions { margin: 10px 0 4px; }
  .view-results summary { cursor: pointer; color: var(--vscode-textLink-foreground); font-size: 0.85em; list-style: none; }
  .view-results summary::-webkit-details-marker { display: none; }
  .view-results summary:hover { color: var(--vscode-textLink-activeForeground); text-decoration: underline; }
  .view-results[open] summary { margin-bottom: 6px; }
  details.hint { margin: 6px 0; }
  details.hint summary { cursor: pointer; color: var(--vscode-textLink-foreground); }
  details.hint summary:hover { color: var(--vscode-textLink-activeForeground); }
  .divider { border: none; border-top: 1px solid var(--vscode-panel-border); margin: 14px 0; }
  .result-line { display: flex; align-items: center; gap: 6px; font-size: 0.88em; margin: 2px 0; }
  .result-line.pass { color: var(--vscode-testing-iconPassed, #3fb950); }
  .result-line.fail, .result-line.timeout, .result-line.crash { color: var(--vscode-testing-iconFailed, #f14c4c); }
  .empty { color: var(--vscode-descriptionForeground); font-style: italic; }
</style>
</head>
<body>
${body}
<script nonce="${n}">
  const vscode = acquireVsCodeApi();
  document.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-action]') : null;
    if (el) vscode.postMessage({ type: el.getAttribute('data-action') });
  });
</script>
</body>
</html>`;
  }

  private notPairedBody(): string {
    return `
<div class="status"><span class="dot off"></span> Not connected</div>
<p>Pair this VS Code window with your CLICK account to see your practice question here.</p>
<div class="actions">
  <button data-action="pair">Pair with Web App</button>
</div>`;
  }

  private noQuestionBody(): string {
    return `
<div class="status"><span class="dot"></span> Connected</div>
<p class="empty">No active practice challenge yet.</p>
<div class="actions">
  <button data-action="openNext">Open Next Practice</button>
  <button class="secondary" data-action="refresh">Refresh</button>
</div>`;
  }

  private questionBody(q: PracticeQuestion): string {
    const section = (label: string, value: string | null | undefined, pre = false): string => {
      if (!value || !value.trim()) return "";
      const content = pre ? `<pre><code>${escapeHtml(value)}</code></pre>` : `<p>${mdInline(value)}</p>`;
      return `<h3>${escapeHtml(label)}</h3>${content}`;
    };

    const examples =
      q.sample_input || q.sample_output
        ? `<h3>Example</h3>${
            q.sample_input ? `<p><strong>Input</strong></p><pre><code>${escapeHtml(q.sample_input)}</code></pre>` : ""
          }${q.sample_output ? `<p><strong>Output</strong></p><pre><code>${escapeHtml(q.sample_output)}</code></pre>` : ""}`
        : "";

    const hints =
      q.hints && q.hints.length
        ? `<h3>Hints</h3>${q.hints
            .map((h, i) => `<details class="hint"><summary>Hint ${i + 1}</summary><p>${mdInline(h)}</p></details>`)
            .join("")}`
        : "";

    const questionText = [q.objective, q.problem_statement].filter((v) => v && v.trim()).map((v) => `<p>${mdInline(v!)}</p>`).join("");

    const isExperiment = typeof q.experiment_number === "number";
    const eyebrow = isExperiment
      ? `<div class="eyebrow">Experiment ${q.experiment_number}</div>`
      : q.stage_title && q.stage_title.trim()
      ? `<div class="eyebrow">Experiment ${(typeof q.stage_no === "number" ? q.stage_no : 0) + 1} · ${escapeHtml(q.stage_title)}</div>`
      : "";

    const timeLimitSeconds = q.time_limit_seconds ?? Math.round((q.visible_tests?.[0]?.timeout_ms ?? q.hidden_tests?.[0]?.timeout_ms ?? 0) / 1000);
    const timeLimitBadge = timeLimitSeconds ? `<span class="badge">${timeLimitSeconds}s limit</span>` : "";
    const memoryBadge = q.memory_limit_mb ? `<span class="badge">${q.memory_limit_mb} MB</span>` : "";
    const marksBadge = q.marks != null ? `<span class="badge">${q.marks} marks</span>` : "";
    const difficultyBadge = q.difficulty ? `<span class="badge">${escapeHtml(q.difficulty)}</span>` : "";

    const ioFormat = [section("Input Format", q.input_format), section("Output Format", q.output_format)].join("");

    const explanation = section("Explanation", q.technique_after_success);

    const viewResults = this.lastResult
      ? `<details class="view-results"><summary>View results</summary>${this.resultBody()}</details>`
      : "";

    return `
<div class="status"><span class="dot"></span> Connected</div>
${eyebrow}
<h2>${escapeHtml(q.title)}</h2>
<div class="badge-row">${difficultyBadge}${marksBadge}${timeLimitBadge}${memoryBadge}</div>
<span class="badge tag">Practice question</span>
<div class="actions">
  <button data-action="runVisible">Run</button>
  <button data-action="checkCode">Submit</button>
  <button class="secondary" data-action="resetStarter">Reset</button>
</div>
${viewResults}
<hr class="divider">
<h3>Question</h3>
${questionText}
${ioFormat}
${section("Constraints", q.constraints)}
${examples}
${explanation}
${hints}
<hr class="divider">
<div class="actions">
  <button class="secondary" data-action="openFile">Open main.c</button>
  <button class="secondary" data-action="refresh">Refresh</button>
</div>`;
  }

  private resultBody(): string {
    const r = this.lastResult;
    if (!r) return "";
    if (!r.compileOk) {
      return `<div class="result-line fail">✗ Compilation failed — see the CLICK Practice output panel</div>`;
    }
    const lines = r.results
      .map((t) => {
        const icon = t.outcome === "pass" ? "✓" : "✗";
        const suffix = t.outcome === "timeout" ? " (timed out)" : t.outcome === "crash" ? " (crashed)" : "";
        return `<div class="result-line ${t.outcome}">${icon} ${escapeHtml(t.name)}${suffix}</div>`;
      })
      .join("");
    return `<p><strong>${r.passCount}/${r.totalCount} passed</strong></p>${lines}`;
  }
}
