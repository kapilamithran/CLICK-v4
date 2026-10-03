# OLD → NEW Curriculum Mapping Template

**Status: template only. No mapping has been performed.** The OLD CLICK project/repository has not been audited as part of this task (this task covers only the NEW project, per its own scope). This file and its machine-readable twin (`curriculum-map-template.json`) exist so that a future audit of the OLD project has a concrete, pre-populated NEW-side structure to map against — nothing here should be treated as a completed mapping.

**Do not invent mappings.** Where this document says "needs verification" or "no equivalent," that is the honest current state, not a placeholder to be filled with a guess.

## How stage numbering changed (read this before mapping anything by number)

The NEW curriculum's stage numbers (`stage_no`) do **not** match a simple 0..12 history — two whole stages (Number Crunching, Patterns) were inserted between Loops and Arrays after the original six stages (Foundations → Loops) and the original Arrays → Functions block existed. When that happened, Arrays/Strings/Searching & Sorting/Functions were **renumbered** `stage_no +2` to make room — their **`stage_id` values did not change** (ids are permanent; only the display number/order moved), but their position in the sequence did.

```
Original (presumed OLD) order:              NEW order:
Foundations        (0)                      Foundations        (0)
Datatypes          (1)                      Datatypes          (1)
Operators          (2)                      Operators          (2)
Input               (3)                      Input               (3)
Decision Making    (4)                      Decision Making    (4)  [+ CH0115, added later]
Loops               (5)                      Loops               (5)
Arrays              (6)   ──┐                Number Crunching   (6)  ← NEW, no OLD equivalent
Strings             (7)     │  shifted       Patterns           (7)  ← NEW, no OLD equivalent
Searching & Sorting (8)     │  by +2         Arrays              (8)  [+ CH0116, added later]
Functions           (9)   ──┘                Strings             (9)
                                              Searching & Sorting (10)
                                              Functions           (11)
                                              Pointers            (12)  ← NEW, no OLD equivalent
```

**This "original order" column is an inference from this repository's own commit/migration history, not a confirmed fact about the OLD project — it must be confirmed against the OLD project's own data, not assumed.**

## Stages requiring NO old-equivalent search (confirmed new additions in the NEW project)

| NEW stage_id | Title | Why |
|---|---|---|
| `STG012` | Number Crunching | Added to this repository well after the original curriculum; 7 chapters (`CH0117`-`CH0123`) |
| `STG013` | Patterns | Added alongside Number Crunching; 5 chapters (`CH0124`-`CH0128`) |
| `STG011` | Pointers | Added last, completing the curriculum; 12 chapters (`CH0103`-`CH0114`) |

A future OLD-project audit may still find something resembling these topics in the OLD curriculum — if so, mark it explicitly as `mapping_type: moved` or `renamed` rather than assuming `no_equivalent` is final. The classification above is this repository's best current evidence, not a conclusion about the OLD side.

## Chapters requiring individual attention (inserted into an otherwise pre-existing stage)

| NEW chapter_id | Stage | Title | Why |
|---|---|---|---|
| `CH0115` | Decision Making (`STG005`) | else if | Inserted after the stage's original 5 chapters (`CH0051`-`CH0055`); likely has no OLD equivalent, but confirm — it may be that the OLD project taught "else if" as part of an existing chapter rather than a dedicated one (a `merged`/`split` case, not necessarily `no_equivalent`) |
| `CH0116` | Arrays (`STG007`) | Capstone Project: Using Arrays | Inserted after the stage's original 11 chapters (`CH0062`-`CH0072`); same caution applies |

## Full NEW-side chapter list (for reference while mapping — see `curriculum-map-template.json` for the structured, fillable version)

All 13 stages, 98 chapters, in NEW curriculum order:

| Stage (NEW order) | stage_id | Chapters (chapter_id range) |
|---|---|---|
| 0. Foundations | STG001 | CH0031–CH0035 |
| 1. Datatypes | STG002 | CH0036–CH0040 |
| 2. Operators | STG003 | CH0041–CH0045 |
| 3. Input | STG004 | CH0046–CH0050 |
| 4. Decision Making | STG005 | CH0051–CH0055, CH0115 |
| 5. Loops | STG006 | CH0056–CH0061 |
| 6. Number Crunching **(new)** | STG012 | CH0118, CH0117, CH0119–CH0123 *(display order; CH0118 "Counting Digits" is chapter 1, CH0117 "Accessing Digits" is chapter 2 — a deliberate fix, not a typo)* |
| 7. Patterns **(new)** | STG013 | CH0124–CH0128 |
| 8. Arrays | STG007 | CH0062–CH0072, CH0116 |
| 9. Strings | STG008 | CH0073–CH0078 |
| 10. Searching & Sorting | STG009 | CH0079–CH0093 |
| 11. Functions | STG010 | CH0094–CH0102 |
| 12. Pointers **(new)** | STG011 | CH0103–CH0114 |

## What the OLD-project audit needs to produce

For every row in `curriculum-map-template.json`, fill in:

- `old_mapping.old_stage_id` / `old_mapping.old_chapter_id` — the OLD project's own identifier, or `null` if genuinely no equivalent exists.
- `old_mapping.mapping_type` — one of: `exact_title_match`, `renamed`, `moved`, `split`, `merged`, `removed_in_new`, `no_equivalent`, `needs_verification`.
- `old_mapping.confidence` — how sure the mapping is (e.g. `high` for an exact title+position match, `low` for an inferred one).
- `old_mapping.verified_by` / `verified_at` — who confirmed it and when, for accountability.

Identify explicitly, as separate findings (not folded silently into the table):

- **Renamed chapters** — same content, different title, between OLD and NEW.
- **Moved chapters** — same content and title, different stage or position.
- **Split chapters** — one OLD chapter's content became multiple NEW chapters.
- **Merged chapters** — multiple OLD chapters became one NEW chapter.
- **Removed chapters** — exist in OLD, have no NEW equivalent at all (their progress, if migrated, has nowhere to go — a decision is needed on whether to drop it, or store it in some "legacy/unmapped" holding area).
- **Chapters with no equivalent in either direction** — call these out explicitly rather than leaving a blank cell that could be mistaken for "not yet checked."
