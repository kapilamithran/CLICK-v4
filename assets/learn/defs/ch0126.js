/*
 * CH0126 - Spaces, Alignment & Pyramids (Stage 7, STG013).
 *
 * Source: patterns3.pdf. The PDF teaches that a space is a character (spaces -> position -> shape), the right-aligned triangle
 * (a space loop for n - i spaces, then a star loop for i stars, then a newline) with its table for n = 5, the row-by-row logic
 * (spaces decrease by 1, stars increase by 1), the full pyramid (n - i spaces, 2 * i - 1 stars) and the two formula sets.
 *
 * Activities: a lab that switches the space loop on and off (page 1), a step-by-step trace of a 3-row right-aligned triangle
 * (page 2), a match of each row of the n = 5 table to its spaces and stars (page 3) and a full-pyramid lab with a choice of rows
 * and a stars formula (page 4). Page 5 (Pyramid Formulas) is covered by the graded questions.
 *
 * Every activity whose output has meaningful spaces sets `spaces: true`, which adds the "Show spaces as ·" switch to its output.
 */
ClickLearn.define([
  {
    id: "CH0126.p1.spaces-lab", stage: "STG013", chapter: "CH0126", page: 1, heading: "Why Do Spaces Matter?",
    kind: "lab", title: "Same stars, different spaces", spaces: true,
    observe: "This program prints a triangle of stars. Switch on the space loop and watch where the stars go. The dots show every space.",
    controls: [
      { id: "spaces", type: "toggle", label: "Print spaces before the stars", on: "      for (int j = 1; j <= n - i; j++) {\n         printf(\" \");\n      }\n", off: "", checked: false },
      { id: "n", type: "select", label: "Rows (n)", value: "5", options: [{ v: "3", l: "3 rows" }, { v: "4", l: "4 rows" }, { v: "5", l: "5 rows" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "",
      "   for (int i = 1; i <= n; i++) {",
      "{{spaces}}      for (int j = 1; j <= i; j++) {",
      "         printf(\"*\");",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "Every row has the same number of stars in both versions. Only the spaces printed before them decide whether the triangle hugs the left edge or leans to the right.",
    explanation: "With no spaces, every row starts at the left edge: a left-aligned triangle. With the space loop on, row i first prints n - i spaces, so the stars are pushed to the right. A space is a character just like a star, so it takes up room. Spaces are not empty: they are part of the pattern.",
  },
  {
    id: "CH0126.p2.trace-right-aligned", stage: "STG013", chapter: "CH0126", page: 2, heading: "Right-Aligned Triangle",
    kind: "trace", title: "Spaces first, then stars", spaces: true,
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = 3;",
      "",
      "   for (int i = 1; i <= n; i++) {",
      "      for (int j = 1; j <= n - i; j++) {",
      "         printf(\" \");",
      "      }",
      "      for (int j = 1; j <= i; j++) {",
      "         printf(\"*\");",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "n = 3 means the triangle has 3 rows.",
      6: "The outer loop picks the row. i is the row number: 1, then 2, then 3.",
      7: "The space loop repeats n - i times. In row 1 that is 3 - 1 = 2 spaces. In row 3 it is 3 - 3 = 0, so the check fails at once and no space is printed.",
      8: "One space is printed. Keep the dots switched on to see it. The stars printed next start after these spaces.",
      10: "The star loop repeats i times, so row i gets i stars.",
      11: "One star is printed.",
      13: "The newline ends this row, so the next row starts on a new line.",
    },
    explanation: "Each row prints n - i spaces first, then i stars, then a newline. The spaces shrink (2, 1, 0) while the stars grow (1, 2, 3), so the stars line up against the right edge.",
  },
  {
    id: "CH0126.p3.space-star-table", stage: "STG013", chapter: "CH0126", page: 3, heading: "Space + Star Logic",
    kind: "assign", title: "Row by row: spaces and stars",
    question: "A right-aligned triangle has n = 5 rows. In row i, Spaces = n - i and Stars = i. Match each row to what it prints.",
    buckets: [
      { id: "r1", label: "4 spaces + 1 star" },
      { id: "r2", label: "3 spaces + 2 stars" },
      { id: "r3", label: "2 spaces + 3 stars" },
      { id: "r4", label: "1 space + 4 stars" },
      { id: "r5", label: "0 spaces + 5 stars" },
    ],
    items: [
      { text: "Row 1 (i = 1)", bucket: "r1", why: "Spaces = n - i = 5 - 1 = 4 and Stars = i = 1, so row 1 is 4 spaces + 1 star." },
      { text: "Row 2 (i = 2)", bucket: "r2", why: "Spaces = 5 - 2 = 3 and Stars = 2, so row 2 is 3 spaces + 2 stars." },
      { text: "Row 3 (i = 3)", bucket: "r3", why: "Spaces = 5 - 3 = 2 and Stars = 3, so row 3 is 2 spaces + 3 stars." },
      { text: "Row 4 (i = 4)", bucket: "r4", why: "Spaces = 5 - 4 = 1 and Stars = 4, so row 4 is 1 space + 4 stars." },
      { text: "Row 5 (i = 5)", bucket: "r5", why: "Spaces = 5 - 5 = 0 and Stars = 5, so the last row has no spaces at all: 0 spaces + 5 stars." },
    ],
    explanation: "For every next row the spaces decrease by 1 and the stars increase by 1. Spaces control position; stars control size.",
  },
  {
    id: "CH0126.p4.pyramid-lab", stage: "STG013", chapter: "CH0126", page: 4, heading: "Full Pyramid",
    kind: "lab", title: "Build a full pyramid", spaces: true,
    observe: "Choose the number of rows and look at each row: count the spaces (dots) and the stars. Then change the star count to i and compare.",
    controls: [
      { id: "n", type: "select", label: "Rows (n)", value: "5", options: [{ v: "3", l: "3 rows" }, { v: "4", l: "4 rows" }, { v: "5", l: "5 rows" }, { v: "6", l: "6 rows" }] },
      { id: "stars", type: "select", label: "Stars in row i", value: "2 * i - 1", options: [{ v: "2 * i - 1", l: "2 * i - 1 (pyramid)" }, { v: "i", l: "i (right triangle)" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "",
      "   for (int i = 1; i <= n; i++) {",
      "      for (int j = 1; j <= n - i; j++) {",
      "         printf(\" \");",
      "      }",
      "      for (int j = 1; j <= {{stars}}; j++) {",
      "         printf(\"*\");",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "The spaces fall by 1 in every row while the stars rise by 2, so the tip stays in the middle. With i stars per row, the same spaces give a right-aligned triangle instead.",
    explanation: "Each row prints n - i spaces and then 2 * i - 1 stars: 1, 3, 5, 7 ... The number of stars is not simply the row number. Two more stars per row means one extra star on each side, which keeps the shape centred.",
  },
]);
