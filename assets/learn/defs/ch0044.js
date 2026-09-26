/*
 * CH0044 - Bitwise (Stage 2). PILOT chapter, deliberately a different design from CH0035.
 *
 * Bitwise operators are about seeing bits, so this chapter is built from hands-on "bit labs" instead of
 * quizzes: switches you flip, a truth table you can run, a shift slider and an even/odd inspector.
 * The labs use the shared `bits` (8-bit flipper) and `lab` (real interpreter) kinds. One short predict
 * question follows the worked examples on page 3. Pages 2 (reference table) stays static.
 */
ClickLearn.define([
  {
    id: "CH0044.p1.bit-flipper", stage: "STG003", chapter: "CH0044", page: 1, heading: "What Are Bitwise Operators?",
    kind: "bits", mode: "ops", title: "Flip the switches",
    implements: ["CH0044.p1.lab"],
    intro: "Each box is one bit: **1** is ON, **0** is OFF. Tap a bit to flip it and choose an operator. The result is worked out one bit at a time, exactly like the page shows for `5 & 3`.",
    a: 5, b: 3, ops: ["&", "|", "^"],
    explanation: "Start with A = 5 and B = 3 and choose `&`: you get 1, the same as the example above. Then try `|` and `^` on the same bits.",
  },
  {
    id: "CH0044.p3.truth-table", stage: "STG003", chapter: "CH0044", page: 3, heading: "How Do Bitwise Operators Work?",
    kind: "lab", title: "Run the truth table yourself",
    implements: ["CH0044.p3.lab"],
    observe: "Pick two single bits and an operator. The program below runs for real. Can you fill in each row of the AND, OR and XOR tables?",
    controls: [
      { id: "a", type: "select", label: "First bit", options: [{ v: "0", l: "0" }, { v: "1", l: "1" }], value: "1" },
      { id: "op", type: "select", label: "Operator", options: [{ v: "&", l: "AND  &" }, { v: "|", l: "OR  |" }, { v: "^", l: "XOR  ^" }], value: "&" },
      { id: "b", type: "select", label: "Second bit", options: [{ v: "0", l: "0" }, { v: "1", l: "1" }], value: "0" },
    ],
    code: '#include <stdio.h>\n\nint main()\n{\n   printf("%d", {{a}} {{op}} {{b}});\n   return 0;\n}',
    summary: "`{{a}} {{op}} {{b}}` gives `{{out}}`.",
    explanation: "`&` gives 1 only when BOTH bits are 1. `|` gives 1 when AT LEAST ONE bit is 1. `^` gives 1 when the bits are DIFFERENT.",
  },
  {
    id: "CH0044.p3.not-flip", stage: "STG003", chapter: "CH0044", page: 3, heading: "How Do Bitwise Operators Work?",
    kind: "bits", mode: "not", title: "NOT flips every bit",
    implements: ["CH0044.p3.lab"],
    intro: "Flip some bits of A and watch `~A` flip all eight of them, the opposite of A.",
    a: 5,
  },
  {
    id: "CH0044.p3.predict-or", stage: "STG003", chapter: "CH0044", page: 3, heading: "How Do Bitwise Operators Work?",
    kind: "predict", title: "Predict a new one",
    question: "Write 6 and 3 in binary (00000110 and 00000011), then work out bit by bit: what does this print?",
    code: '#include <stdio.h>\n\nint main()\n{\n   printf("%d", 6 | 3);\n   return 0;\n}',
    expected: "7", choices: ["2", "5", "7", "9"],
    hint: "OR gives 1 where at least one of the two bits is 1.",
    explanation: "00000110 OR 00000011 = 00000111, which is 7. The answer 2 is `6 & 3`, 5 is `6 ^ 3`, and 9 is `6 + 3`: those are different operators.",
  },
  {
    id: "CH0044.p4.shift-slider", stage: "STG003", chapter: "CH0044", page: 4, heading: "Shift Operators << and >>",
    kind: "bits", mode: "shift", title: "Slide the bits",
    implements: ["CH0044.p4.lab"],
    intro: "Choose left or right, then slide the shift count. Watch the bits move and watch the number: does each step double it, or halve it?",
    a: 5, shift: 1,
    explanation: "For positive values, each step of `<<` multiplies by 2 and each step of `>>` divides by 2 (dropping the remainder).",
  },
  {
    id: "CH0044.p5.even-odd", stage: "STG003", chapter: "CH0044", page: 5, heading: "Why Are Bitwise Operators Important?",
    kind: "bits", mode: "parity", title: "Even or odd? Look at the last bit",
    implements: ["CH0044.p5.lab"],
    intro: "Type a number (or flip its bits) and look only at the last bit on the right. Try several numbers.",
    a: 6,
    explanation: "`n & 1` keeps only the last bit: 0 means even, 1 means odd.",
  },
]);
