/*
 * CH0095 - Creating and Calling a Function (Stage 9, STG010).
 *
 * Source: Functions2.pdf. The PDF separates creating a function (writing its instructions) from calling it (asking the
 * program to execute them), lists why functions are used, shows that a function can help a greedy algorithm (the
 * chooseCoin() idea), and walks the flow: create -> enter main() -> call -> execute -> output.
 *
 * Activities: sort "creating" lines from "calling" lines (with the tea-machine analogy), a lab that switches the call to
 * makeTea() on and off (defining does not execute), tap-to-open cards for what a function can do inside a greedy
 * algorithm plus the chooseCoin() example, and a step-by-step trace of makeTea() being created and called.
 */
ClickLearn.define([
  {
    id: "CH0095.p1.creating-or-calling", stage: "STG010", chapter: "CH0095", page: 1, heading: "Creating and Calling a Function",
    kind: "assign", title: "Creating or calling?",
    question: "A function has two separate jobs in a program. Does each line or idea below create the function (write its instructions) or call it (ask it to run)?",
    buckets: [
      { id: "create", label: "Creating the function (writes the instructions)" },
      { id: "call", label: "Calling the function (asks it to run)" },
    ],
    items: [
      { text: "void makeTea() { printf(\"Tea is ready\"); }", bucket: "create", why: "It has a return type (void), a name and a body in braces. That writes the instructions, so it creates the function. Nothing is printed yet." },
      { text: "makeTea();", bucket: "call", why: "Just the name and (), ending with a semicolon. That asks the function to run, so it is a call." },
      { text: "void greet() { printf(\"Hello Student\"); }", bucket: "create", why: "A return type, a name and a body again: it creates greet(). The message is not printed until greet() is called." },
      { text: "greet();", bucket: "call", why: "Only the name with () and a semicolon: this line asks greet() to run." },
      { text: "Building the tea-making machine once", bucket: "create", why: "Building the machine is like writing the function. You do it once, and the machine does nothing until someone uses it." },
      { text: "Pressing the button to get tea", bucket: "call", why: "Asking the machine for tea is the call. You can do it whenever you need tea." },
    ],
    explanation: "Creating a function writes its instructions once. Calling it, with its name and (), asks the program to execute those instructions. Create once, call whenever needed.",
  },
  {
    id: "CH0095.p2.defined-not-called", stage: "STG010", chapter: "CH0095", page: 2, heading: "Why Are Functions Used?",
    kind: "lab", title: "Defined but not called",
    observe: "makeTea() is written in the program either way. Switch the call in main() on and off, and watch whether anything is printed.",
    controls: [
      { id: "call", type: "toggle", label: "Call makeTea() in main()", on: "   makeTea();\n", off: "", checked: false },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void makeTea() {",
      "   printf(\"Tea is ready\");",
      "}",
      "",
      "int main() {",
      "{{call}}   return 0;",
      "}",
    ].join("\n"),
    explanation: "Defining a function does not execute it. Calling the function executes it. With the call switched off, makeTea() still exists, but nothing asks it to run, so nothing is printed. You create it once and call it whenever you need it.",
  },
  {
    id: "CH0095.p3.greedy-helper", stage: "STG010", chapter: "CH0095", page: 3, heading: "Can Functions Be Used in a Greedy Algorithm?",
    kind: "reveal", title: "What can a function do in a greedy algorithm?",
    cards: [
      { label: "Selecting the best item", body: "A function can do the work of picking the best item from the ones available. The greedy algorithm simply asks it." },
      { label: "Finding the minimum value", body: "A function can find the smallest value among the options, so that job is written once and reused." },
      { label: "Choosing the next activity", body: "A function can pick which activity comes next, one step at a time." },
      { label: "Checking the available options", body: "A function can check which options are still available before a choice is made." },
      { label: "Example: choosing a coin", body: "In a coin-selection problem, `int chooseCoin() { return 10; }` selects a coin. The function selects a coin, while the greedy algorithm decides which coin should be selected." },
      { label: "Function versus greedy algorithm", body: "A function is a reusable block of code. A greedy algorithm is a problem-solving strategy. A greedy algorithm can be written using one or more functions." },
    ],
    explanation: "A function is the worker that does one task. The greedy algorithm is the strategy that decides what to choose.",
  },
  {
    id: "CH0095.p4.trace-create-call", stage: "STG010", chapter: "CH0095", page: 4, heading: "Flowchart: Creating and Calling a Function",
    kind: "trace", title: "Create, call, execute",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "void makeTea() {",
      "   printf(\"Tea is ready\");",
      "}",
      "",
      "int main() {",
      "   makeTea();",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "This line is inside makeTea(). It runs only because main() called makeTea(). The output appears now.",
      8: "main() calls makeTea(). The program jumps into makeTea(), and comes back to this line when makeTea() has finished.",
    },
    explanation: "The flow is: makeTea() is created (lines 3-5), the program enters main() (line 7), main() calls makeTea() (line 8), the function executes its code (line 4), and the output is displayed. Creating the function alone printed nothing.",
  },
]);
