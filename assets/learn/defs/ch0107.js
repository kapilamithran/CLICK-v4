/*
 * CH0107 - Pointers and Data Types (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer5.pdf. The PDF shows that a pointer has a type matching what it points to (int -> int *,
 * char -> char *, float -> float *, double -> double *), demonstrates each with an example, and ends with a
 * deeper look at why: C needs to know what kind of data is at an address, and matching types is required
 * for pointer arithmetic too.
 *
 * Activities: a sort of variable type to pointer type (page 2), a lab trying int/char/float pairs (page 3),
 * a reveal of why the type match matters (page 4), and an order of the steps to declare a matching pointer
 * (page 2).
 */
ClickLearn.define([
  {
    id: "CH0107.p2.match-types", stage: "STG011", chapter: "CH0107", page: 2, heading: "Pointers with Different Data Types",
    kind: "assign", title: "Match each variable type to its pointer type",
    question: "Sort each variable type into the pointer type that should point to it.",
    buckets: [
      { id: "int", label: "int *" },
      { id: "char", label: "char *" },
      { id: "float", label: "float *" },
      { id: "double", label: "double *" },
    ],
    items: [
      { text: "int x = 10;", bucket: "int", why: "An int variable needs an int * to point to it." },
      { text: "char ch = 'A';", bucket: "char", why: "A char variable needs a char * to point to it." },
      { text: "float marks = 85.5;", bucket: "float", why: "A float variable needs a float * to point to it." },
      { text: "double pi = 3.14;", bucket: "double", why: "A double variable needs a double * to point to it." },
    ],
    explanation: "A pointer's type always matches the type of the variable it points to: int with int *, char with char *, float with float *, double with double *.",
  },
  {
    id: "CH0107.p3.type-lab", stage: "STG011", chapter: "CH0107", page: 3, heading: "Accessing Values With Different Pointer Types",
    kind: "lab", title: "Try different matching variable/pointer pairs",
    observe: "Each pair below matches the pointer's type to the variable's type. Switch between them and see the dereferenced value read correctly.",
    controls: [
      { id: "pair", type: "select", label: "Which pair?", value: "int x = 25;\n   int *p = &x;\n   printf(\"%d\", *p);", options: [
        { v: "int x = 25;\n   int *p = &x;\n   printf(\"%d\", *p);", l: "int and int *" },
        { v: "char ch = 'A';\n   char *p = &ch;\n   printf(\"%c\", *p);", l: "char and char *" },
        { v: "float marks = 85.5;\n   float *p = &marks;\n   printf(\"%f\", *p);", l: "float and float *" },
      ] },
    ],
    code: "#include <stdio.h>\n\nint main() {\n   {{pair}}\n   return 0;\n}",
    summary: "This matched pair reads through the pointer correctly.",
    explanation: "int *, char * and float * each correctly read the value of a matching variable through *p: 25, then A, then 85.500000. The pointer's type is what lets *p make sense of the bits stored at that address.",
  },
  {
    id: "CH0107.p4.why-match", stage: "STG011", chapter: "CH0107", page: 4, heading: "Pointer Type Must Match",
    kind: "reveal", title: "Why does the pointer type matter?",
    intro: "A pointer's type is not just a label. Open each card to see why C needs it.",
    cards: [
      { label: "int matches int *", body: "int x = 50; int *p = &x; is correct because x's type (int) matches p's type (int *)." },
      { label: "char matches char *", body: "char ch = 'A'; char *p = &ch; is correct for the same reason: both are char." },
      { label: "Why it matters for reading", body: "C needs to know what kind of data is stored at an address before it can read or print it correctly through *p." },
      { label: "Why it matters for arithmetic", body: "Pointer arithmetic (used from Pointer Arithmetic onward) moves a pointer by whole elements of its type, so the type must be right for p + 1 to land on the next real element." },
    ],
    explanation: "The pointer's type tells C the type of data it points to, which is needed both to read the value correctly and to move the pointer correctly with pointer arithmetic.",
  },
  {
    id: "CH0107.p2.order-steps", stage: "STG011", chapter: "CH0107", page: 2, heading: "Pointers with Different Data Types",
    kind: "order", title: "Put the steps for declaring a matching pointer in order",
    noRun: true,
    question: "You are given a variable and asked to point at it safely. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Identify the variable's type",
      "Choose the matching pointer type",
      "Declare the pointer with that type",
      "Assign the variable's address to it",
    ],
    distractors: ["Choose any pointer type, since C converts it automatically"],
    explanation: "Identify the variable's type first, choose the pointer type that matches it, declare the pointer, then assign the address. C does not automatically convert a mismatched pointer type for you.",
  },
]);
