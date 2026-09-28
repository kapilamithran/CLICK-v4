-- Unlocks Stage 7 (STG013, PATTERNS) now that its real content, decks and activities are complete and fully tested
-- (content validation, unit tests, and real-browser e2e for every one of its 5 chapters -- see
-- 20260929010000_content_stage7_patterns.sql). This does the least possible: it removes exactly the one self-referencing,
-- unconditionally-unsatisfiable prerequisite row that 20260929000000_structure_number_crunching_patterns.sql added to keep Stage 7
-- locked while it had no content. It adds NO new prerequisite row and hardcodes nothing: Stage 7 then follows the same prerequisite
-- mechanism as every other populated stage (prerequisiteStatus() in supabase/functions/click-backend/index.ts returns unlocked:true
-- when no rule exists for a target; the Home path opens a stage once the stage before it is complete).
--
-- Deliberately NOT added here: a rule "Patterns requires Stage 6 (NUMBER CRUNCHING, STG012)". Number Crunching has no content yet, so it
-- can never be completed, and such a rule would make Patterns unreachable. It is added with the Number Crunching content, together with
-- "Number Crunching after Loops" and "Arrays after Patterns".
--
-- Stage 6 (NUMBER CRUNCHING, STG012) and Stage 12 (POINTERS, STG011) keep their own self-referencing rows untouched, so they remain
-- unconditionally locked, as they still have no content.
--
-- Safe to re-run: deleting a row that is already gone changes nothing.

delete from prerequisites where target_id = 'STG013' and prerequisite_id = 'STG013';
