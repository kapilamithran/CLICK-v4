-- Stage 6 (STG007, ARRAYS) real content, replacing the structural placeholders added by
-- 20260917120000_stage6to10_placeholders.sql. That migration reserved chapter_id's CH0062-CH0072
-- (11 chapters, titles taken straight from the Array1-11 PDF source set under
-- assets/Contents/Array-pdfs/) with zero learn_content/questions/etc, which is what kept the
-- stage out of Practice and out of the unified-chapter Home path. This migration fills in the
-- real learn_content + questions/options/hints/glossary for those 11 chapters (unchanged IDs,
-- titles, stage_id - no renumbering), and adds ONE further chapter, CH0116 (the next free
-- chapter_id after CH0115, following the same precedent that migration used to append a chapter
-- outside the reserved CH0062-114 block), for the 12th PDF (Array12.pdf, "Capstone Project"),
-- which has no corresponding placeholder because the original 11-chapter placeholder plan
-- predates that capstone chapter being added to the source material.
--
-- Stage 6 is intentionally NOT unlocked by this migration: the STG007 self-referencing
-- prerequisite row from the placeholder migration is left in place (still unconditionally
-- locked) until the chapter decks + activities are written and the full test suite (content
-- validation, unit, e2e) passes. A later migration removes exactly that one row.

