/*
 * CH0102 - Recursive Functions (Stage 9, STG010).
 *
 * Source: Functions9.pdf. The PDF defines a recursive function as one that calls itself, names its two parts (the base case
 * that stops and the recursive case that calls again with a smaller value), and uses one example throughout:
 * void count(int n) { if (n == 0) return; printf("%d ", n); count(n - 1); } called as count(3), which prints 3 2 1.
 * It also warns that a recursive function must have a stopping condition.
 *
 * Activities: a sort into base case / recursive case, a lab that changes the start value of count(), a step-by-step trace of
 * count(3) with the "Calls in progress" list (the calls pile up, then finish in reverse order), and a lab that switches the
 * base case off. Without the base case the interpreter stops the run with its own "nested too deeply" message; real C would
 * keep calling until it crashes (a stack overflow), which the text says plainly (mayFail: true because that run legitimately fails).
 */
ClickLearn.define([
  {
    id: "CH0102.p1.base-or-recursive", stage: "STG010", chapter: "CH0102", page: 1, heading: "What Is a Recursive Function?",
    kind: "assign", title: "Base case or recursive case?",
    question: "A recursive function has two important parts. Sort each line or question into the part it belongs to.",
    buckets: [
      { id: "base", label: "Base case" },
      { id: "recursive", label: "Recursive case" },
    ],
    items: [
      { text: "if (n == 0) return;", bucket: "base", why: "This line checks whether it is time to stop. When n is 0 the function returns and makes no more calls." },
      { text: "count(n - 1);", bucket: "recursive", why: "Here the function calls itself again, with the smaller value n - 1." },
      { text: "\"When should I stop?\"", bucket: "base", why: "Deciding when to stop is the job of the base case." },
      { text: "\"How should I continue?\"", bucket: "recursive", why: "Continuing by calling the function again is the recursive case." },
      { text: "Stops the recursion", bucket: "base", why: "The base case is what ends the chain of calls, like the smallest Russian doll." },
      { text: "Calls the function again with a smaller value", bucket: "recursive", why: "The recursive case makes the next call on a smaller problem, so it moves closer to the base case." },
    ],
    explanation: "Base case = STOP. Recursive case = AGAIN. The base case stops the recursion, and the recursive case continues it with a smaller value.",
  },
  {
    id: "CH0102.p2.count-lab", stage: "STG010", chapter: "CH0102", page: 2, heading: "Why Are Recursive Functions Used?",
    kind: "lab", title: "How many calls happen?",
    observe: "count() is written once and calls itself. Choose the start value and see how many numbers are printed before the base case stops it.",
    controls: [
      { id: "n", type: "select", label: "Start value in main()", value: "3", options: [{ v: "0", l: "count(0)" }, { v: "1", l: "count(1)" }, { v: "2", l: "count(2)" }, { v: "3", l: "count(3)" }, { v: "4", l: "count(4)" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void count(int n) {",
      "   if (n == 0)",
      "      return;",
      "",
      "   printf(\"%d \", n);",
      "   count(n - 1);",
      "}",
      "",
      "int main() {",
      "   count({{n}});",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "With the start value {{n}}, the program printed \"{{out}}\".",
    explanation: "Each printed number is one call that did not stop. count(3) makes the calls count(3), count(2), count(1) and count(0), and only the last one reaches the base case. A bigger start value means more calls before the base case. count(0) prints nothing because the base case is reached at once.",
  },
  {
    id: "CH0102.p3.trace-count", stage: "STG010", chapter: "CH0102", page: 3, heading: "Base Case and Recursive Case",
    kind: "trace", title: "count(3): the calls pile up, then finish",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "void count(int n) {",
      "   if (n == 0)",
      "      return;",
      "",
      "   printf(\"%d \", n);",
      "   count(n - 1);",
      "}",
      "",
      "int main() {",
      "   count(3);",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "The base-case check. While n is more than 0 the program carries on to the next line. When n is 0 the function returns, no new call is made, and the calls start to finish one by one.",
      7: "The current value of n is processed: the number is printed before the function calls itself again.",
      8: "The recursive case: count(n - 1) calls count() again with a smaller value. Watch \"Calls in progress\": every new call is added on top. When a call returns it is taken off again, and the program comes back to this line in the call below it.",
      12: "main() makes the first call, count(3). Every other call is made by count() itself.",
    },
    explanation: "The calls pile up: count(3) calls count(2), which calls count(1), which calls count(0). Only count(0) reaches the base case, so it returns first, then count(1), count(2) and count(3) finish in reverse order. Each call printed its number on the way down, so the output is 3 2 1.",
  },
  {
    id: "CH0102.p4.no-base-case", stage: "STG010", chapter: "CH0102", page: 4, heading: "Recursion Flowchart",
    kind: "lab", title: "Why a base case is needed",
    mayFail: true,
    observe: "The flowchart asks \"Is the base case reached?\" on every call. Switch the base case off, so count() has nothing to check, and see what happens.",
    controls: [
      { id: "base", type: "toggle", label: "Include the base case", on: "   if (n == 0)\n      return;\n", off: "", checked: true },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void count(int n) {",
      "{{base}}   printf(\"%d \", n);",
      "   count(n - 1);",
      "}",
      "",
      "int main() {",
      "   count(3);",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "With the base case, count(3) stops after printing: {{out}}",
    explanation: "With the base case on, the calls stop at n == 0. With it off, nothing ever stops them: count(3) calls count(2), count(1), count(0), count(-1) and so on, and n just keeps getting smaller. The simulator notices the function calling itself too deeply and stops the run with a message, instead of an answer. Real C is less polite: the program would keep calling itself until the computer runs out of room for calls and it crashes (a stack overflow). That is why a recursive function must always have a stopping condition.",
  },
]);
