// CLICK backend — Supabase Edge Function
// Faithful port of Code.gs (Apps Script) to Deno + Postgres.
// Same {action, ...payload} -> {ok, ...} contract as the old /exec endpoint,
// so the frontend's post() function barely has to change.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Memoizes a fetcher for `ttlMs`, shared across invocations on the same warm
// isolate. Settings/content tables are read on nearly every action but change
// rarely, so refetching them fresh every call was the dominant source of
// per-request latency under concurrent load.
function cached<T>(ttlMs: number, fetcher: () => Promise<T>): () => Promise<T> {
  let entry: { value: T; expires: number } | null = null;
  return async () => {
    if (entry && entry.expires > Date.now()) return entry.value;
    const value = await fetcher();
    entry = { value, expires: Date.now() + ttlMs };
    return value;
  };
}

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// ---------------- generic helpers ----------------

function required(obj: any, keys: string[]) {
  for (const k of keys) {
    if (obj[k] === undefined || obj[k] === null || String(obj[k]).trim() === "") {
      throw new Error("Missing required field: " + k);
    }
  }
}

function truthy(v: any): boolean {
  return v === true || String(v).toLowerCase() === "true" || v === 1 || String(v) === "1" || String(v).toLowerCase() === "yes";
}

function normalizeId(v: any): string {
  return String(v ?? "").trim().toUpperCase();
}

