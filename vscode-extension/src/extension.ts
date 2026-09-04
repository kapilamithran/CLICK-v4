import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { exec, execFile } from "child_process";

const SECRET_DEVICE_TOKEN = "click.deviceToken";

interface PracticeTest {
  name: string;
  input: string;
  expected_output: string;
  timeout_ms: number;
}
interface MistakeRule {
  rule_type: "source_regex" | "compiler_regex" | string;
  pattern: string;
  message: string;
}
interface PracticeQuestion {
  practice_id: string;
  stage_id: string;
  title: string;
  objective: string;
  problem_statement: string;
  constraints: string;
  sample_input: string;
  sample_output: string;
  starter_code: string;
  visible_tests: PracticeTest[];
  hidden_tests: PracticeTest[];
  mistake_rules: MistakeRule[];
  hints: string[];
  success_message: string;
  technique_after_success: string;
  order: number;
  completed?: boolean;
  available?: boolean;
  lock_reason?: string;
}

let output: vscode.OutputChannel;
let statusBar: vscode.StatusBarItem;
let currentQuestion: PracticeQuestion | null = null;
let workDir: string | null = null;

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

async function openChallenge(context: vscode.ExtensionContext, q: PracticeQuestion) {
  currentQuestion = q;
  const dir = ensureWorkDir();
  const file = path.join(dir, `${safeFileName(q.practice_id)}_${safeFileName(q.title)}.c`);

  const header = [
    `/*`,
    ` * CLICK Practice — ${q.title}`,
    ` *`,
    ` * ${q.objective}`,
    ` *`,
    ` * ${q.problem_statement.replace(/\n/g, "\n * ")}`,
    q.constraints ? ` *\n * Constraints:\n * ${q.constraints.replace(/\n/g, "\n * ")}` : "",
    q.sample_input || q.sample_output
      ? ` *\n * Sample input:  ${q.sample_input}\n * Sample output: ${q.sample_output}`
      : "",
    ` *`,
    ` * Run "CLICK: Check Code" (Ctrl+Shift+P) when ready.`,
    ` */`,
    ``,
  ]
    .filter(Boolean)
    .join("\n");

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, header + (q.starter_code || ""), "utf8");
  }

  const doc = await vscode.workspace.openTextDocument(file);
  await vscode.window.showTextDocument(doc, { preview: false });
  statusBar.text = `$(book) CLICK: ${q.title}`;
  statusBar.show();
  output.appendLine(`\nOpened practice challenge: ${q.title} (${q.practice_id})`);
}

async function syncAndOpenNext(context: vscode.ExtensionContext, announce = true) {
  const token = await getDeviceToken(context);
  if (!token) {
    vscode.window.showWarningMessage("CLICK is not paired yet. Run “CLICK: Pair with Web App” first.");
    return;
  }
  try {
    const data = (await api(context, "practiceExtensionSync", { device_token: token })) as {
      user: { name: string };
      questions: PracticeQuestion[];
    };
    const next = data.questions.find((q) => q.available && !q.completed);
    if (next) {
      await openChallenge(context, next);
      if (announce) vscode.window.showInformationMessage(`CLICK: opened "${next.title}"`);
      return;
    }
    const locked = data.questions.find((q) => !q.available && !q.completed);
    if (locked) {
      vscode.window.showInformationMessage(
        `Next challenge "${locked.title}" is still locked: ${locked.lock_reason || "complete the previous requirement first."}`
      );
      return;
    }
    vscode.window.showInformationMessage("All available CLICK practice challenges are completed. Nice work!");
  } catch (e: any) {
    vscode.window.showErrorMessage("CLICK sync failed: " + e.message);
  }
}

async function claimPairing(context: vscode.ExtensionContext, code: string) {
  try {
    const data = (await api(context, "claimPracticePairing", {
      pair_code: code,
      device_name: os.hostname() + " (VS Code)",
    })) as { device_token: string };
    await context.secrets.store(SECRET_DEVICE_TOKEN, data.device_token);
    vscode.window.showInformationMessage("CLICK: paired successfully!");
    await syncAndOpenNext(context, false);
  } catch (e: any) {
    vscode.window.showErrorMessage("CLICK pairing failed: " + e.message);
  }
}

