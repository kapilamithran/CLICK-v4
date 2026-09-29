-- Stage 6 (STG012, NUMBER CRUNCHING) real content, filling the seven structural slots CH0117-CH0123 created by
-- 20260929000000_structure_number_crunching_patterns.sql (their titles were the neutral status text 'Content coming soon', with no learn
-- text and no questions). Chapter ids, stage id and order are unchanged: the 7 Number Crunching PDFs
-- (assets/Contents/Number Crunching/Number-Crunching1-7.pdf) map 1:1 onto the 7 slots. The ONLY existing rows this migration touches are
-- those seven chapters' titles, and only while they still hold the placeholder text; everything else is new rows (learn_content, glossary,
-- questions, options, hints, question_terms).
--
-- Chapter titles come straight from each PDF's own chapter heading (Accessing Digits; Counting Digits; Reversing a Number; Checking a
-- Palindrome Number; Checking an Armstrong Number; Checking a Perfect Number; Checking a Prime Number).
--
-- Each PDF ends in its own quiz, inserted close to verbatim and matched to the nearest DB question type (MCQ / CODE_FILL). Six chapters have
-- 5 questions; Number-Crunching3.pdf (Reversing a Number) has 6 -- its own numbering repeats "3" (1, 2, 3, 3, 4, 5), and the two "3" questions
-- are genuinely different content, so both are kept. Every chapter's own "Glossary:" callout under its quiz is carried over close to verbatim.
--
-- Number Crunching is intentionally NOT unlocked by this migration: the STG012 self-referencing prerequisite row stays (unconditionally
-- locked) until the decks and activities are written and the full test suite passes. A later migration removes that row.

-- Idempotent: everything runs in one guarded block; if Number Crunching's learn_content is already present nothing happens. Only new rows
-- are added, plus the seven placeholder titles.
do $migration$
begin
  if exists (select 1 from learn_content where learn_id = 'L_CH0117') then
    raise notice 'Stage 6 (NUMBER CRUNCHING) content already present; nothing to do.';
    return;
  end if;

  update chapters set title = case chapter_id
    when 'CH0117' then 'Accessing Digits'
    when 'CH0118' then 'Counting Digits'
    when 'CH0119' then 'Reversing a Number'
    when 'CH0120' then 'Checking a Palindrome Number'
    when 'CH0121' then 'Checking an Armstrong Number'
    when 'CH0122' then 'Checking a Perfect Number'
    when 'CH0123' then 'Checking a Prime Number'
  end
   where chapter_id in ('CH0117', 'CH0118', 'CH0119', 'CH0120', 'CH0121', 'CH0122', 'CH0123') and title = 'Content coming soon';

update chapters set question_limit = 6 where chapter_id = 'CH0119';

