/*
 * CH0060 - continue (Stage 6).
 *
 * Page 3 turns the trace table into a fill-in table where the skipped round prints nothing, page 4 puts break and
 * continue side by side on the same loop, and page 5 replaces the instant spoiler with a real challenge (the worked
 * solution stays hidden until the student has tried, or asks for it).
 */
ClickLearn.define([
  {
    id: "CH0060.p3.trace-table", stage: "STG006", chapter: "CH0060", page: 3, heading: "Trace the continue",
    kind: "tracetable", title: "Fill in the trace table",
    implements: ["CH0060.p3.tt"],
    code: ['for (int i = 1; i <= 5; i++)', '{', '   if (i == 3)', '      continue;', '   printf("%d ", i);', '}'].join("\n"),
    question: "Trace the loop. Every round starts with the check `i <= 5`. Then `if (i == 3)` decides whether `continue` skips the `printf`. Fill in whether the loop check is True or False and what is printed in that round. Type only what shows on the screen. If nothing is printed, leave Output empty.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "cond", label: "i <= 5", kind: "cond" },
      { key: "out", label: "Output", kind: "out" },
    ],
    fill: ["cond", "out"],
    hint: "In each round, check `i <= 5` first. If it is True, the `if` looks at `i`. When `i == 3` is True, `continue` skips the `printf` for that round only, and the loop carries on. When `i <= 5` is False, the loop is over.",
    explanation: "The round with `i` equal to 3 prints nothing because `continue` skips the `printf`. The loop does not stop: round 4 and round 5 still print, and the loop ends only when `i <= 5` becomes False.",
  },
  {
    id: "CH0060.p4.break-vs-continue", stage: "STG006", chapter: "CH0060", page: 4, heading: "Why Use continue?",
    kind: "lab", title: "break and continue side by side",
    implements: ["CH0060.p4.lab"],
    observe: "Both loops are the same, except for one keyword. Move the slider and compare the two outputs.\nWhich numbers are missing in each one?",
    controls: [
      { id: "n", type: "range", label: "The keyword runs when i is", min: 1, max: 10, step: 1, value: 3 },
    ],
    variants: [
      { label: "With break", code: ['for (int i = 1; i <= 10; i++)', '{', '   if (i == {{n}})', '      break;', '   printf("%d ", i);', '}'].join("\n") },
      { label: "With continue", code: ['for (int i = 1; i <= 10; i++)', '{', '   if (i == {{n}})', '      continue;', '   printf("%d ", i);', '}'].join("\n") },
    ],
    show: ["lines"],
    explanation: "`break` ends the whole loop, so everything after the special number is lost. `continue` skips only that one number, and the loop carries on.",
  },
  {
    id: "CH0060.p5.skip-6", stage: "STG006", chapter: "CH0060", page: 5, heading: "Your continue Challenge",
    kind: "challenge", title: "Skip the number 6",
    implements: ["CH0060.p5.chal"],
    uses: [{ re: "\\bfor\\s*\\(", ask: "use a `for` loop" }, { re: "\\bcontinue\\s*;", ask: "use `continue` to skip a round" }],
    prompt: "Use a `for` loop to print the numbers from 1 to 10 on one line, with a space after each number, but skip 6. The loop must not stop at 6.",
    starter: ['#include <stdio.h>', '', 'int main()', '{', '   // Write your for loop here', '', '   return 0;', '}'].join("\n"),
    tests: [{ expected: "1 2 3 4 5 7 8 9 10" }],
    hints: [
      'Start with a normal loop that goes from 1 to 10. Print each number with printf("%d ", i); so the numbers stay on one line.',
      "Inside the loop, add an `if` before the printf that checks whether `i` is 6. When it is, the rest of that round must be skipped.",
      "The check is `if (i == 6)`. Under it, write `continue;`. That skips the printf for 6 only, and the loop carries on with 7.",
    ],
    solution: [
      '#include <stdio.h>', '', 'int main()', '{',
      '   for (int i = 1; i <= 10; i++)',
      '   {',
      '      if (i == 6)',
      '          continue;',
      '', '      printf("%d ", i);',
      '   }',
      '', '   return 0;', '}',
    ].join("\n"),
    solutionExplain: "When `i` is 6, `continue;` skips the `printf` for that round only. The loop then goes on to 7, so 6 is the only number missing.",
    explanation: "Your loop skipped 6 and kept going.",
  },
]);
