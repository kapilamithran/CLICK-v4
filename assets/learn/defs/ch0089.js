/*
 * CH0089 - Sorting in Ascending & Descending Order (Stage 8, STG009).
 *
 * This source PDF has no embedded quiz, so activities are built from its own worked examples: the
 * exact swap-condition table (ascending arr[j]>arr[j+1], descending arr[j]<arr[j+1]), its own broken
 * "arr[i]=arr[j]; arr[j]=arr[i];" counter-example and the fix with temp, and its own comparison table.
 */
ClickLearn.define([
  {
    id: "CH0089.p4.trace-swap", stage: "STG009", chapter: "CH0089", page: 4, heading: "Swapping Two Values",
    kind: "trace", title: "Step through a swap",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int arr[] = {20, 10};",
      "   int i = 0, j = 1;",
      "",
      "   int temp;",
      "   temp = arr[i];",
      "   arr[i] = arr[j];",
      "   arr[j] = temp;",
      "",
      "   printf(\"%d %d\", arr[0], arr[1]);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "temp saves 20 before it is overwritten. arr[i] becomes 10, then arr[j] becomes the 20 that was safely kept in temp.",
  },
  {
    id: "CH0089.p2.build-condition", stage: "STG009", chapter: "CH0089", page: 2, heading: "Understanding Descending Order",
    kind: "builder", title: "Build the right swap condition",
    question: "You want DESCENDING order (larger values first). Complete the condition that swaps two out-of-order neighbors.",
    template: "if (arr[j] {op} arr[j + 1])",
    slots: {
      op: { label: "comparison", options: [">", "<", "=="], answer: "<", why: "For descending order, larger values should come first, so swap when the left value is smaller than the right." },
    },
    explanation: "if (arr[j] < arr[j + 1]) is the swap condition for descending order - the opposite of ascending order's arr[j] > arr[j + 1].",
  },
  {
    id: "CH0089.p4.why-temp", stage: "STG009", chapter: "CH0089", page: 4, heading: "Swapping Two Values",
    kind: "reveal", title: "Tap to see why the shortcut fails",
    cards: [
      { label: "arr[i] = 20;  arr[j] = 10;  (before)", body: "We want to end up with arr[i] = 10 and arr[j] = 20." },
      { label: "arr[i] = arr[j];   (a common mistake)", body: "Now arr[i] = 10, but arr[j] is still 10 too - the original 20 has already been overwritten and is gone." },
      { label: "arr[j] = arr[i];   (too late)", body: "This just copies 10 again. The swap has failed: both positions now hold 10." },
    ],
    explanation: "Once arr[i]'s original value is overwritten, it cannot be recovered - that is exactly the value a temporary variable is meant to protect.",
  },
  {
    id: "CH0089.p3.match-order", stage: "STG009", chapter: "CH0089", page: 3, heading: "Comparing Two Elements",
    kind: "assign", title: "Match the order to its rule",
    question: "Drag each fact to Ascending or Descending order.",
    buckets: [
      { id: "asc", label: "Ascending" }, { id: "desc", label: "Descending" },
    ],
    items: [
      { text: "Smaller values come first", bucket: "asc", why: "Ascending order arranges values from smallest to largest." },
      { text: "Larger values come first", bucket: "desc", why: "Descending order arranges values from largest to smallest." },
      { text: "Swap when arr[j] > arr[j + 1]", bucket: "asc", why: "If the left value is bigger, it is out of place for ascending order." },
      { text: "Swap when arr[j] < arr[j + 1]", bucket: "desc", why: "If the left value is smaller, it is out of place for descending order." },
    ],
    explanation: "The swap logic stays the same shape for both orders - only the comparison operator flips.",
  },
]);
