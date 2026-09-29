/*
 * CH0120 - Checking a Palindrome Number (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching4.pdf. The PDF teaches that a palindrome reads the same forward and backward (121, not 123),
 * that the number must be saved first (original = n;) because reversing it changes n down to 0, and that the check is
 * if (original == rev). Its own worked example is 121, whose reverse also comes out to 121.
 *
 * Activities: an order of SAVE/REVERSE/COMPARE (page 3), a fill-in trace of checking 121 (page 4), a sort of statements
 * into SAVE/GET/REMOVE/BUILD/COMPARE (page 4) and a lab that reruns the check on a palindrome and a non-palindrome
 * (page 5), using the PDF's own two contrasting examples, 121 and 123.
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0120.p3.order-steps", stage: "STG012", chapter: "CH0120", page: 3, heading: "Comparing Original and Reverse",
    kind: "order", title: "Put the palindrome check in order",
    noRun: true,
    question: "You are given a number and asked to check whether it is a palindrome. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Save the original number",
      "Get and remove each digit to build the reverse",
      "Compare the original with the reverse",
      "If they are equal, print Palindrome",
      "If they are not equal, print Not Palindrome",
    ],
    distractors: ["Compare the number with itself before reversing it"],
    explanation: "SAVE the original first, because reversing changes the number down to 0. Then REVERSE a working copy with % 10 and / 10. Only then COMPARE the saved original with the reverse. Comparing a number with itself before reversing it would always say Palindrome, even for 123.",
  },
  {
    id: "CH0120.p4.trace-palindrome", stage: "STG012", chapter: "CH0120", page: 4, heading: "Checking a Palindrome in C",
    kind: "tracetable", title: "Trace checking whether 121 is a palindrome",
    code: "int n = 121;\nint original, digit = 0, rev = 0;\noriginal = n;\n\nwhile (n != 0)\n{\n    digit = n % 10;\n    rev = rev * 10 + digit;\n    n = n / 10;\n}",
    question: "Each row is one check of the loop condition, after original has already been saved. Fill in n and rev at that moment -- rev shows the result of the previous round (0 before the first round has run).",
    columns: [
      { key: "n", label: "n", kind: "var", var: "n" },
      { key: "c", label: "n != 0 ?", kind: "cond" },
      { key: "r", label: "rev", kind: "var", var: "rev" },
    ],
    fill: ["n", "c", "r"],
    hint: "original was saved as 121 before this loop even started, and it never changes. Trace n and rev exactly as you did in Reversing a Number.",
    explanation: "n shrinks from 121 to 0 while rev builds up: after round 1, rev is 1; after round 2, rev is 12; after round 3, rev is 121. original was saved as 121 and never changed, so original == rev is true -- 121 is a Palindrome.",
  },
  {
    id: "CH0120.p4.assign-steps", stage: "STG012", chapter: "CH0120", page: 4, heading: "Checking a Palindrome in C",
    kind: "assign", title: "Match each line to what it does",
    question: "Sort each statement into the step of the palindrome check it belongs to.",
    buckets: [
      { id: "save", label: "SAVE" },
      { id: "get", label: "GET" },
      { id: "remove", label: "REMOVE" },
      { id: "build", label: "BUILD" },
      { id: "compare", label: "COMPARE" },
    ],
    items: [
      { text: "original = n;", bucket: "save", why: "This copies n's starting value into original before the loop changes n." },
      { text: "digit = n % 10;", bucket: "get", why: "% 10 gives the last digit that is still left in n." },
      { text: "n = n / 10;", bucket: "remove", why: "/ 10 removes the digit that was just used." },
      { text: "rev = rev * 10 + digit;", bucket: "build", why: "This folds the new digit onto the reversed number." },
      { text: "if (original == rev)", bucket: "compare", why: "This checks whether the saved original matches the finished reverse." },
    ],
    explanation: "SAVE the original before the loop, then GET, BUILD and REMOVE inside the loop for every digit, and COMPARE the original with the reverse only once the loop has finished.",
  },
  {
    id: "CH0120.p5.palindrome-lab", stage: "STG012", chapter: "CH0120", page: 5, heading: "Palindrome Recap",
    kind: "lab", title: "Try different numbers",
    observe: "The program never guesses: it saves, reverses and compares. Switch between a palindrome and a number that is not one.",
    controls: [
      { id: "n", type: "select", label: "Number to check", value: "121", options: [{ v: "121", l: "121" }, { v: "123", l: "123" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}}, original, digit, rev = 0;",
      "   original = n;",
      "   while (n != 0) {",
      "      digit = n % 10;",
      "      rev = rev * 10 + digit;",
      "      n = n / 10;",
      "   }",
      "   if (original == rev) {",
      "      printf(\"Palindrome\");",
      "   } else {",
      "      printf(\"Not Palindrome\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "{{n}} is checked by comparing it with its own reverse.",
    explanation: "121 reverses to 121, so original == rev is true: Palindrome. 123 reverses to 321, so original == rev is false: Not Palindrome. The program never looks at the digits by eye -- it always saves, reverses and compares.",
  },
]);
