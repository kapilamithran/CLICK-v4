/*
 * CH0074 - String Input & Output (Stage 7, STG008).
 *
 * Source: Strings2.pdf. The PDF teaches reading a string with scanf("%s", name), displaying it with
 * printf("%s", name), the note that %s reads a word (not a line with spaces), and fgets(name, 20, stdin) which
 * can read input containing spaces ("Hello World"). Activities use those same programs and inputs.
 */
ClickLearn.define([
  {
    id: "CH0074.p3.trace-name-journey", stage: "STG008", chapter: "CH0074", page: 3, heading: "Using scanf()",
    kind: "trace", title: "Follow a name from keyboard to screen",
    input: "Ravi\n",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   char name[20];",
      "",
      "   printf(\"Enter your name: \");",
      "   scanf(\"%s\", name);",
      "   printf(\"%s\", name);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "The user types Ravi, scanf() reads it into name, and printf() shows the stored string. USER -> INPUT -> scanf() -> STRING -> printf() -> OUTPUT.",
  },
  {
    id: "CH0074.p3.scanf-word", stage: "STG008", chapter: "CH0074", page: 3, heading: "Using scanf()",
    kind: "buffer", title: "scanf(\"%s\") reads one word",
    question: "The user types `Ravi` and presses Enter. Press \"Run next input call\" and watch it land in `name`. Then change the input to `Hello World` and run it again: what does `name` get?",
    code: ["char name[20];", "", "scanf(\"%s\", name);"],
    calls: [{ fmt: "%s", var: "name", line: 3 }],
    input: "Ravi\n",
    explanation: "With `%s`, scanf() reads a word rather than a complete line containing spaces. It stops at the first space, so `Hello World` gives `name` only `Hello`.",
  },
  {
    id: "CH0074.p4.build-display", stage: "STG008", chapter: "CH0074", page: 4, heading: "Using printf()",
    kind: "builder", title: "Build the line that displays a string",
    question: "name already holds \"Ravi\". Complete the line that displays it on the screen.",
    template: "{fn}(\"{spec}\", name);",
    slots: {
      fn: { label: "function", options: ["printf", "scanf", "fgets"], answer: "printf", why: "printf() displays what is stored. scanf() and fgets() read input into a string instead." },
      spec: { label: "format specifier", options: ["%s", "%d", "%c"], answer: "%s", why: "%s tells printf() that the value is a string. %d is for whole numbers and %c is for one character." },
    },
    explanation: "printf(\"%s\", name); tells C: show this string.",
  },
  {
    id: "CH0074.p5.fgets-line", stage: "STG008", chapter: "CH0074", page: 5, heading: "Using fgets() + Recap",
    kind: "buffer", title: "fgets() reads the whole line",
    question: "The user types `Hello World` and presses Enter. Press \"Run next input call\" and see what `name` gets. Compare it with the `scanf(\"%s\")` version, which stopped at the space.",
    code: ["char name[20];", "", "fgets(name, 20, stdin);"],
    calls: [{ fmt: "fgets", var: "name", line: 3, size: 20 }],
    input: "Hello World\n",
    explanation: "fgets() reads a string or a line, so it can read input containing spaces, such as Hello World. scanf() reads a word; fgets() reads a line.",
  },
]);
