/*
 * CH0119 - Reversing a Number (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching3.pdf. The PDF reuses % 10 and / 10 from Accessing Digits to get and remove each digit, then
 * builds the reverse with rev = rev * 10 + digit;, starting from rev = 0. Its own worked example is 1234, whose digits
 * 4, 3, 2, 1 build rev up to 4, 43, 432, 4321.
 *
 * Activities: a fill-in trace of digit and rev for 1234 (page 3), a builder for the rev * 10 + digit statement (page 3)
 * and a lab that reruns the same loop on different starting numbers (page 4). Only 3 activities, because this chapter's
 * own quiz has 6 questions instead of 5 (Number-Crunching3.pdf's own numbering repeats "3").
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0119.p3.trace-reverse", stage: "STG012", chapter: "CH0119", page: 3, heading: "Building the Reverse",
    kind: "tracetable", title: "Trace building the reverse of 1234",
    code: "int n = 1234;\nint digit = 0, rev = 0;\n\nwhile (n != 0)\n{\n    digit = n % 10;\n    rev = rev * 10 + digit;\n    n = n / 10;\n}",
    question: "Each row is one check of the loop condition. Fill in n, digit and rev at that moment -- the values left over from the previous round (0 before the first round has run).",
    columns: [
      { key: "n", label: "n", kind: "var", var: "n" },
      { key: "c", label: "n != 0 ?", kind: "cond" },
      { key: "d", label: "digit", kind: "var", var: "digit" },
      { key: "r", label: "rev", kind: "var", var: "rev" },
    ],
    fill: ["n", "c", "d", "r"],
    hint: "digit and rev show the result of the PREVIOUS round (both start at 0, before any digit has been found). Trace one round at a time: GET the digit, BUILD rev, then REMOVE the digit from n.",
    explanation: "n shrinks from 1234 to 0 while digit and rev show what the last round produced: after round 1, digit is 4 and rev is 4; after round 2, digit is 3 and rev is 43; after round 3, digit is 2 and rev is 432; after round 4, digit is 1 and rev is 4321. When n reaches 0, the loop stops -- 1234 reversed is 4321.",
  },
  {
    id: "CH0119.p3.build-formula", stage: "STG012", chapter: "CH0119", page: 3, heading: "Building the Reverse",
    kind: "builder", title: "Build the reverse statement",
    question: "digit already holds the next digit to add. Build the statement that folds it onto rev.",
    template: "rev = rev {mul} 10 {add} digit;",
    slots: {
      mul: {
        label: "shift rev left",
        options: ["*", "+", "-", "/"],
        answer: "*",
        why: "Multiplying rev by 10 shifts its digits one place left, making room for the new digit. Adding, subtracting or dividing would not move the existing digits at all.",
      },
      add: {
        label: "place the new digit",
        options: ["+", "-", "*", "/"],
        answer: "+",
        why: "Adding digit places it in the empty last position rev * 10 just made. Subtracting, multiplying or dividing would change the digits already in rev instead of just adding one more.",
      },
    },
    explanation: "rev * 10 shifts every digit already in rev one place to the left, and + digit fills the new last place. Repeating this once per digit builds the whole reversed number: 0, then 4, then 43, then 432, then 4321.",
  },
  {
    id: "CH0119.p4.reverse-lab", stage: "STG012", chapter: "CH0119", page: 4, heading: "Reversing a Number Using a Loop",
    kind: "lab", title: "Try different starting numbers",
    observe: "The loop always GETs a digit, BUILDs it into rev, then REMOVEs it from n. Change the starting number and see what it reverses to.",
    controls: [
      { id: "n", type: "select", label: "Starting number", value: "1234", options: [{ v: "1234", l: "1234" }, { v: "987", l: "987" }, { v: "1200", l: "1200" }, { v: "5", l: "5" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "   int digit, rev = 0;",
      "",
      "   while (n != 0) {",
      "      digit = n % 10;",
      "      rev = rev * 10 + digit;",
      "      n = n / 10;",
      "   }",
      "   printf(\"%d\", rev);",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "{{n}} reversed is:",
    explanation: "The same loop reverses any whole number. Notice 1200: its reverse is 21, not 0021 -- the leading zeros of a reversed number simply disappear, because a number cannot start with 0. A single digit, such as 5, reverses to itself.",
  },
]);
