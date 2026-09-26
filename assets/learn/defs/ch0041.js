/*
 * CH0041 - arithmetic & unary operation (Stage 3, STG003).
 *
 * Why these activities: the pages give the five arithmetic operators and ++ / -- as tables and single
 * examples. Students need to see what / and % really do for other numbers, commit to an answer for integer
 * division and remainder, and watch the difference between "the value used" and "the value stored" for
 * pre and post decrement. A short recap check closes the chapter. Everything is ungraded.
 */
ClickLearn.define([
  {
    id: "CH0041.p2.operator-calculator", stage: "STG003", chapter: "CH0041", page: 2, heading: "Arithmetic & Unary Operators — Reference",
    kind: "lab", title: "Operator calculator",
    implements: ["CH0041.p2.lab"],
    observe: "Pick numbers and an operator. Try `/` and `%` with numbers that do not divide evenly, and watch the second panel.",
    controls: [
      { id: "x", type: "range", label: "x", min: 0, max: 30, step: 1, value: 17 },
      { id: "y", type: "range", label: "y", min: 1, max: 10, step: 1, value: 5 },
      { id: "op", type: "select", label: "Operator", value: "+", options: [
        { v: "+", l: "+  add" }, { v: "-", l: "-  subtract" }, { v: "*", l: "*  multiply" }, { v: "/", l: "/  divide" }, { v: "%", l: "%  remainder" },
      ] },
    ],
    variants: [
      { label: "Your operator", code: 'int x = {{x}};\nint y = {{y}};\nprintf("%d", x {{op}} y);' },
      { label: "For / and %: how many times, and what is left", code: 'int x = {{x}};\nint y = {{y}};\nprintf("how many times? %d\\n", x / y);\nprintf("what is left? %d", x % y);' },
    ],
    summary: "`{{x}} {{op}} {{y}}` gives `{{out}}`.",
    explanation: "`/` asks how many times y fits into x (whole times only). `%` asks what is left over after that.",
  },
  {
    id: "CH0041.p3.predict-divide", stage: "STG003", chapter: "CH0041", page: 3, heading: "Tricks to Solve",
    kind: "predict", title: "Predict an integer division",
    implements: ["CH0041.p3.pr"],
    code: 'printf("%d", 17 / 5);',
    expected: "3",
    choices: ["3", "3.4", "4", "2"],
    hint: "Both numbers are int. Does C round the answer, or does it drop the decimal part?",
    explanation: "17 ÷ 5 is 3.4, but both numbers are int, so C keeps only the whole part: 3. It never rounds up to 4, and 2 is the remainder, which is what `%` gives.",
  },
  {
    id: "CH0041.p3.predict-remainder", stage: "STG003", chapter: "CH0041", page: 3, heading: "Tricks to Solve",
    kind: "predict", title: "Predict a remainder",
    implements: ["CH0041.p3.pr"],
    code: 'printf("%d", 17 % 5);',
    expected: "2",
    choices: ["2", "3", "3.4", "12"],
    hint: "`%` is not a percentage. Think: how many whole 5s fit into 17, and how much is left over?",
    explanation: "5 fits into 17 three times (3 × 5 = 15), and 17 - 15 = 2 is what is left. `/` gives the 3, `%` gives the 2.",
  },
  {
    id: "CH0041.p4.pre-vs-post", stage: "STG003", chapter: "CH0041", page: 4, heading: "Code Examples",
    kind: "trace", title: "Pre versus post: used value and stored value",
    implements: ["CH0041.p4.tr"],
    intro: "Step through the program. After each printf, compare the number that was printed (the value that was used) with the table (the value that is stored).",
    code: '#include <stdio.h>\n\nint main() {\n   int a = 1;\n   int b = 1;\n\n   printf("Pre-Decrementing a = %d\\n", --a);\n   printf("Post-Decrementing b = %d\\n", b--);\n\n   printf("Now a is %d and b is %d\\n", a, b);\n   return 0;\n}',
    notes: {
      4: "Both variables start at 1.",
      5: "Both variables start at 1.",
      7: "`--a` is PRE: it changes `a` first (1 becomes 0), then printf uses the new value. The output says 0 and the table says a = 0.",
      8: "`b--` is POST: printf uses the old value first, which is 1. Only after that does b become 0. The output says 1, but the table already says b = 0.",
      10: "Printing both again shows what is really stored now: both are 0. PRE: change, then use. POST: use, then change. Either way the variable ends up one lower.",
    },
  },
  {
    id: "CH0041.p5.check-division", stage: "STG003", chapter: "CH0041", page: 5, heading: "Chapter Recap",
    kind: "mcq", title: "Recap check: what does this print?",
    implements: ["CH0041.p5.chk"],
    question: "What does this code print?",
    code: 'int x = 7;\nint y = 2;\nprintf("%d", x / y);',
    choices: [
      { text: "3", correct: true, why: "x and y are both int, so C does integer division and drops the .5." },
      { text: "3.5", why: "3.5 would need decimal values. With two ints, the decimal part is not kept." },
      { text: "4", why: "C does not round. In integer division the decimal part is simply dropped." },
      { text: "1", why: "1 is the remainder, which is what `x % y` gives. This line uses `/`." },
    ],
    explanation: "int ÷ int gives an int result.",
  },
  {
    id: "CH0041.p5.check-post", stage: "STG003", chapter: "CH0041", page: 5, heading: "Chapter Recap",
    kind: "mcq", title: "Recap check: pre or post?",
    implements: ["CH0041.p5.chk"],
    question: "What does this code print?",
    code: 'int c = 5;\nprintf("%d", c--);',
    choices: [
      { text: "5", correct: true, why: "c-- is POST: use first, then change. printf gets 5, and only afterwards does c become 4." },
      { text: "4", why: "That is what `--c` (PRE) would print. With `c--` the value is used before it changes." },
      { text: "6", why: "-- decreases a variable. It never increases it." },
    ],
    explanation: "POST means use first, then change.",
  },
]);
