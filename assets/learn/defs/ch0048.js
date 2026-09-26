/*
 * CH0048 - Input validation (Stage 4).
 * p3: range-check lab, p4: what scanf returns (predict, then run with editable keyboard input),
 * p5: sort sample failures into type check and range check. Pages 1 and 2 stay static.
 * Note: CH0048 p3 uses if/else and && from page text; printing a comparison with %d (1 = TRUE, 0 = FALSE)
 * was taught in CH0043.
 */
ClickLearn.define([
  {
    id: "CH0048.p3.range-lights", stage: "STG004", chapter: "CH0048", page: 3, heading: "Validation Using Conditions",
    kind: "lab", title: "Check each half of the range check",
    implements: ["CH0048.p3.lab"],
    observe: "Slide `marks` and watch the two comparison lines. `1` means TRUE and `0` means FALSE. Find a value where the first line shows `0`. Then find a value where the second line shows `0`.",
    controls: [{ id: "marks", type: "range", label: "marks", min: -20, max: 150, step: 1, value: 85 }],
    code: 'int marks = {{marks}};\n\nprintf("marks >= 0   : %d\\n", marks >= 0);\nprintf("marks <= 100 : %d\\n", marks <= 100);\n\nif (marks >= 0 && marks <= 100)\n{\n   printf("Valid marks");\n}\nelse\n{\n   printf("Invalid marks");\n}',
    show: ["lines"],
    summary: "`marks` is {{marks}}. The message says Valid marks only when BOTH comparisons show `1`. If either half is `0`, && makes the whole condition FALSE.",
  },
  {
    id: "CH0048.p4.predict-hello", stage: "STG004", chapter: "CH0048", page: 4, heading: "scanf() Success Check",
    kind: "predict", title: "What if the user types hello?",
    implements: ["CH0048.p4.inp"],
    question: "`age` starts as -1. The user types `hello` instead of a number. What does the program print?",
    code: 'int age = -1;\n\nif (scanf("%d", &age) == 1)\n{\n   printf("Input accepted");\n}\nelse\n{\n   printf("Invalid input");\n}\nprintf("\\nage is %d", age);',
    input: "hello",
    choices: [
      "Input accepted\nage is -1",
      "Invalid input\nage is 0",
      "Invalid input\nage is -1",
      "Input accepted\nage is 0",
    ],
    expected: "Invalid input\nage is -1",
    hint: "How many whole numbers could scanf read from `hello`? And did it change `age`?",
    explanation: "`hello` is not a whole number, so `%d` reads nothing and scanf returns `0`. `0 == 1` is FALSE, so the else block runs and prints Invalid input.\nA failed scanf does not touch the variable, so `age` keeps its old value, -1. It does not become 0.",
  },
  {
    id: "CH0048.p4.scanf-return", stage: "STG004", chapter: "CH0048", page: 4, heading: "scanf() Success Check",
    kind: "run", title: "Look at the number scanf returns",
    implements: ["CH0048.p4.inp"],
    code: '#include <stdio.h>\n\nint main()\n{\n   int age = -1;\n   int count = scanf("%d", &age);\n\n   printf("scanf returned %d\\n", count);\n   printf("age is %d", age);\n   return 0;\n}',
    input: "20",
    tasks: [
      "Press Run with `20` in the keyboard box. Note what scanf returned and what `age` holds.",
      "Type `hello` in the keyboard box and press Run again.",
      "Compare the two runs: what did scanf return each time, and what happened to `age`?",
    ],
    goal: { contains: "scanf returned 0" },
    goalHint: "Now type `hello` in the keyboard box and press Run again.",
    explanation: "With `20`, scanf read one value, so it returned `1` and stored 20 in `age`.\nWith `hello`, it could read no whole number, so it returned `0` and left `age` at -1.\nThat is why `if (scanf(\"%d\", &age) == 1)` is a type check.",
  },
  {
    id: "CH0048.p5.type-or-range", stage: "STG004", chapter: "CH0048", page: 5, heading: "Quick Recap — Input Validation",
    kind: "assign", title: "Type check or range check?",
    implements: ["CH0048.p5.chk"],
    question: "Each line is a problem with the user's input. Which check would catch it?",
    buckets: [{ id: "type", label: "Type check" }, { id: "range", label: "Range check" }],
    items: [
      { text: "The user types abc for their age", bucket: "type", why: "abc is not a whole number, so scanf(\"%d\") cannot read it. That is a type problem." },
      { text: "The user types -5 for their age", bucket: "range", why: "-5 is a whole number, so the type is fine. But an age cannot be negative. That is a range problem." },
      { text: "The user types 150 for marks (allowed: 0 to 100)", bucket: "range", why: "150 is an integer, so scanf reads it fine. It is outside 0 to 100, so it fails the range check." },
      { text: "The user types hello when a number is needed", bucket: "type", why: "Letters are the wrong kind of data for %d. Checking the kind of data is the type check." },
      { text: "scanf() returns 0", bucket: "type", why: "scanf() returns 0 when it could not read the expected type. `scanf(...) == 1` is the type check." },
      { text: "age >= 0 && age <= 100 is FALSE", bucket: "range", why: "This compares the value with the allowed limits. That is the range check." },
    ],
    explanation: "Type check: did the user enter the right kind of data? `scanf(...) == 1`. Range check: is the value inside the allowed limits? `age >= 0 && age <= 100`.",
  },
]);
