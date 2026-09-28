/*
 * CH0063 - Array Indexing and Accessing Element (Stage 6, STG007).
 *
 * Why these activities: the pages teach index -> position -> element as one flow, both reading and
 * changing a value. Students map indexes to values directly, work out which index reaches a given value,
 * see several access examples side by side, and assemble the statement that changes an element.
 */
ClickLearn.define([
  {
    id: "CH0063.p1.match-index-value", stage: "STG007", chapter: "CH0063", page: 1, heading: "What is Array Indexing?",
    kind: "assign", title: "Match each value to its index",
    question: "int marks[5] = {80, 90, 75, 85, 95}; - drag each value to its index.",
    buckets: [
      { id: "i0", label: "Index 0" }, { id: "i1", label: "Index 1" }, { id: "i2", label: "Index 2" },
      { id: "i3", label: "Index 3" }, { id: "i4", label: "Index 4" },
    ],
    items: [
      { text: "80", bucket: "i0", why: "80 is the first value, so it is at index 0." },
      { text: "90", bucket: "i1", why: "90 is the second value, so it is at index 1." },
      { text: "75", bucket: "i2", why: "75 is the third value, so it is at index 2." },
      { text: "85", bucket: "i3", why: "85 is the fourth value, so it is at index 3." },
      { text: "95", bucket: "i4", why: "95 is the fifth value, so it is at index 4, the last index." },
    ],
    explanation: "The first element is at index 0, so the last element of a 5-element array is at index 4.",
  },
  {
    id: "CH0063.p2.fill-third-index", stage: "STG007", chapter: "CH0063", page: 2, heading: "How Does Indexing Work?",
    kind: "fill", noRun: true, title: "Which index holds this value?",
    question: "Complete the index needed to print the fourth value.",
    code: "int numbers[5] = {10, 20, 30, 40, 50};\n\nprintf(\"%d\", numbers[___]);   // should print 40",
    blanks: [
      { answers: ["3"], hint: "The fourth value is one past index 2. Which index is that?" },
    ],
    explanation: "numbers[3] reads the fourth value, 40, since indexing starts at 0.",
  },
  {
    id: "CH0063.p3.access-cards", stage: "STG007", chapter: "CH0063", page: 3, heading: "Accessing an Element",
    kind: "reveal", title: "Tap each access to see which element it reads",
    intro: "int marks[5] = {85, 90, 78, 92, 88};",
    cards: [
      { label: "marks[0]", body: "Reads the FIRST element - index 0 - which is 85." },
      { label: "marks[2]", body: "Reads the THIRD element - index 2 - which is 78." },
      { label: "marks[4]", body: "Reads the LAST element - index size-1, here index 4 - which is 88." },
    ],
    explanation: "array[index] reads one element. The first index is 0 and the last is size - 1.",
  },
  {
    id: "CH0063.p4.build-change", stage: "STG007", chapter: "CH0063", page: 4, heading: "Changing an Element",
    kind: "builder", title: "Build the code to change an element",
    question: "Complete the code to change the third element of marks to 100.",
    template: "marks{index} = {value};",
    slots: {
      index: { label: "index", options: ["[0]", "[2]", "[5]"], answer: "[2]", why: "The third element is at index 2, since indexing starts at 0." },
      value: { label: "new value", options: ["100", "75", "5"], answer: "100", why: "We are replacing the old value with 100." },
    },
    explanation: "marks[2] = 100; replaces whatever was stored at index 2 with 100. Every other element is unchanged.",
  },
]);
