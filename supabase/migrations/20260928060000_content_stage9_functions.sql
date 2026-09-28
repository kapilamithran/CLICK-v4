-- Stage 9 (STG010, FUNCTIONS) real content, replacing the structural placeholders added by
-- 20260917120000_stage6to10_placeholders.sql. That migration reserved chapter_id's CH0094-CH0102 (9
-- chapters, titles that match the Functions1-9 PDF source set under assets/Contents/Functions/) with zero
-- learn_content/questions/etc, which is what kept the stage out of Practice and out of the unified-chapter
-- Home path. This migration fills in the real learn_content + questions/options/hints/glossary for all 9
-- chapters (unchanged IDs, titles, stage_id - no renumbering, no new chapter_id needed: 9 PDFs map 1:1 onto
-- the 9 reserved placeholders).
--
-- Every source PDF ends in a 5-question quiz written by the source material itself (45 questions in all:
-- Theory MCQ, Output Guess, Fill the Missing Code, Jumbled Sentence, Fill in the Blank), inserted close to
-- verbatim and matched to the nearest existing DB question type (MCQ / PREDICT_OUTPUT / CODE_FILL / ORDER /
-- BLANK). Where a PDF quiz repeats a question from an earlier chapter or asks about another chapter's topic, the
-- question is re-aimed at its own chapter using only wording and code the PDFs themselves use:
--   * CH0095: the Output Guess and the "void" fill-in repeated CH0094 verbatim, so they use makeTea() (its own
--     slide-1 example) - called twice, to show "create once, call many times" - and a makeTea() header.
--   * CH0096: the jumbled sentence was CH0095's; it now uses CH0100's PDF sentence "Functions receive values
--     through parameters", which is about parameters.
--   * CH0097: the last fill-in (the greet() name) belongs to CH0094-CH0095; it now uses CH0099's PDF question
--     that completes "int ______() { return 25; }" (getNumber), which is about return values. The jumbled
--     sentence is the PDFs' "A function can return a value".
--   * CH0098: the Output Guess repeated the greet() program; it now uses the getNumber() program of its own Type 3.
--     The jumbled sentence ("A function can return a value") is CH0097's, so it now says "Functions are
--     classified by parameters and return value" (this chapter's first slide).
--   * CH0099: the jumbled sentence and the last fill-in belonged to other chapters; they now use "Each
--     argument is matched with its corresponding parameter" and "In add(5, 3) the values 5 and 3 are called
--     arguments" (both are this chapter's slides).
--   * CH0100: the jumbled sentence and the last fill-in were about parameters and void; they now use "A global
--     variable is declared outside all functions" and "A variable declared inside a function is called a local
--     variable" (this chapter's own slides).
--   * CH0101: the jumbled sentence was about local variables; it now says "A function can receive an array".
--   * CH0102 keeps the two review questions the PDF itself marks as "Previous Topic" and "Second Previous Topic".
-- Every Output Guess gets three wrong choices so it fits the existing PREDICT_OUTPUT type; the quiz code and
-- expected answers are unchanged.
--
-- Stage 9 is intentionally NOT unlocked by this migration: the STG010 self-referencing prerequisite row from
-- the placeholder migration is left in place (still unconditionally locked) until the chapter decks +
-- activities are written and the full test suite passes. A later migration removes exactly that one row,
-- mirroring the Stage 6-8 unlock precedents.

-- Idempotent: everything below runs inside one guarded block. If Stage 9's learn_content is already present
-- (this migration was applied before), the block does nothing, so a re-run can never duplicate rows or fail
-- half way. Nothing is deleted or altered; only new rows are added.
do $migration$
begin
  if exists (select 1 from learn_content where learn_id = 'L_CH0094') then
    raise notice 'Stage 9 (FUNCTIONS) content already present; nothing to do.';
    return;
  end if;

