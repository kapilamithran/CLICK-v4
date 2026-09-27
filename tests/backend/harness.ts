// Boots the REAL supabase/functions/click-backend/index.ts on top of tests/backend/fake-supabase.ts, seeded with CLICK's real production
// content (tests/fixtures/production-content.json), and lets a test call actions exactly like the app does ({action, ...payload}).
import { db, resetDb, table } from "./fake-supabase.ts";

export { db, table };
type Row = Record<string, any>;

const fixture = JSON.parse(await Deno.readTextFile(new URL("../fixtures/production-content.json", import.meta.url)));
export const content = fixture;

let handler: ((req: Request) => Promise<Response>) | null = null;
let instance = 0;

// Each call imports a fresh copy of the function (its content/settings caches last 30 s per module instance).
export async function bootBackend() {
  Deno.env.set("SUPABASE_URL", "http://fake.supabase.local");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-key");
  Deno.env.set("ADMIN_RESET_KEY", "test-admin-key");
  (Deno as any).serve = (h: (req: Request) => Promise<Response>) => { handler = h; return { finished: Promise.resolve(), shutdown() {}, ref() {}, unref() {}, addr: {} }; };
  await import(new URL("../../supabase/functions/click-backend/index.ts?instance=" + ++instance, import.meta.url).href);
  return async function call(action: string, payload: Row = {}): Promise<Row> {
    const res = await handler!(new Request("http://fake.supabase.local/", { method: "POST", body: JSON.stringify({ action, ...payload }) }));
    return await res.json();
  };
}

// The live `prerequisites` rows are not in the repo (they were entered in the database), so tests model the rules the app's own copy
// documents: a stage needs the previous stage's chapters all tested, and each chapter needs the previous chapter's test.
function prerequisites(): Row[] {
  const rows: Row[] = [];
  const stages = [...fixture.stages].sort((a: Row, b: Row) => a.order - b.order);
  stages.forEach((s: Row, i: number) => {
    if (i > 0) rows.push({ target_id: s.stage_id, prerequisite_id: stages[i - 1].stage_id, condition: "completed", description: "Unlock this stage after the previous stage.", active: true });
    const cs = fixture.chapters.filter((c: Row) => c.stage_id === s.stage_id).sort((a: Row, b: Row) => a.order - b.order);
    cs.forEach((c: Row, j: number) => { if (j > 0) rows.push({ target_id: c.chapter_id, prerequisite_id: cs[j - 1].chapter_id, condition: "completed", description: "Complete the previous micro-chapter test first.", active: true }); });
  });
  return rows;
}

export function freshWorld(extraSettings: Record<string, string> = {}) {
  const settings = [...fixture.settings.map((s: Row) => ({ ...s })), ...Object.entries(extraSettings).map(([key, value]) => ({ key, value }))];
  resetDb({
    stages: fixture.stages.map((r: Row) => ({ active: true, ...r })),
    chapters: fixture.chapters.map((r: Row) => ({ active: true, ...r })),
    learn_content: fixture.learn_content.map((r: Row) => ({ active: true, ...r })),
    questions: fixture.questions.map((r: Row) => ({ active: true, ...r })),
    options: fixture.options.map((r: Row) => ({ active: true, ...r })),
    test_hints: fixture.test_hints.map((r: Row) => ({ active: true, ...r })),
    glossary: fixture.glossary.map((r: Row) => ({ active: true, ...r })),
    question_terms: fixture.question_terms.map((r: Row) => ({ active: true, ...r })),
    settings, prerequisites: prerequisites(),
    practice_bank: [], practice_tests: [], practice_mistakes: [], announcements: [], kabi_phrases: [],
    users: [], sessions: [], learn_progress: [], test_runs: [], attempts: [], practice_progress: [], staff_messages: [],
  });
}

export function addStudent(uid: string, patch: Row = {}) {
  const now = new Date().toISOString();
  table("users").push({
    user_id: uid, name: "Student " + uid, roll_no: uid, department: "CSE", email: uid + "@t.io", phone: "", total_xp: 0, streak: 0, hearts: 3,
    tests_completed: 0, questions_attempted: 0, correct_answers: 0, accuracy_percent: 0, stages_completed: 0, status: "active", role: "student",
    username: "u_" + uid, onboarding_completed: true, last_completed_stage: "", last_learn_stage: "", last_learn_chapter: "",
    heart_recovery_stage_id: "", heart_recovery_chapter_id: "", ...patch,
  });
  const token = "token-" + uid;
  table("sessions").push({ session_id: "S-" + uid, session_token: token, user_id: uid, login_time: now, last_seen: now, active: true });
  return token;
}

// ---- legacy-state builders: what the database looks like for students who used the old Learn -> Test flow
export function legacyLearned(uid: string, chapterId: string, when = "2026-09-01T10:00:00.000Z", times = 1) {
  const c = content.chapters.find((x: Row) => x.chapter_id === chapterId);
  table("learn_progress").push({ learn_progress_id: "LP-" + uid + "-" + chapterId, user_id: uid, stage_id: c.stage_id, chapter_id: chapterId, times_completed: times, last_completed_at: when, pages_viewed: 5, completed: true, updated_at: when });
}
export function legacyTested(uid: string, chapterId: string, xp: number, when = "2026-09-01T10:30:00.000Z") {
  const c = content.chapters.find((x: Row) => x.chapter_id === chapterId);
  table("test_runs").push({ test_run_id: "TR-" + uid + "-" + chapterId, user_id: uid, stage_id: c.stage_id, chapter_id: chapterId, started_at: when, finished_at: when, status: "completed", hearts_start: 3, hearts_end: 3, pending_xp: xp, committed_xp: xp, correct_count: 5, question_count: 5, attempt_no: 1 });
}

export const questionsOf = (chapterId: string) => content.questions.filter((q: Row) => q.chapter_id === chapterId).sort((a: Row, b: Row) => a.order - b.order);
export const correctAnswer = (questionId: string) => String(content.questions.find((q: Row) => q.question_id === questionId).answer);
export const WRONG = "definitely-not-the-answer";
