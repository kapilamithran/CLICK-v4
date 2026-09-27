// A tiny in-memory stand-in for @supabase/supabase-js, just big enough to run the REAL click-backend edge function in tests.
// tests/backend/import_map.json points the function's `https://esm.sh/@supabase/supabase-js@2` import here.
//
// It implements the query-builder calls the student-facing actions use (select/insert/update/delete + eq/in/gt/gte/lt/is/order/limit/
// single/maybeSingle, count/head) and enforces the SAME uniqueness Postgres does -- primary keys, unique(user_id, chapter_id) on
// learn_progress, and the partial unique index that makes "XP only once per chapter" atomic (migration 20260919120000).
// Anything it does not know throws loudly, so a test can never pass by silently ignoring a query.

type Row = Record<string, any>;
export const db: Record<string, Row[]> = {};

const PK: Record<string, string> = {
  users: "user_id", sessions: "session_id", learn_progress: "learn_progress_id", test_runs: "test_run_id", attempts: "attempt_id",
  stages: "stage_id", chapters: "chapter_id", questions: "question_id", options: "option_id", glossary: "term_id",
};
// [table, columns, optional predicate that limits the index to some rows]
const UNIQUES: [string, string[], ((r: Row) => boolean) | null][] = [
  ["learn_progress", ["user_id", "chapter_id"], null],
  ["test_runs", ["user_id", "chapter_id"], (r) => r.status === "completed"],
];

export function resetDb(seed: Record<string, Row[]>) {
  Object.keys(db).forEach((k) => delete db[k]);
  Object.entries(seed).forEach(([t, rows]) => (db[t] = rows.map((r) => structuredClone(r))));
}
export const table = (t: string) => (db[t] ||= []);

function violates(t: string, rows: Row[], candidate: Row, ignore?: Row): string | null {
  const pk = PK[t];
  if (pk && candidate[pk] !== undefined && rows.some((r) => r !== ignore && r[pk] === candidate[pk])) return `duplicate key value violates unique constraint "${t}_pkey"`;
  for (const [ut, cols, where] of UNIQUES) {
    if (ut !== t || (where && !where(candidate))) continue;
    if (rows.some((r) => r !== ignore && (!where || where(r)) && cols.every((c) => r[c] === candidate[c]))) return `duplicate key value violates unique constraint on ${t}(${cols.join(",")})`;
  }
  return null;
}

class Query implements PromiseLike<any> {
  private op: "select" | "insert" | "update" | "delete" = "select";
  private preds: ((r: Row) => boolean)[] = [];
  private payload: any = null;
  private head = false;
  private wantCount = false;
  private orders: { col: string; asc: boolean }[] = [];
  private max: number | null = null;
  private mode: "many" | "single" | "maybe" = "many";

  constructor(private t: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this.op === "select") { this.wantCount = opts?.count === "exact"; this.head = !!opts?.head; }
    return this;
  }
  insert(p: any) { this.op = "insert"; this.payload = p; return this; }
  update(p: any) { this.op = "update"; this.payload = p; return this; }
  delete() { this.op = "delete"; return this; }
  eq(c: string, v: any) { this.preds.push((r) => r[c] === v); return this; }
  in(c: string, vs: any[]) { this.preds.push((r) => vs.includes(r[c])); return this; }
  gt(c: string, v: any) { this.preds.push((r) => r[c] != null && r[c] > v); return this; }
  gte(c: string, v: any) { this.preds.push((r) => r[c] != null && r[c] >= v); return this; }
  lt(c: string, v: any) { this.preds.push((r) => r[c] != null && r[c] < v); return this; }
  is(c: string, v: any) { this.preds.push((r) => (v === null ? r[c] == null : r[c] === v)); return this; }
  order(c: string, o?: { ascending?: boolean }) { this.orders.push({ col: c, asc: o?.ascending !== false }); return this; }
  limit(n: number) { this.max = n; return this; }
  single() { this.mode = "single"; return this; }
  maybeSingle() { this.mode = "maybe"; return this; }
  neq() { throw new Error("fake-supabase: neq not implemented"); }
  or() { throw new Error("fake-supabase: or not implemented"); }
  not() { throw new Error("fake-supabase: not not implemented"); }
  ilike() { throw new Error("fake-supabase: ilike not implemented"); }
  lte() { throw new Error("fake-supabase: lte not implemented"); }

  private run(): { data: any; error: any; count?: number } {
    const rows = table(this.t);
    const matched = () => rows.filter((r) => this.preds.every((p) => p(r)));
    if (this.op === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const it of items) {
        const row = structuredClone(it);
        const bad = violates(this.t, rows, row);
        if (bad) return { data: null, error: { code: "23505", message: bad } };
        rows.push(row);
      }
      return { data: null, error: null };
    }
    if (this.op === "update") {
      const hit = matched();
      // apply to a copy first, so a violated unique index rolls the whole statement back (as Postgres does)
      const next = hit.map((r) => ({ r, n: { ...r, ...structuredClone(this.payload) } }));
      for (const { r, n } of next) { const bad = violates(this.t, rows, n, r); if (bad) return { data: null, error: { code: "23505", message: bad } }; }
      next.forEach(({ r, n }) => Object.assign(r, n));
      return { data: null, error: null };
    }
    if (this.op === "delete") {
      const hit = new Set(matched());
      db[this.t] = rows.filter((r) => !hit.has(r));
      return { data: null, error: null };
    }
    let out = matched();
    for (const o of [...this.orders].reverse()) out = [...out].sort((a, b) => (a[o.col] > b[o.col] ? 1 : a[o.col] < b[o.col] ? -1 : 0) * (o.asc ? 1 : -1));
    const total = out.length;
    if (this.max != null) out = out.slice(0, this.max);
    if (this.head) return { data: null, error: null, count: total };
    if (this.mode === "single") return out.length === 1 ? { data: structuredClone(out[0]), error: null } : { data: null, error: { message: "JSON object requested, multiple (or no) rows returned" } };
    if (this.mode === "maybe") return out.length > 1 ? { data: null, error: { message: "multiple rows returned" } } : { data: out[0] ? structuredClone(out[0]) : null, error: null };
    return { data: structuredClone(out), error: null, ...(this.wantCount ? { count: total } : {}) };
  }

  then<A = any, B = never>(ok?: ((v: any) => A | PromiseLike<A>) | null, bad?: ((e: any) => B | PromiseLike<B>) | null): PromiseLike<A | B> {
    // each `await` executes exactly once, in order -- like a real round trip
    return Promise.resolve().then(() => this.run()).then(ok as any, bad as any);
  }
}

export function createClient(_url: string, _key: string) {
  return { from: (t: string) => new Query(t) };
}
