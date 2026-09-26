/*
 * CH0045 - Precedence (Stage 3, STG003).
 *
 * Why these activities: the pages give a nine-level precedence list and three worked expressions. Students
 * need to rebuild the list themselves, click through the order in which C works out an expression (with and
 * without parentheses), and apply the same-precedence rule (associativity) to expressions they have not seen.
 */
ClickLearn.define([
  {
    id: "CH0045.p3.rank-operators", stage: "STG003", chapter: "CH0045", page: 3, heading: "Precedence Levels",
    kind: "order", noRun: true, title: "Rank the operators",
    implements: ["CH0045.p3.ord"],
    question: "Tap the operator groups in the order C gives them priority: the group that goes FIRST at the top, the one that goes LAST at the bottom.",
    lines: [
      "Parentheses: ( )",
      "Increment / Decrement: ++ --",
      "Multiplication / Division / Remainder: * / %",
      "Addition / Subtraction: + -",
      "Relational: < <= > >=",
      "Equality: == !=",
      "Logical AND: &&",
      "Logical OR: ||",
      "Assignment: =",
    ],
    explanation: "Brackets, then unary, then math (`* / %` before `+ -`), then compare, then logic (`&&` before `||`), and assignment last.",
  },
  {
    id: "CH0045.p4.order-multiply-first", stage: "STG003", chapter: "CH0045", page: 4, heading: "How Does It Work?",
    kind: "evalorder", title: "Which operator runs first?",
    implements: ["CH0045.p4.lab"],
    expr: "2 + 3 * 4",
    question: "Tap the operator that C works out FIRST. Then tap the next one, until the value is known.",
    explanation: "`*` has higher precedence than `+`, so `3 * 4` is worked out first. Then `2 + 12` gives the answer.",
  },
  {
    id: "CH0045.p4.order-with-parentheses", stage: "STG003", chapter: "CH0045", page: 4, heading: "How Does It Work?",
    kind: "evalorder", title: "Now add parentheses",
    implements: ["CH0045.p4.lab"],
    expr: "(2 + 3) * 4",
    question: "The same numbers and operators, but with parentheses. Which operator runs first now?",
    explanation: "Parentheses have the highest priority, so `2 + 3` is worked out first. The same numbers now give a different answer than `2 + 3 * 4`.",
  },
  {
    id: "CH0045.p4.order-compare-then-and", stage: "STG003", chapter: "CH0045", page: 4, heading: "How Does It Work?",
    kind: "evalorder", title: "Comparisons and &&",
    implements: ["CH0045.p4.lab"],
    expr: "5 > 3 && 2 < 4",
    question: "Which operators run before `&&` can be worked out?",
    explanation: "`>` and `<` have higher precedence than `&&`, so both comparisons give 1 (TRUE) first. Then `1 && 1` is 1.",
  },
  {
    id: "CH0045.p5.predict-left-to-right", stage: "STG003", chapter: "CH0045", page: 5, heading: "The Operator Precedence Finale",
    kind: "predict", title: "Predict: same precedence, which side first?",
    implements: ["CH0045.p5.pr"],
    code: 'printf("%d", 20 - 8 + 3);',
    expected: "15",
    choices: ["15", "9", "31"],
    hint: "`+` and `-` have the same precedence. When that happens, does C group from the left or from the right?",
    explanation: "Same precedence means associativity decides. `+` and `-` group left to right: `(20 - 8) + 3` = `12 + 3` = 15. Grouping from the right, `20 - (8 + 3)`, would give 9.",
  },
  {
    id: "CH0045.p5.predict-assignment-chain", stage: "STG003", chapter: "CH0045", page: 5, heading: "The Operator Precedence Finale",
    kind: "predict", title: "Predict a chained assignment",
    implements: ["CH0045.p5.pr"],
    code: 'int a;\nint b;\na = b = 9;\nprintf("%d %d", a, b);',
    expected: "9 9",
    choices: ["9 9", "9 0", "0 9", "It does not compile"],
    hint: "Assignment groups from right to left. Which assignment happens first, and what value does it hand to the next one?",
    explanation: "`a = b = 9;` is grouped as `a = (b = 9);`. First `b` gets 9. The result of that assignment is 9, and that goes into `a`. Both end up 9.",
  },
]);
