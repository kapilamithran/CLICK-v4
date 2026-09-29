/*
 * CH0110 - Pointers and Arrays (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer8.pdf. The PDF shows that an array's own name is the address of its first element
 * (int *p = a;), that *p reads the current element and p++ advances, that *(p + i) reaches position i
 * directly, and combines both with a for loop to print every element.
 *
 * Activities: a fill-in trace of a pointer walking an array (page 2), a sort of *(p + i) expressions to the
 * position they reach (page 3), a lab trying a different array (page 3), and an order of the traversal
 * steps (page 4).
 */
ClickLearn.define([
  {
    id: "CH0110.p2.trace-walk", stage: "STG011", chapter: "CH0110", page: 2, heading: "Accessing Array Elements Using a Pointer",
    kind: "tracetable", title: "Trace walking along an array",
    code: "int a[] = {10, 20, 30};\nint *p = a;\n\nfor (int i = 0; i < 3; i++)\n{\n    printf(\"%d\\n\", *p);\n    p++;\n}",
    question: "Each row is one pass of the loop. Fill in what *p reads at that moment.",
    columns: [
      { key: "p", label: "*p", kind: "var", var: "p" },
    ],
    fill: ["p"],
    hint: "p starts at the array's first element and moves one element forward after each print.",
    explanation: "p starts at a[0] = 10. Round 1 reads 10, then p++ moves to a[1]. Round 2 reads 20, then p++ moves to a[2]. Round 3 reads 30. This is the same pattern Pointer Arithmetic taught, now used specifically to walk through an array.",
  },
  {
    id: "CH0110.p3.match-index", stage: "STG011", chapter: "CH0110", page: 3, heading: "Pointers and Array Indexes",
    kind: "assign", title: "Match each expression to the element it reaches",
    question: "Sort each expression into the array position it accesses.",
    buckets: [
      { id: "0", label: "First element" },
      { id: "1", label: "Second element" },
      { id: "2", label: "Third element" },
      { id: "3", label: "Fourth element" },
    ],
    items: [
      { text: "*(p + 0)", bucket: "0", why: "Position 0 is the first element." },
      { text: "*(p + 1)", bucket: "1", why: "Position 1 is the second element." },
      { text: "*(p + 2)", bucket: "2", why: "Position 2 is the third element." },
      { text: "*(p + 3)", bucket: "3", why: "Position 3 is the fourth element." },
      { text: "*p", bucket: "0", why: "*p with no offset is the same as *(p + 0) -- the first element." },
    ],
    explanation: "*(p + i) reaches the element at position i, and positions start at 0: *(p + 0) is the first element, *(p + 1) the second, and so on.",
  },
  {
    id: "CH0110.p3.array-lab", stage: "STG011", chapter: "CH0110", page: 3, heading: "Pointers and Array Indexes",
    kind: "lab", title: "Try traversing different arrays",
    observe: "The loop always visits positions 0 to 3 with *(p + i). Change the array's values and see the same loop print them.",
    controls: [
      { id: "vals", type: "select", label: "Array values", value: "10, 20, 30, 40", options: [{ v: "10, 20, 30, 40", l: "10, 20, 30, 40" }, { v: "5, 15, 25, 35", l: "5, 15, 25, 35" }, { v: "1, 2, 3, 4", l: "1, 2, 3, 4" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int a[] = {{{vals}}};",
      "   int *p = a;",
      "",
      "   for (int i = 0; i < 4; i++) {",
      "      printf(\"%d \", *(p + i));",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "With {{vals}}, the loop prints:",
    explanation: "The exact same *(p + i) loop traverses any array of 4 elements. Only the values stored change; the way the pointer reaches each position does not.",
  },
  {
    id: "CH0110.p4.order-steps", stage: "STG011", chapter: "CH0110", page: 4, heading: "Using Pointers to Traverse an Array",
    kind: "order", title: "Put the traversal steps in order",
    noRun: true,
    question: "You are given an array and asked to print every element using a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Create the array",
      "Point p at its first element with int *p = a;",
      "Loop i from 0 to the last position",
      "Access and print *(p + i) for each i",
    ],
    distractors: ["Loop i starting from 1 instead of 0"],
    explanation: "Create the array, point p at its first element, loop i starting from 0 (array positions start at 0, not 1), and access *(p + i) each time. Starting the loop at 1 would skip the first element.",
  },
]);
