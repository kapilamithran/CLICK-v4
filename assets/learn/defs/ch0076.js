/*
 * CH0076 - String Length & Basic Operations (Stage 7, STG008).
 *
 * Source: Strings4.pdf. The PDF teaches length as the number of characters (HELLO = 5, with '\0' not counted),
 * strlen() from <string.h>, counting characters that satisfy a condition (BANANA, count the A's), searching for
 * 'L' in "HELLO", and combining check + count. Activities reuse those strings and loops.
 *
 * Adaptation: the PDF's search loop for 'L' has no break, so on HELLO it would print "Found" twice (there are two
 * L's). The trace adds `break;` so it stops at the first match, which is what "check each character until you
 * find a match" describes.
 */
ClickLearn.define([
  {
    id: "CH0076.p2.strlen-lab", stage: "STG008", chapter: "CH0076", page: 2, heading: "Using strlen()",
    kind: "lab", title: "Measure a string with strlen()",
    observe: "Pick a string. strlen() counts its characters and gives the length.",
    controls: [
      { id: "w", type: "select", label: "The string", value: "HELLO", options: [{ v: "HELLO", l: "\"HELLO\"" }, { v: "CODING", l: "\"CODING\"" }, { v: "BANANA", l: "\"BANANA\"" }, { v: "C PROGRAM", l: "\"C PROGRAM\"" }] },
    ],
    code: "char word[] = \"{{w}}\";\n\nprintf(\"%d\", strlen(word));",
    summary: "strlen() counted the characters in \"{{w}}\" and gave {{out}}.",
    explanation: "The length is the number of characters in the string: HELLO is 5, CODING is 6, and C PROGRAM is 9 because the space is a character too. The '\\0' that marks the end of a string is not counted.",
  },
  {
    id: "CH0076.p3.order-count-steps", stage: "STG008", chapter: "CH0076", page: 3, heading: "Counting Characters",
    kind: "order", noRun: true, title: "Put the counting steps in order",
    question: "Arrange the steps the computer follows to count the A's in a string.",
    lines: [
      "Start with count = 0.",
      "Check the current character.",
      "If it matches 'A', do count++.",
      "Move to the next character.",
    ],
    distractors: ["Set count back to 0 for every character."],
    explanation: "Check -> Match -> Count. count starts at 0 and only goes up when a character matches; then the loop moves on.",
  },
  {
    id: "CH0076.p4.trace-search", stage: "STG008", chapter: "CH0076", page: 4, heading: "Searching for a Character",
    kind: "trace", title: "Search for the letter L",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   char word[] = \"HELLO\";",
      "",
      "   for(int i = 0; word[i] != '\\0'; i++)",
      "   {",
      "      if(word[i] == 'L')",
      "      {",
      "         printf(\"Found\");",
      "         break;",
      "      }",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "H is not L, E is not L, then L matches and the program prints Found. The break stops the search at the first match. SEARCH = CHECK each character until you find a match.",
  },
  {
    id: "CH0076.p5.trace-count", stage: "STG008", chapter: "CH0076", page: 5, heading: "Counting Specific Characters + Recap",
    kind: "trace", title: "Count the A's in BANANA",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   char word[] = \"BANANA\";",
      "   int count = 0;",
      "",
      "   for(int i = 0; word[i] != '\\0'; i++)",
      "   {",
      "      if(word[i] == 'A')",
      "      {",
      "         count++;",
      "      }",
      "   }",
      "",
      "   printf(\"%d\", count);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "B no, A yes (count = 1), N no, A yes (count = 2), N no, A yes (count = 3). The output is 3.",
  },
]);
