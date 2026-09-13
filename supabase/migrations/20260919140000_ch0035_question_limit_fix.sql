-- Fixes CH0035 ("Recap & Datatypes Intro") so all of its active questions
-- are actually reachable by students, instead of only the first 5.
--
-- Audit finding: CH0035 has 15 active questions (order 1-15), but
-- chapters.question_limit is NULL, so startTest() falls back to the global
-- QUESTIONS_PER_CHAPTER setting (5). Only order 1-5 (3 MCQ + 1 BLANK + 1
-- CODE_FILL) were ever served; order 6-15 (Q000176-Q000185, all TYPE_CODE)
-- were permanently unreachable, making TYPE_CODE 100% dead content (it has
-- zero other active questions anywhere else in the bank).
--
-- Verified this is the ONLY chapter with this mismatch: every other chapter
-- with active_count > 5 (CH0036-38, CH0056-58, CH0061) already has
-- question_limit explicitly set to its exact active-question count, and
-- every chapter with active_count <= 5 has question_limit = NULL safely
-- (the 5-default never truncates anything there).
--
-- Config-only fix: sets question_limit to CH0035's real active count (15),
-- matching the pattern already used by every other >5-question chapter.
-- Touches nothing else -- no question rows, no answers, no content, no XP,
-- no hearts, no progress/attempts.

select chapter_id, title, question_limit from chapters where chapter_id = 'CH0035';

update chapters
set question_limit = 15
where chapter_id = 'CH0035';

select chapter_id, title, question_limit from chapters where chapter_id = 'CH0035';
