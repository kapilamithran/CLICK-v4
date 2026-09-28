/*
 * CH0091 - Selection Sort (Stage 8, STG009).
 *
 * Why these activities: a real step trace reproduces the PDF's own "find smallest, remember its
 * index, swap, sorted section grows" pattern; the PDF's own "Selection Sort Mental Model" flow becomes
 * an order activity; a matching activity ties each pass to the value it places (using the same array
 * as the trace, so the two stay consistent); and a builder activity practices the inner-loop comparison.
 */
ClickLearn.define([
  {
    id: "CH0091.p5.trace-selection", stage: "STG009", chapter: "CH0091", page: 5, heading: "Selection Sort in Action",
    kind: "trace", title: "Step through Selection Sort",
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
      "      int min = i;",
      "",
      "      for (int j = i + 1; j < n; j++)",
      "      {",
      "         if (arr[j] < arr[min])",
      "         {",
      "            min = j;",
      "         }",
      "      }",
      "",
      "      int temp = arr[i];",
      "      arr[i] = arr[min];",
      "      arr[min] = temp;",
      "   }",
      "",
      "   for (int k = 0; k < n; k++) printf(\"%d \", arr[k]);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "Pass 1 (i=0) finds min=3 (value 2) and swaps it into position 0: 2 3 8 5. Pass 3 (i=2) finds min=3 (value 5) and swaps: 2 3 5 8, fully sorted.",
  },
  {
    id: "CH0091.p5.order-mental-model", stage: "STG009", chapter: "CH0091", page: 5, heading: "Selection Sort in Action",
    kind: "order", noRun: true, title: "Selection Sort's mental model, in order",
    question: "Arrange Selection Sort's repeating pattern in the order it happens.",
    lines: [
      "Find the smallest value in the unsorted section.",
      "Remember its index.",
      "Swap it with the first unsorted position.",
      "The sorted section grows.",
      "Repeat.",
    ],
    distractors: ["Compare only neighboring elements."],
    explanation: "Selection Sort repeats this exact pattern until the whole array has been placed into the sorted section.",
  },
  {
    id: "CH0091.p5.match-pass-value", stage: "STG009", chapter: "CH0091", page: 5, heading: "Selection Sort in Action",
    kind: "assign", title: "Match each pass to the value it places",
    question: "Starting array: 5 3 8 2. Drag each pass to the value it places into the sorted section.",
    buckets: [
      { id: "v2", label: "2" }, { id: "v3", label: "3" }, { id: "v5", label: "5" },
    ],
    items: [
      { text: "Pass 1 (i = 0)", bucket: "v2", why: "2 is the smallest value in the whole array, so it is placed at position 0." },
      { text: "Pass 2 (i = 1)", bucket: "v3", why: "3 is the smallest of the remaining values {3, 8, 5}, and it is already at position 1." },
      { text: "Pass 3 (i = 2)", bucket: "v5", why: "5 is the smaller of the remaining values {8, 5}, so it is swapped into position 2, leaving 2 3 5 8." },
    ],
    explanation: "Each pass finds the smallest value left and places it at the front of the unsorted section.",
  },
  {
    id: "CH0091.p5.build-comparison", stage: "STG009", chapter: "CH0091", page: 5, heading: "Selection Sort in Action",
    kind: "builder", title: "Build the search comparison",
    question: "Complete the comparison the inner loop uses to look for a new smallest value.",
    template: "if (arr[j] {op} arr[min])",
    slots: {
      op: { label: "comparison", options: ["<", ">", "=="], answer: "<", why: "The search is looking for a value smaller than the current best guess, stored at arr[min]." },
    },
    explanation: "if (arr[j] < arr[min]) is how Selection Sort keeps searching for an even smaller value than the one currently remembered.",
  },
]);
