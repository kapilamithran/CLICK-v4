-- Two content fixes:
--
-- 1. Q000268 ("An if statement executes its code block only when the
--    condition is ________.") was a free-text BLANK question where any
--    student's own wording of "true" could reasonably differ (yes / correct
--    / 1 / true), making it ungradeable in a consistent way. Converted to an
--    easy 4-option MCQ instead.
--
-- 2. Q000157's hint called C's `"` character "double quotation marks" --
--    ordinary English, unrelated to the C `double` datatype, but it was
--    getting auto-highlighted with the `double` glossary/hint tooltip
--    anyway (see the TEST_HINTS fix in index.html for the general version
--    of this bug). Reworded to drop the ambiguous word entirely.

update questions set type = 'MCQ' where question_id = 'Q000268';
insert into options (option_id, question_id, option_text, "order", active) values
('O0000866', 'Q000268', 'TRUE', 1, true),
('O0000867', 'Q000268', 'FALSE', 2, true),
('O0000868', 'Q000268', 'Zero', 3, true),
('O0000869', 'Q000268', 'Undefined', 4, true);

update questions set hint = 'Text that we want to display should be written inside quotation marks.' where question_id = 'Q000157';
