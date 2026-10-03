# Line-Ending Audit (CRLF Contamination Root Cause + Fix)

## Original git settings

- `git config core.autocrlf` → `true`
- `git config core.eol` → unset
- `.gitattributes` → did not exist before this phase
- `git check-attr text -- '*.sql'` → `unspecified` (before fix)
- `git check-attr eol -- '*.sql'` → `unspecified` (before fix)

With `core.autocrlf=true` and no attribute override, git's checkout "smudge" step
converts every `\n` in a committed blob to `\r\n` on this Windows working tree. Multi-line
SQL string literals (e.g. `learn_content.pages_text`, which stores several paragraphs per
chapter as one literal spanning many physical lines) therefore had `\r\n` embedded directly
inside the stored text value whenever `supabase db push`/`db reset` read the on-disk file
and sent it to a remote database. Single-line literals were unaffected (no embedded newline
exists inside them regardless of the file's own line-ending convention).

## .gitattributes fix

Created new file (none existed to preserve or conflict with):

```
*.sql text eol=lf
```

This forces LF for `.sql` files on future checkouts/clones, regardless of `core.autocrlf`,
since explicit path attributes take precedence over the global setting.

## Files checked and normalized

- Total `.sql` migration files in `supabase/migrations/`: **45** (44 original + 1 corrective
  migration added this session, `20260910130000_add_missing_legacy_glossary_terms.sql`).
- Files containing CRLF on disk before the fix: **27**.
- Files normalized to LF: **27** (all of them — `sed -i 's/\r$//'`, a pure trailing-`\r`
  strip, applied only to files that had CRLF).
- Files that already had LF (unaffected): 18, including both files created fresh this
  session (`20260910130000_add_missing_legacy_glossary_terms.sql` and the edit to
  `20261001030000_activity_attempts.sql`), which were written directly via tooling that
  emits `\n`, not through a git checkout.

## Byte-level evidence

Before fix, raw bytes around the `L_CH0031` "Easy Analogy" text in
`20260910120000_content_stage0_foundations.sql`:

```
E a s y   A n a l o g y * * \r \n P r o g r a m m e r   =   P e r ...
```

After fix, same location:

```
* * E a s y   A n a l o g y * * \n P r o g r a m ...
```

Confirmed via `git hash-object` that, after normalization, all 27 files' working-tree
content hashes to the **exact same blob SHA already recorded in `HEAD`** (e.g.
`20260101000000_baseline_schema.sql`: working tree, index, and HEAD all resolve to
`2cea760284709bd998861c9018af91c2bf1a35b3`). This proves two things: (1) the fix introduced
**zero actual content drift** relative to git history — the files are now byte-identical to
what has always been correctly committed as LF; (2) the CRLF was purely a checkout-time
artifact of this working tree, never part of the repository's real history.

`git status --short` still flags these 27 files as `M` after the fix. This is a stat-cache
artifact only (`git update-index --refresh` reports "needs update" for each, i.e. a
changed mtime, not changed content) — confirmed benign via the SHA comparison above and via
`git diff`, which shows **zero line output** for all 27 files (no textual difference).

## SQL semantics confirmation

`git diff --check` → clean (exit 0, no whitespace errors).
`git diff --stat` → shows only the previously-approved `activity_attempts.sql` RLS addition
(8 insertions); no other file shows a content diff, confirming the line-ending fix did not
alter any SQL statement, value, or whitespace beyond the CRLF→LF conversion itself.