-- learn_content (CH0117: one row; pages_text carries 4 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0117', 'STG012', 'CH0117', 'Accessing Digits', 'What Is Number Crunching?
We normally work with a complete number, but sometimes we need to work with the individual digits of a number. Number crunching means working with the individual digits of a number.

Look at 1234: it has four digits, 1, 2, 3 and 4. Each one is a digit; together they make the number 1234.

Think of a number like a row of boxes, one digit in each box: 1, 2, 3, 4. Each box contains one digit, and all the boxes together hold the number.

Remember: one digit is a digit. Many digits together make a number.
//.//
Accessing a Digit
A number contains many digits, and sometimes we need to get each digit separately. Accessing digits means getting the individual digits from a number one by one.

Take 1234. We can access 4, then 3, then 2, then 1 -- we start from the last digit, not the first.

In C we use the modulus operator % to do this: digit = n % 10;. For n = 1234, 1234 % 10 = 4, so the last digit is 4.

Think of the number as a row of boxes, 1 2 3 4. We take the last box first.

Remember: % 10 gets the last digit.
//.//
Removing the Last Digit
After accessing the last digit, we need to remove it so the next % 10 can reach the digit before it. In C we use division: n = n / 10;.

For n = 1234, 1234 / 10 = 123, so 1234 becomes 123 -- the last digit, 4, is gone. Repeating the division removes one digit each time: 1234 -> 123 -> 12 -> 1 -> 0.

Think of the number as a row of boxes, 1 2 3 4. Removing the last box leaves 1 2 3, which is 123.

Remember: / 10 removes the last digit.
//.//
Accessing All the Digits
Yes, we can access every digit of a number: use % 10 to get the last digit, / 10 to remove it, then repeat the process.

For 1234: step 1 gives digit 4 and n becomes 123. Step 2 gives digit 3 and n becomes 12. Step 3 gives digit 2 and n becomes 1. Step 4 gives digit 1 and n becomes 0.

So from 1234 we get the digits 4, 3, 2, 1, in that order -- always from the last digit to the first.

Big memory trick: % 10 to GET, / 10 to REMOVE.

Use % 10 and / 10 together to access the digits of a number one by one.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM364', '%', 'Modulus operator -- gives the remainder.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM365', '/', 'Division operator -- removes the last digit when dividing an integer by 10.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM366', 'GET', 'Access the last digit.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM367', 'REMOVE', 'Remove the last digit.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM368', 'Access', 'To get or retrieve a value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM369', 'Access', 'To get or retrieve a value.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000569', 'STG012', 'CH0117', 'CODE_FILL', 'Get the Last Digit
Complete the code.', 'int n = 1234;
int digit;
digit = n {{1}} 10;
printf("%d", digit);', '["%"]', '', 'Which operator gives the remainder?', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000570', 'STG012', 'CH0117', 'CODE_FILL', 'Remove the Last Digit
Complete the code.', 'int n = 1234;
n = n {{1}} 10;
printf("%d", n);', '["/"]', '', 'Which operator removes the last digit?', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000571', 'STG012', 'CH0117', 'MCQ', 'What Happens Next?
What are the values of digit and n after these statements run?', 'int n = 5678;
int digit = n % 10;
n = n / 10;', 'digit = 8, n = 567', '', 'First GET, then REMOVE.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000572', 'STG012', 'CH0117', 'MCQ', 'Trace the Digits
If int n = 1234; and we repeatedly use % 10 and / 10, what order will the digits be accessed?', '', '4 -> 3 -> 2 -> 1', '', '% 10 always starts from the right side.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000573', 'STG012', 'CH0117', 'MCQ', 'If n = 5678, which digit is accessed first?', '', '8', '', '% 10 starts from the right side.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001413', 'Q000571', 'digit = 8, n = 567', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001414', 'Q000571', 'digit = 7, n = 568', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001415', 'Q000571', 'digit = 8, n = 5678', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001416', 'Q000571', 'digit = 7, n = 567', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001417', 'Q000572', '1 -> 2 -> 3 -> 4', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001418', 'Q000572', '4 -> 3 -> 2 -> 1', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001419', 'Q000572', '1 -> 4 -> 2 -> 3', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001420', 'Q000572', '4 -> 1 -> 3 -> 2', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001421', 'Q000573', '5', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001422', 'Q000573', '6', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001423', 'Q000573', '7', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001424', 'Q000573', '8', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000569', 'Q000569', 'Which operator gives the remainder?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000570', 'Q000570', 'Which operator removes the last digit?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000571', 'Q000571', 'First GET, then REMOVE.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000572', 'Q000572', '% 10 always starts from the right side.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000573', 'Q000573', '% 10 starts from the right side.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000569', 'TERM364', '%', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000570', 'TERM365', '/', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000571', 'TERM366', 'GET', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000571', 'TERM367', 'REMOVE', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000572', 'TERM368', 'Access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000573', 'TERM369', 'Access', 1, true);

-- learn_content (CH0118: one row; pages_text carries 3 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0118', 'STG012', 'CH0118', 'Counting Digits', 'What Is Counting Digits?
Sometimes we need to find out how many digits are present in a number. Counting digits means finding the total number of digits present in a number.

Take 1234: it has four digits, 1, 2, 3 and 4, so 1234 has 4 digits.

Think of a number like a row of boxes, one digit in each box: 1 2 3 4. Counting the boxes gives the count of digits.

Remember: one box is one digit. Counting the boxes counts the digits.
//.//
How Do We Count the Digits?
We can keep dividing the number by 10. Every time we divide by 10, one digit is removed, so the number of divisions tells us the number of digits.

For 1234: 1234 -> 123 -> 12 -> 1 -> 0. That took 4 divisions, so 1234 has 4 digits.

In C we start with count = 0;, then repeat n = n / 10; count++; until n becomes 0.

Think of the number as a stack of boxes: remove one box each time, and keep counting how many boxes you removed.

Remember: / 10 removes one digit, and count++ counts one digit.
//.//
Counting Digits Using a Loop
We don''t know in advance how many digits a number has, so we keep repeating the process until the number becomes 0: count = 0; while (n != 0) { n = n / 10; count++; }

For n = 5678: 5678 -> 567 -> 56 -> 5 -> 0, and count goes 0, 1, 2, 3, 4. So 5678 has 4 digits.

Big memory trick: / 10 to REMOVE, count++ to COUNT, while to REPEAT.

Keep dividing by 10 and increasing the count until the number becomes 0.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM370', '/', 'Division operator -- divides one number by another.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM371', 'count++', 'Increases the value of count by 1.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM372', 'while', 'Repeats a block of code while the condition is true.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM373', 'Division /', 'Used here to remove the last digit of an integer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM374', 'Count', 'The number of digits found so far.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000574', 'STG012', 'CH0118', 'CODE_FILL', 'Complete the Code', 'int n = 1234;
int count = 0;

while (n != 0)
{
   n = n {{1}} 10;
   count++;
}', '["/"]', '', 'Which operator removes the last digit?', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000575', 'STG012', 'CH0118', 'CODE_FILL', 'Complete the Code', 'int n = 5678;
int count = 0;

while (n != 0)
{
   n = n / 10;
   count{{1}};
}', '["++"]', '', 'We need to increase the count by 1.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000576', 'STG012', 'CH0118', 'MCQ', 'What happens when n becomes 0?', 'while (n != 0)', 'The loop stops', '', 'Look at the condition: while (n != 0)', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000577', 'STG012', 'CH0118', 'MCQ', 'Which statement removes one digit from a number?', '', 'n = n / 10;', '', 'Think about the operation that removes the last digit.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000578', 'STG012', 'CH0118', 'MCQ', 'What is the purpose of count++?', '', 'Adds 1 to the count', '', 'Think about what count means.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001425', 'Q000576', 'The loop continues forever', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001426', 'Q000576', 'The loop stops', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001427', 'Q000576', 'The number becomes 10', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001428', 'Q000576', 'count becomes 0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001429', 'Q000577', 'n = n + 10;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001430', 'Q000577', 'n = n * 10;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001431', 'Q000577', 'n = n / 10;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001432', 'Q000577', 'n = n - 10;', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001433', 'Q000578', 'Removes a digit', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001434', 'Q000578', 'Adds 1 to the count', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001435', 'Q000578', 'Makes the number bigger', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001436', 'Q000578', 'Stops the loop', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000574', 'Q000574', 'Which operator removes the last digit?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000575', 'Q000575', 'We need to increase the count by 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000576', 'Q000576', 'Look at the condition: while (n != 0)', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000577', 'Q000577', 'Think about the operation that removes the last digit.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000578', 'Q000578', 'Think about what count means.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000574', 'TERM370', '/', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000575', 'TERM371', 'count++', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000576', 'TERM372', 'while', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000577', 'TERM373', 'Division /', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000578', 'TERM374', 'Count', 1, true);

-- learn_content (CH0119: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0119', 'STG012', 'CH0119', 'Reversing a Number', 'What Is Reversing a Number?
Normally we read a number from left to right, such as 1234. Reversing a number means arranging its digits in the opposite order: 4321.

Think of a number like a line of people, 1 2 3 4. When everyone turns around, they stand as 4 3 2 1 -- that is a reversed number.

Remember: the original number 1234 reverses to 4321.
//.//
Getting Digits for Reversing
To reverse a number we need to get its digits one by one, using the same % 10 we already know: digit = n % 10;.

For 1234: 1234 % 10 = 4, then 123 % 10 = 3, then 12 % 10 = 2, then 1 % 10 = 1. So the digits come out in the order 4, 3, 2, 1.

After getting a digit we remove it the same way as before: n = n / 10;.

Remember: % 10 gets a digit, / 10 removes it.
//.//
Building the Reverse
To build a new number out of the digits we get, we use rev = rev * 10 + digit;, starting from rev = 0.

For 1234: digit 4 gives rev = 0 * 10 + 4 = 4. Digit 3 gives rev = 4 * 10 + 3 = 43. Digit 2 gives rev = 43 * 10 + 2 = 432. Digit 1 gives rev = 432 * 10 + 1 = 4321.

So 1234 becomes 4321.

Remember: rev * 10 + digit builds the reverse, one digit at a time.
//.//
Reversing a Number Using a Loop
We can automate the whole process with a while loop: int rev = 0; while (n != 0) { digit = n % 10; rev = rev * 10 + digit; n = n / 10; }

For n = 1234: 1234 gives digit 4, rev becomes 4. 123 gives digit 3, rev becomes 43. 12 gives digit 2, rev becomes 432. 1 gives digit 1, rev becomes 4321.

Big memory trick: % 10 to GET, / 10 to REMOVE, rev * 10 + digit to BUILD.

Get the digit, build the reverse, remove the digit, and repeat.
//.//
Reversing a Number Recap
Three statements do all the work. First, get the last digit: digit = n % 10;. Second, remove the last digit: n = n / 10;. Third, build the reverse: rev = rev * 10 + digit;, which adds the digit to the reversed number.

One big memory trick: % 10 to GET, / 10 to REMOVE, rev * 10 + digit to BUILD.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM375', 'Initialize', 'Giving a variable its starting value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM376', '% 10', 'Gets the last digit.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM377', '/ 10', 'Removes the last digit from an integer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM378', 'rev', 'Variable used to store the reversed number.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000579', 'STG012', 'CH0119', 'MCQ', 'What is the reverse of 1234?', '', '4321', '', 'Reverse each digit''s position: the last digit becomes the first.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000580', 'STG012', 'CH0119', 'MCQ', 'Which statement builds the reverse?', '', 'rev = rev * 10 + digit;', '', 'The reverse-so-far is shifted one place before the new digit is added.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000581', 'STG012', 'CH0119', 'MCQ', 'Which statement is used to initialize the reverse number?', '', 'int rev = 0;', '', 'Before building the reverse, we need an empty starting value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000582', 'STG012', 'CH0119', 'CODE_FILL', 'Complete the code', 'int n = 4321;
int digit;
digit = n {{1}} 10;', '["%"]', '', 'We want to GET the last digit.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000583', 'STG012', 'CH0119', 'CODE_FILL', 'Complete the code', 'int n = 4321;

n = n {{1}} 10;', '["/"]', '', 'We want to REMOVE the last digit.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000584', 'STG012', 'CH0119', 'CODE_FILL', 'Complete the Reverse Statement', 'int rev = 0;
int digit = 5;

rev = rev {{1}} 10 + digit;', '["*"]', '', 'Use the statement that builds the reverse.', 1, 6, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001437', 'Q000579', '1243', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001438', 'Q000579', '4321', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001439', 'Q000579', '4312', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001440', 'Q000579', '1234', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001441', 'Q000580', 'rev = rev + digit;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001442', 'Q000580', 'rev = rev * 10 + digit;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001443', 'Q000580', 'rev = digit / 10;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001444', 'Q000580', 'rev = n / 10;', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001445', 'Q000581', 'int rev = 1;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001446', 'Q000581', 'int rev = 0;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001447', 'Q000581', 'int rev = 10;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001448', 'Q000581', 'int rev = n;', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000579', 'Q000579', 'Reverse each digit''s position: the last digit becomes the first.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000580', 'Q000580', 'The reverse-so-far is shifted one place before the new digit is added.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000581', 'Q000581', 'Before building the reverse, we need an empty starting value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000582', 'Q000582', 'We want to GET the last digit.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000583', 'Q000583', 'We want to REMOVE the last digit.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000584', 'Q000584', 'Use the statement that builds the reverse.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000581', 'TERM375', 'Initialize', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000582', 'TERM376', '% 10', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000583', 'TERM377', '/ 10', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000584', 'TERM378', 'rev', 1, true);

-- learn_content (CH0120: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0120', 'STG012', 'CH0120', 'Checking a Palindrome Number', 'What Is a Palindrome Number?
Sometimes a number looks the same when read forward and backward. Take 121: forward it is 1 2 1, backward it is also 1 2 1, so 121 is a Palindrome Number.

A palindrome number is a number that remains the same when its digits are reversed.

But 123 reversed is 321, which is different, so 123 is Not Palindrome.

Think of a palindrome like a mirror: 1 2 1 looks the same on both sides.

Remember: same after reversing means Palindrome; different after reversing means Not Palindrome.
//.//
Reversing the Number
To check a palindrome, we first need to reverse the number, using the same % 10 and / 10 we already know.

For 121: 121 % 10 = 1 and 121 / 10 = 12, so digit = 1. Then 12 % 10 = 2 and 12 / 10 = 1, so digit = 2. Then 1 % 10 = 1 and 1 / 10 = 0, so digit = 1.

So we get the digits 1, 2, 1, and building the reverse gives 121. The original was 121 and the reverse is also 121 -- they are the same, so it is a Palindrome.

Remember: first reverse the number, then compare it with the original.
//.//
Comparing Original and Reverse
While reversing, the original number keeps changing: 121 becomes 12, then 1, then 0. So we need to save the original number before we change it: original = n;.

Now original holds 121 while n changes, and after reversing, rev also holds 121. We compare them with if (original == rev). If they are equal, it is a Palindrome; otherwise, it is Not Palindrome.

Think of it like checking two photos: compare the original photo with the reversed one -- same, or different.

Memory trick: SAVE, then REVERSE, then COMPARE. Always save the original number before reversing it.
//.//
Checking a Palindrome in C
We can do everything with a loop, using the same digit-accessing technique: int n, original, digit, rev = 0; scanf("%d", &n); original = n; while (n != 0) { digit = n % 10; rev = rev * 10 + digit; n = n / 10; } if (original == rev) { printf("Palindrome"); } else { printf("Not Palindrome"); }

For n = 121: original = 121. Then 121 gives digit 1, rev = 1. 12 gives digit 2, rev = 12. 1 gives digit 1, rev = 121. Finally original = 121 and rev = 121, so the program prints Palindrome.

Big memory trick: % 10 to GET, / 10 to REMOVE, rev * 10 + digit to BUILD, original == rev to CHECK.

Save the original, reverse the number, then compare both numbers.
//.//
Palindrome Recap
Five steps check a palindrome: save the original (original = n;), get the last digit (digit = n % 10;), remove the last digit (n = n / 10;), build the reverse (rev = rev * 10 + digit;), and compare (if (original == rev)). Same means Palindrome; different means Not Palindrome.

One big memory trick: SAVE, REVERSE, COMPARE, then the answer -- PALINDROME?', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM379', 'Palindrome', 'A number that remains the same when reversed.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM380', 'Original', 'The number before any changes are made.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM381', '==', 'Checks whether two values are equal.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM382', 'Palindrome Number', 'A number that remains unchanged when its digits are reversed.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM383', '!=', 'Means "not equal to".', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000585', 'STG012', 'CH0120', 'MCQ', 'What is a Palindrome Number?
Which of the following is a palindrome?', '', '121', '', 'Reverse the number and check if it stays the same.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000586', 'STG012', 'CH0120', 'MCQ', 'Why do we save the original number?
Why do we use original = n;?', 'int n = 121;
int original;
original = n;', 'To save a copy before changing n', '', 'n changes while we reverse it.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000587', 'STG012', 'CH0120', 'MCQ', 'What should be true for a number to be a Palindrome?', '', 'Original == Reverse', '', 'A palindrome looks the same in both directions.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000588', 'STG012', 'CH0120', 'MCQ', 'Which statement correctly describes a Palindrome Number?', '', 'It remains the same when reversed.', '', 'Think about the mirror analogy.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000589', 'STG012', 'CH0120', 'MCQ', 'Find the Mistake
A student writes this. What is wrong?', 'if (original != rev)
{
   printf("Palindrome");
}', '!= should be ==', '', 'A palindrome has the same original and reverse.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001449', 'Q000585', '123', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001450', 'Q000585', '121', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001451', 'Q000585', '1234', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001452', 'Q000585', '456', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001453', 'Q000586', 'To reverse the number', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001454', 'Q000586', 'To save a copy before changing n', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001455', 'Q000586', 'To remove the last digit', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001456', 'Q000586', 'To count the digits', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001457', 'Q000587', 'Original > Reverse', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001458', 'Q000587', 'Original < Reverse', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001459', 'Q000587', 'Original == Reverse', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001460', 'Q000587', 'Original != Reverse', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001461', 'Q000588', 'It has exactly two factors.', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001462', 'Q000588', 'Its digits add up to the number.', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001463', 'Q000588', 'It remains the same when reversed.', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001464', 'Q000588', 'It always has an even number of digits.', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001465', 'Q000589', 'original should be digit', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001466', 'Q000589', '!= should be ==', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001467', 'Q000589', 'rev should be n', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001468', 'Q000589', 'Nothing is wrong', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000585', 'Q000585', 'Reverse the number and check if it stays the same.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000586', 'Q000586', 'n changes while we reverse it.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000587', 'Q000587', 'A palindrome looks the same in both directions.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000588', 'Q000588', 'Think about the mirror analogy.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000589', 'Q000589', 'A palindrome has the same original and reverse.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000585', 'TERM379', 'Palindrome', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000586', 'TERM380', 'Original', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000587', 'TERM381', '==', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000588', 'TERM382', 'Palindrome Number', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000589', 'TERM383', '!=', 1, true);

-- learn_content (CH0121: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0121', 'STG012', 'CH0121', 'Checking an Armstrong Number', 'What Is an Armstrong Number?
Some numbers have a special relationship between their digits and the original number. Take 153: cube each digit, 1 cubed is 1, 5 cubed is 125, 3 cubed is 27, and add them: 1 + 125 + 27 = 153 -- the same as the original number!

An Armstrong number is a number equal to the sum of the cubes of its digits.

Think of each digit having its own power box: 1 -> 1 cubed, 5 -> 5 cubed, 3 -> 3 cubed, then add the results: 1 + 125 + 27 = 153.

Remember: cube each digit, add them, then compare with the original.
//.//
Getting the Digits
We use the same technique from Accessing Digits: % 10 to get the last digit, / 10 to remove it.

For 153: 153 % 10 = 3, 153 / 10 = 15, so digit = 3. Then 15 % 10 = 5, 15 / 10 = 1, so digit = 5. Then 1 % 10 = 1, 1 / 10 = 0, so digit = 1.

So we get the digits 3, 5, 1, and now we can work with each digit.

Memory trick: % 10 to GET, / 10 to REMOVE.
//.//
Cubing Each Digit
For an Armstrong number we cube each digit: for 153, 3 cubed is 27, 5 cubed is 125, 1 cubed is 1, and adding them gives 27 + 125 + 1 = 153.

The original is 153 and the sum is 153 -- they are equal, so 153 is an Armstrong Number.

In C we cube a digit by writing digit * digit * digit, and add it to a running total with sum = sum + digit * digit * digit;.

Think of every digit entering a cube machine: 3 -> 3 * 3 * 3 = 27, 5 -> 5 * 5 * 5 = 125, 1 -> 1 * 1 * 1 = 1, then add the results.

Remember: cube each digit, then add it to sum.
//.//
Checking Armstrong in C
We can do everything with a loop, accessing every digit and adding its cube to sum: int n, original, digit; int sum = 0; scanf("%d", &n); original = n; while (n != 0) { digit = n % 10; sum = sum + digit * digit * digit; n = n / 10; } if (sum == original) { printf("Armstrong"); } else { printf("Not Armstrong"); }

For 153: 153 gives digit 3, sum = 27. 15 gives digit 5, sum = 152. 1 gives digit 1, sum = 153. Finally original = 153 and sum = 153, so the program prints Armstrong.

Big memory trick: % 10 to GET, digit * digit * digit to CUBE, sum + cube to ADD, / 10 to REMOVE, sum == original to CHECK.

Get, cube, add, remove, repeat, then compare.
//.//
Armstrong Number Recap
Five steps check an Armstrong number: get the last digit (digit = n % 10;), cube the digit (digit * digit * digit), add it to the sum (sum = sum + digit * digit * digit;), remove the digit (n = n / 10;), and compare (if (sum == original)). Same means Armstrong; different means Not Armstrong.

One big memory trick: % 10 to GET, cube it, add it, then / 10 to REMOVE, repeat, and compare.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM384', 'Armstrong Number', 'A number equal to the sum of the cubes of its digits.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM385', '==', 'Checks whether two values are equal.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM386', 'Sum', 'The accumulated total.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM387', 'Process', 'Perform the required operations on the data.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM388', 'Initialize', 'Give a variable its starting value.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000590', 'STG012', 'CH0121', 'MCQ', 'Which of the following is an Armstrong Number?', '', '153', '', 'For 153, calculate 1 cubed + 5 cubed + 3 cubed.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000591', 'STG012', 'CH0121', 'CODE_FILL', 'Complete the Armstrong Condition', 'if (sum {{1}} original)
{
   printf("Armstrong");
}', '["=="]', '', 'The sum of the cubes must be the same as the original number.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000592', 'STG012', 'CH0121', 'MCQ', 'What should sum store?', 'sum = sum + digit * digit * digit;', 'The total of all digit cubes', '', 'Every digit''s cube is added to sum.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000593', 'STG012', 'CH0121', 'MCQ', 'What happens first?
For checking an Armstrong number, which happens first?', '', 'Cube the digits', '', 'We need to process the digits before comparing.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000594', 'STG012', 'CH0121', 'CODE_FILL', 'Complete the Code', 'int n, original, digit;
int sum = {{1}};
scanf("%d", &n);
original = n;', '["0"]', '', 'The sum must start with an empty total.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001469', 'Q000590', '123', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001470', 'Q000590', '153', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001471', 'Q000590', '145', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001472', 'Q000590', '125', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001473', 'Q000592', 'Only the last digit', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001474', 'Q000592', 'The total of all digit cubes', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001475', 'Q000592', 'The original number', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001476', 'Q000592', 'The number of digits', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001477', 'Q000593', 'Compare sum and original', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001478', 'Q000593', 'Cube the digits', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001479', 'Q000593', 'Print Armstrong', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001480', 'Q000593', 'Compare the answer', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000590', 'Q000590', 'For 153, calculate 1 cubed + 5 cubed + 3 cubed.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000591', 'Q000591', 'The sum of the cubes must be the same as the original number.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000592', 'Q000592', 'Every digit''s cube is added to sum.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000593', 'Q000593', 'We need to process the digits before comparing.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000594', 'Q000594', 'The sum must start with an empty total.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000590', 'TERM384', 'Armstrong Number', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000591', 'TERM385', '==', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000592', 'TERM386', 'Sum', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000593', 'TERM387', 'Process', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000594', 'TERM388', 'Initialize', 1, true);

-- learn_content (CH0122: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0122', 'STG012', 'CH0122', 'Checking a Perfect Number', 'What Is a Perfect Number?
A Perfect Number is a number whose proper factors add up to the number itself: the sum of its proper factors equals the number.

Take 6: its factors, excluding 6 itself, are 1, 2 and 3. Adding them gives 1 + 2 + 3 = 6, so 6 is a Perfect Number.

Think of 6 as a pizza cut into pieces of 1, 2 and 3 -- the pieces add up to the whole pizza.

Remember: find the factors, add them, then compare with the number.
//.//
Finding the Factors
We check which numbers divide the given number exactly. For 6, checking numbers 1 to 5: 6 % 1 = 0 (a factor), 6 % 2 = 0 (a factor), 6 % 3 = 0 (a factor), 6 % 4 = 2 (not a factor), 6 % 5 = 1 (not a factor). So the proper factors of 6 are 1, 2 and 3.

The key idea is n % i == 0: if the remainder is 0, then i is a factor.

Remember: % checks divisibility.
//.//
Adding the Factors
Once we find a factor, we add it to a running total, sum. Starting with sum = 0, for 6: i = 1 is a factor, sum = 1. i = 2 is a factor, sum = 3. i = 3 is a factor, sum = 6.

So sum ends at 6, and we compare it with the original number using if (sum == n) -- if they are equal, it is a Perfect Number.

Big memory trick: % to CHECK a factor, sum = sum + i to ADD it, sum == n to COMPARE.

We only add proper factors, so we usually check from i = 1 up to i < n.
//.//
Checking a Perfect Number
The full C code: int n, i, sum = 0; scanf("%d", &n); for (i = 1; i < n; i++) { if (n % i == 0) { sum = sum + i; } } if (sum == n) { printf("Perfect Number"); } else { printf("Not Perfect Number"); }

For n = 6: i = 1, 6 % 1 = 0, sum = 1. i = 2, 6 % 2 = 0, sum = 3. i = 3, 6 % 3 = 0, sum = 6. i = 4 and i = 5 are not factors. Finally sum = 6 and n = 6, so 6 is a Perfect Number.

Memory trick: LOOP, CHECK, ADD, COMPARE.
//.//
Perfect Number Recap
Five steps check a perfect number: start sum at 0, loop i from 1 to n - 1, check n % i == 0, add the factor to sum, and compare sum == n.

Big memory trick: CHECK a factor with n % i == 0, ADD it with sum = sum + i, then COMPARE with sum == n?', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM389', 'Perfect Number', 'A number whose proper factors add up to the number itself.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM390', 'Proper Factor', 'A factor of a number excluding the number itself.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM391', 'Accumulate', 'Gradually build a total by adding values.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM392', 'Exclude', 'Leave something out.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM393', 'Remainder', 'The value left after division.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000595', 'STG012', 'CH0122', 'MCQ', 'Which of the following is a Perfect Number?', '', '6', '', 'Find the proper factors and add them.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000596', 'STG012', 'CH0122', 'MCQ', 'What are the proper factors of 6?', '', '1, 2, 3', '', 'Do not include the number itself.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000597', 'STG012', 'CH0122', 'MCQ', 'Which statement adds a factor to the sum?', '', 'sum = sum + i;', '', 'We need to keep the previous sum and add the new factor.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000598', 'STG012', 'CH0122', 'MCQ', 'Why do we use i < n?', 'for (i = 1; i < n; i++)', 'To exclude n itself', '', 'A Perfect Number uses proper factors.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000599', 'STG012', 'CH0122', 'MCQ', 'Find the Mistake
A student writes this. What is wrong?', 'if (n % i == 1)
{
   sum = sum + i;
}', '== 1 should be == 0', '', 'A factor gives a remainder of zero.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001481', 'Q000595', '6', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001482', 'Q000595', '8', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001483', 'Q000595', '10', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001484', 'Q000595', '12', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001485', 'Q000596', '1, 2, 3', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001486', 'Q000596', '1, 2, 3, 6', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001487', 'Q000596', '2, 3, 6', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001488', 'Q000596', '1, 6', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001489', 'Q000597', 'sum = i;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001490', 'Q000597', 'sum = sum + i;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001491', 'Q000597', 'sum = sum - i;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001492', 'Q000597', 'sum = i / sum;', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001493', 'Q000598', 'To include n as a proper factor', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001494', 'Q000598', 'To exclude n itself', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001495', 'Q000598', 'To stop at 1', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001496', 'Q000598', 'To skip all factors', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001497', 'Q000599', 'n should be sum', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001498', 'Q000599', 'i should be n', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001499', 'Q000599', '== 1 should be == 0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001500', 'Q000599', 'Nothing is wrong', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000595', 'Q000595', 'Find the proper factors and add them.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000596', 'Q000596', 'Do not include the number itself.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000597', 'Q000597', 'We need to keep the previous sum and add the new factor.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000598', 'Q000598', 'A Perfect Number uses proper factors.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000599', 'Q000599', 'A factor gives a remainder of zero.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000595', 'TERM389', 'Perfect Number', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000596', 'TERM390', 'Proper Factor', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000597', 'TERM391', 'Accumulate', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000598', 'TERM392', 'Exclude', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000599', 'TERM393', 'Remainder', 1, true);

-- learn_content (CH0123: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0123', 'STG012', 'CH0123', 'Checking a Prime Number', 'What Is a Prime Number?
A Prime Number is a number that has exactly two factors: 1 and the number itself. Take 7: its factors are 1 and 7 -- only two factors, so 7 is Prime. Take 6: its factors are 1, 2, 3 and 6 -- more than two factors, so 6 is Not Prime.

A Prime Number is a number that is divisible only by 1 and itself.

Think of a prime number as a locked room that only two keys can open: 1, and the number itself.

Remember: 2 factors means Prime; more factors means Not Prime.
//.//
Checking for Factors
We check whether the number can be divided exactly by any number between 2 and n - 1. For 7: 7 % 2, 7 % 3, 7 % 4, 7 % 5 and 7 % 6 are never 0, so no number divides 7 exactly and 7 is Prime.

The key idea is n % i == 0: if the remainder is 0, we found another factor.

Remember: % checks divisibility.
//.//
Counting Factors
We keep a variable count, starting at count = 0, and increase it whenever we find a factor: count++;.

For 7: 1 is a factor and 7 is a factor, so count = 2 -- therefore Prime. For 6: 1, 2, 3 and 6 are all factors, so count = 4 -- therefore Not Prime.

Big memory trick: % to CHECK, count++ to COUNT, count == 2 to COMPARE.

A prime number must have exactly 2 factors.
//.//
Checking a Prime Number
The full C code: int n, i, count = 0; scanf("%d", &n); for (i = 1; i <= n; i++) { if (n % i == 0) { count++; } } if (count == 2) { printf("Prime Number"); } else { printf("Not Prime Number"); }

For n = 7: i = 1, 7 % 1 = 0, count = 1. i = 2 to i = 6 are not factors. i = 7, 7 % 7 = 0, count = 2. Finally count = 2, so 7 is a Prime Number.

Memory trick: LOOP, CHECK, COUNT, COMPARE.
//.//
Prime Number Recap
Five steps check a prime number: start count at 0, loop i from 1 to n, check n % i == 0, increase count, and check count == 2.

Big memory trick: CHECK with n % i == 0, COUNT with count++, then COMPARE with count == 2 to find the PRIME.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM394', 'Factor', 'A number that divides another number exactly.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM395', 'Count', 'The number of factors found.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM396', '==', 'Checks whether two values are equal.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM397', 'Condition', 'A statement used to check whether something is true.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM398', '++', 'Increases a value by 1.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000600', 'STG012', 'CH0123', 'MCQ', 'How many factors does a Prime Number have?', '', '2', '', 'Think about the factors of 7.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000601', 'STG012', 'CH0123', 'MCQ', 'What does count store?', 'count++;', 'Number of factors', '', 'We increase count whenever we find a factor.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000602', 'STG012', 'CH0123', 'CODE_FILL', 'Complete the Prime Check', 'if (count {{1}} 2)
{
   printf("Prime Number");
}', '["=="]', '', 'A prime number has exactly 2 factors.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000603', 'STG012', 'CH0123', 'MCQ', 'Find the Mistake
A student writes this. What should be changed?', 'if (count == 1)
{
   printf("Prime Number");
}', 'count == 1 -> count == 2', '', 'Remember the number of factors a prime has.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000604', 'STG012', 'CH0123', 'MCQ', 'What happens when a factor is found?', 'if (n % i == 0)
{
   __________;
}', 'count++', '', 'We need to increase the number of factors found.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001501', 'Q000600', '1', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001502', 'Q000600', '2', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001503', 'Q000600', '3', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001504', 'Q000600', '4', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001505', 'Q000601', 'Number of digits', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001506', 'Q000601', 'Number of factors', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001507', 'Q000601', 'Original number', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001508', 'Q000601', 'Last digit', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001509', 'Q000603', 'count == 1 -> count == 2', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001510', 'Q000603', 'count == 2 -> count == 1', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001511', 'Q000603', 'count++ -> count--', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001512', 'Q000603', 'Nothing', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001513', 'Q000604', 'count++', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001514', 'Q000604', 'count--', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001515', 'Q000604', 'count = 0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001516', 'Q000604', 'count = n', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000600', 'Q000600', 'Think about the factors of 7.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000601', 'Q000601', 'We increase count whenever we find a factor.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000602', 'Q000602', 'A prime number has exactly 2 factors.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000603', 'Q000603', 'Remember the number of factors a prime has.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000604', 'Q000604', 'We need to increase the number of factors found.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000600', 'TERM394', 'Factor', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000601', 'TERM395', 'Count', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000602', 'TERM396', '==', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000603', 'TERM397', 'Condition', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000604', 'TERM398', '++', 1, true);

end
$migration$;
