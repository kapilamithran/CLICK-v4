/*
 * CH0085 - Binary Search Algorithm (Stage 8, STG009).
 *
 * Why these activities: the PDF's own Slide 4 is a two-round dry run (low/high/mid/decision) for
 * target=60 in a 7-element array - a real step trace over the interpreter reproduces exactly that,
 * correctly showing mid recalculated fresh each round (a plain tracetable would show mid's stale value
 * at the moment the loop condition is checked, before that round's mid is computed, so a full step
 * trace is used instead for accuracy). The remaining activities build the mid formula, tie each
 * decision to the low/high update it causes, and sequence the algorithm's own steps.
 */
ClickLearn.define([
  {
    id: "CH0085.p4.dry-run-trace", stage: "STG009", chapter: "CH0085", page: 4, heading: "Dry Run: Binary Search Step by Step",
    kind: "trace", title: "Step through low, high and mid",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {10, 20, 30, 40, 50, 60, 70};",
      "   int target = 60;",
      "   int low = 0;",
      "   int high = 6;",
      "   int mid;",
      "",
      "   while (low <= high)",
      "   {",
      "      mid = (low + high) / 2;",
      "      if (numbers[mid] == target)",
      "      {",
      "         printf(\"Found\");",
      "         break;",
      "      }",
      "      else if (target < numbers[mid])",
      "      {",
      "         high = mid - 1;",
      "      }",
      "      else",
      "      {",
      "         low = mid + 1;",
      "      }",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "Round 1: mid=3, numbers[3]=40, 60>40 so low becomes 4. Round 2: mid=5, numbers[5]=60 - a match, so it prints Found.",
  },
  {
    id: "CH0085.p2.build-mid", stage: "STG009", chapter: "CH0085", page: 2, heading: "The Binary Search Steps",
    kind: "builder", title: "Build the mid formula",
    question: "Complete the formula that calculates the middle index from low and high.",
    template: "mid = (low + high) / {n}",
    slots: {
      n: { label: "divide by", options: ["1", "2", "3"], answer: "2", why: "Dividing the sum of low and high by 2 gives the index exactly halfway between them." },
    },
    explanation: "mid = (low + high) / 2 always points to the middle of the current search area.",
  },
  {
    id: "CH0085.p2.decision-to-action", stage: "STG009", chapter: "CH0085", page: 2, heading: "The Binary Search Steps",
    kind: "assign", title: "Match each decision to its action",
    question: "Drag each comparison result to what Binary Search does next.",
    buckets: [
      { id: "found", label: "Found - stop" }, { id: "left", label: "high = mid - 1 (search left)" }, { id: "right", label: "low = mid + 1 (search right)" },
    ],
    items: [
      { text: "target == numbers[mid]", bucket: "found", why: "An exact match means the target has been found." },
      { text: "target < numbers[mid]", bucket: "left", why: "A smaller target must be to the left, so high moves in to shrink the search area there." },
      { text: "target > numbers[mid]", bucket: "right", why: "A bigger target must be to the right, so low moves in to shrink the search area there." },
    ],
    explanation: "Every comparison with numbers[mid] leads to one of exactly three actions: stop, or move low or high.",
  },
  {
    id: "CH0085.p5.order-algorithm", stage: "STG009", chapter: "CH0085", page: 5, heading: "Binary Search Algorithm in One Flow",
    kind: "order", noRun: true, title: "Put the algorithm in order",
    question: "Arrange the Binary Search algorithm in the order the computer follows it.",
    lines: [
      "Start with the first and last positions.",
      "Find the middle position.",
      "Compare the target with the middle value.",
      "If equal, the target is found.",
      "If the target is smaller, move to the left half.",
      "If the target is larger, move to the right half.",
      "Repeat until found or no search area remains.",
    ],
    distractors: ["Swap the first and last elements."],
    explanation: "Binary Search always follows this same sequence: set the boundaries, find the middle, compare, and narrow the search area.",
  },
]);
