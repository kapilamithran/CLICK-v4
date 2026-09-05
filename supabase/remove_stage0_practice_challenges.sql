-- Removes the 10 Stage 0 ("Constants, Variables and Data Types") practice challenges:
-- A Name C Will Accept, One Character Not a String, Keep the Fraction, Give It a First
-- Value, Read Into the Right Place, Replace the Magic Number, Do Not Change const,
-- Names That Describe States, Two Kinds of Input, Choose Enough Range.
--
-- Run the SELECT first to confirm it returns exactly these 10 rows before running the
-- DELETE. practice_tests, practice_mistakes and practice_progress all reference
-- practice_bank(practice_id) with "on delete cascade", so deleting from practice_bank
-- automatically removes their matching child rows (test cases, mistake rules, and any
-- student progress recorded against these specific challenges) — no separate DELETEs
-- are needed for those tables. The stages/chapters tables (Stage 0's Learn content) are
-- not touched by this script at all.

-- 1) Verify — should return exactly these 10 titles, nothing else.
select practice_id, stage_id, title
from practice_bank
where title in (
  'A Name C Will Accept',
  'One Character, Not a String',
  'Keep the Fraction',
  'Give It a First Value',
  'Read Into the Right Place',
  'Replace the Magic Number',
  'Do Not Change const',
  'Names That Describe States',
  'Two Kinds of Input',
  'Choose Enough Range'
)
order by "order";

-- 2) Once step 1 looks correct, run this to actually remove them (and their cascaded
--    practice_tests / practice_mistakes / practice_progress rows).
delete from practice_bank
where title in (
  'A Name C Will Accept',
  'One Character, Not a String',
  'Keep the Fraction',
  'Give It a First Value',
  'Read Into the Right Place',
  'Replace the Magic Number',
  'Do Not Change const',
  'Names That Describe States',
  'Two Kinds of Input',
  'Choose Enough Range'
);
