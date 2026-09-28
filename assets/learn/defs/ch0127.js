/*
 * CH0127 - Hollow Patterns & Conditions (Stage 7, STG013).
 *
 * Source: patterns4.pdf. The PDF teaches the hollow square (stars only on the border: first row, last row, first column,
 * last column), its border condition if (row == 1 || row == n || column == 1 || column == n) inside two nested loops
 * ("loops decide where to go, conditions decide what to print"), the hollow triangle (a position gets * when it is the first
 * column, the last position of its row, or the last row; otherwise a space) and the X pattern (row == column for the main
 * diagonal, row + column == n + 1 for the opposite one, joined with ||).
 *
 * Activities: tap-to-explain cards for the four border positions and the inside (page 1), a hollow-square lab with a switch for
 * each of the four border checks (page 2), a hollow-triangle lab with a switch for the last-row check (page 3) and an X-pattern
 * lab with a switch for each diagonal (page 4). Page 5 (Pattern Conditions) is covered by the graded questions.
 *
 * Hollow triangle code: the PDF only gives the boundary rule in words. The code here is that rule turned into code, for
 * row 1..n and column 1..row: if (column == 1 || column == row || row == n) print *, otherwise print a space.
 *
 * A switched-off check is replaced by 1 == 0, a comparison that is never true, so every combination of the switches is still
 * a valid program. Every activity whose output has meaningful spaces sets `spaces: true` ("Show spaces as ·" switch).
 */
ClickLearn.define([
  {
    id: "CH0127.p1.border-positions", stage: "STG013", chapter: "CH0127", page: 1, heading: "Understanding Hollow Patterns",
    kind: "reveal", title: "Which positions are on the border?",
    intro: "A hollow square with 5 rows and 5 columns is a grid of positions. Every position has a row number and a column number. A position is on the border when it fits one of four rules. Open each card.",
    cards: [
      { label: "First row: row == 1", body: "Every position in row 1 is on the border, whatever its column: (1, 1), (1, 2), (1, 3) and so on. So the whole top line prints stars." },
      { label: "Last row: row == n", body: "The last row is row n, which is row 5 when n = 5. Every position in it is on the border too, so the bottom line is all stars." },
      { label: "First column: column == 1", body: "Column 1 is the left edge. In the rows between the top and the bottom, only the very first position has column 1, so each of those lines starts with a star." },
      { label: "Last column: column == n", body: "Column n is the right edge, which is column 5 when n = 5. The last position of each middle row is on the border, so each of those lines ends with a star." },
      { label: "Everything else: the inside", body: "A position such as row 2, column 3 is in none of the four places, so it is on the inside and prints a space. A star is printed only when the position belongs to the border." },
    ],
    explanation: "A position is on the border when row == 1, row == n, column == 1 or column == n. Every other position is inside and prints a space. A hollow pattern is not about printing fewer characters at random: it is about finding which positions belong to the boundary.",
  },
  {
    id: "CH0127.p2.border-lab", stage: "STG013", chapter: "CH0127", page: 2, heading: "Border Conditions",
    kind: "lab", title: "Which check draws which edge?", spaces: true,
    observe: "The loops always visit every position. Switch a border check off (it becomes `1 == 0`, which is never true) and see which edge disappears.",
    controls: [
      { id: "n", type: "select", label: "Size (n)", value: "5", options: [{ v: "3", l: "n = 3" }, { v: "4", l: "n = 4" }, { v: "5", l: "n = 5" }, { v: "6", l: "n = 6" }] },
      { id: "top", type: "toggle", label: "Top row check: row == 1", on: "row == 1", off: "1 == 0", checked: true },
      { id: "bottom", type: "toggle", label: "Bottom row check: row == n", on: "row == n", off: "1 == 0", checked: true },
      { id: "left", type: "toggle", label: "Left column check: column == 1", on: "column == 1", off: "1 == 0", checked: true },
      { id: "right", type: "toggle", label: "Right column check: column == n", on: "column == n", off: "1 == 0", checked: true },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "",
      "   for (int row = 1; row <= n; row++) {",
      "      for (int column = 1; column <= n; column++) {",
      "         if ({{top}} || {{bottom}} ||",
      "             {{left}} || {{right}}) {",
      "            printf(\"*\");",
      "         }",
      "         else {",
      "            printf(\" \");",
      "         }",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "The two loops visit every position in the same order each time. Only the condition decides whether a position prints a star or a space.",
    explanation: "Each check owns one edge: row == 1 the top, row == n the bottom, column == 1 the left and column == n the right. Switch one off and its edge turns into spaces, except where another check still matches (the corners). Loops decide where to go; the condition decides what to print.",
  },
  {
    id: "CH0127.p3.hollow-triangle-lab", stage: "STG013", chapter: "CH0127", page: 3, heading: "Hollow Triangle",
    kind: "lab", title: "A hollow triangle needs a base", spaces: true,
    observe: "In each row the inner loop stops at the row number, so the last position of a row is column == row. Switch the last-row check off and look at the bottom of the triangle.",
    controls: [
      { id: "n", type: "select", label: "Rows (n)", value: "5", options: [{ v: "3", l: "3 rows" }, { v: "4", l: "4 rows" }, { v: "5", l: "5 rows" }, { v: "6", l: "6 rows" }] },
      { id: "base", type: "toggle", label: "Last-row check: row == n", on: " || row == n", off: "", checked: true },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "",
      "   for (int row = 1; row <= n; row++) {",
      "      for (int column = 1; column <= row; column++) {",
      "         if (column == 1 || column == row{{base}}) {",
      "            printf(\"*\");",
      "         }",
      "         else {",
      "            printf(\" \");",
      "         }",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "A star goes on the first column and on the last position of each row. Only the last-row check fills the bottom line and gives the triangle a base.",
    explanation: "The boundary rule has three parts: the first column (column == 1), the last position of the row (column == row) and the last row (row == n). Without the last-row part, the bottom row keeps only its two ends and the triangle has no base. Different shapes use the same tools: nested loops, row and column positions, and a condition.",
  },
  {
    id: "CH0127.p4.x-pattern-lab", stage: "STG013", chapter: "CH0127", page: 4, heading: "X Pattern",
    kind: "lab", title: "Two diagonals make an X", spaces: true,
    observe: "Start with only the main diagonal on: you get half of an X. Then switch on the opposite diagonal too. A switched-off check becomes `1 == 0`, which is never true.",
    controls: [
      { id: "n", type: "select", label: "Size (n)", value: "5", options: [{ v: "3", l: "n = 3" }, { v: "5", l: "n = 5" }, { v: "7", l: "n = 7" }] },
      { id: "diag1", type: "toggle", label: "Main diagonal: row == column", on: "row == column", off: "1 == 0", checked: true },
      { id: "diag2", type: "toggle", label: "Opposite diagonal: row + column == n + 1", on: "row + column == n + 1", off: "1 == 0", checked: false },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}};",
      "",
      "   for (int row = 1; row <= n; row++) {",
      "      for (int column = 1; column <= n; column++) {",
      "         if ({{diag1}} ||",
      "             {{diag2}}) {",
      "            printf(\"*\");",
      "         }",
      "         else {",
      "            printf(\" \");",
      "         }",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "The program does not know it is drawing an X. It only checks every position: is it on the first diagonal, or on the second? With one check you get half of the X, with both you get the whole X.",
    explanation: "row == column is true down the main diagonal, from top-left to bottom-right. row + column == n + 1 is true down the opposite diagonal, from top-right to bottom-left. Joined with ||, a position prints a star when it is on either diagonal, and that is the X.",
  },
]);
