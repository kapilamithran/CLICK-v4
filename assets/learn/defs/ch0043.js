/*
 * CH0043 - relational & logical (Stage 3, STG003).
 *
 * Why these activities: the pages give six comparison operators and three logical operators as tables,
 * then one fixed example (a = 10, b = 4). Students need to try other values: enter numbers and see all six
 * comparisons answer 1 or 0, switch conditions on and off to see && || !, predict which if-lines print, and
 * watch which path C takes when a and b change. The code uses only what the page shows (printf, if, else).
 */
ClickLearn.define([
  {
    id: "CH0043.p2.six-questions", stage: "STG003", chapter: "CH0043", page: 2, heading: "Types of Operators",
    kind: "lab", title: "Truth lab: six comparisons",
    implements: ["CH0043.p2.lab"],
    observe: "Type two numbers. Every comparison answers 1 (TRUE) or 0 (FALSE). Try making the numbers equal.",
    controls: [
      { id: "a", type: "number", label: "a", min: -50, max: 50, step: 1, value: 8 },
      { id: "b", type: "number", label: "b", min: -50, max: 50, step: 1, value: 5 },
    ],
    code: 'int a = {{a}};\nint b = {{b}};\nprintf("a == b  %d\\n", a == b);\nprintf("a != b  %d\\n", a != b);\nprintf("a >  b  %d\\n", a > b);\nprintf("a <  b  %d\\n", a < b);\nprintf("a >= b  %d\\n", a >= b);\nprintf("a <= b  %d", a <= b);',
    explanation: "Each comparison is a yes/no question. C answers YES with 1 and NO with 0.",
  },
  {
    id: "CH0043.p2.combine-conditions", stage: "STG003", chapter: "CH0043", page: 2, heading: "Types of Operators",
    kind: "lab", title: "Truth lab: combining conditions",
    implements: ["CH0043.p2.lab"],
    observe: "Switch the two conditions on and off. When is `&&` 1? When is `||` 0? What does `!` do?",
    controls: [
      { id: "comedy", type: "toggle", label: "The movie is a comedy", on: "1", off: "0", checked: true },
      { id: "under", type: "toggle", label: "The movie is under 2 hours", on: "1", off: "0", checked: false },
    ],
    code: 'int comedy = {{comedy}};\nint underTwoHours = {{under}};\nprintf("comedy && underTwoHours  %d\\n", comedy && underTwoHours);\nprintf("comedy || underTwoHours  %d\\n", comedy || underTwoHours);\nprintf("!comedy                  %d", !comedy);',
    explanation: "Here 1 means TRUE and 0 means FALSE.",
  },
  {
    id: "CH0043.p3.predict-equal", stage: "STG003", chapter: "CH0043", page: 3, heading: "Code Examples",
    kind: "predict", title: "Which lines print when a and b are equal?",
    implements: ["CH0043.p3.pr"],
    code: String.raw`#include <stdio.h>

int main()
{
   int a = 6, b = 6;

   if (a > b)
      printf("a is greater than b\n");

   if (a >= b)
      printf("a is greater than or equal to b\n");

   if (a < b)
      printf("a is less than b\n");

   if (a <= b)
      printf("a is lesser than or equal to b\n");

   if (a == b)
      printf("a is equal to b\n");

   if (a != b)
      printf("a is not equal to b\n");

   return 0;
}`,
    question: "This is the program from the page, but with a = 6 and b = 6. What does it print?",
    expected: "a is greater than or equal to b\na is lesser than or equal to b\na is equal to b",
    choices: [
      "a is greater than or equal to b\na is lesser than or equal to b\na is equal to b",
      "a is equal to b",
      "a is greater than b\na is greater than or equal to b\na is not equal to b",
      "a is greater than or equal to b\na is equal to b",
    ],
    hint: "Check every `if` one by one with a = 6 and b = 6. Remember what the `=` in `>=` and `<=` means.",
    explanation: "With a = 6 and b = 6: `>` and `<` are FALSE, and `!=` is FALSE. But `>=` and `<=` both include equality, so they are TRUE, and `==` is TRUE. Three lines print.",
  },
  {
    id: "CH0043.p3.which-lines-print", stage: "STG003", chapter: "CH0043", page: 3, heading: "Code Examples",
    kind: "lab", title: "Move a and b, watch which lines run",
    implements: ["CH0043.p3.pr"],
    observe: "The lines that ran are highlighted. Move the sliders, and try making a and b equal. Which printf lines light up?",
    show: ["lines"],
    controls: [
      { id: "a", type: "range", label: "a", min: 0, max: 20, step: 1, value: 10 },
      { id: "b", type: "range", label: "b", min: 0, max: 20, step: 1, value: 4 },
    ],
    code: String.raw`int a = {{a}};
int b = {{b}};

if (a > b)
   printf("a is greater than b\n");

if (a >= b)
   printf("a is greater than or equal to b\n");

if (a < b)
   printf("a is less than b\n");

if (a <= b)
   printf("a is lesser than or equal to b\n");

if (a == b)
   printf("a is equal to b\n");

if (a != b)
   printf("a is not equal to b\n");`,
    explanation: "A printf line only runs when the condition above it is TRUE.",
  },
  {
    id: "CH0043.p4.follow-decision", stage: "STG003", chapter: "CH0043", page: 4, heading: "Flowchart — How Does C Make a Decision?",
    kind: "trace", title: "Follow the decision step by step",
    implements: ["CH0043.p4.flow"],
    intro: "Press Next step to walk through the same four steps as the page.",
    code: String.raw`#include <stdio.h>

int main() {
   int a = 10;
   int b = 4;

   if (a > b)
      printf("a is greater than b");
   else
      printf("a is less than or equal to b");

   return 0;
}`,
    notes: {
      4: "Step 1: C gets the values. a = 10.",
      5: "Step 1: C gets the values. b = 4.",
      7: "Steps 2 and 3: C checks the condition 10 > 4. The answer is TRUE (1), so C takes the YES path.",
      8: "Step 4: C runs the statement on the TRUE path. The `else` line is skipped.",
    },
  },
  {
    id: "CH0043.p4.decision-path", stage: "STG003", chapter: "CH0043", page: 4, heading: "Flowchart — How Does C Make a Decision?",
    kind: "lab", title: "Decision path: change a and b",
    implements: ["CH0043.p4.flow"],
    observe: "The lines that ran light up, so you can see which way C went. Move the sliders until the path changes. At what point does it flip?",
    show: ["lines"],
    controls: [
      { id: "a", type: "range", label: "a", min: 0, max: 20, step: 1, value: 10 },
      { id: "b", type: "range", label: "b", min: 0, max: 20, step: 1, value: 4 },
    ],
    code: String.raw`int a = {{a}};
int b = {{b}};

if (a > b)
   printf("a is greater than b");
else
   printf("a is less than or equal to b");`,
    summary: "C asked: is `{{a}} > {{b}}`? Only one of the two printf lines is lit: that is the path C took.",
    explanation: "Only one path runs: TRUE goes to the first printf, FALSE goes to the else printf.",
  },
]);
