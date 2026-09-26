/*
 * CH0039 - constants, void (Stage 2, STG002).
 *
 * Why these activities: the pages only show that `PRICE = 100;` is "not allowed" and that a void function
 * "returns nothing". Here the student sees the compiler refuse the change, follows a call into a function
 * and back, and sorts function headers by whether a value comes back.
 */
ClickLearn.define([
  {
    id: "CH0039.p2.change-const", stage: "STG002", chapter: "CH0039", page: 2, heading: "The Locked Price Tag",
    kind: "error", mode: "toggle", title: "Try to change the locked price tag",
    implements: ["CH0039.p2.bug"],
    question: "This program tries to give a constant a new value. Press Compile to see what C says. Then apply the fix and compile again.",
    broken: 'const int PRICE = 50;\nPRICE = 100;\nprintf("%d", PRICE);',
    fixed: 'int price = 50;\nprice = 100;\nprintf("%d", price);',
    diagnostic: "error: assignment of read-only variable 'PRICE'",
    outputAfterFix: "100",
    explanation: "\"Read-only\" means the value is locked. `printf(\"%d\", PRICE);` only reads it, which is fine. `PRICE = 100;` tries to change it, so C refuses to build the program.",
    fixNote: "Without `const`, `price` is an ordinary variable, so a new value is allowed. Use `const` when the value must stay the same, and then never assign to it.",
  },
  {
    id: "CH0039.p3.follow-call", stage: "STG002", chapter: "CH0039", page: 3, heading: "What is void?",
    kind: "trace", title: "Follow a call: void versus int",
    implements: ["CH0039.p3.tr"],
    intro: "Step through this program. Watch what happens when `greet()` is called, and how that differs from `getNumber()`.",
    code: '#include <stdio.h>\n\nvoid greet() {\n   printf("Hello!");\n}\n\nint getNumber() {\n   return 10;\n}\n\nint main() {\n   greet();\n   int n = getNumber();\n   printf(" %d", n);\n   return 0;\n}',
    notes: {
      4: "The task of `greet()`: it prints. A void function can still do things. It just does not hand a value back.",
      12: "`greet()` is called here. C jumps into `greet`, runs its task, and comes back. Nothing is handed back, because it is `void`.",
      13: "`getNumber()` runs `return 10;` and hands the value 10 back to this line. That value is what gets stored in `n`.",
      14: "Now `n` holds the value that came back, so `printf` can show it. void: the task runs and nothing comes back. int: a value comes back to the place where the function was called.",
    },
  },
  {
    id: "CH0039.p3.returns-a-value", stage: "STG002", chapter: "CH0039", page: 3, heading: "What is void?",
    kind: "assign", title: "Does a value come back?",
    implements: ["CH0039.p3.match"],
    question: "Sort these functions by whether they hand a value back to the place that called them.",
    buckets: [{ id: "value", label: "A value comes back" }, { id: "void", label: "Nothing comes back (void)" }],
    items: [
      { text: "void greet() { printf(\"Hello!\"); }", bucket: "void", why: "It prints something, but nothing comes back to the caller. void does not mean the function does nothing." },
      { text: "int getNumber() { return 10; }", bucket: "value", why: "The type int in front says an int value comes back, and `return 10;` sends it." },
      { text: "void showMenu() { printf(\"1. Play\"); }", bucket: "void", why: "It does its task (printing) and returns no value." },
      { text: "float getPrice() { return 9.5; }", bucket: "value", why: "The type float in front says a decimal value comes back." },
      { text: "char getGrade() { return 'A'; }", bucket: "value", why: "The type char in front says a character comes back." },
      { text: "void sayBye() { printf(\"Bye!\"); }", bucket: "void", why: "void in front means: do the task, give nothing back." },
    ],
    explanation: "Look at the word before the function name. A type such as int, float or char means a value comes back. void means the task is done and nothing comes back.",
  },
]);
