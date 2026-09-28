-- Unlocks Stage 8 (STG009, SEARCHING & SORTING) now that its real content, decks and activities are complete and
-- fully tested (content validation, unit tests, and real-browser e2e for every one of its 15 chapters -- see
-- 20260928020000_content_stage8_searching_sorting.sql). This does the least possible: it removes exactly the one
-- self-referencing, unconditionally-unsatisfiable prerequisite row that 20260917120000_stage6to10_placeholders.sql
-- added to keep Stage 8 locked while it had no content. It adds NO new prerequisite row and hardcodes nothing:
-- Stage 8 then follows the same prerequisite mechanism as every other populated stage
-- (prerequisiteStatus() in supabase/functions/click-backend/index.ts returns unlocked:true when no rule exists for
-- a target, exactly as it already does for Stages 1-6).
--
-- Stage 7 (STRINGS, STG008), Stage 9 (FUNCTIONS, STG010) and Stage 10 (POINTERS, STG011) keep their own
-- self-referencing rows untouched, so they remain unconditionally locked, as they still have no content. Stage 6
-- (ARRAYS, STG007) was unlocked by 20260928000000_unlock_stage6_arrays.sql and is not touched here.
--
-- Safe to re-run: deleting a row that is already gone changes nothing.

delete from prerequisites where target_id = 'STG009' and prerequisite_id = 'STG009';
