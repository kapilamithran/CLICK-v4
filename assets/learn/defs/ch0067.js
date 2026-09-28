/*
 * CH0067 - Basic Array Operations- Math & Metric (Stage 6, STG007).
 *
 * Why these activities: the pages teach sum, average, maximum and minimum as four small variations of the
 * same "loop and compare/accumulate" pattern. Students sort descriptions to the right operation, trace the
 * average calculation and the max-finding loop, and assemble the cast-to-float division line.
 */
ClickLearn.define([
  {
    id: "CH0067.p1.pick-operation", stage: "STG007", chapter: "CH0067", page: 1, heading: "What are Basic Array Operations?",
    kind: "assign", title: "Which operation is this?",
    question: "Match each description to the array operation it describes.",
    buckets: [{ id: "sum", label: "Sum" }, { id: "average", label: "Average" }, { id: "max", label: "Maximum" }, { id: "min", label: "Minimum" }],
    items: [
      { text: "Add all the values together", bucket: "sum", why: "That is exactly what sum does." },
      { text: "Divide the total by how many values there are", bucket: "average", why: "Average = Sum ÷ Number of elements." },
      { text: "Find the largest value", bucket: "max", why: "That is exactly what maximum does." },
      { text: "Find the smallest value", bucket: "min", why: "That is exactly what minimum does." },
    ],
    explanation: "Array + loop -> sum, average, maximum and minimum are all easy calculations once you can visit every element.",
  },
  {
    id: "CH0067.p3.trace-average", stage: "STG007", chapter: "CH0067", page: 3, heading: "Finding Average",
    kind: "trace", title: "Trace the average calculation",
    code: "#include <stdio.h>\n\nint main()\n{\n   int numbers[5] = {10, 20, 30, 40, 50};\n   int sum = 0;\n   for (int i = 0; i < 5; i++) {\n      sum += numbers[i];\n   }\n   float average = (float)sum / 5;\n   printf(\"%.1f\", average);\n   return 0;\n}",
    explanation: "sum reaches 150 after the loop, then dividing by 5 gives an average of 30.0.",
  },
  {
    id: "CH0067.p3.build-average-line", stage: "STG007", chapter: "CH0067", page: 3, heading: "Finding Average",
    kind: "builder", title: "Build the average line",
    question: "Complete the line that turns a sum of 5 elements into an average, keeping the decimal part.",
    template: "float average = {cast}sum / 5;",
    slots: {
      cast: { label: "cast", options: ["(float)", "(int)", ""], answer: "(float)", why: "Casting sum to float before dividing keeps the decimal part of the result." },
    },
    explanation: "float average = (float)sum / 5; avoids C's whole-number division, so the average keeps its decimal part.",
  },
  {
    id: "CH0067.p4.trace-max-min", stage: "STG007", chapter: "CH0067", page: 4, heading: "Maximum & Minimum",
    kind: "trace", title: "Trace finding the maximum",
    code: "int numbers[5] = {10, 50, 30, 20, 40};\nint max = numbers[0];\nfor (int i = 1; i < 5; i++) {\n   if (numbers[i] > max)\n      max = numbers[i];\n}\nprintf(\"%d\", max);",
    explanation: "max starts at 10, updates to 50 when that bigger value is seen, and then stays 50 for the rest of the loop.",
  },
]);
