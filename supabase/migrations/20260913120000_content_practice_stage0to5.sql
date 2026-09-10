-- Practice Bank: 70 new Stage 0-5 coding questions, sourced verbatim from the
-- authoritative curriculum PDF. All practice_tests rows are public/visible
-- (hidden=false) -- public-only grading, per explicit product decision.
-- Every expected_output value was mechanically verified by compiling and running
-- the PDF's own reference solution against the given input (gcc, MinGW) --
-- not merely copied from the PDF's (occasionally inconsistent) sample-output text.

insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q1', 'STG001', 'Print a Welcome Message', '', 'Write a C program to display:
Welcome to C Programming!', '', '', 'Welcome to C Programming!', '#include <stdio.h>

int main()
{
    // TODO: use printf() to display the message

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 0, true, 'easy', null, null, null, 'Stage-0/Print-A-Welcome-Message', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q2', 'STG001', 'Display Your Details', '', 'Write a C program to display your name, age, and college name.
Expected Output:
Name: xyz
Age: 18
College: Rajalakshmi Engineering College', '', '', 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', '#include <stdio.h>

int main()
{
    // TODO: print Name, Age and College on separate lines

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 1, true, 'easy', null, null, null, 'Stage-0/Display-Your-Details', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q3', 'STG001', 'Store and Display Age', '', 'Create an integer variable called age, store 18 in it, and display:
My age is 18', '', '', 'My age is 18', '#include <stdio.h>

int main()
{
    int age = 18;

    // TODO: print "My age is 18" using printf() and %d

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 2, true, 'easy', null, null, null, 'Stage-0/Store-And-Display-Age', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q4', 'STG001', 'Store and Display Marks', '', 'Create an integer variable called marks, store 85 in it, and display:
My marks are 85', '', '', 'My marks are 85', '#include <stdio.h>

int main()
{
    int marks = 85;

    // TODO: print "My marks are 85" using printf() and %d

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 3, true, 'easy', null, null, null, 'Stage-0/Store-And-Display-Marks', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q5', 'STG001', 'Student Information', '', 'Write a C program that creates variables for:
- Initial (char)
- Age (int)
- Percentage (float)

Display all three values.
Expected Output:
Initial: S
Age: 18
Percentage: 85.5', '', '', 'Initial: S
Age: 18
Percentage: 85.5', '#include <stdio.h>

int main()
{
    char initial = ''S'';
    int age = 18;
    float percentage = 85.5;

    // TODO: print Initial, Age and Percentage on separate lines

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 4, true, 'medium', null, null, null, 'Stage-0/Student-Information', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q6', 'STG001', 'Student Details Using Comments', '', 'Write a C program that displays:
----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------
Rules:
- Store age in an int variable.
- Store marks in an int variable.
- Use comments to explain the variables.
- Use printf() to display the details.', '', '', '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', '#include <stdio.h>

int main()
{
    // Store age
    int age = 18;

    // Store marks
    int marks = 90;

    // TODO: print the bordered student details block shown in the problem statement

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 5, true, 'medium', null, null, null, 'Stage-0/Student-Details-Using-Comments', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q7', 'STG001', 'Fix the Program', '', 'The following program contains mistakes. Correct it so that it displays:
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
}', '', '', 'My age is 18
My grade is A', '#include <stdio.h>
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
', '', '', '', 'Nice work! All tests passed.', '', 6, true, 'medium', null, null, null, 'Stage-0/Fix-The-Program', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q8', 'STG001', 'Student Report', '', 'Write a C program to display:
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
- Use printf() for the output.', '', '', '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', '#include <stdio.h>

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
', '', '', '', 'Nice work! All tests passed.', '', 7, true, 'hard', null, null, null, 'Stage-0/Student-Report', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q9', 'STG001', 'Personal Information Program', '', 'Create variables to store:
Name Initial: S
Age: 18
Height: 5.5
Grade: A

Then display all the information neatly.', '', '', 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', '#include <stdio.h>

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
', '', '', '', 'Nice work! All tests passed.', '', 8, true, 'hard', null, null, null, 'Stage-0/Personal-Information-Program', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S0-Q10', 'STG001', 'Build a Complete C Program', '', 'Write a complete C program that displays:
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
7. Follow the correct C program structure.', '', '', '************************
 STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', '#include <stdio.h>

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
', '', '', '', 'Nice work! All tests passed.', '', 9, true, 'hard', null, null, null, 'Stage-0/Build-A-Complete-C-Program', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q1', 'STG002', 'Add Two Integers', '', 'Write a C program to store two integers and print their sum.', 'Use int variables. The numbers are whole numbers.', '', '30', '#include <stdio.h>

int main() {
    int a = 10;
    int b = 20;

    // TODO: print the sum of a and b

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 0, true, 'easy', null, null, null, 'Stage-1/Add-Two-Integers', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q2', 'STG002', 'Calculate Rectangle Area', '', 'Write a C program to store the length and width of a rectangle and print its area.', 'Use int variables. Length and width are positive whole numbers.', '', '40', '#include <stdio.h>

int main() {
    int length = 8;
    int width = 5;
    int area;

    // TODO: compute area = length * width and print it

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 1, true, 'easy', null, null, null, 'Stage-1/Calculate-Rectangle-Area', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q3', 'STG002', 'Display a Character', '', 'Write a C program to store a character and print it.', 'Store exactly one character. Use char.', '', 'A', '#include <stdio.h>

int main() {
    char letter = ''A'';

    // TODO: print letter using %c

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 2, true, 'easy', null, null, null, 'Stage-1/Display-A-Character', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q4', 'STG002', 'Calculate Average', '', 'Write a C program to store three decimal values and calculate their average.', 'Use float or double. Display the answer with 2 decimal places.', '', '20.00', '#include <stdio.h>

int main() {
    float a = 10.0;
    float b = 20.0;
    float c = 30.0;
    float average;

    // TODO: compute average = (a+b+c)/3 and print it with 2 decimal places

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 3, true, 'easy', null, null, null, 'Stage-1/Calculate-Average', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q5', 'STG002', 'Calculate with Type Casting', '', 'A student has 7 chocolates and wants to divide them equally among 2 people. Write a C program that calculates the answer as a decimal value using type casting.', 'Store the numbers using int. Use explicit type casting to get a decimal result. Store the result using float. Do not use scanf().', '', '3.50', '#include <stdio.h>

int main() {
    int chocolates = 7;
    int people = 2;
    float each;

    // TODO: compute each = (float)chocolates / people and print it with 2 decimal places

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 4, true, 'medium', null, null, null, 'Stage-1/Calculate-With-Type-Casting', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q6', 'STG002', 'Store a Large Decimal Value', '', 'Write a C program to store the value 123456.789123 using double and print the value with 6 decimal places.', 'Use double. Display exactly 6 digits after the decimal point. Do not use scanf().', '', '123456.789123', '#include <stdio.h>

int main() {
    double number = 123456.789123;

    // TODO: print number with 6 decimal places

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 5, true, 'medium', null, null, null, 'Stage-1/Store-A-Large-Decimal-Value', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q7', 'STG002', 'Character and Its ASCII Value', '', 'Write a C program to store the character ''A'' and print both the character and its integer value.', 'Store the character using char. Use %c to print the character. Use %d to print its integer value. Do not use scanf().', '', 'Character: A
Value: 65', '#include <stdio.h>

int main() {
    char letter = ''A'';

    // TODO: print "Character: <letter>" then "Value: <ascii>" on separate lines

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 6, true, 'medium', null, null, null, 'Stage-1/Character-And-Its-ASCII-Value', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q8', 'STG002', 'Student Score Calculator', '', 'A student has marks in three subjects:
- Mathematics = 85
- Physics = 78
- Chemistry = 92

Write a C program that:
1. Stores the three marks using int.
2. Calculates the total marks.
3. Calculates the average as a decimal value using type casting.
4. Prints the total and average.', 'Use int for marks and total. Use float for the average. Use explicit type casting for the average. Use variables. Do not use scanf(). Do not use any decision-making statements.', '', 'Total: 255
Average: 85.00', '#include <stdio.h>

int main() {
    int maths = 85;
    int physics = 78;
    int chemistry = 92;
    int total;
    float average;

    // TODO: compute total and average (using type casting), then print both

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 7, true, 'hard', null, null, null, 'Stage-1/Student-Score-Calculator', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q9', 'STG002', 'Product Bill', '', 'A product costs 500.50 and a customer buys 3 items. Write a C program to calculate and print the total price.

Also store:
- Product code as int
- Product initial as char
- Availability as bool', 'Use the appropriate data type for each value. Use double for the price. Use bool for availability. Use printf(). Do not use scanf().', '', 'Code: 101
Product: L
Available: 1
Total: 1501.50', '#include <stdio.h>
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
', '', '', '', 'Nice work! All tests passed.', '', 8, true, 'hard', null, null, null, 'Stage-1/Product-Bill', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S1-Q10', 'STG002', 'Student Data', '', 'Write a C program to store a student''s details:
- Roll number = 25
- Grade = ''A''
- Marks = 85
- Maximum marks = 100

Calculate the student''s percentage using type casting and print all the details.', 'Roll number and marks - int. Grade - char. Percentage - float. Use explicit type casting. Use printf(). Do not use scanf().', '', 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', '#include <stdio.h>

int main() {
    int roll = 25;
    char grade = ''A'';
    int marks = 85;
    int maxMarks = 100;

    // TODO: compute percentage = (float)marks / maxMarks * 100, then print Roll, Grade, Marks and Percentage

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 9, true, 'hard', null, null, null, 'Stage-1/Student-Data', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q1', 'STG003', 'Calculate the Remainder', '', 'Write a C program to store two integers, 17 and 5, and print the remainder when the first number is divided by the second number.', 'Use int variables. Use the modulus % operator. Do not use scanf().', '', '2', '#include <stdio.h>

int main() {
    int a = 17;
    int b = 5;

    // TODO: print a % b

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 0, true, 'easy', null, null, null, 'Stage-2/Calculate-The-Remainder', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q2', 'STG003', 'Calculate the Expression', '', 'Write a C program to store two integers, 20 and 6, and calculate their sum, difference, product, quotient, and remainder.', 'Use int variables. Use arithmetic operators. Remember that integer division removes the decimal part. Do not use scanf().', '', 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', '#include <stdio.h>

int main() {
    int a = 20;
    int b = 6;

    // TODO: print Sum, Difference, Product, Quotient and Remainder on separate lines

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 1, true, 'medium', null, null, null, 'Stage-2/Calculate-The-Expression', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q3', 'STG003', 'Increment and Decrement', '', 'Write a C program to store the value 10. Increment the value by 1, print it, then decrement the value by 1 and print it again.', 'Use an int variable. Use the increment ++ operator. Use the decrement -- operator. Do not directly assign 11 or 10 to produce the results.', '', 'After increment: 11
After decrement: 10', '#include <stdio.h>

int main() {
    int number = 10;

    // TODO: number++, print "After increment: <number>", then number--, print "After decrement: <number>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 2, true, 'hard', null, null, null, 'Stage-2/Increment-And-Decrement', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q4', 'STG003', 'Update a Value', '', 'Write a C program to store 50 in a variable and add 10 to it using the compound assignment operator.', 'Use int variables. Use the += operator. Do not use a = a + 10. Do not use scanf().', '', '60', '#include <stdio.h>

int main() {
    int a = 50;

    // TODO: a += 10, then print a

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 3, true, 'easy', null, null, null, 'Stage-2/Update-A-Value', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q5', 'STG003', 'Perform Multiple Assignments', '', 'Write a C program to store 100 in a variable. Use compound assignment operators to subtract 20, multiply the result by 2, and divide the result by 4.', 'Use an int variable. Use -=, *=, and /=. Do not use a = a - 20 or similar expanded assignments. Do not use scanf().', '', '40', '#include <stdio.h>

int main() {
    int a = 100;

    // TODO: a -= 20, a *= 2, a /= 4, then print a

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 4, true, 'medium', null, null, null, 'Stage-2/Perform-Multiple-Assignments', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q6', 'STG003', 'Assignment Expression', '', 'Write a C program using right-to-left assignment to store the value 25 in both a and b.', 'Use int variables. Use assignment from right to left. Use a single assignment expression to assign the value to both variables. Do not use scanf().', '', 'a: 25
b: 25', '#include <stdio.h>

int main() {
    int a, b;

    // TODO: assign 25 to both a and b in a single expression (a = b = 25), then print both

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 5, true, 'hard', null, null, null, 'Stage-2/Assignment-Expression', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q7', 'STG003', 'Compare Two Numbers', '', 'Write a C program to store 15 and 10 and check whether the first number is greater than the second number.', 'Use int variables. Use the relational > operator. Print the result using %d. Do not use if or else. Do not use scanf().', '', '1', '#include <stdio.h>

int main() {
    int a = 15;
    int b = 10;

    // TODO: print (a > b) using %d

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 6, true, 'easy', null, null, null, 'Stage-2/Compare-Two-Numbers', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q8', 'STG003', 'Check Two Conditions', '', 'Write a C program to store 20 and 10 and check whether the first number is greater than 15 and the second number is less than 20.', 'Use int variables. Use relational operators. Use the logical AND && operator. Do not use if or else. Do not use scanf().', '', '1', '#include <stdio.h>
int main() {
    int a = 20;
    int b = 10;

    // TODO: print (a > 15 && b < 20) using %d

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 7, true, 'medium', null, null, null, 'Stage-2/Check-Two-Conditions', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q9', 'STG003', 'Combine Logical Conditions', '', 'Write a C program to store 25 and 30. Check whether:
- The first number is greater than 20, and
- The second number is greater than 35 or less than 40.

Print the result.', 'Use int variables. Use relational operators. Use logical && and || operators. Do not use if or else. Do not use scanf().', '', '1', '#include <stdio.h>

int main() {
    int a = 25;
    int b = 30;

    // TODO: print (a > 20 && (b > 35 || b < 40)) using %d

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 8, true, 'hard', null, null, null, 'Stage-2/Combine-Logical-Conditions', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q10', 'STG003', 'Bitwise AND', '', 'Write a C program to store 5 and 3 and perform a bitwise AND operation on them.', 'Use int variables. Use the bitwise AND & operator. Do not use scanf().', '', '1', '#include <stdio.h>

int main() {
    int a = 5;
    int b = 3;

    // TODO: print (a & b)

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 9, true, 'easy', null, null, null, 'Stage-2/Bitwise-AND', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q11', 'STG003', 'Bitwise OR and XOR', '', 'Write a C program to store 5 and 3 and print the results of:
1. Bitwise OR
2. Bitwise XOR', 'Use int variables. Use | for OR. Use ^ for XOR. Do not use scanf().', '', 'OR: 7
XOR: 6', '#include <stdio.h>

int main() {
    int a = 5;
    int b = 3;

    // TODO: print "OR: <a|b>" then "XOR: <a^b>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 10, true, 'medium', null, null, null, 'Stage-2/Bitwise-OR-And-XOR', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q12', 'STG003', 'Bitwise Shift Operations', '', 'Write a C program to store the value 5 and perform:
1. Left shift by 1
2. Right shift by 1

Print both results.', 'Use an int variable. Use << for left shift. Use >> for right shift. Do not use scanf().', '', 'Left shift: 10
Right shift: 2', '#include <stdio.h>

int main() {
    int number = 5;

    // TODO: print "Left shift: <number<<1>" then "Right shift: <number>>1>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 11, true, 'hard', null, null, null, 'Stage-2/Bitwise-Shift-Operations', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q13', 'STG003', 'Follow the Precedence', '', 'Write a C program to store the expression 2 + 3 * 4 in a variable and print the result.', 'Use int variables. Use + and *. Do not use parentheses. Follow the normal operator precedence.', '', '14', '#include <stdio.h>

int main() {
    int a = 2;
    int b = 3;
    int c = 4;

    // TODO: compute result = a + b * c (no parentheses) and print it

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 12, true, 'easy', null, null, null, 'Stage-2/Follow-The-Precedence', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q14', 'STG003', 'Change the Order with Parentheses', '', 'Write a C program to calculate (2 + 3) * 4 and print the result.

The program must use parentheses so that addition is performed before multiplication.', 'Use int variables. Use + and *. Use parentheses. Do not use if or else. Do not use scanf().', '', '20', '#include <stdio.h>

int main() {
    int a = 2;
    int b = 3;
    int c = 4;

    // TODO: compute result = (a + b) * c and print it

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 13, true, 'medium', null, null, null, 'Stage-2/Change-The-Order-With-Parentheses', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S2-Q15', 'STG003', 'Precedence and Associativity', '', 'Write a C program to store the values 10, 5, and 2 and calculate the expression:
10 - 5 + 2

Print the result.

The expression should follow the left-to-right associativity of - and +.', 'Use int variables. Use - and +. Do not use parentheses. Follow left-to-right associativity. Do not use scanf().', '', '7', '#include <stdio.h>

int main() {
    int a = 10;
    int b = 5;
    int c = 2;

    // TODO: compute result = a - b + c and print it

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 14, true, 'hard', null, null, null, 'Stage-2/Precedence-And-Associativity', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q1', 'STG004', 'Shopping Bill Calculator', '', 'A customer buys a product from a shop. Given the price of one product and the quantity purchased, calculate the total bill amount.', '', '250.50
4', 'Total Bill: 1002.00', '#include <stdio.h>

int main() {
    float price, total;
    int quantity;

    scanf("%f", &price);
    scanf("%d", &quantity);

    // TODO: compute total = price * quantity and print "Total Bill: <total>" (2 decimal places)

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 0, true, 'easy', null, null, null, 'Stage-3/Shopping-Bill-Calculator', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q2', 'STG004', 'Distance Converter', '', 'A person enters a distance in kilometers. Convert the given distance into meters and centimeters.

Use:
1 kilometer = 1000 meters
1 meter = 100 centimeters', '', '7.5', 'Meters: 7500.00
Centimeters: 750000.00', '#include <stdio.h>

int main() {
    float km, meters, centimeters;

    scanf("%f", &km);

    // TODO: compute meters and centimeters, then print both (2 decimal places)

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 1, true, 'easy', null, null, null, 'Stage-3/Distance-Converter', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q3', 'STG004', 'Student Average', '', 'A student has marks in three subjects. Read the three integer marks, calculate the total marks, and find the average as a decimal value.

Use type casting so that the average is not calculated as an integer.', '', '78 85 92', 'Total: 255
Average: 85.00', '#include <stdio.h>

int main() {
    int m1, m2, m3, total;
    float average;

    scanf("%d %d %d", &m1, &m2, &m3);

    // TODO: compute total and average (using type casting), then print both

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 2, true, 'easy', null, null, null, 'Stage-3/Student-Average', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q4', 'STG004', 'Temperature Converter', '', 'A weather application receives a temperature in Celsius. Convert it into Fahrenheit using the formula:
Fahrenheit = (Celsius * 9 / 5) + 32

Display the result with two decimal places.', '', '37', 'Fahrenheit: 98.60', '#include <stdio.h>

int main() {
    float celsius, fahrenheit;

    scanf("%f", &celsius);

    // TODO: compute fahrenheit = (celsius * 9 / 5) + 32 and print it (2 decimal places)

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 3, true, 'easy', null, null, null, 'Stage-3/Temperature-Converter', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q5', 'STG004', 'Time Converter', '', 'A digital system receives a total number of seconds. Convert the value into minutes and remaining seconds.

For example, 367 seconds contains 6 complete minutes and 7 remaining seconds.', '', '367', 'Minutes: 6
Seconds: 7', '#include <stdio.h>

int main() {
    int totalSeconds, minutes, seconds;

    scanf("%d", &totalSeconds);

    // TODO: compute minutes and seconds, then print both

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 4, true, 'easy', null, null, null, 'Stage-3/Time-Converter', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q6', 'STG004', 'Character Information', '', 'A program receives a single character. Display the entered character and its corresponding ASCII value.', '', 'A', 'Character: A
ASCII: 65', '#include <stdio.h>

int main() {
    char ch;

    scanf(" %c", &ch);

    // TODO: print "Character: <ch>" then "ASCII: <ascii value>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 5, true, 'easy', null, null, null, 'Stage-3/Character-Information', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q7', 'STG004', 'Data Type Display', '', 'A program receives an integer, a decimal number, and a character. Store each value using an appropriate data type and display them using the correct format specifiers.', '', '25 45.75 K', 'Integer: 25
Decimal: 45.75
Character: K', '#include <stdio.h>

int main() {
    int number;
    float value;
    char ch;

    scanf("%d %f %c", &number, &value, &ch);

    // TODO: print Integer, Decimal (2 decimal places) and Character on separate lines

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 6, true, 'easy', null, null, null, 'Stage-3/Data-Type-Display', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q8', 'STG004', 'Salary Calculator', '', 'An employee''s basic salary, allowance percentage, and deduction percentage are given.

Calculate:
Allowance = Basic Salary * Allowance% / 100
Gross Salary = Basic Salary + Allowance
Deduction = Gross Salary * Deduction% / 100
Net Salary = Gross Salary - Deduction

Display all calculated values with two decimal places.', '', '30000 20 10', 'Allowance: 6000.00
Gross: 36000.00
Deduction: 3600.00
Net Salary: 32400.00', '#include <stdio.h>

int main() {
    float basic, allowancePercent, deductionPercent;
    float allowance, gross, deduction, net;

    scanf("%f %f %f", &basic, &allowancePercent, &deductionPercent);

    // TODO: compute allowance, gross, deduction and net, then print all four (2 decimal places)

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 7, true, 'medium', null, null, null, 'Stage-3/Salary-Calculator', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q9', 'STG004', 'Age Validation', '', 'A registration system receives a person''s age. A valid age must be between 0 and 120.

Create a Boolean result using relational and logical operators:
1 = Valid
0 = Invalid', '', '25', 'Valid: 1', '#include <stdio.h>
#include <stdbool.h>

int main() {
    int age;
    bool valid;

    scanf("%d", &age);

    // TODO: compute valid = (age >= 0 && age <= 120) and print "Valid: <valid>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 8, true, 'medium', null, null, null, 'Stage-3/Age-Validation', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q10', 'STG004', 'Product Discount Calculator', '', 'An online store receives a product price and a discount percentage. Calculate the discount amount and the final price after discount.

Use:
Discount = Price * Discount% / 100
Final Price = Price - Discount', '', '2500 15', 'Discount: 375.00
Final Price: 2125.00', '#include <stdio.h>
int main() {
    float price, discountPercent;
    float discount, finalPrice;

    scanf("%f %f", &price, &discountPercent);

    // TODO: compute discount and finalPrice, then print both (2 decimal places)

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 9, true, 'medium', null, null, null, 'Stage-3/Product-Discount-Calculator', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q11', 'STG004', 'Character Comparison', '', 'A system receives two characters. Compare them and store the result in a Boolean variable. The result should be:
1 if both characters are the same
0 if they are different', '', 'A A', 'Same: 1', '#include <stdio.h>
#include <stdbool.h>

int main() {
    char first, second;
    bool same;

    scanf(" %c %c", &first, &second);

    // TODO: compute same = (first == second) and print "Same: <same>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 10, true, 'medium', null, null, null, 'Stage-3/Character-Comparison', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q12', 'STG004', 'Bitwise Permission Checker', '', 'A computer system stores permissions using bits:
Read = 1
Write = 2
Execute = 4

The total permission value is the combination of these permissions.

For a given permission value, use the bitwise AND (&) operator to determine whether each permission is enabled.', '', '5', 'Read: 1
Write: 0
Execute: 1', '#include <stdio.h>

int main() {
    int permission;

    scanf("%d", &permission);

    // TODO: print Read, Write and Execute (0 or 1) using the bitwise AND operator against 1, 2 and 4

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 11, true, 'medium', null, null, null, 'Stage-3/Bitwise-Permission-Checker', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q13', 'STG004', 'Marks and Percentage', '', 'A student receives marks in five subjects. Each subject is out of 100.

Calculate the total marks and percentage.

Use type casting so that the percentage is calculated as a floating-point value.', '', '78 82 91 67 88', 'Total: 406
Percentage: 81.20', '#include <stdio.h>

int main() {
    int m1, m2, m3, m4, m5;
    int total;
    float percentage;

    scanf("%d %d %d %d %d", &m1, &m2, &m3, &m4, &m5);

    // TODO: compute total and percentage (using type casting), then print both

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 12, true, 'medium', null, null, null, 'Stage-3/Marks-And-Percentage', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q14', 'STG004', 'Student Details Input', '', 'A student registration form collects three pieces of information:
- Student name
- Age
- Grade character

Read the values and display them in the required format.

Use the appropriate format specifiers for string, integer, and character input.', '', 'Arun
21
A', 'Name: Arun
Age: 21
Grade: A', '#include <stdio.h>

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
', '', '', '', 'Nice work! All tests passed.', '', 13, true, 'medium', null, null, null, 'Stage-3/Student-Details-Input', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S3-Q15', 'STG004', 'Employee Salary Record', '', 'An employee record contains:
- Employee name
- Employee ID
- Basic salary
- Bonus percentage
- Employee grade

Read all the details and calculate the bonus and final salary.

Use:
Bonus = Basic Salary * Bonus% / 100
Final Salary = Basic Salary + Bonus

Display the employee information and calculated salary details.', '', 'Arun
105
35000
12.5
A', 'Name: Arun
ID: 105
Grade: A
Bonus: 4375.00
Final Salary: 39375.00', '#include <stdio.h>

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
', '', '', '', 'Nice work! All tests passed.', '', 14, true, 'medium', null, null, null, 'Stage-3/Employee-Salary-Record', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q1', 'STG005', 'Check Positive Number', '', 'Given an integer N, check whether the number is positive. If N is greater than 0, print Positive.', '', '10', 'Positive', '#include <stdio.h>
int main() {

    int N;
    scanf("%d", &N);

    // TODO: if (N > 0) print "Positive"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 0, true, 'easy', null, null, null, 'Stage-4/Check-Positive-Number', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q2', 'STG005', 'Check Voting Eligibility', '', 'Given a person''s age, determine whether the person is eligible to vote. A person is eligible when the age is 18 or above.', '', '20', 'Eligible', '#include <stdio.h>

int main() {
    int age;
    scanf("%d", &age);

    // TODO: print "Eligible" if age >= 18, otherwise print "Not Eligible"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 1, true, 'easy', null, null, null, 'Stage-4/Check-Voting-Eligibility', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q3', 'STG005', 'Select a Day', '', 'Given a number from 1 to 3, print the corresponding day.
1 = Monday
2 = Tuesday
3 = Wednesday', '', '2', 'Tuesday', '#include <stdio.h>

int main() {
    int day;
    scanf("%d", &day);

    // TODO: use switch-case to print Monday, Tuesday or Wednesday

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 2, true, 'easy', null, null, null, 'Stage-4/Select-A-Day', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q4', 'STG005', 'Pass or Fail', '', 'Given the marks of a student, print Pass if the marks are 50 or above. Otherwise, print Fail. Use the ternary operator.', '', '75', 'Pass', '#include <stdio.h>

int main() {
    int marks;
    scanf("%d", &marks);

    // TODO: print "Pass" or "Fail" using the ternary operator

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 3, true, 'easy', null, null, null, 'Stage-4/Pass-Or-Fail', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q5', 'STG005', 'Even or Odd', '', 'Given an integer N, determine whether the number is Even or Odd.', '', '8', 'Even', '#include <stdio.h>

int main() {
    int N;
    scanf("%d", &N);

    // TODO: print "Even" if N % 2 == 0, otherwise print "Odd"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 4, true, 'medium', null, null, null, 'Stage-4/Even-Or-Odd', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q6', 'STG005', 'Calculator Choice', '', 'Given two integers and a choice, perform the selected operation.
1 = Addition
2 = Subtraction
3 = Multiplication', '', '10 5
1', '15', '#include <stdio.h>

int main() {
    int a, b, choice;

    scanf("%d %d", &a, &b);
    scanf("%d", &choice);

    // TODO: use switch-case on choice to print a+b, a-b or a*b

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 5, true, 'medium', null, null, null, 'Stage-4/Calculator-Choice', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q7', 'STG005', 'Temperature Status', '', 'Given a temperature, print Hot if the temperature is greater than 25; otherwise print Cool.', '', '30', 'Hot', '#include <stdio.h>

int main() {
    int temperature;
    scanf("%d", &temperature);

    // TODO: print "Hot" or "Cool" using the ternary operator

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 6, true, 'medium', null, null, null, 'Stage-4/Temperature-Status', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q8', 'STG005', 'Grade the Student', '', 'Given a student''s marks, print:
75 or above = Distinction
50 to 74 = Pass
Below 50 = Fail', '', '80', 'Distinction', '#include <stdio.h>

int main() {
    int marks;
    scanf("%d", &marks);

    // TODO: print Distinction, Pass or Fail using if / else if / else

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 7, true, 'hard', null, null, null, 'Stage-4/Grade-The-Student', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q9', 'STG005', 'Menu and Eligibility', '', 'A program receives a menu choice and age.
If choice is 1, check the age.
  Age 18 or above = Adult
  Otherwise = Minor
If choice is 2, print Exit.', '', '1
20', 'Adult', '#include <stdio.h>

int main() {
    int choice, age;

    scanf("%d", &choice);
    scanf("%d", &age);

    // TODO: use switch on choice; for case 1 use if/else on age (Adult/Minor), for case 2 print "Exit"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 8, true, 'hard', null, null, null, 'Stage-4/Menu-And-Eligibility', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S4-Q10', 'STG005', 'Positive and Even/Odd', '', 'Given an integer N:
If N is positive, use the ternary operator to print Even or Odd.
If N is not positive, print Not Positive.', '', '8', 'Even', '#include <stdio.h>

int main() {
    int N;
    scanf("%d", &N);

    // TODO: if (N > 0) print Even/Odd via ternary, else print "Not Positive"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 9, true, 'hard', null, null, null, 'Stage-4/Positive-And-EvenOdd', null, null, null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q1', 'STG006', 'Daily Step Counter', '', 'A fitness app wants to display the number of steps completed each day for N days.

Given N, print the day number from 1 to N.', '', '5', '1
2
3
4
5', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: use a for loop to print numbers 1 to n, one per line

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 0, true, 'easy', null, null, null, 'Stage-5/Daily-Step-Counter', null, 'A single integer N.', 'Print numbers from 1 to N, one per line.');
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q2', 'STG006', 'Asterisk Triangle Generator', '', 'A graphics application needs to display a right-angle triangle pattern using asterisks. Write a C program that reads the number of rows and prints the triangle pattern.

Row 1 prints 1 asterisk, row 2 prints 2 asterisks, row 3 prints 3 asterisks, and so on until N rows are printed.', '', '4', '*
**
***
****', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: use a nested for loop to print a right-angle triangle of asterisks, n rows

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 1, true, 'easy', null, null, null, 'Stage-5/Asterisk-Triangle-Generator', null, 'A single integer N representing the number of rows.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q3', 'STG006', 'ATM PIN Attempts', '', 'An ATM allows a user to enter a PIN.

The correct PIN is 1234.

The user gets at most 3 attempts.

Stop immediately when the correct PIN is entered.', '', '5678
1111
1234', 'Access Granted', '#include <stdio.h>
int main()
{
    int pin;
    int attempts = 0;

    // TODO: use a while loop (attempts < 3); read pin, increment attempts, break with
    // "Access Granted" on a correct PIN, otherwise print "Access Denied" after 3 attempts

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 2, true, 'easy', null, null, null, 'Stage-5/ATM-PIN-Attempts', null, 'Three PIN attempts, one per line.', 'Print "Access Granted" if the correct PIN is entered. Print "Access Denied" if all attempts are incorrect.');
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q4', 'STG006', 'Harmonic Series Calculator', '', 'A mathematical application needs to calculate the sum of the first N terms of a harmonic series. Write a C program to display the series and calculate its sum.', '', '5', '1/1 + 1/2 + 1/3 + 1/4 + 1/5
Sum of Series upto 5 terms : 2.283334', '#include <stdio.h>
int main()
{
    int n;
    float sum = 0.0;
    scanf("%d", &n);

    // TODO: for each term i from 1 to n, print "1/i" (with " + " between terms) and add 1.0/i to sum;
    // then print "\nSum of Series upto <n> terms : <sum>"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 3, true, 'medium', null, null, null, 'Stage-5/Harmonic-Series-Calculator', null, 'A single integer N representing the number of terms.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q5', 'STG006', 'Find the First Failed Sensor', '', 'A factory has N sensors. Each sensor sends a value:
1 = Working
0 = Failed

The system should scan the sensors and stop as soon as the first failed sensor is found. Print its position. If all sensors work, print All Sensors Working.', '', '6
1 1 1 0 1 1', 'Sensor 4 Failed', '#include <stdio.h>

int main()
{
    int n, value;
    int found = 0;
    scanf("%d", &n);

    // TODO: loop i from 1 to n, read value; if value == 0 print "Sensor <i> Failed", set found=1, break.
    // After the loop, if !found print "All Sensors Working"

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 4, true, 'medium', null, null, null, 'Stage-5/Find-The-First-Failed-Sensor', null, 'First line: N. Second line: N sensor values.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q6', 'STG006', 'Perfect Number Detector', '', 'A number-analysis system needs to identify whether a given number is a Perfect Number. Write a C program to check whether the input number is equal to the sum of its proper divisors.

A proper divisor divides N exactly and is less than N. Example: 6 has divisors 1, 2, 3 and 1+2+3=6, so 6 is a Perfect Number.', '', '6', '6 is a Perfect Number.', '#include <stdio.h>
int main()
{
    int n, sum = 0;
    scanf("%d", &n);

    // TODO: sum all proper divisors of n (1 to n-1), then print "<n> is a Perfect Number."
    // if sum == n, otherwise "<n> is not a Perfect Number."

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 5, true, 'medium', null, null, null, 'Stage-5/Perfect-Number-Detector', null, 'A single positive integer N.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q7', 'STG006', 'Classroom Attendance Matrix', '', 'A teacher records attendance for several students over several days.
1 = Present
0 = Absent

Given the number of students and days, calculate the total attendance for each student.', '', '3 4
1 1 0 1
1 0 1 1
0 1 0 1', 'Student 1: 3
Student 2: 3
Student 3: 2', '#include <stdio.h>
int main()
{
    int students, days;
    scanf("%d %d", &students, &days);

    // TODO: outer loop over students, inner loop over days summing attendance;
    // print "Student <i>: <attendance>" per student

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 6, true, 'hard', null, null, null, 'Stage-5/Classroom-Attendance-Matrix', null, 'First line: Students Days. Then the attendance values.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q8', 'STG006', 'Parking Lot Grid', '', 'A parking lot has R rows and C parking spaces in each row.
1 = Occupied
0 = Empty

Find the total number of empty spaces.', '', '3 4
1 0 1 0
0 0 1 1
1 0 0 0', '7', '#include <stdio.h>
int main()
{
    int rows, cols;
    int empty = 0;
    scanf("%d %d", &rows, &cols);

    // TODO: nested loop over rows/cols, count spots equal to 0, print the total

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 7, true, 'hard', null, null, null, 'Stage-5/Parking-Lot-Grid', null, 'First line: R C. Next R lines contain C values.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q9', 'STG006', 'Number Pattern Generator', '', 'A learning app generates a number pattern based on the number of rows.

For each row, print numbers starting from 1 up to the row number.', '', '5', '1
1 2
1 2 3
1 2 3 4
1 2 3 4 5', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: nested for loop - outer over rows 1..n, inner prints 1..row (space-separated), newline per row

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 8, true, 'hard', null, null, null, 'Stage-5/Number-Pattern-Generator', null, 'A single integer N.', null);
insert into practice_bank (practice_id, stage_id, title, objective, problem_statement, constraints, sample_input, sample_output, starter_code, hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active, difficulty, marks, time_limit_seconds, memory_limit_mb, workspace_folder, experiment_number, input_format, output_format) values ('S5-Q10', 'STG006', 'Smart Number Scanner', '', 'A security system scans numbers from 1 to N.

For every number:
If it is divisible by 5, skip it.
If it is divisible by 17, stop scanning immediately.
Otherwise, print the number.', '', '30', '1 2 3 4 6 7 8 9 11 12 13 14 16', '#include <stdio.h>
int main()
{
    int n;
    scanf("%d", &n);

    // TODO: for i from 1 to n: if i%17==0 break; if i%5==0 continue; otherwise print i followed by a space

    return 0;
}
', '', '', '', 'Nice work! All tests passed.', '', 9, true, 'hard', null, null, null, 'Stage-5/Smart-Number-Scanner', null, 'A single integer N.', null);

insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q1-T1', 'S0-Q1', 'Sample case', '', 'Welcome to C Programming!', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q2-T1', 'S0-Q2', 'Sample case', '', 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q3-T1', 'S0-Q3', 'Sample case', '', 'My age is 18', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q4-T1', 'S0-Q4', 'Sample case', '', 'My marks are 85', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q5-T1', 'S0-Q5', 'Sample case', '', 'Initial: S
Age: 18
Percentage: 85.5', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q6-T1', 'S0-Q6', 'Sample case', '', '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q7-T1', 'S0-Q7', 'Sample case', '', 'My age is 18
My grade is A', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q8-T1', 'S0-Q8', 'Sample case', '', '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q9-T1', 'S0-Q9', 'Sample case', '', 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q10-T1', 'S0-Q10', 'Sample case', '', '************************
 STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q1-T1', 'S1-Q1', 'Sample case', '', '30', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q2-T1', 'S1-Q2', 'Sample case', '', '40', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q3-T1', 'S1-Q3', 'Sample case', '', 'A', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q4-T1', 'S1-Q4', 'Sample case', '', '20.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q5-T1', 'S1-Q5', 'Sample case', '', '3.50', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q6-T1', 'S1-Q6', 'Sample case', '', '123456.789123', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q7-T1', 'S1-Q7', 'Sample case', '', 'Character: A
Value: 65', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q8-T1', 'S1-Q8', 'Sample case', '', 'Total: 255
Average: 85.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q9-T1', 'S1-Q9', 'Sample case', '', 'Code: 101
Product: L
Available: 1
Total: 1501.50', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q10-T1', 'S1-Q10', 'Sample case', '', 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q1-T1', 'S2-Q1', 'Sample case', '', '2', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q2-T1', 'S2-Q2', 'Sample case', '', 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q3-T1', 'S2-Q3', 'Sample case', '', 'After increment: 11
After decrement: 10', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q4-T1', 'S2-Q4', 'Sample case', '', '60', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q5-T1', 'S2-Q5', 'Sample case', '', '40', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q6-T1', 'S2-Q6', 'Sample case', '', 'a: 25
b: 25', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q7-T1', 'S2-Q7', 'Sample case', '', '1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q8-T1', 'S2-Q8', 'Sample case', '', '1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q9-T1', 'S2-Q9', 'Sample case', '', '1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q10-T1', 'S2-Q10', 'Sample case', '', '1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q11-T1', 'S2-Q11', 'Sample case', '', 'OR: 7
XOR: 6', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q12-T1', 'S2-Q12', 'Sample case', '', 'Left shift: 10
Right shift: 2', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q13-T1', 'S2-Q13', 'Sample case', '', '14', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q14-T1', 'S2-Q14', 'Sample case', '', '20', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q15-T1', 'S2-Q15', 'Sample case', '', '7', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q1-T1', 'S3-Q1', 'Sample case', '250.50
4', 'Total Bill: 1002.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q1-T2', 'S3-Q1', 'Example case', '125.75
6', 'Total Bill: 754.50', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q2-T1', 'S3-Q2', 'Sample case', '7.5', 'Meters: 7500.00
Centimeters: 750000.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q2-T2', 'S3-Q2', 'Example case', '2.25', 'Meters: 2250.00
Centimeters: 225000.00', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q3-T1', 'S3-Q3', 'Sample case', '78 85 92', 'Total: 255
Average: 85.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q3-T2', 'S3-Q3', 'Example case', '67 74 81', 'Total: 222
Average: 74.00', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q4-T1', 'S3-Q4', 'Sample case', '37', 'Fahrenheit: 98.60', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q4-T2', 'S3-Q4', 'Example case', '25.5', 'Fahrenheit: 77.90', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q5-T1', 'S3-Q5', 'Sample case', '367', 'Minutes: 6
Seconds: 7', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q5-T2', 'S3-Q5', 'Example case', '725', 'Minutes: 12
Seconds: 5', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q6-T1', 'S3-Q6', 'Sample case', 'A', 'Character: A
ASCII: 65', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q6-T2', 'S3-Q6', 'Example case', 'z', 'Character: z
ASCII: 122', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q7-T1', 'S3-Q7', 'Sample case', '25 45.75 K', 'Integer: 25
Decimal: 45.75
Character: K', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q7-T2', 'S3-Q7', 'Example case', '100 12.50 M', 'Integer: 100
Decimal: 12.50
Character: M', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q8-T1', 'S3-Q8', 'Sample case', '30000 20 10', 'Allowance: 6000.00
Gross: 36000.00
Deduction: 3600.00
Net Salary: 32400.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q8-T2', 'S3-Q8', 'Example case', '45000 15 8', 'Allowance: 6750.00
Gross: 51750.00
Deduction: 4140.00
Net Salary: 47610.00', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q9-T1', 'S3-Q9', 'Sample case', '25', 'Valid: 1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q9-T2', 'S3-Q9', 'Example case', '150', 'Valid: 0', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q10-T1', 'S3-Q10', 'Sample case', '2500 15', 'Discount: 375.00
Final Price: 2125.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q10-T2', 'S3-Q10', 'Example case', '4800 20', 'Discount: 960.00
Final Price: 3840.00', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q11-T1', 'S3-Q11', 'Sample case', 'A A', 'Same: 1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q11-T2', 'S3-Q11', 'Example case', 'A B', 'Same: 0', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q12-T1', 'S3-Q12', 'Sample case', '5', 'Read: 1
Write: 0
Execute: 1', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q12-T2', 'S3-Q12', 'Example case', '7', 'Read: 1
Write: 1
Execute: 1', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q13-T1', 'S3-Q13', 'Sample case', '78 82 91 67 88', 'Total: 406
Percentage: 81.20', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q13-T2', 'S3-Q13', 'Example case', '65 72 84 91 78', 'Total: 390
Percentage: 78.00', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q14-T1', 'S3-Q14', 'Sample case', 'Arun
21
A', 'Name: Arun
Age: 21
Grade: A', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q14-T2', 'S3-Q14', 'Example case', 'Priya
19
B', 'Name: Priya
Age: 19
Grade: B', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q15-T1', 'S3-Q15', 'Sample case', 'Arun
105
35000
12.5
A', 'Name: Arun
ID: 105
Grade: A
Bonus: 4375.00
Final Salary: 39375.00', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q15-T2', 'S3-Q15', 'Example case', 'Priya
208
42000
10
B', 'Name: Priya
ID: 208
Grade: B
Bonus: 4200.00
Final Salary: 46200.00', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q1-T1', 'S4-Q1', 'Sample case', '10', 'Positive', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q1-T2', 'S4-Q1', 'Example case', '-5', '', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q2-T1', 'S4-Q2', 'Sample case', '20', 'Eligible', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q2-T2', 'S4-Q2', 'Example case', '16', 'Not Eligible', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q3-T1', 'S4-Q3', 'Sample case', '2', 'Tuesday', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q3-T2', 'S4-Q3', 'Example case', '3', 'Wednesday', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q4-T1', 'S4-Q4', 'Sample case', '75', 'Pass', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q4-T2', 'S4-Q4', 'Example case', '35', 'Fail', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q5-T1', 'S4-Q5', 'Sample case', '8', 'Even', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q5-T2', 'S4-Q5', 'Example case', '7', 'Odd', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q6-T1', 'S4-Q6', 'Sample case', '10 5
1', '15', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q6-T2', 'S4-Q6', 'Example case', '10 5
3', '50', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q7-T1', 'S4-Q7', 'Sample case', '30', 'Hot', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q7-T2', 'S4-Q7', 'Example case', '20', 'Cool', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q8-T1', 'S4-Q8', 'Sample case', '80', 'Distinction', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q8-T2', 'S4-Q8', 'Example case', '65', 'Pass', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q9-T1', 'S4-Q9', 'Sample case', '1
20', 'Adult', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q9-T2', 'S4-Q9', 'Example case', '1
15', 'Minor', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q10-T1', 'S4-Q10', 'Sample case', '8', 'Even', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q10-T2', 'S4-Q10', 'Example case', '-3', 'Not Positive', false, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q1-T1', 'S5-Q1', 'Sample case', '5', '1
2
3
4
5', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q2-T1', 'S5-Q2', 'Sample case', '4', '*
**
***
****', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q3-T1', 'S5-Q3', 'Sample case', '5678
1111
1234', 'Access Granted', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q4-T1', 'S5-Q4', 'Sample case', '5', '1/1 + 1/2 + 1/3 + 1/4 + 1/5
Sum of Series upto 5 terms : 2.283334', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q5-T1', 'S5-Q5', 'Sample case', '6
1 1 1 0 1 1', 'Sensor 4 Failed', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q6-T1', 'S5-Q6', 'Sample case', '6', '6 is a Perfect Number.', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q7-T1', 'S5-Q7', 'Sample case', '3 4
1 1 0 1
1 0 1 1
0 1 0 1', 'Student 1: 3
Student 2: 3
Student 3: 2', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q8-T1', 'S5-Q8', 'Sample case', '3 4
1 0 1 0
0 0 1 1
1 0 0 0', '7', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q9-T1', 'S5-Q9', 'Sample case', '5', '1
1 2
1 2 3
1 2 3 4
1 2 3 4 5', false, 5000, true, 0);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q10-T1', 'S5-Q10', 'Sample case', '30', '1 2 3 4 6 7 8 9 11 12 13 14 16', false, 5000, true, 0);
