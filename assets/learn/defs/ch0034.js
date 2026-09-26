/*
 * CH0034 - Variables (Stage 0).
 *
 * The pages describe a variable as a named box but the student never builds one. Here they assemble
 * `int age = 18;` from its three parts, complete the DATA TYPE + NAME formula, change a stored value and
 * run it (including storing a new value in the same box), and predict what printf("%d", ...) shows.
 * The printf("%d") line on page 3 is a labelled preview; page 4 teaches it.
 */
ClickLearn.define([
  {
    id: "CH0034.p1.build-the-box", stage: "STG001", chapter: "CH0034", page: 1, heading: "What Is a Variable?",
    kind: "builder", title: "Build the box",
    implements: ["CH0034.p1.mem"],
    question: "Make a box called `age` that holds the whole number `18`. Choose the part that belongs in each spot.",
    template: "{type} {name} = {value};",
    slots: {
      type: { label: "type of value", options: ["int", "age", "18"], answer: "int", why: "The first part says what KIND of value the box holds. Here it is `int`, a whole number." },
      name: { label: "name of the box", options: ["int", "age", "18"], answer: "age", why: "The second part is the label on the box. Here the name is `age`." },
      value: { label: "value inside", options: ["int", "age", "18"], answer: "18", why: "The last part is the value stored in the box. Here it is `18`." },
    },
    explanation: "`int` is the type, `age` is the name of the box, and `18` is what is stored inside it.",
  },
  {
    id: "CH0034.p2.type-plus-name", stage: "STG001", chapter: "CH0034", page: 2, heading: "Creating a Variable",
    kind: "fill", title: "DATA TYPE + NAME",
    implements: ["CH0034.p2.fil"],
    question: "Complete each line with the formula: data type, then the variable name. The comment says what the box is for.",
    code: "___ ___;   // a whole number called marks\n___ ___;   // a decimal number called price\n___ ___;   // one character called grade",
    blanks: [
      { code: true, answers: ["int"], hint: "A whole number uses the type `int`." },
      { code: true, answers: ["marks"], hint: "Use the name from the comment." },
      { code: true, answers: ["float"], hint: "A decimal number uses the type `float`." },
      { code: true, answers: ["price"], hint: "Use the name from the comment." },
      { code: true, answers: ["char"], hint: "One character uses the type `char`." },
      { code: true, answers: ["grade"], hint: "Use the name from the comment." },
    ],
    explanation: "Every declaration has the same shape: data type, then name, then `;`.",
  },
  {
    id: "CH0034.p3.change-and-run", stage: "STG001", chapter: "CH0034", page: 3, heading: "Storing a Value",
    kind: "run", title: "Change the stored value",
    implements: ["CH0034.p3.run"],
    intro: "A quick preview: the `printf` line shows the number that is in the box. You learn how it works on the next page.",
    code: '#include <stdio.h>\n\nint main()\n{\n   int age = 18;\n   printf("%d", age);\n   return 0;\n}',
    initialOutput: "18",
    tasks: ["Change `18` to your own age and press Run.", "Add the line `age = 25;` under `int age = 18;` and press Run. Which number is shown now?"],
    goal: { changed: true }, goalHint: "Change the number in `int age = 18;` (or add `age = 25;`) and press Run again.",
    explanation: "`=` puts a value into the box. If you put a new value into the same box, it replaces the old one. The printf line always shows what is in the box right now.",
  },
  {
    id: "CH0034.p4.predict-value", stage: "STG001", chapter: "CH0034", page: 4, heading: "Using a Variable",
    kind: "predict", title: "What does printf show?",
    implements: ["CH0034.p4.pr"],
    code: 'int score = 40;\nprintf("%d", score);',
    choices: ["score", "40", "%d"],
    expected: "40",
    hint: "If you picked `score`: printf() shows the value stored in the box, not the name of the box. If you picked `%d`: the `%d` is a spot that printf() fills in with the value.",
    explanation: "`%d` is replaced by the integer stored in `score`, so the screen shows `40`.",
  },
  {
    id: "CH0034.p4.predict-new-value", stage: "STG001", chapter: "CH0034", page: 4, heading: "Using a Variable",
    kind: "predict", title: "Change the value, then print",
    implements: ["CH0034.p4.pr"],
    code: 'int lives = 3;\nlives = 2;\nprintf("%d", lives);',
    choices: ["3", "2", "32", "lives"],
    expected: "2",
    hint: "If you picked `3`: the second line puts a new value in the box, so `3` is gone. If you picked `32`: a box holds only one value at a time. If you picked `lives`: printf() shows the value, not the name.",
    explanation: "`lives = 2;` replaces the `3` with `2`. printf() shows what is in the box at that moment: `2`.",
  },
]);
