/*
 * CH0059 - break (Stage 6).
 *
 * Page 3 turns the trace table into a fill-in table, page 4 is a "find the red ball" experiment (with and without
 * break) and page 5 replaces the instant spoiler with a real challenge (the worked solution stays hidden until the
 * student has tried, or asks for it).
 */
ClickLearn.define([
  {
    id: "CH0059.p3.trace-table", stage: "STG006", chapter: "CH0059", page: 3, heading: "Let's Trace the break",
    kind: "tracetable", title: "Fill in the trace table",
    implements: ["CH0059.p3.tt"],
    code: ['for (int i = 1; i <= 5; i++)', '{', '   if (i == 4)', '   {', '      break;', '   }', '   printf("%d\\n", i);', '}'].join("\n"),
    loopLine: 3,
    question: "Trace the loop. In every round the `if` checks `i == 4`. Fill in the value of `i`, whether `i == 4` is True or False, and what `printf` prints in that round. If nothing is printed, leave Output empty.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "cond", label: "i == 4", kind: "cond" },
      { key: "out", label: "Output", kind: "out" },
    ],
    fill: ["i", "cond", "out"],
    hint: "The `if` is checked before `printf`. While `i == 4` is False the body prints `i`. When it is True, `break` runs, the loop ends, and `printf` does not run in that round.",
    explanation: "Rounds 1, 2 and 3 print `i`. In round 4 the check `i == 4` is True, so `break` ends the loop before `printf`. The loop could have gone on to 5, but `break` stopped it.",
  },
  {
    id: "CH0059.p4.red-ball", stage: "STG006", chapter: "CH0059", page: 4, heading: "break in Real Life",
    kind: "lab", title: "Find the red ball",
    implements: ["CH0059.p4.lab"],
    observe: "The loop opens boxes 1 to 5 to look for the red ball. Move the ball to different boxes, then turn `break` off.\nHow many boxes are checked each time?",
    controls: [
      { id: "ball", type: "select", label: "Where is the red ball?", options: [{ v: "1", l: "Box 1" }, { v: "2", l: "Box 2" }, { v: "3", l: "Box 3" }, { v: "4", l: "Box 4" }, { v: "5", l: "Box 5" }, { v: "0", l: "Not in any box" }], value: "3" },
      { id: "stop", type: "toggle", label: "Stop with break when the ball is found", on: "break;", off: "// no break here", checked: true },
    ],
    code: [
      '#include <stdio.h>', '', 'int main()', '{', '   int checked = 0;',
      '   for (int i = 1; i <= 5; i++)',
      '   {', '      checked++;', '      printf("Checking box %d\\n", i);',
      '      if (i == {{ball}})',
      '      {', '         printf("Found the red ball!\\n");', '         {{stop}}', '      }',
      '   }',
      '   printf("Boxes checked: %d", checked);', '   return 0;', '}',
    ].join("\n"),
    show: ["lines"],
    explanation: "With `break`, the loop stops as soon as the ball is found, so the remaining boxes are never checked. Without it, the loop keeps checking boxes it does not need.",
  },
  {
    id: "CH0059.p5.stop-at-6", stage: "STG006", chapter: "CH0059", page: 5, heading: "Your break Challenge",
    kind: "challenge", title: "Stop the loop at 6",
    implements: ["CH0059.p5.chal"],
    uses: [{ re: "\\bfor\\s*\\(", ask: "use a `for` loop" }, { re: "\\bbreak\\s*;", ask: "use `break` to stop the loop" }],
    prompt: "Use a `for` loop to print the numbers from 1 to 10, each on its own line, but stop when the number reaches 6. The number 6 itself is not printed.",
    starter: ['#include <stdio.h>', '', 'int main()', '{', '   // Write your for loop here', '', '   return 0;', '}'].join("\n"),
    tests: [{ expected: "1\n2\n3\n4\n5" }],
    hints: [
      "Start with a normal loop that goes from 1 to 10. Its condition is `i <= 10` and it prints each number with printf.",
      "Inside the loop, add an `if` that checks whether `i` has reached 6. Put it before the printf, so 6 is never printed.",
      "The check is `if (i == 6)`. Inside its { } block, write `break;` to end the loop.",
    ],
    solution: [
      '#include <stdio.h>', '', 'int main()', '{',
      '   for (int i = 1; i <= 10; i++)',
      '   {',
      '      if (i == 6)',
      '      {',
      '         break;',
      '      }',
      '', '      printf("%d\\n", i);',
      '   }',
      '', '   return 0;', '}',
    ].join("\n"),
    solutionExplain: "The loop is allowed to go up to 10, but when `i` becomes 6 the `if` is True and `break;` ends the loop before `printf` runs. That is why only 1 to 5 are printed.",
    explanation: "Your loop stopped as soon as the number reached 6.",
  },
]);
