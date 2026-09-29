/*
 * CH0108 - Pointers and Variables (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer6.pdf. The PDF contrasts a variable (stores a value) with a pointer (stores an address),
 * shows a pointer created from & and used to access and then change the variable it points to, and closes
 * with the recap flow variable -> address -> pointer -> access -> change.
 *
 * Activities: a fill-in trace of x and p (page 2), a sort of statements into value/address/pointer/access
 * (page 3), and an order of the recap flow (page 5). Only 3 activities, because this chapter's own quiz has
 * 6 questions.
 */
ClickLearn.define([
  {
    id: "CH0108.p2.trace-connect", stage: "STG011", chapter: "CH0108", page: 2, heading: "Pointer Pointing to a Variable",
    kind: "tracetable", title: "Trace a pointer connecting to a variable",
    code: "int x = 25;\nint *p = &x;\n\nfor (int i = 0; i < 2; i++)\n{\n    printf(\"%d\\n\", *p);\n    x = x + 5;\n}",
    question: "Each row is one pass of the loop. Fill in x's value at that moment, and what *p reads (p points at x).",
    columns: [
      { key: "x", label: "x", kind: "var", var: "x" },
      { key: "p", label: "p (points to x)", kind: "var", var: "p" },
    ],
    fill: ["x", "p"],
    hint: "p was set from &x once and never changes; *p always reads x's current value.",
    explanation: "p points to x from the single line int *p = &x;. Round 1: x is 25, so *p is 25, then x becomes 30. Round 2: x is 30, so *p is 30. p never needs to be re-pointed for *p to see x's latest value.",
  },
  {
    id: "CH0108.p3.match-roles", stage: "STG011", chapter: "CH0108", page: 3, heading: "Using a Pointer to Access a Variable",
    kind: "assign", title: "Match each line to what it does",
    question: "Sort each line into the role it plays.",
    buckets: [
      { id: "value", label: "Holds a value" },
      { id: "address", label: "Gets an address" },
      { id: "pointer", label: "Stores the address" },
      { id: "access", label: "Accesses the value" },
    ],
    items: [
      { text: "int x = 25;", bucket: "value", why: "x simply stores the value 25." },
      { text: "&x", bucket: "address", why: "& gets the address where x is stored." },
      { text: "int *p = &x;", bucket: "pointer", why: "p stores the address of x." },
      { text: "*p", bucket: "access", why: "*p accesses the value stored at the address p holds." },
    ],
    explanation: "x holds a value. &x gets its address. int *p = &x; stores that address in a pointer. *p accesses the value through the pointer.",
  },
  {
    id: "CH0108.p5.recap-flow", stage: "STG011", chapter: "CH0108", page: 5, heading: "Pointers and Variables Recap",
    kind: "order", title: "Put the pointer-and-variable steps in order",
    noRun: true,
    question: "You are given a variable and asked to read, then change, its value through a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Create the variable",
      "Get its address with &",
      "Store the address in a pointer",
      "Access the value with *",
      "Change the value with *p = value",
    ],
    distractors: ["Change the value with *p = value before the pointer has an address"],
    explanation: "Create the variable, get its address, store the address in a pointer, access the value with *, then change it with *p = value. Changing the value through a pointer that has no valid address yet is undefined behavior.",
  },
]);
