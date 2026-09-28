-- Curriculum STRUCTURE for two new stages between Loops and Arrays (no learning content yet):
--
--   Stage 5  Loops               (STG006, unchanged)
--   Stage 6  NUMBER CRUNCHING    (STG012, NEW, 7 chapter slots CH0117-CH0123)
--   Stage 7  PATTERNS            (STG013, NEW, 5 chapter slots CH0124-CH0128)
--   Stage 8  ARRAYS              (STG007, was Stage 6)
--   Stage 9  STRINGS             (STG008, was Stage 7)
--   Stage 10 SEARCHING & SORTING (STG009, was Stage 8)
--   Stage 11 FUNCTIONS           (STG010, was Stage 9)
--   Stage 12 POINTERS            (STG011, was Stage 10)
--
-- What this changes, and what it does NOT change
--   * Stage IDs and chapter IDs are immutable and untouched: STG001-STG011 and every existing CH00xx keep their ids, so
--     every user's completed chapters, XP, hearts, learn/test runs and attempts (all keyed by stage_id / chapter_id) are
--     unaffected. Nothing is deleted or renamed.
--   * Only the DISPLAY metadata of the five stages after Loops moves down by two: stages.stage_no ("Stage N" on Home,
--     Practice and the VS Code extension) and stages."order" (the backend sorts stages by "order"). Both are shifted by +2
--     for STG007-STG011 so the Home path reads Loops -> Number Crunching -> Patterns -> Arrays.
--   * The two new stages and their 12 chapter slots are STRUCTURE ONLY: no learn_content, no questions, no options, no
--     glossary and no references exist for them, and their chapter titles are the neutral status text 'Content coming soon'
--     (real titles are not known yet and must not be invented). Nothing about them can award XP or hearts.
--   * Each new stage gets the same unconditionally-unsatisfiable self-referencing prerequisite row that
--     20260917120000_stage6to10_placeholders.sql gave every content-less stage, so it shows on Home as locked
--     ("content is coming soon"), can never be completed, and therefore never unlocks anything by itself.
--   * Each new chapter slot gets the usual "complete the previous micro-chapter test first" chain row (slot n requires
--     slot n-1), so the existing chapter unlock mechanism is ready for the content. No new progression mechanism.
--
-- Arrays (STG007) is deliberately NOT made to depend on Patterns here: that would lock live Arrays content for every
-- student until Patterns has content, which cannot be completed yet. When the real Number Crunching / Patterns content is
-- inserted, the content migration that unlocks each stage removes its self-lock row (same as the Stage 6-9 unlock
-- migrations) and the stage-to-stage rules are added then (Number Crunching after Loops, Patterns after Number Crunching,
-- Arrays after Patterns).
--
-- Idempotent: everything runs in one guarded block that does nothing if STG012 already exists, so the +2 shift can never be
-- applied twice and a re-run cannot fail half way.
do $migration$
begin
  if exists (select 1 from stages where stage_id = 'STG012') then
    raise notice 'Number Crunching / Patterns structure already present; nothing to do.';
    return;
  end if;

  -- 1) make room: move the display number and sort order of the stages after Loops down by two (ids unchanged)
  update stages set stage_no = stage_no + 2, "order" = "order" + 2
   where stage_id in ('STG007', 'STG008', 'STG009', 'STG010', 'STG011');

  -- 2) the two new stages
  insert into stages (stage_id, stage_no, title, "order", active) values
    ('STG012', 6, 'NUMBER CRUNCHING', 6, true),
    ('STG013', 7, 'PATTERNS', 7, true);

  -- 3) chapter slots (titles are a status text, not content)
  insert into chapters (chapter_id, stage_id, chapter_no, title, "order", active, question_limit) values
    ('CH0117', 'STG012', 1, 'Content coming soon', 1, true, null),
    ('CH0118', 'STG012', 2, 'Content coming soon', 2, true, null),
    ('CH0119', 'STG012', 3, 'Content coming soon', 3, true, null),
    ('CH0120', 'STG012', 4, 'Content coming soon', 4, true, null),
    ('CH0121', 'STG012', 5, 'Content coming soon', 5, true, null),
    ('CH0122', 'STG012', 6, 'Content coming soon', 6, true, null),
    ('CH0123', 'STG012', 7, 'Content coming soon', 7, true, null),
    ('CH0124', 'STG013', 1, 'Content coming soon', 1, true, null),
    ('CH0125', 'STG013', 2, 'Content coming soon', 2, true, null),
    ('CH0126', 'STG013', 3, 'Content coming soon', 3, true, null),
    ('CH0127', 'STG013', 4, 'Content coming soon', 4, true, null),
    ('CH0128', 'STG013', 5, 'Content coming soon', 5, true, null);

  -- 4) locks: each stage stays locked until its real content exists; chapters chain in order
  insert into prerequisites (target_id, prerequisite_id, condition, description, active) values
    ('STG012', 'STG012', 'completed', 'Stage 6 — NUMBER CRUNCHING: content is coming soon.', true),
    ('STG013', 'STG013', 'completed', 'Stage 7 — PATTERNS: content is coming soon.', true),
    ('CH0118', 'CH0117', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0119', 'CH0118', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0120', 'CH0119', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0121', 'CH0120', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0122', 'CH0121', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0123', 'CH0122', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0125', 'CH0124', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0126', 'CH0125', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0127', 'CH0126', 'completed', 'Complete the previous micro-chapter test first.', true),
    ('CH0128', 'CH0127', 'completed', 'Complete the previous micro-chapter test first.', true);
end
$migration$;
