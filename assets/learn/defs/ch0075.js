/*
 * CH0075 - Accessing & Traversing Strings (Stage 7, STG008).
 *
 * Source: Strings3.pdf. The PDF teaches indexing from 0 (HELLO), name[2] on "RAVI", the loop
 * for(int i = 0; word[i] != '\0'; i++) over "CODE"/"CODING", changing HELLO into HALLO with word[1] = 'A',
 * and the warning that word[1] = "A" is wrong. The '\0' appears in the PDF only as the point where that loop
 * stops, so that is all these activities say about it.
 */
ClickLearn.define([
  {
    id: "CH0075.p2.match-index-char", stage: "STG008", chapter: "CH0075", page: 2, heading: "Accessing Individual Characters",
    kind: "assign", title: "Match each index to its character",
    question: "char name[] = \"RAVI\"; - which character does each expression give?",
    buckets: [
      { id: "r", label: "'R'" }, { id: "a", label: "'A'" }, { id: "v", label: "'V'" }, { id: "i", label: "'I'" },
    ],
    items: [
      { text: "name[0]", bucket: "r", why: "Index 0 is the first character, R." },
      { text: "name[1]", bucket: "a", why: "Index 1 is the second character, A." },
      { text: "name[2]", bucket: "v", why: "Index 2 is the third character, V." },
      { text: "name[3]", bucket: "i", why: "Index 3 is the fourth and last character, I." },
    ],
    explanation: "String + Index = Character. Counting starts at 0, so name[2] is the third character.",
  },
  {
    id: "CH0075.p3.trace-loop", stage: "STG008", chapter: "CH0075", page: 3, heading: "Using Loops with Strings",
    kind: "trace", title: "Walk through CODE with a loop",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   char word[] = \"CODE\";",
      "",
      "   for(int i = 0; word[i] != '\\0'; i++)",
      "   {",
      "      printf(\"%c\", word[i]);",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "With i = 0, 1, 2, 3 the loop prints C, O, D, E. The loop keeps moving through the string until it reaches '\\0'.",
  },
  {
    id: "CH0075.p4.modify-lab", stage: "STG008", chapter: "CH0075", page: 4, heading: "Modifying Characters",
    kind: "lab", title: "Change one character of HELLO",
    observe: "Choose which index to change and which single character to put there. Watch the printed string.",
    controls: [
      { id: "idx", type: "select", label: "Index to change", value: "1", options: [{ v: "0", l: "0 (the H)" }, { v: "1", l: "1 (the E)" }, { v: "2", l: "2 (the first L)" }, { v: "3", l: "3 (the second L)" }, { v: "4", l: "4 (the O)" }] },
      { id: "ch", type: "select", label: "New character", value: "A", options: [{ v: "A", l: "'A'" }, { v: "X", l: "'X'" }, { v: "Z", l: "'Z'" }] },
    ],
    code: "char word[] = \"HELLO\";\n\nword[{{idx}}] = '{{ch}}';\n\nprintf(\"%s\", word);",
    summary: "The character at index {{idx}} was replaced, and the string now prints as {{out}}.",
    explanation: "An index finds the character and an assignment changes it: word[1] = 'A'; turns HELLO into HALLO. Index -> Find the character -> Change it.",
  },
  {
    id: "CH0075.p4.single-quotes-error", stage: "STG008", chapter: "CH0075", page: 4, heading: "Modifying Characters",
    kind: "error", mode: "toggle", title: "One character needs single quotes",
    question: "Compile this program and read the message. Then apply the fix and compile again.",
    broken: "#include <stdio.h>\n\nint main()\n{\n   char word[] = \"HELLO\";\n\n   word[1] = \"A\";\n\n   printf(\"%s\", word);\n\n   return 0;\n}",
    fixed: "#include <stdio.h>\n\nint main()\n{\n   char word[] = \"HELLO\";\n\n   word[1] = 'A';\n\n   printf(\"%s\", word);\n\n   return 0;\n}",
    diagnostic: "error: assignment to 'char' from 'char *' makes integer from pointer without a cast",
    explanation: "word[1] holds ONE character, so it must be given one character, written in single quotes. \"A\" in double quotes is a string, not a single character.",
    fixNote: "Single quotes make 'A' one character, which fits in word[1].",
    outputAfterFix: "HALLO",
  },
]);
