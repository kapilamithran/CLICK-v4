/*
 * CH0100 - Local and Global Variables (Stage 9, STG010).
 *
 * Source: Functions7.pdf. The PDF defines a local variable (declared inside a function or block) and a global variable
 * (declared outside all functions) with the college analogy (classroom notes vs a notice board), lists when each one is
 * used, defines scope ("where a variable is visible and usable") with void show() { int marks = 90; } and int count = 10,
 * and closes with the flowchart example: int college = 2026 (global), marks inside show() (local), "another function cannot
 * directly use marks".
 *
 * Activities: sort declarations into local or global by where they are written (page 1), open the six "when is it used" cards
 * (page 2), step through show() with the Where column and the calls in progress (page 3), and fix the compile error you get
 * when main() uses a local variable of show() (page 4).
 *
 * Trace note: the interpreter steps the call line and the statements inside show(); the global declaration itself is not a
 * step, so count first appears (as "global") when main() calls show(). The notes therefore sit on the lines that are stepped.
 */
ClickLearn.define([
  {
    id: "CH0100.p1.local-or-global", stage: "STG010", chapter: "CH0100", page: 1, heading: "What Are Local and Global Variables?",
    kind: "assign", title: "Local or global?",
    question: "Where a variable is declared decides whether it is local or global. Read where each declaration is written, then sort it.",
    buckets: [
      { id: "local", label: "Local variable" },
      { id: "global", label: "Global variable" },
    ],
    items: [
      { text: "int college = 2026; // outside all functions", bucket: "global", why: "It is written outside all functions, so it is global: every function can use it, like the college notice board." },
      { text: "int marks = 90; // inside show()", bucket: "local", why: "It is written inside show(), so it is local: it belongs to show(), like your own classroom notes." },
      { text: "int count = 10; // outside all functions", bucket: "global", why: "It is written outside all functions, so it is global and can be shared by many functions." },
      { text: "int total = 100; // inside calculate()", bucket: "local", why: "It is written inside calculate(), so it is local. total is needed only inside calculate()." },
      { text: "int number = 10; // outside all functions", bucket: "global", why: "It is written outside all functions, so it is global. Any function, such as display(), can print it." },
      { text: "int age = 18; // inside main()", bucket: "local", why: "main() is a function too. A variable declared inside it is local to main(), and other functions cannot use it." },
    ],
    explanation: "Look at where the line is written. Inside a function (or block): local, limited to that function. Outside all functions: global, and different functions can access it.",
  },
  {
    id: "CH0100.p2.when-used", stage: "STG010", chapter: "CH0100", page: 2, heading: "Why Are Local and Global Variables Used?",
    kind: "reveal", title: "When do we use each kind?",
    intro: "Three reasons for local variables and three for global variables. Open each card.",
    cards: [
      { label: "Local: data needed only for one function", body: "`void calculate() { int total = 100; }`\ntotal is needed only inside calculate(), so it stays local." },
      { label: "Local: keep data limited to one task", body: "A local variable belongs to one task. Nothing else in the program needs to know it exists." },
      { label: "Local: avoid changing the value elsewhere by accident", body: "Other functions cannot reach a local variable, so they cannot change its value by mistake." },
      { label: "Global: the same data is needed by several functions", body: "`int college = 2026;`\nOne global variable can be read by show() and by any other function that needs it." },
      { label: "Global: a value shared across parts of the program", body: "Every part of the program reads the same variable, like everyone reading the same notice board." },
      { label: "Global: information for the whole program", body: "Some facts belong to the whole program, not to one task. But use globals carefully: too many unnecessary global variables make a program harder to maintain." },
    ],
    explanation: "Use a local variable when the data belongs to one task; use a global variable when the data needs to be shared. Remember: Local = limited use. Global = shared use.",
  },
  {
    id: "CH0100.p3.trace-scope", stage: "STG010", chapter: "CH0100", page: 3, heading: "Scope: Where Can the Variable Be Used?",
    kind: "trace", title: "Watch scope while show() runs",
    scopeColumn: true, callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "int count = 10;",
      "",
      "void show() {",
      "   int marks = 90;",
      "   printf(\"%d \", count);",
      "   printf(\"%d\", marks);",
      "}",
      "",
      "int main() {",
      "   show();",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      6: "marks is declared inside show(), so it is local: it appears in the table only while show() is running.",
      7: "show() can use the global count, even though count is declared outside it.",
      8: "marks is used inside show(), the function where it was declared, so this works.",
      12: "main() calls show(). While show() runs, it can see the global count and its own local marks. When show() returns, marks disappears, but count stays.",
    },
    explanation: "count is declared outside all functions, so it is global and stays available the whole time. marks is declared inside show(), so its scope is show(): the Where column says local in show() only while show() runs, and it is gone when show() returns.",
  },
  {
    id: "CH0100.p4.local-in-main", stage: "STG010", chapter: "CH0100", page: 4, heading: "Flowchart: Local vs Global",
    kind: "error", mode: "toggle", title: "A local variable cannot be used in another function",
    question: "marks is declared inside show(), but main() tries to print it. Compile this program and read the message. Then apply the fix and compile again.",
    broken: [
      "#include <stdio.h>",
      "",
      "void show() {",
      "   int marks = 90;",
      "}",
      "",
      "int main() {",
      "   show();",
      "   printf(\"%d\", marks);",
      "   return 0;",
      "}",
    ].join("\n"),
    fixed: [
      "#include <stdio.h>",
      "",
      "void show() {",
      "   int marks = 90;",
      "   printf(\"%d\", marks);",
      "}",
      "",
      "int main() {",
      "   show();",
      "   return 0;",
      "}",
    ].join("\n"),
    diagnostic: "main.c: In function 'main':\nmain.c:9:17: error: 'marks' undeclared (first use in this function)",
    explanation: "marks is a local variable of show(). main() is a different function, so as far as main() is concerned there is no variable called marks. Another function cannot directly use it.",
    fixNote: "The printf now sits inside show(), the function where marks was declared, so marks is in scope. (If several functions really need the value, the other option is to declare it outside all functions, as a global.)",
    outputAfterFix: "90",
  },
]);
