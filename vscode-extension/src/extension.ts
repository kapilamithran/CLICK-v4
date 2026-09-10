import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { exec, execFile, ExecFileException } from "child_process";
import { CheckSummary, MistakeRule, PracticeQuestion, PracticeTest, TestOutcome, TestResultLine } from "./types";
import { PracticeTreeProvider } from "./practiceTreeProvider";
import { QuestionViewProvider, QuestionViewMessage } from "./questionViewProvider";

const SECRET_DEVICE_TOKEN = "click.deviceToken";

let output: vscode.OutputChannel;
let statusBar: vscode.StatusBarItem;
let currentQuestion: PracticeQuestion | null = null;
let lastQuestions: PracticeQuestion[] = [];
let workDir: string | null = null;
let treeProvider: PracticeTreeProvider;
let questionProvider: QuestionViewProvider;

function cfg<T>(key: string): T {
  return vscode.workspace.getConfiguration().get(key) as T;
}

async function api(context: vscode.ExtensionContext, action: string, payload: Record<string, unknown> = {}) {
  const backendUrl = cfg<string>("click.backendUrl");
  const anonKey = cfg<string>("click.anonKey");
  const res = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: "Bearer " + anonKey,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = (await res.json()) as { ok: boolean; error?: string; [k: string]: unknown };
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function getDeviceToken(context: vscode.ExtensionContext): Promise<string | undefined> {
  return context.secrets.get(SECRET_DEVICE_TOKEN);
}

function ensureWorkDir(): string {
  if (workDir) return workDir;
  const folders = vscode.workspace.workspaceFolders;
  const base = folders && folders.length ? folders[0].uri.fsPath : path.join(os.homedir(), "CLICK-Practice");
  const dir = folders && folders.length ? path.join(base, "click-practice") : base;
  fs.mkdirSync(dir, { recursive: true });
  workDir = dir;
  return dir;
}

function safeFileName(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
}

/**
 * Experiment questions get the richer Programming-C/Experiment-NN/<slug>/
 * folder structure the web question page describes, instead of the flat
 * click-practice/ naming used for regular Practice Bank challenges.
 */
function ensureExperimentDir(workspaceFolder: string): string {
  const folders = vscode.workspace.workspaceFolders;
  const base = folders && folders.length ? folders[0].uri.fsPath : path.join(os.homedir(), "CLICK-Practice");
  const dir = path.join(base, "Programming-C", ...workspaceFolder.split("/"));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function questionFilePath(q: PracticeQuestion): string {
  if (q.workspace_folder) {
    // Every Experiment question's authored source file is named solution.c
    // (there is no per-question filename field to read this from).
    return path.join(ensureExperimentDir(q.workspace_folder), "solution.c");
  }
  const dir = ensureWorkDir();
  return path.join(dir, `${safeFileName(q.practice_id)}_${safeFileName(q.title)}.c`);
}

/**
 * Clean starter code plus a one-line signpost — the problem statement, constraints,
 * input/output and examples live in the CLICK Practice sidebar, not in the source file.
 */
function starterFileContents(q: PracticeQuestion): string {
  const signpost =
    `// CLICK — open the "CLICK Practice" view in the Activity Bar for the problem statement, constraints, and examples.\n` +
    `// Run "CLICK: Check Code" (Ctrl+Shift+P) when ready.\n\n`;
  return signpost + (q.starter_code || "");
}

function updateStatusBar(paired: boolean, question: PracticeQuestion | null): void {
  if (!paired) {
    statusBar.text = "$(circle-slash) CLICK: Not connected";
    statusBar.tooltip = 'Run "CLICK: Pair with Web App" to connect.';
    statusBar.command = "click.pair";
    return;
  }
  statusBar.text = question ? `$(book) CLICK ● ${question.title}` : "$(book) CLICK ● Connected";
  statusBar.tooltip = "Open the CLICK Practice question panel.";
  statusBar.command = "click.showQuestionPanel";
}

async function openChallenge(context: vscode.ExtensionContext, q: PracticeQuestion) {
  currentQuestion = q;
  const file = questionFilePath(q);

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, starterFileContents(q), "utf8");
  }

  const doc = await vscode.workspace.openTextDocument(file);
  await vscode.window.showTextDocument(doc, { preview: false });

  updateStatusBar(true, q);
  statusBar.show();
  questionProvider.setQuestion(q);
  treeProvider.setCurrent(q.practice_id);
  output.appendLine(`\nOpened practice challenge: ${q.title} (${q.practice_id})`);
}

