/*
 * CH0094 - What is a Function? (Stage 9, STG010).
 *
 * Source: Functions1.pdf. The PDF introduces a function as a named block of code that performs one specific task,
 * why functions are used (write once, call many times), the difference between a function and a greedy algorithm, and
 * the define -> call -> execute flow using void greet() { printf("Hello Student"); } called from main().
 *
 * Activities: the tea-canteen analogy mapped onto call / execution / result, a small lab that calls greet() once, twice
 * or three times (reuse), a sort of "function" versus "greedy algorithm" descriptions, and a step-by-step trace of
 * greet() being called. The lab only adds extra greet(); lines, so it shows the PDF's "write once, call many times".
 */
ClickLearn.define([
  {
    id: "CH0094.p1.tea-story", stage: "STG010", chapter: "CH0094", page: 1, heading: "What Is a Function?",
    kind: "assign", title: "Order tea: which idea is each step?",
    question: "Ordering tea in a canteen works like a function. Sort each step, and its code twin, into the right idea.",
    buckets: [
      { id: "call", label: "Function call" },
      { id: "exec", label: "Function execution" },
      { id: "result", label: "Result" },
    ],
    items: [
      { text: "You order tea", bucket: "call", why: "Asking for the task to be done is the function call." },
      { text: "greet();", bucket: "call", why: "Writing the function's name with () asks it to run: that is the call." },
      { text: "The tea master prepares the tea", bucket: "exec", why: "Doing the task is the function execution." },
      { text: "printf(\"Hello Student\");", bucket: "exec", why: "The statements inside the function are what execute when it is called." },
      { text: "You receive the tea", bucket: "result", why: "What you get at the end is the result." },
      { text: "Hello Student appears on the screen", bucket: "result", why: "The output is the completed work, the result." },
    ],
    explanation: "Order tea = function call. The tea master preparing it = function execution. Getting the tea = the result.",
  },
  {
    id: "CH0094.p2.reuse-lab", stage: "STG010", chapter: "CH0094", page: 2, heading: "Why Do We Use Functions?",
    kind: "lab", title: "Write once, call many times",
    observe: "greet() is written only once. Switch on extra calls in main() and watch the same code run again.",
    controls: [
      { id: "second", type: "toggle", label: "Call greet() a second time", on: "   greet();\n", off: "", checked: false },
      { id: "third", type: "toggle", label: "Call greet() a third time", on: "   greet();\n", off: "", checked: false },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void greet() {",
      "   printf(\"Hello Student\\n\");",
      "}",
      "",
      "int main() {",
      "   greet();",
      "{{second}}{{third}}   return 0;",
      "}",
    ].join("\n"),
    summary: "greet() is written once. Every greet(); line in main() runs it again.",
    explanation: "Each extra call runs the same function again, with no extra code written inside greet(). That is reusability: write once, call many times.",
  },
  {
    id: "CH0094.p3.function-or-greedy", stage: "STG010", chapter: "CH0094", page: 3, heading: "Function and Greedy Algorithm",
    kind: "assign", title: "Function or greedy algorithm?",
    question: "A function and a greedy algorithm are different ideas. Which one does each sentence describe?",
    buckets: [
      { id: "fn", label: "Function" },
      { id: "greedy", label: "Greedy algorithm" },
    ],
    items: [
      { text: "A block of code that performs a particular task", bucket: "fn", why: "That is the definition of a function." },
      { text: "Chooses the best available option at each step", bucket: "greedy", why: "Choosing the best option at each step is what a greedy algorithm does." },
      { text: "The worker who does the task", bucket: "fn", why: "Function = the worker. It performs the work." },
      { text: "The decision method: choosing the easiest task first", bucket: "greedy", why: "Greedy = the decision method that chooses the option." },
      { text: "A problem-solving method", bucket: "greedy", why: "A greedy algorithm is a problem-solving method, not a block of code." },
      { text: "Runs when it is called", bucket: "fn", why: "A function's statements run when the function is called." },
    ],
    explanation: "A function performs the work; a greedy algorithm chooses the option. A function can contain a greedy algorithm, but they are not the same thing.",
  },
  {
    id: "CH0094.p4.trace-greet", stage: "STG010", chapter: "CH0094", page: 4, heading: "How Does a Function Work?",
    kind: "trace", title: "Define, call, execute",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "void greet() {",
      "   printf(\"Hello Student\");",
      "}",
      "",
      "int main() {",
      "   greet();",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "This line is inside greet(). It runs only because greet() was called.",
      8: "main() calls greet(). The program jumps into greet(), and comes back to this line when greet() has finished.",
    },
    explanation: "Defining greet() (lines 3-5) does not run it. The output appears only when main() calls greet(): define, call, execute.",
  },
]);
