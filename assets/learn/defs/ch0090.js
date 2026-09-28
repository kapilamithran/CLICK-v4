/*
 * CH0090 - Bubble Sort (Stage 8, STG009).
 *
 * Why these activities: the PDF's own worked trace (5 3 8 2 -> 3 5 2 8 -> 3 2 5 8 -> 2 3 5 8) is
 * reproduced with a real step trace; the "what happened after each pass" bullets become a matching
 * activity; the outer-loop/inner-loop role split gets its own reveal; and the inner loop's shrinking
 * bound (n - i - 1) gets a builder activity, straight from the PDF's own "Why n - i - 1?" section.
 */
ClickLearn.define([
  {
    id: "CH0090.p3.trace-bubble", stage: "STG009", chapter: "CH0090", page: 3, heading: "Understanding a Bubble Sort Pass",
    kind: "trace", title: "Step through a full Bubble Sort",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int arr[] = {5, 3, 8, 2};",
      "   int n = 4;",
      "",
      "   for (int i = 0; i < n - 1; i++)",
      "   {",
      "      for (int j = 0; j < n - i - 1; j++)",
      "      {",
      "         if (arr[j] > arr[j + 1])",
      "         {",
      "            int temp = arr[j];",
      "            arr[j] = arr[j + 1];",
      "            arr[j + 1] = temp;",
      "         }",
      "      }",
      "   }",
      "",
      "   for (int k = 0; k < n; k++) printf(\"%d \", arr[k]);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "Pass 1 (i=0) turns 5 3 8 2 into 3 5 2 8. Pass 2 (i=1) turns it into 3 2 5 8. Pass 3 (i=2) turns it into the fully sorted 2 3 5 8.",
  },
  {
    id: "CH0090.p3.match-pass-value", stage: "STG009", chapter: "CH0090", page: 3, heading: "Understanding a Bubble Sort Pass",
    kind: "assign", title: "Match each pass to the value it places",
    question: "Starting array: 5 3 8 2. Drag each pass to the value that reaches its final position during that pass.",
    buckets: [
      { id: "v8", label: "8" }, { id: "v5", label: "5" }, { id: "v3", label: "3" },
    ],
    items: [
      { text: "Pass 1", bucket: "v8", why: "By the end of pass 1, the largest value, 8, has bubbled all the way to the end." },
      { text: "Pass 2", bucket: "v5", why: "By the end of pass 2, 5 has reached its correct position." },
      { text: "Pass 3", bucket: "v3", why: "By the end of pass 3, 3 has reached its correct position, leaving the array fully sorted." },
    ],
    explanation: "Each pass of Bubble Sort places exactly one more value into its final, correct position.",
  },
  {
    id: "CH0090.p4.loop-roles", stage: "STG009", chapter: "CH0090", page: 4, heading: "Bubble Sort in C",
    kind: "reveal", title: "Tap each loop to see its job",
    cards: [
      { label: "Outer loop  -  for (int i = 0; i < n - 1; i++)", body: "Controls the number of passes. For an array of n elements, Bubble Sort can require up to n - 1 passes." },
      { label: "Inner loop  -  for (int j = 0; j < n - i - 1; j++)", body: "Moves through the array during one pass, comparing neighboring elements arr[j] and arr[j + 1]." },
    ],
    explanation: "The outer loop creates passes; the inner loop compares neighbors; the if condition decides whether a swap is needed.",
  },
  {
    id: "CH0090.p4.build-inner-bound", stage: "STG009", chapter: "CH0090", page: 4, heading: "Bubble Sort in C",
    kind: "builder", title: "Build the inner loop's bound",
    question: "Complete the inner loop so it does not re-check the elements already sorted at the end.",
    template: "for (int j = 0; j < n - i - {n}; j++)",
    slots: {
      n: { label: "subtract", options: ["1", "0", "2"], answer: "1", why: "n - i - 1 skips the i elements already correctly placed at the end by earlier passes, and stops one before the last unsorted element so arr[j+1] stays in range." },
    },
    explanation: "for (int j = 0; j < n - i - 1; j++) shrinks by one every pass, since one more value is already sorted after each pass.",
  },
]);
