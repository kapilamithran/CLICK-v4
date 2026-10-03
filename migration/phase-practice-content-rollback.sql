-- PRACTICE CONTENT ROLLBACK (NEW eyevmykfavooeiklzebe)
-- Restores NEW's pre-migration Practice content (70 questions, 234 tests, 0 mistake rules) from
-- migration/.local-practice-new-before-replacement/ (checksums in its manifest.json).
--
-- SAFETY CONDITION: practice_progress must be 0. If any student has Practice progress, rollback is NOT
-- safe (deleting the updated questions would cascade-delete that progress). The script refuses in that case.
-- If students have started the updated Practice AFTER the migration, a rollback would erase their progress
-- and must not be run; report it instead.
-- Every step asserts its expected count. Any failed assertion rolls the whole transaction back.

begin;

-- 1. Refuse if student Practice progress exists.
do $$
begin
  if (select count(*) from practice_progress) <> 0 then
    raise exception 'ABORT: practice_progress has rows. Rollback refused because it would cascade-delete student progress. Nothing was changed.';
  end if;
end $$;

-- 2. Confirm the updated content is what the migration left (70 questions, 402 tests).
do $$
begin
  if (select count(*) from practice_bank) <> 70 or (select count(*) from practice_tests) <> 402 then
    raise exception 'ABORT: current content is not the updated set (70 questions, 402 tests). Rollback refused. Nothing was changed.';
  end if;
end $$;

-- 3. Delete the updated tests (explicit IDs).
do $$
declare n integer;
begin
  delete from practice_tests where practice_id in ('S0-C1-Q1', 'S0-C2-Q1', 'S0-C3-Q1', 'S0-C4-Q1', 'S0-C5-Q1', 'S1-C1-Q1', 'S1-C2-Q1', 'S1-C3-Q1', 'S1-C4-Q1', 'S1-C5-Q1', 'S2-C1-Q1', 'S2-C2-Q1', 'S2-C3-Q1', 'S2-C4-Q1', 'S2-C5-Q1', 'S3-C1-Q1', 'S3-C2-Q1', 'S3-C3-Q1', 'S3-C4-Q1', 'S3-C5-Q1', 'S4-C1-Q1', 'S4-C2-Q1', 'S4-C3-Q1', 'S4-C4-Q1', 'S4-C5-Q1', 'S5-C1-Q1', 'S5-C2-Q1', 'S5-C3-Q1', 'S5-C4-Q1', 'S5-C5-Q1', 'S5-C6-Q1', 'S6-C1-Q1', 'S6-C2-Q1', 'S6-C3-Q1', 'S6-C4-Q1', 'S6-C5-Q1', 'S6-C6-Q1', 'S6-C7-Q1', 'S6-C8-Q1', 'S6-C9-Q1', 'S6-C10-Q1', 'S6-C11-Q1', 'S7-C1-Q1', 'S7-C2-Q1', 'S7-C3-Q1', 'S7-C4-Q1', 'S7-C5-Q1', 'S7-C6-Q1', 'S8-C1-Q1', 'S8-C2-Q1', 'S8-C3-Q1', 'S8-C4-Q1', 'S8-C5-Q1', 'S8-C6-Q1', 'S8-C7-Q1', 'S8-C8-Q1', 'S8-C9-Q1', 'S8-C10-Q1', 'S8-C11-Q1', 'S8-C12-Q1', 'S8-C13-Q1', 'S8-C14-Q1', 'S8-C15-Q1', 'S9-C1-Q1', 'S9-C2-Q1', 'S9-C3-Q1', 'S9-C4-Q1', 'S9-C5-Q1', 'S9-C6-Q1', 'S9-C7-Q1');
  get diagnostics n = row_count;
  if n <> 402 then raise exception 'ABORT: deleted % updated tests, expected 402.', n; end if;
end $$;

-- 4. Delete the updated questions (explicit IDs).
do $$
declare n integer;
begin
  delete from practice_bank where practice_id in ('S0-C1-Q1', 'S0-C2-Q1', 'S0-C3-Q1', 'S0-C4-Q1', 'S0-C5-Q1', 'S1-C1-Q1', 'S1-C2-Q1', 'S1-C3-Q1', 'S1-C4-Q1', 'S1-C5-Q1', 'S2-C1-Q1', 'S2-C2-Q1', 'S2-C3-Q1', 'S2-C4-Q1', 'S2-C5-Q1', 'S3-C1-Q1', 'S3-C2-Q1', 'S3-C3-Q1', 'S3-C4-Q1', 'S3-C5-Q1', 'S4-C1-Q1', 'S4-C2-Q1', 'S4-C3-Q1', 'S4-C4-Q1', 'S4-C5-Q1', 'S5-C1-Q1', 'S5-C2-Q1', 'S5-C3-Q1', 'S5-C4-Q1', 'S5-C5-Q1', 'S5-C6-Q1', 'S6-C1-Q1', 'S6-C2-Q1', 'S6-C3-Q1', 'S6-C4-Q1', 'S6-C5-Q1', 'S6-C6-Q1', 'S6-C7-Q1', 'S6-C8-Q1', 'S6-C9-Q1', 'S6-C10-Q1', 'S6-C11-Q1', 'S7-C1-Q1', 'S7-C2-Q1', 'S7-C3-Q1', 'S7-C4-Q1', 'S7-C5-Q1', 'S7-C6-Q1', 'S8-C1-Q1', 'S8-C2-Q1', 'S8-C3-Q1', 'S8-C4-Q1', 'S8-C5-Q1', 'S8-C6-Q1', 'S8-C7-Q1', 'S8-C8-Q1', 'S8-C9-Q1', 'S8-C10-Q1', 'S8-C11-Q1', 'S8-C12-Q1', 'S8-C13-Q1', 'S8-C14-Q1', 'S8-C15-Q1', 'S9-C1-Q1', 'S9-C2-Q1', 'S9-C3-Q1', 'S9-C4-Q1', 'S9-C5-Q1', 'S9-C6-Q1', 'S9-C7-Q1');
  get diagnostics n = row_count;
  if n <> 70 then raise exception 'ABORT: deleted % updated questions, expected 70.', n; end if;
end $$;

