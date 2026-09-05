export interface PracticeTest {
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
