-- Unlocks Stage 6 (STG007, ARRAYS) now that its real content, decks and activities are complete and
-- fully tested (content validation, unit, and real-browser e2e for every one of its 12 chapters -- see
-- 20260927000000_content_stage6_arrays.sql). This does the least possible: it removes exactly the one
-- self-referencing, unconditionally-unsatisfiable prerequisite row that 20260917120000_stage6to10_placeholders.sql
-- added to keep Stage 6 locked while it had no content. It adds NO new prerequisite row.
--
-- Why removing the row is enough (no hardcoded unlock, no new rule): Stages 0-5 have zero stage-level
-- prerequisite rows of their own -- prerequisiteStatus() returns unlocked:true whenever no rule exists for
-- a target (see supabase/functions/click-backend/index.ts). Deleting STG007's row simply returns Stage 6 to
-- that same, already-proven default: open once the stage before it (Stage 5 / STG006) is complete, exactly
-- like every other stage's own transition, driven by the pre-existing chapter-completion logic in
-- prerequisiteFacts()/prerequisiteStatus() and rendered by assets/home/path.js. Nothing new is introduced.
--
-- Stage 7 (STRINGS), Stage 8 (SEARCHING & SORTING), Stage 9 (FUNCTIONS) and Stage 10 (POINTERS) keep their
-- own self-referencing rows untouched, so they remain unconditionally locked, as they still have no content.

delete from prerequisites where target_id = 'STG007' and prerequisite_id = 'STG007';
