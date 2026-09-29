/*
 * CH0118 - Counting Digits (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching2.pdf. The PDF teaches that counting digits means finding how many digits a number has, that
 * dividing by 10 removes one digit each time, that count = 0; then count++ inside a while (n != 0) loop counts the
 * divisions, and it works through 5678 -> 567 -> 56 -> 5 -> 0 with count 0, 1, 2, 3, 4.
 *
 * Activities: a sort of numbers by how many digits they have (page 1), a fill-in trace of n and count for 5678 (page 2),
 * an order of the counting steps (page 3) and a lab that reruns the same loop on different starting numbers (page 3).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0118.p1.count-boxes", stage: "STG012", chapter: "CH0118", page: 1, heading: "What Is Counting Digits?",
    kind: "assign", title: "How many digits?",
    question: "Sort each number into how many digits it has.",
    buckets: [
      { id: "1", label: "1 digit" },
      { id: "2", label: "2 digits" },
      { id: "3", label: "3 digits" },
      { id: "4", label: "4 digits" },
    ],
    items: [
      { text: "7", bucket: "1", why: "7 is a single digit on its own." },
      { text: "9", bucket: "1", why: "9 is a single digit on its own." },
      { text: "42", bucket: "2", why: "42 is made of the two digits 4 and 2." },
      { text: "88", bucket: "2", why: "88 is made of the two digits 8 and 8." },
      { text: "123", bucket: "3", why: "123 is made of the three digits 1, 2 and 3." },
      { text: "555", bucket: "3", why: "555 is made of three digits, even though they repeat." },
      { text: "1234", bucket: "4", why: "1234 is made of the four digits 1, 2, 3 and 4." },
      { text: "6789", bucket: "4", why: "6789 is made of four digits." },
    ],
    explanation: "Counting digits just means counting how many boxes a number's digits fill: 7 and 9 fill one box, 42 and 88 fill two, 123 and 555 fill three, 1234 and 6789 fill four.",
  },
  {
    id: "CH0118.p2.trace-count", stage: "STG012", chapter: "CH0118", page: 2, heading: "How Do We Count the Digits?",
    kind: "tracetable", title: "Trace counting the digits of 5678",
    code: "int n = 5678;\nint count = 0;\n\nwhile (n != 0)\n{\n    n = n / 10;\n    count++;\n}",
    question: "Each row is one check of the loop condition. Fill in n and count at that moment, and whether n != 0 is True or False.",
    columns: [
      { key: "n", label: "n", kind: "var", var: "n" },
      { key: "c", label: "n != 0 ?", kind: "cond" },
      { key: "cnt", label: "count", kind: "var", var: "count" },
    ],
    fill: ["n", "c", "cnt"],
    hint: "Go round by round. n and count both show their value at the moment the condition is checked -- that is, before that round's body runs.",
    explanation: "n starts at 5678 with count at 0. Each True round divides n by 10 and adds 1 to count: 5678 -> 567 -> 56 -> 5 -> 0, while count climbs 0, 1, 2, 3, 4. When n reaches 0, the condition is False and the loop stops -- 5678 has 4 digits.",
  },
  {
    id: "CH0118.p3.order-steps", stage: "STG012", chapter: "CH0118", page: 3, heading: "Counting Digits Using a Loop",
    kind: "order", title: "Put the counting steps in order",
    noRun: true,
    question: "You are given a number and asked to count its digits. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Start count at 0",
      "Check whether n is not 0",
      "Divide n by 10",
      "Add 1 to count",
      "Repeat the check, divide and add until n is 0",
    ],
    distractors: ["Start count at the value of n"],
    explanation: "Start count at 0, then keep checking n != 0: while it is true, divide n by 10 and add 1 to count, and repeat. Starting count at n's value would give the wrong total from the very first check.",
  },
  {
    id: "CH0118.p3.count-lab", stage: "STG012", chapter: "CH0118", page: 3, heading: "Counting Digits Using a Loop",
    kind: "lab", title: "Try different starting numbers",
    observe: "The loop always divides by 10 and adds 1 to count. Change the starting number and see how many digits it finds.",
    controls: [
      { id: "n", type: "select", label: "Starting number", value: "5678", options: [{ v: "5678", l: "5678" }, { v: "1234", l: "1234" }, { v: "100000", l: "100000" }, { v: "9", l: "9" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "   int count = 0;",
      "",
      "   while (n != 0) {",
      "      n = n / 10;",
      "      count++;",
      "   }",
      "   printf(\"%d\", count);",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "{{n}} has this many digits:",
    explanation: "The same loop counts the digits of any whole number: a single digit such as 9 stops after one round, while a number such as 100000 takes six rounds -- one for every digit, including the zeros.",
  },
]);
