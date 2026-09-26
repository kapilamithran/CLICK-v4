/*
 * CH0042 - assignment (Stage 3, STG003).
 *
 * Why these activities: the pages list ten assignment operators and their "same as" forms, and state three
 * rules (right to left, variable on the left, the box decides the type). Students can now see the shorthand
 * and the long form side by side for every operator, provoke the "left side must be a variable" error,
 * watch a value travel right to left, and check the bitwise assignments from page 4.
 */
ClickLearn.define([
  {
    id: "CH0042.p2.expand-shorthand", stage: "STG003", chapter: "CH0042", page: 2, heading: "Assignment Operators",
    kind: "lab", title: "Shorthand versus written out",
    implements: ["CH0042.p2.lab"],
    observe: "Pick each operator in turn and compare the two panels.",
    controls: [
      { id: "x", type: "range", label: "x starts as", min: 1, max: 50, step: 1, value: 10 },
      { id: "n", type: "range", label: "n (the number on the right)", min: 1, max: 6, step: 1, value: 3 },
      { id: "op", type: "select", label: "Operator", value: "+", options: [
        { v: "+", l: "+=   add and assign" }, { v: "-", l: "-=   subtract and assign" }, { v: "*", l: "*=   multiply and assign" },
        { v: "/", l: "/=   divide and assign" }, { v: "%", l: "%=   remainder and assign" }, { v: "&", l: "&=   AND and assign" },
        { v: "|", l: "|=   OR and assign" }, { v: "^", l: "^=   XOR and assign" }, { v: "<<", l: "<<=  shift left and assign" }, { v: ">>", l: ">>=  shift right and assign" },
      ] },
    ],
    variants: [
      { label: "Shorthand", code: 'int x = {{x}};\nx {{op}}= {{n}};\nprintf("x = %d", x);' },
      { label: "Written out", code: 'int x = {{x}};\nx = x {{op}} {{n}};\nprintf("x = %d", x);' },
    ],
    summary: "`x {{op}}= {{n}};` and `x = x {{op}} {{n}};` both leave `{{out}}`.",
    explanation: "The shorthand `x op= n;` is a shorter way of writing `x = x op n;`.",
  },
  {
    id: "CH0042.p3.left-side-error", stage: "STG003", chapter: "CH0042", page: 3, heading: "Special Features",
    kind: "error", mode: "toggle", title: "What if the number is on the left?",
    implements: ["CH0042.p3.bug"],
    question: "This program puts the number on the left of `=`. Press Compile to see what C says. Then apply the fix.",
    broken: 'int x = 5;\n10 = x;\nprintf("%d", x);',
    fixed: 'int x = 5;\nx = 10;\nprintf("%d", x);',
    diagnostic: "error: lvalue required as left operand of assignment",
    outputAfterFix: "10",
    explanation: "The left side of `=` must be a box that can receive a value, such as a variable. `10` is only a number, so nothing can be put into it. (\"lvalue\" is the compiler's word for something that can stand on the left.)",
    fixNote: "`x = 10;` puts the value 10 into the box `x`. The variable is on the left and the value is on the right.",
  },
  {
    id: "CH0042.p3.chain-right-to-left", stage: "STG003", chapter: "CH0042", page: 3, heading: "Special Features",
    kind: "trace", title: "Watch 20 travel from right to left",
    implements: ["CH0042.p3.tr"],
    intro: "`a = b = c = 20;` is grouped as `a = (b = (c = 20));`, so the work starts on the right. Here it is written as three separate steps so you can watch the value move.",
    code: '#include <stdio.h>\n\nint main() {\n   int a = 1;\n   int b = 2;\n   int c = 3;\n\n   c = 20;\n   b = c;\n   a = b;\n\n   printf("a = %d, b = %d, c = %d", a, b, c);\n   return 0;\n}',
    notes: {
      4: "Three boxes with three different values.",
      8: "Step 1: the rightmost part runs first. 20 goes into `c`.",
      9: "Step 2: `b` gets the value that `c` holds now, which is 20.",
      10: "Step 3: `a` gets the value that `b` holds now, which is 20.",
      12: "All three boxes hold 20, exactly what `a = b = c = 20;` does in one line: the value starts on the right and moves left.",
    },
  },
  {
    id: "CH0042.p4.predict-bitwise", stage: "STG003", chapter: "CH0042", page: 4, heading: "Code Examples",
    kind: "predict", title: "Predict the bitwise assignments",
    implements: ["CH0042.p4.pr"],
    intro: "A preview: `&`, `|` and `^` are bitwise operators, and the Bitwise chapter explains them. For now, use the results listed on the page and the pattern `a &= b` means `a = a & b`. Notice that every block below starts again from `a = 60`.",
    code: 'int a = 60, b = 13;\na &= b;\nprintf("%d\\n", a);\na = 60;\na |= b;\nprintf("%d\\n", a);\na = 60;\na ^= b;\nprintf("%d\\n", a);',
    question: "What are the three lines of output?",
    expected: "12\n61\n49",
    choices: ["12\n61\n49", "61\n12\n49", "12\n13\n0", "12\n61\n47"],
    hint: "Each block starts again from a = 60, and `a &= b` means `a = a & b`. The page above lists the results for a = 60 and b = 13.",
    explanation: "Each `a op= b` means `a = a op b`. From a = 60 and b = 13, `&=` gives 12, `|=` gives 61 and `^=` gives 49. If `a` were not put back to 60, the second and third lines would start from the changed value and give different numbers (12, 13, 0). That is why each block starts with `a = 60;`.",
  },
]);
