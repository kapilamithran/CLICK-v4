-- Stage 8 (STG009, SEARCHING & SORTING) real content, replacing the structural placeholders added by
-- 20260917120000_stage6to10_placeholders.sql. That migration reserved chapter_id's CH0079-CH0093 (15
-- chapters, titles taken straight from the Searching & Sorting1-15 PDF source set under
-- assets/Contents/Searching & Sorting Pdfs/) with zero learn_content/questions/etc, which is what kept
-- the stage out of Practice and out of the unified-chapter Home path. This migration fills in the real
-- learn_content + questions/options/hints/glossary for all 15 chapters (unchanged IDs, titles, stage_id
-- - no renumbering, no new chapter_id needed: 15 PDFs map 1:1 onto the 15 reserved placeholders).
--
-- Source PDFs 1-8 (CH0079-CH0086) each end in a 5-6 question quiz written by the source material itself;
-- those questions are inserted close to verbatim (KEEP/CONVERT only - matched to the nearest existing
-- DB question type). Source PDFs 9-15 (CH0087-CH0093) are a different, plain-text "recap" style with no
-- embedded quiz at all; their questions are original, authored directly from that PDF's own stated facts
-- (comparison tables, key-idea callouts, worked trace examples) rather than lifted from a quiz section.
--
-- Stage 8 is intentionally NOT unlocked by this migration: the STG009 self-referencing prerequisite row
-- from the placeholder migration is left in place (still unconditionally locked) until the chapter decks
-- + activities are written and the full test suite (content validation, unit, e2e) passes. A later
-- migration removes exactly that one row, mirroring the STG007 (Arrays) unlock precedent.

-- Idempotent: everything below runs inside one guarded block. If Stage 8's learn_content is already present
-- (this migration was applied before), the block does nothing, so a re-run can never duplicate rows or fail
-- half way. Nothing is deleted or altered except CH0086's question_limit, and only that one placeholder row.
do $migration$
begin
  if exists (select 1 from learn_content where learn_id = 'L_CH0079') then
    raise notice 'Stage 8 (SEARCHING & SORTING) content already present; nothing to do.';
    return;
  end if;

