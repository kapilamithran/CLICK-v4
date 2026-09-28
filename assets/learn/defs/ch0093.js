/*
 * CH0093 - Comparing Sorting Methods (Stage 8, STG009).
 *
 * This source PDF has no embedded quiz, so activities are built from its own comparison table, its
 * own "A Useful Way to Identify the Algorithm" clue list, its own "Quick Memory Table", and its own
 * opening statement of what all three algorithms share as a goal - no outside curriculum introduced.
 */
ClickLearn.define([
  {
    id: "CH0093.p1.trace-bubble", stage: "STG009", chapter: "CH0093", page: 1, heading: "Three Sorting Methods",
    kind: "trace", title: "Watch one sort reach the answer",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int a[] = {5, 3, 8, 2};",
      "   int n = 4;",
      "",
      "   for (int i = 0; i < n - 1; i++)",
      "      for (int j = 0; j < n - i - 1; j++)",
      "         if (a[j] > a[j + 1])",
      "         {",
      "            int t = a[j];",
      "            a[j] = a[j + 1];",
      "            a[j + 1] = t;",
      "         }",
      "",
      "   printf(\"%d %d %d %d\", a[0], a[1], a[2], a[3]);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "This is Bubble Sort taking 5 3 8 2 to 2 3 5 8. Selection Sort and Insertion Sort (traced in the previous two chapters) reach the exact same result from the same starting array, just by comparing and moving values differently.",
  },
  {
    id: "CH0093.p3.identify-algorithm", stage: "STG009", chapter: "CH0093", page: 3, heading: "Beginner-Level Comparison",
    kind: "assign", title: "Identify the algorithm from a clue",
    question: "Drag each description of what the code looks at to the algorithm it belongs to.",
    buckets: [
      { id: "bubble", label: "Bubble Sort" }, { id: "selection", label: "Selection Sort" }, { id: "insertion", label: "Insertion Sort" },
    ],
    items: [
      { text: "Adjacent elements are compared", bucket: "bubble", why: "Bubble Sort always compares two neighboring elements." },
      { text: "A minimum element is searched for", bucket: "selection", why: "Selection Sort searches the unsorted section for the smallest value." },
      { text: "Elements are shifted to make space", bucket: "insertion", why: "Insertion Sort shifts larger elements right instead of swapping." },
    ],
    explanation: "When reading unfamiliar C code, spotting which of these three behaviors it does is the fastest way to identify which sorting algorithm it is.",
  },
  {
    id: "CH0093.p1.quick-memory", stage: "STG009", chapter: "CH0093", page: 1, heading: "Three Sorting Methods",
    kind: "reveal", title: "Tap each algorithm for its memory phrase",
    cards: [
      { label: "Bubble Sort", body: "Think: \"Compare neighbors.\"" },
      { label: "Selection Sort", body: "Think: \"Find the smallest.\"" },
      { label: "Insertion Sort", body: "Think: \"Insert into the sorted part.\"" },
    ],
    explanation: "If you can remember these three phrases, you already have the basic mental model for each algorithm.",
  },
  {
    id: "CH0093.p1.build-goal", stage: "STG009", chapter: "CH0093", page: 1, heading: "Three Sorting Methods",
    kind: "builder", title: "Build the shared goal",
    question: "Complete the sentence describing what every sorting algorithm in this chapter tries to do.",
    template: "Take an unsorted array and rearrange its elements into the {goal}.",
    slots: {
      goal: { label: "goal", options: ["required order", "same values", "original order"], answer: "required order", why: "Sorting rearranges values into whatever order (ascending or descending) is required - it does not change the values or leave them as they were." },
    },
    explanation: "All three algorithms have the same destination; they simply take different routes to get there.",
  },
]);
