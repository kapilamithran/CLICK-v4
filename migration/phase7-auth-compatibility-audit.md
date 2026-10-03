# Phase 7 — Authentication Audit (Critical Section)

Read-only. No credential value, password hash, salt, or session token is reproduced anywhere in this
report — only column/variable names and code structure.

## 1. Is Supabase Auth used?

**No.** Grepped the whole repo for `auth.users`, `supabase.auth`, `GoTrue`, `signInWithPassword` — zero
matches in any executable code. Corroborating evidence:
- `supabase/functions/click-backend/index.ts:8-11` — the Supabase client is constructed with the
  **service_role** key, which bypasses RLS; the Edge Function, not Postgres policies, is the sole
  authority.
- `supabase/config.toml:29-37`, `[functions.click-backend]` `verify_jwt = false`, with an explicit
  comment: "Matches the project's existing custom session_token auth (not Supabase Auth JWTs)."
- `supabase/migrations/20260101000000_baseline_schema.sql` — every table gets RLS enabled with **zero
  policies** (deny-all for anon/authenticated; only service_role, which bypasses RLS, can act).

## 2. Password hashing — exact algorithm (quoted code)

`supabase/functions/click-backend/index.ts:74-82`:
```ts
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function passwordHash(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}|${password}`);
}
```
- **Algorithm:** single SHA-256 call. Not PBKDF2/bcrypt/scrypt — no iteration/stretching.
- **Input ordering:** `salt + "|" + password` (salt first, literal pipe separator, password second).
- **Encoding:** UTF-8 bytes of the concatenated string; output is lowercase hex (not base64).
- **Salt generation** (`index.ts:279`): `crypto.randomUUID().replace(/-/g, "")` — a fresh random 32-hex-char
  salt per user, generated at signup and at every password reset (`adminResetPassword`, `index.ts:380`;
  `adminUpsertStaff`, `index.ts:1458` for staff).

## 3. Login verification — exact code

`supabase/functions/click-backend/index.ts:308-318`:
```ts
async function login(b: any) {
  ...
  const hash = await passwordHash(String(b.password), String(user.password_salt));
  if (hash !== String(user.password_hash)) throw new Error("Incorrect email or password.");
  ...
}
```
Recomputes the hash from the submitted password and the row's own stored salt, compares to the stored
hash with a plain `!==` (not constant-time — a pre-existing minor timing side-channel, unrelated to the
OLD→NEW migration and not introduced by it). Identical pattern for staff (`staffLogin`, `index.ts:1417-1429`).

## 4. `users` table credential columns

`supabase/migrations/20260101000000_baseline_schema.sql:193-224` — credentials live in exactly two
columns: `password_hash text not null`, `password_salt text not null`. No separate `salt_hex` column.
Login is keyed by `email` (case-insensitive), not `username`. The OLD-side CSV export header
(`CSVs/CLICK v2 - Users.csv`, header row only — no data values read) is column-for-column identical to
NEW's `users` table (NEW's baseline table predates the later, additive `username` column from
`20260907130000_add_username.sql`, consistent with that migration back-filling `username = NULL` for
existing rows).

## 5. Sessions — generation, storage, expiry

`index.ts:181-194` (`createSession`): token = `crypto.randomUUID() + crypto.randomUUID()` (72 random
characters), stored **in plain text** in `sessions.session_token`, looked up by exact-match equality
(`index.ts:197`) — never hashed before storage or lookup. Idle-timeout expiry defaults to 168 hours
(7 days), configurable via the `settings` table, enforced in `requireSession` (`index.ts:196-209`).
Schema (`baseline_schema.sql:226-237`) matches the OLD-side CSV export header
(`CSVs/CLICK v2 - Sessions.csv`) column-for-column.

## 6. Staff auth — same or different scheme?

**Same hashing scheme, same session-token scheme, separate tables** (`staff_users`/`staff_sessions`,
`20260914120000_staff_monitoring.sql:22-47`). `staffLogin` calls the identical `passwordHash()` function
used for students. Minor non-cryptographic differences: staff idle timeout is hard-coded to 168h rather
than read from `settings`; `requireStaffSession` re-checks the staff row's `active` flag on every request
(students are gated by `status` only at login time).

## 7. Project-ref dependence in auth code

**None.** Grepped `click-backend/index.ts` for both project refs and `supabase.co` — the only match in the
whole file is the `Deno.env.get("SUPABASE_URL")` call itself (`index.ts:9`). Every auth function
(`signup`, `login`, `createSession`, `requireSession`, `staffLogin`, etc.) operates purely on whichever
Postgres the injected service-role client points at — no hardcoded ref, URL, or environment-specific
literal exists inside the auth logic. (Two *non-auth* files do hardcode OLD's ref — `supabase/config.toml:13`
and `index.html:1276-1277` — covered in `phase7-runtime-readiness-audit.md`, not part of the auth logic
itself.)

## 8. Schema-vs-code cross-check (all 45 migrations)

The only structural changes to `users`/`sessions`/`staff_users`/`staff_sessions` after the baseline, across
all 45 migration files, are the additive `users.username` column and enabling RLS on the two staff tables.
No column the auth code reads or writes was ever renamed, retyped, or dropped. **No mismatches found**
between what NEW's migrations create and what the auth code expects.

## 9. Byte-for-byte OLD row copy → login against NEW, zero code changes?

Walking the code path (`login`, `index.ts:308-318`): if an OLD `users` row (same `password_hash`,
`password_salt`, `email`, `status`, etc.) is inserted verbatim into NEW's `users` table, then on login NEW
recomputes `sha256Hex(salt|password)` using the copied salt and the student's original password — a pure
function of two copied string columns and the code itself, with **no project-specific secret, pepper, or
environment-dependent input anywhere in the hash path**. The comparison then succeeds if and only if OLD
computed `password_hash` the same way (same `salt|password` ordering, same separator, same
UTF-8/hex/single-SHA-256 scheme).

**This one condition (OLD's hashing code matches NEW's) could not be independently re-derived in this
phase** — there is no OLD source checkout on this machine to diff against. It rests on an earlier phase's
claim (`migration/shared-database-compatibility-report.md:173`, asserting a direct byte-for-byte diff
found zero difference between the two repos' `click-backend/index.ts`), which this phase's auth audit did
not re-verify directly.

## AUTH COMPATIBILITY

- [x] **Directly compatible** — conditioned on the one externally-sourced claim above. NEW's own code
  imposes no contradiction: `login()` is a pure function of two copied columns plus the submitted
  password, with nothing project-specific in the hash path.
- **Recommended before relying on this for an actual migration decision:** either (a) obtain read access
  to OLD's actual `click-backend/index.ts` and diff `sha256Hex`/`passwordHash` byte-for-byte against this
  repo's `index.ts:74-82`, or (b) take one known test account's (email, password) pair, copy that one row
  into NEW, and confirm the `login` action succeeds. **Neither was performed in this phase** (would
  require either OLD source access this audit doesn't have, or copying a real student's row — out of
  scope for an audit-only phase).
- If that one assumption is wrong, the correct classification would instead be "Requires password reset"
  — a hash-scheme mismatch means no submitted password would ever reproduce the stored hash. This is
  flagged as the single load-bearing unresolved assumption in this entire audit.

## Schema mismatches found

**None.**
