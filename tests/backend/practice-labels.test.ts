// Practice S-labels: the label comes from the Practice S-number in practice_id, never from the global curriculum stage_no.
// Run by tests/backend/run.test.js (needs Deno). The end-to-end cases boot the real click-backend on the in-memory database.
import { practiceSLabel } from "../../supabase/functions/click-backend/practice-label.ts";
import { addStudent, bootBackend, freshWorld, table } from "./harness.ts";

function assertEquals(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// [practice_id, stage_id, expected Practice label]. The fixture's stage numbering is the live NEW numbering (STG007 ARRAYS is stage_no 8),
// so a label built from stage_no would read "Stage 8" / "S8" for S6.
const CASES: [string, string, string][] = [
  ["S0-C1-Q1", "STG001", "S0"], ["S1-C1-Q1", "STG002", "S1"], ["S5-C1-Q1", "STG006", "S5"],
  ["S6-C1-Q1", "STG007", "S6"], ["S7-C1-Q1", "STG008", "S7"], ["S8-C1-Q1", "STG009", "S8"], ["S9-C1-Q1", "STG010", "S9"],
];

async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function seededWorld() {
  freshWorld();
  table("prerequisites").length = 0; // no gating, so every seeded S0-S9 question is available to the student
  for (const [pid, sid] of CASES) {
    table("practice_bank").push({ practice_id: pid, stage_id: sid, title: "Title " + pid, objective: "", problem_statement: "", active: true, order: 1 });
  }
  return await bootBackend();
}

function stageNoOf(sid: string): number {
  return Number(table("stages").find((s: any) => s.stage_id === sid)?.stage_no);
}

Deno.test("practiceSLabel: S-number comes from practice_id (legacy and updated ID schemes)", () => {
  const cases: [string, string | null][] = [
    ["S0-Q1", "S0"], ["S1-Q1", "S1"], ["S5-Q6", "S5"], ["S6-Q1", "S6"], ["S7-Q1", "S7"], ["S8-Q1", "S8"], ["S9-Q7", "S9"],
    ["S0-C1-Q1", "S0"], ["S6-C1-Q1", "S6"], ["S9-C7-Q3-T2", "S9"], ["S6-C10-Q2", "S6"],
    ["PRACTICE-1", null], ["", null], ["Stage-6", null], [null as unknown as string, null],
  ];
  for (const [id, want] of cases) assertEquals(practiceSLabel(id), want, `practiceSLabel(${JSON.stringify(id)})`);
});

Deno.test("practice extension sync (normalized): S0-S9 get S-labels and stage_no stays the curriculum number", async () => {
  const call = await seededWorld();
  addStudent("PLBL1");
  table("practice_pairings").push({ pairing_id: "PAIR1", user_id: "PLBL1", status: "connected", device_token_hash: await sha256Hex("device-token"), last_seen: new Date().toISOString() });
  const res = await call("practiceExtensionSync", { device_token: "device-token" });
  assertEquals(res.ok, true, "practiceExtensionSync ok");
  for (const [pid, sid, want] of CASES) {
    const q = res.questions.find((p: any) => p.practice_id === pid);
    assertEquals(q?.practice_stage_label, want, `${pid} practice_stage_label`);
    assertEquals(q?.stage_no, stageNoOf(sid), `${pid} stage_no (curriculum, unchanged)`);
  }
});

Deno.test("practice web sync and bootstrap (raw rows): S0-S9 questions carry their S-label", async () => {
  const call = await seededWorld();
  const token = addStudent("PLBL2");
  const web = await call("practiceWebSync", { session_token: token });
  assertEquals(web.ok, true, "practiceWebSync ok");
  const boot = await call("bootstrap", { session_token: token });
  assertEquals(boot.ok, true, "bootstrap ok");
  for (const [pid, , want] of CASES) {
    assertEquals(web.practice.find((p: any) => p.practice_id === pid)?.practice_stage_label, want, `webSync ${pid} practice_stage_label`);
    assertEquals(boot.practice.find((p: any) => p.practice_id === pid)?.practice_stage_label, want, `bootstrap ${pid} practice_stage_label`);
  }
});
