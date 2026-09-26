/*
 * CH0056 - for loop (Stage 6).
 *
 * Page 1 lets the student change how many times a loop repeats, page 2 takes the three parts of the header apart,
 * page 3 turns the static trace table into a fill-in table and page 5 replaces the instant spoiler with a real
 * challenge (the worked solution stays hidden until the student has tried, or asks for it).
 */
ClickLearn.define([
  {
    id: "CH0056.p1.change-count", stage: "STG006", chapter: "CH0056", page: 1, heading: "Meet the for Loop",
    kind: "run", title: "Change how many times it repeats",
    implements: ["CH0056.p1.run"],
    code: ['#include <stdio.h>', '', 'int main()', '{', '   for (int i = 1; i <= 5; i++)', '   {', '      printf("Hello\\n");', '   }', '   return 0;', '}'].join("\n"),
    initialOutput: "Hello\nHello\nHello\nHello\nHello\n",
    tasks: [
      "Change the `5` in `i <= 5` to `8` and press Run. How many Hello lines do you get?",
      "Now try `2`, then `0`. What do you see when the number is `0`?",
    ],
    goal: { changed: true }, goalHint: "Change the number after `i <=` and press Run again.",
    explanation: "The number in `i <= 5` decides how many times the loop repeats. You changed one number instead of writing more `printf` lines.",
  },
  {
    id: "CH0056.p2.dissect-for", stage: "STG006", chapter: "CH0056", page: 2, heading: "How Does a for Loop Work?",
    kind: "lab", title: "Take the for loop apart",
    implements: ["CH0056.p2.lab"],
    observe: "Change one part of the loop at a time and watch how many times the body runs.\nCan you make the loop run 0 times? Which part did you change?",
    controls: [
      { id: "start", type: "range", label: "Initialization: start i at", min: 0, max: 6, step: 1, value: 1 },
      { id: "cmp", type: "select", label: "Condition: compare i using", options: [{ v: "<=", l: "<= (less than or equal to)" }, { v: "<", l: "< (less than)" }], value: "<=" },
      { id: "limit", type: "range", label: "Condition: compare i with", min: 1, max: 10, step: 1, value: 5 },
      { id: "update", type: "select", label: "Update: after each round", options: [{ v: "i++", l: "i++ (add 1)" }, { v: "i += 2", l: "i += 2 (add 2)" }, { v: "i += 3", l: "i += 3 (add 3)" }], value: "i++" },
    ],
    code: [
      '#include <stdio.h>', '', 'int main()', '{', '   int rounds = 0;',
      '   for (int i = {{start}}; i {{cmp}} {{limit}}; {{update}})',
      '   {', '      printf("%d ", i);', '      rounds++;', '   }',
      '   printf("\\nThe body ran %d times.", rounds);', '   return 0;', '}',
    ].join("\n"),
    show: ["lines"],
    summary: "Start at **{{start}}**. Keep going while `i {{cmp}} {{limit}}`. Move on with `{{update}}`.",
    explanation: "Initialization runs once. The condition is checked before every round. The update runs after every round. If the condition is false the very first time, the body never runs.",
  },
  {
    id: "CH0056.p3.trace-table", stage: "STG006", chapter: "CH0056", page: 3, heading: "Let's Trace the Loop",
    kind: "tracetable", title: "Fill in the trace table",
    implements: ["CH0056.p3.tt"],
    code: ['for (int i = 1; i <= 3; i++)', '{', '   printf("%d\\n", i);', '}'].join("\n"),
    question: "Trace the loop. Every round starts with the check `i <= 3`. Fill in the value of `i` at the check, whether the check is True or False, and what `printf` prints in that round. If nothing is printed, leave Output empty.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "cond", label: "i <= 3", kind: "cond" },
      { key: "out", label: "Output", kind: "out" },
    ],
    fill: ["i", "cond", "out"],
    hint: "In each round: check `i <= 3` with the current `i`. If it is True, run the body, then `i++` gives the `i` for the next round. When the check is False, the loop stops and nothing more is printed.",
    explanation: "`i` goes 1, 2, 3 and the body runs for each. When `i` becomes 4 the check `i <= 3` is False, so the loop stops without printing.",
  },
  {
    id: "CH0056.p5.print-1-to-10", stage: "STG006", chapter: "CH0056", page: 5, heading: "Your First for Loop",
    kind: "challenge", title: "Print 1 to 10 with a for loop",
    implements: ["CH0056.p5.chal"],
    uses: [{ re: "\\bfor\\s*\\(", ask: "use a `for` loop" }],
    prompt: "Print the numbers from 1 to 10 with a `for` loop. Print each number on its own line.",
    starter: ['#include <stdio.h>', '', 'int main()', '{', '   // Write your for loop here', '', '   return 0;', '}'].join("\n"),
    tests: [{ expected: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10" }],
    hints: [
      "A for loop needs three things: where to start, when to keep going, and how to change. The list under Think Before You Code has all three.",
      "Write the loop header as `for (int i = 1; ...; ...)`. The condition must keep going while `i` is 10 or less, and the update must increase `i` by 1.",
      'The header is `for (int i = 1; i <= 10; i++)`. Inside its { } block, use printf("%d\\n", i);',
    ],
    solution: ['#include <stdio.h>', '', 'int main()', '{', '   for (int i = 1; i <= 10; i++)', '   {', '      printf("%d\\n", i);', '   }', '', '   return 0;', '}'].join("\n"),
    solutionExplain: "`int i = 1` starts the count, `i <= 10` keeps the loop going while `i` is 10 or less, and `i++` moves to the next number. The `printf` inside the loop runs once for every value of `i`, and `\\n` puts each number on its own line.",
    explanation: "Your loop counted from 1 to 10.",
  },
]);
