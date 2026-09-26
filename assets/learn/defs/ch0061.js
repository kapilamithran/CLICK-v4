/*
 * CH0061 - nested loops (Stage 6).
 *
 * Page 1 has rows and columns sliders (the same loops printing stars and printing i and j), page 2 steps through the
 * 2 x 3 example, and page 5 replaces the instant spoiler with a real challenge (the worked solution stays hidden
 * until the student has tried, or asks for it).
 */
ClickLearn.define([
  {
    id: "CH0061.p1.rows-cols", stage: "STG006", chapter: "CH0061", page: 1, heading: "Meet the Nested Loop",
    kind: "lab", title: "Rows and columns",
    implements: ["CH0061.p1.grid"],
    observe: "Change the number of rows and columns. The outer loop `i` makes the rows and the inner loop `j` makes the columns.\nIn the second output every pair shows `i` first and `j` second, so `23` means row 2, column 3.",
    controls: [
      { id: "rows", type: "range", label: "Rows (outer loop runs)", min: 1, max: 5, step: 1, value: 3 },
      { id: "cols", type: "range", label: "Columns (inner loop runs)", min: 1, max: 6, step: 1, value: 4 },
    ],
    variants: [
      { label: "Printing stars", code: ['for (int i = 1; i <= {{rows}}; i++)', '{', '   for (int j = 1; j <= {{cols}}; j++)', '   {', '      printf("* ");', '   }', '   printf("\\n");', '}'].join("\n") },
      { label: "Printing i and j", code: ['for (int i = 1; i <= {{rows}}; i++)', '{', '   for (int j = 1; j <= {{cols}}; j++)', '   {', '      printf("%d%d ", i, j);', '   }', '   printf("\\n");', '}'].join("\n") },
    ],
    show: ["lines"],
    explanation: "The inner loop runs completely for every round of the outer loop. So the number of stars is rows times columns.",
  },
  {
    id: "CH0061.p2.step-nested", stage: "STG006", chapter: "CH0061", page: 2, heading: "How Does a Nested Loop Work?",
    kind: "trace", title: "Step through the nested loop",
    implements: ["CH0061.p2.tr"],
    intro: "This is the same program as above. Watch `j` run all the way through for each `i`, and how `printf(\"\\n\");` ends each row.",
    code: [
      'for (int i = 1; i <= 2; i++)',
      '{',
      '   for (int j = 1; j <= 3; j++)',
      '   {',
      '      printf("%d%d ", i, j);',
      '   }',
      '   printf("\\n");',
      '}',
    ].join("\n"),
    notes: {
      1: "Outer loop: `i` chooses the row. It only moves on after the inner loop has finished all its columns.",
      3: "Inner loop: `j` starts again from 1 for every new `i`.",
      5: "Prints `i` then `j`, so `23` means row 2, column 3.",
      7: "The inner loop is finished, so this line ends the row.",
    },
  },
  {
    id: "CH0061.p5.four-by-three", stage: "STG006", chapter: "CH0061", page: 5, heading: "Your First Nested Loop Challenge",
    kind: "challenge", title: "Build the star pattern",
    implements: ["CH0061.p5.chal"],
    uses: [{ re: "\\bfor\\s*\\([\\s\\S]*\\bfor\\s*\\(", ask: "use one `for` loop inside another `for` loop" }],
    prompt: "Print 4 rows with 3 stars in each row, with a space after each star. Use one `for` loop inside another `for` loop.",
    starter: ['#include <stdio.h>', '', 'int main()', '{', '   // Write your loops here', '', '   return 0;', '}'].join("\n"),
    tests: [{ expected: "* * *\n* * *\n* * *\n* * *" }],
    hints: [
      "Look at Think Before You Code. Which loop makes the rows, and which loop makes the stars in one row?",
      'Put the inner loop inside the { } block of the outer loop. The inner loop prints one star with printf("* "); each time. After the inner loop finishes, print a new line with printf("\\n"); so the next row starts below.',
      "The outer loop is `for (int i = 1; i <= 4; i++)` and the inner loop is `for (int j = 1; j <= 3; j++)`. The new line goes inside the outer loop, after the inner loop.",
    ],
    solution: [
      '#include <stdio.h>', '', 'int main()', '{',
      '   for (int i = 1; i <= 4; i++)',
      '   {',
      '      for (int j = 1; j <= 3; j++)',
      '      {',
      '         printf("* ");',
      '      }',
      '      printf("\\n");',
      '   }',
      '', '   return 0;', '}',
    ].join("\n"),
    solutionExplain: "The outer loop runs 4 times, one for each row. Each time, the inner loop runs 3 times and prints 3 stars. Then `printf(\"\\n\");` moves to the next line before the outer loop repeats.",
    explanation: "Your nested loops printed 4 rows of 3 stars.",
  },
]);