function runOne(exePath: string, input: string, timeoutMs: number): Promise<{ stdout: string; stderr: string; timedOut: boolean }> {
  return new Promise((resolve) => {
    const child = execFile(exePath, [], { timeout: timeoutMs || 5000 }, (err, stdout, stderr) => {
      resolve({ stdout, stderr, timedOut: !!err && (err as any).killed === true });
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

async function checkCode(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.document.fileName.endsWith(".c")) {
    vscode.window.showWarningMessage("Open a .c practice file first.");
    return;
  }
  if (!currentQuestion) {
    vscode.window.showWarningMessage("No active CLICK challenge. Run “CLICK: Open Next Practice” first.");
    return;
  }
  await editor.document.save();
  const q = currentQuestion;
  const sourcePath = editor.document.fileName;
  const source = editor.document.getText();
  const exePath = sourcePath.replace(/\.c$/, process.platform === "win32" ? ".exe" : "");

  output.show(true);
  output.appendLine(`\n--- Checking ${q.title} ---`);

  const gcc = cfg<string>("click.gccPath") || "gcc";
  await new Promise<void>((resolve) => {
    exec(`"${gcc}" "${sourcePath}" -o "${exePath}"`, { timeout: 15000 }, async (err, _stdout, stderr) => {
      if (err) {
        const hint = matchMistake(q.mistake_rules, "compiler_regex", stderr);
        output.appendLine("Compile failed:\n" + stderr);
        if (hint) {
          vscode.window.showErrorMessage(hint);
        } else if (/is not recognized|command not found|ENOENT/i.test(String(err.message))) {
          vscode.window.showErrorMessage(
            "gcc was not found. Install the C compiler via MSYS2 (see your CLICK setup guide) and make sure it's on PATH."
          );
        } else {
          vscode.window.showErrorMessage("Compile error — see the CLICK output panel.");
        }
        resolve();
        return;
      }

      const allTests = [...(q.visible_tests || []), ...(q.hidden_tests || [])];
      let passCount = 0;
      let firstFailure: { test: PracticeTest; got: string; hidden: boolean } | null = null;

      for (let i = 0; i < allTests.length; i++) {
        const t = allTests[i];
        const isHidden = i >= (q.visible_tests || []).length;
        const { stdout, timedOut } = await runOne(exePath, t.input, t.timeout_ms);
        const got = stdout.trim();
        const expected = String(t.expected_output || "").trim();
        if (!timedOut && got === expected) {
          passCount++;
          output.appendLine(`✓ ${t.name || "test " + (i + 1)}`);
        } else {
          output.appendLine(`✗ ${t.name || "test " + (i + 1)}${timedOut ? " (timed out)" : ""}`);
          if (!firstFailure) firstFailure = { test: t, got, hidden: isHidden };
        }
      }

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
        resolve();
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
        await syncAndOpenNext(context, true);
      } catch (e: any) {
        vscode.window.showErrorMessage("Could not save your progress: " + e.message);
      }
      resolve();
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("CLICK Practice");
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  context.subscriptions.push(output, statusBar);

  context.subscriptions.push(
    vscode.window.registerUriHandler({
      handleUri(uri: vscode.Uri) {
        const params = new URLSearchParams(uri.query);
        const code = params.get("code");
        if (code) {
          claimPairing(context, code);
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
    vscode.commands.registerCommand("click.openNextPractice", () => syncAndOpenNext(context, true))
  );

  context.subscriptions.push(vscode.commands.registerCommand("click.checkCode", () => checkCode(context)));

  context.subscriptions.push(
    vscode.commands.registerCommand("click.disconnect", async () => {
      await context.secrets.delete(SECRET_DEVICE_TOKEN);
      currentQuestion = null;
      statusBar.hide();
      vscode.window.showInformationMessage("CLICK: disconnected from this device.");
    })
  );

  getDeviceToken(context).then((token) => {
    if (token) statusBar.text = "$(book) CLICK: paired";
    statusBar.show();
  });
}

export function deactivate() {}
