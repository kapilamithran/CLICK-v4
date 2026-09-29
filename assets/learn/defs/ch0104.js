/*
 * CH0104 - Declaring & Initializing Pointers (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer2.pdf. The PDF gives the declaration syntax (data_type *pointer_name;), shows the
 * declare-get-store-dereference flow, explains & and *, lists three ways to give a pointer an address
 * (during declaration, later, or NULL), and stresses that a pointer's type must match what it points to.
 *
 * Activities: a sort of the three initialization methods (page 4) and an order of the declare/get/store/
 * dereference flow (page 2). Only 2 activities, because this chapter's own quiz has 7 questions.
 */
ClickLearn.define([
  {
    id: "CH0104.p4.sort-methods", stage: "STG011", chapter: "CH0104", page: 4, heading: "Different Ways to Initialize",
    kind: "assign", title: "Sort the ways to give a pointer an address",
    question: "Sort each statement into how it gives a pointer its address.",
    buckets: [
      { id: "during", label: "Initialize during declaration" },
      { id: "later", label: "Declare first, initialize later" },
      { id: "null", label: "Initialize with NULL" },
    ],
    items: [
      { text: "int x = 20; int *p = &x;", bucket: "during", why: "The pointer gets its address on the very same line it is declared." },
      { text: "int *p; p = &x;", bucket: "later", why: "p is declared first, with no address yet, and only given one on a later line." },
      { text: "int *p = NULL;", bucket: "null", why: "NULL deliberately gives the pointer no valid object to point to." },
      { text: "float f = 5.5; float *p = &f;", bucket: "during", why: "Again, the address is given right where the pointer is declared." },
      { text: "A pointer that intentionally points to nothing yet", bucket: "null", why: "That is exactly what NULL means." },
    ],
    explanation: "A pointer can be initialized right in its declaration, declared first and initialized on a later line, or set to NULL to intentionally point to no valid object. All three are valid C, but a NULL pointer must never be dereferenced.",
  },
  {
    id: "CH0104.p2.order-steps", stage: "STG011", chapter: "CH0104", page: 2, heading: "Initializing a Pointer",
    kind: "order", title: "Put the initialization steps in order",
    noRun: true,
    question: "You are given a variable and asked to read its value through a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Declare the variable",
      "Get its address using &",
      "Store the address in the pointer",
      "Dereference the pointer",
    ],
    distractors: ["Dereference the pointer before storing an address in it"],
    explanation: "Declare, get the address, store the address, dereference -- in that order. Dereferencing first would mean reading through a pointer that has no valid address yet, which is undefined behavior.",
  },
]);
