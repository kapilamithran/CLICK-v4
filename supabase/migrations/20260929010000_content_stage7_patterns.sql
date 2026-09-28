-- Stage 7 (STG013, PATTERNS) real content, filling the five structural slots CH0124-CH0128 created by
-- 20260929000000_structure_number_crunching_patterns.sql (their titles were the neutral status text 'Content coming soon', with no learn
-- text and no questions). Chapter ids, stage id and order are unchanged: the 5 Patterns PDFs (assets/Contents/Patterns/patterns1-5.pdf) map
-- 1:1 onto the 5 slots. The ONLY existing rows this migration touches are those five chapters' titles, and only while they still hold the
-- placeholder text; everything else is new rows (learn_content, glossary, questions, options, hints, question_terms).
--
-- Chapter titles: patterns1-3.pdf state their chapter titles (Pattern Basics & Simple Patterns; Number & Character Patterns; Spaces,
-- Alignment & Pyramids). patterns4.pdf and patterns5.pdf start at "Slide 1" and state no title, so theirs are taken from their slide
-- headings: Hollow Patterns & Conditions (Understanding Hollow Patterns ... Pattern Conditions) and Combining Patterns & Problem Solving
-- (Combining Patterns ... Pattern Problem-Solving Framework).
--
-- Every PDF ends in a 5-question quiz (25 questions in all), inserted close to verbatim and matched to the nearest DB question type
-- (MCQ / PREDICT_OUTPUT / CODE_FILL / BLANK). Changes: the output choices are written with their exact program spacing (the PDFs draw
-- aligned shapes in a proportional font that loses their spaces); the "fill in the output" of CH0125 is a two-blank code box (row 2 output,
-- row 3 output); and the three CH0128 fill-in-the-blank questions become code blanks inside the shown loop, because the PDF prints the
-- answer in the code it shows.
--
-- Patterns is intentionally NOT unlocked by this migration: the STG013 self-referencing prerequisite row stays (unconditionally locked)
-- until the decks and activities are written and the full test suite passes. A later migration removes that row and adds the
-- stage-to-stage rules.

-- Idempotent: everything runs in one guarded block; if Patterns' learn_content is already present nothing happens. Only new rows are added,
-- plus the five placeholder titles.
do $migration$
begin
  if exists (select 1 from learn_content where learn_id = 'L_CH0124') then
    raise notice 'Stage 7 (PATTERNS) content already present; nothing to do.';
    return;
  end if;

  update chapters set title = case chapter_id
    when 'CH0124' then 'Pattern Basics & Simple Patterns'
    when 'CH0125' then 'Number & Character Patterns'
    when 'CH0126' then 'Spaces, Alignment & Pyramids'
    when 'CH0127' then 'Hollow Patterns & Conditions'
    when 'CH0128' then 'Combining Patterns & Problem Solving'
  end
   where chapter_id in ('CH0124', 'CH0125', 'CH0126', 'CH0127', 'CH0128') and title = 'Content coming soon';

