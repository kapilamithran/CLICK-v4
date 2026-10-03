-- PRACTICE CONTENT MIGRATION (NEW eyevmykfavooeiklzebe)
-- Replaces NEW's 70 legacy Practice questions (S0-S5 scheme) and 234 tests with the verified
-- updated S0-S9 dataset (70 questions, 402 tests: 332 hidden, 70 public).
-- Source snapshot: migration/.local-practice-export/ (checksums verified in its manifest.json).
-- Rollback: migration/phase-practice-content-rollback.sql (restores migration/.local-practice-new-before-replacement/).
--
-- CONTENT ONLY. No schema change. No student data. practice_progress must be 0.
-- The 15 legacy Practice-related prerequisite rows are NOT migrated (10 orphaned P-chain rows, 5 STG007-STG011 self-locks).
-- Every step asserts its expected row count. Any failed assertion raises an error and the whole transaction rolls back.
-- Run as ONE file in ONE transaction (begin ... commit).

begin;

-- 1. Safety: student progress must be empty. Refuse otherwise.
do $$
begin
  if (select count(*) from practice_progress) <> 0 then
    raise exception 'ABORT: practice_progress has rows. Content replacement refused. Nothing was changed.';
  end if;
end $$;

-- 2. Safety: NEW must be in the captured pre-migration state (70 questions, 234 tests, 0 mistake rules).
do $$
begin
  if (select count(*) from practice_bank) <> 70
     or (select count(*) from practice_tests) <> 234
     or (select count(*) from practice_mistakes) <> 0 then
    raise exception 'ABORT: NEW Practice content differs from the captured pre-migration state. Nothing was changed.';
  end if;
end $$;

-- 3. Delete the 234 legacy tests that belong to the legacy questions (explicit IDs, not a blanket CASCADE).
do $$
declare n integer;
begin
  delete from practice_tests where practice_id in ('S0-Q1', 'S0-Q2', 'S0-Q3', 'S0-Q4', 'S0-Q5', 'S0-Q6', 'S0-Q7', 'S0-Q8', 'S0-Q9', 'S0-Q10', 'S1-Q1', 'S1-Q2', 'S1-Q3', 'S1-Q4', 'S1-Q5', 'S1-Q6', 'S1-Q7', 'S1-Q8', 'S1-Q9', 'S1-Q10', 'S2-Q1', 'S2-Q2', 'S2-Q3', 'S2-Q4', 'S2-Q5', 'S2-Q6', 'S2-Q7', 'S2-Q8', 'S2-Q9', 'S2-Q10', 'S2-Q11', 'S2-Q12', 'S2-Q13', 'S2-Q14', 'S2-Q15', 'S3-Q1', 'S3-Q2', 'S3-Q3', 'S3-Q4', 'S3-Q5', 'S3-Q6', 'S3-Q7', 'S3-Q8', 'S3-Q9', 'S3-Q10', 'S3-Q11', 'S3-Q12', 'S3-Q13', 'S3-Q14', 'S3-Q15', 'S4-Q1', 'S4-Q2', 'S4-Q3', 'S4-Q4', 'S4-Q5', 'S4-Q6', 'S4-Q7', 'S4-Q8', 'S4-Q9', 'S4-Q10', 'S5-Q1', 'S5-Q2', 'S5-Q3', 'S5-Q4', 'S5-Q5', 'S5-Q6', 'S5-Q7', 'S5-Q8', 'S5-Q9', 'S5-Q10');
  get diagnostics n = row_count;
  if n <> 234 then
    raise exception 'ABORT: deleted % legacy tests, expected 234.', n;
  end if;
end $$;

-- 4. Delete legacy mistake rules for the legacy questions (expected 0).
do $$
declare n integer;
begin
  delete from practice_mistakes where practice_id in ('S0-Q1', 'S0-Q2', 'S0-Q3', 'S0-Q4', 'S0-Q5', 'S0-Q6', 'S0-Q7', 'S0-Q8', 'S0-Q9', 'S0-Q10', 'S1-Q1', 'S1-Q2', 'S1-Q3', 'S1-Q4', 'S1-Q5', 'S1-Q6', 'S1-Q7', 'S1-Q8', 'S1-Q9', 'S1-Q10', 'S2-Q1', 'S2-Q2', 'S2-Q3', 'S2-Q4', 'S2-Q5', 'S2-Q6', 'S2-Q7', 'S2-Q8', 'S2-Q9', 'S2-Q10', 'S2-Q11', 'S2-Q12', 'S2-Q13', 'S2-Q14', 'S2-Q15', 'S3-Q1', 'S3-Q2', 'S3-Q3', 'S3-Q4', 'S3-Q5', 'S3-Q6', 'S3-Q7', 'S3-Q8', 'S3-Q9', 'S3-Q10', 'S3-Q11', 'S3-Q12', 'S3-Q13', 'S3-Q14', 'S3-Q15', 'S4-Q1', 'S4-Q2', 'S4-Q3', 'S4-Q4', 'S4-Q5', 'S4-Q6', 'S4-Q7', 'S4-Q8', 'S4-Q9', 'S4-Q10', 'S5-Q1', 'S5-Q2', 'S5-Q3', 'S5-Q4', 'S5-Q5', 'S5-Q6', 'S5-Q7', 'S5-Q8', 'S5-Q9', 'S5-Q10');
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'ABORT: deleted % mistake rules, expected 0.', n;
  end if;
end $$;

-- 5. Delete the 70 legacy questions.
do $$
declare n integer;
begin
  delete from practice_bank where practice_id in ('S0-Q1', 'S0-Q2', 'S0-Q3', 'S0-Q4', 'S0-Q5', 'S0-Q6', 'S0-Q7', 'S0-Q8', 'S0-Q9', 'S0-Q10', 'S1-Q1', 'S1-Q2', 'S1-Q3', 'S1-Q4', 'S1-Q5', 'S1-Q6', 'S1-Q7', 'S1-Q8', 'S1-Q9', 'S1-Q10', 'S2-Q1', 'S2-Q2', 'S2-Q3', 'S2-Q4', 'S2-Q5', 'S2-Q6', 'S2-Q7', 'S2-Q8', 'S2-Q9', 'S2-Q10', 'S2-Q11', 'S2-Q12', 'S2-Q13', 'S2-Q14', 'S2-Q15', 'S3-Q1', 'S3-Q2', 'S3-Q3', 'S3-Q4', 'S3-Q5', 'S3-Q6', 'S3-Q7', 'S3-Q8', 'S3-Q9', 'S3-Q10', 'S3-Q11', 'S3-Q12', 'S3-Q13', 'S3-Q14', 'S3-Q15', 'S4-Q1', 'S4-Q2', 'S4-Q3', 'S4-Q4', 'S4-Q5', 'S4-Q6', 'S4-Q7', 'S4-Q8', 'S4-Q9', 'S4-Q10', 'S5-Q1', 'S5-Q2', 'S5-Q3', 'S5-Q4', 'S5-Q5', 'S5-Q6', 'S5-Q7', 'S5-Q8', 'S5-Q9', 'S5-Q10');
  get diagnostics n = row_count;
  if n <> 70 then
    raise exception 'ABORT: deleted % legacy questions, expected 70.', n;
  end if;
end $$;

-- 6. Insert the 70 updated questions (exact IDs from the verified export).
insert into practice_bank ("active", "constraints", "difficulty", "experiment_number", "hint_1", "hint_2", "hint_3", "input_format", "marks", "memory_limit_mb", "objective", "order", "output_format", "practice_id", "problem_statement", "sample_input", "sample_output", "stage_id", "starter_code", "success_message", "technique_after_success", "time_limit_seconds", "title", "workspace_folder") values
  (true, '- The program reads no input.
- Number of printf() statements: exactly 1.
- Each border line contains exactly 25 equal signs.
- ''Session : 1'' has one space before the colon; ''Status  : READY'' has two.
- No trailing spaces at the end of any line; a single newline after the last line.', 'easy', NULL, '1) A C program cannot use printf() unless the input/output header file is included at the top. 2) Every statement you write must sit inside the body of main().', '1) One printf() can print many lines: place \n wherever a new line should start. 2) \n goes inside the double quotes, not outside them.', '1) A hidden test compares your output character by character - count the equal signs and the leading spaces again. 2) Re-read the constraints: ''Session'' has one space before the colon, ''Status'' has two.', 'This program does not read any input. Nothing is supplied on the standard input stream.', NULL, NULL, 'CH0031 - Intro : write a complete C program (header, main, return) and produce a multi-line banner from a single printf() call.', 10, 'Print exactly 6 lines: a border line, the centred laboratory name, a border line, the session line, the status line, and a closing border line.', 'S0-C1-Q1', 'Every workstation in the programming laboratory prints a fixed boot banner on the screen when a student session begins.

Write a complete C program that reproduces this banner exactly as shown in the sample output.

Requirements:
1. Follow the standard C program structure: the stdio.h header, the main() function, and return 0.
2. Produce the complete banner using exactly ONE printf() statement. Use the newline escape sequence \n inside the same string to move to the next line.
3. The output must match character by character, including the three leading spaces before REC C PROGRAMMING LAB and the spacing around the colons.', NULL, '=========================
   REC C PROGRAMMING LAB
=========================
Session : 1
Status  : READY
=========================', 'STG001', '#include <stdio.h>

int main()
{
    // TODO: print the complete 6-line banner using ONE printf() statement
    // Remember: \n inside the string moves the cursor to the next line

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Lab Terminal Boot Banner', 'Stage-0/Ch1-Lab-Terminal-Boot-Banner'),
  (true, '- The program reads no input.
- Number of printf() statements: exactly 5, one per output line.
- All values are fixed text; no variable is required.
- The label column is 8 characters wide, followed by '': '' (colon and one space).
- The path must print as C:\lab\week1 with exactly one backslash before ''lab'' and one before ''week1''.
- No trailing spaces at the end of any line.', 'easy', NULL, '1) A double quote inside a string ends the string unless you tell the compiler otherwise - there is an escape sequence for it. 2) The backslash is itself the escape character, so a backslash that must be printed has to be written twice.', '1) Inside printf() the percent sign starts a format specifier, so a single one will confuse it. 2) Look for the escape form that prints one literal percent sign.', '1) A hidden test checks the alignment of the colons - count the spaces after each label. 2) Another hidden test checks the path: it must show ONE backslash in the output, not two.', 'This program does not read any input. Nothing is supplied on the standard input stream.', NULL, NULL, 'CH0032 - printf : reuse the program structure from the previous chapter and learn the escape sequences \" , \\ and %% needed to print characters that printf() treats as special.', 11, 'Print exactly 5 lines. Line 1 is the report title; lines 2 to 5 each contain a label, a colon, a space and the value, with the colons aligned in the same column.', 'S0-C2-Q1', 'The laboratory report generator must print a student report card on the screen. The report contains three characters that printf() treats as special: the double quote, the backslash and the percent sign. Printing them directly causes a compilation error or a wrong result, so each one has to be escaped.

Write a C program that prints the report exactly as shown in the sample output.

Requirements:
1. Use a separate printf() statement for each of the five lines.
2. The student name must appear inside double quotation marks.
3. The folder path must contain single backslashes.
4. The percent sign must be printed using the correct escape form inside printf().
5. The labels are padded so that every colon appears in the same column.', NULL, 'LAB REPORT
Student : "S. Kumar"
Folder  : C:\lab\week1
Score   : 92%
Remark  : 100% pass', 'STG001', '#include <stdio.h>

int main()
{
    printf("LAB REPORT\n");

    // TODO: print the Student line - the name must appear inside double quotes
    // TODO: print the Folder line - the path contains backslashes
    // TODO: print the Score line - it ends with a percent sign
    // TODO: print the Remark line

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Printing Special Characters in a Report', 'Stage-0/Ch2-Printing-Special-Characters'),
  (true, '- The program reads no input.
- All four output lines are fixed text: Item = Notebook, Quantity = 3, Amount = 150.
- The label column is 9 characters wide, followed by '': '' (colon and one space).
- No line beginning with DEBUG may appear in the output.
- Multi-line comments cannot be nested: never place a /* */ block inside another /* */ block.
- No trailing spaces at the end of any line.', 'medium', NULL, '1) A comment is removed by the compiler before the program is built, so a commented printf() never runs. 2) You may not erase the debug statements - only hide them.', '1) Two lines that sit next to each other can be wrapped by one opening marker and one closing marker. 2) A lonely line is cheaper to disable with the two-slash form.', '1) A hidden test searches the output for the word DEBUG - if even one such line is still printed, the test fails. 2) Another hidden test checks the label column width: count the spaces after Item, Quantity and Amount again.', 'This program does not read any input. Nothing is supplied on the standard input stream.', NULL, NULL, 'CH0033 - Comments : keep the printf() skills of the previous chapter and learn that commented-out code is ignored by the compiler, using // for one line and /* */ for a block.', 12, 'Print exactly 4 lines: the title line followed by the Item, Quantity and Amount lines, with the colons aligned in the same column. No DEBUG line and no comment text may appear.', 'S0-C3-Q1', 'A billing program was written with extra DEBUG lines that the developer used while testing. The customer copy of the bill must not contain those lines, but company policy does not allow deleting them - they have to stay in the source file so testing can be resumed later.

The starter code already prints both the debug lines and the order summary. Modify the program so that only the order summary is printed.

Requirements:
1. Do not delete any printf() statement. Disable the DEBUG lines using comments only.
2. Disable the two DEBUG lines that appear together with a single multi-line comment ( /* ... */ ).
3. Disable the single DEBUG line that appears alone with a single-line comment ( // ).
4. Add a multi-line comment block at the top of main() recording the program purpose.', NULL, 'ORDER SUMMARY
Item     : Notebook
Quantity : 3
Amount   : 150', 'STG001', '#include <stdio.h>

int main()
{
    // TODO: replace this line with a multi-line comment block describing the program

    printf("ORDER SUMMARY\n");

    printf("DEBUG: opening item section\n");
    printf("DEBUG: item id = 4471\n");

    printf("Item     : Notebook\n");
    printf("Quantity : 3\n");

    printf("DEBUG: amount calculated\n");

    printf("Amount   : 150\n");

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Silencing the Debug Lines', 'Stage-0/Ch3-Silencing-The-Debug-Lines'),
  (true, '- The program reads no input.
- row      : a char variable holding the single character ''B''.
- old seat : an int variable, initial value 12 (1 <= seat <= 60).
- new seat : the SAME int variable after it is updated, value 27 (1 <= seat <= 60).
- shifted  : an int variable holding new seat - old seat.
- The seat variable must be declared once and reused; a separate variable for the new seat is not allowed.
- The literal 15 must not appear anywhere in the program.
- The label column is 13 characters wide, followed by '': ''.', 'medium', NULL, '1) A character value is written inside single quotes and printed with a different format specifier than a whole number. 2) Every variable must be declared before it is used.', '1) Once you assign a new value to a variable the old value is lost forever - save it first if you still need it. 2) The order of your statements decides which value gets printed.', '1) A hidden test checks that the shift is computed, so re-read the constraints: the literal 15 must not appear in your program. 2) Another hidden test checks the label column - count the spaces so that every colon lines up.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0034 - Variables : move from fixed text in printf() to named storage, and learn that a variable keeps only its most recent value and can be reused inside an expression.', 13, 'Print exactly 5 lines: the title line, the row letter, the old seat number, the new seat number and the number of seats shifted, with the colons aligned.', 'S0-C4-Q1', 'An examination hall software keeps the seat number of a student in a single variable. When a student is moved to another seat the same variable is updated with the new seat number, and the software reports how many seats the student was shifted by.

Write a C program that:
1. Stores the row letter B in a character variable.
2. Stores the old seat number 12 in an integer variable and prints it.
3. Copies the old seat number into a second integer variable, then updates the ORIGINAL variable to the new seat number 27 and prints it.
4. Calculates the number of seats shifted as the difference between the new seat number and the saved old seat number, stores it in a third integer variable and prints it.

The value 15 must be calculated by the program. It must not be typed into any printf().', NULL, 'SEAT ALLOCATION
Row          : B
Old seat     : 12
New seat     : 27
Seats shifted: 15', 'STG001', '#include <stdio.h>

int main()
{
    char row = ''B'';
    int seat = 12;

    printf("SEAT ALLOCATION\n");
    // TODO: print the Row line using the %c format specifier
    // TODO: print the Old seat line using the %d format specifier

    // TODO: save the old seat number in another int variable before you overwrite seat
    // TODO: update seat to 27 and print the New seat line

    // TODO: calculate the shift from the two seat numbers and print the last line

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Seat Reallocation Record', 'Stage-0/Ch4-Seat-Reallocation-Record'),
  (true, '- The program reads no input.
- initial    : a char variable holding ''S''.
- age        : an int variable, value 18 (0 <= age <= 120).
- percentage : a float variable, value 85.5, printed with exactly 2 decimals (0.00 to 100.00).
- fine       : a double variable, value 120.75, printed with exactly 4 decimals (0.0000 to 99999.9999).
- The four sizes must come from sizeof; the literals 1, 4, 4 and 8 must not be typed in the audit printf() calls.
- sizeof returns an unsigned quantity, so use a matching format specifier or cast it to int.
- Record label column is 13 characters wide, audit label column is 7 characters wide, each followed by '': ''.
- Expected sizes on the evaluation machine: char = 1, int = 4, float = 4, double = 8.', 'hard', NULL, '1) A format specifier can carry a precision: the number after the dot decides how many digits appear after the decimal point. 2) Check which specifier printf() expects for a double.', '1) sizeof is an operator, not a function you write yourself; it can be applied directly to a type name. 2) The audit line for char ends with ''byte'' while the other three end with ''bytes''.', '1) A hidden test checks the decimal places - re-read the constraints: the percentage needs 2 digits and the fine needs 4. 2) Another hidden test checks that the sizes come from sizeof, so do not type 1, 4, 4 and 8 into the printf() statements.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0035 - Recap & Datatypes Intro : combine program structure, printf(), comments and variables from the whole stage, and learn to control decimal precision and to measure how much memory each data type occupies using sizeof.', 14, 'Print exactly 10 lines. Lines 1 to 5 are the student record: title, initial, age, percentage with 2 decimals and library fine with 4 decimals. Lines 6 to 10 are the memory audit: title followed by char, int, float and double in that order, each showing the size with the word ''byte'' for a size of 1 and ''bytes'' otherwise.', 'S0-C5-Q1', 'The college record system stores one student record using four different data types, and the administrator also wants a short audit showing how much memory each of those types occupies on the lab machine.

Write a C program that:
1. Stores the initial S in a char variable, the age 18 in an int variable, the percentage 85.5 in a float variable and the library fine 120.75 in a double variable.
2. Prints the record. The percentage must show exactly 2 digits after the decimal point and the library fine exactly 4 digits.
3. Prints a memory audit showing the size in bytes of char, int, float and double. Each size must be measured using the sizeof operator; the numbers must not be typed by hand.
4. Uses at least one comment to describe each of the two sections.

Note the singular and plural forms: a size of 1 prints ''byte'', any other size prints ''bytes''.', NULL, 'STUDENT RECORD
Initial      : S
Age          : 18
Percentage   : 85.50
Library fine : 120.7500
MEMORY AUDIT
char   : 1 byte
int    : 4 bytes
float  : 4 bytes
double : 8 bytes', 'STG001', '#include <stdio.h>

int main()
{
    /* Section 1: student record */
    char initial = ''S'';
    int age = 18;
    float percentage = 85.5;
    double fine = 120.75;

    printf("STUDENT RECORD\n");
    // TODO: print Initial, Age, Percentage and Library fine
    // TODO: control the decimal places with the precision part of the specifier

    // TODO: Section 2 - print the memory audit using sizeof for each type

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Student Record and Memory Audit', 'Stage-0/Ch5-Student-Record-And-Memory-Audit'),
  (true, '- The program reads no input.
- maxInt  : int, value 2147483647 (the largest value a 32-bit signed int can hold).
- minInt  : int, value -2147483648, written in the program as -2147483647 - 1.
- counter : unsigned int, initial value 4294967295 (the largest 32-bit unsigned value).
- A signed int and an unsigned int need different format specifiers in printf().
- The label column is 10 characters wide, followed by '': ''.
- No trailing spaces at the end of any line.', 'easy', NULL, '1) An int and an unsigned int are printed with two different format specifiers - using the wrong one prints a negative number. 2) The unsigned literal is usually written with a u suffix.', '1) The smallest int cannot be typed as a plain literal because the minus sign is an operator applied to a positive constant that is already out of range. 2) Subtracting 1 from -2147483647 keeps every step inside the valid range.', '1) A hidden test checks the value after the increment - re-read the problem statement, an unsigned value does not stop at its maximum, it wraps. 2) Another hidden test checks the label column width; count the spaces before each colon.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0036 - integer : build on variables from the previous stage and learn that an int has a fixed range, that the smallest int cannot be written directly as a literal, and that an unsigned int wraps back to zero.', 10, 'Print exactly 6 lines: the INT LIMITS heading with the maximum and minimum int values, then the UNSIGNED WRAP heading with the counter value before and after adding one.', 'S1-C1-Q1', 'A ticket counter stores its running count in an unsigned integer. The maintenance team wants a diagnostic screen that reports the limits of a signed int and demonstrates what happens when an unsigned counter is increased past its largest value.

Write a C program that:
1. Stores the largest possible int value in an int variable and prints it.
2. Stores the smallest possible int value in an int variable and prints it. The literal -2147483648 is not a valid int constant on its own, so build the value as -2147483647 - 1.
3. Stores 4294967295 in an unsigned int variable and prints it.
4. Adds 1 to that unsigned variable and prints the result again.

Unsigned arithmetic does not produce an error when the range is exceeded; the value simply wraps around to the beginning of the range.', NULL, 'INT LIMITS
Max int   : 2147483647
Min int   : -2147483648
UNSIGNED WRAP
Before    : 4294967295
After     : 0', 'STG002', '#include <stdio.h>

int main()
{
    int maxInt = 2147483647;
    // TODO: build the smallest int value without writing it as a single literal
    unsigned int counter = 4294967295u;

    printf("INT LIMITS\n");
    // TODO: print Max int and Min int

    printf("UNSIGNED WRAP\n");
    // TODO: print the counter, add 1 to it, then print it again

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Integer Limits and Unsigned Wrap-Around', 'Stage-1/Ch1-Integer-Limits-And-Unsigned-Wrap'),
  (true, '- The program reads no input.
- fThird : float, holds 1.0f / 3.0f, printed with exactly 10 decimals.
- dThird : double, holds 1.0 / 3.0, printed with exactly 10 decimals.
- fBig   : float, holds 123456789.0f, printed with exactly 1 decimal.
- dBig   : double, holds 123456789.0, printed with exactly 1 decimal.
- The division must be carried out in the matching type: use the f suffix on float literals so the calculation is not silently done in double and then copied.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) A literal such as 3.0 is a double; adding the f suffix makes it a float. 2) If the whole calculation is done in double and only the result is stored in a float, the printed digits will not show the loss you are asked to demonstrate.', '1) The precision part of the format specifier controls how many decimals are printed, not how many the type can store. 2) printf() promotes a float to double automatically, so the same specifier is used for both.', '1) A hidden test compares the two ONE THIRD lines and expects them to differ - if they are identical, check whether your float division really used float literals. 2) Another hidden test checks the LARGE READING float line: re-read the statement, a float cannot represent 123456789 exactly.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0037 - float & double : extend the integer work of the previous chapter to real numbers and learn that a float keeps roughly 7 significant digits while a double keeps about 15, so the same calculation gives two different answers.', 11, 'Print exactly 6 lines: the ONE THIRD heading with the float and double results to 10 decimals, then the LARGE READING heading with the float and double values to 1 decimal.', 'S1-C2-Q1', 'A measurement tool stores readings in two different real number types. The engineering team wants a report that shows how much accuracy is lost when a float is used instead of a double.

Write a C program that:
1. Calculates one divided by three, once using float variables and once using double variables, and prints both results with 10 digits after the decimal point.
2. Stores the reading 123456789 in a float variable and in a double variable, and prints both with 1 digit after the decimal point.

The two results will not be identical. A float can hold only about 7 significant digits, so the extra digits are approximated, while a double holds about 15.', NULL, 'ONE THIRD
float   : 0.3333333433
double  : 0.3333333333
LARGE READING
float   : 123456792.0
double  : 123456789.0', 'STG002', '#include <stdio.h>

int main()
{
    float  fThird = 1.0f / 3.0f;
    // TODO: declare the double version of one third
    // TODO: declare the float and double versions of the large reading

    printf("ONE THIRD\n");
    // TODO: print both results with 10 decimals

    printf("LARGE READING\n");
    // TODO: print both readings with 1 decimal

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Float and Double Precision Report', 'Stage-1/Ch2-Float-And-Double-Precision'),
  (true, '- The program reads no input.
- grade   : char, value ''A'' (numeric code 65).
- flag    : char, value ''Y''.
- present : bool, true when flag is equal to ''Y'' (requires the stdbool.h header).
- The same char variable must be printed twice using two different format specifiers.
- Adding 1 to the grade must not change the stored value of the grade variable.
- The label column is 12 characters wide, followed by '': ''.', 'medium', NULL, '1) The same variable can be printed as a symbol or as a number just by changing the format specifier. 2) The header stdbool.h must be included before bool, true and false can be used.', '1) Adding 1 to a character gives the next code in the table, but the sum is an int - decide which specifier you need so it prints as a letter. 2) Printing grade + 1 does not modify grade.', '1) A hidden test checks the Next char line - re-read the statement, it must show a letter, not a number. 2) Another hidden test checks the boolean lines: a bool prints as 1 or 0, never as the words true or false.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0038 - character & boolean : join the numeric types of the previous chapters with characters, and learn that a char is stored as a small integer code and that a bool always prints as 1 or 0.', 12, 'Print exactly 7 lines: the CHARACTER CHECK heading with the grade character, its code and the next character, then the BOOLEAN CHECK heading with the present flag and its opposite, each printed as 1 or 0.', 'S1-C3-Q1', 'An attendance device stores a grade as a single character and a presence flag as the letter Y or N. The firmware team needs a decoder screen that shows the character, the numeric code behind it, the next character in sequence, and the boolean interpretation of the presence flag.

Write a C program that:
1. Stores the grade ''A'' and the presence flag ''Y'' in char variables.
2. Prints the grade both as a character and as its numeric code.
3. Prints the character that comes immediately after the grade by adding 1 to it.
4. Stores, in a bool variable, whether the presence flag is equal to ''Y'', then prints that value and its opposite.

A char is a whole number underneath, so arithmetic on it is allowed. A bool can only ever hold true or false, which printf() shows as 1 and 0.', NULL, 'CHARACTER CHECK
Grade char  : A
Grade code  : 65
Next char   : B
BOOLEAN CHECK
Present     : 1
Absent      : 0', 'STG002', '#include <stdio.h>
#include <stdbool.h>

int main()
{
    char grade = ''A'';
    char flag  = ''Y'';
    // TODO: store in a bool whether flag is equal to ''Y''

    printf("CHARACTER CHECK\n");
    // TODO: print the grade as a character, then as its numeric code
    // TODO: print the character that comes after the grade

    printf("BOOLEAN CHECK\n");
    // TODO: print the present flag and its opposite

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Attendance Flag Decoder', 'Stage-1/Ch3-Attendance-Flag-Decoder'),
  (true, '- The program reads no input.
- PI     : symbolic constant created with #define, value 3.14159, no semicolon at the end.
- RADIUS : const double, value 7.5 (0.0 < radius <= 1000.0).
- diameter = 2 * RADIUS, circumference = 2 * PI * RADIUS, area = PI * RADIUS * RADIUS.
- Every printed value uses exactly 4 decimals.
- The literal 3.14159 must appear exactly once in the whole program, in the #define line.
- The label column is 14 characters wide, followed by '': ''.', 'medium', NULL, '1) A #define line ends at the end of the line - a semicolon would become part of the replacement text and break the formulas. 2) #define goes above main(), a const variable goes inside it.', '1) A const variable can be read as often as you like but never assigned again after its declaration. 2) Writing int main(void) makes it explicit that the program accepts no arguments.', '1) A hidden test checks the decimal places - re-read the constraints, every value needs exactly 4. 2) Another hidden test checks that pi was named once: if you typed 3.14159 inside a formula, the constraint has been broken.', 'This program does not read any input. All values are fixed inside the program as constants.', NULL, NULL, 'CH0039 - constants, void : replace the magic numbers used in earlier chapters with named constants, and learn the difference between a #define replacement made before compilation and a const variable checked by the compiler, plus the meaning of void in main(void).', 13, 'Print exactly 5 lines: the CIRCLE METRICS heading followed by the radius, the diameter, the circumference and the area, each with 4 decimals.', 'S1-C4-Q1', 'A design tool computes the metrics of a circular plate. The review team rejected the previous version because the value of pi was typed directly into every formula. The new version must declare the value once and reuse it.

Write a C program that:
1. Defines a symbolic constant PI with the value 3.14159 using #define, placed above main().
2. Declares the radius as a const double with the value 7.5 inside main().
3. Declares main() as int main(void) to state explicitly that the program takes no arguments.
4. Prints the radius, the diameter, the circumference and the area, each with 4 decimals.

A #define is a plain text replacement performed before compilation and carries no data type. A const variable does have a type and the compiler refuses any attempt to modify it.', NULL, 'CIRCLE METRICS
Radius        : 7.5000
Diameter      : 15.0000
Circumference : 47.1238
Area          : 176.7144', 'STG002', '#include <stdio.h>

// TODO: define the symbolic constant PI with the value 3.14159

int main(void)
{
    const double RADIUS = 7.5;

    printf("CIRCLE METRICS\n");
    // TODO: print the radius, diameter, circumference and area with 4 decimals each

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Circle Metrics with Symbolic Constants', 'Stage-1/Ch4-Circle-Metrics-With-Constants'),
  (true, '- The program reads no input.
- total   : int, value 461 (0 <= total <= 1000000).
- count   : int, value 6 (1 <= count <= 100).
- average : float, equal to total divided by count with one operand cast to float, printed with 2 decimals.
- The truncated value and the rounded value are both int.
- The grade is a char obtained by casting an int expression; do not type the letter directly.
- A cast written as (float)(total / count) is wrong; the cast must be applied to an operand.
- The label column is 17 characters wide, followed by '': ''.', 'hard', NULL, '1) In C the type of a division is decided by the types of the two operands, not by where the answer is stored. 2) Once the fraction has been discarded, no later cast can bring it back.', '1) Adding 0.5 before converting to int is the usual way to round a positive value. 2) Casting an int expression to char makes printf() show the matching symbol when the correct specifier is used.', '1) A hidden test compares the integer division line with the cast division line and expects them to differ - if they match, check where you placed the cast. 2) Another hidden test checks the rounded line: re-read the statement, 76.83 must become 77, not 76.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0040 - type casting : bring together the int, float, double and char work of this stage and learn that dividing two ints throws away the fraction before any conversion happens, so the cast has to be applied to an operand and not to the result.', 14, 'Print exactly 6 lines: the AVERAGE REPORT heading, the integer division result, the cast division with 2 decimals, the truncated value, the rounded value and the grade character.', 'S1-C5-Q1', 'A results program divides the total marks of a class by the number of students. The first version reported an average of 76 instead of 76.83, because both values were integers.

Write a C program that stores a total of 461 marks for 6 students and prints:
1. The plain integer division of the two values.
2. The true average, obtained by casting one operand to float before the division, printed with 2 decimals.
3. The true average cast back to an int, which discards the fraction.
4. The true average rounded to the nearest whole number by adding 0.5 before the cast to int.
5. The grade letter obtained by casting the number 65 plus 2 to a char.

Casting the result of an integer division changes nothing, because the fraction is already gone by then. The cast must be applied before the division takes place.', NULL, 'AVERAGE REPORT
Integer division : 76
Cast division    : 76.83
Truncated        : 76
Rounded          : 77
Grade            : C', 'STG002', '#include <stdio.h>

int main()
{
    int total = 461;
    int count = 6;

    printf("AVERAGE REPORT\n");
    // TODO: print the plain integer division
    // TODO: cast one operand to float, store the average and print it with 2 decimals
    // TODO: print the average truncated to an int
    // TODO: print the average rounded to the nearest int
    // TODO: build the grade character by casting an int expression to char

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Class Average and Type Conversion', 'Stage-1/Ch5-Class-Average-And-Type-Conversion'),
  (true, '- The program reads no input.
- counter : int, initial value 10, modified only by the two increment expressions.
- x : int, value 17 (-1000 <= x <= 1000).
- y : int, value 5, never zero (division by zero is undefined).
- The negative case uses -x and y, not a separate hard-coded value.
- The remainder operator works on integers only; it must not be used on a float.
- The label column is 12 characters wide, followed by '': ''.', 'easy', NULL, '1) The post form hands over the old value and updates afterwards; the pre form updates first and hands over the new value. 2) Both forms change the variable - only the value handed to printf() differs.', '1) The remainder operator is the percent sign, which must be escaped when you also want to print a literal percent character. 2) Work out the two increment lines on paper before you run the program.', '1) A hidden test checks the negative division line - re-read the statement, C truncates towards zero. 2) Another hidden test checks the negative remainder: its sign follows the left operand, not the right one.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0041 - arithmetic & unary operation : apply the data types of the previous stage to real calculations, and learn that ++ before and after a variable return different values, and that integer division truncates towards zero so a negative remainder keeps the sign of the left operand.', 15, 'Print exactly 10 lines: the COUNTER TRACE heading with five lines showing the counter before, during and after each increment, then the DIVISION CHECK heading with the quotient and remainder for the positive pair and for the negative pair.', 'S2-C1-Q1', 'A diagnostic tool must demonstrate how C evaluates the unary and arithmetic operators, because trainees keep misreading the result of a post-increment and the sign of a remainder.

Write a C program that:
1. Starts with a counter holding 10 and prints its value.
2. Prints the value returned by the post-increment expression, then the counter afterwards.
3. Prints the value returned by the pre-increment expression, then the counter afterwards.
4. Using 17 and 5, prints the quotient and the remainder.
5. Using -17 and 5, prints the quotient and the remainder again.

In C, integer division truncates towards zero, so -17 divided by 5 is -3 and not -4, and the remainder takes the sign of the left operand.', NULL, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', 'STG003', '#include <stdio.h>

int main()
{
    int counter = 10;
    int x = 17;
    int y = 5;

    printf("COUNTER TRACE\n");
    // TODO: print the counter, the post-increment result, the counter again,
    //       the pre-increment result and the counter once more

    printf("DIVISION CHECK\n");
    // TODO: print quotient and remainder for x and y, then for -x and y

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Increment Trace and Negative Division', 'Stage-2/Ch1-Increment-Trace-And-Negative-Division'),
  (true, '- The program reads no input.
- stock : int, initial value 100 (0 <= stock <= 1000000 at every step).
- Exactly five compound assignment operators must be used, in the order add, subtract, multiply, divide, remainder.
- The divisor is 4 and the remainder base is 7; neither may be zero.
- One variable only: declaring a new variable for any step is not allowed.
- The label column is 12 characters wide, followed by '': ''.', 'easy', NULL, '1) Every arithmetic operator has a compound form that combines the calculation and the assignment. 2) The operator is written immediately before the equals sign, with no space between them.', '1) Each line changes the same variable, so the order of the statements decides the final answer. 2) Work the five steps out by hand first: the last two are the ones trainees get wrong.', '1) A hidden test checks the fourth line - re-read the statement, integer division keeps only the whole part. 2) Another hidden test checks the final line: the remainder step keeps what is left over, not the number of boxes.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0042 - assignment : replace the long form of arithmetic from the previous chapter with compound assignment operators, and learn that each one reads the variable, applies the operation and stores the result back in a single step.', 16, 'Print exactly 6 lines: the STOCK TRACE heading followed by the stock level after the delivery, the dispatch, the doubling, the division and the remainder step.', 'S2-C2-Q1', 'A warehouse system adjusts a stock level through a fixed sequence of corrections. Each correction must modify the same variable using a compound assignment operator, and the stock level must be printed after every step so the auditor can follow the trail.