async function openCurrentFile(): Promise<void> {
  if (!currentQuestion) return;
  const file = questionFilePath(currentQuestion);
  if (!fs.existsSync(file)) return;
  const doc = await vscode.workspace.openTextDocument(file);
  await vscode.window.showTextDocument(doc, { preview: false });
}

async function resetStarterCode(context: vscode.ExtensionContext): Promise<void> {
  if (!currentQuestion) {
    vscode.window.showWarningMessage("No active CLICK challenge to reset.");
    return;
  }
  const q = currentQuestion;
  const choice = await vscode.window.showWarningMessage(
    `Replace your current code for "${q.title}" with the starter code? This cannot be undone.`,
    { modal: true },
    "Replace"
  );
  if (choice !== "Replace") return;

  const file = questionFilePath(q);
  fs.writeFileSync(file, starterFileContents(q), "utf8");
  const doc = await vscode.workspace.openTextDocument(file);
  await vscode.window.showTextDocument(doc, { preview: false });
  output.appendLine(`\nReset starter code for: ${q.title}`);
}

async function handleSyncError(context: vscode.ExtensionContext, e: any): Promise<void> {
  const msg = String((e && e.message) || e);
  if (/no longer valid|not connected/i.test(msg)) {
    await context.secrets.delete(SECRET_DEVICE_TOKEN);
    currentQuestion = null;
    lastQuestions = [];
    treeProvider.setQuestions([]);
    questionProvider.setPaired(false);
    await vscode.commands.executeCommand("setContext", "click.paired", false);
    updateStatusBar(false, null);
    statusBar.show();
    vscode.window.showWarningMessage(
      'CLICK: this device\'s connection is no longer valid. Run "CLICK: Pair with Web App" to reconnect.'
    );
    return;
  }
  if (/fetch|network/i.test(msg)) {
    vscode.window.showErrorMessage("CLICK server unavailable. Check your internet connection and try again.");
    return;
  }
  vscode.window.showErrorMessage("CLICK sync failed: " + msg);
}

async function syncQuestions(
  context: vscode.ExtensionContext,
  opts: { openNext: boolean; announce: boolean }
): Promise<void> {
  const token = await getDeviceToken(context);
  if (!token) {
    vscode.window.showWarningMessage('CLICK is not paired yet. Run "CLICK: Pair with Web App" first.');
    return;
  }
  try {
    const data = (await api(context, "practiceExtensionSync", { device_token: token })) as unknown as {
      user: { name: string };
      questions: PracticeQuestion[];
    };
    lastQuestions = data.questions || [];
    treeProvider.setQuestions(lastQuestions);
    treeProvider.setCurrent(currentQuestion ? currentQuestion.practice_id : null);

    if (!opts.openNext) {
      if (opts.announce) vscode.window.showInformationMessage("CLICK: practice list refreshed.");
      return;
    }

    // Experiment questions, and the new Stage 0-5 curriculum coding questions,
    // are both deliberately excluded from the auto "next" pick - they're
    // separately-browsed collections (no fixed sequence), opened by explicit
    // selection (web deep-link or the tree view) only, never surprising a
    // student who just wants their next (as-yet-unbuilt) sequential Stage practice.
    const next = lastQuestions.find((q) => q.available && !q.completed && q.experiment_number == null && !q.stage_id);
    if (next) {
      await openChallenge(context, next);
      if (opts.announce) vscode.window.showInformationMessage(`CLICK: opened "${next.title}"`);
      return;
    }
    const locked = lastQuestions.find((q) => !q.available && !q.completed);
    if (locked) {
      vscode.window.showInformationMessage(
        `Next challenge "${locked.title}" is still locked: ${locked.lock_reason || "complete the previous requirement first."}`
      );
      return;
    }
    vscode.window.showInformationMessage("All available CLICK practice challenges are completed. Nice work!");
  } catch (e: any) {
    await handleSyncError(context, e);
  }
}

