# Phase 9 — Authentication Verification

Read-only. No credential value, hash, salt, or session token belonging to any real user was retrieved,
printed, or compared. Only a synthetic, fixed test vector (fake password, fake salt) was ever hashed.

## Section 1 — Authentication source discovery

Grepped the repository for every term the task listed (`SHA-256`, `crypto.subtle`, `password_hash`,
`password_salt`, `login`, `register`, `session_token`, `crypto.randomUUID`, etc.). All authentication
logic lives in one place: `supabase/functions/click-backend/index.ts`. No `createHash`/Node-style hashing
exists (this is a Deno Edge Function using the Web Crypto API, `crypto.subtle`). The full path:

```
REGISTRATION: signup() [index.ts:249] -> crypto.randomUUID() salt [279] -> passwordHash() [282] -> insert into users [293]
LOGIN:        login() [index.ts:308] -> passwordHash(submitted password, stored salt) [313] -> compare to stored hash [314] -> createSession() [316]
```

## Section 2 — NEW authentication implementation (read directly from current code, this phase)

| # | Question | Finding | Evidence |
|---|---|---|---|
| 1 | Hash algorithm | SHA-256, single call | `index.ts:76`, `crypto.subtle.digest("SHA-256", bytes)` |
| 2 | Hash input | `` `${salt}\|${password}` `` | `index.ts:81` |
| 3 | Salt position | First (before password) | same line |
| 4 | Separator | Literal pipe `\|` character | same line |
| 5 | Encoding | UTF-8 bytes via `TextEncoder().encode(...)` | `index.ts:75` |
| 6 | Output representation | Lowercase hex string | `index.ts:77`, `.toString(16).padStart(2,"0")` |
| 7 | Hashing rounds | 1 (no iteration/stretching, no PBKDF2/bcrypt/scrypt) | `index.ts:74-78` — one `digest()` call, no loop |
| 8 | Salt generation algorithm | `crypto.randomUUID()` | `index.ts:279` |
| 9 | Salt format | 32 lowercase hex characters (UUID v4 with hyphens stripped) | `index.ts:279`, `.replace(/-/g, "")` |
| 10 | Password normalization | **None** — raw `String(b.password)` is hashed as submitted | `index.ts:282,313` — no `.trim()`/case-fold on password (unlike `email`/`roll_no`, which *are* trimmed/lowercased) |
| 11 | Unicode handling | None beyond standard JS string → UTF-8 encoding (no NFC/NFKC normalization) | `index.ts:75` |
| 12 | Client vs. server-side hashing | **Server-side only** — the plaintext password is sent to the Edge Function in the request body and hashed there; confirmed no hashing code exists in `index.html`/`assets/**` (Phase 7 frontend audit, re-confirmed by grep this phase: zero `sha256`/`crypto.subtle`/`digest` hits in frontend code) | `index.ts:282,313` |
| 13 | Supabase Auth used? | No | No `auth.users`/`supabase.auth`/`GoTrue` reference anywhere; `verify_jwt=false` in `config.toml` |
| 14 | Custom `users` table used? | Yes, exclusively | `index.ts:274,276,293,311` etc. |
| 15 | Session token generation | `crypto.randomUUID() + crypto.randomUUID()` (72 random chars) | `index.ts:184` |
| 16 | Session token storage | Plaintext in `sessions.session_token` | `index.ts:191`, schema `sessions` table |
| 17 | Session token comparison | Exact-match equality via `.eq("session_token", token)` (Postgres `=`), not constant-time | `index.ts:197` |

## Section 3 — OLD authentication implementation: independently verified this phase

Phase 7 explicitly flagged this as **externally confirmed but not independently verified**, because no
OLD source checkout was available to that audit. This phase found one: **`C:\Users\Andry\Click\PUC-V2`**,
a separate local repository whose `supabase/config.toml` declares `project_id = "jnxevalckgitxuunjcvv"`
— OLD's exact project ref — and whose working tree is clean (`git status --short` on
`supabase/functions/` returns nothing uncommitted). It contains its own
`supabase/functions/click-backend/index.ts`.

**This was not assumed to be current or authoritative — it was diffed.**

```
diff -u PUC-V2/supabase/functions/click-backend/index.ts Click-V3/supabase/functions/click-backend/index.ts
```

Result: **8 diff hunks total**, located at source lines 149, 727-810 (×4), 926, 946-997, and 1816 (PUC-V2
line numbers). Every one of them is attributable to this engagement's own prior session work:
the CRLF-tolerant answer-comparison fix, the "unified chapter experience" feature (unified Learn+Test
flow, question-count capping, `learn_progress` auto-completion), and the `activity_attempts`/XP feature
(`saveActivityAttempt`, its dispatcher case, and its `finishTest` XP-commit loop).