Starting from a stock of 100, apply these corrections in order and print the stock after each one:
1. A delivery adds 50 units.
2. A dispatch removes 30 units.
3. A stock count doubles the value.
4. The value is split into 4 equal warehouses, keeping one share.
5. The remaining units are packed into boxes of 7 and only the loose units are kept.

Each step must use a compound assignment operator on the same variable. The long form stock = stock + 50 is not accepted.', NULL, 'STOCK TRACE
after add   : 150
after sub   : 120
after mul   : 240
after div   : 60
after mod   : 4', 'STG003', '#include <stdio.h>

int main()
{
    int stock = 100;

    printf("STOCK TRACE\n");
    // TODO: add 50 with a compound operator, then print the stock
    // TODO: subtract 30, then print
    // TODO: multiply by 2, then print
    // TODO: divide by 4, then print
    // TODO: apply the remainder of 7, then print

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Inventory Adjustment Trace', 'Stage-2/Ch2-Inventory-Adjustment-Trace'),
  (true, '- The program reads no input.
- age        : int, value 20 (0 <= age <= 120).
- marks      : int, value 45 (0 <= marks <= 100).
- attendance : int, value 80 (0 <= attendance <= 100).
- counter    : int, initial value 0, only ever changed by the skipped side of a logical expression.
- Every printed condition is an int that can only be 1 or 0.
- The label column is 14 characters wide, followed by '': ''.', 'medium', NULL, '1) A comparison such as age >= 18 can be handed straight to printf() - it already is a number. 2) AND is true only when every part is true; OR is true when at least one part is true.', '1) The right-hand side of an AND is never reached once the left-hand side is false. 2) The right-hand side of an OR is never reached once the left-hand side is true.', '1) A hidden test checks the counter lines - re-read the statement, the counter must still be 0 at the end. 2) Another hidden test checks the combined AND line: all three conditions must be included, and one of them is false.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0043 - relational & logical : turn the arithmetic of the previous chapters into conditions, and learn that a comparison itself produces the value 1 or 0 and that && and || stop evaluating as soon as the answer is known.', 17, 'Print exactly 11 lines: the CONDITIONS heading with six condition results printed as 1 or 0, then the SHORT CIRCUIT heading with the two expression results and the counter after each of them.', 'S2-C3-Q1', 'An examination office checks eligibility from three stored values: age, marks and attendance. The training material must show that a comparison in C is itself a value, and that the logical operators do not always evaluate their right-hand side.

Write a C program that, using age 20, marks 45 and attendance 80, prints:
1. The result of age at least 18.
2. The result of marks at least 50.
3. The result of attendance at least 75.
4. The result of all three conditions combined with the AND operator.
5. The result of the first two conditions combined with the OR operator.
6. The result of the NOT operator applied to the marks condition.

Then declare a counter set to 0 and evaluate an AND expression whose left side is false and whose right side increases the counter, and an OR expression whose left side is true and whose right side increases the counter. Print the counter after each. Because the answer is already decided by the left side, the counter never changes.', NULL, 'CONDITIONS
age >= 18     : 1
marks >= 50   : 0
att >= 75     : 1
all three AND : 0
first two OR  : 1
NOT marks     : 1
SHORT CIRCUIT
AND result    : 0
counter now   : 0
OR result     : 1
counter now   : 0', 'STG003', '#include <stdio.h>

int main()
{
    int age = 20, marks = 45, attendance = 80;
    int counter = 0;

    printf("CONDITIONS\n");
    // TODO: print the three individual conditions, then AND, OR and NOT

    printf("SHORT CIRCUIT\n");
    // TODO: evaluate an AND whose left side is false and whose right side is ++counter
    // TODO: evaluate an OR whose left side is true and whose right side is ++counter
    // TODO: print each result and the counter afterwards

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Eligibility Truth Table and Short Circuit', 'Stage-2/Ch3-Eligibility-Truth-Table'),
  (true, '- The program reads no input.
- reg  : unsigned int, initial value 12 (binary 1100), range 0 to 255.
- mask : unsigned int, value 10 (binary 1010), range 0 to 255.
- Bit positions are counted from 0 at the least significant end.
- The bit test must print 1 or 0 only, never the whole masked value.
- Switching a bit on uses OR with a shifted 1; switching a bit off uses AND with the inverted shifted 1.
- An unsigned value needs its own format specifier in printf().
- The label column is 12 characters wide, followed by '': ''.', 'medium', NULL, '1) AND keeps the bits that are set in both values, OR keeps the bits set in either, XOR keeps the bits that differ. 2) Shifting left multiplies by two for each place, shifting right divides by two.', '1) To read one bit, move it to the lowest position first and then mask everything else away with 1. 2) The value 1 shifted left by n gives a mask with only bit n set.', '1) A hidden test checks the bit 3 line - re-read the constraints, the answer must be 1 or 0, not 8. 2) Another hidden test checks the clear step: switching a bit off needs the inverted mask, and 12 already has bit 2 set.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0044 - Bitwise : move from whole-number logic to individual bits, and learn to test, set, clear and flip one bit of a register using shifting together with the bitwise operators.', 18, 'Print exactly 10 lines: the REGISTER heading with the starting value, the three bitwise combinations, the two shifted values and the state of bit 3, then the UPDATES heading with the register after setting bit 1 and after clearing bit 2.', 'S2-C4-Q1', 'A device stores its status in an 8-bit register. Bit 0 is the power flag, bit 1 the wifi flag, bit 2 the gps flag and bit 3 the battery flag.

Starting from the register value 12 and the mask value 10, write a C program that prints:
1. The register value.
2. The result of AND, OR and XOR between the register and the mask.
3. The register shifted left by two places and shifted right by two places.
4. The state of bit 3 of the register, obtained by shifting that bit into the lowest position and masking it with 1.
5. The register after bit 1 has been switched on.
6. The register after bit 2 has been switched off.

The register must be declared as unsigned so that shifting never produces a negative value. The original register value must not be changed until the last two steps.', NULL, 'REGISTER
reg         : 12
reg & mask  : 8
reg | mask  : 14
reg ^ mask  : 6
reg << 2    : 48
reg >> 2    : 3
bit 3       : 1
UPDATES
set bit 1   : 14
clear bit 2 : 10', 'STG003', '#include <stdio.h>

int main()
{
    unsigned int reg = 12;
    unsigned int mask = 10;

    printf("REGISTER\n");
    // TODO: print reg, then reg AND mask, reg OR mask, reg XOR mask
    // TODO: print reg shifted left by 2 and shifted right by 2
    // TODO: print the state of bit 3 as a single 1 or 0

    printf("UPDATES\n");
    // TODO: switch bit 1 on and print the register
    // TODO: switch bit 2 off and print the register

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Device Flag Register', 'Stage-2/Ch4-Device-Flag-Register'),
  (true, '- The program reads no input.
- a : int, value 2. b : int, value 3. c : int, value 4. d : int, value 5.
- All four variables are positive and none of them is modified anywhere in the program.
- Every expression is evaluated with integer arithmetic, so the division in expression 3 keeps only the whole part.
- Expressions 4 and 5 produce int results; a comparison yields 1 or 0.
- Expressions 6 and 7 differ only in parentheses and must produce different values.
- The label column is 12 characters wide, followed by '': ''.', 'hard', NULL, '1) Multiplication and division are applied before addition and subtraction. 2) The relational operators are applied before the equality operators, so one comparison becomes an operand of the other.', '1) Among the bitwise operators, AND is applied before XOR, and XOR before OR. 2) The shift operators sit below addition, so anything added on the left is finished first.', '1) A hidden test compares expressions 6 and 7 and expects them to differ - if they match, check that you copied the expressions exactly. 2) Another hidden test checks expression 3: re-read the constraints, the division is integer division.', 'This program does not read any input. All values are fixed inside the program as variables.', NULL, NULL, 'CH0045 - Precedence : combine every operator family met in this stage into single expressions, and learn the order in which C applies them and how parentheses change the answer.', 19, 'Print exactly 8 lines: the PRECEDENCE CHECK heading followed by the seven expression values, one per line, in the order listed in the problem statement.', 'S2-C5-Q1', 'Trainees keep adding parentheses at random because they are unsure which operator C applies first. A reference program must print the value of several mixed expressions so the precedence rules can be checked against the output.

Using a = 2, b = 3, c = 4 and d = 5, write a C program that prints the value of these expressions exactly in this order:
1. a + b * c
2. (a + b) * c
3. a + b * c - d / 2
4. a < b == c > d
5. a & b | c ^ d
6. a + b << 1
7. a + (b << 1)

Each expression must be written exactly as shown, with no extra parentheses, so that the printed value demonstrates the real precedence order.', NULL, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', 'STG003', '#include <stdio.h>

int main()
{
    int a = 2, b = 3, c = 4, d = 5;

    printf("PRECEDENCE CHECK\n");
    // TODO: print each of the seven expressions in the order given
    // Write them exactly as shown - do not add parentheses of your own

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Expression Evaluation Order', 'Stage-2/Ch5-Expression-Evaluation-Order'),
  (true, '- code  : integer, 1 <= code <= 99999, always printed as 5 digits with leading zeros.
- price : real number, 0.00 <= price <= 99999.99, read into a double.
- qty   : integer, 0 <= qty <= 1000.
- total = price * qty, so 0.00 <= total <= 99999990.00, stored in a double.
- A float keeps only about 7 significant digits and will print a wrong total for large bills.
- If a value is wider than its field it is printed in full; the field width is a minimum, not a maximum.
- The label column is 6 characters wide, followed by '': ''.', 'medium', NULL, '1) A number written between the percent sign and the conversion letter sets the minimum field width. 2) A leading zero in that number changes the padding character from a space to a zero.', '1) The precision is written after a dot and controls the digits printed after the decimal point. 2) A double is read with a different specifier from the one used to print it - check both.', '1) A hidden test uses the largest allowed price with the largest allowed quantity - re-read the constraints, a float cannot hold that many significant digits, so check your data type. 2) Another hidden test uses a small code such as 7 and expects five characters in that column.', 'A single line with three values separated by spaces: the item code (integer), the unit price (real number) and the quantity (integer).', NULL, NULL, 'CH0046 - format specifier : take the values that used to be fixed inside the program and read them instead, then learn the width, zero-padding and precision parts of a format specifier so a bill prints in neat columns.', 15, 'Print exactly 4 lines: Code with the 5-digit zero-padded item code, Price with the unit price right aligned in 10 characters and 2 decimals, Qty with the quantity right aligned in 10 characters, and Total with the amount right aligned in 10 characters and 2 decimals.', 'S3-C1-Q1', 'A billing terminal prints one line per item. The printed columns must line up whatever the size of the numbers, so every value is printed inside a fixed-width field.

Read an item code, a unit price and a quantity, then print the bill using these rules:
1. The item code is printed in a field of 5 characters, padded with leading zeros.
2. The unit price, the quantity and the total are each printed right aligned in a field of 10 characters.
3. The unit price and the total show exactly 2 digits after the decimal point.
4. The total is the unit price multiplied by the quantity.

The total can grow to about 100 million, which is more significant digits than a float can hold accurately, so the price and the total must be stored in a double.', '42 12.50 3//.//7 99999.99 1000', 'Code  : 00042
Price :      12.50
Qty   :          3
Total :      37.50//.//Code  : 00007
Price :   99999.99
Qty   :       1000
Total : 99999990.00', 'STG004', '#include <stdio.h>

int main()
{
    int code, qty;
    double price;

    scanf("%d %lf %d", &code, &price, &qty);

    // TODO: calculate the total as price multiplied by quantity
    // TODO: print Code with a 5-wide zero-padded field
    // TODO: print Price, Qty and Total right aligned in 10-wide fields

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Aligned Billing Line', 'Stage-3/Ch1-Aligned-Billing-Line'),
  (true, '- admission : whole number, 1 <= admission <= 9999999999 (up to 10 digits), so an int is not large enough; use a long long.
- section   : a single uppercase letter from A to Z.
- marks     : real number, 0.00 <= marks <= 100.00, printed with exactly 2 decimals.
- The three values arrive on one line separated by single spaces and must be read with one scanf call.
- scanf needs the address of every variable it fills.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) One scanf can carry several specifiers; they are matched to the values in order. 2) The ampersand in front of a variable name gives scanf the address it needs to store into.', '1) A character specifier happily accepts the space left over from the previous value, so put a blank space before it in the format string. 2) A float and a double are read with different specifiers even though they print with the same one.', '1) A hidden test enters a full 10-digit admission number - re-read the constraints, the range goes far past the limit of an int, so correct your data type and its specifier. 2) Another hidden test checks the marks column: it needs exactly 2 decimals.', 'A single line with three values separated by spaces: the admission number (whole number of up to 10 digits), the section (one uppercase letter) and the entrance marks (real number).', NULL, NULL, 'CH0047 - scanf() : read several values of different types in one call, learn that scanf needs the address of each variable, and learn that a 10-digit admission number does not fit in an int.', 16, 'Print exactly 3 lines: Admission with the admission number, Section with the section letter and Marks with the entrance marks to 2 decimal places.', 'S3-C2-Q1', 'The admission desk enters one student record at a time: an admission number, a section letter and the entrance marks. All three values arrive on a single line and must be read by one scanf call.

Read the record and print it back in a labelled block, with the marks shown to 2 decimal places.

Admission numbers are 10 digits long. A 32-bit int stops at 2147483647, so an admission number such as 9876543210 stored in an int becomes a wrong, often negative, value. Choose a type that can hold the whole range, and use the matching format specifier when reading and printing it.', '12 A 87.5//.//9876543210 Z 100', 'Admission : 12
Section   : A
Marks     : 87.50//.//Admission : 9876543210
Section   : Z
Marks     : 100.00', 'STG004', '#include <stdio.h>

int main()
{
    long long admission;
    char section;
    double marks;

    // TODO: read all three values with a single scanf call
    // Remember the blank space before the character specifier

    // TODO: print Admission, Section and Marks

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Admission Record Entry', 'Stage-3/Ch2-Admission-Record-Entry'),
  (true, '- quantity : whole number, accepted only when 1 <= quantity <= 100.
- Zero and negative numbers are valid numbers but are outside the accepted range.
- An entry that begins with a letter cannot be read as a number at all.
- Exactly one line of output is printed in every case.
- The three messages are written exactly as: ''Invalid input'', ''Out of range'' and ''Accepted : <quantity>'' with the label column 8 characters wide followed by '': ''.
- The quantity variable must not be printed unless scanf reported success.', 'hard', NULL, '1) scanf hands back a count of the values it stored - save that count in an int before you look at the quantity. 2) The order of your checks matters: a value that was never read cannot be range checked.', '1) Two separate failures need two separate messages, so one if-else chain with three branches is enough. 2) Compare the returned count with 1, not with 0.', '1) A hidden test enters a negative number - re-read the constraints, a negative value is a valid number, so it belongs to the range message and not to the invalid message. 2) Another hidden test enters plain text, so make sure nothing is printed from the unfilled variable.', 'A single entry on one line. It is usually a whole number, but it may also be text that is not a number.', NULL, NULL, 'CH0048 - Input validation : stop trusting the input, and learn that scanf returns how many values it managed to read, so a non-numeric entry can be detected before the value is used.', 17, 'Print exactly 1 line: ''Invalid input'' when the entry could not be read as a whole number, ''Out of range'' when the number is below 1 or above 100, and otherwise ''Accepted : '' followed by the quantity.', 'S3-C3-Q1', 'An order terminal must never place an order from a bad entry. Two different failures have to be separated: an entry that is not a number at all, and a number that falls outside the allowed quantity range.

Read one quantity and report exactly one of three outcomes:
1. If the entry is not a whole number, print Invalid input.
2. If it is a whole number but smaller than 1 or larger than 100, print Out of range.
3. Otherwise print Accepted followed by the quantity.

scanf returns the number of values it successfully stored. For one value that means 1 on success and 0 when the text could not be read as a number, so the return value must be checked before the variable is used. A variable that was never filled holds an unpredictable value.', '45//.//150//.//abc', 'Accepted : 45//.//Out of range//.//Invalid input', 'STG004', '#include <stdio.h>

int main()
{
    int quantity;
    int read;

    read = scanf("%d", &quantity);

    // TODO: if scanf did not read one value, print Invalid input
    // TODO: otherwise, if the quantity is outside 1 to 100, print Out of range
    // TODO: otherwise print the accepted quantity

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Validated Quantity Entry', 'Stage-3/Ch3-Validated-Quantity-Entry'),
  (true, '- tag   : a single word of 1 to 20 characters, letters and digits only, never containing a space.
- The character array that stores the tag must therefore hold at least 21 positions.
- grade : one uppercase letter from A to Z, entered on the next line.
- code  : the numeric character code of the grade, between 65 and 90.
- The first character of the tag must be read from the array, not entered separately.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) A word read with the string specifier needs no ampersand, because an array name already stands for an address. 2) Reading also stores an invisible end marker, so the array must have one position to spare.', '1) The first character of an array sits at position zero. 2) A character specifier picks up the newline left by the previous entry unless a blank space is placed before it in the format string.', '1) A hidden test uses a tag of the full allowed length - re-read the constraints and check that your array is large enough, including the end marker. 2) Another hidden test checks the Code line: the same character variable prints as a letter or as a number depending on the specifier.', 'Two lines. The first line holds the user tag as a single word with no spaces. The second line holds the grade band as one uppercase letter.', NULL, NULL, 'CH0049 - Character & String Input : extend scanf from numbers to text, and learn that a word is read into a character array whose first position can be read back, while a single character needs a leading space to skip the newline left behind.', 18, 'Print exactly 4 lines: User with the tag, Initial with the first character of the tag, Grade with the grade band and Code with the numeric code of the grade band.', 'S3-C4-Q1', 'A login terminal stores a user tag and a grade band. The tag is a single word with no spaces and the grade band is one uppercase letter entered on the next line.

Read both values and print a summary containing the tag, its first character, the grade band and the numeric code of that grade band.

A word is read into a character array. The array must be one position longer than the longest allowed tag, because the end of a word is marked by an extra terminating character that the reading also stores.', 'kumar
A//.//devi2024
S', 'User    : kumar
Initial : k
Grade   : A
Code    : 65//.//User    : devi2024
Initial : d
Grade   : S
Code    : 83', 'STG004', '#include <stdio.h>

int main()
{
    char tag[21];
    char grade;

    scanf("%s", tag);
    // TODO: read the grade band, remembering the blank space before the specifier

    // TODO: print User, Initial, Grade and Code

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Login Tag Reader', 'Stage-3/Ch4-Login-Tag-Reader'),
  (true, '- age   : whole number, 1 <= age <= 120.
- city  : a line of 1 to 50 characters that may contain spaces, so the array must hold at least 51 positions.
- flag  : a single letter, either Y or N.
- The plain word specifier stops at the first space and cannot be used for the city.
- The leftover newline must be skipped before the city and before the flag are read.
- The city is printed exactly as entered, with no leading or trailing spaces added or removed.
- The label column is 7 characters wide, followed by '': ''.', 'hard', NULL, '1) A blank space at the start of a scanf format string tells it to skip over any whitespace still waiting in the buffer, including a newline. 2) The word specifier would stop the city at its first space.', '1) There is a scanf form that reads everything up to, but not including, the newline. 2) A character array name is already an address, so it needs no ampersand.', '1) A hidden test uses a city of the full allowed length - re-read the constraints and count the positions your array reserves, including the end marker. 2) Another hidden test uses a city made of several words: if only the first word appears, the wrong reading form was used.', 'Three lines. The first line holds the age as a whole number. The second line holds the city name, which may contain spaces. The third line holds the activation flag as a single letter.', NULL, NULL, 'CH0050 - Input Buffer & Newline Handling : combine number, line and character input in one program, and learn why the newline left in the buffer by a previous entry has to be skipped before the next value can be read correctly.', 19, 'Print exactly 3 lines: Age with the age, City with the complete city name and Active with the activation flag.', 'S3-C5-Q1', 'A registration form collects three fields in a fixed order: an age, a city name that may contain spaces, and an activation flag that is a single letter.

Reading these three fields in a row is where most programs break. After a number is read, the newline the user pressed is still waiting in the input buffer. The next read then picks up that newline instead of the real value: a city would come back empty and a flag would come back as a newline character.

Read the three fields correctly and print them in a labelled block. The city must be stored complete, including any spaces inside it.', '21
New Delhi
Y//.//45
Chennai
N', 'Age    : 21
City   : New Delhi
Active : Y//.//Age    : 45
City   : Chennai
Active : N', 'STG004', '#include <stdio.h>

int main()
{
    int age;
    char city[51];
    char flag;

    scanf("%d", &age);
    // TODO: read the whole city line, skipping the leftover newline first
    // TODO: read the activation flag, again skipping whitespace

    // TODO: print Age, City and Active

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Buffered Registration Form', 'Stage-3/Ch5-Buffered-Registration-Form'),
  (true, '- marks      : whole number, 0 <= marks <= 100.
- attendance : whole number, 0 <= attendance <= 100.
- The merit boundary is 75 and the attendance boundary is 80; both boundaries count as met.
- The heading and the closing line are printed for every input, including the lowest values.
- No else branch is required anywhere in this problem.
- Each message is printed exactly as written in the problem statement, one per line.', 'easy', NULL, '1) An if statement controls only the single statement that follows it, unless braces group several together. 2) A condition that is false prints nothing at all - no blank line.', '1) The word ''or more'' includes the boundary itself, so the comparison is not a strict one. 2) The approval line needs both conditions to hold at the same time.', '1) A hidden test uses exactly 75 and 80 - re-read the constraints, both boundaries count as met. 2) Another hidden test uses zeros for both values, and the heading and the closing line must still appear.', 'A single line with two whole numbers separated by a space: the marks and the attendance percentage.', NULL, NULL, 'CH0051 - if Statement : turn the comparisons learnt with the operators into decisions, and learn that several independent if statements each decide on their own, so the number of printed lines changes with the data.', 10, 'Print the heading ELIGIBILITY REPORT, then one line for each criterion that is met, then the approval line if both are met, and finally the line Check complete. Between 2 and 5 lines are printed.', 'S4-C1-Q1', 'A scholarship desk screens a student against two independent criteria and prints an alert line for each criterion that is met.

Read the marks and the attendance percentage, then print the report as follows:
1. Always print the heading ELIGIBILITY REPORT.
2. Print ''Merit criteria met'' when the marks are 75 or more.
3. Print ''Attendance criteria met'' when the attendance is 80 or more.
4. Print ''Scholarship approved'' only when both criteria are met.
5. Always print ''Check complete'' as the last line.

Use separate if statements. A criterion that is not met simply prints nothing, so the report is between two and five lines long.', '88 92//.//60 95', 'ELIGIBILITY REPORT
Merit criteria met
Attendance criteria met
Scholarship approved
Check complete//.//ELIGIBILITY REPORT
Attendance criteria met
Check complete', 'STG005', '#include <stdio.h>

int main()
{
    int marks, attendance;

    scanf("%d %d", &marks, &attendance);

    printf("ELIGIBILITY REPORT\n");
    // TODO: print the merit line when the marks reach the boundary
    // TODO: print the attendance line when the attendance reaches the boundary
    // TODO: print the approval line only when both are met
    printf("Check complete\n");

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Scholarship Eligibility Alert', 'Stage-4/Ch1-Scholarship-Eligibility-Alert'),
  (true, '- value : whole number, -9999999999 <= value <= 9999999999 (up to 10 digits), so an int is not large enough; use a long long with its matching specifier.
- Zero is even, and its sign is reported as Zero, not as Positive.
- The parity test must work for negative values, so compare the remainder with 0 rather than with 1.
- Parity is printed as exactly Even or Odd; the sign is printed as exactly Positive, Negative or Zero.
- The label column is 7 characters wide, followed by '': ''.', 'medium', NULL, '1) An if-else chooses exactly one of two paths, so the parity can be decided in one statement. 2) The sign needs three outcomes, which means one if-else nested inside another.', '1) Testing ''remainder is not equal to zero'' works for positive and negative values alike. 2) Zero must be checked before deciding between positive and negative.', '1) A hidden test uses a ten digit reading - re-read the constraints, the range is far beyond an int, so correct your data type and its specifier. 2) Another hidden test uses a negative odd number: if it prints Even, your parity test is comparing against the wrong value.', 'A single line holding one whole number, which may be negative, zero or up to 10 digits long.', NULL, NULL, 'CH0052 - if-else : add the alternative branch to the single if of the previous chapter, and learn that the remainder of a negative number is negative, so a parity test must compare against zero rather than against one.', 11, 'Print exactly 2 lines: Parity with either Even or Odd, and Sign with Positive, Negative or Zero.', 'S4-C2-Q1', 'A data cleaning tool classifies one stored reading in two ways: whether it is even or odd, and whether it is positive, negative or zero.

Read one whole number and print its parity on the first line and its sign on the second line.

Two traps are being tested here. First, readings reach ten digits, which is beyond the range of an int. Second, in C the remainder of a negative number keeps the minus sign, so -7 divided by 2 leaves -1 and not 1. A parity test written as remainder equal to 1 therefore calls every negative odd number even.', '18//.//-7//.//0', 'Parity : Even
Sign   : Positive//.//Parity : Odd
Sign   : Negative//.//Parity : Even
Sign   : Zero', 'STG005', '#include <stdio.h>

int main()
{
    long long value;

    scanf("%lld", &value);

    // TODO: decide Even or Odd with an if-else that also works for negative values
    // TODO: decide Positive, Negative or Zero

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Parity and Sign Report', 'Stage-4/Ch2-Parity-And-Sign-Report'),
  (true, '- choice : whole number; only 1, 2, 3 and 4 are listed, every other value is invalid.
- qty    : whole number, 0 <= qty <= 500.
- rate   : real number taken from the menu, printed with exactly 2 decimals.
- total  : rate multiplied by quantity, printed with exactly 2 decimals, at most 20000.00.
- A quantity of zero is valid and produces a total of 0.00.
- An invalid choice prints exactly one line and no item, rate or total.
- The label column is 5 characters wide, followed by '': ''.', 'medium', NULL, '1) A switch compares one value against each case label in turn. 2) The item name and the rate can both be decided inside the same case.', '1) Without break, control falls through into the following cases and overwrites what you just set. 2) default is the branch that runs when no case label matches.', '1) A hidden test sends a choice that is not on the menu - re-read the output format, only one line may be printed in that case. 2) Another hidden test sends a quantity of zero, so make sure the total still prints with 2 decimals.', 'A single line with two whole numbers separated by a space: the menu choice and the quantity.', NULL, NULL, 'CH0053 - Switch-Case : replace a long if-else chain with a switch on a menu number, and learn that a case runs into the next one unless it is closed with break, and that default catches every unlisted choice.', 12, 'For a listed choice print exactly 3 lines: Item with the item name, Rate with the rate to 2 decimals and Total with the amount to 2 decimals. For any unlisted choice print exactly 1 line containing Invalid choice.', 'S4-C3-Q1', 'A canteen terminal prints a bill from a menu choice and a quantity.

The menu is:
1 - Tea, rate 10.00
2 - Coffee, rate 15.00
3 - Sandwich, rate 40.00
4 - Juice, rate 25.00

Read the menu choice and the quantity. For a listed choice print the item name, the rate and the total, where the total is the rate multiplied by the quantity. For any other choice print Invalid choice as the only line of output.

Use a switch statement on the menu choice. Each case must be closed with break, otherwise the cases below it run as well and the bill shows the wrong item.', '1 3//.//5 2', 'Item : Tea
Rate : 10.00
Total: 30.00//.//Invalid choice', 'STG005', '#include <stdio.h>

int main()
{
    int choice, qty;
    double rate = 0;

    scanf("%d %d", &choice, &qty);

    switch (choice)
    {
        // TODO: one case per menu item - print the item name and set the rate
        // TODO: remember to close every case with break
        // TODO: default - print Invalid choice
    }

    // TODO: print the rate and the total for a valid choice only

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Canteen Billing Menu', 'Stage-4/Ch3-Canteen-Billing-Menu'),
  (true, '- amount : real number, 0.00 <= amount <= 1000000000.00, stored in a double because a float cannot hold that many significant digits.
- band   : a single uppercase letter; only G, S and B carry a discount.
- discount : whole number percentage, one of 20, 10, 5 or 0.
- payable = amount - amount * discount / 100, printed with exactly 2 decimals.
- The division by 100 must not be an integer division, or every payable amount equals the bill.
- No if, else or switch keyword may appear in the program.
- The label column is 9 characters wide, followed by '': ''.', 'hard', NULL, '1) A conditional expression has three parts: a test, the value used when the test holds and the value used otherwise. 2) The value it produces can be stored in a variable or handed straight to printf().', '1) Three bands and a fallback means three nested conditional expressions, each one sitting in the ''otherwise'' part of the previous one. 2) A text value can be selected the same way and printed with the string specifier.', '1) A hidden test uses a very large bill - re-read the constraints, the amount needs a double, not a float. 2) Another hidden test checks the payable line: if it equals the bill amount, your percentage calculation was done in whole numbers.', 'A single line with the bill amount (real number) and the membership band (one uppercase letter), separated by a space.', NULL, NULL, 'CH0054 - Ternary Condition : compress the branching of the previous chapters into a single expression, and learn that a conditional expression returns a value, so it can be nested and used directly inside a calculation.', 13, 'Print exactly 3 lines: Category with Gold, Silver, Bronze or None, Discount with the percentage as a whole number, and Payable with the amount after the discount to 2 decimals.', 'S4-C4-Q1', 'A billing counter applies a discount that depends on the membership band of the customer:
G - Gold, 20 percent
S - Silver, 10 percent
B - Bronze, 5 percent
Any other letter is treated as None with no discount.

Read the bill amount and the membership letter, then print the category name, the discount percentage and the payable amount after the discount.

The whole decision must be made with conditional expressions. No if, else or switch statement is allowed anywhere in the program. A conditional expression can be nested inside another, and it can select text as easily as it selects a number.', 'Sample Input 1
10000 G//.//Sample Input 2
8000.50 X', 'Category : Gold
Discount : 20
Payable  : 8000.00//.//Category : None
Discount : 0
Payable  : 8000.50', 'STG005', '#include <stdio.h>

int main()
{
    double amount;
    char band;

    scanf("%lf %c", &amount, &band);

    // TODO: choose the discount with nested conditional expressions
    // TODO: choose the category text the same way
    // TODO: calculate the payable amount and print the three lines

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Membership Discount Tag', 'Stage-4/Ch4-Membership-Discount-Tag'),
  (true, '- marks : whole number; valid only when 0 <= marks <= 100.
- Negative marks and marks above 100 are both rejected with the same message.
- Each band includes its lower boundary: 90 is O, 80 is A, 40 is E and 39 is F.
- The pass boundary is 40 and counts as a pass.
- An invalid mark prints exactly 1 line; a valid mark prints exactly 2 lines.
- The label column is 7 characters wide, followed by '': ''.', 'hard', NULL, '1) The outer if decides whether the data is usable at all; everything else belongs in its else branch. 2) An if-else chain stops at the first condition that holds, so the order of the bands matters.', '1) Writing the bands from the highest downwards removes the need for two comparisons per band. 2) The result line needs only one comparison, not a second chain.', '1) A hidden test sends a mark above 100 and another sends a negative mark - re-read the constraints, both are rejected and neither may print a grade. 2) Another hidden test sits exactly on a band boundary, so check whether your comparison includes it.', 'A single line holding one whole number, the mark scored by the student.', NULL, NULL, 'CH0055 - Nested if-else : combine validation and classification from the whole stage, and learn that an outer decision can guard an inner chain so that impossible data never reaches the classification.', 14, 'For an invalid mark print exactly 1 line containing Invalid marks. For a valid mark print exactly 2 lines: Grade with the grade letter and Result with Pass or Fail.', 'S4-C5-Q1', 'An examination system converts a mark into a grade, but only after checking that the mark itself is possible. A mark outside the valid range must be rejected before any grade is worked out.

Read one mark and print the result as follows:
1. If the mark is below 0 or above 100, print Invalid marks as the only line of output.
2. Otherwise print the grade on the first line and the result on the second line.

The grade bands are: 90 and above O, 80 to 89 A, 70 to 79 B, 60 to 69 C, 50 to 59 D, 40 to 49 E, and below 40 F. The result is Pass for a mark of 40 or more and Fail otherwise.

The validation must be the outer decision and the grade chain must sit inside it, so that a rejected mark never prints a grade.', '85//.//101//.//39', 'Grade  : A
Result : Pass//.//Invalid marks//.//Grade  : F
Result : Fail', 'STG005', '#include <stdio.h>

int main()
{
    int marks;

    scanf("%d", &marks);

    // TODO: reject a mark outside the valid range with a single message
    // TODO: otherwise decide the grade with an if-else chain from the highest band down
    // TODO: then print the pass or fail result

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Grade Classification with Validation', 'Stage-4/Ch5-Grade-Classification-With-Validation'),
  (true, '- n       : whole number, 1 <= n <= 1000, the count of readings.
- reading : whole number, -2000000000 <= reading <= 2000000000, so each one fits in an int.
- total   : the sum of all readings, which can reach 2000000000000 in size, so it must be stored in a long long.
- A reading of exactly zero counts as neither positive nor negative.
- positive + negative + zero always equals n.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) A for loop keeps the start value, the stopping test and the step in one place. 2) The counters and the total must be set to zero before the loop begins, not inside it.', '1) One reading is examined per turn of the loop, so exactly one of the three counters is increased each time. 2) The variable that holds a reading can be reused every turn.', '1) A hidden test uses the largest count with the largest readings - re-read the constraints, the total goes far past the range of an int even though each reading fits, so check the type of your accumulator. 2) Another hidden test mixes positive, negative and zero readings, so make sure zero is not counted as positive.', 'The first line holds n, the number of readings. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0056 - for loop : repeat the reading and the decision work of the previous stages a counted number of times, and learn that a running total over many large values needs a wider type than the values themselves.', 10, 'Print exactly 4 lines: Total with the sum of all readings, Positive with the count of readings above zero, Negative with the count below zero and Zero with the count of readings equal to zero.', 'S5-C1-Q1', 'A monitoring station records a fixed number of readings in one batch. The summary must report the total of the batch and how many readings were positive, negative and zero.

Read the count of readings, then read that many readings and print the four summary lines.

Each reading fits comfortably in an int, but the total does not: a thousand readings of two billion each add up to two trillion. The accumulating variable must therefore be wider than the readings it adds.', '5
12 -4 0 9 -3//.//3
2000000000 2000000000 2000000000', 'Total    : 14
Positive : 2
Negative : 2
Zero     : 1//.//Total    : 6000000000
Positive : 3
Negative : 0
Zero     : 0', 'STG006', '#include <stdio.h>

