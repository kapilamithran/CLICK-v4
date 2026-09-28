/*
 * CH0116 - Capstone Project: Using Arrays (Stage 6, STG007).
 *
 * Why these activities: this closing chapter combines everything the stage taught. Students tour the
 * capstone's building blocks, trace a full Student Marks Analyzer, sort out the array's real limitations,
 * and choose a suitable declaration for a fresh scenario.
 */
ClickLearn.define([
  {
    id: "CH0116.p1.capstone-cards", stage: "STG007", chapter: "CH0116", page: 1, heading: "Capstone Project: Using Arrays",
    kind: "reveal", title: "Tap each part of the capstone",
    intro: "int marks[5] = {80, 75, 90, 85, 95};",
    cards: [
      { label: "Display marks", body: "Print each element with a loop." },
      { label: "Calculate total", body: "Add every element into a running sum." },
      { label: "Find average", body: "Divide the total by the number of elements." },
      { label: "Find highest / lowest", body: "Compare every element to track the maximum and minimum." },
    ],
    explanation: "A capstone project uses one array to show off everything learned: looping, summing, averaging and comparing.",
  },
  {
    id: "CH0116.p2.trace-marks-analyzer", stage: "STG007", chapter: "CH0116", page: 2, heading: "Mini Capstone Example",
    kind: "trace", title: "Trace the Student Marks Analyzer",
    code: "#include <stdio.h>\n\nint main()\n{\n   int marks[5] = {80, 75, 90, 85, 95};\n   int sum = 0;\n   for (int i = 0; i < 5; i++) {\n      sum += marks[i];\n   }\n   printf(\"Total = %d\", sum);\n   return 0;\n}",
    explanation: "sum grows by one mark per iteration: 80, 155, 245, 330, then 425 - the final total.",
  },
  {
    id: "CH0116.p3.sort-limitations", stage: "STG007", chapter: "CH0116", page: 3, heading: "Array Limitations",
    kind: "assign", title: "Sort the array limitations",
    question: "Match each limitation to what it means.",
    buckets: [
      { id: "size", label: "Fixed size" }, { id: "type", label: "Same data type" },
      { id: "bounds", label: "Out-of-bounds risk" }, { id: "shift", label: "Insertion & deletion" },
    ],
    items: [
      { text: "int numbers[5]; can never hold 6 values", bucket: "size", why: "The size is fixed once the array is created." },
      { text: "An int array cannot also store a float", bucket: "type", why: "One array holds one data type." },
      { text: "numbers[5]; is invalid for a 5-element array", bucket: "bounds", why: "C never checks this automatically." },
      { text: "Adding a value in the middle shifts everything after it", bucket: "shift", why: "There is no gap to insert into - later elements must move." },
    ],
    explanation: "Arrays are simple and fast, but a fixed size, one data type, no bounds checking, and costly insertion are all real trade-offs.",
  },
  {
    id: "CH0116.p4.choose-right-array", stage: "STG007", chapter: "CH0116", page: 4, heading: "Choosing the Right Array",
    kind: "builder", title: "Choose the right array",
    question: "You need to store 10 students' ages (whole numbers). Complete the declaration.",
    template: "{type} ages{size};",
    slots: {
      type: { label: "data type", options: ["int", "float", "char"], answer: "int", why: "Ages are whole numbers, so int is the right data type." },
      size: { label: "size", options: ["[10]", "[1]", "[100]"], answer: "[10]", why: "There are exactly 10 students, so the array needs exactly 10 slots." },
    },
    explanation: "int ages[10]; is sized and typed to match what it needs to store: 10 whole-number ages.",
  },
]);
