/*
 * CH0123 - Checking a Prime Number (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching7.pdf. The PDF defines a Prime Number as one with exactly two factors (1 and itself), checks
 * candidates with n % i == 0 for i from 1 to n, counts every factor found with count++, and decides Prime only when
 * count == 2. Its own worked examples are 7 (Prime, count 2) and 6 (Not Prime, count 4).
 *
 * Activities: a lab that reruns the check on the PDF's own two contrasting numbers (page 2), a fill-in trace of i and
 * count for 7 (page 3), an order of the LOOP/CHECK/COUNT/COMPARE cycle (page 3) and a sort of statements into those
 * four steps (page 5).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0123.p2.prime-lab", stage: "STG012", chapter: "CH0123", page: 2, heading: "Checking for Factors",
    kind: "lab", title: "Try checking different numbers",
    observe: "The program counts every number from 1 to n that divides n exactly. Compare a prime number with one that is not.",
    controls: [
      { id: "n", type: "select", label: "Number to check", value: "7", options: [{ v: "7", l: "7" }, { v: "6", l: "6" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}}, i, count = 0;",
      "   for (i = 1; i <= n; i++) {",
      "      if (n % i == 0) {",
      "         count++;",
      "      }",
      "   }",
      "   if (count == 2) {",
      "      printf(\"Prime Number\");",
      "   } else {",
      "      printf(\"Not Prime Number\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "{{n}}'s factors are counted, then compared with 2.",
    explanation: "7's only factors are 1 and 7, so count reaches exactly 2 -- Prime Number. 6's factors are 1, 2, 3 and 6, so count reaches 4 -- Not Prime Number.",
  },
  {
    id: "CH0123.p3.trace-prime", stage: "STG012", chapter: "CH0123", page: 3, heading: "Counting Factors",
    kind: "tracetable", title: "Trace checking whether 7 is prime",
    code: "int n = 7;\nint i, count = 0;\n\nfor (i = 1; i <= n; i++)\n{\n    if (n % i == 0)\n    {\n        count++;\n    }\n}",
    question: "Each row is one check of the loop condition (i <= n). Fill in i at that moment and what count has reached so far.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "c", label: "i <= n ?", kind: "cond" },
      { key: "cnt", label: "count", kind: "var", var: "count" },
    ],
    fill: ["i", "c", "cnt"],
    hint: "count shows the total built up so far, before this round's i is checked. Only i = 1 and i = 7 are factors of 7.",
    explanation: "i runs 1, 2, 3, 4, 5, 6, 7. Only i = 1 and i = 7 divide 7 exactly, so count grows from 0 to 1 (at i = 1) and then to 2 (at i = 7). The other candidates leave count unchanged. count ends at exactly 2 -- 7 is Prime.",
  },
  {
    id: "CH0123.p3.order-steps", stage: "STG012", chapter: "CH0123", page: 3, heading: "Counting Factors",
    kind: "order", title: "Put the Prime Number check in order",
    noRun: true,
    question: "You are given a number and asked to check whether it is prime. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Start count at 0",
      "Loop candidates i from 1 up to n",
      "Check whether n % i == 0",
      "If it is a factor, add 1 to count",
      "Once the loop finishes, compare count with 2",
    ],
    distractors: ["Compare count with 2 before the loop starts"],
    explanation: "Start count at 0, then loop every candidate from 1 to n, checking each with %. Count the ones that divide exactly, and only compare count with 2 once every candidate has been checked -- comparing before the loop starts would always find count still at 0.",
  },
  {
    id: "CH0123.p5.assign-steps", stage: "STG012", chapter: "CH0123", page: 5, heading: "Prime Number Recap",
    kind: "assign", title: "Match each line to what it does",
    question: "Sort each statement into the step of the Prime Number check it belongs to.",
    buckets: [
      { id: "loop", label: "LOOP" },
      { id: "check", label: "CHECK" },
      { id: "count", label: "COUNT" },
      { id: "compare", label: "COMPARE" },
    ],
    items: [
      { text: "for (i = 1; i <= n; i++)", bucket: "loop", why: "This tries every candidate factor from 1 to n." },
      { text: "if (n % i == 0)", bucket: "check", why: "This checks whether i divides n exactly." },
      { text: "count++;", bucket: "count", why: "This adds 1 to count every time a factor is found." },
      { text: "if (count == 2)", bucket: "compare", why: "This checks whether exactly two factors were found." },
    ],
    explanation: "LOOP through every candidate factor, CHECK each one with %, COUNT the ones that divide exactly, and COMPARE the total with 2 only once the loop has finished.",
  },
]);
