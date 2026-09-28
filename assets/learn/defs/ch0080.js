/*
 * CH0080 - Linear Search (Stage 8, STG009).
 *
 * Why these activities: the PDF's own worked examples are (1) a full step-by-step scan for a target
 * in the middle, (2) how the target's position changes the number of comparisons, (3) proof that
 * Linear Search still works on unsorted data, and (4) the loop's "move to next" step. A real step
 * trace over the interpreter is the most faithful way to show (1); the rest are simple sort/compare
 * or build activities that reuse the array/target/loop vocabulary the deck's Code Explorer teaches.
 */
ClickLearn.define([
  {
    id: "CH0080.p1.trace-search", stage: "STG009", chapter: "CH0080", page: 1, heading: "Meet Linear Search",
    kind: "trace", title: "Step through Linear Search",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {10, 25, 40, 15, 30};",
      "   int target = 15;",
      "",
      "   for (int i = 0; i < 5; i++)",
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
    explanation: "The loop checks numbers[0], numbers[1], numbers[2] (all no match), then numbers[3] which is 15 - a match, so it prints Found and breaks.",
  },
  {
    id: "CH0080.p3.position-comparisons", stage: "STG009", chapter: "CH0080", page: 3, heading: "Where Can the Target Be?",
    kind: "assign", title: "Match the target's position to the number of comparisons",
    question: "Array: 10 25 40 15 30. Drag each target to how many comparisons Linear Search needs.",
    buckets: [
      { id: "c1", label: "1 comparison" }, { id: "c3", label: "3 comparisons" }, { id: "c5", label: "5 comparisons" },
    ],
    items: [
      { text: "target = 10 (beginning)", bucket: "c1", why: "10 is the first value, so it is found immediately." },
      { text: "target = 40 (middle)", bucket: "c3", why: "The search checks 10 and 25 first, then finds 40 on the third comparison." },
      { text: "target = 30 (end)", bucket: "c5", why: "Every value before 30 must be checked first, so it takes all 5 comparisons." },
    ],
    explanation: "Where the target sits changes how many values Linear Search has to check before it is found.",
  },
  {
    id: "CH0080.p4.unsorted-ok", stage: "STG009", chapter: "CH0080", page: 4, heading: "Linear Search with Unsorted Data",
    kind: "reveal", title: "Tap to see Linear Search handle unsorted data",
    cards: [
      { label: "35  8  72  14  50   (target = 14)", body: "This array is NOT arranged from smallest to largest." },
      { label: "Search anyway: 35 -> 8 -> 72 -> 14", body: "Linear Search does not care about order - it just checks the next value, and finds 14 on the fourth check." },
    ],
    explanation: "Linear Search needs no preparation: it works directly on unsorted data because it never skips ahead.",
  },
  {
    id: "CH0080.p2.build-move", stage: "STG009", chapter: "CH0080", page: 2, heading: "How Does Linear Search Work?",
    kind: "builder", title: "Build the loop's move step",
    question: "Complete the for loop so it visits every position, one at a time.",
    template: "for (int i = 0; i < 5; {step})",
    slots: {
      step: { label: "update", options: ["i++", "i--", "i = i + 2"], answer: "i++", why: "i++ moves to the very next position each time, so no element is skipped." },
    },
    explanation: "for (int i = 0; i < 5; i++) visits index 0, 1, 2, 3, 4 in order, one at a time.",
  },
]);
