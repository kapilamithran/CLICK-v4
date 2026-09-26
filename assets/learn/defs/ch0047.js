/*
 * CH0047 - scanf() (Stage 4).
 * p2: input simulator + tap-to-explain, p3: the missing & (authored warning + a look inside the variable),
 * p4: two values on one line. Pages 1 and 5 stay static.
 * The p3 error demo uses an authored gcc-style warning and is marked skipGcc: the broken program is
 * deliberately wrong C that real gcc only warns about, then runs with undefined behaviour.
 * One extra activity (p4 mcq) removes a real confusion: which variable receives which value.
 */
ClickLearn.define([
  {
    id: "CH0047.p2.watch-marks-flow", stage: "STG004", chapter: "CH0047", page: 2, heading: "Understanding scanf()",
    kind: "buffer", title: "Type a number and watch it flow into marks",
    implements: ["CH0047.p2.inp"],
    question: "The user types `85` and presses Enter. Press \"Run next input call\" and watch the number leave the queue and land in `marks`. Then change the number in the box and run it again.",
    code: ["int marks;", "", 'scanf("%d", &marks);'],
    calls: [{ fmt: "%d", var: "marks", line: 3 }],
    input: "85\n",
    explanation: "`%d` says what to expect: a whole number. `&marks` says where to store it. The flow is USER → 85 → scanf() → marks.",
  },
  {
    id: "CH0047.p2.tap-scanf-parts", stage: "STG004", chapter: "CH0047", page: 2, heading: "Understanding scanf()",
    kind: "reveal", title: "Tap each part of the scanf line",
    implements: ["CH0047.p2.inp"],
    code: 'scanf("%d", &marks);',
    notes: [
      { text: "scanf", note: "The function that waits for the user to type, then reads what was typed." },
      { text: '"%d"', note: "The format specifier. It tells C: \"I am expecting an integer.\"" },
      { text: "&marks", note: "The location of the variable `marks`. Think of `marks` as a box and `&marks` as the label that says where the box is. scanf follows the label and stores the number inside." },
    ],
    explanation: "Three parts: what to read (`%d`), where to store it (`&marks`), and the function that does the reading (`scanf`).",
  },
  {
    id: "CH0047.p3.remove-ampersand", stage: "STG004", chapter: "CH0047", page: 3, heading: "Why Do We Use &?",
    kind: "error", mode: "toggle", title: "What happens when the & is missing?",
    implements: ["CH0047.p3.bug"],
    skipGcc: true,
    question: "Press Compile to read what gcc says about this program. Then apply the fix and compile again.",
    input: "25",
    broken: 'int age;\n\nscanf("%d", age);\nprintf("%d", age);',
    fixed: 'int age;\n\nscanf("%d", &age);\nprintf("%d", age);',
    outputAfterFix: "25",
    diagnostic: [
      "warning: format '%d' expects argument of type 'int *', but argument 2 has type 'int' [-Wformat=]",
      "    3 | scanf(\"%d\", age);",
      "      |        ~^   ~~~",
      "      |         |   |",
      "      |         |   int",
      "      |         int *",
    ].join("\n"),
    explanation: "`%d` tells scanf to store the number, so it expects the location of an int. gcc writes that as `int *`. But `age` alone is only the value inside the box (`int`), not where the box is.\nReal gcc only warns here and still builds the program, but scanf then has nowhere sensible to put the number. Never ignore this warning.",
    fixNote: "`&age` gives scanf the location of `age`, so it can store 25 there. printf() then shows 25.",
  },
  {
    id: "CH0047.p3.follow-the-location", stage: "STG004", chapter: "CH0047", page: 3, heading: "Why Do We Use &?",
    kind: "trace", title: "See what &age lets scanf do",
    implements: ["CH0047.p3.bug"],
    intro: "The user types `25`. Step through and watch the box `age` in the variable table.",
    code: '#include <stdio.h>\n\nint main()\n{\n   int age;\n\n   scanf("%d", &age);\n   printf("%d", age);\n   return 0;\n}',
    input: "25",
    notes: {
      5: "`age` is a box in memory. It has a location, and right now the box is empty (`?`).",
      7: "`&age` hands scanf the location of the box. scanf goes to that location and stores 25 inside. Look at the table: the value of `age` just changed. Without the &, scanf would get only a copy of the value, with no location to write to.",
      8: "Now the box holds 25, so printf() can show it. printf() only needs the value, so no & here.",
    },
  },
  {
    id: "CH0047.p4.two-values", stage: "STG004", chapter: "CH0047", page: 4, heading: "Taking Multiple Inputs",
    kind: "buffer", title: "Type two values for one scanf",
    implements: ["CH0047.p4.inp"],
    question: "The user types `18 5.8`. Press \"Run all\" and see which value goes into which variable. Then edit the input: put the two values on separate lines, try `10 20`, and try a comma like `18,5.8`. What can separate the values?",
    code: ["int age;", "float height;", "", 'scanf("%d %f", &age, &height);'],
    calls: [{ fmt: "%d", var: "age", line: 4 }, { fmt: "%f", var: "height", line: 4 }],
    input: "18 5.8\n",
    explanation: "One scanf with two specifiers reads two values, in order: the first value goes to `&age` and the second to `&height`.",
  },
  {
    id: "CH0047.p4.match-order", stage: "STG004", chapter: "CH0047", page: 4, heading: "Taking Multiple Inputs",
    kind: "mcq", title: "Which call matches?",
    question: "The user will type `18 5.8`. `age` is an `int` and `height` is a `float`. Which call stores 18 in `age` and 5.8 in `height`?",
    choices: [
      { text: "`scanf(\"%f %d\", &age, &height);`", why: "The specifiers are in the wrong order. `%f` would be used for `age`, which is an int, and `%d` for `height`, which is a float." },
      { text: "`scanf(\"%d %f\", &age, &height);`", correct: true, why: "The first specifier `%d` pairs with the first variable `&age`, and `%f` pairs with `&height`." },
      { text: "`scanf(\"%d %f\", &height, &age);`", why: "The variables are swapped. The first value would go to `height` and the second to `age`. Specifiers and variables pair up by position." },
      { text: "`scanf(\"%d %f\", age, height);`", why: "The & is missing on both variables. scanf needs the location of every variable it fills." },
    ],
    explanation: "Specifiers and variables pair up by position: first with first, second with second. Every variable still needs its &.",
  },
]);
