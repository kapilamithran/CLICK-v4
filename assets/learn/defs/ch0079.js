/*
 * CH0079 - Searching Basics (Stage 8, STG009).
 *
 * Why these activities: the PDF introduces searching as "find a target, report Found or Not Found",
 * then contrasts Linear Search ("one by one") with Binary Search ("divide into two"). Students need
 * to (1) tell Found from Not Found from a worked example, (2) tie the four core words to their
 * meanings, (3) see the Linear-vs-Binary mental model, and (4) assemble the comparison a search uses.
 */
ClickLearn.define([
  {
    id: "CH0079.p1.found-or-not", stage: "STG009", chapter: "CH0079", page: 1, heading: "What is Searching?",
    kind: "assign", title: "Found or Not Found?",
    question: "For each array and target, decide the result.",
    buckets: [
      { id: "found", label: "Found" }, { id: "notfound", label: "Not Found" },
    ],
    items: [
      { text: "10 25 40 15 30, target = 15", bucket: "found", why: "15 is the fourth value in the array, so it is found." },
      { text: "10 25 40 15 30, target = 50", bucket: "notfound", why: "None of the five values is 50, so it is not found." },
      { text: "12 25 8 40 17, target = 8", bucket: "found", why: "8 is the third value in the array, so it is found." },
      { text: "12 25 8 40 17, target = 99", bucket: "notfound", why: "99 does not appear anywhere in the array." },
    ],
    explanation: "A search always ends in one of two results: Found (the target exists) or Not Found (it does not).",
  },
  {
    id: "CH0079.p1.match-terms", stage: "STG009", chapter: "CH0079", page: 1, heading: "What is Searching?",
    kind: "assign", title: "Match each word to its meaning",
    question: "Drag each word to what it means.",
    buckets: [
      { id: "b1", label: "Finding a value in a collection" }, { id: "b2", label: "The value we want to find" },
      { id: "b3", label: "The target exists" }, { id: "b4", label: "The target does not exist" },
    ],
    items: [
      { text: "Searching", bucket: "b1", why: "Searching is the process of finding a particular value from a collection." },
      { text: "Target", bucket: "b2", why: "The target is the value the search is looking for." },
      { text: "Found", bucket: "b3", why: "Found means the target was located in the collection." },
      { text: "Not Found", bucket: "b4", why: "Not Found means every value was checked and none matched the target." },
    ],
    explanation: "Searching looks for a target; the result is either Found or Not Found.",
  },
  {
    id: "CH0079.p2.search-methods", stage: "STG009", chapter: "CH0079", page: 2, heading: "Target, Found & Not Found",
    kind: "reveal", title: "Tap each method to see how it searches",
    cards: [
      { label: "Linear Search", body: "Checks values one by one, from the beginning. Works even when the data is not sorted." },
      { label: "Binary Search", body: "Repeatedly divides the search area into two parts. Requires the data to be sorted." },
    ],
    explanation: "Linear = one by one. Binary = divide into two. Both report the same two results: Found or Not Found.",
  },
  {
    id: "CH0079.p3.build-check", stage: "STG009", chapter: "CH0079", page: 3, heading: "Types of Searching",
    kind: "builder", title: "Build the search check",
    question: "Complete the check that compares one array element with the target.",
    template: "if (numbers[i] {op} target)",
    slots: {
      op: { label: "comparison", options: ["==", "=", "!="], answer: "==", why: "== checks whether two values are equal; = would assign a value instead of comparing." },
    },
    explanation: "if (numbers[i] == target) is how a search checks one element against the target.",
  },
]);