-- learn_content (CH0094: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0094', 'STG010', 'CH0094', 'What is a Function?', 'What Is a Function?
A function is a named block of code used to perform a specific task. Functions help us divide a large program into smaller and easier parts.

Simple idea: Task -> Function -> Result.

Think of ordering tea in a college canteen. You order tea (function call). The tea master prepares tea (function execution). You receive tea (result).

Small example: void greet() { printf("Hello Student"); }

Remember: Function = a small worker that performs one task.
//.//
Why Do We Use Functions?
Functions make a program easier to write, understand, and manage. The benefits are: 1. Reusability - write code once and use it many times. 2. Less repetition - avoid writing the same code again. 3. Easy reading - divide a large program into small parts. 4. Easy debugging - find errors in a smaller section. 5. Easy maintenance - change one function when needed.

Small programs become bigger applications by using functions as modules. The greet() function can be called whenever the message is needed.

Remember: Write once -> Call many times.
//.//
Function and Greedy Algorithm
Are they the same? No. A function and a greedy algorithm are different concepts.

A function is a block of code that performs a particular task. A greedy algorithm is a problem-solving method that chooses the best available option at each step.

Function -> performs the work. Greedy algorithm -> chooses the option. A function can contain a greedy algorithm, for example void chooseBest() { printf("Choose the best option"); }.

Think of a student: the function is the student doing the task, and the greedy algorithm is the student choosing the easiest task first.

Remember: Function is the worker. Greedy is the decision method.
//.//
How Does a Function Work?
A function works in three main steps: 1. Define - write the function and its statements. 2. Call - use the function name. 3. Execute - the statements inside the function run.

Flow: START -> define function -> call function -> execute function -> task completed -> END.

In the C example, void greet() { printf("Hello Student"); } is defined first, then main() calls greet(); and the output is Hello Student.

Important: A function executes when it is called.
//.//
Recap: Functions in C
What did we learn? A function is a named block of code. It performs a specific task. Functions divide large programs into smaller parts, reduce repeated code, and improve readability and debugging. A function is different from a greedy algorithm, although a function can contain one. A function runs when it is called.

Think of a college group project: function = team member, function call = giving a task, function execution = doing the task, output = completed work.

One-line recap: A function is a reusable block of code that performs a specific task when called.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM296', 'void', 'A keyword used when a function returns no value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM297', 'Call', 'Using a function to execute its code.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM298', 'Return', 'The value sent back by a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM299', 'Specific', 'A particular or definite task.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM300', 'Task', 'A piece of work that needs to be done.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000499', 'STG010', 'CH0094', 'MCQ', 'Which keyword is used when a function does not return any value?', '', 'void', '', 'It means "no value".', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000500', 'STG010', 'CH0094', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

void greet() {
    printf("Hello");
}

int main() {
    greet();
    return 0;
}', 'Hello', '', 'The function is called inside main().', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000501', 'STG010', 'CH0094', 'CODE_FILL', 'Fill the Missing Code
Complete the function header so greet() returns no value.', '#include <stdio.h>

{{1}} greet() {
    printf("Welcome");
}', '["void"]', '', 'Use the keyword for no return value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000502', 'STG010', 'CH0094', 'ORDER', 'Arrange the words to form the sentence:', '', 'A||function||performs||a specific task', '', 'Start with the word "A".', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000503', 'STG010', 'CH0094', 'BLANK', 'A function is a block of code used to perform a __________ task.', '', 'specific', '', 'It means a particular task.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001254', 'Q000499', 'int', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001255', 'Q000499', 'return', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001256', 'Q000499', 'void', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001257', 'Q000499', 'float', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001258', 'Q000500', 'Hello', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001259', 'Q000500', 'greet', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001260', 'Q000500', 'Hello greet', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001261', 'Q000500', 'Nothing is printed', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001262', 'Q000502', 'function', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001263', 'Q000502', 'performs', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001264', 'Q000502', 'a specific task', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001265', 'Q000502', 'A', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000499', 'Q000499', 'It means "no value".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000500', 'Q000500', 'The function is called inside main().', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000501', 'Q000501', 'Use the keyword for no return value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000502', 'Q000502', 'Start with the word "A".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000503', 'Q000503', 'It means a particular task.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000499', 'TERM296', 'void', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000500', 'TERM297', 'Call', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000501', 'TERM298', 'Return', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000502', 'TERM299', 'Specific', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000503', 'TERM300', 'Task', 1, true);

-- learn_content (CH0095: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0095', 'STG010', 'CH0095', 'Creating and Calling a Function', 'Creating and Calling a Function
A function is a reusable block of code that performs a particular task. Creating a function means writing the instructions. Calling a function means asking the program to execute those instructions.

Think of a tea-making machine: you create the machine once, and whenever you need tea, you call the machine. The machine performs the same task again.

Small example: void makeTea() { printf("Tea is ready"); } Here makeTea() is created, but it will run only when it is called.

Remember: Create once -> Call whenever needed.
//.//
Why Are Functions Used?
Functions are used to: 1. Avoid repetition - write the same code only once. 2. Improve readability. 3. Divide large programs into smaller tasks. 4. Make debugging easier. 5. Reuse code - call the same function many times. 6. Improve maintenance - change the function in one place.

A good function should perform one clear and specific task. void greet() { printf("Hello"); } is a base-level function. void calculateTotal(int price, int quantity) { int total = price * quantity; printf("%d", total); } is more useful because it accepts data and performs a meaningful task.

For C programming, use meaningful function names, keep functions short, use proper indentation, add comments when needed, and give each function one clear responsibility.
//.//
Can Functions Be Used in a Greedy Algorithm?
A greedy algorithm solves a problem by choosing the best option available at each step. It focuses on the current best choice instead of checking every possible choice.

Yes, a function can be used inside a greedy algorithm. It can perform tasks such as selecting the best item, finding the minimum value, choosing the next activity, or checking the available options.

In a coin-selection problem, int chooseCoin() { return 10; } selects a coin, while the greedy algorithm decides which coin should be selected.

Important difference: a function is a reusable block of code; a greedy algorithm is a problem-solving strategy. A greedy algorithm can be written using one or more functions.
//.//
Flowchart: Creating and Calling a Function
Function execution flow: START -> create the function -> enter main() -> call function -> execute function code -> display the output -> END.

Code example: void greet() { printf("Hello Student"); } int main() { greet(); return 0; } The output is Hello Student.

Explanation: 1. The function greet() is created. 2. The program enters main(). 3. greet() is called. 4. The function executes its code. 5. The output is displayed.

Remember: Defining a function does not execute it. Calling the function executes it.
//.//
Recap: The Function Story
Imagine a college student preparing for a hackathon. 1. Create the function - the student writes the code once. 2. Call the function - the student uses the code whenever needed. 3. Execute the function - the code performs its task. 4. Get the output - the task is completed successfully.

Memory trick: a function is like your best friend. You create the friendship once, call them whenever you need help, and they perform the task!', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM301', 'Execute', 'To run the instructions written inside a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM302', 'Call', 'Using a function name to run its code.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM303', 'void', 'A keyword that indicates no value is returned.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM304', 'Calling', 'Asking a function to perform its task.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM305', 'Parentheses ()', 'Brackets used when defining or calling a function.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000504', 'STG010', 'CH0095', 'MCQ', 'What is the purpose of calling a function in C?', '', 'To execute the function', '', 'Calling means asking the function to run.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000505', 'STG010', 'CH0095', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

void makeTea() {
    printf("Tea is ready. ");
}

int main() {
    makeTea();
    makeTea();
    return 0;
}', 'Tea is ready. Tea is ready.', '', 'The function is called twice, so its code runs twice.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000506', 'STG010', 'CH0095', 'CODE_FILL', 'Fill the Missing Code
Complete the function header so makeTea() returns no value.', '#include <stdio.h>

{{1}} makeTea() {
    printf("Tea is ready");
}', '["void"]', '', 'Use the keyword when the function returns no value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000507', 'STG010', 'CH0095', 'ORDER', 'Arrange the words to form the sentence:', '', 'Calling||a function||executes||the code', '', 'Start with "Calling".', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000508', 'STG010', 'CH0095', 'CODE_FILL', 'Fill the Missing Code
Complete the statement that calls the add() function.', '#include <stdio.h>

void add() {
    printf("Addition");
}

int main() {
    {{1}};
    return 0;
}', '["add()"]', '', 'Write the function name followed by parentheses.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001266', 'Q000504', 'To delete the function', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001267', 'Q000504', 'To execute the function', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001268', 'Q000504', 'To rename the function', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001269', 'Q000504', 'To stop the program', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001270', 'Q000505', 'Tea is ready.', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001271', 'Q000505', 'Tea is ready. Tea is ready.', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001272', 'Q000505', 'makeTea makeTea', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001273', 'Q000505', 'Nothing is printed', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001274', 'Q000507', 'executes', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001275', 'Q000507', 'the code', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001276', 'Q000507', 'Calling', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001277', 'Q000507', 'a function', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000504', 'Q000504', 'Calling means asking the function to run.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000505', 'Q000505', 'The function is called twice, so its code runs twice.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000506', 'Q000506', 'Use the keyword when the function returns no value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000507', 'Q000507', 'Start with "Calling".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000508', 'Q000508', 'Write the function name followed by parentheses.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000504', 'TERM301', 'Execute', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000505', 'TERM302', 'Call', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000506', 'TERM303', 'void', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000507', 'TERM304', 'Calling', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000508', 'TERM305', 'Parentheses ()', 1, true);

-- learn_content (CH0096: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0096', 'STG010', 'CH0096', 'Functions with Parameters', 'What Are Parameters?
A parameter is a variable used to receive a value inside a function. Parameters allow a function to work with different inputs.

Without parameters, a function usually performs the same fixed task. With parameters, the same function can work with different values.

Think of a food-ordering function: the function is the order system, the parameter is the food item, and different inputs produce different orders.

Small example: void greet(char name[]) { printf("Hello %s", name); } Here, name is the parameter.

Remember: Same function + different parameters = different results.
//.//
Why Are Parameters Used?
Parameters are used to: 1. Pass information into a function. 2. Reuse the same function with different values. 3. Avoid writing separate functions for similar tasks. 4. Make programs flexible and useful. 5. Improve code organization. 6. Reduce repeated code.

Parameters allow a function to receive data from outside. void square(int n) { printf("%d", n * n); } is the base level. int calculateTotal(int price, int quantity) { return price * quantity; } accepts two values and returns a result.

Parameter vs argument: a parameter is a variable written in the function definition. An argument is the actual value passed during the function call. In void add(int a, int b), a and b are parameters. In add(5, 3);, 5 and 3 are arguments.
//.//
Types of Parameters
1. One parameter: a function receives one value, for example void display(int n) { printf("%d", n); }.

2. Multiple parameters: a function receives more than one value, for example void add(int a, int b) { printf("%d", a + b); }.

3. Parameters with a return value: a function receives values and sends back a result, for example int multiply(int a, int b) { return a * b; }.

Important: the number, order, and type of arguments should match the parameters. In add(5, 3); the first argument 5 goes to a and the second argument 3 goes to b.
//.//
Function with Parameters: Flow
Flow: START -> create function -> define parameters -> enter main() -> pass arguments -> call function -> execute using values -> get result -> END.

Example: void add(int a, int b) { printf("%d", a + b); } int main() { add(5, 3); return 0; } The output is 8.

Explanation: 1. a receives 5. 2. b receives 3. 3. The function adds both values. 4. The result 8 is displayed.
//.//
Parameters in Real Life
A function is like a college photocopy shop. The shop is the function, the document is the parameter. You give different documents, and the shop performs the same task each time.

Memory trick: Function = worker. Parameter = work given to the worker. Argument = actual work sent.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM306', 'Parameter', 'A variable that receives a value inside a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM307', 'Argument', 'The actual value passed to a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM308', 'int', 'A data type used to store whole numbers.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM309', 'Parameter', 'A variable that receives a value when a function is called.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM310', 'Multiple parameters', 'Two or more values received by a function.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000509', 'STG010', 'CH0096', 'MCQ', 'What is a parameter used for in a function?', '', 'To receive a value', '', 'A parameter receives data.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000510', 'STG010', 'CH0096', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

void add(int a, int b) {
    printf("%d", a + b);
}

int main() {
    add(2, 5);
    return 0;
}', '7', '', 'Add the two arguments.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000511', 'STG010', 'CH0096', 'CODE_FILL', 'Fill the Missing Code
Complete the parameter so display() can receive a whole number.', '#include <stdio.h>

void display({{1}} n) {
    printf("%d", n);
}', '["int"]', '', 'The parameter stores a whole number.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000512', 'STG010', 'CH0096', 'ORDER', 'Arrange the words to form the sentence:', '', 'Functions||receive||values||through parameters', '', 'Start with Functions.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000513', 'STG010', 'CH0096', 'CODE_FILL', 'Fill the Missing Code
Complete the type of each parameter.', '#include <stdio.h>

void add({{1}} a, {{2}} b) {
    printf("%d", a + b);
}

int main() {
    add(3, 4);
    return 0;
}', '["int","int"]', '', 'Both parameters store whole numbers.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001278', 'Q000509', 'To stop the function', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001279', 'Q000509', 'To receive a value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001280', 'Q000509', 'To delete a variable', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001281', 'Q000509', 'To end the program', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001282', 'Q000510', '7', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001283', 'Q000510', '10', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001284', 'Q000510', '25', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001285', 'Q000510', '3', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001286', 'Q000512', 'values', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001287', 'Q000512', 'through parameters', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001288', 'Q000512', 'Functions', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001289', 'Q000512', 'receive', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000509', 'Q000509', 'A parameter receives data.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000510', 'Q000510', 'Add the two arguments.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000511', 'Q000511', 'The parameter stores a whole number.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000512', 'Q000512', 'Start with Functions.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000513', 'Q000513', 'Both parameters store whole numbers.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000509', 'TERM306', 'Parameter', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000510', 'TERM307', 'Argument', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000511', 'TERM308', 'int', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000512', 'TERM309', 'Parameter', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000513', 'TERM310', 'Multiple parameters', 1, true);

-- learn_content (CH0097: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0097', 'STG010', 'CH0097', 'Functions with Return Values', 'What Is a Return Value?
A return value is the result sent back by a function after completing its task. A function can receive values through parameters, perform a calculation, and return the result to the calling part of the program.

Think of an ATM: you request money, the ATM processes your request, and the ATM returns the money to you. Input -> Processing -> Return value.

Small example: int add() { return 5 + 3; } The function returns the value 8.

Remember: A return value is the result sent back by a function.
//.//
Why Are Return Values Used?
Return values are used to: 1. Send results back to the calling function. 2. Store the result in a variable. 3. Reuse the result in another calculation. 4. Make functions flexible. 5. Separate calculation from output. 6. Improve code readability. 7. Use functions in conditions.

A function with a return value gives a result instead of directly displaying it. int getNumber() { return 10; } is the base level. int calculateTotal(int price, int quantity) { return price * quantity; } accepts inputs and returns a useful result.

Return vs print: return sends a value back and can store the result. printf() displays a value and prints it directly on the screen.
//.//
Return Types
The return type tells the compiler what type of value a function will return. Common return types: int returns a whole number, float returns a decimal number, char returns a character, and void returns no value.

Example: int square(int n) { return n * n; } Here int is the return type, square is the function name, n is the parameter, and return n * n; sends back the result.

Important: the returned value should match the function''s return type.
//.//
Flowchart: Function with Return Value
Flow: START -> create the function -> receive parameters -> perform calculation -> return the result -> store or use the result -> END.

Example: int add(int a, int b) { return a + b; } int main() { int result = add(4, 6); printf("%d", result); return 0; } The output is 10.

Explanation: 1. add() receives 4 and 6. 2. The function calculates 4 + 6. 3. return sends back 10. 4. The value is stored in result. 5. printf() displays the result.

Remember: Return gives the value back; printf() shows it.
//.//
Recap: Return Values
Imagine ordering food from a restaurant. 1. You give the order - parameters. 2. The chef prepares the food - function execution. 3. The chef gives the food back - return value. 4. You receive and use it - store or display the result.

Final recap: a return value is the result sent back by a function. return is used to send the result. int, float, and char can be return types. void means no value is returned. A returned value can be stored in a variable. return and printf() have different purposes.

Memory trick: Parameters go in. Return values come out. Final formula: Input -> Process -> Return -> Store / Display.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM311', 'Result', 'The value produced by a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM312', 'Square', 'Multiplying a number by itself.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM313', 'Return', 'Sends a value back from a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM314', 'Return', 'To send a value back from a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM315', 'Function name', 'The name used to identify and call a function.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000514', 'STG010', 'CH0097', 'MCQ', 'What does a function with a return value do?', '', 'Sends a result back', '', 'The function gives a result to the caller.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000515', 'STG010', 'CH0097', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

int square(int n) {
    return n * n;
}

int main() {
    printf("%d", square(5));
    return 0;
}', '25', '', 'Multiply 5 by itself.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000516', 'STG010', 'CH0097', 'CODE_FILL', 'Fill the Missing Code
Complete the statement that sends the answer back.', '#include <stdio.h>

int doubleNumber(int n) {
    {{1}} n * 2;
}', '["return"]', '', 'Use the keyword that sends the answer back.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000517', 'STG010', 'CH0097', 'ORDER', 'Arrange the words to form the sentence:', '', 'A function||can||return||a value', '', 'Start with "A function".', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000518', 'STG010', 'CH0097', 'CODE_FILL', 'Fill the Missing Code
Complete the function name so it matches the call in main().', '#include <stdio.h>

int {{1}}() {
    return 25;
}

int main() {
    printf("%d", getNumber());
    return 0;
}', '["getNumber"]', '', 'The function name must match the name used in the call.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001290', 'Q000514', 'Only displays text', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001291', 'Q000514', 'Sends a result back', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001292', 'Q000514', 'Stops the program', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001293', 'Q000514', 'Deletes a variable', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001294', 'Q000515', '25', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001295', 'Q000515', '10', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001296', 'Q000515', '5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001297', 'Q000515', 'Nothing is printed', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001298', 'Q000517', 'can', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001299', 'Q000517', 'a value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001300', 'Q000517', 'A function', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001301', 'Q000517', 'return', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000514', 'Q000514', 'The function gives a result to the caller.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000515', 'Q000515', 'Multiply 5 by itself.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000516', 'Q000516', 'Use the keyword that sends the answer back.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000517', 'Q000517', 'Start with "A function".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000518', 'Q000518', 'The function name must match the name used in the call.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000514', 'TERM311', 'Result', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000515', 'TERM312', 'Square', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000516', 'TERM313', 'Return', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000517', 'TERM314', 'Return', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000518', 'TERM315', 'Function name', 1, true);

-- learn_content (CH0098: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0098', 'STG010', 'CH0098', 'Types of Functions', 'What Are the Types of Functions?
A function type describes how a function receives data and whether it returns a value. In C, functions are commonly classified into four types based on two questions: does the function have parameters, and does it return a value?

Type 1: no parameters, no return value. Type 2: parameters, no return value. Type 3: no parameters, return value. Type 4: parameters and return value.

Think of a food shop. No input, no output: you press a button and receive nothing. Input, no output: you give an order and the shop prepares it. No input, output: you receive a fixed food item. Input and output: you give ingredients and receive a prepared dish.

Small example: void greet() { printf("Hello"); } has no parameter and no return value.
//.//
Type 1: No Parameters and No Return Value
This type of function does not receive any value, does not return any value, performs a fixed task, and usually uses void as the return type.

It is useful when the function always performs the same action, such as displaying a message, printing a menu, showing a title, or displaying instructions.

Basic pattern: void functionName() { // statements }

Example: void greet() { printf("Hello Student"); }

Important: this function performs a task without receiving input or returning a result.
//.//
Type 2: Parameters and No Return Value
This type of function receives one or more values, uses parameters to process the values, does not return a result, and commonly uses void.

It is useful when the function needs input, the result can be displayed directly, a task must be performed using different values, or repeated code needs to be reduced.

Basic pattern: void functionName(int value) { // statements }

Example: void displaySquare(int n) { printf("%d", n * n); }

Important: the function receives data but does not send a value back.
//.//
Type 3 and Type 4
Type 3: no parameters but a return value. The function does not receive input, performs a task, and returns a value to the caller. Example: int getNumber() { return 10; } It is used for returning fixed values, providing default values, and getting information from a function.

Type 4: parameters and a return value. The function receives one or more values, processes them, and returns the final result. Example: int add(int a, int b) { return a + b; } It is used for calculations, reusable logic, returning results, and building larger programs.

Important: Type 4 is the most flexible type because it accepts input and returns output.
//.//
Flowchart and Recap
Classification flowchart: FUNCTION -> does it receive parameters? If NO: does it return a value? NO -> Type 1, YES -> Type 3. If YES: does it return a value? NO -> Type 2, YES -> Type 4.

Quick comparison: Type 1 void greet(). Type 2 void display(int n). Type 3 int getNumber(). Type 4 int add(int a, int b).

Memory trick: no input, no output - silent worker. Input, no output - worker who completes the task. No input, output - vending machine. Input and output - smart calculator.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM316', 'Types', 'Different categories or forms.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM317', 'Call', 'Asking a function to execute its code.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM318', 'Function call', 'Using a function name to execute its code.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM319', 'Types', 'Different categories or forms.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM320', 'String', 'A group of characters used to store text.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000519', 'STG010', 'CH0098', 'MCQ', 'How many common types of functions are there in C based on parameters and return values?', '', '4', '', 'Think about parameter and return value combinations.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000520', 'STG010', 'CH0098', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

int getNumber() {
    return 10;
}

int main() {
    printf("%d", getNumber());
    return 0;
}', '10', '', 'The function has no parameters and returns 10. printf() shows the returned value.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000521', 'STG010', 'CH0098', 'CODE_FILL', 'Fill the Missing Code
Complete the statement that calls display().', '#include <stdio.h>

void display() {
    printf("C Programming");
}

int main() {
    {{1}};
    return 0;
}', '["display()"]', '', 'Call the function using its name.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000522', 'STG010', 'CH0098', 'ORDER', 'Arrange the words to form the sentence:', '', 'Functions||are classified||by parameters||and return value', '', 'Start with Functions.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000523', 'STG010', 'CH0098', 'CODE_FILL', 'Fill the Missing Code
Complete the parameter type so showMessage() can receive text.', '#include <stdio.h>

void showMessage({{1}} message) {
    printf("%s", message);
}', '["char*"]', '', 'The parameter stores text.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001302', 'Q000519', '2', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001303', 'Q000519', '3', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001304', 'Q000519', '4', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001305', 'Q000519', '5', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001306', 'Q000520', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001307', 'Q000520', 'getNumber', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001308', 'Q000520', '0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001309', 'Q000520', 'Nothing is printed', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001310', 'Q000522', 'by parameters', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001311', 'Q000522', 'Functions', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001312', 'Q000522', 'and return value', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001313', 'Q000522', 'are classified', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000519', 'Q000519', 'Think about parameter and return value combinations.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000520', 'Q000520', 'The function has no parameters and returns 10. printf() shows the returned value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000521', 'Q000521', 'Call the function using its name.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000522', 'Q000522', 'Start with Functions.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000523', 'Q000523', 'The parameter stores text.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000519', 'TERM316', 'Types', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000520', 'TERM317', 'Call', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000521', 'TERM318', 'Function call', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000522', 'TERM319', 'Types', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000523', 'TERM320', 'String', 1, true);

-- learn_content (CH0099: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0099', 'STG010', 'CH0099', 'Multiple Parameters and Arguments', 'What Are Multiple Parameters?
Multiple parameters are two or more variables used in a function to receive different values. They allow one function to work with more than one input.

Think of a shopping bill: price is the cost of one item and quantity is the number of items. The function uses both values to calculate the total. Multiple inputs -> one task -> one result.

Small example: void bill(int price, int quantity) { printf("%d", price * quantity); } Here price and quantity are two parameters.
//.//
Why Are Multiple Parameters Used?
Multiple parameters are used to: 1. Pass more than one value to a function. 2. Perform calculations using different inputs. 3. Make functions flexible and reusable. 4. Avoid creating separate functions for similar tasks. 5. Improve program organization. 6. Represent real-world problems more clearly.

Each parameter receives a value from the corresponding argument.

Parameter order: the order of arguments is important. In add(5, 3); 5 goes to the first parameter and 3 goes to the second parameter. Changing the order may change the result.
//.//
Parameters vs Arguments
Parameters are variables written inside the function definition. In void add(int a, int b), a and b are parameters.

Arguments are the actual values passed during the function call. In add(5, 3);, 5 and 3 are arguments.

Comparison: parameters are written in the function definition, receive values, and act like variables. Arguments are written in the function call, provide values, and act like actual data.

Important: parameters receive; arguments provide.
//.//
Flowchart and Function Execution
Flow: START -> create function -> define parameters -> enter main() -> pass arguments -> call function -> match values with parameters -> execute function -> output -> END.

Example: void add(int a, int b) { printf("%d", a + b); } int main() { add(7, 2); return 0; } The output is 9.

Explanation: a receives 7. b receives 2. The function adds both values. The result 9 is displayed.
//.//
Recap: Multiple Parameters
Multiple parameters allow a function to receive two or more values. Parameters are written in the function definition. Arguments are the actual values passed during the function call. Each argument is matched with its corresponding parameter. The order of arguments is important. Multiple parameters make functions reusable and flexible.

Example: void add(int a, int b) { printf("%d", a + b); } add(5, 3); prints 8.

Memory trick: parameters receive. Arguments provide.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM321', 'Parameter', 'A value received by a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM322', 'Argument', 'The actual value passed to a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM323', 'Data type', 'Specifies the type of value stored.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM324', 'Argument', 'The actual value passed to a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM325', 'Arguments', 'The actual values supplied to a function when it is called.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000524', 'STG010', 'CH0099', 'MCQ', 'What is the purpose of using multiple parameters in a function?', '', 'To accept two or more values', '', 'Parameters receive values.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000525', 'STG010', 'CH0099', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

void add(int a, int b) {
    printf("%d", a + b);
}

int main() {
    add(6, 4);
    return 0;
}', '10', '', 'Add the two arguments.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000526', 'STG010', 'CH0099', 'CODE_FILL', 'Fill the Missing Code
Complete the type of the second parameter.', '#include <stdio.h>

void student(char name[], {{1}} age) {
    printf("%s %d", name, age);
}

int main() {
    student("Arun", 18);
    return 0;
}', '["int"]', '', 'The age is a whole number.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000527', 'STG010', 'CH0099', 'ORDER', 'Arrange the words to form the sentence:', '', 'Each argument||is matched with||its corresponding||parameter', '', 'Start with "Each argument".', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000528', 'STG010', 'CH0099', 'BLANK', 'In add(5, 3), the values 5 and 3 are called __________.', '', 'arguments', '', 'They provide values to the parameters.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001314', 'Q000524', 'To accept only one value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001315', 'Q000524', 'To accept two or more values', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001316', 'Q000524', 'To stop the function', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001317', 'Q000524', 'To print only text', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001318', 'Q000525', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001319', 'Q000525', '24', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001320', 'Q000525', '6 4', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001321', 'Q000525', '2', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001322', 'Q000527', 'is matched with', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001323', 'Q000527', 'parameter', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001324', 'Q000527', 'Each argument', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001325', 'Q000527', 'its corresponding', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000524', 'Q000524', 'Parameters receive values.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000525', 'Q000525', 'Add the two arguments.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000526', 'Q000526', 'The age is a whole number.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000527', 'Q000527', 'Start with "Each argument".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000528', 'Q000528', 'They provide values to the parameters.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000524', 'TERM321', 'Parameter', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000525', 'TERM322', 'Argument', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000526', 'TERM323', 'Data type', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000527', 'TERM324', 'Argument', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000528', 'TERM325', 'Arguments', 1, true);

-- learn_content (CH0100: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0100', 'STG010', 'CH0100', 'Local and Global Variables', 'What Are Local and Global Variables?
A variable is a named memory location used to store data. Based on where a variable is declared, it can be local or global.

A local variable is declared inside a function or block. It can normally be used only within that area. A global variable is declared outside all functions. It can be accessed by multiple functions in the program.

Think about a college campus. A local variable is your classroom notes: you mainly use them inside your classroom. A global variable is a notice board placed in the college: different classrooms can access it.

Small example: int college = 2026; (global) and void show() { int marks = 90; } (marks is local). Here, college is global and marks is local.
//.//
Why Are Local and Global Variables Used?
Variables have different purposes depending on where their data needs to be used.

Local variables are used when data is needed only for one function, when we want to keep data limited to a specific task, and when we want to avoid accidentally changing the value elsewhere.

Global variables are used when the same data is needed by multiple functions, when a value needs to be shared across different parts of a program, and when the data represents information relevant to the whole program.

Use a local variable when the data belongs to one task; use a global variable when the data needs to be shared. Large programs may have shared information that several functions need, but unnecessary global variables can make programs harder to maintain.

Remember: Local -> limited use. Global -> shared use.
//.//
Scope: Where Can the Variable Be Used?
Scope means the part of the program where a variable can be accessed. Scope determines where a variable is visible and usable.

Local variable scope: a local variable belongs to the function or block where it is declared. In void show() { int marks = 90; printf("%d", marks); }, marks can be used inside show().

Global variable scope: a global variable is declared outside functions. In int count = 10; void show() { printf("%d", count); }, the function can access the global variable.

Comparison: local is declared inside a function/block, has limited scope, and is usually used for specific tasks. Global is declared outside functions, has a wider scope, and can be shared across functions.
//.//
Flowchart: Local vs Global
Variable scope flow: VARIABLE -> where is it declared? Inside a function -> LOCAL -> used in its local scope. Outside functions -> GLOBAL -> can be accessed by functions.

Example: int college = 2026; // Global. void show() { int marks = 90; printf("%d\n", college); printf("%d", marks); } // marks is local.

What happens? college is available to show(). marks belongs to show(). Another function cannot directly use marks.

Key idea: declaration location -> scope -> where the variable can be used.
//.//
Recap: The College Notice Board
Imagine a college. A global variable is the college notice board: everyone who needs the information can access it. A local variable is your personal notebook: only you use it for your particular work.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM326', 'Global', 'A variable declared outside all functions and available to different functions.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM327', 'Global variable', 'A variable that can be accessed by functions because it is declared outside them.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM328', 'Local', 'A variable whose use is limited to the function or block where it is declared.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM329', 'Global', 'A variable declared outside all functions and available to different functions.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM330', 'Local', 'A variable whose use is limited to the function or block where it is declared.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000529', 'STG010', 'CH0100', 'MCQ', 'Which statement correctly describes a global variable in C?', '', 'It is declared outside all functions', '', 'Think about where the variable is declared.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000530', 'STG010', 'CH0100', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

int number = 10;

void display() {
    printf("%d ", number);
}

int main() {
    display();
    display();
    return 0;
}', '10 10', '', 'number is declared outside the functions.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000531', 'STG010', 'CH0100', 'CODE_FILL', 'Fill the Missing Code
Complete the local variable declaration.', '#include <stdio.h>

void show() {
    {{1}} marks = 90;
    printf("%d", marks);
}', '["int"]', '', 'marks is a whole-number variable created inside the function.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000532', 'STG010', 'CH0100', 'ORDER', 'Arrange the words to form the sentence:', '', 'A global variable||is declared||outside||all functions', '', 'Start with A.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000533', 'STG010', 'CH0100', 'BLANK', 'A variable declared inside a function is called a __________ variable.', '', 'local', '', 'Its use is limited to that function.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001326', 'Q000529', 'It can be used only inside main()', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001327', 'Q000529', 'It is declared inside a function', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001328', 'Q000529', 'It is declared outside all functions', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001329', 'Q000529', 'It can be used only once', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001330', 'Q000530', '10 10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001331', 'Q000530', '10', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001332', 'Q000530', '0 0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001333', 'Q000530', 'number number', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001334', 'Q000532', 'outside', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001335', 'Q000532', 'is declared', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001336', 'Q000532', 'all functions', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001337', 'Q000532', 'A global variable', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000529', 'Q000529', 'Think about where the variable is declared.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000530', 'Q000530', 'number is declared outside the functions.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000531', 'Q000531', 'marks is a whole-number variable created inside the function.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000532', 'Q000532', 'Start with A.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000533', 'Q000533', 'Its use is limited to that function.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000529', 'TERM326', 'Global', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000530', 'TERM327', 'Global variable', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000531', 'TERM328', 'Local', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000532', 'TERM329', 'Global', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000533', 'TERM330', 'Local', 1, true);

-- learn_content (CH0101: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0101', 'STG010', 'CH0101', 'Functions with Arrays and Strings', 'What Are Functions with Arrays and Strings?
Functions can work with arrays and strings by receiving them as arguments. An array stores multiple values of the same data type. A string is a sequence of characters stored in a character array.

Instead of writing the same operation repeatedly, we can send an array or string to a function and let the function process it.

Think of a delivery box. The function is the worker, the array is a box containing many items, the string is a box containing characters, the function call is giving the box to the worker, and the result is processed information.

Small example: void display(int arr[], int n) { printf("%d", arr[0]); } Here, arr[] allows the function to work with an array.

Remember: a function can receive an entire array or string instead of handling every value separately.
//.//
Why Are Arrays and Strings Passed to Functions?
Passing arrays and strings to functions helps us process multiple values using one function, avoid repeating the same code, search or calculate values inside an array, display array elements, process text using a string, and make programs more organized and reusable.

Basic: void display(int arr[], int n) - the function receives an array and its size.

A program can use separate functions for tasks such as: input data -> process array -> search / calculate -> display result.

Functions make array and string operations reusable instead of writing the same logic again and again. When an array is passed to a function, the function can work with its elements.
//.//
Arrays vs Strings in Functions
Arrays: an array can contain multiple values, for example int marks[] = {80, 75, 90}; A function can receive the array: void show(int marks[], int n). Here marks[] is the array and n is the number of elements.

Strings: a string is a character array, for example char name[] = "Arun"; It can be passed to a function: void display(char name[]).

Comparison: an array stores multiple values and can contain int, float, etc.; it is usually passed with its size and is used for collections of data. A string stores characters/text, uses char, ends with ''\0'', and is used for text.

Important: a string in C is a character array ending with the null character ''\0''.
//.//
Flowchart: Function with Array/String
Flow: START -> create array/string -> call function -> pass array/string -> function receives -> process the elements -> get the result -> END.

Example: void display(int arr[], int n) { for (int i = 0; i < n; i++) { printf("%d ", arr[i]); } } int main() { int numbers[] = {10, 20, 30}; display(numbers, 3); return 0; } The output is 10 20 30.

What happened? numbers contains three values. The array is passed to display(). The function receives the array. Each element is processed. The values are displayed.

Remember: Create -> Pass -> Process -> Display.
//.//
Recap: The Delivery Team
Imagine a delivery team. You have a box full of items. The array is a box containing many items, the string is a box containing letters, the function is the worker processing the box, the argument is the box you hand over, function execution is the worker processing the contents, and the output is the final result.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM331', 'Array', 'A collection of elements of the same data type.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM332', 'Index', 'The position used to access an element in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM333', 'String', 'A sequence of characters stored in a character array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM334', 'Array', 'A collection of elements of the same data type.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM335', 'Arguments', 'The actual values passed to a function.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000534', 'STG010', 'CH0101', 'MCQ', 'What can a function receive to work with multiple array elements?', '', 'An array', '', 'Think about sending a collection of values to a function.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000535', 'STG010', 'CH0101', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

void display(int arr[]) {
    printf("%d", arr[1]);
}

int main() {
    int numbers[] = {10, 20, 30};

    display(numbers);

    return 0;
}', '20', '', 'Array indexing starts from 0.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000536', 'STG010', 'CH0101', 'CODE_FILL', 'Fill the Missing Code
Complete the parameter type so display() can receive a string.', '#include <stdio.h>

void display({{1}} name) {
    printf("%s", name);
}

int main() {
    char name[] = "Arun";
    display(name);

    return 0;
}', '["char *"]', '', 'The function is receiving a string.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000537', 'STG010', 'CH0101', 'ORDER', 'Arrange the words to form the sentence:', '', 'A function||can receive||an array', '', 'Start with "A function".', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000538', 'STG010', 'CH0101', 'BLANK', 'When a function receives an array and its size, the array and size are passed as __________.', '', 'arguments', '', 'They are the actual values given during a function call.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001338', 'Q000534', 'Only one integer', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001339', 'Q000534', 'An array', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001340', 'Q000534', 'Only a character', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001341', 'Q000534', 'Only a return value', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001342', 'Q000535', '20', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001343', 'Q000535', '10', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001344', 'Q000535', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001345', 'Q000535', '2', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001346', 'Q000537', 'can receive', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001347', 'Q000537', 'an array', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001348', 'Q000537', 'A function', 3, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000534', 'Q000534', 'Think about sending a collection of values to a function.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000535', 'Q000535', 'Array indexing starts from 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000536', 'Q000536', 'The function is receiving a string.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000537', 'Q000537', 'Start with "A function".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000538', 'Q000538', 'They are the actual values given during a function call.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000534', 'TERM331', 'Array', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000535', 'TERM332', 'Index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000536', 'TERM333', 'String', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000537', 'TERM334', 'Array', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000538', 'TERM335', 'Arguments', 1, true);

-- learn_content (CH0102: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0102', 'STG010', 'CH0102', 'Recursive Functions', 'What Is a Recursive Function?
A recursive function is a function that calls itself to solve a problem. Instead of solving the entire problem at once, the function breaks it into smaller versions of the same problem.

A recursive function has two important parts: 1. Base case - stops the recursion. 2. Recursive case - calls the function again with a smaller or simpler value.

Think of Russian dolls. You open one doll, and inside is another smaller doll. You continue opening them until you reach the smallest doll. Then you stop. The smallest doll is like the base case.

Small example: void count(int n) { if (n == 0) return; printf("%d ", n); count(n - 1); } Here, count() calls itself.

Remember: Recursion = a function solving a problem by calling itself.
//.//
Why Are Recursive Functions Used?
Recursion is useful when a problem naturally consists of smaller versions of itself. It can help with repeating a task with changing values, breaking a problem into smaller parts, mathematical problems such as factorial, working with hierarchical structures, and problems where the same logic is applied repeatedly.

Recursion is useful when the solution to a problem can be expressed using a smaller version of the same problem. count(n - 1); calls the function again with a smaller value.

Important: a recursive function must have a stopping condition. Without one, the function can continue calling itself indefinitely.
//.//
Base Case and Recursive Case
Every useful recursive function needs to answer two questions.

1. When should I stop? This is the base case: if (n == 0) return; It prevents further function calls.

2. How should I continue? This is the recursive case: count(n - 1); The function calls itself with a smaller value.

For count(3) the calls become count(3), count(2), count(1), count(0), then STOP.

Important: base case stops recursion; recursive case continues recursion. Memory trick: Base -> STOP. Recursive -> AGAIN.
//.//
Recursion Flowchart
How recursive execution works: the function receives n. Is the base case reached? YES -> STOP. NO -> process the current value, call the function again with a smaller problem, then check the base case again.

Example: void count(int n) { if (n == 0) return; printf("%d ", n); count(n - 1); } int main() { count(3); return 0; } The output is 3 2 1.

What happens? count(3) starts. 3 is printed. It calls count(2). 2 is printed. It calls count(1). 1 is printed. count(0) reaches the base case. Recursion stops.
//.//
Recap: Recursion
1. Recursive function: a function that calls itself during its execution. 2. Base case: the condition that tells the function when to stop. Without a base case, recursion may continue indefinitely. 3. Recursive case: the part where the function calls itself again with a smaller or simpler problem. 4. Progress toward the base case: every recursive call should move closer to the stopping condition. 5. Function execution: the calls continue until the base case is reached, and then the recursion stops.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM336', 'Base Case', 'The condition that stops a recursive function from calling itself further.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM337', 'Recursive Case', 'The part of a function where it calls itself again.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM338', 'Condition', 'An expression that determines whether a particular action should happen.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM339', 'Local Variable', 'A variable declared inside a function or block.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM340', 'Arguments', 'The actual values supplied to a function when it is called.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000539', 'STG010', 'CH0102', 'MCQ', 'What is the main purpose of a base case in a recursive function?', '', 'To stop the recursion', '', 'Every recursion needs a condition that tells it when to stop.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000540', 'STG010', 'CH0102', 'PREDICT_OUTPUT', 'What is the output?', '#include <stdio.h>

void count(int n) {
    if (n == 0)
        return;

    printf("%d ", n);
    count(n - 1);
}

int main() {
    count(3);
    return 0;
}', '3 2 1', '', 'Each call decreases n by 1.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000541', 'STG010', 'CH0102', 'CODE_FILL', 'Fill the Missing Code
Complete the base-case condition.', '#include <stdio.h>

void count(int n) {
    if ({{1}})
        return;
    printf("%d ", n);
    count(n - 1);
}', '["n == 0"]', '', 'The recursion should stop when n reaches zero. Write n first.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000542', 'STG010', 'CH0102', 'ORDER', 'Review: Local and Global Variables
Arrange the words to form the sentence:', '', 'A local variable||is declared||inside||a function', '', 'Start with A.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000543', 'STG010', 'CH0102', 'BLANK', 'Review: Multiple Parameters and Arguments
The actual values passed to a function during a function call are called __________.', '', 'arguments', '', 'They provide values to the parameters.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001349', 'Q000539', 'To start the program', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001350', 'Q000539', 'To create a variable', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001351', 'Q000539', 'To stop the recursion', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001352', 'Q000539', 'To call another function', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001353', 'Q000540', '3 2 1', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001354', 'Q000540', '1 2 3', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001355', 'Q000540', '3 2 1 0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001356', 'Q000540', 'Nothing is printed', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001357', 'Q000542', 'inside', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001358', 'Q000542', 'A local variable', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001359', 'Q000542', 'a function', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001360', 'Q000542', 'is declared', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000539', 'Q000539', 'Every recursion needs a condition that tells it when to stop.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000540', 'Q000540', 'Each call decreases n by 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000541', 'Q000541', 'The recursion should stop when n reaches zero. Write n first.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000542', 'Q000542', 'Start with A.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000543', 'Q000543', 'They provide values to the parameters.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000539', 'TERM336', 'Base Case', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000540', 'TERM337', 'Recursive Case', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000541', 'TERM338', 'Condition', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000542', 'TERM339', 'Local Variable', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000543', 'TERM340', 'Arguments', 1, true);

end
$migration$;
