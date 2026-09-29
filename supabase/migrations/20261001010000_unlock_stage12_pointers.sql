-- Unlocks Stage 12 (STG011, POINTERS) now that its real content, decks and activities are complete and fully
-- tested (content validation, unit, and real-browser e2e for every one of its 12 chapters -- see
-- 20261001000000_content_stage12_pointers.sql). This does the least possible: it removes exactly the one
-- self-referencing, unconditionally-unsatisfiable prerequisite row that kept Stage 12 locked while it had no
-- unified-chapter content (its chapter titles were already real, from an earlier reservation, but it had no
-- learn_content or questions until the migration above). It adds NO new prerequisite row.
--
-- Why removing the row is enough (no hardcoded unlock, no new rule): with no prerequisite row for a target,
-- prerequisiteStatus() returns unlocked:true (see supabase/functions/click-backend/index.ts) -- the same default
-- every other already-live stage relies on (see 20260928000000_unlock_stage6_arrays.sql,
-- 20260929020000_unlock_stage7_patterns.sql and 20260930010000_unlock_stage6_number_crunching.sql for the
-- identical reasoning). Deleting STG011's row returns Stage 12 to that default.
--
-- This is the last of the twelve stages to receive this treatment: after this migration, every stage from
-- Foundations through Pointers has real, unified-chapter content and no self-lock.

delete from prerequisites where target_id = 'STG011' and prerequisite_id = 'STG011';
