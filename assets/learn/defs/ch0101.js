/*
 * CH0101 - Functions with Arrays and Strings (Stage 9, STG010).
 *
 * Source: Functions8.pdf. The PDF says a function can receive a whole array or string as an argument (the delivery-box
 * analogy), why that is useful (one function processes many values), compares arrays and strings in a table, and walks
 * through display(numbers, 3) printing 10 20 30 with a loop over the elements.
 *
 * Activities: the delivery-box analogy as tap cards, a lab that changes the size passed to display() (1, 2 or 3 elements),
 * a sort of the PDF's comparison-table statements into array / string, and a step-by-step trace of display(numbers, 3).
 * The lab only changes the size argument and never goes past the 3 elements of numbers.
 */
ClickLearn.define([
  {
    id: "CH0101.p1.delivery-box", stage: "STG010", chapter: "CH0101", page: 1, heading: "What Are Functions with Arrays and Strings?",
    kind: "reveal", title: "Tap each card: the delivery box",
    cards: [
      { label: "Function = the worker", body: "The function is the worker who does the job. In `void display(int arr[], int n)`, display is the worker that will handle whatever you give it." },
      { label: "Array = a box with many items", body: "An array stores many values of the same type, like a box holding many items. `int numbers[] = {10, 20, 30};` is a box with three numbers inside." },
      { label: "String = a box with characters", body: "A string is a box of characters. `char name[] = \"Arun\";` holds the characters A, r, u and n, stored in a character array." },
      { label: "Function call = giving the box to the worker", body: "`display(numbers, 3);` hands the box `numbers` to the worker, together with how many items are inside. The box and its size are the arguments." },
      { label: "Result = processed information", body: "The worker processes what is inside the box and produces the result. Here display() goes through the box and prints `10 20 30`." },
    ],
    explanation: "A function can receive an entire array or string instead of handling every value separately.",
  },
  {
    id: "CH0101.p2.size-lab", stage: "STG010", chapter: "CH0101", page: 2, heading: "Why Are Arrays and Strings Passed to Functions?",
    kind: "lab", title: "The function processes what you give it",
    observe: "display() is written once. Choose the size you pass to it and see how many elements of `numbers` it processes.",
    controls: [
      { id: "n", type: "select", label: "Size passed to display()", value: "3", options: [{ v: "1", l: "1 element" }, { v: "2", l: "2 elements" }, { v: "3", l: "3 elements" }] },
    ],
    code: [
      "#include <stdio.h>",
      "",
      "void display(int arr[], int n) {",
      "   for (int i = 0; i < n; i++)",
      "      printf(\"%d \", arr[i]);",
      "}",
      "",
      "int main() {",
      "   int numbers[] = {10, 20, 30};",
      "   display(numbers, {{n}});",
      "   return 0;",
      "}",
    ].join("\n"),
    summary: "display(numbers, {{n}}) printed: {{out}}",
    explanation: "The function receives the array and works with its elements: it processes exactly as many as the size n you pass. One function, written once, can display one, two or all three values. That is why arrays are passed to functions instead of repeating the same code.",
  },
  {
    id: "CH0101.p3.array-or-string", stage: "STG010", chapter: "CH0101", page: 3, heading: "Arrays vs Strings in Functions",
    kind: "assign", title: "Array or string?",
    question: "Sort each statement from the comparison table: does it describe an array or a string?",
    buckets: [
      { id: "array", label: "Array" },
      { id: "string", label: "String" },
    ],
    items: [
      { text: "Stores multiple values", bucket: "array", why: "An array stores a collection of values, such as {80, 75, 90}." },
      { text: "Stores characters/text", bucket: "string", why: "A string stores characters that make up text, such as \"Arun\"." },
      { text: "Can contain int, float, etc.", bucket: "array", why: "An array can hold any one data type, such as int or float." },
      { text: "Uses char", bucket: "string", why: "A string is a character array, so its type is char." },
      { text: "Usually passed with its size", bucket: "array", why: "A function receiving an array is usually told how many elements it has, as in show(int marks[], int n)." },
      { text: "Ends with '\\0'", bucket: "string", why: "A string in C ends with the null character '\\0', which marks where the text stops." },
      { text: "Used for collections of data", bucket: "array", why: "Arrays are used for collections of data, like a list of marks." },
      { text: "Used for text", bucket: "string", why: "Strings are used for text, such as a name or a message." },
    ],
    explanation: "An array is a collection of values, usually passed with its size. A string is a character array used for text, and it ends with the null character '\\0'.",
  },
  {
    id: "CH0101.p4.trace-display", stage: "STG010", chapter: "CH0101", page: 4, heading: "Flowchart: Function with Array/String",
    kind: "trace", title: "Create, pass, process, display",
    callStack: true,
    code: [
      "#include <stdio.h>",
      "",
      "void display(int arr[], int n) {",
      "   for (int i = 0; i < n; i++) {",
      "      printf(\"%d \", arr[i]);",
      "   }",
      "}",
      "",
      "int main() {",
      "   int numbers[] = {10, 20, 30};",
      "",
      "   display(numbers, 3);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    notes: {
      4: "The loop is inside the function. It runs once for each element, with i going 0, 1, 2, and stops when i reaches n.",
      5: "arr[i] is the element at position i of the array the function received, so each round prints the next value.",
      10: "numbers contains three values: 10, 20 and 30. This is the box we will hand to the function.",
      12: "main() calls display(numbers, 3). The array and its size are the arguments. When display() finishes, the program comes back to this line.",
    },
    explanation: "numbers holds three values. The array and its size are passed to display(), the function receives them, the loop processes each element, and the values are displayed: 10 20 30. Create, pass, process, display.",
  },
]);
