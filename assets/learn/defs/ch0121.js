/*
 * CH0121 - Checking an Armstrong Number (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching5.pdf. The PDF defines an Armstrong number as one equal to the sum of the cubes of its own
 * digits, reuses % 10 / / 10 from Accessing Digits, cubes each digit with digit * digit * digit, adds the cubes into
 * sum, and compares sum with the saved original. Its own worked example is 153 = 1 cubed + 5 cubed + 3 cubed.
 *
 * Activities: a builder for the cubing expression (page 3), a fill-in trace of digit and sum for 153 (page 4), an
 * order of the GET/CUBE/ADD/REMOVE/COMPARE cycle (page 4) and a sort of statements into those five steps (page 5).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0121.p3.build-cube", stage: "STG012", chapter: "CH0121", page: 3, heading: "Cubing Each Digit",
    kind: "builder", title: "Build the cubing expression",
    question: "For an Armstrong number, every digit is cubed -- multiplied by itself three times. Build the expression that cubes digit.",
    template: "sum = sum + digit {op1} digit {op2} digit;",
    slots: {
      op1: {
        label: "first multiply",
        options: ["*", "+", "-", "/"],
        answer: "*",
        why: "Cubing means multiplying, not adding, subtracting or dividing.",
      },
      op2: {
        label: "second multiply",
        options: ["*", "+", "-", "/"],
        answer: "*",
        why: "digit * digit * digit multiplies the digit by itself three times in total, which is what \"cubed\" means.",
      },
    },
    explanation: "digit * digit * digit multiplies a digit by itself three times: for 5, that is 5 * 5 * 5 = 125. Adding this cube onto sum is how every digit's contribution gets counted.",
  },
  {
    id: "CH0121.p4.trace-armstrong", stage: "STG012", chapter: "CH0121", page: 4, heading: "Checking Armstrong in C",
    kind: "tracetable", title: "Trace checking whether 153 is an Armstrong number",
    code: "int n = 153;\nint original, digit = 0, sum = 0;\noriginal = n;\n\nwhile (n != 0)\n{\n    digit = n % 10;\n    sum = sum + digit * digit * digit;\n    n = n / 10;\n}",
    question: "Each row is one check of the loop condition, after original has already been saved. Fill in n and sum at that moment -- sum shows the result of the previous round (0 before the first round has run).",
    columns: [
      { key: "n", label: "n", kind: "var", var: "n" },
      { key: "c", label: "n != 0 ?", kind: "cond" },
      { key: "s", label: "sum", kind: "var", var: "sum" },
    ],
    fill: ["n", "c", "s"],
    hint: "original was saved as 153 before this loop even started, and it never changes. Trace one round at a time: GET the digit, CUBE and ADD it to sum, then REMOVE it from n.",
    explanation: "n shrinks from 153 to 0 while sum builds up: after round 1 (digit 3), sum is 27; after round 2 (digit 5), sum is 152; after round 3 (digit 1), sum is 153. original was saved as 153, so sum == original is true -- 153 is an Armstrong number.",
  },
  {
    id: "CH0121.p4.order-steps", stage: "STG012", chapter: "CH0121", page: 4, heading: "Checking Armstrong in C",
    kind: "order", title: "Put the Armstrong check in order",
    noRun: true,
    question: "You are given a number and asked to check whether it is an Armstrong number. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Save the original number",
      "Get the next digit",
      "Cube the digit and add it to sum",
      "Remove the digit",
      "Once every digit is used, compare sum with the original",
    ],
    distractors: ["Compare sum with the original before the loop starts"],
    explanation: "Save the original first, since it must stay unchanged for the final comparison. Then, for every digit: get it, cube it and add it to sum, then remove it. Only once the loop has used every digit does comparing sum with the original make sense -- doing it earlier would compare against an empty sum.",
  },
  {
    id: "CH0121.p5.assign-steps", stage: "STG012", chapter: "CH0121", page: 5, heading: "Armstrong Number Recap",
    kind: "assign", title: "Match each line to what it does",
    question: "Sort each statement into the step of the Armstrong check it belongs to.",
    buckets: [
      { id: "get", label: "GET" },
      { id: "cube", label: "CUBE" },
      { id: "add", label: "ADD" },
      { id: "remove", label: "REMOVE" },
      { id: "compare", label: "COMPARE" },
    ],
    items: [
      { text: "digit = n % 10;", bucket: "get", why: "% 10 gives the last digit that is still left in n." },
      { text: "digit * digit * digit", bucket: "cube", why: "Multiplying a digit by itself three times cubes it." },
      { text: "sum = sum + digit * digit * digit;", bucket: "add", why: "This adds the newly cubed digit onto the running total." },
      { text: "n = n / 10;", bucket: "remove", why: "/ 10 removes the digit that was just used." },
      { text: "if (sum == original)", bucket: "compare", why: "This checks whether the total of the cubes matches the original number." },
    ],
    explanation: "GET a digit, CUBE it, ADD the cube to sum, then REMOVE the digit, repeating for every digit. Only once every digit is used does COMPARE make sense -- checking whether the finished sum equals the original number.",
  },
]);
