/*
 * CH0099 - Multiple Parameters and Arguments (Stage 9, STG010).
 *
 * Source: Functions6.pdf. The PDF introduces multiple parameters with a shopping bill (price and quantity), lists why they
 * are used, says each parameter receives a value from the corresponding argument and that the ORDER of the arguments matters
 * ("changing the order may change the result"), separates parameters (in the definition, they receive) from arguments (in the
 * call, they provide), and follows add(7, 2) through the flowchart to the output 9.
 *
 * Activities: change the two arguments of bill() and run it (page 1), a lab on sub(a, b) where swapping the arguments changes
 * the result (page 2; the PDF's own add(5, 3) cannot show this because addition gives the same answer in either order, so the
 * lab uses subtraction), sort the arguments of add() and student() into the parameter that receives them (page 3), and a
 * step-through of add(7, 2) with the calls in progress (page 4).
 */
ClickLearn.define([
  {
    id: "CH0099.p1.bill-run", stage: "STG010", chapter: "CH0099", page: 1, heading: "What Are Multiple Parameters?",
    kind: "run", title: "Change the bill",
    code: [
      "#include <stdio.h>",
      "",
      "void bill(int price, int quantity) {",
      "   printf(\"%d\", price * quantity);",
      "}",
      "",
      "int main() {",
      "   bill(20, 3);",
      "   return 0;",
      "}",
    ].join("\n"),
    initialOutput: "60",
    tasks: [
      "Change the two arguments in `bill(20, 3);` to `15` and `5`, then press Run.",
      "Guess the total first. The first argument goes to price and the second goes to quantity. Then try two numbers of your own.",
    ],
    goal: { changed: true }, goalHint: "Change the numbers inside the brackets of bill(20, 3) in main(), so that price * quantity is no longer 60, then press Run again.",
    explanation: "bill() has two parameters, so every call needs two arguments. The first argument goes to price and the second goes to quantity, and the function multiplies them: bill(20, 3) is 20 * 3 = 60, and bill(15, 5) is 15 * 5 = 75. Multiple inputs, one task, one result.",
  },
  {
    id: "CH0099.p2.order-lab", stage: "STG010", chapter: "CH0099", page: 2, heading: "Why Are Multiple Parameters Used?",
    kind: "lab", title: "Does the order matter?",
    observe: "sub() subtracts b from a. Choose the two arguments, then swap them and compare the results.",
    controls: [
      { id: "x", type: "select", label: "First argument (goes to a)", value: "5", options: [{ v: "5", l: "5" }, { v: "3", l: "3" }, { v: "8", l: "8" }, { v: "2", l: "2" }] },
      { id: "y", type: "select", label: "Second argument (goes to b)", value: "3", options: [{ v: "5", l: "5" }, { v: "3", l: "3" }, { v: "8", l: "8" }, { v: "2", l: "2" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void sub(int a, int b) {",
      "   printf(\"%d\", a - b);",
      "}",
      "",
      "int main() {",
      "   sub({{x}}, {{y}});",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "a receives {{x}} and b receives {{y}}, so the function prints {{out}}.",
    explanation: "The first argument always goes to the first parameter and the second to the second parameter. sub(5, 3) is 5 - 3 = 2, but sub(3, 5) is 3 - 5 = -2. Same numbers, different order, different result, so the order of the arguments matters.",
  },
  {
    id: "CH0099.p3.which-parameter", stage: "STG010", chapter: "CH0099", page: 3, heading: "Parameters vs Arguments",
    kind: "assign", title: "Which parameter receives it?",
    question: "Look at `void add(int a, int b)` and `void student(char name[], int age)`. Each argument in a call goes to the parameter in the same position. Which parameter receives each argument?",
    buckets: [
      { id: "a", label: "a (in add)" },
      { id: "b", label: "b (in add)" },
      { id: "name", label: "name (in student)" },
      { id: "age", label: "age (in student)" },
    ],
    items: [
      { text: "7 in add(7, 2)", bucket: "a", why: "7 is the first argument, so it goes to the first parameter, a." },
      { text: "2 in add(7, 2)", bucket: "b", why: "2 is the second argument, so it goes to the second parameter, b." },
      { text: "5 in add(5, 3)", bucket: "a", why: "5 is written first in the call, so the first parameter, a, receives it." },
      { text: "3 in add(5, 3)", bucket: "b", why: "3 is written second in the call, so the second parameter, b, receives it." },
      { text: "\"Arun\" in student(\"Arun\", 18)", bucket: "name", why: "\"Arun\" is the first argument and name is the first parameter. It is text, and name is the parameter that holds text." },
      { text: "18 in student(\"Arun\", 18)", bucket: "age", why: "18 is the second argument, so it goes to the second parameter, age." },
    ],
    explanation: "Arguments are matched with parameters by position: first to first, second to second. Parameters are written in the function definition and receive; arguments are written in the function call and provide.",
  },
  {
    id: "CH0099.p4.trace-add", stage: "STG010", chapter: "CH0099", page: 4, heading: "Flowchart and Function Execution",
    kind: "trace", title: "Follow add(7, 2)",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "void add(int a, int b) {",
      "   printf(\"%d\", a + b);",
      "}",
      "",
      "int main() {",
      "   add(7, 2);",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "Inside add(), a + b is 7 + 2, so 9 is displayed.",
      8: "main() passes the arguments 7 and 2. They are matched with the parameters in order: a receives 7 and b receives 2. Then the function runs.",
    },
    explanation: "Create the function, enter main(), pass the arguments, call the function, match the values with the parameters, execute it, and the output is 9. a received 7, b received 2, and a + b is 9.",
  },
]);
