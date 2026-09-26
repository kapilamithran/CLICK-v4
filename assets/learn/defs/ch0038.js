/*
 * CH0038 - character & boolean (STG002).
 *
 * Students read that a char needs single quotes and that a bool prints as 1 or 0, but never test it.
 * Here they trigger the single/double quote error, flip a bool and see what printf() shows, predict the
 * two lines of a small program, and (one extra) see what happens without #include <stdbool.h>.
 */
ClickLearn.define([
  {
    id: "CH0038.p2.single-or-double", stage: "STG002", chapter: "CH0038", page: 2, heading: "Analogy — Filling Out a Form",
    kind: "error", mode: "toggle", title: "Single quotes or double quotes?",
    implements: ["CH0038.p2.bug"],
    question: "Compile this code and read the message. Then apply the fix and compile again.",
    broken: 'char grade = "A";\nprintf("%c", grade);',
    fixed: "char grade = 'A';\nprintf(\"%c\", grade);",
    diagnostic: "error: initialization of 'char' from 'char *' makes integer from pointer without a cast",
    explanation: "Double quotes make a piece of text, not a single character. A `char` box holds exactly one character, so the compiler complains that it got text instead.",
    fixNote: "Single quotes mark one character, so `'A'` fits in a `char`.",
    outputAfterFix: "A",
  },
  {
    id: "CH0038.p3.what-does-bool-print", stage: "STG002", chapter: "CH0038", page: 3, heading: "How Do We Display Them?",
    kind: "lab", title: "What does a bool print?",
    implements: ["CH0038.p3.lab"],
    observe: "Flip the switch to change `passed`. Then try both format specifiers.",
    mayFail: true,
    controls: [
      { id: "v", type: "toggle", label: "passed is true (off means false)", on: "true", off: "false", checked: true },
      { id: "spec", type: "select", label: "Format specifier in printf()", value: "%d", options: [{ v: "%d", l: "%d" }, { v: "%f", l: "%f" }] },
    ],
    code: '#include <stdio.h>\n#include <stdbool.h>\n\nint main() {\n   bool passed = {{v}};\n   printf("{{spec}}", passed);\n   return 0;\n}',
    summary: "With `passed = {{v}}`, the output is `{{out}}`.",
    explanation: "A bool is shown as a number: true is 1 and false is 0. Use `%d` to display it.",
  },
  {
    id: "CH0038.p4.predict-two-lines", stage: "STG002", chapter: "CH0038", page: 4, heading: "Let's Try It!",
    kind: "predict", title: "Predict both lines",
    implements: ["CH0038.p4.pr"],
    question: "What will this program print?",
    code: '#include <stdio.h>\n#include <stdbool.h>\nint main() {\n   char level = \'B\';\n   bool done = false;\n   printf("Level: %c\\n", level);\n   printf("Done: %d", done);\n   return 0;\n}',
    choices: [
      "Level: B\nDone: false",
      "Level: B\nDone: 1",
      "Level: B Done: 0",
      "Level: B\nDone: 0",
    ],
    expected: "Level: B\nDone: 0",
    hint: "%c shows the character itself. A bool is shown as a number with %d: false is 0 and true is 1, never the word. The `\\n` after the first line moves `Done` to a new line.",
    explanation: "`%c` shows the letter `B`. `false` is stored as 0, so `%d` shows `0`. The `\\n` puts the two lines apart.",
  },
  {
    id: "CH0038.p4.missing-stdbool", stage: "STG002", chapter: "CH0038", page: 4, heading: "Let's Try It!",
    kind: "error", mode: "toggle", title: "What if #include <stdbool.h> is missing?",
    question: "This program uses `bool` but has only one `#include`. Compile it, read the message, then apply the fix.",
    broken: '#include <stdio.h>\nint main() {\n   bool passed = true;\n   printf("%d", passed);\n   return 0;\n}',
    fixed: '#include <stdio.h>\n#include <stdbool.h>\nint main() {\n   bool passed = true;\n   printf("%d", passed);\n   return 0;\n}',
    diagnostic: "error: unknown type name 'bool'\nnote: 'bool' is defined in header '<stdbool.h>'; this is probably fixable by adding '#include <stdbool.h>'",
    explanation: "C does not know the word `bool` until you include `<stdbool.h>`. That header is what gives you `bool`, `true` and `false`.",
    fixNote: "With `#include <stdbool.h>`, `bool`, `true` and `false` are available.",
    outputAfterFix: "1",
  },
]);
