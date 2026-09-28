-- Unlocks Stage 9 (STG010, FUNCTIONS) now that its real content, decks and activities are complete and fully
-- tested (content validation, unit tests, and real-browser e2e for every one of its 9 chapters -- see
-- 20260928060000_content_stage9_functions.sql). This does the least possible: it removes exactly the one
-- self-referencing, unconditionally-unsatisfiable prerequisite row that 20260917120000_stage6to10_placeholders.sql
-- added to keep Stage 9 locked while it had no content. It adds NO new prerequisite row and hardcodes nothing:
-- Stage 9 then follows the same prerequisite mechanism as every other populated stage
-- (prerequisiteStatus() in supabase/functions/click-backend/index.ts returns unlocked:true when no rule exists for
-- a target, exactly as it already does for Stages 1-8; the Home path opens a stage once the stage before it is complete).
--
-- Stage 10 (POINTERS, STG011) keeps its own self-referencing row untouched, so it remains unconditionally locked, as it
-- still has no content. Stages 6, 7 and 8 were unlocked by 20260928000000_unlock_stage6_arrays.sql,
-- 20260928050000_unlock_stage7_strings.sql and 20260928030000_unlock_stage8_searching_sorting.sql and are not touched here.
--
-- Safe to re-run: deleting a row that is already gone changes nothing.

delete from prerequisites where target_id = 'STG010' and prerequisite_id = 'STG010';
