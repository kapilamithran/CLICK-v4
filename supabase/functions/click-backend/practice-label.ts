// Practice labels come from the Practice S-number in practice_id (S6-C1-Q1 -> "S6"),
// never from the global curriculum stage_no. On NEW the Practice stages are numbered
// differently (STG007 ARRAYS is stage_no 8), so a stage_no label would show "Stage 8" for S6.
// Returns null for IDs that do not start with an S-number (for example legacy PRACTICE-1).
export function practiceSLabel(practiceId: unknown): string | null {
  const m = /^S(\d+)-/.exec(String(practiceId ?? "").trim());
  return m ? `S${Number(m[1])}` : null;
}
