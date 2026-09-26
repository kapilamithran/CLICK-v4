-- Learn content corrections: eight content problems found in the Learn Content Interactivity review.
--
-- DATA ONLY. No schema change, no question / option change, no XP / hearts / progress change.
-- Only learn_content.pages_text of seven chapters is edited, with exact-text replace() calls (the same technique as
-- 20260919120100_ge_operator_ascii.sql). Page count and every page HEADING stay unchanged, so the Learn activity
-- layer (assets/learn/) keeps mounting on the same pages.
--
-- What is corrected (every corrected C example was compiled and run with gcc; the displayed output matches):
--
--   CH0037 p3  printf and %lf: the second table and one sentence said printf uses %f for a double, while the first
--              table, p4, p5 and the chapter test (Q000194, Q000195) use printf("%lf", ...). Both are valid C and print
--              the same. The page now says so, and the scanf difference (%f float, %lf double) is kept.
--   CH0037 p4  "float price = 99.99; printf(\"%f\", price);" prints 99.989998, not 99.990000. Output corrected, with a
--              one-sentence explanation that a float stores decimals approximately.
--   CH0061 p2  The nested-loop code printed everything on one line (no newline) but the page showed two rows.
--              printf("\n"); added after the inner loop.
--   CH0059 p4  The story says "3 -> Found!" but the code printed nothing for box 3. The code now prints Not found for
--              boxes 1 and 2 and Found! for box 3, then breaks; output block updated to match.
--   CH0042 p4  The bitwise-assignment comments assumed a = 60 on every line, but run in order the lines gave
--              12, 13, 0, 0, 0 and nothing printed. Each line now sets a = 60 first and prints, so the comments are true.
--   CH0055 p1,p3,p4  Examples used undeclared variables (age, username, password, student, id) and never showed an else.
--              Variables are declared, and the inner and outer else branches are shown.
--   CH0031 p2  The chapter test asks about Editing, Compilation, Linking and Execution (Q000152-Q000155) but the Learn
--              text named none of Edit or Link. A short "hello.c -> Edit -> Compile -> Link -> Run -> Output" block was added.
--   CH0035 p4,p5  The chapter test prints a char with %c and a float with %.1f (Q000175-Q000185) but the Learn text never
--              showed %f or %c. A short "Showing them with printf()" block was added (%d, %f, %c, and %.1f).
--
-- Text of these chapters when this was written (md5 of pages_text), so drift is easy to see:
--   L_CH0031  b9ad70393b9f1667539bca2052f6d33b
--   L_CH0035  0235bffc901f0bc5da574d0685cccd68
--   L_CH0037  32a059db318aeb04ec00f9348fb2e74f
--   L_CH0042  b9c03b2da20025054b9497ddfb0bb5d6
--   L_CH0055  c77249b146e002f54e908fdbde16d791
--   L_CH0059  6f8c748d50f8725d64344ecc9ffbe2c4
--   L_CH0061  5cd148f849e996d155a4b2ecb48179cb
--
-- SAFETY: every replacement must match EXACTLY ONE place in its chapter's text. If the text has changed since it was
-- audited, the whole migration stops with an error and changes nothing (it runs in one transaction).

do $migrate$
declare
  r record;
  old_t text;
  new_t text;
  hits integer;
