/*
 * CH0072 - Arrays and Functions (Stage 6, STG007).
 *
 * Why these activities: the pages introduce array parameters, calling with array+size, a sum-returning
 * function, and reuse across different arrays. Students spot the array-parameter syntax, build a function
 * call, trace the sum function executing, and see the same function reused with a different array.
 */
ClickLearn.define([
  {
    id: "CH0072.p1.identify-array-param", stage: "STG007", chapter: "CH0072", page: 1, heading: "What are Arrays and Functions?",
    kind: "mcq", title: "Spot the array parameter",
    question: "Which function declaration can receive an array?",
    choices: [
      { text: "void display(int a, int n)", why: "int a is a single number, not an array." },
      { text: "void display(int a[], int n)", correct: true, why: "int a[] with empty brackets is an array parameter." },
      { text: "void display(int[] n)", why: "This is not valid C syntax for a parameter." },
      { text: "void display()", why: "This function takes no parameters at all." },
    ],
    explanation: "Writing a parameter as type name[] lets a function receive an array, sharing the caller's own storage.",
  },
  {
    id: "CH0072.p2.build-function-call", stage: "STG007", chapter: "CH0072", page: 2, heading: "Passing an Array to a Function",
    kind: "builder", title: "Build the function call",
    question: "Complete a call that passes numbers (5 elements) to display.",
    template: "display({arr}, {size});",
    slots: {
      arr: { label: "array", options: ["numbers", "numbers[5]", "int numbers"], answer: "numbers", why: "Just the array's name is passed - not its size in brackets, and not its type." },
      size: { label: "size", options: ["5", "0", "int"], answer: "5", why: "The size, 5, tells display how many elements to process." },
    },
    explanation: "display(numbers, 5); passes the array numbers and its size, 5, to the function.",
  },
  {
    id: "CH0072.p3.trace-sum-function", stage: "STG007", chapter: "CH0072", page: 3, heading: "Using a Function to Calculate Sum",
    kind: "trace", title: "Trace the sum function",
    code: "#include <stdio.h>\nint sumArray(int a[], int n) {\n   int sum = 0;\n   for (int i = 0; i < n; i++)\n      sum += a[i];\n   return sum;\n}\nint main()\n{\n   int numbers[4] = {10, 20, 30, 40};\n   printf(\"%d\", sumArray(numbers, 4));\n   return 0;\n}",
    explanation: "sumArray adds a[0] through a[3] (10, 20, 30, 40) into sum, then returns 100.",
  },
  {
    id: "CH0072.p4.reuse-function-cards", stage: "STG007", chapter: "CH0072", page: 4, heading: "Why Use Functions with Arrays?",
    kind: "reveal", title: "See the same function reused",
    intro: "int sumArray(int a[], int n) { ... }",
    cards: [
      { label: "sumArray(numbers, 5)", body: "Adds up the 5 elements of numbers." },
      { label: "sumArray(marks, 5)", body: "The exact same function also adds up the 5 elements of marks - no new code needed." },
    ],
    explanation: "Because sumArray works on whatever array it is given, it is reusable: one function, many arrays.",
  },
]);
