/*
 * CH0106 - Dereference Operator * (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer4.pdf. The PDF defines * as reading the value stored at the address a pointer holds,
 * shows *p being both read and assigned to (*p = 20; changes the original variable), and closes with the
 * flow get address -> store address -> dereference -> change value.
 *
 * Activities: a fill-in trace of x and *p (page 2), a builder for the *p = value statement (page 3), an
 * order of the recap flow (page 5), and a lab that changes what *p is set to (page 3).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0106.p2.trace-read", stage: "STG011", chapter: "CH0106", page: 2, heading: "Accessing the Value Using *",
    kind: "tracetable", title: "Trace reading through a pointer",
    code: "int x = 5;\nint *p = &x;\n\nfor (int i = 0; i < 3; i++)\n{\n    printf(\"%d\\n\", *p);\n    x++;\n}",
    question: "Each row is one pass of the loop. Fill in x's value at that moment, and what *p reads (p always points at x).",
    columns: [
      { key: "x", label: "x", kind: "var", var: "x" },
      { key: "p", label: "p (points to x)", kind: "var", var: "p" },
    ],
    fill: ["x", "p"],
    hint: "p never changes; only x does. *p always reads whatever x currently holds.",
    explanation: "p is set to &x once. Round 1: x is 5, so *p is 5, then x++ makes x 6. Round 2: x is 6, so *p is 6, then x becomes 7. Round 3: x is 7, so *p is 7. *p is never a fixed snapshot -- it always follows x.",
  },
  {
    id: "CH0106.p3.build-change", stage: "STG011", chapter: "CH0106", page: 3, heading: "Changing a Value Using *",
    kind: "builder", title: "Build the statement that changes a value",
    question: "p already points to x. Build the statement that changes x's value to 20 through the pointer.",
    template: "{deref}p {op} 20;",
    slots: {
      deref: {
        label: "dereference p",
        options: ["*", "&", ""],
        answer: "*",
        why: "* dereferences p, reaching the value it points to. & would give an address, not let you change a value, and leaving it out would try to assign 20 to the pointer itself.",
      },
      op: {
        label: "assign",
        options: ["=", "==", "+="],
        answer: "=",
        why: "A single = assigns the new value. == only compares, and += would add 20 to the old value instead of setting it to 20.",
      },
    },
    explanation: "*p = 20; dereferences p to reach the value it points to, then assigns 20 there. Since p points to x, this changes x itself to 20.",
  },
  {
    id: "CH0106.p3.lab-change-value", stage: "STG011", chapter: "CH0106", page: 3, heading: "Changing a Value Using *",
    kind: "lab", title: "Try changing the value through the pointer",
    observe: "The pointer p always points to x. Change what *p is assigned and see x update to match.",
    controls: [
      { id: "v", type: "select", label: "*p = ?", value: "20", options: [{ v: "20", l: "20" }, { v: "0", l: "0" }, { v: "99", l: "99" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int x = 10;",
      "   int *p = &x;",
      "",
      "   *p = {{v}};",
      "   printf(\"%d\", x);",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "*p = {{v}}; makes x become:",
    explanation: "Whatever value *p is assigned, x takes on that exact value, because p holds x's address. Dereferencing and assigning is how a pointer modifies the variable it points to.",
  },
  {
    id: "CH0106.p5.recap-flow", stage: "STG011", chapter: "CH0106", page: 5, heading: "Dereference Operator Recap",
    kind: "order", title: "Put the dereference steps in order",
    noRun: true,
    question: "You are given a variable and asked to read, then change, its value through a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Get the address with &",
      "Store the address in the pointer",
      "Dereference the pointer to read the value",
      "Assign through the pointer to change the value",
    ],
    distractors: ["Assign through the pointer before it has a valid address"],
    explanation: "Get the address, store it in the pointer, dereference to read, and only then assign to change the value. Assigning through a pointer that has no valid address yet is undefined behavior.",
  },
]);
