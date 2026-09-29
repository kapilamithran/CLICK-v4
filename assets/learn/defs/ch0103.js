/*
 * CH0103 - Pointer Basics (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer1.pdf. The PDF defines a pointer as a variable that stores another variable's address,
 * teaches & (address-of) and * (dereference), shows that changing *p changes the original variable, and
 * closes with the flow declare -> get address -> store address -> access value.
 *
 * Activities: a sort of pointer vocabulary into what it means (page 1), a fill-in trace of x and p as the
 * pointer is used (page 2), and an order of the chapter's own recap flow (page 5). Only 3 activities,
 * because this chapter's own quiz has 6 questions instead of 5.
 */
ClickLearn.define([
  {
    id: "CH0103.p1.match-terms", stage: "STG011", chapter: "CH0103", page: 1, heading: "What Is a Pointer?",
    kind: "assign", title: "Match each idea to what it means",
    question: "Sort each idea into what it actually is.",
    buckets: [
      { id: "value", label: "A value" },
      { id: "address", label: "An address" },
      { id: "pointer", label: "A pointer" },
      { id: "deref", label: "Dereferencing" },
    ],
    items: [
      { text: "What a normal variable stores", bucket: "value", why: "int x = 10; -- x simply stores the value 10." },
      { text: "What &x gives you", bucket: "address", why: "& is the address-of operator: &x is the location where x is stored." },
      { text: "A variable that stores an address", bucket: "pointer", why: "int *p = &x; -- p is a pointer: its job is to store an address." },
      { text: "Using * to read the value at an address", bucket: "deref", why: "*p follows the address in p and gives back the value stored there." },
      { text: "10, in int x = 10;", bucket: "value", why: "10 is the value stored inside x." },
      { text: "*p, once p holds &x", bucket: "deref", why: "*p accesses the value at the address p holds -- that is dereferencing." },
    ],
    explanation: "A variable stores a value. & gets an address. A pointer stores an address. * dereferences a pointer -- it accesses the value stored at that address.",
  },
  {
    id: "CH0103.p2.trace-basics", stage: "STG011", chapter: "CH0103", page: 2, heading: "Pointer Declaration",
    kind: "tracetable", title: "Trace a pointer being used",
    code: "int x = 25;\nint *p = &x;\n\nfor (int i = 0; i < 2; i++)\n{\n    printf(\"%d\\n\", x);\n    x = *p + 5;\n}",
    question: "Each row is one pass of the loop. Fill in x's value at that moment, and what *p reads (p always points at x, so *p and x always match).",
    columns: [
      { key: "x", label: "x", kind: "var", var: "x" },
      { key: "p", label: "p (points to x)", kind: "var", var: "p" },
    ],
    fill: ["x", "p"],
    hint: "p is set to &x once and never changes, so *p always reads whatever x currently holds.",
    explanation: "p is created once from &x and never reassigned. Round 1: x is 25, so *p is 25, and x becomes *p + 5 = 30. Round 2: x is 30, so *p is 30, and x becomes 35. A pointer always reads the CURRENT value of what it points to.",
  },
  {
    id: "CH0103.p5.recap-flow", stage: "STG011", chapter: "CH0103", page: 5, heading: "Pointer Basics Recap",
    kind: "order", title: "Put the pointer basics in order",
    noRun: true,
    question: "You are given a variable and asked to read its value through a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Declare a variable",
      "Get its address using &",
      "Store the address in a pointer",
      "Access the value using *",
    ],
    distractors: ["Dereference the pointer before it is given an address"],
    explanation: "Declare the variable first, then get its address with &, store that address in a pointer, and only then dereference it with * to read the value. Dereferencing before the pointer has a valid address is exactly the mistake Common Pointer Problems (the last chapter of this stage) warns about.",
  },
]);