int main()
{
    int n, reading;
    long long total = 0;
    int positive = 0, negative = 0, zero = 0;

    scanf("%d", &n);

    // TODO: use a for loop to read n readings
    // TODO: add each reading to the total and update the right counter

    // TODO: print Total, Positive, Negative and Zero

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Running Total of Sensor Readings', 'Stage-5/Ch1-Running-Total-Of-Readings'),
  (true, '- value : whole number, -9999999999 <= value <= 9999999999, stored in a long long.
- digits : whole number, 1 <= digits <= 10; zero counts as one digit.
- sum    : the sum of the digits, ignoring the sign, at most 90.
- reverse : the digits in the opposite order, carrying the sign of the original value, stored in a long long.
- Leading zeros disappear in the reverse: the reverse of 1200 is 21.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) The last digit of a number is its remainder after division by ten, and removing that digit is a division by ten. 2) The loop must continue while there is still something left of the number.', '1) The reverse is built by multiplying what you have so far by ten and adding the new digit. 2) Take the sign off the value before the loop and put it back on the reverse afterwards.', '1) A hidden test sends zero - re-read the statement, a while loop tests before it runs, so zero needs its own handling to report one digit. 2) Another hidden test sends a ten digit value, so check that the reverse is not stored in an int.', 'A single line holding one whole number, which may be negative or zero.', NULL, NULL, 'CH0057 - while loop : move from a counted loop to a condition-driven one, and learn that a loop whose test fails at the start never runs at all, which is exactly what goes wrong when the reading is zero.', 11, 'Print exactly 3 lines: Digits with the number of digits, Sum with the sum of the digits and Reverse with the number written backwards, keeping the original sign.', 'S5-C2-Q1', 'A cheque scanner breaks a number into its digits. The report must show how many digits the number has, the sum of those digits and the number written backwards.

Read one whole number and print the three lines.

Rules:
1. A negative number is processed as if the minus sign were not there, but the reversed value keeps the minus sign.
2. Zero has one digit, a digit sum of zero and a reverse of zero. A plain while loop tests its condition before the first turn, so zero would otherwise produce a count of no digits at all.

Numbers reach ten digits, so both the number and its reverse must be stored in a type wider than an int.', '12345//.//-406//.//0', 'Digits  : 5
Sum     : 15
Reverse : 54321//.//Digits  : 3
Sum     : 10
Reverse : -604//.//Digits  : 1
Sum     : 0
Reverse : 0', 'STG006', '#include <stdio.h>

int main()
{
    long long value;

    scanf("%lld", &value);

    // TODO: work on the value without its sign
    // TODO: handle zero separately - a while loop would not run for it
    // TODO: use a while loop to count the digits, add them up and build the reverse
    // TODO: put the sign back on the reverse and print the three lines

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Digit Sum and Reverse', 'Stage-5/Ch2-Digit-Sum-And-Reverse'),
  (true, '- reading : whole number, -1000000 <= reading <= 1000000; a reading of 0 ends the batch.
- The batch always ends with a zero, and holds at most 10000 readings before it.
- count   : the number of readings before the zero; 0 <= count <= 10000.
- total   : the sum of those readings, stored in a long long; it may be negative.
- average : total divided by count, printed with exactly 2 decimals; the division must not be an integer division.
- maximum : the largest reading of the batch, which may itself be negative.
- When count is zero, print only the line No readings; never divide by zero.
- The label column is 8 characters wide, followed by '': ''.', 'hard', NULL, '1) A do-while places its test at the bottom, so the body always runs at least once. 2) The value that stops the loop must not be added to the totals.', '1) The largest reading cannot start at zero, because every reading may be negative - start it from the first reading you actually receive. 2) A counter of readings tells you whether any data arrived at all.', '1) A hidden test sends the marker immediately - re-read the constraints, dividing by a count of zero must never happen. 2) Another hidden test sends only negative readings, so check that your maximum was not initialised to zero.', 'A sequence of whole numbers separated by spaces or newlines. The sequence ends with a zero, which is a marker and not a reading.', NULL, NULL, 'CH0058 - do-while loop : learn the loop that always runs once before it tests, which is exactly what is needed when the value that stops the loop can only be discovered after it has been read.', 12, 'Print exactly 1 line containing No readings when the first value is the zero marker. Otherwise print exactly 4 lines: Count with the number of readings, Total with their sum, Average with the mean to 2 decimals and Maximum with the largest reading.', 'S5-C3-Q1', 'A field device streams readings until the operator sends a zero, which marks the end of the batch. The zero is only a marker: it is not part of the data.

Read values one after another until a zero arrives, then print the summary of the readings received before it.

The stopping value can only be recognised after it has been read, so the reading must happen before the test. A do-while loop runs its body once and then decides whether to run again.

If the very first value is the zero marker, there is no data at all. In that case print the single line No readings.', '5 3 -2 0//.//0', 'Count   : 3
Total   : 6
Average : 2.00
Maximum : 5//.//No readings', 'STG006', '#include <stdio.h>

int main()
{
    long long reading, total = 0, maximum = 0;
    int count = 0;

    // TODO: use a do-while loop that reads first and tests afterwards
    // TODO: stop when the reading is the zero marker, without counting it
    // TODO: track the count, the total and the largest reading

    // TODO: print No readings when nothing arrived, otherwise the four summary lines

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Readings Until the Sentinel', 'Stage-5/Ch3-Readings-Until-The-Sentinel'),
  (true, '- n         : whole number, 1 <= n <= 1000, the number of units in the batch.
- threshold : whole number, -1000 <= threshold <= 100000.
- weight    : whole number, -1000 <= weight <= 100000; a weight may be negative or zero.
- A unit is defective when its weight is strictly below the threshold; a weight equal to the threshold passes.
- inspected : the number of units read before the loop stopped, including the defective one.
- When no unit is defective, inspected equals n.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) break leaves the loop immediately, skipping both the rest of the body and the remaining turns. 2) A flag variable set just before the break tells the code after the loop what happened.', '1) The position is easiest to record while you are still inside the loop. 2) Counting the inspected units inside the loop works whether or not the loop was cut short.', '1) A hidden test puts the defect on the very first unit - re-read the statement, the inspected count then has to be 1, not n. 2) Another hidden test uses a weight exactly equal to the threshold, which must pass, so check whether your comparison is strict.', 'The first line holds n and the threshold, separated by a space. The second line holds n whole numbers, the weight of each unit in inspection order.', NULL, NULL, 'CH0059 - break : learn to leave a counted loop the moment the answer is known, so that a quality check stops at the first failure instead of walking through the rest of the batch.', 13, 'Print Inspected with the number of units examined. Then, if a defective unit was found, print Position with its 1-based position and Weight with its weight. If every unit passed, print the single line All units passed instead.', 'S5-C4-Q1', 'A quality line inspects units one by one and must stop at the first unit whose weight falls below the accepted threshold. Once a defect is found the remaining units are not inspected at all.

Read the number of units and the threshold, then read the weights one by one. Report how many units were inspected, and then either the position and weight of the first defective unit, or a line stating that every unit passed.

Positions are counted from 1. The loop must leave early when the defect is found; inspecting the whole batch and remembering the first failure afterwards does not satisfy the requirement.', '6 50
72 68 55 41 90 60//.//5 10
12 15 10 30 44', 'Inspected : 4
Position  : 4
Weight    : 41//.//Inspected : 5
All units passed', 'STG006', '#include <stdio.h>

int main()
{
    int n, threshold, weight;
    int i, inspected = 0, position = 0, found = 0, bad = 0;

    scanf("%d %d", &n, &threshold);

    // TODO: read the weights in a for loop, counting every unit inspected
    // TODO: when a weight is below the threshold, remember it and leave the loop

    // TODO: print the inspected count, then the defect details or the passed message

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'First Defective Unit', 'Stage-5/Ch4-First-Defective-Unit'),
  (true, '- n       : whole number, 1 <= n <= 1000, the number of boxes.
- weight  : whole number, -100000 <= weight <= 100000.
- A box is accepted only when its weight is strictly greater than zero.
- accepted + skipped always equals n.
- total   : the sum of the accepted weights, stored in a long long.
- average : total divided by accepted, printed with exactly 2 decimals; when no box is accepted, print 0.00 and never divide by zero.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) continue jumps straight to the next turn of the loop, skipping whatever is written below it in the body. 2) The counter of skipped boxes must be increased before the jump, not after.', '1) Zero is not a positive weight, so it belongs with the skipped boxes. 2) The accepted counter is also the divisor for the average, so it decides whether the division is safe.', '1) A hidden test sends a batch where every box is damaged or empty - re-read the constraints, the average must print as 0.00 without a division. 2) Another hidden test mixes positive, negative and zero weights, so check that zero is skipped and not accepted.', 'The first line holds n, the number of boxes. The second line holds n whole numbers, the weight reported for each box.', NULL, NULL, 'CH0060 - continue : learn the opposite of break, where the current turn of the loop is abandoned but the loop itself carries on, so unusable records are skipped without leaving the batch.', 14, 'Print exactly 4 lines: Accepted with the count of usable boxes, Skipped with the count of damaged or empty boxes, Total with the accepted weight and Average with the mean accepted weight to 2 decimals.', 'S5-C5-Q1', 'A loading bay weighs every box in a consignment. A negative weight means the scale reported a damaged box and a weight of zero means the box was empty. Neither kind may be added to the shipment total, but the remaining boxes must still be processed.

Read the number of boxes and then the weight of each box. Print how many boxes were accepted, how many were skipped, the total accepted weight and the average accepted weight to 2 decimals.

Each skipped box must abandon only its own turn of the loop using continue; the loop must not stop early.', '7
40 -3 55 0 65 -12 90//.//4
-1 0 -5 0', 'Accepted : 4
Skipped  : 3
Total    : 250
Average  : 62.50//.//Accepted : 0
Skipped  : 4
Total    : 0
Average  : 0.00', 'STG006', '#include <stdio.h>

int main()
{
    int n, weight, i;
    int accepted = 0, skipped = 0;
    long long total = 0;

    scanf("%d", &n);

    // TODO: read each weight in a for loop
    // TODO: when the weight is not positive, count it as skipped and continue
    // TODO: otherwise count it and add it to the total

    // TODO: print the four summary lines, guarding the average against a zero divisor

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Skipping Damaged Boxes', 'Stage-5/Ch5-Skipping-Damaged-Boxes'),
  (true, '- n : whole number, 1 <= n <= 9.
- Rows and columns are numbered from 1 to n.
- In the triangle, numbers within a row are separated by exactly one space and no row ends with a trailing space.
- In the grid, every value occupies a field of exactly 4 characters, right aligned, and no extra space is added between fields.
- The largest grid value is 81, so no value ever overflows its field.
- The headings TRIANGLE and GRID are printed exactly as written, each on its own line.', 'hard', NULL, '1) The outer loop counts the rows and the inner loop counts the positions within a row. 2) The newline belongs to the outer loop, after the inner loop has finished a row.', '1) To avoid a trailing space, print the separator before every number except the first of the row. 2) A field width written inside the format specifier keeps the grid columns aligned without any manual spaces.', '1) A hidden test uses the largest allowed size - re-read the constraints, the grid values reach 81 and must still sit in a 4 character field. 2) Another hidden test uses the smallest size, where each section is a single row, so check that no extra blank line is printed.', 'A single line holding one whole number n, the size of both layouts.', NULL, NULL, 'CH0061 - nested loops : place one loop inside another, and learn that the inner loop runs completely for every single turn of the outer loop, which is what produces rows and columns.', 15, 'Print the heading TRIANGLE, then n triangle rows, then the heading GRID, then n grid rows. In total 2 + 2 * n lines are printed.', 'S5-C6-Q1', 'A printing utility produces two layouts from one size value.

First the TRIANGLE section: row i contains the numbers 1 to i, separated by single spaces, with no space after the last number of a row.

Then the GRID section: an n by n multiplication table where the value in row i and column j is i multiplied by j. Every value is printed right aligned in a field of 4 characters, so the columns line up whatever the size of the numbers.

Both layouts need an inner loop that runs for every turn of the outer loop. The outer loop moves to the next row and the inner loop fills that row.', '3//.//1', 'TRIANGLE
1
1 2
1 2 3
GRID
   1   2   3
   2   4   6
   3   6   9//.//TRIANGLE
1
GRID
   1', 'STG006', '#include <stdio.h>

int main()
{
    int n, i, j;

    scanf("%d", &n);

    printf("TRIANGLE\n");
    // TODO: outer loop over the rows, inner loop over the numbers of the row
    // TODO: separate numbers with one space and end each row with a newline

    printf("GRID\n");
    // TODO: outer loop over the rows, inner loop over the columns
    // TODO: print each product right aligned in a field of 4 characters

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Triangle and Multiplication Grid', 'Stage-5/Ch6-Triangle-And-Multiplication-Grid'),
  (true, '- n       : whole number, 1 <= n <= 100, the number of readings.
- reading : whole number, -100000 <= reading <= 100000.
- The array must be declared with at least 100 positions, because the size of an array is fixed when the program is written, not when it is run.
- Only the first n positions are read and printed; the rest are left untouched.
- The values are printed on one line separated by exactly one space, with no trailing space.
- The label column is 6 characters wide, followed by '': ''.', 'easy', NULL, '1) An array position is written inside square brackets after the array name. 2) The same loop counter can serve as the position while reading and again while printing.', '1) Reading into a position still needs the address of that position. 2) Printing needs a second loop after the first one has finished, not a print inside the reading loop.', '1) A hidden test uses the largest allowed batch - re-read the constraints and check that your array was declared with enough positions. 2) Another hidden test has a single reading, so make sure no trailing space is printed after the last value.', 'The first line holds n, the number of readings. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0062 - Introduction to Array : replace a pile of separate variables with one named block of storage, and learn that an array is declared with a fixed maximum size while only the first n positions are actually used.', 0, 'Print exactly 2 lines: Count with the number of readings stored, and Values with the readings printed back in the same order, separated by single spaces.', 'S6-C1-Q1', 'Until now every value read from the keyboard needed its own variable, so a batch of a hundred readings would need a hundred names. An array stores many values of the same type under one name and reaches each of them by position.

Read the number of readings and then the readings themselves into a single array. Print how many were stored and then print them back on one line, separated by single spaces.

The array is declared with room for the largest batch allowed by the constraints, and only the first n positions are filled.', '5
12 7 9 4 3//.//1
-40', 'Count : 5
Values: 12 7 9 4 3//.//Count : 1
Values: -40', 'STG007', '#include <stdio.h>

int main()
{
    int values[100];
    int n, i;

    scanf("%d", &n);

    // TODO: read n values into the array using a loop

    // TODO: print the count, then the values on one line separated by single spaces

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Store and Echo the Readings', 'Stage-6/Ch1-Store-And-Echo-The-Readings'),
  (true, '- n     : whole number, 1 <= n <= 100, the number of items.
- item  : whole number, -100000 <= item <= 100000.
- p     : whole number, 1 <= p <= n, a position counted from 1 and guaranteed to be valid.
- The first item is at index 0 and the last item is at index n - 1.
- Reading position p means reading index p - 1; using index p reads the wrong element and, when p equals n, reads past the end of the data.
- The label column is 8 characters wide, followed by '': ''.', 'easy', NULL, '1) The index of the first element is not 1. 2) The last index is one less than the number of elements, which is why a loop stops before n and not at n.', '1) Subtract 1 from the spoken position before using it as an index. 2) The three printed values may all be the same element when the list holds only one item.', '1) A hidden test asks for the last position - re-read the constraints, index n reads past the data while index n - 1 is the last valid element. 2) Another hidden test uses a list of one item, where first, last and element all coincide.', 'The first line holds n. The second line holds n whole numbers separated by spaces. The third line holds the position p, counted from 1.', NULL, NULL, 'CH0063 - Array Indexing and Accessing Element : learn that array positions start at 0, so the position a user speaks of is always one more than the index the program uses.', 1, 'Print exactly 3 lines: First with the item at the start of the list, Last with the item at the end of the list and Element with the item at the requested position.', 'S6-C2-Q1', 'A stock register lists items in order and staff refer to them by their place in the list, counting from 1. Inside the program the same list is stored in an array whose first element sits at index 0.

Read the number of items, the items themselves and then a position as the staff would say it. Print the first item of the list, the last item, and the item at the requested position.

The conversion between the spoken position and the stored index is the whole point of this exercise: the item at position p is stored at index p minus 1, and the last item of a list of n items sits at index n minus 1.', '5
12 7 9 4 3
3//.//1
88
1', 'First   : 12
Last    : 3
Element : 9//.//First   : 88
Last    : 88
Element : 88', 'STG007', '#include <stdio.h>

int main()
{
    int items[100];
    int n, p, i;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &items[i]);
    scanf("%d", &p);

    // TODO: print the first item, the last item and the item at position p

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Element Lookup by Position', 'Stage-6/Ch2-Element-Lookup-By-Position'),
  (true, '- The board array always has exactly 10 positions.
- k       : whole number, 0 <= k <= 10, the number of allotted slots.
- vehicle : whole number, 1 <= vehicle <= 9999, one per allotted slot.
- free    : 10 - k, the number of slots still showing zero.
- The allotted slots fill positions 0 to k - 1; positions k to 9 keep the value 0.
- k may be 0, in which case no vehicle number is read at all and the whole board reads zero.
- The board is printed on one line, ten values separated by single spaces, with no trailing space.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) An initialiser written as a pair of braces with a single zero sets the first position and leaves C to zero the rest. 2) The board is always printed in full, whatever k is.', '1) The reading loop runs k times while the printing loop always runs ten times. 2) An uninitialised array holds unpredictable leftovers, which is why the initialiser matters.', '1) A hidden test allots no slots at all - re-read the constraints, k may be zero and no vehicle line follows, so the reading loop must simply not run. 2) Another hidden test allots every slot, so check that your printing loop still stops at ten.', 'The first line holds k, the number of allotted slots. If k is greater than zero, the second line holds k vehicle numbers separated by spaces.', NULL, NULL, 'CH0064 - Initializing Array : learn that an array given an initialiser has every remaining position set to zero, so a partly filled board needs no extra clearing loop.', 2, 'Print exactly 3 lines: Allotted with k, Free with the number of untouched slots and Board with all ten slot values separated by single spaces.', 'S6-C3-Q1', 'A parking board always shows ten slots. Only the slots that have been allotted carry a vehicle number; the rest must read 0.

Declare an array of exactly ten slots and give it an initialiser so that every position starts at zero. Read how many slots are allotted and then the vehicle number for each of those slots, filling the board from the first position onwards.

Print the number of allotted slots, the number of free slots and then the complete board of ten values.

No loop may be written to set the unused slots to zero: the initialiser has already done it.', '4
1201 3309 45 7788//.//0', 'Allotted: 4
Free    : 6
Board   : 1201 3309 45 7788 0 0 0 0 0 0//.//Allotted: 0
Free    : 10
Board   : 0 0 0 0 0 0 0 0 0 0', 'STG007', '#include <stdio.h>

int main()
{
    int board[10] = {0};
    int k, i;

    scanf("%d", &k);

    // TODO: read k vehicle numbers into the first k positions

    // TODO: print the allotted count, the free count and all ten slots

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Partly Filled Slot Board', 'Stage-6/Ch3-Partly-Filled-Slot-Board'),
  (true, '- n       : whole number, 1 <= n <= 100, the number of readings.
- reading : whole number, -100000 <= reading <= 100000.
- total   : the sum of the readings, stored in a long long.
- average : total divided by n as a real number, printed with exactly 2 decimals; the division must not be an integer division.
- The comparison against the average is strict, so a reading exactly equal to the average is counted separately.
- above + below + equal always equals n.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) The average cannot be worked out inside the reading loop, because the last reading has not arrived yet. 2) A second loop over the same array costs nothing but a few lines.', '1) Comparing a whole number with a real average needs the comparison itself to be done in real numbers. 2) Three counters and one pass are enough for the second walk.', '1) A hidden test uses readings that are all identical - re-read the constraints, every one of them is then exactly equal to the average. 2) Another hidden test mixes negative and zero readings, so check that your average was not calculated with integer division.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0065 - Combining Loops with Array : learn that stored data can be walked more than once, which is what makes a comparison against the average possible at all.', 3, 'Print exactly 5 lines: Total with the sum, Average with the mean to 2 decimals, Above with the count strictly above the average, Below with the count strictly below it and Equal with the count exactly on it.', 'S6-C4-Q1', 'A quality report must state how many readings in a batch are above the batch average. The average is not known until every reading has been seen, so the readings have to be kept and examined a second time.

Read the batch, then:
1. In the first pass, add up all the readings.
2. Calculate the average as a real number.
3. In the second pass, count how many readings are strictly above the average, how many are strictly below it and how many are exactly equal to it.

This is why the values are stored in an array: a program that only kept a running total could never go back and compare.', '5
10 20 30 40 50//.//4
7 7 7 7', 'Total   : 150
Average : 30.00
Above   : 2
Below   : 2
Equal   : 1//.//Total   : 28
Average : 7.00
Above   : 0
Below   : 0
Equal   : 4', 'STG007', '#include <stdio.h>

int main()
{
    int values[100];
    int n, i;
    long long total = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &values[i]);

    // TODO: first pass - add up every reading
    // TODO: calculate the average as a real number
    // TODO: second pass - count above, below and equal
    // TODO: print the five lines

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Two Pass Batch Statistics', 'Stage-6/Ch4-Two-Pass-Batch-Statistics');

insert into practice_bank ("active", "constraints", "difficulty", "experiment_number", "hint_1", "hint_2", "hint_3", "input_format", "marks", "memory_limit_mb", "objective", "order", "output_format", "practice_id", "problem_statement", "sample_input", "sample_output", "stage_id", "starter_code", "success_message", "technique_after_success", "time_limit_seconds", "title", "workspace_folder") values
  (true, '- n     : whole number, 1 <= n <= 100, the number of elements.
- value : whole number, -100000 <= value <= 100000.
- q     : whole number, 1 <= q <= 20, the number of queries.
- index : whole number, -1000 <= index <= 1000; it may be negative and it may be far beyond the end of the list.
- A valid index satisfies 0 <= index <= n - 1. Index n is one past the end and is invalid.
- A negative index is invalid and must never be used to reach into the array.
- One line of output is printed per query, in the order the queries arrive.', 'hard', NULL, '1) The valid range of an index has both a lower end and an upper end, and both have to be tested. 2) The test must happen before the array is touched, because an invalid access cannot be undone.', '1) The largest valid index is one less than the number of elements. 2) A negative index is just as dangerous as one that is too large, even though it looks harmless.', '1) A hidden test queries index n itself - re-read the constraints, that position is one past the end and must be rejected. 2) Another hidden test uses a negative index, so make sure your condition checks the lower end as well.', 'The first line holds n. The second line holds n whole numbers. The third line holds q, the number of queries. Each of the next q lines holds one index counted from 0.', NULL, NULL, 'CH0066 - Out-of-Bounds Errors & Safety : learn that C never checks an array index for you, so a program that reads position 10 of a 10 element array simply reads whatever memory lies there, and the only defence is to check the index first.', 4, 'Print exactly q lines, one per query, each holding either the element found at that index or the words Out of bounds.', 'S6-C5-Q1', 'A lookup service answers index queries against a stored list. Some queries name a position that does not exist, and those must be rejected rather than answered with whatever happens to be in memory.

Read the list, then read a number of queries. Each query is an index counted from 0. For every query print the element at that index, or the words Out of bounds when the index does not exist.

C performs no checking of its own. Reading index n of an n element array does not stop the program and does not report an error; it simply produces an unpredictable value. The check has to be written before the access is made, and never after it.', '5
12 7 9 4 3
3
0
4
5//.//3
1 2 3
2
-1
2', '12
3
Out of bounds//.//Out of bounds
3', 'STG007', '#include <stdio.h>

int main()
{
    int list[100];
    int n, q, i, index;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);
    scanf("%d", &q);

    // TODO: for each query, read the index
    // TODO: print the element only when the index is inside the valid range
    // TODO: otherwise print Out of bounds

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Safe Index Queries', 'Stage-6/Ch5-Safe-Index-Queries'),
  (true, '- n       : whole number, 1 <= n <= 100, the number of readings.
- reading : whole number, -100000 <= reading <= 100000; readings may be negative or zero.
- total   : the sum of the readings, stored in a long long.
- average : total divided by n, printed with exactly 2 decimals.
- range   : largest minus smallest, which is never negative.
- The smallest and the largest must be seeded from the first reading, not from 0.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) One walk through the array is enough for all five measures. 2) The average is the only measure that needs a real number division.', '1) Compare each reading with the current smallest and with the current largest, replacing them when needed. 2) The range needs no separate walk once both ends are known.', '1) A hidden test uses a batch where every reading is negative - re-read the statement, a largest tracker seeded with 0 would wrongly report 0. 2) Another hidden test uses a single reading, where the smallest, the largest and the average all coincide and the range is 0.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0067 - Basic Array Operations - Math & Metric : learn to derive the standard measures of a data set in a single walk, and learn why the smallest and largest must be seeded from the data itself rather than from zero.', 5, 'Print exactly 5 lines: Smallest, Largest, Total, Average with 2 decimals and Range.', 'S6-C6-Q1', 'A laboratory batch must be summarised by five measures: the smallest reading, the largest reading, the total, the average and the range, where the range is the largest reading minus the smallest.

Read the batch and print the five measures.

Readings may be negative. A smallest tracker that starts at zero would never drop below it, and a largest tracker that starts at zero would report zero for a batch of negatives. Both trackers must therefore begin from the first reading of the batch.', '6
34 -12 90 0 45 -77//.//1
-5', 'Smallest : -77
Largest  : 90
Total    : 80
Average  : 13.33
Range    : 167//.//Smallest : -5
Largest  : -5
Total    : -5
Average  : -5.00
Range    : 0', 'STG007', '#include <stdio.h>

int main()
{
    int values[100];
    int n, i;
    long long total = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &values[i]);

    // TODO: seed the smallest and the largest from the first reading
    // TODO: walk the array once, updating the trackers and the total
    // TODO: print the five measures

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Batch Metrics Report', 'Stage-6/Ch6-Batch-Metrics-Report'),
  (true, '- n       : whole number, 1 <= n <= 100, the size of the batch.
- reading : whole number, -100000 <= reading <= 100000; the batch may contain duplicates.
- key     : whole number, -100000 <= key <= 100000, the reading being looked for.
- Positions are counted from 1, so the first element is at position 1 and not 0.
- When the key does not appear, Found is No, First is 0 and Count is 0.
- The search must not stop at the first match, because the count needs the whole batch.
- The label column is 6 characters wide, followed by '': ''.', 'medium', NULL, '1) One walk can answer both questions if the first position is recorded only once. 2) A position of 0 is impossible for a real match, which makes it a safe marker for not found.', '1) Record the first position only while it still holds its starting marker. 2) The count is increased on every match, including the first one.', '1) A hidden test searches for a value that appears several times - re-read the statement, First must stay on the earliest match while Count keeps rising. 2) Another hidden test searches for a value that is absent, so check the values you print in that case.', 'The first line holds n. The second line holds n whole numbers. The third line holds the key to search for.', NULL, NULL, 'CH0068 - Searching in an Array : learn to walk an array looking for a value, and learn the difference between the first position where it appears and the number of times it appears.', 6, 'Print exactly 3 lines: Found with Yes or No, First with the 1-based position of the first match or 0, and Count with the number of matches.', 'S6-C7-Q1', 'An inspector needs to know whether a particular reading appears in a batch, where it first appears and how often it appears in total.

Read the batch and the reading to look for, then print:
1. Found as Yes or No.
2. First as the position of the first match, counted from 1, or 0 when there is no match.
3. Count as the number of matches in the whole batch.

The first position must not change when a later match is found, but the count must keep growing, so the two answers are collected differently even though one walk is enough for both.', '7
4 9 4 2 4 7 1
4//.//5
3 6 9 12 15
7', 'Found : Yes
First : 1
Count : 3//.//Found : No
First : 0
Count : 0', 'STG007', '#include <stdio.h>

int main()
{
    int values[100];
    int n, i, key;
    int first = 0, count = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &values[i]);
    scanf("%d", &key);

    // TODO: walk the whole batch, counting matches
    // TODO: record the first matching position only once
    // TODO: print Found, First and Count

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Locate a Reading in the Batch', 'Stage-6/Ch7-Locate-A-Reading-In-The-Batch'),
  (true, '- r     : whole number, 1 <= r <= 10, the number of rows.
- c     : whole number, 1 <= c <= 10, the number of columns.
- value : whole number, -99999 <= value <= 99999.
- The array must be declared with at least 10 rows and 10 columns.
- Values are read in row order, which means the column index changes fastest.
- Every value is printed in a field of exactly 6 characters, right aligned, with no extra spaces between fields and no trailing space at the end of a row.
- The widest possible value, a negative five digit number, fits exactly inside the field.', 'medium', NULL, '1) A two-dimensional array is declared with two sizes and addressed with two indices. 2) The row index belongs to the outer loop and the column index to the inner one.', '1) The newline is printed by the outer loop, once the inner loop has finished a row. 2) A field width inside the format specifier aligns the columns without any manual spaces.', '1) A hidden test uses the widest allowed values - re-read the constraints, a negative five digit number needs all six characters of the field. 2) Another hidden test uses a single row or a single column, so check that your loops still work when one of the sizes is 1.', 'The first line holds r and c separated by a space. The next r lines each hold c whole numbers separated by spaces.', NULL, NULL, 'CH0069 - Introduction to Multi-Dimensional Arrays : learn that a two-dimensional array is addressed by a row and a column, and that filling it needs one loop inside another.', 7, 'Print exactly r lines, each holding the c values of that row, every value right aligned in a field of 6 characters.', 'S6-C8-Q1', 'A report tool stores a table of numbers with a given number of rows and columns and echoes it back in aligned columns.

Read the number of rows and columns, then read the values row by row into a two-dimensional array. Print the table back with every value right aligned in a field of 6 characters, so that the columns line up whatever the size of the numbers.

The values arrive in row order: the whole first row, then the whole second row, and so on. The outer loop must therefore walk the rows and the inner loop the columns.', '2 3
1 2 3
4 5 6//.//1 4
-99999 7 0 12345', '     1     2     3
     4     5     6//.//-99999     7     0 12345', 'STG007', '#include <stdio.h>

int main()
{
    int table[10][10];
    int r, c, i, j;

    scanf("%d %d", &r, &c);

    // TODO: read the values row by row with two nested loops

    // TODO: print the table with every value right aligned in 6 characters

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Matrix Echo with Aligned Columns', 'Stage-6/Ch8-Matrix-Echo-With-Aligned-Columns'),
  (true, '- r     : whole number, 1 <= r <= 10, the number of rows.
- c     : whole number, 1 <= c <= 10, the number of columns.
- value : whole number, -100000 <= value <= 100000.
- Row and column numbers are printed counting from 1.
- Every total is stored in a long long, because a full sheet can reach ten million in size.
- The grand total equals the sum of the row totals and also the sum of the column totals.
- Row lines are labelled Row i and column lines Col j, each followed by '' : ''.', 'hard', NULL, '1) The row totals need the column index to move while the row index stays still. 2) The column totals need exactly the opposite, so the two loops swap places.', '1) Each total must be reset to zero before its own walk begins, not once for the whole program. 2) The grand total can be accumulated during either walk, but not during both.', '1) A hidden test uses a sheet full of large values - re-read the constraints, the totals need a long long. 2) Another hidden test mixes negative and positive values, so check that your row totals and column totals still add up to the same grand total.', 'The first line holds r and c separated by a space. The next r lines each hold c whole numbers separated by spaces.', NULL, NULL, 'CH0070 - Working with 2D Array : learn to walk a table in two different directions, keeping the row index still while the column index moves and then the other way round.', 8, 'Print r lines of the form ''Row i : total'', then c lines of the form ''Col j : total'', then one line ''Grand : total''. In total r + c + 1 lines are printed.', 'S6-C9-Q1', 'A sales sheet holds one row per branch and one column per month. The summary needs the total of every branch, the total of every month and the grand total of the sheet.

Read the sheet, then print:
1. One line per row with the total of that row.
2. One line per column with the total of that column.
3. The grand total of the whole sheet.

A row total is produced by holding the row still and moving along the columns. A column total is produced by holding the column still and moving down the rows, which means the loops are nested the other way round. The grand total must come out the same whichever way it is added.', '2 3
1 2 3
4 5 6//.//1 1
-7', 'Row 1 : 6
Row 2 : 15
Col 1 : 5
Col 2 : 7
Col 3 : 9
Grand : 21//.//Row 1 : -7
Col 1 : -7
Grand : -7', 'STG007', '#include <stdio.h>

int main()
{
    long long sheet[10][10];
    int r, c, i, j;

    scanf("%d %d", &r, &c);
    for (i = 0; i < r; i++)
        for (j = 0; j < c; j++)
            scanf("%lld", &sheet[i][j]);

    // TODO: print one total per row, moving along the columns
    // TODO: print one total per column, moving down the rows
    // TODO: print the grand total

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Row and Column Totals', 'Stage-6/Ch9-Row-And-Column-Totals'),
  (true, '- word   : a single word of 1 to 50 characters with no spaces, so the array must hold at least 51 positions to leave room for the end marker.
- length : the number of real characters, not counting the end marker.
- The first character sits at index 0 and the last at index length - 1.
- The reverse is printed as a single line with no spaces between the characters.
- No string library function may be used; the length is found by walking the array.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) The walk stops when the character at the current position is the end marker, which is written as a character constant with the value zero. 2) The counter used for the walk is the length once the walk ends.', '1) The last real character is one position before the end marker. 2) Printing backwards means a loop that starts at the last index and steps down to zero.', '1) A hidden test uses a word of the full allowed length - re-read the constraints and count the positions your array reserves, including the end marker. 2) Another hidden test uses a single character word, where the first and the last character are the same one.', 'A single line holding one word of up to 50 characters, with no spaces.', NULL, NULL, 'CH0071 - Character Array (Introduction to Strings) : learn that text is stored as an array of characters closed by an invisible end marker, and that the length has to be discovered by walking until that marker is reached.', 9, 'Print exactly 4 lines: Length with the number of characters, First with the opening character, Last with the closing character and Reverse with the word written backwards.', 'S6-C10-Q1', 'A tag reader stores a single word in a character array and reports four things about it: how long it is, its first character, its last character and the word written backwards.

The end of stored text is marked by a special character whose value is zero. It is placed there automatically when the word is read, and it is not part of the word itself.

Read one word and print the four lines. The length must be found by walking the array until the end marker is reached; it may not be obtained from any library function.', 'kumar//.//a', 'Length  : 5
First   : k
Last    : r
Reverse : ramuk//.//Length  : 1
First   : a
Last    : a
Reverse : a', 'STG007', '#include <stdio.h>

