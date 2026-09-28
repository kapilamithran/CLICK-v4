/*
 * CH0065 - Combining Loops with Array (Stage 6, STG007).
 *
 * Why these activities: the pages combine loops with arrays for printing, input and sum. Students map
 * loop iterations to indexes directly, build a for-loop header themselves, walk through a loop-based
 * input fill, and trace a running sum to see accumulation happen step by step.
 */
ClickLearn.define([
  {
    id: "CH0065.p1.match-iteration-index", stage: "STG007", chapter: "CH0065", page: 1, heading: "What is Combining Loops with Arrays?",
    kind: "assign", title: "Match each iteration to its index",
    question: "for (int i = 0; i < 5; i++) - drag each value of i to the array element it accesses.",
    buckets: [
      { id: "e0", label: "numbers[0]" }, { id: "e1", label: "numbers[1]" }, { id: "e2", label: "numbers[2]" },
      { id: "e3", label: "numbers[3]" }, { id: "e4", label: "numbers[4]" },
    ],
    items: [
      { text: "i = 0", bucket: "e0", why: "When i is 0, numbers[i] is numbers[0]." },
      { text: "i = 1", bucket: "e1", why: "When i is 1, numbers[i] is numbers[1]." },
      { text: "i = 2", bucket: "e2", why: "When i is 2, numbers[i] is numbers[2]." },
      { text: "i = 3", bucket: "e3", why: "When i is 3, numbers[i] is numbers[3]." },
      { text: "i = 4", bucket: "e4", why: "When i is 4, numbers[i] is numbers[4], the last element." },
    ],
    explanation: "As i counts from 0 to 4, numbers[i] moves through every element of the array in order.",
  },
  {
    id: "CH0065.p2.build-for-loop", stage: "STG007", chapter: "CH0065", page: 2, heading: "How Does the Loop Access an Array?",
    kind: "builder", title: "Build the for loop header",
    question: "Complete a for loop that visits every element of a 5-element array.",
    template: "for (int i = 0; i {bound} 5; i{step}) {",
    slots: {
      bound: { label: "condition", options: ["<", "<=", ">"], answer: "<", why: "i < 5 stops right after i = 4, the last valid index; i <= 5 would go out of bounds." },
      step: { label: "update", options: ["++", "--", "+= 2"], answer: "++", why: "The loop should visit every index one at a time, from 0 up to 4." },
    },
    explanation: "for (int i = 0; i < 5; i++) visits indexes 0, 1, 2, 3 and 4, then stops.",
  },
  {
    id: "CH0065.p3.input-loop-cards", stage: "STG007", chapter: "CH0065", page: 3, heading: "Taking Array Input Using a Loop",
    kind: "reveal", title: "Tap each iteration to see what it stores",
    intro: "int numbers[5];\nfor (int i = 0; i < 5; i++) { scanf(\"%d\", &numbers[i]); }",
    cards: [
      { label: "Iteration 1 (i = 0)", body: "Reads the first input and stores it in numbers[0]." },
      { label: "Iteration 3 (i = 2)", body: "Reads the third input and stores it in numbers[2]." },
      { label: "Iteration 5 (i = 4)", body: "Reads the fifth input and stores it in numbers[4], the last element." },
    ],
    explanation: "Each iteration of the loop reads one input and stores it at the current index, i.",
  },
  {
    id: "CH0065.p4.trace-sum", stage: "STG007", chapter: "CH0065", page: 4, heading: "Processing Array Elements",
    kind: "trace", title: "Trace the running total",
    code: "int numbers[5] = {10, 20, 30, 40, 50};\nint sum = 0;\nfor (int i = 0; i < 5; i++) {\n   sum = sum + numbers[i];\n}\nprintf(\"Sum = %d\", sum);",
    explanation: "sum starts at 0, then grows by one element per iteration: 10, 30, 60, 100, and finally 150.",
  },
]);
