/*
 * CH0115 - else if (Stage 4, id STG005).
 *
 * The pages say "only the first true condition runs" and "put the conditions in the correct order", but a
 * student never sees the skipped lines or a wrong order. These activities show which lines C really runs,
 * let the student build the grade ladder, and let them predict what the sign ladder prints for many values.
 */
ClickLearn.define([
  {
    id: "CH0115.p2.age-ladder", stage: "STG005", chapter: "CH0115", page: 2, heading: "Structure of else if",
    kind: "lab", title: "Slide the age through the ladder",
    implements: ["CH0115.p2.flow"],
    observe: "Move the age slider. The lit lines are the lines C really ran. Try `age = 10`: both `age < 13` and `age < 20` are TRUE. Which line prints?",
    controls: [{ id: "age", type: "range", label: "age", min: 5, max: 30, step: 1, value: 15 }],
    show: ["lines"],
    code: 'int age = {{age}};\n\nif (age < 13)\n    printf("Child");\nelse if (age < 20)\n    printf("Teenager");\nelse\n    printf("Adult");',
    summary: "With `age = {{age}}` the ladder prints **{{out}}**.",
    explanation: "C checks the conditions from the top and stops at the first one that is TRUE. Every line below it stays dark, even when its own condition would also have been TRUE.",
  },
  {
    id: "CH0115.p3.order-ladder", stage: "STG005", chapter: "CH0115", page: 3, heading: "Multiple Conditions",
    kind: "order", title: "Put the grade ladder in the right order",
    implements: ["CH0115.p3.ord"],
    question: "Build a ladder that sorts any marks into the right grade: `Grade A` for 90 or more, `Grade B` for 80 or more, `Grade C` for 70 or more, and `Grade D` for anything lower.",
    lines: [
      "int marks = 85;",
      'if (marks >= 90) printf("Grade A");',
      'else if (marks >= 80) printf("Grade B");',
      'else if (marks >= 70) printf("Grade C");',
      'else printf("Grade D");',
    ],
    explanation: "Start with the strictest check. C stops at the first TRUE condition, so `marks >= 70` has to come after `>= 90` and `>= 80`. If it came first, 85 would print Grade C, because 85 is already 70 or more.",
  },
  {
    id: "CH0115.p3.same-checks-two-orders", stage: "STG005", chapter: "CH0115", page: 3, heading: "Multiple Conditions",
    kind: "lab", title: "Same checks, two orders",
    intro: "Order matters. Here are the same three checks written in two different orders.",
    observe: "Both ladders use exactly the same three checks. Slide `marks` to 85 and compare what they print.",
    controls: [{ id: "marks", type: "range", label: "marks", min: 40, max: 100, step: 5, value: 85 }],
    show: ["lines"],
    variants: [
      { label: "Highest grade first", code: 'int marks = {{marks}};\n\nif (marks >= 90)\n    printf("Grade A");\nelse if (marks >= 80)\n    printf("Grade B");\nelse if (marks >= 70)\n    printf("Grade C");\nelse\n    printf("Grade D");' },
      { label: "Lowest grade first", code: 'int marks = {{marks}};\n\nif (marks >= 70)\n    printf("Grade C");\nelse if (marks >= 80)\n    printf("Grade B");\nelse if (marks >= 90)\n    printf("Grade A");\nelse\n    printf("Grade D");' },
    ],
    explanation: "In the second ladder `marks >= 70` is checked first. A mark of 85 is already 70 or more, so C prints Grade C and never reaches the `>= 80` check.",
  },
  {
    id: "CH0115.p4.sign-of-n", stage: "STG005", chapter: "CH0115", page: 4, heading: "Real Program Usage",
    kind: "assign", title: "What does the program print for each n?",
    implements: ["CH0115.p4.pr"],
    question: "The ladder checks `n > 0` first, then `n < 0`, and `else` takes everything that is left. Choose the word it prints for each value of `n`.",
    buckets: [{ id: "pos", label: "Positive" }, { id: "neg", label: "Negative" }, { id: "zero", label: "Zero" }],
    items: [
      { text: "n = 12", bucket: "pos", why: "12 > 0 is TRUE, so the first branch runs." },
      { text: "n = 0", bucket: "zero", why: "0 > 0 is FALSE and 0 < 0 is FALSE, so C reaches else. Zero is neither positive nor negative." },
      { text: "n = -7", bucket: "neg", why: "-7 > 0 is FALSE, then -7 < 0 is TRUE, so it prints Negative." },
      { text: "n = 1", bucket: "pos", why: "1 > 0 is TRUE. The smallest positive whole number still counts as positive." },
      { text: "n = -1", bucket: "neg", why: "-1 > 0 is FALSE, but -1 < 0 is TRUE." },
      { text: "n = 100", bucket: "pos", why: "100 > 0 is TRUE, so the first branch runs and the other checks are skipped." },
    ],
    explanation: "Only the first TRUE condition runs. Positive numbers stop at `n > 0`, negative numbers stop at `n < 0`, and 0 fails both checks so it falls to `else`.",
  },
]);
