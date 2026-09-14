-- Stage 4 (STG005, "Decision Making") was missing its "else if" chapter --
-- it should sit between "if-else" and "Switch-Case" as chapter 3. Existing
-- chapters 3-5 (Switch-Case, Ternary Condition, Nested if-else) are shifted
-- down to 4-6 by chapter_no/"order"; nothing else in this stage's chapter
-- chain needs to change since Stage 4 has no chapter-to-chapter prerequisite
-- rows (all its chapters unlock together once the stage itself unlocks --
-- see the `prerequisites` table), so the new chapter needs no prerequisite
-- row either, matching its siblings.

-- shift existing chapters 3, 4, 5 -> 4, 5, 6
update chapters set chapter_no = 6, "order" = 6 where chapter_id = 'CH0055'; -- Nested if-else
update chapters set chapter_no = 5, "order" = 5 where chapter_id = 'CH0054'; -- Ternary Condition
update chapters set chapter_no = 4, "order" = 4 where chapter_id = 'CH0053'; -- Switch-Case

-- new chapter
insert into chapters (chapter_id, stage_id, chapter_no, title, "order", active)
values ('CH0115', 'STG005', 3, 'else if', 3, true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active)
values ('L_CH0115', 'STG005', 'CH0115', 'else if', 'What is else if?
else if is used to check multiple conditions one by one.

**Simple idea**
Condition 1 → Condition 2 → Condition 3 → Else

**Example**
```c
int marks = 75;

if (marks >= 90)
        printf("A");
else if (marks >= 75)
        printf("B");
else
        printf("C");
```
**Explanation**
if checks the first condition. else if checks another condition if the previous one is false. else runs when all conditions are false.

**Output**
```
B
```

**Key idea**
Only the first true condition is executed.//.//Structure of else if

**Structure**
```c
if (condition1) {
        // statement
} else if (condition2) {
        // statement
} else {
        // statement
}
```
**Example**
```c
int age = 20;

if (age < 13)
        printf("Child");
else if (age < 20)
        printf("Teenager");
else
        printf("Adult");
```
**Flow**
age < 13? YES → Child. NO → age < 20? YES → Teenager. NO → Adult.

**Key idea**
Conditions are checked from top to bottom.//.//Multiple Conditions

else if is useful when there are more than two possible results.

**Example — Grade**
```c
int marks = 85;

if (marks >= 90)
        printf("Grade A");
else if (marks >= 80)
        printf("Grade B");
else if (marks >= 70)
        printf("Grade C");
else
        printf("Grade D");
```
**Output**
```
Grade B
```
**Quick View**
90–100 → A. 80–89 → B. 70–79 → C. Below 70 → D.

**Key idea**
Put the conditions in the correct order.//.//Real Program Usage

**Example — Positive, Negative or Zero**
```c
int n = -5;

if (n > 0)
        printf("Positive");
else if (n < 0)
        printf("Negative");
else
        printf("Zero");
```
**Output**
```
Negative
```
**Basic Pattern**
Input → Check condition 1 → NO → Check condition 2 → NO → Check condition 3 → Default result

**Key idea**
else if is commonly used for grading, menu choices, age groups, and number classification.//.//Recap

**Flow**
if → FALSE → else if → FALSE → else if → FALSE → else

**5 Things to Remember**
1. else if checks another condition.
2. Conditions are checked top to bottom.
3. Only the first true block runs.
4. else is optional.
5. Use else if for multiple choices.

**Final Example**
```c
int x = 10;

if (x > 10)
        printf("Greater");
else if (x == 10)
        printf("Equal");
else
        printf("Smaller");
```
**Output**
```
Equal
```

**One-Line Recap**
IF → ELSE IF → ELSE = First true choice wins!', true);

-- questions (5, matching the fixed per-chapter test size used across the
-- rest of this app) -- adapted from the source deck's 6 quiz questions;
-- Q5 ("High/Medium/Low") was folded out since it tests the same
-- predict-the-output-of-an-if/else-if/else-chain skill as Q2, keeping one
-- clean example of that skill rather than two near-duplicates.

insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active)
values ('Q000328', 'STG005', 'CH0115', 'MCQ', 'Which keyword is used to check another condition?', '', 'else if', '', 'It comes between if and else.', 1, 1, true);
insert into test_hints (hint_id, question_id, hint_text, active, "order")
values ('H_Q000328', 'Q000328', 'It comes between if and else.', true, 1);
insert into options (option_id, question_id, option_text, "order", active) values
('O0000852', 'Q000328', 'another', 1, true),
('O0000853', 'Q000328', 'elseif', 2, true),
('O0000854', 'Q000328', 'else if', 3, true),
('O0000855', 'Q000328', 'next', 4, true);

insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active)
values ('Q000329', 'STG005', 'CH0115', 'PREDICT_OUTPUT', 'What will be the output?', 'int x = 15;

if (x > 20)
        printf("A");
else if (x > 10)
        printf("B");
else
        printf("C");', 'B', '', 'Check conditions from top to bottom.', 1, 2, true);
insert into test_hints (hint_id, question_id, hint_text, active, "order")
values ('H_Q000329', 'Q000329', 'Check conditions from top to bottom.', true, 1);
insert into options (option_id, question_id, option_text, "order", active) values
('O0000856', 'Q000329', 'A', 1, true),
('O0000857', 'Q000329', 'B', 2, true),
('O0000858', 'Q000329', 'C', 3, true),
('O0000859', 'Q000329', 'No output', 4, true);

insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active)
values ('Q000330', 'STG005', 'CH0115', 'CODE_FILL', 'Complete the code to check another condition after the first if:', 'if (marks >= 90)
        printf("A");
{{1}} (marks >= 75)
        printf("B");', '["else if"]', '', 'Used to check another condition.', 1, 3, true);
insert into test_hints (hint_id, question_id, hint_text, active, "order")
values ('H_Q000330', 'Q000330', 'Used to check another condition.', true, 1);

insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active)
values ('Q000331', 'STG005', 'CH0115', 'TRUE_FALSE', 'In an else if chain, multiple blocks can execute when their conditions are true.', '', 'False', '', 'Think about the first true condition.', 1, 4, true);
insert into test_hints (hint_id, question_id, hint_text, active, "order")
values ('H_Q000331', 'Q000331', 'Think about the first true condition.', true, 1);
insert into options (option_id, question_id, option_text, "order", active) values
('O0000860', 'Q000331', 'True', 1, true),
('O0000861', 'Q000331', 'False', 2, true);

insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active)
values ('Q000332', 'STG005', 'CH0115', 'ORDER', 'Arrange the execution order:', '', 'Check if||Check else if||Check else||Execute matching block', '', 'Execution starts at the top.', 1, 5, true);
insert into test_hints (hint_id, question_id, hint_text, active, "order")
values ('H_Q000332', 'Q000332', 'Execution starts at the top.', true, 1);
insert into options (option_id, question_id, option_text, "order", active) values
('O0000862', 'Q000332', 'Check if', 1, true),
('O0000863', 'Q000332', 'Check else if', 2, true),
('O0000864', 'Q000332', 'Check else', 3, true),
('O0000865', 'Q000332', 'Execute matching block', 4, true);