function normalizeBlank(s: any): string {
  // Fill in the Blank tests recall of the right word/term, not capitalization.
  return String(s).trim().replace(/\s+/g, " ").toLowerCase();
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function newId(prefix: string, len = 12): string {
  return prefix + crypto.randomUUID().replace(/-/g, "").slice(0, len).toUpperCase();
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function passwordHash(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}|${password}`);
}

function practiceTokenHash(token: string): Promise<string> {
  return sha256Hex(String(token));
}

// ---------------- C-code answer checking (same rules as Code.gs) ----------------

function canonicalC(source: any): string {
  const s = String(source).replace(/\r/g, "");
  let out = "";
  let inString = false, inChar = false, escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = i + 1 < s.length ? s[i + 1] : "";
    if (inString) {
      out += ch;
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (inChar) {
      out += ch;
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "'") inChar = false;
      continue;
    }
    if (ch === '"') { inString = true; out += ch; continue; }
    if (ch === "'") { inChar = true; out += ch; continue; }
    if (ch === "/" && next === "/") { i += 2; while (i < s.length && s[i] !== "\n") i++; continue; }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < s.length - 1 && !(s[i] === "*" && s[i + 1] === "/")) i++;
      if (i < s.length - 1) i++;
      continue;
    }
    if (/\s/.test(ch)) continue;
    out += ch;
  }
  return out;
}

function isAnswerCorrect(q: any, answer: string): boolean {
  const type = String(q.type || "MCQ").toUpperCase();
  const expected = String(q.answer || "").trim();
  const actual = String(answer || "").trim();
  if (type === "TRUE_FALSE") return expected.toLowerCase() === actual.toLowerCase();
  if (type === "TYPE_CODE") return canonicalC(expected) === canonicalC(actual);
  if (type === "CODE_FILL") {
    const parse = (raw: string): string[] => {
      const text = String(raw || "").trim();
      if (!text) return [];
      try {
        const value = JSON.parse(text);
        if (Array.isArray(value)) return value.map((x: any) => String(x ?? ""));
      } catch (_) {}
      return text.split("|||").map((x: string) => String(x));
    };
    const exp = parse(expected), act = parse(actual);
    return exp.length === act.length && exp.every((v, i) => canonicalC(v) === canonicalC(act[i]));
  }
  if (type === "ORDER") return expected.replace(/\s+/g, "") === actual.replace(/\s+/g, "");
  if (type === "BLANK") return normalizeBlank(expected) === normalizeBlank(actual);
  if (type === "MATCH_FOLLOWING") {
    const parsePairs = (raw: string) => new Set(raw.split(",").map((p) => p.trim()).filter(Boolean));
    const exp = parsePairs(expected), act = parsePairs(actual);
    return exp.size > 0 && exp.size === act.size && [...exp].every((p) => act.has(p));
  }
  // Choice text can span lines (predict-the-output options) and browsers store CRLF as LF inside HTML attributes, so a submitted answer
  // may differ from the stored text only in line endings. Compare them loosely, or such an option could never be marked correct.
  return expected.split("\r\n").join("\n") === actual.split("\r\n").join("\n");
}

// ---------------- settings ----------------

const settingsMap = cached(30_000, async (): Promise<Record<string, string>> => {
  const { data } = await supabase.from("settings").select("key,value");
  const map: Record<string, string> = {};
  (data || []).forEach((r: any) => (map[r.key] = r.value));
  return map;
});

function defaultHearts(settings: Record<string, string>): number {
  return Number(settings.DEFAULT_HEARTS || 3);
}

function publicSettings(s: Record<string, string>) {
  return {
    APP_NAME: s.APP_NAME || "CLICK",
    TAGLINE: s.TAGLINE || "click → learn → practice",
    DEFAULT_HEARTS: Number(s.DEFAULT_HEARTS || 3),
    CHARACTER_NAME: s.CHARACTER_NAME || "Kabi",
  };
}

// ---------------- sessions ----------------

async function createSession(user: any, device: string) {
  const row = {
    session_id: newId("S"),
    session_token: crypto.randomUUID() + crypto.randomUUID(),
    user_id: user.user_id,
    login_time: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    device,
    active: true,
  };
  const { error } = await supabase.from("sessions").insert(row);
  if (error) throw new Error(error.message);
  return row;
}

async function requireSession(token: string, settings: Record<string, string>) {
  const { data: s } = await supabase.from("sessions").select("*").eq("session_token", token).eq("active", true).maybeSingle();
  if (!s) throw new Error("Session expired. Please log in again.");
  const hours = Number(settings.SESSION_HOURS || 168);
  const last = new Date(s.last_seen || s.login_time).getTime();
  if (isNaN(last) || Date.now() - last > hours * 3600000) {
    await supabase.from("sessions").update({ active: false }).eq("session_id", s.session_id);
    throw new Error("Session expired. Please log in again.");
  }
  if (Date.now() - last > 15 * 60 * 1000) {
    await supabase.from("sessions").update({ last_seen: new Date().toISOString() }).eq("session_id", s.session_id);
  }
  return s;
}

function safeUser(u: any) {
  if (!u) return null;
  return {
    user_id: u.user_id, name: u.name, roll_no: u.roll_no, department: u.department,
    email: u.email, phone: u.phone, total_xp: Number(u.total_xp || 0), streak: Number(u.streak || 0),
    hearts: Number(u.hearts || 0), tests_completed: Number(u.tests_completed || 0),
    questions_attempted: Number(u.questions_attempted || 0), correct_answers: Number(u.correct_answers || 0),
    accuracy_percent: Number(u.accuracy_percent || 0), onboarding_completed: truthy(u.onboarding_completed),
    stages_completed: Number(u.stages_completed || 0), last_completed_stage: u.last_completed_stage || "",
    last_learn_stage: u.last_learn_stage || "", last_learn_chapter: u.last_learn_chapter || "",
    heart_recovery_stage_id: u.heart_recovery_stage_id || "", heart_recovery_chapter_id: u.heart_recovery_chapter_id || "",
    role: u.role || "student", username: u.username || "",
  };
}

async function setUsername(b: any) {
  required(b, ["session_token", "username"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const username = String(b.username).trim();
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    throw new Error("Username must be 3-20 characters: letters, numbers, and underscores only.");
  }
  const { data: existing } = await supabase.from("users").select("user_id").ilike("username", username).maybeSingle();
  if (existing && existing.user_id !== s.user_id) {
    throw new Error("That username is already taken. Try a different one.");
  }
  const { error } = await supabase.from("users").update({ username }).eq("user_id", s.user_id);
  if (error) {
    if ((error as any).code === "23505") throw new Error("That username is already taken. Try a different one.");
    throw new Error(error.message);
  }
  const { data: user } = await supabase.from("users").select("*").eq("user_id", s.user_id).single();
  return { ok: true, user: safeUser(user) };
}

// ---------------- accounts ----------------

async function signup(b: any) {
  required(b, ["name", "roll_no", "department", "email", "phone", "password", "section_code"]);
  const settings = await settingsMap();
  const minLen = Number(settings.MIN_PASSWORD_LENGTH || 6);
  if (String(b.password).length < minLen) throw new Error(`Password must be at least ${minLen} characters.`);

  const email = String(b.email).trim().toLowerCase();
  if (!email.endsWith(".aids@rajalakshmi.edu.in")) {
    throw new Error("Signups are currently limited to AI&DS department students -- use your official .aids@rajalakshmi.edu.in email.");
  }
  const roll = String(b.roll_no).trim();

  // Section is never trusted from the client beyond which one was requested --
  // it's resolved against the real `sections` table (the same source of
  // truth staffAssignSection uses), and capacity is enforced with the exact
  // same check, before any account is created.
  const sectionCode = String(b.section_code || "").trim().toUpperCase();
  if (!sectionCode) throw new Error("Please select your section.");
  const { data: section } = await supabase.from("sections").select("*").eq("section_code", sectionCode).eq("active", true).maybeSingle();
  if (!section) throw new Error("Please select a valid section.");
  const { count: sectionCount } = await supabase.from("student_section_assignments").select("assignment_id", { count: "exact", head: true }).eq("section_id", section.section_id).eq("active", true);
  if (Number(sectionCount || 0) >= Number(section.capacity || 0)) {
    throw new Error(`${section.section_name} is currently full. Please choose a different section.`);
  }

  const { data: existingEmail } = await supabase.from("users").select("user_id").ilike("email", email).maybeSingle();
  if (existingEmail) throw new Error("An account with this email already exists.");
  const { data: existingRoll } = await supabase.from("users").select("user_id").ilike("roll_no", roll).maybeSingle();
  if (existingRoll) throw new Error("An account with this roll number already exists.");

  const salt = crypto.randomUUID().replace(/-/g, "");
  const id = newId("U");
  const now = new Date().toISOString();
  const hash = await passwordHash(String(b.password), salt);

  const row = {
    user_id: id, name: String(b.name).trim(), roll_no: roll, department: String(b.department).trim(),
    email, phone: String(b.phone).trim(), password_hash: hash, password_salt: salt,
    joined_at: now, last_login: now, total_xp: 0, streak: 0, current_stage: "STG000", current_chapter: "",
    hearts: defaultHearts(settings), tests_completed: 0, questions_attempted: 0, correct_answers: 0,
    accuracy_percent: 0, onboarding_completed: false, status: "active", stages_completed: 0,
    last_completed_stage: "", last_learn_stage: "", last_learn_chapter: "",
    heart_recovery_stage_id: "", heart_recovery_chapter_id: "", role: "student",
  };
  const { data: inserted, error } = await supabase.from("users").insert(row).select().single();
  if (error) {
    if ((error as any).code === "23505") throw new Error("An account with this email or roll number already exists.");
    throw new Error(error.message);
  }

  const { error: assignError } = await supabase.from("student_section_assignments").insert({
    assignment_id: newId("ASG"), student_id: id, section_id: section.section_id, active: true,
  });
  if (assignError) throw new Error(assignError.message);

  const session = await createSession(inserted, "signup");
  return { ok: true, user: safeUser(inserted), session_token: session.session_token, new_user: true };
}

async function login(b: any) {
  required(b, ["email", "password"]);
  const email = String(b.email).trim().toLowerCase();
  const { data: user } = await supabase.from("users").select("*").ilike("email", email).maybeSingle();
  if (!user || String(user.status || "active").toLowerCase() !== "active") throw new Error("Incorrect email or password.");
  const hash = await passwordHash(String(b.password), String(user.password_salt));
  if (hash !== String(user.password_hash)) throw new Error("Incorrect email or password.");
  await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("user_id", user.user_id);
  const session = await createSession(user, "login");
  return { ok: true, user: safeUser(user), session_token: session.session_token, new_user: false };
}

async function sessionInfo(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const { data: user } = await supabase.from("users").select("*").eq("user_id", s.user_id).single();
  if (!user) throw new Error("User not found.");
  return { ok: true, user: safeUser(user) };
}

async function logout(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const now = new Date();
  const login = new Date(s.login_time);
  await supabase.from("sessions").update({
    active: false, last_seen: now.toISOString(), logout_time: now.toISOString(),
    duration_sec: isNaN(login.getTime()) ? null : Math.max(0, Math.round((now.getTime() - login.getTime()) / 1000)),
  }).eq("session_id", s.session_id);
  await supabase.from("users").update({ last_logout: now.toISOString() }).eq("user_id", s.user_id);
  return { ok: true };
}

async function adminGetMaxIds(b: any) {
  required(b, ["admin_key"]);
  const expectedKey = Deno.env.get("ADMIN_RESET_KEY");
  if (!expectedKey || String(b.admin_key) !== expectedKey) throw new Error("Not authorized.");

  const tables: Record<string, string> = {
    stages: "stage_id", chapters: "chapter_id", learn_content: "learn_id",
    questions: "question_id", options: "option_id", test_hints: "hint_id",
    glossary: "term_id", practice_bank: "practice_id", practice_tests: "test_id",
    practice_mistakes: "mistake_id",
  };
  const result: Record<string, string | null> = {};
  for (const [table, col] of Object.entries(tables)) {
    const { data } = await supabase.from(table).select(col).order(col, { ascending: false }).limit(1);
    result[table] = (data && data[0] && (data[0] as any)[col]) || null;
  }

  const { data: glossaryRows } = await supabase.from("glossary").select("term_id,term");
  const { data: stageRows } = await supabase.from("stages").select("stage_id,stage_no,title,order").order("stage_no", { ascending: true });

  return { ok: true, max_ids: result, glossary: glossaryRows || [], stages: stageRows || [] };
}

async function adminResetPassword(b: any) {
  required(b, ["admin_key", "identifier", "new_password"]);
  const expectedKey = Deno.env.get("ADMIN_RESET_KEY");
  if (!expectedKey || String(b.admin_key) !== expectedKey) throw new Error("Not authorized.");

  const settings = await settingsMap();
  const minLen = Number(settings.MIN_PASSWORD_LENGTH || 6);
  if (String(b.new_password).length < minLen) throw new Error(`Password must be at least ${minLen} characters.`);

  const identifier = String(b.identifier).trim();
  const { data: user } = await supabase.from("users").select("user_id,name,email,roll_no")
    .or(`email.ilike.${identifier},roll_no.ilike.${identifier}`).maybeSingle();
  if (!user) throw new Error("No account found with that email or roll number.");

  const salt = crypto.randomUUID().replace(/-/g, "");
  const hash = await passwordHash(String(b.new_password), salt);
  const { error } = await supabase.from("users").update({ password_hash: hash, password_salt: salt }).eq("user_id", user.user_id);
  if (error) throw new Error(error.message);

  await supabase.from("sessions").update({ active: false }).eq("user_id", user.user_id).eq("active", true);

  return { ok: true, user: { name: user.name, email: user.email, roll_no: user.roll_no } };
}

async function completeOnboarding(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  await supabase.from("users").update({ onboarding_completed: true }).eq("user_id", s.user_id);
  const { data: user } = await supabase.from("users").select("*").eq("user_id", s.user_id).single();
  return { ok: true, user: safeUser(user) };
}

// ---------------- content ----------------

const publicContent = cached(30_000, async () => {
  const [stagesR, chaptersR, learnR, practiceR, practiceTestsR, practiceMistakesR, annR, phrasesR, prereqR] = await Promise.all([
    supabase.from("stages").select("*").eq("active", true),
    supabase.from("chapters").select("*").eq("active", true),
    supabase.from("learn_content").select("*").eq("active", true),
    supabase.from("practice_bank").select("*").eq("active", true),
    supabase.from("practice_tests").select("*").eq("active", true),
    supabase.from("practice_mistakes").select("*").eq("active", true),
    supabase.from("announcements").select("*").eq("active", true),
    supabase.from("kabi_phrases").select("*").eq("active", true),
    supabase.from("prerequisites").select("*").eq("active", true),
  ]);
  const stages = (stagesR.data || []).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0));
  const stageOrder: Record<string, number> = {};
  stages.forEach((st: any, i: number) => (stageOrder[normalizeId(st.stage_id)] = Number(st.order ?? i)));
  const chapters = (chaptersR.data || []).sort((a: any, b: any) =>
    (Number(stageOrder[normalizeId(a.stage_id)] || 0) - Number(stageOrder[normalizeId(b.stage_id)] || 0)) ||
    (Number(a.order || 0) - Number(b.order || 0))
  );
  const practice = (practiceR.data || []).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0));
  return {
    stages, chapters,
    learn_content: learnR.data || [],
    practice,
    practice_tests: practiceTestsR.data || [],
    practice_mistakes: practiceMistakesR.data || [],
    announcements: annR.data || [],
    phrases: phrasesR.data || [],
    prerequisites: prereqR.data || [],
  };
});

const testContent = cached(30_000, async () => {
  const [qR, oR, hR, gR, qtR] = await Promise.all([
    supabase.from("questions").select("*").eq("active", true),
    supabase.from("options").select("*").eq("active", true),
    supabase.from("test_hints").select("*").eq("active", true),
    supabase.from("glossary").select("*").eq("active", true),
    supabase.from("question_terms").select("*").eq("active", true),
  ]);
  return {
    questions: qR.data || [], options: oR.data || [], hints: hR.data || [],
    glossary: gR.data || [], question_terms: qtR.data || [],
  };
});

async function prerequisiteFacts(uid: string, content: any) {
  const [lpR, trR, ppR] = await Promise.all([
    supabase.from("learn_progress").select("*").eq("user_id", uid),
    supabase.from("test_runs").select("*").eq("user_id", uid),
    supabase.from("practice_progress").select("practice_id").eq("user_id", uid).eq("status", "completed"),
  ]);
  const learnRows = lpR.data || [];
  const allRuns = trR.data || [];
  const completedRuns = allRuns.filter((r: any) => r.status === "completed");
  const failedRuns = allRuns.filter((r: any) => r.status === "failed");
  const completedChapterIds = new Set(completedRuns.map((r: any) => normalizeId(r.chapter_id)));
  const learnedChapterIds = new Set(learnRows.filter((r: any) => truthy(r.completed)).map((r: any) => normalizeId(r.chapter_id)));
  const stageCompleteIds = new Set<string>();
  content.stages.forEach((st: any) => {
    const cs = content.chapters.filter((c: any) => String(c.stage_id) === String(st.stage_id));
    if (cs.length && cs.every((c: any) => completedChapterIds.has(normalizeId(c.chapter_id)))) {
      stageCompleteIds.add(normalizeId(st.stage_id));
    }
  });
  const practiceCompletedIds = new Set((ppR.data || []).map((r: any) => normalizeId(r.practice_id)));
  return { learnRows, completedRuns, failedRuns, completedChapterIds, learnedChapterIds, stageCompleteIds, practiceCompletedIds };
}

function prerequisiteStatus(targetType: string, targetStageId: string, targetChapterId: string, content: any, facts: any) {
  const targetId = targetType.toUpperCase() === "STAGE" ? normalizeId(targetStageId) : normalizeId(targetChapterId);
  const rules = (content.prerequisites || []).filter((r: any) =>
    (r.active === undefined || r.active === null || truthy(r.active)) && normalizeId(r.target_id) === targetId
  );
  for (const rule of rules) {
    const prerequisiteId = normalizeId(rule.prerequisite_id);
    const condition = String(rule.condition || "completed").trim().toLowerCase();
    let met = false;
    if (prerequisiteId.indexOf("STG") === 0) met = facts.stageCompleteIds.has(prerequisiteId);
    else if (prerequisiteId.indexOf("CH") === 0) {
      met = condition === "learned" ? facts.learnedChapterIds.has(prerequisiteId) : facts.completedChapterIds.has(prerequisiteId);
    } else if (/^P\d+/i.test(prerequisiteId) || prerequisiteId.indexOf("PRACTICE") === 0) {
      met = facts.practiceCompletedIds.has(prerequisiteId);
    }
    if (!met) return { unlocked: false, lock_reason: String(rule.description || `Complete ${prerequisiteId} first.`) };
  }
  return { unlocked: true, lock_reason: "" };
}

async function leaderboard() {
  const { data } = await supabase.from("users").select("name,username,roll_no,department,total_xp,stages_completed,accuracy_percent").eq("status", "active");
  return (data || []).map((u: any) => ({
    name: u.username || u.name, roll_no: u.roll_no, department: u.department, total_xp: Number(u.total_xp || 0),
    stages_completed: Number(u.stages_completed || 0), accuracy_percent: Number(u.accuracy_percent || 0),
  })).sort((a: any, b: any) => b.total_xp - a.total_xp || b.stages_completed - a.stages_completed).slice(0, 100);
}

async function recoveryChapterTitle(user: any) {
  const cid = String(user.heart_recovery_chapter_id || "");
  if (!cid) return "the chapter where the last heart was lost";
  const { data: c } = await supabase.from("chapters").select("title").eq("chapter_id", cid).maybeSingle();
  return c ? String(c.title) : cid;
}

// Every chapter where the student currently owes heart recovery -- a
// heart-losing test attempt in that chapter that hasn't yet been resolved by
// completing that same chapter's Learn content since. A student can lose
// hearts in more than one chapter before recovering any of them (e.g. one in
// chapter A, then another in chapter B); each chapter's debt is independent,
// so this returns all of them, not just the most recent. `completeLearn`
// already restores exactly this per-chapter amount -- this helper exists so
// the UI can tell the student every chapter they still need to revisit,
// instead of only the single most-recent one (see `heart_recovery_chapter_id`,
// which only ever remembers one and is kept only for the legacy "no hearts
// left" error message below).
async function outstandingHeartRecoveryChapters(uid: string): Promise<{ stage_id: string; chapter_id: string }[]> {
  const { data: lossRows } = await supabase.from("attempts").select("stage_id,chapter_id,attempted_at,hearts_before,hearts_after").eq("user_id", uid);
  const losses = (lossRows || []).filter((a: any) => Number(a.hearts_after) < Number(a.hearts_before));
  if (!losses.length) return [];
  const chapterIds = [...new Set(losses.map((l: any) => normalizeId(l.chapter_id)))];
  const { data: lpRows } = await supabase.from("learn_progress").select("chapter_id,last_completed_at").eq("user_id", uid).in("chapter_id", chapterIds);
  const lastCompletedByChapter = new Map((lpRows || []).map((r: any) => [normalizeId(r.chapter_id), r.last_completed_at]));
  const outstanding: { stage_id: string; chapter_id: string }[] = [];
  for (const cid of chapterIds) {
    const sinceMs = lastCompletedByChapter.get(cid) ? new Date(lastCompletedByChapter.get(cid)).getTime() : null;
    const hasOutstanding = losses.some((l: any) => normalizeId(l.chapter_id) === cid && (sinceMs === null || new Date(l.attempted_at).getTime() > sinceMs));
    if (hasOutstanding) {
      const stageId = losses.find((l: any) => normalizeId(l.chapter_id) === cid)?.stage_id || "";
      outstanding.push({ stage_id: String(stageId), chapter_id: cid });
    }
  }
  return outstanding;
}

// ---------------- bootstrap / progress ----------------

async function bootstrap(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;
  const { data: user } = await supabase.from("users").select("*").eq("user_id", uid).single();
  if (!user) throw new Error("User not found.");

  const content = await publicContent();
  const facts = await prerequisiteFacts(uid, content);

  const chapterProgress = content.chapters.map((ch: any) => {
    const learn = facts.learnRows.find((r: any) => String(r.chapter_id) === String(ch.chapter_id) && truthy(r.completed));
    const done = facts.completedRuns.filter((r: any) => String(r.chapter_id) === String(ch.chapter_id));
    const failed = facts.failedRuns.filter((r: any) => String(r.chapter_id) === String(ch.chapter_id));
    const stageGate = prerequisiteStatus("STAGE", ch.stage_id, "", content, facts);
    const chapterGate = prerequisiteStatus("CHAPTER", ch.stage_id, ch.chapter_id, content, facts);
    const unlocked = stageGate.unlocked && chapterGate.unlocked;
    return {
      chapter_id: ch.chapter_id, stage_id: ch.stage_id,
      learn_completed: !!learn, learn_times: Number(learn?.times_completed || 0),
      test_completed: done.length > 0,
      best_xp: done.reduce((m: number, x: any) => Math.max(m, Number(x.committed_xp || 0)), 0),
      failed_attempts: failed.length, unlocked,
      lock_reason: unlocked ? "" : (stageGate.lock_reason || chapterGate.lock_reason),
    };
  });

  const stageProgress = content.stages.map((st: any) => {
    const cs = content.chapters.filter((c: any) => String(c.stage_id) === String(st.stage_id));
    const done = cs.filter((c: any) => chapterProgress.find((p: any) => p.chapter_id === c.chapter_id)?.test_completed).length;
    const learned = cs.filter((c: any) => chapterProgress.find((p: any) => p.chapter_id === c.chapter_id)?.learn_completed).length;
    const total = cs.length;
    const gate = prerequisiteStatus("STAGE", st.stage_id, "", content, facts);
    return {
      stage_id: st.stage_id, learned_chapters: learned, completed_chapters: done, total_chapters: total,
      progress_percent: total ? Math.round((done * 100) / total) : 0,
      test_completed: total > 0 && done === total,
      best_xp: cs.reduce((sum: number, c: any) => sum + Number(chapterProgress.find((p: any) => p.chapter_id === c.chapter_id)?.best_xp || 0), 0),
      unlocked: gate.unlocked, lock_reason: gate.lock_reason || "",
    };
  });

  const { data: ppRows } = await supabase.from("practice_progress").select("*").eq("user_id", uid);
  const practiceProgress = (ppRows || []).map((r: any) => ({
    practice_id: String(r.practice_id || ""), stage_id: String(r.stage_id || ""), status: String(r.status || ""),
    attempt_count: Number(r.attempt_count || 0), completed_at: r.completed_at || "",
  }));

  const practiceRows = content.practice.map((r: any, i: number) => {
    const pid = String(r.practice_id || `PRACTICE-${i + 1}`);
    const gate = prerequisiteStatus("PRACTICE", r.stage_id, pid, content, facts);
    return { ...r, unlocked: gate.unlocked, lock_reason: gate.lock_reason || "" };
  });

  // Per-student targeted messages from staff (the "Notify" feature). Kept
  // separate from the global `announcements` table -- see the staff_messages
  // migration for why -- and merged into the Announcements tab client-side.
  const { data: staffMsgRows } = await supabase.from("staff_messages").select("message_id,message,sent_at,delivered_at,read_at,reply,replied_at").eq("student_id", uid).is("dismissed_at", null).order("sent_at", { ascending: false }).limit(50);
  const staffMessages = staffMsgRows || [];
  const pendingMessageIds = staffMessages.filter((m: any) => !m.delivered_at).map((m: any) => m.message_id);

  const chapterTitleById = new Map(content.chapters.map((c: any) => [normalizeId(c.chapter_id), c.title]));
  const heartRecoveryChapters = (await outstandingHeartRecoveryChapters(uid)).map((o) => ({
    stage_id: o.stage_id, chapter_id: o.chapter_id, title: chapterTitleById.get(o.chapter_id) || o.chapter_id,
  }));

  return {
    ok: true, user: safeUser(user), stages: content.stages, chapters: content.chapters,
    learn_content: content.learn_content, practice: practiceRows,
    announcements: content.announcements, phrases: content.phrases, prerequisites: content.prerequisites,
    stage_progress: stageProgress, chapter_progress: chapterProgress, practice_progress: practiceProgress,
    leaderboard: await leaderboard(), settings: publicSettings(settings),
    staff_messages: staffMessages, pending_message_ids: pendingMessageIds,
    unread_message_count: staffMessages.filter((m: any) => !m.read_at).length,
    heart_recovery_chapters: heartRecoveryChapters,
  };
}

async function preloadTestData(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  await requireSession(b.session_token, settings);
  const bank = await testContent();

  const optionsByQuestion: Record<string, any[]> = {};
  (bank.options || []).forEach((o: any) => {
    const qid = normalizeId(o.question_id);
    (optionsByQuestion[qid] ||= []).push(o);
  });
  Object.keys(optionsByQuestion).forEach((qid) => optionsByQuestion[qid].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)));

  const hintByQuestion: Record<string, string> = {};
  [...(bank.hints || [])].sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0)).forEach((h: any) => {
    const qid = normalizeId(h.question_id);
    if (!hintByQuestion[qid]) hintByQuestion[qid] = String(h.hint_text || "");
  });

  const glossaryById: Record<string, any> = {};
  (bank.glossary || []).forEach((g: any) => (glossaryById[normalizeId(g.term_id)] = g));
  const termsByQuestion: Record<string, any[]> = {};
  [...(bank.question_terms || [])].sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0)).forEach((m: any) => {
    const qid = normalizeId(m.question_id);
    const g = glossaryById[normalizeId(m.term_id)];
    if (!g) return;
    (termsByQuestion[qid] ||= []).push({
      term_id: String(g.term_id || m.term_id || ""), display_text: String(m.display_text || g.term || ""),
      term: String(g.term || m.display_text || ""), definition: String(g.definition || ""), color: String(g.color || "#5867d8"),
    });
  });

  const questions = (bank.questions || []).map((q: any) => {
    const qid = normalizeId(q.question_id);
    return {
      question_id: q.question_id, stage_id: q.stage_id, chapter_id: q.chapter_id, type: String(q.type || "MCQ").toUpperCase(),
      prompt: String(q.prompt || ""), code: String(q.code || ""), answer: String(q.answer || ""), explanation: String(q.explanation || ""),
      hint: String(hintByQuestion[qid] || ""), terms: termsByQuestion[qid] || [],
      xp: Math.min(2, Math.max(1, Number(q.xp || 1))), order: Number(q.order || 0),
      options: (optionsByQuestion[qid] || []).map((o: any) => ({
        option_id: o.option_id, text: String(o.option_text || ""), value: String(o.option_text || ""), order: Number(o.order || 0),
      })),
    };
  });

  return { ok: true, cached_at: new Date().toISOString(), questions };
}

// ---------------- learn / heart recovery ----------------

async function completeLearn(b: any) {
  required(b, ["session_token", "stage_id", "chapter_id"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;
  const sid = String(b.stage_id), cid = String(b.chapter_id);
  const now = new Date().toISOString();

  const { data: chapter } = await supabase.from("chapters").select("*").eq("stage_id", sid).eq("chapter_id", cid).eq("active", true).maybeSingle();
  if (!chapter) throw new Error("Chapter not found.");

  const content = await publicContent();
  const facts = await prerequisiteFacts(uid, content);
  const stageGate = prerequisiteStatus("STAGE", sid, "", content, facts);
  const chapterGate = prerequisiteStatus("CHAPTER", sid, cid, content, facts);
  if (!stageGate.unlocked) throw new Error(stageGate.lock_reason);
  if (!chapterGate.unlocked) throw new Error(chapterGate.lock_reason);

  const { data: existing } = await supabase.from("learn_progress").select("*").eq("user_id", uid).eq("chapter_id", cid).maybeSingle();
  const times = Number(existing?.times_completed || 0) + 1;
  const patch = { user_id: uid, stage_id: sid, chapter_id: cid, times_completed: times, last_completed_at: now, pages_viewed: Number(b.pages_viewed || 0), completed: true, updated_at: now };

  if (existing) {
    await supabase.from("learn_progress").update(patch).eq("user_id", uid).eq("chapter_id", cid);
  } else {
    await supabase.from("learn_progress").insert({ learn_progress_id: newId("LP"), ...patch });
  }

  const { data: user } = await supabase.from("users").select("*").eq("user_id", uid).single();

  // A heart loss is attributed to the chapter whose test produced it (each
  // `attempts` row already carries chapter_id + hearts_before/hearts_after).
  // "Outstanding" means lost since the last time THIS chapter's Learn was
  // completed (or ever, on a first completion) -- so completing chapter B
  // can only ever resolve losses caused by chapter B, never one caused by a
  // different chapter, and re-completing the same chapter with no new test
  // attempts in between finds nothing new to restore.
  const sinceIso = existing?.last_completed_at || null;
  let lossQuery = supabase.from("attempts").select("hearts_before,hearts_after").eq("user_id", uid).eq("chapter_id", cid);
  if (sinceIso) lossQuery = lossQuery.gt("attempted_at", sinceIso);
  const { data: chapterAttempts } = await lossQuery;
  const outstandingLossCount = (chapterAttempts || []).filter((a: any) => Number(a.hearts_after) < Number(a.hearts_before)).length;

  const maxHearts = defaultHearts(settings);
  const heartsBefore = Number(user.hearts || 0);
  const restoreCount = Math.max(0, Math.min(outstandingLossCount, maxHearts - heartsBefore));
  const refilled = restoreCount > 0;
  const heartsAfter = heartsBefore + restoreCount;

  const userPatch: any = { last_learn_stage: sid, last_learn_chapter: cid, current_stage: sid, current_chapter: cid };
  if (refilled) {
    userPatch.hearts = heartsAfter;
    // heart_recovery_chapter_id only ever names the single most-recent
    // loss (used for the "no hearts left" message), so only clear it when
    // it was pointing at the chapter this completion just resolved.
    if (String(user.heart_recovery_chapter_id || "") === cid) {
      userPatch.heart_recovery_stage_id = "";
      userPatch.heart_recovery_chapter_id = "";
    }
  }
  await supabase.from("users").update(userPatch).eq("user_id", uid);

  const appState = await bootstrap({ session_token: b.session_token });
  return {
    ok: true, chapter_id: cid, times_completed: times, refilled,
    hearts: heartsAfter,
    message: refilled ? "Chapter review complete. Your hearts were refilled." : (truthy(b.unified) ? "Chapter review complete." : "Chapter Learn complete. Take its test when you are ready."),
    app_state: appState,
  };
}

// ---------------- chapter tests ----------------

async function startTest(b: any) {
  required(b, ["session_token", "stage_id", "chapter_id"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;
  const sid = String(b.stage_id), cid = String(b.chapter_id);

  const { data: user } = await supabase.from("users").select("*").eq("user_id", uid).single();
  if (!user) throw new Error("User not found.");
  if (Number(user.hearts || 0) <= 0) {
    const owed = await outstandingHeartRecoveryChapters(uid);
    const content = await publicContent();
    const chapterTitleById = new Map(content.chapters.map((c: any) => [normalizeId(c.chapter_id), c.title]));
    const titles = owed.map((o) => chapterTitleById.get(o.chapter_id) || o.chapter_id);
    const where = titles.length ? titles.join(", ") : await recoveryChapterTitle(user);
    throw new Error(`No hearts left. Review ${titles.length > 1 ? "these chapters" : "the chapter"} where the hearts were lost: ${where}.`);
  }

  const { data: chapter } = await supabase.from("chapters").select("*").eq("stage_id", sid).eq("chapter_id", cid).eq("active", true).maybeSingle();
  if (!chapter) throw new Error("Chapter not found.");

  // A unified chapter run (slides = learning + the chapter's questions) is its own lesson, so it does not require a separate Learn first.
  // Every other caller keeps the original rule (e.g. a browser tab still running an older version of the app).
  const unified = truthy(b.unified);
  if (!unified) {
    const { data: learnedRows } = await supabase.from("learn_progress").select("completed").eq("user_id", uid).eq("chapter_id", cid).eq("completed", true).limit(1);
    if (!learnedRows || !learnedRows.length) throw new Error("Complete this chapter in Learn before taking its test.");
  }

  const content = await publicContent();
  const facts = await prerequisiteFacts(uid, content);
  const stageGate = prerequisiteStatus("STAGE", sid, "", content, facts);
  const chapterGate = prerequisiteStatus("CHAPTER", sid, cid, content, facts);
  if (!stageGate.unlocked) throw new Error(stageGate.lock_reason);
  if (!chapterGate.unlocked) throw new Error(chapterGate.lock_reason);

  const testBank = await testContent();
  let pool = testBank.questions.filter((q: any) => normalizeId(q.stage_id) === normalizeId(sid) && normalizeId(q.chapter_id) === normalizeId(cid));
  if (!pool.length) throw new Error("No active questions found for this chapter.");

  let count = Math.max(1, Number(chapter.question_limit || settings.QUESTIONS_PER_CHAPTER || 5));
  // A unified chapter is 5-10 slides, so it serves at most UNIFIED_MAX_QUESTIONS graded questions (default 8; the `settings` table can
  // change it without a deploy). Only chapters with more questions than that are affected -- today just CH0035 (15). The cap is decided
  // here, never by the client, and per-question XP is untouched.
  if (unified) count = Math.min(count, Math.max(1, Number(settings.UNIFIED_MAX_QUESTIONS || 8)));
  pool = pool.sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0));
  const selected = pool.slice(0, count);

  const runId = newId("TR", 14);
  const { count: attemptCount } = await supabase.from("test_runs").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("chapter_id", cid);
  const attemptNo = (attemptCount || 0) + 1;

  await supabase.from("test_runs").insert({
    test_run_id: runId, user_id: uid, stage_id: sid, chapter_id: cid,
    started_at: new Date().toISOString(), status: "active",
    hearts_start: Number(user.hearts), hearts_end: Number(user.hearts),
    pending_xp: 0, committed_xp: 0, correct_count: 0, question_count: selected.length, attempt_no: attemptNo,
  });

  const allOptions = testBank.options;
  const allHints = testBank.hints || [];
  const questions = selected.map((q: any) => {
    let opts = allOptions.filter((o: any) => String(o.question_id) === String(q.question_id))
      .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
      .map((o: any) => ({ option_id: o.option_id, text: o.option_text, value: o.option_text }));
    if (String(q.type || "").toUpperCase() === "ORDER" || opts.length > 1) opts = shuffle(opts.slice());
    const hintRow = allHints.filter((h: any) => normalizeId(h.question_id) === normalizeId(q.question_id)).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))[0];
    return {
      question_id: q.question_id, type: String(q.type || "MCQ").toUpperCase(), prompt: q.prompt || "", code: q.code || "",
      hint: hintRow ? String(hintRow.hint_text || "") : "", answer: String(q.answer || ""), explanation: String(q.explanation || ""),
      xp: Math.min(2, Math.max(1, Number(q.xp || 1))), options: opts,
    };
  });

  return { ok: true, test_run_id: runId, unified, test: { stage_id: sid, chapter_id: cid, title: `${chapter.title || "Chapter"} Test`, chapter_title: chapter.title }, questions, hearts: Number(user.hearts) };
}

// Visualizing activities (assets/learn/) were "learning interactions, not assessments" -- no XP, ever, by
// design (see assets/learn/README.md). This constant is the one place that reward is now defined: every
// graded activity completion earns the same fixed amount, matching the value already used by every one of
// the curriculum's 520 existing questions (`Math.min(2, Math.max(1, xp||1))` never actually resolves to
// anything but 1 in the current content). Mirrored client-side in assets/learn/engine.js's DEFAULT_ACTIVITY_XP
// and in index.html's demo-mode post() -- keep all three in sync if this ever changes.
const ACTIVITY_XP = 1;

async function saveActivityAttempt(b: any) {
  required(b, ["session_token", "test_run_id", "activity_id"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;

  const { data: run } = await supabase.from("test_runs").select("*").eq("test_run_id", b.test_run_id).eq("user_id", uid).maybeSingle();
  if (!run || String(run.status) !== "active") throw new Error("This test run is not active.");

  const { data: priorRows } = await supabase.from("activity_attempts").select("attempt_id").eq("test_run_id", run.test_run_id).eq("activity_id", String(b.activity_id));
  if ((priorRows || []).length > 0) throw new Error("This activity is already complete.");

  const pending = Number(run.pending_xp || 0) + ACTIVITY_XP;

  const { error: insertError } = await supabase.from("activity_attempts").insert({
    attempt_id: newId("AA", 14), user_id: uid, stage_id: run.stage_id, chapter_id: run.chapter_id,
    activity_id: String(b.activity_id), test_run_id: run.test_run_id, xp: ACTIVITY_XP, xp_committed: false,
  });
  // The unique index on (test_run_id, activity_id) is the real, race-proof guard (mirrors the pattern used
  // for chapter-completion XP in finishTest below); the priorRows check above just gives a friendlier error
  // in the common, non-racing case.
  if (insertError) { if (insertError.code === "23505") throw new Error("This activity is already complete."); throw new Error(insertError.message); }

  await supabase.from("test_runs").update({ pending_xp: pending }).eq("test_run_id", run.test_run_id);

  return { ok: true, pending_xp: pending };
}

async function saveTestAnswer(b: any) {
  required(b, ["session_token", "test_run_id", "question_id", "answer"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;

  const { data: run } = await supabase.from("test_runs").select("*").eq("test_run_id", b.test_run_id).eq("user_id", uid).maybeSingle();
  if (!run || String(run.status) !== "active") throw new Error("This test run is not active.");

  const { data: q } = await supabase.from("questions").select("*").eq("question_id", b.question_id).eq("chapter_id", run.chapter_id).maybeSingle();
  if (!q) throw new Error("Question not found.");

  const { data: hintRows } = await supabase.from("test_hints").select("*").eq("question_id", b.question_id);
  const answerHint = (hintRows || []).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))[0];

  const { data: priorRowsRaw } = await supabase.from("attempts").select("*").eq("test_run_id", run.test_run_id).eq("question_id", q.question_id);
  const priorRows = priorRowsRaw || [];
  if (priorRows.some((a: any) => truthy(a.correct))) throw new Error("This question is already complete.");
  if (priorRows.length >= 3) throw new Error("All three attempts for this question have been used.");

  const questionAttemptNo = priorRows.length + 1;
  const correct = isAnswerCorrect(q, String(b.answer));
  const questionDone = correct || questionAttemptNo >= 3;
  const qxp = Math.min(2, Math.max(1, Number(q.xp || 1)));

  const heartsBefore = Number(run.hearts_end ?? run.hearts_start ?? defaultHearts(settings));
  const heartLost = !correct && questionAttemptNo >= 3;
  const heartsAfter = heartLost ? Math.max(0, heartsBefore - 1) : heartsBefore;
  const pending = Number(run.pending_xp || 0) + (correct ? qxp : 0);
  const correctCount = Number(run.correct_count || 0) + (correct ? 1 : 0);

  await supabase.from("attempts").insert({
    attempt_id: newId("A", 14), user_id: uid, stage_id: run.stage_id, chapter_id: run.chapter_id,
    question_id: q.question_id, question_attempt_no: questionAttemptNo, answer: String(b.answer), correct,
    hearts_before: heartsBefore, hearts_after: heartsAfter, xp_earned: 0, response_ms: Number(b.response_ms || 0),
    device: String(b.device || ""), attempted_at: new Date().toISOString(), test_run_id: run.test_run_id,
    question_xp: correct ? qxp : 0, xp_committed: false,
  });

  await supabase.from("test_runs").update({ hearts_end: heartsAfter, pending_xp: pending, correct_count: correctCount }).eq("test_run_id", run.test_run_id);

  const { data: user } = await supabase.from("users").select("*").eq("user_id", uid).single();
  const attempted = Number(user.questions_attempted || 0) + 1;
  const corr = Number(user.correct_answers || 0) + (correct ? 1 : 0);
  const userPatch: any = {
    hearts: heartsAfter, questions_attempted: attempted, correct_answers: corr,
    accuracy_percent: attempted ? Math.round((corr * 10000) / attempted) / 100 : 0,
    current_stage: run.stage_id, current_chapter: run.chapter_id,
  };
  if (heartLost) { userPatch.heart_recovery_stage_id = run.stage_id; userPatch.heart_recovery_chapter_id = run.chapter_id; }
  await supabase.from("users").update(userPatch).eq("user_id", uid);

  const failed = heartsAfter <= 0 && heartLost;
  if (failed) {
    await supabase.from("test_runs").update({ status: "failed", finished_at: new Date().toISOString(), committed_xp: 0 }).eq("test_run_id", run.test_run_id);
  }

  return {
    ok: true, correct, correct_answer: questionDone && !correct ? String(q.answer || "") : "",
    explanation: String(q.explanation || ""), hint: answerHint ? String(answerHint.hint_text || "") : "",
    hearts: heartsAfter, pending_xp: pending, failed, heart_lost: heartLost,
    recovery_chapter_id: heartLost ? run.chapter_id : "", question_done: questionDone,
    retry_allowed: !correct && questionAttemptNo < 3 && !failed, attempt_number: questionAttemptNo,
    attempts_remaining: Math.max(0, 3 - questionAttemptNo),
  };
}

async function finishTest(b: any) {
  required(b, ["session_token", "test_run_id"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;

  const { data: run } = await supabase.from("test_runs").select("*").eq("test_run_id", b.test_run_id).eq("user_id", uid).maybeSingle();
  if (!run) throw new Error("Test run not found.");

  if (String(run.status) === "failed") {
    return { ok: true, completed: false, failed: true, committed_xp: 0, chapter_id: run.chapter_id, message: "Test not completed. Pending XP was discarded. Review the chapter where your hearts were lost." };
  }
  if (String(run.status) === "completed" || String(run.status) === "completed_repeat") {
    return { ok: true, completed: true, committed_xp: Number(run.committed_xp || 0), chapter_id: run.chapter_id };
  }

  const { data: attempts } = await supabase.from("attempts").select("*").eq("test_run_id", run.test_run_id);
  const grouped: Record<string, any[]> = {};
  (attempts || []).forEach((a: any) => { (grouped[String(a.question_id)] ||= []).push(a); });
  const finishedQuestionCount = Object.values(grouped).filter((list: any[]) => list.some((a) => truthy(a.correct)) || list.length >= 3).length;
  if (finishedQuestionCount < Number(run.question_count || 0)) throw new Error("Finish every question before completing the test.");
  if (Number(run.hearts_end || 0) <= 0) throw new Error("The test cannot be completed with zero hearts.");

  const content = await publicContent();
  const factsBefore = await prerequisiteFacts(uid, content);
  const stagePracticeBefore = (content.practice || []).filter((r: any) => normalizeId(r.stage_id) === normalizeId(run.stage_id)).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0));
  const firstPracticeBefore = stagePracticeBefore[0];
  const practiceWasUnlockedBefore = firstPracticeBefore
    ? prerequisiteStatus("PRACTICE", firstPracticeBefore.stage_id, firstPracticeBefore.practice_id, content, factsBefore).unlocked
    : false;

  const xp = Number(run.pending_xp || 0);
  const finishedAt = new Date().toISOString();

  // Chapter-completion XP is awarded at most once per (user, chapter). A
  // partial unique index on test_runs(user_id, chapter_id) WHERE status =
  // 'completed' (see 20260919120000_test_runs_one_completion_per_chapter.sql)
  // makes claiming that status atomic: the first test_run to reach here for
  // a given chapter wins it, and Postgres itself rejects any other test_run
  // for the same chapter ever being set to 'completed' afterwards -- even
  // under a race between two concurrent finishTest calls -- so this cannot
  // be bypassed by retrying or duplicating the request client-side.
  let isFirstCompletion = true;
  const { error: claimError } = await supabase.from("test_runs")
    .update({ status: "completed", finished_at: finishedAt, committed_xp: xp })
    .eq("test_run_id", run.test_run_id);
  if (claimError) {
    if (claimError.code !== "23505") throw new Error(claimError.message);
    isFirstCompletion = false;
    await supabase.from("test_runs").update({ status: "completed_repeat", finished_at: finishedAt, committed_xp: 0 }).eq("test_run_id", run.test_run_id);
  }
  const xpAwarded = isFirstCompletion ? xp : 0;

  const { data: runAttempts } = await supabase.from("attempts").select("attempt_id,question_xp").eq("test_run_id", run.test_run_id);
  for (const a of runAttempts || []) {
    await supabase.from("attempts").update({ xp_earned: isFirstCompletion ? a.question_xp : 0, xp_committed: true }).eq("attempt_id", a.attempt_id);
  }
  const { data: runActivityAttempts } = await supabase.from("activity_attempts").select("attempt_id,xp").eq("test_run_id", run.test_run_id);
  for (const a of runActivityAttempts || []) {
    await supabase.from("activity_attempts").update({ xp_committed: true }).eq("attempt_id", a.attempt_id);
  }

  const { data: allChapters } = await supabase.from("chapters").select("chapter_id,stage_id").eq("active", true);
  const { data: allRunsFresh } = await supabase.from("test_runs").select("chapter_id,status,test_run_id").eq("user_id", uid);
  const completedIds = new Set((allRunsFresh || []).filter((r: any) => r.status === "completed" || r.status === "completed_repeat" || r.test_run_id === run.test_run_id).map((r: any) => String(r.chapter_id || "")));
  const { data: stages } = await supabase.from("stages").select("stage_id").eq("active", true);

  const completedStageIds = (stages || []).filter((st: any) => {
    const cs = (allChapters || []).filter((c: any) => String(c.stage_id) === String(st.stage_id));
    return cs.length > 0 && cs.every((c: any) => completedIds.has(String(c.chapter_id)));
  }).map((st: any) => String(st.stage_id));

  const { data: user } = await supabase.from("users").select("*").eq("user_id", uid).single();
  await supabase.from("users").update({
    total_xp: Number(user.total_xp || 0) + xpAwarded,
    tests_completed: Number(user.tests_completed || 0) + 1,
    stages_completed: completedStageIds.length,
    last_completed_stage: completedStageIds.includes(String(run.stage_id)) ? run.stage_id : (user.last_completed_stage || ""),
    current_stage: run.stage_id, current_chapter: run.chapter_id,
  }).eq("user_id", uid);

  // Unified chapter: the slides were the lesson, so finishing the run also satisfies "Learn" for this chapter. Everything that still reads
  // learn_progress (Home node state, `condition: "learned"` prerequisites, heart recovery) then sees a normal, fully completed chapter.
  // A student who already had a learn_progress row (legacy: learned first, tested later, or reviewed since) is left exactly as they were.
  if (truthy(b.unified)) {
    const { data: lp } = await supabase.from("learn_progress").select("*").eq("user_id", uid).eq("chapter_id", run.chapter_id).maybeSingle();
    const nowIso = new Date().toISOString();
    if (!lp) {
      // Stamped at the run's START, not now: heart recovery only counts a loss as "owed" when it happened AFTER learn_progress.last_completed_at,
      // so a heart lost during this run stays owed until the student reviews the chapter (completeLearn). Hearts still never refill from
      // passing a chapter -- the rule this product already has -- instead of quietly refilling here.
      await supabase.from("learn_progress").insert({
        learn_progress_id: newId("LP"), user_id: uid, stage_id: run.stage_id, chapter_id: run.chapter_id, times_completed: 1,
        last_completed_at: run.started_at || nowIso, pages_viewed: Number(b.pages_viewed || 0), completed: true, updated_at: nowIso,
      });
    } else if (!truthy(lp.completed)) {
      await supabase.from("learn_progress").update({
        completed: true, times_completed: Number(lp.times_completed || 0) + 1, last_completed_at: lp.last_completed_at || run.started_at || nowIso, updated_at: nowIso,
      }).eq("user_id", uid).eq("chapter_id", run.chapter_id);
    }
  }

  const appState = await bootstrap({ session_token: b.session_token });

  return {
    ok: true, completed: true, committed_xp: xpAwarded, stage_id: run.stage_id, chapter_id: run.chapter_id,
    stage_completed: completedStageIds.includes(String(run.stage_id)),
    practice_just_unlocked: !practiceWasUnlockedBefore && (appState.practice || []).some((r: any) => normalizeId(r.stage_id) === normalizeId(run.stage_id) && r.unlocked !== false),
    message: truthy(b.unified)
      ? (isFirstCompletion ? `Chapter complete! ${xpAwarded} XP added.` : `Chapter already completed earlier. No additional XP was added.`)
      : (isFirstCompletion ? `Chapter test complete. ${xpAwarded} XP added. Hearts are unchanged.` : `Chapter already completed earlier. No additional XP was added. Hearts are unchanged.`),
    app_state: appState,
  };
}

// ---------------- practice (VS Code pairing) ----------------

async function practiceProgressForUser(uid: string) {
  const { data } = await supabase.from("practice_progress").select("*").eq("user_id", uid);
  return (data || []).map((r: any) => ({
    practice_id: String(r.practice_id || ""), stage_id: String(r.stage_id || ""), status: String(r.status || ""),
    attempt_count: Number(r.attempt_count || 0), completed_at: r.completed_at || "",
  }));
}

async function practiceActivePairingsForUser(uid: string) {
  const now = Date.now();
  const { data } = await supabase.from("practice_pairings").select("*").eq("user_id", uid);
  return (data || []).filter((r: any) => {
    const status = String(r.status || "");
    if (status === "connected") return true;
    if (status === "pending") return new Date(String(r.expires_at || "")).getTime() > now;
    return false;
  }).sort((a: any, b: any) => String(b.connected_at || b.created_at || "").localeCompare(String(a.connected_at || a.created_at || "")));
}

async function supersedeOtherPracticePairings(uid: string, keepPairingId: string) {
  const active = await practiceActivePairingsForUser(uid);
  for (const r of active) {
    if (String(r.pairing_id) !== String(keepPairingId)) {
      await supabase.from("practice_pairings").update({ status: "superseded", device_token_hash: "", last_seen: new Date().toISOString() }).eq("pairing_id", r.pairing_id);
    }
  }
}

async function deletePracticeProgressForUser(uid: string) {
  await supabase.from("practice_progress").delete().eq("user_id", uid);
}

async function practiceConnectionState(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const active = await practiceActivePairingsForUser(s.user_id);
  const current = active[0] || null;
  const progress = await practiceProgressForUser(s.user_id);
  return {
    ok: true, connected: !!current && current.status === "connected", pending: !!current && current.status === "pending",
    pairing_id: current ? String(current.pairing_id || "") : "",
    pair_code: current && current.status === "pending" ? String(current.pair_code || "") : "",
    device_name: current ? String(current.device_name || "") : "", connected_at: current ? String(current.connected_at || "") : "",
    has_progress: progress.some((p: any) => String(p.status).toLowerCase() === "completed"),
    completed_count: progress.filter((p: any) => String(p.status).toLowerCase() === "completed").length,
  };
}

async function createPracticePairing(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const mode = String(b.mode || "").toLowerCase();
  const active = await practiceActivePairingsForUser(s.user_id);
  const current = active[0] || null;
  const progress = await practiceProgressForUser(s.user_id);
  if (current && !mode) {
    return {
      ok: true, requires_choice: true, existing_status: String(current.status || ""), device_name: String(current.device_name || "VS Code"),
      connected_at: String(current.connected_at || ""), has_progress: progress.some((p: any) => String(p.status).toLowerCase() === "completed"),
      completed_count: progress.filter((p: any) => String(p.status).toLowerCase() === "completed").length,
    };
  }
  const now = new Date();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  if (mode === "restart") {
    await deletePracticeProgressForUser(s.user_id);
    for (const r of await practiceActivePairingsForUser(s.user_id)) {
      await supabase.from("practice_pairings").update({ status: "superseded", device_token_hash: "", last_seen: now.toISOString() }).eq("pairing_id", r.pairing_id);
    }
  }
  if (mode === "continue" && current) {
    await supersedeOtherPracticePairings(s.user_id, current.pairing_id);
    await supabase.from("practice_pairings").update({ pair_code: code, status: "pending", created_at: now.toISOString(), expires_at: expires, device_name: "", device_token_hash: "", connected_at: null, last_seen: null }).eq("pairing_id", current.pairing_id);
    return { ok: true, pairing_id: String(current.pairing_id), pair_code: code, expires_in_seconds: 600, reused: true, progress_kept: true };
  }
  const pairingId = newId("PAIR-", 12);
  await supabase.from("practice_pairings").insert({ pairing_id: pairingId, pair_code: code, user_id: s.user_id, status: "pending", created_at: now.toISOString(), expires_at: expires, device_name: "", device_token_hash: "", connected_at: null, last_seen: null });
  return { ok: true, pairing_id: pairingId, pair_code: code, expires_in_seconds: 600, restarted: mode === "restart" };
}

async function practicePairingStatus(b: any) {
  required(b, ["session_token", "pairing_id"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const { data: row } = await supabase.from("practice_pairings").select("*").eq("pairing_id", b.pairing_id).eq("user_id", s.user_id).maybeSingle();
  if (!row) throw new Error("Pairing request not found.");
  const expired = new Date(String(row.expires_at)).getTime() < Date.now();
  const status = expired && row.status === "pending" ? "expired" : String(row.status || "pending");
  if (status === "expired") await supabase.from("practice_pairings").update({ status: "expired" }).eq("pairing_id", row.pairing_id);
  return { ok: true, status, device_name: String(row.device_name || "") };
}

async function claimPracticePairing(b: any) {
  required(b, ["pair_code"]);
  const code = String(b.pair_code).trim();
  const { data: rows } = await supabase.from("practice_pairings").select("*").eq("pair_code", code).eq("status", "pending");
  const row = (rows || []).sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))[0];
  if (!row) throw new Error("Pairing code is invalid or has already been used.");
  if (new Date(String(row.expires_at)).getTime() < Date.now()) throw new Error("Pairing code expired. Generate a new code on CLICK.");
  await supersedeOtherPracticePairings(row.user_id, row.pairing_id);
  const token = "CLICKDEV-" + crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();
  const hash = await practiceTokenHash(token);
  await supabase.from("practice_pairings").update({ status: "connected", device_name: String(b.device_name || "VS Code").slice(0, 80), device_token_hash: hash, connected_at: now, last_seen: now }).eq("pairing_id", row.pairing_id);
  return { ok: true, device_token: token, user_id: row.user_id };
}

async function requirePracticeDevice(token: string) {
  if (!token) throw new Error("CLICK VS Code is not connected.");
  const hash = await practiceTokenHash(String(token));
  const { data: row } = await supabase.from("practice_pairings").select("*").eq("status", "connected").eq("device_token_hash", hash).maybeSingle();
  if (!row) throw new Error("This CLICK VS Code connection is no longer valid. Pair it again.");
  await supabase.from("practice_pairings").update({ last_seen: new Date().toISOString() }).eq("pairing_id", row.pairing_id);
  return row;
}

function parsePracticeJson(v: any) {
  if (Array.isArray(v)) return v;
  const s = String(v || "").trim();
  if (!s) return [];
  try { const x = JSON.parse(s); return Array.isArray(x) ? x : []; } catch { return []; }
}

function normalizePracticeQuestion(r: any, index: number, practiceTests: any[], practiceMistakes: any[], stages: any[]) {
  const pid = String(r.practice_id || r.id || `PRACTICE-${index + 1}`);
  const ownTests = (practiceTests || []).filter((t: any) => normalizeId(t.practice_id) === normalizeId(pid)).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0));
  const visible = ownTests.filter((t: any) => !truthy(t.hidden)).map((t: any) => ({ test_id: String(t.test_id || ""), name: String(t.name || ""), input: String(t.input || ""), expected_output: String(t.expected_output || ""), timeout_ms: Number(t.timeout_ms || 5000) }));
  // hidden keeps its real expected_output here -- this is the shared, full
  // representation used internally by completePractice() for authoritative
  // server-side grading. It must NEVER be returned to a client as-is; every
  // response that reaches the VS Code extension or the browser goes through
  // redactHiddenTestsForClient() first (see practiceExtensionSync).
  const hidden = ownTests.filter((t: any) => truthy(t.hidden)).map((t: any) => ({ test_id: String(t.test_id || ""), name: String(t.name || ""), input: String(t.input || ""), expected_output: String(t.expected_output || ""), timeout_ms: Number(t.timeout_ms || 5000) }));
  const ownMistakes = (practiceMistakes || []).filter((x: any) => normalizeId(x.practice_id) === normalizeId(pid)).sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
    .map((x: any) => ({ rule_type: String(x.rule_type || "source_regex"), pattern: String(x.pattern || ""), message: String(x.message || "") }));
  const stage = (stages || []).find((st: any) => normalizeId(st.stage_id) === normalizeId(r.stage_id));
  return {
    practice_id: pid, stage_id: String(r.stage_id || ""),
    stage_title: String(stage?.title || ""), stage_no: stage ? Number(stage.stage_no ?? stage.order ?? 0) : null,
    title: String(r.title || r.question || `Practice ${index + 1}`),
    objective: String(r.objective || ""), problem_statement: String(r.problem_statement || r.scenario || r.instructions || r.question || ""),
    constraints: String(r.constraints || ""), sample_input: String(r.sample_input || ""), sample_output: String(r.sample_output || ""),
    scenario: String(r.problem_statement || r.scenario || ""), instructions: String(r.problem_statement || r.instructions || r.question || ""),
    starter_code: String(r.starter_code || ""),
    visible_tests: visible.length ? visible : parsePracticeJson(r.visible_tests_json || r.visible_tests || "[]"),
    hidden_tests: hidden.length ? hidden : parsePracticeJson(r.hidden_tests_json || r.hidden_tests || "[]"),
    mistake_rules: ownMistakes.length ? ownMistakes : parsePracticeJson(r.mistake_rules_json || r.mistake_rules || "[]"),
    hints: [r.hint_1, r.hint_2, r.hint_3].filter(Boolean).map(String),
    success_message: String(r.success_message || "All tests passed. Nice work!"),
    technique_after_success: String(r.technique_after_success || ""),
    order: Number(r.order || index + 1),
    // Additive optional fields (originally added for the now-removed Experiments
    // feature; difficulty/marks/time+memory limits/workspace_folder/input+output
    // format are also used by Stage 0-5 practice questions, so they stay).
    // Null/undefined for any practice_bank row that doesn't set them.
    difficulty: r.difficulty ? String(r.difficulty) : null,
    marks: r.marks === null || r.marks === undefined ? null : Number(r.marks),
    time_limit_seconds: r.time_limit_seconds === null || r.time_limit_seconds === undefined ? null : Number(r.time_limit_seconds),
    memory_limit_mb: r.memory_limit_mb === null || r.memory_limit_mb === undefined ? null : Number(r.memory_limit_mb),
    workspace_folder: r.workspace_folder ? String(r.workspace_folder) : null,
    input_format: r.input_format ? String(r.input_format) : null,
    output_format: r.output_format ? String(r.output_format) : null,
  };
}

// Hidden tests carry their real expected_output internally (needed by
// completePractice's own server-side verification) but must never leave
// the server that way. A student's solution is only supposed to be
// checkable by actually running correct code against the hidden input --
// not by reading the expected string out of the extension's own memory or
// the network response. Only test_id/input/timeout_ms cross the wire; the
// extension runs the hidden test locally and reports back what it printed,
// and this server is the only place that ever compares it to the answer.
function redactHiddenTestsForClient(q: any) {
  return { ...q, hidden_tests: (q.hidden_tests || []).map((t: any) => ({ test_id: t.test_id, name: "", input: t.input, expected_output: "", timeout_ms: t.timeout_ms })) };
}

async function practiceExtensionSync(b: any) {
  required(b, ["device_token"]);
  const device = await requirePracticeDevice(b.device_token);
  const uid = device.user_id;
  const progress = await practiceProgressForUser(uid);
  const done = new Set(progress.filter((p: any) => String(p.status).toLowerCase() === "completed").map((p: any) => normalizeId(p.practice_id)));
  const content = await publicContent();
  const facts = await prerequisiteFacts(uid, content);

  const { data: practiceRowsRaw } = await supabase.from("practice_bank").select("*").eq("active", true);
  const all = (practiceRowsRaw || []).map((r: any, i: number) => normalizePracticeQuestion(r, i, content.practice_tests, content.practice_mistakes, content.stages))
    .map((q: any) => {
      const gate = prerequisiteStatus("PRACTICE", q.stage_id, q.practice_id, content, facts);
      return { ...q, completed: done.has(normalizeId(q.practice_id)), available: gate.unlocked, lock_reason: gate.lock_reason || "" };
    }).sort((a: any, b: any) => normalizeId(a.stage_id).localeCompare(normalizeId(b.stage_id)) || a.order - b.order);

  const visibleStages = new Set(all.filter((q: any) => q.available || q.completed).map((q: any) => normalizeId(q.stage_id)));
  const questions = all.filter((q: any) => visibleStages.has(normalizeId(q.stage_id))).map(redactHiddenTestsForClient);

  const { data: user } = await supabase.from("users").select("name").eq("user_id", uid).maybeSingle();
  return { ok: true, user: { name: user ? String(user.name || "Student") : "Student" }, questions, progress };
}

async function practiceWebSync(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const uid = s.user_id;
  const content = await publicContent();
  const facts = await prerequisiteFacts(uid, content);
  const practiceProgress = await practiceProgressForUser(uid);
  const practiceRows = content.practice.map((r: any, i: number) => {
    const pid = String(r.practice_id || `PRACTICE-${i + 1}`);
    const gate = prerequisiteStatus("PRACTICE", r.stage_id, pid, content, facts);
    return { ...r, unlocked: gate.unlocked, lock_reason: gate.lock_reason || "" };
  });
  return { ok: true, practice: practiceRows, practice_progress: practiceProgress, connection: await practiceConnectionState({ session_token: b.session_token }) };
}

// Authoritative, server-side comparison for a single hidden test. Mirrors
// the extension's own normalization exactly (see runTestSet in
// vscode-extension/src/extension.ts) so a genuinely correct solution can
// never be marked wrong here just because the two sides trimmed
// differently: CRLF -> LF, then trim() on both sides.
function normalizeProgramOutput(s: string): string {
  return String(s ?? "").replace(/\r\n/g, "\n").trim();
}

// Verifies every hidden practice_tests row for `q` against what the
// extension says the student's compiled program actually printed for that
// test's input. `q.hidden_tests` here is the full, un-redacted list (real
// expected_output) built by normalizePracticeQuestion -- this function is
// the only place that ever reads that value. `submitted` is the client's
// { test_id, output, crashed, timed_out } array; the client never sees the
// verdict for an individual test, only the aggregate pass count returned
// to the caller of completePractice.
function verifyHiddenTests(hiddenTests: any[], submitted: any[]): { passed: number; total: number; allPassed: boolean } {
  const total = hiddenTests.length;
  if (total === 0) return { passed: 0, total: 0, allPassed: true };
  const byId = new Map((Array.isArray(submitted) ? submitted : []).map((r: any) => [String(r?.test_id || ""), r]));
  let passed = 0;
  for (const t of hiddenTests) {
    const r = byId.get(String(t.test_id || ""));
    if (!r || r.crashed || r.timed_out) continue;
    if (normalizeProgramOutput(r.output) === normalizeProgramOutput(t.expected_output)) passed++;
  }
  return { passed, total, allPassed: passed === total };
}

async function completePractice(b: any) {
  required(b, ["device_token", "practice_id"]);
  const device = await requirePracticeDevice(b.device_token);
  const uid = device.user_id;
  const pid = normalizeId(b.practice_id);
  const content = await publicContent();
  const facts = await prerequisiteFacts(uid, content);
  const { data: practiceRowsRaw } = await supabase.from("practice_bank").select("*").eq("active", true);
  const all = (practiceRowsRaw || []).map((r: any, i: number) => normalizePracticeQuestion(r, i, content.practice_tests, content.practice_mistakes, content.stages));
  const q = all.find((x: any) => normalizeId(x.practice_id) === pid);
  if (!q) throw new Error("Practice question not found.");
  const gate = prerequisiteStatus("PRACTICE", q.stage_id, q.practice_id, content, facts);
  if (!gate.unlocked) throw new Error(gate.lock_reason || "This practice challenge is still locked.");

  // The extension only calls this action after every VISIBLE test passed
  // locally (visible expected_output is not secret, so that half of the
  // verdict can stay client-computed). Hidden tests are re-checked here,
  // authoritatively, against the server's own copy of expected_output --
  // this is the one and only place a "completed" decision is made.
  const visibleAllPassed = b.visible_all_passed !== false;
  const hidden = verifyHiddenTests(q.hidden_tests || [], Array.isArray(b.hidden_outputs) ? b.hidden_outputs : []);

  if (!visibleAllPassed || !hidden.allPassed) {
    return {
      ok: true, completed: false, practice_id: q.practice_id, stage_id: q.stage_id,
      hidden_passed: hidden.passed, hidden_total: hidden.total,
    };
  }

  const stageQs = all.filter((x: any) => normalizeId(x.stage_id) === normalizeId(q.stage_id)).sort((a: any, b: any) => a.order - b.order);
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from("practice_progress").select("*").eq("user_id", uid).eq("practice_id", pid).maybeSingle();
  const summary = hidden.total > 0
    ? `All visible tests passed; ${hidden.passed}/${hidden.total} hidden tests passed.`
    : "All configured tests passed.";
  if (existing) {
    await supabase.from("practice_progress").update({ stage_id: q.stage_id, status: "completed", attempt_count: Number(existing.attempt_count || 0) + 1, last_result: summary, completed_at: existing.completed_at || now, updated_at: now }).eq("user_id", uid).eq("practice_id", pid);
  } else {
    await supabase.from("practice_progress").insert({ progress_id: newId("PP-", 12), user_id: uid, practice_id: q.practice_id, stage_id: q.stage_id, status: "completed", attempt_count: 1, last_result: summary, completed_at: now, updated_at: now });
  }
  const { data: persisted } = await supabase.from("practice_progress").select("*").eq("user_id", uid).eq("practice_id", pid).eq("status", "completed").maybeSingle();
  if (!persisted) throw new Error("CLICK could not save PracticeProgress. Please retry Check Code.");
  const { data: afterRows } = await supabase.from("practice_progress").select("practice_id").eq("user_id", uid).eq("status", "completed");
  const after = new Set((afterRows || []).map((r: any) => normalizeId(r.practice_id)));
  const stageComplete = stageQs.length > 0 && stageQs.every((x: any) => after.has(normalizeId(x.practice_id)));
  return {
    ok: true, completed: true, practice_id: q.practice_id, stage_id: q.stage_id, progress_saved: true,
    progress_id: String(persisted.progress_id || ""), completed_at: String(persisted.completed_at || now),
    stage_practice_completed: stageComplete, success_message: q.success_message, technique_after_success: q.technique_after_success,
    hidden_passed: hidden.passed, hidden_total: hidden.total,
  };
}

// ---------------- staff monitoring ----------------
//
// Staff identity is a fully separate table family from `users` (see the
// staff_monitoring migration). Every staff-only action below re-validates
// the staff session itself -- there is no shared "role" flag on the student
// session to trust. This project does not use Supabase Auth / Postgres RLS
// as the real enforcement boundary (see the migration's header comment);
// this file, running under the service-role key, IS the boundary.
//
// "Today" is defined in India Standard Time (this is a single-institution
// deployment), not UTC and not the browser's local time, so a student's
// late-evening IST activity is never split across two calendar days.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istRangeUtc(daysAgo: number): { startUtc: string; endUtc: string } {
  const now = new Date();
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const istMidnightUtcMs = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - daysAgo);
  const startUtc = new Date(istMidnightUtcMs - IST_OFFSET_MS);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() };
}

// Supports the dashboard's date filter (today / yesterday / last 7 days /
// custom). Today is the only period wired into the UI so far; the others
// are implemented now so no backend change is needed to add them later.
function resolveDateRangeUtc(period: string, customStart?: string, customEnd?: string): { startUtc: string; endUtc: string } {
  const p = String(period || "today").toLowerCase();
  if (p === "yesterday") return istRangeUtc(1);
  if (p === "last7days") return { startUtc: istRangeUtc(6).startUtc, endUtc: istRangeUtc(0).endUtc };
  if (p === "custom" && customStart && customEnd) {
    const s = new Date(customStart), e = new Date(customEnd);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) return { startUtc: s.toISOString(), endUtc: e.toISOString() };
  }
  return istRangeUtc(0);
}

function safeStaff(s: any) {
  if (!s) return null;
  return { staff_id: s.staff_id, name: s.name, email: s.email, role: s.role || "STAFF", active: truthy(s.active) };
}

async function createStaffSession(staff: any, device: string) {
  const row = {
    session_id: newId("SS"),
    session_token: crypto.randomUUID() + crypto.randomUUID(),
    staff_id: staff.staff_id,
    login_time: new Date().toISOString(),
    last_seen: new Date().toISOString(),
    device,
    active: true,
  };
  const { error } = await supabase.from("staff_sessions").insert(row);
  if (error) throw new Error(error.message);
  return row;
}

async function requireStaffSession(token: string) {
  required({ staff_session_token: token }, ["staff_session_token"]);
  const { data: s } = await supabase.from("staff_sessions").select("*").eq("session_token", token).eq("active", true).maybeSingle();
  if (!s) throw new Error("Staff session expired. Please log in again.");
  const hours = 168; // same 7-day idle lifetime as student sessions
  const last = new Date(s.last_seen || s.login_time).getTime();
  if (isNaN(last) || Date.now() - last > hours * 3600000) {
    await supabase.from("staff_sessions").update({ active: false }).eq("session_id", s.session_id);
    throw new Error("Staff session expired. Please log in again.");
  }
  const { data: staff } = await supabase.from("staff_users").select("*").eq("staff_id", s.staff_id).maybeSingle();
  if (!staff || !truthy(staff.active)) {
    await supabase.from("staff_sessions").update({ active: false }).eq("session_id", s.session_id);
    throw new Error("This staff account is no longer active.");
  }
  if (Date.now() - last > 15 * 60 * 1000) {
    await supabase.from("staff_sessions").update({ last_seen: new Date().toISOString() }).eq("session_id", s.session_id);
  }
  return staff;
}

async function staffLogin(b: any) {
  required(b, ["email", "password"]);
  const email = String(b.email).trim().toLowerCase();
  const { data: staff } = await supabase.from("staff_users").select("*").ilike("email", email).maybeSingle();
  // Deliberately identical error for "no such account", "wrong password" and
  // "account deactivated" -- never reveal which one it was.
  if (!staff || !truthy(staff.active)) throw new Error("Incorrect email or password.");
  const hash = await passwordHash(String(b.password), String(staff.password_salt));
  if (hash !== String(staff.password_hash)) throw new Error("Incorrect email or password.");
  await supabase.from("staff_users").update({ last_login_at: new Date().toISOString() }).eq("staff_id", staff.staff_id);
  const session = await createStaffSession(staff, "web");
  return { ok: true, staff: safeStaff(staff), staff_session_token: session.session_token };
}

async function staffSessionInfo(b: any) {
  required(b, ["staff_session_token"]);
  const staff = await requireStaffSession(b.staff_session_token);
  return { ok: true, staff: safeStaff(staff) };
}

async function staffLogout(b: any) {
  required(b, ["staff_session_token"]);
  const staff = await requireStaffSession(b.staff_session_token);
  const now = new Date().toISOString();
  await supabase.from("staff_sessions").update({ active: false, logout_time: now, last_seen: now }).eq("session_token", b.staff_session_token);
  await supabase.from("staff_users").update({ last_logout_at: now }).eq("staff_id", staff.staff_id);
  return { ok: true };
}

// Creates or resets one staff account. Gated by the same ADMIN_RESET_KEY
// environment secret already used by adminResetPassword / adminGetMaxIds --
// never stored in the database, never shipped to the frontend. This is the
// documented manual setup procedure for the first staff account (see the
// final report / admin-tools for the exact one-off command).
async function adminUpsertStaff(b: any) {
  required(b, ["admin_key", "name", "email", "password"]);
  const expectedKey = Deno.env.get("ADMIN_RESET_KEY");
  if (!expectedKey || String(b.admin_key) !== expectedKey) throw new Error("Not authorized.");
  if (String(b.password).length < 8) throw new Error("Password must be at least 8 characters.");

  const email = String(b.email).trim().toLowerCase();
  const salt = crypto.randomUUID().replace(/-/g, "");
  const hash = await passwordHash(String(b.password), salt);
  const { data: existing } = await supabase.from("staff_users").select("staff_id").ilike("email", email).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("staff_users")
      .update({ name: String(b.name).trim(), password_hash: hash, password_salt: salt, active: true })
      .eq("staff_id", existing.staff_id);
    if (error) throw new Error(error.message);
    await supabase.from("staff_sessions").update({ active: false }).eq("staff_id", existing.staff_id).eq("active", true);
    return { ok: true, staff_id: existing.staff_id, created: false };
  }
  const staff_id = newId("STAFF");
  const { error } = await supabase.from("staff_users").insert({
    staff_id, name: String(b.name).trim(), email, password_hash: hash, password_salt: salt, role: "STAFF", active: true,
  });
  if (error) throw new Error(error.message);
  return { ok: true, staff_id, created: true };
}

// One pass over every timestamped activity table for a date range, grouped
// by student. Reused by the dashboard summary, section cards and student
// list so a dashboard load is a handful of date-bounded queries -- never
// one query per student (this is the "avoid N+1 queries at 450 students"
// requirement).
interface StudentDailyFacts {
  active: boolean;
  questionsAttempted: number;
  questionsCorrect: number;
  xpEarned: number;
  testsAttempted: number;
  testsCompleted: number;
  learnActive: boolean;
  practiceActive: boolean;
  loginActive: boolean;
}
async function staffFactsForRange(startUtc: string, endUtc: string): Promise<Map<string, StudentDailyFacts>> {
  const [attemptsR, testRunsR, learnR, practiceR, sessionsR] = await Promise.all([
    supabase.from("attempts").select("user_id,correct,xp_earned").gte("attempted_at", startUtc).lt("attempted_at", endUtc),
    supabase.from("test_runs").select("user_id,status").gte("started_at", startUtc).lt("started_at", endUtc),
    supabase.from("learn_progress").select("user_id").gte("updated_at", startUtc).lt("updated_at", endUtc),
    supabase.from("practice_progress").select("user_id").gte("updated_at", startUtc).lt("updated_at", endUtc),
    supabase.from("sessions").select("user_id").gte("last_seen", startUtc).lt("last_seen", endUtc),
  ]);
  const perUser = new Map<string, StudentDailyFacts>();
  const ensure = (uid: string) => {
    if (!perUser.has(uid)) {
      perUser.set(uid, { active: false, questionsAttempted: 0, questionsCorrect: 0, xpEarned: 0, testsAttempted: 0, testsCompleted: 0, learnActive: false, practiceActive: false, loginActive: false });
    }
    return perUser.get(uid)!;
  };
  for (const a of attemptsR.data || []) { const u = ensure(normalizeId(a.user_id)); u.active = true; u.questionsAttempted++; if (truthy(a.correct)) u.questionsCorrect++; u.xpEarned += Number(a.xp_earned || 0); }
  for (const t of testRunsR.data || []) { const u = ensure(normalizeId(t.user_id)); u.active = true; u.testsAttempted++; if (["completed", "completed_repeat"].includes(String(t.status).toLowerCase())) u.testsCompleted++; }
  for (const l of learnR.data || []) { const u = ensure(normalizeId(l.user_id)); u.active = true; u.learnActive = true; }
  for (const p of practiceR.data || []) { const u = ensure(normalizeId(p.user_id)); u.active = true; u.practiceActive = true; }
  for (const s of sessionsR.data || []) { const u = ensure(normalizeId(s.user_id)); u.active = true; u.loginActive = true; }
  return perUser;
}

// Status rules (kept deliberately simple and named here so they are easy to
// find and adjust):
//   No Activity Today   -- no qualifying record in any activity table today.
//   Started Today       -- at least one qualifying record today, but no
//                           completed chapter test today.
//   Completed Today's Work -- at least one *completed* test_runs row today.
function studentStatusToday(f: StudentDailyFacts | undefined): string {
  if (!f || !f.active) return "No Activity Today";
  if (f.testsCompleted > 0) return "Completed Today's Work";
  return "Started Today";
}

async function activeStudentIds(): Promise<{ ids: string[]; byId: Map<string, any> }> {
  const { data } = await supabase.from("users").select("user_id,name,roll_no,username,email,status,current_stage,current_chapter,total_xp,accuracy_percent,questions_attempted,correct_answers,last_login,tests_completed,stages_completed,hearts,streak,joined_at,department").eq("status", "active");
  const rows = data || [];
  return { ids: rows.map((u: any) => normalizeId(u.user_id)), byId: new Map(rows.map((u: any) => [normalizeId(u.user_id), u])) };
}

async function activeSectionAssignments(): Promise<Map<string, string>> {
  const { data } = await supabase.from("student_section_assignments").select("student_id,section_id").eq("active", true);
  return new Map((data || []).map((a: any) => [normalizeId(a.student_id), normalizeId(a.section_id)]));
}

function filterBySection(ids: string[], bySection: Map<string, string>, sectionId: string | null): string[] {
  if (!sectionId) return ids;
  if (sectionId === "UNASSIGNED") return ids.filter((id) => !bySection.has(id));
  return ids.filter((id) => bySection.get(id) === sectionId);
}

async function staffDashboardSummary(b: any) {
  required(b, ["staff_session_token"]);
  await requireStaffSession(b.staff_session_token);
  const sectionId = b.section_id ? normalizeId(String(b.section_id)) : null;
  const { startUtc, endUtc } = resolveDateRangeUtc(b.period, b.date_start, b.date_end);

  const [{ ids, byId }, bySection, facts] = await Promise.all([activeStudentIds(), activeSectionAssignments(), staffFactsForRange(startUtc, endUtc)]);
  // "All Sections" (no filter) means the monitored cohort as a whole -- every
  // student who has actually been assigned to one of the 7 sections -- not
  // every row in `users` (which also holds pre-existing dev/QA/test accounts
  // that were never part of the 450-student rollout). "Unassigned" is its
  // own explicit filter choice for staff who want to see who still needs
  // sectioning; it is deliberately not folded into the "All Sections" total.
  const studentIds = sectionId ? filterBySection(ids, bySection, sectionId) : ids.filter((id) => bySection.has(id));

  const activeToday = studentIds.filter((id) => facts.get(id)?.active).length;
  const completedToday = studentIds.filter((id) => (facts.get(id)?.testsCompleted || 0) > 0).length;
  const testsAttemptedToday = studentIds.reduce((n, id) => n + (facts.get(id)?.testsAttempted || 0), 0);
  const submissionsToday = studentIds.reduce((n, id) => n + (facts.get(id)?.questionsAttempted || 0), 0);
  const accuracies = studentIds.map((id) => Number(byId.get(id)?.accuracy_percent || 0));
  const avgAccuracy = accuracies.length ? accuracies.reduce((a, b2) => a + b2, 0) / accuracies.length : 0;

  return {
    ok: true, total_students: studentIds.length, active_today: activeToday, inactive_today: studentIds.length - activeToday,
    completed_today: completedToday, tests_attempted_today: testsAttemptedToday, submissions_today: submissionsToday,
    average_accuracy: Math.round(avgAccuracy * 10) / 10,
  };
}

async function staffSections(b: any) {
  required(b, ["staff_session_token"]);
  await requireStaffSession(b.staff_session_token);
  const { startUtc, endUtc } = resolveDateRangeUtc(b.period, b.date_start, b.date_end);

  const [sectionsR, { ids, byId }, bySection, facts] = await Promise.all([
    supabase.from("sections").select("*").eq("active", true).order("order"),
    activeStudentIds(), activeSectionAssignments(), staffFactsForRange(startUtc, endUtc),
  ]);

  const studentsBySection = new Map<string, string[]>();
  for (const id of ids) {
    const sid = bySection.get(id);
    if (!sid) continue;
    if (!studentsBySection.has(sid)) studentsBySection.set(sid, []);
    studentsBySection.get(sid)!.push(id);
  }

  const sections = (sectionsR.data || []).map((s: any) => {
    const sid = normalizeId(s.section_id);
    const studentIds = studentsBySection.get(sid) || [];
    const activeToday = studentIds.filter((id) => facts.get(id)?.active).length;
    const accuracies = studentIds.map((id) => Number(byId.get(id)?.accuracy_percent || 0));
    const avgAccuracy = accuracies.length ? accuracies.reduce((a, b2) => a + b2, 0) / accuracies.length : 0;
    const testsToday = studentIds.reduce((n, id) => n + (facts.get(id)?.testsAttempted || 0), 0);
    return {
      section_id: s.section_id, section_code: s.section_code, section_name: s.section_name,
      capacity: Number(s.capacity || 0), student_count: studentIds.length,
      available_seats: Math.max(0, Number(s.capacity || 0) - studentIds.length),
      active_today: activeToday, inactive_today: studentIds.length - activeToday,
      average_accuracy: Math.round(avgAccuracy * 10) / 10, tests_attempted_today: testsToday,
    };
  });
  const unassignedCount = ids.filter((id) => !bySection.has(id)).length;
  return { ok: true, sections, unassigned_count: unassignedCount };
}

async function staffStudents(b: any) {
  required(b, ["staff_session_token"]);
  await requireStaffSession(b.staff_session_token);
  const sectionId = b.section_id ? normalizeId(String(b.section_id)) : null;
  const search = String(b.search || "").trim().toLowerCase();
  const page = Math.max(1, Number(b.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(b.page_size || 50)));

  const [{ ids, byId }, bySection, sectionsR, facts] = await Promise.all([
    activeStudentIds(), activeSectionAssignments(), supabase.from("sections").select("section_id,section_code,section_name"), staffFactsForRange(istRangeUtc(0).startUtc, istRangeUtc(0).endUtc),
  ]);
  const sectionById = new Map((sectionsR.data || []).map((s: any) => [normalizeId(s.section_id), s]));

  let studentIds = filterBySection(ids, bySection, sectionId);
  let rows = studentIds.map((uid) => {
    const u = byId.get(uid);
    const sid = bySection.get(uid) || null;
    const sec = sid ? sectionById.get(sid) : null;
    const f = facts.get(uid);
    return {
      student_id: uid, name: u.name, roll_no: u.roll_no, username: u.username || "", email: u.email,
      section_id: sid, section_code: sec?.section_code || "", section_name: sec?.section_name || "Unassigned",
      last_active: u.last_login, current_stage: u.current_stage, current_chapter: u.current_chapter,
      total_xp: Number(u.total_xp || 0), accuracy_percent: Number(u.accuracy_percent || 0),
      questions_attempted_total: Number(u.questions_attempted || 0), correct_answers_total: Number(u.correct_answers || 0),
      questions_attempted_today: f?.questionsAttempted || 0, questions_correct_today: f?.questionsCorrect || 0,
      tests_attempted_today: f?.testsAttempted || 0, tests_completed_today: f?.testsCompleted || 0,
      xp_earned_today: f?.xpEarned || 0, status_today: studentStatusToday(f),
    };
  });

  if (search) {
    rows = rows.filter((r) =>
      String(r.name || "").toLowerCase().includes(search) ||
      String(r.roll_no || "").toLowerCase().includes(search) ||
      String(r.username || "").toLowerCase().includes(search) ||
      String(r.email || "").toLowerCase().includes(search)
    );
  }
  rows.sort((a, b2) => String(a.name || "").localeCompare(String(b2.name || "")));
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { ok: true, students: rows.slice(start, start + pageSize), total, page, page_size: pageSize };
}

async function staffStudentDetail(b: any) {
  required(b, ["staff_session_token", "student_id"]);
  await requireStaffSession(b.staff_session_token);
  const uid = normalizeId(b.student_id);
  const { data: user } = await supabase.from("users").select("*").eq("user_id", uid).maybeSingle();
  if (!user) throw new Error("Student not found.");

  const { data: assignment } = await supabase.from("student_section_assignments").select("section_id").eq("student_id", uid).eq("active", true).maybeSingle();
  const section = assignment ? (await supabase.from("sections").select("*").eq("section_id", assignment.section_id).maybeSingle()).data : null;

  const { startUtc, endUtc } = istRangeUtc(0);
  const [attemptsToday, testsToday, learnToday, practiceToday, recentAttempts, recentTests, recentLearn, practiceRows, pairing, content] = await Promise.all([
    supabase.from("attempts").select("*").eq("user_id", uid).gte("attempted_at", startUtc).lt("attempted_at", endUtc).order("attempted_at"),
    supabase.from("test_runs").select("*").eq("user_id", uid).gte("started_at", startUtc).lt("started_at", endUtc).order("started_at"),
    supabase.from("learn_progress").select("*").eq("user_id", uid).gte("updated_at", startUtc).lt("updated_at", endUtc).order("updated_at"),
    supabase.from("practice_progress").select("*").eq("user_id", uid).gte("updated_at", startUtc).lt("updated_at", endUtc).order("updated_at"),
    supabase.from("attempts").select("*").eq("user_id", uid).order("attempted_at", { ascending: false }).limit(20),
    supabase.from("test_runs").select("*").eq("user_id", uid).order("started_at", { ascending: false }).limit(10),
    supabase.from("learn_progress").select("*").eq("user_id", uid).order("updated_at", { ascending: false }).limit(10),
    supabase.from("practice_progress").select("*").eq("user_id", uid),
    supabase.from("practice_pairings").select("status,device_name,connected_at,last_seen").eq("user_id", uid).order("last_seen", { ascending: false }).limit(1).maybeSingle(),
    publicContent(),
  ]);

  // Completion + accuracy summary against the full curriculum -- same
  // stage/chapter completion logic bootstrap() uses for the student's own
  // view, computed here on the student's behalf so staff see real percentages
  // (X of Y), not just raw counts.
  const facts = await prerequisiteFacts(uid, content);
  const chapterTestCompleted = new Set(facts.completedRuns.map((r: any) => normalizeId(r.chapter_id)));
  const totalChapters = content.chapters.length;
  const chaptersLearned = content.chapters.filter((c: any) => facts.learnedChapterIds.has(normalizeId(c.chapter_id))).length;
  const testsCompletedCount = content.chapters.filter((c: any) => chapterTestCompleted.has(normalizeId(c.chapter_id))).length;
  const totalStages = content.stages.length;
  const stagesCompletedCount = content.stages.filter((st: any) => {
    const cs = content.chapters.filter((c: any) => String(c.stage_id) === String(st.stage_id));
    return cs.length > 0 && cs.every((c: any) => chapterTestCompleted.has(normalizeId(c.chapter_id)));
  }).length;
  const totalPractice = content.practice.length;
  const practiceCompletedCount = (practiceRows.data || []).filter((p: any) => String(p.status) === "completed").length;
  const pct = (n: number, total: number) => (total ? Math.round((n * 100) / total) : 0);
  const summary = {
    stages_completed: stagesCompletedCount, stages_total: totalStages, stages_percent: pct(stagesCompletedCount, totalStages),
    chapters_learned: chaptersLearned, chapters_total: totalChapters, chapters_percent: pct(chaptersLearned, totalChapters),
    tests_completed: testsCompletedCount, tests_total: totalChapters, tests_percent: pct(testsCompletedCount, totalChapters),
    coding_completed: practiceCompletedCount, coding_total: totalPractice, coding_percent: pct(practiceCompletedCount, totalPractice),
    accuracy_percent: Number(user.accuracy_percent || 0),
  };

  // Chronological "today" timeline built only from real timestamped rows --
  // each entry cites the exact source table it came from, nothing invented.
  const timeline: any[] = [];
  for (const l of learnToday.data || []) timeline.push({ at: l.updated_at, type: "LEARN", label: `Chapter ${l.chapter_id}${truthy(l.completed) ? " completed" : " — progress saved"}`, source: "learn_progress" });
  for (const t of testsToday.data || []) {
    timeline.push({ at: t.started_at, type: "TEST_START", label: `Started chapter test — ${t.chapter_id}`, source: "test_runs" });
    if (t.finished_at) timeline.push({ at: t.finished_at, type: "TEST_FINISH", label: `Finished chapter test — ${t.chapter_id} (${t.correct_count}/${t.question_count} correct)`, source: "test_runs" });
  }
  for (const a of attemptsToday.data || []) timeline.push({ at: a.attempted_at, type: "QUESTION_ATTEMPT", label: `Question ${a.question_id}: ${truthy(a.correct) ? "correct" : "incorrect"}`, source: "attempts" });
  for (const p of practiceToday.data || []) timeline.push({ at: p.updated_at, type: "PRACTICE", label: `Practice ${p.practice_id}: ${p.status}`, source: "practice_progress" });
  timeline.sort((a, b2) => new Date(a.at).getTime() - new Date(b2.at).getTime());

  const practiceRowsAll = practiceRows.data || [];
  return {
    ok: true,
    student: {
      student_id: uid, name: user.name, username: user.username || "", roll_no: user.roll_no, email: user.email,
      department: user.department, status: user.status, joined_at: user.joined_at,
      section_id: section?.section_id || null, section_code: section?.section_code || null, section_name: section?.section_name || "Unassigned",
    },
    progress: {
      current_stage: user.current_stage, current_chapter: user.current_chapter, stages_completed: Number(user.stages_completed || 0),
      total_xp: Number(user.total_xp || 0), accuracy_percent: Number(user.accuracy_percent || 0), tests_completed: Number(user.tests_completed || 0),
      questions_attempted: Number(user.questions_attempted || 0), correct_answers: Number(user.correct_answers || 0),
      hearts: Number(user.hearts || 0), streak: Number(user.streak || 0),
    },
    summary,
    today: { timeline },
    recent_activity: { attempts: recentAttempts.data || [], test_runs: recentTests.data || [], learn_progress: recentLearn.data || [] },
    practice: practiceRowsAll.filter((p: any) => /^S\d/.test(String(p.practice_id))),
    coding: { vscode_connected: pairing.data?.status === "connected", device_name: pairing.data?.device_name || null, last_seen: pairing.data?.last_seen || null },
  };
}

// Any active staff account may assign/reassign a student's section -- there
// is currently only one staff role (STAFF), so there is no basis yet to
// restrict this to a subset of staff. See final report.
async function staffAssignSection(b: any) {
  required(b, ["staff_session_token", "student_id", "section_id"]);
  const staff = await requireStaffSession(b.staff_session_token);
  const uid = normalizeId(b.student_id);
  const sectionId = normalizeId(String(b.section_id));

  const { data: user } = await supabase.from("users").select("user_id").eq("user_id", uid).maybeSingle();
  if (!user) throw new Error("Student not found.");
  const { data: section } = await supabase.from("sections").select("*").eq("section_id", sectionId).eq("active", true).maybeSingle();
  if (!section) throw new Error("Section not found.");

  const { data: existingForStudent } = await supabase.from("student_section_assignments").select("*").eq("student_id", uid).eq("active", true).maybeSingle();
  const alreadyInThisSection = !!existingForStudent && normalizeId(existingForStudent.section_id) === sectionId;
  if (alreadyInThisSection) return { ok: true, unchanged: true, section_id: sectionId };

  const { count } = await supabase.from("student_section_assignments").select("assignment_id", { count: "exact", head: true }).eq("section_id", sectionId).eq("active", true);
  if (Number(count || 0) >= Number(section.capacity || 0)) {
    throw new Error(`${section.section_name} is already at capacity (${section.capacity}/${section.capacity}).`);
  }

  if (existingForStudent) {
    await supabase.from("student_section_assignments").update({ active: false }).eq("assignment_id", existingForStudent.assignment_id);
  }
  const { error } = await supabase.from("student_section_assignments").insert({
    assignment_id: newId("ASG"), student_id: uid, section_id: sectionId, assigned_by: staff.staff_id, active: true,
  });
  if (error) throw new Error(error.message);
  return { ok: true, unchanged: false, section_id: sectionId };
}

// ---------------- staff -> student messaging ("Notify") ----------------

async function staffSendMessage(b: any) {
  required(b, ["staff_session_token", "student_id", "message"]);
  const staff = await requireStaffSession(b.staff_session_token);
  const uid = normalizeId(b.student_id);
  const text = String(b.message).trim();
  if (!text) throw new Error("Message can't be empty.");
  if (text.length > 2000) throw new Error("Message is too long (2000 characters max).");

  const { data: user } = await supabase.from("users").select("user_id").eq("user_id", uid).maybeSingle();
  if (!user) throw new Error("Student not found.");

  const message_id = newId("MSG");
  const { error } = await supabase.from("staff_messages").insert({
    message_id, student_id: uid, staff_id: staff.staff_id, message: text,
  });
  if (error) throw new Error(error.message);
  return { ok: true, message_id };
}

// Full message history (including dismissed ones) for one student, shown in
// the staff detail view so staff can see the student's replies. Opening this
// view is also what clears the "unseen reply" badge (both the per-student row
// badge and, once every student with an unseen reply has been opened, the
// Students tab badge) -- any reply not yet seen gets stamped here.
async function staffStudentMessages(b: any) {
  required(b, ["staff_session_token", "student_id"]);
  await requireStaffSession(b.staff_session_token);
  const uid = normalizeId(b.student_id);
  const { data } = await supabase.from("staff_messages").select("*").eq("student_id", uid).order("sent_at", { ascending: false }).limit(50);
  const messages = data || [];
  const unseenIds = messages.filter((m: any) => m.replied_at && !m.staff_seen_at).map((m: any) => m.message_id);
  if (unseenIds.length) {
    const seenAt = new Date().toISOString();
    await supabase.from("staff_messages").update({ staff_seen_at: seenAt }).in("message_id", unseenIds);
    for (const m of messages) if (unseenIds.includes(m.message_id)) m.staff_seen_at = seenAt;
  }
  return { ok: true, messages };
}

// Which students currently have a reply staff hasn't opened yet -- powers the
// Students tab badge (lit while this list is non-empty) and the per-row
// badge in the students table.
async function staffUnseenReplies(b: any) {
  required(b, ["staff_session_token"]);
  await requireStaffSession(b.staff_session_token);
  const { data } = await supabase.from("staff_messages").select("student_id").not("replied_at", "is", null).is("staff_seen_at", null);
  const studentIds = [...new Set((data || []).map((r: any) => normalizeId(r.student_id)))];
  return { ok: true, student_ids: studentIds };
}

async function markMessagesDelivered(b: any) {
  required(b, ["session_token", "message_ids"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const ids = (Array.isArray(b.message_ids) ? b.message_ids : []).map((x: any) => String(x));
  if (!ids.length) return { ok: true };
  await supabase.from("staff_messages").update({ delivered_at: new Date().toISOString() }).eq("student_id", s.user_id).in("message_id", ids).is("delivered_at", null);
  return { ok: true };
}

async function markMessagesRead(b: any) {
  required(b, ["session_token"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  await supabase.from("staff_messages").update({ read_at: new Date().toISOString() }).eq("student_id", s.user_id).is("read_at", null);
  return { ok: true };
}

async function studentReplyToMessage(b: any) {
  required(b, ["session_token", "message_id", "reply"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const text = String(b.reply).trim();
  if (!text) throw new Error("Reply can't be empty.");
  if (text.length > 1000) throw new Error("Reply is too long (1000 characters max).");
  const { data: msg } = await supabase.from("staff_messages").select("message_id").eq("message_id", String(b.message_id)).eq("student_id", s.user_id).maybeSingle();
  if (!msg) throw new Error("Message not found.");
  await supabase.from("staff_messages").update({ reply: text, replied_at: new Date().toISOString() }).eq("message_id", msg.message_id);
  return { ok: true };
}

// A staff-sent message can only be dismissed once the student has replied to
// it -- enforced here, not just hidden in the UI, so it can't be bypassed by
// calling the action directly.
async function studentDismissMessage(b: any) {
  required(b, ["session_token", "message_id"]);
  const settings = await settingsMap();
  const s = await requireSession(b.session_token, settings);
  const { data: msg } = await supabase.from("staff_messages").select("message_id,replied_at").eq("message_id", String(b.message_id)).eq("student_id", s.user_id).maybeSingle();
  if (!msg) throw new Error("Message not found.");
  if (!msg.replied_at) throw new Error("Reply to this message before dismissing it.");
  await supabase.from("staff_messages").update({ dismissed_at: new Date().toISOString() }).eq("message_id", msg.message_id);
  return { ok: true };
}

// ---------------- dispatch ----------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    switch (String(b.action || "")) {
      case "signup": return json(await signup(b));
      case "login": return json(await login(b));
      case "session": return json(await sessionInfo(b));
      case "logout": return json(await logout(b));
      case "markMessagesDelivered": return json(await markMessagesDelivered(b));
      case "markMessagesRead": return json(await markMessagesRead(b));
      case "studentReplyToMessage": return json(await studentReplyToMessage(b));
      case "studentDismissMessage": return json(await studentDismissMessage(b));
      case "adminResetPassword": return json(await adminResetPassword(b));
      case "adminGetMaxIds": return json(await adminGetMaxIds(b));
      case "completeOnboarding": return json(await completeOnboarding(b));
      case "setUsername": return json(await setUsername(b));
      case "bootstrap": return json(await bootstrap(b));
      case "preloadTestData": return json(await preloadTestData(b));
      case "completeLearn": return json(await completeLearn(b));
      case "startTest": return json(await startTest(b));
      case "saveTestAnswer": return json(await saveTestAnswer(b));
      case "saveActivityAttempt": return json(await saveActivityAttempt(b));
      case "finishTest": return json(await finishTest(b));
      case "createPracticePairing": return json(await createPracticePairing(b));
      case "practicePairingStatus": return json(await practicePairingStatus(b));
      case "practiceConnectionState": return json(await practiceConnectionState(b));
      case "practiceWebSync": return json(await practiceWebSync(b));
      case "claimPracticePairing": return json(await claimPracticePairing(b));
      case "practiceExtensionSync": return json(await practiceExtensionSync(b));
      case "completePractice": return json(await completePractice(b));
      case "adminUpsertStaff": return json(await adminUpsertStaff(b));
      case "staffLogin": return json(await staffLogin(b));
      case "staffSession": return json(await staffSessionInfo(b));
      case "staffLogout": return json(await staffLogout(b));
      case "staffDashboardSummary": return json(await staffDashboardSummary(b));
      case "staffSections": return json(await staffSections(b));
      case "staffStudents": return json(await staffStudents(b));
      case "staffStudentDetail": return json(await staffStudentDetail(b));
      case "staffAssignSection": return json(await staffAssignSection(b));
      case "staffSendMessage": return json(await staffSendMessage(b));
      case "staffStudentMessages": return json(await staffStudentMessages(b));
      case "staffUnseenReplies": return json(await staffUnseenReplies(b));
      default: throw new Error("Unknown action: " + b.action);
    }
  } catch (err) {
    return json({ ok: false, error: String((err as Error)?.message || err) });
  }
});
