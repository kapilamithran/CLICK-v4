# Curriculum Compatibility Report — OLD (PUC-V2) vs NEW (Click-NewTrial)

Built from direct, byte-for-byte comparison of both repos' migration SQL (see `migration/shared-database-compatibility-report.md` §3, §7-10 for methodology and full evidence). **No numeric-ID-matching assumption was used** — every row below reflects an actual `chapter_id`/`stage_id` string confirmed present (or absent) in each repo's own `insert into stages`/`insert into chapters` statements.

**Headline finding: OLD and NEW use the identical `STGnnn`/`CHnnnn` ID scheme, and every ID that exists in both is literally the same ID — there is no renumbering, no rename, no split, no merge for any chapter present in both repos.** The only differences are pure additions (new stages, new chapters) on the NEW side, plus one inactive legacy stage that exists only on the OLD/live side.

## Classification key

- **IDENTICAL_ID** — same `stage_id`/`chapter_id`, same title, present in both repos (content may still be empty/pending on the live database — see §4/§6/§14 of the main report for which chapters have real `learn_content` live vs. not).
- **NEW_ONLY** — exists in the NEW repo's migrations, does not exist anywhere in OLD.
- **OLD_ONLY / LEGACY** — exists live (and in OLD's migrations), inactive, not referenced by any NEW migration.
- **SAME_CONCEPT_DIFFERENT_ID**, **split**, **merged** — none found; not used below.

## Stage-level compatibility

| stage_id | Title | Classification | Notes |
|---|---|---|---|
| STG000 | (legacy, no title tracked in NEW's migrations) | **OLD_ONLY / LEGACY** | `active=false` live; 30 chapters `CH0001`-`CH0030`; ~2 user accounts' historical activity; not referenced anywhere in NEW's 46 migrations |
| STG001 | Foundations | IDENTICAL_ID | |
| STG002 | Datatypes | IDENTICAL_ID | |
| STG003 | Operators | IDENTICAL_ID | |
| STG004 | Input | IDENTICAL_ID | |
| STG005 | Decision Making | IDENTICAL_ID | includes `CH0115` (see chapter table — added to this stage after its original 5, present in both repos already) |
| STG006 | Loops | IDENTICAL_ID | |
| STG007 | ARRAYS | IDENTICAL_ID (stage); **+1 new chapter** | `stage_no`/`order` shift live-side-pending (+2, display only, see main report §5 #10); chapter shells `CH0062`-`CH0072` identical in both; `CH0116` is NEW_ONLY (see below) |
| STG008 | STRINGS | IDENTICAL_ID | same `stage_no` shift note |
| STG009 | SEARCHING & SORTING | IDENTICAL_ID | same |
| STG010 | FUNCTIONS | IDENTICAL_ID | same |
| STG011 | POINTERS | IDENTICAL_ID | same; chapter shells `CH0103`-`CH0114` already exist in **both** repos with real titles, but have **zero `learn_content` live** in either — NEW's pending content migration is what would first populate them, not something OLD ever had and NEW is reconciling against |
| STG012 | NUMBER CRUNCHING | **NEW_ONLY** | does not exist in OLD at all; not live |
| STG013 | PATTERNS | **NEW_ONLY** | does not exist in OLD at all; not live |

## Chapter-level compatibility (only chapters requiring individual note — all others in an IDENTICAL_ID stage are themselves IDENTICAL_ID with no further flag needed)

| chapter_id | Stage | Title | Classification | Notes |
|---|---|---|---|---|
| CH0001–CH0030 | STG000 | (legacy) | **OLD_ONLY / LEGACY** | Inactive; out of scope for any NEW-repo work |
| CH0115 | STG005 | else if | IDENTICAL_ID | Added to Decision Making after its original 5 chapters; already present in both repos (not part of the 18 pending migrations) |
| CH0116 | STG007 | Capstone Project: Using Arrays | **NEW_ONLY** | Created by the pending `20260927000000_content_stage6_arrays.sql`; does not exist in OLD |
| CH0117 | STG012 | Accessing Digits | **NEW_ONLY** | Created by pending `20260929000000_structure_number_crunching_patterns.sql`; chapter_no corrected to 2 by pending `20261001020000_fix_stage6_chapter_order.sql` |
| CH0118 | STG012 | Counting Digits | **NEW_ONLY** | Same migration; chapter_no corrected to 1 |
| CH0119–CH0123 | STG012 | (Number Crunching, remaining 5) | **NEW_ONLY** | |
| CH0124–CH0128 | STG013 | (Patterns, all 5) | **NEW_ONLY** | |

## Question-ID and other identifiers

Not individually enumerated in this report (out of scope for a chapter/stage-focused pass), but structurally confirmed: `questions.question_id` uses the identical `Qnnnnnn` format in both repos via the shared baseline schema, and no migration in either repo ever renumbers an existing question. `prerequisites.target_id`/`prerequisite_id` reuse the same stage/chapter ID strings in both repos — no separate ID space.

## Uncertain / not classified

None found that required an `UNCERTAIN` label — every chapter/stage in both repos' migration histories resolved cleanly into one of the categories above, because the two repos are the same lineage rather than independently-authored curricula that might coincidentally resemble each other.
