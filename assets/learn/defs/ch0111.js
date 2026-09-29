/*
 * CH0111 - Pointers and Strings (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer9.pdf. The PDF points a char pointer at a string's first character, reads and moves
 * through it with *p and p++, reaches any position with *(p + i), and combines *p, p++ and a while
 * (*p != '\0') loop to print a whole string.
 *
 * Activities: a fill-in trace of *p moving through a string (page 2), a sort of *(p + i) expressions to the
 * character they reach (page 3), a lab trying a different string (page 4), and an order of the check/print/
 * move/repeat cycle (page 5).
 */
ClickLearn.define([
  {
    id: "CH0111.p2.trace-string", stage: "STG011", chapter: "CH0111", page: 2, heading: "Accessing String Characters",
    kind: "tracetable", title: "Trace a pointer reading a string",
    code: "char str[] = \"HELLO\";\nchar *p = str;\n\nfor (int i = 0; i < 3; i++)\n{\n    printf(\"%c\\n\", *p);\n    p++;\n}",
    question: "Each row is one pass of the loop. Fill in what *p reads at that moment.",
    columns: [
      { key: "p", label: "*p", kind: "var", var: "p" },
    ],
    fill: ["p"],
    hint: "p starts at the string's first character and moves one character forward after each print.",
    explanation: "p starts at 'H'. Round 1 reads H, then p++ moves to 'E'. Round 2 reads E, then p++ moves to 'L'. Round 3 reads L. Moving through a string one character at a time works exactly like moving through an array one element at a time.",
  },
  {
    id: "CH0111.p3.match-chars", stage: "STG011", chapter: "CH0111", page: 3, heading: "Using *(p+i) With Strings",
    kind: "assign", title: "Match each expression to the character it reaches",
    question: "Sort each expression into the character it accesses in \"HELLO\".",
    buckets: [
      { id: "0", label: "H (position 0)" },
      { id: "1", label: "E (position 1)" },
      { id: "2", label: "L (position 2)" },
      { id: "4", label: "O (position 4)" },
    ],
    items: [
      { text: "*(p + 0)", bucket: "0", why: "Position 0 is the first character, H." },
      { text: "*p", bucket: "0", why: "*p with no offset is the same as *(p + 0)." },
      { text: "*(p + 1)", bucket: "1", why: "Position 1 is the second character, E." },
      { text: "*(p + 2)", bucket: "2", why: "Position 2 is the third character, L." },
      { text: "*(p + 4)", bucket: "4", why: "Position 4 is the fifth character, O." },
    ],
    explanation: "*(p + i) reaches the character at position i, counting from 0: *(p + 0) is H, *(p + 1) is E, *(p + 2) is L, and *(p + 4) is O.",
  },
  {
    id: "CH0111.p4.string-lab", stage: "STG011", chapter: "CH0111", page: 4, heading: "Traversing a String Using a Pointer",
    kind: "lab", title: "Try traversing different strings",
    observe: "The loop always checks, prints, and moves until it reaches '\\0'. Try it with a different string.",
    controls: [
      { id: "str", type: "select", label: "String", value: "HELLO", options: [{ v: "HELLO", l: "\"HELLO\"" }, { v: "CODE", l: "\"CODE\"" }, { v: "HI", l: "\"HI\"" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   char str[] = \"{{str}}\";",
      "   char *p = str;",
      "",
      "   while (*p != '\\0') {",
      "      printf(\"%c\", *p);",
      "      p++;",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "\"{{str}}\" is printed back out:",
    explanation: "The same while (*p != '\\0') loop prints any string, however many characters it has, because it stops the moment it reaches the string's own end marker rather than counting a fixed number of characters.",
  },
  {
    id: "CH0111.p5.order-steps", stage: "STG011", chapter: "CH0111", page: 5, heading: "Pointers and Strings Recap",
    kind: "order", title: "Put the traversal steps in order",
    noRun: true,
    question: "You are given a string and asked to print it character by character using a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Check whether *p is '\\0'",
      "If not, print *p",
      "Move the pointer forward with p++",
      "Repeat from the check",
    ],
    distractors: ["Move the pointer forward before checking for '\\0'"],
    explanation: "Check first, then print, then move, then repeat. Checking after moving forward could step past the end of the string before ever noticing it reached '\\0'.",
  },
]);
