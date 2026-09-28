/*
 * CH0066 - Out-of-Bounds Errors & Safety (Stage 6, STG007).
 *
 * Why these activities: the pages teach that C never checks array bounds, so students must. Students
 * contrast a valid vs. out-of-bounds access, sort a mix of indexes, reason about why it's dangerous, and
 * assemble the range check that keeps an access safe.
 */
ClickLearn.define([
  {
    id: "CH0066.p1.valid-invalid-cards", stage: "STG007", chapter: "CH0066", page: 1, heading: "What is an Out-of-Bounds Error?",
    kind: "reveal", title: "Tap each access to see what happens",
    intro: "int numbers[5] = {10, 20, 30, 40, 50};",
    cards: [
      { label: "numbers[3]", body: "Valid: index 3 is within 0..4, so this reads 40, the fourth element." },
      { label: "numbers[5]", body: "Out-of-bounds: this array only has indexes 0..4. C does not stop this access, but the result is not defined - it might print garbage, or worse." },
    ],
    explanation: "A valid index always refers to a real element. An out-of-bounds index does not, and C will not warn you.",
  },
  {
    id: "CH0066.p2.sort-valid-invalid", stage: "STG007", chapter: "CH0066", page: 2, heading: "Valid vs Invalid Index",
    kind: "assign", title: "Sort valid from invalid indexes",
    question: "For int numbers[5]; - sort each index as valid or invalid.",
    buckets: [{ id: "valid", label: "Valid" }, { id: "invalid", label: "Invalid" }],
    items: [
      { text: "0", bucket: "valid", why: "0 is the first valid index." },
      { text: "4", bucket: "valid", why: "4 is the last valid index (size - 1)." },
      { text: "2", bucket: "valid", why: "2 is within 0 to 4." },
      { text: "-1", bucket: "invalid", why: "Negative indexes are always invalid." },
      { text: "5", bucket: "invalid", why: "5 equals the size, which is one past the last valid index." },
      { text: "6", bucket: "invalid", why: "6 is well past the end of a 5-element array." },
    ],
    explanation: "For a size-5 array, only 0, 1, 2, 3 and 4 are valid indexes.",
  },
  {
    id: "CH0066.p3.why-dangerous", stage: "STG007", chapter: "CH0066", page: 3, heading: "Why is it Dangerous?",
    kind: "mcq", title: "Why is it dangerous?",
    question: "Why is accessing an array out-of-bounds dangerous in C?",
    choices: [
      { text: "C automatically stops the program before it happens.", why: "C does NOT check bounds automatically - that is exactly the danger." },
      { text: "C does not check bounds, so it may read or write memory outside the array.", correct: true, why: "Correct: with no automatic check, an out-of-bounds access touches memory that does not belong to the array, with unpredictable results." },
      { text: "It always prints an error message.", why: "There is no guaranteed error message - the behavior is undefined, not consistent." },
      { text: "It only affects float arrays.", why: "This risk applies to arrays of any type, not just float." },
    ],
    explanation: "Unlike some other languages, C trusts the programmer to keep indexes valid - it performs no automatic bounds check.",
  },
  {
    id: "CH0066.p4.build-safety-check", stage: "STG007", chapter: "CH0066", page: 4, heading: "How to Stay Safe",
    kind: "builder", title: "Build the safety check",
    question: "Complete the condition that only allows a safe access into a 5-element array.",
    template: "if (i >= 0 && i {op} 5) {",
    slots: {
      op: { label: "comparison", options: ["<", "<=", "=="], answer: "<", why: "i < 5 allows exactly indexes 0 through 4; i <= 5 would wrongly allow the out-of-bounds index 5." },
    },
    explanation: "if (i >= 0 && i < 5) is TRUE only when i is a valid index for a 5-element array.",
  },
]);
