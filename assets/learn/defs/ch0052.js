/*
 * CH0052 - if-else (Stage 5).
 * p2: marks slider (exactly one block runs), p3: toggle the else block, p5: predict even or odd for different numbers.
 * Pages 1 and 4 stay static.
 */
ClickLearn.define([
  {
    id: "CH0052.p2.two-paths", stage: "STG005", chapter: "CH0052", page: 2, heading: "How Does if-else Work?",
    kind: "lab", title: "Two paths, one block runs",
    implements: ["CH0052.p2.flow"],
    observe: "Slide `marks` and watch the highlighted lines. Which block runs when `marks` is 49? And when it is 50? Can both blocks run at the same time?",
    controls: [{ id: "marks", type: "range", label: "marks", min: 0, max: 100, step: 1, value: 35 }],
    code: 'int marks = {{marks}};\n\nif (marks >= 50)\n{\n   printf("Pass");\n}\nelse\n{\n   printf("Fail");\n}',
    show: ["lines"],
    summary: "C checks `{{marks}} >= 50` first. If it is TRUE, the `if` block runs. If it is FALSE, the `else` block runs.",
  },
  {
    id: "CH0052.p3.with-and-without-else", stage: "STG005", chapter: "CH0052", page: 3, heading: "if vs if-else",
    kind: "lab", title: "With and without else",
    implements: ["CH0052.p3.lab"],
    observe: "Leave `age` at 15 and flip the switch on and off. What changes in the output? Then slide `age` to 20 and flip the switch again.",
    controls: [
      { id: "age", type: "range", label: "age", min: 10, max: 25, step: 1, value: 15 },
      { id: "elsepart", type: "toggle", label: "Add the else block", on: 'else\n{\n   printf("Cannot vote");\n}', off: "", checked: false },
    ],
    code: 'int age = {{age}};\n\nif (age >= 18)\n{\n   printf("Can vote");\n}\n{{elsepart}}',
    show: ["lines"],
    summary: "`if` handles the TRUE case. `else` handles the FALSE case. Compare the output with and without the else block.",
  },
  {
    id: "CH0052.p5.predict-odd", stage: "STG005", chapter: "CH0052", page: 5, heading: "Recap",
    kind: "predict", title: "Even or odd? Try 25",
    implements: ["CH0052.p5.pr"],
    question: "What does this program print?",
    code: 'int number = 25;\n\nif (number % 2 == 0) {\n        printf("Even");\n} else {\n        printf("Odd");\n}',
    choices: ["Even", "Odd"],
    expected: "Odd",
    hint: "Work out `25 % 2` first. Then ask whether it equals 0.",
    explanation: "25 % 2 is 1, because 25 divided by 2 leaves a remainder of 1. `1 == 0` is FALSE, so the else block runs: Odd.",
  },
  {
    id: "CH0052.p5.predict-zero", stage: "STG005", chapter: "CH0052", page: 5, heading: "Recap",
    kind: "predict", title: "Even or odd? Try 0",
    implements: ["CH0052.p5.pr"],
    question: "Now the number is 0. What does this program print?",
    code: 'int number = 0;\n\nif (number % 2 == 0) {\n        printf("Even");\n} else {\n        printf("Odd");\n}',
    choices: ["Odd", "Even"],
    expected: "Even",
    hint: "Divide 0 by 2. What is left over?",
    explanation: "0 % 2 is 0, because 0 divided by 2 leaves nothing over. `0 == 0` is TRUE, so the if block runs: Even. The same test works for every whole number, including 0.",
  },
]);
