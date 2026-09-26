/*
 * CH0057 - while loop (Stage 5, id STG006).
 *
 * The pages show one worked trace, warn about a forgotten i++, describe a password loop and compare while with
 * do-while, but the student only reads them. These activities let them fill a trace table for a different loop,
 * remove the update line and see i stay put, type password guesses into a real loop, and start a loop with a
 * condition that is already false.
 */
ClickLearn.define([
  {
    id: "CH0057.p3.trace-table", stage: "STG006", chapter: "CH0057", page: 3, heading: "Let's See It in Action",
    kind: "tracetable", title: "Fill in the trace table for a countdown",
    implements: ["CH0057.p3.tt"],
    intro: "The page traced a loop that counts up. This one counts down, so you have to work it out yourself.",
    code: 'int i = 3;\nwhile (i > 0)\n{\n    printf("%d ", i);\n    i--;\n}',
    question: "One row per check of the condition. Fill in the value of `i` when the condition is checked, whether it is True or False, and what gets printed in that round. Leave a cell empty if nothing is printed.",
    columns: [
      { key: "i", label: "i", kind: "var", var: "i" },
      { key: "c", label: "i > 0 ?", kind: "cond" },
      { key: "o", label: "Printed", kind: "out" },
    ],
    fill: ["i", "c", "o"],
    hint: "Go round by round. Check the condition first. Only when it is True does the body print `i` and then run `i--`.",
    explanation: "Each round: check the condition, print `i`, then lower `i` by 1. When `i` reaches 0, the condition is False, so the loop stops without printing.",
  },
  {
    id: "CH0057.p3.forgot-update", stage: "STG006", chapter: "CH0057", page: 3, heading: "Let's See It in Action",
    kind: "lab", title: "What if the update line is missing?",
    implements: ["CH0057.p3.lab"],
    observe: "Switch the update line off and on, and watch the value of `i` in the output. The extra check `safety < 6` is only a safety stop for this page, so a loop that never ends cannot freeze it.",
    controls: [{ id: "update", type: "toggle", label: "Keep the update line i++;", on: "i++;", off: "// i++; is missing", checked: true }],
    code: 'int i = 1;\nint safety = 0;\n\nwhile (i <= 3 && safety < 6)\n{\n    printf("i = %d\\n", i);\n    {{update}}\n    safety++;\n}\n\nprintf("Stopped after %d rounds. i is %d.", safety, i);',
    explanation: "Without `i++`, `i` stays 1, so `i <= 3` stays TRUE round after round. That is an infinite loop. Here only the safety stop ended it.",
  },
  {
    id: "CH0057.p4.password-guesses", stage: "STG006", chapter: "CH0057", page: 4, heading: "while Loop in Real Life",
    kind: "run", title: "Type the guesses",
    implements: ["CH0057.p4.inp"],
    code: '#include <stdio.h>\n\nint main()\n{\n    int password = 0;\n\n    while (password != 1234)\n    {\n        printf("Enter password: ");\n        scanf("%d", &password);\n    }\n\n    printf("Access Granted!");\n    return 0;\n}',
    input: "1111\n2222\n1234",
    tasks: [
      "Run it. The keyboard box holds three guesses, one per line. Count how many times it asked for the password.",
      "Change the guesses so 1234 is the very first one, then run again. How many times does it ask now?",
      "Take 1234 out of the keyboard box and run again. The loop keeps asking for a password that never arrives. Read the message.",
    ],
    goal: { contains: "Access Granted!" },
    goalHint: "The loop only stops when a guess equals 1234. Put 1234 in the keyboard box, one number per line.",
    explanation: "Every guess is read into `password`, and then the loop checks `password != 1234` again. It asked once per guess and stopped when 1234 arrived. Without 1234 the condition never becomes FALSE, so the loop keeps asking. A real program would wait for you to type. Here the simulator stops it when the guesses run out.",
  },
  {
    id: "CH0057.p5.zero-times", stage: "STG006", chapter: "CH0057", page: 5, heading: "while vs do-while",
    kind: "lab", title: "Start with the condition already false",
    implements: ["CH0057.p5.lab"],
    observe: "Both loops keep going while `i <= 5`. Slide the start value above 5, so the condition is false from the very beginning. How many times does each body run?",
    controls: [{ id: "start", type: "range", label: "i starts at", min: 1, max: 9, step: 1, value: 8 }],
    show: ["lines"],
    variants: [
      { label: "while", code: 'int i = {{start}};\nint runs = 0;\n\nwhile (i <= 5)\n{\n    runs++;\n    i++;\n}\n\nprintf("The body ran %d time(s).", runs);' },
      { label: "do-while", code: 'int i = {{start}};\nint runs = 0;\n\ndo\n{\n    runs++;\n    i++;\n}\nwhile (i <= 5);\n\nprintf("The body ran %d time(s).", runs);' },
    ],
    explanation: "while checks first, so a false condition means the body runs 0 times. do-while runs the body first and checks afterwards, so it runs at least once. Slide the start value back down to 3 and the two loops agree again.",
  },
]);
