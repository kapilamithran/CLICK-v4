/*
 * CH0097 - Functions with Return Values (Stage 9, STG010).
 *
 * Source: Functions4.pdf. The PDF defines a return value (the result sent back by a function: int add() { return 5 + 3; }
 * returns 8), why return values are used, return versus printf() (sends a value back / displays a value), the return types
 * int, float, char and void, and the flow of add(4, 6): the function receives 4 and 6, returns 10, the value is stored in
 * result and printf() displays it.
 *
 * Activities: a lab that changes the expression after return, a sort of the PDF's return-versus-printf() table, a match of
 * kinds of values to return types, and a step-by-step trace of add(4, 6) returning into result.
 */
ClickLearn.define([
  {
    id: "CH0097.p1.change-return", stage: "STG010", chapter: "CH0097", page: 1, heading: "What Is a Return Value?",
    kind: "lab", title: "Change what is returned",
    observe: "add() sends back whatever follows return, and main() shows it with printf(). Choose the expression and watch the returned value change.",
    controls: [
      { id: "e", type: "select", label: "What add() returns", value: "5 + 3", options: [{ v: "5 + 3", l: "5 + 3" }, { v: "5 + 4", l: "5 + 4" }, { v: "10 * 2", l: "10 * 2" }, { v: "20 - 3", l: "20 - 3" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int add() {",
      "   return {{e}};",
      "}",
      "",
      "int main() {",
      "   printf(\"%d\", add());",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "return {{e}}; sends back the value {{out}}, and printf() shows it.",
    explanation: "add() calculates a value and returns it. The function does not print anything itself: printf() in main() shows the value that came back.",
  },
  {
    id: "CH0097.p2.return-or-printf", stage: "STG010", chapter: "CH0097", page: 2, heading: "Why Are Return Values Used?",
    kind: "assign", title: "return or printf()?",
    question: "return and printf() do different jobs. Which one does each sentence describe?",
    buckets: [
      { id: "ret", label: "return" },
      { id: "show", label: "printf()" },
    ],
    items: [
      { text: "Sends a value back", bucket: "ret", why: "return hands a value back to the code that called the function." },
      { text: "Displays a value", bucket: "show", why: "printf() displays a value so a person can read it on the screen." },
      { text: "Can store the result", bucket: "ret", why: "A returned value can be stored in a variable, for example int result = add(4, 6);" },
      { text: "Prints directly on the screen", bucket: "show", why: "printf() writes straight to the screen. Nothing is handed back to store." },
      { text: "Used to give a result", bucket: "ret", why: "return is how a function gives its result to the code that called it." },
      { text: "Used to show output", bucket: "show", why: "printf() is used for output that you can see." },
    ],
    explanation: "return gives the value back; printf() shows it. A function with a return value gives a result instead of directly displaying it.",
  },
  {
    id: "CH0097.p3.match-return-type", stage: "STG010", chapter: "CH0097", page: 3, heading: "Return Types",
    kind: "assign", title: "Match the return type",
    question: "The return type is written before the function's name. Which return type fits the value each function sends back?",
    buckets: [
      { id: "int", label: "int" },
      { id: "float", label: "float" },
      { id: "char", label: "char" },
      { id: "void", label: "void" },
    ],
    items: [
      { text: "Returns a whole number", bucket: "int", why: "int is the return type for a whole number." },
      { text: "Returns a decimal number", bucket: "float", why: "float is the return type for a decimal number." },
      { text: "Returns a character", bucket: "char", why: "char is the return type for a single character." },
      { text: "Returns no value", bucket: "void", why: "void means no value is returned." },
      { text: "Returns 25, the result of 5 * 5", bucket: "int", why: "25 is a whole number, so the function needs the return type int, like int square(int n)." },
      { text: "Returns 3.5", bucket: "float", why: "3.5 has a decimal part, so the function needs the return type float." },
      { text: "Returns 'A'", bucket: "char", why: "'A' is one character, so the function needs the return type char." },
      { text: "Only prints a message and sends nothing back", bucket: "void", why: "A function like greet() that only prints has nothing to return, so its return type is void." },
    ],
    explanation: "The return type tells the compiler what type of value a function will return: int for a whole number, float for a decimal number, char for a character, void for no value. The returned value should match the return type.",
  },
  {
    id: "CH0097.p4.trace-add-return", stage: "STG010", chapter: "CH0097", page: 4, heading: "Flowchart: Function with Return Value",
    kind: "trace", title: "Return, store, show",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "int add(int a, int b) {",
      "   return a + b;",
      "}",
      "",
      "int main() {",
      "   int result = add(4, 6);",
      "   printf(\"%d\", result);",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      8: "One line, three moments: main() calls add(4, 6) so a receives 4 and b receives 6, add() calculates 4 + 6 and return sends 10 back, and the value 10 is stored in result.",
      9: "printf() displays the value stored in result. The function returned the 10; printf() is what shows it.",
    },
    explanation: "add() receives 4 and 6, calculates 4 + 6, and return sends back 10. The value is stored in result, and printf() displays it. Return gives the value back; printf() shows it.",
  },
]);
