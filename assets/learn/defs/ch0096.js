/*
 * CH0096 - Functions with Parameters (Stage 9, STG010).
 *
 * Source: Functions3.pdf. The PDF defines a parameter (a variable that receives a value inside a function), why parameters
 * are used (the same function works with different values: void square(int n)), parameter versus argument
 * (void add(int a, int b) versus add(5, 3);), the three kinds of headers (one parameter, multiple parameters, parameters
 * with a return value) and the flow of add(5, 3): a receives 5, b receives 3, the sum 8 is displayed.
 *
 * Activities: sort the names in a definition (parameters) from the values in a call (arguments), a lab that changes the
 * argument passed to square(), a sort of the PDF's function headers by how many parameters they have and whether they
 * return a result, and a step-by-step trace of add(5, 3).
 */
ClickLearn.define([
  {
    id: "CH0096.p1.parameter-or-argument", stage: "STG010", chapter: "CH0096", page: 1, heading: "What Are Parameters?",
    kind: "assign", title: "Parameter or argument?",
    question: "The same values show up in two places: in the function's definition and in the call. Which is a parameter and which is an argument?",
    buckets: [
      { id: "param", label: "Parameter (written in the function definition)" },
      { id: "arg", label: "Argument (the value passed in the call)" },
    ],
    items: [
      { text: "a in void add(int a, int b)", bucket: "param", why: "a is a variable written in the function's header. It receives a value when add() is called, so it is a parameter." },
      { text: "b in void add(int a, int b)", bucket: "param", why: "b is also written in the header, waiting to receive a value. That makes it a parameter." },
      { text: "n in void square(int n)", bucket: "param", why: "n is written in the definition of square() and receives the value that is passed in, so it is a parameter." },
      { text: "5 in add(5, 3)", bucket: "arg", why: "5 is an actual value written in the call. It is sent to the parameter a, so it is an argument." },
      { text: "3 in add(5, 3)", bucket: "arg", why: "3 is an actual value written in the call. It is sent to the parameter b, so it is an argument." },
      { text: "4 in square(4)", bucket: "arg", why: "4 is the actual value passed when square() is called. It goes into the parameter n, so it is an argument." },
    ],
    explanation: "A parameter is a variable written in the function definition. An argument is the actual value passed during the call. Function = worker, parameter = work given to the worker, argument = actual work sent.",
  },
  {
    id: "CH0096.p2.same-function-different-values", stage: "STG010", chapter: "CH0096", page: 2, heading: "Why Are Parameters Used?",
    kind: "lab", title: "Same function, different values",
    observe: "square() is written only once, with one parameter n. Choose the argument in the call and watch n receive it.",
    controls: [
      { id: "x", type: "select", label: "Argument passed to square()", value: "5", options: [{ v: "2", l: "2" }, { v: "3", l: "3" }, { v: "5", l: "5" }, { v: "9", l: "9" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void square(int n) {",
      "   printf(\"%d\", n * n);",
      "}",
      "",
      "int main() {",
      "   square({{x}});",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "square({{x}}) sends {{x}} into n, so the function prints {{out}}.",
    explanation: "The function is written once. Each call sends a different argument into the parameter n, so the same code gives a different result. Same function + different parameters = different results.",
  },
  {
    id: "CH0096.p3.how-many-parameters", stage: "STG010", chapter: "CH0096", page: 3, heading: "Types of Parameters",
    kind: "assign", title: "How many parameters?",
    question: "Count the parameters in each header, then check its return type. void means no result is sent back; int means a result is returned.",
    buckets: [
      { id: "one", label: "One parameter (no result returned)" },
      { id: "many", label: "Multiple parameters (no result returned)" },
      { id: "ret", label: "Receives values and returns a result" },
    ],
    items: [
      { text: "void display(int n)", bucket: "one", why: "Only one parameter, n, and the return type is void, so nothing is sent back." },
      { text: "void square(int n)", bucket: "one", why: "One parameter, n. It is void, so it prints its answer instead of returning it." },
      { text: "void add(int a, int b)", bucket: "many", why: "Two parameters, a and b, separated by a comma. It is void, so no result is returned." },
      { text: "void calculateTotal(int price, int quantity)", bucket: "many", why: "Two parameters, price and quantity. Because it is void, it can only print the total, not send it back." },
      { text: "int multiply(int a, int b)", bucket: "ret", why: "It receives two values and its return type is int: it sends back a result (a * b)." },
      { text: "int calculateTotal(int price, int quantity)", bucket: "ret", why: "It receives two values and returns an int: the total is sent back to the caller instead of printed." },
    ],
    explanation: "A function can receive one value or several. If its return type is void nothing comes back; if it is int (or another type) it also sends back a result. Remember: the number, order and type of the arguments should match the parameters.",
  },
  {
    id: "CH0096.p4.trace-add", stage: "STG010", chapter: "CH0096", page: 4, heading: "Function with Parameters: Flow",
    kind: "trace", title: "Follow add(5, 3)",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "void add(int a, int b) {",
      "   printf(\"%d\", a + b);",
      "}",
      "",
      "int main() {",
      "   add(5, 3);",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "The function adds both values: a + b is 5 + 3, so 8 is displayed.",
      8: "main() passes the arguments 5 and 3. a receives 5 and b receives 3. Look at the variable table to see them arrive. When add() finishes, the program comes back to this line.",
    },
    explanation: "In add(5, 3), the first argument 5 goes to a and the second argument 3 goes to b. The function adds them, and the result 8 is displayed.",
  },
]);