/**
 * Opens one specific challenge by practice_id (e.g. an Experiment question
 * id like "E00-Q1"), regardless of queue position - triggered by the web's
 * "Open in VS Code" deep link (see the uriHandler in activate()). Reuses the
 * exact same sync/open machinery as everything else; this does not add a
 * second question-resolution path.
 */
async function openSpecificChallenge(context: vscode.ExtensionContext, practiceId: string): Promise<void> {
  const token = await getDeviceToken(context);
  if (!token) {
    vscode.window.showWarningMessage('CLICK is not paired yet. Run "CLICK: Pair with Web App" first, then open this question again.');
    return;
  }
  try {
    const data = (await api(context, "practiceExtensionSync", { device_token: token })) as unknown as {
      questions: PracticeQuestion[];
    };
    lastQuestions = data.questions || [];
    treeProvider.setQuestions(lastQuestions);

    const q = lastQuestions.find((x) => x.practice_id === practiceId);
    if (!q) {
      vscode.window.showErrorMessage(`CLICK: question "${practiceId}" could not be found. It may not be published yet - try again after refreshing, or reopen it from the web page.`);
      return;
    }
    if (!q.available) {
      vscode.window.showWarningMessage(`"${q.title}" is locked: ${q.lock_reason || "complete the previous requirement first."}`);
      return;
    }
    await openChallenge(context, q);
    treeProvider.setCurrent(q.practice_id);
  } catch (e: any) {
    await handleSyncError(context, e);
  }
}

async function claimPairing(context: vscode.ExtensionContext, code: string) {
  try {
    const data = (await api(context, "claimPracticePairing", {
      pair_code: code,
      device_name: os.hostname() + " (VS Code)",
    })) as unknown as { device_token: string };
    await context.secrets.store(SECRET_DEVICE_TOKEN, data.device_token);
    await vscode.commands.executeCommand("setContext", "click.paired", true);
    questionProvider.setPaired(true);
    updateStatusBar(true, null);
    statusBar.show();
    vscode.window.showInformationMessage("CLICK: paired successfully!");
    await syncQuestions(context, { openNext: true, announce: false });
  } catch (e: any) {
    vscode.window.showErrorMessage("CLICK pairing failed: " + e.message);
  }
}

interface RunResult {
  stdout: string;
  stderr: string;
  timedOut: boolean;
  crashed: boolean;
}

function runOne(exePath: string, input: string, timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = execFile(exePath, [], { timeout: timeoutMs || 5000 }, (err: ExecFileException | null, stdout, stderr) => {
      const timedOut = !!err && err.killed === true;
      const code = err && typeof err.code === "number" ? err.code : 0;
      const crashed = !!err && !timedOut && (!!err.signal || code > 128 || code < 0);
      resolve({ stdout: stdout || "", stderr: stderr || "", timedOut, crashed });
    });
    if (child.stdin) {
      child.stdin.write(input || "");
      child.stdin.end();
    }
  });
}

function matchMistake(rules: MistakeRule[], type: string, text: string): string | null {
  for (const r of rules || []) {
    if (r.rule_type !== type) continue;
    try {
      if (new RegExp(r.pattern).test(text)) return r.message;
    } catch {
      // ignore invalid regex authored in the sheet
    }
  }
  return null;
}

function compileSource(gcc: string, sourcePath: string, exePath: string): Promise<{ ok: boolean; stderr: string; err: any }> {
  return new Promise((resolve) => {
    exec(`"${gcc}" "${sourcePath}" -o "${exePath}"`, { timeout: 15000 }, (err, _stdout, stderr) => {
      resolve({ ok: !err, stderr: stderr || "", err });
    });
  });
}

