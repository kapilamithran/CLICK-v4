/*
 * CH0032 - printf (Stage 0).
 *
 * The pages show printf() and \n but never let a student break, change or predict them. These activities
 * do exactly that: leave out the quotes, flip a live \n switch, run the first program with your own text,
 * predict output with and without \n, and a short recap check. Values differ from the page examples so the
 * answers cannot simply be copied from the text above.
 */
ClickLearn.define([
  {
    id: "CH0032.p1.quotes-matter", stage: "STG001", chapter: "CH0032", page: 1, heading: "What's printf?",
    kind: "error", mode: "toggle", title: "Do the double quotes matter?",
    implements: ["CH0032.p1.bug"],
    question: "Compile this line and read the message. Then apply the fix and compile again.",
    broken: "printf(Hello World!);",
    fixed: 'printf("Hello World!");',
    diagnostic: "error: 'Hello' undeclared (first use in this function)\nerror: expected ')' before 'World'",
    explanation: "Without double quotes, C does not see text. It looks for something named `Hello`, cannot find it and gets lost. The double quotes tell C: print exactly this text.",
    fixNote: "The double quotes mark `Hello World!` as text, so `printf()` prints it.",
    outputAfterFix: "Hello World!",
  },
  {
    id: "CH0032.p2.your-message", stage: "STG001", chapter: "CH0032", page: 2, heading: "First printf() Program",
    kind: "run", title: "Type your own message",
    implements: ["CH0032.p2.run"],
    code: '#include <stdio.h>\n\nint main()\n{\n   printf("Hello World!");\n   return 0;\n}',
    initialOutput: "Hello World!",
    tasks: ["Change the words inside the double quotes to your own message and press Run.", "Try a number such as `25` or a single letter inside the quotes."],
    goal: { changed: true }, goalHint: "Change the text between the double quotes, then press Run again.",
    explanation: "Whatever you write inside the double quotes is what `printf()` shows on the screen.",
  },
  {
    id: "CH0032.p3.newline-switch", stage: "STG001", chapter: "CH0032", page: 3, heading: "New Line \\n",
    kind: "lab", title: "The new line switch",
    implements: ["CH0032.p3.lab"],
    observe: "Turn each switch on and off. Watch where the output moves to a new line.",
    controls: [
      { id: "a", type: "toggle", label: "Add \\n to the text in the first printf()", on: "\\n", off: "", checked: false },
      { id: "b", type: "toggle", label: "Add \\n to the text in the second printf()", on: "\\n", off: "", checked: false },
    ],
    code: 'printf("Hello{{a}}");\nprintf("I am learning C{{b}}");\nprintf("Let\'s code!");',
    explanation: "The `\\n` is not shown on the screen. It only tells C to move to the next line.",
  },
  {
    id: "CH0032.p4.predict-no-newline", stage: "STG001", chapter: "CH0032", page: 4, heading: "Code Examples",
    kind: "predict", title: "Two printf() calls, no \\n",
    implements: ["CH0032.p4.pr"],
    question: "What will these two lines print?",
    code: 'printf("Good");\nprintf("Morning");',
    choices: ["GoodMorning", "Good Morning", "Good\nMorning"],
    expected: "GoodMorning",
    hint: "If you picked `Good Morning`: C does not add a space between two printf() calls. If you picked two lines: a new line appears only when the text contains `\\n`.",
    explanation: "Each `printf()` prints exactly what is inside its quotes. There is no space and no `\\n`, so the two words touch.",
  },
  {
    id: "CH0032.p4.predict-newline-middle", stage: "STG001", chapter: "CH0032", page: 4, heading: "Code Examples",
    kind: "predict", title: "Only one \\n",
    implements: ["CH0032.p4.pr"],
    question: "What will these three lines print?",
    code: 'printf("Cat\\n");\nprintf("Dog");\nprintf("Bird");',
    choices: ["CatDogBird", "Cat\nDog\nBird", "Cat\nDogBird", "Cat Dog Bird"],
    expected: "Cat\nDogBird",
    hint: "If you picked three lines: only the first text has a `\\n`, and printf() never starts a new line on its own. If you picked one line: the `\\n` after Cat still moves the output down.",
    explanation: "The `\\n` after `Cat` moves to a new line. `Dog` and `Bird` have no `\\n` between them, so they stay together on that new line.",
  },
  {
    id: "CH0032.p5.check-newline", stage: "STG001", chapter: "CH0032", page: 5, heading: "printf() Recap",
    kind: "mcq", title: "Which line breaks the line?",
    implements: ["CH0032.p5.chk"],
    question: "Which statement prints `Hi` and then `Sam` on the next line?",
    choices: [
      { text: '`printf("Hi/nSam");`', why: "The new line mark uses a backslash: `\\n`. A forward slash `/n` is just two ordinary characters, so this prints `Hi/nSam`." },
      { text: '`printf("Hi"); printf("Sam");`', why: "Two printf() calls do not start a new line by themselves. This prints `HiSam`." },
      { text: '`printf("Hi\\nSam");`', correct: true, why: "The `\\n` between `Hi` and `Sam` moves the output to the next line." },
      { text: '`printf(Hi\\nSam);`', why: "The text is missing its double quotes. Text for printf() always goes inside `\" \"`." },
    ],
    explanation: "`\\n` (backslash n) is the way to say: C, go down.",
  },
  {
    id: "CH0032.p5.check-statement", stage: "STG001", chapter: "CH0032", page: 5, heading: "printf() Recap",
    kind: "mcq", title: "Which statement is complete?",
    implements: ["CH0032.p5.chk"],
    question: "Only one of these is a complete, correct printf() statement. Which one?",
    choices: [
      { text: '`printf("Hello!")`', why: "It is missing the semicolon. A statement ends with `;`." },
      { text: '`printf("Hello!");`', correct: true, why: "The text is in double quotes and the statement ends with `;`." },
      { text: "`printf(Hello!);`", why: "The text is missing its double quotes." },
      { text: '`printf("Hello!);`', why: "The closing double quote is missing, so C cannot tell where the text ends." },
    ],
    explanation: "Remember the four things: `printf()` displays, double quotes wrap the text, `\\n` goes to the next line and `;` ends the statement.",
  },
]);
