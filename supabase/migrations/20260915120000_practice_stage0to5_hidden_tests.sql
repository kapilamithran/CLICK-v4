-- Hidden test cases for the Stage 0-5 practice_bank coding questions,
-- sourced verbatim from the six supplied authoritative PDFs (hiddencase0-5.pdf).
-- Every hidden test's expected_output was cross-checked against that
-- question's own answer code in the PDF (not merely copied from the PDF's
-- rendered text) and, where the hidden case reduces to the question's own
-- "no input" scenario, against the exact expected_output already stored in
-- the existing public test row for byte-for-byte whitespace fidelity.
--
-- S0-Q5 ("Student Information"): the source PDF's two hidden test cases
-- for it both literally show expected_output "My marks are 85", which is
-- S0-Q4's output, not S0-Q5's own -- a genuine PDF error. That text is
-- NOT used here. Instead, both of S0-Q5's hidden tests below reuse
-- "Initial: S / Age: 18 / Percentage: 85.5", copied byte-for-byte from the
-- existing, already-live practice_tests row S0-Q5-T1. This is not a guess:
-- S0-Q5's reference solution hardcodes every value it prints and never
-- calls scanf() at all, so a correct program for this question is
-- architecturally incapable of producing any other output -- the same
-- deterministic, input-independent pattern every other Stage 0 question's
-- hidden tests below already rely on.
--
-- test_id numbering: 25 of these 70 questions (every Stage 3 and Stage 4
-- question) already carry TWO existing public test rows (T1 and T2, not
-- just T1) -- discovered only after a first apply attempt failed on a real
-- primary-key collision. Every hidden test_id below is generated from each
-- question's actual live existing max test suffix + 1, not assumed.

insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q1-T2', 'S0-Q1', 'Hidden test 1', '', 'Welcome to C Programming!', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q2-T2', 'S0-Q2', 'Hidden test 1', '', 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q2-T3', 'S0-Q2', 'Hidden test 2', '', 'Name: xyz
Age: 18
College: Rajalakshmi Engineering College', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q3-T2', 'S0-Q3', 'Hidden test 1', '', 'My age is 18', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q3-T3', 'S0-Q3', 'Hidden test 2', '', 'My age is 18', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q4-T2', 'S0-Q4', 'Hidden test 1', '', 'My marks are 85', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q4-T3', 'S0-Q4', 'Hidden test 2', '', 'My marks are 85', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q5-T2', 'S0-Q5', 'Hidden test 1', '', 'Initial: S
Age: 18
Percentage: 85.5', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q5-T3', 'S0-Q5', 'Hidden test 2', '', 'Initial: S
Age: 18
Percentage: 85.5', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q6-T2', 'S0-Q6', 'Hidden test 1', '', '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q6-T3', 'S0-Q6', 'Hidden test 2', '', '----- STUDENT DETAILS -----
Name: xyz
Age: 18
Marks: 90
---------------------------', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q7-T2', 'S0-Q7', 'Hidden test 1', '', 'My age is 18
My grade is A', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q7-T3', 'S0-Q7', 'Hidden test 2', '', 'My age is 18
My grade is A', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q8-T2', 'S0-Q8', 'Hidden test 1', '', '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q8-T3', 'S0-Q8', 'Hidden test 2', '', '===== STUDENT REPORT =====
Initial: S
Age: 18
Maths: 85
Science: 90
English: 88
==========================', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q9-T2', 'S0-Q9', 'Hidden test 1', '', 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q9-T3', 'S0-Q9', 'Hidden test 2', '', 'Name Initial: S
Age: 18
Height: 5.5
Grade: A', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q10-T2', 'S0-Q10', 'Hidden test 1', '', '************************
    STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S0-Q10-T3', 'S0-Q10', 'Hidden test 2', '', '************************
    STUDENT PROFILE
