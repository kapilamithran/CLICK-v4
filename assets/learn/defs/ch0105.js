/*
 * CH0105 - Address Operator & (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer3.pdf. The PDF defines & as "address of", uses it to initialize a pointer (ptr = &num;),
 * and shows its most important use with scanf() -- scanf("%d", &age); -- because scanf needs to know
 * where to store what the user types.
 *
 * Activities: a fill-in trace of num and ptr once & connects them (page 3) and a sort of statements by why
 * & is needed there (page 4). Only 2 activities, because this chapter's own quiz has 7 questions.
 */
ClickLearn.define([
  {
    id: "CH0105.p3.trace-address", stage: "STG011", chapter: "CH0105", page: 3, heading: "& with Pointers",
    kind: "tracetable", title: "Trace & connecting a variable to a pointer",
    code: "int num = 50;\nint *ptr = &num;\n\nfor (int i = 0; i < 2; i++)\n{\n    printf(\"%d\\n\", *ptr);\n    num = num + 10;\n}",
    question: "Each row is one pass of the loop. Fill in num's value at that moment, and what *ptr reads (ptr always points at num).",
    columns: [
      { key: "n", label: "num", kind: "var", var: "num" },
      { key: "p", label: "ptr (points to num)", kind: "var", var: "ptr" },
    ],
    fill: ["n", "p"],
    hint: "ptr was set from &num once and never changes, so *ptr always reads num's current value.",
    explanation: "ptr = &num; runs once, at the start. Round 1: num is 50, so *ptr is 50; then num becomes 60. Round 2: num is 60, so *ptr is 60. & connected ptr to num permanently -- ptr never needs to be re-pointed for *ptr to see num's latest value.",
  },
  {
    id: "CH0105.p4.match-scanf", stage: "STG011", chapter: "CH0105", page: 4, heading: "& in scanf()",
    kind: "assign", title: "Match each use of & to its purpose",
    question: "Sort each statement into why & is used there.",
    buckets: [
      { id: "scanf", label: "Give scanf() somewhere to write" },
      { id: "init", label: "Initialize a pointer" },
    ],
    items: [
      { text: "scanf(\"%d\", &age);", bucket: "scanf", why: "scanf() needs age's address so it knows where to store the number the user types." },
      { text: "int *p = &x;", bucket: "init", why: "This gives the pointer p a valid address to store, right where it is declared." },
      { text: "scanf(\"%c\", &grade);", bucket: "scanf", why: "Same reason: scanf() needs an address to write the character into." },
      { text: "ptr = &num;", bucket: "init", why: "This stores num's address in the pointer ptr." },
    ],
    explanation: "& always gives an address, but it is used for two different reasons: to tell scanf() where to store input, and to give a pointer a valid address to hold.",
  },
]);
