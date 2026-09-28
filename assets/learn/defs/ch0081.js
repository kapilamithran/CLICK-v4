/*
 * CH0081 - Linear Search Algorithm (Stage 8, STG009).
 *
 * Why these activities: the PDF turns the "check one by one" idea into a numbered algorithm, then
 * dry-runs it by hand, then maps it onto C. (1) sequencing the algorithm's own steps is an "order"
 * activity almost verbatim from the PDF's own Slide 3 list; (2) the PDF's own Slide 4 dry-run table
 * (step/current value/compare/result) is filled in live over the real interpreter; (3) the "why dry
 * run helps" bullets become reveal cards; (4) fill-in-the-blank ties algorithm Step 1 to i's start value.
 */
ClickLearn.define([
  {
    id: "CH0081.p2.order-steps", stage: "STG009", chapter: "CH0081", page: 2, heading: "Linear Search Algorithm: The Steps",
    kind: "order", noRun: true, title: "Put the algorithm's steps in order",
    question: "Arrange the Linear Search algorithm in the order the computer follows it.",
    lines: [
      "Start from the first element.",
      "Compare the current element with the target.",
      "If they match, report Found.",
      "If they don't match, move to the next element.",
      "Repeat until the target is found or all elements are checked.",
      "If no match was found, report Not Found.",
    ],
    distractors: ["Sort the array first."],
    explanation: "Linear Search never needs to sort first - it simply starts at the beginning and works forward, one comparison at a time.",
  },
  {
    id: "CH0081.p4.dry-run", stage: "STG009", chapter: "CH0081", page: 4, heading: "Let's Trace the Algorithm",
    kind: "tracetable", title: "Dry-run the algorithm",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {8, 12, 20, 25};",
      "   int target = 20;",
      "   int i;",
      "",
      "   for (i = 0; i < 4; i++)",
      "   {",
      "      if (numbers[i] == target)",
      "      {",
      "         printf(\"Found\");",
      "         break;",
      "      }",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    question: "Fill in the trace table for a dry run of this search. One row is one pass through the loop.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "cond", label: "i < 4?", kind: "cond" },
      { key: "out", label: "Output so far", kind: "out" },
    ],
    fill: ["i", "cond", "out"],
    explanation: "The dry run checks 8, then 12, then 20 - a match, so it prints Found and the loop stops.",
  },
  {
    id: "CH0081.p4.why-dry-run", stage: "STG009", chapter: "CH0081", page: 4, heading: "Let's Trace the Algorithm",
    kind: "reveal", title: "Tap to see what a dry run reveals",
    cards: [
      { label: "Which values are checked", body: "A dry run shows exactly which elements the algorithm looks at before it stops." },
      { label: "Where the search stops", body: "It shows the precise step where a match is found, or where the array runs out." },
      { label: "Whether the algorithm is working correctly", body: "If the dry run does not match what you expect, the algorithm (or your understanding of it) needs a second look." },
    ],
    explanation: "Dry run = walk through the steps manually, before trusting a program to run them for you.",
  },
  {
    id: "CH0081.p1.fill-start", stage: "STG009", chapter: "CH0081", page: 1, heading: "From Idea to Algorithm",
    kind: "fill", noRun: true, title: "Where does the algorithm start?",
    question: "Complete the loop so it starts checking from the very first element.",
    code: "for (int i = ___; i < 4; i++)\n{\n   if (numbers[i] == target)\n   {\n      printf(\"Found\");\n      break;\n   }\n}",
    blanks: [
      { answers: ["0"], hint: "The algorithm's first step is to start from the first element, which is index 0." },
    ],
    explanation: "for (int i = 0; ...) makes i begin at the first index, exactly matching Step 1 of the algorithm.",
  },
]);
