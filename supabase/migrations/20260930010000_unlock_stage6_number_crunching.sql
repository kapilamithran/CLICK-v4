-- Unlocks Stage 6 (STG012, NUMBER CRUNCHING) now that its real content, decks and activities are complete and fully
-- tested (content validation, unit, and real-browser e2e for every one of its 7 chapters -- see
-- 20260930000000_content_stage6_number_crunching.sql). This does the least possible: it removes exactly the one
-- self-referencing, unconditionally-unsatisfiable prerequisite row that 20260929000000_structure_number_crunching_patterns.sql
-- added to keep Stage 6 locked while it had no content. It adds NO new prerequisite row.
--
-- Why removing the row is enough (no hardcoded unlock, no new rule): with no prerequisite row for a target,
-- prerequisiteStatus() returns unlocked:true (see supabase/functions/click-backend/index.ts) -- the same default
-- every other already-live stage relies on (see 20260928000000_unlock_stage6_arrays.sql and
-- 20260929020000_unlock_stage7_patterns.sql for the identical reasoning). Deleting STG012's row returns Stage 6 to
-- that default. Nothing new is introduced.
--
-- Patterns (STG013) keeps its own already-removed self-lock untouched by this migration; Pointers (STG011) keeps
-- its self-lock, since it has not been through the unified-chapter QA process yet.

delete from prerequisites where target_id = 'STG012' and prerequisite_id = 'STG012';
