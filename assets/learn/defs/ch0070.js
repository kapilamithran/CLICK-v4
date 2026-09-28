/*
 * CH0070 - Working with 2D Array (Stage 6, STG007).
 *
 * Why these activities: the pages apply nested loops to fill, display and process a 2D array. Students
 * recognize the nested-loop shape, build a fill-from-input loop, trace a row-by-row display, and compute
 * an element count from dimensions.
 */
ClickLearn.define([
  {
    id: "CH0070.p1.identify-nested-loop", stage: "STG007", chapter: "CH0070", page: 1, heading: "What is Working with a 2D Array?",
    kind: "mcq", title: "Spot the nested loop",
    question: "Which of these is a nested loop, able to visit every element of a 2D array?",
    choices: [
      { text: "for (i...) { ... } for (j...) { ... }", why: "These are two separate loops, one after another - not one inside the other." },
      { text: "for (i...) { for (j...) { ... } }", correct: true, why: "The inner for (j...) loop is placed entirely inside the outer for (i...) loop - that is a nested loop." },
      { text: "for (i...) { if (j) { ... } }", why: "This has an if, not a second loop, inside the outer loop." },
      { text: "while (i) { i++; }", why: "This is a single loop with no loop inside it." },
    ],
    explanation: "A nested loop is a loop placed completely inside another loop's body - exactly what visiting a grid's rows and columns needs.",
  },
  {
    id: "CH0070.p2.build-input-loop", stage: "STG007", chapter: "CH0070", page: 2, heading: "Taking Input in a 2D Array",
    kind: "builder", title: "Build the input loop",
    question: "Complete the scanf call inside nested loops that fills a 2D array.",
    template: "scanf(\"%d\", &matrix{idx});",
    slots: {
      idx: { label: "position", options: ["[i][j]", "[i]", "[j]"], answer: "[i][j]", why: "Filling a 2D array needs both indexes: i for the row, j for the column." },
    },
    explanation: "scanf(\"%d\", &matrix[i][j]); inside nested loops fills every position, one input at a time.",
  },
  {
    id: "CH0070.p3.trace-display", stage: "STG007", chapter: "CH0070", page: 3, heading: "Displaying a 2D Array",
    kind: "trace", title: "Trace displaying the grid",
    code: "#include <stdio.h>\n\nint main()\n{\n   int matrix[2][3] = {{10, 20, 30}, {40, 50, 60}};\n   for (int i = 0; i < 2; i++) {\n      for (int j = 0; j < 3; j++) {\n         printf(\"%d \", matrix[i][j]);\n      }\n      printf(\"\\n\");\n   }\n   return 0;\n}",
    explanation: "The inner loop prints one row's worth of columns, then printf(\"\\n\") after it moves output to the next line before the outer loop advances to the next row.",
  },
  {
    id: "CH0070.p4.count-elements", stage: "STG007", chapter: "CH0070", page: 4, heading: "Basic Operations on a 2D Array",
    kind: "fill", noRun: true, title: "How many elements?",
    question: "Work out the total number of elements in this 2D array.",
    code: "int matrix[3][4];\n// total elements = ___",
    blanks: [
      { answers: ["12"], hint: "Multiply the number of rows by the number of columns." },
    ],
    explanation: "3 rows x 4 columns = 12 elements in total.",
  },
]);
