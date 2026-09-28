/*
 * CH0064 - Initializing Array (Stage 6, STG007).
 *
 * Why these activities: the pages show three ways to initialize (explicit size, auto-size, partial),
 * plus character arrays and strings. Students map values to indexes, recognize the auto-size syntax,
 * see character/string examples side by side, and choose the right data type for a real example.
 */
ClickLearn.define([
  {
    id: "CH0064.p1.match-index-value", stage: "STG007", chapter: "CH0064", page: 1, heading: "What is Array Initialization?",
    kind: "assign", title: "Match each value to its index",
    question: "int marks[5] = {80, 90, 75, 85, 95}; - drag each value to its index.",
    buckets: [
      { id: "i0", label: "Index 0" }, { id: "i1", label: "Index 1" }, { id: "i2", label: "Index 2" },
      { id: "i3", label: "Index 3" }, { id: "i4", label: "Index 4" },
    ],
    items: [
      { text: "80", bucket: "i0", why: "80 is the first value written, so it is at index 0." },
      { text: "90", bucket: "i1", why: "90 is the second value written, so it is at index 1." },
      { text: "75", bucket: "i2", why: "75 is the third value written, so it is at index 2." },
      { text: "85", bucket: "i3", why: "85 is the fourth value written, so it is at index 3." },
      { text: "95", bucket: "i4", why: "95 is the fifth value written, so it is at index 4." },
    ],
    explanation: "Initialization stores values left to right, starting at index 0.",
  },
  {
    id: "CH0064.p2.spot-auto-size", stage: "STG007", chapter: "CH0064", page: 2, heading: "Different Ways to Initialize",
    kind: "mcq", title: "Spot the auto-size declaration",
    question: "Which declaration lets C count the array's size automatically?",
    choices: [
      { text: "int numbers[4] = {1, 2, 3, 4};", why: "This works, but the size 4 is written explicitly - C is not asked to count it." },
      { text: "int numbers[] = {1, 2, 3, 4};", correct: true, why: "The brackets are empty, so C counts the 4 values in { } and makes the array exactly that size." },
      { text: "int numbers = {1, 2, 3, 4};", why: "This is missing the array brackets entirely - it is not a valid array declaration." },
      { text: "int numbers[4];", why: "This declares the size but gives no values at all." },
    ],
    explanation: "int numbers[] = {...}; leaves the size empty; C counts the values you give it and uses that count as the size.",
  },
  {
    id: "CH0064.p3.char-array-cards", stage: "STG007", chapter: "CH0064", page: 3, heading: "Character Array Initialization",
    kind: "reveal", title: "Tap each character array to see how it's stored",
    cards: [
      { label: "char vowels[5] = {'a', 'e', 'i', 'o', 'u'};", body: "Stores 5 separate characters, one per element - no \\0 is added, because this is not a string literal." },
      { label: "char name[] = \"Vicky\";", body: "Stores the 5 letters of \"Vicky\" plus one extra element, \\0, marking the end of the string - 6 elements in total." },
    ],
    explanation: "A character array can hold plain characters, or a string (characters plus a closing \\0) when initialized from \"text\".",
  },
  {
    id: "CH0064.p4.build-temperature-array", stage: "STG007", chapter: "CH0064", page: 4, heading: "Initializing Arrays in Programs",
    kind: "builder", title: "Build an array for temperatures",
    question: "Complete the declaration for an array of 3 temperatures with decimal points.",
    template: "{type} temp[3] = {30.5, 31.2, 29.8};",
    slots: {
      type: { label: "data type", options: ["int", "float", "char"], answer: "float", why: "Temperatures like 30.5 have a decimal part, so they need float, not int or char." },
    },
    explanation: "float temp[3] = {30.5, 31.2, 29.8}; stores 3 decimal temperatures.",
  },
]);