function reportCompileFailure(q: PracticeQuestion, stderr: string, err: any): void {
  output.appendLine("Compilation");
  output.appendLine("  ✗ Failed\n");
  output.appendLine(stderr);
  questionProvider.setResult({
    practiceTitle: q.title,
    compileOk: false,
    compileError: stderr,
    results: [],
    passCount: 0,
    totalCount: 0,
    allPassed: false,
  });
  const hint = matchMistake(q.mistake_rules, "compiler_regex", stderr);
  if (hint) {
    vscode.window.showErrorMessage(hint);
  } else if (/is not recognized|command not found|ENOENT/i.test(String(err && err.message))) {
    vscode.window.showErrorMessage(
      "gcc was not found. Install the C compiler via MSYS2 (see your CLICK setup guide) and make sure it's on PATH."
    );
  } else {
    vscode.window.showErrorMessage("Compile error — see the CLICK output panel.");
  }
}

async function runTestSet(
  exePath: string,
  tests: PracticeTest[],
  hiddenStartIndex: number
): Promise<{ resultLines: TestResultLine[]; passCount: number; firstFailure: { test: PracticeTest; got: string; hidden: boolean } | null }> {
  let passCount = 0;
  let firstFailure: { test: PracticeTest; got: string; hidden: boolean } | null = null;
  const resultLines: TestResultLine[] = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const isHidden = i >= hiddenStartIndex;
    // Hidden tests never surface their real name (it can hint at the exact
    // scenario being probed) in either the output channel log or the results
    // list below - only an anonymous, numbered label and a pass/fail outcome.
    const name = isHidden ? `Hidden test ${i - hiddenStartIndex + 1}` : t.name || `Test ${i + 1}`;
    const { stdout, timedOut, crashed } = await runOne(exePath, t.input, t.timeout_ms);
    // Normalize CRLF -> LF before comparing: on Windows, a MinGW-compiled
    // binary's stdout is opened in text mode, so every "\n" the student's
    // program prints comes back as "\r\n" - without this, every multi-line
    // expected_output (stored as plain "\n") would fail even for perfectly
    // correct code, on every Windows machine.
    const got = stdout.replace(/\r\n/g, "\n").trim();
    const expected = String(t.expected_output || "").replace(/\r\n/g, "\n").trim();

    let outcome: TestOutcome;
    if (timedOut) outcome = "timeout";
    else if (crashed) outcome = "crash";
    else if (got === expected) outcome = "pass";
    else outcome = "fail";

    if (outcome === "pass") {
      passCount++;
    } else if (!firstFailure) {
      firstFailure = { test: t, got, hidden: isHidden };
    }

    resultLines.push({ name, outcome, hidden: isHidden });
    const suffix = outcome === "timeout" ? " (timed out)" : outcome === "crash" ? " (crashed)" : "";
    // Hidden tests are logged only as part of the aggregate line below, never
    // one-by-one - per-test pass/fail position is itself a side channel a
    // student could probe (rerun, see which position flips) to map out
    // hidden test structure without ever seeing an input or expected output.
    if (!isHidden) output.appendLine(`  ${outcome === "pass" ? "✓" : "✗"} ${name}${suffix}`);
  }
  const hiddenResults = resultLines.filter((r) => r.hidden);
  if (hiddenResults.length) {
    const hiddenPassed = hiddenResults.filter((r) => r.outcome === "pass").length;
    output.appendLine(`  ${hiddenPassed === hiddenResults.length ? "✓" : "✗"} Hidden tests: ${hiddenPassed}/${hiddenResults.length} passed`);
  }

  return { resultLines, passCount, firstFailure };
}

function activeSourceEditor(): vscode.TextEditor | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document.fileName.endsWith(".c")) {
    vscode.window.showWarningMessage("Open a .c practice file first.");
    return null;
  }
  if (!currentQuestion) {
    vscode.window.showWarningMessage('No active CLICK challenge. Run "CLICK: Open Next Practice" first.');
    return null;
  }
  return editor;
}

