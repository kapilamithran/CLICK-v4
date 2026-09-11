export interface PracticeTest {
  test_id?: string;
  name: string;
  input: string;
  expected_output: string;
  timeout_ms: number;
}

export interface MistakeRule {
  rule_type: "source_regex" | "compiler_regex" | string;
  pattern: string;
  message: string;
}

export interface PracticeQuestion {
  practice_id: string;
  stage_id: string;
  stage_title?: string;
  stage_no?: number | null;
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
  // Present only for Experiment 0-16 questions; null/undefined for every
  // other practice_bank row.
  difficulty?: string | null;
  marks?: number | null;
  time_limit_seconds?: number | null;
  memory_limit_mb?: number | null;
  workspace_folder?: string | null;
  experiment_number?: number | null;
  input_format?: string | null;
  output_format?: string | null;
}

export type TestOutcome = "pass" | "fail" | "timeout" | "crash";

export interface TestResultLine {
  name: string;
  outcome: TestOutcome;
  hidden: boolean;
}

export interface CheckSummary {
  practiceTitle: string;
  compileOk: boolean;
  compileError?: string;
  results: TestResultLine[];
  passCount: number;
  totalCount: number;
  allPassed: boolean;
}
