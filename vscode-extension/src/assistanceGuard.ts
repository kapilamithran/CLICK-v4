import * as vscode from "vscode";

/**
 * "Anti-assistance mode": while a CLICK coding question is open, this
 * suppresses VS Code's own *automatic* code suggestions for C files in the
 * current workspace - specifically the failure mode of "type a partial
 * line, an automatic popup appears, press Tab, the whole answer gets
 * inserted." It does this entirely through documented, first-class VS Code
 * configuration keys (no keybinding hooks, no global settings, no other
 * extensions installed) so it can be applied and precisely reversed.
 *
 * What this can and cannot guarantee is written up in full in the CLICK
 * README/VS Code setup docs and the task report that introduced this file -
 * in short: it removes the *automatic, accidental* path to an answer via
 * Tab. It cannot control third-party extensions VS Code gives no
 * introspection/control API for, and it cannot stop a student who
 * deliberately goes looking for help elsewhere.
 */

// Every setting CLICK restricts is written as a `[c]` LANGUAGE override at
// WORKSPACE scope (`vscode.ConfigurationTarget.Workspace`, `overrideInLanguage:
// true`). That means: only C files, only in the one VS Code window/workspace
// the student had open when a CLICK question was opened, never the user's
// global/user-level settings, and never other languages in the same
// workspace. See the task report for why folder-level (not just
// language-level) scoping isn't achievable given how CLICK creates question
// files inside the student's already-open workspace rather than opening a
// dedicated workspace folder per question.
const RESTRICTED_EDITOR_SETTINGS: Record<string, unknown> = {
  // The direct fix for "type code, autocomplete pops up, press Tab, the
  // whole answer appears": with tabCompletion off, Tab *always* inserts a
  // tab/indent and never accepts a suggestion or expands a snippet,
  // regardless of whether a suggestion happens to be showing. This is the
  // officially documented lever for exactly this - not a custom keybinding.
  "editor.tabCompletion": "off",
  // Stops the suggestion popup from appearing automatically while typing.
  // Manually invoking it (Ctrl+Space) still works - that's a deliberate
  // student action, not the "accidental Tab" failure mode this targets.
  "editor.quickSuggestions": { other: false, comments: false, strings: false },
  "editor.suggestOnTriggerCharacters": false,
  // Purely-local "complete from words already typed in open files."
  "editor.wordBasedSuggestions": "off",
  "editor.snippetSuggestions": "none",
  // Ghost-text ahead of the cursor - the same VS Code API surface both the
  // built-in inline suggester AND GitHub Copilot's completions use. See
  // COPILOT_SETTINGS below for why this alone doesn't fully cover Copilot.
  "editor.inlineSuggest.enabled": false,
  // Typing an ordinary character (e.g. the ';' that ends a real statement)
  // can otherwise silently accept whatever suggestion happens to be shown.
  "editor.acceptSuggestionOnCommitCharacter": false,
};

// Deliberately NOT restricted, and why:
//   editor.parameterHints.enabled - shows a function's signature (e.g.
//     printf's), doesn't insert any code, isn't dismissed/accepted with Tab.
//     It's a reference aid, not an auto-answer vector; turning it off would
//     only remove a legitimate feature without addressing the concern.
//   editor.acceptSuggestionOnEnter - only matters once the suggest widget is
//     already open, which happens automatically far less now that
//     quickSuggestions is off; leaving it at VS Code's default preserves
//     "press Enter to make a new line" as unsurprising, ordinary typing.

// Best-effort only: a third-party extension's own setting keys are not part
// of any VS Code contract CLICK can rely on. This is applied only when that
// specific, by-ID-known extension is actually installed, and is skipped
// (never written) otherwise, so a student without it gets a clean
// settings.json with no dead Copilot key in it.
const COPILOT_EXTENSION_IDS = ["GitHub.copilot", "GitHub.copilot-chat"];
const COPILOT_SETTING = "github.copilot.enable";

const STATE_KEY = "click.assistanceGuard.backup.v1";

interface LanguageOverrideBackup {
  key: string;
  // The exact value previously in the `[c]` block for this key at
  // Workspace scope, or null if there was none (meaning: on restore, clear
  // the override entirely rather than writing an arbitrary value).
  hadValue: boolean;
  value: unknown;
}

interface GuardBackup {
  editorOverrides: LanguageOverrideBackup[];
  copilotEnable: { hadValue: boolean; value: unknown } | null;
}

let reentrancyGuard = false;
let configListener: vscode.Disposable | null = null;
let statusItem: vscode.StatusBarItem | null = null;

function cLanguageConfig() {
  return vscode.workspace.getConfiguration("editor", { languageId: "c" });
}