-- learn_content (CH0124: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0124', 'STG013', 'CH0124', 'Pattern Basics & Simple Patterns', 'What Are Patterns?
A pattern is a structured arrangement of characters, numbers, or symbols printed in a specific order. In C programming, patterns are usually created using loops.

Simple idea: Rows + Columns + Repetition -> Pattern.

A simple star pattern has 5 rows. Each row contains stars, and the number of stars increases from one row to the next: 1 star, then 2, then 3, then 4, then 5.

Every pattern can be studied using four questions: 1. Rows - how many lines are printed? 2. Columns - how many elements are printed in each row? 3. Elements - what is being printed? 4. Change - how does the output change from row to row?

Think of arranging chairs in a classroom: Row 1 has 1 chair, Row 2 has 2 chairs, Row 3 has 3 chairs, Row 4 has 4 chairs. The arrangement follows a pattern.

Remember: Pattern = a repeated and organized arrangement of output.
//.//
Pattern Logic
How do we solve a pattern? Before writing C code, first observe the pattern. Do not immediately start typing loops.

Step 1 - Count the rows. Step 2 - Count the elements in each row: Row 1 has 1 star, Row 2 has 2 stars, up to Row 5 with 5 stars. Step 3 - Identify what changes: the number of stars increases by 1 in every row. Step 4 - Convert the logic into loops: one loop to control the rows, and another loop to control the stars in each row.

Simple flow: Observe the pattern -> Count the rows -> Count the elements -> Find the change -> Create the loop logic -> Print the pattern.

Remember: First understand the pattern. Then write the code.
//.//
Basic Nested Loop Structure
A nested loop is a loop placed inside another loop. Patterns commonly use nested loops because we need to repeat rows and repeat elements inside each row.

The basic structure: for (row = 1; row <= n; row++) { for (column = 1; column <= row; column++) { printf("*"); } printf("\n"); }

The outer loop, for (row = 1; row <= n; row++), controls the number of rows. The inner loop, for (column = 1; column <= row; column++), controls how many elements are printed in each row.

How it works: the outer loop starts Row 1, the inner loop prints its elements, then Row 2 starts, and so on.

Why \n? printf("\n"); moves the cursor to the next line after one row is completed. Without it, the entire pattern may appear on one line.

Remember: Outer loop = rows. Inner loop = elements inside each row. \n = move to the next row.
//.//
Increasing & Decreasing Star Patterns
Increasing star pattern: the number of stars increases as the row number increases. Row 1 has 1 star, Row 2 has 2 stars, Row 3 has 3 stars, Row 4 has 4 stars, Row 5 has 5 stars. The C example uses for (row = 1; row <= 5; row++) with an inner for (column = 1; column <= row; column++) that prints one star each time, and printf("\n") after every row.

Decreasing star pattern: the number of stars decreases as the row number increases. Row 1 has 5 stars, Row 2 has 4 stars, Row 3 has 3 stars, Row 4 has 2 stars, Row 5 has 1 star.

Main difference: increasing means more elements each row; decreasing means fewer elements each row.

Important idea: the outer loop controls the row, and the inner loop decides how many stars are printed in that row.
//.//
Common Beginner Mistakes
Mistake 1 - Wrong loop limit. for (row = 1; row < 5; row++) produces only 4 rows. The correct loop is for (row = 1; row <= 5; row++).

Mistake 2 - Missing newline. If the newline is missing after each row, the stars run together in one long line. The correct code prints the stars and then printf("\n").

Mistake 3 - Incorrect loop nesting. The inner loop must be inside the outer loop.

Mistake 4 - Printing outside the inner loop. If the printf("*") is after the inner loop, the star is printed only once instead of once for every inner-loop iteration.

When a pattern looks wrong, check: 1. Loop limits. 2. Loop nesting. 3. Inner-loop condition. 4. Newline position. 5. Where the printf() is placed.

One-line recap: patterns are built by understanding rows, elements, repetition, and using nested loops to reproduce that structure in C.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM341', 'pattern', 'A repeated and organized arrangement of output.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000544', 'STG013', 'CH0124', 'MCQ', 'What is a pattern in C programming?', '', 'A structured arrangement of characters, numbers, or symbols', '', 'Think about an organized arrangement that is printed in a specific order.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000545', 'STG013', 'CH0124', 'MCQ', 'Before writing loops for a pattern, what should you do first?', '', 'Observe the pattern', '', 'Don''t immediately write code. First understand how the pattern is arranged.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000546', 'STG013', 'CH0124', 'PREDICT_OUTPUT', 'What will be the output?', 'int row, column;

for (row = 1; row <= 3; row++) {
   for (column = 1; column <= row; column++) {
      printf("*");
   }
   printf("\n");
}', '*
**
***', '', 'The outer loop controls the rows, while the inner loop prints stars equal to the current row number.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000547', 'STG013', 'CH0124', 'BLANK', 'Fill in the blank with the correct output. What does the second row print?
*
__________
***', 'int row, column;

for (row = 1; row <= 3; row++) {
   for (column = 1; column <= row; column++) {
      printf("*");
   }
   printf("\n");
}', '**', '', 'In an increasing pattern, the number of stars increases with each row.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000548', 'STG013', 'CH0124', 'MCQ', 'What is wrong with the following code?', 'for (row = 1; row < 5; row++) {
   printf("*");
   printf("\n");
}', 'The loop produces only 4 rows instead of 5', '', 'Check the difference between < 5 and <= 5.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001361', 'Q000544', 'A single value stored in a variable', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001362', 'Q000544', 'A structured arrangement of characters, numbers, or symbols', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001363', 'Q000544', 'A type of data type', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001364', 'Q000544', 'A mathematical operator', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001365', 'Q000545', 'Start typing the code', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001366', 'Q000545', 'Count the variables', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001367', 'Q000545', 'Observe the pattern', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001368', 'Q000545', 'Print the output', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001369', 'Q000546', '***
***
***', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001370', 'Q000546', '*
**
***', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001371', 'Q000546', '***
**
*', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001372', 'Q000546', '*
*
*', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001373', 'Q000548', 'The printf() statement is missing', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001374', 'Q000548', 'The loop produces only 4 rows instead of 5', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001375', 'Q000548', 'The inner loop is missing', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001376', 'Q000548', 'row++ is incorrect', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000544', 'Q000544', 'Think about an organized arrangement that is printed in a specific order.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000545', 'Q000545', 'Don''t immediately write code. First understand how the pattern is arranged.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000546', 'Q000546', 'The outer loop controls the rows, while the inner loop prints stars equal to the current row number.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000547', 'Q000547', 'In an increasing pattern, the number of stars increases with each row.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000548', 'Q000548', 'Check the difference between < 5 and <= 5.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000544', 'TERM341', 'pattern', 1, true);

