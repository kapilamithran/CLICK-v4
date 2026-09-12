-- Displays C's greater-than-or-equal-to operator as the literal two ASCII
-- characters `>=` instead of the Unicode math symbol `≥`, so beginners see
-- the exact keystrokes C requires.
--
-- Audit: repository-wide search found exactly 4 occurrences of `≥` (and 0
-- of `≤`), all inside supabase/migrations/20260912120000_content_stage45.sql
-- learn_content.pages_text, all in Stage 4 -- Decision Making. Every one
-- sits directly next to (or is a plain-language restatement/trace of) an
-- adjacent literal `age >= 18` C code example in the SAME lesson, so all 4
-- are C-syntax teaching content, not independent mathematical notation:
--   L_CH0051 (if Statement) : "Age ≥ 18? YES -> Allow | NO -> Stop"
--   L_CH0052 (if-else)      : "Age ≥ 18? YES -> Allow. NO -> Deny."
--   L_CH0054 (Ternary)      : "20 ≥ 18 -> TRUE -> Adult"      (traces `age >= 18` above it)
--   L_CH0054 (Ternary)      : "16 ≥ 18 -> FALSE -> Not Eligible" (traces `age >= 18` above it)
-- No other ≥/≤ occurrence exists anywhere else in the project (frontend,
-- backend, other content, CSVs), so nothing else needed auditing/changing.
--
-- Uses replace() to swap only the exact substring, leaving the rest of each
-- page's text untouched. Safe to re-apply: once the ≥ is gone, replace() is
-- a no-op.

select learn_id, pages_text from learn_content where learn_id in ('L_CH0051', 'L_CH0052', 'L_CH0054');

update learn_content
set pages_text = replace(pages_text, 'Age ≥ 18? YES → Allow | NO → Stop', 'Age >= 18? YES → Allow | NO → Stop')
where learn_id = 'L_CH0051';

update learn_content
set pages_text = replace(pages_text, 'Age ≥ 18? YES → Allow. NO → Deny.', 'Age >= 18? YES → Allow. NO → Deny.')
where learn_id = 'L_CH0052';

update learn_content
set pages_text = replace(pages_text, '20 ≥ 18 → TRUE → Adult', '20 >= 18 → TRUE → Adult')
where learn_id = 'L_CH0054';

update learn_content
set pages_text = replace(pages_text, '16 ≥ 18 → FALSE → Not Eligible', '16 >= 18 → FALSE → Not Eligible')
where learn_id = 'L_CH0054';