function captureBackup(): GuardBackup {
  const editorConfig = cLanguageConfig();
  const editorOverrides: LanguageOverrideBackup[] = Object.keys(RESTRICTED_EDITOR_SETTINGS).map((key) => {
    const shortKey = key.replace(/^editor\./, "");
    const inspected = editorConfig.inspect(shortKey);
    const hadValue = inspected?.workspaceLanguageValue !== undefined;
    return { key: shortKey, hadValue, value: hadValue ? inspected!.workspaceLanguageValue : null };
  });

  let copilotEnable: GuardBackup["copilotEnable"] = null;
  if (COPILOT_EXTENSION_IDS.some((id) => vscode.extensions.getExtension(id))) {
    const config = vscode.workspace.getConfiguration();
    const inspected = config.inspect(COPILOT_SETTING);
    const hadValue = inspected?.workspaceValue !== undefined;
    copilotEnable = { hadValue, value: hadValue ? inspected!.workspaceValue : null };
  }

  return { editorOverrides, copilotEnable };
}

async function applyRestrictions(): Promise<void> {
  reentrancyGuard = true;
  try {
    const editorConfig = cLanguageConfig();
    for (const [key, value] of Object.entries(RESTRICTED_EDITOR_SETTINGS)) {
      const shortKey = key.replace(/^editor\./, "");
      await editorConfig.update(shortKey, value, vscode.ConfigurationTarget.Workspace, true);
    }
    if (COPILOT_EXTENSION_IDS.some((id) => vscode.extensions.getExtension(id))) {
      const config = vscode.workspace.getConfiguration();
      const current = (config.get(COPILOT_SETTING) as Record<string, boolean> | undefined) || {};
      await config.update(COPILOT_SETTING, { ...current, c: false }, vscode.ConfigurationTarget.Workspace);
    }
  } finally {
    reentrancyGuard = false;
  }
}

async function writeBackup(context: vscode.ExtensionContext, backup: GuardBackup): Promise<void> {
  await context.workspaceState.update(STATE_KEY, backup);
}

async function restoreFromBackup(backup: GuardBackup): Promise<void> {
  reentrancyGuard = true;
  try {
    const editorConfig = cLanguageConfig();
    for (const entry of backup.editorOverrides) {
      await editorConfig.update(
        entry.key,
        entry.hadValue ? entry.value : undefined,
        vscode.ConfigurationTarget.Workspace,
        true
      );
    }
    if (backup.copilotEnable) {
      const config = vscode.workspace.getConfiguration();
      await config.update(
        COPILOT_SETTING,
        backup.copilotEnable.hadValue ? backup.copilotEnable.value : undefined,
        vscode.ConfigurationTarget.Workspace
      );
    }
  } finally {
    reentrancyGuard = false;
  }
}

/** Re-applies any restricted setting a student (or another extension) changes back while a question is active - event-driven, not polled. */
function startEnforcement(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (reentrancyGuard) return;
    const editorKeysChanged = Object.keys(RESTRICTED_EDITOR_SETTINGS).some((k) => e.affectsConfiguration(k));
    const copilotChanged = e.affectsConfiguration(COPILOT_SETTING);
    if (!editorKeysChanged && !copilotChanged) return;
    const active = context.workspaceState.get<GuardBackup>(STATE_KEY);
    if (!active) return; // guard isn't on right now - a plain settings change is none of CLICK's business
    await applyRestrictions();
  });
}

/**
 * Turns anti-assistance mode on for this workspace, if it isn't already on.
 * Safe to call every time a question opens - idempotent, and never
 * re-captures a backup over an existing one (which would otherwise corrupt
 * restoration by treating CLICK's own restricted values as "the original").
 */
export async function activateGuard(context: vscode.ExtensionContext): Promise<void> {
  const existing = context.workspaceState.get<GuardBackup>(STATE_KEY);
  if (existing) {
    // Already on (e.g. opening a second question). Just make sure a drifted
    // setting is back in the restricted state; don't touch the backup.
    await applyRestrictions();
  } else {
    const backup = captureBackup();
    await writeBackup(context, backup);
    await applyRestrictions();
  }
  if (!configListener) configListener = startEnforcement(context);
  if (!statusItem) {
    statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    statusItem.text = "$(shield) CLICK anti-assistance on";
    statusItem.tooltip = "CLICK has temporarily disabled automatic code suggestions for C files in this workspace while you solve a question.";
    context.subscriptions.push(statusItem);
  }
  statusItem.show();
}

/** Turns anti-assistance mode off and restores the exact settings CLICK found before it turned it on. */
export async function restoreGuard(context: vscode.ExtensionContext): Promise<void> {
  const backup = context.workspaceState.get<GuardBackup>(STATE_KEY);
  if (!backup) return; // wasn't on - nothing to restore, and importantly nothing to blindly reset to "enabled"
  await restoreFromBackup(backup);
  await context.workspaceState.update(STATE_KEY, undefined);
  statusItem?.hide();
}

/**
 * Crash-recovery safety net: if VS Code was killed without deactivate()
 * running (a previous session's restore never happened), a backup is still
 * sitting in workspaceState. Call this once at activate() time, before
 * anything else, so a leftover restriction from a prior crash never lingers
 * silently - it's restored immediately rather than staying applied for the
 * rest of this session too.
 */
export async function recoverFromCrashIfNeeded(context: vscode.ExtensionContext): Promise<void> {
  const backup = context.workspaceState.get<GuardBackup>(STATE_KEY);
  if (!backup) return;
  await restoreFromBackup(backup);
  await context.workspaceState.update(STATE_KEY, undefined);
}
