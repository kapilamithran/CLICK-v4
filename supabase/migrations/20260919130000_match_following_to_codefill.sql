-- Replaces every MATCH_FOLLOWING question with an appropriate CODE_FILL
-- question grounded in that same chapter's own Learn content.
--
-- Audit (2026, against production): exactly 2 MATCH_FOLLOWING questions
-- exist anywhere in the question bank -- confirmed by a live query, not
-- just the migration history:
--   Q000175 (STG001/CH0035 "Recap & Datatypes Intro") -- int/float/char/
--     printf() matched to what they store/do.
--   Q000242 (STG004/CH0046 "format specifier")        -- int/float/char/
--     string matched to %d/%f/%c/%s.
--
-- Both replacements reuse the exact variable names and example values the
-- chapter's own Learn pages already use (age=25/18/20, price=25.5/99.5,
-- grade='A', name="Arun"), so the "one clear intended answer" requirement
-- holds without inventing new content, and the concept tested (which C
-- data type/format specifier goes with which kind of value) is the same
-- one the original matching pairs tested.
--
-- question_id is preserved (10 existing `attempts` rows reference these
-- question_ids and remain valid) -- only type/prompt/code/answer/
-- explanation/hint change, matching the same UPDATE-only convention as
-- 20260918120000_stage5_loops_blank_to_codefill.sql. The now-unused
-- `options` rows for these two questions are removed since CODE_FILL never
-- reads `options` (they were never referenced by any `attempts` row --
-- attempts reference question_id, not option_id).
--
-- Safe to re-apply: every UPDATE sets fixed final values by question_id,
-- and the DELETE only ever touches rows for these 2 question_ids.

select question_id, chapter_id, type, prompt, answer from questions where question_id in ('Q000175', 'Q000242');

update questions set
  type = 'CODE_FILL',
  prompt = 'Fill in the correct data type for each variable, and the function used to display the result.',
  code = '{{1}} age = 25;
{{2}} price = 25.5;
{{3}} grade = ''A'';

{{4}}("%d", age);',
  answer = '["int", "float", "char", "printf"]',
  explanation = 'int stores whole numbers, float stores decimal numbers, char stores one character, and printf() displays the value on the screen.',
  hint = 'Remember: int -> Whole number, float -> Decimal number, char -> Character, printf() -> Display.'
where question_id = 'Q000175';

update questions set
  type = 'CODE_FILL',
  prompt = 'Fill in the correct format specifier for each printf() call, based on the variable''s data type.',
  code = 'int age = 20;
printf("{{1}}", age);

float price = 99.5;
printf("{{2}}", price);

char grade = ''A'';
printf("{{3}}", grade);

char name[] = "Arun";
printf("{{4}}", name);',
  answer = '["%d", "%f", "%c", "%s"]',
  explanation = 'int uses %d, float uses %f, char uses %c, and a string (char array) uses %s.',
  hint = 'Data type -> matching format specifier: int->%d, float->%f, char->%c, string->%s.'
where question_id = 'Q000242';

delete from options where question_id in ('Q000175', 'Q000242');
