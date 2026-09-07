-- Seeds Experiment 0-16 (57 questions) into the existing practice_bank /
-- practice_tests tables, so they become real, openable CLICK Practice
-- challenges reachable from VS Code -- not a parallel system.
--
-- practice_id values reuse the EXACT ids already used by the EXPERIMENTS
-- constant in index.html (E00-Q1 ... E16-Q3), so the web question page and
-- the VS Code challenge are guaranteed to be the same question -- there is
-- no separate mapping table to keep in sync.
--
-- stage_id is NULL for every row here (see the companion schema migration
-- that made this column nullable): Experiments are not part of the Stage
-- system, so this keeps them completely invisible to the existing
-- Stage-filtered Practice tab and Progress page, with zero risk of
-- polluting either.
--
-- IMPORTANT -- hidden tests are intentionally NOT seeded here.
-- The original Experiments specification never supplied hidden expected
-- outputs (by design, so they could stay protected) -- only their name,
-- marks, and input were ever given. Seeding hiddenTests rows without a real
-- expected_output would make every hidden test permanently unpassable
-- (comparing real program output against an empty string), which would
-- silently break "Check Code" for every Experiments question. Rather than
-- fabricate expected outputs (never done in this project), grading via VS
-- Code for Experiments currently runs public tests only. If real hidden
-- expected outputs are supplied later through a secure channel, add them as
-- a follow-up migration -- do not edit this one.
--
-- Public tests seeded: 113
-- Hidden tests intentionally skipped (no expected_output available): 91