-- learn_content (one row per chapter; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0079', 'STG009', 'CH0079', 'Searching Basics', 'What is Searching?
Searching is the process of finding a particular value from a collection of values, called the target.

Numbers: 12 25 8 40 17, target = 8. The computer checks the available values to determine whether the target is present.

Real-life example: you have many books and want to find "C Programming". You search through the books until you find the one you need.

Remember: Searching = finding a required item from a collection.//.//Target, Found & Not Found
When searching, there are two important things: the target (the value we are looking for) and the search result.

10 25 40 15 30, target = 40. If the target exists, the result is Found. If it does not exist, the result is Not Found.

Search for 15 in 10 25 40 15 30: 10, 25, 40 do not match, then 15 matches - Found. Search for 50 in the same array: none of the five values match - Not Found.//.//Types of Searching
There are different ways to search through data. Two important searching methods are Linear Search and Binary Search.

Linear Search checks values one by one: 10 -> 25 -> 40 -> 15 -> 30. It works even when the data is not sorted.

Binary Search repeatedly divides the search area into two parts: 10 20 30 40 50 60 70, checking the middle first. It requires the data to be sorted.

Remember: Linear -> One by One. Binary -> Divide into Two.//.//Linear vs Binary Search
Linear Search checks values one by one and can work on unsorted data; its basic idea is to check each value.

Binary Search divides the data and requires it to be sorted; its basic idea is to check the middle and narrow down.

Beginner example: Linear Search is like searching a name in an unsorted list. Binary Search is like finding a word in a dictionary.

For 2 5 8 12 16 20 25, finding 20: Linear Search checks 2, 5, 8, 12, 16, 20 in order. Binary Search starts around the middle and decides which half to search. Different situations can need different searching methods.//.//RECAP
Searching means finding a value in a collection. The target is the value we want to find. Found means the target exists; Not Found means it does not.

Two types to learn: Linear Search (one by one) and Binary Search (divide and search).

Memory trick: LINEAR = look one by one. BINARY = break into two.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM165', 'searching', 'Finding something you are looking for.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM166', 'target', 'The value we are looking for.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM167', 'linear search', 'A searching method that checks values one by one.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM168', 'target', 'The value we want to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM169', 'target', 'The value being searched for.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000393', 'STG009', 'CH0079', 'MCQ', 'What is the main purpose of searching?', '', 'To find a required value', '', 'Think about what you do when you are looking for something specific.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000394', 'STG009', 'CH0079', 'MCQ', 'In searching, what do we call the value that we are looking for?', '', 'Target', '', 'The name given to the value you want to find is related to aiming at something.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000395', 'STG009', 'CH0079', 'MCQ', 'Which of the following is a type of searching?', '', 'Linear Search', '', 'One option is a searching method that checks values one by one.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000396', 'STG009', 'CH0079', 'BLANK', 'A value that we want to find in a collection is called the __________.', '', 'Target', '', 'Think about the value you are aiming to find.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000397', 'STG009', 'CH0079', 'CODE_FILL', 'Complete the missing code to check whether the target value 25 is present.', 'int numbers[] = {10, 15, 25, 30};
int target = 25;

if(numbers[2] == {{1}})
   printf("Found");', '["target"]', '', 'The missing word should represent the value we are searching for.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001018', 'Q000393', 'To arrange values', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001019', 'Q000393', 'To find a required value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001020', 'Q000393', 'To delete values', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001021', 'Q000393', 'To add values', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001022', 'Q000394', 'Index', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001023', 'Q000394', 'Target', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001024', 'Q000394', 'Array', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001025', 'Q000394', 'Loop', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001026', 'Q000395', 'Linear Search', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001027', 'Q000395', 'Bubble Search', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001028', 'Q000395', 'Selection Search', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001029', 'Q000395', 'Insertion Search', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000393', 'Q000393', 'Think about what you do when you are looking for something specific.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000394', 'Q000394', 'The name given to the value you want to find is related to aiming at something.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000395', 'Q000395', 'One option is a searching method that checks values one by one.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000396', 'Q000396', 'Think about the value you are aiming to find.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000397', 'Q000397', 'The missing word should represent the value we are searching for.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000393', 'TERM165', 'searching', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000394', 'TERM166', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000395', 'TERM167', 'linear search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000396', 'TERM168', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000397', 'TERM169', 'target', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0080', 'STG009', 'CH0080', 'Linear Search', 'Meet Linear Search
Linear Search is a method of finding a target by checking values one after another, starting from the beginning.

10 25 40 15 30, target = 15: check 10 (no), 25 (no), 40 (no), 15 (yes) - target found!

Easy memory trick: Linear = one by one.//.//How Does Linear Search Work?
Linear Search moves through the values in order: start with the first value, compare it with the target, and if it does not match, move to the next value. If it matches, the search stops - found.

10 20 30 40, target 30: checks 10 (no), 20 (no), 30 (yes) - Found.

Remember: Check -> Compare -> Move -> Repeat.//.//Where Can the Target Be?
The target does not always appear in the same position, which changes how many comparisons are needed.

10 25 40 15 30: target at the beginning (10) is found immediately, 1 comparison. Target in the middle (40) takes 3 comparisons. Target at the end (30) takes 5 comparisons. If the target is not present at all, every value must still be checked before reporting Not Found.

Key idea: where the target is can change how many values are checked.//.//Linear Search with Unsorted Data
One useful feature of Linear Search is that the values do not need to be sorted first.

35 8 72 14 50, target = 14: the values are not arranged from smallest to largest, but Linear Search can still search them: 35 (no), 8 (no), 72 (no), 14 (yes) - found.

Remember: unsorted data? Linear Search can still work.//.//When Should We Use Linear Search?
Linear Search is useful when the data is small, when the data is unsorted, and when a simple search is enough: start, check, move, find.

There is a catch: for 5 values it is easy, for 50 values there is more checking, and for 500 values there is much more work. If the target is near the end - or is not present - the computer may have to check many values.

Big memory trick: Linear Search = check one by one.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM170', 'target', 'The value we want to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM171', 'target', 'The value being searched for.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM172', 'target', 'The value the search is trying to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM173', 'linear search', 'A method that checks values one by one.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM174', 'break', 'Stops the loop immediately.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000398', 'STG009', 'CH0080', 'CODE_FILL', 'Complete the missing part to search for 25.', 'int numbers[] = {10, 25, 40, 15};
int target = 25;

for(int i = 0; i < 4; i++) {
   if(numbers[i] == {{1}}) {
      printf("Found");
      break;
   }
}', '["target"]', '', 'The blank should contain the value we are searching for.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000399', 'STG009', 'CH0080', 'CODE_FILL', 'Complete the missing condition to search for 30.', 'int numbers[] = {10, 20, 30, 40};
int target = 30;

for(int i = 0; i < 4; i++) {
   if({{1}}) {
      printf("Found");
      break;
   }
}', '["numbers[i] == target"]', '', 'Compare the current value with the target.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000400', 'STG009', 'CH0080', 'MCQ', 'What will be printed by this code?', 'int numbers[] = {5, 10, 15, 20};
int target = 15;
for(int i = 0; i < 4; i++) {
   if(numbers[i] == target) {
      printf("Found");
      break;
   }
}', 'Found', '', 'Check whether 15 exists in the values.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000401', 'STG009', 'CH0080', 'MCQ', 'What is the main idea of Linear Search?', '', 'Check values one by one', '', 'Remember the Linear Search memory trick.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000402', 'STG009', 'CH0080', 'CODE_FILL', 'Complete the missing line so that the search stops when the target is found.', 'int numbers[] = {8, 12, 20, 25};
int target = 20;

for(int i = 0; i < 4; i++) {
   if(numbers[i] == target) {
      printf("Found");
      {{1}};
   }
}', '["break"]', '', 'Which statement immediately stops the loop?', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001030', 'Q000400', 'Not Found', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001031', 'Q000400', 'Found', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001032', 'Q000400', '15', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001033', 'Q000400', 'Nothing', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001034', 'Q000401', 'Divide the data into two parts', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001035', 'Q000401', 'Check values one by one', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001036', 'Q000401', 'Arrange values in order', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001037', 'Q000401', 'Remove duplicate values', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000398', 'Q000398', 'The blank should contain the value we are searching for.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000399', 'Q000399', 'Compare the current value with the target.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000400', 'Q000400', 'Check whether 15 exists in the values.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000401', 'Q000401', 'Remember the Linear Search memory trick.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000402', 'Q000402', 'Which statement immediately stops the loop?', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000398', 'TERM170', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000399', 'TERM171', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000400', 'TERM172', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000401', 'TERM173', 'linear search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000402', 'TERM174', 'break', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0081', 'STG009', 'CH0081', 'Linear Search Algorithm', 'From Idea to Algorithm
An algorithm is a set of clear, step-by-step instructions used to solve a problem: take data, choose a target, compare, move, give a result.

Just like a recipe (take ingredients, mix, cook, serve), a searching algorithm has its own fixed sequence of steps.

Remember: algorithm = step-by-step instructions.//.//Linear Search Algorithm: The Steps
Values: 10 25 40 15 30, target: 15. Step 1: start with the first element (10). Step 2: compare with the target (10 == 15? no). Step 3: move to the next element (25, 40, 15). Step 4: check again (15 == 15 - target found). Step 5: once the target is found, the search can stop.

Easy flow: Start -> Check element -> Matches target? -> YES: Found / NO: Next element, check again.//.//Writing the Algorithm
Step 1: start from the first element. Step 2: compare the current element with the target. Step 3: if they match, target found. Step 4: if they do not match, move to the next element. Step 5: repeat until the target is found or all elements are checked. Step 6: if all elements are checked without a match, report Not Found.

Memory trick: Start -> Compare -> Move -> Repeat -> Result.//.//Let''s Trace the Algorithm
A dry run means following the algorithm manually to see what happens at each step. Values = 8 12 20 25, target = 20.

Step 1: current value 8, compare with 20 (8 != 20), continue. Step 2: current value 12, compare with 20 (12 != 20), continue. Step 3: current value 20, compare with 20 (20 = 20), Found!

A dry run helps show which values are checked, where the search stops, and whether the algorithm is working correctly. Dry run = walk through the steps manually.//.//Algorithm to C Code
The algorithm (start, check current element, compare with target, match? found : next element, repeat) becomes:

int target = 20;
for(int i = 0; i < 4; i++) { if(numbers[i] == target) { printf("Found"); break; } }

i = 0 starts with the first element. numbers[i] gets the current value. == target checks whether it matches. break stops the search after finding it.

Big memory trick: Algorithm = tell the computer WHAT to do, STEP BY STEP.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM175', 'target', 'The value being searched for.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM176', 'loop', 'A section of code that repeats.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM177', 'target', 'The value being searched for.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM178', 'linear search', 'A method of checking values one by one.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM179', 'i', 'The variable used to move through the positions.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000403', 'STG009', 'CH0081', 'CODE_FILL', 'Complete the condition to compare the current element with the target.', 'if(numbers[i] == {{1}}) {
   printf("Found");
   break;
}', '["target"]', '', 'Compare the current element with the value you are searching for.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000404', 'STG009', 'CH0081', 'CODE_FILL', 'Complete the missing statement to stop the search after finding the target.', 'if(numbers[i] == target) {
   printf("Found");
   {{1}};
}', '["break"]', '', 'Use the statement that immediately stops the loop.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000405', 'STG009', 'CH0081', 'MCQ', 'What will this code print?', 'int numbers[] = {10, 20, 30, 40};
int target = 30;

for(int i = 0; i < 4; i++) {
   if(numbers[i] == target) {
      printf("Found");
      break;
   }
}', 'Found', '', 'Check whether 30 appears in the values.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000406', 'STG009', 'CH0081', 'MCQ', 'What should happen when the current element does not match the target during Linear Search?', '', 'Move to the next element', '', 'Linear Search checks the values one after another.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000407', 'STG009', 'CH0081', 'CODE_FILL', 'Complete the missing line so the search checks each element.', 'int numbers[] = {5, 10, 15, 20};
int target = 15;

for(int i = 0; i < 4; {{1}}) {
   if(numbers[i] == target) {
      printf("Found");
      break;
   }
}', '["i++"]', '', 'After checking one element, i should move to the next position.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001038', 'Q000405', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001039', 'Q000405', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001040', 'Q000405', 'Found', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001041', 'Q000405', 'Not Found', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001042', 'Q000406', 'Stop immediately', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001043', 'Q000406', 'Delete the element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001044', 'Q000406', 'Move to the next element', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001045', 'Q000406', 'Sort the elements', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000403', 'Q000403', 'Compare the current element with the value you are searching for.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000404', 'Q000404', 'Use the statement that immediately stops the loop.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000405', 'Q000405', 'Check whether 30 appears in the values.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000406', 'Q000406', 'Linear Search checks the values one after another.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000407', 'Q000407', 'After checking one element, i should move to the next position.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000403', 'TERM175', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000404', 'TERM176', 'loop', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000405', 'TERM177', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000406', 'TERM178', 'linear search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000407', 'TERM179', 'i', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0082', 'STG009', 'CH0082', 'Linear Search with Arrays', 'Connecting Linear Search with Arrays
An array stores multiple values under one name: int numbers[] = {10, 25, 40, 15, 30}; is a row of boxes [10][25][40][15][30] at indexes 0 1 2 3 4.

To find target = 15, the program checks numbers[0]->10 (no), numbers[1]->25 (no), numbers[2]->40 (no), numbers[3]->15 (yes).

Remember: Array = Values + Index. Linear Search checks the array one element at a time.//.//Using Index to Check Each Element
C uses an index to access an array element: numbers[i], where numbers is the array name, i is the current index, and numbers[i] is the value at that index.

int numbers[] = {8, 12, 20, 25}; if i = 2, then numbers[i] means numbers[2], which is 20.

Remember: i tells WHERE, numbers[i] tells WHAT.//.//Searching an Array Using a Loop
Instead of writing if(numbers[0]==target), if(numbers[1]==target), if(numbers[2]==target) one by one, a for loop repeats the check automatically: for(int i=0;i<5;i++) { if(numbers[i]==target) { printf("Found"); break; } }.

i=0 starts from the first element, numbers[i] checks the current element, if not equal i++ moves forward, if equal the target is found and break stops the loop.

Remember: loop controls WHERE you search.//.//Complete Linear Search Program
Putting everything together: int numbers[] = {10,25,40,15,30}; int target = 15; for(int i=0;i<5;i++) { if(numbers[i]==target) { printf("Found"); break; } }.

Array stores the values, target is the value we want to find, the for loop moves through the array, i keeps track of the position, numbers[i] gets the current value, and break stops after finding the target.

Quick memory: Array + Target + Loop + Index = Linear Search in C.//.//Trace the Search Through an Array
Array [10][25][40][15][30] at indexes 0 1 2 3 4, target = 15. Step 1: i=0, numbers[i]=10, no match. Step 2: i=1, numbers[i]=25, no match. Step 3: i=2, numbers[i]=40, no match. Step 4: i=3, numbers[i]=15, match - FOUND!

Once 15 is found, break stops the loop. Big memory trick: i = Position, numbers[i] = Value, target = What we are searching for.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM180', 'index', 'Position of an element in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM181', 'loop', 'Repeats a set of statements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM182', 'target', 'The value we want to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM183', 'index', 'Position used to access an element in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM184', 'break', 'Stops the loop immediately.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000408', 'STG009', 'CH0082', 'CODE_FILL', 'Complete the missing part:', 'int numbers[] = {10, 20, 30, 40};
int target = 30;

for(int i = 0; i < 4; i++)
{
   if({{1}} == target)
   {
      printf("Found");
      break;
   }
}', '["numbers[i]"]', '', 'Use the array name and current index to access the element.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000409', 'STG009', 'CH0082', 'CODE_FILL', 'Complete the loop:', 'int numbers[] = {5, 15, 25, 35, 45};

for(int i = 0; i < {{1}}; i++)
{
   printf("%d ", numbers[i]);
}', '["5"]', '', 'The array contains 5 elements.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000410', 'STG009', 'CH0082', 'MCQ', 'What will be printed?', 'int numbers[] = {10, 20, 30, 40};
int target = 30;

for(int i = 0; i < 4; i++)
{
   if(numbers[i] == target)
   {
      printf("Found");
      break;
   }
}', 'Found', '', 'Which array element matches the target?', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000411', 'STG009', 'CH0082', 'MCQ', 'In the expression numbers[i], what does i represent?', '', 'The index of the current element', '', 'Think about how i changes inside the loop.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000412', 'STG009', 'CH0082', 'CODE_FILL', 'Complete the code:', 'if(numbers[i] == target)
{
   printf("Found");
   {{1}};
}', '["break"]', '', 'We don''t need to continue searching after finding the target.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001046', 'Q000410', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001047', 'Q000410', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001048', 'Q000410', 'Found', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001049', 'Q000410', 'Nothing', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001050', 'Q000411', 'The value being searched', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001051', 'Q000411', 'The array name', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001052', 'Q000411', 'The index of the current element', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001053', 'Q000411', 'The size of the array', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000408', 'Q000408', 'Use the array name and current index to access the element.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000409', 'Q000409', 'The array contains 5 elements.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000410', 'Q000410', 'Which array element matches the target?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000411', 'Q000411', 'Think about how i changes inside the loop.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000412', 'Q000412', 'We don''t need to continue searching after finding the target.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000408', 'TERM180', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000409', 'TERM181', 'loop', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000410', 'TERM182', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000411', 'TERM183', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000412', 'TERM184', 'break', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0083', 'STG009', 'CH0083', 'Search Occurrence & Count', 'What Is an Occurrence?
In an array, a value may appear one time or multiple times. int numbers[] = {10, 20, 10, 30, 10}; target = 10: it appears at index 0, 2 and 4, so 10 has 3 occurrences.

An occurrence is each time a particular value appears in an array. Remember: occurrence = how many times it appears.//.//Counting Occurrences Using a Counter
We use a variable called a counter: int count = 0; every time the target is found, count++.

int numbers[] = {5, 10, 5, 20, 5}; target = 5; count = 0: check 5 (match, count=1), 10 (no), 5 (match, count=2), 20 (no), 5 (match, count=3). Final: count = 3.

Unlike a normal search, do not stop at the first match, because we want to find all occurrences.//.//Finding All Occurrences
When we want every occurrence, the loop must continue until the end: for(int i=0;i<5;i++){ if(numbers[i]==target){ count++; } } - no break.

i moves through each position, numbers[i] gets the current value, and on a match count++ runs, then checking continues.

Important difference: to find one target, match then break; to count all occurrences, match then count++ and continue.//.//What If the Target Is Not Present?
int numbers[] = {10, 20, 30, 40}; target = 25; count = 0: 10, 20, 30, 40 all fail to match, so count stays 0.

count = 0 tells us the target has no occurrences. Three possible results: count = 1 means the target appears once, count > 1 means it appears multiple times, count = 0 means the target is not present.//.//Complete Program: Count Occurrences
int numbers[] = {10, 20, 10, 30, 10}; int target = 10; int count = 0; for(int i=0;i<5;i++){ if(numbers[i]==target){ count++; } } printf("Occurrences = %d", count);. Output: Occurrences = 3.

Program flow: array -> choose target -> check every element -> match? count++ -> end of array -> display count.

Big memory trick: Search -> Match -> Count -> Continue -> Result.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM185', 'counter', 'A variable used to keep track of a number.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM186', 'element', 'A single value stored in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM187', 'count', 'Number of times the target is found.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM188', 'break', 'Stops a loop immediately.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM189', 'count', 'Number of times the target occurs.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000413', 'STG009', 'CH0083', 'CODE_FILL', 'Complete the missing line:', 'int numbers[] = {5, 10, 5, 20, 5};
int target = 5;
int count = 0;

for(int i = 0; i < 5; i++)
{
   if(numbers[i] == target)
   {
      {{1}};
   }
}', '["count++"]', '', 'Increase the counter whenever the target is found.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000414', 'STG009', 'CH0083', 'CODE_FILL', 'Complete the condition:', 'int numbers[] = {10, 20, 10, 30};
int target = 10;
int count = 0;

for(int i = 0; i < 4; i++)
{
   if({{1}})
   {
      count++;
   }
}', '["numbers[i] == target"]', '', 'Compare the current array element with the target.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000415', 'STG009', 'CH0083', 'MCQ', 'What will be the value of count?', 'int numbers[] = {5, 10, 5, 20, 5};
int target = 5;
int count = 0;

for(int i = 0; i < 5; i++)
{
   if(numbers[i] == target)
   {
      count++;
   }
}', '3', '', 'Count how many times 5 appears.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000416', 'STG009', 'CH0083', 'MCQ', 'Why don''t we use break after finding the target when counting occurrences?', '', 'We need to check the remaining elements', '', 'We want to find all occurrences, not just the first one.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000417', 'STG009', 'CH0083', 'MCQ', 'What does count = 0 mean after searching the entire array?', '', 'The target was not found', '', 'The counter increases only when a match is found.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001054', 'Q000415', '1', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001055', 'Q000415', '2', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001056', 'Q000415', '3', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001057', 'Q000415', '5', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001058', 'Q000416', 'It causes an error', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001059', 'Q000416', 'We need to check the remaining elements', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001060', 'Q000416', 'It increases the counter', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001061', 'Q000416', 'It changes the target', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001062', 'Q000417', 'The target appears once', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001063', 'Q000417', 'The target appears twice', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001064', 'Q000417', 'The target was not found', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001065', 'Q000417', 'The array is empty', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000413', 'Q000413', 'Increase the counter whenever the target is found.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000414', 'Q000414', 'Compare the current array element with the target.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000415', 'Q000415', 'Count how many times 5 appears.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000416', 'Q000416', 'We want to find all occurrences, not just the first one.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000417', 'Q000417', 'The counter increases only when a match is found.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000413', 'TERM185', 'counter', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000414', 'TERM186', 'element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000415', 'TERM187', 'count', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000416', 'TERM188', 'break', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000417', 'TERM189', 'count', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0084', 'STG009', 'CH0084', 'Binary Search Basics', 'Meet Binary Search
Instead of checking every name from the beginning, Binary Search goes to the middle, compares with the target, and decides whether to search left or right.

Sorted array 10 20 30 40 50 60 70, target = 60: middle is 40. Since 60 > 40, everything on the left of 40 can be ignored: 10 20 30 40 | 50 60 70, search here.

Memory trick: Binary = divide into two.//.//Why Must the Array Be Sorted?
Binary Search decides where to continue searching based on the comparison with the middle value, so the values must be arranged in ascending or descending order.

Sorted: 10 -> 20 -> 30 -> 40 -> 50 -> 60, Binary Search can work. Unsorted: 40 -> 10 -> 60 -> 20 -> 50 -> 30, Binary Search cannot safely decide which half to ignore - seeing 40 in the middle tells us almost nothing about where 70 might be.

Memory trick: Sorted -> Decide -> Discard Half.//.//The Power of the Middle Element
The middle element helps decide which half contains the target. [10][20][30][40][50][60][70], target = 20: 20 < 40, so search the left half. Target = 60: 60 > 40, so search the right half.

Three decisions: target == middle -> Found. target < middle -> left half. target > middle -> right half.

Memory trick: Compare with Middle -> Choose Left or Right.//.//Binary Search Keeps Shrinking the Search Area
[10][20][30][40][50][60][70][80], target = 70. Step 1: middle = 40, 70 > 40, ignore left half, remaining 50 60 70 80. Step 2: check the middle of the remaining area, 70 > 60, ignore the smaller left part again, remaining 70 80. Step 3: 70 is found.

Instead of checking every value, Binary Search keeps reducing the search area. Memory trick: Middle -> Compare -> Remove Half -> Repeat.//.//Linear Search vs Binary Search
Linear Search checks one by one, starting at the beginning, and can work on unsorted data, reducing the search area by one element at a time. Binary Search divides into halves, starts at the middle, requires sorted data, and reduces the search area by half each step.

Big memory trick: LINEAR = one by one. BINARY = half by half.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM190', 'target', 'The value we want to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM191', 'mid', 'The index representing the middle position.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM192', 'sorted', 'Values arranged in an order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM193', 'middle value', 'The value at the center of the search area.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM194', 'binary search', 'A method that searches by repeatedly dividing the search area.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000418', 'STG009', 'CH0084', 'CODE_FILL', 'Complete the condition for checking whether the target is equal to the middle element:', 'if(target {{1}} numbers[mid])
{
   printf("Found");
}', '["=="]', '', 'We need to check whether both values are equal.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000419', 'STG009', 'CH0084', 'CODE_FILL', 'A sorted array is given. Complete the message so it names the half to search.', 'int numbers[] = {10, 20, 30, 40, 50};
int mid = 2;
int target = 20;

if(target < numbers[mid])
{
   printf("Search the {{1}} half");
}', '["left"]', '', 'numbers[2] is 30, and 20 < 30.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000420', 'STG009', 'CH0084', 'MCQ', 'Which condition is required for Binary Search?', '', 'The array must be sorted', '', 'Binary Search decides which half to search using the middle value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000421', 'STG009', 'CH0084', 'MCQ', 'Consider the sorted array: 10 20 30 40 50 60 70. Target = 60, middle value = 40. Which half should Binary Search continue with?', '', 'Right half', '', 'Compare 60 with 40.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000422', 'STG009', 'CH0084', 'MCQ', 'What is the main idea of Binary Search?', '', 'Divide the search area and continue with the relevant half', '', 'Think about what happens after checking the middle element.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001066', 'Q000420', 'The array must contain only even numbers', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001067', 'Q000420', 'The array must be sorted', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001068', 'Q000420', 'The array must contain duplicate values', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001069', 'Q000420', 'The array must contain exactly 10 elements', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001070', 'Q000421', 'Left half', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001071', 'Q000421', 'Right half', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001072', 'Q000421', 'Both halves', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001073', 'Q000421', 'Stop immediately', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001074', 'Q000422', 'Check every element from the beginning', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001075', 'Q000422', 'Randomly select elements', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001076', 'Q000422', 'Divide the search area and continue with the relevant half', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001077', 'Q000422', 'Sort the array after every comparison', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000418', 'Q000418', 'We need to check whether both values are equal.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000419', 'Q000419', 'numbers[2] is 30, and 20 < 30.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000420', 'Q000420', 'Binary Search decides which half to search using the middle value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000421', 'Q000421', 'Compare 60 with 40.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000422', 'Q000422', 'Think about what happens after checking the middle element.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000418', 'TERM190', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000419', 'TERM191', 'mid', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000420', 'TERM192', 'sorted', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000421', 'TERM193', 'middle value', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000422', 'TERM194', 'binary search', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0085', 'STG009', 'CH0085', 'Binary Search Algorithm', 'From Binary Search Idea to Algorithm
The main idea: check the middle, compare, choose left or right, repeat. Sorted array 10 20 30 40 50 60 70, target = 60: low = starting position, high = ending position, mid = middle position.

Memory trick: LOW = Start, HIGH = End, MID = Middle.//.//The Binary Search Steps
Step 1: set the search area, low = first index, high = last index. Step 2: find the middle, mid = (low + high) / 2. Step 3: compare target with numbers[mid]. Step 4: decide - if target == numbers[mid], Found; if target < numbers[mid], search the left half; if target > numbers[mid], search the right half. Step 5: repeat until the target is found or the search area becomes empty.

Memory trick: Start -> Middle -> Compare -> Choose -> Repeat.//.//How Does the Search Area Change?
10 20 30 40 50 60 70, low/mid/high at 0/3/6, target = 20: 20 < 40, so only the left half is needed, 10 20 30 | 40 50 60 70. Now low stays 0, high becomes 2, and the middle is recalculated.

Binary Search does not randomly remove values - it removes the half that cannot contain the target.//.//Dry Run: Binary Search Step by Step
Array 10 20 30 40 50 60 70, target = 60. Step 1: low=0, high=6, mid=3, middle value 40, 60 > 40, move right (low becomes 4). Step 2: low=4, high=6, mid=5, middle value 60, 60 = 60, Found.

Memory trick: Compare -> Eliminate -> Recalculate.//.//Binary Search Algorithm in One Flow
Algorithm in simple words: (1) start with the first and last positions, (2) find the middle position, (3) compare the target with the middle value, (4) if equal, target found, (5) if target is smaller, move to left half, (6) if target is larger, move to right half, (7) repeat until found or no search area remains.

Big memory trick: LOW -> MID -> COMPARE -> LEFT/RIGHT -> REPEAT.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM195', 'low', 'Starting index of the search area.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM196', 'target', 'The value we want to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM197', 'left half', 'The part before the middle.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM198', 'low (search area)', 'Starting index of the current search area.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM199', 'right half', 'The portion containing larger values in an ascending array.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000423', 'STG009', 'CH0085', 'CODE_FILL', 'Complete the code to calculate the middle position:', 'int low = 0;
int high = 6;

int mid = {{1}};', '["(low + high) / 2"]', '', 'The middle is calculated using the starting and ending positions.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000424', 'STG009', 'CH0085', 'CODE_FILL', 'Complete the condition:', 'if(target {{1}} numbers[mid])
{
   printf("Found");
}', '["=="]', '', 'This condition checks whether the target and middle value are equal.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000425', 'STG009', 'CH0085', 'MCQ', 'A sorted array is: 10 20 30 40 50 60 70. Target = 20. The middle value is 40. What should Binary Search do next?', '', 'Search the left half', '', 'Compare 20 and 40.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000426', 'STG009', 'CH0085', 'MCQ', 'What does low represent in Binary Search?', '', 'The starting index of the search area', '', 'Think about where the current search area begins.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000427', 'STG009', 'CH0085', 'BLANK', 'In Binary Search, if target > numbers[mid] we continue searching in the __________ half.', '', 'right', '', 'In a sorted ascending array, larger values are on which side?', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001078', 'Q000425', 'Search the right half', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001079', 'Q000425', 'Search the left half', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001080', 'Q000425', 'Start from the beginning', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001081', 'Q000425', 'Stop immediately', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001082', 'Q000426', 'The target value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001083', 'Q000426', 'The middle value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001084', 'Q000426', 'The starting index of the search area', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001085', 'Q000426', 'The number of elements found', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000423', 'Q000423', 'The middle is calculated using the starting and ending positions.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000424', 'Q000424', 'This condition checks whether the target and middle value are equal.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000425', 'Q000425', 'Compare 20 and 40.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000426', 'Q000426', 'Think about where the current search area begins.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000427', 'Q000427', 'In a sorted ascending array, larger values are on which side?', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000423', 'TERM195', 'low', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000424', 'TERM196', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000425', 'TERM197', 'left half', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000426', 'TERM198', 'low (search area)', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000427', 'TERM199', 'right half', 1, true);

-- CH0086 keeps all 6 of the source PDF's original quiz questions (KEEP, not dropped to fit the
-- platform's 5-question default): raise its question_limit so the server serves all 6 in a run,
-- matching the 6 question slides in the deck exactly.
update chapters set question_limit = 6 where chapter_id = 'CH0086';

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0086', 'STG009', 'CH0086', 'Binary Search with Arrays', 'Setting Up Binary Search with an Array
Binary Search works with an array whose values are sorted: int numbers[] = {10,20,30,40,50,60,70}; target = 60. Three important positions: low = first index, high = last index, mid = middle index. int low = 0; int high = 6; int mid = (low + high) / 2.

Memory trick: Array -> Low -> High -> Mid -> Target.//.//Finding the Middle Element in C
mid = (low + high) / 2; with low=0, high=6, mid = (0+6)/2 = 3, so numbers[mid] means numbers[3] -> 40. 60 > 40, so the target must be on the right side.

Remember: mid is an index, not the actual value. mid = 3, numbers[mid] = 40.//.//Updating Low and High
After comparing target with the middle value, the search boundaries change. If target > numbers[mid], low = mid + 1 (move low past mid). If target < numbers[mid], high = mid - 1 (move high before mid). If target == numbers[mid], the target is found.

Memory trick: Greater -> Move LOW. Smaller -> Move HIGH. Equal -> FOUND.//.//Complete Binary Search Program
int numbers[]={10,20,30,40,50,60,70}; int target=60; int low=0; int high=6; int mid; while(low<=high){ mid=(low+high)/2; if(numbers[mid]==target){ printf("Found"); break; } else if(target<numbers[mid]){ high=mid-1; } else { low=mid+1; } }.

numbers[] stores sorted values, target is the value to search, low/high are the search area boundaries, mid is the middle position, while keeps searching, and updating low/high reduces the search area.

Memory trick: Set -> Find Mid -> Compare -> Move Boundary -> Repeat.//.//Trace the C Program
Array 10 20 30 40 50 60 70, target = 60. Round 1: low=0, high=6, mid=3, numbers[mid]=40, 60>40, update low=mid+1=4. Round 2: low=4, high=6, mid=5, numbers[mid]=60, 60==60, FOUND!

Big memory trick: LOW = Start, HIGH = End, MID = Check. LOW moves right, HIGH moves left.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM200', 'low', 'Starting index of the search area.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM201', 'target', 'Value we want to find.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM202', 'mid', 'Middle index.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM203', 'high', 'Ending boundary of the search area.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM204', 'side', 'Direction in which the search continues.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM205', 'equal', 'Having the same value.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000428', 'STG009', 'CH0086', 'CODE_FILL', 'Complete the missing code:', 'int low = 0;
int high = 6;
int mid;

mid = {{1}};', '["(low + high) / 2"]', '', 'Calculate the middle using the starting and ending indexes.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000429', 'STG009', 'CH0086', 'CODE_FILL', 'Complete the statement:', 'if(target > numbers[mid])
{
   {{1}} = mid + 1;
}', '["low"]', '', 'If the target is greater than the middle value, move the starting boundary to the right.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000430', 'STG009', 'CH0086', 'MCQ', 'What is the value of mid?', 'int numbers[] = {10, 20, 30, 40, 50, 60, 70};
int low = 0;
int high = 6;

int mid = (low + high) / 2;', '3', '', 'Calculate (0 + 6) / 2.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000431', 'STG009', 'CH0086', 'MCQ', 'What should happen when target < numbers[mid] in a sorted ascending array?', '', 'Move high to the left', '', 'If the target is smaller than the middle value, which side should we search?', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000432', 'STG009', 'CH0086', 'BLANK', 'In Binary Search, when target > numbers[mid] the search continues in the __________ side of the sorted array.', '', 'right', '', 'Larger values are on which side of an ascending array?', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000433', 'STG009', 'CH0086', 'BLANK', 'When target == numbers[mid] the target is __________.', '', 'found', '', 'The target and middle value are equal.', 1, 6, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001086', 'Q000430', '2', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001087', 'Q000430', '3', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001088', 'Q000430', '4', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001089', 'Q000430', '6', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001090', 'Q000431', 'Move low to the right', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001091', 'Q000431', 'Move high to the left', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001092', 'Q000431', 'Stop the program immediately', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001093', 'Q000431', 'Sort the array again', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000428', 'Q000428', 'Calculate the middle using the starting and ending indexes.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000429', 'Q000429', 'If the target is greater than the middle value, move the starting boundary to the right.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000430', 'Q000430', 'Calculate (0 + 6) / 2.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000431', 'Q000431', 'If the target is smaller than the middle value, which side should we search?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000432', 'Q000432', 'Larger values are on which side of an ascending array?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000433', 'Q000433', 'The target and middle value are equal.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000428', 'TERM200', 'low', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000429', 'TERM201', 'target', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000430', 'TERM202', 'mid', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000431', 'TERM203', 'high', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000432', 'TERM204', 'side', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000433', 'TERM205', 'equal', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0087', 'STG009', 'CH0087', 'Linear Search vs Binary Search (Quick Recap)', 'Understanding Linear Search
Linear Search checks elements one by one, starting from the beginning. It works even when the data is not sorted: for an array containing n elements, the worst case may require checking all n elements.

Array 10 20 30 40 50 60 70, target 50: 10==50? No. 20==50? No. 30==50? No. 40==50? No. 50==50? Yes.

Key idea: Linear Search does not need the data to be organized. It simply walks through the array from one end to the other.//.//Understanding Binary Search
Binary Search looks at the middle element and uses the ordering of the array to decide which half can be ignored, similar to opening a dictionary near the middle instead of turning every page.

Consider 10 20 30 40 50 60 70, target 70: middle = 40, 40 != 70, and since 70 > 40, ignore the left half (10 20 30 40). Remaining: 50 60 70. Middle = 60, 60 != 70, 70 > 60, ignore 50 60. Remaining: 70 - found.

Key idea: Binary Search is faster because it does not search everywhere. It repeatedly eliminates half of the remaining search area.//.//Linear Search vs Binary Search Example
Same array 10 20 30 40 50 60 70, target = 70. Linear Search checks 10, 20, 30, 40, 50, 60, 70 one by one - found after checking 7 elements. Binary Search checks 40, then 60, then 70 - only 3 elements were checked.

Feature comparison: data requirement (sorted or unsorted vs must be sorted), starting point (first element vs middle element), search reduction (removes one element at a time vs removes about half each step). Linear Search moves through the data; Binary Search reduces the data.//.//Comparing Linear Search and Binary Search
Both algorithms solve the same problem: find whether a target value exists in an array. Data requirement: Linear can be sorted or unsorted, Binary must be sorted. Starting point: Linear starts at the first element, Binary starts at the middle element. Search reduction: Linear removes one element at a time, Binary removes about half each step. Implementation: Linear is easier, Binary is slightly more complex.

For small arrays, Linear Search is usually sufficient; for large sorted arrays, Binary Search is much more efficient.//.//Which Search Should You Use?
The better question is not "which algorithm is faster?" but "what kind of data do I have?" Use Linear Search when the array is small, the data is unsorted, or a simple implementation is enough. Use Binary Search when the array is already sorted, the amount of data is large, and searching needs to be efficient.

Decision framework: need to search? -> is data sorted? -> No: Linear Search. Yes: is data large? -> No: Linear Search. Yes: Binary Search. Final mental model: Linear Search inspects people one at a time; Binary Search looks at the middle, chooses the correct half, and repeats. Binary Search gets its advantage from using information about the order of the data.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM206', 'linear search', 'Checks values one by one and works on unsorted data.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM207', 'binary search', 'Repeatedly checks the middle and eliminates half of the remaining data.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM208', 'linear search', 'A method that checks values one by one, from the beginning.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM209', 'binary search', 'A method that repeatedly divides the search area in half.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM210', 'sorted', 'Arranged in ascending or descending order.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000434', 'STG009', 'CH0087', 'MCQ', 'Which searching method can work on data that is NOT sorted?', '', 'Linear Search', '', 'Think about which method checks values one by one regardless of their order.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000435', 'STG009', 'CH0087', 'MCQ', 'Where does Binary Search begin checking?', '', 'At the middle element', '', 'Binary Search never starts at either end of the array.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000436', 'STG009', 'CH0087', 'BLANK', 'For the array 10 20 30 40 50 60 70, searching for 70, Linear Search must check __________ elements before finding it.', '', '7', 'Linear Search checks every element up to and including the target, and 70 is the last of the 7 elements.', 'Count every element from the start up to and including 70.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000437', 'STG009', 'CH0087', 'MCQ', 'For the same array (10 20 30 40 50 60 70) and target 70, Binary Search finds it after how many checks?', '', '3', '', 'Binary Search checks 40, then 60, then 70.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000438', 'STG009', 'CH0087', 'MCQ', 'Which searching method is the better choice for a large, sorted array?', '', 'Binary Search', '', 'Think about which method eliminates large portions of the array quickly.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001094', 'Q000434', 'Linear Search', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001095', 'Q000434', 'Binary Search', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001096', 'Q000434', 'Both need sorted data', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001097', 'Q000434', 'Neither', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001098', 'Q000435', 'At the first element', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001099', 'Q000435', 'At the last element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001100', 'Q000435', 'At the middle element', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001101', 'Q000435', 'At a random element', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001102', 'Q000437', '1', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001103', 'Q000437', '3', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001104', 'Q000437', '5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001105', 'Q000437', '7', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001106', 'Q000438', 'Linear Search', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001107', 'Q000438', 'Binary Search', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001108', 'Q000438', 'Either works equally well', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001109', 'Q000438', 'Neither works', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000434', 'Q000434', 'Think about which method checks values one by one regardless of their order.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000435', 'Q000435', 'Binary Search never starts at either end of the array.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000436', 'Q000436', 'Count every element from the start up to and including 70.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000437', 'Q000437', 'Binary Search checks 40, then 60, then 70.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000438', 'Q000438', 'Think about which method eliminates large portions of the array quickly.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000434', 'TERM206', 'linear search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000435', 'TERM207', 'binary search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000436', 'TERM208', 'linear search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000437', 'TERM209', 'binary search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000438', 'TERM210', 'sorted', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0088', 'STG009', 'CH0088', 'Sorting Basics', 'Understanding Sorting
Sorting means arranging data in a particular order. A pile of books 40 10 30 20 lying randomly has nothing wrong with the numbers, but they are not arranged in a useful order; arranged from smallest to largest, 10 20 30 40 is sorted in ascending order.

Before: 40 10 30 20. After: 10 20 30 40 - we still have exactly the same four numbers, 10, 20, 30, 40; sorting simply rearranges them. Like students standing randomly (Ravi, Anu, Kiran, Bala) rearranged alphabetically (Anu, Bala, Kiran, Ravi): nobody disappeared, nobody was duplicated, only the order changed.

Key idea: sorting means rearranging existing data into a desired order. The data stays the same, but its positions change.//.//Why Do We Sort Data?
Organized data is generally easier to work with. Finding the smallest number in 67 12 89 23 5 45 requires inspecting and comparing values; after sorting, 5 12 23 45 67 89, the smallest value is immediately visible at the beginning and the largest at the end.

Sorting can make data: (1) easier to read (10 20 40 50 80 vs 50 10 80 20 40), (2) easier to analyze (smallest first, largest last), (3) easier to search (Binary Search requires sorted data), (4) easier to organize (marks 65 42 91 73 58 sorted become 42 58 65 73 91).

Key idea: sorting is not just about making numbers look neat - organized data can make reading, analyzing, searching and processing easier.//.//Understanding Ascending and Descending Order
There are two common ways to arrange numerical data: ascending order (smallest to largest, low to high, e.g. 10 20 30 40) and descending order (largest to smallest, high to low, e.g. 40 30 20 10).

For ascending order, we want smaller values to move toward the beginning; for descending order, we want larger values to move toward the beginning. This small change in the comparison condition can change the entire sorting result.

Key idea: ascending means smallest to largest; descending means largest to smallest.//.//Sorting Numbers Step by Step
Before sorting: 25 5 40 10 15. Goal: ascending order 5 10 15 25 40. Step 1: identify the smallest value (5) and place it at the beginning: 5 _ _ _ _. Step 2: place the next smallest value (10): 5 10 _ _ _. Step 3: place the next value (15): 5 10 15 _ _. Step 4: continue with the remaining values (25, 40): 5 10 15 25 40.

A sorting algorithm has to figure out how to move values into these positions - that is where algorithms such as Bubble Sort, Selection Sort and Insertion Sort come in. Flow: unsorted data -> compare values -> move/rearrange values -> more comparisons -> more rearrangement -> sorted data.//.//Sorting in C
C does not automatically look at an array and decide to organize it; a programmer has to provide the instructions. int numbers[] = {25, 5, 40, 10, 15}; is stored exactly as given; C will not automatically change it to 5 10 15 25 40 - an algorithm must perform the rearrangement.

Three important sorting algorithms: Bubble Sort (repeatedly compares neighboring elements and swaps them if in the wrong order), Selection Sort (repeatedly selects the smallest remaining value and places it in its correct position), Insertion Sort (takes one value at a time and inserts it into the correct position among the values already sorted).

Sorting means arranging data into a required order; ascending goes from small to large, descending goes from large to small; and in C, sorting an ordinary array requires writing one of these algorithms.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM211', 'sorting', 'Rearranging existing data into a desired order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM212', 'sorted', 'Arranged in ascending or descending order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM213', 'ascending order', 'Arranged from smallest to largest.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM214', 'bubble sort', 'Repeatedly compares neighboring elements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM215', 'algorithm', 'A set of step-by-step instructions a program follows.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000439', 'STG009', 'CH0088', 'MCQ', 'When an array is sorted, what changes about its values?', '', 'Only the positions of the values change', '', 'Think about the before-and-after example: the same numbers, rearranged.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000440', 'STG009', 'CH0088', 'MCQ', 'Which of these does sorted data make easier?', '', 'Searching with Binary Search', '', 'One searching method needs the data to already be in order.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000441', 'STG009', 'CH0088', 'BLANK', 'Ascending order means arranging values from smallest to __________.', '', 'largest', '', 'Ascending means going up.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000442', 'STG009', 'CH0088', 'MCQ', 'Which sorting algorithm repeatedly compares neighboring elements?', '', 'Bubble Sort', '', 'This algorithm''s name comes from values gradually moving toward the end, like bubbles.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000443', 'STG009', 'CH0088', 'MCQ', 'In C, does an ordinary array sort itself automatically?', '', 'No, a sorting algorithm must be written', '', 'C stores an array exactly as it is given.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001110', 'Q000439', 'The values themselves change', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001111', 'Q000439', 'Only the positions of the values change', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001112', 'Q000439', 'New values are added', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001113', 'Q000439', 'Values are deleted', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001114', 'Q000440', 'Searching with Binary Search', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001115', 'Q000440', 'Storing more values', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001116', 'Q000440', 'Changing data types', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001117', 'Q000440', 'Deleting elements', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001118', 'Q000442', 'Bubble Sort', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001119', 'Q000442', 'Selection Sort', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001120', 'Q000442', 'Insertion Sort', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001121', 'Q000442', 'Binary Search', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001122', 'Q000443', 'Yes, C sorts arrays automatically', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001123', 'Q000443', 'No, a sorting algorithm must be written', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001124', 'Q000443', 'Only if the array has fewer than 10 elements', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001125', 'Q000443', 'Only float arrays sort automatically', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000439', 'Q000439', 'Think about the before-and-after example: the same numbers, rearranged.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000440', 'Q000440', 'One searching method needs the data to already be in order.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000441', 'Q000441', 'Ascending means going up.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000442', 'Q000442', 'This algorithm''s name comes from values gradually moving toward the end, like bubbles.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000443', 'Q000443', 'C stores an array exactly as it is given.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000439', 'TERM211', 'sorting', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000440', 'TERM212', 'sorted', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000441', 'TERM213', 'ascending order', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000442', 'TERM214', 'bubble sort', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000443', 'TERM215', 'algorithm', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0089', 'STG009', 'CH0089', 'Sorting in Ascending & Descending Order', 'Understanding Ascending Order
Ascending order means arranging values from the smallest to the largest. When sorting an array, the program compares two neighboring elements and checks whether they are in the correct order: if (arr[j] > arr[j + 1]) { // swap }.

Suppose the array contains 20 10: the program compares 20 > 10, which is true, so the two values must exchange positions: before 20 10, after 10 20.

Key idea: in ascending order, swap when the left element is greater than the right element.//.//Understanding Descending Order
Descending order means arranging values from the largest to the smallest. For descending order, the comparison flips: if (arr[j] < arr[j + 1]) { // swap }.

Suppose 10 20: the program compares 10 < 20, which is true, so the values must be swapped: before 10 20, after 20 10. Ascending vs Descending: ascending wants smaller -> larger and swaps on arr[j] > arr[j+1]; descending wants larger -> smaller and swaps on arr[j] < arr[j+1].

Key idea: in descending order, swap when the left element is smaller than the right element.//.//Comparing Two Elements
Sorting becomes much easier to understand when we focus on two elements at a time. For ascending order we want smaller -> larger: 20 10, since 20 is larger than 10 the order is incorrect (20 > 10), so we swap to get 10 20. For descending order we want larger -> smaller: 20 10 is already correct (no swap needed), but 10 20 is incorrect (10 < 20) so we swap to get 20 10.

Key idea: the desired order tells the program when two elements are in the wrong position.//.//Swapping Two Values
Once the program decides two elements are in the wrong order, it must exchange their positions. Suppose arr[i] = 20 and arr[j] = 10, and we want arr[i] = 10 and arr[j] = 20. A common mistake is arr[i] = arr[j]; arr[j] = arr[i]; - this does NOT work correctly: after the first statement, both arr[i] and arr[j] equal 10, and the original 20 has been lost.

We need a temporary storage location: int temp; temp = arr[i]; arr[i] = arr[j]; arr[j] = temp; Step 1: temp = arr[i] saves 20 into temp. Step 2: arr[i] = arr[j] makes arr[i] become 10. Step 3: arr[j] = temp puts the saved 20 into arr[j]. Key idea: temp protects one value while the two array elements exchange positions.//.//One Algorithm, Two Directions
Ascending and descending sorting use the same basic process: compare -> decide -> swap if needed -> continue. The only difference is the comparison condition. Ascending: if (arr[j] > arr[j + 1]) - smaller values move toward the beginning. Descending: if (arr[j] < arr[j + 1]) - larger values move toward the beginning.

This is an important idea: the overall sorting algorithm can remain almost identical; to change the direction, we often only need to change the comparison. Core takeaway: ascending means smaller values come first, descending means larger values come first, and a temporary variable is used to safely exchange two values. Once this comparison-and-swap idea is clear, Bubble Sort becomes much easier to understand, because Bubble Sort repeatedly applies exactly this process to neighboring elements.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM216', 'swap condition', 'The comparison that decides whether two neighbors must exchange positions.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM217', 'swap condition', 'The comparison used for descending order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM218', 'temp', 'A temporary variable used to hold one value safely during a swap.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM219', 'temp', 'Protects one value while two elements exchange positions.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM220', 'descending order', 'Arranged from largest to smallest.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000444', 'STG009', 'CH0089', 'CODE_FILL', 'Complete the ascending swap condition:', 'if (arr[j] {{1}} arr[j + 1])
{
   // swap
}', '[">"]', '', 'For ascending order, swap when the left value is bigger than the right.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000445', 'STG009', 'CH0089', 'CODE_FILL', 'Complete the descending swap condition:', 'if (arr[j] {{1}} arr[j + 1])
{
   // swap
}', '["<"]', '', 'For descending order, swap when the left value is smaller than the right.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000446', 'STG009', 'CH0089', 'CODE_FILL', 'Complete the swap using a temporary variable:', 'int temp;
temp = arr[i];
arr[i] = arr[j];
arr[j] = {{1}};', '["temp"]', '', 'The value saved in temp needs to go into arr[j] to finish the swap.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000447', 'STG009', 'CH0089', 'MCQ', 'Why does arr[i] = arr[j]; arr[j] = arr[i]; fail to swap two values?', '', 'The original value of arr[i] is lost before it can be stored in arr[j]', '', 'Think about what happens to arr[i]''s value right after the first line runs.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000448', 'STG009', 'CH0089', 'BLANK', 'For descending order, we want values to go from __________ to smaller.', '', 'larger', '', 'Descending order places the biggest value first.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001126', 'Q000447', 'It causes a compile error', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001127', 'Q000447', 'The original value of arr[i] is lost before it can be stored in arr[j]', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001128', 'Q000447', 'It swaps the values correctly', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001129', 'Q000447', 'It only works for descending order', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000444', 'Q000444', 'For ascending order, swap when the left value is bigger than the right.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000445', 'Q000445', 'For descending order, swap when the left value is smaller than the right.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000446', 'Q000446', 'The value saved in temp needs to go into arr[j] to finish the swap.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000447', 'Q000447', 'Think about what happens to arr[i]''s value right after the first line runs.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000448', 'Q000448', 'Descending order places the biggest value first.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000444', 'TERM216', 'swap condition', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000445', 'TERM217', 'swap condition', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000446', 'TERM218', 'temp', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000447', 'TERM219', 'temp', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000448', 'TERM220', 'descending order', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0090', 'STG009', 'CH0090', 'Bubble Sort', 'Understanding Bubble Sort
Bubble Sort repeatedly compares two neighboring elements in an array and swaps them if they are in the wrong order. For ascending order: smaller -> larger.

Consider 5 3 8 2: compare 5 and 3, since 5 > 3 they swap -> 3 5 8 2. Compare 5 and 8: 5 < 8, already correct, no swap. Compare 8 and 2: 8 > 2, swap -> 3 5 2 8. Notice 8 has moved all the way to the end - this is where the name Bubble Sort comes from: larger values gradually move toward the end, like a value "bubbling" upward through repeated neighbor comparisons.

Key idea: Bubble Sort repeatedly compares adjacent elements and swaps them when they are in the wrong order.//.//Comparing and Swapping Neighbors
Starting array 5 3 8 2. Comparison 1: compare 5 3, 5 > 3, swap -> 3 5 8 2. Comparison 2: compare 5 8, 5 > 8 is false, no swap -> 3 5 8 2. Comparison 3: compare 8 2, 8 > 2, swap -> 3 5 2 8.

Key idea: during an ascending Bubble Sort pass, the largest unsorted value gradually moves toward the end.//.//Understanding a Bubble Sort Pass
A pass means moving through the array and comparing adjacent elements from left to right. Starting array 5 3 8 2. Step 1: compare 5 and 3, result 3 5 8 2. Step 2: compare 5 and 8, result 3 5 8 2 (no change). Step 3: compare 8 and 2, result 3 5 2 8.

After one pass: 3 5 2 8 - the array is not completely sorted yet; 3 5 2 remain to organize. Second pass: compare 3 5 (no swap), compare 5 2 (swap) -> 3 2 5 8; the already-correct 8 does not need to be disturbed. Third pass: compare 3 2 (swap) -> 2 3 5 8 - now sorted.

Key idea: Bubble Sort needs multiple passes. After each pass, one more large value reaches its correct position at the end.//.//Bubble Sort in C
The basic structure uses two loops: for(int i=0;i<n-1;i++){ for(int j=0;j<n-i-1;j++){ if(arr[j]>arr[j+1]){ int temp=arr[j]; arr[j]=arr[j+1]; arr[j+1]=temp; } } }.

Outer loop (i) controls the number of passes: up to n - 1 passes for n elements. Inner loop (j) moves through the array comparing arr[j] and arr[j+1]. The comparison if(arr[j]>arr[j+1]) is the rule for ascending order; the swap uses a temporary variable. The inner loop becomes shorter after each pass (n - i - 1) because there is no need to compare elements that are already in the sorted section.

Key idea: the outer loop chooses the position, the inner loop finds pairs to compare, and the if condition decides whether a swap is needed.//.//The Main Idea of Bubble Sort
Bubble Sort can be understood as one repeated process: compare neighbors -> are they in the wrong order? -> yes: swap, no: do nothing -> move to next pair -> repeat the pass -> start another pass. For ascending order: if(arr[j]>arr[j+1]). For descending order the comparison flips: if(arr[j]<arr[j+1]).

For 5 3 8 2: 5 3 8 2 -> 3 5 2 8 -> 3 2 5 8 -> 2 3 5 8. Core takeaway: adjacent elements are compared, wrongly ordered neighbors are swapped, multiple passes are required, and in ascending order larger values move toward the end; the outer loop controls passes, the inner loop controls neighbor comparisons, and the comparison condition determines ascending or descending order.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM221', 'bubble sort', 'Repeatedly compares neighboring elements and swaps them when out of order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM222', 'outer loop', 'Controls the number of passes.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM223', 'pass', 'One complete left-to-right walk comparing neighbors.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM224', 'inner loop', 'Moves through the array comparing neighboring elements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM225', 'bubble sort', 'Larger values gradually move toward the end.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000449', 'STG009', 'CH0090', 'CODE_FILL', 'Complete the swap condition for ascending Bubble Sort:', 'if (arr[j] {{1}} arr[j + 1])
{
   int temp = arr[j];
   arr[j] = arr[j + 1];
   arr[j + 1] = temp;
}', '[">"]', '', 'Swap when the left neighbor is bigger than the right one.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000450', 'STG009', 'CH0090', 'CODE_FILL', 'Complete the outer loop bound:', 'for (int i = 0; i < n - {{1}}; i++)
{
   // one pass per run of this loop
}', '["1"]', '', 'An array of n elements needs at most n - 1 passes.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000451', 'STG009', 'CH0090', 'MCQ', 'Array: 5 3 8 2. After one full pass of ascending Bubble Sort, which value has moved all the way to the end?', '', '8', '', 'The largest value bubbles to the end during the first pass.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000452', 'STG009', 'CH0090', 'MCQ', 'What does the inner loop''s bound n - i - 1 avoid doing?', '', 'Re-checking elements already sorted at the end', '', 'Think about what earlier passes have already accomplished.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000453', 'STG009', 'CH0090', 'BLANK', 'In Bubble Sort, after each pass, one more large value reaches its correct position at the __________.', '', 'end', '', 'Ascending Bubble Sort moves larger values in this direction.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001130', 'Q000451', '5', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001131', 'Q000451', '3', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001132', 'Q000451', '8', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001133', 'Q000451', '2', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001134', 'Q000452', 'Re-checking elements already sorted at the end', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001135', 'Q000452', 'Checking the first element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001136', 'Q000452', 'Comparing arr[j] with itself', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001137', 'Q000452', 'Running the outer loop', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000449', 'Q000449', 'Swap when the left neighbor is bigger than the right one.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000450', 'Q000450', 'An array of n elements needs at most n - 1 passes.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000451', 'Q000451', 'The largest value bubbles to the end during the first pass.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000452', 'Q000452', 'Think about what earlier passes have already accomplished.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000453', 'Q000453', 'Ascending Bubble Sort moves larger values in this direction.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000449', 'TERM221', 'bubble sort', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000450', 'TERM222', 'outer loop', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000451', 'TERM223', 'pass', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000452', 'TERM224', 'inner loop', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000453', 'TERM225', 'bubble sort', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0091', 'STG009', 'CH0091', 'Selection Sort', 'Understanding Selection Sort
Selection Sort is a sorting method that repeatedly looks through the unsorted part of an array, finds the smallest element, and places it at the beginning of that unsorted section. Like arranging books from shortest to tallest: look through the remaining books, find the shortest one, place it first, repeat.

Suppose 5 3 8 2: inspect the entire array, the smallest value is 2; move 2 to the first position: 2 3 8 5. The first position is now correct; the process continues with the remaining part: [2] | 3 8 5.

Key idea: Selection Sort builds the sorted array one position at a time by selecting the smallest remaining element.//.//Finding the Minimum Element
Selection Sort keeps track of the position of the smallest value. Start with 5 3 8 2, assume the first element is the minimum: int min = i (min = 0). Compare the remaining elements: if (arr[j] < arr[min]) { min = j; }. 5 is current smallest; 3 is smaller than 5 so min=1; 8 is larger so no change; 2 is smaller than 3 so min=3. At the end, min = 3, telling us the smallest element is at index 3. Exchange the first element with the minimum: swap arr[0] and arr[3] -> 2 3 8 5.

Key idea: Selection Sort remembers WHERE the smallest value is (as an index), then swaps that element into the correct position.//.//The Sorted and Unsorted Parts
One of the easiest ways to understand Selection Sort is to imagine the array divided into two sections: [SORTED] | [UNSORTED], with the sorted section growing from left to right.

Consider 5 3 8 2 7 1: Pass 1 finds the smallest value in the entire array (1) and places it at the beginning: [1] | 3 8 2 7 5. Pass 2 searches only the unsorted part 3 8 2 7 5, minimum is 2, placed next: [1 2] | 8 3 7 5. Pass 3 searches 8 3 7 5, minimum is 3: [1 2 3] | 8 7 5. Pass 4 searches 8 7 5, minimum is 5: [1 2 3 5] | 7 8.

Key idea: after every pass, one more element is placed permanently into the sorted portion.//.//Selection Sort in C
The basic structure: for(int i=0;i<n-1;i++){ int min=i; for(int j=i+1;j<n;j++){ if(arr[j]<arr[min]){ min=j; } } int temp=arr[i]; arr[i]=arr[min]; arr[min]=temp; }.

Step 1 (choose the position): i represents the position where the next smallest element should be placed; i=0 finds smallest for position 0, i=1 finds smallest for position 1, and so on. Step 2 (assume current is minimum): int min=i assumes arr[i] is the smallest until proven otherwise. Step 3 (search unsorted part): j starts at i+1 because arr[i] is already the current candidate. Step 4 (find a smaller element): if(arr[j]<arr[min]){ min=j; } remembers the index when a smaller element is found. Step 5 (swap): after searching the whole unsorted section, int temp=arr[i]; arr[i]=arr[min]; arr[min]=temp; places the smallest element at position i.

Key idea: the outer loop chooses the position, the inner loop finds the minimum, and the swap places it correctly.//.//Selection Sort in Action
Consider 6 3 8 2 7 1 5 4. Pass 1: search the entire array, minimum is 1, swap 6 and 1: [1] | 3 8 2 7 6 5 4. Pass 2: search the remaining values, minimum is 2, swap: [1 2] | 8 3 7 6 5 4. Passes continue similarly, with the sorted section growing by one element each time until the array 1 2 3 4 5 6 7 8 is fully sorted.

Selection Sort mental model: Selection Sort -> Find smallest -> Remember its index -> Swap with first unsorted position -> Sorted section grows -> Repeat. Core takeaway: Selection Sort repeatedly selects the smallest element from the unsorted section and places it at the beginning of that section. For ascending order: find minimum -> swap -> move right -> repeat. For descending order, the same structure finds the maximum instead of the minimum.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM226', 'min', 'Stores the index of the smallest value found so far.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM227', 'min', 'Remembers the position of the new smallest value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM228', 'min', 'The index of the smallest value found so far.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM229', 'sorted portion', 'The part of the array already in its final order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM230', 'selection sort', 'Repeatedly selects the smallest remaining element.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000454', 'STG009', 'CH0091', 'CODE_FILL', 'Complete the comparison that looks for a smaller value than the current minimum:', 'if (arr[j] {{1}} arr[min])
{
   min = j;
}', '["<"]', '', 'The search is looking for a value smaller than the current best guess.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000455', 'STG009', 'CH0091', 'CODE_FILL', 'Complete the line that remembers the position of the new smallest value:', 'if (arr[j] < arr[min])
{
   {{1}} = j;
}', '["min"]', '', 'The variable that stores the index of the smallest value found so far needs to be updated.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000456', 'STG009', 'CH0091', 'MCQ', 'What does the variable min store in Selection Sort?', '', 'The index of the smallest value found so far', '', 'min is used to look up arr[min], so it must be a position, not a value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000457', 'STG009', 'CH0091', 'BLANK', 'In Selection Sort, the sorted section grows from left to __________.', '', 'right', '', 'Think about which direction i moves through the array.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000458', 'STG009', 'CH0091', 'MCQ', 'Selection Sort repeatedly selects which value from the unsorted section and places it correctly?', '', 'The smallest value', '', 'Think about what the variable min is tracking.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001138', 'Q000456', 'The smallest value found so far', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001139', 'Q000456', 'The index of the smallest value found so far', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001140', 'Q000456', 'The number of comparisons made', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001141', 'Q000456', 'The size of the array', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001142', 'Q000458', 'The largest value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001143', 'Q000458', 'The smallest value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001144', 'Q000458', 'A random value', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001145', 'Q000458', 'The first value', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000454', 'Q000454', 'The search is looking for a value smaller than the current best guess.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000455', 'Q000455', 'The variable that stores the index of the smallest value found so far needs to be updated.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000456', 'Q000456', 'min is used to look up arr[min], so it must be a position, not a value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000457', 'Q000457', 'Think about which direction i moves through the array.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000458', 'Q000458', 'Think about what the variable min is tracking.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000454', 'TERM226', 'min', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000455', 'TERM227', 'min', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000456', 'TERM228', 'min', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000457', 'TERM229', 'sorted portion', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000458', 'TERM230', 'selection sort', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0092', 'STG009', 'CH0092', 'Insertion Sort', 'Understanding Insertion Sort
Insertion Sort is a sorting algorithm that builds the sorted array one element at a time, similar to arranging playing cards in your hand. Instead of trying to sort the entire array at once, it starts with a small sorted portion and gradually grows it.

Consider 5 3 8 2: treat the first element as already sorted: [5] [3 8 2]. Take 3 and insert it into the correct position: [3 5] [8 2]. Next, 8 is considered: [3 5 8] [2]. Finally, 2 is inserted into the correct position: [2 3 5 8].

Key idea: Insertion Sort grows a sorted portion by inserting one element into its correct position.//.//Inserting an Element
Start with 5 3 8 2: treat 5 as the first sorted element, [5] [3 8 2]. Select 3: key = 3. Compare 3 with the element before it, 5: is 5 > 3? Yes, so 5 is larger than 3 and needs to move one position to the right: 5 3 becomes 5 5, then 3 is inserted: 3 5. The sorted portion has grown: [3 5] [8 2].

Insertion Sort normally shifts larger elements to the right rather than repeatedly swapping neighboring elements. Key idea: the selected element is called the key, and larger elements are shifted right until the correct position for the key is found.//.//The Sorted Portion
One of the most important ideas in Insertion Sort is the division between the sorted portion and the unsorted portion: [sorted portion] [unsorted portion]. Starting array 5 3 8 2: at the beginning, [5] [3 8 2]; after inserting 3, [3 5] [8 2]; after considering 8, [3 5 8] [2]; after inserting 2, [2 3 5 8].

The sorted portion always grows by one element. This is the central mental model for Insertion Sort.//.//Insertion Sort in C
The basic structure: for(int i=1;i<n;i++){ int key=arr[i]; int j=i-1; while(j>=0 && arr[j]>key){ arr[j+1]=arr[j]; j--; } arr[j+1]=key; }.

Step 1 (start from the second element): i starts at 1 because the first element is treated as the initial sorted portion. Step 2 (store the current element): int key=arr[i] protects this value while other elements are shifted. Step 3 (start comparing from the previous element): int j=i-1 points to the element immediately before the key. Step 4 (shift larger elements): while(j>=0 && arr[j]>key){ arr[j+1]=arr[j]; j--; } - j>=0 makes sure we do not move beyond the start of the array, and arr[j]>key checks whether the current element is larger than the key. Step 5 (insert the key): after all larger elements have moved, arr[j+1]=key places the key into the empty position.

Key idea: key stores the element being inserted, j searches backward, larger elements shift right, and finally the key is placed into the empty position.//.//Complete Insertion Sort Process
Using 5 3 8 2: Step 1 (start): [5] [3 8 2], 5 is considered sorted. Step 2 (insert 3): compare 5 and 3, 5>3 so shift 5 right, insert 3: [3 5] [8 2]. Step 3 (insert 8): compare 8 and 5, 5>8 is false, no shifting needed: [3 5 8] [2]. Step 4 (insert 2): compare 2 with 8 (shift), 5 (shift), 3 (shift), then insert 2: [2 3 5 8].

Insertion Sort mental model: select one element -> call it key -> look left -> shift larger elements right -> find correct position -> insert key -> sorted portion grows. Core takeaway: Insertion Sort builds the sorted array one element at a time; it selects a key, compares it with previous elements, shifts larger values to the right, and inserts the key into its correct position. Three ideas to remember: key = element being inserted, shift = move larger elements right, insert = place key in the correct position.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM231', 'key', 'The element currently being inserted.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM232', 'shift', 'Move a larger element one position to the right.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM233', 'shift', 'Moves the value at position j one step to the right.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM234', 'key', 'The element being inserted into the sorted portion.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM235', 'insertion sort', 'Builds the sorted array one element at a time.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000459', 'STG009', 'CH0092', 'CODE_FILL', 'Complete the line that saves the element being inserted:', 'int {{1}} = arr[i];', '["key"]', '', 'This variable name is used throughout Insertion Sort for the element currently being placed.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000460', 'STG009', 'CH0092', 'CODE_FILL', 'Complete the condition that decides whether to shift an element right:', 'while (j >= 0 && arr[j] {{1}} key)
{
   arr[j + 1] = arr[j];
   j--;
}', '[">"]', '', 'Only an element bigger than the key needs to move out of the way.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000461', 'STG009', 'CH0092', 'CODE_FILL', 'Complete the line that shifts a larger element one position right:', 'arr[j + 1] = {{1}};
j--;', '["arr[j]"]', '', 'The value currently at position j is the one that needs to move right.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000462', 'STG009', 'CH0092', 'MCQ', 'In Insertion Sort, what does the variable key store?', '', 'The element currently being inserted into the sorted portion', '', 'key is saved before any shifting happens, so it is not lost.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000463', 'STG009', 'CH0092', 'BLANK', 'Insertion Sort maintains a sorted __________ and repeatedly inserts the next element into it.', '', 'prefix', '', 'This is the part of the array at the very beginning that is already in order.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001146', 'Q000462', 'The index of the current element', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001147', 'Q000462', 'The element currently being inserted into the sorted portion', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001148', 'Q000462', 'The size of the array', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001149', 'Q000462', 'The number of shifts performed', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000459', 'Q000459', 'This variable name is used throughout Insertion Sort for the element currently being placed.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000460', 'Q000460', 'Only an element bigger than the key needs to move out of the way.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000461', 'Q000461', 'The value currently at position j is the one that needs to move right.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000462', 'Q000462', 'key is saved before any shifting happens, so it is not lost.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000463', 'Q000463', 'This is the part of the array at the very beginning that is already in order.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000459', 'TERM231', 'key', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000460', 'TERM232', 'shift', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000461', 'TERM233', 'shift', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000462', 'TERM234', 'key', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000463', 'TERM235', 'insertion sort', 1, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0093', 'STG009', 'CH0093', 'Comparing Sorting Methods', 'Three Sorting Methods
In the previous chapters we learned three basic sorting algorithms: Bubble Sort, Selection Sort and Insertion Sort. All three can arrange an array in ascending or descending order, and they all share the same overall goal: take an unsorted array and rearrange its elements into the required order.

Before sorting: 40 10 30 20. After sorting: 10 20 30 40. The final result is the same, but the way each algorithm reaches that result is different. The three mental models: Bubble Sort = "Compare neighbors", Selection Sort = "Find the smallest", Insertion Sort = "Insert into the sorted part".

Key idea: do not judge sorting algorithms only by their final output - what matters is how they move and organize the elements to get there.//.//How the Three Methods Work
The easiest way to compare sorting algorithms is to identify their main operation. Bubble Sort: compares adjacent elements, and its main action is swapping neighboring elements. Selection Sort: finds the minimum/maximum, and its main action is selecting an element and placing it. Insertion Sort: inserts into the sorted portion, and its main action is shifting elements and inserting one value.

Bubble Sort''s mental model: COMPARE -> SWAP -> MOVE FORWARD. Selection Sort''s mental model: FIND SMALLEST -> PLACE IT -> REPEAT. Insertion Sort''s mental model: TAKE VALUE -> SHIFT LARGER VALUES -> INSERT.

Key idea: the three algorithms differ mainly in what they focus on: Bubble focuses on the neighbor, Selection focuses on the minimum/maximum, Insertion focuses on the sorted portion.//.//Beginner-Level Comparison
At the beginner level, it helps to compare the algorithms by the operation you actually see in the code. Main operation: Bubble = swap neighbors, Selection = select minimum/maximum, Insertion = shift and insert. Comparison style: Bubble = adjacent elements, Selection = current minimum vs others, Insertion = key vs previous elements. Swapping required: Bubble = frequently, Selection = usually once per pass, Insertion = not necessarily. Builds sorted portion: Bubble = from the end, Selection = from the beginning, Insertion = from the beginning. Basic idea: Bubble = repeated neighboring comparisons, Selection = repeated selection, Insertion = repeated insertion.

A useful way to identify the algorithm when reading C code: adjacent elements are compared -> Bubble Sort; a minimum element is searched for -> Selection Sort; elements are shifted to make space -> Insertion Sort.//.//Same Array, Three Approaches
Using 5 3 8 2: Bubble Sort begins with neighboring values, swaps 5 and 3 because 5 > 3, then continues comparing neighbors. Selection Sort looks for the smallest value in the unsorted portion (2), and places it at the beginning. Insertion Sort considers part of the array sorted and inserts the next value into its correct position by shifting larger values right.

Important observation: all three algorithms eventually produce the same sorted array, 2 3 5 8. The difference is how they organize the work: Bubble Sort goes neighbor -> neighbor -> neighbor; Selection Sort goes search -> select -> place; Insertion Sort goes take -> shift -> insert.//.//Core Takeaway
The three sorting methods have the same goal, but different strategies: Bubble Sort compares neighboring elements, Selection Sort finds an element to place, and Insertion Sort inserts each new element into the correct position.

Once these three ideas are clear, the actual C code for each algorithm becomes much easier to read, because the code is no longer a mysterious collection of loops and swaps - it is simply the programming version of the strategy.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM236', 'bubble sort', 'Compares adjacent elements and swaps neighbors.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM237', 'selection sort', 'Selects the minimum or maximum remaining value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM238', 'insertion sort', 'Shifts elements right to make space for the key.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM239', 'bubble sort', 'Builds its sorted portion from the end of the array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM240', 'bubble sort', 'Its basic idea is repeated neighboring comparisons.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000464', 'STG009', 'CH0093', 'MCQ', 'What is true about Bubble Sort, Selection Sort and Insertion Sort once they finish sorting the same array?', '', 'They all produce the same sorted array, using different strategies', '', 'Think about the "same array, three approaches" comparison.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000465', 'STG009', 'CH0093', 'MCQ', 'Which algorithm''s main operation is to select the minimum (or maximum) value?', '', 'Selection Sort', '', 'This algorithm''s own name describes its main operation.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000466', 'STG009', 'CH0093', 'MCQ', 'Which algorithm shifts elements to make space instead of always swapping?', '', 'Insertion Sort', '', 'This algorithm inserts a key into a gap it makes by shifting.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000467', 'STG009', 'CH0093', 'BLANK', 'Bubble Sort''s sorted portion grows from the __________ of the array.', '', 'end', '', 'Think about where the largest values end up after each pass.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000468', 'STG009', 'CH0093', 'MCQ', 'Which phrase best matches Bubble Sort''s basic idea?', '', 'Compare neighbors', '', 'This is Bubble Sort''s one-word memory phrase.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001150', 'Q000464', 'They always produce different results', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001151', 'Q000464', 'They all produce the same sorted array, using different strategies', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001152', 'Q000464', 'Only Bubble Sort finishes correctly', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001153', 'Q000464', 'They cannot all sort the same array', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001154', 'Q000465', 'Bubble Sort', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001155', 'Q000465', 'Selection Sort', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001156', 'Q000465', 'Insertion Sort', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001157', 'Q000465', 'Binary Search', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001158', 'Q000466', 'Bubble Sort', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001159', 'Q000466', 'Selection Sort', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001160', 'Q000466', 'Insertion Sort', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001161', 'Q000466', 'Binary Search', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001162', 'Q000468', 'Compare neighbors', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001163', 'Q000468', 'Find the smallest', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001164', 'Q000468', 'Insert into sorted part', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001165', 'Q000468', 'Divide and search', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000464', 'Q000464', 'Think about the "same array, three approaches" comparison.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000465', 'Q000465', 'This algorithm''s own name describes its main operation.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000466', 'Q000466', 'This algorithm inserts a key into a gap it makes by shifting.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000467', 'Q000467', 'Think about where the largest values end up after each pass.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000468', 'Q000468', 'This is Bubble Sort''s one-word memory phrase.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000464', 'TERM236', 'bubble sort', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000465', 'TERM237', 'selection sort', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000466', 'TERM238', 'insertion sort', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000467', 'TERM239', 'bubble sort', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000468', 'TERM240', 'bubble sort', 1, true);

end
$migration$;
