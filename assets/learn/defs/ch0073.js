/*
 * CH0073 - String Basics & Declaration (Stage 7, STG008).
 *
 * Source: Strings1.pdf. The PDF teaches what a string is, single vs double quotes, the character array
 * (with boxes numbered 0-4 for "Hello"), declaring (char name[20];) vs initializing (char name[] = "Hello";)
 * and a five-point recap. Activities re-use exactly those examples; no outside curriculum is introduced.
 */
ClickLearn.define([
  {
    id: "CH0073.p2.sort-quotes", stage: "STG008", chapter: "CH0073", page: 2, heading: "Character vs String",
    kind: "assign", title: "Character or string?",
    question: "Sort each value: is it one character (single quotes) or a string (double quotes)?",
    buckets: [
      { id: "char", label: "Character (single quotes)" },
      { id: "string", label: "String (double quotes)" },
    ],
    items: [
      { text: "'A'", bucket: "char", why: "One letter in single quotes is a single character." },
      { text: "\"Apple\"", bucket: "string", why: "Many characters in double quotes make a string." },
      { text: "'7'", bucket: "char", why: "A digit in single quotes is still one character." },
      { text: "\"12345\"", bucket: "string", why: "Double quotes make it a string, even though it looks like a number." },
      { text: "\"Hello World\"", bucket: "string", why: "Many characters (even with a space) in double quotes make a string." },
      { text: "'@'", bucket: "char", why: "A symbol in single quotes is one character." },
    ],
    explanation: "Single quotes -> single character. Double quotes -> string. 'A' is ONE, \"Apple\" is MANY.",
  },
  {
    id: "CH0073.p3.hello-boxes", stage: "STG008", chapter: "CH0073", page: 3, heading: "Character Array",
    kind: "assign", title: "Put each character in its box",
    question: "char name[] = \"Hello\"; stores one character in each box. Which character sits at each index?",
    buckets: [
      { id: "i0", label: "Index 0" }, { id: "i1", label: "Index 1" }, { id: "i2", label: "Index 2" },
      { id: "i3", label: "Index 3" }, { id: "i4", label: "Index 4" },
    ],
    items: [
      { text: "H", bucket: "i0", why: "H is the first character of \"Hello\", in the box at index 0." },
      { text: "e", bucket: "i1", why: "e is the second character, at index 1." },
      { text: "l (first)", bucket: "i2", why: "The first l is the third character, at index 2." },
      { text: "l (second)", bucket: "i3", why: "The second l is the fourth character, at index 3." },
      { text: "o", bucket: "i4", why: "o is the last character, at index 4." },
    ],
    explanation: "A string in C is a character array: a row of boxes, one character in each, numbered from 0.",
  },
  {
    id: "CH0073.p4.declare-or-initialize", stage: "STG008", chapter: "CH0073", page: 4, heading: "Declaring & Initializing a String",
    kind: "assign", title: "Declaration or initialization?",
    question: "Does each line only create space for a string, or also put something inside it?",
    buckets: [
      { id: "decl", label: "Declaration (give me space!)" },
      { id: "init", label: "Initialization (put something inside!)" },
    ],
    items: [
      { text: "char name[20];", bucket: "decl", why: "It creates space for the characters but gives the string no value." },
      { text: "char name[] = \"Hello\";", bucket: "init", why: "It creates the array and gives it the value \"Hello\"." },
      { text: "char city[30];", bucket: "decl", why: "Only space for characters is created; nothing is stored yet." },
      { text: "char word[] = \"Ravi\";", bucket: "init", why: "It creates the array and stores \"Ravi\" in it." },
    ],
    explanation: "Declaration creates space. Initialization gives the string a value.",
  },
  {
    id: "CH0073.p5.see-it-in-code", stage: "STG008", chapter: "CH0073", page: 5, heading: "String Basics Recap",
    kind: "reveal", title: "Tap each part of the declaration",
    code: "char name[] = \"Hello\";",
    notes: [
      { text: "char", note: "The character type: this array stores characters." },
      { text: "name", note: "The name of the array." },
      { text: "[]", note: "Marks it as an array: a character array." },
      { text: "\"Hello\"", note: "The string value stored inside the character array." },
    ],
    explanation: "char = character type, name = the name, [] = character array, \"Hello\" = the string value.",
  },
]);
