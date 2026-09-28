-- Stage 7 (STG008, STRINGS) real content, replacing the structural placeholders added by
-- 20260917120000_stage6to10_placeholders.sql. That migration reserved chapter_id's CH0073-CH0078 (6
-- chapters, titles taken straight from the Strings1-6 PDF source set under assets/Contents/Strings Pdfs/)
-- with zero learn_content/questions/etc, which is what kept the stage out of Practice and out of the
-- unified-chapter Home path. This migration fills in the real learn_content + questions/options/hints/
-- glossary for all 6 chapters (unchanged IDs, titles, stage_id - no renumbering, no new chapter_id needed:
-- 6 PDFs map 1:1 onto the 6 reserved placeholders).
--
-- Every source PDF ends in a 5-question quiz written by the source material itself (30 questions in all).
-- Those questions are inserted close to verbatim, matched to the nearest existing DB question type
-- (MCQ / CODE_FILL). The only wording changes: the two "count/increment" fill-ins now say "Use the increment
-- operator" so the single expected answer (count++ / vowels++) is unambiguous, the vowel-counting prompt
-- says the shown code only checks A and E (which is what the source code does), and the last "compare the two
-- strings" question now asks whether they "hold the same text" (its "compare the lengths" distractor also prints
-- Same for CAT and CAT, so the plain wording was ambiguous).
--
-- Stage 7 is intentionally NOT unlocked by this migration: the STG008 self-referencing prerequisite row from
-- the placeholder migration is left in place (still unconditionally locked) until the chapter decks +
-- activities are written and the full test suite passes. A later migration removes exactly that one row,
-- mirroring the STG007 (Arrays) and STG009 (Searching & Sorting) unlock precedents.

-- Idempotent: everything below runs inside one guarded block. If Stage 7's learn_content is already present
-- (this migration was applied before), the block does nothing, so a re-run can never duplicate rows or fail
-- half way. Nothing is deleted or altered; only new rows are added.
do $migration$
begin
  if exists (select 1 from learn_content where learn_id = 'L_CH0073') then
    raise notice 'Stage 7 (STRINGS) content already present; nothing to do.';
    return;
  end if;

