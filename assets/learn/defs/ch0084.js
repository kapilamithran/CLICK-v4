/*
 * CH0084 - Binary Search Basics (Stage 8, STG009).
 *
 * Why these activities: this chapter is entirely conceptual in the source (no full low/high loop yet
 * - that arrives in the next two chapters), so the activities stay at the same level: (1) telling
 * sorted from unsorted, since that is the one requirement Binary Search adds, (2) the three-way
 * decision the PDF itself names, (3) building that decision as a comparison, and (4) predicting which
 * half a given target/middle pair leads to.
 */
ClickLearn.define([
  {
    id: "CH0084.p2.sorted-or-not", stage: "STG009", chapter: "CH0084", page: 2, heading: "Why Must the Array Be Sorted?",
    kind: "assign", title: "Sorted or unsorted?",
    question: "Decide whether each array is sorted (which Binary Search needs).",
    buckets: [
      { id: "sorted", label: "Sorted" }, { id: "unsorted", label: "Unsorted" },
    ],
    items: [
      { text: "10 20 30 40 50 60", bucket: "sorted", why: "Each value is larger than the one before it - ascending order." },
      { text: "40 10 60 20 50 30", bucket: "unsorted", why: "The values jump up and down with no order." },
      { text: "5 12 30 45 67 89", bucket: "sorted", why: "Each value is larger than the one before it." },
      { text: "50 10 70 20 40 30", bucket: "unsorted", why: "The values are not arranged from smallest to largest." },
    ],
    explanation: "Binary Search can only safely ignore a half when the data is sorted; on unsorted data, the middle value tells you almost nothing.",
  },
  {
    id: "CH0084.p3.three-decisions", stage: "STG009", chapter: "CH0084", page: 3, heading: "The Power of the Middle Element",
    kind: "reveal", title: "Tap each outcome to see what it means",
    cards: [
      { label: "target == middle", body: "The target has been found - the search stops here." },
      { label: "target < middle", body: "The target must be smaller than everything to the right of the middle, so the search continues in the left half." },
      { label: "target > middle", body: "The target must be bigger than everything to the left of the middle, so the search continues in the right half." },
    ],
    explanation: "Every comparison with the middle value leads to exactly one of these three outcomes.",
  },
  {
    id: "CH0084.p3.build-decision", stage: "STG009", chapter: "CH0084", page: 3, heading: "The Power of the Middle Element",
    kind: "builder", title: "Build the decision for the right half",
    question: "Complete the comparison that means the target must be searched for in the right half.",
    template: "if (target {op} numbers[mid])",
    slots: {
      op: { label: "comparison", options: [">", "<", "=="], answer: ">", why: "target > numbers[mid] means the target is bigger than the middle, so (in a sorted ascending array) it must be to the right." },
    },
    explanation: "if (target > numbers[mid]) is the check that sends Binary Search into the right half.",
  },
  {
    id: "CH0084.p1.predict-half", stage: "STG009", chapter: "CH0084", page: 1, heading: "Meet Binary Search",
    kind: "predict", title: "Predict the decision",
    code: [
      "int numbers[] = {10, 20, 30, 40, 50, 60, 70};",
      "int target = 20;",
      "int mid = 3;",
      "",
      "if (target > numbers[mid])",
      "   printf(\"Search right half\");",
      "else if (target < numbers[mid])",
      "   printf(\"Search left half\");",
      "else",
      "   printf(\"Found\");",
    ].join("\n"),
    question: "numbers[mid] is 40. What does this print?",
    choices: ["Search right half", "Search left half", "Found", "Not Found"],
    expected: "Search left half",
    explanation: "20 is smaller than 40, so the condition target < numbers[mid] is true, and the program searches the left half.",
  },
]);