/** "Run" — compiles and runs only the visible tests. Never submits progress. */
async function runVisibleTests(context: vscode.ExtensionContext) {
  const editor = activeSourceEditor();
  if (!editor || !currentQuestion) return;
  await editor.document.save();
  const q = currentQuestion;
  const sourcePath = editor.document.fileName;
  const exePath = sourcePath.replace(/\.c$/, process.platform === "win32" ? ".exe" : "");

  output.show(true);
  output.appendLine(`\n--- Running ${q.title} (visible tests) ---`);

  const gcc = cfg<string>("click.gccPath") || "gcc";
  const compiled = await compileSource(gcc, sourcePath, exePath);
  if (!compiled.ok) {
    reportCompileFailure(q, compiled.stderr, compiled.err);
    return;
  }

  output.appendLine("Compilation");
  output.appendLine("  ✓ Successful\n");
  output.appendLine("Tests");

  const visible = q.visible_tests || [];
  const { resultLines, passCount } = await runTestSet(exePath, visible, visible.length);
  output.appendLine("");
  output.appendLine(`Visible: ${passCount}/${visible.length} passed`);

  questionProvider.setResult({
    practiceTitle: q.title,
    compileOk: true,
    results: resultLines,
    passCount,
    totalCount: visible.length,
    allPassed: passCount === visible.length,
  });

  vscode.window.showInformationMessage(
    `Ran ${visible.length} visible test${visible.length === 1 ? "" : "s"} — ${passCount}/${visible.length} passed. Use Submit to grade against all tests.`
  );
}

/** "Submit" — compiles, runs every test (visible + hidden), and records progress on a full pass. */
async function checkCode(context: vscode.ExtensionContext) {
  const editor = activeSourceEditor();
  if (!editor || !currentQuestion) return;
  await editor.document.save();
  const q = currentQuestion;
  const sourcePath = editor.document.fileName;
  const source = editor.document.getText();
  const exePath = sourcePath.replace(/\.c$/, process.platform === "win32" ? ".exe" : "");

  output.show(true);
  output.appendLine(`\n--- Checking ${q.title} ---`);

  const gcc = cfg<string>("click.gccPath") || "gcc";
  const compiled = await compileSource(gcc, sourcePath, exePath);
  if (!compiled.ok) {
    reportCompileFailure(q, compiled.stderr, compiled.err);
    return;
  }

  output.appendLine("Compilation");
  output.appendLine("  ✓ Successful\n");
  output.appendLine("Tests");

  const visible = q.visible_tests || [];
  const allTests = [...visible, ...(q.hidden_tests || [])];
  const { resultLines, passCount, firstFailure } = await runTestSet(exePath, allTests, visible.length);

  output.appendLine("");
  output.appendLine(`Overall: ${passCount}/${allTests.length} passed`);

  const summary: CheckSummary = {
    practiceTitle: q.title,
    compileOk: true,
    results: resultLines,
    passCount,
    totalCount: allTests.length,
    allPassed: passCount === allTests.length,
  };
  questionProvider.setResult(summary);

  if (firstFailure) {
    const mistakeHit = matchMistake(q.mistake_rules, "source_regex", source);
    if (mistakeHit) {
      vscode.window.showWarningMessage(mistakeHit);
    } else if (!firstFailure.hidden) {
      vscode.window.showWarningMessage(
        `"${firstFailure.test.name || "A visible test"}" failed. Expected "${firstFailure.test.expected_output}", got "${firstFailure.got}".`
      );
    } else {
      vscode.window.showWarningMessage(`${passCount}/${allTests.length} tests passed — a hidden test still fails.`);
    }
    return;
  }

  // all tests passed
  try {
    const token = await getDeviceToken(context);
    await api(context, "completePractice", {
      device_token: token,
      practice_id: q.practice_id,
      result_summary: `${passCount}/${allTests.length} tests passed in VS Code.`,
    });
    vscode.window.showInformationMessage(q.success_message || "All tests passed! Nice work.");
    if (q.technique_after_success) {
      output.appendLine(`\nTechnique: ${q.technique_after_success}`);
    }
    await syncQuestions(context, { openNext: true, announce: true });
  } catch (e: any) {
    vscode.window.showErrorMessage("Could not save your progress: " + e.message);
  }
}