int main()
{
    char word[51];
    int length = 0, i;

    scanf("%s", word);

    // TODO: walk the array until the end marker to find the length
    // TODO: print the length, the first character and the last character
    // TODO: print the word backwards on one line

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Character Array Scan', 'Stage-6/Ch10-Character-Array-Scan'),
  (true, '- n       : whole number, 1 <= n <= 100, the size of the batch.
- reading : whole number, -100000 <= reading <= 100000.
- The sum is returned as a long long; the largest and the smallest are returned as int.
- Every function takes the array and the size as two separate parameters.
- The size must not be recalculated inside a function; it is only correct where the array was declared.
- average : the sum divided by n, printed with exactly 2 decimals.
- The label column is 9 characters wide, followed by '': ''.', 'hard', NULL, '1) An array parameter is written with empty square brackets after the parameter name. 2) Every one of the three functions needs the size as a second parameter.', '1) The largest and the smallest must be seeded from the first element inside the function, because the batch may be entirely negative. 2) A function that returns a wide total must declare that wide return type.', '1) A hidden test uses a batch of negative readings - re-read the statement, a tracker seeded with 0 inside the function would return the wrong answer. 2) Another hidden test uses the largest allowed batch with large values, so check the return type of your sum function.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0072 - Arrays and Functions : learn that an array handed to a function is not copied, so the function works on the original data and cannot discover how many elements it received unless the size is passed alongside it.', 10, 'Print exactly 4 lines: Sum with the total, Largest with the biggest reading, Smallest with the lowest reading and Average with the mean to 2 decimals.', 'S6-C11-Q1', 'The batch statistics written earlier must be reorganised so that each measure is produced by its own function.

Write three functions, each taking the array and its size:
1. One that returns the sum of the elements.
2. One that returns the largest element.
3. One that returns the smallest element.

main reads the batch, calls the three functions and prints the sum, the largest, the smallest and the average.

An array is not copied when it is passed. The function receives only the starting address, which is why the number of elements has to be passed as a second argument; the function has no way of working it out for itself.', '6
34 -12 90 0 45 -77//.//1
7', 'Sum      : 80
Largest  : 90
Smallest : -77
Average  : 13.33//.//Sum      : 7
Largest  : 7
Smallest : 7
Average  : 7.00', 'STG007', '#include <stdio.h>

// TODO: write a function that returns the sum of the first n elements
// TODO: write a function that returns the largest of the first n elements
// TODO: write a function that returns the smallest of the first n elements

int main()
{
    int values[100];
    int n, i;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &values[i]);

    // TODO: call the three functions and print Sum, Largest, Smallest and Average

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Array Statistics Through Functions', 'Stage-6/Ch11-Array-Statistics-Through-Functions'),
  (true, '- name : a character array initialised from Rajalakshmi with no size written in the brackets, so its size becomes 12: eleven characters plus the end marker.
- code : a character array of exactly 20 positions initialised from REC, so its size stays 20 however short the text is.
- The length is the number of real characters, found by walking the array until the end marker.
- The reserved size must be measured with the sizeof operator, not typed by hand.
- No string library function may be used in this problem.
- The label column is 12 characters wide, followed by '': ''.', 'easy', NULL, '1) An array initialised from text without a size in the brackets is sized by the compiler to fit the text plus one more position. 2) The end marker is a character whose value is zero.', '1) sizeof reports the reserved storage, which has nothing to do with how much of it is used. 2) The length has to be counted by walking the array until the marker is reached.', '1) A hidden test checks the reserved size of the name - re-read the constraints, eleven letters need twelve positions. 2) Another hidden test checks the code: its length and its reserved size are very different numbers.', 'This program does not read any input. Both strings are fixed inside the program.', NULL, NULL, 'CH0073 - String Basics & Declaration : learn that a string is a character array closed by an end marker, so the storage reserved for it is always larger than the text it holds.', 0, 'Print exactly 7 lines: the heading STRING CARD, then the name with its length and reserved size, then the code with its length and reserved size.', 'S7-C1-Q1', 'A label printer keeps two pieces of fixed text: an institution name whose array is sized automatically from the text, and a short code stored in an array of a fixed larger size.

Declare the institution name as a character array initialised from the text Rajalakshmi, letting the compiler decide the size. Declare the code as a character array of exactly 20 positions initialised from the text REC.

For each of the two, print the text, the number of real characters it holds and the number of positions the array reserves.

The reserved size is never the same as the number of characters: the end marker always needs a position of its own, and a fixed-size array keeps its unused positions as well.', NULL, 'STRING CARD
Name        : Rajalakshmi
Length      : 11
Array size  : 12
Code        : REC
Code length : 3
Code size   : 20', 'STG008', '#include <stdio.h>

int main()
{
    char name[] = "Rajalakshmi";
    char code[20] = "REC";
    int nameLength = 0, codeLength = 0;

    // TODO: walk each array until the end marker to find its length
    // TODO: print the heading, then each text with its length and reserved size

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'String Declaration Card', 'Stage-7/Ch1-String-Declaration-Card'),
  (true, '- tag     : a single word of 1 to 20 characters with no spaces; the array holds at least 21 positions.
- address : a line of 1 to 80 characters that may contain spaces; the array holds at least 81 positions.
- The address is printed exactly as entered, with no leading or trailing spaces added or removed.
- The newline left in the buffer after the tag must be skipped before the address is read.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) A blank space at the start of a scanf format string skips whatever whitespace is still waiting, including a newline. 2) An array name is already an address, so no ampersand is needed for either string.', '1) There is a reading form that accepts every character except the newline. 2) The length of the address is found by walking it until the end marker.', '1) A hidden test uses an address of several words - re-read the input format, if only the first word appears then the wrong reading form was used. 2) Another hidden test uses an address close to the full allowed length, so check the size of your array.', 'Two lines. The first line holds the customer tag as a single word. The second line holds the full address, which may contain spaces.', NULL, NULL, 'CH0074 - String Input & Output : learn that the plain word specifier stops at the first space, so an address or a full name needs a reading form that accepts everything up to the end of the line.', 1, 'Print exactly 3 lines: Tag with the customer tag, Address with the complete address line and Length with the number of characters in the address.', 'S7-C2-Q1', 'A delivery form collects a customer tag, which is always a single word, and then a full address line, which usually contains spaces.

Read the tag and the address line, then print them back in a labelled block.

Reading text with the plain word specifier stops at the first space, so it can hold the tag but would chop the address down to its first word. Reading the address needs the form that accepts every character up to the end of the line, and the leftover newline from the previous entry must be skipped before it starts.', 'arun
12 Anna Salai Chennai 600002//.//rec
Thandalam', 'Tag     : arun
Address : 12 Anna Salai Chennai 600002
Length  : 28//.//Tag     : rec
Address : Thandalam
Length  : 9', 'STG008', '#include <stdio.h>

int main()
{
    char tag[21];
    char address[81];
    int length = 0;

    scanf("%s", tag);
    // TODO: skip the leftover newline and read the whole address line

    // TODO: walk the address to find its length
    // TODO: print Tag, Address and Length

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Word and Full Line Entry', 'Stage-7/Ch2-Word-And-Full-Line-Entry'),
  (true, '- line : 1 to 100 characters which may contain letters, digits, spaces and punctuation, so the array holds at least 101 positions.
- Both uppercase and lowercase letters are classified the same way.
- vowels + consonants + digits + spaces + others always equals the total number of characters.
- The end marker is not a character of the line and must not be counted.
- No library function for character classification may be used.
- The label column is 11 characters wide, followed by '': ''.', 'medium', NULL, '1) The walk ends at the end marker, so the loop condition tests the character at the current position. 2) A character can be compared against two bounds to decide whether it is a letter or a digit.', '1) Check for a vowel first, then fall back to the consonant test, otherwise every vowel would be counted twice. 2) The two letter ranges, uppercase and lowercase, have to be handled separately.', '1) A hidden test uses a line with punctuation - re-read the statement, anything that is not a letter, a digit or a space belongs to Others. 2) Another hidden test checks that the five counts add up to the total, so make sure no character is counted twice.', 'A single line of up to 100 characters, which may contain spaces and punctuation.', NULL, NULL, 'CH0075 - Accessing & Traversing Strings : learn to walk text one character at a time and classify each character by comparing it against the ranges of the character set.', 2, 'Print exactly 6 lines: Vowels, Consonants, Digits, Spaces, Others and Total, each with its count.', 'S7-C3-Q1', 'A text analyser must report the make-up of a line: how many vowels, consonants, digits, spaces and other characters it contains.

Read one line and print the five counts followed by the total number of characters.

A letter is a vowel when it is one of a, e, i, o or u in either case; any other letter is a consonant. A digit is a character between 0 and 9. Everything that is not a letter, a digit or a space counts as other. No character classification library may be used; the comparisons must be written out.', 'Hello World 2026!//.//aeiou', 'Vowels     : 3
Consonants : 7
Digits     : 4
Spaces     : 2
Others     : 1
Total      : 17//.//Vowels     : 5
Consonants : 0
Digits     : 0
Spaces     : 0
Others     : 0
Total      : 5', 'STG008', '#include <stdio.h>

int main()
{
    char line[101];
    int i = 0;
    int vowels = 0, consonants = 0, digits = 0, spaces = 0, others = 0;

    scanf(" %[^\n]", line);

    // TODO: walk the line until the end marker
    // TODO: classify each character into exactly one of the five groups
    // TODO: print the five counts and the total

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Character Class Counter', 'Stage-7/Ch3-Character-Class-Counter'),
  (true, '- word   : a single word of 1 to 50 characters with no spaces; the array holds at least 51 positions.
- length : the number of real characters, not counting the end marker.
- The palindrome test is case sensitive and compares position i with position length - 1 - i.
- Only the first half of the word needs to be tested; comparing the whole word simply repeats every comparison.
- A word of one character is always a palindrome.
- No string library function may be used.
- The label column is 8 characters wide, followed by '': ''.', 'medium', NULL, '1) The reverse is printed by a loop that starts at the last index and steps down to zero. 2) The last index is one less than the length.', '1) A single mismatch is enough to decide that the word is not a palindrome, so a flag variable records the verdict. 2) The two positions being compared move towards each other.', '1) A hidden test uses a word with a capital first letter - re-read the constraints, the test is case sensitive. 2) Another hidden test uses a single character word, which must still be reported as a palindrome.', 'A single line holding one word of up to 50 characters, with no spaces.', NULL, NULL, 'CH0076 - String Length & Basic Operations : learn to build the standard string operations by hand, so that the library versions met in the next chapter are understood rather than merely used.', 3, 'Print exactly 3 lines: Length with the number of characters, Reverse with the word written backwards and Result with either Palindrome or Not palindrome.', 'S7-C4-Q1', 'A verification tool reports the length of a word, the word written backwards, and whether the word reads the same in both directions.

Read one word and print the three lines. The comparison is case sensitive, so Madam is not a palindrome while madam is.

All three answers must be produced without any string library function. The length is found by walking to the end marker, the reverse by walking backwards, and the palindrome test by comparing the character at each position with the character the same distance from the other end.', 'madam//.//Madam', 'Length  : 5
Reverse : madam
Result  : Palindrome//.//Length  : 5
Reverse : madaM
Result  : Not palindrome', 'STG008', '#include <stdio.h>

int main()
{
    char word[51];
    int length = 0, i, isPalindrome = 1;

    scanf("%s", word);

    // TODO: find the length by walking to the end marker
    // TODO: print the length, then the word backwards
    // TODO: compare position i with position length - 1 - i to decide the verdict

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Length, Reverse and Palindrome', 'Stage-7/Ch4-Length-Reverse-And-Palindrome'),
  (true, '- first, second : single words of 1 to 40 characters with no spaces; each array holds at least 41 positions.
- The joining array must hold at least 81 positions so that both words and the end marker fit.
- The copy must be made into its own array; assigning one array to another is not allowed in C.
- The originals must be unchanged after the joining.
- The comparison is case sensitive, and every uppercase letter comes before every lowercase one.
- The string library header must be included.
- The label column is 9 characters wide, followed by '': ''.', 'hard', NULL, '1) The library offers one function for the length, one for copying and one for joining. 2) The joining function appends to the end of the first argument, so copy the first word into the working array before joining.', '1) The comparison function returns a sign, so test whether it is zero, less than zero or greater than zero. 2) Two character arrays can never be compared with the equality operator.', '1) A hidden test uses two identical words - re-read the statement, the comparison returns zero in that case and not 1. 2) Another hidden test uses words differing only in case, so check which of them the library considers earlier.', 'Two lines, each holding one word of up to 40 characters with no spaces.', NULL, NULL, 'CH0077 - String Library Functions : replace the hand-written operations of the previous chapter with the standard library, and learn that two strings are never compared with the equality operator but with the comparison function, whose result is a sign and not a verdict.', 4, 'Print exactly 5 lines: Length 1, Length 2, Copy with the copy of the first word, Joined with the two words joined together and Verdict with Equal, First or Second.', 'S7-C5-Q1', 'A records tool must merge and compare two stored words using the standard string library.

Read two words and print:
1. The length of each word.
2. A copy of the first word made into a separate array.
3. The two words joined together, first followed by second, without changing either original.
4. The verdict of comparing the two words: Equal when they are identical, First when the first word comes earlier in dictionary order, and Second when the second word comes earlier.

The comparison function returns a negative number, zero or a positive number. It does not return 1 for equal, so the result must be examined as a sign. Comparing two arrays with the equality operator compares their addresses instead of their contents and is always wrong.', 'kumar
raj//.//rec
rec', 'Length 1 : 5
Length 2 : 3
Copy     : kumar
Joined   : kumarraj
Verdict  : First//.//Length 1 : 3
Length 2 : 3
Copy     : rec
Joined   : recrec
Verdict  : Equal', 'STG008', '#include <stdio.h>
#include <string.h>

int main()
{
    char first[41], second[41], copy[41], joined[81];

    scanf("%s", first);
    scanf("%s", second);

    // TODO: print the length of each word
    // TODO: copy the first word into its own array and print it
    // TODO: build the joined word without changing the originals
    // TODO: compare the two words and print the verdict

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'String Library Operations', 'Stage-7/Ch5-String-Library-Operations'),
  (true, '- line    : 1 to 100 characters which may contain letters, digits, spaces and punctuation; the array holds at least 101 positions.
- cleaned : holds only the kept characters and its own end marker, so it also needs 101 positions.
- Every uppercase letter is turned into its lowercase form; digits are kept unchanged.
- Spaces and punctuation are dropped entirely and are not part of the length.
- The cleaned text must be closed with an end marker before it is printed.
- An empty cleaned text counts as a palindrome.
- The label column is 8 characters wide, followed by '': ''.', 'hard', NULL, '1) Build the cleaned text in a second array with its own position counter, which advances only when a character is kept. 2) The end marker has to be written by hand at the end of the cleaned text, because nothing does it for you.', '1) The gap between an uppercase letter and its lowercase form is the same for every letter. 2) The palindrome test runs on the cleaned text, never on the original line.', '1) A hidden test uses a sentence with punctuation and mixed case - re-read the statement, both are removed before the comparison. 2) Another hidden test uses a line with no letters or digits at all, so check that your cleaned text is still properly closed.', 'A single line of up to 100 characters, which may contain spaces and punctuation.', NULL, NULL, 'CH0078 - Basic String Programs : combine reading a full line, walking it, filtering it and comparing it, which is the shape of almost every practical string program.', 5, 'Print exactly 3 lines: Cleaned with the filtered lowercase text, Length with its number of characters and Result with either Palindrome or Not palindrome.', 'S7-C6-Q1', 'A puzzle checker decides whether a whole sentence reads the same in both directions once spaces and punctuation are ignored and case differences are removed.

Read one line and:
1. Build a cleaned version that keeps only letters and digits, with every letter in lowercase.
2. Print the cleaned version and its length.
3. Print Palindrome when the cleaned version reads the same backwards, otherwise Not palindrome.

If the cleaned version has no characters at all, print an empty value for it, a length of 0 and the verdict Palindrome, since nothing reads the same in both directions.

The conversion to lowercase must be written out by adding the difference between the two letter ranges; no character classification library may be used.', 'No lemon, no melon//.//Hello World', 'Cleaned : nolemonnomelon
Length  : 14
Result  : Palindrome//.//Cleaned : helloworld
Length  : 10
Result  : Not palindrome', 'STG008', '#include <stdio.h>

int main()
{
    char line[101], cleaned[101];
    int i = 0, k = 0, isPalindrome = 1;

    scanf(" %[^\n]", line);

    // TODO: walk the line, keeping only letters and digits
    // TODO: turn every uppercase letter into lowercase as you keep it
    // TODO: close the cleaned text with the end marker
    // TODO: test the cleaned text and print the three lines

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Sentence Palindrome Check', 'Stage-7/Ch6-Sentence-Palindrome-Check'),
  (true, '- n    : whole number, 1 <= n <= 100, the size of the list.
- code : whole number, -100000 <= code <= 100000; the list may contain duplicates.
- key  : whole number, -100000 <= key <= 100000, the code being looked for.
- The search stops at the first match, so a later duplicate is never examined.
- checked : 1 <= checked <= n; it equals n exactly when the key is absent or sits last.
- The label column is 8 characters wide, followed by '': ''.', 'easy', NULL, '1) A loop that has found its answer has no reason to continue, and break leaves it immediately. 2) The count of examined entries is increased before the comparison, not after.', '1) A flag variable records whether the match happened, because the loop may end for two different reasons. 2) When nothing matches, the count naturally reaches the size of the list.', '1) A hidden test puts the key at the very first position - re-read the statement, the checked count must then be 1 and not n. 2) Another hidden test uses a key that is absent, so check that every entry was counted in that case.', 'The first line holds n. The second line holds n whole numbers. The third line holds the key to look for.', NULL, NULL, 'CH0079 - Searching Basics : learn that searching means comparing until the answer is known, and that a search which stops at the first match does less work than one that always walks the whole list.', 0, 'Print exactly 2 lines: Found with Yes or No, and Checked with the number of entries examined before the answer was known.', 'S8-C1-Q1', 'A store terminal only needs to know whether a product code appears in a delivery list. Once the code is found there is no reason to look at the remaining entries.

Read the delivery list and the code to look for. Print whether it was found and how many entries had to be examined before the answer was known.

When the code is present, the examined count is the number of entries inspected up to and including the match. When it is absent, every entry has to be inspected, so the count equals the size of the list.', '6
45 12 77 8 90 3
8//.//5
1 2 3 4 5
9', 'Found   : Yes
Checked : 4//.//Found   : No
Checked : 5', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, key, checked = 0, found = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);
    scanf("%d", &key);

    // TODO: examine entries one by one, counting each examination
    // TODO: stop as soon as the key is found
    // TODO: print Found and Checked

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Presence Check with Early Exit', 'Stage-8/Ch1-Presence-Check-With-Early-Exit'),
  (true, '- n    : whole number, 1 <= n <= 100, the size of the register.
- roll : whole number, -100000 <= roll <= 100000; the register is not sorted and may hold duplicates.
- key  : whole number, -100000 <= key <= 100000.
- Positions are counted from 1; the first entry is position 1.
- When the key appears more than once, the earliest position is reported.
- When the key is absent, the position printed is exactly -1.
- The label column is 8 characters wide, followed by '': ''.', 'easy', NULL, '1) The index used by the loop and the position reported to the user differ by exactly one. 2) Start the position variable at the not-found marker so that a miss needs no extra handling.', '1) The loop can stop at the first match, because later duplicates do not change the answer. 2) The status line and the position line are decided by the same single result.', '1) A hidden test uses a key that appears twice - re-read the constraints, only the earliest position is reported. 2) Another hidden test uses an absent key, so check that the printed position is exactly -1 and not 0.', 'The first line holds n. The second line holds n whole numbers. The third line holds the key to find.', NULL, NULL, 'CH0080 - Linear Search : learn the standard result convention of a search, where a real position is reported for a hit and an impossible position is reported for a miss.', 1, 'Print exactly 2 lines: Status with Found or Not found, and Position with the 1-based position of the earliest match, or -1 when the key is absent.', 'S8-C2-Q1', 'A register lookup must report where a roll number appears in an unsorted register.

Read the register and the roll number to find. Print the position counted from 1 when it is present, and -1 when it is not.

The value -1 is used because no real position can ever be -1, which makes it a safe way of saying not found. Returning 0 for a miss would be ambiguous in languages where positions start at 0, so the convention matters.', '7
21 34 21 56 78 90 12
21//.//4
10 20 30 40
25', 'Status   : Found
Position : 1//.//Status   : Not found
Position : -1', 'STG009', '#include <stdio.h>

int main()
{
    int reg[100];
    int n, i, key, position = -1;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &reg[i]);
    scanf("%d", &key);

    // TODO: search for the key and record the earliest position
    // TODO: print Status and Position

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Linear Search Position Report', 'Stage-8/Ch2-Linear-Search-Position-Report'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000.
- key   : whole number, -100000 <= key <= 100000.
- comparisons : the number of elements tested, so 1 <= comparisons <= n. A miss always costs n comparisons.
- position : 1-based position of the first match, or -1 when the key is absent.
- The case is tested in this order: 1 comparison is Best, otherwise a count equal to n is Worst, otherwise Average.
- The label column is 12 characters wide, followed by '': ''.', 'medium', NULL, '1) The comparison counter is increased inside the loop, immediately before the element is tested. 2) The loop must stop at the match, otherwise the count keeps rising after the answer is known.', '1) A search that fails has tested every element, so its count is fixed by the size of the list. 2) The three cases are decided by two comparisons on the count itself.', '1) A hidden test uses a list of one element - re-read the statement, the order of the case tests decides the answer there. 2) Another hidden test uses an absent key, whose comparison count must equal the size of the list.', 'The first line holds n. The second line holds n whole numbers. The third line holds the key.', NULL, NULL, 'CH0081 - Linear Search Algorithm : learn to measure an algorithm by counting its comparisons, and to recognise the best, average and worst case of a linear search from that count.', 2, 'Print exactly 3 lines: Position with the 1-based position or -1, Comparisons with the number of elements tested and Case with Best, Average or Worst.', 'S8-C3-Q1', 'A teaching tool measures how much work a linear search actually does, so that the theory of best, average and worst case can be seen in numbers.

Read the list and the key, then print the position found, the number of comparisons made and the case that the search fell into.

A comparison is counted every time an element is tested against the key, including the test that succeeds. The case is decided from the comparison count: one comparison is the best case, a count equal to the size of the list is the worst case, and anything between the two is the average case. When a list of one element is searched, the count is 1, which counts as the best case.', '6
11 22 33 44 55 66
33//.//6
11 22 33 44 55 66
11', 'Position    : 3
Comparisons : 3
Case        : Average//.//Position    : 1
Comparisons : 1
Case        : Best', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, key, position = -1, comparisons = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);
    scanf("%d", &key);

    // TODO: search while counting every comparison made
    // TODO: decide the case from the comparison count
    // TODO: print Position, Comparisons and Case

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Linear Search Cost Analysis', 'Stage-8/Ch3-Linear-Search-Cost-Analysis'),
  (true, '- n    : whole number, 1 <= n <= 100, the size of the register.
- q    : whole number, 1 <= q <= 20, the number of passes to check.
- All values are whole numbers between -100000 and 100000.
- Positions are counted from 1; an unregistered pass reports -1.
- A search stops at its first match, so its cost is the position of that match.
- A failed search costs n comparisons.
- The total is the sum of the comparisons of all q searches, so it is at most q multiplied by n.
- The label column for the total is 6 characters wide, followed by '': ''.', 'medium', NULL, '1) The register is read once, before any search begins; only the searching loop repeats. 2) One loop over the passes contains a second loop over the register.', '1) The comparison counter belongs outside both loops, because it adds up across every search. 2) Each search needs its own position variable, reset before it starts.', '1) A hidden test checks a pass that is missing from the register - re-read the constraints, a failed search costs n comparisons and reports -1. 2) Another hidden test repeats the same pass several times, so make sure each search restarts from the beginning.', 'The first line holds n. The second line holds n whole numbers, the register. The third line holds q. The fourth line holds q whole numbers, the passes to check.', NULL, NULL, 'CH0082 - Linear Search with Arrays : learn to reuse one stored array for many searches, and to see how the total cost grows when every query walks the list again.', 3, 'Print q lines, one per pass in the order given, each holding the position of that pass or -1. Then print one more line, Total with the number of comparisons made across all the searches.', 'S8-C4-Q1', 'A gate system checks a batch of passes against one stored register. The register is read once and then searched again for every pass in the batch.

Read the register, then read the number of passes and the passes themselves. For each pass print its position in the register counted from 1, or -1 when the pass is not registered. After all passes, print the total number of comparisons made across every search.

Each search restarts from the beginning of the register, which is why the total cost grows with the number of passes as well as with the size of the register.', '5
31 42 53 64 75
3
53 31 99//.//3
7 8 9
1
9', '3
1
-1
Total : 9//.//3
Total : 3', 'STG009', '#include <stdio.h>

int main()
{
    int reg[100], passes[20];
    int n, q, i, j, total = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &reg[i]);
    scanf("%d", &q);
    for (i = 0; i < q; i++)
        scanf("%d", &passes[i]);

    // TODO: search the register once for every pass
    // TODO: print the position or -1 for each pass
    // TODO: print the total comparisons after the loop

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Batch Lookup Against One Register', 'Stage-8/Ch4-Batch-Lookup-Against-One-Register'),
  (true, '- n       : whole number, 1 <= n <= 100, the size of the log.
- reading : whole number, -100000 <= reading <= 100000; duplicates are expected.
- key     : whole number, -100000 <= key <= 100000.
- Positions are counted from 1 and are printed in increasing order, separated by single spaces, with no trailing space.
- When the count is 0, the positions line holds exactly the word None.
- The search must examine every element, so break may not be used.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) The positions can be collected into a second array while the log is being walked. 2) The count of collected positions also tells you whether the list is empty.', '1) Print the separating space before every position except the first one collected. 2) The word None replaces the whole list, not each missing position.', '1) A hidden test uses a key that appears at every position - re-read the constraints, the loop may not stop early. 2) Another hidden test uses an absent key, so check what your Positions line prints in that case.', 'The first line holds n. The second line holds n whole numbers. The third line holds the key to audit.', NULL, NULL, 'CH0083 - Search Occurrence & Count : learn that a complete search cannot stop early, because every later duplicate still has to be reported.', 4, 'Print exactly 2 lines: Count with the number of occurrences, and Positions with the 1-based positions separated by single spaces, or the word None when there are none.', 'S8-C5-Q1', 'An audit tool reports every place a reading appears in a log, not just the first.

Read the log and the reading to audit. Print how many times it appears and the list of positions, counted from 1, where it appears. When it never appears, print a count of 0 and the word None in place of the position list.

A search that stops at the first match cannot answer this question, so the loop must run to the end of the log.', '8
4 9 4 2 4 7 1 4
4//.//5
1 2 3 4 5
8', 'Count     : 4
Positions : 1 3 5 8//.//Count     : 0
Positions : None', 'STG009', '#include <stdio.h>

int main()
{
    int log[100], positions[100];
    int n, i, key, count = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &log[i]);
    scanf("%d", &key);

    // TODO: walk the whole log, collecting every matching position
    // TODO: print the count, then the positions or the word None

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Occurrence Count and Positions', 'Stage-8/Ch5-Occurrence-Count-And-Positions'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000.
- A list is sorted when every element is greater than or equal to the one before it, so repeated equal values still count as sorted.
- A list of one element is always sorted.
- low is 0 and high is n - 1; the midpoint is low + (high - low) / 2, using integer division.
- The midpoint is reported even when the list is not sorted.
- The label column is 12 characters wide, followed by '': ''.', 'medium', NULL, '1) The sorted check compares each element with the one before it, so the walk starts from the second element. 2) Equal neighbours do not break the order.', '1) Integer division throws away the fraction, which is what makes the midpoint land on a real index. 2) The midpoint of a range of two elements is the first of them.', '1) A hidden test uses a list with repeated equal values - re-read the constraints, those are still sorted. 2) Another hidden test uses a single element, where low, high and mid all become the same index.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0084 - Binary Search Basics : learn the precondition of binary search, that the data must already be sorted, and learn the safe way of computing the midpoint of a range.', 5, 'Print exactly 5 lines: Sorted with Yes or No, Low with the starting low index, High with the starting high index, Mid with the midpoint index and Mid value with the element stored there.', 'S8-C6-Q1', 'Binary search is only meaningful on sorted data. Before any search is attempted, a checker must confirm that the list is in non-decreasing order and show the first step the search would take.

Read the list and print:
1. Whether the list is sorted in non-decreasing order.
2. The starting low index, which is 0.
3. The starting high index, which is one less than the size.
4. The midpoint index of that range.
5. The value stored at the midpoint.

The midpoint must be computed as low plus half the distance between low and high, rather than as half of low plus high. The two formulas give the same answer here, but the second one can overflow when the two indices are very large, and it is the habit that matters.', '7
10 20 30 40 50 60 70//.//5
9 3 7 1 5', 'Sorted      : Yes
Low         : 0
High        : 6
Mid         : 3
Mid value   : 40//.//Sorted      : No
Low         : 0
High        : 4
Mid         : 2
Mid value   : 7', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, sorted = 1;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: check whether every element is at least as large as the one before it
    // TODO: compute low, high and the midpoint using the safe formula
    // TODO: print the five lines

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Sorted Check and First Midpoint', 'Stage-8/Ch6-Sorted-Check-And-First-Midpoint'),
  (true, '- n     : whole number, 1 <= n <= 100; the list is guaranteed sorted in non-decreasing order.
- value : whole number, -100000 <= value <= 100000.
- key   : whole number, -100000 <= key <= 100000.
- The midpoint is computed as low + (high - low) / 2 with integer division.
- The loop continues while low is less than or equal to high; an empty range means the key is absent.
- Position is the 1-based index of the element found, or -1 when the key is absent.
- Comparisons equals the number of indexes printed in the path, which never exceeds 7 for a list of 100 elements.
- The label column is 12 characters wide, followed by '': ''.', 'hard', NULL, '1) The loop ends either when the key is found or when low passes high. 2) Moving low to one past the midpoint, rather than to the midpoint itself, is what guarantees the loop finishes.', '1) The path is easiest to collect by printing the midpoint as soon as it is computed. 2) The comparison count rises by one for every midpoint examined, found or not.', '1) A hidden test searches for a key that is absent - re-read the constraints, the loop must end when the range becomes empty rather than running forever. 2) Another hidden test searches for the smallest element, so check that your path really halves the range each time.', 'The first line holds n. The second line holds n whole numbers in non-decreasing order. The third line holds the key.', NULL, NULL, 'CH0085 - Binary Search Algorithm : learn the halving loop itself, and see in the trace that each comparison removes half of the remaining range.', 6, 'Print exactly 3 lines: Path with the visited midpoint indexes separated by single spaces, Position with the 1-based position or -1, and Comparisons with the number of midpoints examined.', 'S8-C7-Q1', 'A search engine over a sorted index must report not only where a key was found but also the path it took to get there.

Read a sorted list and a key, then run a binary search. Print:
1. Path, the sequence of midpoint indexes visited, in the order they were visited, separated by single spaces.
2. Position, the 1-based position of the key, or -1 when it is absent.
3. Comparisons, the number of midpoints that were examined.

The search keeps a low and a high index. While the range is not empty it examines the midpoint, and then either stops, or discards the half that cannot contain the key by moving low above the midpoint or high below it.

The input list is guaranteed to be sorted in non-decreasing order.', '9
5 10 15 20 25 30 35 40 45
35//.//9
5 10 15 20 25 30 35 40 45
7', 'Path        : 4 6
Position    : 7
Comparisons : 2//.//Path        : 4 1 0
Position    : -1
Comparisons : 3', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, key, low, high, mid;
    int position = -1, comparisons = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);
    scanf("%d", &key);

    // TODO: run the halving loop, printing each midpoint index into the path
    // TODO: count every midpoint examined
    // TODO: print Path, Position and Comparisons

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Binary Search with Visit Trace', 'Stage-8/Ch7-Binary-Search-With-Visit-Trace'),
  (true, '- n   : whole number, 1 <= n <= 100; the directory is sorted in non-decreasing order.
- q   : whole number, 1 <= q <= 20, the number of lookups.
- All values and keys are whole numbers between -100000 and 100000.
- Each lookup resets low to 0 and high to n - 1 before it begins.
- A comparison is counted once for every midpoint examined, in every lookup.
- An absent key reports -1, and its lookup still costs the comparisons it made.
- The label column for the total is 6 characters wide, followed by '': ''.', 'medium', NULL, '1) The searching code is the same for every key, so it belongs inside a loop over the keys. 2) The low and high indexes must be reset at the start of each lookup, not once for the whole program.', '1) The comparison counter belongs outside the lookup loop, so that it adds up. 2) A lookup that fails still costs the comparisons it made before the range emptied.', '1) A hidden test looks up a key smaller than everything in the directory - re-read the constraints, that lookup must still finish and report -1. 2) Another hidden test repeats a key, so check that the second lookup starts again from the full range.', 'The first line holds n. The second line holds n whole numbers in non-decreasing order. The third line holds q. The fourth line holds q keys separated by spaces.', NULL, NULL, 'CH0086 - Binary Search with Arrays : learn to apply the halving search repeatedly over one stored array, and see that the cost per query stays small even as the array grows.', 7, 'Print q lines, one per key in the order given, each holding the 1-based position of that key or -1. Then print one more line, Total with the number of comparisons made across all the lookups.', 'S8-C8-Q1', 'A directory service answers several lookups against one sorted directory.

Read the sorted directory, then the number of lookups and the keys themselves. For each key print its 1-based position, or -1 when it is not in the directory. After all lookups, print the total number of comparisons made.

Every lookup must use the halving search and must start again from the full range. The directory is guaranteed to be sorted in non-decreasing order.', '9
5 10 15 20 25 30 35 40 45
3
5 45 22//.//5
2 4 6 8 10
1
6', '1
9
-1
Total : 11//.//3
Total : 1', 'STG009', '#include <stdio.h>

int main()
{
    int dir[100], keys[20];
    int n, q, i, low, high, mid, total = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &dir[i]);
    scanf("%d", &q);
    for (i = 0; i < q; i++)
        scanf("%d", &keys[i]);

    // TODO: run one halving search per key, resetting the range each time
    // TODO: print the position or -1 for each key, then the total comparisons

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Binary Lookup for Many Keys', 'Stage-8/Ch8-Binary-Lookup-For-Many-Keys'),
  (true, '- n     : whole number, 1 <= n <= 100; the list is sorted in non-decreasing order and holds no duplicates.
- value : whole number, -100000 <= value <= 100000.
- key   : whole number, -100000 <= key <= 100000.
- The linear search stops at its first match; a miss costs n comparisons.
- The binary search uses low + (high - low) / 2 and stops when the range empties.
- Position is 1-based and identical for both methods, or -1 when the key is absent.
- The verdict is Equal only when both counts are exactly the same.
- The label column is 19 characters wide, followed by '': ''.', 'medium', NULL, '1) The two searches are independent, so each one needs its own counter. 2) Both searches run over the same array without modifying it.', '1) A key sitting at the first position is the one case where the linear search can win. 2) The verdict needs three outcomes, so a plain if-else is not enough on its own.', '1) A hidden test places the key at the first position - re-read the statement, the linear search then costs a single comparison. 2) Another hidden test uses an absent key, where the linear cost is fixed at n while the binary cost is not.', 'The first line holds n. The second line holds n whole numbers in increasing order. The third line holds the key.', NULL, NULL, 'CH0087 - Linear Search vs Binary Search (Quick Recap) : run both searches over the same sorted data and compare their cost directly, so the difference stops being a claim and becomes a measurement.', 8, 'Print exactly 4 lines: Linear comparisons, Binary comparisons, Position and Faster with Linear, Binary or Equal.', 'S8-C9-Q1', 'A teaching report runs both search methods on the same sorted list and the same key, then states which method did less work.

Read the sorted list and the key, then print:
1. The number of comparisons a linear search needs.
2. The number of comparisons a binary search needs.
3. The position found, which must be the same for both methods, or -1 when the key is absent.
4. The verdict: Linear, Binary or Equal, naming the method that made fewer comparisons.

