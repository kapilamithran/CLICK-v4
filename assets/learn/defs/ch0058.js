/*
 * CH0058 - do-while loop (Stage 5, id STG006).
 *
 * The pages say "do first, check after" and "runs at least once", but the student only reads it. These
 * activities let them type menu choices into a real do-while, step through DO, CHECK and REPEAT, and start a
 * loop whose condition is already false to see the body run once anyway.
 */
ClickLearn.define([
  {
    id: "CH0058.p2.menu-once", stage: "STG006", chapter: "CH0058", page: 2, heading: "Why Do We Use do...while?",
    kind: "run", title: "A menu that always shows once",
    implements: ["CH0058.p2.inp"],
    code: '#include <stdio.h>\n\nint main()\n{\n    int choice;\n\n    do\n    {\n        printf("1. Play\\n2. Quit\\nChoose: ");\n        scanf("%d", &choice);\n    }\n    while (choice != 2);\n\n    printf("Goodbye!");\n    return 0;\n}',
    input: "1\n1\n2",
    tasks: [
      "Run it. The keyboard box holds three choices, one per line. How many times was the menu shown?",
      "Change the keyboard box so the menu is shown only once. What is the smallest input that does it?",
      "Try `3` first and then `2`. How many menus now?",
    ],
    goal: { equals: "1. Play\n2. Quit\nChoose: Goodbye!" },
    goalHint: "The menu appears once when the very first choice is 2. Make 2 the first line in the keyboard box.",
    explanation: "`do` runs the body first, so the menu appears before any choice has been typed. Only then does `while (choice != 2)` check the choice that was just read. Even the shortest input, a single `2`, shows the menu once.",
  },
  {
    id: "CH0058.p3.do-check-repeat", stage: "STG006", chapter: "CH0058", page: 3, heading: "How Does do...while Work?",
    kind: "trace", title: "Step through DO, CHECK and REPEAT",
    implements: ["CH0058.p3.tr"],
    code: 'int i = 1;\n\ndo\n{\n    printf("%d ", i);\n    i++;\n}\nwhile (i <= 3);',
    notes: {
      5: "**DO.** This is the body. It runs first, and again after every TRUE check.",
      6: "Still the body: it ends by adding 1 to `i`.",
      8: "**CHECK.** Only after the body does C test the condition. TRUE means REPEAT. FALSE means STOP.",
    },
  },
  {
    id: "CH0058.p5.already-false", stage: "STG006", chapter: "CH0058", page: 5, heading: "The Special Part",
    kind: "lab", title: "The condition is already false. Does the body run?",
    implements: ["CH0058.p5.lab"],
    observe: "The loop repeats while `i <= 5`. It starts with `i = 10`, so the condition is false from the very beginning. Read the output, then slide `i` below 5.",
    controls: [{ id: "i", type: "range", label: "i starts at", min: 1, max: 12, step: 1, value: 10 }],
    show: ["lines"],
    code: 'int i = {{i}};\nint runs = 0;\n\ndo\n{\n    printf("Body runs, i = %d\\n", i);\n    runs++;\n    i++;\n}\nwhile (i <= 5);\n\nprintf("The body ran %d time(s).", runs);',
    explanation: "do-while runs the body before it checks anything, so the body always runs at least once. A false condition only stops it from repeating.",
  },
]);
