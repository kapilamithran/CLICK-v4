/*
 * CH0122 - Checking a Perfect Number (Stage 6 NUMBER CRUNCHING, STG012).
 *
 * Source: Number-Crunching6.pdf. The PDF defines a Perfect Number as one whose proper factors add up to the number
 * itself, checks factors with n % i == 0 for i from 1 up to (but not including) n, adds each factor found into sum,
 * and compares sum with n. Its own worked example is 6 = 1 + 2 + 3, and its own quiz asks the reader to tell 6, 8, 10
 * and 12 apart.
 *
 * Activities: a lab that reruns the check on the quiz's own four numbers (page 2), a fill-in trace of i and sum for 6
 * (page 3), an order of the LOOP/CHECK/ADD/COMPARE cycle (page 3) and a sort of statements into those four steps
 * (page 5).
 *
 * None of the outputs contains a meaningful space, so no activity here sets `spaces: true`.
 */
ClickLearn.define([
  {
    id: "CH0122.p2.factor-lab", stage: "STG012", chapter: "CH0122", page: 2, heading: "Finding the Factors",
    kind: "lab", title: "Try checking different numbers",
    observe: "The program checks every number from 1 up to n - 1 and adds up the ones that divide n exactly. Try each number and see which one is Perfect.",
    controls: [
      { id: "n", type: "select", label: "Number to check", value: "6", options: [{ v: "6", l: "6" }, { v: "8", l: "8" }, { v: "10", l: "10" }, { v: "12", l: "12" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int n = {{n}}, i, sum = 0;",
      "   for (i = 1; i < n; i++) {",
      "      if (n % i == 0) {",
      "         sum = sum + i;",
      "      }",
      "   }",
      "   if (sum == n) {",
      "      printf(\"Perfect Number\");",
      "   } else {",
      "      printf(\"Not Perfect Number\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "{{n}}'s proper factors add up to sum, then sum is compared with n.",
    explanation: "6's proper factors are 1, 2, 3, which add up to 6 -- Perfect Number. 8's are 1, 2, 4 (sum 7), 10's are 1, 2, 5 (sum 8), and 12's are 1, 2, 3, 4, 6 (sum 16) -- none of them match the original number, so all three are Not Perfect Number.",
  },
  {
    id: "CH0122.p3.trace-perfect", stage: "STG012", chapter: "CH0122", page: 3, heading: "Adding the Factors",
    kind: "tracetable", title: "Trace checking whether 6 is perfect",
    code: "int n = 6;\nint i, sum = 0;\n\nfor (i = 1; i < n; i++)\n{\n    if (n % i == 0)\n    {\n        sum = sum + i;\n    }\n}",
    question: "Each row is one check of the loop condition (i < n). Fill in i at that moment and what sum has reached so far.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "c", label: "i < n ?", kind: "cond" },
      { key: "s", label: "sum", kind: "var", var: "sum" },
    ],
    fill: ["i", "c", "s"],
    hint: "sum shows the total built up so far, before this round's i is checked. i = 1, 2 and 3 are factors of 6 and add to sum; i = 4 and 5 are not.",
    explanation: "i runs 1, 2, 3, 4, 5. Each of 1, 2 and 3 divides 6 exactly, so sum grows to 1, then 3, then 6. 4 and 5 do not divide 6, so sum stays at 6. The loop stops once i reaches n (6), leaving sum equal to 6 -- a Perfect Number.",
  },
  {
    id: "CH0122.p3.order-steps", stage: "STG012", chapter: "CH0122", page: 3, heading: "Adding the Factors",
    kind: "order", title: "Put the Perfect Number check in order",
    noRun: true,
    question: "You are given a number and asked to check whether it is perfect. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Start sum at 0",
      "Loop candidates i from 1 up to n - 1",
      "Check whether n % i == 0",
      "If it is a factor, add i to sum",
      "Once the loop finishes, compare sum with n",
    ],
    distractors: ["Loop candidates i from 1 up to and including n"],
    explanation: "Start sum at 0, then loop every candidate from 1 up to n - 1 (n itself is never a proper factor of itself). Check each with %, add the ones that divide exactly, and only compare sum with n once every candidate has been checked. Looping up to and including n would wrongly count n as its own factor.",
  },
  {
    id: "CH0122.p5.assign-steps", stage: "STG012", chapter: "CH0122", page: 5, heading: "Perfect Number Recap",
    kind: "assign", title: "Match each line to what it does",
    question: "Sort each statement into the step of the Perfect Number check it belongs to.",
    buckets: [
      { id: "loop", label: "LOOP" },
      { id: "check", label: "CHECK" },
      { id: "add", label: "ADD" },
      { id: "compare", label: "COMPARE" },
    ],
    items: [
      { text: "for (i = 1; i < n; i++)", bucket: "loop", why: "This tries every candidate factor from 1 up to n - 1." },
      { text: "if (n % i == 0)", bucket: "check", why: "This checks whether i divides n exactly." },
      { text: "sum = sum + i;", bucket: "add", why: "This adds a factor that was found onto the running total." },
      { text: "if (sum == n)", bucket: "compare", why: "This checks whether the total of the factors matches the number itself." },
    ],
    explanation: "LOOP through every candidate factor, CHECK each one with %, ADD the ones that divide exactly, and COMPARE the total with the number only once the loop has finished.",
  },
]);
