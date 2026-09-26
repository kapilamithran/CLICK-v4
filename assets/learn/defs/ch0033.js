/*
 * CH0033 - Comments (Stage 0).
 *
 * Students read that C skips comments but never see it happen. A live "comment it out" lab shows which
 * printf() still runs, an unclosed multi-line comment shows why a comment must be closed, and a sorting
 * task separates useful comments from noise. Page 1 (the definition) stays static.
 */
ClickLearn.define([
  {
    id: "CH0033.p2.comment-it-out", stage: "STG001", chapter: "CH0033", page: 2, heading: "Single-Line Comment",
    kind: "lab", title: "Comment out a line",
    implements: ["CH0033.p2.lab"],
    observe: "Turn a switch on to put `//` in front of that line. The highlighted lines are the ones C runs. Which printf() calls still run?",
    show: ["lines"],
    controls: [
      { id: "c1", type: "toggle", label: "Put // in front of line 1", on: "// ", off: "", checked: false },
      { id: "c2", type: "toggle", label: "Put // in front of line 2", on: "// ", off: "", checked: false },
      { id: "c3", type: "toggle", label: "Put // in front of line 3", on: "// ", off: "", checked: false },
      { id: "note", type: "toggle", label: "Add a note at the end of line 1", on: " // Wake-up message", off: "", checked: false },
    ],
    code: '{{c1}}printf("Wake up\\n");{{note}}\n{{c2}}printf("Eat\\n");\n{{c3}}printf("Code\\n");',
    explanation: "C skips everything after `//` on that line. A note at the end of a line never changes the output.",
  },
  {
    id: "CH0033.p3.unclosed-comment", stage: "STG001", chapter: "CH0033", page: 3, heading: "Multi-Line Comment",
    kind: "error", mode: "toggle", title: "What if the comment is never closed?",
    implements: ["CH0033.p3.bug"],
    question: "This comment starts with `/*` but has no `*/`. Compile it, read the message, then apply the fix.",
    broken: '/*\n  This is my first program.\n  I am learning C.\nprintf("Hello!");',
    fixed: '/*\n  This is my first program.\n  I am learning C.\n*/\nprintf("Hello!");',
    diagnostic: "error: unterminated comment",
    explanation: "Everything after `/*` is a comment until C finds `*/`. With no `*/`, the comment never ends. Even the `printf` line is swallowed into it, so C reports the unfinished comment.",
    fixNote: "The `*/` closes the box. Now only the three note lines are comment, and `printf` runs.",
    outputAfterFix: "Hello!",
  },
  {
    id: "CH0033.p4.useful-or-noise", stage: "STG001", chapter: "CH0033", page: 4, heading: "Why Do We Use Comments?",
    kind: "assign", title: "Useful comment or noise?",
    implements: ["CH0033.p4.match"],
    question: "Some comments help a reader. Some only repeat the code. Sort these.",
    buckets: [{ id: "useful", label: "Explains something" }, { id: "noise", label: "Only repeats the code" }],
    items: [
      { text: "// Student marks program", bucket: "useful", why: "It tells a reader what the whole program is about." },
      { text: "int marks = 95; // marks out of 100", bucket: "useful", why: "It adds information the code does not show: the marks are out of 100." },
      { text: "// Display the student's name", bucket: "useful", why: "It says what the next lines are for, so a reader does not have to work it out." },
      { text: "// Written by Asha, first C program", bucket: "useful", why: "It gives information the code cannot show, such as who wrote it." },
      { text: "int age = 18; // int age = 18", bucket: "noise", why: "It says exactly what the code already says. A reader learns nothing new." },
      { text: 'printf("Hi"); // printf Hi', bucket: "noise", why: "It copies the code in other words. A comment should explain what the code is for." },
      { text: "int marks = 95; // marks equals 95", bucket: "noise", why: "It repeats the line word for word." },
    ],
    explanation: "A useful comment says what a part is for, or gives information the code does not show. A comment that only repeats the code adds nothing.",
  },
  {
    id: "CH0033.p5.check-comment", stage: "STG001", chapter: "CH0033", page: 5, heading: "Comments Recap",
    kind: "mcq", title: "What does C do with a comment?",
    implements: ["CH0033.p5.chk"],
    question: "The program is running and C reaches a comment. What does C do with it?",
    choices: [
      { text: "It shows the comment on the screen", why: "Comments never appear on the screen. Only `printf()` puts text there." },
      { text: "It runs it like any other line", why: "C does not execute comments. That is the whole point of them." },
      { text: "It ignores it", correct: true, why: "A comment is a note for humans. C skips it." },
    ],
    explanation: "Comment = note for humans, not an instruction for C.",
  },
  {
    id: "CH0033.p5.predict-comments", stage: "STG001", chapter: "CH0033", page: 5, heading: "Comments Recap",
    kind: "predict", title: "Which printf() calls still run?",
    implements: ["CH0033.p5.chk"],
    question: "What will this print?",
    code: 'printf("A");\n// printf("B");\n/* printf("C");\n   printf("D"); */\nprintf("E");',
    choices: ["ABCDE", "ACDE", "AE", "ABE"],
    expected: "AE",
    hint: "If you picked a longer answer: some lines you counted are inside a comment. `//` hides the rest of its own line. `/* ... */` hides everything up to the closing `*/`, even across lines.",
    explanation: "Line 2 is hidden by `//`. Lines 3 and 4 are hidden by `/* ... */`. Only the `A` and `E` calls run.",
  },
]);
