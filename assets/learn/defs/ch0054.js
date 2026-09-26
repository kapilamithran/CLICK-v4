/*
 * CH0054 - Ternary Condition (Stage 4, id STG005).
 *
 * The pages explain `condition ? TRUE choice : FALSE choice` with words and arrows. These activities let the
 * student type the three parts, convert an if-else into a ternary, and slide a value across the threshold to
 * watch the condition (1 or 0) pick the choice.
 */
ClickLearn.define([
  {
    id: "CH0054.p1.build-ternary", stage: "STG005", chapter: "CH0054", page: 1, heading: "What is Ternary?",
    kind: "fill", title: "Build the ternary",
    implements: ["CH0054.p1.fil"],
    question: "Show `Pass` when `marks` is 40 or more, and `Fail` otherwise. Fill the condition, the TRUE choice and the FALSE choice.",
    code: 'int marks = 65;\nprintf("%s", (___) ? ___ : ___);',
    blanks: [
      { code: true, answers: ["marks >= 40", "(marks >= 40)", "marks > 39", "40 <= marks"], hint: "This is the yes/no question. Compare `marks` with 40 using a comparison operator." },
      { code: true, answers: ['"Pass"'], hint: "This is what C picks when the condition is TRUE. Text goes in double quotes." },
      { code: true, answers: ['"Fail"'], hint: "This is what C picks when the condition is FALSE. Text goes in double quotes." },
    ],
    explanation: "The pattern is `condition ? TRUE choice : FALSE choice`. For `marks = 65` the condition `marks >= 40` is TRUE, so C picks the first choice, `Pass`.",
  },
  {
    id: "CH0054.p2.if-else-to-ternary", stage: "STG005", chapter: "CH0054", page: 2, heading: "From Basic to Professional",
    kind: "order", title: "Turn an if-else into a ternary",
    implements: ["CH0054.p2.ord"],
    question: "This if-else prints Pass or Fail:\n`if (marks >= 50)`\n`printf(\"Pass\");`\n`else`\n`printf(\"Fail\");`\nRebuild the same decision as one ternary statement.",
    lines: ["int marks = 75;", 'printf("%s",', "(marks >= 50)", "?", '"Pass"', ":", '"Fail");'],
    distractors: ["(marks < 50)"],
    explanation: "The condition comes first, then `?` and the TRUE choice, then `:` and the FALSE choice. To go back to if-else, reverse the steps: the condition goes in the `if`, the TRUE choice goes in the first branch, and the FALSE choice goes after `else`.",
  },
  {
    id: "CH0054.p4.temperature-slider", stage: "STG005", chapter: "CH0054", page: 4, heading: "Ternary Flow & Program Thinking",
    kind: "lab", title: "Slide the temperature across 25",
    implements: ["CH0054.p4.flow"],
    observe: "Slide the temperature up and down. The condition prints as 1 (TRUE) or 0 (FALSE). Watch which choice the ternary picks. Try exactly 25.",
    controls: [{ id: "temperature", type: "range", label: "temperature", min: 15, max: 35, step: 1, value: 30 }],
    code: 'int temperature = {{temperature}};\n\nprintf("Condition: %d\\n", temperature > 25);\nprintf("Result: %s\\n", (temperature > 25) ? "Hot" : "Cool");',
    explanation: "TRUE (1) picks the first value, `Hot`. FALSE (0) picks the second value, `Cool`. At exactly 25 the condition `temperature > 25` is FALSE, because 25 is not greater than 25.",
  },
]);
