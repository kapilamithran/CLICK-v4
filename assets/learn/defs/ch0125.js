/*
 * CH0125 - Number & Character Patterns (Stage 7 PATTERNS, STG013).
 *
 * Source: patterns2.pdf. The PDF prints the increasing number pattern (1, 12, 123 ...) with printf("%d", j), the repeated one
 * (1, 22, 333 ...) with printf("%d", i), the continuous one (1, 23, 456, 78910) with an extra variable num, the character pattern
 * (A, AB, ABC ...) with printf("%c", 'A' + j - 1), and closes with the "Quick Comparison" of what to print: j, i, num, 'A' + j - 1.
 *
 * Activities: a lab that switches printf between j and i (page 2), a trace of the PDF's 4-row num program, where j restarts but num
 * keeps counting (page 3; 4 rows rather than the 3 of the graded fill question, so the learner transfers the idea and also sees 10
 * printed as two digits), a builder for printf("%c", 'A' + j - 1) with wrong-but-plausible distractors (page 4), and a sort of the four
 * patterns into the expression that prints them (page 5).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0125.p2.repeat-lab", stage: "STG013", chapter: "CH0125", page: 2, heading: "Repeated Number Patterns",
    kind: "lab", title: "Print j or print i?",
    observe: "The loops never change. Only the value that printf prints does. Switch between j and i and compare the two patterns.",
    controls: [
      { id: "what", type: "select", label: "What should printf print?", value: "j", options: [{ v: "j", l: "j (the position in the row)" }, { v: "i", l: "i (the row number)" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int i, j;",
      "",
      "   for (i = 1; i <= 5; i++) {",
      "      for (j = 1; j <= i; j++) {",
      "         printf(\"%d\", {{what}});",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "Every time the inner loop runs, printf prints `{{what}}`.",
    explanation: "With j, every row counts 1, 2, 3 ... because j starts again at 1 in each row: 1, 12, 123. With i, a whole row repeats its own row number, because i does not change while the inner loop runs: 1, 22, 333. Remember: i = which row? j = which position in the row?",
  },
  {
    id: "CH0125.p3.trace-num", stage: "STG013", chapter: "CH0125", page: 3, heading: "Continuous Number Patterns",
    kind: "trace", title: "j restarts, num keeps counting",
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int i, j, num = 1;",
      "",
      "   for (i = 1; i <= 4; i++) {",
      "      for (j = 1; j <= i; j++) {",
      "         printf(\"%d\", num);",
      "         num++;",
      "      }",
      "      printf(\"\\n\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "There are three variables: i for the row, j for the position in the row, and num for the number to print. num is created once, here, before the loops, and starts at 1.",
      6: "The outer loop picks the row with i. i tells us which row we are on, but it is not the number we print.",
      7: "j starts again at 1 in every row and runs while j <= i, so row 1 prints 1 number, row 2 prints 2 numbers, and so on. Watch j in the table: it goes back to 1 every row.",
      8: "This prints num, not j or i. j restarts in every row, so it could never give 4, 5, 6 in row 3. Only num has the value that must be shown next.",
      9: "num is increased by 1 after each print. Nothing sets it back to 1, so the next row carries on from where this one stopped.",
      11: "The row is finished, so move to the next line. Look at the table: num was not reset, so the next row continues from it.",
    },
    explanation: "j starts again in every row and i stays the same for a whole row, so neither can count 1, 2, 3, 4, 5, 6 ... across rows. num is created once, printed, then increased, so it keeps counting: 1, then 2 3, then 4 5 6, then 7 8 9 10 (which prints as 78910).",
  },
  {
    id: "CH0125.p4.build-letter", stage: "STG013", chapter: "CH0125", page: 4, heading: "Character Patterns",
    kind: "builder", title: "Build the statement that prints letters",
    question: "The loops around this line are already written: the inner loop counts j = 1, 2, 3 ... in each row. Build the printf that prints A, then B, then C, so the rows are A, AB, ABC.",
    template: "printf(\"{fmt}\", {expr});",
    slots: {
      fmt: {
        label: "format",
        options: ["%c", "%d", "%s", "%f"],
        answer: "%c",
        why: "A letter is a character, and %c prints a character. %d would print the letter's number (65 for A), %s is for whole text, and %f is for decimal numbers.",
      },
      expr: {
        label: "letter expression",
        options: ["'A' + j - 1", "'A' + j", "'A' + i - 1", "j", "'A'"],
        answer: "'A' + j - 1",
        why: "j starts at 1 but 'A' + 0 is the first letter, so subtract 1: 'A' + j - 1 gives A, B, C as j is 1, 2, 3. 'A' + j starts at B, 'A' + i - 1 repeats one letter in a row (A, BB, CCC), j alone is not a letter, and 'A' alone prints A every time.",
      },
    },
    explanation: "Characters have numbers inside the computer, so 'A' + 0 gives A, 'A' + 1 gives B and 'A' + 2 gives C. Because j starts at 1, 'A' + j - 1 gives A when j is 1, B when j is 2 and C when j is 3, and %c prints each result as a character. The rows are A, AB, ABC.",
  },
  {
    id: "CH0125.p5.which-variable", stage: "STG013", chapter: "CH0125", page: 5, heading: "Using Loop Variables in Patterns",
    kind: "assign", title: "Which value do we print?",
    question: "In pattern programs the big question is what to print. Match each pattern, or each description, to the printf that produces it.",
    buckets: [
      { id: "j", label: "printf(\"%d\", j)" },
      { id: "i", label: "printf(\"%d\", i)" },
      { id: "num", label: "printf(\"%d\", num)" },
      { id: "letter", label: "printf(\"%c\", 'A' + j - 1)" },
    ],
    items: [
      { text: "Rows: 1, 12, 123, 1234", bucket: "j", why: "Every row starts again at 1 and counts up, so the value is the position inside the row: j." },
      { text: "Rows: 1, 22, 333, 4444", bucket: "i", why: "Every row repeats its own row number, so the value depends on the row: i." },
      { text: "Rows: 1, 23, 456, 78910", bucket: "num", why: "The numbers carry on from where the previous row ended, so an independent counter, num, is needed." },
      { text: "Rows: A, AB, ABC, ABCD", bucket: "letter", why: "Letters come from character arithmetic: 'A' + j - 1, printed with %c." },
      { text: "The value depends on the position inside the row", bucket: "j", why: "The position inside the row is what j counts." },
      { text: "The value depends on the row", bucket: "i", why: "The row number is what i counts, and it stays the same while a row is printed." },
      { text: "The value must continue independently across rows", bucket: "num", why: "A value that must not restart in every row needs its own variable, such as num." },
      { text: "Generate the letters A, B, C, D", bucket: "letter", why: "Character arithmetic turns the position into letters: 'A' + j - 1 with %c." },
    ],
    explanation: "Ask what changes from one printed value to the next. The row: print i. The position inside the row: print j. A count that must run on across rows: use another variable such as num. Letters: character arithmetic, 'A' + j - 1 with %c. Remember: i = row, j = position, num = continuous value.",
  },
]);
