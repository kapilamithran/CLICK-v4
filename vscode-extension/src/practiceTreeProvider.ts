import * as vscode from "vscode";
import { PracticeQuestion } from "./types";

export class PracticeTreeItem extends vscode.TreeItem {
  constructor(public readonly question: PracticeQuestion, isCurrent: boolean) {
    super(question.title, vscode.TreeItemCollapsibleState.None);

    const expLabel =
      typeof question.experiment_number === "number"
        ? `Experiment ${question.experiment_number}`
        : typeof question.stage_no === "number"
        ? `Exp ${question.stage_no + 1}`
        : question.stage_id
        ? `Stage ${question.stage_id}`
        : "";
    const statusLabel = question.completed ? "Completed" : !question.available ? "Locked" : isCurrent ? "In progress" : "Available";
    this.description = expLabel ? `${expLabel} · ${statusLabel}` : statusLabel;

    if (question.completed) {
      this.iconPath = new vscode.ThemeIcon("pass-filled", new vscode.ThemeColor("testing.iconPassed"));
      this.contextValue = "completed";
    } else if (!question.available) {
      this.iconPath = new vscode.ThemeIcon("lock", new vscode.ThemeColor("disabledForeground"));
      this.contextValue = "locked";
      this.tooltip = question.lock_reason || "Locked — complete the previous requirement first.";
    } else if (isCurrent) {
      this.iconPath = new vscode.ThemeIcon("play-circle", new vscode.ThemeColor("charts.blue"));
      this.contextValue = "current";
    } else {
      this.iconPath = new vscode.ThemeIcon("circle-outline");
      this.contextValue = "available";
    }

    if (question.available || question.completed) {
      this.command = {
        command: "click.openChallengeItem",
        title: "Open Challenge",
        arguments: [question.practice_id],
      };
    }

    if (!this.tooltip) {
      this.tooltip = question.objective || question.title;
    }
  }
}

export class PracticeTreeProvider implements vscode.TreeDataProvider<PracticeTreeItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private questions: PracticeQuestion[] = [];
  private currentId: string | null = null;

  setQuestions(questions: PracticeQuestion[]): void {
    this.questions = questions;
    this._onDidChangeTreeData.fire();
  }

  setCurrent(practiceId: string | null): void {
    this.currentId = practiceId;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PracticeTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): PracticeTreeItem[] {
    return this.questions.map((q) => new PracticeTreeItem(q, q.practice_id === this.currentId));
  }
}