insert into practice_bank (
  practice_id, stage_id, title, objective, problem_statement,
  constraints, sample_input, sample_output, starter_code,
  hint_1, hint_2, hint_3, success_message, technique_after_success, "order", active,
  difficulty, marks, time_limit_seconds, memory_limit_mb,
  workspace_folder, experiment_number, input_format, output_format
) values
  ('E00-Q1', NULL, 'Calculate Area and Perimeter', '', 'Read the length and the breadth of a rectangle, then print its area and its perimeter.

The classic first algorithm: read two values, apply two formulas, print two results.

Algorithm
1. Start
2. Read length and breadth
3. area = length x breadth
4. perimeter = 2 x (length + breadth)
5. Print area and perimeter
6. Stop', '1 <= length, breadth <= 1000', '5 3', 'Area: 15
Perimeter: 16', '#include <stdio.h>

int main(void)
{
    int length, breadth;

    scanf("%d %d", &length, &breadth);

    /* compute the area and the perimeter, then print */

    return 0;
}', NULL, NULL, NULL, NULL, 'Area = 5 x 3 = 15. Perimeter = 2 x (5 + 3) = 16.', 0, true, 'easy', 5, 5, 64, 'Experiment-00/Calculate-Area-and-Perimeter', 0, 'A single line with two integers separated by a space: the length and the breadth.', 'Two lines:
`Area: <area>`
`Perimeter: <perimeter>`'),
  ('E00-Q2', NULL, 'Days to Year Conversion', '', 'Read a number of days and convert it into whole years and the days left over. Treat every year as 365 days.

Two operators do all the work here: integer division gives the number of whole years, and the remainder operator gives the days that do not make up a full year.

Algorithm
1. Start
2. Read days
3. years = days / 365
4. remaining = days % 365
5. Print years and remaining
6. Stop', '0 <= days <= 100000', '430', 'Years: 1
Days: 65', '#include <stdio.h>

int main(void)
{
    int days;

    scanf("%d", &days);

    /* use / for the years and %% for the days left */

    return 0;
}', NULL, NULL, NULL, NULL, '430 / 365 = 1 whole year, and 430 % 365 = 65 days left.', 1, true, 'easy', 5, 5, 64, 'Experiment-00/Days-to-Year-Conversion', 0, 'A single integer: the number of days.', 'Two lines:
`Years: <years>`
`Days: <remaining days>`'),
  ('E00-Q3', NULL, 'Prime Number', '', 'Read an integer and decide whether it is a prime number.

A prime number is a whole number greater than 1 whose only divisors are 1 and itself. 1 is not prime, and 2 is the only even prime.

Algorithm
1. Start
2. Read n
3. If n <= 1, print Not Prime and stop
4. Set count = 0
5. For every i from 2 to n - 1, if n is divisible by i, add 1 to count
6. If count is 0, print Prime, otherwise print Not Prime
7. Stop', '1 <= n <= 100000', '29', 'Prime', '#include <stdio.h>

int main(void)
{
    int n, i, count = 0;

    scanf("%d", &n);

    /* count how many numbers between 2 and n-1 divide n
       exactly, then decide - remember n <= 1 is never
       prime */

    return 0;
}', NULL, NULL, NULL, NULL, 'No number between 2 and 28 divides 29 exactly, so 29 is prime.', 2, true, 'medium', 10, 5, 64, 'Experiment-00/Prime-Number', 0, 'A single integer n.', 'Exactly one line: Prime if n is a prime number, otherwise Not Prime.'),
  ('E00-Q4', NULL, 'Palindrome Number', '', 'Read an integer and decide whether it reads the same forwards and backwards.

Build the reverse of the number one digit at a time, then compare it with the original. Keep a copy of the input before you start - the loop destroys it.

Algorithm
1. Start
2. Read n and copy it into original
3. Set reversed = 0
4. While n > 0:
     digit = n % 10
     reversed = reversed * 10 + digit
     n = n / 10
5. If reversed equals original, print Palindrome, otherwise print Not Palindrome
6. Stop', '0 <= n <= 1000000 · A single-digit number is always a palindrome.', '12321', 'Palindrome', '#include <stdio.h>

int main(void)
{
    int n, original, digit, reversed = 0;

    scanf("%d", &n);
    original = n;

    /* peel off one digit at a time with %% and /,
       building `reversed` as you go, then compare */

    return 0;
}', NULL, NULL, NULL, NULL, 'Reversing 12321 gives 12321, which matches the original, so it is a palindrome.', 3, true, 'hard', 15, 5, 64, 'Experiment-00/Palindrome-Number', 0, 'A single non-negative integer n.', 'Exactly one line: Palindrome or Not Palindrome.'),
  ('E01-Q1', NULL, 'Say "Hello, World!" With C', '', 'Print the exact line Hello, World! - the traditional first C program.

Every C program starts the same way: include stdio.h so printf is available, write a main function, print, and return 0 to tell the operating system all went well.

This question has no input at all. Print the message exactly as shown, including the comma and the exclamation mark.', 'Print the message exactly - spelling, punctuation and capitalisation all matter.', '', 'Hello, World!', '#include <stdio.h>

int main(void)
{
    /* print the message on one line */

    return 0;
}', NULL, NULL, NULL, NULL, 'printf writes the text between the quotes to the screen. The `\n` at the end moves to the next line.', 10, true, 'easy', 5, 5, 64, 'Experiment-01/Say-Hello-World-With-C', 1, 'There is no input for this question.', 'A single line: Hello, World!'),
  ('E01-Q2', NULL, 'Sum and Difference of Two Numbers', '', 'Read a pair of integers and a pair of real numbers, then print the sum and the difference of each pair.

The point of this question is the type, not the arithmetic. Integers are read with %d and printed with %d. Real numbers are read with %lf into a double and printed with %.1lf so that exactly one digit appears after the decimal point.', '1 <= integers <= 10000 · 1.0 <= real numbers <= 10000.0', '10 4
4.0 2.0', '14 6
6.0 2.0', '#include <stdio.h>

int main(void)
{
    int a, b;
    double x, y;

    scanf("%d %d", &a, &b);
    scanf("%lf %lf", &x, &y);

    /* print the two sums and differences */

    return 0;
}', NULL, NULL, NULL, NULL, '10 + 4 = 14 and 10 - 4 = 6. For the real numbers, 4.0 + 2.0 = 6.0 and 4.0 - 2.0 = 2.0, both printed with one decimal place.', 11, true, 'easy', 5, 5, 64, 'Experiment-01/Sum-and-Difference-of-Two-Numbers', 1, 'Line 1: two integers separated by a space.
Line 2: two real numbers separated by a space.', 'Line 1: the sum and the difference of the two integers, separated by a space.
Line 2: the sum and the difference of the two real numbers, each to exactly one decimal place, separated by a space.'),
  ('E01-Q3', NULL, 'Playing with Characters', '', 'Read a single character, then a word, then a whole sentence, and print each of them on its own line.

Reading a sentence is the interesting part. %c reads one character and %s reads one word - it stops at the first space. To capture a full line, spaces included, use `scanf(" %[^\n]", sentence)`, which reads everything up to the newline.

Watch out for the newline the Enter key leaves behind after the character: a leading space in the format string tells scanf to skip it.', 'The word is at most 100 characters. The sentence is at most 100 characters.', 'C
Language
Welcome to C programming', 'C
Language
Welcome to C programming', '#include <stdio.h>

int main(void)
{
    char ch;
    char word[101];
    char sentence[101];

    scanf("%c", &ch);
    scanf("%s", word);
    scanf(" %[^\n]", sentence);

    /* print the character, the word and the sentence */

    return 0;
}', NULL, NULL, NULL, NULL, 'The sentence contains spaces, so %s alone would print only Welcome. Reading up to the newline keeps the whole line together.', 12, true, 'medium', 10, 5, 64, 'Experiment-01/Playing-with-Characters', 1, 'Line 1: a single character.
Line 2: a word with no spaces.
Line 3: a sentence, which may contain spaces.', 'Three lines: the character, then the word, then the sentence, each exactly as it was read.'),
  ('E01-Q4', NULL, 'Average Marks', '', 'Read the marks a student scored in three subjects, then print the total and the average.

A short problem with one trap in it. The marks are integers, so total / 3 is integer division and throws away the fractional part - 250 / 3 would give 83 instead of 83.33.

Divide by 3.0, or cast the total to a float, so the average is calculated as a real number. Print it to exactly two decimal places.', '0 <= each mark <= 100', '85 90 78', 'Total: 253
Average: 84.33', '#include <stdio.h>

int main(void)
{
    int m1, m2, m3, total;
    float average;

    scanf("%d %d %d", &m1, &m2, &m3);

    /* add the three marks, then divide by 3.0 - not 3 -
       so the fraction survives */

    return 0;
}', NULL, NULL, NULL, NULL, '85 + 90 + 78 = 253. 253 / 3.0 = 84.333..., which prints as 84.33 with %.2f.', 13, true, 'hard', 15, 5, 64, 'Experiment-01/Average-Marks', 1, 'A single line with three integers separated by spaces: the marks in subject 1, subject 2 and subject 3.', 'Two lines:
`Total: <total>`
`Average: <average to exactly two decimal places>`'),
  ('E02-Q1', NULL, 'Arithmetic', '', 'Read two integers and print their sum, difference, product, quotient and remainder.

One question that exercises all five arithmetic operators. Both values are integers, so / performs integer division: 17 / 5 is 3, not 3.4. The remainder operator %% gives what is left over.', '1 <= a <= 10000 · 1 <= b <= 10000 · b is never zero, so you do not need to guard against division by zero.', '17 5', 'Sum: 22
Difference: 12
Product: 85
Quotient: 3
Remainder: 2', '#include <stdio.h>

int main(void)
{
    int a, b;

    scanf("%d %d", &a, &b);

    /* print all five results, one per line */

    return 0;
}', NULL, NULL, NULL, NULL, '17 / 5 is 3 because integer division discards the fraction, and 17 %% 5 is 2 because 5 x 3 = 15 leaves 2.', 20, true, 'easy', 5, 5, 64, 'Experiment-02/Arithmetic', 2, 'A single line with two integers a and b separated by a space.', 'Five lines:
`Sum: <a+b>` / `Difference: <a-b>` / `Product: <a*b>` / `Quotient: <a/b>` / `Remainder: <a%%b>`'),
  ('E02-Q2', NULL, 'Day Old Bread', '', 'A bakery sells yesterday''s loaves at 60% off. Work out what a customer pays for a given number of day-old loaves.

If 60% is taken off, the customer pays the remaining 40%. So the cost of one day-old loaf is price x 0.40, and the total is that multiplied by the number of loaves.

Do the multiplication in real arithmetic, not integer arithmetic, and print the total to exactly two decimal places.', '0 <= loaves <= 1000 · 0.00 <= price <= 500.00', '4
25.00', 'Total: 40.00', '#include <stdio.h>

int main(void)
{
    int loaves;
    float price, total;

    scanf("%d", &loaves);
    scanf("%f", &price);

    /* the customer pays 40%% of the normal price */

    return 0;
}', NULL, NULL, NULL, NULL, 'A 60% discount leaves 40% of 25.00, which is 10.00 per loaf. Four loaves cost 40.00.', 21, true, 'easy', 5, 5, 64, 'Experiment-02/Day-Old-Bread', 2, 'Line 1: an integer, the number of loaves bought.
Line 2: a real number, the normal price of one loaf in rupees.', 'One line:
`Total: <amount to exactly two decimal places>`'),
  ('E02-Q3', NULL, 'Say no to Handshakes!!!', '', 'Everyone in a room shakes hands with everyone else exactly once. Given the number of people, print how many handshakes take place.

Think it through rather than counting one by one. Each of the n people shakes hands with the other n - 1 people, which gives n x (n - 1). But that counts every handshake twice - once for each person involved - so the answer is n x (n - 1) / 2.

n x (n - 1) is always even, so the division is exact and plain integer arithmetic gives the right answer. Mind the brackets: n * n - 1 / 2 is not the same expression.', '0 <= n <= 10000 · With 0 or 1 person there are no handshakes at all.', '5', 'Handshakes: 10', '#include <stdio.h>

int main(void)
{
    int n;

    scanf("%d", &n);

    /* n * (n - 1) / 2 - keep the brackets */

    return 0;
}', NULL, NULL, NULL, NULL, '5 x 4 = 20 ordered pairs, and each handshake appears twice, so 20 / 2 = 10 handshakes.', 22, true, 'medium', 10, 5, 64, 'Experiment-02/Say-no-to-Handshakes', 2, 'A single integer n, the number of people.', 'One line:
`Handshakes: <number of handshakes>`'),
  ('E02-Q4', NULL, 'Goki and his Breakup', '', 'Goki wants to apologise with gifts. He spends as much of his money as he can on roses, then spends whatever is left on chocolates. Print how many of each he buys and how much money he has left.

Two rounds of the same pair of operators. Integer division tells you how many items the money stretches to, and the remainder tells you what is left to spend on the next thing.

1. roses = money / rose price
2. after roses, money left = money %% rose price
3. chocolates = that leftover / chocolate price
4. final money left = that leftover %% chocolate price

Every value is an integer, so no rounding is involved - just be careful to feed each step the leftover from the step before.', '0 <= money <= 100000 · 1 <= rose price <= 1000 · 1 <= chocolate price <= 1000 · Neither price is ever zero.', '100 30 7', 'Roses: 3
Chocolates: 1
Left: 3', '#include <stdio.h>

int main(void)
{
    int money, rose, chocolate;
    int roses, chocolates, left;

    scanf("%d %d %d", &money, &rose, &chocolate);

    /* buy roses first, then spend the remainder on
       chocolates - / for how many, %% for what is left */

    return 0;
}', NULL, NULL, NULL, NULL, '100 / 30 = 3 roses costing 90, leaving 10. 10 / 7 = 1 chocolate costing 7, leaving 3 rupees.', 23, true, 'hard', 15, 5, 64, 'Experiment-02/Goki-and-his-Breakup', 2, 'A single line with three integers separated by spaces: the money Goki has, the price of one rose, and the price of one chocolate.', 'Three lines:
`Roses: <number of roses>` / `Chocolates: <number of chocolates>` / `Left: <money left>`'),
  ('E03-Q1', NULL, 'Same Digit', '', 'Read a three-digit number and decide whether all three of its digits are the same.

Pull the digits apart with / and %%, then compare them.

For a three-digit number n:
hundreds = n / 100
tens = (n / 10) %% 10
units = n %% 10

All three are equal when hundreds == tens and tens == units. Join the two comparisons with the logical AND operator &&.', '100 <= n <= 999', '555', 'Yes', '#include <stdio.h>

int main(void)
{
    int n, hundreds, tens, units;

    scanf("%d", &n);

    /* split n into its three digits, then use an
       if...else with && to compare them */

    return 0;
}', NULL, NULL, NULL, NULL, 'The hundreds, tens and units digits of 555 are all 5, so the answer is Yes.', 30, true, 'easy', 5, 5, 64, 'Experiment-03/Same-Digit', 3, 'A single three-digit integer n.', 'One line: Yes if all three digits are the same, otherwise No.'),
  ('E03-Q2', NULL, 'Intro to Conditional Statements', '', 'Read an integer n and describe it as Weird or Not Weird according to the rules below.

The rules, in order:

If n is odd, print Weird.
If n is even and between 2 and 5 inclusive, print Not Weird.
If n is even and between 6 and 20 inclusive, print Weird.
If n is even and greater than 20, print Not Weird.

This is exactly what an else-if ladder is for. Test oddness with n %% 2 - it is 1 for an odd number and 0 for an even one.', '1 <= n <= 100', '3', 'Weird', '#include <stdio.h>

int main(void)
{
    int n;

    scanf("%d", &n);

    /* an else-if ladder: odd first, then the three
       even ranges */

    return 0;
}', NULL, NULL, NULL, NULL, '3 %% 2 is 1, so 3 is odd, and every odd number is Weird.', 31, true, 'easy', 5, 5, 64, 'Experiment-03/Intro-to-Conditional-Statements', 3, 'A single integer n.', 'One line: either Weird or Not Weird.'),
  ('E03-Q3', NULL, 'Day of Year', '', 'Read a date and print which day of the year it is - 1 January is day 1, 31 December is day 365 or 366.

Add up the lengths of all the months before the given month, then add the day.

Month lengths are 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, and February gains a day in a leap year.

A year is a leap year when it is divisible by 4 but not by 100, or when it is divisible by 400. So 2020 and 2000 are leap years, but 1900 is not.

A switch on the month - letting the cases fall through so that month 5 adds the lengths of months 1 to 4 - is a neat way to write this, but an else-if ladder is equally acceptable.', '1 <= month <= 12 · 1900 <= year <= 2100 · The day is always valid for the given month and year.', '1 3 2020', 'Day: 61', '#include <stdio.h>

int main(void)
{
    int day, month, year, total = 0, leap = 0;

    scanf("%d %d %d", &day, &month, &year);

    /* decide whether the year is a leap year, add up
       the months before this one, then add the day */

    return 0;
}', NULL, NULL, NULL, NULL, '2020 is a leap year, so January and February contribute 31 + 29 = 60 days. 1 March is therefore day 61.', 32, true, 'medium', 10, 5, 64, 'Experiment-03/Day-of-Year', 3, 'A single line with three integers separated by spaces: the day, the month and the year.', 'One line:
`Day: <day of the year>`'),
  ('E03-Q4', NULL, 'Pythagorean Triples', '', 'Read three side lengths and decide whether they form a right-angled triangle.

Three lengths a, b and c form a Pythagorean triple when the square of the longest one equals the sum of the squares of the other two.

The catch is that the three numbers arrive in no particular order, so the longest could be any of them. You do not need to sort anything - just check all three possibilities and join them with the logical OR operator:

a*a + b*b == c*c, or
a*a + c*c == b*b, or
b*b + c*c == a*a

Compare squares as integers - never use square roots here, because floating-point rounding makes the comparison unreliable.', '1 <= each side <= 1000', '3 4 5', 'Yes', '#include <stdio.h>

int main(void)
{
    int a, b, c;

    scanf("%d %d %d", &a, &b, &c);

    /* check all three arrangements with || - the
       longest side may be any of the three */

    return 0;
}', NULL, NULL, NULL, NULL, '3*3 + 4*4 = 9 + 16 = 25, which equals 5*5, so the three lengths form a right-angled triangle.', 33, true, 'hard', 15, 5, 64, 'Experiment-03/Pythagorean-Triples', 3, 'A single line with three positive integers separated by spaces.', 'One line: Yes if the three lengths form a Pythagorean triple in any order, otherwise No.'),
  ('E04-Q1', NULL, 'Number Count', '', 'Read a whole number and print how many digits it has.

You cannot ask C how long a number is, so you count the digits by removing them one at a time.

Dividing a whole number by 10 throws away its last digit: 4567 / 10 is 456, then 45, then 4, then 0. Keep dividing until the number reaches 0, adding one to a counter each time round, and the counter holds the number of digits.

Watch the special case: 0 has one digit, but the loop above never runs for it, so handle it separately.', '0 <= n <= 1000000000', '4567', 'Digits: 4', '#include <stdio.h>

int main(void)
{
    int n, count = 0;

    scanf("%d", &n);

    /* divide by 10 until nothing is left, counting as you
       go - and remember that 0 has one digit */

    return 0;
}', NULL, NULL, NULL, NULL, '4567 becomes 456, then 45, then 4, then 0 - four divisions, so four digits.', 40, true, 'easy', 5, 5, 64, 'Experiment-04/Number-Count', 4, 'A single whole number n.', 'One line:
`Digits: <how many digits n has>`'),
  ('E04-Q2', NULL, 'Nutrition Value', '', 'Read the calorie value of several food items, then print the total and the highest single value.

This is the accumulator pattern. Before the loop, set total to 0 and highest to the first value you read (or to 0, since calories are never negative). Inside the loop, add each value to total, and replace highest whenever the new value is bigger.

A for loop suits this well: you know exactly how many times it must run.', '1 <= n <= 100 · 0 <= each calorie value <= 5000', '5
120 250 90 300 180', 'Total: 940
Highest: 300', '#include <stdio.h>

int main(void)
{
    int n, i, value, total = 0, highest = 0;

    scanf("%d", &n);

    /* read n values, adding each to total and keeping
       track of the largest one seen so far */

    return 0;
}', NULL, NULL, NULL, NULL, '120 + 250 + 90 + 300 + 180 = 940, and the largest of the five values is 300.', 41, true, 'easy', 5, 5, 64, 'Experiment-04/Nutrition-Value', 4, 'Line 1: an integer n, the number of food items.
Line 2: n whole numbers separated by spaces, the calories of each item.', 'Two lines:
`Total: <sum of all values>` / `Highest: <largest single value>`'),
  ('E04-Q3', NULL, 'Holes in a Number', '', 'Count the closed loops - the "holes" - in the digits of a number.

Written down, some digits enclose a space:

0, 4, 6 and 9 each enclose one hole.
8 encloses two holes.
1, 2, 3, 5 and 7 enclose none.

Walk through the number one digit at a time with %% 10 and / 10, decide how many holes that digit contributes, and add it to a running total.

This is a loop wrapped around a decision - exactly the combination this week is about. Remember that 0 on its own still has one hole.', '0 <= n <= 1000000000', '819', 'Holes: 3', '#include <stdio.h>

int main(void)
{
    int n, digit, holes = 0;

    scanf("%d", &n);

    /* take one digit at a time and add its holes:
       0, 4, 6, 9 -> 1 hole    8 -> 2 holes    others -> 0
       do not forget that n may be 0 */

    return 0;
}', NULL, NULL, NULL, NULL, '8 contributes two holes, 1 contributes none and 9 contributes one, giving three in total.', 42, true, 'medium', 10, 5, 64, 'Experiment-04/Holes-in-a-Number', 4, 'A single whole number n.', 'One line:
`Holes: <total number of holes>`'),
  ('E04-Q4', NULL, 'Confusing Number', '', 'Decide whether a number still reads as a valid - but different - number when the page is turned upside down.

Turned through 180 degrees, some digits become another valid digit:

0 -> 0    1 -> 1    8 -> 8    6 -> 9    9 -> 6

Every other digit becomes nonsense.

A number is called confusing when both of these hold:
1. every one of its digits is rotatable, and
2. the rotated number is different from the original.

Build the rotated number as you go. Taking digits from the right with %% 10 and appending each rotated digit with rotated = rotated * 10 + r reverses the order for you, which is exactly what turning the page does.

Stop early if you meet a digit that cannot be rotated - this is what break is for.', '0 <= n <= 1000000000 · Leading zeros in the rotated number simply disappear, as they would in any int.', '6', 'Confusing', '#include <stdio.h>

int main(void)
{
    int n, m, digit, rotated = 0, valid = 1;

    scanf("%d", &n);
    m = n;

    /* rotate each digit from the right, building `rotated`.
       If a digit cannot be rotated, set valid = 0 and stop.
       Confusing means valid AND rotated != n */

    return 0;
}', NULL, NULL, NULL, NULL, '6 rotates to 9. Every digit is rotatable and 9 is not the same as 6, so the number is confusing.', 43, true, 'hard', 15, 5, 64, 'Experiment-04/Confusing-Number', 4, 'A single whole number n.', 'One line: Confusing if the number is confusing, otherwise Not Confusing.'),
  ('E05-Q1', NULL, 'Simple Chessboard', '', 'Print an n by n chessboard using # for the dark squares and a full stop for the light ones.

The outer loop walks down the rows, the inner loop across the columns of that row. Print one character per column, then move to the next line once the inner loop finishes.

Which character? Add the row number to the column number. If the total is even print #, otherwise print a full stop. Numbering both from 0 makes the top-left square a #.

Print no spaces between the characters.', '1 <= n <= 20', '4', '#.#.
.#.#
#.#.
.#.#', '#include <stdio.h>

int main(void)
{
    int n, row, col;

    scanf("%d", &n);

    /* outer loop over rows, inner loop over columns.
       Print ''#'' when (row + col) is even, ''.'' otherwise,
       and a newline at the end of each row. */

    return 0;
}', NULL, NULL, NULL, NULL, 'On row 0 the columns 0 and 2 give an even total, so those squares are #. Row 1 starts with an odd total, so the pattern shifts by one - which is what makes it look like a chessboard.', 50, true, 'easy', 5, 5, 64, 'Experiment-05/Simple-Chessboard', 5, 'A single integer n, the size of the board.', 'n lines, each with n characters and nothing else.'),
  ('E05-Q2', NULL, 'Pattern Printing', '', 'Print a right-angled triangle of stars with n rows: one star on the first row, two on the second, and so on.

The difference from the chessboard is that the inner loop does not run the same number of times on every row. On row i it runs i times, so the number of stars grows as you go down.

That is the whole idea behind pattern printing: the inner loop''s limit depends on the outer loop''s counter.', '1 <= n <= 30', '4', '*
**
***
****', '#include <stdio.h>

int main(void)
{
    int n, row, col;

    scanf("%d", &n);

    /* for each row from 1 to n, print that many stars
       then a newline */

    return 0;
}', NULL, NULL, NULL, NULL, 'Row 1 prints one star, row 2 prints two, and so on down to row 4.', 51, true, 'easy', 5, 5, 64, 'Experiment-05/Pattern-Printing', 5, 'A single integer n, the number of rows.', 'n lines. Line i contains exactly i stars and nothing else.'),
  ('E05-Q3', NULL, 'Armstrong Number', '', 'Print every Armstrong number from 1 up to n, one per line.

A number is an Armstrong number when raising each of its digits to the power of the digit count and adding the results gives the number back.

153 has 3 digits, and 1*1*1 + 5*5*5 + 3*3*3 = 153.
9474 has 4 digits, and 9^4 + 4^4 + 7^4 + 4^4 = 9474.
Every single-digit number counts, since d^1 is d.

This needs two loops. The outer one walks through the candidates from 1 to n. For each candidate, an inner loop counts its digits and another adds up the powers.

You do not need the pow function - a small loop that multiplies is more reliable, because pow returns a double and rounding can bite.', '1 <= n <= 10000', '200', '1
2
3
4
5
6
7
8
9
153', '#include <stdio.h>

int main(void)
{
    int n, number, digits, digit, temp, sum, i, power;

    scanf("%d", &n);

    /* for each number from 1 to n:
         count its digits
         add up each digit raised to that power
         print the number when the total matches */

    return 0;
}', NULL, NULL, NULL, NULL, 'The single-digit numbers 1 to 9 are all Armstrong numbers, and 153 is the only other one up to 200.', 52, true, 'medium', 10, 5, 64, 'Experiment-05/Armstrong-Number', 5, 'A single integer n, the upper limit.', 'Every Armstrong number from 1 to n inclusive, in increasing order, one per line.'),
  ('E05-Q4', NULL, 'Reverse and Add Until Get a Palindrome', '', 'Keep adding a number to its own reverse until the result reads the same forwards and backwards, then report how many additions it took.

Start with n. If it is already a palindrome, you are done in zero steps. Otherwise reverse its digits, add the reverse to it, and try again with the result.

87 -> 87 + 78 = 165
165 -> 165 + 561 = 726
726 -> 726 + 627 = 1353
1353 -> 1353 + 3531 = 4884, which is a palindrome.

Four additions, so the answer is 4 and 4884.

Two loops again, one inside the other: the outer loop repeats until the number is a palindrome, and the inner loop reverses the current number''s digits.

The totals grow quickly, so use long long rather than int, and print it with %lld.', '1 <= n <= 1000 · The answer always fits in a long long for these values.', '87', 'Steps: 4
Palindrome: 4884', '#include <stdio.h>

int main(void)
{
    long long n, m, reversed, steps = 0;

    scanf("%lld", &n);

    /* while n is not a palindrome:
         reverse its digits with an inner loop
         add the reverse to n
         count the step
       then print the count and the palindrome */

    return 0;
}', NULL, NULL, NULL, NULL, '87 needs four reverse-and-add rounds before it reaches 4884, which reads the same in both directions.', 53, true, 'hard', 15, 5, 64, 'Experiment-05/Reverse-and-Add-Until-Get-a-Palindrome', 5, 'A single integer n.', 'Two lines:
`Steps: <number of additions performed>` / `Palindrome: <the palindrome you reached>`'),
  ('E06-Q1', NULL, 'Find the Maximum Element in an Array', '', 'Read N followed by N integers and print the largest value together with its (1-based) position.

If the maximum appears more than once, report the first position at which it occurs.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '6
12 45 7 45 3 21', 'Maximum: 45
Position: 2', '#include <stdio.h>

int main(void)
{
    int n, i, arr[1000];

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    /* find the maximum and its position */

    return 0;
}', NULL, NULL, NULL, NULL, '45 occurs at positions 2 and 4; the first is reported.', 60, true, 'easy', 10, 5, 64, 'Experiment-06/Find-the-Maximum-Element-in-an-Array', 6, 'Line 1: the number of elements N
Line 2: N integers separated by spaces', '`Maximum: <value>` / `Position: <index>`'),
  ('E06-Q2', NULL, 'Reverse an Array In Place', '', 'Read N followed by N integers and print the array in reverse order on one line.

Reverse the array itself by swapping the ends and walking inwards - do not simply print it backwards.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '5
1 2 3 4 5', '5 4 3 2 1', '#include <stdio.h>

int main(void)
{
    int n, i, temp, arr[1000];

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    /* swap arr[i] with arr[n-1-i] for the first half */

    return 0;
}', NULL, NULL, NULL, NULL, 'Element 1 swaps with 5, and 2 swaps with 4.', 61, true, 'easy', 10, 5, 64, 'Experiment-06/Reverse-an-Array-In-Place', 6, 'Line 1: N
Line 2: N integers separated by spaces', 'One line with the reversed elements separated by single spaces.'),
  ('E06-Q3', NULL, 'Average of Array Elements', '', 'Read N followed by N integers and print their sum and their average to two decimal places.

Watch the integer division trap: sum / n with two ints truncates. Cast one operand to a floating-point type.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '5
10 20 30 40 51', 'Sum: 151
Average: 30.20', '#include <stdio.h>

int main(void)
{
    int n, i, arr[1000];
    long sum = 0;

    scanf("%d", &n);
    /* read, accumulate, then print the average */

    return 0;
}', NULL, NULL, NULL, NULL, '151 / 5 = 30.2, printed as 30.20.', 62, true, 'easy', 15, 5, 64, 'Experiment-06/Average-of-Array-Elements', 6, 'Line 1: N
Line 2: N integers', '`Sum: <total>` / `Average: <value to 2 decimal places>`'),
  ('E07-Q1', NULL, 'Linear Search', '', 'Read N, then N integers, then a key. Print the 1-based position of the first occurrence of the key, or ''Not found''.

Linear search walks the array from the start and stops at the first match. It needs no ordering at all.', '1 <= N <= 1000 · -10^6 <= element, key <= 10^6', '7
34 12 9 45 3 45 8
45', 'Found at position: 4', '#include <stdio.h>

int main(void)
{
    int n, i, key, arr[1000], position = -1;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    scanf("%d", &key);
    /* scan for the key */

    return 0;
}', NULL, NULL, NULL, NULL, '45 first appears as the fourth element, so 4 is reported even though it also occurs later.', 70, true, 'easy', 10, 5, 64, 'Experiment-07/Linear-Search', 7, 'Line 1: N
Line 2: N integers
Line 3: the key', '`Found at position: <index>` or `Not found`'),
  ('E07-Q2', NULL, 'Binary Search', '', 'Read N, then N integers in non-decreasing order, then a key. Use binary search to print the 1-based position of the key, or ''Not found''.

Compare the key with the middle element and discard half the array each time. If duplicates exist, any matching position is accepted by the grader only when the array has distinct values - all test data here uses distinct values.', '1 <= N <= 1000 · The array is sorted in non-decreasing order and contains distinct values.', '8
2 5 8 12 16 23 38 56
23', 'Found at position: 6', '#include <stdio.h>

int main(void)
{
    int n, i, key, arr[1000];
    int low, high, mid, position = -1;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    scanf("%d", &key);
    /* binary search loop */

    return 0;
}', NULL, NULL, NULL, NULL, 'Mid is 12 (too small), then 38 (too large), then 23 - found in three comparisons instead of six.', 71, true, 'medium', 15, 5, 64, 'Experiment-07/Binary-Search', 7, 'Line 1: N
Line 2: N sorted distinct integers
Line 3: the key', '`Found at position: <index>` or `Not found`'),
  ('E07-Q3', NULL, 'Compare Linear and Binary Search', '', 'Read a sorted array and a key. Report how many comparisons each algorithm needs to find the key (or conclude it is absent), and which one was faster.

Count one comparison every time you compare an array element with the key.

For linear search, that is one comparison per element examined.
For binary search, that is one comparison per loop iteration.

Print ''Binary search is faster'', ''Linear search is faster'' or ''Both are equal''.', '1 <= N <= 1000', '8
2 5 8 12 16 23 38 56
56', 'Linear comparisons: 8
Binary comparisons: 4
Binary search is faster', '#include <stdio.h>

int main(void)
{
    int n, i, key, arr[1000];
    int linear_count = 0, binary_count = 0;
    int low, high, mid;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    scanf("%d", &key);
    /* run both searches, counting comparisons */

    return 0;
}', NULL, NULL, NULL, NULL, 'Linear search checks all eight elements. Binary search compares against 12, 38, 56... reaching the answer in four comparisons.', 72, true, 'hard', 20, 5, 64, 'Experiment-07/Compare-Linear-and-Binary-Search', 7, 'Line 1: N
Line 2: N sorted distinct integers
Line 3: the key', '`Linear comparisons: <count>` / `Binary comparisons: <count>` / `<verdict>`'),
  ('E08-Q1', NULL, 'Bubble Sort', '', 'Read N and N integers, sort them in ascending order using bubble sort, and print the sorted array.

Bubble sort repeatedly walks the array swapping adjacent out-of-order pairs, so the largest remaining value ''bubbles'' to the end on every pass.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '6
64 25 12 22 11 90', '11 12 22 25 64 90', '#include <stdio.h>

int main(void)
{
    int n, i, j, temp, arr[1000];

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    /* bubble sort: compare arr[j] with arr[j+1] */

    return 0;
}', NULL, NULL, NULL, NULL, 'The values in non-decreasing order.', 80, true, 'easy', 10, 5, 64, 'Experiment-08/Bubble-Sort', 8, 'Line 1: N
Line 2: N integers', 'One line with the sorted values separated by single spaces.'),
  ('E08-Q2', NULL, 'Selection Sort', '', 'Read N and N integers, sort them in ascending order using selection sort, and print the sorted array.

Selection sort finds the smallest remaining element and swaps it into place - at most one swap per pass, which matters when writing is expensive.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '5
29 10 14 37 13', '10 13 14 29 37', '#include <stdio.h>

int main(void)
{
    int n, i, j, min_index, temp, arr[1000];

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    /* selection sort: find min_index, then swap */

    return 0;
}', NULL, NULL, NULL, NULL, 'Pass 1 selects 10, pass 2 selects 13, and so on.', 81, true, 'easy', 10, 5, 64, 'Experiment-08/Selection-Sort', 8, 'Line 1: N
Line 2: N integers', 'One line with the sorted values.'),
  ('E08-Q3', NULL, 'Sort and Analyse Comparisons', '', 'Sort an array with bubble sort and report the number of comparisons and swaps performed, then print the sorted array.

Use the classic bubble sort with n-1 passes and no early-exit optimisation, so the comparison count is exactly n(n-1)/2 for every input of size n. Count one swap each time two elements actually exchange places.', '1 <= N <= 500', '5
5 1 4 2 8', 'Comparisons: 10
Swaps: 4
Sorted: 1 2 4 5 8', '#include <stdio.h>

int main(void)
{
    int n, i, j, temp, arr[500];
    long comparisons = 0, swaps = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    /* bubble sort, counting comparisons and swaps */

    return 0;
}', NULL, NULL, NULL, NULL, 'With n = 5 the fixed nested loops make 4+3+2+1 = 10 comparisons; four of those pairs were out of order.', 82, true, 'hard', 20, 5, 64, 'Experiment-08/Sort-and-Analyse-Comparisons', 8, 'Line 1: N
Line 2: N integers', '`Comparisons: <count>` / `Swaps: <count>` / `Sorted: <values separated by single spaces>`'),
  ('E09-Q1', NULL, 'Matrix Addition', '', 'Read two matrices of the same order and print their sum.

Two matrices can be added only when they have the same number of rows and columns. Each output element is the sum of the corresponding input elements.', '1 <= R, C <= 20 · -10^4 <= element <= 10^4', '2 3
1 2 3
4 5 6
7 8 9
1 2 3', '8 10 12
5 7 9', '#include <stdio.h>

int main(void)
{
    int r, c, i, j;
    int a[20][20], b[20][20];

    scanf("%d %d", &r, &c);
    /* read both matrices, then print a[i][j]+b[i][j] */

    return 0;
}', NULL, NULL, NULL, NULL, 'Element (1,1) is 1 + 7 = 8.', 90, true, 'easy', 10, 5, 64, 'Experiment-09/Matrix-Addition', 9, 'Line 1: two integers R and C
Next R lines: C integers of the first matrix
Next R lines: C integers of the second matrix', 'R lines, each with C integers separated by single spaces.'),
  ('E09-Q2', NULL, 'Matrix Multiplication', '', 'Read an R1 x C1 matrix and a R2 x C2 matrix and print their product, or an error if the orders are incompatible.

The product is defined only when C1 equals R2, and the result is R1 x C2. Element (i,j) is the dot product of row i of the first matrix and column j of the second.', '1 <= R1, C1, R2, C2 <= 15', '2 3
1 2 3
4 5 6
3 2
7 8
9 10
11 12', '58 64
139 154', '#include <stdio.h>

int main(void)
{
    int r1, c1, r2, c2, i, j, k;
    int a[15][15], b[15][15], product[15][15];

    /* read the first matrix, then the second */
    /* check c1 == r2 before multiplying */

    return 0;
}', NULL, NULL, NULL, NULL, '58 = 1x7 + 2x9 + 3x11. The result has two rows and two columns.', 91, true, 'hard', 20, 5, 64, 'Experiment-09/Matrix-Multiplication', 9, 'Line 1: R1 and C1
Next R1 lines: the first matrix
Next line: R2 and C2
Next R2 lines: the second matrix', 'R1 lines of C2 integers, or `Multiplication not possible`.'),
  ('E09-Q3', NULL, 'Transpose of a Matrix', '', 'Read an R x C matrix and print its transpose, which is C x R.

The transpose swaps rows and columns: element (i,j) of the input becomes element (j,i) of the output.', '1 <= R, C <= 20', '2 3
1 2 3
4 5 6', '1 4
2 5
3 6', '#include <stdio.h>

int main(void)
{
    int r, c, i, j, matrix[20][20];

    scanf("%d %d", &r, &c);
    /* read, then print matrix[j][i] */

    return 0;
}', NULL, NULL, NULL, NULL, 'The first column of the output is the first row of the input.', 92, true, 'medium', 15, 5, 64, 'Experiment-09/Transpose-of-a-Matrix', 9, 'Line 1: R and C
Next R lines: C integers', 'C lines, each with R integers.'),
  ('E10-Q1', NULL, 'String Length Without strlen', '', 'Read a line of text and print its length, counting every character before the terminating null.

Do not call strlen - walk the array until you reach ''\0''. The input may contain spaces, so read the whole line rather than a single word.', 'The line contains at most 200 characters, including spaces.', 'Programming in C', 'Length: 16', '#include <stdio.h>

int main(void)
{
    char text[201];
    int length = 0;

    fgets(text, sizeof(text), stdin);
    /* strip the trailing newline, then count */

    return 0;
}', NULL, NULL, NULL, NULL, 'Fourteen letters plus the two spaces gives 16 characters. The newline is not counted.', 100, true, 'easy', 10, 5, 64, 'Experiment-10/String-Length-Without-strlen', 10, 'A single line of text.', '`Length: <count>`'),
  ('E10-Q2', NULL, 'Palindrome String Check', '', 'Read a word and report whether it is a palindrome, ignoring the difference between upper and lower case.

Compare the first character with the last, the second with the second-last, and so on. Convert both to the same case before comparing.', 'The word contains only letters and is at most 100 characters long.', 'Madam', 'Palindrome', '#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    char word[101];
    int i, j;

    scanf("%100s", word);
    /* compare from both ends using tolower() */

    return 0;
}', NULL, NULL, NULL, NULL, 'Ignoring case, ''Madam'' reads the same in both directions.', 101, true, 'medium', 15, 5, 64, 'Experiment-10/Palindrome-String-Check', 10, 'A single word with no spaces.', '`Palindrome`  or  `Not a palindrome`'),
  ('E10-Q3', NULL, 'Count Vowels, Consonants, Digits and Spaces', '', 'Read a line of text and count how many vowels, consonants, digits and spaces it contains.

Vowels are a, e, i, o and u in either case. A consonant is any other letter. Punctuation is counted in none of the four categories.', 'The line is at most 200 characters long.', 'Hello World 2026', 'Vowels: 3
Consonants: 7
Digits: 4
Spaces: 2', '#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char text[201];
    int i, vowels = 0, consonants = 0;
    int digits = 0, spaces = 0;

    fgets(text, sizeof(text), stdin);
    /* classify each character */

    return 0;
}', NULL, NULL, NULL, NULL, 'The vowels are e, o and o; the consonants are H, l, l, W, r, l and d.', 102, true, 'medium', 15, 5, 64, 'Experiment-10/Count-Vowels-Consonants-Digits-and-Spaces', 10, 'A single line of text.', '`Vowels: <count>` / `Consonants: <count>` / `Digits: <count>` / `Spaces: <count>`'),
  ('E11-Q1', NULL, 'Factorial Using Recursion', '', 'Write a recursive function that computes N! and print the result.

The recursive definition is factorial(n) = n x factorial(n-1), with factorial(0) = 1 as the base case.', '0 <= N <= 20', '7', 'Factorial: 5040', '#include <stdio.h>

unsigned long long factorial(int n)
{
    /* base case, then recursive case */
    return 1ULL;
}

int main(void)
{
    int n;

    scanf("%d", &n);
    printf("Factorial: %llu\n", factorial(n));
    return 0;
}', NULL, NULL, NULL, NULL, '7! = 5040.', 110, true, 'easy', 10, 5, 64, 'Experiment-11/Factorial-Using-Recursion', 11, 'A single integer N.', '`Factorial: <N!>`'),
  ('E11-Q2', NULL, 'Fibonacci Series Using Recursion', '', 'Print the first N terms of the Fibonacci series, computing each term with a recursive function.

The series starts 0, 1, 1, 2, 3, 5 ... Each term is the sum of the two before it. Print the terms on one line separated by single spaces.', '1 <= N <= 30', '8', '0 1 1 2 3 5 8 13', '#include <stdio.h>

long fibonacci(int n)
{
    /* base cases for n == 0 and n == 1 */
    return 0;
}

int main(void)
{
    int n, i;

    scanf("%d", &n);
    /* print the first n terms */
    return 0;
}', NULL, NULL, NULL, NULL, 'The eighth term is 13.', 111, true, 'medium', 15, 5, 64, 'Experiment-11/Fibonacci-Series-Using-Recursion', 11, 'A single integer N.', 'One line with the first N terms.'),
  ('E11-Q3', NULL, 'GCD Using Recursion', '', 'Find the greatest common divisor of two positive integers using the recursive Euclidean algorithm.

gcd(a, b) = gcd(b, a %% b), and gcd(a, 0) = a. This is far faster than testing every possible divisor.', '1 <= a, b <= 10^9', '48 18', 'GCD: 6', '#include <stdio.h>

long gcd(long a, long b)
{
    /* base case: b == 0 */
    return a;
}

int main(void)
{
    long a, b;

    scanf("%ld %ld", &a, &b);
    printf("GCD: %ld\n", gcd(a, b));
    return 0;
}', NULL, NULL, NULL, NULL, 'gcd(48,18) -> gcd(18,12) -> gcd(12,6) -> gcd(6,0) = 6.', 112, true, 'medium', 15, 5, 64, 'Experiment-11/GCD-Using-Recursion', 11, 'A single line with two integers a and b.', '`GCD: <value>`'),
  ('E12-Q1', NULL, 'Sum of an Array Using a Function', '', 'Write a function that takes an array and its length and returns the sum of its elements.

The function must do the work - main should only read the input, call the function and print the result.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '5
4 8 15 16 23', 'Sum: 66', '#include <stdio.h>

long array_sum(int arr[], int n)
{
    /* add up the elements */
    return 0;
}

int main(void)
{
    int n, i, arr[1000];

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    printf("Sum: %ld\n", array_sum(arr, n));
    return 0;
}', NULL, NULL, NULL, NULL, '4 + 8 + 15 + 16 + 23 = 66.', 120, true, 'easy', 10, 5, 64, 'Experiment-12/Sum-of-an-Array-Using-a-Function', 12, 'Line 1: N
Line 2: N integers', '`Sum: <total>`'),
  ('E12-Q2', NULL, 'Reverse a String Using a Function', '', 'Write a function that reverses a string in place, then print the reversed string from main.

The function receives the character array and modifies it directly - main must not do any reversing itself.', 'The word is at most 100 characters long.', 'recursion', 'Reversed: noisrucer', '#include <stdio.h>
#include <string.h>

void reverse_string(char text[])
{
    /* swap characters from both ends */
}

int main(void)
{
    char text[101];

    scanf("%100s", text);
    reverse_string(text);
    printf("Reversed: %s\n", text);
    return 0;
}', NULL, NULL, NULL, NULL, 'The characters are swapped end to end.', 121, true, 'medium', 15, 5, 64, 'Experiment-12/Reverse-a-String-Using-a-Function', 12, 'A single word with no spaces.', '`Reversed: <string>`'),
  ('E12-Q3', NULL, 'Second Largest Element Using a Function', '', 'Write a function that returns the second largest distinct value in an array, or reports that there is none.

Duplicates of the largest value do not count as the second largest. If every element is the same, print ''No second largest''.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '6
12 35 1 10 34 1', 'Second Largest: 34', '#include <stdio.h>

/* return 1 and set *result when a second largest exists, else return 0 */
int second_largest(int arr[], int n, int *result)
{
    return 0;
}

int main(void)
{
    int n, i, arr[1000], answer;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    /* call the function and print the outcome */
    return 0;
}', NULL, NULL, NULL, NULL, '35 is largest, so 34 is the second largest.', 122, true, 'hard', 20, 5, 64, 'Experiment-12/Second-Largest-Element-Using-a-Function', 12, 'Line 1: N
Line 2: N integers', '`Second Largest: <value>` or `No second largest`'),
  ('E13-Q1', NULL, 'Local and Global Variables', '', 'Demonstrate variable shadowing: a global counter and a local variable of the same name.

Declare a global int named value initialised to 100. Read an integer, declare a local variable also named value inside a function, and print both the local and the global value (reach the global one from a separate function).', '-10^6 <= input <= 10^6', '25', 'Local value: 25
Global value: 100
Sum: 125', '#include <stdio.h>

int value = 100;   /* global */

int get_global(void)
{
    return value;
}

int main(void)
{
    int value;     /* shadows the global */

    scanf("%d", &value);
    /* print the three lines */
    return 0;
}', NULL, NULL, NULL, NULL, 'The local declaration hides the global one inside that function only.', 130, true, 'easy', 10, 5, 64, 'Experiment-13/Local-and-Global-Variables', 13, 'A single integer.', '`Local value: <input>` / `Global value: 100` / `Sum: <input + 100>`'),
  ('E13-Q2', NULL, 'Static Variable Counter', '', 'Write a function with a static local counter that remembers how many times it has been called.

Read N, call the function N times, and have it print its call number each time. A static local is initialised once and keeps its value between calls - unlike an ordinary automatic variable.', '1 <= N <= 100', '3', 'Call number: 1
Call number: 2
Call number: 3
Total calls: 3', '#include <stdio.h>

int counter(void)
{
    static int count = 0;
    /* increment, print and return the count */
    return count;
}

int main(void)
{
    int n, i, total = 0;

    scanf("%d", &n);
    /* call counter() n times */
    return 0;
}', NULL, NULL, NULL, NULL, 'The counter survives each return, so it reaches 3.', 131, true, 'medium', 15, 5, 64, 'Experiment-13/Static-Variable-Counter', 13, 'A single integer N.', 'N lines of the form `Call number: <i>`, then `Total calls: <N>`'),
  ('E13-Q3', NULL, 'Block Scope Demonstration', '', 'Show how a variable declared inside a block hides an outer variable of the same name, and how the outer one reappears when the block ends.

Read an integer x. Print it, then open a block where a new x holds double the value and print that, then close the block and print the original x again.', '-10^6 <= x <= 10^6', '9', 'Outer x: 9
Inner x: 18
After block x: 9', '#include <stdio.h>

int main(void)
{
    int x;

    scanf("%d", &x);
    printf("Outer x: %d\n", x);
    {
        /* declare another x here */
    }
    /* print the outer x again */

    return 0;
}', NULL, NULL, NULL, NULL, 'The inner x lives only until the closing brace; the outer x was never modified.', 132, true, 'medium', 15, 5, 64, 'Experiment-13/Block-Scope-Demonstration', 13, 'A single integer x.', '`Outer x: <x>` / `Inner x: <2x>` / `After block x: <x>`'),
  ('E14-Q1', NULL, 'Student Record Using a Structure', '', 'Define a structure holding a student''s name, roll number and marks in three subjects. Read one record and print it with the total and average.

Structures let you carry a whole record around as one value instead of juggling parallel arrays.', '0 <= each mark <= 100', 'Meena
AI23015
78 85 92', 'Name: Meena
Roll: AI23015
Total: 255
Average: 85.00', '#include <stdio.h>

struct Student {
    char name[31];
    char roll[31];
    int marks[3];
};

int main(void)
{
    struct Student s;

    /* read the record and print the summary */
    return 0;
}', NULL, NULL, NULL, NULL, '255 / 3 = 85.00.', 140, true, 'easy', 10, 5, 64, 'Experiment-14/Student-Record-Using-a-Structure', 14, 'Line 1: name (single word)
Line 2: roll number
Line 3: three integer marks', '`Name: <name>` / `Roll: <roll>` / `Total: <sum>` / `Average: <value to 2 decimal places>`'),
  ('E14-Q2', NULL, 'Array of Structures - Highest Marks', '', 'Read N student records and print the name and total of the student with the highest total marks.

If two students tie on total, report the one that appeared first in the input.', '1 <= N <= 100 · 0 <= each mark <= 100', '3
Ravi 70 80 90
Meena 88 91 79
Karthik 60 75 85', 'Topper: Meena
Total: 258', '#include <stdio.h>

struct Student {
    char name[31];
    int marks[3];
    int total;
};

int main(void)
{
    struct Student students[100];
    int n, i;

    /* read all records, track the best total */
    return 0;
}', NULL, NULL, NULL, NULL, 'Meena scores 258 against Ravi''s 240.', 141, true, 'medium', 15, 5, 64, 'Experiment-14/Array-of-Structures---Highest-Marks', 14, 'Line 1: N
Then for each student: a line with the name and three integer marks', '`Topper: <name>` / `Total: <marks>`'),
  ('E14-Q3', NULL, 'Union to Store Different Types', '', 'Use a union to hold an integer, a float and a character, writing and reading one member at a time.

All members of a union share the same memory, so only the most recently assigned member holds a meaningful value. Assign and print each member in turn to see that in action.', '-10^6 <= integer <= 10^6', '42 3.5 K', 'Integer member: 42
Float member: 3.50
Character member: K', '#include <stdio.h>

union Value {
    int i;
    float f;
    char c;
};

int main(void)
{
    union Value v;
    int i;
    float f;
    char c;

    scanf("%d %f %c", &i, &f, &c);
    /* assign and print one member at a time */
    return 0;
}', NULL, NULL, NULL, NULL, 'Each value is printed immediately after being assigned, before the next assignment overwrites the shared bytes.', 142, true, 'medium', 15, 5, 64, 'Experiment-14/Union-to-Store-Different-Types', 14, 'A single line with an integer, a float and a character.', '`Integer member: <value>` / `Float member: <value to 2 decimal places>` / `Character member: <value>`'),
  ('E15-Q1', NULL, 'Pointer Basics', '', 'Read an integer, point at it, and print the value both directly and through the pointer - then change it via the pointer.

Do not print the address itself: addresses differ from run to run, so the grader cannot check them.', '-10^6 <= n <= 10^6', '17', 'Value: 17
Value via pointer: 17
After doubling via pointer: 34', '#include <stdio.h>

int main(void)
{
    int n;
    int *ptr;

    scanf("%d", &n);
    ptr = &n;
    /* print, then double through the pointer */

    return 0;
}', NULL, NULL, NULL, NULL, '`*ptr = *ptr * 2` modifies the original variable, because ptr holds its address.', 150, true, 'easy', 10, 5, 64, 'Experiment-15/Pointer-Basics', 15, 'A single integer.', '`Value: <n>` / `Value via pointer: <n>` / `After doubling via pointer: <2n>`'),
  ('E15-Q2', NULL, 'Swap Two Numbers Using Pointers', '', 'Write a swap function that takes two pointers and exchanges the values they point at.

This is call by reference. A swap function taking plain int parameters would swap only its own copies - the caller would see nothing change.', '-10^6 <= a, b <= 10^6', '3 8', 'Before: a = 3, b = 8
After: a = 8, b = 3', '#include <stdio.h>

void swap(int *x, int *y)
{
    /* exchange the pointed-at values */
}

int main(void)
{
    int a, b;

    scanf("%d %d", &a, &b);
    printf("Before: a = %d, b = %d\n", a, b);
    swap(&a, &b);
    printf("After: a = %d, b = %d\n", a, b);
    return 0;
}', NULL, NULL, NULL, NULL, '`swap(&a, &b)` changes the caller''s variables.', 151, true, 'medium', 15, 5, 64, 'Experiment-15/Swap-Two-Numbers-Using-Pointers', 15, 'A single line with two integers.', '`Before: a = <a>, b = <b>` / `After: a = <b>, b = <a>`'),
  ('E15-Q3', NULL, 'Pointers and Arrays', '', 'Traverse an array using only pointer arithmetic - no square brackets anywhere in your loop - and print the elements, their sum and the largest value.

The name of an array is the address of its first element, so `*(arr + i)` is exactly `arr[i]`. Increment a pointer to step through the array.', '1 <= N <= 1000 · -10^6 <= element <= 10^6', '5
3 17 8 42 11', 'Elements: 3 17 8 42 11
Sum: 81
Maximum: 42', '#include <stdio.h>

int main(void)
{
    int n, i, arr[1000];
    int *ptr;
    long sum = 0;

    scanf("%d", &n);
    for (i = 0; i < n; i++) {
        scanf("%d", arr + i);
    }
    ptr = arr;
    /* walk with *ptr and ptr++ */

    return 0;
}', NULL, NULL, NULL, NULL, 'The pointer walks from arr to arr + n - 1.', 152, true, 'hard', 20, 5, 64, 'Experiment-15/Pointers-and-Arrays', 15, 'Line 1: N
Line 2: N integers', '`Elements: <values separated by single spaces>` / `Sum: <total>` / `Maximum: <value>`'),
  ('E16-Q1', NULL, 'Symbolic Constants and Circle Properties', '', 'Define PI as a symbolic constant with #define and use it to compute the area and circumference of a circle.

Use 3.14159 as the value of PI. Symbolic constants make a program readable and let you change a value in one place.', '0 < radius <= 10^4', '5', 'Area: 78.54
Circumference: 31.42', '#include <stdio.h>

#define PI 3.14159

int main(void)
{
    double radius;

    scanf("%lf", &radius);
    /* compute area and circumference using PI */
    return 0;
}', NULL, NULL, NULL, NULL, '3.14159 x 25 = 78.53975, which rounds to 78.54.', 160, true, 'easy', 10, 5, 64, 'Experiment-16/Symbolic-Constants-and-Circle-Properties', 16, 'A single real number: the radius.', '`Area: <value to 2 decimal places>` / `Circumference: <value to 2 decimal places>`'),
  ('E16-Q2', NULL, 'Function-like Macros', '', 'Define macros SQUARE(x), MAX(a,b) and MIN(a,b), then use them on two integers read from input.

Parenthesise every macro parameter and the whole expansion. Without the brackets `SQUARE(a+b)` expands to `a+b*a+b`, which is not what anyone wanted.', '-1000 <= a, b <= 1000', '6 9', 'Square of a: 36
Square of b: 81
Maximum: 9
Minimum: 6', '#include <stdio.h>

#define SQUARE(x) ((x) * (x))
#define MAX(a, b) (((a) > (b)) ? (a) : (b))
/* define MIN yourself */

int main(void)
{
    int a, b;

    scanf("%d %d", &a, &b);
    /* print the four results */
    return 0;
}', NULL, NULL, NULL, NULL, 'The macros expand inline before compilation.', 161, true, 'medium', 15, 5, 64, 'Experiment-16/Function-like-Macros', 16, 'A single line with two integers a and b.', '`Square of a: <a*a>` / `Square of b: <b*b>` / `Maximum: <max>` / `Minimum: <min>`'),
  ('E16-Q3', NULL, 'Conditional Compilation', '', 'Use #ifdef to include extra diagnostic output only when a DEBUG macro is defined.

Define DEBUG at the top of your file. Read two integers and print their sum. Inside an #ifdef DEBUG block also print the two operands. Because DEBUG is defined, the debug lines appear in the expected output; remove the #define and they would vanish without any other change to the program.', '-10^6 <= a, b <= 10^6', '12 30', '[DEBUG] a = 12
[DEBUG] b = 30
Sum: 42', '#include <stdio.h>

#define DEBUG

int main(void)
{
    int a, b;

    scanf("%d %d", &a, &b);
#ifdef DEBUG
    /* print the two debug lines */
#endif
    /* print the sum */
    return 0;
}', NULL, NULL, NULL, NULL, 'The preprocessor keeps the block because DEBUG is defined; otherwise the compiler would never even see those lines.', 162, true, 'medium', 15, 5, 64, 'Experiment-16/Conditional-Compilation', 16, 'A single line with two integers a and b.', '`[DEBUG] a = <a>` / `[DEBUG] b = <b>` / `Sum: <a+b>`')
on conflict (practice_id) do nothing;

insert into practice_tests (
  test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order"
) values
  ('E00-Q1-PT1', 'E00-Q1', 'Sample case', '5 3', 'Area: 15
Perimeter: 16', false, 5000, true, 0),
  ('E00-Q1-PT2', 'E00-Q1', 'Square', '7 7', 'Area: 49
Perimeter: 28', false, 5000, true, 1),
  ('E00-Q2-PT1', 'E00-Q2', 'Sample case', '430', 'Years: 1
Days: 65', false, 5000, true, 0),
  ('E00-Q2-PT2', 'E00-Q2', 'Less than a year', '200', 'Years: 0
Days: 200', false, 5000, true, 1),
  ('E00-Q3-PT1', 'E00-Q3', 'Sample case', '29', 'Prime', false, 5000, true, 0),
  ('E00-Q3-PT2', 'E00-Q3', 'Composite', '20', 'Not Prime', false, 5000, true, 1),
  ('E00-Q4-PT1', 'E00-Q4', 'Sample case', '12321', 'Palindrome', false, 5000, true, 0),
  ('E00-Q4-PT2', 'E00-Q4', 'Not a palindrome', '12345', 'Not Palindrome', false, 5000, true, 1),
  ('E01-Q1-PT1', 'E01-Q1', 'The only case', '', 'Hello, World!', false, 5000, true, 0),
  ('E01-Q2-PT1', 'E01-Q2', 'Sample case', '10 4
4.0 2.0', '14 6
6.0 2.0', false, 5000, true, 0),
  ('E01-Q2-PT2', 'E01-Q2', 'Equal values', '5 5
2.5 2.5', '10 0
5.0 0.0', false, 5000, true, 1),
  ('E01-Q3-PT1', 'E01-Q3', 'Sample case', 'C
Language
Welcome to C programming', 'C
Language
Welcome to C programming', false, 5000, true, 0),
  ('E01-Q3-PT2', 'E01-Q3', 'Short sentence', 'A
Hello
Good morning', 'A
Hello
Good morning', false, 5000, true, 1),
  ('E01-Q4-PT1', 'E01-Q4', 'Sample case', '85 90 78', 'Total: 253
Average: 84.33', false, 5000, true, 0),
  ('E01-Q4-PT2', 'E01-Q4', 'Exact average', '60 70 80', 'Total: 210
Average: 70.00', false, 5000, true, 1),
  ('E02-Q1-PT1', 'E02-Q1', 'Sample case', '17 5', 'Sum: 22
Difference: 12
Product: 85
Quotient: 3
Remainder: 2', false, 5000, true, 0),
  ('E02-Q1-PT2', 'E02-Q1', 'Divides exactly', '20 4', 'Sum: 24
Difference: 16
Product: 80
Quotient: 5
Remainder: 0', false, 5000, true, 1),
  ('E02-Q2-PT1', 'E02-Q2', 'Sample case', '4
25.00', 'Total: 40.00', false, 5000, true, 0),
  ('E02-Q2-PT2', 'E02-Q2', 'Single loaf', '1
30.00', 'Total: 12.00', false, 5000, true, 1),
  ('E02-Q3-PT1', 'E02-Q3', 'Sample case', '5', 'Handshakes: 10', false, 5000, true, 0),
  ('E02-Q3-PT2', 'E02-Q3', 'Two people', '2', 'Handshakes: 1', false, 5000, true, 1),
  ('E02-Q4-PT1', 'E02-Q4', 'Sample case', '100 30 7', 'Roses: 3
Chocolates: 1
Left: 3', false, 5000, true, 0),
  ('E02-Q4-PT2', 'E02-Q4', 'Spends everything', '50 10 5', 'Roses: 5
Chocolates: 0
Left: 0', false, 5000, true, 1),
  ('E03-Q1-PT1', 'E03-Q1', 'Sample case', '555', 'Yes', false, 5000, true, 0),
  ('E03-Q1-PT2', 'E03-Q1', 'All different', '123', 'No', false, 5000, true, 1),
  ('E03-Q2-PT1', 'E03-Q2', 'Sample case (odd)', '3', 'Weird', false, 5000, true, 0),
  ('E03-Q2-PT2', 'E03-Q2', 'Even, 2 to 5', '4', 'Not Weird', false, 5000, true, 1),
  ('E03-Q3-PT1', 'E03-Q3', 'Sample case (leap year)', '1 3 2020', 'Day: 61', false, 5000, true, 0),
  ('E03-Q3-PT2', 'E03-Q3', 'First day of the year', '1 1 2023', 'Day: 1', false, 5000, true, 1),
  ('E03-Q4-PT1', 'E03-Q4', 'Sample case', '3 4 5', 'Yes', false, 5000, true, 0),
  ('E03-Q4-PT2', 'E03-Q4', 'Not a triple', '2 3 4', 'No', false, 5000, true, 1),
  ('E04-Q1-PT1', 'E04-Q1', 'Sample case', '4567', 'Digits: 4', false, 5000, true, 0),
  ('E04-Q1-PT2', 'E04-Q1', 'Single digit', '7', 'Digits: 1', false, 5000, true, 1),
  ('E04-Q2-PT1', 'E04-Q2', 'Sample case', '5
120 250 90 300 180', 'Total: 940
Highest: 300', false, 5000, true, 0),
  ('E04-Q2-PT2', 'E04-Q2', 'One item', '1
500', 'Total: 500
Highest: 500', false, 5000, true, 1),
  ('E04-Q3-PT1', 'E04-Q3', 'Sample case', '819', 'Holes: 3', false, 5000, true, 0),
  ('E04-Q3-PT2', 'E04-Q3', 'No holes at all', '123', 'Holes: 0', false, 5000, true, 1),
  ('E04-Q4-PT1', 'E04-Q4', 'Sample case', '6', 'Confusing', false, 5000, true, 0),
  ('E04-Q4-PT2', 'E04-Q4', 'Rotates to itself', '11', 'Not Confusing', false, 5000, true, 1),
  ('E05-Q1-PT1', 'E05-Q1', 'Sample case', '4', '#.#.
.#.#
#.#.
.#.#', false, 5000, true, 0),
  ('E05-Q1-PT2', 'E05-Q1', 'Smallest board', '1', '#', false, 5000, true, 1),
  ('E05-Q2-PT1', 'E05-Q2', 'Sample case', '4', '*
**
***
****', false, 5000, true, 0),
  ('E05-Q2-PT2', 'E05-Q2', 'One row', '1', '*', false, 5000, true, 1),
  ('E05-Q3-PT1', 'E05-Q3', 'Sample case', '200', '1
2
3
4
5
6
7
8
9
153', false, 5000, true, 0),
  ('E05-Q3-PT2', 'E05-Q3', 'Single digits only', '9', '1
2
3
4
5
6
7
8
9', false, 5000, true, 1),
  ('E05-Q4-PT1', 'E05-Q4', 'Sample case', '87', 'Steps: 4
Palindrome: 4884', false, 5000, true, 0),
  ('E05-Q4-PT2', 'E05-Q4', 'Already a palindrome', '5', 'Steps: 0
Palindrome: 5', false, 5000, true, 1),
  ('E06-Q1-PT1', 'E06-Q1', 'Sample case', '6
12 45 7 45 3 21', 'Maximum: 45
Position: 2', false, 5000, true, 0),
  ('E06-Q1-PT2', 'E06-Q1', 'Single element', '1
-8', 'Maximum: -8
Position: 1', false, 5000, true, 1),
  ('E06-Q2-PT1', 'E06-Q2', 'Sample case', '5
1 2 3 4 5', '5 4 3 2 1', false, 5000, true, 0),
  ('E06-Q2-PT2', 'E06-Q2', 'Even length', '4
10 20 30 40', '40 30 20 10', false, 5000, true, 1),
  ('E06-Q3-PT1', 'E06-Q3', 'Sample case', '5
10 20 30 40 51', 'Sum: 151
Average: 30.20', false, 5000, true, 0),
  ('E06-Q3-PT2', 'E06-Q3', 'Exact average', '4
2 4 6 8', 'Sum: 20
Average: 5.00', false, 5000, true, 1),
  ('E07-Q1-PT1', 'E07-Q1', 'Sample case', '7
34 12 9 45 3 45 8
45', 'Found at position: 4', false, 5000, true, 0),
  ('E07-Q1-PT2', 'E07-Q1', 'First element', '4
5 6 7 8
5', 'Found at position: 1', false, 5000, true, 1),
  ('E07-Q2-PT1', 'E07-Q2', 'Sample case', '8
2 5 8 12 16 23 38 56
23', 'Found at position: 6', false, 5000, true, 0),
  ('E07-Q2-PT2', 'E07-Q2', 'First element', '5
1 3 5 7 9
1', 'Found at position: 1', false, 5000, true, 1),
  ('E07-Q3-PT1', 'E07-Q3', 'Key at the end', '8
2 5 8 12 16 23 38 56
56', 'Linear comparisons: 8
Binary comparisons: 4
Binary search is faster', false, 5000, true, 0),
  ('E07-Q3-PT2', 'E07-Q3', 'Key at the start', '8
2 5 8 12 16 23 38 56
2', 'Linear comparisons: 1
Binary comparisons: 4
Linear search is faster', false, 5000, true, 1),
  ('E08-Q1-PT1', 'E08-Q1', 'Sample case', '6
64 25 12 22 11 90', '11 12 22 25 64 90', false, 5000, true, 0),
  ('E08-Q1-PT2', 'E08-Q1', 'Already sorted', '4
1 2 3 4', '1 2 3 4', false, 5000, true, 1),
  ('E08-Q2-PT1', 'E08-Q2', 'Sample case', '5
29 10 14 37 13', '10 13 14 29 37', false, 5000, true, 0),
  ('E08-Q2-PT2', 'E08-Q2', 'Reverse sorted', '5
5 4 3 2 1', '1 2 3 4 5', false, 5000, true, 1),
  ('E08-Q3-PT1', 'E08-Q3', 'Sample case', '5
5 1 4 2 8', 'Comparisons: 10
Swaps: 4
Sorted: 1 2 4 5 8', false, 5000, true, 0),
  ('E08-Q3-PT2', 'E08-Q3', 'Already sorted', '4
1 2 3 4', 'Comparisons: 6
Swaps: 0
Sorted: 1 2 3 4', false, 5000, true, 1),
  ('E09-Q1-PT1', 'E09-Q1', 'Sample case', '2 3
1 2 3
4 5 6
7 8 9
1 2 3', '8 10 12
5 7 9', false, 5000, true, 0),
  ('E09-Q1-PT2', 'E09-Q1', '1x1 matrix', '1 1
5
-3', '2', false, 5000, true, 1),
  ('E09-Q2-PT1', 'E09-Q2', 'Sample case', '2 3
1 2 3
4 5 6
3 2
7 8
9 10
11 12', '58 64
139 154', false, 5000, true, 0),
  ('E09-Q2-PT2', 'E09-Q2', 'Incompatible orders', '2 2
1 2
3 4
3 2
1 2
3 4
5 6', 'Multiplication not possible', false, 5000, true, 1),
  ('E09-Q3-PT1', 'E09-Q3', 'Sample case', '2 3
1 2 3
4 5 6', '1 4
2 5
3 6', false, 5000, true, 0),
  ('E09-Q3-PT2', 'E09-Q3', 'Single row', '1 4
7 8 9 10', '7
8
9
10', false, 5000, true, 1),
  ('E10-Q1-PT1', 'E10-Q1', 'Sample case', 'Programming in C', 'Length: 16', false, 5000, true, 0),
  ('E10-Q1-PT2', 'E10-Q1', 'Single word', 'pointer', 'Length: 7', false, 5000, true, 1),
  ('E10-Q2-PT1', 'E10-Q2', 'Mixed case palindrome', 'Madam', 'Palindrome', false, 5000, true, 0),
  ('E10-Q2-PT2', 'E10-Q2', 'Not a palindrome', 'program', 'Not a palindrome', false, 5000, true, 1),
  ('E10-Q3-PT1', 'E10-Q3', 'Sample case', 'Hello World 2026', 'Vowels: 3
Consonants: 7
Digits: 4
Spaces: 2', false, 5000, true, 0),
  ('E10-Q3-PT2', 'E10-Q3', 'Only vowels', 'aeiou', 'Vowels: 5
Consonants: 0
Digits: 0
Spaces: 0', false, 5000, true, 1),
  ('E11-Q1-PT1', 'E11-Q1', 'Sample case', '7', 'Factorial: 5040', false, 5000, true, 0),
  ('E11-Q1-PT2', 'E11-Q1', 'Base case', '0', 'Factorial: 1', false, 5000, true, 1),
  ('E11-Q2-PT1', 'E11-Q2', 'Sample case', '8', '0 1 1 2 3 5 8 13', false, 5000, true, 0),
  ('E11-Q2-PT2', 'E11-Q2', 'First term only', '1', '0', false, 5000, true, 1),
  ('E11-Q3-PT1', 'E11-Q3', 'Sample case', '48 18', 'GCD: 6', false, 5000, true, 0),
  ('E11-Q3-PT2', 'E11-Q3', 'Coprime numbers', '17 5', 'GCD: 1', false, 5000, true, 1),
  ('E12-Q1-PT1', 'E12-Q1', 'Sample case', '5
4 8 15 16 23', 'Sum: 66', false, 5000, true, 0),
  ('E12-Q1-PT2', 'E12-Q1', 'Single element', '1
-12', 'Sum: -12', false, 5000, true, 1),
  ('E12-Q2-PT1', 'E12-Q2', 'Sample case', 'recursion', 'Reversed: noisrucer', false, 5000, true, 0),
  ('E12-Q2-PT2', 'E12-Q2', 'Palindrome', 'level', 'Reversed: level', false, 5000, true, 1),
  ('E12-Q3-PT1', 'E12-Q3', 'Sample case', '6
12 35 1 10 34 1', 'Second Largest: 34', false, 5000, true, 0),
  ('E12-Q3-PT2', 'E12-Q3', 'Duplicated maximum', '5
9 9 9 4 9', 'Second Largest: 4', false, 5000, true, 1),
  ('E13-Q1-PT1', 'E13-Q1', 'Sample case', '25', 'Local value: 25
Global value: 100
Sum: 125', false, 5000, true, 0),
  ('E13-Q1-PT2', 'E13-Q1', 'Zero', '0', 'Local value: 0
Global value: 100
Sum: 100', false, 5000, true, 1),
  ('E13-Q2-PT1', 'E13-Q2', 'Sample case', '3', 'Call number: 1
Call number: 2
Call number: 3
Total calls: 3', false, 5000, true, 0),
  ('E13-Q2-PT2', 'E13-Q2', 'Single call', '1', 'Call number: 1
Total calls: 1', false, 5000, true, 1),
  ('E13-Q3-PT1', 'E13-Q3', 'Sample case', '9', 'Outer x: 9
Inner x: 18
After block x: 9', false, 5000, true, 0),
  ('E13-Q3-PT2', 'E13-Q3', 'Zero', '0', 'Outer x: 0
Inner x: 0
After block x: 0', false, 5000, true, 1),
  ('E14-Q1-PT1', 'E14-Q1', 'Sample case', 'Meena
AI23015
78 85 92', 'Name: Meena
Roll: AI23015
Total: 255
Average: 85.00', false, 5000, true, 0),
  ('E14-Q1-PT2', 'E14-Q1', 'Full marks', 'Ravi
AI23002
100 100 100', 'Name: Ravi
Roll: AI23002
Total: 300
Average: 100.00', false, 5000, true, 1),
  ('E14-Q2-PT1', 'E14-Q2', 'Sample case', '3
Ravi 70 80 90
Meena 88 91 79
Karthik 60 75 85', 'Topper: Meena
Total: 258', false, 5000, true, 0),
  ('E14-Q2-PT2', 'E14-Q2', 'Single student', '1
Arun 55 60 65', 'Topper: Arun
Total: 180', false, 5000, true, 1),
  ('E14-Q3-PT1', 'E14-Q3', 'Sample case', '42 3.5 K', 'Integer member: 42
Float member: 3.50
Character member: K', false, 5000, true, 0),
  ('E14-Q3-PT2', 'E14-Q3', 'Zero and space-free char', '0 0.25 z', 'Integer member: 0
Float member: 0.25
Character member: z', false, 5000, true, 1),
  ('E15-Q1-PT1', 'E15-Q1', 'Sample case', '17', 'Value: 17
Value via pointer: 17
After doubling via pointer: 34', false, 5000, true, 0),
  ('E15-Q1-PT2', 'E15-Q1', 'Zero', '0', 'Value: 0
Value via pointer: 0
After doubling via pointer: 0', false, 5000, true, 1),
  ('E15-Q2-PT1', 'E15-Q2', 'Sample case', '3 8', 'Before: a = 3, b = 8
After: a = 8, b = 3', false, 5000, true, 0),
  ('E15-Q2-PT2', 'E15-Q2', 'Equal values', '4 4', 'Before: a = 4, b = 4
After: a = 4, b = 4', false, 5000, true, 1),
  ('E15-Q3-PT1', 'E15-Q3', 'Sample case', '5
3 17 8 42 11', 'Elements: 3 17 8 42 11
Sum: 81
Maximum: 42', false, 5000, true, 0),
  ('E15-Q3-PT2', 'E15-Q3', 'Single element', '1
-5', 'Elements: -5
Sum: -5
Maximum: -5', false, 5000, true, 1),
  ('E16-Q1-PT1', 'E16-Q1', 'Sample case', '5', 'Area: 78.54
Circumference: 31.42', false, 5000, true, 0),
  ('E16-Q1-PT2', 'E16-Q1', 'Unit radius', '1', 'Area: 3.14
Circumference: 6.28', false, 5000, true, 1),
  ('E16-Q2-PT1', 'E16-Q2', 'Sample case', '6 9', 'Square of a: 36
Square of b: 81
Maximum: 9
Minimum: 6', false, 5000, true, 0),
  ('E16-Q2-PT2', 'E16-Q2', 'Negative values', '-4 -7', 'Square of a: 16
Square of b: 49
Maximum: -4
Minimum: -7', false, 5000, true, 1),
  ('E16-Q3-PT1', 'E16-Q3', 'Sample case', '12 30', '[DEBUG] a = 12
[DEBUG] b = 30
Sum: 42', false, 5000, true, 0),
  ('E16-Q3-PT2', 'E16-Q3', 'Negatives', '-5 -6', '[DEBUG] a = -5
[DEBUG] b = -6
Sum: -11', false, 5000, true, 1)
on conflict (test_id) do nothing;