**None of the 8 hunks touch `sha256Hex` (line 74-78), `passwordHash` (80-82), `createSession`
(179/181-194/196), `requireSession` (194/196-209), `signup` (247/249-306/318), or `login` (306/308-318).**
These functions, and everything else between them, fall entirely within the untouched regions of the
diff (confirmed: no hunk header appears between lines 150 and 726 of PUC-V2's file, which is the region
containing all six of these functions). **This is byte-for-byte source identity, directly compared, not
re-cited from a prior claim.**

**Residual honest caveat:** PUC-V2 is a local checkout, not a live introspection of OLD's actually
*running* deployed bytecode. Its clean git status and matching `project_id` are strong, but not
cryptographically absolute, evidence that it reflects what's currently deployed. No tool available in
this environment can compute or compare the live deployed function's exact build digest against this
source (Supabase's `functions list` reports a bundled-artifact hash, `ezbr_sha256`, not a raw-source
hash — reproducing Supabase's exact Deno bundling step to compare against it was not attempted, as it
would not add meaningful certainty over the direct source diff already performed).

**OLD AUTH IMPLEMENTATION: Independently verified via direct source diff against a confirmed, clean,
same-project-ref local checkout (`C:\Users\Andry\Click\PUC-V2`) — not merely externally confirmed.**

## Section 4 — Byte/behavior compatibility

Since Section 3 proved the two files are textually identical in every auth-relevant function, both
"implementations" are literally the same code — comparing them is comparing a string to itself. To give
this a concrete, executable check anyway (as the task requested), the exact `sha256Hex`/`passwordHash`
functions were extracted verbatim and run against a fixed synthetic test vector using Node's Web Crypto
API (`crypto.webcrypto.subtle`, the same primitive Deno's `crypto.subtle` wraps):

```
synthetic_password: [fixed test string, not a real credential]
synthetic_salt: deadbeefcafef00dfeedfacecc00ffee
resulting_digest: e566fdd6bb7e7ac10944db917fa67ec175dc0dc686d6264235ab373439486455... (64 hex chars)
deterministic (same input -> same output twice): true
```

No real student's password or hash was used, generated, retrieved, or printed. This confirms the
extracted function executes correctly, deterministically, and produces a well-formed 64-character
lowercase-hex SHA-256 digest — consistent with every column-level fact established in Sections 2-3.

| | OLD (via PUC-V2) | NEW (Click-V3) | Match? |
|---|---|---|---|
| Algorithm | SHA-256, 1 round | SHA-256, 1 round | Yes (identical source) |
| Input construction | `` `${salt}\|${password}` `` | `` `${salt}\|${password}` `` | Yes |
| Separator | `\|` | `\|` | Yes |
| Salt placement | First | First | Yes |
| Encoding | UTF-8 | UTF-8 | Yes |
| Digest format | lowercase hex | lowercase hex | Yes |
| Salt generation | `crypto.randomUUID()` minus hyphens | same | Yes |
| Password normalization | None | None | Yes |

## Section 5 — Authentication migration decision

**AUTH COMPATIBILITY: VERIFIED DIRECTLY COMPATIBLE.**

Justification: actual OLD (via the confirmed, clean, same-project-ref `PUC-V2` checkout) and actual NEW
implementations were directly, independently compared this phase via a full source diff — not taken on
a prior phase's word. Every function in the authentication path is byte-for-byte identical. This is an
upgrade from Phase 7's "externally confirmed but not independently verified," earned by new evidence
(the PUC-V2 checkout was not consulted in Phase 7), not by re-reading the same claim with more
confidence.

## Section 6 — Password migration strategy

**A. COPY `password_hash` + `password_salt` unchanged.**

Why this is safe: `login()`'s verification is a pure function of three inputs — the submitted password,
the stored `password_salt`, and the stored `password_hash` (`index.ts:313-314`) — with no project-ref,
secret, pepper, or environment-dependent input anywhere in the hash path (confirmed in Phase 7, re-
confirmed by this phase's direct reading of the same lines). Since NEW runs the identical hashing code as
OLD (Section 3), a copied `(password_hash, password_salt)` pair will reproduce the identical digest for
the same password on NEW, exactly as it did on OLD. No transformation, re-hash, or password reset is
required or justified by the evidence.

Options B (transform), C (reset), and D (block) are not recommended given the strength of this evidence,
but are preserved here for completeness: B is inapplicable (no transformation is needed — the schemes
are literally identical); C would needlessly degrade the user experience for 352 students with no
technical justification; D is superseded by this phase's new, direct verification.