Both searches count one comparison for every element or midpoint they examine. The list is guaranteed sorted, and it is guaranteed to contain no duplicates, so both methods report the same position.', '15
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30
28//.//15
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30
2', 'Linear comparisons : 14
Binary comparisons : 3
Position           : 14
Faster             : Binary//.//Linear comparisons : 1
Binary comparisons : 4
Position           : 1
Faster             : Linear', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, key;
    int linear = 0, binary = 0, position = -1;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);
    scanf("%d", &key);

    // TODO: run a linear search, counting its comparisons
    // TODO: run a binary search over the same list, counting its comparisons
    // TODO: print both counts, the position and the verdict

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Linear Against Binary', 'Stage-8/Ch9-Linear-Against-Binary'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000; duplicates are allowed.
- A list of one element counts as Ascending.
- A list whose elements are all equal counts as Ascending, because the ascending test is checked first.
- breaks : the number of neighbouring pairs where the later element is smaller than the earlier one, so a fully ascending list has 0 breaks.
- The label column is 7 characters wide, followed by '': ''.', 'easy', NULL, '1) One walk comparing each element with the one before it can answer both tests at once. 2) Two flags, one for each order, are enough.', '1) Equal neighbours break neither order, which is why a list of equal values satisfies both. 2) The order of your tests decides what such a list is reported as.', '1) A hidden test uses a list where every element is the same - re-read the constraints, it must be reported as Ascending. 2) Another hidden test uses a descending list, whose break count is not zero.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0088 - Sorting Basics : learn what being sorted actually means before learning to sort, and learn that a list can be neither ascending nor descending.', 9, 'Print exactly 2 lines: Order with Ascending, Descending or Unsorted, and Breaks with the number of neighbouring pairs that are out of ascending order.', 'S8-C10-Q1', 'Before a list is sorted it is worth asking whether it already is. A checker must classify a list as Ascending, Descending or Unsorted.

Read the list and print its order, together with the number of neighbouring pairs that are out of ascending order.

A list is Ascending when every element is greater than or equal to the one before it, and Descending when every element is less than or equal to the one before it. A list where all the elements are equal satisfies both tests; report it as Ascending. Anything else is Unsorted.', '6
3 9 14 27 27 40//.//6
40 27 27 14 9 3', 'Order  : Ascending
Breaks : 0//.//Order  : Descending
Breaks : 4', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, ascending = 1, descending = 1, breaks = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: compare each element with the one before it
    // TODO: clear the flags when an order is broken and count the ascending breaks
    // TODO: print Order and Breaks

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Order Detection', 'Stage-8/Ch10-Order-Detection'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000; duplicates are allowed and must appear as often in the output as in the input.
- Both lines hold exactly n values separated by single spaces, with no trailing space.
- The descending line is the exact reverse of the ascending line when duplicates are present, so the counts always match.
- The label column is 11 characters wide, followed by '': ''.', 'medium', NULL, '1) Swapping two elements needs a third variable to hold one of them for a moment. 2) The direction of the sort is decided by whether you swap on greater than or on less than.', '1) Printing the sorted array backwards is enough for the second line. 2) The separator is printed before every value except the first.', '1) A hidden test uses a list that is already sorted - re-read the constraints, it must come back unchanged on the ascending line. 2) Another hidden test uses duplicates, so check that every copy of a repeated value still appears.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0089 - Sorting in Ascending & Descending Order : learn that the direction of a sort is decided by a single comparison, so the same algorithm produces either order.', 10, 'Print exactly 2 lines: Ascending with the values from smallest to largest, and Descending with the same values from largest to smallest.', 'S8-C11-Q1', 'A report must present the same data twice: once from smallest to largest and once from largest to smallest.

Read the list and print it in ascending order on the first line and in descending order on the second line.

The original list must not be destroyed by the first sort, because the second one needs the same data. Copy it into a working array, or sort it once and print the second line by walking the result backwards.

Any sorting method may be used; only the two printed lines are checked.', '6
42 7 19 7 88 3//.//1
5', 'Ascending  : 3 7 7 19 42 88
Descending : 88 42 19 7 7 3//.//Ascending  : 5
Descending : 5', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, j, temp;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: sort the list into ascending order
    // TODO: print the ascending line
    // TODO: print the same values backwards for the descending line

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Both Orders From One List', 'Stage-8/Ch11-Both-Orders-From-One-List'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000; duplicates are allowed.
- swaps : the number of neighbouring exchanges actually performed; equal neighbours are never exchanged.
- passes : the number of sweeps performed, including the final sweep that made no exchange.
- A list already in ascending order reports 1 pass and 0 swaps.
- A list of one element reports 0 passes and 0 swaps, because no sweep is possible.
- The sorted line holds n values separated by single spaces, with no trailing space.
- The label column is 7 characters wide, followed by '': ''.', 'hard', NULL, '1) A flag set whenever an exchange happens tells you at the end of a sweep whether anything moved. 2) The inner sweep can stop one position earlier after each completed pass.', '1) The pass counter is increased once per sweep, before the sweep decides whether it was the last. 2) Equal neighbours must not be exchanged, or the swap count will be wrong.', '1) A hidden test sends a list that is already sorted - re-read the constraints, exactly 1 pass and 0 swaps are expected there. 2) Another hidden test sends a single element, where no sweep can run at all, so check the value your pass counter ends on.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0090 - Bubble Sort : learn the pairwise exchange sort and learn why a pass that makes no swap proves the list is already in order, which turns the algorithm into an early-exit one.', 11, 'Print exactly 3 lines: Sorted with the values in ascending order, Swaps with the number of exchanges made and Passes with the number of sweeps performed.', 'S8-C12-Q1', 'Implement bubble sort and report the work it did.

Bubble sort compares each neighbouring pair in turn and exchanges them when they are in the wrong order. One complete sweep of the list is a pass. After each pass the largest remaining value has reached its final place, so the next pass may stop one position earlier.

If a pass makes no exchange at all, the list is already in order and no further pass is needed.

Read the list and print the sorted values, the number of exchanges made and the number of passes performed. The pass that discovers there is nothing left to do is counted as a performed pass, so a list that arrives already sorted reports exactly 1 pass and 0 exchanges.', '6
42 7 19 7 88 3//.//5
1 2 3 4 5', 'Sorted : 3 7 7 19 42 88
Swaps  : 9
Passes : 5//.//Sorted : 1 2 3 4 5
Swaps  : 0
Passes : 1', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, j, temp, swaps = 0, passes = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: repeat sweeps until one of them makes no exchange
    // TODO: count the exchanges and the sweeps performed
    // TODO: print Sorted, Swaps and Passes

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Bubble Sort with Pass Report', 'Stage-8/Ch12-Bubble-Sort-With-Pass-Report'),
  (true, '- n     : whole number, 1 <= n <= 50.
- value : whole number, -100000 <= value <= 100000; duplicates are allowed.
- passes : exactly n - 1 lines are printed, one per pass, numbered from 1.
- A list of one element prints no pass lines at all.
- swaps : the number of exchanges actually performed; an element already in place costs none, so swaps is at most n - 1.
- When equal values compete, the earliest one is selected, so equal values keep their relative order.
- Each pass line is ''Pass i : '' followed by the n values separated by single spaces, with no trailing space.', 'hard', NULL, '1) Each pass first finds the position of the smallest remaining value, and only then decides whether an exchange is needed. 2) The search for the smallest starts from the position being settled, not from the beginning of the list.', '1) An exchange is skipped when the smallest value is already where it belongs. 2) Use a strict comparison while searching, so that the earliest of two equal values wins.', '1) A hidden test sends a list that is already sorted - re-read the constraints, the pass lines still appear but the swap count stays at zero. 2) Another hidden test sends a single element, where no pass line may be printed at all.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0091 - Selection Sort : learn the sort that finds the smallest remaining value and puts it in place, and learn why it performs at most one exchange per pass however disordered the data is.', 12, 'Print n - 1 lines of the form ''Pass i : values'', showing the whole list after that pass, then one final line ''Swaps  : count'' with the number of exchanges performed.', 'S8-C13-Q1', 'Implement selection sort and show the state of the list after every pass.

Selection sort works through the list from left to right. At each position it searches the remaining part for the smallest value and exchanges that value into the position. One position is settled per pass, so a list of n elements takes n minus 1 passes.

Read the list, then print the whole list after each pass, and finally the number of exchanges actually performed.

When the smallest remaining value is already in the right position, no exchange is made and the swap count does not rise, even though the pass still took place.', '5
64 25 12 22 11//.//1
8', 'Pass 1 : 11 25 12 22 64
Pass 2 : 11 12 25 22 64
Pass 3 : 11 12 22 25 64
Pass 4 : 11 12 22 25 64
Swaps  : 3//.//Swaps  : 0', 'STG009', '#include <stdio.h>

int main()
{
    int list[50];
    int n, i, j, temp, swaps = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: for each position, find the smallest remaining value
    // TODO: exchange it into place only when it is not already there
    // TODO: print the whole list after each pass, then the swap count

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Selection Sort Pass by Pass', 'Stage-8/Ch13-Selection-Sort-Pass-By-Pass'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000; duplicates are allowed.
- shifts : the number of single-position moves; a list already in ascending order gives 0.
- comparisons : one per test against a value in the sorted front, including the test that fails and ends the insertion.
- A value equal to the one before it must not be shifted, so equal values keep their relative order.
- The sorted line holds n values separated by single spaces, with no trailing space.
- The label column is 12 characters wide, followed by '': ''.', 'hard', NULL, '1) The value being inserted must be saved in a separate variable first, because its position is about to be overwritten. 2) The movement walks backwards through the sorted front.', '1) The loop that moves elements ends either when a smaller or equal value is met or when the front is exhausted - both endings still cost the comparison that discovered them. 2) An element equal to the inserted value must stop the movement, not continue it.', '1) A hidden test sends an already sorted list - re-read the constraints, the shift count must then be 0 while the comparison count is not. 2) Another hidden test sends a reversed list, which produces the largest possible shift count.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0092 - Insertion Sort : learn the sort that grows a sorted front by inserting each new value into place, and learn that its cost is measured in shifts rather than exchanges.', 13, 'Print exactly 3 lines: Sorted with the values in ascending order, Shifts with the number of single-position moves and Comparisons with the number of tests made.', 'S8-C14-Q1', 'Implement insertion sort and report the work it did.

Insertion sort treats the front of the list as already sorted. It takes the next value, moves every larger value in the sorted front one position to the right, and drops the value into the gap that opens up.

Read the list and print the sorted values, the number of shifts performed and the number of comparisons made.

A shift is counted every time an element is moved one position to the right. A comparison is counted every time a value in the sorted front is tested against the value being inserted, including the test that stops the movement. A list that arrives already sorted needs no shift at all, which is what makes this sort fast on nearly ordered data.', '6
12 11 13 5 6 7//.//5
1 2 3 4 5', 'Sorted      : 5 6 7 11 12 13
Shifts      : 10
Comparisons : 13//.//Sorted      : 1 2 3 4 5
Shifts      : 0
Comparisons : 4', 'STG009', '#include <stdio.h>

int main()
{
    int list[100];
    int n, i, j, current, shifts = 0, comparisons = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: for each value after the first, save it and walk the sorted front backwards
    // TODO: count each comparison and each single-position move
    // TODO: print Sorted, Shifts and Comparisons

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Insertion Sort Shift Count', 'Stage-8/Ch14-Insertion-Sort-Shift-Count'),
  (true, '- n     : whole number, 1 <= n <= 100.
- value : whole number, -100000 <= value <= 100000; duplicates are allowed.
- Both methods must start from the original data, so the list has to be copied before sorting.
- Bubble sort counts one exchange per neighbouring swap and stops early when a sweep makes no exchange.
- Selection sort counts one exchange per pass, and none when the smallest remaining value is already in place.
- The verdict is Equal only when both counts are exactly the same, which happens for data that is already sorted.
- The label column is 16 characters wide, followed by '': ''.', 'hard', NULL, '1) Sorting the same array twice would make the second method work on data that is already sorted, which is why two copies are needed. 2) The copying is a simple loop over the original.', '1) Both counters must be declared and reset before their own sort begins. 2) The two sorted results are identical, so only one of them needs to be printed.', '1) A hidden test sends an already sorted list - re-read the constraints, both counts are then zero and the verdict is Equal. 2) Another hidden test sends a reversed list, where the two counts are furthest apart, so check that you did not sort one copy twice.', 'The first line holds n. The second line holds n whole numbers separated by spaces.', NULL, NULL, 'CH0093 - Comparing Sorting Methods : run two sorts over identical data and compare their cost, learning that methods which agree on the result can differ greatly in the work they do.', 14, 'Print exactly 4 lines: Sorted with the values in ascending order, Bubble swaps with the bubble sort exchange count, Selection swaps with the selection sort exchange count and Fewer swaps with Bubble, Selection or Equal.', 'S8-C15-Q1', 'A benchmark runs bubble sort and selection sort on the same data and reports which one moved fewer elements.

Read the list once and copy it into two working arrays, so that each method sorts the original data rather than the output of the other. Sort one copy with bubble sort and the other with selection sort, then print:
1. The sorted values, which must be identical for both methods.
2. The number of exchanges bubble sort made.
3. The number of exchanges selection sort made.
4. The verdict: Bubble, Selection or Equal, naming the method with fewer exchanges.

Bubble sort exchanges neighbouring pairs and may perform many exchanges. Selection sort performs at most one exchange per pass. The counts therefore differ even though the sorted result does not.', '5
64 25 12 22 11//.//5
1 2 3 4 5', 'Sorted          : 11 12 22 25 64
Bubble swaps    : 9
Selection swaps : 3
Fewer swaps     : Selection//.//Sorted          : 1 2 3 4 5
Bubble swaps    : 0
Selection swaps : 0
Fewer swaps     : Equal', 'STG009', '#include <stdio.h>

int main()
{
    int list[100], a[100], b[100];
    int n, i, j, temp, bubbleSwaps = 0, selectionSwaps = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++)
        scanf("%d", &list[i]);

    // TODO: copy the original list into both working arrays
    // TODO: sort one copy with bubble sort, counting its exchanges
    // TODO: sort the other with selection sort, counting its exchanges
    // TODO: print the sorted values, both counts and the verdict

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Sorting Methods Side by Side', 'Stage-8/Ch15-Sorting-Methods-Side-By-Side'),
  (true, '- sections : whole number, 1 <= sections <= 10.
- printBanner takes no parameters and returns nothing, so its return type is void and its parameter list is void.
- The function must be defined above main, or declared above it, because C must know a function before it is called.
- The banner is exactly three lines and its text appears only once in the program.
- The total output is 3 multiplied by the number of sections lines.', 'easy', NULL, '1) A function that hands nothing back and receives nothing is declared with void in both places. 2) Calling a function is just its name followed by a pair of brackets and a semicolon.', '1) The call goes inside a loop, so the number of calls is decided while the program runs. 2) The function itself knows nothing about the loop and needs no counter.', '1) A hidden test asks for the largest allowed number of sections - re-read the constraints and check that your loop calls the function that many times. 2) Another hidden test asks for a single section, so make sure exactly three lines are printed and no separator is added.', 'A single line holding one whole number, the number of sections in the report.', NULL, NULL, 'CH0094 - What is a Function? : learn that a block of work can be given a name and run again from anywhere, so repeated output is written once and called many times instead of being copied.', 0, 'Print the three banner lines once per section: a line of 20 equal signs, the centred title SECTION REPORT, and another line of 20 equal signs.', 'S9-C1-Q1', 'A report tool prints the same three-line banner at the top of every section. Copying those three printf statements into every section is how the previous version was written, and changing the banner meant editing it in every place.

Write a function named printBanner that takes no arguments, returns nothing, and prints the three banner lines. Then read how many sections the report has and call that one function once per section.

The banner text must appear only once in the whole program, inside the function. A program that prints the lines directly inside main does not satisfy the requirement, even though its output looks the same.', '2//.//1', '====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================//.//====================
   SECTION REPORT
====================', 'STG010', '#include <stdio.h>

// TODO: write a function named printBanner that takes nothing and returns nothing
// TODO: it must print the three banner lines

int main()
{
    int sections, i;

    scanf("%d", &sections);

    // TODO: call printBanner once for every section

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Reusable Report Banner', 'Stage-9/Ch1-Reusable-Report-Banner'),
  (true, '- a, b, c : whole numbers, -100000 <= each <= 100000.
- printLine prints exactly 15 dashes followed by a newline, and is called exactly 4 times.
- The function must be defined or declared above main.
- Each block is a single line of the form ''Value 1 : a'' with the label column 8 characters wide, followed by '': ''.
- The output is exactly 7 lines: 4 rules and 3 blocks, interleaved.', 'easy', NULL, '1) The function is written once but called four times, at four different points of main. 2) Control always returns to the statement immediately after the call.', '1) The three values can be read with one scanf. 2) The rule never changes, which is exactly why it belongs in a function rather than in four copied statements.', '1) A hidden test checks the exact order of rules and blocks - re-read the output format, the report both begins and ends with a rule. 2) Another hidden test uses negative values, so check that the label column still lines up.', 'A single line holding three whole numbers separated by spaces.', NULL, NULL, 'CH0095 - Creating and Calling a Function : learn how control moves to a function and comes back to the statement after the call, by placing calls between ordinary statements and watching the order of the output.', 1, 'Print a rule of 15 dashes, then the first value, then a rule, then the second value, then a rule, then the third value, then a final rule: 7 lines in total.', 'S9-C2-Q1', 'A statement printer separates its blocks with a ruled line. The ruled line is produced by a function, and the blocks themselves are printed by main.

Write a function named printLine that takes no arguments, returns nothing, and prints a line of exactly 15 dashes. Then read three whole numbers and print them as three labelled blocks, calling printLine before the first block, between each pair of blocks and after the last block.

When a function is called, control leaves main, runs the function and then returns to the exact statement after the call. The order of the output is the proof of that, so the blocks and the rules must interleave precisely.', '10 20 30//.//-5 0 7', '---------------
Value 1 : 10
---------------
Value 2 : 20
---------------
Value 3 : 30
---------------//.//---------------
Value 1 : -5
---------------
Value 2 : 0
---------------
Value 3 : 7
---------------', 'STG010', '#include <stdio.h>

// TODO: write a function named printLine that prints 15 dashes and a newline

int main()
{
    int a, b, c;

    scanf("%d %d %d", &a, &b, &c);

    // TODO: call printLine and print the three value lines in the required order

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Separator Lines Between Blocks', 'Stage-9/Ch2-Separator-Lines-Between-Blocks'),
  (true, '- height : whole number, 1 <= height <= 20.
- symbol : a single printable character that is not a space.
- printRow takes exactly two parameters, a whole number and a character, and returns nothing.
- printRow must be called once per row; the repetition of the symbol happens inside it.
- No row ends with a trailing space.
- The output is 2 multiplied by the height lines: the growing triangle followed by the shrinking one.', 'medium', NULL, '1) A parameter is declared with its type inside the brackets of the function header. 2) The loop that repeats the symbol belongs inside the function, not in main.', '1) The caller decides the length of each row, so main needs two loops of calls, one counting up and one counting down. 2) A character parameter is passed exactly like a number.', '1) A hidden test uses the largest allowed height - re-read the constraints and check that both triangles are printed in full. 2) Another hidden test uses a height of 1, where the two triangles are a single row each.', 'A single line holding the height as a whole number and the symbol as a single character, separated by a space.', NULL, NULL, 'CH0096 - Functions with Parameters : learn that a function becomes reusable when the parts that change are handed to it as parameters, and that the caller''s variable is not affected by what the function does with its copy.', 2, 'Print the growing triangle, one row per line from 1 symbol up to height symbols, then the shrinking triangle from height symbols back down to 1 symbol.', 'S9-C3-Q1', 'A pattern printer draws rows made of a repeated symbol. The length of a row and the symbol both change from row to row, so they are handed to the function as parameters.

Write a function named printRow that takes a count and a character, prints that character the given number of times followed by a newline, and returns nothing.

Read a height and a symbol, then draw a growing triangle: row i is that symbol repeated i times, for i from 1 up to the height. Then draw a shrinking triangle from the height back down to 1.

The function receives a copy of each argument. Anything it does to its own count, such as counting down to zero, leaves the caller''s variable untouched.', '4 *//.//1 #', '*
**
***
****
****
***
**
*//.//#
#', 'STG010', '#include <stdio.h>

// TODO: write a function named printRow that takes a count and a character
// TODO: it prints the character that many times, then a newline

int main()
{
    int height, i;
    char symbol;

    scanf("%d %c", &height, &symbol);

    // TODO: call printRow for the growing triangle, then for the shrinking one

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Parameterised Pattern Row', 'Stage-9/Ch3-Parameterised-Pattern-Row'),
  (true, '- a, b, c : whole numbers, -1000000 <= each <= 1000000; two or three of them may be equal.
- larger takes two int parameters and returns an int; it prints nothing.
- When the two values are equal, the function returns that value.
- The largest of three must be produced by nesting one call inside another, not by a new if-else chain in main.
- The label column is 9 characters wide, followed by '': ''.', 'medium', NULL, '1) A function that hands a value back declares the type of that value in front of its name and ends with a return statement. 2) The result of a call can be used anywhere a value is allowed.', '1) The largest of three is the larger of one value and the larger of the other two. 2) A call may be written directly as an argument of another call.', '1) A hidden test makes all three values equal - re-read the constraints, the function returns that value rather than failing. 2) Another hidden test uses negative values, so check that your comparison does not assume the numbers are positive.', 'A single line holding three whole numbers separated by spaces.', NULL, NULL, 'CH0097 - Functions with Return Values : learn that a function can hand a value back to its caller, so the calculation lives in one place while the printing stays with the caller.', 3, 'Print exactly 4 lines: A and B with the larger of the first two, B and C with the larger of the last two, A and C with the larger of the outer two, and Largest with the largest of all three.', 'S9-C4-Q1', 'A grading tool must pick the largest of three scores and also the largest of each pair, so the same comparison is needed four times.

Write a function named larger that takes two whole numbers and returns the greater of them. Then read three scores and use only that function to print:
1. The larger of the first and second score.
2. The larger of the second and third score.
3. The larger of the first and third score.
4. The largest of all three, obtained by calling the function on the result of another call.

The function must return the value rather than print it. A function that prints the answer cannot be reused inside a larger calculation, which is exactly what the fourth line needs.', '12 45 30//.//-7 -7 -7', 'A and B  : 45
B and C  : 45
A and C  : 30
Largest  : 45//.//A and B  : -7
B and C  : -7
A and C  : -7
Largest  : -7', 'STG010', '#include <stdio.h>

// TODO: write a function named larger that takes two whole numbers
// TODO: it returns the greater of them and prints nothing

int main()
{
    int a, b, c;

    scanf("%d %d %d", &a, &b, &c);

    // TODO: print the three pairwise results using the function
    // TODO: print the largest of all three by nesting one call inside another

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Largest of Three Through a Function', 'Stage-9/Ch4-Largest-Of-Three-Through-A-Function'),
  (true, '- Both values are whole numbers between -100000 and 100000.
- The square of the first value is at most 10000000000, so it must be computed and printed as a long long.
- addUp takes two int parameters and returns an int; the sum stays inside the int range.
- readBase contains the only scanf of the program and is called exactly twice.
- Every one of the four functions must be defined or declared above main.
- The label column is 7 characters wide, followed by '': ''.', 'hard', NULL, '1) The two choices are independent: taking nothing does not mean returning nothing. 2) A function that returns nothing is declared with void in front of its name.', '1) A function that reads a value can declare its own local variable, read into it and return it. 2) The order of the calls in main decides which input value ends up in which variable.', '1) A hidden test squares a value near the limit - re-read the constraints, the square goes far past the range of an int, so check the type you square into. 2) Another hidden test uses a negative first value, whose square is positive.', 'Two whole numbers, separated by a space or a newline.', NULL, NULL, 'CH0098 - Types of Functions : learn that a function is described by two independent choices, whether it takes arguments and whether it returns a value, which gives exactly four kinds.', 4, 'Print exactly 3 lines: the header line KIND DEMO, then Square with the square of the first value, then Sum with the sum of the two values.', 'S9-C5-Q1', 'A demonstration program must contain one function of each of the four kinds and call them in order.

Write these four functions:
1. showHeader : takes nothing, returns nothing. Prints the line KIND DEMO.
2. showSquare : takes one whole number, returns nothing. Prints the line ''Square : v'' where v is the square of the argument.
3. readBase : takes nothing, returns a whole number. Reads one value from the input and returns it.
4. addUp : takes two whole numbers, returns their sum.

main calls showHeader, then calls readBase twice to collect two values, then calls showSquare on the first value, and finally prints the line ''Sum    : v'' using the value returned by addUp.

The two values must be collected only through readBase. No scanf may appear inside main.', '12 30//.//-100000 100000', 'KIND DEMO
Square : 144
Sum    : 42//.//KIND DEMO
Square : 10000000000
Sum    : 0', 'STG010', '#include <stdio.h>

// TODO: showHeader - takes nothing, returns nothing
// TODO: showSquare - takes one whole number, returns nothing
// TODO: readBase - takes nothing, returns a whole number read from the input
// TODO: addUp - takes two whole numbers, returns their sum

int main()
{
    int first, second;

    // TODO: call the four functions in the order described in the problem statement
    // No scanf may appear inside main

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'The Four Kinds of Function', 'Stage-9/Ch5-The-Four-Kinds-Of-Function'),
  (true, '- orders   : whole number, 1 <= orders <= 20.
- quantity : whole number, 0 <= quantity <= 10000.
- rate     : real number, 0.00 <= rate <= 100000.00, read into a double.
- discount : whole number percentage, 0 <= discount <= 100.
- payable  : quantity multiplied by rate, less discount percent of that product, printed with exactly 2 decimals; it can reach 1000000000.00, so a double is required.
- The percentage division must not be an integer division.
- A discount of 100 gives a payable amount of exactly 0.00.
- One line of output is printed per order.', 'medium', NULL, '1) The parameters are separated by commas in the function header, each with its own type. 2) The arguments at the call must appear in the same order as the parameters.', '1) A function returning a real number declares that type in front of its name. 2) Dividing by 100 in whole numbers turns every discount below 100 into no discount at all.', '1) A hidden test uses a discount of 100 - re-read the constraints, the payable amount must then be exactly 0.00. 2) Another hidden test uses the largest quantity with the largest rate, so check that your return type can hold the result.', 'The first line holds the number of orders. Each of the next lines holds one order as three values separated by spaces: the quantity, the rate and the discount percentage.', NULL, NULL, 'CH0099 - Multiple Parameters and Arguments : learn that arguments are matched to parameters by position and not by name, so the order in which they are passed is what decides the result.', 5, 'Print one line per order, in the order the orders were given, each of the form ''Order i : amount'' with the payable amount to 2 decimals.', 'S9-C6-Q1', 'A billing service computes the payable amount of an order from three inputs: the quantity, the unit rate and the discount percentage.

Write a function named billFor that takes the quantity, the rate and the discount percentage in that order, and returns the payable amount as a real number. The payable amount is the quantity multiplied by the rate, less the discount percentage of that product.

Read the number of orders and then the three values of each order, calling the function once per order and printing the payable amount to 2 decimals.

Arguments are matched to parameters by their position. Passing the rate where the quantity is expected compiles without complaint and silently produces a wrong bill, so the order matters more than the names.', '2
3 250.00 10
1 99.50 0//.//1
5 100.00 100', 'Order 1 : 675.00
Order 2 : 99.50//.//Order 1 : 0.00', 'STG010', '#include <stdio.h>

// TODO: write a function named billFor that takes the quantity, the rate and the discount
// TODO: it returns the payable amount as a real number

int main()
{
    int orders, i, quantity, discount;
    double rate;

    scanf("%d", &orders);

    // TODO: read each order and print its payable amount using the function

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Bill Calculator with Several Parameters', 'Stage-9/Ch6-Bill-Calculator-With-Several-Parameters'),
  (true, '- calls  : whole number, 1 <= calls <= 20.
- value  : whole number, -100000 <= value <= 100000, one per call.
- served : a global int starting at 0; it accumulates every value passed to handle and stays within the int range.
- attempts : a local int inside handle, declared and set to 0 on every call, so the printed attempts value is always 1.
- The global must be declared outside every function, above main.
- handle prints one line per call of the form ''Served : s | Attempts : a''.
- The final line reports the global total after every call.', 'hard', NULL, '1) A variable declared outside every function belongs to the whole program and keeps its value between calls. 2) A variable declared inside a function is created when the function starts and destroyed when it ends.', '1) The local counter is set to 0 by its own declaration on every single call, which is why it cannot accumulate. 2) The function needs no parameter for the global, because it can see it directly.', '1) A hidden test makes many calls - re-read the constraints, the attempts value stays at 1 every time while the served value keeps changing. 2) Another hidden test passes negative values, so check that your global total can go down as well as up.', 'The first line holds the number of calls. The second line holds that many whole numbers separated by spaces.', NULL, NULL, 'CH0100 - Local and Global Variables : learn that a local variable exists only while its function runs, that a global variable outlives every call, and that a local of the same name hides the global rather than changing it.', 6, 'Print one line per call of the form ''Served : s | Attempts : a'', where s is the running global total and a is the local attempt count. Then print one final line, ''Total  : t'' with the global total after every call.', 'S9-C7-Q1', 'A service tracks how many requests it has handled. The count must survive across calls, so it is kept in a global variable. A second counter is local to the function and is created fresh on every call.

Declare a global whole number named served, starting at 0. Write a function named handle that takes one whole number, adds it to the global served, declares its own local variable named attempts starting at 0, increases that local by 1, and prints one line holding the value of served and the value of attempts.

Read how many calls to make and the value for each call, then call handle once per value. Finally print the global total.

The global keeps growing across calls while the local starts again from 0 on every call, so its printed value never changes.', '3
5 10 20//.//4
-5 5 -10 10', 'Served : 5 | Attempts : 1
Served : 15 | Attempts : 1
Served : 35 | Attempts : 1
Total  : 35//.//Served : -5 | Attempts : 1
Served : 0 | Attempts : 1
Served : -10 | Attempts : 1
Served : 0 | Attempts : 1
Total  : 0', 'STG010', '#include <stdio.h>

// TODO: declare the global counter named served, starting at 0

// TODO: write the function handle that takes one value, adds it to the global,
//       declares its own local attempts starting at 0, increases it and prints one line

int main()
{
    int calls, i, value;

    scanf("%d", &calls);

    // TODO: read each value and call handle with it
    // TODO: print the final global total

    return 0;
}
', 'Nice work! All tests passed.', NULL, NULL, 'Global Counter and Local Shadow', 'Stage-9/Ch7-Global-Counter-And-Local-Shadow');

do $$
begin
  if (select count(*) from practice_bank) <> 70 then
    raise exception 'ABORT: practice_bank count after insert is not 70.';
  end if;
end $$;

-- 7. Insert the 402 updated tests (all of them, public and hidden). Foreign keys resolve because step 6 ran first.
insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, '=========================
   REC C PROGRAMMING LAB
