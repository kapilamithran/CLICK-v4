-- Additive fix: populate hint_1 for the 10 Stage 0 coding questions from the PDF
-- (Stage 0 is the only cluster in the PDF with a dedicated Hint: field per question).

update practice_bank set hint_1 = 'Use the function that is used to display output on the screen.' where practice_id = 'S0-Q1';
update practice_bank set hint_1 = 'You can use printf() separately for each line.' where practice_id = 'S0-Q2';
update practice_bank set hint_1 = 'First create the variable, then store 18, and finally use printf() to display it.' where practice_id = 'S0-Q3';
update practice_bank set hint_1 = 'Create an int variable and use printf() with %d.' where practice_id = 'S0-Q4';
update practice_bank set hint_1 = 'Use a different data type for each kind of value.' where practice_id = 'S0-Q5';
update practice_bank set hint_1 = 'Create the variables first, add comments using //, and then display them using printf().' where practice_id = 'S0-Q6';
update practice_bank set hint_1 = 'Look carefully at the variable statements. Also remember how a char value is written.' where practice_id = 'S0-Q7';
update practice_bank set hint_1 = 'Create five variables first. Then use printf() to display each variable.' where practice_id = 'S0-Q8';
update practice_bank set hint_1 = 'Think about the type of each value: one character, whole number, decimal number, and one character.' where practice_id = 'S0-Q9';
update practice_bank set hint_1 = 'Break the problem into small steps: Create variables -> Store values -> Use printf() -> Format the output' where practice_id = 'S0-Q10';