************************
Initial: S
Age: 18
Marks: 92
Percentage: 92.5
Grade: A
************************', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q1-T2', 'S1-Q1', 'Hidden test 1', '', '30', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q1-T3', 'S1-Q1', 'Hidden test 2', '', '30', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q2-T2', 'S1-Q2', 'Hidden test 1', '', '40', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q2-T3', 'S1-Q2', 'Hidden test 2', '', '40', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q3-T2', 'S1-Q3', 'Hidden test 1', '', 'A', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q3-T3', 'S1-Q3', 'Hidden test 2', '', 'A', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q4-T2', 'S1-Q4', 'Hidden test 1', '', '20.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q4-T3', 'S1-Q4', 'Hidden test 2', '', '20.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q5-T2', 'S1-Q5', 'Hidden test 1', '', '3.50', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q5-T3', 'S1-Q5', 'Hidden test 2', '', '3.50', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q6-T2', 'S1-Q6', 'Hidden test 1', '', '123456.789123', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q6-T3', 'S1-Q6', 'Hidden test 2', '', '123456.789123', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q7-T2', 'S1-Q7', 'Hidden test 1', '', 'Character: A
Value: 65', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q7-T3', 'S1-Q7', 'Hidden test 2', '', 'Character: A
Value: 65', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q8-T2', 'S1-Q8', 'Hidden test 1', '', 'Total: 255
Average: 85.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q8-T3', 'S1-Q8', 'Hidden test 2', '', 'Total: 255
Average: 85.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q9-T2', 'S1-Q9', 'Hidden test 1', '', 'Code: 101
Product: L
Available: 1
Total: 1501.50', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q9-T3', 'S1-Q9', 'Hidden test 2', '', 'Code: 101
Product: L
Available: 1
Total: 1501.50', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q10-T2', 'S1-Q10', 'Hidden test 1', '', 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S1-Q10-T3', 'S1-Q10', 'Hidden test 2', '', 'Roll: 25
Grade: A
Marks: 85
Percentage: 85.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q1-T2', 'S2-Q1', 'Hidden test 1', '', '2', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q1-T3', 'S2-Q1', 'Hidden test 2', '', '2', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q2-T2', 'S2-Q2', 'Hidden test 1', '', 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q2-T3', 'S2-Q2', 'Hidden test 2', '', 'Sum: 26
Difference: 14
Product: 120
Quotient: 3
Remainder: 2', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q3-T2', 'S2-Q3', 'Hidden test 1', '', 'After increment: 11
After decrement: 10', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q3-T3', 'S2-Q3', 'Hidden test 2', '', 'After increment: 11
After decrement: 10', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q4-T2', 'S2-Q4', 'Hidden test 1', '', '60', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q4-T3', 'S2-Q4', 'Hidden test 2', '', '60', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q5-T2', 'S2-Q5', 'Hidden test 1', '', '40', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q5-T3', 'S2-Q5', 'Hidden test 2', '', '40', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q6-T2', 'S2-Q6', 'Hidden test 1', '', 'a: 25
b: 25', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q6-T3', 'S2-Q6', 'Hidden test 2', '', 'a: 25
b: 25', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q7-T2', 'S2-Q7', 'Hidden test 1', '', '1', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q7-T3', 'S2-Q7', 'Hidden test 2', '', '1', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q8-T2', 'S2-Q8', 'Hidden test 1', '', '1', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q8-T3', 'S2-Q8', 'Hidden test 2', '', '1', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q9-T2', 'S2-Q9', 'Hidden test 1', '', '1', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q9-T3', 'S2-Q9', 'Hidden test 2', '', '1', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q10-T2', 'S2-Q10', 'Hidden test 1', '', '1', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q10-T3', 'S2-Q10', 'Hidden test 2', '', '1', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q11-T2', 'S2-Q11', 'Hidden test 1', '', 'OR: 7
XOR: 6', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q11-T3', 'S2-Q11', 'Hidden test 2', '', 'OR: 7
XOR: 6', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q12-T2', 'S2-Q12', 'Hidden test 1', '', 'Left shift: 10
Right shift: 2', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q12-T3', 'S2-Q12', 'Hidden test 2', '', 'Left shift: 10
Right shift: 2', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q13-T2', 'S2-Q13', 'Hidden test 1', '', '14', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q13-T3', 'S2-Q13', 'Hidden test 2', '', '14', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q14-T2', 'S2-Q14', 'Hidden test 1', '', '20', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q14-T3', 'S2-Q14', 'Hidden test 2', '', '20', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q15-T2', 'S2-Q15', 'Hidden test 1', '', '7', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S2-Q15-T3', 'S2-Q15', 'Hidden test 2', '', '7', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q1-T3', 'S3-Q1', 'Hidden test 1', '100.25
5', 'Total Bill: 501.25', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q1-T4', 'S3-Q1', 'Hidden test 2', '75.50
8', 'Total Bill: 604.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q2-T3', 'S3-Q2', 'Hidden test 1', '3.2', 'Meters: 3200.00
Centimeters: 320000.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q2-T4', 'S3-Q2', 'Hidden test 2', '1.75', 'Meters: 1750.00
Centimeters: 175000.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q3-T3', 'S3-Q3', 'Hidden test 1', '90 80 70', 'Total: 240
Average: 80.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q3-T4', 'S3-Q3', 'Hidden test 2', '65 72 88', 'Total: 225
Average: 75.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q4-T3', 'S3-Q4', 'Hidden test 1', '0', 'Fahrenheit: 32.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q4-T4', 'S3-Q4', 'Hidden test 2', '100', 'Fahrenheit: 212.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q5-T3', 'S3-Q5', 'Hidden test 1', '600', 'Minutes: 10
Seconds: 0', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q5-T4', 'S3-Q5', 'Hidden test 2', '125', 'Minutes: 2
Seconds: 5', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q6-T3', 'S3-Q6', 'Hidden test 1', 'B', 'Character: B
ASCII: 66', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q6-T4', 'S3-Q6', 'Hidden test 2', 'z', 'Character: z
ASCII: 122', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q7-T3', 'S3-Q7', 'Hidden test 1', '50 12.25 Z', 'Integer: 50
Decimal: 12.25
Character: Z', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q7-T4', 'S3-Q7', 'Hidden test 2', '100 99.50 M', 'Integer: 100
Decimal: 99.50
Character: M', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q8-T3', 'S3-Q8', 'Hidden test 1', '25000 10 5', 'Allowance: 2500.00
Gross: 27500.00
Deduction: 1375.00
Net Salary: 26125.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q8-T4', 'S3-Q8', 'Hidden test 2', '40000 15 8', 'Allowance: 6000.00
Gross: 46000.00
Deduction: 3680.00
Net Salary: 42320.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q9-T3', 'S3-Q9', 'Hidden test 1', '0', 'Valid: 1', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q9-T4', 'S3-Q9', 'Hidden test 2', '121', 'Valid: 0', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q10-T3', 'S3-Q10', 'Hidden test 1', '1000 10', 'Discount: 100.00
Final Price: 900.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q10-T4', 'S3-Q10', 'Hidden test 2', '7500 25', 'Discount: 1875.00
Final Price: 5625.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q11-T3', 'S3-Q11', 'Hidden test 1', 'B B', 'Same: 1', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q11-T4', 'S3-Q11', 'Hidden test 2', 'A C', 'Same: 0', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q12-T3', 'S3-Q12', 'Hidden test 1', '3', 'Read: 1
Write: 1
Execute: 0', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q12-T4', 'S3-Q12', 'Hidden test 2', '6', 'Read: 0
Write: 1
Execute: 1', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q13-T3', 'S3-Q13', 'Hidden test 1', '90 80 70 60 50', 'Total: 350
Percentage: 70.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q13-T4', 'S3-Q13', 'Hidden test 2', '95 85 75 65 55', 'Total: 375
Percentage: 75.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q14-T3', 'S3-Q14', 'Hidden test 1', 'Kiran
20
B', 'Name: Kiran
Age: 20
Grade: B', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q14-T4', 'S3-Q14', 'Hidden test 2', 'Meena
22
A', 'Name: Meena
Age: 22
Grade: A', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q15-T3', 'S3-Q15', 'Hidden test 1', 'Kiran
210
40000
10
B', 'Name: Kiran
ID: 210
Grade: B
Bonus: 4000.00
Final Salary: 44000.00', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S3-Q15-T4', 'S3-Q15', 'Hidden test 2', 'Meena
315
50000
15
A', 'Name: Meena
ID: 315
Grade: A
Bonus: 7500.00
Final Salary: 57500.00', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q1-T3', 'S4-Q1', 'Hidden test 1', '25', 'Positive', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q1-T4', 'S4-Q1', 'Hidden test 2', '-10', '', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q2-T3', 'S4-Q2', 'Hidden test 1', '18', 'Eligible', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q2-T4', 'S4-Q2', 'Hidden test 2', '12', 'Not Eligible', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q3-T3', 'S4-Q3', 'Hidden test 1', '1', 'Monday', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q3-T4', 'S4-Q3', 'Hidden test 2', '3', 'Wednesday', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q4-T3', 'S4-Q4', 'Hidden test 1', '50', 'Pass', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q4-T4', 'S4-Q4', 'Hidden test 2', '49', 'Fail', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q5-T3', 'S4-Q5', 'Hidden test 1', '12', 'Even', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q5-T4', 'S4-Q5', 'Hidden test 2', '15', 'Odd', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q6-T3', 'S4-Q6', 'Hidden test 1', '25 10
2', '15', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q6-T4', 'S4-Q6', 'Hidden test 2', '7 6
3', '42', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q7-T3', 'S4-Q7', 'Hidden test 1', '25', 'Cool', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q7-T4', 'S4-Q7', 'Hidden test 2', '40', 'Hot', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q8-T3', 'S4-Q8', 'Hidden test 1', '75', 'Distinction', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q8-T4', 'S4-Q8', 'Hidden test 2', '49', 'Fail', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q9-T3', 'S4-Q9', 'Hidden test 1', '1
17', 'Minor', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q9-T4', 'S4-Q9', 'Hidden test 2', '2
25', 'Exit', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q10-T3', 'S4-Q10', 'Hidden test 1', '7', 'Odd', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S4-Q10-T4', 'S4-Q10', 'Hidden test 2', '0', 'Not Positive', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q1-T2', 'S5-Q1', 'Hidden test 1', '3', '1
2
3', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q1-T3', 'S5-Q1', 'Hidden test 2', '1', '1', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q2-T2', 'S5-Q2', 'Hidden test 1', '2', '*
**', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q2-T3', 'S5-Q2', 'Hidden test 2', '5', '*
**
***
****
*****', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q3-T2', 'S5-Q3', 'Hidden test 1', '1234
5678
1111', 'Access Granted', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q3-T3', 'S5-Q3', 'Hidden test 2', '1111
2222
3333', 'Access Denied', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q4-T2', 'S5-Q4', 'Hidden test 1', '1', '1/1
Sum of Series upto 1 terms : 1.000000', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q4-T3', 'S5-Q4', 'Hidden test 2', '3', '1/1 + 1/2 + 1/3
Sum of Series upto 3 terms : 1.833333', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q5-T2', 'S5-Q5', 'Hidden test 1', '5
0 1 1 1 1', 'Sensor 1 Failed', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q5-T3', 'S5-Q5', 'Hidden test 2', '4
1 1 1 1', 'All Sensors Working', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q6-T2', 'S5-Q6', 'Hidden test 1', '28', '28 is a Perfect Number.', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q6-T3', 'S5-Q6', 'Hidden test 2', '10', '10 is not a Perfect Number.', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q7-T2', 'S5-Q7', 'Hidden test 1', '2 3
1 0 1
1 1 1', 'Student 1: 2
Student 2: 3', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q7-T3', 'S5-Q7', 'Hidden test 2', '3 2
0 0
1 0
1 1', 'Student 1: 0
Student 2: 1
Student 3: 2', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q8-T2', 'S5-Q8', 'Hidden test 1', '2 3
0 0 1
1 0 1', '3', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q8-T3', 'S5-Q8', 'Hidden test 2', '3 2
1 1
1 1
1 1', '0', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q9-T2', 'S5-Q9', 'Hidden test 1', '2', '1
1 2', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q9-T3', 'S5-Q9', 'Hidden test 2', '4', '1
1 2
1 2 3
1 2 3 4', true, 5000, true, 2);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q10-T2', 'S5-Q10', 'Hidden test 1', '10', '1 2 3 4 6 7 8 9 ', true, 5000, true, 1);
insert into practice_tests (test_id, practice_id, name, input, expected_output, hidden, timeout_ms, active, "order") values ('S5-Q10-T3', 'S5-Q10', 'Hidden test 2', '20', '1 2 3 4 6 7 8 9 11 12 13 14 16 ', true, 5000, true, 2);

-- Total hidden test rows inserted by this migration: 139