-- learn_content (CH0125: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0125', 'STG013', 'CH0125', 'Number & Character Patterns', 'Increasing Number Patterns
An increasing number pattern prints numbers in a sequence where the number of elements increases from one row to the next: 1, then 12, then 123, then 1234, then 12345.

How does it work? Row 1 prints 1 number, Row 2 prints 2 numbers, and so on. The number of printed values is equal to the row number.

The C example uses for (i = 1; i <= 5; i++) with an inner for (j = 1; j <= i; j++) that prints printf("%d", j); and then printf("\n") after every row.

Remember: Outer loop -> rows. Inner loop -> numbers in each row.
//.//
Repeated Number Patterns
A repeated number pattern prints the same number multiple times within a row: 1, then 22, then 333, then 4444, then 55555.

How does it work? Row 1 prints 1 one time, Row 2 prints 2 two times, Row 3 prints 3 three times. The row number decides what number to print.

In the increasing pattern the code prints printf("%d", j); - the column number is printed. In the repeated pattern the code prints printf("%d", i); - the row number is printed.

Remember: i -> which row? j -> which position in the row?
//.//
Continuous Number Patterns
A continuous number pattern keeps increasing the number across rows instead of starting again from 1 in every row: 1, then 23, then 456, then 78910.

How does it work? The numbers continue from where the previous row ended: Row 1 prints 1, Row 2 prints 2 3, Row 3 prints 4 5 6, Row 4 prints 7 8 9 10.

Why do we need another variable? The row variable i tells us which row we are on. The inner variable j tells us which position we are printing. Neither one alone gives us the complete continuous sequence. So we use another variable such as num. The code prints printf("%d", num); and then num++;

Remember: when the value must continue across rows, maintain a separate variable. num -> number being printed.
//.//
Character Patterns
A character pattern uses letters or other characters instead of numbers: A, then AB, then ABC, then ABCD, then ABCDE.

How does it work? Row 1 prints A, Row 2 prints AB, Row 3 prints ABC, and so on. The number of characters increases with the row number.

Character arithmetic in C: characters have numeric values internally. ''A'' + 0 gives A, ''A'' + 1 gives B, ''A'' + 2 gives C, ''A'' + 3 gives D. So we can generate letters using printf("%c", ''A'' + j - 1);

Remember: %c prints a character. ''A'' + j - 1 generates the next letters.
//.//
Using Loop Variables in Patterns
Which variable should we print? In pattern programs, the most important question is: should we print i, j, or another variable?

Print i when the value depends on the row: printf("%d", i); gives 1, 22, 333, 4444. Print j when the value depends on the position inside the row: printf("%d", j); gives 1, 12, 123, 1234. Use another variable when the value needs to continue independently across rows: int num = 1; then printf("%d", num); num++; gives 1, 23, 456, 78910. For letters, printf("%c", ''A'' + j - 1); generates A, B, C, D, E.

Quick comparison: 1, 12, 123 -> print j. 1, 22, 333 -> print i. 1, 23, 456 -> print num. A, AB, ABC -> print ''A'' + j - 1.

Remember: i -> row. j -> position. num -> continuous value. Character arithmetic -> generate letters.

One-line recap: in pattern programming, the output value depends on what changes: the row, the position, or an independent sequence.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM342', 'outer loop', 'The loop that controls the larger structure, such as the number of rows in a pattern.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000549', 'STG013', 'CH0125', 'MCQ', 'In an increasing number pattern, what does the outer loop usually control?', '', 'The rows', '', 'The outer loop decides how many rows the pattern will have.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000550', 'STG013', 'CH0125', 'PREDICT_OUTPUT', 'What will be the output?', 'int i, j;

for (i = 1; i <= 3; i++) {
   for (j = 1; j <= i; j++) {
      printf("%d", i);
   }
   printf("\n");
}', '1
22
333', '', 'The code prints i, so the row number is repeated.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000551', 'STG013', 'CH0125', 'CODE_FILL', 'Fill in the output
Complete the output that this program prints.', 'int i, j, num = 1;

for (i = 1; i <= 3; i++) {
   for (j = 1; j <= i; j++) {
      printf("%d", num);
      num++;
   }
   printf("\n");
}

Output:
1
{{1}}
{{2}}', '["23","456"]', '', 'The variable num does not restart. It continues increasing across rows.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000552', 'STG013', 'CH0125', 'CODE_FILL', 'Fill the Missing Code
Complete the code to print:
A
AB
ABC', 'int i, j;

for (i = 1; i <= 3; i++) {
   for (j = 1; j <= i; j++) {
      printf("{{1}}", ''A'' + j - 1);
   }
   printf("\n");
}', '["%c"]', '', '%c is used to print a character.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000553', 'STG013', 'CH0125', 'PREDICT_OUTPUT', 'What will be the output?', 'int i, j;

for (i = 1; i <= 3; i++) {
   for (j = 1; j <= i; j++) {
      printf("%d", j);
   }
   printf("\n");
}', '1
12
123', '', 'The code prints j. Remember: j represents the position inside the row.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001377', 'Q000549', 'The numbers being printed', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001378', 'Q000549', 'The rows', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001379', 'Q000549', 'The characters', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001380', 'Q000549', 'The remainder', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001381', 'Q000550', '1
12
123', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001382', 'Q000550', '1
22
333', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001383', 'Q000550', '123
123
123', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001384', 'Q000550', '1
2
3', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001385', 'Q000553', '1
22
333', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001386', 'Q000553', '1
12
123', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001387', 'Q000553', '123
123
123', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001388', 'Q000553', '1
23
456', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000549', 'Q000549', 'The outer loop decides how many rows the pattern will have.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000550', 'Q000550', 'The code prints i, so the row number is repeated.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000551', 'Q000551', 'The variable num does not restart. It continues increasing across rows.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000552', 'Q000552', '%c is used to print a character.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000553', 'Q000553', 'The code prints j. Remember: j represents the position inside the row.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000549', 'TERM342', 'outer loop', 1, true);

