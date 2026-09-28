/*
 * CH0087 - Linear Search vs Binary Search: Quick Recap (Stage 8, STG009).
 *
 * This source PDF has no embedded quiz (it is a plain-text recap chapter), so all activities here are
 * built directly from its own worked comparison (the same array and target run through both methods),
 * its own feature-comparison table, its own decision framework, and its own "Final Mental Model" list -
 * no outside curriculum is introduced.
 */
ClickLearn.define([
  {
    id: "CH0087.p3.trace-comparison", stage: "STG009", chapter: "CH0087", page: 3, heading: "Linear Search vs Binary Search Example",
    kind: "trace", title: "Watch both searches run",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {10, 20, 30, 40, 50, 60, 70};",
      "   int target = 70;",
      "   int lin = 0, bin = 0;",
      "",
      "   for (int i = 0; i < 7; i++)",
      "   {",
      "      lin++;",
      "      if (numbers[i] == target) break;",
      "   }",
      "",
      "   int low = 0, high = 6, mid;",
      "   while (low <= high)",
      "   {",
      "      mid = (low + high) / 2;",
      "      bin++;",
      "      if (numbers[mid] == target) break;",
      "      else if (target < numbers[mid]) high = mid - 1;",
      "      else low = mid + 1;",
      "   }",
      "",
      "   printf(\"Linear: %d, Binary: %d\", lin, bin);",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "For the same array and target, Linear Search checks all 7 elements (lin = 7) while Binary Search checks the middle of what is left only 3 times (40, then 60, then 70), so bin = 3.",
  },
  {
    id: "CH0087.p4.compare-features", stage: "STG009", chapter: "CH0087", page: 4, heading: "Comparing Linear Search and Binary Search",
    kind: "assign", title: "Sort each feature into the right method",
    question: "Drag each feature to the method it describes.",
    buckets: [
      { id: "linear", label: "Linear Search" }, { id: "binary", label: "Binary Search" },
    ],
    items: [
      { text: "Can search sorted or unsorted data", bucket: "linear", why: "Linear Search checks values in order, regardless of whether the array is sorted." },
      { text: "Must have sorted data", bucket: "binary", why: "Binary Search's halving strategy only works when the data is in order." },
      { text: "Starts at the first element", bucket: "linear", why: "Linear Search always begins checking from the beginning." },
      { text: "Starts at the middle element", bucket: "binary", why: "Binary Search always begins by checking the middle of the search area." },
      { text: "Reduces the search area by one element at a time", bucket: "linear", why: "Each check in Linear Search rules out only the one element just checked." },
      { text: "Reduces the search area by about half each time", bucket: "binary", why: "Each check in Binary Search throws away roughly half of what remains." },
    ],
    explanation: "The two methods differ in exactly these three ways: what data they need, where they start, and how fast the search area shrinks.",
  },
  {
    id: "CH0087.p5.decision-tree", stage: "STG009", chapter: "CH0087", page: 5, heading: "Which Search Should You Use?",
    kind: "reveal", title: "Tap to see when to use each method",
    cards: [
      { label: "Data is small, or not sorted", body: "Use Linear Search: sorting the data first would not be worth the extra work." },
      { label: "Data is sorted AND large", body: "Use Binary Search: it can eliminate huge portions of the array very quickly." },
    ],
    explanation: "The right question is not \"which algorithm is faster?\" but \"what kind of data do I have?\"",
  },
  {
    id: "CH0087.p5.order-mental-model", stage: "STG009", chapter: "CH0087", page: 5, heading: "Which Search Should You Use?",
    kind: "order", noRun: true, title: "Binary Search's mental model, in order",
    question: "Arrange Binary Search's repeating pattern in the order it happens.",
    lines: [
      "Look at the middle.",
      "Choose the correct half.",
      "Look at the middle again.",
      "Choose the correct half.",
      "Repeat.",
    ],
    distractors: ["Check every element from the start."],
    explanation: "Binary Search gets its advantage from repeating this same look-and-choose pattern, using information about the order of the data.",
  },
]);