-- 5. Restore the 70 pre-migration questions with their original IDs.
insert into practice_bank ("active", "constraints", "difficulty", "experiment_number", "hint_1", "hint_2", "hint_3", "input_format", "marks", "memory_limit_mb", "objective", "order", "output_format", "practice_id", "problem_statement", "sample_input", "sample_output", "stage_id", "starter_code", "success_message", "technique_after_success", "time_limit_seconds", "title", "workspace_folder") values
  (true, '', 'easy', NULL, 'Use the function that is used to display output on the screen.', '', '', NULL, NULL, NULL, '', 0, NULL, 'S0-Q1', 'Write a C program to display:
Welcome to C Programming!', '', 'Welcome to C Programming!', 'STG001', '#include <stdio.h>

int main()
{
    // TODO: use printf() to display the message

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Print a Welcome Message', 'Stage-0/Print-A-Welcome-Message'),
  (true, '', 'easy', NULL, 'You can use printf() separately for each line.', '', '', NULL, NULL, NULL, '', 1, NULL, 'S0-Q2', 'Write a C program to display your name, age, and college name.
Expected Output:
Name: xyz
Age: 18
College: Rajalakshmi Engineering College', '', 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', 'STG001', '#include <stdio.h>

int main()
{
    // TODO: print Name, Age and College on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Display Your Details', 'Stage-0/Display-Your-Details'),
  (true, '', 'easy', NULL, 'First create the variable, then store 18, and finally use printf() to display it.', '', '', NULL, NULL, NULL, '', 2, NULL, 'S0-Q3', 'Create an integer variable called age, store 18 in it, and display:
My age is 18', '', 'My age is 18', 'STG001', '#include <stdio.h>

int main()
{
    int age = 18;

    // TODO: print "My age is 18" using printf() and %d

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Store and Display Age', 'Stage-0/Store-And-Display-Age'),
  (true, '', 'easy', NULL, 'Create an int variable and use printf() with %d.', '', '', NULL, NULL, NULL, '', 3, NULL, 'S0-Q4', 'Create an integer variable called marks, store 85 in it, and display:
My marks are 85', '', 'My marks are 85', 'STG001', '#include <stdio.h>

int main()
{
    int marks = 85;

    // TODO: print "My marks are 85" using printf() and %d

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Store and Display Marks', 'Stage-0/Store-And-Display-Marks'),
  (true, '', 'medium', NULL, 'Use a different data type for each kind of value.', '', '', NULL, NULL, NULL, '', 4, NULL, 'S0-Q5', 'Write a C program that creates variables for:
- Initial (char)
- Age (int)
- Percentage (float)

Display all three values.
Expected Output:
Initial: S
Age: 18
Percentage: 85.5', '', 'Initial: S
Age: 18
Percentage: 85.5', 'STG001', '#include <stdio.h>

int main()
{
    char initial = ''S'';
    int age = 18;
    float percentage = 85.5;

    // TODO: print Initial, Age and Percentage on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Information', 'Stage-0/Student-Information'),
  (true, '', 'medium', NULL, 'Create the variables first, add comments using //, and then display them using printf().', '', '', NULL, NULL, NULL, '', 5, NULL, 'S0-Q6', 'Write a C program that displays:
----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------
Rules:
- Store age in an int variable.
- Store marks in an int variable.
- Use comments to explain the variables.
- Use printf() to display the details.', '', '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', 'STG001', '#include <stdio.h>

int main()
{
    // Store age
    int age = 18;

    // Store marks
    int marks = 90;

    // TODO: print the bordered student details block shown in the problem statement

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Details Using Comments', 'Stage-0/Student-Details-Using-Comments'),
  (true, '', 'medium', NULL, 'Look carefully at the variable statements. Also remember how a char value is written.', '', '', NULL, NULL, NULL, '', 6, NULL, 'S0-Q7', 'The following program contains mistakes. Correct it so that it displays:
My age is 18
My grade is A

Given Code:
#include <stdio.h>

int main()
{
    // Store age
    int age = 18

    // Store grade
    char grade = A;

    printf("My age is %d", age);
    printf("My grade is %c", grade);

    return 0;
}', '', 'My age is 18
My grade is A', 'STG001', '#include <stdio.h>
int main()
{
    // Store age
    int age = 18

    // Store grade
    char grade = A;

    printf("My age is %d", age);
    printf("My grade is %c", grade);

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Fix the Program', 'Stage-0/Fix-The-Program'),
  (true, '', 'hard', NULL, 'Create five variables first. Then use printf() to display each variable.', '', '', NULL, NULL, NULL, '', 7, NULL, 'S0-Q8', 'Write a C program to display:
===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================
Rules:
- Use char for initial.
- Use int for age and marks.
- Add comments.
- Use printf() for the output.', '', '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', 'STG001', '#include <stdio.h>

int main()
{
    // Store student details
    char initial = ''S'';
    int age = 18;

    // Store subject marks
    int maths = 85;
    int science = 90;
    int english = 88;

    // TODO: print the bordered STUDENT REPORT block shown in the problem statement

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Report', 'Stage-0/Student-Report'),
  (true, '', 'hard', NULL, 'Think about the type of each value: one character, whole number, decimal number, and one character.', '', '', NULL, NULL, NULL, '', 8, NULL, 'S0-Q9', 'Create variables to store:
Name Initial: S
Age: 18
Height: 5.5
Grade: A

Then display all the information neatly.', '', 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', 'STG001', '#include <stdio.h>

int main()
{
    // Store personal information
    char initial = ''S'';
    int age = 18;
    float height = 5.5;
    char grade = ''A'';

    // TODO: print Name Initial, Age, Height and Grade on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Personal Information Program', 'Stage-0/Personal-Information-Program'),
  (true, '', 'hard', NULL, 'Break the problem into small steps: Create variables -> Store values -> Use printf() -> Format the output', '', '', NULL, NULL, NULL, '', 9, NULL, 'S0-Q10', 'Write a complete C program that displays:
STUDENT PROFILE
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A

Requirements:
1. Use char for initial.
2. Use int for age and marks.
3. Use float for percentage.
4. Create separate variables.
5. Add comments.
6. Use printf() to display the profile.
7. Follow the correct C program structure.', '', '************************
 STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', 'STG001', '#include <stdio.h>

int main()
{
    // Store student profile
    char initial = ''S'';
    int age = 18;
    int marks = 92;
    float percentage = 92.5;
    char grade = ''A'';

    // TODO: print the bordered STUDENT PROFILE block shown in the problem statement

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Build a Complete C Program', 'Stage-0/Build-A-Complete-C-Program'),
  (true, 'Use int variables. The numbers are whole numbers.', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 0, NULL, 'S1-Q1', 'Write a C program to store two integers and print their sum.', '', '30', 'STG002', '#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;

    // TODO: print the sum of a and b

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Add Two Integers', 'Stage-1/Add-Two-Integers'),
  (true, 'Use int variables. Length and width are positive whole numbers.', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 1, NULL, 'S1-Q2', 'Write a C program to store the length and width of a rectangle and print its area.', '', '40', 'STG002', '#include <stdio.h>

int main() {
    int length = 8;
    int width = 5;
    int area;

    // TODO: compute area = length * width and print it

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Calculate Rectangle Area', 'Stage-1/Calculate-Rectangle-Area'),
  (true, 'Store exactly one character. Use char.', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 2, NULL, 'S1-Q3', 'Write a C program to store a character and print it.', '', 'A', 'STG002', '#include <stdio.h>

int main() {
    char letter = ''A'';

    // TODO: print letter using %c

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Display a Character', 'Stage-1/Display-A-Character'),
  (true, 'Use float or double. Display the answer with 2 decimal places.', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 3, NULL, 'S1-Q4', 'Write a C program to store three decimal values and calculate their average.', '', '20.00', 'STG002', '#include <stdio.h>

int main() {
    float a = 10.0;
    float b = 20.0;
    float c = 30.0;
    float average;

    // TODO: compute average = (a+b+c)/3 and print it with 2 decimal places

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Calculate Average', 'Stage-1/Calculate-Average'),
  (true, 'Store the numbers using int. Use explicit type casting to get a decimal result. Store the result using float. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 4, NULL, 'S1-Q5', 'A student has 7 chocolates and wants to divide them equally among 2 people. Write a C program that calculates the answer as a decimal value using type casting.', '', '3.50', 'STG002', '#include <stdio.h>

int main() {
    int chocolates = 7;
    int people = 2;
    float each;

    // TODO: compute each = (float)chocolates / people and print it with 2 decimal places

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Calculate with Type Casting', 'Stage-1/Calculate-With-Type-Casting'),
  (true, 'Use double. Display exactly 6 digits after the decimal point. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 5, NULL, 'S1-Q6', 'Write a C program to store the value 123456.789123 using double and print the value with 6 decimal places.', '', '123456.789123', 'STG002', '#include <stdio.h>

int main() {
    double number = 123456.789123;

    // TODO: print number with 6 decimal places

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Store a Large Decimal Value', 'Stage-1/Store-A-Large-Decimal-Value'),
  (true, 'Store the character using char. Use %c to print the character. Use %d to print its integer value. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 6, NULL, 'S1-Q7', 'Write a C program to store the character ''A'' and print both the character and its integer value.', '', 'Character: A
Value: 65', 'STG002', '#include <stdio.h>

int main() {
    char letter = ''A'';

    // TODO: print "Character: <letter>" then "Value: <ascii>" on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Character and Its ASCII Value', 'Stage-1/Character-And-Its-ASCII-Value'),
  (true, 'Use int for marks and total. Use float for the average. Use explicit type casting for the average. Use variables. Do not use scanf(). Do not use any decision-making statements.', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 7, NULL, 'S1-Q8', 'A student has marks in three subjects:
- Mathematics = 85
- Physics = 78
- Chemistry = 92

Write a C program that:
1. Stores the three marks using int.
2. Calculates the total marks.
3. Calculates the average as a decimal value using type casting.
4. Prints the total and average.', '', 'Total: 255
Average: 85.00', 'STG002', '#include <stdio.h>

int main() {
    int maths = 85;
    int physics = 78;
    int chemistry = 92;
    int total;
    float average;

    // TODO: compute total and average (using type casting), then print both

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Score Calculator', 'Stage-1/Student-Score-Calculator'),
  (true, 'Use the appropriate data type for each value. Use double for the price. Use bool for availability. Use printf(). Do not use scanf().', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 8, NULL, 'S1-Q9', 'A product costs 500.50 and a customer buys 3 items. Write a C program to calculate and print the total price.

Also store:
- Product code as int
- Product initial as char
- Availability as bool', '', 'Code: 101
Product: L
Available: 1
Total: 1501.50', 'STG002', '#include <stdio.h>
#include <stdbool.h>

int main() {
    int code = 101;
    char product = ''L'';
    double price = 500.50;
    int quantity = 3;
    bool available = true;

    double total = price * quantity;

    // TODO: print Code, Product, Available and Total on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Product Bill', 'Stage-1/Product-Bill'),
  (true, 'Roll number and marks - int. Grade - char. Percentage - float. Use explicit type casting. Use printf(). Do not use scanf().', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 9, NULL, 'S1-Q10', 'Write a C program to store a student''s details:
- Roll number = 25
- Grade = ''A''
- Marks = 85
- Maximum marks = 100

Calculate the student''s percentage using type casting and print all the details.', '', 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', 'STG002', '#include <stdio.h>

int main() {
    int roll = 25;
    char grade = ''A'';
    int marks = 85;
    int maxMarks = 100;

    // TODO: compute percentage = (float)marks / maxMarks * 100, then print Roll, Grade, Marks and Percentage

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Data', 'Stage-1/Student-Data'),
  (true, 'Use int variables. Use the modulus % operator. Do not use scanf().', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 0, NULL, 'S2-Q1', 'Write a C program to store two integers, 17 and 5, and print the remainder when the first number is divided by the second number.', '', '2', 'STG003', '#include <stdio.h>

int main() {
    int a = 17;
    int b = 5;

    // TODO: print a % b

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Calculate the Remainder', 'Stage-2/Calculate-The-Remainder'),
  (true, 'Use int variables. Use arithmetic operators. Remember that integer division removes the decimal part. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 1, NULL, 'S2-Q2', 'Write a C program to store two integers, 20 and 6, and calculate their sum, difference, product, quotient, and remainder.', '', 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', 'STG003', '#include <stdio.h>

int main() {
    int a = 20;
    int b = 6;

    // TODO: print Sum, Difference, Product, Quotient and Remainder on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Calculate the Expression', 'Stage-2/Calculate-The-Expression'),
  (true, 'Use an int variable. Use the increment ++ operator. Use the decrement -- operator. Do not directly assign 11 or 10 to produce the results.', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 2, NULL, 'S2-Q3', 'Write a C program to store the value 10. Increment the value by 1, print it, then decrement the value by 1 and print it again.', '', 'After increment: 11
After decrement: 10', 'STG003', '#include <stdio.h>

int main() {
    int number = 10;

    // TODO: number++, print "After increment: <number>", then number--, print "After decrement: <number>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Increment and Decrement', 'Stage-2/Increment-And-Decrement'),
  (true, 'Use int variables. Use the += operator. Do not use a = a + 10. Do not use scanf().', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 3, NULL, 'S2-Q4', 'Write a C program to store 50 in a variable and add 10 to it using the compound assignment operator.', '', '60', 'STG003', '#include <stdio.h>

int main() {
    int a = 50;

    // TODO: a += 10, then print a

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Update a Value', 'Stage-2/Update-A-Value'),
  (true, 'Use an int variable. Use -=, *=, and /=. Do not use a = a - 20 or similar expanded assignments. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 4, NULL, 'S2-Q5', 'Write a C program to store 100 in a variable. Use compound assignment operators to subtract 20, multiply the result by 2, and divide the result by 4.', '', '40', 'STG003', '#include <stdio.h>

int main() {
    int a = 100;

    // TODO: a -= 20, a *= 2, a /= 4, then print a

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Perform Multiple Assignments', 'Stage-2/Perform-Multiple-Assignments'),
  (true, 'Use int variables. Use assignment from right to left. Use a single assignment expression to assign the value to both variables. Do not use scanf().', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 5, NULL, 'S2-Q6', 'Write a C program using right-to-left assignment to store the value 25 in both a and b.', '', 'a: 25
b: 25', 'STG003', '#include <stdio.h>

int main() {
    int a, b;

    // TODO: assign 25 to both a and b in a single expression (a = b = 25), then print both

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Assignment Expression', 'Stage-2/Assignment-Expression'),
  (true, 'Use int variables. Use the relational > operator. Print the result using %d. Do not use if or else. Do not use scanf().', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 6, NULL, 'S2-Q7', 'Write a C program to store 15 and 10 and check whether the first number is greater than the second number.', '', '1', 'STG003', '#include <stdio.h>

int main() {
    int a = 15;
    int b = 10;

    // TODO: print (a > b) using %d

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Compare Two Numbers', 'Stage-2/Compare-Two-Numbers'),
  (true, 'Use int variables. Use relational operators. Use the logical AND && operator. Do not use if or else. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 7, NULL, 'S2-Q8', 'Write a C program to store 20 and 10 and check whether the first number is greater than 15 and the second number is less than 20.', '', '1', 'STG003', '#include <stdio.h>
int main() {
    int a = 20;
    int b = 10;

    // TODO: print (a > 15 && b < 20) using %d

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Check Two Conditions', 'Stage-2/Check-Two-Conditions'),
  (true, 'Use int variables. Use relational operators. Use logical && and || operators. Do not use if or else. Do not use scanf().', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 8, NULL, 'S2-Q9', 'Write a C program to store 25 and 30. Check whether:
- The first number is greater than 20, and
- The second number is greater than 35 or less than 40.

Print the result.', '', '1', 'STG003', '#include <stdio.h>

int main() {
    int a = 25;
    int b = 30;

    // TODO: print (a > 20 && (b > 35 || b < 40)) using %d

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Combine Logical Conditions', 'Stage-2/Combine-Logical-Conditions'),
  (true, 'Use int variables. Use the bitwise AND & operator. Do not use scanf().', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 9, NULL, 'S2-Q10', 'Write a C program to store 5 and 3 and perform a bitwise AND operation on them.', '', '1', 'STG003', '#include <stdio.h>

int main() {
    int a = 5;
    int b = 3;

    // TODO: print (a & b)

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Bitwise AND', 'Stage-2/Bitwise-AND'),
  (true, 'Use int variables. Use | for OR. Use ^ for XOR. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 10, NULL, 'S2-Q11', 'Write a C program to store 5 and 3 and print the results of:
1. Bitwise OR
2. Bitwise XOR', '', 'OR: 7
XOR: 6', 'STG003', '#include <stdio.h>

int main() {
    int a = 5;
    int b = 3;

    // TODO: print "OR: <a|b>" then "XOR: <a^b>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Bitwise OR and XOR', 'Stage-2/Bitwise-OR-And-XOR'),
  (true, 'Use an int variable. Use << for left shift. Use >> for right shift. Do not use scanf().', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 11, NULL, 'S2-Q12', 'Write a C program to store the value 5 and perform:
1. Left shift by 1
2. Right shift by 1

Print both results.', '', 'Left shift: 10
Right shift: 2', 'STG003', '#include <stdio.h>

int main() {
    int number = 5;

    // TODO: print "Left shift: <number<<1>" then "Right shift: <number>>1>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Bitwise Shift Operations', 'Stage-2/Bitwise-Shift-Operations'),
  (true, 'Use int variables. Use + and *. Do not use parentheses. Follow the normal operator precedence.', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 12, NULL, 'S2-Q13', 'Write a C program to store the expression 2 + 3 * 4 in a variable and print the result.', '', '14', 'STG003', '#include <stdio.h>

int main() {
    int a = 2;
    int b = 3;
    int c = 4;

    // TODO: compute result = a + b * c (no parentheses) and print it

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Follow the Precedence', 'Stage-2/Follow-The-Precedence'),
  (true, 'Use int variables. Use + and *. Use parentheses. Do not use if or else. Do not use scanf().', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 13, NULL, 'S2-Q14', 'Write a C program to calculate (2 + 3) * 4 and print the result.

The program must use parentheses so that addition is performed before multiplication.', '', '20', 'STG003', '#include <stdio.h>

int main() {
    int a = 2;
    int b = 3;
    int c = 4;

    // TODO: compute result = (a + b) * c and print it

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Change the Order with Parentheses', 'Stage-2/Change-The-Order-With-Parentheses'),
  (true, 'Use int variables. Use - and +. Do not use parentheses. Follow left-to-right associativity. Do not use scanf().', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 14, NULL, 'S2-Q15', 'Write a C program to store the values 10, 5, and 2 and calculate the expression:
10 - 5 + 2

Print the result.

The expression should follow the left-to-right associativity of - and +.', '', '7', 'STG003', '#include <stdio.h>

int main() {
    int a = 10;
    int b = 5;
    int c = 2;

    // TODO: compute result = a - b + c and print it

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Precedence and Associativity', 'Stage-2/Precedence-And-Associativity');

insert into practice_bank ("active", "constraints", "difficulty", "experiment_number", "hint_1", "hint_2", "hint_3", "input_format", "marks", "memory_limit_mb", "objective", "order", "output_format", "practice_id", "problem_statement", "sample_input", "sample_output", "stage_id", "starter_code", "success_message", "technique_after_success", "time_limit_seconds", "title", "workspace_folder") values
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 0, NULL, 'S3-Q1', 'A customer buys a product from a shop. Given the price of one product and the quantity purchased, calculate the total bill amount.', '250.50
4', 'Total Bill: 1002.00', 'STG004', '#include <stdio.h>

int main() {
    float price, total;
    int quantity;

    scanf("%f", &price);
    scanf("%d", &quantity);

    // TODO: compute total = price * quantity and print "Total Bill: <total>" (2 decimal places)

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Shopping Bill Calculator', 'Stage-3/Shopping-Bill-Calculator'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 1, NULL, 'S3-Q2', 'A person enters a distance in kilometers. Convert the given distance into meters and centimeters.

Use:
1 kilometer = 1000 meters
1 meter = 100 centimeters', '7.5', 'Meters: 7500.00
Centimeters: 750000.00', 'STG004', '#include <stdio.h>

int main() {
    float km, meters, centimeters;

    scanf("%f", &km);

    // TODO: compute meters and centimeters, then print both (2 decimal places)

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Distance Converter', 'Stage-3/Distance-Converter'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 2, NULL, 'S3-Q3', 'A student has marks in three subjects. Read the three integer marks, calculate the total marks, and find the average as a decimal value.

Use type casting so that the average is not calculated as an integer.', '78 85 92', 'Total: 255
Average: 85.00', 'STG004', '#include <stdio.h>

int main() {
    int m1, m2, m3, total;
    float average;

    scanf("%d %d %d", &m1, &m2, &m3);

    // TODO: compute total and average (using type casting), then print both

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Average', 'Stage-3/Student-Average'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 3, NULL, 'S3-Q4', 'A weather application receives a temperature in Celsius. Convert it into Fahrenheit using the formula:
Fahrenheit = (Celsius * 9 / 5) + 32

Display the result with two decimal places.', '37', 'Fahrenheit: 98.60', 'STG004', '#include <stdio.h>

int main() {
    float celsius, fahrenheit;

    scanf("%f", &celsius);

    // TODO: compute fahrenheit = (celsius * 9 / 5) + 32 and print it (2 decimal places)

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Temperature Converter', 'Stage-3/Temperature-Converter'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 4, NULL, 'S3-Q5', 'A digital system receives a total number of seconds. Convert the value into minutes and remaining seconds.

For example, 367 seconds contains 6 complete minutes and 7 remaining seconds.', '367', 'Minutes: 6
Seconds: 7', 'STG004', '#include <stdio.h>

int main() {
    int totalSeconds, minutes, seconds;

    scanf("%d", &totalSeconds);

    // TODO: compute minutes and seconds, then print both

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Time Converter', 'Stage-3/Time-Converter'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 5, NULL, 'S3-Q6', 'A program receives a single character. Display the entered character and its corresponding ASCII value.', 'A', 'Character: A
ASCII: 65', 'STG004', '#include <stdio.h>

int main() {
    char ch;

    scanf(" %c", &ch);

    // TODO: print "Character: <ch>" then "ASCII: <ascii value>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Character Information', 'Stage-3/Character-Information'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 6, NULL, 'S3-Q7', 'A program receives an integer, a decimal number, and a character. Store each value using an appropriate data type and display them using the correct format specifiers.', '25 45.75 K', 'Integer: 25
Decimal: 45.75
Character: K', 'STG004', '#include <stdio.h>

int main() {
    int number;
    float value;
    char ch;

    scanf("%d %f %c", &number, &value, &ch);

    // TODO: print Integer, Decimal (2 decimal places) and Character on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Data Type Display', 'Stage-3/Data-Type-Display'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 7, NULL, 'S3-Q8', 'An employee''s basic salary, allowance percentage, and deduction percentage are given.

Calculate:
Allowance = Basic Salary * Allowance% / 100
Gross Salary = Basic Salary + Allowance
Deduction = Gross Salary * Deduction% / 100
Net Salary = Gross Salary - Deduction

Display all calculated values with two decimal places.', '30000 20 10', 'Allowance: 6000.00
Gross: 36000.00
Deduction: 3600.00
Net Salary: 32400.00', 'STG004', '#include <stdio.h>

int main() {
    float basic, allowancePercent, deductionPercent;
    float allowance, gross, deduction, net;

    scanf("%f %f %f", &basic, &allowancePercent, &deductionPercent);

    // TODO: compute allowance, gross, deduction and net, then print all four (2 decimal places)

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Salary Calculator', 'Stage-3/Salary-Calculator'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 8, NULL, 'S3-Q9', 'A registration system receives a person''s age. A valid age must be between 0 and 120.

Create a Boolean result using relational and logical operators:
1 = Valid
0 = Invalid', '25', 'Valid: 1', 'STG004', '#include <stdio.h>
#include <stdbool.h>

int main() {
    int age;
    bool valid;

    scanf("%d", &age);

    // TODO: compute valid = (age >= 0 && age <= 120) and print "Valid: <valid>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Age Validation', 'Stage-3/Age-Validation'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 9, NULL, 'S3-Q10', 'An online store receives a product price and a discount percentage. Calculate the discount amount and the final price after discount.

Use:
Discount = Price * Discount% / 100
Final Price = Price - Discount', '2500 15', 'Discount: 375.00
Final Price: 2125.00', 'STG004', '#include <stdio.h>
int main() {
    float price, discountPercent;
    float discount, finalPrice;

    scanf("%f %f", &price, &discountPercent);

    // TODO: compute discount and finalPrice, then print both (2 decimal places)

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Product Discount Calculator', 'Stage-3/Product-Discount-Calculator'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 10, NULL, 'S3-Q11', 'A system receives two characters. Compare them and store the result in a Boolean variable. The result should be:
1 if both characters are the same
0 if they are different', 'A A', 'Same: 1', 'STG004', '#include <stdio.h>
#include <stdbool.h>

int main() {
    char first, second;
    bool same;

    scanf(" %c %c", &first, &second);

    // TODO: compute same = (first == second) and print "Same: <same>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Character Comparison', 'Stage-3/Character-Comparison'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 11, NULL, 'S3-Q12', 'A computer system stores permissions using bits:
Read = 1
Write = 2
Execute = 4

The total permission value is the combination of these permissions.

For a given permission value, use the bitwise AND (&) operator to determine whether each permission is enabled.', '5', 'Read: 1
Write: 0
Execute: 1', 'STG004', '#include <stdio.h>

int main() {
    int permission;

    scanf("%d", &permission);

    // TODO: print Read, Write and Execute (0 or 1) using the bitwise AND operator against 1, 2 and 4

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Bitwise Permission Checker', 'Stage-3/Bitwise-Permission-Checker'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 12, NULL, 'S3-Q13', 'A student receives marks in five subjects. Each subject is out of 100.

Calculate the total marks and percentage.

Use type casting so that the percentage is calculated as a floating-point value.', '78 82 91 67 88', 'Total: 406
Percentage: 81.20', 'STG004', '#include <stdio.h>

int main() {
    int m1, m2, m3, m4, m5;
    int total;
    float percentage;

    scanf("%d %d %d %d %d", &m1, &m2, &m3, &m4, &m5);

    // TODO: compute total and percentage (using type casting), then print both

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Marks and Percentage', 'Stage-3/Marks-And-Percentage'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 13, NULL, 'S3-Q14', 'A student registration form collects three pieces of information:
- Student name
- Age
- Grade character

Read the values and display them in the required format.

Use the appropriate format specifiers for string, integer, and character input.', 'Arun
21
A', 'Name: Arun
Age: 21
Grade: A', 'STG004', '#include <stdio.h>

int main() {
    char name[30];
    int age;
    char grade;

    scanf("%s", name);
    scanf("%d", &age);
    scanf(" %c", &grade);

    // TODO: print Name, Age and Grade on separate lines

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Student Details Input', 'Stage-3/Student-Details-Input'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 14, NULL, 'S3-Q15', 'An employee record contains:
- Employee name
- Employee ID
- Basic salary
- Bonus percentage
- Employee grade

Read all the details and calculate the bonus and final salary.

Use:
Bonus = Basic Salary * Bonus% / 100
Final Salary = Basic Salary + Bonus

Display the employee information and calculated salary details.', 'Arun
105
35000
12.5
A', 'Name: Arun
ID: 105
Grade: A
Bonus: 4375.00
Final Salary: 39375.00', 'STG004', '#include <stdio.h>

int main() {
    char name[30];
    int id;
    float salary, bonusPercent;
    char grade;
    float bonus, finalSalary;

    scanf("%s", name);
    scanf("%d", &id);
    scanf("%f", &salary);
    scanf("%f", &bonusPercent);
    scanf(" %c", &grade);

    // TODO: compute bonus and finalSalary, then print Name, ID, Grade, Bonus and Final Salary

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Employee Salary Record', 'Stage-3/Employee-Salary-Record'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 0, NULL, 'S4-Q1', 'Given an integer N, check whether the number is positive. If N is greater than 0, print Positive.', '10', 'Positive', 'STG005', '#include <stdio.h>
int main() {

    int N;
    scanf("%d", &N);

    // TODO: if (N > 0) print "Positive"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Check Positive Number', 'Stage-4/Check-Positive-Number'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 1, NULL, 'S4-Q2', 'Given a person''s age, determine whether the person is eligible to vote. A person is eligible when the age is 18 or above.', '20', 'Eligible', 'STG005', '#include <stdio.h>

int main() {
    int age;
    scanf("%d", &age);

    // TODO: print "Eligible" if age >= 18, otherwise print "Not Eligible"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Check Voting Eligibility', 'Stage-4/Check-Voting-Eligibility'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 2, NULL, 'S4-Q3', 'Given a number from 1 to 3, print the corresponding day.
1 = Monday
2 = Tuesday
3 = Wednesday', '2', 'Tuesday', 'STG005', '#include <stdio.h>

int main() {
    int day;
    scanf("%d", &day);

    // TODO: use switch-case to print Monday, Tuesday or Wednesday

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Select a Day', 'Stage-4/Select-A-Day'),
  (true, '', 'easy', NULL, '', '', '', NULL, NULL, NULL, '', 3, NULL, 'S4-Q4', 'Given the marks of a student, print Pass if the marks are 50 or above. Otherwise, print Fail. Use the ternary operator.', '75', 'Pass', 'STG005', '#include <stdio.h>

int main() {
    int marks;
    scanf("%d", &marks);

    // TODO: print "Pass" or "Fail" using the ternary operator

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Pass or Fail', 'Stage-4/Pass-Or-Fail'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 4, NULL, 'S4-Q5', 'Given an integer N, determine whether the number is Even or Odd.', '8', 'Even', 'STG005', '#include <stdio.h>

int main() {
    int N;
    scanf("%d", &N);

    // TODO: print "Even" if N % 2 == 0, otherwise print "Odd"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Even or Odd', 'Stage-4/Even-Or-Odd'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 5, NULL, 'S4-Q6', 'Given two integers and a choice, perform the selected operation.
1 = Addition
2 = Subtraction
3 = Multiplication', '10 5
1', '15', 'STG005', '#include <stdio.h>

int main() {
    int a, b, choice;

    scanf("%d %d", &a, &b);
    scanf("%d", &choice);

    // TODO: use switch-case on choice to print a+b, a-b or a*b

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Calculator Choice', 'Stage-4/Calculator-Choice'),
  (true, '', 'medium', NULL, '', '', '', NULL, NULL, NULL, '', 6, NULL, 'S4-Q7', 'Given a temperature, print Hot if the temperature is greater than 25; otherwise print Cool.', '30', 'Hot', 'STG005', '#include <stdio.h>

int main() {
    int temperature;
    scanf("%d", &temperature);

    // TODO: print "Hot" or "Cool" using the ternary operator

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Temperature Status', 'Stage-4/Temperature-Status'),
  (true, '', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 7, NULL, 'S4-Q8', 'Given a student''s marks, print:
75 or above = Distinction
50 to 74 = Pass
Below 50 = Fail', '80', 'Distinction', 'STG005', '#include <stdio.h>

int main() {
    int marks;
    scanf("%d", &marks);

    // TODO: print Distinction, Pass or Fail using if / else if / else

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Grade the Student', 'Stage-4/Grade-The-Student'),
  (true, '', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 8, NULL, 'S4-Q9', 'A program receives a menu choice and age.
If choice is 1, check the age.
  Age 18 or above = Adult
  Otherwise = Minor
If choice is 2, print Exit.', '1
20', 'Adult', 'STG005', '#include <stdio.h>

int main() {
    int choice, age;

    scanf("%d", &choice);
    scanf("%d", &age);

    // TODO: use switch on choice; for case 1 use if/else on age (Adult/Minor), for case 2 print "Exit"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Menu and Eligibility', 'Stage-4/Menu-And-Eligibility'),
  (true, '', 'hard', NULL, '', '', '', NULL, NULL, NULL, '', 9, NULL, 'S4-Q10', 'Given an integer N:
If N is positive, use the ternary operator to print Even or Odd.
If N is not positive, print Not Positive.', '8', 'Even', 'STG005', '#include <stdio.h>

int main() {
    int N;
    scanf("%d", &N);

    // TODO: if (N > 0) print Even/Odd via ternary, else print "Not Positive"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Positive and Even/Odd', 'Stage-4/Positive-And-EvenOdd'),
  (true, '', 'easy', NULL, '', '', '', 'A single integer N.', NULL, NULL, '', 0, 'Print numbers from 1 to N, one per line.', 'S5-Q1', 'A fitness app wants to display the number of steps completed each day for N days.

Given N, print the day number from 1 to N.', '5', '1
2
3
4
5', 'STG006', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: use a for loop to print numbers 1 to n, one per line

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Daily Step Counter', 'Stage-5/Daily-Step-Counter'),
  (true, '', 'easy', NULL, '', '', '', 'A single integer N representing the number of rows.', NULL, NULL, '', 1, NULL, 'S5-Q2', 'A graphics application needs to display a right-angle triangle pattern using asterisks. Write a C program that reads the number of rows and prints the triangle pattern.

Row 1 prints 1 asterisk, row 2 prints 2 asterisks, row 3 prints 3 asterisks, and so on until N rows are printed.', '4', '*
**
***
****', 'STG006', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: use a nested for loop to print a right-angle triangle of asterisks, n rows

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Asterisk Triangle Generator', 'Stage-5/Asterisk-Triangle-Generator'),
  (true, '', 'easy', NULL, '', '', '', 'Three PIN attempts, one per line.', NULL, NULL, '', 2, 'Print "Access Granted" if the correct PIN is entered. Print "Access Denied" if all attempts are incorrect.', 'S5-Q3', 'An ATM allows a user to enter a PIN.

The correct PIN is 1234.

The user gets at most 3 attempts.

Stop immediately when the correct PIN is entered.', '5678
1111
1234', 'Access Granted', 'STG006', '#include <stdio.h>
int main()
{
    int pin;
    int attempts = 0;

    // TODO: use a while loop (attempts < 3); read pin, increment attempts, break with
    // "Access Granted" on a correct PIN, otherwise print "Access Denied" after 3 attempts

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'ATM PIN Attempts', 'Stage-5/ATM-PIN-Attempts'),
  (true, '', 'medium', NULL, '', '', '', 'A single integer N representing the number of terms.', NULL, NULL, '', 3, NULL, 'S5-Q4', 'A mathematical application needs to calculate the sum of the first N terms of a harmonic series. Write a C program to display the series and calculate its sum.', '5', '1/1 + 1/2 + 1/3 + 1/4 + 1/5
Sum of Series upto 5 terms : 2.283334', 'STG006', '#include <stdio.h>
int main()
{
    int n;
    float sum = 0.0;
    scanf("%d", &n);

    // TODO: for each term i from 1 to n, print "1/i" (with " + " between terms) and add 1.0/i to sum;
    // then print "\nSum of Series upto <n> terms : <sum>"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Harmonic Series Calculator', 'Stage-5/Harmonic-Series-Calculator'),
  (true, '', 'medium', NULL, '', '', '', 'First line: N. Second line: N sensor values.', NULL, NULL, '', 4, NULL, 'S5-Q5', 'A factory has N sensors. Each sensor sends a value:
1 = Working
0 = Failed

The system should scan the sensors and stop as soon as the first failed sensor is found. Print its position. If all sensors work, print All Sensors Working.', '6
1 1 1 0 1 1', 'Sensor 4 Failed', 'STG006', '#include <stdio.h>

int main()
{
    int n, value;
    int found = 0;
    scanf("%d", &n);

    // TODO: loop i from 1 to n, read value; if value == 0 print "Sensor <i> Failed", set found=1, break.
    // After the loop, if !found print "All Sensors Working"

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Find the First Failed Sensor', 'Stage-5/Find-The-First-Failed-Sensor'),
  (true, '', 'medium', NULL, '', '', '', 'A single positive integer N.', NULL, NULL, '', 5, NULL, 'S5-Q6', 'A number-analysis system needs to identify whether a given number is a Perfect Number. Write a C program to check whether the input number is equal to the sum of its proper divisors.

A proper divisor divides N exactly and is less than N. Example: 6 has divisors 1, 2, 3 and 1+2+3=6, so 6 is a Perfect Number.', '6', '6 is a Perfect Number.', 'STG006', '#include <stdio.h>
int main()
{
    int n, sum = 0;
    scanf("%d", &n);

    // TODO: sum all proper divisors of n (1 to n-1), then print "<n> is a Perfect Number."
    // if sum == n, otherwise "<n> is not a Perfect Number."

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Perfect Number Detector', 'Stage-5/Perfect-Number-Detector'),
  (true, '', 'hard', NULL, '', '', '', 'First line: Students Days. Then the attendance values.', NULL, NULL, '', 6, NULL, 'S5-Q7', 'A teacher records attendance for several students over several days.
1 = Present
0 = Absent

Given the number of students and days, calculate the total attendance for each student.', '3 4
1 1 0 1
1 0 1 1
0 1 0 1', 'Student 1: 3
Student 2: 3
Student 3: 2', 'STG006', '#include <stdio.h>
int main()
{
    int students, days;
    scanf("%d %d", &students, &days);

    // TODO: outer loop over students, inner loop over days summing attendance;
    // print "Student <i>: <attendance>" per student

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Classroom Attendance Matrix', 'Stage-5/Classroom-Attendance-Matrix'),
  (true, '', 'hard', NULL, '', '', '', 'First line: R C. Next R lines contain C values.', NULL, NULL, '', 7, NULL, 'S5-Q8', 'A parking lot has R rows and C parking spaces in each row.
1 = Occupied
0 = Empty

Find the total number of empty spaces.', '3 4
1 0 1 0
0 0 1 1
1 0 0 0', '7', 'STG006', '#include <stdio.h>
int main()
{
    int rows, cols;
    int empty = 0;
    scanf("%d %d", &rows, &cols);

    // TODO: nested loop over rows/cols, count spots equal to 0, print the total

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Parking Lot Grid', 'Stage-5/Parking-Lot-Grid'),
  (true, '', 'hard', NULL, '', '', '', 'A single integer N.', NULL, NULL, '', 8, NULL, 'S5-Q9', 'A learning app generates a number pattern based on the number of rows.

For each row, print numbers starting from 1 up to the row number.', '5', '1
1 2
1 2 3
1 2 3 4
1 2 3 4 5', 'STG006', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: nested for loop - outer over rows 1..n, inner prints 1..row (space-separated), newline per row

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Number Pattern Generator', 'Stage-5/Number-Pattern-Generator'),
  (true, '', 'hard', NULL, '', '', '', 'A single integer N.', NULL, NULL, '', 9, NULL, 'S5-Q10', 'A security system scans numbers from 1 to N.

For every number:
If it is divisible by 5, skip it.
If it is divisible by 17, stop scanning immediately.
Otherwise, print the number.', '30', '1 2 3 4 6 7 8 9 11 12 13 14 16', 'STG006', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: for i from 1 to n: if i%17==0 break; if i%5==0 continue; otherwise print i followed by a space

    return 0;
}
', 'Nice work! All tests passed.', '', NULL, 'Smart Number Scanner', 'Stage-5/Smart-Number-Scanner');

-- 6. Restore the 234 pre-migration tests.
insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, 'Welcome to C Programming!', false, '', 'Sample case', 0, 'S0-Q1', 'S0-Q1-T1', 5000),
  (true, 'Welcome to C Programming!', true, '', 'Hidden test 1', 1, 'S0-Q1', 'S0-Q1-T2', 5000),
  (true, '************************
 STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', false, '', 'Sample case', 0, 'S0-Q10', 'S0-Q10-T1', 5000),
  (true, '************************
    STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', true, '', 'Hidden test 1', 1, 'S0-Q10', 'S0-Q10-T2', 5000),
  (true, '************************
    STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', true, '', 'Hidden test 2', 2, 'S0-Q10', 'S0-Q10-T3', 5000),
  (true, 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', false, '', 'Sample case', 0, 'S0-Q2', 'S0-Q2-T1', 5000),
  (true, 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', true, '', 'Hidden test 1', 1, 'S0-Q2', 'S0-Q2-T2', 5000),
  (true, 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', true, '', 'Hidden test 2', 2, 'S0-Q2', 'S0-Q2-T3', 5000),
  (true, 'My age is 18', false, '', 'Sample case', 0, 'S0-Q3', 'S0-Q3-T1', 5000),
  (true, 'My age is 18', true, '', 'Hidden test 1', 1, 'S0-Q3', 'S0-Q3-T2', 5000),
  (true, 'My age is 18', true, '', 'Hidden test 2', 2, 'S0-Q3', 'S0-Q3-T3', 5000),
  (true, 'My marks are 85', false, '', 'Sample case', 0, 'S0-Q4', 'S0-Q4-T1', 5000),
  (true, 'My marks are 85', true, '', 'Hidden test 1', 1, 'S0-Q4', 'S0-Q4-T2', 5000),
  (true, 'My marks are 85', true, '', 'Hidden test 2', 2, 'S0-Q4', 'S0-Q4-T3', 5000),
  (true, 'Initial: S
Age: 18
Percentage: 85.5', false, '', 'Sample case', 0, 'S0-Q5', 'S0-Q5-T1', 5000),
  (true, 'Initial: S
Age: 18
Percentage: 85.5', true, '', 'Hidden test 1', 1, 'S0-Q5', 'S0-Q5-T2', 5000),
  (true, 'Initial: S
Age: 18
Percentage: 85.5', true, '', 'Hidden test 2', 2, 'S0-Q5', 'S0-Q5-T3', 5000),
  (true, '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', false, '', 'Sample case', 0, 'S0-Q6', 'S0-Q6-T1', 5000),
  (true, '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', true, '', 'Hidden test 1', 1, 'S0-Q6', 'S0-Q6-T2', 5000),
  (true, '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', true, '', 'Hidden test 2', 2, 'S0-Q6', 'S0-Q6-T3', 5000),
  (true, 'My age is 18
My grade is A', false, '', 'Sample case', 0, 'S0-Q7', 'S0-Q7-T1', 5000),
  (true, 'My age is 18
My grade is A', true, '', 'Hidden test 1', 1, 'S0-Q7', 'S0-Q7-T2', 5000),
  (true, 'My age is 18
My grade is A', true, '', 'Hidden test 2', 2, 'S0-Q7', 'S0-Q7-T3', 5000),
  (true, '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', false, '', 'Sample case', 0, 'S0-Q8', 'S0-Q8-T1', 5000),
  (true, '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', true, '', 'Hidden test 1', 1, 'S0-Q8', 'S0-Q8-T2', 5000),
  (true, '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', true, '', 'Hidden test 2', 2, 'S0-Q8', 'S0-Q8-T3', 5000),
  (true, 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', false, '', 'Sample case', 0, 'S0-Q9', 'S0-Q9-T1', 5000),
  (true, 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', true, '', 'Hidden test 1', 1, 'S0-Q9', 'S0-Q9-T2', 5000),
  (true, 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', true, '', 'Hidden test 2', 2, 'S0-Q9', 'S0-Q9-T3', 5000),
  (true, '30', false, '', 'Sample case', 0, 'S1-Q1', 'S1-Q1-T1', 5000),
  (true, '30', true, '', 'Hidden test 1', 1, 'S1-Q1', 'S1-Q1-T2', 5000),
  (true, '30', true, '', 'Hidden test 2', 2, 'S1-Q1', 'S1-Q1-T3', 5000),
  (true, 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', false, '', 'Sample case', 0, 'S1-Q10', 'S1-Q10-T1', 5000),
  (true, 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', true, '', 'Hidden test 1', 1, 'S1-Q10', 'S1-Q10-T2', 5000),
  (true, 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', true, '', 'Hidden test 2', 2, 'S1-Q10', 'S1-Q10-T3', 5000),
  (true, '40', false, '', 'Sample case', 0, 'S1-Q2', 'S1-Q2-T1', 5000),
  (true, '40', true, '', 'Hidden test 1', 1, 'S1-Q2', 'S1-Q2-T2', 5000),
  (true, '40', true, '', 'Hidden test 2', 2, 'S1-Q2', 'S1-Q2-T3', 5000),
  (true, 'A', false, '', 'Sample case', 0, 'S1-Q3', 'S1-Q3-T1', 5000),
  (true, 'A', true, '', 'Hidden test 1', 1, 'S1-Q3', 'S1-Q3-T2', 5000),
  (true, 'A', true, '', 'Hidden test 2', 2, 'S1-Q3', 'S1-Q3-T3', 5000),
  (true, '20.00', false, '', 'Sample case', 0, 'S1-Q4', 'S1-Q4-T1', 5000),
  (true, '20.00', true, '', 'Hidden test 1', 1, 'S1-Q4', 'S1-Q4-T2', 5000),
  (true, '20.00', true, '', 'Hidden test 2', 2, 'S1-Q4', 'S1-Q4-T3', 5000),
  (true, '3.50', false, '', 'Sample case', 0, 'S1-Q5', 'S1-Q5-T1', 5000),
  (true, '3.50', true, '', 'Hidden test 1', 1, 'S1-Q5', 'S1-Q5-T2', 5000),
  (true, '3.50', true, '', 'Hidden test 2', 2, 'S1-Q5', 'S1-Q5-T3', 5000),
  (true, '123456.789123', false, '', 'Sample case', 0, 'S1-Q6', 'S1-Q6-T1', 5000),
  (true, '123456.789123', true, '', 'Hidden test 1', 1, 'S1-Q6', 'S1-Q6-T2', 5000),
  (true, '123456.789123', true, '', 'Hidden test 2', 2, 'S1-Q6', 'S1-Q6-T3', 5000),
  (true, 'Character: A
Value: 65', false, '', 'Sample case', 0, 'S1-Q7', 'S1-Q7-T1', 5000),
  (true, 'Character: A
Value: 65', true, '', 'Hidden test 1', 1, 'S1-Q7', 'S1-Q7-T2', 5000),
  (true, 'Character: A
Value: 65', true, '', 'Hidden test 2', 2, 'S1-Q7', 'S1-Q7-T3', 5000),
  (true, 'Total: 255
Average: 85.00', false, '', 'Sample case', 0, 'S1-Q8', 'S1-Q8-T1', 5000),
  (true, 'Total: 255
Average: 85.00', true, '', 'Hidden test 1', 1, 'S1-Q8', 'S1-Q8-T2', 5000),
  (true, 'Total: 255
Average: 85.00', true, '', 'Hidden test 2', 2, 'S1-Q8', 'S1-Q8-T3', 5000),
  (true, 'Code: 101
Product: L
Available: 1
Total: 1501.50', false, '', 'Sample case', 0, 'S1-Q9', 'S1-Q9-T1', 5000),
  (true, 'Code: 101
Product: L
Available: 1
Total: 1501.50', true, '', 'Hidden test 1', 1, 'S1-Q9', 'S1-Q9-T2', 5000),
  (true, 'Code: 101
Product: L
Available: 1
Total: 1501.50', true, '', 'Hidden test 2', 2, 'S1-Q9', 'S1-Q9-T3', 5000),
  (true, '2', false, '', 'Sample case', 0, 'S2-Q1', 'S2-Q1-T1', 5000),
  (true, '2', true, '', 'Hidden test 1', 1, 'S2-Q1', 'S2-Q1-T2', 5000),
  (true, '2', true, '', 'Hidden test 2', 2, 'S2-Q1', 'S2-Q1-T3', 5000),
  (true, '1', false, '', 'Sample case', 0, 'S2-Q10', 'S2-Q10-T1', 5000),
  (true, '1', true, '', 'Hidden test 1', 1, 'S2-Q10', 'S2-Q10-T2', 5000),
  (true, '1', true, '', 'Hidden test 2', 2, 'S2-Q10', 'S2-Q10-T3', 5000),
  (true, 'OR: 7
XOR: 6', false, '', 'Sample case', 0, 'S2-Q11', 'S2-Q11-T1', 5000),
  (true, 'OR: 7
XOR: 6', true, '', 'Hidden test 1', 1, 'S2-Q11', 'S2-Q11-T2', 5000),
  (true, 'OR: 7
XOR: 6', true, '', 'Hidden test 2', 2, 'S2-Q11', 'S2-Q11-T3', 5000),
  (true, 'Left shift: 10
Right shift: 2', false, '', 'Sample case', 0, 'S2-Q12', 'S2-Q12-T1', 5000),
  (true, 'Left shift: 10
Right shift: 2', true, '', 'Hidden test 1', 1, 'S2-Q12', 'S2-Q12-T2', 5000),
  (true, 'Left shift: 10
Right shift: 2', true, '', 'Hidden test 2', 2, 'S2-Q12', 'S2-Q12-T3', 5000),
  (true, '14', false, '', 'Sample case', 0, 'S2-Q13', 'S2-Q13-T1', 5000),
  (true, '14', true, '', 'Hidden test 1', 1, 'S2-Q13', 'S2-Q13-T2', 5000),
  (true, '14', true, '', 'Hidden test 2', 2, 'S2-Q13', 'S2-Q13-T3', 5000),
  (true, '20', false, '', 'Sample case', 0, 'S2-Q14', 'S2-Q14-T1', 5000),
  (true, '20', true, '', 'Hidden test 1', 1, 'S2-Q14', 'S2-Q14-T2', 5000),
  (true, '20', true, '', 'Hidden test 2', 2, 'S2-Q14', 'S2-Q14-T3', 5000),
  (true, '7', false, '', 'Sample case', 0, 'S2-Q15', 'S2-Q15-T1', 5000),
  (true, '7', true, '', 'Hidden test 1', 1, 'S2-Q15', 'S2-Q15-T2', 5000),
  (true, '7', true, '', 'Hidden test 2', 2, 'S2-Q15', 'S2-Q15-T3', 5000),
  (true, 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', false, '', 'Sample case', 0, 'S2-Q2', 'S2-Q2-T1', 5000),
  (true, 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', true, '', 'Hidden test 1', 1, 'S2-Q2', 'S2-Q2-T2', 5000),
  (true, 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', true, '', 'Hidden test 2', 2, 'S2-Q2', 'S2-Q2-T3', 5000),
  (true, 'After increment: 11
After decrement: 10', false, '', 'Sample case', 0, 'S2-Q3', 'S2-Q3-T1', 5000),
  (true, 'After increment: 11
After decrement: 10', true, '', 'Hidden test 1', 1, 'S2-Q3', 'S2-Q3-T2', 5000),
  (true, 'After increment: 11
After decrement: 10', true, '', 'Hidden test 2', 2, 'S2-Q3', 'S2-Q3-T3', 5000),
  (true, '60', false, '', 'Sample case', 0, 'S2-Q4', 'S2-Q4-T1', 5000),
  (true, '60', true, '', 'Hidden test 1', 1, 'S2-Q4', 'S2-Q4-T2', 5000),
  (true, '60', true, '', 'Hidden test 2', 2, 'S2-Q4', 'S2-Q4-T3', 5000),
  (true, '40', false, '', 'Sample case', 0, 'S2-Q5', 'S2-Q5-T1', 5000),
  (true, '40', true, '', 'Hidden test 1', 1, 'S2-Q5', 'S2-Q5-T2', 5000),
  (true, '40', true, '', 'Hidden test 2', 2, 'S2-Q5', 'S2-Q5-T3', 5000),
  (true, 'a: 25
b: 25', false, '', 'Sample case', 0, 'S2-Q6', 'S2-Q6-T1', 5000),
  (true, 'a: 25
b: 25', true, '', 'Hidden test 1', 1, 'S2-Q6', 'S2-Q6-T2', 5000),
  (true, 'a: 25
b: 25', true, '', 'Hidden test 2', 2, 'S2-Q6', 'S2-Q6-T3', 5000),
  (true, '1', false, '', 'Sample case', 0, 'S2-Q7', 'S2-Q7-T1', 5000),
  (true, '1', true, '', 'Hidden test 1', 1, 'S2-Q7', 'S2-Q7-T2', 5000),
  (true, '1', true, '', 'Hidden test 2', 2, 'S2-Q7', 'S2-Q7-T3', 5000),
  (true, '1', false, '', 'Sample case', 0, 'S2-Q8', 'S2-Q8-T1', 5000),
  (true, '1', true, '', 'Hidden test 1', 1, 'S2-Q8', 'S2-Q8-T2', 5000);

insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, '1', true, '', 'Hidden test 2', 2, 'S2-Q8', 'S2-Q8-T3', 5000),
  (true, '1', false, '', 'Sample case', 0, 'S2-Q9', 'S2-Q9-T1', 5000),
  (true, '1', true, '', 'Hidden test 1', 1, 'S2-Q9', 'S2-Q9-T2', 5000),
  (true, '1', true, '', 'Hidden test 2', 2, 'S2-Q9', 'S2-Q9-T3', 5000),
  (true, 'Total Bill: 1002.00', false, '250.50
4', 'Sample case', 0, 'S3-Q1', 'S3-Q1-T1', 5000),
  (true, 'Total Bill: 754.50', false, '125.75
6', 'Example case', 1, 'S3-Q1', 'S3-Q1-T2', 5000),
  (true, 'Total Bill: 501.25', true, '100.25
5', 'Hidden test 1', 1, 'S3-Q1', 'S3-Q1-T3', 5000),
  (true, 'Total Bill: 604.00', true, '75.50
8', 'Hidden test 2', 2, 'S3-Q1', 'S3-Q1-T4', 5000),
  (true, 'Discount: 375.00
Final Price: 2125.00', false, '2500 15', 'Sample case', 0, 'S3-Q10', 'S3-Q10-T1', 5000),
  (true, 'Discount: 960.00
Final Price: 3840.00', false, '4800 20', 'Example case', 1, 'S3-Q10', 'S3-Q10-T2', 5000),
  (true, 'Discount: 100.00
Final Price: 900.00', true, '1000 10', 'Hidden test 1', 1, 'S3-Q10', 'S3-Q10-T3', 5000),
  (true, 'Discount: 1875.00
Final Price: 5625.00', true, '7500 25', 'Hidden test 2', 2, 'S3-Q10', 'S3-Q10-T4', 5000),
  (true, 'Same: 1', false, 'A A', 'Sample case', 0, 'S3-Q11', 'S3-Q11-T1', 5000),
  (true, 'Same: 0', false, 'A B', 'Example case', 1, 'S3-Q11', 'S3-Q11-T2', 5000),
  (true, 'Same: 1', true, 'B B', 'Hidden test 1', 1, 'S3-Q11', 'S3-Q11-T3', 5000),
  (true, 'Same: 0', true, 'A C', 'Hidden test 2', 2, 'S3-Q11', 'S3-Q11-T4', 5000),
  (true, 'Read: 1
Write: 0
Execute: 1', false, '5', 'Sample case', 0, 'S3-Q12', 'S3-Q12-T1', 5000),
  (true, 'Read: 1
Write: 1
Execute: 1', false, '7', 'Example case', 1, 'S3-Q12', 'S3-Q12-T2', 5000),
  (true, 'Read: 1
Write: 1
Execute: 0', true, '3', 'Hidden test 1', 1, 'S3-Q12', 'S3-Q12-T3', 5000),
  (true, 'Read: 0
Write: 1
Execute: 1', true, '6', 'Hidden test 2', 2, 'S3-Q12', 'S3-Q12-T4', 5000),
  (true, 'Total: 406
Percentage: 81.20', false, '78 82 91 67 88', 'Sample case', 0, 'S3-Q13', 'S3-Q13-T1', 5000),
  (true, 'Total: 390
Percentage: 78.00', false, '65 72 84 91 78', 'Example case', 1, 'S3-Q13', 'S3-Q13-T2', 5000),
  (true, 'Total: 350
Percentage: 70.00', true, '90 80 70 60 50', 'Hidden test 1', 1, 'S3-Q13', 'S3-Q13-T3', 5000),
  (true, 'Total: 375
Percentage: 75.00', true, '95 85 75 65 55', 'Hidden test 2', 2, 'S3-Q13', 'S3-Q13-T4', 5000),
  (true, 'Name: Arun
Age: 21
Grade: A', false, 'Arun
21
A', 'Sample case', 0, 'S3-Q14', 'S3-Q14-T1', 5000),
  (true, 'Name: Priya
Age: 19
Grade: B', false, 'Priya
19
B', 'Example case', 1, 'S3-Q14', 'S3-Q14-T2', 5000),
  (true, 'Name: Kiran
Age: 20
Grade: B', true, 'Kiran
20
B', 'Hidden test 1', 1, 'S3-Q14', 'S3-Q14-T3', 5000),
  (true, 'Name: Meena
Age: 22
Grade: A', true, 'Meena
22
A', 'Hidden test 2', 2, 'S3-Q14', 'S3-Q14-T4', 5000),
  (true, 'Name: Arun
ID: 105
Grade: A
Bonus: 4375.00
Final Salary: 39375.00', false, 'Arun
105
35000
12.5
A', 'Sample case', 0, 'S3-Q15', 'S3-Q15-T1', 5000),
  (true, 'Name: Priya
ID: 208
Grade: B
Bonus: 4200.00
Final Salary: 46200.00', false, 'Priya
208
42000
10
B', 'Example case', 1, 'S3-Q15', 'S3-Q15-T2', 5000),
  (true, 'Name: Kiran
ID: 210
Grade: B
Bonus: 4000.00
Final Salary: 44000.00', true, 'Kiran
210
40000
10
B', 'Hidden test 1', 1, 'S3-Q15', 'S3-Q15-T3', 5000),
  (true, 'Name: Meena
ID: 315
Grade: A
Bonus: 7500.00
Final Salary: 57500.00', true, 'Meena
315
50000
15
A', 'Hidden test 2', 2, 'S3-Q15', 'S3-Q15-T4', 5000),
  (true, 'Meters: 7500.00
Centimeters: 750000.00', false, '7.5', 'Sample case', 0, 'S3-Q2', 'S3-Q2-T1', 5000),
  (true, 'Meters: 2250.00
Centimeters: 225000.00', false, '2.25', 'Example case', 1, 'S3-Q2', 'S3-Q2-T2', 5000),
  (true, 'Meters: 3200.00
Centimeters: 320000.00', true, '3.2', 'Hidden test 1', 1, 'S3-Q2', 'S3-Q2-T3', 5000),
  (true, 'Meters: 1750.00
Centimeters: 175000.00', true, '1.75', 'Hidden test 2', 2, 'S3-Q2', 'S3-Q2-T4', 5000),
  (true, 'Total: 255
Average: 85.00', false, '78 85 92', 'Sample case', 0, 'S3-Q3', 'S3-Q3-T1', 5000),
  (true, 'Total: 222
Average: 74.00', false, '67 74 81', 'Example case', 1, 'S3-Q3', 'S3-Q3-T2', 5000),
  (true, 'Total: 240
Average: 80.00', true, '90 80 70', 'Hidden test 1', 1, 'S3-Q3', 'S3-Q3-T3', 5000),
  (true, 'Total: 225
Average: 75.00', true, '65 72 88', 'Hidden test 2', 2, 'S3-Q3', 'S3-Q3-T4', 5000),
  (true, 'Fahrenheit: 98.60', false, '37', 'Sample case', 0, 'S3-Q4', 'S3-Q4-T1', 5000),
  (true, 'Fahrenheit: 77.90', false, '25.5', 'Example case', 1, 'S3-Q4', 'S3-Q4-T2', 5000),
  (true, 'Fahrenheit: 32.00', true, '0', 'Hidden test 1', 1, 'S3-Q4', 'S3-Q4-T3', 5000),
  (true, 'Fahrenheit: 212.00', true, '100', 'Hidden test 2', 2, 'S3-Q4', 'S3-Q4-T4', 5000),
  (true, 'Minutes: 6
Seconds: 7', false, '367', 'Sample case', 0, 'S3-Q5', 'S3-Q5-T1', 5000),
  (true, 'Minutes: 12
Seconds: 5', false, '725', 'Example case', 1, 'S3-Q5', 'S3-Q5-T2', 5000),
  (true, 'Minutes: 10
Seconds: 0', true, '600', 'Hidden test 1', 1, 'S3-Q5', 'S3-Q5-T3', 5000),
  (true, 'Minutes: 2
Seconds: 5', true, '125', 'Hidden test 2', 2, 'S3-Q5', 'S3-Q5-T4', 5000),
  (true, 'Character: A
ASCII: 65', false, 'A', 'Sample case', 0, 'S3-Q6', 'S3-Q6-T1', 5000),
  (true, 'Character: z
ASCII: 122', false, 'z', 'Example case', 1, 'S3-Q6', 'S3-Q6-T2', 5000),
  (true, 'Character: B
ASCII: 66', true, 'B', 'Hidden test 1', 1, 'S3-Q6', 'S3-Q6-T3', 5000),
  (true, 'Character: z
ASCII: 122', true, 'z', 'Hidden test 2', 2, 'S3-Q6', 'S3-Q6-T4', 5000),
  (true, 'Integer: 25
Decimal: 45.75
Character: K', false, '25 45.75 K', 'Sample case', 0, 'S3-Q7', 'S3-Q7-T1', 5000),
  (true, 'Integer: 100
Decimal: 12.50
Character: M', false, '100 12.50 M', 'Example case', 1, 'S3-Q7', 'S3-Q7-T2', 5000),
  (true, 'Integer: 50
Decimal: 12.25
Character: Z', true, '50 12.25 Z', 'Hidden test 1', 1, 'S3-Q7', 'S3-Q7-T3', 5000),
  (true, 'Integer: 100
Decimal: 99.50
Character: M', true, '100 99.50 M', 'Hidden test 2', 2, 'S3-Q7', 'S3-Q7-T4', 5000),
  (true, 'Allowance: 6000.00
Gross: 36000.00
Deduction: 3600.00
Net Salary: 32400.00', false, '30000 20 10', 'Sample case', 0, 'S3-Q8', 'S3-Q8-T1', 5000),
  (true, 'Allowance: 6750.00
Gross: 51750.00
Deduction: 4140.00
Net Salary: 47610.00', false, '45000 15 8', 'Example case', 1, 'S3-Q8', 'S3-Q8-T2', 5000),
  (true, 'Allowance: 2500.00
Gross: 27500.00
Deduction: 1375.00
Net Salary: 26125.00', true, '25000 10 5', 'Hidden test 1', 1, 'S3-Q8', 'S3-Q8-T3', 5000),
  (true, 'Allowance: 6000.00
Gross: 46000.00
Deduction: 3680.00
Net Salary: 42320.00', true, '40000 15 8', 'Hidden test 2', 2, 'S3-Q8', 'S3-Q8-T4', 5000),
  (true, 'Valid: 1', false, '25', 'Sample case', 0, 'S3-Q9', 'S3-Q9-T1', 5000),
  (true, 'Valid: 0', false, '150', 'Example case', 1, 'S3-Q9', 'S3-Q9-T2', 5000),
  (true, 'Valid: 1', true, '0', 'Hidden test 1', 1, 'S3-Q9', 'S3-Q9-T3', 5000),
  (true, 'Valid: 0', true, '121', 'Hidden test 2', 2, 'S3-Q9', 'S3-Q9-T4', 5000),
  (true, 'Positive', false, '10', 'Sample case', 0, 'S4-Q1', 'S4-Q1-T1', 5000),
  (true, '', false, '-5', 'Example case', 1, 'S4-Q1', 'S4-Q1-T2', 5000),
  (true, 'Positive', true, '25', 'Hidden test 1', 1, 'S4-Q1', 'S4-Q1-T3', 5000),
  (true, '', true, '-10', 'Hidden test 2', 2, 'S4-Q1', 'S4-Q1-T4', 5000),
  (true, 'Even', false, '8', 'Sample case', 0, 'S4-Q10', 'S4-Q10-T1', 5000),
  (true, 'Not Positive', false, '-3', 'Example case', 1, 'S4-Q10', 'S4-Q10-T2', 5000),
  (true, 'Odd', true, '7', 'Hidden test 1', 1, 'S4-Q10', 'S4-Q10-T3', 5000),
  (true, 'Not Positive', true, '0', 'Hidden test 2', 2, 'S4-Q10', 'S4-Q10-T4', 5000),
  (true, 'Eligible', false, '20', 'Sample case', 0, 'S4-Q2', 'S4-Q2-T1', 5000),
  (true, 'Not Eligible', false, '16', 'Example case', 1, 'S4-Q2', 'S4-Q2-T2', 5000),
  (true, 'Eligible', true, '18', 'Hidden test 1', 1, 'S4-Q2', 'S4-Q2-T3', 5000),
  (true, 'Not Eligible', true, '12', 'Hidden test 2', 2, 'S4-Q2', 'S4-Q2-T4', 5000),
  (true, 'Tuesday', false, '2', 'Sample case', 0, 'S4-Q3', 'S4-Q3-T1', 5000),
  (true, 'Wednesday', false, '3', 'Example case', 1, 'S4-Q3', 'S4-Q3-T2', 5000),
  (true, 'Monday', true, '1', 'Hidden test 1', 1, 'S4-Q3', 'S4-Q3-T3', 5000),
  (true, 'Wednesday', true, '3', 'Hidden test 2', 2, 'S4-Q3', 'S4-Q3-T4', 5000),
  (true, 'Pass', false, '75', 'Sample case', 0, 'S4-Q4', 'S4-Q4-T1', 5000),
  (true, 'Fail', false, '35', 'Example case', 1, 'S4-Q4', 'S4-Q4-T2', 5000),
  (true, 'Pass', true, '50', 'Hidden test 1', 1, 'S4-Q4', 'S4-Q4-T3', 5000),
  (true, 'Fail', true, '49', 'Hidden test 2', 2, 'S4-Q4', 'S4-Q4-T4', 5000),
  (true, 'Even', false, '8', 'Sample case', 0, 'S4-Q5', 'S4-Q5-T1', 5000),
  (true, 'Odd', false, '7', 'Example case', 1, 'S4-Q5', 'S4-Q5-T2', 5000),
  (true, 'Even', true, '12', 'Hidden test 1', 1, 'S4-Q5', 'S4-Q5-T3', 5000),
  (true, 'Odd', true, '15', 'Hidden test 2', 2, 'S4-Q5', 'S4-Q5-T4', 5000),
  (true, '15', false, '10 5
1', 'Sample case', 0, 'S4-Q6', 'S4-Q6-T1', 5000),
  (true, '50', false, '10 5
3', 'Example case', 1, 'S4-Q6', 'S4-Q6-T2', 5000),
  (true, '15', true, '25 10
2', 'Hidden test 1', 1, 'S4-Q6', 'S4-Q6-T3', 5000),
  (true, '42', true, '7 6
3', 'Hidden test 2', 2, 'S4-Q6', 'S4-Q6-T4', 5000),
  (true, 'Hot', false, '30', 'Sample case', 0, 'S4-Q7', 'S4-Q7-T1', 5000),
  (true, 'Cool', false, '20', 'Example case', 1, 'S4-Q7', 'S4-Q7-T2', 5000),
  (true, 'Cool', true, '25', 'Hidden test 1', 1, 'S4-Q7', 'S4-Q7-T3', 5000),
  (true, 'Hot', true, '40', 'Hidden test 2', 2, 'S4-Q7', 'S4-Q7-T4', 5000),
  (true, 'Distinction', false, '80', 'Sample case', 0, 'S4-Q8', 'S4-Q8-T1', 5000),
  (true, 'Pass', false, '65', 'Example case', 1, 'S4-Q8', 'S4-Q8-T2', 5000),
  (true, 'Distinction', true, '75', 'Hidden test 1', 1, 'S4-Q8', 'S4-Q8-T3', 5000),
  (true, 'Fail', true, '49', 'Hidden test 2', 2, 'S4-Q8', 'S4-Q8-T4', 5000);

insert into practice_tests ("active", "expected_output", "hidden", "input", "name", "order", "practice_id", "test_id", "timeout_ms") values
  (true, 'Adult', false, '1
20', 'Sample case', 0, 'S4-Q9', 'S4-Q9-T1', 5000),
  (true, 'Minor', false, '1
15', 'Example case', 1, 'S4-Q9', 'S4-Q9-T2', 5000),
  (true, 'Minor', true, '1
17', 'Hidden test 1', 1, 'S4-Q9', 'S4-Q9-T3', 5000),
  (true, 'Exit', true, '2
25', 'Hidden test 2', 2, 'S4-Q9', 'S4-Q9-T4', 5000),
  (true, '1
2
3
4
5', false, '5', 'Sample case', 0, 'S5-Q1', 'S5-Q1-T1', 5000),
  (true, '1
2
3', true, '3', 'Hidden test 1', 1, 'S5-Q1', 'S5-Q1-T2', 5000),
  (true, '1', true, '1', 'Hidden test 2', 2, 'S5-Q1', 'S5-Q1-T3', 5000),
  (true, '1 2 3 4 6 7 8 9 11 12 13 14 16', false, '30', 'Sample case', 0, 'S5-Q10', 'S5-Q10-T1', 5000),
  (true, '1 2 3 4 6 7 8 9 ', true, '10', 'Hidden test 1', 1, 'S5-Q10', 'S5-Q10-T2', 5000),
  (true, '1 2 3 4 6 7 8 9 11 12 13 14 16 ', true, '20', 'Hidden test 2', 2, 'S5-Q10', 'S5-Q10-T3', 5000),
  (true, '*
**
***
****', false, '4', 'Sample case', 0, 'S5-Q2', 'S5-Q2-T1', 5000),
  (true, '*
**', true, '2', 'Hidden test 1', 1, 'S5-Q2', 'S5-Q2-T2', 5000),
  (true, '*
**
***
****
*****', true, '5', 'Hidden test 2', 2, 'S5-Q2', 'S5-Q2-T3', 5000),
  (true, 'Access Granted', false, '5678
1111
1234', 'Sample case', 0, 'S5-Q3', 'S5-Q3-T1', 5000),
  (true, 'Access Granted', true, '1234
5678
1111', 'Hidden test 1', 1, 'S5-Q3', 'S5-Q3-T2', 5000),
  (true, 'Access Denied', true, '1111
2222
3333', 'Hidden test 2', 2, 'S5-Q3', 'S5-Q3-T3', 5000),
  (true, '1/1 + 1/2 + 1/3 + 1/4 + 1/5
Sum of Series upto 5 terms : 2.283334', false, '5', 'Sample case', 0, 'S5-Q4', 'S5-Q4-T1', 5000),
  (true, '1/1
Sum of Series upto 1 terms : 1.000000', true, '1', 'Hidden test 1', 1, 'S5-Q4', 'S5-Q4-T2', 5000),
  (true, '1/1 + 1/2 + 1/3
Sum of Series upto 3 terms : 1.833333', true, '3', 'Hidden test 2', 2, 'S5-Q4', 'S5-Q4-T3', 5000),
  (true, 'Sensor 4 Failed', false, '6
1 1 1 0 1 1', 'Sample case', 0, 'S5-Q5', 'S5-Q5-T1', 5000),
  (true, 'Sensor 1 Failed', true, '5
0 1 1 1 1', 'Hidden test 1', 1, 'S5-Q5', 'S5-Q5-T2', 5000),
  (true, 'All Sensors Working', true, '4
1 1 1 1', 'Hidden test 2', 2, 'S5-Q5', 'S5-Q5-T3', 5000),
  (true, '6 is a Perfect Number.', false, '6', 'Sample case', 0, 'S5-Q6', 'S5-Q6-T1', 5000),
  (true, '28 is a Perfect Number.', true, '28', 'Hidden test 1', 1, 'S5-Q6', 'S5-Q6-T2', 5000),
  (true, '10 is not a Perfect Number.', true, '10', 'Hidden test 2', 2, 'S5-Q6', 'S5-Q6-T3', 5000),
  (true, 'Student 1: 3
Student 2: 3
Student 3: 2', false, '3 4
1 1 0 1
1 0 1 1
0 1 0 1', 'Sample case', 0, 'S5-Q7', 'S5-Q7-T1', 5000),
  (true, 'Student 1: 2
Student 2: 3', true, '2 3
1 0 1
1 1 1', 'Hidden test 1', 1, 'S5-Q7', 'S5-Q7-T2', 5000),
  (true, 'Student 1: 0
Student 2: 1
Student 3: 2', true, '3 2
0 0
1 0
1 1', 'Hidden test 2', 2, 'S5-Q7', 'S5-Q7-T3', 5000),
  (true, '7', false, '3 4
1 0 1 0
0 0 1 1
1 0 0 0', 'Sample case', 0, 'S5-Q8', 'S5-Q8-T1', 5000),
  (true, '3', true, '2 3
0 0 1
1 0 1', 'Hidden test 1', 1, 'S5-Q8', 'S5-Q8-T2', 5000),
  (true, '0', true, '3 2
1 1
1 1
1 1', 'Hidden test 2', 2, 'S5-Q8', 'S5-Q8-T3', 5000),
  (true, '1
1 2
1 2 3
1 2 3 4
1 2 3 4 5', false, '5', 'Sample case', 0, 'S5-Q9', 'S5-Q9-T1', 5000),
  (true, '1
1 2', true, '2', 'Hidden test 1', 1, 'S5-Q9', 'S5-Q9-T2', 5000),
  (true, '1
1 2
1 2 3
1 2 3 4', true, '4', 'Hidden test 2', 2, 'S5-Q9', 'S5-Q9-T3', 5000);

do $$
begin
  if (select count(*) from practice_bank) <> 70
     or (select count(*) from practice_tests) <> 234
     or (select count(*) from practice_tests where hidden) <> 139 then
    raise exception 'ABORT: restored counts do not match the pre-migration backup.';
  end if;
end $$;

commit;
