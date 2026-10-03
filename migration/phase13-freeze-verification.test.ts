// Freeze-build verification (scratch tree only). Reads must work; writes must be refused; no protected row may change.
import { addStudent, bootBackend, freshWorld, table } from "./harness.ts";

const TABLES = ["users", "sessions", "test_runs", "attempts", "learn_progress", "practice_progress", "student_section_assignments", "practice_pairings", "staff_messages", "staff_sessions", "staff_users"];
const snap = () => Object.fromEntries(TABLES.map((t) => [t, JSON.stringify(table(t))]));

function eq(a: unknown, b: unknown, m: string) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": expected " + JSON.stringify(b) + " got " + JSON.stringify(a));
}

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("freeze build: reads served, writes refused, no protected row changes", async () => {
  const call = await bootBackend();
  freshWorld();
  const token = addStudent("FZ1");
  // make the session look idle for >15 min so the NORMAL build would write last_seen on any read
  const s: any = table("sessions").find((x: any) => x.user_id === "FZ1");
  s.last_seen = new Date(Date.now() - 2 * 3600e3).toISOString();
  table("practice_pairings").push({ pairing_id: "PAIRFZ", user_id: "FZ1", status: "connected", device_token_hash: await sha256Hex("device-fz"), last_seen: new Date(Date.now() - 2 * 3600e3).toISOString() });

  const before = snap();

  // ---- reads that must keep working
  const reads: [string, Record<string, unknown>][] = [
    ["session", { session_token: token }],
    ["bootstrap", { session_token: token }],
    ["practiceWebSync", { session_token: token }],
    ["practiceExtensionSync", { device_token: "device-fz" }],
  ];
  for (const [action, payload] of reads) {
    const r = await call(action, payload);
    eq(r.ok, true, action + " must still be served");
  }
  // reads must not change any row (no last_seen refresh while frozen)
  eq(snap(), before, "reads changed rows");

  // ---- writes that must be refused
  const writes = [
    "signup", "login", "logout", "completeOnboarding", "setUsername", "completeLearn", "startTest", "saveTestAnswer",
    "saveActivityAttempt", "finishTest", "createPracticePairing", "claimPracticePairing", "practicePairingStatus", "completePractice",
    "adminResetPassword", "adminUpsertStaff", "staffLogin", "staffLogout", "staffAssignSection", "staffSendMessage",
    "staffStudentMessages", "studentReplyToMessage", "studentDismissMessage", "markMessagesDelivered", "markMessagesRead",
  ];
  for (const action of writes) {
    const r = await call(action, { session_token: token, staff_session_token: "x", device_token: "device-fz", username: "x", password: "x", student_id: "FZ1", stage_id: "STG001", chapter_id: "CH0001", test_run_id: "x", question_id: "x", answer: "x", practice_id: "x", pairing_code: "x", message: "x", message_id: "x" });
    eq(r.ok, false, action + " must be refused");
    if (!String(r.error || "").includes("read-only")) throw new Error(action + " refused with an unexpected error: " + String(r.error).slice(0, 80));
  }
  // refused writes change nothing
  eq(snap(), before, "a refused write changed rows");
});
