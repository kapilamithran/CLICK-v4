/*
 * CH0077 - String Library Functions (Stage 7, STG008).
 *
 * Source: Strings5.pdf. The PDF teaches the four <string.h> functions strcpy() (copy), strcat() (join),
 * strcmp() (compare, "== 0 means equal") and strchr() (search, "!= NULL means found"), using the same small
 * programs below ("Hello", "Hello " + "World", "Hello" vs "Hello", 'L' in "HELLO").
 *
 * Adaptation: the strcmp and strchr labs add an else branch (printing "different" / "not found") so a student
 * can see BOTH outcomes as they change the input. The PDF's programs only show the success case.
 */
ClickLearn.define([
  {
    id: "CH0077.p1.trace-strcpy", stage: "STG008", chapter: "CH0077", page: 1, heading: "strcpy()",
    kind: "trace", title: "Copy Hello into destination",
    code: [
      "#include <stdio.h>",
      "#include <string.h>",
      "",
      "int main()",
      "{",
      "   char source[] = \"Hello\";",
      "   char destination[20];",
      "",
      "   strcpy(destination, source);",
      "",
      "   printf(\"%s\", destination);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "Before strcpy(), destination holds nothing yet (the ? marks are not set). After strcpy(destination, source), it holds a copy of \"Hello\". source -> strcpy() -> destination.",
  },
  {
    id: "CH0077.p2.trace-strcat", stage: "STG008", chapter: "CH0077", page: 2, heading: "strcat()",
    kind: "trace", title: "Join Hello and World",
    code: [
      "#include <stdio.h>",
      "#include <string.h>",
      "",
      "int main()",
      "{",
      "   char first[30] = \"Hello \";",
      "   char second[] = \"World\";",
      "",
      "   strcat(first, second);",
      "",
      "   printf(\"%s\", first);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "first starts as \"Hello \" and second is \"World\". After strcat(first, second), first is \"Hello World\". second is unchanged.",
  },
  {
    id: "CH0077.p3.strcmp-lab", stage: "STG008", chapter: "CH0077", page: 3, heading: "strcmp()",
    kind: "lab", title: "Are the two strings the same?",
    observe: "first is always \"Hello\". Choose the second string and see what strcmp() decides.",
    controls: [
      { id: "b", type: "select", label: "The second string", value: "Hello", options: [{ v: "Hello", l: "\"Hello\"" }, { v: "Hallo", l: "\"Hallo\"" }, { v: "Hell", l: "\"Hell\"" }, { v: "Hello World", l: "\"Hello World\"" }] },
    ],
    code: "char first[] = \"Hello\";\nchar second[] = \"{{b}}\";\n\nif(strcmp(first, second) == 0)\n{\n   printf(\"Strings are same\");\n}\nelse\n{\n   printf(\"Strings are different\");\n}",
    summary: "Comparing \"Hello\" with \"{{b}}\": {{out}}.",
    explanation: "strcmp() compares two strings. For beginners, remember: strcmp() == 0 -> the strings are equal. Any difference in the text makes the answer something other than 0.",
  },
  {
    id: "CH0077.p4.strchr-lab", stage: "STG008", chapter: "CH0077", page: 4, heading: "strchr()",
    kind: "lab", title: "Search HELLO for a letter",
    observe: "Choose the letter to search for and see whether strchr() finds it in \"HELLO\".",
    controls: [
      { id: "c", type: "select", label: "Letter to search for", value: "L", options: [{ v: "L", l: "'L'" }, { v: "H", l: "'H'" }, { v: "O", l: "'O'" }, { v: "Z", l: "'Z'" }, { v: "A", l: "'A'" }] },
    ],
    code: "char word[] = \"HELLO\";\n\nif(strchr(word, '{{c}}') != NULL)\n{\n   printf(\"Character found\");\n}\nelse\n{\n   printf(\"Character not found\");\n}",
    summary: "Searching \"HELLO\" for '{{c}}': {{out}}.",
    explanation: "strchr() searches for a particular character inside a string. If the character is in the string, strchr(word, 'L') != NULL is true and the program prints Character found.",
  },
]);