begin
  for r in
    select * from (values
      ('L_CH0031', 2, $o$**Easy Analogy**
Programmer = Person speaking English.$o$, $n$**From code to output: 4 steps**
hello.c → Edit → Compile → Link → Run → Output
1. **Edit** (editing) — write or change the source code in a file such as `hello.c`.
2. **Compile** (compilation) — the compiler checks the code and translates it into machine-level (object) code. A mistake such as a missing `;` is found here.
3. **Link** (linking) — the linker joins your compiled code with the ready-made library code it uses, such as `printf`, to create the final program.
4. **Run** (execution) — the program is executed and its output appears.
Memory chain: EDIT → COMPILE → LINK → RUN

**Easy Analogy**
Programmer = Person speaking English.$n$),
      ('L_CH0035', 4, $o$**Memory Trick**
int → Whole number$o$, $n$**Showing them with printf()**
Each data type has its own format specifier:
```c
int age = 18;
printf("%d\n", age);

float mark = 95.5;
printf("%f\n", mark);

char grade = 'A';
printf("%c\n", grade);
```
**Output**
```
18
95.500000
A
```
%d → int · %f → float · %c → one character. %f shows 6 digits after the decimal point; to show just one digit, write %.1f: `printf("%.1f", mark);` → `95.5`

**Memory Trick**
int → Whole number$n$),
      ('L_CH0035', 5, $o$- **printf()** — Displays information on the screen. `printf("%d", age);`
$o$, $n$- **printf()** — Displays information on the screen. `printf("%d", age);` (%d int · %f float · %c char)
$n$),
      ('L_CH0037', 3, $o$For printf(), a double is also displayed using %f.$o$, $n$For printf(), a double can be displayed using %lf. In printf(), %f also works for a double and prints exactly the same result.$n$),
      ('L_CH0037', 3, $o$Data type    printf()    scanf()
float        %f          %f
double       %f          %lf$o$, $n$Data type    printf()       scanf()
float        %f             %f
double       %lf (or %f)    %lf$n$),
      ('L_CH0037', 3, $o$The %lf distinction is mainly important when reading input with scanf(), which is taught separately in the input chapter.$o$, $n$In printf(), %f and %lf print a double the same way. The difference matters when reading input with scanf(), which is taught separately in the input chapter.$n$),
      ('L_CH0037', 4, $o$Price: 99.990000
$o$, $n$Price: 99.989998
$n$),
      ('L_CH0037', 4, $o$By default, %f displays several digits after the decimal point. You can control$o$, $n$By default, %f displays several digits after the decimal point. A float stores decimal values only approximately, so 99.99 is shown as 99.989998. You can control$n$),
      ('L_CH0042', 4, $o$**Bitwise Assignment Operators**
```c
int a = 60, b = 13;
a &= b;  // Output: 12
a |= b;  // Output: 61
a ^= b;  // Output: 49
a <<= 2; // (a=60) Output: 240
a >>= 2; // (a=60) Output: 15
```
$o$, $n$**Bitwise Assignment Operators**
Each line below starts again with a = 60 and b = 13.
```c
int a, b = 13;
a = 60; a &= b;  printf("%d\n", a);  // Output: 12
a = 60; a |= b;  printf("%d\n", a);  // Output: 61
a = 60; a ^= b;  printf("%d\n", a);  // Output: 49
a = 60; a <<= 2; printf("%d\n", a);  // Output: 240
a = 60; a >>= 2; printf("%d\n", a);  // Output: 15
```
$n$),
      ('L_CH0055', 1, $o$```c
if (age >= 18) {
        if (age <= 60) {
               printf("Eligible");
        }
}
```$o$, $n$```c
int age = 25;

if (age >= 18) {
        if (age <= 60) {
               printf("Eligible");
        }
        else {
               printf("Not eligible: above 60");
        }
}
else {
        printf("Not eligible: below 18");
}
```
Output for age = 25: `Eligible`. If the outer check fails, the outer else runs; if the inner check fails, the inner else runs.$n$),
      ('L_CH0055', 3, $o$```c
if (username == 1) {
       if (password == 1) {
              printf("Login successful");
       }
}
```$o$, $n$```c
int username = 1;
int password = 1;

if (username == 1) {
       if (password == 1) {
              printf("Login successful");
       }
       else {
              printf("Wrong password");
       }
}
else {
       printf("Wrong username");
}
```
Output: `Login successful`. Change password to 0 and the inner else prints `Wrong password`.$n$),
      ('L_CH0055', 4, $o$```c
if (student == 1) {
        if (id == 1) {
               printf("Entry allowed");
        }
}
```$o$, $n$```c
int student = 1;
int id = 1;

if (student == 1) {
        if (id == 1) {
               printf("Entry allowed");
        }
        else {
               printf("Entry denied");
        }
}
else {
        printf("Entry denied");
}
```
Output: `Entry allowed`. If student or id is not 1, the matching else prints `Entry denied`.$n$),
      ('L_CH0059', 4, $o$   if (i == 3)
   {

      break;
   }

   printf("Checking box %d\n", i);
}
$o$, $n$   if (i == 3)
   {

      printf("Box %d: Found!\n", i);
      break;
   }

   printf("Box %d: Not found\n", i);
}
$n$),
      ('L_CH0059', 4, $o$Checking box 1
Checking box 2
$o$, $n$Box 1: Not found
Box 2: Not found
Box 3: Found!
$n$),
      ('L_CH0059', 4, $o$break stops unnecessary repetition.$o$, $n$break stops unnecessary repetition: boxes 4 and 5 are never checked.$n$),
      ('L_CH0061', 2, $o$      printf("%d%d ", i, j);
   }
}
$o$, $n$      printf("%d%d ", i, j);
   }

   printf("\n");
}
$n$),
      ('L_CH0061', 2, $o$Step 2 → Inner loop runs completely: j = 1 → 2 → 3$o$, $n$Step 2 → Inner loop runs completely: j = 1 → 2 → 3, then printf("\n") ends the row$n$)
    ) as fix(learn_id, page_no, old_text, new_text)
  loop
    -- tolerate Windows line endings in this file: the stored text uses plain \n
    old_t := replace(r.old_text, E'\r', '');
    new_t := replace(r.new_text, E'\r', '');

    select (length(pages_text) - length(replace(pages_text, old_t, ''))) / length(old_t)
      into hits
      from learn_content
     where learn_id = r.learn_id;

    if hits is distinct from 1 then
      raise exception 'Learn content correction stopped: % page % expected exactly 1 match for [%], found %',
        r.learn_id, r.page_no, left(old_t, 60), hits;
    end if;

    update learn_content
       set pages_text = replace(pages_text, old_t, new_t)
     where learn_id = r.learn_id;
  end loop;
end
$migrate$;
