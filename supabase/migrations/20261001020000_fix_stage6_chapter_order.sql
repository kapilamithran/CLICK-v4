-- Fixes the display/unlock order of Stage 6 (NUMBER CRUNCHING, STG012)'s first two chapters. The chapter IDs and
-- all of their content (learn_content, questions, options, ...) are untouched -- only the `chapter_no`/`order`
-- columns on `chapters`, and the two `prerequisites` edges that chain those two chapters to their neighbours,
-- are updated, per 20260929000000_structure_number_crunching_patterns.sql's own original chapter-slot inserts.
--
-- Before: CH0117 (chapter_no 1) = "Accessing Digits", CH0118 (chapter_no 2) = "Counting Digits".
-- After:  CH0118 (chapter_no 1) = "Counting Digits",  CH0117 (chapter_no 2) = "Accessing Digits".
--
-- The unlock chain is re-chained to match: CH0117 now requires CH0118 (was the other way around), and CH0119
-- (chapter_no 3, unchanged) now requires CH0117 (was CH0118) -- i.e. it still simply requires "whichever chapter
-- is now in slot 2", exactly the existing slot-to-slot pattern every other stage already uses.
--
-- Safe to re-run: every statement here is idempotent (a swap applied twice is a no-op; deleting an
-- already-deleted row, or inserting a row that already matches, changes nothing further).

update chapters set chapter_no = 2, "order" = 2 where chapter_id = 'CH0117';
update chapters set chapter_no = 1, "order" = 1 where chapter_id = 'CH0118';

delete from prerequisites where target_id = 'CH0118' and prerequisite_id = 'CH0117';
delete from prerequisites where target_id = 'CH0119' and prerequisite_id = 'CH0118';

insert into prerequisites (target_id, prerequisite_id, condition, description, active)
select 'CH0117', 'CH0118', 'completed', 'Complete the previous micro-chapter test first.', true
where not exists (select 1 from prerequisites where target_id = 'CH0117' and prerequisite_id = 'CH0118');

insert into prerequisites (target_id, prerequisite_id, condition, description, active)
select 'CH0119', 'CH0117', 'completed', 'Complete the previous micro-chapter test first.', true
where not exists (select 1 from prerequisites where target_id = 'CH0119' and prerequisite_id = 'CH0117');
