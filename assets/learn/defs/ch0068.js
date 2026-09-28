/*
 * CH0068 - Searching in an Array (Stage 6, STG007).
 *
 * Why these activities: the pages build linear search up in stages: compare, find the position with break,
 * then track found/not found. Students walk through the comparisons themselves, build the equality check,
 * trace a search that reports an index, and match scenarios to their correct Found/Not Found result.
 */
ClickLearn.define([
  {
    id: "CH0068.p1.search-walkthrough", stage: "STG007", chapter: "CH0068", page: 1, heading: "What is Searching in an Array?",
    kind: "reveal", title: "Tap each comparison in the search",
    intro: "int numbers[5] = {10, 20, 30, 40, 50}; searching for 30.",
    cards: [
      { label: "Step 1: numbers[0] = 10", body: "10 == 30? No match, keep going." },
      { label: "Step 2: numbers[1] = 20", body: "20 == 30? No match, keep going." },
      { label: "Step 3: numbers[2] = 30", body: "30 == 30? Match! Found at index 2." },
    ],
    explanation: "Linear search checks each element in order until it finds a match, or runs out of elements.",
  },
  {
    id: "CH0068.p2.build-comparison", stage: "STG007", chapter: "CH0068", page: 2, heading: "Linear Search",
    kind: "builder", title: "Build the comparison",
    question: "Complete the condition that checks whether the current element matches the key.",
    template: "if (numbers[i] {op} key) {",
    slots: {
      op: { label: "operator", options: ["==", "=", "!="], answer: "==", why: "== compares two values for equality; a single = would assign key into numbers[i] instead." },
    },
    explanation: "if (numbers[i] == key) is TRUE exactly when the current element equals the key being searched for.",
  },
  {
    id: "CH0068.p3.trace-find-position", stage: "STG007", chapter: "CH0068", page: 3, heading: "Finding the Position",
    kind: "trace", title: "Trace finding the position",
    code: "int numbers[5] = {10, 20, 30, 40, 50};\nint key = 40;\nfor (int i = 0; i < 5; i++) {\n   if (numbers[i] == key) {\n      printf(\"Found at index %d\", i);\n      break;\n   }\n}",
    explanation: "The loop checks index 0, 1, 2, then finds the match at index 3 and stops with break - never checking index 4.",
  },
  {
    id: "CH0068.p4.match-scenario-result", stage: "STG007", chapter: "CH0068", page: 4, heading: "Found or Not Found",
    kind: "assign", title: "Found or not found?",
    question: "int numbers[5] = {10, 20, 30, 40, 50}; - match each search to its result.",
    buckets: [{ id: "found", label: "Found" }, { id: "notfound", label: "Not Found" }],
    items: [
      { text: "key = 30", bucket: "found", why: "30 is in the array (at index 2), so it is Found." },
      { text: "key = 10", bucket: "found", why: "10 is in the array (at index 0), so it is Found." },
      { text: "key = 60", bucket: "notfound", why: "60 does not appear anywhere in the array, so found stays 0: Not Found." },
      { text: "key = 100", bucket: "notfound", why: "100 does not appear anywhere in the array: Not Found." },
    ],
    explanation: "found only becomes 1 when the key matches an element. If it never does, the result is Not Found.",
  },
]);
