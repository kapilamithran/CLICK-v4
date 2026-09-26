/*
 * CH0046 - Format Specifier (Stage 4).
 * Pages 1, 3 and 4 get activities (one per audit recommendation); pages 2 and 5 stay static.
 * The p3 mismatch demo uses an authored gcc-style warning (not simulated garbage output), so it is marked
 * skipGcc: the broken program is deliberately wrong C that real gcc only warns about and then runs.
 */
ClickLearn.define([
  {
    id: "CH0046.p1.match-specifiers", stage: "STG004", chapter: "CH0046", page: 1, heading: "What is a Format Specifier?",
    kind: "assign", title: "Match each specifier to its data type",
    implements: ["CH0046.p1.match"],
    question: "Every format specifier belongs to one data type. Match each specifier to the data type it goes with.",
    buckets: [
      { id: "int", label: "int (whole number)" },
      { id: "float", label: "float (decimal number)" },
      { id: "double", label: "double (bigger decimal number)" },
      { id: "char", label: "char (one character)" },
      { id: "string", label: "string (word or text)" },
    ],
    items: [
      { text: "%d", bucket: "int", why: "%d is the specifier for whole numbers, such as 18." },
      { text: "%f", bucket: "float", why: "%f is the specifier for a float, a decimal number such as 5.8." },
      { text: "%lf", bucket: "double", why: "A double is the bigger decimal type. Its specifier is %lf." },
      { text: "%c", bucket: "char", why: "%c is the specifier for one character, such as 'A'." },
      { text: "%s", bucket: "string", why: "%s is the specifier for a string, such as \"Arun\"." },
    ],
    explanation: "Data type, then its matching specifier: int %d, float %f, double %lf, char %c, string %s.",
  },
  {
    id: "CH0046.p3.wrong-specifier", stage: "STG004", chapter: "CH0046", page: 3, heading: "Format Specifiers with printf()",
    kind: "error", mode: "toggle", title: "What does a wrong specifier look like?",
    implements: ["CH0046.p3.bug"],
    skipGcc: true,
    question: "This program shows a decimal number, but the specifier is for a different data type. Press Compile to read the message gcc gives, then apply the fix.",
    broken: 'float price = 99.5;\n\nprintf("%d", price);',
    fixed: 'float price = 99.5;\n\nprintf("%f", price);',
    outputAfterFix: "99.500000",
    diagnostic: [
      "warning: format '%d' expects argument of type 'int', but argument 2 has type 'double' [-Wformat=]",
      "    3 | printf(\"%d\", price);",
      "      |         ~^   ~~~~~",
      "      |          |   |",
      "      |          int double",
      "      |         %f",
    ].join("\n"),
    explanation: "gcc read the format string and saw that `%d` expects a whole number (`int`), but `price` holds a decimal number. (printf receives a float as a double, which is why the message says double. For now, only the mismatch matters.)\nReal gcc only warns here and still builds the program, but the printed value would be wrong. The last line of the message even suggests `%f`.",
    fixNote: "`%f` matches a `float`, so the value prints correctly. `%f` always shows six digits after the decimal point.",
  },
  {
    id: "CH0046.p4.read-then-display", stage: "STG004", chapter: "CH0046", page: 4, heading: "Format Specifiers with scanf()",
    kind: "trace", title: "scanf reads, printf displays",
    implements: ["CH0046.p4.inp"],
    intro: "Pretend the user types `18` and presses Enter. Step through the program and watch which line reads and which line displays.",
    code: '#include <stdio.h>\n\nint main()\n{\n   int age;\n\n   printf("Enter your age: ");\n   scanf("%d", &age);\n   printf("You are %d years old", age);\n   return 0;\n}',
    input: "18",
    notes: {
      5: "This creates an empty box called `age`. It shows `?` because nothing is stored in it yet.",
      7: "**printf() displays.** It shows the words on the screen. Nothing is read here.",
      8: "**scanf() reads.** The `18` the user typed goes into `age`. The `&` tells scanf where the box `age` is, so it can put the number inside.",
      9: "**printf() displays.** It only needs the value of `age`, so there is no `&` here. The same `%d` is used, but this time it shows a value instead of reading one. Remember: printf() displays, scanf() reads, and the & shows where to store.",
    },
  },
]);