=========================
Session : 1
Status  : READY
=========================', false, NULL, 'Sample case - full banner', 0, 'S0-C1-Q1', 'S0-C1-Q1-T1', 5000),
  (true, '=========================
   REC C PROGRAMMING LAB
=========================
Session : 1
Status  : READY
=========================', true, NULL, 'Hidden test 1 - exact banner text', 1, 'S0-C1-Q1', 'S0-C1-Q1-T2', 5000),
  (true, '=========================
   REC C PROGRAMMING LAB
=========================
Session : 1
Status  : READY
=========================', true, NULL, 'Hidden test 2 - border width and leading spaces', 2, 'S0-C1-Q1', 'S0-C1-Q1-T3', 5000),
  (true, '=========================
   REC C PROGRAMMING LAB
=========================
Session : 1
Status  : READY
=========================', true, NULL, 'Hidden test 3 - spacing around the colons', 3, 'S0-C1-Q1', 'S0-C1-Q1-T4', 5000),
  (true, 'LAB REPORT
Student : "S. Kumar"
Folder  : C:\lab\week1
Score   : 92%
Remark  : 100% pass', false, NULL, 'Sample case - full report', 0, 'S0-C2-Q1', 'S0-C2-Q1-T1', 5000),
  (true, 'LAB REPORT
Student : "S. Kumar"
Folder  : C:\lab\week1
Score   : 92%
Remark  : 100% pass', true, NULL, 'Hidden test 1 - quotes around the name', 1, 'S0-C2-Q1', 'S0-C2-Q1-T2', 5000),
  (true, 'LAB REPORT
Student : "S. Kumar"
Folder  : C:\lab\week1
Score   : 92%
Remark  : 100% pass', true, NULL, 'Hidden test 2 - single backslashes in the path', 2, 'S0-C2-Q1', 'S0-C2-Q1-T3', 5000),
  (true, 'LAB REPORT
Student : "S. Kumar"
Folder  : C:\lab\week1
Score   : 92%
Remark  : 100% pass', true, NULL, 'Hidden test 3 - literal percent signs and colon alignment', 3, 'S0-C2-Q1', 'S0-C2-Q1-T4', 5000),
  (true, 'ORDER SUMMARY
Item     : Notebook
Quantity : 3
Amount   : 150', false, NULL, 'Sample case - clean summary', 0, 'S0-C3-Q1', 'S0-C3-Q1-T1', 5000),
  (true, 'ORDER SUMMARY
Item     : Notebook
Quantity : 3
Amount   : 150', true, NULL, 'Hidden test 1 - no DEBUG line in the output', 1, 'S0-C3-Q1', 'S0-C3-Q1-T2', 5000),
  (true, 'ORDER SUMMARY
Item     : Notebook
Quantity : 3
Amount   : 150', true, NULL, 'Hidden test 2 - block comment removed both grouped lines', 2, 'S0-C3-Q1', 'S0-C3-Q1-T3', 5000),
  (true, 'ORDER SUMMARY
Item     : Notebook
Quantity : 3
Amount   : 150', true, NULL, 'Hidden test 3 - label alignment preserved', 3, 'S0-C3-Q1', 'S0-C3-Q1-T4', 5000),
  (true, 'SEAT ALLOCATION
Row          : B
Old seat     : 12
New seat     : 27
Seats shifted: 15', false, NULL, 'Sample case - full record', 0, 'S0-C4-Q1', 'S0-C4-Q1-T1', 5000),
  (true, 'SEAT ALLOCATION
Row          : B
Old seat     : 12
New seat     : 27
Seats shifted: 15', true, NULL, 'Hidden test 1 - old value printed before the update', 1, 'S0-C4-Q1', 'S0-C4-Q1-T2', 5000),
  (true, 'SEAT ALLOCATION
Row          : B
Old seat     : 12
New seat     : 27
Seats shifted: 15', true, NULL, 'Hidden test 2 - shift is calculated, not hard-coded', 2, 'S0-C4-Q1', 'S0-C4-Q1-T3', 5000),
  (true, 'SEAT ALLOCATION
Row          : B
Old seat     : 12
New seat     : 27
Seats shifted: 15', true, NULL, 'Hidden test 3 - char and int printed with the right specifiers', 3, 'S0-C4-Q1', 'S0-C4-Q1-T4', 5000),
  (true, 'STUDENT RECORD
Initial      : S
Age          : 18
Percentage   : 85.50
Library fine : 120.7500
MEMORY AUDIT
char   : 1 byte
int    : 4 bytes
float  : 4 bytes
double : 8 bytes', false, NULL, 'Sample case - record and audit', 0, 'S0-C5-Q1', 'S0-C5-Q1-T1', 5000),
  (true, 'STUDENT RECORD
Initial      : S
Age          : 18
Percentage   : 85.50
Library fine : 120.7500
MEMORY AUDIT
char   : 1 byte
int    : 4 bytes
float  : 4 bytes
double : 8 bytes', true, NULL, 'Hidden test 1 - float printed with 2 decimals', 1, 'S0-C5-Q1', 'S0-C5-Q1-T2', 5000),
  (true, 'STUDENT RECORD
Initial      : S
Age          : 18
Percentage   : 85.50
Library fine : 120.7500
MEMORY AUDIT
char   : 1 byte
int    : 4 bytes
float  : 4 bytes
double : 8 bytes', true, NULL, 'Hidden test 2 - double printed with 4 decimals', 2, 'S0-C5-Q1', 'S0-C5-Q1-T3', 5000),
  (true, 'STUDENT RECORD
Initial      : S
Age          : 18
Percentage   : 85.50
Library fine : 120.7500
MEMORY AUDIT
char   : 1 byte
int    : 4 bytes
float  : 4 bytes
double : 8 bytes', true, NULL, 'Hidden test 3 - sizeof values and byte/bytes wording', 3, 'S0-C5-Q1', 'S0-C5-Q1-T4', 5000),
  (true, 'STUDENT RECORD
Initial      : S
Age          : 18
Percentage   : 85.50
Library fine : 120.7500
MEMORY AUDIT
char   : 1 byte
int    : 4 bytes
float  : 4 bytes
double : 8 bytes', true, NULL, 'Hidden test 4 - label alignment in both sections', 4, 'S0-C5-Q1', 'S0-C5-Q1-T5', 5000),
  (true, 'INT LIMITS
Max int   : 2147483647
Min int   : -2147483648
UNSIGNED WRAP
Before    : 4294967295
After     : 0', false, NULL, 'Sample case - limits and wrap', 0, 'S1-C1-Q1', 'S1-C1-Q1-T1', 5000),
  (true, 'INT LIMITS
Max int   : 2147483647
Min int   : -2147483648
UNSIGNED WRAP
Before    : 4294967295
After     : 0', true, NULL, 'Hidden test 1 - maximum int value', 1, 'S1-C1-Q1', 'S1-C1-Q1-T2', 5000),
  (true, 'INT LIMITS
Max int   : 2147483647
Min int   : -2147483648
UNSIGNED WRAP
Before    : 4294967295
After     : 0', true, NULL, 'Hidden test 2 - minimum int built as an expression', 2, 'S1-C1-Q1', 'S1-C1-Q1-T3', 5000),
  (true, 'INT LIMITS
Max int   : 2147483647
Min int   : -2147483648
UNSIGNED WRAP
Before    : 4294967295
After     : 0', true, NULL, 'Hidden test 3 - unsigned value wraps to zero', 3, 'S1-C1-Q1', 'S1-C1-Q1-T4', 5000),
  (true, 'INT LIMITS
Max int   : 2147483647
Min int   : -2147483648
UNSIGNED WRAP
Before    : 4294967295
After     : 0', true, NULL, 'Hidden test 4 - unsigned specifier used, no negative number printed', 4, 'S1-C1-Q1', 'S1-C1-Q1-T5', 5000),
  (true, 'ONE THIRD
float   : 0.3333333433
double  : 0.3333333333
LARGE READING
float   : 123456792.0
double  : 123456789.0', false, NULL, 'Sample case - precision report', 0, 'S1-C2-Q1', 'S1-C2-Q1-T1', 5000),
  (true, 'ONE THIRD
float   : 0.3333333433
double  : 0.3333333333
LARGE READING
float   : 123456792.0
double  : 123456789.0', true, NULL, 'Hidden test 1 - float one third to 10 decimals', 1, 'S1-C2-Q1', 'S1-C2-Q1-T2', 5000),
  (true, 'ONE THIRD
float   : 0.3333333433
double  : 0.3333333333
LARGE READING
float   : 123456792.0
double  : 123456789.0', true, NULL, 'Hidden test 2 - double one third to 10 decimals', 2, 'S1-C2-Q1', 'S1-C2-Q1-T3', 5000),
  (true, 'ONE THIRD
float   : 0.3333333433
double  : 0.3333333333
LARGE READING
float   : 123456792.0
double  : 123456789.0', true, NULL, 'Hidden test 3 - float cannot store the large reading exactly', 3, 'S1-C2-Q1', 'S1-C2-Q1-T4', 5000),
  (true, 'ONE THIRD
float   : 0.3333333433
double  : 0.3333333333
LARGE READING
float   : 123456792.0
double  : 123456789.0', true, NULL, 'Hidden test 4 - decimal places exactly as specified', 4, 'S1-C2-Q1', 'S1-C2-Q1-T5', 5000),
  (true, 'CHARACTER CHECK
Grade char  : A
Grade code  : 65
Next char   : B
BOOLEAN CHECK
Present     : 1
Absent      : 0', false, NULL, 'Sample case - decoder screen', 0, 'S1-C3-Q1', 'S1-C3-Q1-T1', 5000),
  (true, 'CHARACTER CHECK
Grade char  : A
Grade code  : 65
Next char   : B
BOOLEAN CHECK
Present     : 1
Absent      : 0', true, NULL, 'Hidden test 1 - character and its numeric code', 1, 'S1-C3-Q1', 'S1-C3-Q1-T2', 5000),
  (true, 'CHARACTER CHECK
Grade char  : A
Grade code  : 65
Next char   : B
BOOLEAN CHECK
Present     : 1
Absent      : 0', true, NULL, 'Hidden test 2 - next character printed as a letter', 2, 'S1-C3-Q1', 'S1-C3-Q1-T3', 5000),
  (true, 'CHARACTER CHECK
Grade char  : A
Grade code  : 65
Next char   : B
BOOLEAN CHECK
Present     : 1
Absent      : 0', true, NULL, 'Hidden test 3 - bool prints as 1 and 0', 3, 'S1-C3-Q1', 'S1-C3-Q1-T4', 5000),
  (true, 'CHARACTER CHECK
Grade char  : A
Grade code  : 65
Next char   : B
BOOLEAN CHECK
Present     : 1
Absent      : 0', true, NULL, 'Hidden test 4 - grade value unchanged after the addition', 4, 'S1-C3-Q1', 'S1-C3-Q1-T5', 5000),
  (true, 'CIRCLE METRICS
Radius        : 7.5000
Diameter      : 15.0000
Circumference : 47.1238
Area          : 176.7144', false, NULL, 'Sample case - circle metrics', 0, 'S1-C4-Q1', 'S1-C4-Q1-T1', 5000),
  (true, 'CIRCLE METRICS
Radius        : 7.5000
Diameter      : 15.0000
Circumference : 47.1238
Area          : 176.7144', true, NULL, 'Hidden test 1 - diameter calculated from the constant', 1, 'S1-C4-Q1', 'S1-C4-Q1-T2', 5000),
  (true, 'CIRCLE METRICS
Radius        : 7.5000
Diameter      : 15.0000
Circumference : 47.1238
Area          : 176.7144', true, NULL, 'Hidden test 2 - circumference to 4 decimals', 2, 'S1-C4-Q1', 'S1-C4-Q1-T3', 5000),
  (true, 'CIRCLE METRICS
Radius        : 7.5000
Diameter      : 15.0000
Circumference : 47.1238
Area          : 176.7144', true, NULL, 'Hidden test 3 - area to 4 decimals', 3, 'S1-C4-Q1', 'S1-C4-Q1-T4', 5000),
  (true, 'CIRCLE METRICS
Radius        : 7.5000
Diameter      : 15.0000
Circumference : 47.1238
Area          : 176.7144', true, NULL, 'Hidden test 4 - label alignment and heading text', 4, 'S1-C4-Q1', 'S1-C4-Q1-T5', 5000),
  (true, 'AVERAGE REPORT
Integer division : 76
Cast division    : 76.83
Truncated        : 76
Rounded          : 77
Grade            : C', false, NULL, 'Sample case - average report', 0, 'S1-C5-Q1', 'S1-C5-Q1-T1', 5000),
  (true, 'AVERAGE REPORT
Integer division : 76
Cast division    : 76.83
Truncated        : 76
Rounded          : 77
Grade            : C', true, NULL, 'Hidden test 1 - integer division discards the fraction', 1, 'S1-C5-Q1', 'S1-C5-Q1-T2', 5000),
  (true, 'AVERAGE REPORT
Integer division : 76
Cast division    : 76.83
Truncated        : 76
Rounded          : 77
Grade            : C', true, NULL, 'Hidden test 2 - cast applied to an operand, not the result', 2, 'S1-C5-Q1', 'S1-C5-Q1-T3', 5000),
  (true, 'AVERAGE REPORT
Integer division : 76
Cast division    : 76.83
Truncated        : 76
Rounded          : 77
Grade            : C', true, NULL, 'Hidden test 3 - truncated and rounded values differ', 3, 'S1-C5-Q1', 'S1-C5-Q1-T4', 5000),
  (true, 'AVERAGE REPORT
Integer division : 76
Cast division    : 76.83
Truncated        : 76
Rounded          : 77
Grade            : C', true, NULL, 'Hidden test 4 - grade built by casting an int to char', 4, 'S1-C5-Q1', 'S1-C5-Q1-T5', 5000),
  (true, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', false, NULL, 'Sample case - full trace', 0, 'S2-C1-Q1', 'S2-C1-Q1-T1', 5000),
  (true, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', true, NULL, 'Hidden test 1 - post-increment returns the old value', 1, 'S2-C1-Q1', 'S2-C1-Q1-T2', 5000),
  (true, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', true, NULL, 'Hidden test 2 - pre-increment returns the new value', 2, 'S2-C1-Q1', 'S2-C1-Q1-T3', 5000),
  (true, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', true, NULL, 'Hidden test 3 - positive quotient and remainder', 3, 'S2-C1-Q1', 'S2-C1-Q1-T4', 5000),
  (true, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', true, NULL, 'Hidden test 4 - negative quotient truncates towards zero', 4, 'S2-C1-Q1', 'S2-C1-Q1-T5', 5000),
  (true, 'COUNTER TRACE
start       : 10
counter++   : 10
after post  : 11
++counter   : 12
after pre   : 12
DIVISION CHECK
17 / 5      : 3
17 % 5      : 2
-17 / 5     : -3
-17 % 5     : -2', true, NULL, 'Hidden test 5 - remainder keeps the sign of the left operand', 5, 'S2-C1-Q1', 'S2-C1-Q1-T6', 5000),
  (true, 'STOCK TRACE
after add   : 150
after sub   : 120
after mul   : 240
after div   : 60
after mod   : 4', false, NULL, 'Sample case - stock trace', 0, 'S2-C2-Q1', 'S2-C2-Q1-T1', 5000),
  (true, 'STOCK TRACE
after add   : 150
after sub   : 120
after mul   : 240
after div   : 60
after mod   : 4', true, NULL, 'Hidden test 1 - addition and subtraction steps', 1, 'S2-C2-Q1', 'S2-C2-Q1-T2', 5000),
  (true, 'STOCK TRACE
after add   : 150
after sub   : 120
after mul   : 240
after div   : 60
after mod   : 4', true, NULL, 'Hidden test 2 - multiplication step', 2, 'S2-C2-Q1', 'S2-C2-Q1-T3', 5000),
  (true, 'STOCK TRACE
after add   : 150
after sub   : 120
after mul   : 240
after div   : 60
after mod   : 4', true, NULL, 'Hidden test 3 - integer division step', 3, 'S2-C2-Q1', 'S2-C2-Q1-T4', 5000),
  (true, 'STOCK TRACE
after add   : 150
after sub   : 120
after mul   : 240
after div   : 60
after mod   : 4', true, NULL, 'Hidden test 4 - remainder step keeps the loose units', 4, 'S2-C2-Q1', 'S2-C2-Q1-T5', 5000),
  (true, 'CONDITIONS
age >= 18     : 1
marks >= 50   : 0
att >= 75     : 1
all three AND : 0
first two OR  : 1
NOT marks     : 1
SHORT CIRCUIT
AND result    : 0
counter now   : 0
OR result     : 1
counter now   : 0', false, NULL, 'Sample case - truth table', 0, 'S2-C3-Q1', 'S2-C3-Q1-T1', 5000),
  (true, 'CONDITIONS
age >= 18     : 1
marks >= 50   : 0
att >= 75     : 1
all three AND : 0
first two OR  : 1
NOT marks     : 1
SHORT CIRCUIT
AND result    : 0
counter now   : 0
OR result     : 1
counter now   : 0', true, NULL, 'Hidden test 1 - individual comparisons print 1 or 0', 1, 'S2-C3-Q1', 'S2-C3-Q1-T2', 5000),
  (true, 'CONDITIONS
age >= 18     : 1
marks >= 50   : 0
att >= 75     : 1
all three AND : 0
first two OR  : 1
NOT marks     : 1
SHORT CIRCUIT
AND result    : 0
counter now   : 0
OR result     : 1
counter now   : 0', true, NULL, 'Hidden test 2 - combined AND is false, OR is true', 2, 'S2-C3-Q1', 'S2-C3-Q1-T3', 5000),
  (true, 'CONDITIONS
age >= 18     : 1
marks >= 50   : 0
att >= 75     : 1
all three AND : 0
first two OR  : 1
NOT marks     : 1
SHORT CIRCUIT
AND result    : 0
counter now   : 0
OR result     : 1
counter now   : 0', true, NULL, 'Hidden test 3 - NOT inverts the marks condition', 3, 'S2-C3-Q1', 'S2-C3-Q1-T4', 5000),
  (true, 'CONDITIONS
age >= 18     : 1
marks >= 50   : 0
att >= 75     : 1
all three AND : 0
first two OR  : 1
NOT marks     : 1
SHORT CIRCUIT
AND result    : 0
counter now   : 0
OR result     : 1
counter now   : 0', true, NULL, 'Hidden test 4 - counter stays zero after both expressions', 4, 'S2-C3-Q1', 'S2-C3-Q1-T5', 5000),
  (true, 'REGISTER
reg         : 12
reg & mask  : 8
reg | mask  : 14
reg ^ mask  : 6
reg << 2    : 48
reg >> 2    : 3
bit 3       : 1
UPDATES
set bit 1   : 14
clear bit 2 : 10', false, NULL, 'Sample case - register report', 0, 'S2-C4-Q1', 'S2-C4-Q1-T1', 5000),
  (true, 'REGISTER
reg         : 12
reg & mask  : 8
reg | mask  : 14
reg ^ mask  : 6
reg << 2    : 48
reg >> 2    : 3
bit 3       : 1
UPDATES
set bit 1   : 14
clear bit 2 : 10', true, NULL, 'Hidden test 1 - AND, OR and XOR results', 1, 'S2-C4-Q1', 'S2-C4-Q1-T2', 5000),
  (true, 'REGISTER
reg         : 12
reg & mask  : 8
reg | mask  : 14
reg ^ mask  : 6
reg << 2    : 48
reg >> 2    : 3
bit 3       : 1
UPDATES
set bit 1   : 14
clear bit 2 : 10', true, NULL, 'Hidden test 2 - left and right shift results', 2, 'S2-C4-Q1', 'S2-C4-Q1-T3', 5000),
  (true, 'REGISTER
reg         : 12
reg & mask  : 8
reg | mask  : 14
reg ^ mask  : 6
reg << 2    : 48
reg >> 2    : 3
bit 3       : 1
UPDATES
set bit 1   : 14
clear bit 2 : 10', true, NULL, 'Hidden test 3 - single bit test prints 1 or 0', 3, 'S2-C4-Q1', 'S2-C4-Q1-T4', 5000),
  (true, 'REGISTER
reg         : 12
reg & mask  : 8
reg | mask  : 14
reg ^ mask  : 6
reg << 2    : 48
reg >> 2    : 3
bit 3       : 1
UPDATES
set bit 1   : 14
clear bit 2 : 10', true, NULL, 'Hidden test 4 - set and clear update the right bits', 4, 'S2-C4-Q1', 'S2-C4-Q1-T5', 5000),
  (true, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', false, NULL, 'Sample case - precedence check', 0, 'S2-C5-Q1', 'S2-C5-Q1-T1', 5000),
  (true, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', true, NULL, 'Hidden test 1 - multiplication before addition', 1, 'S2-C5-Q1', 'S2-C5-Q1-T2', 5000),
  (true, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', true, NULL, 'Hidden test 2 - parentheses change the result', 2, 'S2-C5-Q1', 'S2-C5-Q1-T3', 5000),
  (true, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', true, NULL, 'Hidden test 3 - relational before equality', 3, 'S2-C5-Q1', 'S2-C5-Q1-T4', 5000),
  (true, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', true, NULL, 'Hidden test 4 - bitwise AND, XOR and OR order', 4, 'S2-C5-Q1', 'S2-C5-Q1-T5', 5000),
  (true, 'PRECEDENCE CHECK
expr 1      : 14
expr 2      : 20
expr 3      : 12
expr 4      : 0
expr 5      : 3
expr 6      : 10
expr 7      : 8', true, NULL, 'Hidden test 5 - shift sits below addition', 5, 'S2-C5-Q1', 'S2-C5-Q1-T6', 5000),
  (true, 'Code  : 00042
Price :      12.50
Qty   :          3
Total :      37.50', false, '42 12.50 3', 'Sample case - ordinary bill', 0, 'S3-C1-Q1', 'S3-C1-Q1-T1', 5000),
  (true, 'Code  : 00100
Price :       9.99
Qty   :          2
Total :      19.98', true, '100 9.99 2', 'Hidden test 1 - easy: small values', 1, 'S3-C1-Q1', 'S3-C1-Q1-T2', 5000),
  (true, 'Code  : 12345
Price :     250.75
Qty   :         40
Total :   10030.00', true, '12345 250.75 40', 'Hidden test 2 - medium: mid-range bill', 2, 'S3-C1-Q1', 'S3-C1-Q1-T3', 5000),
  (true, 'Code  : 99999
Price :   99999.99
Qty   :       1000
Total : 99999990.00', true, '99999 99999.99 1000', 'Hidden test 3 - hard: widest columns', 3, 'S3-C1-Q1', 'S3-C1-Q1-T4', 5000),
  (true, 'Code  : 00007
Price :    1234.56
Qty   :        999
Total : 1233325.44', true, '7 1234.56 999', 'Hidden test 4 - constraint: large total needs a double', 4, 'S3-C1-Q1', 'S3-C1-Q1-T5', 5000),
  (true, 'Code  : 00001
Price :       0.00
Qty   :          0
Total :       0.00', true, '1 0.00 0', 'Hidden test 5 - zero quantity and zero price', 5, 'S3-C1-Q1', 'S3-C1-Q1-T6', 5000),
  (true, 'Admission : 12
Section   : A
Marks     : 87.50', false, '12 A 87.5', 'Sample case - short admission number', 0, 'S3-C2-Q1', 'S3-C2-Q1-T1', 5000),
  (true, 'Admission : 101
Section   : B
Marks     : 65.25', true, '101 B 65.25', 'Hidden test 1 - easy: three digit number', 1, 'S3-C2-Q1', 'S3-C2-Q1-T2', 5000),
  (true, 'Admission : 123456789
Section   : C
Marks     : 48.50', true, '123456789 C 48.5', 'Hidden test 2 - medium: nine digit number', 2, 'S3-C2-Q1', 'S3-C2-Q1-T3', 5000),
  (true, 'Admission : 9999999999
Section   : Z
Marks     : 100.00', true, '9999999999 Z 100', 'Hidden test 3 - hard: largest admission number', 3, 'S3-C2-Q1', 'S3-C2-Q1-T4', 5000),
  (true, 'Admission : 9876543210
Section   : M
Marks     : 72.46', true, '9876543210 M 72.456', 'Hidden test 4 - constraint: 10-digit number overflows an int', 4, 'S3-C2-Q1', 'S3-C2-Q1-T5', 5000),
  (true, 'Admission : 1
Section   : A
Marks     : 0.00', true, '1 A 0', 'Hidden test 5 - smallest values including zero marks', 5, 'S3-C2-Q1', 'S3-C2-Q1-T6', 5000),
  (true, 'Accepted : 45', false, '45', 'Sample case - accepted quantity', 0, 'S3-C3-Q1', 'S3-C3-Q1-T1', 5000),
  (true, 'Accepted : 3', true, '3', 'Hidden test 1 - easy: small accepted value', 1, 'S3-C3-Q1', 'S3-C3-Q1-T2', 5000),
  (true, 'Accepted : 100', true, '100', 'Hidden test 2 - medium: upper boundary accepted', 2, 'S3-C3-Q1', 'S3-C3-Q1-T3', 5000),
  (true, 'Out of range', true, '101', 'Hidden test 3 - hard: just past the upper boundary', 3, 'S3-C3-Q1', 'S3-C3-Q1-T4', 5000),
  (true, 'Out of range', true, '-7', 'Hidden test 4 - constraint: negative number is out of range', 4, 'S3-C3-Q1', 'S3-C3-Q1-T5', 5000),
  (true, 'Invalid input', true, 'twelve', 'Hidden test 5 - zero and non-numeric text', 5, 'S3-C3-Q1', 'S3-C3-Q1-T6', 5000),
  (true, 'User    : kumar
Initial : k
Grade   : A
Code    : 65', false, 'kumar
A', 'Sample case - short tag', 0, 'S3-C4-Q1', 'S3-C4-Q1-T1', 5000),
  (true, 'User    : r
Initial : r
Grade   : B
Code    : 66', true, 'r
B', 'Hidden test 1 - easy: single character tag', 1, 'S3-C4-Q1', 'S3-C4-Q1-T2', 5000),
  (true, 'User    : arun2026
Initial : a
Grade   : K
Code    : 75', true, 'arun2026
K', 'Hidden test 2 - medium: tag with digits', 2, 'S3-C4-Q1', 'S3-C4-Q1-T3', 5000),
  (true, 'User    : priyadharshini12
Initial : p
Grade   : Z
Code    : 90', true, 'priyadharshini12
Z', 'Hidden test 3 - hard: last letter of the alphabet', 3, 'S3-C4-Q1', 'S3-C4-Q1-T4', 5000),
  (true, 'User    : abcdefghij1234567890
Initial : a
Grade   : A
Code    : 65', true, 'abcdefghij1234567890
A', 'Hidden test 4 - constraint: tag of the full 20 characters', 4, 'S3-C4-Q1', 'S3-C4-Q1-T5', 5000),
  (true, 'User    : zephyr
Initial : z
Grade   : Z
Code    : 90', true, 'zephyr
Z', 'Hidden test 5 - lowercase start and highest code', 5, 'S3-C4-Q1', 'S3-C4-Q1-T6', 5000),
  (true, 'Age    : 21
City   : New Delhi
Active : Y', false, '21
New Delhi
Y', 'Sample case - city with a space', 0, 'S3-C5-Q1', 'S3-C5-Q1-T1', 5000),
  (true, 'Age    : 18
City   : Chennai
Active : Y', true, '18
Chennai
Y', 'Hidden test 1 - easy: single word city', 1, 'S3-C5-Q1', 'S3-C5-Q1-T2', 5000),
  (true, 'Age    : 30
City   : Navi Mumbai West
Active : N', true, '30
Navi Mumbai West
N', 'Hidden test 2 - medium: three word city', 2, 'S3-C5-Q1', 'S3-C5-Q1-T3', 5000);

insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, 'Age    : 120
City   : Thiruvananthapuram
Active : Y', true, '120
Thiruvananthapuram
Y', 'Hidden test 3 - hard: oldest allowed age', 3, 'S3-C5-Q1', 'S3-C5-Q1-T4', 5000),
  (true, 'Age    : 40
City   : Abcdefghij Klmnopqrst Uvwxyzabcd Efghijklmn Opqrs
Active : N', true, '40
Abcdefghij Klmnopqrst Uvwxyzabcd Efghijklmn Opqrs
N', 'Hidden test 4 - constraint: city of the full 50 characters', 4, 'S3-C5-Q1', 'S3-C5-Q1-T5', 5000),
  (true, 'Age    : 1
City   : Port Blair
Active : Y', true, '1
Port Blair
Y', 'Hidden test 5 - youngest age with a two word city', 5, 'S3-C5-Q1', 'S3-C5-Q1-T6', 5000),
  (true, 'ELIGIBILITY REPORT
Merit criteria met
Attendance criteria met
Scholarship approved
Check complete', false, '88 92', 'Sample case - both criteria met', 0, 'S4-C1-Q1', 'S4-C1-Q1-T1', 5000),
  (true, 'ELIGIBILITY REPORT
Attendance criteria met
Check complete', true, '60 95', 'Hidden test 1 - easy: only attendance met', 1, 'S4-C1-Q1', 'S4-C1-Q1-T2', 5000),
  (true, 'ELIGIBILITY REPORT
Merit criteria met
Check complete', true, '90 55', 'Hidden test 2 - medium: only merit met', 2, 'S4-C1-Q1', 'S4-C1-Q1-T3', 5000),
  (true, 'ELIGIBILITY REPORT
Merit criteria met
Attendance criteria met
Scholarship approved
Check complete', true, '100 100', 'Hidden test 3 - hard: full marks and full attendance', 3, 'S4-C1-Q1', 'S4-C1-Q1-T4', 5000),
  (true, 'ELIGIBILITY REPORT
Merit criteria met
Attendance criteria met
Scholarship approved
Check complete', true, '75 80', 'Hidden test 4 - constraint: exactly on both boundaries', 4, 'S4-C1-Q1', 'S4-C1-Q1-T5', 5000),
  (true, 'ELIGIBILITY REPORT
Check complete', true, '0 0', 'Hidden test 5 - zero values and one below each boundary', 5, 'S4-C1-Q1', 'S4-C1-Q1-T6', 5000),
  (true, 'Parity : Even
Sign   : Positive', false, '18', 'Sample case - positive even', 0, 'S4-C2-Q1', 'S4-C2-Q1-T1', 5000),
  (true, 'Parity : Odd
Sign   : Positive', true, '45', 'Hidden test 1 - easy: positive odd', 1, 'S4-C2-Q1', 'S4-C2-Q1-T2', 5000),
  (true, 'Parity : Even
Sign   : Negative', true, '-64', 'Hidden test 2 - medium: negative even', 2, 'S4-C2-Q1', 'S4-C2-Q1-T3', 5000),
  (true, 'Parity : Odd
Sign   : Positive', true, '9999999999', 'Hidden test 3 - hard: ten digit positive value', 3, 'S4-C2-Q1', 'S4-C2-Q1-T4', 5000),
  (true, 'Parity : Odd
Sign   : Negative', true, '-9876543211', 'Hidden test 4 - constraint: ten digit negative value', 4, 'S4-C2-Q1', 'S4-C2-Q1-T5', 5000),
  (true, 'Parity : Even
Sign   : Zero', true, '0', 'Hidden test 5 - zero and negative odd behaviour', 5, 'S4-C2-Q1', 'S4-C2-Q1-T6', 5000),
  (true, 'Item : Tea
Rate : 10.00
Total: 30.00', false, '1 3', 'Sample case - tea for three', 0, 'S4-C3-Q1', 'S4-C3-Q1-T1', 5000),
  (true, 'Item : Coffee
Rate : 15.00
Total: 15.00', true, '2 1', 'Hidden test 1 - easy: coffee for one', 1, 'S4-C3-Q1', 'S4-C3-Q1-T2', 5000),
  (true, 'Item : Sandwich
Rate : 40.00
Total: 480.00', true, '3 12', 'Hidden test 2 - medium: sandwich order', 2, 'S4-C3-Q1', 'S4-C3-Q1-T3', 5000),
  (true, 'Item : Juice
Rate : 25.00
Total: 12500.00', true, '4 500', 'Hidden test 3 - hard: largest allowed quantity', 3, 'S4-C3-Q1', 'S4-C3-Q1-T4', 5000),
  (true, 'Invalid choice', true, '9 4', 'Hidden test 4 - constraint: choice outside the menu', 4, 'S4-C3-Q1', 'S4-C3-Q1-T5', 5000),
  (true, 'Invalid choice', true, '0 0', 'Hidden test 5 - zero quantity and negative choice', 5, 'S4-C3-Q1', 'S4-C3-Q1-T6', 5000),
  (true, 'Category : Gold
Discount : 20
Payable  : 8000.00', false, '10000 G', 'Sample case - gold member', 0, 'S4-C4-Q1', 'S4-C4-Q1-T1', 5000),
  (true, 'Category : Silver
Discount : 10
Payable  : 1800.00', true, '2000 S', 'Hidden test 1 - easy: silver member', 1, 'S4-C4-Q1', 'S4-C4-Q1-T2', 5000),
  (true, 'Category : Bronze
Discount : 5
Payable  : 1424.99', true, '1499.99 B', 'Hidden test 2 - medium: bronze member with paise', 2, 'S4-C4-Q1', 'S4-C4-Q1-T3', 5000),
  (true, 'Category : Gold
Discount : 20
Payable  : 800000000.00', true, '1000000000.00 G', 'Hidden test 3 - hard: largest allowed bill', 3, 'S4-C4-Q1', 'S4-C4-Q1-T4', 5000),
  (true, 'Category : None
Discount : 0
Payable  : 756421.75', true, '756421.75 X', 'Hidden test 4 - constraint: unlisted band gets no discount', 4, 'S4-C4-Q1', 'S4-C4-Q1-T5', 5000),
  (true, 'Category : Silver
Discount : 10
Payable  : 0.00', true, '0 S', 'Hidden test 5 - zero amount with a discount band', 5, 'S4-C4-Q1', 'S4-C4-Q1-T6', 5000),
  (true, 'Grade  : A
Result : Pass', false, '85', 'Sample case - grade A', 0, 'S4-C5-Q1', 'S4-C5-Q1-T1', 5000),
  (true, 'Grade  : O
Result : Pass', true, '97', 'Hidden test 1 - easy: top band', 1, 'S4-C5-Q1', 'S4-C5-Q1-T2', 5000),
  (true, 'Grade  : C
Result : Pass', true, '64', 'Hidden test 2 - medium: middle band', 2, 'S4-C5-Q1', 'S4-C5-Q1-T3', 5000),
  (true, 'Grade  : E
Result : Pass', true, '40', 'Hidden test 3 - hard: exactly on the pass boundary', 3, 'S4-C5-Q1', 'S4-C5-Q1-T4', 5000),
  (true, 'Invalid marks', true, '150', 'Hidden test 4 - constraint: mark above the allowed range', 4, 'S4-C5-Q1', 'S4-C5-Q1-T5', 5000),
  (true, 'Invalid marks', true, '-3', 'Hidden test 5 - zero and negative marks', 5, 'S4-C5-Q1', 'S4-C5-Q1-T6', 5000),
  (true, 'Total    : 14
Positive : 2
Negative : 2
Zero     : 1', false, '5
12 -4 0 9 -3', 'Sample case - mixed batch', 0, 'S5-C1-Q1', 'S5-C1-Q1-T1', 5000),
  (true, 'Total    : 42
Positive : 1
Negative : 0
Zero     : 0', true, '1
42', 'Hidden test 1 - easy: single reading', 1, 'S5-C1-Q1', 'S5-C1-Q1-T2', 5000),
  (true, 'Total    : 500
Positive : 10
Negative : 0
Zero     : 0', true, '10
5 15 25 35 45 55 65 75 85 95', 'Hidden test 2 - medium: ten readings', 2, 'S5-C1-Q1', 'S5-C1-Q1-T3', 5000),
  (true, 'Total    : 10000000000
Positive : 5
Negative : 0
Zero     : 0', true, '5
2000000000 2000000000 2000000000 2000000000 2000000000', 'Hidden test 3 - hard: large readings that overflow an int', 3, 'S5-C1-Q1', 'S5-C1-Q1-T4', 5000),
  (true, 'Total    : -8000000000
Positive : 0
Negative : 4
Zero     : 0', true, '4
-2000000000 -2000000000 -2000000000 -2000000000', 'Hidden test 4 - constraint: largest negative readings', 4, 'S5-C1-Q1', 'S5-C1-Q1-T5', 5000),
  (true, 'Total    : 0
Positive : 2
Negative : 2
Zero     : 3', true, '7
0 -8 8 0 -1 1 0', 'Hidden test 5 - positive, negative and zero together', 5, 'S5-C1-Q1', 'S5-C1-Q1-T6', 5000),
  (true, 'Digits  : 5
Sum     : 15
Reverse : 54321', false, '12345', 'Sample case - five digit number', 0, 'S5-C2-Q1', 'S5-C2-Q1-T1', 5000),
  (true, 'Digits  : 1
Sum     : 7
Reverse : 7', true, '7', 'Hidden test 1 - easy: single digit', 1, 'S5-C2-Q1', 'S5-C2-Q1-T2', 5000),
  (true, 'Digits  : 4
Sum     : 3
Reverse : 21', true, '1200', 'Hidden test 2 - medium: trailing zeros disappear', 2, 'S5-C2-Q1', 'S5-C2-Q1-T3', 5000),
  (true, 'Digits  : 10
Sum     : 45
Reverse : 123456789', true, '9876543210', 'Hidden test 3 - hard: ten digit number', 3, 'S5-C2-Q1', 'S5-C2-Q1-T4', 5000),
  (true, 'Digits  : 10
Sum     : 45
Reverse : -4536271809', true, '-9081726354', 'Hidden test 4 - constraint: ten digit negative number', 4, 'S5-C2-Q1', 'S5-C2-Q1-T5', 5000),
  (true, 'Digits  : 1
Sum     : 0
Reverse : 0', true, '0', 'Hidden test 5 - zero and a negative single digit', 5, 'S5-C2-Q1', 'S5-C2-Q1-T6', 5000),
  (true, 'Count   : 3
Total   : 6
Average : 2.00
Maximum : 5', false, '5 3 -2 0', 'Sample case - three readings', 0, 'S5-C3-Q1', 'S5-C3-Q1-T1', 5000),
  (true, 'Count   : 1
Total   : 12
Average : 12.00
Maximum : 12', true, '12 0', 'Hidden test 1 - easy: one reading', 1, 'S5-C3-Q1', 'S5-C3-Q1-T2', 5000),
  (true, 'Count   : 8
Total   : 124
Average : 15.50
Maximum : 42', true, '4 8 15 16
23 42 7 9 0', 'Hidden test 2 - medium: eight readings on two lines', 2, 'S5-C3-Q1', 'S5-C3-Q1-T3', 5000),
  (true, 'Count   : 4
Total   : 1999999
Average : 499999.75
Maximum : 1000000', true, '1000000 999999 1000000 -1000000 0', 'Hidden test 3 - hard: largest allowed values', 3, 'S5-C3-Q1', 'S5-C3-Q1-T4', 5000),
  (true, 'No readings', true, '0', 'Hidden test 4 - constraint: marker arrives first, no division', 4, 'S5-C3-Q1', 'S5-C3-Q1-T5', 5000),
  (true, 'Count   : 4
Total   : -138
Average : -34.50
Maximum : -1', true, '-5 -90 -1 -42 0', 'Hidden test 5 - only negative readings', 5, 'S5-C3-Q1', 'S5-C3-Q1-T6', 5000),
  (true, 'Inspected : 4
Position  : 4
Weight    : 41', false, '6 50
72 68 55 41 90 60', 'Sample case - defect in the middle', 0, 'S5-C4-Q1', 'S5-C4-Q1-T1', 5000),
  (true, 'Inspected : 5
All units passed', true, '5 10
12 15 10 30 44', 'Hidden test 1 - easy: every unit passes', 1, 'S5-C4-Q1', 'S5-C4-Q1-T2', 5000),
  (true, 'Inspected : 1
Position  : 1
Weight    : 99', true, '4 100
99 500 400 300', 'Hidden test 2 - medium: defect on the first unit', 2, 'S5-C4-Q1', 'S5-C4-Q1-T3', 5000),
  (true, 'Inspected : 8
Position  : 8
Weight    : 19', true, '8 20
21 22 23 24 25 26 27 19', 'Hidden test 3 - hard: defect on the last unit', 3, 'S5-C4-Q1', 'S5-C4-Q1-T4', 5000),
  (true, 'Inspected : 3
All units passed', true, '3 45
45 45 45', 'Hidden test 4 - constraint: weight equal to the threshold passes', 4, 'S5-C4-Q1', 'S5-C4-Q1-T5', 5000),
  (true, 'Inspected : 4
Position  : 4
Weight    : -9', true, '5 -5
0 -3 -4 -9 7', 'Hidden test 5 - negative and zero weights with a negative threshold', 5, 'S5-C4-Q1', 'S5-C4-Q1-T6', 5000),
  (true, 'Accepted : 4
Skipped  : 3
Total    : 250
Average  : 62.50', false, '7
40 -3 55 0 65 -12 90', 'Sample case - mixed consignment', 0, 'S5-C5-Q1', 'S5-C5-Q1-T1', 5000),
  (true, 'Accepted : 5
Skipped  : 0
Total    : 150
Average  : 30.00', true, '5
10 20 30 40 50', 'Hidden test 1 - easy: every box usable', 1, 'S5-C5-Q1', 'S5-C5-Q1-T2', 5000),
  (true, 'Accepted : 4
Skipped  : 4
Total    : 120
Average  : 30.00', true, '8
12 -12 24 -24 36 -36 48 -48', 'Hidden test 2 - medium: alternating damaged boxes', 2, 'S5-C5-Q1', 'S5-C5-Q1-T3', 5000),
  (true, 'Accepted : 2
Skipped  : 1
Total    : 200000
Average  : 100000.00', true, '3
100000 100000 -100000', 'Hidden test 3 - hard: heaviest allowed boxes', 3, 'S5-C5-Q1', 'S5-C5-Q1-T4', 5000),
  (true, 'Accepted : 0
Skipped  : 4
Total    : 0
Average  : 0.00', true, '4
-1 0 -5 0', 'Hidden test 4 - constraint: nothing accepted, no division', 4, 'S5-C5-Q1', 'S5-C5-Q1-T5', 5000),
  (true, 'Accepted : 2
Skipped  : 4
Total    : 21
Average  : 10.50', true, '6
0 7 -7 0 14 0', 'Hidden test 5 - positive, negative and zero weights together', 5, 'S5-C5-Q1', 'S5-C5-Q1-T6', 5000),
  (true, 'TRIANGLE
1
1 2
1 2 3
GRID
   1   2   3
   2   4   6
   3   6   9', false, '3', 'Sample case - size three', 0, 'S5-C6-Q1', 'S5-C6-Q1-T1', 5000),
  (true, 'TRIANGLE
1
1 2
GRID
   1   2
   2   4', true, '2', 'Hidden test 1 - easy: size two', 1, 'S5-C6-Q1', 'S5-C6-Q1-T2', 5000),
  (true, 'TRIANGLE
1
1 2
1 2 3
1 2 3 4
1 2 3 4 5
GRID
   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25', true, '5', 'Hidden test 2 - medium: size five', 2, 'S5-C6-Q1', 'S5-C6-Q1-T3', 5000),
  (true, 'TRIANGLE
1
1 2
1 2 3
1 2 3 4
1 2 3 4 5
1 2 3 4 5 6
1 2 3 4 5 6 7
1 2 3 4 5 6 7 8
1 2 3 4 5 6 7 8 9
GRID
   1   2   3   4   5   6   7   8   9
   2   4   6   8  10  12  14  16  18
   3   6   9  12  15  18  21  24  27
   4   8  12  16  20  24  28  32  36
   5  10  15  20  25  30  35  40  45
   6  12  18  24  30  36  42  48  54
   7  14  21  28  35  42  49  56  63
   8  16  24  32  40  48  56  64  72
   9  18  27  36  45  54  63  72  81', true, '9', 'Hidden test 3 - hard: largest allowed size', 3, 'S5-C6-Q1', 'S5-C6-Q1-T4', 5000),
  (true, 'TRIANGLE
1
1 2
1 2 3
1 2 3 4
1 2 3 4 5
1 2 3 4 5 6
1 2 3 4 5 6 7
1 2 3 4 5 6 7 8
GRID
   1   2   3   4   5   6   7   8
   2   4   6   8  10  12  14  16
   3   6   9  12  15  18  21  24
   4   8  12  16  20  24  28  32
   5  10  15  20  25  30  35  40
   6  12  18  24  30  36  42  48
   7  14  21  28  35  42  49  56
   8  16  24  32  40  48  56  64', true, '8', 'Hidden test 4 - constraint: grid values still fit the 4 character field', 4, 'S5-C6-Q1', 'S5-C6-Q1-T5', 5000),
  (true, 'TRIANGLE
1
GRID
   1', true, '1', 'Hidden test 5 - smallest size, one row per section', 5, 'S5-C6-Q1', 'S5-C6-Q1-T6', 5000),
  (true, 'Count : 5
Values: 12 7 9 4 3', false, '5
12 7 9 4 3', 'Sample case - five readings', 0, 'S6-C1-Q1', 'S6-C1-Q1-T1', 5000),
  (true, 'Count : 3
Values: 1 2 3', true, '3
1 2 3', 'Hidden test 1 - easy: three readings', 1, 'S6-C1-Q1', 'S6-C1-Q1-T2', 5000),
  (true, 'Count : 12
Values: 5 10 15 20 25 30 35 40 45 50 55 60', true, '12
5 10 15 20 25 30 35 40 45 50 55 60', 'Hidden test 2 - medium: twelve readings', 2, 'S6-C1-Q1', 'S6-C1-Q1-T3', 5000),
  (true, 'Count : 100
Values: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100', true, '100
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100', 'Hidden test 3 - hard: largest allowed batch', 3, 'S6-C1-Q1', 'S6-C1-Q1-T4', 5000),
  (true, 'Count : 4
Values: 100000 -100000 100000 -100000', true, '4
100000 -100000 100000 -100000', 'Hidden test 4 - constraint: largest and smallest allowed values', 4, 'S6-C1-Q1', 'S6-C1-Q1-T5', 5000),
  (true, 'Count : 1
Values: 0', true, '1
0', 'Hidden test 5 - single reading, positive negative and zero mix', 5, 'S6-C1-Q1', 'S6-C1-Q1-T6', 5000),
  (true, 'Length  : 5
First   : k
Last    : r
Reverse : ramuk', false, 'kumar', 'Sample case - five letter word', 0, 'S6-C10-Q1', 'S6-C10-Q1-T1', 5000),
  (true, 'Length  : 3
First   : a
Last    : c
Reverse : cba', true, 'abc', 'Hidden test 1 - easy: three letter word', 1, 'S6-C10-Q1', 'S6-C10-Q1-T2', 5000),
  (true, 'Length  : 10
First   : r
Last    : b
Reverse : bal6202ger', true, 'reg2026lab', 'Hidden test 2 - medium: word with digits', 2, 'S6-C10-Q1', 'S6-C10-Q1-T3', 5000),
  (true, 'Length  : 50
First   : a
Last    : b
Reverse : bbbbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaaa', true, 'aaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbb', 'Hidden test 3 - hard: fifty character word', 3, 'S6-C10-Q1', 'S6-C10-Q1-T4', 5000),
  (true, 'Length  : 50
First   : Z
Last    : Z
Reverse : ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', true, 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'Hidden test 4 - constraint: word using the full array', 4, 'S6-C10-Q1', 'S6-C10-Q1-T5', 5000),
  (true, 'Length  : 1
First   : x
Last    : x
Reverse : x', true, 'x', 'Hidden test 5 - single character word', 5, 'S6-C10-Q1', 'S6-C10-Q1-T6', 5000),
  (true, 'Sum      : 80
Largest  : 90
Smallest : -77
Average  : 13.33', false, '6
34 -12 90 0 45 -77', 'Sample case - mixed batch', 0, 'S6-C11-Q1', 'S6-C11-Q1-T1', 5000),
  (true, 'Sum      : 36
Largest  : 19
Smallest : 3
Average  : 9.00', true, '4
8 3 19 6', 'Hidden test 1 - easy: four positive readings', 1, 'S6-C11-Q1', 'S6-C11-Q1-T2', 5000),
  (true, 'Sum      : 427
Largest  : 91
Smallest : 3
Average  : 42.70', true, '10
12 45 7 89 23 56 91 3 67 34', 'Hidden test 2 - medium: ten readings', 2, 'S6-C11-Q1', 'S6-C11-Q1-T3', 5000),
  (true, 'Sum      : 9995050
Largest  : 100000
Smallest : 99901
Average  : 99950.50', true, '100
100000 99999 99998 99997 99996 99995 99994 99993 99992 99991 99990 99989 99988 99987 99986 99985 99984 99983 99982 99981 99980 99979 99978 99977 99976 99975 99974 99973 99972 99971 99970 99969 99968 99967 99966 99965 99964 99963 99962 99961 99960 99959 99958 99957 99956 99955 99954 99953 99952 99951 99950 99949 99948 99947 99946 99945 99944 99943 99942 99941 99940 99939 99938 99937 99936 99935 99934 99933 99932 99931 99930 99929 99928 99927 99926 99925 99924 99923 99922 99921 99920 99919 99918 99917 99916 99915 99914 99913 99912 99911 99910 99909 99908 99907 99906 99905 99904 99903 99902 99901', 'Hidden test 3 - hard: hundred large readings', 3, 'S6-C11-Q1', 'S6-C11-Q1-T4', 5000),
  (true, 'Sum      : -133
Largest  : -2
Smallest : -77
Average  : -26.60', true, '5
-4 -19 -2 -77 -31', 'Hidden test 4 - constraint: all readings negative', 4, 'S6-C11-Q1', 'S6-C11-Q1-T5', 5000),
  (true, 'Sum      : 0
Largest  : 0
Smallest : 0
Average  : 0.00', true, '1
0', 'Hidden test 5 - single reading equal to zero', 5, 'S6-C11-Q1', 'S6-C11-Q1-T6', 5000),
  (true, 'First   : 12
Last    : 3
Element : 9', false, '5
12 7 9 4 3
3', 'Sample case - middle position', 0, 'S6-C2-Q1', 'S6-C2-Q1-T1', 5000),
  (true, 'First   : 10
Last    : 40
Element : 10', true, '4
10 20 30 40
1', 'Hidden test 1 - easy: first position', 1, 'S6-C2-Q1', 'S6-C2-Q1-T2', 5000),
  (true, 'First   : 3
Last    : 30
Element : 21', true, '10
3 6 9 12 15 18 21 24 27 30
7', 'Hidden test 2 - medium: position inside a longer list', 2, 'S6-C2-Q1', 'S6-C2-Q1-T3', 5000),
  (true, 'First   : 1
Last    : 400
Element : 400', true, '20
1 4 9 16 25 36 49 64 81 100 121 144 169 196 225 256 289 324 361 400
20', 'Hidden test 3 - hard: last position of a long list', 3, 'S6-C2-Q1', 'S6-C2-Q1-T4', 5000),
  (true, 'First   : 5
Last    : 0
Element : 0', true, '6
5 4 3 2 1 0
6', 'Hidden test 4 - constraint: position n must use index n - 1', 4, 'S6-C2-Q1', 'S6-C2-Q1-T5', 5000),
  (true, 'First   : -25
Last    : -25
Element : -25', true, '1
-25
1', 'Hidden test 5 - single item list with a negative value', 5, 'S6-C2-Q1', 'S6-C2-Q1-T6', 5000),
  (true, 'Allotted: 4
Free    : 6
Board   : 1201 3309 45 7788 0 0 0 0 0 0', false, '4
1201 3309 45 7788', 'Sample case - four slots allotted', 0, 'S6-C3-Q1', 'S6-C3-Q1-T1', 5000),
  (true, 'Allotted: 1
Free    : 9
Board   : 9 0 0 0 0 0 0 0 0 0', true, '1
9', 'Hidden test 1 - easy: one slot allotted', 1, 'S6-C3-Q1', 'S6-C3-Q1-T2', 5000),
  (true, 'Allotted: 5
Free    : 5
Board   : 11 22 33 44 55 0 0 0 0 0', true, '5
11 22 33 44 55', 'Hidden test 2 - medium: half the board allotted', 2, 'S6-C3-Q1', 'S6-C3-Q1-T3', 5000),
  (true, 'Allotted: 10
Free    : 0
Board   : 1 22 333 4444 5 66 777 8888 9 1010', true, '10
1 22 333 4444 5 66 777 8888 9 1010', 'Hidden test 3 - hard: every slot allotted', 3, 'S6-C3-Q1', 'S6-C3-Q1-T4', 5000),
  (true, 'Allotted: 0
Free    : 10
Board   : 0 0 0 0 0 0 0 0 0 0', true, '0', 'Hidden test 4 - constraint: no slot allotted, board stays zero', 4, 'S6-C3-Q1', 'S6-C3-Q1-T5', 5000),
  (true, 'Allotted: 3
Free    : 7
Board   : 9999 1 9999 0 0 0 0 0 0 0', true, '3
9999 1 9999', 'Hidden test 5 - largest allowed vehicle numbers', 5, 'S6-C3-Q1', 'S6-C3-Q1-T6', 5000),
  (true, 'Total   : 150
Average : 30.00
Above   : 2
Below   : 2
Equal   : 1', false, '5
10 20 30 40 50', 'Sample case - spread readings', 0, 'S6-C4-Q1', 'S6-C4-Q1-T1', 5000);

insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, 'Total   : 12
Average : 6.00
Above   : 1
Below   : 1
Equal   : 0', true, '2
4 8', 'Hidden test 1 - easy: two readings', 1, 'S6-C4-Q1', 'S6-C4-Q1-T2', 5000),
  (true, 'Total   : 150
Average : 16.67
Above   : 3
Below   : 6
Equal   : 0', true, '9
3 18 7 42 5 5 60 1 9', 'Hidden test 2 - medium: nine mixed readings', 2, 'S6-C4-Q1', 'S6-C4-Q1-T3', 5000),
  (true, 'Total   : 3825
Average : 76.50
Above   : 25
Below   : 25
Equal   : 0', true, '50
3 6 9 12 15 18 21 24 27 30 33 36 39 42 45 48 51 54 57 60 63 66 69 72 75 78 81 84 87 90 93 96 99 102 105 108 111 114 117 120 123 126 129 132 135 138 141 144 147 150', 'Hidden test 3 - hard: fifty readings', 3, 'S6-C4-Q1', 'S6-C4-Q1-T4', 5000),
  (true, 'Total   : 28
Average : 7.00
Above   : 0
Below   : 0
Equal   : 4', true, '4
7 7 7 7', 'Hidden test 4 - constraint: identical readings all equal the average', 4, 'S6-C4-Q1', 'S6-C4-Q1-T5', 5000),
  (true, 'Total   : 0
Average : 0.00
Above   : 2
Below   : 2
Equal   : 2', true, '6
-10 0 10 -20 0 20', 'Hidden test 5 - positive, negative and zero readings', 5, 'S6-C4-Q1', 'S6-C4-Q1-T6', 5000),
  (true, '12
3
Out of bounds', false, '5
12 7 9 4 3
3
0
4
5', 'Sample case - valid and invalid queries', 0, 'S6-C5-Q1', 'S6-C5-Q1-T1', 5000),
  (true, '10
20
30
40', true, '4
10 20 30 40
4
0
1
2
3', 'Hidden test 1 - easy: every query valid', 1, 'S6-C5-Q1', 'S6-C5-Q1-T2', 5000),
  (true, '3
Out of bounds
0
Out of bounds
5', true, '6
5 4 3 2 1 0
5
2
6
5
9
0', 'Hidden test 2 - medium: mixture of valid and invalid', 2, 'S6-C5-Q1', 'S6-C5-Q1-T3', 5000),
  (true, '99
Out of bounds
Out of bounds', true, '1
99
3
0
1
2', 'Hidden test 3 - hard: single element list', 3, 'S6-C5-Q1', 'S6-C5-Q1-T4', 5000),
  (true, 'Out of bounds
10', true, '5
2 4 6 8 10
2
5
4', 'Hidden test 4 - constraint: index n is one past the end', 4, 'S6-C5-Q1', 'S6-C5-Q1-T5', 5000),
  (true, 'Out of bounds
-7
Out of bounds', true, '3
-7 0 7
3
-1
0
-1000', 'Hidden test 5 - negative index and zero index', 5, 'S6-C5-Q1', 'S6-C5-Q1-T6', 5000),
  (true, 'Smallest : -77
Largest  : 90
Total    : 80
Average  : 13.33
Range    : 167', false, '6
34 -12 90 0 45 -77', 'Sample case - mixed batch', 0, 'S6-C6-Q1', 'S6-C6-Q1-T1', 5000),
  (true, 'Smallest : 10
Largest  : 30
Total    : 60
Average  : 20.00
Range    : 20', true, '3
10 20 30', 'Hidden test 1 - easy: three positive readings', 1, 'S6-C6-Q1', 'S6-C6-Q1-T2', 5000),
  (true, 'Smallest : 3
Largest  : 42
Total    : 156
Average  : 19.50
Range    : 39', true, '8
15 3 27 9 42 6 33 21', 'Hidden test 2 - medium: eight readings', 2, 'S6-C6-Q1', 'S6-C6-Q1-T3', 5000),
  (true, 'Smallest : -100000
Largest  : 100000
Total    : 0
Average  : 0.00
Range    : 200000', true, '5
100000 -100000 0 99999 -99999', 'Hidden test 3 - hard: extreme allowed readings', 3, 'S6-C6-Q1', 'S6-C6-Q1-T4', 5000),
  (true, 'Smallest : -42
Largest  : -3
Total    : -70
Average  : -17.50
Range    : 39', true, '4
-3 -18 -7 -42', 'Hidden test 4 - constraint: every reading negative', 4, 'S6-C6-Q1', 'S6-C6-Q1-T5', 5000),
  (true, 'Smallest : 0
Largest  : 0
Total    : 0
Average  : 0.00
Range    : 0', true, '1
0', 'Hidden test 5 - single reading, range is zero', 5, 'S6-C6-Q1', 'S6-C6-Q1-T6', 5000),
  (true, 'Found : Yes
First : 1
Count : 3', false, '7
4 9 4 2 4 7 1
4', 'Sample case - repeated key', 0, 'S6-C7-Q1', 'S6-C7-Q1-T1', 5000),
  (true, 'Found : Yes
First : 3
Count : 1', true, '5
11 22 33 44 55
33', 'Hidden test 1 - easy: key appears once', 1, 'S6-C7-Q1', 'S6-C7-Q1-T2', 5000),
  (true, 'Found : Yes
First : 1
Count : 1', true, '6
8 1 2 3 4 5
8', 'Hidden test 2 - medium: key at the first position', 2, 'S6-C7-Q1', 'S6-C7-Q1-T3', 5000),
  (true, 'Found : Yes
First : 15
Count : 1', true, '15
1 2 3 4 5 6 7 8 9 10 11 12 13 14 99
99', 'Hidden test 3 - hard: key at the last position of a long batch', 3, 'S6-C7-Q1', 'S6-C7-Q1-T4', 5000),
  (true, 'Found : No
First : 0
Count : 0', true, '5
3 6 9 12 15
7', 'Hidden test 4 - constraint: key absent, First and Count stay zero', 4, 'S6-C7-Q1', 'S6-C7-Q1-T5', 5000),
  (true, 'Found : Yes
First : 2
Count : 3', true, '7
-3 0 5 0 -8 0 2
0', 'Hidden test 5 - searching for zero among negatives and positives', 5, 'S6-C7-Q1', 'S6-C7-Q1-T6', 5000),
  (true, '     1     2     3
     4     5     6', false, '2 3
1 2 3
4 5 6', 'Sample case - two by three table', 0, 'S6-C8-Q1', 'S6-C8-Q1-T1', 5000),
  (true, '    42', true, '1 1
42', 'Hidden test 1 - easy: single value table', 1, 'S6-C8-Q1', 'S6-C8-Q1-T2', 5000),
  (true, '     7    14    21
    28    35    42
    49    56    63', true, '3 3
7 14 21
28 35 42
49 56 63', 'Hidden test 2 - medium: three by three table', 2, 'S6-C8-Q1', 'S6-C8-Q1-T3', 5000),
  (true, '     1     2     3     4
     5     6     7     8
     9    10    11    12
    13    14    15    16
    17    18    19    20', true, '5 4
1 2 3 4
5 6 7 8
9 10 11 12
13 14 15 16
17 18 19 20', 'Hidden test 3 - hard: five by four table', 3, 'S6-C8-Q1', 'S6-C8-Q1-T4', 5000),
  (true, '-99999 99999
    -1     0', true, '2 2
-99999 99999
-1 0', 'Hidden test 4 - constraint: widest values fill the field', 4, 'S6-C8-Q1', 'S6-C8-Q1-T5', 5000),
  (true, '    -8
     0
     8', true, '3 1
-8
0
8', 'Hidden test 5 - single column with negative, zero and positive', 5, 'S6-C8-Q1', 'S6-C8-Q1-T6', 5000),
  (true, 'Row 1 : 6
Row 2 : 15
Col 1 : 5
Col 2 : 7
Col 3 : 9
Grand : 21', false, '2 3
1 2 3
4 5 6', 'Sample case - two rows and three columns', 0, 'S6-C9-Q1', 'S6-C9-Q1-T1', 5000),
  (true, 'Row 1 : 25
Col 1 : 25
Grand : 25', true, '1 1
25', 'Hidden test 1 - easy: single cell sheet', 1, 'S6-C9-Q1', 'S6-C9-Q1-T2', 5000),
  (true, 'Row 1 : 6
Row 2 : 15
Row 3 : 24
Col 1 : 12
Col 2 : 15
Col 3 : 18
Grand : 45', true, '3 3
1 2 3
4 5 6
7 8 9', 'Hidden test 2 - medium: three by three sheet', 2, 'S6-C9-Q1', 'S6-C9-Q1-T3', 5000),
  (true, 'Row 1 : 150
Row 2 : 400
Row 3 : 650
Row 4 : 900
Col 1 : 340
Col 2 : 380
Col 3 : 420
Col 4 : 460
Col 5 : 500
Grand : 2100', true, '4 5
10 20 30 40 50
60 70 80 90 100
110 120 130 140 150
160 170 180 190 200', 'Hidden test 3 - hard: four by five sheet', 3, 'S6-C9-Q1', 'S6-C9-Q1-T4', 5000),
  (true, 'Row 1 : 300000
Row 2 : 300000
Row 3 : 300000
Col 1 : 300000
Col 2 : 300000
Col 3 : 300000
Grand : 900000', true, '3 3
100000 100000 100000
100000 100000 100000
100000 100000 100000', 'Hidden test 4 - constraint: large values need a wide total type', 4, 'S6-C9-Q1', 'S6-C9-Q1-T5', 5000),
  (true, 'Row 1 : -10
Row 2 : 10
Col 1 : 5
Col 2 : 0
Col 3 : -15
Col 4 : 10
Grand : 0', true, '2 4
-5 0 5 -10
10 0 -20 20', 'Hidden test 5 - negative, zero and positive values together', 5, 'S6-C9-Q1', 'S6-C9-Q1-T6', 5000),
  (true, 'STRING CARD
Name        : Rajalakshmi
Length      : 11
Array size  : 12
Code        : REC
Code length : 3
Code size   : 20', false, NULL, 'Sample case - both declarations', 0, 'S7-C1-Q1', 'S7-C1-Q1-T1', 5000),
  (true, 'STRING CARD
Name        : Rajalakshmi
Length      : 11
Array size  : 12
Code        : REC
Code length : 3
Code size   : 20', true, NULL, 'Hidden test 1 - name text and length', 1, 'S7-C1-Q1', 'S7-C1-Q1-T2', 5000),
  (true, 'STRING CARD
Name        : Rajalakshmi
Length      : 11
Array size  : 12
Code        : REC
Code length : 3
Code size   : 20', true, NULL, 'Hidden test 2 - reserved size includes the end marker', 2, 'S7-C1-Q1', 'S7-C1-Q1-T3', 5000),
  (true, 'STRING CARD
Name        : Rajalakshmi
Length      : 11
Array size  : 12
Code        : REC
Code length : 3
Code size   : 20', true, NULL, 'Hidden test 3 - fixed size array keeps its unused positions', 3, 'S7-C1-Q1', 'S7-C1-Q1-T4', 5000),
  (true, 'STRING CARD
Name        : Rajalakshmi
Length      : 11
Array size  : 12
Code        : REC
Code length : 3
Code size   : 20', true, NULL, 'Hidden test 4 - label alignment and heading text', 4, 'S7-C1-Q1', 'S7-C1-Q1-T5', 5000),
  (true, 'Tag     : arun
Address : 12 Anna Salai Chennai 600002
Length  : 28', false, 'arun
12 Anna Salai Chennai 600002', 'Sample case - multi word address', 0, 'S7-C2-Q1', 'S7-C2-Q1-T1', 5000),
  (true, 'Tag     : rec
Address : Thandalam
Length  : 9', true, 'rec
Thandalam', 'Hidden test 1 - easy: single word address', 1, 'S7-C2-Q1', 'S7-C2-Q1-T2', 5000),
  (true, 'Tag     : dev01
Address : Plot 42 Sector 7
Length  : 16', true, 'dev01
Plot 42 Sector 7', 'Hidden test 2 - medium: address with digits and spaces', 2, 'S7-C2-Q1', 'S7-C2-Q1-T3', 5000),
  (true, 'Tag     : priyadharshini
Address : No 128 Second Main Road Gandhi Nagar Adyar Chennai Tamil Nadu 600020
Length  : 68', true, 'priyadharshini
No 128 Second Main Road Gandhi Nagar Adyar Chennai Tamil Nadu 600020', 'Hidden test 3 - hard: long address line', 3, 'S7-C2-Q1', 'S7-C2-Q1-T4', 5000),
  (true, 'Tag     : abcdefghij1234567890
Address : Thandalam Chennai
Length  : 17', true, 'abcdefghij1234567890
Thandalam Chennai', 'Hidden test 4 - constraint: tag of the full 20 characters', 4, 'S7-C2-Q1', 'S7-C2-Q1-T5', 5000),
  (true, 'Tag     : a
Address : X
Length  : 1', true, 'a
X', 'Hidden test 5 - one character tag and one character address', 5, 'S7-C2-Q1', 'S7-C2-Q1-T6', 5000),
  (true, 'Vowels     : 3
Consonants : 7
Digits     : 4
Spaces     : 2
Others     : 1
Total      : 17', false, 'Hello World 2026!', 'Sample case - mixed line', 0, 'S7-C3-Q1', 'S7-C3-Q1-T1', 5000),
  (true, 'Vowels     : 5
Consonants : 0
Digits     : 0
Spaces     : 0
Others     : 0
Total      : 5', true, 'aeiou', 'Hidden test 1 - easy: vowels only', 1, 'S7-C3-Q1', 'S7-C3-Q1-T2', 5000),
  (true, 'Vowels     : 5
Consonants : 11
Digits     : 0
Spaces     : 3
Others     : 0
Total      : 19', true, 'The Quick Brown Fox', 'Hidden test 2 - medium: mixed case sentence', 2, 'S7-C3-Q1', 'S7-C3-Q1-T3', 5000),
  (true, 'Vowels     : 10
Consonants : 24
Digits     : 7
Spaces     : 11
Others     : 6
Total      : 58', true, 'REC Lab 7: C Programming, Batch 2026 - Room 14B (Block A)!', 'Hidden test 3 - hard: long line with every group', 3, 'S7-C3-Q1', 'S7-C3-Q1-T4', 5000),
  (true, 'Vowels     : 0
Consonants : 0
Digits     : 0
Spaces     : 0
Others     : 9
Total      : 9', true, '...!!!???', 'Hidden test 4 - constraint: punctuation counts as other', 4, 'S7-C3-Q1', 'S7-C3-Q1-T5', 5000),
  (true, 'Vowels     : 0
Consonants : 0
Digits     : 10
Spaces     : 9
Others     : 0
Total      : 19', true, '0 1 2 3 4 5 6 7 8 9', 'Hidden test 5 - digits and spaces only', 5, 'S7-C3-Q1', 'S7-C3-Q1-T6', 5000),
  (true, 'Length  : 5
Reverse : madam
Result  : Palindrome', false, 'madam', 'Sample case - palindrome word', 0, 'S7-C4-Q1', 'S7-C4-Q1-T1', 5000),
  (true, 'Length  : 5
Reverse : ramuk
Result  : Not palindrome', true, 'kumar', 'Hidden test 1 - easy: ordinary word', 1, 'S7-C4-Q1', 'S7-C4-Q1-T2', 5000),
  (true, 'Length  : 6
Reverse : abccba
Result  : Palindrome', true, 'abccba', 'Hidden test 2 - medium: even length palindrome', 2, 'S7-C4-Q1', 'S7-C4-Q1-T3', 5000),
  (true, 'Length  : 51
Reverse : bcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcba
Result  : Not palindrome', true, 'abcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcb', 'Hidden test 3 - hard: long near palindrome', 3, 'S7-C4-Q1', 'S7-C4-Q1-T4', 5000),
  (true, 'Length  : 5
Reverse : madaM
Result  : Not palindrome', true, 'Madam', 'Hidden test 4 - constraint: capital letter breaks the palindrome', 4, 'S7-C4-Q1', 'S7-C4-Q1-T5', 5000),
  (true, 'Length  : 1
Reverse : z
Result  : Palindrome', true, 'z', 'Hidden test 5 - single character word', 5, 'S7-C4-Q1', 'S7-C4-Q1-T6', 5000),
  (true, 'Length 1 : 5
Length 2 : 3
Copy     : kumar
Joined   : kumarraj
Verdict  : First', false, 'kumar
raj', 'Sample case - different words', 0, 'S7-C5-Q1', 'S7-C5-Q1-T1', 5000),
  (true, 'Length 1 : 5
Length 2 : 5
Copy     : zebra
Joined   : zebraapple
Verdict  : Second', true, 'zebra
apple', 'Hidden test 1 - easy: second word comes earlier', 1, 'S7-C5-Q1', 'S7-C5-Q1-T2', 5000),
  (true, 'Length 1 : 3
Length 2 : 10
Copy     : lab
Joined   : lablaboratory
Verdict  : First', true, 'lab
laboratory', 'Hidden test 2 - medium: one word is a prefix of the other', 2, 'S7-C5-Q1', 'S7-C5-Q1-T3', 5000),
  (true, 'Length 1 : 20
Length 2 : 20
Copy     : abcdefghijklmnopqrst
Joined   : abcdefghijklmnopqrstuvwxyzabcdefghijklmn
Verdict  : First', true, 'abcdefghijklmnopqrst
uvwxyzabcdefghijklmn', 'Hidden test 3 - hard: long words joined', 3, 'S7-C5-Q1', 'S7-C5-Q1-T4', 5000),
  (true, 'Length 1 : 3
Length 2 : 3
Copy     : rec
Joined   : recrec
Verdict  : Equal', true, 'rec
rec', 'Hidden test 4 - constraint: identical words compare to zero', 4, 'S7-C5-Q1', 'S7-C5-Q1-T5', 5000),
  (true, 'Length 1 : 3
Length 2 : 3
Copy     : Rec
Joined   : Recrec
Verdict  : First', true, 'Rec
rec', 'Hidden test 5 - same letters differing in case', 5, 'S7-C5-Q1', 'S7-C5-Q1-T6', 5000),
  (true, 'Cleaned : nolemonnomelon
Length  : 14
Result  : Palindrome', false, 'No lemon, no melon', 'Sample case - sentence palindrome', 0, 'S7-C6-Q1', 'S7-C6-Q1-T1', 5000),
  (true, 'Cleaned : level
Length  : 5
Result  : Palindrome', true, 'level', 'Hidden test 1 - easy: plain word', 1, 'S7-C6-Q1', 'S7-C6-Q1-T2', 5000),
  (true, 'Cleaned : helloworld
Length  : 10
Result  : Not palindrome', true, 'Hello World', 'Hidden test 2 - medium: ordinary sentence', 2, 'S7-C6-Q1', 'S7-C6-Q1-T3', 5000),
  (true, 'Cleaned : amanaplanacanalpanama
Length  : 21
Result  : Palindrome', true, 'A man, a plan, a canal: Panama!', 'Hidden test 3 - hard: long mixed sentence', 3, 'S7-C6-Q1', 'S7-C6-Q1-T4', 5000),
  (true, 'Cleaned : 12ab21
Length  : 6
Result  : Not palindrome', true, '12 Ab 21', 'Hidden test 4 - constraint: digits are kept and counted', 4, 'S7-C6-Q1', 'S7-C6-Q1-T5', 5000),
  (true, 'Cleaned : 
Length  : 0
Result  : Palindrome', true, '!!! ??? ...', 'Hidden test 5 - line with no letters or digits at all', 5, 'S7-C6-Q1', 'S7-C6-Q1-T6', 5000),
  (true, 'Found   : Yes
Checked : 4', false, '6
45 12 77 8 90 3
8', 'Sample case - key in the middle', 0, 'S8-C1-Q1', 'S8-C1-Q1-T1', 5000),
  (true, 'Found   : Yes
Checked : 1', true, '5
7 1 2 3 4
7', 'Hidden test 1 - easy: key at the first position', 1, 'S8-C1-Q1', 'S8-C1-Q1-T2', 5000),
  (true, 'Found   : Yes
Checked : 8', true, '8
2 4 6 8 10 12 14 16
16', 'Hidden test 2 - medium: key at the last position', 2, 'S8-C1-Q1', 'S8-C1-Q1-T3', 5000),
  (true, 'Found   : Yes
Checked : 2', true, '10
5 9 5 9 5 9 5 9 5 9
9', 'Hidden test 3 - hard: duplicates, only the first one is reached', 3, 'S8-C1-Q1', 'S8-C1-Q1-T4', 5000),
  (true, 'Found   : No
Checked : 5', true, '5
1 2 3 4 5
9', 'Hidden test 4 - constraint: key absent, every entry examined', 4, 'S8-C1-Q1', 'S8-C1-Q1-T5', 5000),
  (true, 'Found   : Yes
Checked : 3', true, '4
-3 -1 0 -7
0', 'Hidden test 5 - searching for zero among negatives', 5, 'S8-C1-Q1', 'S8-C1-Q1-T6', 5000),
  (true, 'Order  : Ascending
Breaks : 0', false, '6
3 9 14 27 27 40', 'Sample case - ascending with duplicates', 0, 'S8-C10-Q1', 'S8-C10-Q1-T1', 5000),
  (true, 'Order  : Descending
Breaks : 4', true, '6
40 27 27 14 9 3', 'Hidden test 1 - easy: descending list', 1, 'S8-C10-Q1', 'S8-C10-Q1-T2', 5000),
  (true, 'Order  : Unsorted
Breaks : 3', true, '7
5 1 9 3 7 2 8', 'Hidden test 2 - medium: unsorted list', 2, 'S8-C10-Q1', 'S8-C10-Q1-T3', 5000),
  (true, 'Order  : Ascending
Breaks : 0', true, '25
4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 72 76 80 84 88 92 96 100', 'Hidden test 3 - hard: long ascending list', 3, 'S8-C10-Q1', 'S8-C10-Q1-T4', 5000),
  (true, 'Order  : Ascending
Breaks : 0', true, '5
7 7 7 7 7', 'Hidden test 4 - constraint: all elements equal counts as ascending', 4, 'S8-C10-Q1', 'S8-C10-Q1-T5', 5000),
  (true, 'Order  : Ascending
Breaks : 0', true, '1
-9', 'Hidden test 5 - single element and negative values', 5, 'S8-C10-Q1', 'S8-C10-Q1-T6', 5000),
  (true, 'Ascending  : 3 7 7 19 42 88
Descending : 88 42 19 7 7 3', false, '6
42 7 19 7 88 3', 'Sample case - mixed list with a duplicate', 0, 'S8-C11-Q1', 'S8-C11-Q1-T1', 5000),
  (true, 'Ascending  : 1 5 9
Descending : 9 5 1', true, '3
9 1 5', 'Hidden test 1 - easy: three values', 1, 'S8-C11-Q1', 'S8-C11-Q1-T2', 5000),
  (true, 'Ascending  : 1 2 3 4 5 6
Descending : 6 5 4 3 2 1', true, '6
1 2 3 4 5 6', 'Hidden test 2 - medium: already ascending', 2, 'S8-C11-Q1', 'S8-C11-Q1-T3', 5000),
  (true, 'Ascending  : 4 8 12 16 20 24 28 32 36 40 44 48 52 56 60
Descending : 60 56 52 48 44 40 36 32 28 24 20 16 12 8 4', true, '15
60 56 52 48 44 40 36 32 28 24 20 16 12 8 4', 'Hidden test 3 - hard: reversed long list', 3, 'S8-C11-Q1', 'S8-C11-Q1-T4', 5000),
  (true, 'Ascending  : 2 2 4 4 4 9 9
Descending : 9 9 4 4 4 2 2', true, '7
4 4 4 2 2 9 9', 'Hidden test 4 - constraint: duplicates must all survive', 4, 'S8-C11-Q1', 'S8-C11-Q1-T5', 5000),
  (true, 'Ascending  : -8 -3 0 0 5 12
Descending : 12 5 0 0 -3 -8', true, '6
0 -8 5 -3 0 12', 'Hidden test 5 - negative, zero and positive values', 5, 'S8-C11-Q1', 'S8-C11-Q1-T6', 5000),
  (true, 'Sorted : 3 7 7 19 42 88
Swaps  : 9
Passes : 5', false, '6
42 7 19 7 88 3', 'Sample case - unsorted list', 0, 'S8-C12-Q1', 'S8-C12-Q1-T1', 5000),
  (true, 'Sorted : 4 9
Swaps  : 1
Passes : 1', true, '2
9 4', 'Hidden test 1 - easy: two values out of order', 1, 'S8-C12-Q1', 'S8-C12-Q1-T2', 5000),
  (true, 'Sorted : 1 2 3 4 5 6
Swaps  : 15
Passes : 5', true, '6
6 5 4 3 2 1', 'Hidden test 2 - medium: reversed list needs the most work', 2, 'S8-C12-Q1', 'S8-C12-Q1-T3', 5000),
  (true, 'Sorted : 1 2 3 4 5 6 7 8 9 10 11 12
Swaps  : 1
Passes : 2', true, '12
1 2 3 4 5 6 7 8 9 10 12 11', 'Hidden test 3 - hard: long partially sorted list', 3, 'S8-C12-Q1', 'S8-C12-Q1-T4', 5000),
  (true, 'Sorted : 1 2 3 4 5
Swaps  : 0
Passes : 1', true, '5
1 2 3 4 5', 'Hidden test 4 - constraint: already sorted means one pass and no swaps', 4, 'S8-C12-Q1', 'S8-C12-Q1-T5', 5000),
  (true, 'Sorted : -4
Swaps  : 0
Passes : 0', true, '1
-4', 'Hidden test 5 - single element and repeated values', 5, 'S8-C12-Q1', 'S8-C12-Q1-T6', 5000),
  (true, 'Pass 1 : 11 25 12 22 64
Pass 2 : 11 12 25 22 64
Pass 3 : 11 12 22 25 64
Pass 4 : 11 12 22 25 64
Swaps  : 3', false, '5
64 25 12 22 11', 'Sample case - five values', 0, 'S8-C13-Q1', 'S8-C13-Q1-T1', 5000),
  (true, 'Pass 1 : 1 5
Swaps  : 1', true, '2
5 1', 'Hidden test 1 - easy: two values', 1, 'S8-C13-Q1', 'S8-C13-Q1-T2', 5000),
  (true, 'Pass 1 : 1 5 4 3 2 6
Pass 2 : 1 2 4 3 5 6
Pass 3 : 1 2 3 4 5 6
Pass 4 : 1 2 3 4 5 6
Pass 5 : 1 2 3 4 5 6
Swaps  : 3', true, '6
6 5 4 3 2 1', 'Hidden test 2 - medium: reversed list', 2, 'S8-C13-Q1', 'S8-C13-Q1-T3', 5000),
  (true, 'Pass 1 : 2 4 17 3 88 41 6 55 29 73
Pass 2 : 2 3 17 4 88 41 6 55 29 73
Pass 3 : 2 3 4 17 88 41 6 55 29 73
Pass 4 : 2 3 4 6 88 41 17 55 29 73
Pass 5 : 2 3 4 6 17 41 88 55 29 73
Pass 6 : 2 3 4 6 17 29 88 55 41 73
Pass 7 : 2 3 4 6 17 29 41 55 88 73
Pass 8 : 2 3 4 6 17 29 41 55 88 73
Pass 9 : 2 3 4 6 17 29 41 55 73 88
Swaps  : 8', true, '10
29 4 17 3 88 41 6 55 2 73', 'Hidden test 3 - hard: ten mixed values', 3, 'S8-C13-Q1', 'S8-C13-Q1-T4', 5000),
  (true, 'Pass 1 : 1 2 3 4 5
Pass 2 : 1 2 3 4 5
Pass 3 : 1 2 3 4 5
Pass 4 : 1 2 3 4 5
Swaps  : 0', true, '5
1 2 3 4 5', 'Hidden test 4 - constraint: already sorted means no exchanges', 4, 'S8-C13-Q1', 'S8-C13-Q1-T5', 5000),
  (true, 'Swaps  : 0', true, '1
-7', 'Hidden test 5 - single element prints no pass line', 5, 'S8-C13-Q1', 'S8-C13-Q1-T6', 5000);

insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, 'Sorted      : 5 6 7 11 12 13
Shifts      : 10
Comparisons : 13', false, '6
12 11 13 5 6 7', 'Sample case - six values', 0, 'S8-C14-Q1', 'S8-C14-Q1-T1', 5000),
  (true, 'Sorted      : 1 4
Shifts      : 1
Comparisons : 1', true, '2
4 1', 'Hidden test 1 - easy: two values out of order', 1, 'S8-C14-Q1', 'S8-C14-Q1-T2', 5000),
  (true, 'Sorted      : 1 2 3 4 5 6
Shifts      : 15
Comparisons : 15', true, '6
6 5 4 3 2 1', 'Hidden test 2 - medium: reversed list gives the most shifts', 2, 'S8-C14-Q1', 'S8-C14-Q1-T3', 5000),
  (true, 'Sorted      : 2 4 7 17 23 31 45 58 66 92
Shifts      : 24
Comparisons : 30', true, '10
31 7 92 4 58 17 66 2 45 23', 'Hidden test 3 - hard: ten mixed values', 3, 'S8-C14-Q1', 'S8-C14-Q1-T4', 5000),
  (true, 'Sorted      : 1 2 3 4 5
Shifts      : 0
Comparisons : 4', true, '5
1 2 3 4 5', 'Hidden test 4 - constraint: already sorted gives zero shifts', 4, 'S8-C14-Q1', 'S8-C14-Q1-T5', 5000),
  (true, 'Sorted      : -3 -3 0 0 3 3 3
Shifts      : 7
Comparisons : 12', true, '7
3 -3 0 3 -3 0 3', 'Hidden test 5 - duplicates and negative values', 5, 'S8-C14-Q1', 'S8-C14-Q1-T6', 5000),
  (true, 'Sorted          : 11 12 22 25 64
Bubble swaps    : 9
Selection swaps : 3
Fewer swaps     : Selection', false, '5
64 25 12 22 11', 'Sample case - unsorted list', 0, 'S8-C15-Q1', 'S8-C15-Q1-T1', 5000),
  (true, 'Sorted          : 1 2 3
Bubble swaps    : 2
Selection swaps : 2
Fewer swaps     : Equal', true, '3
3 1 2', 'Hidden test 1 - easy: three values', 1, 'S8-C15-Q1', 'S8-C15-Q1-T2', 5000),
  (true, 'Sorted          : 1 2 3 4 5 6
Bubble swaps    : 15
Selection swaps : 3
Fewer swaps     : Selection', true, '6
6 5 4 3 2 1', 'Hidden test 2 - medium: reversed list', 2, 'S8-C15-Q1', 'S8-C15-Q1-T3', 5000),
  (true, 'Sorted          : 2 4 6 9 13 22 31 45 57 68 78 90
Bubble swaps    : 35
Selection swaps : 7
Fewer swaps     : Selection', true, '12
45 2 78 13 90 6 31 57 4 68 22 9', 'Hidden test 3 - hard: twelve mixed values', 3, 'S8-C15-Q1', 'S8-C15-Q1-T4', 5000),
  (true, 'Sorted          : 1 2 3 4 5
Bubble swaps    : 0
Selection swaps : 0
Fewer swaps     : Equal', true, '5
1 2 3 4 5', 'Hidden test 4 - constraint: already sorted gives an equal verdict', 4, 'S8-C15-Q1', 'S8-C15-Q1-T5', 5000),
  (true, 'Sorted          : -9 -2 -2 0 0 5 5
Bubble swaps    : 10
Selection swaps : 4
Fewer swaps     : Selection', true, '7
0 -2 5 -2 0 5 -9', 'Hidden test 5 - duplicates with negative and zero values', 5, 'S8-C15-Q1', 'S8-C15-Q1-T6', 5000),
  (true, 'Status   : Found
Position : 1', false, '7
21 34 21 56 78 90 12
21', 'Sample case - duplicate key', 0, 'S8-C2-Q1', 'S8-C2-Q1-T1', 5000),
  (true, 'Status   : Found
Position : 3', true, '5
3 8 15 22 41
15', 'Hidden test 1 - easy: key present once', 1, 'S8-C2-Q1', 'S8-C2-Q1-T2', 5000),
  (true, 'Status   : Found
Position : 1', true, '6
99 1 2 3 4 5
99', 'Hidden test 2 - medium: key at the first position', 2, 'S8-C2-Q1', 'S8-C2-Q1-T3', 5000),
  (true, 'Status   : Found
Position : 20', true, '20
5 10 15 20 25 30 35 40 45 50 55 60 65 70 75 80 85 90 95 777
777', 'Hidden test 3 - hard: key at the last position of a long register', 3, 'S8-C2-Q1', 'S8-C2-Q1-T4', 5000),
  (true, 'Status   : Not found
Position : -1', true, '4
10 20 30 40
25', 'Hidden test 4 - constraint: absent key must report minus one', 4, 'S8-C2-Q1', 'S8-C2-Q1-T5', 5000),
  (true, 'Status   : Found
Position : 4', true, '5
0 -4 0 -9 3
-9', 'Hidden test 5 - negative key and zero entries', 5, 'S8-C2-Q1', 'S8-C2-Q1-T6', 5000),
  (true, 'Position    : 3
Comparisons : 3
Case        : Average', false, '6
11 22 33 44 55 66
33', 'Sample case - average case', 0, 'S8-C3-Q1', 'S8-C3-Q1-T1', 5000),
  (true, 'Position    : 1
Comparisons : 1
Case        : Best', true, '6
11 22 33 44 55 66
11', 'Hidden test 1 - easy: best case at the first position', 1, 'S8-C3-Q1', 'S8-C3-Q1-T2', 5000),
  (true, 'Position    : 6
Comparisons : 6
Case        : Worst', true, '6
11 22 33 44 55 66
66', 'Hidden test 2 - medium: worst case at the last position', 2, 'S8-C3-Q1', 'S8-C3-Q1-T3', 5000),
  (true, 'Position    : -1
Comparisons : 15
Case        : Worst', true, '15
1 2 3 4 5 6 7 8 9 10 11 12 13 14 15
99', 'Hidden test 3 - hard: absent key in a long list', 3, 'S8-C3-Q1', 'S8-C3-Q1-T4', 5000),
  (true, 'Position    : 1
Comparisons : 1
Case        : Best', true, '1
5
5', 'Hidden test 4 - constraint: single element list is the best case', 4, 'S8-C3-Q1', 'S8-C3-Q1-T5', 5000),
  (true, 'Position    : 2
Comparisons : 2
Case        : Average', true, '5
-2 0 -6 0 4
0', 'Hidden test 5 - negative and zero values with a zero key', 5, 'S8-C3-Q1', 'S8-C3-Q1-T6', 5000),
  (true, '3
1
-1
Total : 9', false, '5
31 42 53 64 75
3
53 31 99', 'Sample case - three passes', 0, 'S8-C4-Q1', 'S8-C4-Q1-T1', 5000),
  (true, '3
Total : 3', true, '3
7 8 9
1
9', 'Hidden test 1 - easy: one registered pass', 1, 'S8-C4-Q1', 'S8-C4-Q1-T2', 5000),
  (true, '1
3
5
6
Total : 15', true, '6
2 4 6 8 10 12
4
2 6 10 12', 'Hidden test 2 - medium: every pass registered', 2, 'S8-C4-Q1', 'S8-C4-Q1-T3', 5000),
  (true, '1
12
6
-1
3
9
Total : 43', true, '12
3 6 9 12 15 18 21 24 27 30 33 36
6
3 36 18 100 9 27', 'Hidden test 3 - hard: many passes over a long register', 3, 'S8-C4-Q1', 'S8-C4-Q1-T4', 5000),
  (true, '-1
-1
-1
Total : 15', true, '5
1 2 3 4 5
3
6 7 8', 'Hidden test 4 - constraint: every pass missing costs n comparisons each', 4, 'S8-C4-Q1', 'S8-C4-Q1-T5', 5000),
  (true, '2
1
2
Total : 5', true, '5
0 -5 3 -5 0
3
-5 0 -5', 'Hidden test 5 - repeated pass with negative and zero values', 5, 'S8-C4-Q1', 'S8-C4-Q1-T6', 5000),
  (true, 'Count     : 4
Positions : 1 3 5 8', false, '8
4 9 4 2 4 7 1 4
4', 'Sample case - four occurrences', 0, 'S8-C5-Q1', 'S8-C5-Q1-T1', 5000),
  (true, 'Count     : 1
Positions : 3', true, '5
10 20 30 40 50
30', 'Hidden test 1 - easy: single occurrence', 1, 'S8-C5-Q1', 'S8-C5-Q1-T2', 5000),
  (true, 'Count     : 2
Positions : 1 6', true, '6
7 1 2 3 4 7
7', 'Hidden test 2 - medium: occurrences at both ends', 2, 'S8-C5-Q1', 'S8-C5-Q1-T3', 5000),
  (true, 'Count     : 10
Positions : 1 2 3 4 5 6 7 8 9 10', true, '10
5 5 5 5 5 5 5 5 5 5
5', 'Hidden test 3 - hard: every element matches', 3, 'S8-C5-Q1', 'S8-C5-Q1-T4', 5000),
  (true, 'Count     : 0
Positions : None', true, '5
1 2 3 4 5
8', 'Hidden test 4 - constraint: absent key prints None', 4, 'S8-C5-Q1', 'S8-C5-Q1-T5', 5000),
  (true, 'Count     : 3
Positions : 1 3 6', true, '7
0 -1 0 2 -3 0 4
0', 'Hidden test 5 - zero key among negatives and positives', 5, 'S8-C5-Q1', 'S8-C5-Q1-T6', 5000),
  (true, 'Sorted      : Yes
Low         : 0
High        : 6
Mid         : 3
Mid value   : 40', false, '7
10 20 30 40 50 60 70', 'Sample case - sorted list of seven', 0, 'S8-C6-Q1', 'S8-C6-Q1-T1', 5000),
  (true, 'Sorted      : No
Low         : 0
High        : 4
Mid         : 2
Mid value   : 7', true, '5
9 3 7 1 5', 'Hidden test 1 - easy: unsorted list', 1, 'S8-C6-Q1', 'S8-C6-Q1-T2', 5000),
  (true, 'Sorted      : Yes
Low         : 0
High        : 7
Mid         : 3
Mid value   : 8', true, '8
2 4 6 8 10 12 14 16', 'Hidden test 2 - medium: even sized sorted list', 2, 'S8-C6-Q1', 'S8-C6-Q1-T3', 5000),
  (true, 'Sorted      : Yes
Low         : 0
High        : 19
Mid         : 9
Mid value   : 20', true, '20
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 32 34 36 38 40', 'Hidden test 3 - hard: long sorted list', 3, 'S8-C6-Q1', 'S8-C6-Q1-T4', 5000),
  (true, 'Sorted      : Yes
Low         : 0
High        : 5
Mid         : 2
Mid value   : 5', true, '6
5 5 5 7 7 9', 'Hidden test 4 - constraint: repeated equal values still count as sorted', 4, 'S8-C6-Q1', 'S8-C6-Q1-T5', 5000),
  (true, 'Sorted      : Yes
Low         : 0
High        : 0
Mid         : 0
Mid value   : -12', true, '1
-12', 'Hidden test 5 - single element with a negative value', 5, 'S8-C6-Q1', 'S8-C6-Q1-T6', 5000),
  (true, 'Path        : 4 6
Position    : 7
Comparisons : 2', false, '9
5 10 15 20 25 30 35 40 45
35', 'Sample case - key in the upper half', 0, 'S8-C7-Q1', 'S8-C7-Q1-T1', 5000),
  (true, 'Path        : 3
Position    : 4
Comparisons : 1', true, '7
1 3 5 7 9 11 13
7', 'Hidden test 1 - easy: key at the midpoint', 1, 'S8-C7-Q1', 'S8-C7-Q1-T2', 5000),
  (true, 'Path        : 3 1 0
Position    : 1
Comparisons : 3', true, '8
2 4 6 8 10 12 14 16
2', 'Hidden test 2 - medium: smallest element', 2, 'S8-C7-Q1', 'S8-C7-Q1-T3', 5000),
  (true, 'Path        : 9 14 17 18 19
Position    : 20
Comparisons : 5', true, '20
5 10 15 20 25 30 35 40 45 50 55 60 65 70 75 80 85 90 95 100
100', 'Hidden test 3 - hard: largest element of a long list', 3, 'S8-C7-Q1', 'S8-C7-Q1-T4', 5000),
  (true, 'Path        : 4 1 0
Position    : -1
Comparisons : 3', true, '9
5 10 15 20 25 30 35 40 45
7', 'Hidden test 4 - constraint: absent key must end with an empty range', 4, 'S8-C7-Q1', 'S8-C7-Q1-T5', 5000),
  (true, 'Path        : 3 1 2
Position    : 3
Comparisons : 3', true, '7
-30 -20 -10 0 10 20 30
-10', 'Hidden test 5 - sorted list containing negatives and zero', 5, 'S8-C7-Q1', 'S8-C7-Q1-T6', 5000),
  (true, '1
9
-1
Total : 11', false, '9
5 10 15 20 25 30 35 40 45
3
5 45 22', 'Sample case - three lookups', 0, 'S8-C8-Q1', 'S8-C8-Q1-T1', 5000),
  (true, '3
Total : 1', true, '5
2 4 6 8 10
1
6', 'Hidden test 1 - easy: one lookup at the midpoint', 1, 'S8-C8-Q1', 'S8-C8-Q1-T2', 5000),
  (true, '1
4
5
8
Total : 11', true, '8
1 2 3 4 5 6 7 8
4
1 4 5 8', 'Hidden test 2 - medium: every key present', 2, 'S8-C8-Q1', 'S8-C8-Q1-T3', 5000),
  (true, '1
20
-1
11
-1
Total : 21', true, '20
4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 72 76 80
5
4 80 41 44 1', 'Hidden test 3 - hard: long directory with mixed hits and misses', 3, 'S8-C8-Q1', 'S8-C8-Q1-T4', 5000),
  (true, '-1
-1
Total : 5', true, '6
10 20 30 40 50 60
2
5 70', 'Hidden test 4 - constraint: key below the whole directory', 4, 'S8-C8-Q1', 'S8-C8-Q1-T5', 5000),
  (true, '4
4
1
Total : 5', true, '7
-30 -20 -10 0 10 20 30
3
0 0 -30', 'Hidden test 5 - repeated key in a directory with negatives and zero', 5, 'S8-C8-Q1', 'S8-C8-Q1-T6', 5000),
  (true, 'Linear comparisons : 14
Binary comparisons : 3
Position           : 14
Faster             : Binary', false, '15
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30
28', 'Sample case - key near the end', 0, 'S8-C9-Q1', 'S8-C9-Q1-T1', 5000),
  (true, 'Linear comparisons : 1
Binary comparisons : 4
Position           : 1
Faster             : Linear', true, '15
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30
2', 'Hidden test 1 - easy: key at the first position', 1, 'S8-C9-Q1', 'S8-C9-Q1-T2', 5000),
  (true, 'Linear comparisons : 8
Binary comparisons : 1
Position           : 8
Faster             : Binary', true, '15
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30
16', 'Hidden test 2 - medium: key at the midpoint', 2, 'S8-C9-Q1', 'S8-C9-Q1-T3', 5000),
  (true, 'Linear comparisons : 31
Binary comparisons : 5
Position           : 31
Faster             : Binary', true, '31
3 6 9 12 15 18 21 24 27 30 33 36 39 42 45 48 51 54 57 60 63 66 69 72 75 78 81 84 87 90 93
93', 'Hidden test 3 - hard: long list, key at the last position', 3, 'S8-C9-Q1', 'S8-C9-Q1-T4', 5000),
  (true, 'Linear comparisons : 15
Binary comparisons : 4
Position           : -1
Faster             : Binary', true, '15
2 4 6 8 10 12 14 16 18 20 22 24 26 28 30
7', 'Hidden test 4 - constraint: absent key costs n for the linear search', 4, 'S8-C9-Q1', 'S8-C9-Q1-T5', 5000),
  (true, 'Linear comparisons : 1
Binary comparisons : 1
Position           : 1
Faster             : Equal', true, '1
0
0', 'Hidden test 5 - single element list gives an equal verdict', 5, 'S8-C9-Q1', 'S8-C9-Q1-T6', 5000),
  (true, '====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================', false, '2', 'Sample case - two sections', 0, 'S9-C1-Q1', 'S9-C1-Q1-T1', 5000),
  (true, '====================
   SECTION REPORT
====================', true, '1', 'Hidden test 1 - easy: one section', 1, 'S9-C1-Q1', 'S9-C1-Q1-T2', 5000),
  (true, '====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================', true, '4', 'Hidden test 2 - medium: four sections', 2, 'S9-C1-Q1', 'S9-C1-Q1-T3', 5000),
  (true, '====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================', true, '10', 'Hidden test 3 - hard: largest allowed number of sections', 3, 'S9-C1-Q1', 'S9-C1-Q1-T4', 5000),
  (true, '====================
   SECTION REPORT
====================', true, '1', 'Hidden test 4 - constraint: smallest allowed value prints three lines only', 4, 'S9-C1-Q1', 'S9-C1-Q1-T5', 5000),
  (true, '====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================
====================
   SECTION REPORT
====================', true, '5', 'Hidden test 5 - middle value repeats the banner exactly', 5, 'S9-C1-Q1', 'S9-C1-Q1-T6', 5000),
  (true, '---------------
Value 1 : 10
---------------
Value 2 : 20
---------------
Value 3 : 30
---------------', false, '10 20 30', 'Sample case - three positive values', 0, 'S9-C2-Q1', 'S9-C2-Q1-T1', 5000),
  (true, '---------------
Value 1 : 1
---------------
Value 2 : 2
---------------
Value 3 : 3
---------------', true, '1 2 3', 'Hidden test 1 - easy: small values', 1, 'S9-C2-Q1', 'S9-C2-Q1-T2', 5000),
  (true, '---------------
Value 1 : 7
---------------
Value 2 : 1234
---------------
Value 3 : 56
---------------', true, '7 1234 56', 'Hidden test 2 - medium: mixed magnitudes', 2, 'S9-C2-Q1', 'S9-C2-Q1-T3', 5000),
  (true, '---------------
Value 1 : 100000
---------------
Value 2 : -100000
---------------
Value 3 : 99999
---------------', true, '100000 -100000 99999', 'Hidden test 3 - hard: largest allowed values', 3, 'S9-C2-Q1', 'S9-C2-Q1-T4', 5000),
  (true, '---------------
Value 1 : 0
---------------
Value 2 : 0
---------------
Value 3 : 0
---------------', true, '0 0 0', 'Hidden test 4 - constraint: rules appear four times around three blocks', 4, 'S9-C2-Q1', 'S9-C2-Q1-T5', 5000),
  (true, '---------------
Value 1 : -5
---------------
Value 2 : 0
---------------
Value 3 : 7
---------------', true, '-5 0 7', 'Hidden test 5 - negative, zero and positive values', 5, 'S9-C2-Q1', 'S9-C2-Q1-T6', 5000),
  (true, '*
**
***
****
****
***
**
*', false, '4 *', 'Sample case - height four', 0, 'S9-C3-Q1', 'S9-C3-Q1-T1', 5000),
  (true, '#
##
##
#', true, '2 #', 'Hidden test 1 - easy: height two', 1, 'S9-C3-Q1', 'S9-C3-Q1-T2', 5000),
  (true, 'A
AA
AAA
AAAA
AAAAA
AAAAAA
AAAAAA
AAAAA
AAAA
AAA
AA
A', true, '6 A', 'Hidden test 2 - medium: height six with a letter', 2, 'S9-C3-Q1', 'S9-C3-Q1-T3', 5000),
  (true, '*
**
***
****
*****
******
*******
********
*********
**********
***********
************
*************
**************
***************
****************
*****************
******************
*******************
********************
********************
*******************
******************
*****************
****************
***************
**************
*************
************
***********
**********
*********
********
*******
******
*****
****
***
**
*', true, '20 *', 'Hidden test 3 - hard: largest allowed height', 3, 'S9-C3-Q1', 'S9-C3-Q1-T4', 5000),
  (true, '@
@', true, '1 @', 'Hidden test 4 - constraint: height of one gives two rows', 4, 'S9-C3-Q1', 'S9-C3-Q1-T5', 5000),
  (true, '7
77
777
777
77
7', true, '3 7', 'Hidden test 5 - digit used as the symbol', 5, 'S9-C3-Q1', 'S9-C3-Q1-T6', 5000),
  (true, 'A and B  : 45
B and C  : 45
A and C  : 30
Largest  : 45', false, '12 45 30', 'Sample case - middle value is the largest', 0, 'S9-C4-Q1', 'S9-C4-Q1-T1', 5000),
  (true, 'A and B  : 90
B and C  : 45
A and C  : 90
Largest  : 90', true, '90 12 45', 'Hidden test 1 - easy: first value is the largest', 1, 'S9-C4-Q1', 'S9-C4-Q1-T2', 5000),
  (true, 'A and B  : 18
B and C  : 40
A and C  : 40
Largest  : 40', true, '3 18 40', 'Hidden test 2 - medium: last value is the largest', 2, 'S9-C4-Q1', 'S9-C4-Q1-T3', 5000),
  (true, 'A and B  : 1000000
B and C  : 999999
A and C  : 1000000
Largest  : 1000000', true, '1000000 -1000000 999999', 'Hidden test 3 - hard: largest allowed values', 3, 'S9-C4-Q1', 'S9-C4-Q1-T4', 5000),
  (true, 'A and B  : -7
B and C  : -7
A and C  : -7
Largest  : -7', true, '-7 -7 -7', 'Hidden test 4 - constraint: all three values equal', 4, 'S9-C4-Q1', 'S9-C4-Q1-T5', 5000),
  (true, 'A and B  : 0
B and C  : 0
A and C  : -4
Largest  : 0', true, '-4 0 -9', 'Hidden test 5 - negative, zero and positive values', 5, 'S9-C4-Q1', 'S9-C4-Q1-T6', 5000),
  (true, 'KIND DEMO
Square : 144
Sum    : 42', false, '12 30', 'Sample case - two positive values', 0, 'S9-C5-Q1', 'S9-C5-Q1-T1', 5000),
  (true, 'KIND DEMO
Square : 9
Sum    : 7', true, '3 4', 'Hidden test 1 - easy: small values', 1, 'S9-C5-Q1', 'S9-C5-Q1-T2', 5000),
  (true, 'KIND DEMO
Square : 625
Sum    : 100', true, '25
75', 'Hidden test 2 - medium: values on two lines', 2, 'S9-C5-Q1', 'S9-C5-Q1-T3', 5000),
  (true, 'KIND DEMO
Square : 10000000000
Sum    : 200000', true, '100000 100000', 'Hidden test 3 - hard: largest allowed values', 3, 'S9-C5-Q1', 'S9-C5-Q1-T4', 5000),
  (true, 'KIND DEMO
Square : 10000000000
Sum    : 0', true, '-100000 100000', 'Hidden test 4 - constraint: square exceeds the int range', 4, 'S9-C5-Q1', 'S9-C5-Q1-T5', 5000),
  (true, 'KIND DEMO
Square : 0
Sum    : -46', true, '0 -46', 'Hidden test 5 - zero and a negative value', 5, 'S9-C5-Q1', 'S9-C5-Q1-T6', 5000),
  (true, 'Order 1 : 675.00
Order 2 : 99.50', false, '2
3 250.00 10
1 99.50 0', 'Sample case - two orders', 0, 'S9-C6-Q1', 'S9-C6-Q1-T1', 5000),
  (true, 'Order 1 : 100.00', true, '1
2 50.00 0', 'Hidden test 1 - easy: single order without discount', 1, 'S9-C6-Q1', 'S9-C6-Q1-T2', 5000),
  (true, 'Order 1 : 189.90
Order 2 : 632.62
Order 3 : 1500.00
Order 4 : 89.10', true, '4
10 19.99 5
7 120.50 25
3 1000.00 50
12 8.25 10', 'Hidden test 2 - medium: several orders with different discounts', 2, 'S9-C6-Q1', 'S9-C6-Q1-T3', 5000),
  (true, 'Order 1 : 1000000000.00', true, '1
10000 100000.00 0', 'Hidden test 3 - hard: largest quantity and rate', 3, 'S9-C6-Q1', 'S9-C6-Q1-T4', 5000),
  (true, 'Order 1 : 0.00', true, '1
5 100.00 100', 'Hidden test 4 - constraint: a full discount leaves nothing payable', 4, 'S9-C6-Q1', 'S9-C6-Q1-T5', 5000),
  (true, 'Order 1 : 0.00
Order 2 : 0.00', true, '2
0 500.00 20
9 0.00 15', 'Hidden test 5 - zero quantity and zero rate', 5, 'S9-C6-Q1', 'S9-C6-Q1-T6', 5000),
  (true, 'Served : 5 | Attempts : 1
Served : 15 | Attempts : 1
Served : 35 | Attempts : 1
Total  : 35', false, '3
5 10 20', 'Sample case - three calls', 0, 'S9-C7-Q1', 'S9-C7-Q1-T1', 5000),
  (true, 'Served : 7 | Attempts : 1
Total  : 7', true, '1
7', 'Hidden test 1 - easy: single call', 1, 'S9-C7-Q1', 'S9-C7-Q1-T2', 5000),
  (true, 'Served : 1 | Attempts : 1
Served : 3 | Attempts : 1
Served : 6 | Attempts : 1
Served : 10 | Attempts : 1
Served : 15 | Attempts : 1
Served : 21 | Attempts : 1
Total  : 21', true, '6
1 2 3 4 5 6', 'Hidden test 2 - medium: six calls', 2, 'S9-C7-Q1', 'S9-C7-Q1-T3', 5000),
  (true, 'Served : 100000 | Attempts : 1
Served : 199000 | Attempts : 1
Served : 297000 | Attempts : 1
Served : 394000 | Attempts : 1
Served : 490000 | Attempts : 1
Served : 585000 | Attempts : 1
Served : 679000 | Attempts : 1
Served : 772000 | Attempts : 1
Served : 864000 | Attempts : 1
Served : 955000 | Attempts : 1
Served : 1045000 | Attempts : 1
Served : 1134000 | Attempts : 1
Served : 1222000 | Attempts : 1
Served : 1309000 | Attempts : 1
Served : 1395000 | Attempts : 1
Served : 1480000 | Attempts : 1
Served : 1564000 | Attempts : 1
Served : 1647000 | Attempts : 1
Served : 1729000 | Attempts : 1
Served : 1810000 | Attempts : 1
Total  : 1810000', true, '20
100000 99000 98000 97000 96000 95000 94000 93000 92000 91000 90000 89000 88000 87000 86000 85000 84000 83000 82000 81000', 'Hidden test 3 - hard: twenty calls with large values', 3, 'S9-C7-Q1', 'S9-C7-Q1-T4', 5000);

insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, 'Served : 0 | Attempts : 1
Served : 0 | Attempts : 1
Served : 0 | Attempts : 1
Served : 0 | Attempts : 1
Served : 0 | Attempts : 1
Total  : 0', true, '5
0 0 0 0 0', 'Hidden test 4 - constraint: attempts stays at one on every call', 4, 'S9-C7-Q1', 'S9-C7-Q1-T5', 5000),
  (true, 'Served : -5 | Attempts : 1
Served : 0 | Attempts : 1
Served : -10 | Attempts : 1
Served : 0 | Attempts : 1
Total  : 0', true, '4
-5 5 -10 10', 'Hidden test 5 - negative values pull the global total back down', 5, 'S9-C7-Q1', 'S9-C7-Q1-T6', 5000);

do $$
begin
  if (select count(*) from practice_tests) <> 402
     or (select count(*) from practice_tests where hidden) <> 332
     or (select count(*) from practice_tests where not hidden) <> 70 then
    raise exception 'ABORT: practice_tests counts after insert are not 402 total, 332 hidden.';
  end if;
end $$;

-- 8. Post-insert integrity. Each check must return 0.
do $$
declare bad integer;
begin
  select count(*) into bad from practice_tests t where not exists (select 1 from practice_bank pb where pb.practice_id = t.practice_id);
  if bad <> 0 then raise exception 'ABORT: % orphan tests after insert.', bad; end if;
  select count(*) into bad from practice_bank pb where not exists (select 1 from stages s where s.stage_id = pb.stage_id);
  if bad <> 0 then raise exception 'ABORT: % questions reference a missing stage.', bad; end if;
  select count(*) into bad from practice_bank where stage_id not in ('STG001','STG002','STG003','STG004','STG005','STG006','STG007','STG008','STG009','STG010');
  if bad <> 0 then raise exception 'ABORT: % questions outside S0-S9 stages.', bad; end if;
  select count(*) into bad from practice_progress;
  if bad <> 0 then raise exception 'ABORT: practice_progress is not empty after migration.'; end if;
end $$;

commit;
