-- Stage 12 (STG011, POINTERS) real content, filling the twelve existing chapter slots CH0103-CH0114
-- (their titles were already the real Pointers topic names, set well before this migration -- only learn_content,
-- glossary, questions, options, hints and question_terms are new rows; no chapter_id, stage_id, title or order is
-- touched). The 12 Pointers PDFs (assets/Contents/Pointers Pdfs/Pointer1-12.pdf) map 1:1 onto the 12 existing slots,
-- in order, matching their titles exactly (Pointer1.pdf = Pointer Basics, ... Pointer12.pdf = Common Pointer
-- Problems).
--
-- Each PDF ends in its own quiz, inserted close to verbatim and matched to the nearest DB question type
-- (MCQ / CODE_FILL / ORDER). Pointer1-3.pdf give an explicit "Answer:" line per question, used directly; the rest
-- are worked out from the shown code, exactly as for Number Crunching and Patterns. Pointer12.pdf (Common Pointer
-- Problems) has no quiz at all in its own source -- its 5 questions are original, each tied to one of the 4
-- problems its own 5 slides teach (uninitialized pointer, NULL pointer, dangling pointer, the safe
-- check-before-dereferencing pattern).
--
-- Pointers is intentionally NOT unlocked by this migration: the STG011 self-referencing prerequisite row stays
-- (unconditionally locked) until the decks and activities are written and the full test suite passes. A later
-- migration removes that row.

-- Idempotent: everything runs in one guarded block; if Pointers' learn_content is already present nothing happens.
-- Only new rows are added.
do $migration$
begin
  if exists (select 1 from learn_content where learn_id = 'L_CH0103') then
    raise notice 'Stage 12 (POINTERS) content already present; nothing to do.';
    return;
  end if;

