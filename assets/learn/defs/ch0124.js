/*
 * CH0124 - Pattern Basics & Simple Patterns (Stage 7 PATTERNS, STG013).
 *
 * Source: patterns1.pdf. The PDF defines a pattern (Rows + Columns + Repetition), solves one by observing it first (count the rows,
 * count the elements in each row, find what changes, then create the loop logic), introduces the nested loop with
 * for (row = 1; row <= n; row++) { for (column = 1; column <= row; column++) { printf("*"); } printf("\n"); }, compares the
 * increasing star pattern (1..5 stars) with the decreasing one (5..1 stars) and lists four beginner mistakes.
 *
 * Activities: order the pattern-solving flow (page 2, noRun: plain-English steps), trace the 4-row star triangle with the
 * row/column variable table (page 3), sort star counts into the increasing or the decreasing pattern (page 4), and a lab that switches
 * on the two mistakes that change the output, row < 5 and the missing newline (page 5).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0124.p2.pattern-flow", stage: "STG013", chapter: "CH0124", page: 2, heading: "Pattern Logic",
    kind: "order", title: "Solve a pattern in the right order",
    noRun: true,
    question: "You are given a star pattern to print. Put the steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Observe the pattern",
      "Count the rows",
      "Count the elements in each row",
      "Find what changes",
      "Create the loop logic",
      "Print the pattern",
    ],
    distractors: ["Start typing loops straight away"],
    explanation: "First understand the pattern, then write the code. Count the rows (5), count the elements in each row (1, 2, 3, 4, 5 stars), find what changes (one more star every row), and only then turn that into loops: one loop for the rows and another for the stars in each row.",
  },
  {
    id: "CH0124.p3.trace-triangle", stage: "STG013", chapter: "CH0124", page: 3, heading: "Basic Nested Loop Structure",
    kind: "trace", title: "The outer loop picks the row, the inner loop prints it",
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int row, column;",
      "",
      "   for (row = 1; row <= 4; row++) {",
      "      for (column = 1; column <= row; column++) {",
      "         printf(\"*\");",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "row will count the rows. column will count the stars inside the current row.",
      6: "The outer loop controls the rows. Each time it moves on, a new row starts. When row <= 4 becomes false, the pattern is finished.",
      7: "The inner loop starts again at column = 1 for every row and runs while column <= row. That is why row 1 gets 1 star, row 2 gets 2 stars, row 3 gets 3 stars and row 4 gets 4 stars.",
      8: "One star is printed. The cursor stays on the same line, so the stars sit side by side.",
      10: "The inner loop has finished this row's stars. The newline moves to the next line, then row++ starts the next row.",
    },
    explanation: "The inner loop runs completely for every step of the outer loop: 1 star, then 2, then 3, then 4. The newline after the inner loop is what turns those stars into separate rows.",
  },
  {
    id: "CH0124.p4.more-or-fewer", stage: "STG013", chapter: "CH0124", page: 4, heading: "Increasing & Decreasing Star Patterns",
    kind: "assign", title: "Increasing or decreasing?",
    question: "Both patterns have 5 rows, but the number of stars in each row changes in a different way. Sort each line into the pattern it describes.",
    buckets: [
      { id: "inc", label: "Increasing pattern" },
      { id: "dec", label: "Decreasing pattern" },
    ],
    items: [
      { text: "Row 1 prints 1 star", bucket: "inc", why: "The increasing pattern starts small: row 1 has 1 star, then 2, 3, 4, 5." },
      { text: "Row 1 prints 5 stars", bucket: "dec", why: "The decreasing pattern starts big: row 1 has 5 stars, then 4, 3, 2, 1." },
      { text: "Row 2 prints 2 stars", bucket: "inc", why: "In the increasing pattern row 2 has 2 stars: one more than row 1." },
      { text: "Row 2 prints 4 stars", bucket: "dec", why: "In the decreasing pattern row 2 has 4 stars: one fewer than row 1." },
      { text: "Row 5 prints 5 stars", bucket: "inc", why: "The last row of the increasing pattern is the widest: 5 stars." },
      { text: "Row 5 prints 1 star", bucket: "dec", why: "The last row of the decreasing pattern is the narrowest: 1 star." },
      { text: "More elements in each row", bucket: "inc", why: "Increasing means more elements each row." },
      { text: "Fewer elements in each row", bucket: "dec", why: "Decreasing means fewer elements each row." },
    ],
    explanation: "Increasing: 1, 2, 3, 4, 5 stars (more each row). Decreasing: 5, 4, 3, 2, 1 stars (fewer each row). In both, the outer loop controls the row and the inner loop decides how many stars are printed in that row.",
  },
  {
    id: "CH0124.p5.mistake-lab", stage: "STG013", chapter: "CH0124", page: 5, heading: "Common Beginner Mistakes",
    kind: "lab", title: "Break the pattern on purpose",
    observe: "This program prints a 5-row star triangle. Switch on each mistake and compare the output with the correct pattern.",
    controls: [
      { id: "limit", type: "toggle", label: "Write row < 5 in the outer loop (instead of row <= 5)", on: "row < 5", off: "row <= 5", checked: false },
      { id: "newline", type: "toggle", label: "Remove the printf(\"\\n\") line", on: "", off: "      printf(\"\\n\");\n", checked: false },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int row, column;",
      "",
      "   for (row = 1; {{limit}}; row++) {",
      "      for (column = 1; column <= row; column++) {",
      "         printf(\"*\");",
      "      }",
      "{{newline}}   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "The outer loop condition is `{{limit}}`. The correct pattern has 5 rows with 1, 2, 3, 4 and 5 stars.",
    explanation: "row < 5 stops after row 4, so the pattern has only 4 rows. Without the newline nothing moves to the next line, so all the stars run together in one long line (1 + 2 + 3 + 4 + 5 = 15 stars). When a pattern looks wrong, check: the loop limits, the loop nesting, the inner-loop condition, the newline position, and where the printf() is placed.",
  },
]);