function handleQuestionViewMessage(context: vscode.ExtensionContext, message: QuestionViewMessage): void {
  switch (message.type) {
    case "checkCode":
      vscode.commands.executeCommand("click.checkCode");
      break;
    case "runVisible":
      vscode.commands.executeCommand("click.runVisibleTests");
      break;
    case "openNext":
      vscode.commands.executeCommand("click.openNextPractice");
      break;
    case "refresh":
      vscode.commands.executeCommand("click.refreshPractice");
      break;
    case "pair":
      vscode.commands.executeCommand("click.pair");
      break;
    case "disconnect":
      vscode.commands.executeCommand("click.disconnect");
      break;
    case "resetStarter":
      vscode.commands.executeCommand("click.resetStarterCode");
      break;
    case "openFile":
      openCurrentFile();
      break;
  }
}

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("CLICK Practice");
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  context.subscriptions.push(output, statusBar);

  treeProvider = new PracticeTreeProvider();
  questionProvider = new QuestionViewProvider(context.extensionUri, (msg) => handleQuestionViewMessage(context, msg));

  context.subscriptions.push(vscode.window.registerWebviewViewProvider(QuestionViewProvider.viewId, questionProvider));
  context.subscriptions.push(vscode.window.registerTreeDataProvider("click.practiceTree", treeProvider));

  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri(uri: vscode.Uri) {
        const params = new URLSearchParams(uri.query);
        const code = params.get("code");
        if (code) {
          claimPairing(context, code);
          return;
        }
        // The web's "Open in VS Code" link is shaped as
        // vscode://clicklearn.click-practice/open?id=<practice_id> - "open" is
        // the URI *path*, not a query key, so the id must be read from the
        // query string's "id" parameter, not from params.get("open").
        if (uri.path === "/open") {
          const openId = params.get("id");
          if (openId) {
            openSpecificChallenge(context, openId);
          }
        }
      },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("click.pair", async () => {
      const code = await vscode.window.showInputBox({
        prompt: "Enter the 6-digit pairing code shown in the CLICK web app",
        validateInput: (v) => (/^\d{6}$/.test(v.trim()) ? null : "Enter the 6-digit code"),
      });
      if (code) await claimPairing(context, code.trim());
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("click.openNextPractice", () =>
      syncQuestions(context, { openNext: true, announce: true })
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("click.refreshPractice", () =>
      syncQuestions(context, { openNext: false, announce: true })
    )
  );

  context.subscriptions.push(vscode.commands.registerCommand("click.checkCode", () => checkCode(context)));

  context.subscriptions.push(vscode.commands.registerCommand("click.runVisibleTests", () => runVisibleTests(context)));

  context.subscriptions.push(vscode.commands.registerCommand("click.resetStarterCode", () => resetStarterCode(context)));

  context.subscriptions.push(
    vscode.commands.registerCommand("click.showQuestionPanel", async () => {
      await vscode.commands.executeCommand("click.questionView.focus");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("click.openChallengeItem", async (practiceId: string) => {
      const q = lastQuestions.find((x) => x.practice_id === practiceId);
      if (!q) return;
      if (!q.available && !q.completed) {
        vscode.window.showInformationMessage(
          `"${q.title}" is locked: ${q.lock_reason || "complete the previous requirement first."}`
        );
        return;
      }
      await openChallenge(context, q);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("click.disconnect", async () => {
      await context.secrets.delete(SECRET_DEVICE_TOKEN);
      currentQuestion = null;
      lastQuestions = [];
      treeProvider.setQuestions([]);
      questionProvider.setPaired(false);
      await vscode.commands.executeCommand("setContext", "click.paired", false);
      updateStatusBar(false, null);
      statusBar.show();
      vscode.window.showInformationMessage("CLICK: disconnected from this device.");
    })
  );

  getDeviceToken(context).then(async (token) => {
    const paired = !!token;
    await vscode.commands.executeCommand("setContext", "click.paired", paired);
    questionProvider.setPaired(paired);
    updateStatusBar(paired, null);
    statusBar.show();
    if (paired) {
      await syncQuestions(context, { openNext: false, announce: false });
    }
  });
}

export function deactivate() {}