-- learn_content (CH0073: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0073', 'STG008', 'CH0073', 'String Basics & Declaration', 'What is a String?
You already know that a char can store one character. But what if we want to store Hello, Ravi or Computer? We need to store multiple characters together.

A string is a collection of characters used to represent text.

"Hello" contains H, e, l, l, o. Each one is a character, and together they form a string.

Think of a word as a train: one character is one coach, and many characters together make a string.

Remember: Character -> One. String -> Many.
//.//
Character vs String
A character represents one letter, number, or symbol, and uses single quotes: ''A'', ''B'', ''7'', ''@''.

A string contains multiple characters and uses double quotes: "Ravi", "Hello World", "12345".

''A'' is one character. "Apple" is many characters. Don''t mix them: ''A'' is a character, "Apple" is a string.

Single quotes -> single character. Double quotes -> string.
//.//
Character Array
In C, a string is stored using a character array. A character array is an array used to store characters.

For example, char name[] = "Hello"; stores the characters separately, one in each box: index 0 1 2 3 4 holds H e l l o. Each box stores one character.

Why char? Because a character array stores characters: char is the character type, name is the array name, and [] means array.

Takeaway: String in C -> Character Array.
//.//
Declaring & Initializing a String
Declaring a string means creating space to store the characters: char name[20]; Here char is the character type, name is the array name, and [20] is the space for characters.

Initializing a string means giving the string a value: char name[] = "Hello"; Now the boxes contain H e l l o.

Declaration vs initialization: char name[20]; creates space. char name[] = "Hello"; creates space and gives a value.

Declaration -> "Give me space!" Initialization -> "Put something inside!"
//.//
String Basics Recap
Remember these 5 things. String: a collection of characters used to represent text, "Hello". Character: one character, ''A''. Character array: used to store characters together, char name[]; Declaration: creates space for the string, char name[20]; Initialization: gives the string a value, char name[] = "Hello";

See it in code: char name[] = "Hello"; char is the character type, name is the name, [] is the character array, "Hello" is the string value.

You can now identify, declare, and initialize a string in C.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM241', 'string', 'A collection of characters used to represent text.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM242', 'characters', 'Individual letters, numbers, or symbols.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM243', 'character array', 'An array used to store characters.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM244', 'store', 'Keep information in memory.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM245', 'declares', 'Creates a variable or array for use in a program.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM246', 'character array', 'An array used to store characters.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM247', 'initializes', 'Gives a variable or array an initial value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM248', 'double quotes', '" " used to represent a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM249', 'character array', 'An array used to store characters.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM250', 'string', 'A collection of characters used to represent text.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000469', 'STG008', 'CH0073', 'MCQ', 'Which of the following is a string?', '', '"Hello"', '', 'A string is a collection of characters written using double quotes.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000470', 'STG008', 'CH0073', 'MCQ', 'What is a character array used for in C?', '', 'To store characters together', '', 'Think about where a string is stored in C.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000471', 'STG008', 'CH0073', 'MCQ', 'Which code correctly declares a string named name?', '', 'char name[20];', '', 'A string is stored using a character array.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000472', 'STG008', 'CH0073', 'MCQ', 'Which code correctly initializes a string with "Hello"?', '', 'char word[] = "Hello";', '', 'A string uses double quotes and is stored in a character array.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000473', 'STG008', 'CH0073', 'MCQ', 'Complete the code to create a character array that stores "Ravi".', '#include <stdio.h>

int main()
{
   ______________

   return 0;
}', 'char name[] = "Ravi";', '', 'Use char because the string is made up of characters.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001166', 'Q000469', '''A''', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001167', 'Q000469', '"Hello"', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001168', 'Q000469', '25', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001169', 'Q000469', '3.14', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001170', 'Q000470', 'To store decimal numbers', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001171', 'Q000470', 'To store characters together', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001172', 'Q000470', 'To display output', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001173', 'Q000470', 'To perform calculations', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001174', 'Q000471', 'int name[20];', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001175', 'Q000471', 'float name[20];', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001176', 'Q000471', 'char name[20];', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001177', 'Q000471', 'string name[20];', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001178', 'Q000472', 'char word = "Hello";', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001179', 'Q000472', 'char word[] = "Hello";', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001180', 'Q000472', 'int word[] = "Hello";', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001181', 'Q000472', 'char word[] = ''Hello'';', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001182', 'Q000473', 'int name = "Ravi";', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001183', 'Q000473', 'char name = "Ravi";', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001184', 'Q000473', 'char name[] = "Ravi";', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001185', 'Q000473', 'float name[] = "Ravi";', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000469', 'Q000469', 'A string is a collection of characters written using double quotes.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000470', 'Q000470', 'Think about where a string is stored in C.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000471', 'Q000471', 'A string is stored using a character array.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000472', 'Q000472', 'A string uses double quotes and is stored in a character array.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000473', 'Q000473', 'Use char because the string is made up of characters.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000469', 'TERM241', 'string', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000469', 'TERM242', 'characters', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000470', 'TERM243', 'character array', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000470', 'TERM244', 'store', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000471', 'TERM245', 'declares', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000471', 'TERM246', 'character array', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000472', 'TERM247', 'initializes', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000472', 'TERM248', 'double quotes', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000473', 'TERM249', 'character array', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000473', 'TERM250', 'string', 2, true);

-- learn_content (CH0074: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0074', 'STG008', 'CH0074', 'String Input & Output', 'Reading a String
In Chapter 1, we learned how to create and store a string. But what if the user wants to enter their own name? We need to read the string from the user.

Reading a string means taking text entered by the user and storing it in a string variable.

char name[20]; scanf("%s", name); The user types "Ravi", C reads the input, and name holds "Ravi".

Remember: Input = information given to the program. Reading = taking that information into the program.
//.//
Displaying a String
Displaying a string means showing the stored text on the screen. For this, we use printf().

char name[] = "Ravi"; printf("%s", name); Output: Ravi.

The journey: name -> "Ravi" -> printf() -> screen -> Ravi. Think of printf() as a speaker: it takes the stored information and shows it.

Remember: printf() -> "C, show this!"
//.//
Using scanf()
scanf() is a C function used to read input from the user. For a string, we commonly use %s.

char name[20]; scanf("%s", name); scanf() reads the input, %s says it is a string, and name is where the string is stored.

Mini program: printf("Enter your name: "); scanf("%s", name); The user types Ravi and name holds "Ravi".

Quick note: with %s, scanf() reads a word rather than a complete line containing spaces.
//.//
Using printf()
printf() is used to display the string stored in a variable. For strings, we use %s.

char name[] = "Ravi"; printf("%s", name); Output: Ravi. Here %s tells printf() that the value is a string, and name is the string we want to display.

Another example: char city[] = "Chennai"; printf("I live in %s", city); Output: I live in Chennai.

Remember: %s -> tells printf() that the value is a string. printf() -> displays the string.
//.//
Using fgets() + Recap
Another way to read a string is fgets(). fgets() is used to read a string from the input: char name[20]; fgets(name, 20, stdin);

scanf() reads a string. fgets() reads a string or a line, and can read input containing spaces, such as Hello World.

Recap: reading a string takes text from the user. scanf() reads string input. printf() displays a string. %s is used for strings with scanf() and printf(). fgets() reads a string or a line of input.

USER -> INPUT -> scanf() / fgets() -> STRING -> printf() -> OUTPUT.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM251', 'display', 'Show something on the screen.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM252', 'format specifier', 'A symbol that tells C what type of data is being handled.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM253', 'input', 'Information given by the user.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM254', 'scanf()', 'Reads input from the user.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM255', 'stored', 'Kept in a variable.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM256', 'display', 'Show on the screen.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM257', 'fgets()', 'Reads a string/line of input.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM258', 'stdin', 'Standard input, usually the keyboard.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM259', 'size', 'Maximum number of characters to read.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000474', 'STG008', 'CH0074', 'MCQ', 'Which function is mainly used to display a string on the screen?', '', 'printf()', '', 'Think about the function that sends information to the screen.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000475', 'STG008', 'CH0074', 'MCQ', 'Which format specifier is used with scanf() to read a string?', '', '%s', '', '%s is connected with a string.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000476', 'STG008', 'CH0074', 'CODE_FILL', 'Complete the code to read the user''s name.', '#include <stdio.h>

int main()
{
   char name[20];

   printf("Enter your name: ");
   {{1}}("%s", name);

   return 0;
}', '["scanf"]', '', 'Which function is used to take input from the user?', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000477', 'STG008', 'CH0074', 'MCQ', 'Complete the code to display the stored string.', '#include <stdio.h>

int main()
{
   char name[] = "Ravi";

   _________("%s", name);

   return 0;
}', 'printf', '', 'The string is already stored. Now the program needs to show it.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000478', 'STG008', 'CH0074', 'MCQ', 'Complete the code to read a string using fgets().', '#include <stdio.h>

int main()
{
   char message[50];

   _______________________;

   printf("%s", message);

   return 0;
}', 'fgets(message, 50, stdin)', '', 'fgets() needs the string variable, size, and input stream.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001186', 'Q000474', 'scanf()', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001187', 'Q000474', 'printf()', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001188', 'Q000474', 'fgets()', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001189', 'Q000474', 'strlen()', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001190', 'Q000475', '%d', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001191', 'Q000475', '%c', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001192', 'Q000475', '%s', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001193', 'Q000475', '%f', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001194', 'Q000477', 'scanf', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001195', 'Q000477', 'fgets', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001196', 'Q000477', 'printf', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001197', 'Q000477', 'strlen', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001198', 'Q000478', 'scanf("%s", message)', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001199', 'Q000478', 'fgets(message, 50, stdin)', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001200', 'Q000478', 'printf("%s", message)', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001201', 'Q000478', 'fgets(message, 50)', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000474', 'Q000474', 'Think about the function that sends information to the screen.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000475', 'Q000475', '%s is connected with a string.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000476', 'Q000476', 'Which function is used to take input from the user?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000477', 'Q000477', 'The string is already stored. Now the program needs to show it.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000478', 'Q000478', 'fgets() needs the string variable, size, and input stream.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000474', 'TERM251', 'display', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000475', 'TERM252', 'format specifier', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000476', 'TERM253', 'input', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000476', 'TERM254', 'scanf()', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000477', 'TERM255', 'stored', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000477', 'TERM256', 'display', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000478', 'TERM257', 'fgets()', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000478', 'TERM258', 'stdin', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000478', 'TERM259', 'size', 3, true);

-- learn_content (CH0075: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0075', 'STG008', 'CH0075', 'Accessing & Traversing Strings', 'String Indexing
String indexing means using a position number (index) to access a particular character in a string.

Think of a string like a row of boxes: H E L L O sit at index 0 1 2 3 4. In C, indexing starts from 0, not 1.

char word[] = "HELLO"; printf("%c", word[0]); Output: H.

Remember: First character -> Index 0. C starts counting from ZERO!
//.//
Accessing Individual Characters
Accessing a character means getting a specific character from a string using its index.

char name[] = "RAVI"; R A V I sit at index 0 1 2 3. printf("%c", name[2]); Output: V.

name is the string, [2] is the position, and name[2] is the character at position 2.

Remember: String + Index = Character.
//.//
Using Loops with Strings
A string can contain many characters. Instead of accessing them one by one manually, we can use a loop to go through them.

char word[] = "CODE"; for(int i = 0; word[i] != ''\0''; i++) { printf("%c", word[i]); } Output: CODE. With i = 0, 1, 2, 3 the loop prints C, O, D, E.

The loop keeps moving through the string until it reaches ''\0''.

Remember: Loop = move through characters one by one.
//.//
Modifying Characters
Can we change a character? Yes! We can change an individual character by using its index.

char word[] = "HELLO"; word[1] = ''A''; printf("%s", word); Output: HALLO. We changed the character at index 1.

For one character, use single quotes: word[1] = ''A''; not word[1] = "A";

Memory trick: Index -> Find the character -> Change it.
//.//
Traversing a String + Recap
Traversing means going through a string character by character. Imagine walking through a row of boxes: C O D I N G at index 0 to 5. A loop can help us visit each character one by one.

char word[] = "CODING"; for(int i = 0; word[i] != ''\0''; i++) { printf("%c ", word[i]); } Output: C O D I N G.

Recap: Indexing finds a character using its position. Accessing gets an individual character. A loop moves through characters. Modifying changes a character. Traversing visits characters one by one.

INDEX -> ACCESS -> LOOP -> MODIFY -> TRAVERSE.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM260', 'index', 'The position of a character in a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM261', 'access', 'To get or use a particular character.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM262', 'index', 'The position of a character.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM263', 'modify', 'To change something.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM264', 'character', 'A single letter, number, or symbol.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM265', 'traverse', 'To go through the characters one by one.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM266', 'loop', 'Repeats a block of code.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM267', 'index', 'The position of a character.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM268', '%c', 'Used to display one character.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000479', 'STG008', 'CH0075', 'MCQ', 'In C, what is the index of the first character in a string?', '', '0', '', 'C starts counting positions from zero.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000480', 'STG008', 'CH0075', 'MCQ', 'Which code accesses the character L at index 2?', 'char word[] = "HELLO";', 'word[2]', '', 'The first character starts at index 0.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000481', 'STG008', 'CH0075', 'CODE_FILL', 'Complete the code to change "HELLO" into "HALLO".', '#include <stdio.h>

int main()
{
   char word[] = "HELLO";

   word[1] = {{1}};

   printf("%s", word);

   return 0;
}', '["''A''"]', '', 'You are replacing one character, so use single quotes.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000482', 'STG008', 'CH0075', 'MCQ', 'Which code correctly goes through the characters of a string one by one?', 'char word[] = "CODE";', 'for(int i = 0; i < 4; i++) printf("%c", word[i]);', '', 'Start from index 0 and use %c for each character.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000483', 'STG008', 'CH0075', 'MCQ', 'What will be the output?', '#include <stdio.h>

int main()
{
   char word[] = "CODING";

   printf("%c", word[3]);

   return 0;
}', 'I', '', 'Write the indexes first: C is 0, O is 1, D is 2, I is 3, N is 4, G is 5.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001202', 'Q000479', '0', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001203', 'Q000479', '1', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001204', 'Q000479', '-1', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001205', 'Q000479', '2', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001206', 'Q000480', 'word[1]', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001207', 'Q000480', 'word[2]', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001208', 'Q000480', 'word[3]', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001209', 'Q000480', 'word[4]', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001210', 'Q000482', 'for(int i = 0; i < 4; i++) printf("%c", word[i]);', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001211', 'Q000482', 'for(int i = 1; i < 4; i++) printf("%c", word[i]);', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001212', 'Q000482', 'for(int i = 0; i < 4; i++) printf("%s", word[i]);', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001213', 'Q000482', 'for(int i = 0; i <= 4; i++) printf("%c", word[i]);', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001214', 'Q000483', 'C', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001215', 'Q000483', 'O', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001216', 'Q000483', 'D', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001217', 'Q000483', 'I', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000479', 'Q000479', 'C starts counting positions from zero.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000480', 'Q000480', 'The first character starts at index 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000481', 'Q000481', 'You are replacing one character, so use single quotes.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000482', 'Q000482', 'Start from index 0 and use %c for each character.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000483', 'Q000483', 'Write the indexes first: C is 0, O is 1, D is 2, I is 3, N is 4, G is 5.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000479', 'TERM260', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000480', 'TERM261', 'access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000480', 'TERM262', 'index', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000481', 'TERM263', 'modify', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000481', 'TERM264', 'character', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000482', 'TERM265', 'traverse', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000482', 'TERM266', 'loop', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000483', 'TERM267', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000483', 'TERM268', '%c', 2, true);

-- learn_content (CH0076: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0076', 'STG008', 'CH0076', 'String Length & Basic Operations', 'Finding String Length
The length of a string is the number of characters present in it.

char word[] = "HELLO"; contains H E L L O, so the length is 5. It is like counting people in a line.

Remember: String Length = number of characters in the string.

''\0'' marks the end of a string, but it is not counted as part of the string''s length.
//.//
Using strlen()
strlen() is a function used to find the length of a string. It comes from #include <string.h>.

char word[] = "HELLO"; printf("%d", strlen(word)); Output: 5. word is "HELLO", strlen() counts the characters, and gives 5.

Memory trick: strlen = String Length. str -> string, len -> length.
//.//
Counting Characters
Sometimes we don''t just want the total length. We may want to count how many characters satisfy a condition.

For "BANANA", how many As are there? B A N A N A has 3 A''s.

Basic idea: char word[] = "BANANA"; int count = 0; then check each character one by one. Check the character. Is it ''A''? If yes, count++. Move to the next character.

Remember: Check -> Match -> Count.
//.//
Searching for a Character
Searching for a character means checking whether a particular character exists inside a string.

char word[] = "HELLO"; search for ''L''. C checks H (no), E (no), L (found!).

Simple idea: for(int i = 0; word[i] != ''\0''; i++) { if(word[i] == ''L'') { printf("Found"); } } Character -> Compare -> Match? Yes -> Found.

Memory trick: SEARCH = CHECK each character until you find a match.
//.//
Counting Specific Characters + Recap
Now let''s combine checking and counting. char word[] = "BANANA"; int count = 0; for(int i = 0; word[i] != ''\0''; i++) { if(word[i] == ''A'') { count++; } } printf("%d", count); Output: 3.

What happened: B no, A yes (count = 1), N no, A yes (count = 2), N no, A yes (count = 3).

Chapter 4 recap: String Length is the number of characters. strlen() finds string length. Counting Characters counts characters that match a condition. Searching checks whether a character exists. Counting Specific Characters finds and counts a particular character.

LENGTH -> COUNT -> SEARCH -> COUNT AGAIN.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM269', 'string length', 'The number of characters in a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM270', 'string length', 'Number of characters in a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM271', 'function', 'A block of code that performs a particular task.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM272', 'search', 'Check whether something exists.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM273', 'compare', 'Check whether two values are equal or different.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM274', 'count', 'The number of times something occurs.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM275', 'increment', 'Increase a value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM276', 'specific character', 'A particular character being searched or counted.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM277', 'count', 'Number of times something occurs.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000484', 'STG008', 'CH0076', 'MCQ', 'What is the length of the following string?', 'char word[] = "CODING";', '6', '', 'Count only the characters in "CODING".', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000485', 'STG008', 'CH0076', 'CODE_FILL', 'Complete the code to find the length of the string.', '#include <stdio.h>
#include <string.h>

int main()
{
   char word[] = "HELLO";

   printf("%d", {{1}}(word));

   return 0;
}', '["strlen"]', '', 'Which function is specifically used to find string length?', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000486', 'STG008', 'CH0076', 'MCQ', 'Which code correctly searches for the character ''A'' in a string?', 'char word[] = "BANANA";', 'if(word[i] == ''A'')', '', 'To check whether two values are equal, use the comparison operator.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000487', 'STG008', 'CH0076', 'CODE_FILL', 'Complete the code to count how many ''A'' characters are present in "BANANA". Use the increment operator.', 'char word[] = "BANANA";
int count = 0;

for(int i = 0; word[i] != ''\0''; i++)
{
   if(word[i] == ''A'')
   {
      {{1}};
   }
}

printf("%d", count);', '["count++"]', '', 'Whenever ''A'' is found, increase count by 1.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000488', 'STG008', 'CH0076', 'MCQ', 'What will be the output?', 'char word[] = "APPLE";
int count = 0;

for(int i = 0; word[i] != ''\0''; i++)
{
   if(word[i] == ''P'')
   {
      count++;
   }
}

printf("%d", count);', '2', '', 'Count how many times P appears in "APPLE".', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001218', 'Q000484', '5', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001219', 'Q000484', '6', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001220', 'Q000484', '7', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001221', 'Q000484', '8', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001222', 'Q000486', 'if(word[i] = ''A'')', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001223', 'Q000486', 'if(word[i] == ''A'')', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001224', 'Q000486', 'if(word == ''A'')', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001225', 'Q000486', 'if(word[i] != ''A'')', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001226', 'Q000488', '1', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001227', 'Q000488', '2', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001228', 'Q000488', '3', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001229', 'Q000488', '5', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000484', 'Q000484', 'Count only the characters in "CODING".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000485', 'Q000485', 'Which function is specifically used to find string length?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000486', 'Q000486', 'To check whether two values are equal, use the comparison operator.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000487', 'Q000487', 'Whenever ''A'' is found, increase count by 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000488', 'Q000488', 'Count how many times P appears in "APPLE".', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000484', 'TERM269', 'string length', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000485', 'TERM270', 'string length', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000485', 'TERM271', 'function', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000486', 'TERM272', 'search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000486', 'TERM273', 'compare', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000487', 'TERM274', 'count', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000487', 'TERM275', 'increment', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000488', 'TERM276', 'specific character', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000488', 'TERM277', 'count', 2, true);

-- learn_content (CH0077: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0077', 'STG008', 'CH0077', 'String Library Functions', 'strcpy()
strcpy() is used to copy one string into another string. Think of it like copying a message from one notebook to another: source "Hello" -> destination "Hello".

char source[] = "Hello"; char destination[20]; strcpy(destination, source); printf("%s", destination); Output: Hello.

Remember: strcpy() = String COPY.
//.//
strcat()
strcat() is used to join two strings together. "Hello " + "World" -> "Hello World".

char first[30] = "Hello "; char second[] = "World"; strcat(first, second); printf("%s", first); Output: Hello World. first was "Hello ", second was "World", and after strcat() first is "Hello World".

Memory trick: strcat() = String CATenate -> JOIN.
//.//
strcmp()
strcmp() is used to compare two strings, like checking two answers and asking: "Are these strings the same?"

char first[] = "Hello"; char second[] = "Hello"; if(strcmp(first, second) == 0) { printf("Strings are same"); } Output: Strings are same.

For beginners, remember: strcmp() == 0 -> Strings are equal.

Memory trick: strcmp() = String COMPARE.
//.//
strchr()
strchr() is used to search for a particular character inside a string, like using a magnifying glass to find one letter.

char word[] = "HELLO"; if(strchr(word, ''L'') != NULL) { printf("Character found"); } Output: Character found. word is "HELLO", strchr() searches for ''L'', and it is found.

Memory trick: strchr() = String CHaRacter search.
//.//
<string.h> Library + Recap
<string.h> is a library header file that provides useful functions for working with strings. To use these string functions, we include #include <string.h>.

Our string toolkit: strcpy() copies a string. strcat() joins two strings. strcmp() compares two strings. strchr() searches for a character.

BIG MEMORY TRICK: COPY -> JOIN -> COMPARE -> SEARCH.

You can now use C''s basic string toolkit to copy, join, compare, and search strings.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM278', 'copy', 'Make another string with the same characters.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM279', 'join', 'Combine two things together.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM280', 'copy', 'Make a duplicate of the string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM281', 'destination', 'The string where the copied value goes.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM282', 'source', 'The string from which the value is copied.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM283', 'join', 'Combine two strings.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM284', 'string', 'A sequence of characters.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM285', 'compare', 'Check two strings against each other.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM286', 'same', 'Equal or matching.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000489', 'STG008', 'CH0077', 'MCQ', 'Which function is used to copy one string into another string?', '', 'strcpy()', '', 'Think COPY.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000490', 'STG008', 'CH0077', 'MCQ', 'What is the purpose of strcat()?', '', 'Join two strings', '', 'Think of strcat() as connecting two strings.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000491', 'STG008', 'CH0077', 'CODE_FILL', 'Complete the code to copy source into destination.', '#include <stdio.h>
#include <string.h>

int main()
{
   char source[] = "Hello";
   char destination[20];

   {{1}}(destination, source);

   printf("%s", destination);

   return 0;
}', '["strcpy"]', '', 'Which function performs a string copy?', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000492', 'STG008', 'CH0077', 'CODE_FILL', 'Complete the code to join the two strings.', '#include <stdio.h>
#include <string.h>

int main()
{
   char first[30] = "Hello ";
   char second[] = "World";

   {{1}}(first, second);

   printf("%s", first);

   return 0;
}', '["strcat"]', '', 'Which function is used to join strings together?', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000493', 'STG008', 'CH0077', 'MCQ', 'What will be the output of this program?', '#include <stdio.h>
#include <string.h>

int main()
{
   char first[] = "CAT";
   char second[] = "CAT";

   if(strcmp(first, second) == 0)
      printf("Same");
   else
      printf("Different");

   return 0;
}', 'Same', '', 'strcmp() compares two strings. When the strings are equal, it returns 0.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001230', 'Q000489', 'strcat()', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001231', 'Q000489', 'strcmp()', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001232', 'Q000489', 'strcpy()', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001233', 'Q000489', 'strchr()', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001234', 'Q000490', 'Compare two strings', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001235', 'Q000490', 'Join two strings', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001236', 'Q000490', 'Search for a character', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001237', 'Q000490', 'Find string length', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001238', 'Q000493', 'Same', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001239', 'Q000493', 'Different', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001240', 'Q000493', 'CAT', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001241', 'Q000493', 'No output', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000489', 'Q000489', 'Think COPY.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000490', 'Q000490', 'Think of strcat() as connecting two strings.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000491', 'Q000491', 'Which function performs a string copy?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000492', 'Q000492', 'Which function is used to join strings together?', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000493', 'Q000493', 'strcmp() compares two strings. When the strings are equal, it returns 0.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000489', 'TERM278', 'copy', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000490', 'TERM279', 'join', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000491', 'TERM280', 'copy', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000491', 'TERM281', 'destination', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000491', 'TERM282', 'source', 3, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000492', 'TERM283', 'join', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000492', 'TERM284', 'string', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000493', 'TERM285', 'compare', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000493', 'TERM286', 'same', 2, true);

-- learn_content (CH0078: one row; pages_text carries 5 "//.//"-delimited sections, each section's
-- first line its heading, following the same convention already used by every other chapter)
insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0078', 'STG008', 'CH0078', 'Basic String Programs', 'Find the Length of a String
Goal: use the string concepts learned so far to write small, simple programs.

We want to find how many characters are in a string. "HELLO" has H E L L O, so Length = 5.

char word[] = "HELLO"; printf("Length = %d", strlen(word)); word -> "HELLO" -> strlen() -> 5.

Remember: strlen() counts the characters in a string. Try: change "HELLO" to "C PROGRAM" and see what happens.
//.//
Reverse a String
Reverse means writing the string from the last character to the first. Before: C O D E. After: E D O C.

char word[] = "CODE"; int i; for(i = strlen(word) - 1; i >= 0; i--) { printf("%c", word[i]); } Output: EDOC.

For "CODE" at index 0 1 2 3 the loop starts at index 3 and goes 3 -> 2 -> 1 -> 0, so we get E -> D -> O -> C.

Memory trick: Normal order -> 0 -> last. Reverse order -> last -> 0.
//.//
Check for Palindrome
A palindrome is a word that is the same when read forward and backward: MADAM -> MADAM, LEVEL -> LEVEL, but HELLO -> OLLEH is not.

Think of a mirror: in MADAM the first and last characters match (M and M), then the next pair (A and A).

Beginner idea: understand the steps first. 1. Take a string. 2. Look at the first and last characters. 3. Compare them. 4. Move towards the middle. 5. If all match, it is a palindrome.

Remember: Same forward + backward = Palindrome.
//.//
Count Vowels and Consonants
We check each character and decide whether it is a vowel or consonant. Vowels are A E I O U.

For APPLE: A is a vowel, P is a consonant, P is a consonant, L is a consonant, E is a vowel. So vowels = 2 and consonants = 3.

Simple logic: take one character. Is it A, E, I, O or U? Yes -> vowel, count++. No -> consonant, count++.

Memory trick: Check -> Decide -> Count. For the first version, work with simple alphabetic strings such as "APPLE".
//.//
Compare Two Strings
Sometimes we need to check whether two strings are the same. String 1 is "HELLO" and string 2 is "HELLO": compare them and they are the same.

char first[] = "HELLO"; char second[] = "HELLO"; if(strcmp(first, second) == 0) { printf("Same"); } else { printf("Different"); } Output: Same.

strcmp() compares the two strings.

Chapter 6 recap: Length finds how many characters. Reverse reads from last to first. Palindrome is the same forward and backward. Vowels and consonants: check and count. Compare checks two strings.

COUNT -> REVERSE -> CHECK -> COUNT -> COMPARE.', true);

-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM287', 'string length', 'The number of characters in a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM288', 'strlen()', 'Finds the length of a string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM289', 'reverse', 'Arrange the characters in the opposite order.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM290', 'length', 'The number of characters in the string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM291', 'strlen()', 'Finds the length of the string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM292', 'vowel', 'One of A, E, I, O, or U.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM293', 'count', 'The number of vowels found.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM294', 'compare', 'Check two strings to see whether they are the same or different.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM295', 'strcmp()', 'Compares two strings.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000494', 'STG008', 'CH0078', 'MCQ', 'What will be the output of this program?', '#include <stdio.h>
#include <string.h>

int main()
{
   char word[] = "CODE";

   printf("%d", strlen(word));

   return 0;
}', '4', '', 'Count the characters in "CODE".', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000495', 'STG008', 'CH0078', 'MCQ', 'If the string is char word[] = "CAT"; what will be its reverse?', '', 'TAC', '', 'Start reading from the last character.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000496', 'STG008', 'CH0078', 'CODE_FILL', 'Complete the code to find the length of the string.', '#include <stdio.h>
#include <string.h>

int main()
{
   char word[] = "HELLO";

   printf("Length = %d", {{1}}(word));

   return 0;
}', '["strlen"]', '', 'Use the function that finds the length of a string.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000497', 'STG008', 'CH0078', 'CODE_FILL', 'Complete the code to count vowels in the string. This version only checks for A and E. Use the increment operator.', 'char word[] = "APPLE";
int vowels = 0;

for(int i = 0; word[i] != ''\0''; i++)
{
   if(word[i] == ''A'' || word[i] == ''E'')
   {
      {{1}};
   }
}

printf("%d", vowels);', '["vowels++"]', '', 'When a vowel is found, increase the vowels count by 1.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000498', 'STG008', 'CH0078', 'MCQ', 'Which code correctly checks whether the two strings hold the same text?', 'char first[] = "CAT";
char second[] = "CAT";', 'if(strcmp(first, second) == 0) printf("Same");', '', 'Use the string function specifically meant to compare strings.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0001242', 'Q000494', '3', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001243', 'Q000494', '4', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001244', 'Q000494', '5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001245', 'Q000494', '0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001246', 'Q000495', 'TAC', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001247', 'Q000495', 'CTA', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001248', 'Q000495', 'ACT', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001249', 'Q000495', 'CAT', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001250', 'Q000498', 'if(first == second) printf("Same");', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001251', 'Q000498', 'if(strcmp(first, second) == 0) printf("Same");', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001252', 'Q000498', 'if(first = second) printf("Same");', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001253', 'Q000498', 'if(strlen(first) == strlen(second)) printf("Same");', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000494', 'Q000494', 'Count the characters in "CODE".', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000495', 'Q000495', 'Start reading from the last character.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000496', 'Q000496', 'Use the function that finds the length of a string.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000497', 'Q000497', 'When a vowel is found, increase the vowels count by 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000498', 'Q000498', 'Use the string function specifically meant to compare strings.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000494', 'TERM287', 'string length', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000494', 'TERM288', 'strlen()', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000495', 'TERM289', 'reverse', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000496', 'TERM290', 'length', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000496', 'TERM291', 'strlen()', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000497', 'TERM292', 'vowel', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000497', 'TERM293', 'count', 2, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000498', 'TERM294', 'compare', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000498', 'TERM295', 'strcmp()', 2, true);

end
$migration$;
