/*
 * CH0078 - Basic String Programs (Stage 7, STG008).
 *
 * Source: Strings6.pdf. The PDF applies the earlier chapters to five small programs: length with strlen()
 * (with the "try C PROGRAM" prompt), reverse (loop from strlen(word) - 1 down to 0), palindrome (explained as
 * five steps, no code), vowels and consonants in "APPLE", and comparing two strings with strcmp(). Activities
 * follow those examples; the palindrome is an ordering of the PDF's own five steps because the PDF gives no code.
 */
ClickLearn.define([
  {
    id: "CH0078.p1.change-and-run", stage: "STG008", chapter: "CH0078", page: 1, heading: "Find the Length of a String",
    kind: "run", title: "Change the string and run it",
    code: "#include <stdio.h>\n#include <string.h>\n\nint main()\n{\n   char word[] = \"HELLO\";\n\n   printf(\"Length = %d\", strlen(word));\n\n   return 0;\n}",
    initialOutput: "Length = 5",
    tasks: ["Change \"HELLO\" to \"C PROGRAM\" and press Run.", "Count the characters yourself, including the space. Does it match the length?"],
    goal: { changed: true }, goalHint: "Change the text between the double quotes on the char word[] line, then press Run again.",
    explanation: "strlen() counts every character in the string, so the length follows whatever you write. \"C PROGRAM\" gives 9 because the space is a character too.",
  },
  {
    id: "CH0078.p2.trace-reverse", stage: "STG008", chapter: "CH0078", page: 2, heading: "Reverse a String",
    kind: "trace", title: "Read CODE backwards",
    code: [
      "#include <stdio.h>",
      "#include <string.h>",
      "",
      "int main()",
      "{",
      "   char word[] = \"CODE\";",
      "   int i;",
      "",
      "   for(i = strlen(word) - 1; i >= 0; i--)",
      "   {",
      "      printf(\"%c\", word[i]);",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "strlen(word) - 1 is 3, the index of the last character. The loop goes 3 -> 2 -> 1 -> 0, so it prints E, D, O, C. Normal order is 0 -> last; reverse order is last -> 0.",
  },
  {
    id: "CH0078.p3.order-palindrome", stage: "STG008", chapter: "CH0078", page: 3, heading: "Check for Palindrome",
    kind: "order", noRun: true, title: "Put the palindrome steps in order",
    question: "Arrange the steps that check whether a word is a palindrome.",
    lines: [
      "Take a string.",
      "Look at the first and last characters.",
      "Compare them.",
      "Move towards the middle.",
      "If all match, it is a palindrome.",
    ],
    distractors: ["Sort the characters alphabetically."],
    explanation: "In MADAM the first and last characters match (M and M), then the next pair (A and A). Same forward + backward = palindrome.",
  },
  {
    id: "CH0078.p4.sort-vowels", stage: "STG008", chapter: "CH0078", page: 4, heading: "Count Vowels and Consonants",
    kind: "assign", title: "Vowel or consonant?",
    question: "Check each letter of APPLE. Is it a vowel or a consonant?",
    buckets: [
      { id: "vowel", label: "Vowel (A, E, I, O, U)" },
      { id: "consonant", label: "Consonant" },
    ],
    items: [
      { text: "A", bucket: "vowel", why: "A is one of the vowels A, E, I, O, U." },
      { text: "P (first)", bucket: "consonant", why: "P is not a vowel, so it is a consonant." },
      { text: "P (second)", bucket: "consonant", why: "P is a consonant again." },
      { text: "L", bucket: "consonant", why: "L is not a vowel, so it is a consonant." },
      { text: "E", bucket: "vowel", why: "E is one of the vowels." },
    ],
    explanation: "APPLE has 2 vowels (A, E) and 3 consonants (P, P, L). Check -> Decide -> Count.",
  },
]);
