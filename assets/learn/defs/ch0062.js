/*
 * CH0062 - Introduction to Array (Stage 6, STG007).
 *
 * Why these activities: the pages introduce the array as "one name, many values, indexed from 0". Students
 * need to (1) work out a missing value from its position, (2) assemble the declaration syntax themselves,
 * (3) map indexes to values directly, and (4) see that an array's data type applies to every element.
 */
ClickLearn.define([
  {
    id: "CH0062.p1.fill-missing-value", stage: "STG007", chapter: "CH0062", page: 1, heading: "What is an Array?",
    kind: "fill", noRun: true, title: "Fill in the missing value",
    question: "This array stores 5 numbers in order. What value is missing?",
    code: "int numbers[5] = {10, 20, ___, 40, 50};",
    blanks: [
      { answers: ["30"], hint: "Index 0 is 10, index 1 is 20 - what comes next, at index 2?" },
    ],
    explanation: "Values are stored in the order they are written: index 0 is 10, index 1 is 20, index 2 is 30.",
  },
  {
    id: "CH0062.p2.build-declaration", stage: "STG007", chapter: "CH0062", page: 2, heading: "How Does an Array Work?",
    kind: "builder", title: "Build the array declaration",
    question: "Complete a declaration for an array of 5 whole numbers, named marks.",
    template: "{type} marks{size};",
    slots: {
      type: { label: "data type", options: ["int", "float", "char"], answer: "int", why: "We need whole numbers, and int is C's data type for whole numbers." },
      size: { label: "size", options: ["[3]", "[5]", "[10]"], answer: "[5]", why: "The array needs exactly 5 positions, one for each mark." },
    },
    explanation: "int marks[5]; reserves 5 positions, each able to hold one whole number.",
  },
  {
    id: "CH0062.p2.match-index-value", stage: "STG007", chapter: "CH0062", page: 2, heading: "How Does an Array Work?",
    kind: "assign", title: "Match each index to its value",
    question: "int marks[5] = {85, 90, 78, 92, 88}; - drag each value to its index.",
    buckets: [
      { id: "i0", label: "Index 0" }, { id: "i1", label: "Index 1" }, { id: "i2", label: "Index 2" },
      { id: "i3", label: "Index 3" }, { id: "i4", label: "Index 4" },
    ],
    items: [
      { text: "85", bucket: "i0", why: "85 is the first value written, so it sits at index 0." },
      { text: "90", bucket: "i1", why: "90 is the second value written, so it sits at index 1." },
      { text: "78", bucket: "i2", why: "78 is the third value written, so it sits at index 2." },
      { text: "92", bucket: "i3", why: "92 is the fourth value written, so it sits at index 3." },
      { text: "88", bucket: "i4", why: "88 is the fifth value written, so it sits at index 4, the last index." },
    ],
    explanation: "Values are stored left to right, starting at index 0: marks[0]=85, marks[1]=90, marks[2]=78, marks[3]=92, marks[4]=88.",
  },
  {
    id: "CH0062.p3.datatype-cards", stage: "STG007", chapter: "CH0062", page: 3, heading: "What Can We Store in an Array?",
    kind: "reveal", title: "Tap each array to see what it stores",
    cards: [
      { label: "int ages[4] = {18, 20, 19, 21};", body: "An int array stores whole numbers - here, 4 ages." },
      { label: "float prices[3] = {10.5, 20.5, 30.5};", body: "A float array stores decimal numbers - here, 3 prices." },
      { label: "char vowels[5] = {'a', 'e', 'i', 'o', 'u'};", body: "A char array stores single characters - here, 5 vowels." },
    ],
    explanation: "Every array holds one data type. Mixing types, such as a character inside an int array, is not how arrays are meant to be used.",
  },
]);
