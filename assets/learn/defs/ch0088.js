/*
 * CH0088 - Sorting Basics (Stage 8, STG009).
 *
 * This source PDF has no embedded quiz, so activities are built from its own worked example (before/
 * after arrays with the same values), its own four-item "why sort" list, its own sorting flow diagram,
 * and its own three-algorithm preview list - no outside curriculum introduced.
 */
ClickLearn.define([
  {
    id: "CH0088.p1.sorted-or-not", stage: "STG009", chapter: "CH0088", page: 1, heading: "Understanding Sorting",
    kind: "assign", title: "Sorted or unsorted?",
    question: "Decide whether each set of values is already sorted in ascending order.",
    buckets: [
      { id: "sorted", label: "Sorted" }, { id: "unsorted", label: "Unsorted" },
    ],
    items: [
      { text: "40 10 30 20", bucket: "unsorted", why: "The values do not increase from left to right." },
      { text: "10 20 30 40", bucket: "sorted", why: "Each value is larger than the one before it - ascending order." },
      { text: "67 12 89 23 5 45", bucket: "unsorted", why: "The values jump around with no order." },
      { text: "5 12 23 45 67 89", bucket: "sorted", why: "Each value is larger than the one before it." },
    ],
    explanation: "Sorting rearranges a set of values like 40 10 30 20 into 10 20 30 40 - the same four numbers, now in order.",
  },
  {
    id: "CH0088.p2.why-sort", stage: "STG009", chapter: "CH0088", page: 2, heading: "Why Do We Sort Data?",
    kind: "reveal", title: "Tap each reason to see why sorting helps",
    cards: [
      { label: "Easier to read", body: "10 20 40 50 80 is much easier for a person to read than 50 10 80 20 40." },
      { label: "Easier to analyze", body: "Once sorted, the smallest value is always first and the largest is always last." },
      { label: "Easier to search", body: "Some searching methods, such as Binary Search, require the data to already be sorted." },
      { label: "Easier to organize", body: "Sorted marks, prices or scores are naturally arranged from lowest to highest (or the reverse)." },
    ],
    explanation: "Sorting is not just about making numbers look neat - organized data can make reading, analyzing, searching and processing easier.",
  },
  {
    id: "CH0088.p4.sort-flow", stage: "STG009", chapter: "CH0088", page: 4, heading: "Sorting Numbers Step by Step",
    kind: "order", noRun: true, title: "The general sorting flow",
    question: "Arrange the steps every sorting algorithm repeats.",
    lines: [
      "Start with unsorted data.",
      "Compare values.",
      "Move or rearrange values.",
      "Repeat with more comparisons.",
      "End with sorted data.",
    ],
    distractors: ["Delete the smallest value."],
    explanation: "Every sorting algorithm follows this same broad idea, even though Bubble Sort, Selection Sort and Insertion Sort each compare and move values differently.",
  },
  {
    id: "CH0088.p5.match-algorithm", stage: "STG009", chapter: "CH0088", page: 5, heading: "Sorting in C",
    kind: "assign", title: "Match each algorithm to its idea",
    question: "Drag each algorithm to the phrase that describes it.",
    buckets: [
      { id: "b1", label: "Repeatedly compares neighboring elements" }, { id: "b2", label: "Repeatedly selects the smallest remaining element" }, { id: "b3", label: "Takes an element and inserts it into its correct position" },
    ],
    items: [
      { text: "Bubble Sort", bucket: "b1", why: "Bubble Sort compares two neighboring values and swaps them if they are in the wrong order." },
      { text: "Selection Sort", bucket: "b2", why: "Selection Sort looks for the smallest remaining value and places it into its correct position." },
      { text: "Insertion Sort", bucket: "b3", why: "Insertion Sort takes one value at a time and inserts it where it belongs among the values already sorted." },
    ],
    explanation: "The three algorithms share the same goal but reach it with different strategies for comparing and moving values.",
  },
]);
