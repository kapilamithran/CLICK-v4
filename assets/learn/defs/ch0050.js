/*
 * CH0050 - Input Buffer & Newline Handling (Stage 3). PILOT chapter.
 *
 * The chapter is about something students cannot see: characters waiting in the input buffer. The `buffer`
 * simulator makes them visible as chips that each read consumes. Pages 1-3 replay the page examples
 * (leftover newline, then the space-before-%c fix). Page 4 shows what fgets stores, box by box, and then
 * demonstrates the technique for handling the newline.
 *
 * Added educational support (not in the Learn text): the page raises the fgets newline problem but never
 * shows how to handle it. The page-4 lab shows the usual one-line fix, `name[strcspn(name, "\n")] = '\0';`,
 * clearly labelled as a preview of string handling. The Learn text and the chapter test are unchanged.
 */
ClickLearn.define([
  {
    id: "CH0050.p1.buffer-theatre", stage: "STG004", chapter: "CH0050", page: 1, heading: "What is the Input Buffer?",
    kind: "buffer", title: "Watch the buffer",
    implements: ["CH0050.p1.inp"],
    question: "The user types `25` and presses Enter. Press **Run next input call** and watch which characters are used and which are left behind.",
    code: ["int age;", 'scanf("%d", &age);'],
    calls: [{ fmt: "%d", var: "age", line: 2 }],
    input: "25\n",
    explanation: "`%d` used the characters `2` and `5`. The newline (↵) from pressing Enter is still waiting in the buffer for whichever input function runs next.",
  },
  {
    id: "CH0050.p2.newline-problem", stage: "STG004", chapter: "CH0050", page: 2, heading: "The Famous \\n Problem",
    kind: "buffer", title: "See the famous problem happen",
    implements: ["CH0050.p2.inp"],
    question: "The user types `18`, presses Enter, types `A` and presses Enter. Step through both reads. What ends up in `grade`?",
    code: ["int age;", "char grade;", 'scanf("%d", &age);', 'scanf("%c", &grade);'],
    calls: [{ fmt: "%d", var: "age", line: 3 }, { fmt: "%c", var: "grade", line: 4 }],
    input: "18\nA\n",
    explanation: "`%c` reads ANY character, including the newline left over from the first Enter. So `grade` gets the newline, not `A`, and the `A` is still waiting in the buffer.",
  },
  {
    id: "CH0050.p3.apply-fix", stage: "STG004", chapter: "CH0050", page: 3, heading: "The Simple Fix: Space Before %c",
    kind: "buffer", title: "Add the space and try again",
    implements: ["CH0050.p3.inp"],
    question: "Run both reads once as they are. Then switch on **Use the fix**, run them again and compare what `grade` gets.",
    code: ["int age;", "char grade;", 'scanf("%d", &age);', 'scanf("%c", &grade);'],
    calls: [{ fmt: "%d", var: "age", line: 3 }, { fmt: "%c", var: "grade", line: 4, fixFmt: " %c" }],
    fixToggle: true,
    input: "18\nA\n",
    explanation: "The space in `\" %c\"` tells `scanf` to skip whitespace, including the leftover newline, before reading the character. Now `grade` is `A`.",
  },
  {
    id: "CH0050.p4.fgets-cells", stage: "STG004", chapter: "CH0050", page: 4, heading: "fgets() and the Newline",
    kind: "buffer", title: "What does fgets store?",
    implements: ["CH0050.p4.mem"],
    question: "The user types `Arun Kumar` and presses Enter. Run the `fgets` call and look at the boxes: what is stored after the last letter?",
    code: ["char name[50];", "fgets(name, sizeof(name), stdin);"],
    calls: [{ fmt: "fgets", var: "name", line: 2, size: 50 }],
    input: "Arun Kumar\n",
    explanation: "`fgets` keeps the newline it stopped at, then adds the end-of-string marker. The newline is now part of `name`. Try deleting the Enter from the input box and run again.",
  },
  {
    id: "CH0050.p4.remove-newline", stage: "STG004", chapter: "CH0050", page: 4, heading: "fgets() and the Newline",
    kind: "lab", title: "See the newline, then remove it",
    intro: "A preview of how programmers handle it. The page above shows the problem; this shows one common fix.",
    observe: "The user types `Arun Kumar` and presses Enter. Look at where the `!` appears, then switch the fix on.",
    controls: [
      { id: "fix", type: "toggle", label: "Remove the newline after reading", on: 'name[strcspn(name, "\\n")] = \'\\0\';', off: "", checked: false },
    ],
    code: '#include <stdio.h>\n#include <string.h>\n\nint main()\n{\n   char name[50];\n   fgets(name, sizeof(name), stdin);\n   {{fix}}\n   printf("Hello %s!", name);\n   return 0;\n}',
    input: "Arun Kumar\n",
    explanation: "Without the fix, the newline stored in `name` is printed before the `!`, so the `!` lands on the next line. The extra line replaces that newline with the end-of-string marker. You will learn how `strcspn` works when you study strings; for now just see what the line does to the output.",
  },
]);
