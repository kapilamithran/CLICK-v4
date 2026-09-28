/*
 * CH0069 - Introduction to Multi-Dimensional Arrays (Stage 6, STG007).
 *
 * Why these activities: this is the first 2D array chapter, so students need the "grid" picture before
 * the [row][column] syntax. They tour the grid, build the declaration, map positions to values, and trace
 * the nested loops that visit every element in order.
 */
ClickLearn.define([
  {
    id: "CH0069.p1.grid-cards", stage: "STG007", chapter: "CH0069", page: 1, heading: "What is a Multi-Dimensional Array?",
    kind: "reveal", title: "Tap the grid to see rows and columns",
    intro: "int matrix[2][3] = {{10, 20, 30}, {40, 50, 60}};",
    cards: [
      { label: "Row 0", body: "The first row: 10, 20, 30 - matrix[0][0], matrix[0][1], matrix[0][2]." },
      { label: "Row 1", body: "The second row: 40, 50, 60 - matrix[1][0], matrix[1][1], matrix[1][2]." },
      { label: "6 elements total", body: "2 rows x 3 columns = 6 elements, arranged in a grid." },
    ],
    explanation: "A 2D array is a grid: the first index picks the row, the second picks the column.",
  },
  {
    id: "CH0069.p2.build-declaration", stage: "STG007", chapter: "CH0069", page: 2, heading: "How Does a 2D Array Work?",
    kind: "builder", title: "Build a 2D array declaration",
    question: "Complete a declaration for a grid of 2 rows and 3 columns.",
    template: "int matrix{dims};",
    slots: {
      dims: { label: "rows and columns", options: ["[2][3]", "[3][2]", "[6]"], answer: "[2][3]", why: "We need 2 rows and 3 columns, in that order: [rows][columns]." },
    },
    explanation: "int matrix[2][3]; declares a 2D array with 2 rows and 3 columns.",
  },
  {
    id: "CH0069.p3.match-position-value", stage: "STG007", chapter: "CH0069", page: 3, heading: "Accessing Elements",
    kind: "assign", title: "Match each position to its value",
    question: "int matrix[2][3] = {{10, 20, 30}, {40, 50, 60}}; - drag each position to its value.",
    buckets: [
      { id: "v10", label: "10" }, { id: "v30", label: "30" }, { id: "v40", label: "40" }, { id: "v60", label: "60" },
    ],
    items: [
      { text: "matrix[0][0]", bucket: "v10", why: "Row 0, column 0 is the first value, 10." },
      { text: "matrix[0][2]", bucket: "v30", why: "Row 0, column 2 is the third value of row 0, 30." },
      { text: "matrix[1][0]", bucket: "v40", why: "Row 1, column 0 is the first value of row 1, 40." },
      { text: "matrix[1][2]", bucket: "v60", why: "Row 1, column 2 is the last value of row 1, 60." },
    ],
    explanation: "The first index picks the row, the second picks the column within that row.",
  },
  {
    id: "CH0069.p4.trace-nested-loops", stage: "STG007", chapter: "CH0069", page: 4, heading: "Using Loops with 2D Arrays",
    kind: "trace", title: "Trace the nested loops",
    code: "#include <stdio.h>\n\nint main()\n{\n   int matrix[2][3] = {{10, 20, 30}, {40, 50, 60}};\n   for (int i = 0; i < 2; i++) {\n      for (int j = 0; j < 3; j++) {\n         printf(\"%d \", matrix[i][j]);\n      }\n   }\n   return 0;\n}",
    explanation: "The outer loop (i) moves through the rows; for each row, the inner loop (j) moves through every column.",
  },
]);
