/*
 * CH0098 - Types of Functions (Stage 9, STG010).
 *
 * Source: Functions5.pdf. The PDF sorts functions into four types by two questions (does it have parameters? does it return
 * a value?) and gives one example each: void greet(), void displaySquare(int n), int getNumber() and int add(int a, int b).
 * It also lists the fixed jobs of a Type 1 function (message, menu, title, instructions) and the "silent worker / task worker /
 * vending machine / smart calculator" memory trick.
 *
 * Activities: a four-way sort of function headers (page 1), tap-to-open cards for the Type 1 jobs (page 2), a prediction on a
 * Type 2 function (page 3) and a step-through of Type 3 and Type 4 with the calls in progress (page 4).
 *
 * Trace note: the interpreter steps the call line (call, return, printf), not the `return ...;` line inside the function, so the
 * notes on page 4 sit on the two call lines, where the returned value arrives.
 */
ClickLearn.define([
  {
    id: "CH0098.p1.which-type", stage: "STG010", chapter: "CH0098", page: 1, heading: "What Are the Types of Functions?",
    kind: "assign", title: "Which type is it?",
    question: "A function's type depends on two questions: does it have parameters, and does it return a value? Sort each function header into its type.",
    buckets: [
      { id: "t1", label: "Type 1: no parameters, no return value" },
      { id: "t2", label: "Type 2: parameters, no return value" },
      { id: "t3", label: "Type 3: no parameters, return value" },
      { id: "t4", label: "Type 4: parameters and return value" },
    ],
    items: [
      { text: "void greet()", bucket: "t1", why: "The brackets are empty, so there are no parameters, and void means nothing is returned. No input and no output is Type 1." },
      { text: "void printMenu()", bucket: "t1", why: "Empty brackets mean no parameters, and void means no return value. It just prints the menu: Type 1." },
      { text: "void displaySquare(int n)", bucket: "t2", why: "int n is a parameter, so it receives a value. But void means it returns nothing, it prints the square itself: Type 2." },
      { text: "void display(int n)", bucket: "t2", why: "It has a parameter (int n) and it is void, so it receives a value but sends nothing back: Type 2." },
      { text: "int getNumber()", bucket: "t3", why: "The brackets are empty, so no parameters. int instead of void means it returns a value: no input but an output is Type 3." },
      { text: "int getMaxMarks()", bucket: "t3", why: "Nothing goes in (empty brackets) and an int value comes back, such as a fixed maximum mark. No input but an output is Type 3." },
      { text: "int add(int a, int b)", bucket: "t4", why: "It has parameters (int a, int b) and it returns an int result. Input and output together make Type 4." },
      { text: "int square(int n)", bucket: "t4", why: "It receives n through a parameter and returns an int, so it has both input and output: Type 4." },
    ],
    explanation: "Answer two questions. Parameters? Look inside the brackets. Return value? void means nothing comes back, int means a value does. Think of a food shop: a button that gives nothing (Type 1), an order the shop prepares (Type 2), a fixed food item (Type 3), ingredients in and a prepared dish out (Type 4).",
  },
  {
    id: "CH0098.p2.type1-uses", stage: "STG010", chapter: "CH0098", page: 2, heading: "Type 1: No Parameters and No Return Value",
    kind: "reveal", title: "When is a Type 1 function used?",
    intro: "The pattern is `void functionName() { // statements }`. It does one fixed task, so it needs no input and returns no result. Open each card.",
    cards: [
      { label: "Displaying a message", body: "`void greet() { printf(\"Hello Student\"); }`\nThe message is always the same, so greet() needs no input and gives nothing back." },
      { label: "Printing a menu", body: "`void printMenu() { printf(\"1. Start  2. Exit\"); }`\nWhenever the menu is needed, one call prints it the same way every time." },
      { label: "Showing a title", body: "`void showTitle() { printf(\"My Program\"); }`\nA program's title never changes, so a function with no input is enough." },
      { label: "Displaying instructions", body: "`void showHelp() { printf(\"Press 1 to start\"); }`\nInstructions are fixed text. The function only performs the task." },
    ],
    explanation: "Every one of these jobs is fixed. The function performs a task without receiving input or returning a result. That is Type 1, the silent worker.",
  },
  {
    id: "CH0098.p3.predict-square", stage: "STG010", chapter: "CH0098", page: 3, heading: "Type 2: Parameters and No Return Value",
    kind: "predict", title: "Predict a Type 2 function",
    code: [
      "#include <stdio.h>",
      "",
      "void displaySquare(int n) {",
      "   printf(\"%d \", n * n);",
      "}",
      "",
      "int main() {",
      "   displaySquare(3);",
      "   displaySquare(4);",
      "   return 0;",
      "}",
    ].join("\n"),
    question: "Each call gives displaySquare() a different value for n. What does this program print?",
    choices: ["9 16", "6 8", "3 4", "25"],
    expected: "9 16",
    hint: "n receives the value written in each call, and the function multiplies n by itself.",
    explanation: "displaySquare(3) sets n to 3 and prints 3 * 3 = 9. displaySquare(4) sets n to 4 and prints 4 * 4 = 16. The function prints the answer itself and returns nothing, which is Type 2. The wrong choices come from doubling instead of squaring (6 8), printing the arguments (3 4) or adding the two squares (25).",
  },
  {
    id: "CH0098.p4.trace-type3-type4", stage: "STG010", chapter: "CH0098", page: 4, heading: "Type 3 and Type 4",
    kind: "trace", title: "Follow Type 3 and Type 4",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "int getNumber() {",
      "   return 10;",
      "}",
      "",
      "int add(int a, int b) {",
      "   return a + b;",
      "}",
      "",
      "int main() {",
      "   printf(\"%d\\n\", getNumber());",
      "   printf(\"%d\", add(2, 3));",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      12: "getNumber() has no parameters (empty brackets). Its `return 10;` sends the value 10 back to this line, and printf then prints the value that came back. That is Type 3.",
      13: "add(2, 3): a receives 2 and b receives 3. Its `return a + b;` sends 5 back to this line, and printf prints it. That is Type 4: values in, result out.",
    },
    explanation: "Type 3 (getNumber) takes nothing in and returns 10. Type 4 (add) takes 2 and 3 in and returns their sum, 5. In both cases the value travels back to the line that made the call, where printf shows it. Watch \"Calls in progress\": a function is on top while it runs and disappears when it returns.",
  },
]);
