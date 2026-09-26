/*
 * CH0035 - Recap & Datatypes Intro (Stage 0). PILOT chapter.
 *
 * Why this chapter: its test asks for 10 typing questions (whole programs: skeleton, variables of three
 * types, printing them, comments, fixing errors) that ran at ~30% accuracy, while the Learn pages never
 * let a student type or change any code. These activities give small, safe practice at exactly those
 * skills, with different values from the test items. Nothing here awards XP or costs hearts.
 */
ClickLearn.define([
  {
    id: "CH0035.p1.match-jobs", stage: "STG001", chapter: "CH0035", page: 1, heading: "Let's Recap!",
    kind: "assign", title: "Which job does each line do?",
    implements: ["CH0035.p1.match"],
    question: "Sort these lines of C by the job they do.",
    buckets: [{ id: "explain", label: "Explain" }, { id: "store", label: "Store" }, { id: "display", label: "Display" }],
    items: [
      { text: "// This is a comment", bucket: "explain", why: "A comment is a note for programmers. C does not run it." },
      { text: "// Store my age", bucket: "explain", why: "It starts with //, so it is a note for humans, not an instruction." },
      { text: "int age = 18;", bucket: "store", why: "A variable is a named box that stores a value." },
      { text: "char grade = 'A';", bucket: "store", why: "This creates a variable and stores the letter A in it." },
      { text: 'printf("Hello!");', bucket: "display", why: "printf() shows information on the screen." },
      { text: 'printf("%d", age);', bucket: "display", why: "printf() displays the value stored in age." },
    ],
    explanation: "Comment explains, variable stores, printf() displays. Every program you write mixes these three jobs.",
  },
  {
    id: "CH0035.p2.follow-journey", stage: "STG001", chapter: "CH0035", page: 2, heading: "Put Everything Together!",
    kind: "reveal", title: "Tap each part to see its job",
    implements: ["CH0035.p2.ace"],
    code: '#include <stdio.h>\n\nint main()\n{\n   // Store my age\n   int age = 18;\n   printf("%d", age);\n   return 0;\n}',
    notes: [
      { text: "#include <stdio.h>", note: "Brings in the toolbox that contains `printf()`." },
      { text: "int main()", note: "Where the program starts." },
      { text: "// Store my age", note: "A comment. It is a note for you; C skips it." },
      { text: "int age = 18;", note: "Creates a variable named `age` that holds a whole number, and stores `18` in it." },
      { text: 'printf("%d", age);', note: "Displays the value stored in `age`. The `%d` is the spot where the whole number goes." },
      { text: "return 0;", note: "Tells C the program finished successfully." },
    ],
    explanation: "Write code, add a note, store information, display information, see the output.",
  },
  {
    id: "CH0035.p2.change-age", stage: "STG001", chapter: "CH0035", page: 2, heading: "Put Everything Together!",
    kind: "run", title: "Change it and run it",
    code: '#include <stdio.h>\n\nint main()\n{\n   // Store my age\n   int age = 18;\n   printf("%d", age);\n   return 0;\n}',
    initialOutput: "18",
    tasks: ["Change `18` to your own age and press Run.", "Change the words in the comment. Does the output change?"],
    goal: { changed: true }, goalHint: "Change the number in `int age = 18;` and press Run again.",
    explanation: "The output came from the value in `int age = ...;`. The comment never changes the output, because C skips comments.",
  },
  {
    id: "CH0035.p3.pick-type", stage: "STG001", chapter: "CH0035", page: 3, heading: "What Is a Data Type?",
    kind: "mcq", title: "Which data type fits?",
    question: "A program must store the price of a notebook: 49.75. Which data type should its variable use?",
    choices: [
      { text: "int", why: "int stores whole numbers only. 49.75 has a decimal part." },
      { text: "float", correct: true, why: "float stores decimal numbers such as 25.5, so it can hold 49.75." },
      { text: "char", why: "char stores one character, like 'A'. A price is a number." },
    ],
    explanation: "Ask what kind of value it is: a whole number is int, a decimal number is float, one character is char.",
  },
  {
    id: "CH0035.p4.sort-types", stage: "STG001", chapter: "CH0035", page: 4, heading: "Basic Data Types",
    kind: "assign", title: "Put each value in its type box",
    implements: ["CH0035.p4.mem"],
    question: "Which data type stores each of these values?",
    buckets: [{ id: "int", label: "int (whole number)" }, { id: "float", label: "float (decimal number)" }, { id: "char", label: "char (one character)" }],
    items: [
      { text: "25", bucket: "int", why: "25 is a whole number." },
      { text: "-5", bucket: "int", why: "A negative whole number is still a whole number." },
      { text: "100", bucket: "int", why: "100 has no decimal part." },
      { text: "25.5", bucket: "float", why: "25.5 has a decimal part." },
      { text: "3.14", bucket: "float", why: "3.14 has a decimal part." },
      { text: "10.75", bucket: "float", why: "10.75 has a decimal part." },
      { text: "'A'", bucket: "char", why: "A single letter in single quotes is a char." },
      { text: "'B'", bucket: "char", why: "A single letter in single quotes is a char." },
      { text: "'7'", bucket: "char", why: "It is in single quotes, so it is one character, not the number 7." },
    ],
    explanation: "Whole number: int. Decimal number: float. One character in single quotes: char.",
  },
  {
    id: "CH0035.p4.print-each", stage: "STG001", chapter: "CH0035", page: 4, heading: "Basic Data Types",
    kind: "reveal", title: "Printing each type",
    intro: "The page above shows how printf() displays each data type. Tap a card to see one in action.",
    cards: [
      { label: "int uses %d", body: "`int age = 18;`\n`printf(\"%d\", age);` prints `18`." },
      { label: "float uses %f", body: "`float price = 25.5;`\n`printf(\"%f\", price);` prints `25.500000`. %f shows six digits after the decimal point." },
      { label: "char uses %c", body: "`char grade = 'A';`\n`printf(\"%c\", grade);` prints `A`." },
      { label: "one decimal: %.1f", body: "`float mark = 95.5;`\n`printf(\"%.1f\", mark);` prints `95.5`. The number after the dot says how many digits to show." },
    ],
  },
  {
    id: "CH0035.p5.type-lines", stage: "STG001", chapter: "CH0035", page: 5, heading: "Quick Recap + New Learning!",
    kind: "fill", title: "Type the declarations",
    implements: ["CH0035.p5.fil"],
    question: "Type one line for each variable. Store 42 in an int called `score`, 3.5 in a float called `speed`, and the letter B in a char called `letter`.",
    code: "___\n___\n___",
    blanks: [
      { code: true, answers: ["int score = 42;"], hint: "Start with the data type, then the name, `=`, the value and `;`." },
      { code: true, answers: ["float speed = 3.5;"], hint: "A decimal number needs float. Write it as: float name = value;" },
      { code: true, answers: ["char letter = 'B';"], hint: "One character goes in single quotes: 'B'." },
    ],
    explanation: "Every declaration has the same shape: data type, name, `=`, value, `;`.",
  },
  {
    id: "CH0035.p5.fix-program", stage: "STG001", chapter: "CH0035", page: 5, heading: "Quick Recap + New Learning!",
    kind: "error", mode: "find", title: "Find the mistake",
    question: "This program will not compile. Tap the line with the mistake.",
    lines: ["#include <stdio.h>", "int main()", "{", "   int age = 18", '   printf("%d", age);', "   return 0;", "}"],
    bug: 3, diagnostic: "error: expected ';' before 'printf'", fixed: "   int age = 18;",
    hint: "Look at how each statement ends.",
    explanation: "Every C statement ends with a semicolon so C knows where one instruction stops and the next begins.",
  },
  {
    id: "CH0035.p5.write-program", stage: "STG001", chapter: "CH0035", page: 5, heading: "Quick Recap + New Learning!",
    kind: "challenge", title: "Write a three-line program",
    implements: ["CH0035.p5.run"],
    uses: [{ re: "\\bint\\s+books\\b", ask: "store the number in an `int` variable called `books`" }, { re: "printf\\s*\\([^;]*\\bbooks\\b", ask: "display the value of `books` with `printf`" }],
    prompt: "Store 12 in an int variable called `books`, then display exactly: `I have 12 books`",
    starter: "#include <stdio.h>\n\nint main()\n{\n   // 1. Create the variable\n\n   // 2. Display the message\n\n   return 0;\n}",
    tests: [{ expected: "I have 12 books" }],
    hints: [
      "You need one line that creates an int named books and stores 12 in it.",
      "Use printf() to display the message. Put %d where the value of books should appear.",
      'printf("I have %d books", books);',
    ],
    solution: '#include <stdio.h>\n\nint main()\n{\n   int books = 12;\n   printf("I have %d books", books);\n   return 0;\n}',
    solutionExplain: "`int books = 12;` creates the box and stores 12 in it. Inside `printf`, the `%d` marks the place where the value of `books` is shown.",
    explanation: "Your program stored a value in a variable and displayed it.",
  },
]);
