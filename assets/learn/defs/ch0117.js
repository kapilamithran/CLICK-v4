/*
 * CH0117 - Accessing Digits (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching1.pdf. The PDF teaches that a number is made of individual digits, that % 10 GETs the last digit
 * (digit = n % 10), that / 10 REMOVEs it (n = n / 10), and that repeating both together walks through every digit of a
 * number from last to first (its own worked example is 1234 -> digits 4, 3, 2, 1).
 *
 * Activities: a fill-in trace of the digit-printing loop for 1234 (page 2), a sort of statements into GET or REMOVE
 * (page 3), an order of the GET/use/REMOVE/check/repeat cycle (page 4) and a lab that reruns the same loop on different
 * starting numbers (page 4).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0117.p2.trace-access", stage: "STG012", chapter: "CH0117", page: 2, heading: "Accessing a Digit",
    kind: "tracetable", title: "Fill in the trace table for accessing digits",
    code: "int n = 1234;\nint digit;\n\nwhile (n != 0)\n{\n    digit = n % 10;\n    printf(\"%d \", digit);\n    n = n / 10;\n}",
    question: "Each row is one check of the loop condition. Fill in n at that moment, whether n != 0 is True or False, and what gets printed in that round. Leave a cell empty if nothing is printed.",
    columns: [
      { key: "n", label: "n", kind: "var", var: "n" },
      { key: "c", label: "n != 0 ?", kind: "cond" },
      { key: "o", label: "Printed", kind: "out" },
    ],
    fill: ["n", "c", "o"],
    hint: "Go round by round. Check the condition first. Only when it is True does the body GET a digit with % 10 and print it, before / 10 removes it.",
    explanation: "n starts at 1234. Each True round prints one digit with % 10 (4, then 3, then 2, then 1) and / 10 removes it (1234 -> 123 -> 12 -> 1 -> 0). When n reaches 0, the condition is False and the loop stops without printing.",
  },
  {
    id: "CH0117.p3.get-or-remove", stage: "STG012", chapter: "CH0117", page: 3, heading: "Removing the Last Digit",
    kind: "assign", title: "Which one gets, which one removes?",
    question: "Sort each statement or expression into what it does to a number.",
    buckets: [
      { id: "get", label: "GETs the last digit" },
      { id: "remove", label: "REMOVEs the last digit" },
    ],
    items: [
      { text: "digit = n % 10;", bucket: "get", why: "% 10 gives the remainder of dividing by 10, which is the last digit." },
      { text: "n = n / 10;", bucket: "remove", why: "/ 10 divides away the last digit, so it disappears from n." },
      { text: "1234 % 10", bucket: "get", why: "This works out to 4, the last digit of 1234." },
      { text: "1234 / 10", bucket: "remove", why: "This works out to 123 -- 1234 with its last digit taken off." },
      { text: "The modulus operator, %", bucket: "get", why: "% always GETs the remainder, which is the last digit." },
      { text: "The division operator, /", bucket: "remove", why: "Integer division by 10 always REMOVEs the last digit." },
    ],
    explanation: "% 10 always GETs the last digit -- it is the remainder. / 10 always REMOVEs the last digit -- integer division throws the remainder away. The two are used together, one after the other, to walk through every digit of a number.",
  },
  {
    id: "CH0117.p4.order-steps", stage: "STG012", chapter: "CH0117", page: 4, heading: "Accessing All the Digits",
    kind: "order", title: "Put the digit-accessing steps in order",
    noRun: true,
    question: "You are given a number and asked to read off every digit. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "GET the last digit with % 10",
      "Use the digit (print it or store it)",
      "REMOVE the last digit with / 10",
      "Check whether the number is now 0",
      "If it is not 0, repeat from the first step",
    ],
    distractors: ["Add 10 back to the number"],
    explanation: "GET the last digit with % 10, use it, then REMOVE it with / 10. Check whether the number reached 0; if not, repeat the whole cycle. Adding 10 back would undo the removal and the loop would never finish.",
  },
  {
    id: "CH0117.p4.digit-lab", stage: "STG012", chapter: "CH0117", page: 4, heading: "Accessing All the Digits",
    kind: "lab", title: "Try different starting numbers",
    observe: "The loop always does the same two things: GET with % 10, then REMOVE with / 10. Change the starting number and see which digits come out, and in what order.",
    controls: [
      { id: "n", type: "select", label: "Starting number", value: "1234", options: [{ v: "1234", l: "1234" }, { v: "5678", l: "5678" }, { v: "42", l: "42" }, { v: "9", l: "9" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "   int digit;",
      "",
      "   while (n != 0) {",
      "      digit = n % 10;",
      "      printf(\"%d \", digit);",
      "      n = n / 10;",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "Starting from {{n}}, the digits come out from last to first.",
    explanation: "Whatever number you start with, % 10 always peels off the last digit and / 10 always removes it, so the digits always appear in reverse order -- last digit first. A single-digit number such as 9 only runs the loop once.",
  },
]);