-- learn_content (CH0126: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0126', 'STG013', 'CH0126', 'Spaces, Alignment & Pyramids', 'Why Do Spaces Matter?
A space is also a character that can be printed as part of a pattern. Spaces help us control where a symbol appears on the screen.

Simple idea: Spaces -> Position -> Shape.

In a left-aligned pattern, the stars begin from the same position. In a right-aligned pattern, spaces are printed before the stars, so the stars move toward the right. The stars may increase in the same way, but spaces change their position.

Remember: spaces are not empty. They are part of the pattern.
//.//
Right-Aligned Triangle
A right-aligned triangle is a pattern where the stars move toward the right side of the output.

For 5 rows: Row 1 has 4 spaces and 1 star, Row 2 has 3 spaces and 2 stars, Row 3 has 2 spaces and 3 stars, Row 4 has 1 space and 4 stars, Row 5 has 0 spaces and 5 stars.

The C example has two inner loops: the first loop, for (int j = 1; j <= n - i; j++), prints spaces with printf(" "); and the second loop, for (int j = 1; j <= i; j++), prints stars with printf("*"); Then printf("\n") ends the row.

Remember: right alignment = spaces first + stars after.
//.//
Space + Star Logic
What happens in each row? In a right-aligned triangle, spaces decrease and stars increase. For n = 5: Row 1 is 4 spaces + 1 star, Row 2 is 3 spaces + 2 stars, Row 3 is 2 spaces + 3 stars, Row 4 is 1 space + 4 stars, Row 5 is 0 spaces + 5 stars.

For every next row, spaces decrease by 1 and stars increase by 1.

Formula for row i: Spaces = n - i and Stars = i. For example, if n = 5 and i = 3, then Spaces = 5 - 3 = 2 and Stars = 3.

Simple thinking: row number -> calculate spaces -> print spaces -> calculate stars -> print stars -> new line.

Remember: spaces control position. Stars control size.
//.//
Full Pyramid
A full pyramid has stars centered around the middle of the output. For 5 rows: Row 1 has 4 spaces and 1 star, Row 2 has 3 spaces and 3 stars, Row 3 has 2 spaces and 5 stars, Row 4 has 1 space and 7 stars, Row 5 has 0 spaces and 9 stars.

What do we notice? Spaces decrease: 4, 3, 2, 1, 0. Stars increase by 2: 1, 3, 5, 7, 9.

The C example prints spaces with for (int j = 1; j <= n - i; j++) and stars with for (int j = 1; j <= 2 * i - 1; j++).

A pyramid needs spaces + stars. The number of stars is not simply equal to the row number.

Remember: pyramid = decreasing spaces + increasing odd number of stars.
//.//
Pyramid Formulas
How do we find the number of spaces? For every row, the number of spaces decreases by one: Row 1 has n - 1 spaces, Row 2 has n - 2 spaces, Row 3 has n - 3 spaces. So Spaces = n - i.

How do we find the number of stars? The stars follow odd numbers: 1, 3, 5, 7, 9. The formula for row i is Stars = 2 * i - 1.

Example: n = 5 and i = 3 gives Spaces = 5 - 3 = 2 and Stars = 2 * 3 - 1 = 5, so row 3 is five stars after two spaces.

Complete logic: for each row, print n - i spaces, then 2 * i - 1 stars, then a new line.

Remember: right triangle: Spaces = n - i, Stars = i. Full pyramid: Spaces = n - i, Stars = 2 * i - 1.

One-line recap: spaces decide where the pattern starts, while stars decide how wide the pattern becomes.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM343', 'Position', 'The place where something appears.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM344', 'Right-aligned', 'A pattern where spaces are printed before the symbols so they appear toward the right.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM345', 'n', 'Total number of rows.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM346', 'i', 'Current row number.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM347', 'Odd numbers', 'Numbers such as 1, 3, 5, 7, 9 that increase by 2.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM348', 'Decrease', 'To become smaller by a given amount.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000554', 'STG013', 'CH0126', 'MCQ', 'What is the main purpose of spaces in a pattern?', '', 'To control where symbols appear on the screen', '', 'Think about how spaces affect the position of stars.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000555', 'STG013', 'CH0126', 'PREDICT_OUTPUT', 'What will be the output of the following C program?', '#include <stdio.h>

int main() {

   int n = 4;

   for (int i = 1; i <= n; i++) {

      for (int j = 1; j <= n - i; j++) {
         printf(" ");
      }

      for (int j = 1; j <= i; j++) {
         printf("*");
      }

      printf("\n");
   }

   return 0;
}', '   *
  **
 ***
****', '', 'The first inner loop prints n - i spaces before the stars.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000556', 'STG013', 'CH0126', 'CODE_FILL', 'Fill the Missing Code
Complete the code to create a right-aligned triangle.', 'int n = 5;

for (int i = 1; i <= n; i++) {

   for (int j = 1; j <= {{1}}; j++) {
      printf(" ");
   }

   for (int j = 1; j <= i; j++) {
      printf("*");
   }

   printf("\n");
}', '["n - i"]', '', 'For a right-aligned triangle, spaces decrease as the row number increases. The formula is n - i.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000557', 'STG013', 'CH0126', 'CODE_FILL', 'Fill the Missing Code
Complete the code to print the correct number of stars in a full pyramid.', 'int n = 5;

for (int i = 1; i <= n; i++) {

   for (int j = 1; j <= n - i; j++) {
      printf(" ");
   }

   for (int j = 1; j <= {{1}}; j++) {
      printf("*");
   }

   printf("\n");
}', '["2 * i - 1"]', '', 'The number of stars in each row follows the sequence 1, 3, 5, 7, 9.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000558', 'STG013', 'CH0126', 'CODE_FILL', 'Fill the Missing Code
Complete the code to print the spaces for a full pyramid.', 'int n = 5;

for (int i = 1; i <= n; i++) {
   for (int j = 1; j <= {{1}}; j++) {
      printf(" ");
   }

   for (int j = 1; j <= 2 * i - 1; j++) {
      printf("*");
   }

   printf("\n");
}', '["n - i"]', '', 'The number of spaces decreases by 1 for every new row.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001389', 'Q000554', 'To increase the number of stars', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001390', 'Q000554', 'To control where symbols appear on the screen', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001391', 'Q000554', 'To stop the loop', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001392', 'Q000554', 'To print numbers', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001393', 'Q000555', '*
**
***
****', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001394', 'Q000555', '   *
  **
 ***
****', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001395', 'Q000555', '****
***
**
*', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001396', 'Q000555', '*
***
*****
*******', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000554', 'Q000554', 'Think about how spaces affect the position of stars.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000555', 'Q000555', 'The first inner loop prints n - i spaces before the stars.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000556', 'Q000556', 'For a right-aligned triangle, spaces decrease as the row number increases. The formula is n - i.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000557', 'Q000557', 'The number of stars in each row follows the sequence 1, 3, 5, 7, 9.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000558', 'Q000558', 'The number of spaces decreases by 1 for every new row.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000554', 'TERM343', 'Position', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000555', 'TERM344', 'Right-aligned', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000556', 'TERM345', 'n', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000556', 'TERM346', 'i', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000557', 'TERM347', 'Odd numbers', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000558', 'TERM348', 'Decrease', 1, true);

-- learn_content (CH0127: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0127', 'STG013', 'CH0127', 'Hollow Patterns & Conditions', 'Understanding Hollow Patterns
A hollow pattern is a pattern where we print characters only along the boundary of a shape. The inside of the shape is left empty by printing spaces.

A filled square prints * at every position. A hollow square prints * only at the boundary: the first row, the last row, the first column and the last column, with spaces inside.

How do we build a hollow square? Suppose the square has 5 rows and 5 columns. We can imagine every position as a combination of a row number and a column number. The stars appear when the position belongs to the border.

A position is part of the border when it is in the first row, it is in the last row, it is in the first column, or it is in the last column. Every other position belongs to the inside.

Key idea: a hollow pattern is not about printing fewer characters randomly. It is about identifying which positions belong to the boundary.
//.//
Border Conditions
Now we convert the visual idea into a programming condition. For every position (row, column), we ask: is this position on the border? If yes, printf("*"); otherwise printf(" ");

For a square of size n the border condition is: if (row == 1 || row == n || column == 1 || column == n). This means row == 1 is the first row, row == n is the last row, column == 1 is the first column and column == n is the last column. The || operator means OR, so the position needs to satisfy at least one of these conditions.

The nested loops still visit every position. The if statement decides what should be printed there.

Important concept: loops decide where to go. Conditions decide what to print. That distinction becomes extremely useful for almost every advanced pattern.
//.//
Hollow Triangle
The same idea can be applied to a triangle. In a hollow triangle the stars are not simply based on "print i stars". Instead, we need to identify the boundary of each row.

For 5 rows: Row 1 is one star, Row 2 is two stars (both positions are boundaries), Row 3 has a star at the first and last positions, Row 4 has a star at the first and last positions, and Row 5 is the complete bottom boundary.

Boundary rule: for a left-aligned hollow triangle, a position should contain * when it is the first column, it is the last position of the current row, or it is the last row. Otherwise it is a space.

Why do we need the last-row condition? The bottom row is entirely filled. Without the last-row condition the triangle would not have a proper base.

General lesson: different shapes can use the same basic programming tools: nested loops + row position + column position + condition = pattern.
//.//
X Pattern
The X pattern is different because its characters are positioned along diagonals. Imagine the pattern as a grid. There are two diagonals.

Main diagonal: it goes from top-left to bottom-right. For a square grid this happens when row == column.

Opposite diagonal: it goes from top-right to bottom-left. For a grid of size n this happens when row + column == n + 1.

Combining both diagonals: a position belongs to the X when row == column || row + column == n + 1. Then printf("*"); otherwise printf(" ");

The important idea: the program does not know that we are trying to draw an X. It simply checks every position: is this position on diagonal 1, or on diagonal 2? A visual shape can often be represented as a mathematical condition on row and column positions.
//.//
Pattern Conditions
At this point, stop thinking of patterns as individual programs. Instead ask three questions.

Question 1: what are the rows? The outer loop controls them: for (int row = 1; row <= n; row++).

Question 2: what are the positions? Every row contains multiple column positions. The inner loop controls them: for (int column = 1; column <= n; column++). So the outer loop controls rows and the inner loop controls columns.

Question 3: what should be printed? At every position ask: should I print a character, or should I print a space? For a hollow square use if (row == 1 || row == n || column == 1 || column == n). For an X use if (row == column || row + column == n + 1). The loop structure can remain almost identical. Only the condition changes.

Pattern-solving framework: count the rows, identify row positions, identify column positions, find where characters should appear, write the condition, print the character or space, then move to the next row.

Before writing C code ask: 1. Where should the character appear? 2. Where should the space appear? 3. Can I describe the character positions using row and column numbers? If the answer to the third question is yes, the pattern can usually be converted into a nested-loop solution.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM349', 'Boundary', 'The outer edge of a shape.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM350', 'Border', 'The outer boundary of a shape.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM351', 'Column', 'A vertical position in the pattern.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM352', 'Diagonal', 'A line of positions moving diagonally across a grid.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM353', '||', 'Logical OR. It means at least one of the conditions must be TRUE.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000559', 'STG013', 'CH0127', 'MCQ', 'What is the main idea behind a hollow pattern?', '', 'Print characters only at the boundary and spaces inside', '', 'A hollow shape has an empty inside.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000560', 'STG013', 'CH0127', 'PREDICT_OUTPUT', 'What will be the output of the following C program?', '#include <stdio.h>

int main() {

   int n = 4;

   for (int row = 1; row <= n; row++) {

      for (int column = 1; column <= n; column++) {

         if (row == 1 || row == n ||
             column == 1 || column == n) {
            printf("*");
         }
         else {
            printf(" ");
         }
      }

      printf("\n");
   }

   return 0;
}', '****
*  *
*  *
****', '', 'A * is printed when the position is in the first row, last row, first column, or last column.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000561', 'STG013', 'CH0127', 'CODE_FILL', 'Fill the Missing Code
Complete the condition to create a hollow square.', 'for (int row = 1; row <= n; row++) {

   for (int column = 1; column <= n; column++) {

      if (row == 1 || row == n ||
          column == 1 || column == {{1}}) {
         printf("*");
      }
      else {
         printf(" ");
      }
   }

   printf("\n");
}', '["n"]', '', 'The last column has the same number as the total number of columns, n.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000562', 'STG013', 'CH0127', 'CODE_FILL', 'Fill the Missing Code
Complete the condition for the main diagonal of an X pattern.', 'for (int row = 1; row <= n; row++) {

   for (int column = 1; column <= n; column++) {

      if (row {{1}} column) {
         printf("*");
      }
      else {
         printf(" ");
      }
   }
   printf("\n");
}', '["=="]', '', 'The main diagonal goes from the top-left corner to the bottom-right corner. On this diagonal, the row number and column number are equal.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000563', 'STG013', 'CH0127', 'CODE_FILL', 'Fill the Missing Code
Complete the condition to print both diagonals of an X pattern.', 'for (int row = 1; row <= n; row++) {

   for (int column = 1; column <= n; column++) {

      if (row == column ||
          row + column == {{1}}) {
         printf("*");
      }
      else {
         printf(" ");
      }
   }

   printf("\n");
}', '["n + 1"]', '', 'For the opposite diagonal, the row and column numbers add up to n + 1.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001397', 'Q000559', 'Print * at every position', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001398', 'Q000559', 'Print characters only at the boundary and spaces inside', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001399', 'Q000559', 'Print spaces only', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001400', 'Q000559', 'Print characters only in the first row', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001401', 'Q000560', '****
****
****
****', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001402', 'Q000560', '*
**
***
****', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001403', 'Q000560', '****
*  *
*  *
****', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001404', 'Q000560', '****
**
**
****', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000559', 'Q000559', 'A hollow shape has an empty inside.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000560', 'Q000560', 'A * is printed when the position is in the first row, last row, first column, or last column.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000561', 'Q000561', 'The last column has the same number as the total number of columns, n.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000562', 'Q000562', 'The main diagonal goes from the top-left corner to the bottom-right corner. On this diagonal, the row number and column number are equal.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000563', 'Q000563', 'For the opposite diagonal, the row and column numbers add up to n + 1.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000559', 'TERM349', 'Boundary', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000560', 'TERM350', 'Border', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000561', 'TERM351', 'Column', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000562', 'TERM352', 'Diagonal', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000563', 'TERM353', '||', 1, true);

-- learn_content (CH0128: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0128', 'STG013', 'CH0128', 'Combining Patterns & Problem Solving', 'Combining Patterns
Not every pattern can be created using a single simple loop structure. Some patterns are made by combining two or more smaller patterns.

For example, a pattern that grows from 1 star to 4 stars and then shrinks back through 3, 2 and 1 stars can be divided into two parts: an increasing pattern and a decreasing pattern.

How do we build a combined pattern? 1. Identify the first part of the pattern. 2. Identify the second part of the pattern. 3. Find the logic used by each part. 4. Write the loops for each part. 5. Combine both parts into one program.

Important idea: a complex pattern does not always require completely new logic. Simple pattern + simple pattern = complex pattern.

When analyzing a combined pattern, ask: where does the first shape end? Where does the second shape begin? Does the number of symbols increase or decrease? Do spaces change? Does the printed value change?

Key takeaway: break a large pattern into smaller, understandable sections before writing the C program.
//.//
Diamond Pattern
A diamond pattern is a combination of an upper pyramid and a lower inverted pyramid. Instead of trying to solve the entire pattern at once, divide it into two parts.

Part 1, the upper pyramid: the number of stars increases in every row, and the number of spaces decreases as the pattern moves downward. Stars appear in odd numbers: 1, 3, 5, 7.

Part 2, the lower inverted pyramid: the number of stars decreases in every row, and the number of spaces increases as the pattern moves downward. Stars continue in reverse order: 5, 3, 1.

Important concept: the diamond is not a completely new pattern. Upper pyramid + lower inverted pyramid = diamond. This teaches an important programming skill: solving a large problem by dividing it into smaller problems.

Key takeaway: when a pattern looks complicated, do not immediately try to write one giant loop. First ask: can I divide this pattern into smaller patterns that I already understand?
//.//
Number Pyramid Patterns
A number pyramid uses numbers instead of symbols while maintaining a pyramid-shaped structure. Rows print 1, then 123, then 12345, then 1234567, centered with spaces.

This pattern has three important components: 1. Spaces. 2. Numbers. 3. The number of values printed in each row.

Understanding the spaces: the spaces move the numbers toward the center, and the number of spaces decreases as the row number increases. For 4 rows: Row 1 has 3 spaces, Row 2 has 2 spaces, Row 3 has 1 space, Row 4 has 0 spaces. Spaces = n - i, where n is the total number of rows and i is the current row.

Understanding the numbers: the number of values increases by 2 for every row: 1, 3, 5, 7. This is an odd-number sequence: 2 * i - 1.

Important observation: the pattern can be separated into independent questions: how many spaces should I print? How many numbers should I print? Which numbers should I print?

Key takeaway: a pattern is usually easier to solve when you analyze each part of a row separately instead of looking at the complete output as one large shape.
//.//
How to Analyze Any Pattern
Don''t start with code. When students see a pattern, the first instinct is often to immediately start writing for loops. Before writing code, analyze the pattern first.

Step 1: count the rows. This usually becomes the outer loop. Step 2: analyze each row - how many spaces, stars or numbers are there, and does the value change? Step 3: count spaces - for aligned patterns, spaces are part of the pattern, and their relationship with the row number must be determined. Step 4: count symbols or numbers - for example 1, 3, 5, 7 gives a mathematical relationship. Step 5: identify what changes - increasing values, decreasing values, repeated values, odd-number sequences, even-number sequences, changing spaces, changing characters. Step 6: find the formula or rule, for example Stars = 2 * i - 1 or Spaces = n - i. Step 7: convert the logic into loops: outer loop, print spaces, print symbols or numbers, move to the next line.

Key takeaway: analyze first, code second. The loops should be the result of your analysis, not the starting point.
//.//
Pattern Problem-Solving Framework
A general method for solving patterns. Most pattern problems can be solved using the same basic thinking process: identify the rows, identify the positions, decide what should be printed, decide how many times, find the condition, then build nested loops plus conditions to produce the output.

1. Identify the rows: the outer loop usually controls the rows, for (i = 1; i <= n; i++). 2. Identify positions: a character has a row position and a column position, and the decision to print * depends on its position. 3. Decide what to print: a star, a number, a character or a space. 4. Determine how many times: it may depend on the current row, total rows, current column or a mathematical formula. 5. Identify conditions: for example if (i == 1 || i == n) could identify the first and last rows of a hollow pattern, and if (i == j) identifies a diagonal. 6. Build the nested loops: outer loop, inner loop, check the condition, print a character or a space, print a newline.

The most important rule: do not memorize the code for every pattern. Learn to answer: 1. How many rows are there? 2. What changes from row to row? 3. How many spaces are required? 4. How many characters are required? 5. What should be printed at each position? 6. Is there a condition controlling the output? 7. Can the pattern be divided into smaller patterns?

Final takeaway: pattern programming is not really about stars, numbers, or pyramids. It is about learning to observe, analyze, find the rule, build the loops and produce the output.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM354', 'Combined pattern', 'A pattern formed by joining two or more smaller patterns.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM355', 'Nested loop', 'A loop inside another loop.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM356', 'i++', 'Increases i by 1.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM357', 'i--', 'Decreases i by 1.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM358', 'Odd-number sequence', 'A sequence such as 1, 3, 5, 7.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM359', 'i', 'Current row number.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM360', 'Alignment', 'Positioning the pattern using spaces.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM361', 'Current row', 'The row currently being processed by the outer loop.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM362', 'Inverted pyramid', 'A pattern where the number of symbols decreases row by row.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM363', 'Diamond', 'An upper pyramid combined with a lower inverted pyramid.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000564', 'STG013', 'CH0128', 'MCQ', 'What is the best approach when a pattern looks complex?', '', 'Break the pattern into smaller, understandable patterns', '', 'Complex patterns are often combinations of simpler patterns.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000565', 'STG013', 'CH0128', 'PREDICT_OUTPUT', 'What will be the output of the following C program?', '#include <stdio.h>

int main() {
   int i;

   for (i = 1; i <= 4; i++)
      printf("*");

   printf("\n");

   for (i = 3; i >= 1; i--)
      printf("*");

   return 0;
}', '****
***', '', 'The first loop prints 4 stars. The second loop prints 3 stars.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000566', 'STG013', 'CH0128', 'CODE_FILL', 'Fill the Missing Code
Complete the code to print the upper part of a number pyramid, with an odd number of values in each row (1, 3, 5, 7...). How many values are printed in row i?', 'int n = 4;

for (int i = 1; i <= n; i++) {
   for (int j = 1; j <= 2 * {{1}} - 1; j++) {
      printf("%d", j);
   }
   printf("\n");
}', '["i"]', '', 'The number of values follows 1, 3, 5, 7....', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000567', 'STG013', 'CH0128', 'CODE_FILL', 'Fill the Missing Code
Complete the code to print the spaces before the numbers in a number pyramid. The number of spaces in each row is n - ___.', 'int n = 4;

for (int i = 1; i <= n; i++) {

   for (int j = 1; j <= n - {{1}}; j++) {
      printf(" ");
   }

   for (int j = 1; j <= 2 * i - 1; j++) {
      printf("%d", j);
   }

   printf("\n");
}', '["i"]', '', 'As the row number increases, the number of spaces decreases.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000568', 'STG013', 'CH0128', 'CODE_FILL', 'Fill the Missing Code
A diamond combines an upper pyramid with a lower inverted pyramid. Complete the start of the lower half so that its rows go down from the widest row to 1.', 'int n = 5;

for (int i = {{1}}; i >= 1; i--) {

   for (int j = 1; j <= n - i; j++) {
      printf(" ");
   }

   for (int j = 1; j <= 2 * i - 1; j++) {
      printf("*");
   }

   printf("\n");
}', '["n - 1"]', '', 'The lower half begins after the widest row, so it starts from one row less than n.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001405', 'Q000564', 'Write one large loop immediately', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001406', 'Q000564', 'Memorize a similar program', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001407', 'Q000564', 'Break the pattern into smaller, understandable patterns', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001408', 'Q000564', 'Avoid using nested loops', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001409', 'Q000565', '****
***', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001410', 'Q000565', '****
**', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001411', 'Q000565', '***
****', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001412', 'Q000565', '*******', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000564', 'Q000564', 'Complex patterns are often combinations of simpler patterns.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000565', 'Q000565', 'The first loop prints 4 stars. The second loop prints 3 stars.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000566', 'Q000566', 'The number of values follows 1, 3, 5, 7....', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000567', 'Q000567', 'As the row number increases, the number of spaces decreases.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000568', 'Q000568', 'The lower half begins after the widest row, so it starts from one row less than n.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000564', 'TERM354', 'Combined pattern', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000564', 'TERM355', 'Nested loop', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000565', 'TERM356', 'i++', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000565', 'TERM357', 'i--', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000566', 'TERM358', 'Odd-number sequence', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000566', 'TERM359', 'i', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000567', 'TERM360', 'Alignment', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000567', 'TERM361', 'Current row', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000568', 'TERM362', 'Inverted pyramid', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000568', 'TERM363', 'Diamond', 2, true);

end
$migration$;
