/*
 * CH0109 - Pointer Arithmetic (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer7.pdf. The PDF teaches p++ (next element), p-- (previous element), and p + n / p - n
 * (n elements forward/backward), all moving by elements, not raw bytes, and closes with the recap that
 * *p reads the value at the pointer's current position.
 *
 * Activities: a fill-in trace of p moving through an array (page 2), a sort of the different moves by what
 * they do (page 3), a lab trying different move amounts (page 4), and an order of the traversal steps
 * (page 1).
 */
ClickLearn.define([
  {
    id: "CH0109.p2.trace-move", stage: "STG011", chapter: "CH0109", page: 2, heading: "Moving a Pointer",
    kind: "tracetable", title: "Trace a pointer moving through an array",
    code: "int a[] = {10, 20, 30};\nint *p = a;\n\nfor (int i = 0; i < 3; i++)\n{\n    printf(\"%d\\n\", *p);\n    p++;\n}",
    question: "Each row is one pass of the loop. Fill in what *p reads at that moment.",
    columns: [
      { key: "p", label: "*p", kind: "var", var: "p" },
    ],
    fill: ["p"],
    hint: "p starts at the first element and moves one element forward after each print.",
    explanation: "p starts at a[0] = 10. Round 1 reads 10, then p++ moves to a[1]. Round 2 reads 20, then p++ moves to a[2]. Round 3 reads 30. p++ always moves one element forward, whatever element it is currently at.",
  },
  {
    id: "CH0109.p3.match-moves", stage: "STG011", chapter: "CH0109", page: 3, heading: "Moving Backward",
    kind: "assign", title: "Match each move to what it does",
    question: "Sort each expression into what it does to the pointer.",
    buckets: [
      { id: "next", label: "Moves to the next element" },
      { id: "prev", label: "Moves to the previous element" },
      { id: "forward-n", label: "Moves n elements forward" },
      { id: "backward-n", label: "Moves n elements backward" },
      { id: "read", label: "Reads the current value" },
    ],
    items: [
      { text: "p++", bucket: "next", why: "++ moves the pointer forward by one element." },
      { text: "p--", bucket: "prev", why: "-- moves the pointer backward by one element." },
      { text: "p = p + 2", bucket: "forward-n", why: "+ 2 moves the pointer two elements forward." },
      { text: "p = p - 2", bucket: "backward-n", why: "- 2 moves the pointer two elements backward." },
      { text: "*p", bucket: "read", why: "* reads the value at wherever the pointer currently is, without moving it." },
    ],
    explanation: "p++ and p-- move one element at a time; p + n and p - n move n elements at once; *p reads the value at the pointer's current position without moving it.",
  },
  {
    id: "CH0109.p4.arith-lab", stage: "STG011", chapter: "CH0109", page: 4, heading: "Pointer + Number",
    kind: "lab", title: "Try moving the pointer by different amounts",
    observe: "p starts at the first element. Change how far it moves and see which element *(p + n) reaches.",
    controls: [
      { id: "n", type: "select", label: "Move forward by", value: "2", options: [{ v: "0", l: "0" }, { v: "1", l: "1" }, { v: "2", l: "2" }, { v: "3", l: "3" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int a[] = {10, 20, 30, 40};",
      "   int *p = a;",
      "",
      "   printf(\"%d\", *(p + {{n}}));",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "*(p + {{n}}) reads:",
    explanation: "p + n always lands exactly n elements ahead of where p started: p + 0 is 10, p + 1 is 20, p + 2 is 30, p + 3 is 40. Pointer arithmetic moves by elements, not raw bytes.",
  },
  {
    id: "CH0109.p1.order-steps", stage: "STG011", chapter: "CH0109", page: 1, heading: "What Is Pointer Arithmetic?",
    kind: "order", title: "Put the traversal steps in order",
    noRun: true,
    question: "You are given an array and asked to visit every element with a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Point p at the first element",
      "Access the current element with *p",
      "Move the pointer forward with p++",
      "Repeat until every element is visited",
    ],
    distractors: ["Move the pointer past the array and keep dereferencing it"],
    explanation: "Point at the first element, access it, move forward, and repeat -- stopping once every element has been visited. Moving past the end of the array and still dereferencing is undefined behavior.",
  },
]);
