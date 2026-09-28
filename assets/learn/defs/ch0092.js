/*
 * CH0092 - Insertion Sort (Stage 8, STG009).
 *
 * Why these activities: a real step trace reproduces the PDF's own worked example exactly; the PDF's
 * own "Code Flow" (select key -> look left -> shift -> insert) becomes an order activity; its own
 * "Why Do We Move Instead of Immediately Swapping?" section becomes a reveal; and a builder activity
 * practices the while-loop's shifting condition.
 */
ClickLearn.define([
  {
    id: "CH0092.p5.trace-insertion", stage: "STG009", chapter: "CH0092", page: 5, heading: "Complete Insertion Sort Process",
    kind: "trace", title: "Step through Insertion Sort",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int arr[] = {5, 3, 8, 2};",
      "   int n = 4;",
      "",
      "   for (int i = 1; i < n; i++)",
      "   {",
      "      int key = arr[i];",
      "      int j = i - 1;",
      "",
      "      while (j >= 0 && arr[j] > key)",
      "      {",
      "         arr[j + 1] = arr[j];",
      "         j--;",
      "      }",
      "",
      "      arr[j + 1] = key;",
      "   }",
      "",
      "   for (int k = 0; k < n; k++) printf(\"%d \", arr[k]);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "i=1: key=3 shifts 5 right, inserts 3 -> 3 5 8 2. i=2: key=8 is already bigger than 5, no shift -> 3 5 8 2. i=3: key=2 shifts 8, 5 and 3 right, inserts 2 -> 2 3 5 8.",
  },
  {
    id: "CH0092.p5.order-mental-model", stage: "STG009", chapter: "CH0092", page: 5, heading: "Complete Insertion Sort Process",
    kind: "order", noRun: true, title: "Insertion Sort's mental model, in order",
    question: "Arrange Insertion Sort's repeating pattern in the order it happens.",
    lines: [
      "Select one element and call it key.",
      "Look at the element before it.",
      "Shift larger elements one position right.",
      "Find the correct position.",
      "Insert the key there.",
    ],
    distractors: ["Compare it with every element in the array."],
    explanation: "key stores the element being inserted, j searches backward, larger elements shift right, and finally the key is placed into the empty position.",
  },
  {
    id: "CH0092.p2.why-shift-not-swap", stage: "STG009", chapter: "CH0092", page: 2, heading: "Inserting an Element",
    kind: "reveal", title: "Tap to see why Insertion Sort shifts instead of swapping",
    cards: [
      { label: "5 3   (before)", body: "key = 3 needs to go before 5." },
      { label: "5 5   (shift, not swap)", body: "5 moves right to make room - it is not exchanged with 3 the way Bubble Sort would swap neighbors." },
      { label: "3 5   (insert)", body: "Now that there is a gap, key (3) is placed into it. Only one value moved; nothing was swapped back and forth." },
    ],
    explanation: "Insertion Sort normally shifts larger elements to the right rather than repeatedly swapping neighboring elements - this makes room for the key to be inserted directly.",
  },
  {
    id: "CH0092.p4.build-while", stage: "STG009", chapter: "CH0092", page: 4, heading: "Insertion Sort in C",
    kind: "builder", title: "Build the shifting condition",
    question: "Complete the condition that keeps shifting elements while they are bigger than the key.",
    template: "while (j >= 0 && arr[j] {op} key)",
    slots: {
      op: { label: "comparison", options: [">", "<", "=="], answer: ">", why: "Only elements bigger than the key need to move out of its way; anything smaller or equal is already in the correct order relative to key." },
    },
    explanation: "while (j >= 0 && arr[j] > key) shifts elements right as long as they are bigger than the key and there is still array left to check.",
  },
]);
