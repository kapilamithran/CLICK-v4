/*
 * CH0071 - Character Array (Introduction to Strings) (Stage 6, STG007).
 *
 * Why these activities: the pages introduce character arrays, then strings and their \0, then reading and
 * displaying them. Students contrast a plain character array with a string, build a string declaration,
 * map indexes to characters, and trace %s printing up to the null terminator.
 */
ClickLearn.define([
  {
    id: "CH0071.p1.char-array-cards", stage: "STG007", chapter: "CH0071", page: 1, heading: "What is a Character Array?",
    kind: "reveal", title: "Tap each character array to see how it's stored",
    cards: [
      { label: "char vowels[5] = {'a', 'e', 'i', 'o', 'u'};", body: "Stores 5 separate characters, one per element. Built from single-quoted characters, not a string literal, so there is no \\0." },
      { label: "char name[6] = {'V','i','c','k','y','\\0'};", body: "Also a character array, but the last element is \\0, marking it as a string." },
    ],
    explanation: "A character array can hold plain characters, or become a string when it ends with \\0.",
  },
  {
    id: "CH0071.p2.build-string-decl", stage: "STG007", chapter: "CH0071", page: 2, heading: "What is a String?",
    kind: "builder", title: "Build a string declaration",
    question: "Complete the declaration that stores \"Vicky\" as a string.",
    template: "{type} name{brackets} = \"Vicky\";",
    slots: {
      type: { label: "data type", options: ["char", "int", "float"], answer: "char", why: "A string is stored in a character array, so its type is char." },
      brackets: { label: "size", options: ["[]", "[5]", "()"], answer: "[]", why: "Leaving the brackets empty lets C count the letters and add one more slot for \\0 automatically." },
    },
    explanation: "char name[] = \"Vicky\"; stores the string \"Vicky\", including its \\0, using exactly the right size.",
  },
  {
    id: "CH0071.p3.match-index-char", stage: "STG007", chapter: "CH0071", page: 3, heading: "Accessing Characters",
    kind: "assign", title: "Match each index to its character",
    question: "char name[] = \"Vicky\"; - drag each index to the character stored there.",
    buckets: [
      { id: "c0", label: "name[0]" }, { id: "c1", label: "name[1]" }, { id: "c2", label: "name[2]" },
      { id: "c3", label: "name[3]" }, { id: "c4", label: "name[4]" },
    ],
    items: [
      { text: "'V'", bucket: "c0", why: "'V' is the first character, at index 0." },
      { text: "'i'", bucket: "c1", why: "'i' is the second character, at index 1." },
      { text: "'c'", bucket: "c2", why: "'c' is the third character, at index 2." },
      { text: "'k'", bucket: "c3", why: "'k' is the fourth character, at index 3." },
      { text: "'y'", bucket: "c4", why: "'y' is the fifth character, at index 4 - the last visible letter, right before \\0." },
    ],
    explanation: "A string is indexed just like a number array, one character per index, starting at 0.",
  },
  {
    id: "CH0071.p4.trace-print-string", stage: "STG007", chapter: "CH0071", page: 4, heading: "Reading & Displaying Strings",
    kind: "trace", title: "Trace printing a string",
    code: "#include <stdio.h>\n\nint main()\n{\n   char name[] = \"Vicky\";\n   printf(\"%c%c%c%c%c\", name[0], name[1], name[2], name[3], name[4]);\n   printf(\" %s\", name);\n   return 0;\n}",
    explanation: "Printing each character with %c gives the same text as printing the whole string with %s - %s just stops automatically at \\0.",
  },
]);