-- learn_content (one row per chapter; pages_text carries the 5 PDF "SLIDE N" sections, each
-- section's first line is its heading, following the "//.//" page-delimiter convention already
-- used by every other chapter's pages_text)

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0062', 'STG007', 'CH0062', 'Introduction to Array', 'What is an Array?
An array is a collection of multiple values of the same data type stored under one variable name.

int marks[5] = {85, 90, 78, 92, 88};

marks is an integer array that stores 5 marks. Each value has a position called an index: marks[0]->85, marks[1]->90, marks[2]->78, marks[3]->92, marks[4]->88.

Remember: Array = One variable, many values!//.//How Does an Array Work?
Structure: dataType arrayName[size];

int numbers[5]; creates space for 5 integer values. Array indexing starts from 0, not 1.

If int numbers[5] = {10, 20, 30, 40, 50}; then numbers[2] -> 30.

Remember: index 0 is the first element, index 1 the second, and so on. Index starts from 0!//.//What Can We Store in an Array?
Arrays can store multiple values of the same data type: int ages[4] = {18, 20, 19, 21}; (integers), float prices[3] = {10.5, 20.5, 30.5}; (decimals), char vowels[5] = {''a'',''e'',''i'',''o'',''u''}; (characters).

Important: an array holds one data type. int numbers[3] = {10, 20, 30}; is correct; mixing in a character is not recommended for an integer array.

Remember: one array, same type of data.//.//Arrays in Real Programs
Arrays help programs store and manage multiple values easily: student marks (int marks[5] = {80,75,90,85,95};), shopping prices (float prices[4] = {99.5,150.0,75.5,200.0};), temperature (float temperature[7];), game scores (int scores[5] = {100,250,180,320,400};).

A program can calculate the sum, average, maximum, minimum, or search for a value across an array. Basic pattern: create -> store -> access -> process.//.//RECAP
C can store multiple values! Flow: declare -> create array -> store values -> use index -> access element.

5 things to remember: (1) an array stores multiple values, (2) all elements usually share the same data type, (3) array indexing starts from 0, (4) each element is accessed using its index, (5) array size tells how many elements it can hold.

Final example: int numbers[5] = {10,20,30,40,50}; printf("%d", numbers[2]); prints 30.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0063', 'STG007', 'CH0063', 'Array Indexing and Accessing Element', 'What is Array Indexing?
An index is a number used to identify the position of an element in an array.

int marks[5] = {80, 90, 75, 85, 95}; the first element is at index 0.

Remember: Index = Position//.//How Does Indexing Work?
Structure: arrayName[index];

int numbers[5] = {10,20,30,40,50}; printf("%d", numbers[2]); -> numbers[2] is index 2, value 30.

Remember: first element -> 0, second element -> 1, last element -> size - 1.//.//Accessing an Element
An array element is accessed using its index.

int marks[5] = {85, 90, 78, 92, 88}; printf("%d", marks[2]); accesses the third element, output 78.

Remember: array[index] accesses an element.//.//Changing an Element
Array elements can be changed using their index.

int marks[5] = {80, 90, 75, 85, 95}; marks[2] = 100; changes the value at index 2 from 75 to 100.

For int marks[5]; the valid indexes are 0, 1, 2, 3, 4. Basic pattern: index -> find -> read / change.//.//RECAP
Access elements using index! Flow: array -> index -> position -> element.

5 things to remember: (1) index identifies an element, (2) index starts from 0, (3) use array[index] to access, (4) last index = size - 1, (5) elements can be read or changed.

Final example: int numbers[5] = {10,20,30,40,50}; printf("%d", numbers[3]); prints 40.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0064', 'STG007', 'CH0064', 'Initializing Array', 'What is Array Initialization?
Array initialization means giving values to an array when it is created.

int marks[5] = {80, 90, 75, 85, 95}; the values are stored in order at indexes 0-4.

Remember: Initialization = giving initial values.//.//Different Ways to Initialize
Method 1, give size and values: int numbers[5] = {10,20,30,40,50};
Method 2, let C find the size: int numbers[] = {10,20,30,40,50}; (C automatically counts 5 elements).
Method 3, initialize with fewer values: int numbers[5] = {10,20}; the remaining elements become 0.

Remember: values are stored left to right; unassigned elements become 0.//.//Character Array Initialization
Arrays can also store characters: char vowels[5] = {''a'',''e'',''i'',''o'',''u''};

String example: char name[] = "Vicky"; C stores the characters automatically plus a null terminator: V i c k y \0.

Glossary: \0 is the null character marking the end of a C string. Remember: character array = multiple characters.//.//Initializing Arrays in Programs
Student marks: int marks[3] = {85, 90, 95}; stores marks of 3 students.
Temperature: float temp[3] = {30.5, 31.2, 29.8};
Product prices: float price[] = {99.5, 150.0, 75.5};

Basic pattern: declare -> initialize -> store -> use.//.//RECAP
Initialize = give values! Flow: declare array -> give values -> store values -> use array.

5 things to remember: (1) initialization gives initial values to an array, (2) values are stored in order, (3) index starts from 0, (4) size can be specified or automatically determined, (5) unassigned elements are initialized to 0 when applicable.

Final example: int numbers[] = {10,20,30,40}; has 4 elements, output 10 20 30 40.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0065', 'STG007', 'CH0065', 'Combining Loops with Array', 'What is Combining Loops with Arrays?
A loop with an array is used to process multiple array elements automatically.

int numbers[5] = {10,20,30,40,50}; for (int i = 0; i < 5; i++) { printf("%d ", numbers[i]); } visits each index in turn and prints 10 20 30 40 50.

Remember: loop + array = process many elements easily!//.//How Does the Loop Access an Array?
Structure: for (int i = 0; i < size; i++) { array[i]; }

As i changes from 0 to 4, marks[i] moves through marks[0]..marks[4]. The loop stops when i < size becomes FALSE.//.//Taking Array Input Using a Loop
A loop can be used to enter values into an array: int numbers[5]; for (int i = 0; i < 5; i++) { scanf("%d", &numbers[i]); } stores one input per position.

Example input 10 20 30 40 50 is stored as [10][20][30][40][50]. Remember: loop makes entering many values easy!//.//Processing Array Elements
Loops can perform calculations on array elements. Example, find sum: int numbers[5] = {10,20,30,40,50}; int sum = 0; for (int i = 0; i < 5; i++) { sum = sum + numbers[i]; } accumulates 10,30,60,100,150, so Sum = 150.

Basic pattern: start -> loop -> access -> process -> repeat.//.//RECAP
Loop + array = powerful combination! Flow: array -> loop starts -> access array[i] -> process element -> next index -> repeat.

5 things to remember: (1) loops can process array elements, (2) i is commonly used as the index, (3) index starts from 0, (4) loop continues until the condition becomes FALSE, (5) loops can input, display and calculate array values.

Final example: int numbers[3] = {10,20,30}; for (int i=0;i<3;i++) printf("%d ", numbers[i]); prints 10 20 30.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0066', 'STG007', 'CH0066', 'Out-of-Bounds Errors & Safety', 'What is an Out-of-Bounds Error?
An out-of-bounds error occurs when we try to access an array using an invalid index.

int numbers[5] = {10,20,30,40,50}; printf("%d", numbers[5]); is invalid: the valid indexes are 0 to 4, and numbers[5] is outside the array.

Remember: invalid index -> out-of-bounds.//.//Valid vs Invalid Index
For int numbers[5]; the valid indexes are 0,1,2,3,4. Invalid indexes include -1, 5, 6.

Remember: valid is 0 to size-1; invalid is less than 0 or greater than/equal to size.//.//Why is it Dangerous?
C does not automatically check array bounds. An invalid index may access memory that does not belong to the array.

int numbers[3] = {10,20,30}; printf("%d", numbers[5]); may print an unexpected value or behave unpredictably. Analogy: 3 lockers numbered 0,1,2 - opening locker 5 accesses something that does not exist. Always check the index before accessing.//.//How to Stay Safe
Always make sure the index is within the valid range: int numbers[5] = {10,20,30,40,50}; int i = 3; if (i >= 0 && i < 5) { printf("%d", numbers[i]); } is safe because i >= 0 and i < 5 are both TRUE.

A loop such as for (int i = 0; i < 5; i++) automatically stays inside the valid range 0..4. Basic pattern: check index -> then access.//.//RECAP
Stay inside the array! Flow: array size -> check index -> valid? -> yes: access / no: stop.

5 things to remember: (1) array indexes start from 0, (2) last valid index = size - 1, (3) invalid indexes cause out-of-bounds access, (4) always check the index before accessing, (5) use loops carefully with array limits.

Final example: int numbers[5] = {10,20,30,40,50}; printf("%d", numbers[4]); index 4 is valid, output 50.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0067', 'STG007', 'CH0067', 'Basic Array Operations- Math & Metric', 'What are Basic Array Operations?
Array operations are actions performed on array elements, such as sum, average, maximum and minimum.

int numbers[5] = {10,20,30,40,50}; we can calculate the sum (add all values), average (find the mean), maximum (largest value) and minimum (smallest value).

Remember: array + loop -> easy calculations!//.//Finding the Sum
int numbers[5] = {10,20,30,40,50}; int sum = 0; for (int i=0;i<5;i++) { sum = sum + numbers[i]; } adds 10+20+30+40+50 = 150.

Remember: sum = sum + array[i].//.//Finding Average
Average = Sum / Number of Elements.

int sum = 0; for (int i=0;i<5;i++) sum += numbers[i]; float average = (float)sum / 5; with Sum=150 and 5 elements, Average = 150/5 = 30.

Remember: average = total / count.//.//Maximum & Minimum
Maximum: int max = numbers[0]; for (int i=1;i<5;i++) if (numbers[i] > max) max = numbers[i]; finds the largest value.
Minimum: int min = numbers[0]; for (int i=1;i<5;i++) if (numbers[i] < min) min = numbers[i]; finds the smallest value.

Basic pattern: start -> compare -> update -> repeat.//.//RECAP
Basic array math! Flow: array -> loop -> process values -> calculate -> result.

5 things to remember: (1) sum adds all elements, (2) average = sum / number of elements, (3) maximum finds the largest value, (4) minimum finds the smallest value, (5) loops help process every element.

Final example: int numbers[4] = {5,10,15,20}; Sum=50, Average=12.5, Maximum=20, Minimum=5.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0068', 'STG007', 'CH0068', 'Searching in an Array', 'What is Searching in an Array?
Searching means finding whether a particular value exists in an array.

int numbers[5] = {10,20,30,40,50}; searching for 30 checks 10, then 20, then 30 - found!

Remember: searching = find a value.//.//Linear Search
Linear search checks each element from the beginning to the end.

int key = 30; for (int i=0;i<5;i++) { if (numbers[i] == key) { printf("Found"); } } checks numbers[0]=10 (no), numbers[1]=20 (no), numbers[2]=30 (match) -> Found.

Remember: compare each element; match -> found; no match -> not found.//.//Finding the Position
Searching can also tell us the index where the value is found.

int key = 40; for (int i=0;i<5;i++) { if (numbers[i]==key) { printf("Found at index %d", i); break; } } finds 40 at index 3 and stops with break.

Remember: search -> compare -> get index.//.//Found or Not Found
We can use a variable to track whether the value was found: int found = 0; ...; if (numbers[i]==key) { found = 1; break; } ...; if (found==1) printf("Found"); else printf("Not Found");

Searching for 60 in {10,20,30,40,50} compares every element, finds no match, and prints Not Found. Basic pattern: search -> compare -> match? -> result.//.//RECAP
Search and find! Flow: array -> choose value -> compare elements -> match? -> yes: found / no: not found.

5 things to remember: (1) searching finds a value in an array, (2) linear search checks elements one by one, (3) == is used to compare values, (4) the index tells where the value is found, (5) if no match exists, the result is Not Found.

Final example: int numbers[5] = {10,20,30,40,50}; if (numbers[2]==30) printf("Found"); prints Found.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0069', 'STG007', 'CH0069', 'Introduction to Multi-Dimensional Arrays', 'What is a Multi-Dimensional Array?
A multi-dimensional array is an array that stores data in more than one dimension, such as rows and columns.

int matrix[2][3] = { {10,20,30}, {40,50,60} }; contains 2 rows and 3 columns: row0 = 10,20,30; row1 = 40,50,60.

Remember: 2D array = rows + columns.//.//How Does a 2D Array Work?
Structure: dataType arrayName[rows][columns]; int numbers[2][3]; creates 2 rows x 3 columns = 6 elements.

The first index is the row, the second index is the column: numbers[1][2] means row 1, column 2.//.//Accessing Elements
A 2D array uses two indexes to access an element.

int matrix[2][3] = { {10,20,30}, {40,50,60} }; printf("%d", matrix[1][2]); goes to row 1, column 2, output 60.

Remember: [row][column] finds the element.//.//Using Loops with 2D Arrays
Nested loops are commonly used to access all elements: for (int i=0;i<2;i++) { for (int j=0;j<3;j++) { printf("%d ", matrix[i][j]); } } visits matrix[0][0]..matrix[1][2] in order, printing 10 20 30 40 50 60.

Remember: outer loop -> rows, inner loop -> columns.//.//RECAP
2D array = rows + columns! Flow: 2D array -> choose row -> choose column -> access element.

5 things to remember: (1) a 2D array stores data in rows and columns, (2) it uses two indexes, (3) first index represents the row, (4) second index represents the column, (5) nested loops can access all elements.

Final example: int matrix[2][2] = { {10,20}, {30,40} }; printf("%d", matrix[1][0]); row 1, column 0 -> 30.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0070', 'STG007', 'CH0070', 'Working with 2D Array', 'What is Working with a 2D Array?
Working with a 2D array means storing, accessing and processing data using rows and columns: int matrix[2][3] = { {10,20,30}, {40,50,60} };

Remember: 2D array = rows + columns.//.//Taking Input in a 2D Array
Nested loops can fill a 2D array: int matrix[2][3]; for (int i=0;i<2;i++) { for (int j=0;j<3;j++) { scanf("%d", &matrix[i][j]); } } fills matrix[0][0], matrix[0][1], matrix[0][2], matrix[1][0], matrix[1][1], matrix[1][2] in order.

Remember: outer loop -> rows, inner loop -> columns.//.//Displaying a 2D Array
Nested loops can also display all elements: for (int i=0;i<2;i++) { for (int j=0;j<3;j++) { printf("%d ", matrix[i][j]); } printf("\n"); } prints "10 20 30" then "40 50 60" on separate lines.

The outer loop moves row by row, the inner loop moves through the columns. Remember: matrix[i][j] is the current element.//.//Basic Operations on a 2D Array
We can perform calculations on all elements: int sum = 0; for (int i=0;i<2;i++) { for (int j=0;j<3;j++) { sum += matrix[i][j]; } } for {10,20,30,40,50,60} gives Sum = 210.

Basic pattern: row -> column -> access -> process.//.//RECAP
Working with 2D arrays! Flow: create -> input -> access -> process -> output.

5 things to remember: (1) 2D arrays store data in rows and columns, (2) two indexes are used: [row][column], (3) nested loops are commonly used, (4) outer loop handles rows, (5) inner loop handles columns.

Final example: int matrix[2][2] = { {10,20}, {30,40} }; nested loops with printf("\n") after each row print "10 20" then "30 40".', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0071', 'STG007', 'CH0071', 'Character Array (Introduction to Strings)', 'What is a Character Array?
A character array is an array that stores multiple characters, commonly used to store strings in C: char name[6] = {''V'',''i'',''c'',''k'',''y'',''\0''}; \0 marks the end of the string.

Remember: string = characters + \0.//.//What is a String?
A string is a sequence of characters stored in a character array and ended by a null character \0: char name[] = "Vicky"; C automatically stores V i c k y \0 (5 visible characters need 6 array positions, including \0).

Remember: char stores one character; char array stores multiple characters; \0 marks the end of a string.//.//Accessing Characters
Each character can be accessed using its index: char name[] = "Vicky"; printf("%c", name[0]); printf("%c", name[2]); prints V then c (output "Vc").

Remember: name[index] accesses one character.//.//Reading & Displaying Strings
Displaying: char name[] = "Vicky"; printf("%s", name); prints Vicky - %s is used to print a string.
Reading: char name[20]; scanf("%s", name); with input "Vicky" stores V i c k y \0.

Basic pattern: declare -> store -> access -> display.//.//RECAP
Character array = string! Flow: characters -> character array -> add \0 -> string -> access/display.

5 things to remember: (1) character arrays store characters, (2) strings are stored using character arrays, (3) strings end with \0, (4) indexing starts from 0, (5) %s is used to display a string.

Final example: char name[] = "Hello"; printf("%c", name[1]); index 1 -> output e.', true);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0072', 'STG007', 'CH0072', 'Arrays and Functions', 'What are Arrays and Functions?
A function can receive an array as an argument and process its elements: void display(int a[], int n) { for (int i=0;i<n;i++) printf("%d ", a[i]); } int numbers[3] = {10,20,30}; display(numbers, 3); prints 10 20 30.

Remember: array -> pass to function -> process.//.//Passing an Array to a Function
Structure: functionName(arrayName, size); void display(int a[], int n) {...}; int numbers[5] = {10,20,30,40,50}; display(numbers, 5); passes the array name and the number of elements.

Remember: pass the array name, and pass the size separately.//.//Using a Function to Calculate Sum
A function can perform calculations on an array: int sumArray(int a[], int n) { int sum=0; for (int i=0;i<n;i++) sum += a[i]; return sum; } int numbers[4] = {10,20,30,40}; printf("%d", sumArray(numbers,4)); prints 100.

Remember: a function can process the entire array.//.//Why Use Functions with Arrays?
Functions make array programs simple and reusable: the same sumArray function can work with numbers or with marks. Benefits: reusable, organized, easy to understand, easy to modify.

Basic pattern: create array -> pass array -> function processes -> result.//.//RECAP
Array + function = reusable code! Flow: create array -> pass array -> function -> process elements -> result.

5 things to remember: (1) arrays can be passed to functions, (2) pass the array name to the function, (3) pass the array size separately, (4) functions can process array elements, (5) functions make code reusable.

Final example: int findSum(int a[], int n) { int sum=0; for (int i=0;i<n;i++) sum += a[i]; return sum; } int numbers[3] = {5,10,15}; printf("%d", findSum(numbers,3)); prints 30.', true);

-- CH0116: the 12th Array chapter (Array12.pdf, capstone), appended after CH0115 (the last chapter
-- currently in use). "order"/chapter_no = 12 places it after CH0072 (Arrays and Functions) within STG007.
insert into chapters (chapter_id, stage_id, chapter_no, title, "order", active, question_limit) values
  ('CH0116', 'STG007', 12, 'Capstone Project: Using Arrays', 12, true, null);

insert into learn_content (learn_id, stage_id, chapter_id, title, pages_text, active) values ('L_CH0116', 'STG007', 'CH0116', 'Capstone Project: Using Arrays', 'Capstone Project: Using Arrays
A capstone project combines what we learned about arrays to solve a simple real-world problem: int marks[5] = {80,75,90,85,95}; we can use the array to display marks, calculate the total, find the average, and find the highest and lowest mark.

Remember: project = combine array concepts!//.//Mini Capstone Example
Student Marks Analyzer: int marks[5] = {80,75,90,85,95}; int sum=0; for (int i=0;i<5;i++) { sum += marks[i]; } printf("Total = %d", sum); prints Total = 425.

What did we use? array to store marks, loop to visit elements, sum to calculate the total.//.//Array Limitations
Arrays are useful but have limitations: (1) fixed size - int numbers[5]; is fixed once created, (2) same data type - int numbers[5]; stores only integers, (3) out-of-bounds risk - numbers[5]; is invalid for size 5 (valid indexes are 0-4), (4) insertion & deletion can require shifting other elements.

Remember: array = simple but limited.//.//Choosing the Right Array
Before creating an array, think about how many elements (int marks[50];), what type of data (int ages[10]; float prices[10]; char name[20];), and what operations are needed (store -> access -> search -> calculate).

Safety check: always stay within the valid range, e.g. for (int i=0;i<5;i++) printf("%d ", numbers[i]); Basic pattern: plan -> create -> process -> check.//.//RECAP
Arrays: from basics to project! Flow: create array -> store data -> use loops -> process data -> display result.

5 things to remember: (1) arrays store multiple values, (2) loops help process array elements, (3) functions can process arrays, (4) array size is generally fixed, (5) always avoid out-of-bounds access.

Final example: int marks[3] = {80,90,70}; int sum=0; for (int i=0;i<3;i++) sum += marks[i]; printf("Total = %d", sum); prints Total = 240.', true);
-- glossary
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM116', 'array', 'A collection of multiple values stored under one variable name.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM117', 'index', 'The position number used to access an array element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM118', 'element', 'An individual value stored inside an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM119', 'declare', 'To define a variable or array so C knows about it.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM120', 'data type', 'Defines what kind of value a variable can store.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM121', 'index (position)', 'Position used to access an element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM122', 'access', 'Get an element from an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM123', 'position', 'Location of an element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM124', 'element (value)', 'A value stored in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM125', 'size', 'Number of elements an array contains.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM126', 'store', 'Keep a value in memory.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM127', 'index (loop)', 'Position of an element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM128', 'iteration', 'One execution of a loop.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM129', 'index (position used)', 'Position used to access an element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM130', 'valid index', 'An index that refers to an existing element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM131', 'array bounds', 'The valid range of indexes.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM132', 'safe access', 'Accessing only valid array positions.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM133', 'index (element access)', 'Position used to access an array element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM134', 'calculation', 'A mathematical operation performed on values.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM135', 'search', 'Find a particular value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM136', 'equality', 'When two values have the same value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM137', 'match', 'When the searched value equals an array element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM138', 'not found', 'The searched value does not exist in the array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM139', 'result', 'The final outcome of the search.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM140', 'multi-dimensional', 'Having more than one dimension.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM141', 'column', 'A vertical group of elements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM142', 'row', 'A horizontal group of elements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM143', 'index (matrix)', 'Position used to access an element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM144', 'access (element)', 'Retrieve a particular element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM145', 'row (horizontal)', 'Horizontal group of elements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM146', 'access (retrieve)', 'Retrieve a particular element.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM147', 'column (vertical)', 'Vertical group of elements.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM148', 'element (single value)', 'A single value stored in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM149', 'process', 'Perform an operation on data.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM150', 'character', 'A single symbol such as A, b, or 5.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM151', 'null character', '\0, which marks the end of a C string.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM152', 'format specifier', 'A symbol such as %c or %s that tells printf() what type of data to display.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM153', 'access (character)', 'Retrieve a particular value.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM154', 'string', 'A sequence of characters stored in a character array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM155', 'argument', 'A value passed to a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM156', 'size (function)', 'Number of elements in an array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM157', 'return (function)', 'Send a result back from a function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM158', 'array name', 'The identifier used to refer to the array.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM159', 'result (function output)', 'The final output produced by the function.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM160', 'capstone', 'A final project that combines learned concepts.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM161', 'fixed size', 'A size that cannot normally be changed after creation.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM162', 'valid index (capstone)', 'An index within the allowed array range.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM163', 'current element', 'The element at the current index.', '#5867d8', '', true);
insert into glossary (term_id, term, definition, color, aliases, active) values ('TERM164', 'out-of-bounds', 'Accessing an invalid array index.', '#5867d8', '', true);

-- questions
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000333', 'STG007', 'CH0062', 'MCQ', 'What is the main purpose of an array in C?', '', 'To store multiple values of the same data type', '', 'Think about how an array stores many values under one name.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000334', 'STG007', 'CH0062', 'BLANK', 'What is the first index of an array in C?
int numbers[5] = {10, 20, 30, 40, 50};', '', '0', 'The positions are: 0->10, 1->20, 2->30, 3->40, 4->50.', 'C starts counting array positions from zero.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000335', 'STG007', 'CH0062', 'PREDICT_OUTPUT', 'What value is stored at numbers[2]?', 'int numbers[5] = {10, 20, 30, 40, 50};', '30', '', 'Remember that the first element is at index 0.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000336', 'STG007', 'CH0062', 'ORDER', 'Arrange the steps in the correct order:', '', 'Declare an array||Store values||Use the index||Access an element', '', 'First create the array, then put values into it. To access a value, use its index.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000337', 'STG007', 'CH0062', 'BLANK', 'An array stores multiple values of the __________ data type.', '', 'same', '', 'An integer array stores integers, and a float array stores floating-point values.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000338', 'STG007', 'CH0063', 'BLANK', 'What is the first index of an array in C?
int numbers[5] = {10, 20, 30, 40, 50};', '', '0', '', 'C starts counting from zero.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000339', 'STG007', 'CH0063', 'CODE_FILL', 'Access an Element
Complete the code to print the third element of the array.', 'int numbers[5] = {10, 20, 30, 40, 50};

printf("%d", numbers[{{1}}]);', '["2"]', '', 'Array indexing starts from 0.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000340', 'STG007', 'CH0063', 'PREDICT_OUTPUT', 'What is the output?', 'int numbers[5] = {10, 20, 30, 40, 50};

printf("%d", numbers[2]);', '30', '', 'Start counting from index 0.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000341', 'STG007', 'CH0063', 'ORDER', 'Arrange the steps:', '', 'Choose an index||Access using array[index]||C finds the position||Get the element', '', 'Choose → Access → Find → Get.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000342', 'STG007', 'CH0063', 'CODE_FILL', 'Read and Change an Element
Complete the code to change the second element from 90 to 100.', 'int marks[5] = {80, 90, 75, 85, 95};

marks[{{1}}] = 100;

printf("%d", marks[1]);', '["1"]', '', 'The second element has index 1.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000343', 'STG007', 'CH0064', 'BLANK', 'What is the first value of the array?
int numbers[3] = {10, 20, 30};', '', '10', '', 'The first element is at index 0.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000344', 'STG007', 'CH0064', 'CODE_FILL', 'Initialize a String
Complete the code to store the name "Vicky" in a character array.', 'char name{{1}} = "Vicky";

printf("%s", name);', '["[]"]', '', 'Use double quotes for the text, and leave the array''s brackets empty so C counts the size for you.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000345', 'STG007', 'CH0064', 'BLANK', 'What is the size of this array?
int numbers[] = {10, 20, 30, 40};', '', '4', '', 'Count the values.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000346', 'STG007', 'CH0064', 'MCQ', 'int numbers[5] = {10, 20};
What are the remaining (unassigned) values?', '', '0, 0, 0', '', 'The array has 5 positions, but only 2 values are given; the rest default to 0.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000347', 'STG007', 'CH0064', 'ORDER', 'Arrange the steps in the correct order:', '', 'Declare an array||Give initial values||Store values||Use the array', '', 'First create the array, then initialize it.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000348', 'STG007', 'CH0065', 'CODE_FILL', 'Array Input Using a Loop
Complete the code to take input for all 5 array elements.', 'int numbers[5];

for (int i = 0; i < 5; i++) {
   scanf("%d", &numbers[{{1}}]);
}', '["i"]', '', 'Each iteration should store the input at the current index.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000349', 'STG007', 'CH0065', 'BLANK', 'What is the value of numbers[2]?
int numbers[5] = {10, 20, 30, 40, 50};', '', '30', '', 'Index starts from 0.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000350', 'STG007', 'CH0065', 'BLANK', 'How many times does this loop run?
for (int i = 0; i < 5; i++) {
   printf("%d ", numbers[i]);
}', '', '5', '', 'Values of i are 0, 1, 2, 3, and 4.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000351', 'STG007', 'CH0065', 'ORDER', 'Arrange the steps in the correct order:', '', 'Start the loop||Access array[i]||Process the element||Move to the next index', '', 'Start → Access → Process → Next.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000352', 'STG007', 'CH0065', 'CODE_FILL', 'Print the Array in Reverse
Complete the loop condition and update to print the elements from last to first.', 'int numbers[5] = {10, 20, 30, 40, 50};

for (int i = 4; i >= 0; i{{1}}) {
   printf("%d ", numbers[i]);
}', '["--"]', '', 'The index should decrease after every iteration.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000353', 'STG007', 'CH0066', 'CODE_FILL', 'Safe Array Loop
Complete the loop condition so that every element is accessed without going out of bounds.', 'int numbers[5] = {10, 20, 30, 40, 50};

for (int i = 0; i < {{1}}; i++) {
   printf("%d ", numbers[i]);
}', '["5"]', '', 'The loop should access indexes 0 through 4.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000354', 'STG007', 'CH0066', 'MCQ', 'What is the last valid index?
int numbers[5];', '', '4', '', 'Last index = size - 1.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000355', 'STG007', 'CH0066', 'MCQ', 'Which index is invalid?
int numbers[4] = {10, 20, 30, 40};', '', '4', '', 'Valid indexes are 0 to 3.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000356', 'STG007', 'CH0066', 'MCQ', 'How can we safely access an array?', '', 'Check that the index is within the valid range', '', 'Check the index before accessing.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000357', 'STG007', 'CH0066', 'MCQ', 'int numbers[5] = {10, 20, 30, 40, 50};
int i = 4;
Which statement is safest?', '', 'numbers[i]', '', 'Valid indexes are 0 to 4.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000358', 'STG007', 'CH0067', 'CODE_FILL', 'Find the Sum
Complete the code to calculate the sum of all elements.', 'int numbers[5] = {10, 20, 30, 40, 50};
int sum = 0;

for (int i = 0; i < 5; i++) {
   sum = sum + {{1}};
}

printf("%d", sum);', '["numbers[i]"]', '', 'Add the current array element to sum.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000359', 'STG007', 'CH0067', 'CODE_FILL', 'Find the Average
Complete the code to calculate the average of the array elements.', 'int numbers[5] = {10, 20, 30, 40, 50};
int sum = 0;

for (int i = 0; i < 5; i++) {
   sum += numbers[i];
}

float average = (float)sum / {{1}};
printf("%.1f", average);', '["5"]', '', 'Average = Sum ÷ Number of elements.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000360', 'STG007', 'CH0067', 'CODE_FILL', 'Find the Maximum
Complete the code to find the largest value in the array.', 'int numbers[5] = {10, 50, 30, 20, 40};
int max = numbers[0];

for (int i = 1; i < 5; i++) {
   if ({{1}} > max)
      max = numbers[i];
}

printf("%d", max);', '["numbers[i]"]', '', 'When a larger value is found, update max with that value.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000361', 'STG007', 'CH0067', 'CODE_FILL', 'Find the Minimum
Complete the code to find the smallest value in the array.', 'int numbers[5] = {25, 10, 40, 15, 30};
int min = numbers[0];

for (int i = 1; i < 5; i++) {
   if ({{1}})
      min = numbers[i];
}

printf("%d", min);', '["numbers[i] < min"]', '', 'When a smaller value is found, update min.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000362', 'STG007', 'CH0067', 'ORDER', 'Arrange the steps in the correct order:', '', 'Start the loop||Access array element||Perform calculation||Get the result', '', 'Start → Access → Calculate → Result.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000363', 'STG007', 'CH0068', 'MCQ', 'What is the main purpose of searching an array?', '', 'To find a particular value', '', 'Searching means looking for something.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000364', 'STG007', 'CH0068', 'CODE_FILL', 'Fill in the blank
Complete the searching condition:', 'for (int i = 0; i < 5; i++) {
   if (numbers[i] {{1}} key) {
      printf("Found");
   }
}', '["=="]', '', 'Use the operator that checks whether two values are equal.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000365', 'STG007', 'CH0068', 'PREDICT_OUTPUT', 'What is the output?', 'int numbers[5] = {10, 20, 30, 40, 50};

if (numbers[2] == 30)
   printf("Found");', 'Found', '', 'numbers[2] contains 30.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000366', 'STG007', 'CH0068', 'MCQ', 'If a value is not present in the array, what should the program display?', '', 'Not Found', '', 'There is no matching element.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000367', 'STG007', 'CH0068', 'ORDER', 'Arrange the steps in the correct order:', '', 'Choose a search value||Access an array element||Compare the value||Display the result', '', 'Choose → Access → Compare → Result.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000368', 'STG007', 'CH0069', 'MCQ', 'What is a multi-dimensional array?', '', 'An array with multiple dimensions', '', 'Think about rows and columns.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000369', 'STG007', 'CH0069', 'PREDICT_OUTPUT', 'What is the output?', 'int matrix[2][3] = {
   {10, 20, 30},
   {40, 50, 60}
};

printf("%d", matrix[0][2]);', '30', '', 'Go to row 0, then column 2.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000370', 'STG007', 'CH0069', 'CODE_FILL', 'Fill in the blank
Complete the code to access the element at row 1, column 2:', 'int matrix[2][3] = {
   {10, 20, 30},
   {40, 50, 60}
};

printf("%d", matrix[{{1}}][{{2}}]);', '["1","2"]', '', 'First write the row, then the column.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000371', 'STG007', 'CH0069', 'MCQ', 'In matrix[i][j], what does i usually represent?', '', 'Row', '', 'The first index represents the row.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000372', 'STG007', 'CH0069', 'ORDER', 'Arrange the steps in the correct order:', '', 'Choose the row||Choose the column||Use array[row][column]||Access the element', '', 'First select the row, then the column.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000373', 'STG007', 'CH0070', 'MCQ', 'In matrix[i][j], what does i represent?', '', 'Row', '', 'The first index represents the row.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000374', 'STG007', 'CH0070', 'PREDICT_OUTPUT', 'What is the output?', 'int matrix[2][2] = {
   {10, 20},
   {30, 40}
};

printf("%d", matrix[1][0]);', '30', '', 'Go to row 1, column 0.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000375', 'STG007', 'CH0070', 'CODE_FILL', 'Fill in the blanks
Complete the nested loops:', 'for (int i = 0; i < 2; i++) {
   for (int j = 0; j < 3; j++) {
      printf("%d ", matrix[{{1}}][{{2}}]);
   }
}', '["i","j"]', '', 'Use the row variable first and column variable second.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000376', 'STG007', 'CH0070', 'MCQ', 'How many elements are in int matrix[3][4];?', '', '12', '', 'Rows × Columns.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000377', 'STG007', 'CH0070', 'ORDER', 'Arrange the steps in the correct order:', '', 'Create the 2D array||Use nested loops||Access using [i][j]||Process the element', '', 'Create → Loop → Access → Process.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000378', 'STG007', 'CH0071', 'MCQ', 'What is a character array?', '', 'Array of characters', '', 'It stores characters.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000379', 'STG007', 'CH0071', 'MCQ', 'What marks the end of a string in C?', '', '\0', '', 'C uses a special null character to mark the string''s end.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000380', 'STG007', 'CH0071', 'CODE_FILL', 'Fill in the blank
Complete the code to print the entire string:', 'char name[] = "Vicky";

printf("{{1}}", name);', '["%s"]', '', 'Use the format specifier for strings.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000381', 'STG007', 'CH0071', 'MCQ', 'Which is used to access one character from a string?', '', 'name[index]', '', 'Arrays use square brackets.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000382', 'STG007', 'CH0071', 'ORDER', 'Arrange the steps in the correct order:', '', 'Create character array||Store characters||End with \0||Use as a string', '', 'Create → Store → End → Use.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000383', 'STG007', 'CH0072', 'MCQ', 'How can an array be passed to a function?', '', 'Pass the array name', '', 'The array name represents the array when passed to a function.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000384', 'STG007', 'CH0072', 'MCQ', 'Why is the array size usually passed separately?', '', 'To tell the function how many elements to process', '', 'The function needs to know how many elements to loop through.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000385', 'STG007', 'CH0072', 'PREDICT_OUTPUT', 'What is the output?', 'int sumArray(int a[], int n) {
   int sum = 0;
   for (int i = 0; i < n; i++)
      sum += a[i];
   return sum;
}

int numbers[3] = {10, 20, 30};
printf("%d", sumArray(numbers, 3));', '60', '', 'Add all three elements.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000386', 'STG007', 'CH0072', 'CODE_FILL', 'Fill in the blank
Complete the function call:', 'int numbers[4] = {10, 20, 30, 40};

display({{1}}, 4);', '["numbers"]', '', 'Pass the array name.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000387', 'STG007', 'CH0072', 'ORDER', 'Arrange the steps in the correct order:', '', 'Create an array||Pass the array||Function processes elements||Get the result', '', 'Create → Pass → Process → Result.', 1, 5, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000388', 'STG007', 'CH0116', 'MCQ', 'What is the purpose of a capstone project?', '', 'To combine learned concepts to solve a problem', '', 'A project combines multiple concepts.', 1, 1, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000389', 'STG007', 'CH0116', 'MCQ', 'What is a major limitation of a normal array?', '', 'Its size is generally fixed', '', 'Think about what happens after the array is created.', 1, 2, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000390', 'STG007', 'CH0116', 'MCQ', 'What is the last valid index?
int numbers[5];', '', '4', '', 'Last index = size - 1.', 1, 3, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000391', 'STG007', 'CH0116', 'CODE_FILL', 'Fill in the blank
Complete the code to calculate the total:', 'int numbers[3] = {10, 20, 30};
int sum = 0;

for (int i = 0; i < 3; i++) {
   sum += {{1}};
}', '["numbers[i]"]', '', 'Access the current element using the loop index.', 1, 4, true);
insert into questions (question_id, stage_id, chapter_id, type, prompt, code, answer, explanation, hint, xp, "order", active) values ('Q000392', 'STG007', 'CH0116', 'MCQ', 'What should you avoid when working with arrays?', '', 'Out-of-bounds access', '', 'Accessing outside the valid range is unsafe.', 1, 5, true);

-- options
insert into options (option_id, question_id, option_text, "order", active) values ('O0000870', 'Q000333', 'To repeat code', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000871', 'Q000333', 'To store multiple values of the same data type', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000872', 'Q000333', 'To print output', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000873', 'Q000333', 'To create a condition', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000874', 'Q000335', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000875', 'Q000335', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000876', 'Q000335', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000877', 'Q000335', '40', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000878', 'Q000336', 'Declare an array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000879', 'Q000336', 'Store values', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000880', 'Q000336', 'Use the index', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000881', 'Q000336', 'Access an element', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000882', 'Q000340', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000883', 'Q000340', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000884', 'Q000340', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000885', 'Q000340', '40', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000886', 'Q000341', 'Choose an index', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000887', 'Q000341', 'Access using array[index]', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000888', 'Q000341', 'C finds the position', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000889', 'Q000341', 'Get the element', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000890', 'Q000346', '0, 0, 0', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000891', 'Q000346', 'Left empty', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000892', 'Q000346', 'Random leftover values', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000893', 'Q000346', '10, 20, 10', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000894', 'Q000347', 'Declare an array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000895', 'Q000347', 'Give initial values', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000896', 'Q000347', 'Store values', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000897', 'Q000347', 'Use the array', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000898', 'Q000351', 'Start the loop', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000899', 'Q000351', 'Access array[i]', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000900', 'Q000351', 'Process the element', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000901', 'Q000351', 'Move to the next index', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000902', 'Q000354', '3', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000903', 'Q000354', '4', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000904', 'Q000354', '5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000905', 'Q000354', '6', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000906', 'Q000355', '0', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000907', 'Q000355', '1', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000908', 'Q000355', '3', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000909', 'Q000355', '4', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000910', 'Q000356', 'Use any index', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000911', 'Q000356', 'Check that the index is within the valid range', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000912', 'Q000356', 'Always use index 5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000913', 'Q000356', 'Start indexing from 1', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000914', 'Q000357', 'numbers[i]', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000915', 'Q000357', 'numbers[5]', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000916', 'Q000357', 'numbers[10]', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000917', 'Q000357', 'numbers[-1]', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000918', 'Q000362', 'Start the loop', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000919', 'Q000362', 'Access array element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000920', 'Q000362', 'Perform calculation', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000921', 'Q000362', 'Get the result', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000922', 'Q000363', 'To delete elements', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000923', 'Q000363', 'To find a particular value', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000924', 'Q000363', 'To create an array', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000925', 'Q000363', 'To sort the array', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000926', 'Q000365', 'Found', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000927', 'Q000365', 'Not Found', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000928', 'Q000365', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000929', 'Q000365', 'Error', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000930', 'Q000366', 'Found', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000931', 'Q000366', 'Error', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000932', 'Q000366', 'Not Found', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000933', 'Q000366', 'Repeat', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000934', 'Q000367', 'Choose a search value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000935', 'Q000367', 'Access an array element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000936', 'Q000367', 'Compare the value', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000937', 'Q000367', 'Display the result', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000938', 'Q000368', 'An array with only one value', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000939', 'Q000368', 'An array with multiple dimensions', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000940', 'Q000368', 'A single variable', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000941', 'Q000368', 'A loop', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000942', 'Q000369', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000943', 'Q000369', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000944', 'Q000369', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000945', 'Q000369', '40', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000946', 'Q000371', 'Column', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000947', 'Q000371', 'Row', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000948', 'Q000371', 'Value', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000949', 'Q000371', 'Size', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000950', 'Q000372', 'Choose the row', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000951', 'Q000372', 'Choose the column', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000952', 'Q000372', 'Use array[row][column]', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000953', 'Q000372', 'Access the element', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000954', 'Q000373', 'Column', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000955', 'Q000373', 'Row', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000956', 'Q000373', 'Value', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000957', 'Q000373', 'Size', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000958', 'Q000374', '10', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000959', 'Q000374', '20', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000960', 'Q000374', '30', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000961', 'Q000374', '40', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000962', 'Q000376', '7', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000963', 'Q000376', '12', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000964', 'Q000376', '3', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000965', 'Q000376', '4', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000966', 'Q000377', 'Create the 2D array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000967', 'Q000377', 'Use nested loops', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000968', 'Q000377', 'Access using [i][j]', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000969', 'Q000377', 'Process the element', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000970', 'Q000378', 'Array of integers', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000971', 'Q000378', 'Array of characters', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000972', 'Q000378', 'Array of floats', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000973', 'Q000378', 'Array of conditions', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000974', 'Q000379', '\n', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000975', 'Q000379', '\t', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000976', 'Q000379', '\0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000977', 'Q000379', '\b', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000978', 'Q000381', 'name[index]', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000979', 'Q000381', 'name()', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000980', 'Q000381', 'name{index}', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000981', 'Q000381', 'name<index>', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000982', 'Q000382', 'Create character array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000983', 'Q000382', 'Store characters', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000984', 'Q000382', 'End with \0', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000985', 'Q000382', 'Use as a string', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000986', 'Q000383', 'Pass the array name', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000987', 'Q000383', 'Pass only the first element', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000988', 'Q000383', 'Pass the data type', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000989', 'Q000383', 'Pass the loop', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000990', 'Q000384', 'To delete the array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000991', 'Q000384', 'To tell the function how many elements to process', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000992', 'Q000384', 'To change the data type', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000993', 'Q000384', 'To stop the function', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000994', 'Q000385', '60', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000995', 'Q000385', '30', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000996', 'Q000385', '100', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000997', 'Q000385', '0', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000998', 'Q000387', 'Create an array', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0000999', 'Q000387', 'Pass the array', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001000', 'Q000387', 'Function processes elements', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001001', 'Q000387', 'Get the result', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001002', 'Q000388', 'To learn only one concept', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001003', 'Q000388', 'To combine learned concepts to solve a problem', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001004', 'Q000388', 'To delete arrays', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001005', 'Q000388', 'To avoid using loops', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001006', 'Q000389', 'It cannot store values', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001007', 'Q000389', 'Its size is generally fixed', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001008', 'Q000389', 'It cannot be accessed', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001009', 'Q000389', 'It cannot use loops', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001010', 'Q000390', '3', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001011', 'Q000390', '4', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001012', 'Q000390', '5', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001013', 'Q000390', '6', 4, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001014', 'Q000392', 'Using loops', 1, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001015', 'Q000392', 'Using indexes', 2, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001016', 'Q000392', 'Out-of-bounds access', 3, true);
insert into options (option_id, question_id, option_text, "order", active) values ('O0001017', 'Q000392', 'Calculating sums', 4, true);

-- test_hints
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000333', 'Q000333', 'Think about how an array stores many values under one name.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000334', 'Q000334', 'C starts counting array positions from zero.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000335', 'Q000335', 'Remember that the first element is at index 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000336', 'Q000336', 'First create the array, then put values into it. To access a value, use its index.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000337', 'Q000337', 'An integer array stores integers, and a float array stores floating-point values.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000338', 'Q000338', 'C starts counting from zero.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000339', 'Q000339', 'Array indexing starts from 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000340', 'Q000340', 'Start counting from index 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000341', 'Q000341', 'Choose → Access → Find → Get.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000342', 'Q000342', 'The second element has index 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000343', 'Q000343', 'The first element is at index 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000344', 'Q000344', 'Use double quotes for the text, and leave the array''s brackets empty so C counts the size for you.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000345', 'Q000345', 'Count the values.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000346', 'Q000346', 'The array has 5 positions, but only 2 values are given; the rest default to 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000347', 'Q000347', 'First create the array, then initialize it.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000348', 'Q000348', 'Each iteration should store the input at the current index.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000349', 'Q000349', 'Index starts from 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000350', 'Q000350', 'Values of i are 0, 1, 2, 3, and 4.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000351', 'Q000351', 'Start → Access → Process → Next.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000352', 'Q000352', 'The index should decrease after every iteration.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000353', 'Q000353', 'The loop should access indexes 0 through 4.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000354', 'Q000354', 'Last index = size - 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000355', 'Q000355', 'Valid indexes are 0 to 3.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000356', 'Q000356', 'Check the index before accessing.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000357', 'Q000357', 'Valid indexes are 0 to 4.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000358', 'Q000358', 'Add the current array element to sum.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000359', 'Q000359', 'Average = Sum ÷ Number of elements.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000360', 'Q000360', 'When a larger value is found, update max with that value.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000361', 'Q000361', 'When a smaller value is found, update min.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000362', 'Q000362', 'Start → Access → Calculate → Result.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000363', 'Q000363', 'Searching means looking for something.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000364', 'Q000364', 'Use the operator that checks whether two values are equal.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000365', 'Q000365', 'numbers[2] contains 30.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000366', 'Q000366', 'There is no matching element.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000367', 'Q000367', 'Choose → Access → Compare → Result.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000368', 'Q000368', 'Think about rows and columns.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000369', 'Q000369', 'Go to row 0, then column 2.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000370', 'Q000370', 'First write the row, then the column.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000371', 'Q000371', 'The first index represents the row.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000372', 'Q000372', 'First select the row, then the column.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000373', 'Q000373', 'The first index represents the row.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000374', 'Q000374', 'Go to row 1, column 0.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000375', 'Q000375', 'Use the row variable first and column variable second.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000376', 'Q000376', 'Rows × Columns.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000377', 'Q000377', 'Create → Loop → Access → Process.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000378', 'Q000378', 'It stores characters.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000379', 'Q000379', 'C uses a special null character to mark the string''s end.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000380', 'Q000380', 'Use the format specifier for strings.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000381', 'Q000381', 'Arrays use square brackets.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000382', 'Q000382', 'Create → Store → End → Use.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000383', 'Q000383', 'The array name represents the array when passed to a function.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000384', 'Q000384', 'The function needs to know how many elements to loop through.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000385', 'Q000385', 'Add all three elements.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000386', 'Q000386', 'Pass the array name.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000387', 'Q000387', 'Create → Pass → Process → Result.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000388', 'Q000388', 'A project combines multiple concepts.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000389', 'Q000389', 'Think about what happens after the array is created.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000390', 'Q000390', 'Last index = size - 1.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000391', 'Q000391', 'Access the current element using the loop index.', true, 1);
insert into test_hints (hint_id, question_id, hint_text, active, "order") values ('H_Q000392', 'Q000392', 'Accessing outside the valid range is unsafe.', true, 1);

-- question_terms
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000333', 'TERM116', 'array', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000334', 'TERM117', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000335', 'TERM118', 'element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000336', 'TERM119', 'declare', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000337', 'TERM120', 'data type', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000338', 'TERM121', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000340', 'TERM122', 'access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000341', 'TERM123', 'position', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000343', 'TERM124', 'element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000345', 'TERM125', 'size', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000347', 'TERM126', 'store', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000349', 'TERM127', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000350', 'TERM128', 'iteration', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000351', 'TERM129', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000354', 'TERM130', 'valid index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000355', 'TERM131', 'array bounds', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000356', 'TERM132', 'safe access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000357', 'TERM133', 'index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000362', 'TERM134', 'calculation', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000363', 'TERM135', 'search', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000364', 'TERM136', 'equality', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000365', 'TERM137', 'match', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000366', 'TERM138', 'Not Found', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000367', 'TERM139', 'result', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000368', 'TERM140', 'Multi-dimensional', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000369', 'TERM141', 'Column', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000370', 'TERM142', 'Row', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000371', 'TERM143', 'Index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000372', 'TERM144', 'Access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000373', 'TERM145', 'Row', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000374', 'TERM146', 'Access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000375', 'TERM147', 'Column', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000376', 'TERM148', 'Element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000377', 'TERM149', 'Process', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000378', 'TERM150', 'Character', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000379', 'TERM151', 'Null character', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000380', 'TERM152', 'Format specifier', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000381', 'TERM153', 'Access', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000382', 'TERM154', 'String', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000383', 'TERM155', 'Argument', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000384', 'TERM156', 'Size', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000385', 'TERM157', 'Return', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000386', 'TERM158', 'Array name', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000387', 'TERM159', 'Result', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000388', 'TERM160', 'Capstone', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000389', 'TERM161', 'Fixed size', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000390', 'TERM162', 'Valid index', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000391', 'TERM163', 'Current element', 1, true);
insert into question_terms (question_id, term_id, display_text, "order", active) values ('Q000392', 'TERM164', 'Out-of-bounds', 1, true);
