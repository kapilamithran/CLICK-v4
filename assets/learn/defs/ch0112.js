/*
 * CH0112 - Pointers with Functions (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer10.pdf. The PDF contrasts call by value (a function gets a copy, so changes don't reach
 * the caller) with passing an address (change(&x); received as void change(int *p) { *p = 50; }), which
 * lets a function reach and change the caller's own variable, and extends this to modifying two variables
 * at once with two pointer parameters.
 *
 * Activities: a fill-in trace of x and p across a function call (page 3), a sort of statements into send/
 * receive/access/change (page 4), a lab modifying two variables through pointers (page 4), and an order of
 * the same four steps (page 1).
 */
ClickLearn.define([
  {
    id: "CH0112.p3.trace-call", stage: "STG011", chapter: "CH0112", page: 3, heading: "Changing a Variable Inside a Function",
    kind: "trace", title: "Trace a function changing the caller's variable",
    code: "#include <stdio.h>\n\nvoid change(int *p)\n{\n    *p = 100;\n}\n\nint main() {\n   int x = 10;\n\n   printf(\"%d\\n\", x);\n   change(&x);\n   printf(\"%d\\n\", x);\n\n   return 0;\n}",
    notes: {
      5: "*p = 100; writes 100 at the address p holds. p was given &x, x's own address, so this changes x itself.",
      11: "x is still 10 here: the call on the next line has not happened yet.",
      12: "change(&x) sends x's address. Inside the function, p now points at this very x.",
      13: "x is now 100: the function changed the caller's original variable through the pointer, not a copy.",
    },
    explanation: "change(&x) sends x's address into the function. Because the function's parameter is a pointer, *p = 100; reaches and changes the caller's own x -- so the second printf shows 100, not 10.",
  },
  {
    id: "CH0112.p2.match-roles", stage: "STG011", chapter: "CH0112", page: 2, heading: "Passing an Address to a Function",
    kind: "assign", title: "Match each line to what it does",
    question: "Sort each line into the step of passing an address it belongs to.",
    buckets: [
      { id: "send", label: "SEND the address" },
      { id: "receive", label: "RECEIVE the address" },
      { id: "access", label: "ACCESS the value" },
      { id: "change", label: "CHANGE the value" },
    ],
    items: [
      { text: "change(&x);", bucket: "send", why: "&x sends x's address into the function call." },
      { text: "void change(int *p)", bucket: "receive", why: "The pointer parameter p receives the address that was sent." },
      { text: "printf(\"%d\", *p);", bucket: "access", why: "*p reads the value at the address p holds." },
      { text: "*p = 100;", bucket: "change", why: "Assigning through *p changes the value at that address -- the caller's original variable." },
    ],
    explanation: "SEND the address with &x, RECEIVE it with a pointer parameter, ACCESS the value with *p, and CHANGE it with *p = value -- which changes the caller's own variable, not a copy.",
  },
  {
    id: "CH0112.p4.swap-lab", stage: "STG011", chapter: "CH0112", page: 4, heading: "Using Pointers to Modify Two Variables",
    kind: "lab", title: "Try changing two variables through pointers",
    observe: "add() receives the addresses of both x and y, and adds 10 to each through its pointer parameters.",
    controls: [
      { id: "n", type: "select", label: "Add to each", value: "10", options: [{ v: "10", l: "10" }, { v: "1", l: "1" }, { v: "0", l: "0" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void add(int *a, int *b) {",
      "   *a = *a + {{n}};",
      "   *b = *b + {{n}};",
      "}",
      "",
      "int main() {",
      "   int x = 5;",
      "   int y = 10;",
      "",
      "   add(&x, &y);",
      "",
      "   printf(\"%d %d\", x, y);",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "Adding {{n}} to each: x and y become",
    explanation: "add(&x, &y) sends both addresses in one call. Inside, *a and *b reach x and y directly, so *a = *a + n; and *b = *b + n; change both of the caller's variables in a single function call.",
  },
  {
    id: "CH0112.p1.order-steps", stage: "STG011", chapter: "CH0112", page: 1, heading: "Why Use Pointers with Functions?",
    kind: "order", title: "Put the pointer-and-function steps in order",
    noRun: true,
    question: "You are given a variable and asked to let a function change it. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Send the address with &x",
      "Receive it with a pointer parameter",
      "Access the value with *p",
      "Change the original with *p = value",
    ],
    distractors: ["Pass x itself, without &, and expect the function to change it"],
    explanation: "Send the address, receive it as a pointer parameter, access it with *p, and change the original with *p = value. Passing x by value (without &) only gives the function a copy, so changing it inside the function never reaches the caller's original.",
  },
]);