-- learn_content (CH0103: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0103', 'STG011', 'CH0103', 'Pointer Basics', 'What Is a Pointer?
A pointer is a variable that stores the memory address of another variable.

Simple idea: a variable stores a value; a pointer stores the address of a variable.

int x = 10;
int *p = &x;

printf("Value = %d\n", x);
printf("Address = %p\n", (void*)p);

x stores 10. &x gives the address of x. p stores that address. *p can access the value stored at that address.

Remember: a pointer stores an address.
//.//
Pointer Declaration
The structure is: data_type *pointer_name;

int x = 25;
int *p = &x;

printf("%d", *p);

Output: 25.

x = 25. &x is the address of x. p stores that address. *p gives 25.

Remember: & means address of; * means the value at an address.
//.//
Accessing Value Using a Pointer
The * operator is called the dereference operator.

int x = 50;
int *p = &x;

printf("Value: %d\n", *p);

*p = 100;

printf("New value: %d", x);

Output: Value: 50, then New value: 100.

*p refers to the value stored at the address held by p, so changing *p changes x.
//.//
Pointer and Variable
int a = 10;
int *ptr = &a;

printf("a = %d\n", a);
printf("*ptr = %d\n", *ptr);

Output: a = 10, then *ptr = 10.

A pointer does not normally store the value directly; it stores the address where the value is located.
//.//
Pointer Basics Recap
Flow: declare a variable, get its address with &, store the address in a pointer, access the value with *.

Five things to remember: a pointer stores a memory address; & gives the address; * accesses the value at an address; a pointer''s type should match the type it points to; always initialize a pointer before using it.

int n = 20;
int *p = &n;

printf("%d", *p);

Output: 20.

Memory trick: & is Address, * is Value.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM399', 'Address', 'Location of data in memory.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM400', 'Dereference', 'Access the value through a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM401', '&', 'Address-of operator.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM402', 'Dereference', 'Get the value stored at an address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM403', 'Assignment', 'Giving a value to a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM404', 'Pointer', 'Variable that stores an address.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000605', 'STG011', 'CH0103', 'MCQ', 'What does a pointer store?', '', 'Memory address', '', 'A pointer tells us where a variable is stored.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000606', 'STG011', 'CH0103', 'MCQ', 'What is the output?', 'int x = 30;
int *p = &x;

printf("%d", *p);', '30', '', '*p accesses the value.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000607', 'STG011', 'CH0103', 'CODE_FILL', 'Fill in the blank', 'int x = 10;
int *p = {{1}};', '["&x"]', '', 'Use the operator that gives a variable''s address.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000608', 'STG011', 'CH0103', 'MCQ', 'Which operator is used for dereferencing?', '', '*', '', 'It is also used when declaring a pointer.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000609', 'STG011', 'CH0103', 'MCQ', 'What happens here?', 'int x = 5;
int *p = &x;

*p = 15;', 'x becomes 15', '', '*p refers to x.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000610', 'STG011', 'CH0103', 'ORDER', 'Arrange the steps', '', 'Declare a variable||Get address using &||Store address in pointer||Access value using *', '', 'Start with the variable.', 1, 6, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001517', 'Q000605', 'Character', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001518', 'Q000605', 'Memory address', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001519', 'Q000605', 'Keyword', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001520', 'Q000605', 'Operator', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001521', 'Q000606', 'Address of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001522', 'Q000606', '0', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001523', 'Q000606', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001524', 'Q000606', 'Error', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001525', 'Q000608', '&', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001526', 'Q000608', '*', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001527', 'Q000608', '%', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001528', 'Q000608', '#', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001529', 'Q000609', 'p becomes 15', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001530', 'Q000609', 'x becomes 15', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001531', 'Q000609', 'x becomes 5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001532', 'Q000609', 'Error', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001533', 'Q000610', 'Declare a variable', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001534', 'Q000610', 'Get address using &', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001535', 'Q000610', 'Store address in pointer', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001536', 'Q000610', 'Access value using *', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000605', 'Q000605', 'A pointer tells us where a variable is stored.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000606', 'Q000606', '*p accesses the value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000607', 'Q000607', 'Use the operator that gives a variable''s address.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000608', 'Q000608', 'It is also used when declaring a pointer.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000609', 'Q000609', '*p refers to x.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000610', 'Q000610', 'Start with the variable.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000605', 'TERM399', 'Address', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000606', 'TERM400', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000607', 'TERM401', '&', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000608', 'TERM402', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000609', 'TERM403', 'Assignment', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000610', 'TERM404', 'Pointer', 1, true);

-- learn_content (CH0104: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0104', 'STG011', 'CH0104', 'Declaring & Initializing Pointers', 'Declaring a Pointer
Pointer declaration tells C that a variable will store the address of a particular data type. The syntax is data_type *pointer_name;.

int *p;
float *f;
char *c;
double *d;

In int *p;, int is the type of data p points to, * marks p as a pointer, and p is the pointer variable''s name.

Remember: int *p; means p can store the address of an int variable.
//.//
Initializing a Pointer
Declaring a pointer only creates the pointer variable. Initialization gives it a valid address.

int x = 10;
int *p = &x;

printf("Value = %d", *p);

Output: Value = 10.

Step by step: x = 10, then &x is the address of x, then p = &x, then *p is the value stored there, 10.

Remember: declare, get the address, store the address, dereference.
//.//
Understanding & and *
& is the address-of operator: printf("%p", (void*)&x); prints the memory address of x.

* is the dereference operator: printf("%d", *p); prints the value stored at that address.

The meaning of * depends on where it is used: in int *p; it marks a declaration; in *p = 50; it dereferences.
//.//
Different Ways to Initialize
1. Initialize during declaration: int x = 20; int *p = &x;
2. Declare first, initialize later: int x = 20; int *p; p = &x; -- both are valid.
3. Initialize with NULL: if a pointer does not currently point to a valid object, int *p = NULL; means it intentionally points to no valid object. Never dereference a NULL pointer: *p = 10; is wrong.

Best beginner habit: initialize pointers before using them.
//.//
Pointer Type Must Match
A pointer should normally point to a variable of the corresponding type: int x = 10; int *p = &x;, char ch = ''A''; char *p = &ch;, float f = 5.5; float *p = &f;.

The pointer type tells C how to interpret the memory when you dereference it, and matters for pointer arithmetic too.

Deeper look: if x is stored at address 1000 with value 100, then x is 100, &x is 1000, p is 1000, and *p is 100 -- x and *p access the same value through different paths. More precisely, p == &x and *p == x when p points to x.

Remember: a pointer''s type should match the type of data it points to.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM405', 'Pointer', 'Variable that stores an address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM406', '&', 'Address-of operator.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM407', 'Dereference', 'Access the value through a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM408', 'Data type', 'Type of value stored by a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM409', 'Initialization', 'Giving a variable its initial value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM410', 'NULL', 'Null pointer constant used to indicate no valid target.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM411', 'Dereference', 'Obtain the value through the pointer.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000611', 'STG011', 'CH0104', 'MCQ', 'What does this declaration mean?', 'int *p;', 'p stores the address of an integer', '', '* indicates a pointer declaration.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000612', 'STG011', 'CH0104', 'CODE_FILL', 'Complete the code', 'int x = 50;
int *p = {{1}};

printf("%d", *p);', '["&x"]', '', 'You need the address of x.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000613', 'STG011', 'CH0104', 'MCQ', 'What is the output?', 'int x = 25;
int *p = &x;
*p = 40;

printf("%d", x);', '40', '', '*p refers to x.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000614', 'STG011', 'CH0104', 'MCQ', 'Identify the error. Why is this incorrect?', 'int x = 10;
float *p = &x;', 'Pointer type doesn''t match the data type', '', 'Compare int and float.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000615', 'STG011', 'CH0104', 'MCQ', 'True or False: int *p; automatically makes p point to a valid integer variable.', '', 'False', '', 'Declaration and initialization are different.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000616', 'STG011', 'CH0104', 'MCQ', 'What does NULL mean?', 'int *p = NULL;', 'p points to no valid object', '', 'NULL represents an invalid/no-object pointer value.', 1, 6, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000617', 'STG011', 'CH0104', 'ORDER', 'Arrange the steps', 'int x = 10;
int *p = &x;
printf("%d", *p);', 'Declare variable x||Get address using &||Store address in p||Dereference p', '', 'Start with creating x.', 1, 7, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001537', 'Q000611', 'p stores an integer value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001538', 'Q000611', 'p stores the address of an integer', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001539', 'Q000611', 'p stores a character', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001540', 'Q000611', 'p stores a float', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001541', 'Q000613', '25', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001542', 'Q000613', '40', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001543', 'Q000613', 'Address of x', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001544', 'Q000613', 'Error', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001545', 'Q000614', 'x cannot have an address', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001546', 'Q000614', 'Pointer type doesn''t match the data type', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001547', 'Q000614', '& cannot be used', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001548', 'Q000614', 'float is invalid', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001549', 'Q000615', 'True', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001550', 'Q000615', 'False', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001551', 'Q000616', 'p contains 0 as an integer value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001552', 'Q000616', 'p points to no valid object', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001553', 'Q000616', 'p contains garbage intentionally', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001554', 'Q000616', 'p points to NULL variable', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001555', 'Q000617', 'Declare variable x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001556', 'Q000617', 'Get address using &', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001557', 'Q000617', 'Store address in p', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001558', 'Q000617', 'Dereference p', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000611', 'Q000611', '* indicates a pointer declaration.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000612', 'Q000612', 'You need the address of x.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000613', 'Q000613', '*p refers to x.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000614', 'Q000614', 'Compare int and float.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000615', 'Q000615', 'Declaration and initialization are different.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000616', 'Q000616', 'NULL represents an invalid/no-object pointer value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000617', 'Q000617', 'Start with creating x.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000611', 'TERM405', 'Pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000612', 'TERM406', '&', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000613', 'TERM407', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000614', 'TERM408', 'Data type', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000615', 'TERM409', 'Initialization', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000616', 'TERM410', 'NULL', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000617', 'TERM411', 'Dereference', 1, true);

-- learn_content (CH0105: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0105', 'STG011', 'CH0105', 'Address Operator &', 'What Is the Address Operator?
The address operator & is used to find the memory address of a variable.

Simple idea: variable, then &, gives a memory address.

int x = 10;
printf("%p", (void*)&x);

x stores the value 10; &x gives the address where x is stored; %p displays a pointer/address. The actual address is different on each run or system.

Remember: & means "address of".
//.//
How & Works
int x = 25;
int *p = &x;

&x is the address of x; p stores that same address; *p is the value at that address.

Remember: &x does not give 25; it gives the location of x.
//.//
& with Pointers
The address operator is commonly used to initialize a pointer.

int num = 50;
int *ptr;

ptr = &num;

printf("Value = %d", *ptr);

Output: Value = 50.

Key relationship: ptr == &num and *ptr == num.

Remember: & connects a variable to its pointer.
//.//
& in scanf()
One of the most important uses of & is with scanf().

int age;

printf("Enter age: ");
scanf("%d", &age);

printf("Age = %d", age);

scanf() needs the address of age so it knows where to store the input. For a normal int variable, write scanf("%d", &age); -- never scanf("%d", age); without the &.

Remember: scanf() usually needs the address of the variable.
//.//
Address Operator Recap
Flow: variable, then & gives an address, a pointer stores that address, then * gives the value back.

Five things to remember: & is the address-of operator; &x gives the address of x; it is commonly used to initialize pointers; scanf() uses & to receive a variable''s address; & and * have opposite roles.

int x = 100;
int *p = &x;

printf("Address: %p\n", (void*)&x);
printf("Value: %d", *p);

Memory trick: & asks "Where is it?"; * asks "What is there?".', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM412', 'Address', 'Memory location of a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM413', 'Initialization', 'Assigning an initial value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM414', 'Dereference', 'Accessing the value through a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM415', 'scanf()', 'Reads input from the user.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM416', 'Address-of', 'Obtains a variable''s memory address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM417', 'Pointer', 'Variable that stores an address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM418', 'Dereference', 'Access the value at the stored address.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000618', 'STG011', 'CH0105', 'MCQ', 'What does &x represent?', '', 'Address of x', '', '& is the address-of operator.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000619', 'STG011', 'CH0105', 'CODE_FILL', 'Complete the pointer initialization', 'int n = 25;
int *p = {{1}};', '["&n"]', '', 'The pointer needs the address of n.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000620', 'STG011', 'CH0105', 'MCQ', 'What is the output?', 'int x = 40;
int *p = &x;

printf("%d", *p);', '40', '', '*p accesses the value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000621', 'STG011', 'CH0105', 'MCQ', 'Why is &age used here?', 'scanf("%d", &age);', 'To get the address of age', '', 'scanf() needs to know where to store the input.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000622', 'STG011', 'CH0105', 'MCQ', 'True or False: & gives the value stored inside a variable.', '', 'False', '', 'Compare & with *.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000623', 'STG011', 'CH0105', 'MCQ', 'What does this mean?', 'int *p = &x;', 'p stores the address of x', '', '&x produces an address.', 1, 6, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000624', 'STG011', 'CH0105', 'ORDER', 'Arrange the steps', 'int x = 10;
int *p = &x;
printf("%d", *p);', 'Create variable x||Get address using &||Store address in p||Dereference p', '', 'Start with creating the variable.', 1, 7, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001559', 'Q000618', 'Value of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001560', 'Q000618', 'Address of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001561', 'Q000618', 'Pointer value only', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001562', 'Q000618', 'Size of x', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001563', 'Q000620', 'Address of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001564', 'Q000620', '40', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001565', 'Q000620', '0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001566', 'Q000620', 'Error', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001567', 'Q000621', 'To get the value of age', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001568', 'Q000621', 'To get the address of age', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001569', 'Q000621', 'To delete age', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001570', 'Q000621', 'To declare age', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001571', 'Q000622', 'True', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001572', 'Q000622', 'False', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001573', 'Q000623', 'p stores the value of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001574', 'Q000623', 'p stores the address of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001575', 'Q000623', 'x stores the address of p', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001576', 'Q000623', 'p becomes x', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001577', 'Q000624', 'Create variable x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001578', 'Q000624', 'Get address using &', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001579', 'Q000624', 'Store address in p', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001580', 'Q000624', 'Dereference p', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000618', 'Q000618', '& is the address-of operator.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000619', 'Q000619', 'The pointer needs the address of n.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000620', 'Q000620', '*p accesses the value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000621', 'Q000621', 'scanf() needs to know where to store the input.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000622', 'Q000622', 'Compare & with *.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000623', 'Q000623', '&x produces an address.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000624', 'Q000624', 'Start with creating the variable.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000618', 'TERM412', 'Address', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000619', 'TERM413', 'Initialization', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000620', 'TERM414', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000621', 'TERM415', 'scanf()', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000622', 'TERM416', 'Address-of', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000623', 'TERM417', 'Pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000624', 'TERM418', 'Dereference', 1, true);

-- learn_content (CH0106: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0106', 'STG011', 'CH0106', 'Dereference Operator *', 'What Is the Dereference Operator?
When a variable can store the address of another variable, the dereference operator * is used to access the value stored at that address.

int x = 10;
int *p = &x;

Here x is 10 and p is the address of x. *p gives 10.

Easy analogy: p is like a house address; *p is what''s inside the house. The address tells us where to go; * lets us access what is stored there.

Remember: p is the address; *p is the value.
//.//
Accessing the Value Using *
int x = 25;
int *p = &x;

printf("%d", *p);

Output: 25.

Think of it this way: the pointer tells us where the value is, and * tells C "go to that address and give me the value stored there."

Remember: &x gets the address, p stores the address, *p gets the value.
//.//
Changing a Value Using *
Yes, we can use the dereference operator to change the value stored at the address.

int x = 10;
int *p = &x;
*p = 20;

Before: x = 10. After *p = 20;, x becomes 20, because p points to x.

Easy analogy: p is a key to a locker; *p opens the locker; *p = 20 changes what''s inside.

Big memory trick: *p accesses the value; *p = new_value changes the value.

Takeaway: a pointer can be used to read and modify the value stored at its address.
//.//
Using the Dereference Operator in C
int x = 50;
int *p = &x;
printf("%d", *p);

Output: 50, because p is the address of x and *p is 50.

What if we change *p? int x = 50; int *p = &x; *p = 100; printf("%d", x); prints 100, because p points to x, so *p = 100; changes the value of x.

Takeaway: * lets us access the value stored at the address held by a pointer.
//.//
Dereference Operator Recap
What we learned: get the address with p = &x; (& gets the address); the pointer stores the address (int *p = &x;); dereference the pointer with *p to get the value stored there; change the value with *p = 20;, which changes the variable that p points to.

Remember: & is address, p is pointer, *p is value.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM419', 'Dereference', 'Access the value stored at the address held by a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM420', 'Value', 'The data stored inside a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM421', 'Points to', 'A pointer stores the address of a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM422', 'Pointer', 'Stores the address of another variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM423', 'Modify', 'Change an existing value.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000625', 'STG011', 'CH0106', 'MCQ', 'What does *p do?', '', 'Gets the value stored at the address in p', '', 'Dereferencing is about accessing the value.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000626', 'STG011', 'CH0106', 'MCQ', 'What is the output?', 'int x = 25;
int *p = &x;
printf("%d", *p);', '25', '', '*p accesses the value stored at the address.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000627', 'STG011', 'CH0106', 'MCQ', 'What is the value of x?', 'int x = 10;
int *p = &x;
*p = 30;', '30', '', 'p points to x.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000628', 'STG011', 'CH0106', 'MCQ', 'What is the output?', 'int x = 40;
int *p = &x;
*p = 60;
printf("%d", x);', '60', '', 'Changing *p changes the variable pointed to by p.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000629', 'STG011', 'CH0106', 'MCQ', 'Which statement changes the value of x to 75?', 'int x = 10;
int *p = &x;', '*p = 75;', '', 'Use dereferencing to modify the value.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001581', 'Q000625', 'Gets the address of p', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001582', 'Q000625', 'Gets the value stored at the address in p', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001583', 'Q000625', 'Creates a new variable', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001584', 'Q000625', 'Deletes the pointer', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001585', 'Q000626', 'Address of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001586', 'Q000626', '25', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001587', 'Q000626', '0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001588', 'Q000626', 'p', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001589', 'Q000627', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001590', 'Q000627', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001591', 'Q000627', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001592', 'Q000627', 'Address of x', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001593', 'Q000628', '40', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001594', 'Q000628', '60', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001595', 'Q000628', 'Address of x', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001596', 'Q000628', '0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001597', 'Q000629', 'p = 75;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001598', 'Q000629', '&p = 75;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001599', 'Q000629', '*p = 75;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001600', 'Q000629', 'x * 75;', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000625', 'Q000625', 'Dereferencing is about accessing the value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000626', 'Q000626', '*p accesses the value stored at the address.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000627', 'Q000627', 'p points to x.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000628', 'Q000628', 'Changing *p changes the variable pointed to by p.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000629', 'Q000629', 'Use dereferencing to modify the value.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000625', 'TERM419', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000626', 'TERM420', 'Value', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000627', 'TERM421', 'Points to', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000628', 'TERM422', 'Pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000629', 'TERM423', 'Modify', 1, true);

-- learn_content (CH0107: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0107', 'STG011', 'CH0107', 'Pointers and Data Types', 'What Are Pointers and Data Types?
A pointer stores the address of another variable, but a pointer also has a data type: the data type tells C what type of value the pointer is pointing to.

int x = 10;
int *p = &x;

Since x is an int, int *p; is an integer pointer.

Remember: the data type of a pointer matches the data type of the value it points to.
//.//
Pointers with Different Data Types
Pointers can point to variables of different data types: int x = 10; int *p = &x; points to an integer. char ch = ''A''; char *p = &ch; points to a character. float marks = 85.5; float *p = &marks; points to a float.

Memory trick: variable type maps to pointer type -- int to int *, char to char *, float to float *, double to double *.

Takeaway: the pointer type should match the type of variable it points to.
//.//
Accessing Values With Different Pointer Types
We use the dereference operator * to access the value, whatever the type.

int x = 25; int *p = &x; printf("%d", *p); prints 25, because p is the address of x and *p is the value of x.

char ch = ''A''; char *p = &ch; printf("%c", *p); prints A.

float marks = 85.5; float *p = &marks; printf("%f", *p); prints 85.500000.

Remember: *p gives the value stored at the address.
//.//
Pointer Type Must Match
C needs to know what kind of data is stored at that address. int x = 50; int *p = &x; is correct because an int variable needs an int pointer. char ch = ''A''; char *p = &ch; is correct for the same reason.

Big memory trick: int matches int *, char matches char *, float matches float *, double matches double *.

Takeaway: the pointer type tells C the type of data it points to.
//.//
Pointers and Data Types Recap
Integer pointer: int x = 10; int *p = &x; -- int * points to an integer.
Character pointer: char ch = ''A''; char *p = &ch; -- char * points to a character.
Float pointer: float x = 10.5; float *p = &x; -- float * points to a float.
Dereference: *p accesses the value.

Remember: a pointer''s type matches the type of value it points to.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM424', 'Float', 'A number that can contain decimal values.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM425', 'Dereference', 'Access the value stored at the address held by a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM426', 'Match', 'Correspond correctly with something.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM427', 'Address', 'The memory location where a variable is stored.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM428', 'Pointer', 'A variable that stores the address of another variable.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000630', 'STG011', 'CH0107', 'MCQ', 'What does float * mean?', '', 'A pointer to a float', '', 'Look at the data type before *.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000631', 'STG011', 'CH0107', 'MCQ', 'What is the output?', 'int x = 50;
int *p = &x;
printf("%d", *p);', '50', '', '*p accesses the value.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000632', 'STG011', 'CH0107', 'MCQ', 'Which pair is correctly matched?', '', 'float -> float *', '', 'Match the same data type.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000633', 'STG011', 'CH0107', 'MCQ', 'What does the pointer store?', 'int x = 100;
int *p = &x;', 'The address of x', '', 'What does &x give us?', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000634', 'STG011', 'CH0107', 'CODE_FILL', 'Final challenge: complete the code', 'int x = 20;

{{1}} p = &x;

printf("%d", {{2}});', '["int *","*p"]', '', 'x is an int; &x gives its address; *p gives its value.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001601', 'Q000630', 'A pointer to an integer', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001602', 'Q000630', 'A pointer to a character', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001603', 'Q000630', 'A pointer to a float', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001604', 'Q000630', 'A normal float variable', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001605', 'Q000631', 'Address of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001606', 'Q000631', '50', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001607', 'Q000631', '0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001608', 'Q000631', 'p', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001609', 'Q000632', 'int -> char *', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001610', 'Q000632', 'char -> float *', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001611', 'Q000632', 'float -> float *', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001612', 'Q000632', 'int -> double *', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001613', 'Q000633', 'The value 100', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001614', 'Q000633', 'The address of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001615', 'Q000633', 'The data type int', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001616', 'Q000633', 'Nothing', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000630', 'Q000630', 'Look at the data type before *.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000631', 'Q000631', '*p accesses the value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000632', 'Q000632', 'Match the same data type.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000633', 'Q000633', 'What does &x give us?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000634', 'Q000634', 'x is an int; &x gives its address; *p gives its value.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000630', 'TERM424', 'Float', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000631', 'TERM425', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000632', 'TERM426', 'Match', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000633', 'TERM427', 'Address', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000634', 'TERM428', 'Pointer', 1, true);

-- learn_content (CH0108: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0108', 'STG011', 'CH0108', 'Pointers and Variables', 'What Is a Pointer and Variable?
A variable stores a value. A pointer stores the address of a variable.

int x = 10;
int *p = &x;

x stores the value 10; p stores the address of x.

Easy analogy: a variable is a box holding its value; the pointer is a note containing the box''s location.

Remember: a variable holds a value; a pointer holds an address.
//.//
Pointer Pointing to a Variable
First create a variable: int x = 25;. Then create a pointer: int *p = &x;.

The & operator gives the address of a variable: &p would give the address of p, but &x gives the address of x. So int *p = &x; means "store the address of x inside p."

Easy analogy: your variable is a house; the pointer doesn''t store the house itself, it stores the house''s address.

Remember: & gets the address.
//.//
Using a Pointer to Access a Variable
We already have int x = 25; int *p = &x;. Now *p accesses the value stored at the address: p is the address of x, *p is the value of x, so printf("%d", *p); prints 25.

Easy analogy: p is a map -- p tells you WHERE, *p tells you WHAT is there.

Memory trick: & is address, * is value.

Takeaway: a pointer can be used to access the variable it points to.
//.//
Changing a Variable Using a Pointer
Yes, we can change a variable through its pointer. int x = 10; int *p = &x; *p = 50; -- since p points to x, x was 10, and after *p = 50; x becomes 50.

Easy analogy: p is a key to a box; *p = 50; is like opening the box and replacing its contents.

Big memory trick: p finds the variable, *p accesses the value, *p = value changes the value.

Takeaway: a pointer can access and modify the variable it points to.
//.//
Pointers and Variables Recap
Variable: int x = 10; -- x stores a value.
Get the address: &x -- gets the address of x.
Pointer: int *p = &x; -- p stores the address of x.
Access the value: *p -- gets the value of x.
Change the value: *p = 20; changes x to 20.

Or simply: x is the value, &x is the address, p stores the address, *p accesses the value.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM429', 'Variable', 'A named storage location that holds a value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM430', 'Address operator &', 'Used to get the address of a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM431', 'Value', 'The actual data stored in a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM432', 'Pointer declaration', 'Declaring a variable that stores an address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM433', 'Dereference', 'Access the value stored at the address held by a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM434', 'Pointer', 'A variable that stores a memory address.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000635', 'STG011', 'CH0108', 'MCQ', 'What does a variable store?', '', 'A value', '', 'Think about int x = 10;.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000636', 'STG011', 'CH0108', 'MCQ', 'What does &x give?', '', 'The address of x', '', '& is the address operator.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000637', 'STG011', 'CH0108', 'MCQ', 'What is the output?', 'int x = 25;
int *p = &x;
printf("%d", *p);', '25', '', '*p accesses the value of x.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000638', 'STG011', 'CH0108', 'MCQ', 'Which statement correctly connects p to x?', '', 'int *p = &x;', '', 'A pointer stores the address of the variable.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000639', 'STG011', 'CH0108', 'MCQ', 'What does *p give?', 'int x = 20;
int *p = &x;', 'Value of x', '', '* is used to dereference a pointer.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000640', 'STG011', 'CH0108', 'MCQ', 'What does a pointer store?', '', 'The address of a variable', '', 'A pointer tells us where a variable is stored.', 1, 6, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001617', 'Q000635', 'An address', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001618', 'Q000635', 'A value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001619', 'Q000635', 'A pointer', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001620', 'Q000635', 'A function', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001621', 'Q000636', 'The value of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001622', 'Q000636', 'The address of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001623', 'Q000636', 'The value of p', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001624', 'Q000636', 'The address of p', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001625', 'Q000637', '25', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001626', 'Q000637', 'Address of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001627', 'Q000637', '0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001628', 'Q000637', 'p', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001629', 'Q000638', 'int p = x;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001630', 'Q000638', 'int *p = &x;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001631', 'Q000638', 'int &p = x;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001632', 'Q000638', 'int *p = x;', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001633', 'Q000639', 'Address of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001634', 'Q000639', 'Value of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001635', 'Q000639', 'Address of p', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001636', 'Q000639', 'Value 0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001637', 'Q000640', 'Only numbers', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001638', 'Q000640', 'A character', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001639', 'Q000640', 'The address of a variable', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001640', 'Q000640', 'A function', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000635', 'Q000635', 'Think about int x = 10;.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000636', 'Q000636', '& is the address operator.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000637', 'Q000637', '*p accesses the value of x.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000638', 'Q000638', 'A pointer stores the address of the variable.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000639', 'Q000639', '* is used to dereference a pointer.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000640', 'Q000640', 'A pointer tells us where a variable is stored.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000635', 'TERM429', 'Variable', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000636', 'TERM430', 'Address operator &', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000637', 'TERM431', 'Value', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000638', 'TERM432', 'Pointer declaration', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000639', 'TERM433', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000640', 'TERM434', 'Pointer', 1, true);

-- learn_content (CH0109: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0109', 'STG011', 'CH0109', 'Pointer Arithmetic', 'What Is Pointer Arithmetic?
Just like normal variables, pointers can be moved using arithmetic: forward to the next memory location, backward to the previous one, or by multiple positions at once.

Simple definition: pointer arithmetic means performing arithmetic operations on pointers to move between memory locations.

int a[] = {10, 20, 30, 40};

A pointer can move through the array. After p++;, the pointer moves to the next element.

Easy analogy: an array is a row of houses; the pointer is a person standing at one house; p++ means move to the next house.

Remember: p++ moves forward; p-- moves to the previous position.
//.//
Moving a Pointer
int a[] = {10, 20, 30};
int *p = a;

Initially p points to the first element, 10. After p++;, the pointer moves to the next element, so *p now gives 20.

Remember: p++ moves the pointer to the next element.
//.//
Moving Backward
Yes, we can move a pointer back with p--;.

int a[] = {10, 20, 30};
int *p = &a[2];

Initially p points to the last element, 30. After p--;, the pointer moves backward, so *p gives 20.

Big memory trick: p++ moves forward; p-- moves backward.

Takeaway: pointer arithmetic can be used to move through elements.
//.//
Pointer + Number
Yes, we can add or subtract a number from a pointer to move more than one position.

int a[] = {10, 20, 30, 40};
int *p = a;

p = p + 2;

The pointer moves 2 elements forward, so printf("%d", *p); prints 30.

p + 1 is the next element, p + 2 is two elements forward; similarly p - 1 and p - 2 move backward.

Big memory trick: p + n moves n positions forward; p - n moves n positions backward.

Takeaway: pointer arithmetic moves according to elements, not raw bytes.
//.//
Pointer Arithmetic Recap
Move forward: p++; moves to the next element.
Move backward: p--; moves to the previous element.
Move multiple positions: p = p + 2; moves 2 elements forward.
Move backward by multiple positions: p = p - 2; moves 2 elements backward.
Access the value: *p gets the value at the pointer''s current position.

Remember: pointer arithmetic moves the pointer between elements.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM435', 'Pointer arithmetic', 'Using arithmetic operations to move a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM436', 'Element', 'One individual value in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM437', 'Dereference', 'Access the value stored at the pointer''s current address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM438', 'Pointer expression', 'An expression that performs an operation on a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM439', 'Trace', 'Follow the changes step by step.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000641', 'STG011', 'CH0109', 'MCQ', 'What does p++ do?', '', 'Moves the pointer to the next element', '', '++ means increase by one position.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000642', 'STG011', 'CH0109', 'MCQ', 'What is the output?', 'int a[] = {10, 20, 30};
int *p = a;

p++;

printf("%d", *p);', '20', '', 'p++ moves to the next element.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000643', 'STG011', 'CH0109', 'MCQ', 'What does *p give?', '', 'The value at the current pointer position', '', '* is the dereference operator.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000644', 'STG011', 'CH0109', 'MCQ', 'Find the value after p + 2', 'int a[] = {100, 200, 300, 400};
int *p = a;

printf("%d", *(p + 2));', '300', '', 'p + 2 moves two elements forward.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000645', 'STG011', 'CH0109', 'MCQ', 'Trace the pointer: what is *p?', 'int a[] = {10, 20, 30, 40};
int *p = a;

p++;
p++;', '30', '', 'Each p++ moves one position.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001641', 'Q000641', 'Deletes the pointer', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001642', 'Q000641', 'Moves the pointer to the next element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001643', 'Q000641', 'Moves the pointer backward', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001644', 'Q000641', 'Changes the value to 0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001645', 'Q000642', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001646', 'Q000642', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001647', 'Q000642', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001648', 'Q000642', 'Address of a', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001649', 'Q000643', 'The next address', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001650', 'Q000643', 'The previous address', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001651', 'Q000643', 'The value at the current pointer position', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001652', 'Q000643', 'The size of the pointer', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001653', 'Q000644', '100', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001654', 'Q000644', '200', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001655', 'Q000644', '300', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001656', 'Q000644', '400', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001657', 'Q000645', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001658', 'Q000645', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001659', 'Q000645', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001660', 'Q000645', '40', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000641', 'Q000641', '++ means increase by one position.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000642', 'Q000642', 'p++ moves to the next element.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000643', 'Q000643', '* is the dereference operator.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000644', 'Q000644', 'p + 2 moves two elements forward.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000645', 'Q000645', 'Each p++ moves one position.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000641', 'TERM435', 'Pointer arithmetic', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000642', 'TERM436', 'Element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000643', 'TERM437', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000644', 'TERM438', 'Pointer expression', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000645', 'TERM439', 'Trace', 1, true);

-- learn_content (CH0110: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0110', 'STG011', 'CH0110', 'Pointers and Arrays', 'What Are Pointers and Arrays?
An array stores multiple values of the same data type. A pointer can be used to access the elements of an array.

int a[] = {10, 20, 30, 40};

The name a represents the starting location of the array. We can create a pointer: int *p = a;.

Easy analogy: an array is a row of boxes; the pointer is a person standing at one box, able to move from one box to another.

Remember: an array stores many values; a pointer moves through the values.
//.//
Accessing Array Elements Using a Pointer
int a[] = {10, 20, 30};
int *p = a;

Since p points to the first element, *p gives 10, so printf("%d", *p); prints 10. After p++;, the pointer moves to the next element, so printf("%d", *p); now prints 20.

Easy analogy: walking along a row of boxes -- *p reads the current box, p++ moves to the next box.

Memory trick: *p gets the current value; p++ moves to the next.

Takeaway: a pointer can be used to access array elements one by one.
//.//
Pointers and Array Indexes
Yes, we can use pointers with array indexes.

int a[] = {10, 20, 30, 40};
int *p = a;

*(p + 0) is 10, *(p + 1) is 20, *(p + 2) is 30, *(p + 3) is 40.

Easy analogy: p is your starting position; p + 1 moves one box, p + 2 moves two boxes, p + 3 moves three boxes.

Remember: *(p + i) accesses the element at position i.
//.//
Using Pointers to Traverse an Array
Yes, we can use a loop.

int a[] = {10, 20, 30, 40};
int *p = a;

for (int i = 0; i < 4; i++) {
    printf("%d ", *(p + i));
}

Output: 10 20 30 40.

How it works: i = 0 gives *(p + 0) = 10, i = 1 gives *(p + 1) = 20, i = 2 gives *(p + 2) = 30, i = 3 gives *(p + 3) = 40.

Easy analogy: the pointer is a tour guide moving through positions 0, 1, 2, 3.

Takeaway: pointers can be used to traverse and access array elements.
//.//
Pointers and Arrays Recap
Array: int a[] = {10, 20, 30}; -- stores multiple values.
Pointer to array: int *p = a; -- points to the first element.
Access current element: *p -- gets the current value.
Move through array: p++; -- moves to the next element.
Access using position: *(p + i) -- gets the value at position i.

Remember: an array holds many values; a pointer accesses and moves through them; *(p + i) is the value at position i.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM440', 'Array', 'A collection of multiple values stored together.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM441', 'First element', 'The element at position 0 in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM442', 'Index', 'The position number of an element in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM443', 'Pointer arithmetic', 'Using arithmetic operations to move a pointer through an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM444', 'Traversal', 'Visiting each element of an array one by one.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000646', 'STG011', 'CH0110', 'MCQ', 'What does p = a do?', '', 'Makes p point to the first element of the array', '', 'a represents the starting location of the array.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000647', 'STG011', 'CH0110', 'MCQ', 'What is the output?', 'int a[] = {10, 20, 30};
int *p = a;

printf("%d", *p);', '10', '', 'p initially points to the first element.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000648', 'STG011', 'CH0110', 'MCQ', 'Which statement accesses the fourth element of the array using a pointer?', '', '*(p + 3)', '', 'Array positions start from 0.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000649', 'STG011', 'CH0110', 'CODE_FILL', 'Print the third element using the pointer.', 'int a[] = {10, 20, 30, 40};
int *p = a;

printf("%d", {{1}});', '["*(p+2)"]', '', 'Use *(p+i).', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000650', 'STG011', 'CH0110', 'MCQ', 'What is the output?', 'int a[] = {10, 20, 30, 40};
int *p = a;

for (int i = 0; i < 4; i++)
{
   printf("%d ", *(p + i));
}', '10 20 30 40', '', '*(p+i) accesses each element one by one.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001661', 'Q000646', 'Deletes the array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001662', 'Q000646', 'Makes p point to the first element of the array', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001663', 'Q000646', 'Moves p to the last element', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001664', 'Q000646', 'Changes all array values', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001665', 'Q000647', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001666', 'Q000647', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001667', 'Q000647', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001668', 'Q000647', 'Address of a', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001669', 'Q000648', '*p', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001670', 'Q000648', '*(p + 1)', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001671', 'Q000648', '*(p + 2)', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001672', 'Q000648', '*(p + 3)', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001673', 'Q000650', '10 20 30 40', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001674', 'Q000650', '0 1 2 3', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001675', 'Q000650', '40 30 20 10', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001676', 'Q000650', '10 30 20 40', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000646', 'Q000646', 'a represents the starting location of the array.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000647', 'Q000647', 'p initially points to the first element.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000648', 'Q000648', 'Array positions start from 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000649', 'Q000649', 'Use *(p+i).', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000650', 'Q000650', '*(p+i) accesses each element one by one.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000646', 'TERM440', 'Array', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000647', 'TERM441', 'First element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000648', 'TERM442', 'Index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000649', 'TERM443', 'Pointer arithmetic', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000650', 'TERM444', 'Traversal', 1, true);

-- learn_content (CH0111: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0111', 'STG011', 'CH0111', 'Pointers and Strings', 'What Are Pointers and Strings?
A string is a collection of characters stored in an array.

char str[] = "HELLO";

A pointer can point to the first character of the string: char *p = str;.

Easy analogy: a string is a row of boxes containing letters; the pointer tells us where the first box is.

Remember: a string is characters, a pointer is an address, *p is a character.
//.//
Accessing String Characters
char str[] = "HELLO";
char *p = str;

*p gives H. After p++;, *p gives E.

Memory trick: p++ moves forward; *p gets the character.
//.//
Using *(p+i) With Strings
We can access different characters using pointer arithmetic.

char str[] = "HELLO";
char *p = str;

*(p + 0) is H, *(p + 1) is E, *(p + 2) is L, *(p + 3) is L, *(p + 4) is O.

Easy analogy: the string is numbered boxes; p + 2 moves to position 2; *(p + 2) gets the character there.

Remember: *(p+i) is the character at position i.
//.//
Traversing a String Using a Pointer
We can use a pointer to go through the string character by character.

#include <stdio.h>

int main()
{
    char str[] = "HELLO";
    char *p = str;

    while (*p != ''\0'')
    {
        printf("%c", *p);
        p++;
    }

    return 0;
}

Output: HELLO.

What''s happening: *p gives H, print it, p++ moves; *p gives E, print it, p++ moves; and so on, until the loop reaches ''\0''.

Memory trick: check, print, move, repeat.
//.//
Pointers and Strings Recap
char str[] creates a string. char *p = str; makes the pointer point to the first character. *p gets the current character. p++ moves to the next character. *(p+i) gets the character at position i. ''\0'' marks the end of the string.

Big memory trick: string, pointer, get, move, repeat.

Takeaway: a pointer can move through a string one character at a time.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM445', 'Character', 'A single letter, number, or symbol.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM446', 'String', 'A sequence of characters stored together.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM447', 'Index', 'The position number of an element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM448', '''\0''', 'The special character that marks the end of a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM449', 'Traversal', 'Visiting each character one by one.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000651', 'STG011', 'CH0111', 'MCQ', 'What does char *p = str do?', '', 'Makes p point to the first character of the string', '', 'str represents the starting location of the string.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000652', 'STG011', 'CH0111', 'MCQ', 'What is the output?', 'char str[] = "HELLO";
char *p = str;

printf("%c", *p);', 'H', '', 'p initially points to the first character.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000653', 'STG011', 'CH0111', 'MCQ', 'Which statement accesses the fourth character?', '', '*(p + 3)', '', 'The first character is at position 0.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000654', 'STG011', 'CH0111', 'CODE_FILL', 'Print every character of the string using the pointer.', 'char str[] = "HELLO";
char *p = str;

while (*p != ''\0'')
{
   printf("%c", {{1}});
   p++;
}', '["*p"]', '', 'Print the character currently pointed to by p.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000655', 'STG011', 'CH0111', 'MCQ', 'What is the output?', 'char str[] = "CODE";
char *p = str;

for (int i = 0; i < 4; i++)
{
   printf("%c", *(p + i));
}', 'CODE', '', '*(p+i) accesses each character in order.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001677', 'Q000651', 'Deletes the string', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001678', 'Q000651', 'Makes p point to the first character of the string', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001679', 'Q000651', 'Moves p to the last character', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001680', 'Q000651', 'Changes the string to a number', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001681', 'Q000652', 'H', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001682', 'Q000652', 'E', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001683', 'Q000652', 'L', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001684', 'Q000652', 'O', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001685', 'Q000653', '*p', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001686', 'Q000653', '*(p + 1)', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001687', 'Q000653', '*(p + 2)', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001688', 'Q000653', '*(p + 3)', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001689', 'Q000655', 'CODE', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001690', 'Q000655', 'EDOC', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001691', 'Q000655', 'CDOE', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001692', 'Q000655', 'CO', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000651', 'Q000651', 'str represents the starting location of the string.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000652', 'Q000652', 'p initially points to the first character.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000653', 'Q000653', 'The first character is at position 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000654', 'Q000654', 'Print the character currently pointed to by p.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000655', 'Q000655', '*(p+i) accesses each character in order.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000651', 'TERM445', 'Character', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000652', 'TERM446', 'String', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000653', 'TERM447', 'Index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000654', 'TERM448', '''\0''', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000655', 'TERM449', 'Traversal', 1, true);

-- learn_content (CH0112: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0112', 'STG011', 'CH0112', 'Pointers with Functions', 'Why Use Pointers with Functions?
Normally, passing a variable to a function gives the function a copy of its value, so changing it inside the function does not change the original.

void change(int x) { x = 50; }

With a pointer, we can pass the address of the variable instead: void change(int *p) { *p = 50; }.

Easy analogy: giving someone the address of your house, instead of a photo of it, lets them reach and change the original thing.

Remember: a normal variable gives a copy; a pointer gives the address, so the original value can be reached.
//.//
Passing an Address to a Function
int x = 10;

We can send its address to a function: change(&x);. The function receives it using a pointer: void change(int *p) { *p = 20; }.

x = 10, then &x is sent, the function''s p receives it, *p = 20; changes x to 20. The pointer allows the function to access the original variable.

Memory trick: &x sends the address, int *p receives it, *p accesses the value.
//.//
Changing a Variable Inside a Function
#include <stdio.h>

void change(int *p)
{
    *p = 100;
}

int main()
{
    int x = 10;

    change(&x);

    printf("%d", x);

    return 0;
}

Output: 100.

Before the function, x = 10. The function receives &x into p, then *p = 100; changes the original x, so x becomes 100.

Remember: send the address, access it with *, change the original.
//.//
Using Pointers to Modify Two Variables
Pointers can also be used to modify multiple variables.

#include <stdio.h>

void add(int *a, int *b)
{
    *a = *a + 10;
    *b = *b + 10;
}

int main()
{
    int x = 5;
    int y = 10;

    add(&x, &y);

    printf("%d %d", x, y);

    return 0;
}

Output: 15 20.

Easy analogy: the function is given the addresses of two boxes and can modify both.
//.//
Pointers with Functions Recap
&x gets the address of x. int *p receives an address. *p accesses the original value. change(&x) sends the address to a function. *p = value changes the original variable.

Big memory trick: send, receive, access, change.

Takeaway: pointers let a function access and modify the original variable instead of working only with a copy.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM450', 'Address', 'The location of a variable in memory.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM451', 'Original variable', 'The actual variable created in the calling function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM452', 'Address operator', '&, used to get the address of a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM453', 'Dereference', 'Accessing the value at the address stored in a pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM454', 'Dereference operator', '*, used to access the value pointed to by a pointer.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000656', 'STG011', 'CH0112', 'MCQ', 'What does &x do when calling a function?', '', 'Gets the address of x', '', '& is used to get an address.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000657', 'STG011', 'CH0112', 'MCQ', 'What is the output?', 'void change(int *p)
{
   *p = 50;
}

int main()
{
   int x = 10;

   change(&x);

   printf("%d", x);
}', '50', '', 'The function receives the address of x.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000658', 'STG011', 'CH0112', 'CODE_FILL', 'Send the address of x to the function.', 'int x = 10;

change({{1}});', '["&x"]', '', 'Use the address operator.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000659', 'STG011', 'CH0112', 'MCQ', 'What does *p = 100 do inside a function?', '', 'Changes the original variable''s value', '', '*p accesses the value at the stored address.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000660', 'STG011', 'CH0112', 'CODE_FILL', 'Change the original variable to 100.', 'void change(int *p)
{
   {{1}} = 100;
}', '["*p"]', '', 'Use the dereference operator.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001693', 'Q000656', 'Gets the value of x', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001694', 'Q000656', 'Gets the address of x', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001695', 'Q000656', 'Deletes x', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001696', 'Q000656', 'Changes x to 0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001697', 'Q000657', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001698', 'Q000657', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001699', 'Q000657', '50', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001700', 'Q000657', 'Address of x', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001701', 'Q000659', 'Creates a new pointer', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001702', 'Q000659', 'Changes the original variable''s value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001703', 'Q000659', 'Deletes the original variable', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001704', 'Q000659', 'Changes the pointer to 100', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000656', 'Q000656', '& is used to get an address.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000657', 'Q000657', 'The function receives the address of x.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000658', 'Q000658', 'Use the address operator.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000659', 'Q000659', '*p accesses the value at the stored address.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000660', 'Q000660', 'Use the dereference operator.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000656', 'TERM450', 'Address', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000657', 'TERM451', 'Original variable', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000658', 'TERM452', 'Address operator', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000659', 'TERM453', 'Dereference', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000660', 'TERM454', 'Dereference operator', 1, true);

-- learn_content (CH0113: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0113', 'STG011', 'CH0113', 'Pointers with Structures', 'What Is a Pointer to a Structure?
A structure can store different types of data together.

struct Student
{
    int age;
    float marks;
};

We can create a structure variable: struct Student s;. A pointer can store the address of a structure variable: struct Student *p = &s;.

Easy analogy: a structure is a student information box holding age and marks; the pointer stores that box''s location.

Remember: a structure stores data; a pointer stores an address.
//.//
Accessing Structure Members Using a Pointer
struct Student
{
    int age;
};

struct Student s;

s.age = 20;

struct Student *p = &s;

A pointer can access the structure''s member using (*p).age, which gives 20.

Easy way to remember: p is the address of the structure; *p is the structure itself; (*p).age accesses age.
//.//
The Arrow Operator ->
C provides an easier way to access structure members through a pointer: instead of (*p).age, write p->age -- both mean the same thing.

struct Student
{
    int age;
};

struct Student s;

struct Student *p = &s;

p->age = 20;

Memory trick: p->member accesses a structure member.
//.//
Changing Structure Data Using a Pointer
A pointer can also modify structure members.

#include <stdio.h>

struct Student
{
    int age;
};

int main()
{
    struct Student s;
    struct Student *p = &s;

    p->age = 21;
    printf("%d", p->age);

    return 0;
}

Output: 21.

Since p points to s, p->age = 21; changes the age member of the original structure.

Analogy: the pointer has the address of the student record, so it can directly update the information inside it.
//.//
Pointers with Structures Recap
struct Student s; creates a structure variable. &s gets the structure''s address. struct Student *p is a structure pointer. *p accesses the structure. (*p).age accesses age using the pointer. p->age is the easier way to access age.

Big memory trick: structure, address, pointer, arrow, member.

Takeaway: the -> operator makes it easy to access structure members using a pointer.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM455', 'Structure pointer', 'A pointer that stores the address of a structure variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM456', 'Member', 'A variable stored inside a structure.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM457', 'Access', 'Getting or changing the value of a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM458', 'Modify', 'To change an existing value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM459', 'Dereference', 'Accessing the structure stored at the address held by the pointer.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000661', 'STG011', 'CH0113', 'MCQ', 'What does struct Student *p create?', '', 'A pointer to a structure', '', '* indicates that p is a pointer.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000662', 'STG011', 'CH0113', 'MCQ', 'What is the output?', 'struct Student
{
   int age;
};

int main()
{
   struct Student s;
   struct Student *p = &s;

   p->age = 20;

   printf("%d", p->age);
}', '20', '', 'p->age accesses the age member through the pointer.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000663', 'STG011', 'CH0113', 'MCQ', 'What does p->age mean?', '', 'Access the age member through pointer p', '', 'p points to a structure.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000664', 'STG011', 'CH0113', 'CODE_FILL', 'Change the age member using the structure pointer.', 'struct Student
{
   int age;
};

struct Student s;
struct Student *p = &s;

{{1}} = 21;', '["p->age"]', '', 'Use p and the arrow operator.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000665', 'STG011', 'CH0113', 'MCQ', 'Which statement is equivalent to p->age?', '', '(*p).age', '', 'The pointer is dereferenced first, then the member is accessed.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001705', 'Q000661', 'A structure variable', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001706', 'Q000661', 'A pointer to a structure', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001707', 'Q000661', 'An integer variable', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001708', 'Q000661', 'A pointer to an integer', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001709', 'Q000662', '0', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001710', 'Q000662', '10', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001711', 'Q000662', '20', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001712', 'Q000662', 'Address of s', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001713', 'Q000663', 'Access the age member through pointer p', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001714', 'Q000663', 'Create a new age variable', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001715', 'Q000663', 'Get the address of p', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001716', 'Q000663', 'Delete the structure', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001717', 'Q000665', '*p.age', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001718', 'Q000665', '(*p).age', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001719', 'Q000665', '*p->age', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001720', 'Q000665', '&p.age', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000661', 'Q000661', '* indicates that p is a pointer.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000662', 'Q000662', 'p->age accesses the age member through the pointer.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000663', 'Q000663', 'p points to a structure.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000664', 'Q000664', 'Use p and the arrow operator.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000665', 'Q000665', 'The pointer is dereferenced first, then the member is accessed.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000661', 'TERM455', 'Structure pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000662', 'TERM456', 'Member', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000663', 'TERM457', 'Access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000664', 'TERM458', 'Modify', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000665', 'TERM459', 'Dereference', 1, true);

-- learn_content (CH0114: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0114', 'STG011', 'CH0114', 'Common Pointer Problems', 'What Can Go Wrong With Pointers?
Pointers are useful, but small mistakes can cause problems. Common pointer mistakes include using an uninitialized pointer, dereferencing a NULL pointer, using the wrong pointer type, and accessing an invalid memory location.

int *p;

printf("%d", *p);

Here, p does not point to a valid variable.

Easy analogy: a pointer is like an address written on paper; if the address is missing or incorrect, you cannot safely find the house.

Remember: a valid address makes a safe pointer.
//.//
Uninitialized Pointer
An uninitialized pointer does not have a valid address assigned to it.

int *p;

*p = 10;

This is dangerous because p does not point to a known variable.

Correct way:

int x;

int *p = &x;

*p = 10;

Memory trick: create, address, use -- give the pointer a valid address before using *p.
//.//
NULL Pointer
A NULL pointer does not point to a valid object.

int *p = NULL;

We should not dereference it: *p = 10; -- this can cause a crash or undefined behavior.

Check before using:

if (p != NULL)
{
    printf("%d", *p);
}

Easy analogy: NULL is like saying "I don''t have an address" -- you cannot go to a house when there is no address.

Remember: NULL means no valid address.
//.//
Dangling Pointer
A dangling pointer is a pointer that refers to memory that is no longer valid to use -- for example, a pointer to a variable whose lifetime has ended.

int *p;
{
    int x = 10;
    p = &x;
}

After the block ends, x no longer exists, so using *p is unsafe.

Easy analogy: having the address of a house that has already been demolished -- the address exists on paper, but the house is no longer there.

Memory trick: valid object, use the pointer; object gone, don''t use the pointer.
//.//
Common Pointer Problems Recap
Uninitialized pointer: has not been given a valid address. NULL pointer: intentionally points to no valid object. Dangling pointer: refers to an object whose lifetime has ended. Invalid access: trying to access memory through an invalid pointer.

Big memory trick: check the pointer is valid, check it points to a valid object, only then use *p.

Takeaway: before dereferencing a pointer, make sure it points to a valid object.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM460', 'Uninitialized pointer', 'A pointer that has not been given a valid address.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM461', 'NULL pointer', 'A pointer that intentionally points to no valid object.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM462', 'Dangling pointer', 'A pointer that refers to an object whose lifetime has ended.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM463', 'Invalid access', 'Trying to access memory through an invalid pointer.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM464', 'Valid address', 'An address that really points to an existing variable.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000666', 'STG011', 'CH0114', 'MCQ', 'What is wrong with this code?', 'int *p;

printf("%d", *p);', 'p is dereferenced before it is given a valid address', '', 'p was declared but never pointed at a variable.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000667', 'STG011', 'CH0114', 'MCQ', 'Why should you check a pointer against NULL before dereferencing it?', '', 'A NULL pointer does not point to any valid object', '', 'NULL means "I don''t have an address."', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000668', 'STG011', 'CH0114', 'MCQ', 'A pointer p is set inside a { } block to the address of a variable declared in that same block. Once the block ends, why is using p unsafe?', 'int *p;
{
   int x = 10;
   p = &x;
}', 'The variable''s lifetime has ended, so p is left dangling', '', 'The variable no longer exists once its block ends.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000669', 'STG011', 'CH0114', 'CODE_FILL', 'Complete the safe check before dereferencing.', 'int *p = NULL;

if (p {{1}} NULL)
{
   printf("%d", *p);
}', '["!="]', '', 'Only dereference p when it is NOT NULL.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000670', 'STG011', 'CH0114', 'MCQ', 'Which of these is a valid, safe way to use a pointer?', '', 'int x; int *p = &x; *p = 10;', '', 'A safe pointer is initialized to a real variable before it is dereferenced.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001721', 'Q000666', 'Nothing is wrong', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001722', 'Q000666', 'p is dereferenced before it is given a valid address', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001723', 'Q000666', 'printf cannot print pointers', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001724', 'Q000666', '* should be &', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001725', 'Q000667', 'To make the code longer', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001726', 'Q000667', 'A NULL pointer does not point to any valid object', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001727', 'Q000667', 'NULL pointers run faster', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001728', 'Q000667', 'It changes the pointer''s type', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001729', 'Q000668', 'p automatically becomes NULL', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001730', 'Q000668', 'The variable''s lifetime has ended, so p is left dangling', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001731', 'Q000668', 'p changes its own address', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001732', 'Q000668', 'The block deletes p', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001733', 'Q000670', 'int *p; *p = 10;', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001734', 'Q000670', 'int *p = NULL; *p = 10;', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001735', 'Q000670', 'int x; int *p = &x; *p = 10;', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001736', 'Q000670', 'int *p; if (p) *p = 10;', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000666', 'Q000666', 'p was declared but never pointed at a variable.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000667', 'Q000667', 'NULL means "I don''t have an address."', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000668', 'Q000668', 'The variable no longer exists once its block ends.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000669', 'Q000669', 'Only dereference p when it is NOT NULL.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000670', 'Q000670', 'A safe pointer is initialized to a real variable before it is dereferenced.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000666', 'TERM460', 'Uninitialized pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000667', 'TERM461', 'NULL pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000668', 'TERM462', 'Dangling pointer', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000669', 'TERM463', 'Invalid access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000670', 'TERM464', 'Valid address', 1, true);

update chapters set question_limit = 6 where chapter_id = 'CH0103';

update chapters set question_limit = 7 where chapter_id = 'CH0104';

update chapters set question_limit = 7 where chapter_id = 'CH0105';

update chapters set question_limit = 6 where chapter_id = 'CH0108';

end
$migration$;
