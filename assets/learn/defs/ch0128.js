/*
 * CH0128 - Combining Patterns & Problem Solving (Stage 7, STG013).
 *
 * Source: patterns5.pdf. The PDF shows that a complex pattern is a combination of simple ones (an increasing part plus a
 * decreasing part), builds the diamond from an upper pyramid and a lower inverted pyramid, splits a number pyramid into
 * three questions (spaces = n - i, how many numbers = 2 * i - 1, which numbers), gives the seven steps for analysing any
 * pattern, and ends with the general problem-solving framework.
 *
 * Activities: a lab that switches the two halves of a combined star pattern on and off (page 1), a step-by-step trace of a
 * small diamond (page 2), a lab that changes n in the number pyramid (page 3) and an ordering of the seven analysis steps
 * (page 4). Page 5 (the framework) has no activity of its own; its questions are folded into the page-4 explanation.
 *
 * The diamond and the number pyramid print meaningful spaces, so those two activities set `spaces: true` (the output gets a
 * "Show spaces as ·" switch). The combined star pattern has no spaces, so its lab does not.
 * Trace size: the diamond with n = 3 runs in 97 steps (the limit is 399).
 */
ClickLearn.define([
  {
    id: "CH0128.p1.combine-lab", stage: "STG013", chapter: "CH0128", page: 1, heading: "Combining Patterns",
    kind: "lab", title: "Two simple patterns make one",
    observe: "This shape is made of two small loops. Switch each part off and on, and see which loop draws which rows.",
    controls: [
      { id: "up", type: "toggle", label: "Include the increasing part", checked: true,
        on: "   // Part 1: increasing (1 to 4 stars)\n   for (i = 1; i <= 4; i++) {\n      for (j = 1; j <= i; j++) {\n         printf(\"*\");\n      }\n      printf(\"\\n\");\n   }\n\n",
        off: "" },
      { id: "down", type: "toggle", label: "Include the decreasing part", checked: true,
        on: "   // Part 2: decreasing (3 to 1 stars)\n   for (i = 3; i >= 1; i--) {\n      for (j = 1; j <= i; j++) {\n         printf(\"*\");\n      }\n      printf(\"\\n\");\n   }\n\n",
        off: "" },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int i, j;",
      "",
      "{{up}}{{down}}   return 0;",
      "}",
    ].join("\n"),
    summary: "Simple pattern + simple pattern = complex pattern.",
    explanation: "The combined pattern needs no new logic. The increasing part grows from 1 to 4 stars. The decreasing part shrinks from 3 to 1 stars. The first shape ends after the row of 4 stars, and the second begins with 3 stars, one fewer, so the widest row is not printed twice. With both parts off the program prints nothing.",
  },
  {
    id: "CH0128.p2.diamond-trace", stage: "STG013", chapter: "CH0128", page: 2, heading: "Diamond Pattern",
    kind: "trace", title: "Draw the diamond, row by row",
    spaces: true,
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
      "      for (int j = 1; j <= 2 * i - 1; j++) {",
      "         printf(\"*\");",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "",
      "   for (int i = n - 1; i >= 1; i--) {",
      "      for (int j = 1; j <= n - i; j++) {",
      "         printf(\" \");",
      "      }",
      "      for (int j = 1; j <= 2 * i - 1; j++) {",
      "         printf(\"*\");",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "n is the number of rows in the upper half. With n = 3 the widest row has 2 * 3 - 1 = 5 stars.",
      6: "The upper half. i is the current row and counts UP from 1 to n, so every row is wider than the one before.",
      7: "The first inner loop prints n - i spaces. In the upper half i grows, so there are fewer spaces in every row.",
      10: "The second inner loop prints 2 * i - 1 stars: 1, 3, 5. Odd numbers, growing by 2 each row.",
      16: "The lower half. It starts at n - 1, because the widest row (i = n) was already printed by the upper half. Now i counts DOWN to 1.",
      17: "The same spaces loop, but i is now getting smaller, so n - i gets bigger: the spaces increase.",
      20: "The same stars loop. 2 * i - 1 gets smaller as i counts down, so the rows get narrower: 3, 1.",
    },
    explanation: "A diamond is two loops, one after the other. The first counts i up (1, 2, 3) and prints the upper pyramid: 1, 3, 5 stars. The second counts i down from n - 1 (2, 1) and prints the lower inverted pyramid: 3, 1 stars. The widest row belongs to the upper half only, so it is not printed twice. Watch the value of i in the table count up and then down, and use the dots to see the spaces that push each row into place.",
  },
  {
    id: "CH0128.p3.number-pyramid-lab", stage: "STG013", chapter: "CH0128", page: 3, heading: "Number Pyramid Patterns",
    kind: "lab", title: "Build a number pyramid",
    spaces: true,
    observe: "Change n, the number of rows, and see the pyramid change. In each row, look at the spaces first, then at how many numbers there are, then at which numbers they are.",
    controls: [
      { id: "n", type: "select", label: "Number of rows (n)", value: "4", options: [{ v: "3", l: "n = 3" }, { v: "4", l: "n = 4" }, { v: "5", l: "n = 5" }] },
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
      "      for (int j = 1; j <= 2 * i - 1; j++) {",
      "         printf(\"%d\", j);",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "Every row answers three separate questions. How many spaces? n - i. How many numbers? 2 * i - 1. Which numbers? j, counting from 1.",
    explanation: "Take n = 4 and row i = 3. The spaces are n - i = 1. The count of numbers is 2 * i - 1 = 5. The numbers themselves are j = 1, 2, 3, 4, 5, so the row is one space and 12345. Across the rows the spaces go 3, 2, 1, 0 and the count of numbers goes 1, 3, 5, 7. Answer the three questions one at a time, and the nested loops become easy to design.",
  },
  {
    id: "CH0128.p4.analysis-steps", stage: "STG013", chapter: "CH0128", page: 4, heading: "How to Analyze Any Pattern",
    kind: "order", noRun: true, title: "Analyze first, code second",
    question: "Before any loop is written, the pattern is analyzed. Arrange the steps in the order you follow them. Not every card belongs.",
    lines: [
      "Count the rows",
      "Analyze each row",
      "Count spaces",
      "Count symbols or numbers",
      "Identify what changes",
      "Find the formula or rule",
      "Convert the logic into loops",
    ],
    distractors: ["Start typing loops immediately", "Memorize the code of a similar pattern"],
    explanation: "Count the rows first: this usually becomes the outer loop. Then analyze each row: how many spaces, and how many stars or numbers? Count the spaces, count the symbols or numbers (1, 3, 5, 7), and identify what changes from row to row. Turn that into a formula or rule, such as spaces = n - i and stars = 2 * i - 1. Only then convert it into loops: the outer loop, print the spaces, print the symbols or numbers, and move to the next line.\nStarting to type loops straight away is where the trouble begins, and memorizing the code of one pattern will not help with the next. Instead, learn to ask: how many rows are there, what changes from row to row, how many spaces and how many characters are needed, what is printed at each position, is a condition controlling the output (for example i == 1 || i == n for a hollow shape), and can the pattern be divided into smaller patterns?",
  },
]);
