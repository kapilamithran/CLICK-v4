/*
 * CH0036 - integer (STG002).
 *
 * Students meet int as "whole numbers" and the %d / %i specifiers. Here they sort numbers into "fits an
 * int" or not, see %d and %i side by side (including 0 and a negative), predict the printed message for
 * different values, and answer two short recap questions.
 */
ClickLearn.define([
  {
    id: "CH0036.p1.int-or-not", stage: "STG002", chapter: "CH0036", page: 1, heading: "What is an Integer?",
    kind: "assign", title: "Does it fit in an int?",
    implements: ["CH0036.p1.mem"],
    question: "Can an `int` store each of these numbers?",
    buckets: [{ id: "yes", label: "Fits an int" }, { id: "no", label: "Does not fit an int" }],
    items: [
      { text: "10", bucket: "yes", why: "10 is a whole number." },
      { text: "10.5", bucket: "no", why: "10.5 has a decimal part, so it is not a whole number." },
      { text: "-5", bucket: "yes", why: "A negative whole number is still an integer." },
      { text: "0", bucket: "yes", why: "Zero is a whole number. An int can store 0." },
      { text: "3.14", bucket: "no", why: "3.14 has a decimal part, so it is not a whole number." },
      { text: "250", bucket: "yes", why: "250 has no decimal part." },
      { text: "-2.75", bucket: "no", why: "It is negative, but it also has a decimal part. Only whole numbers fit an int." },
    ],
    explanation: "An int stores whole numbers: positive, negative or zero. Any number with a decimal part does not fit.",
  },
  {
    id: "CH0036.p3.d-and-i", stage: "STG002", chapter: "CH0036", page: 3, heading: "3 Things You Should Know",
    kind: "lab", title: "%d and %i side by side",
    implements: ["CH0036.p3.lab"],
    observe: "Pick a value. Try `0` and a negative number too. Compare the two outputs.",
    controls: [
      { id: "n", type: "select", label: "Value stored in score", value: "95", options: [{ v: "95", l: "95" }, { v: "0", l: "0" }, { v: "-5", l: "-5" }, { v: "42", l: "42" }, { v: "250", l: "250" }, { v: "-100", l: "-100" }] },
    ],
    variants: [
      { label: "Using %d", code: 'int score = {{n}};\nprintf("Score: %d", score);' },
      { label: "Using %i", code: 'int score = {{n}};\nprintf("Score: %i", score);' },
    ],
    summary: "Both `%d` and `%i` display the whole number as a signed integer: `{{out}}`.",
  },
  {
    id: "CH0036.p4.predict-message", stage: "STG002", chapter: "CH0036", page: 4, heading: "Let's Make It Work!",
    kind: "predict", title: "Predict the message",
    implements: ["CH0036.p4.pr"],
    code: 'int marks = 64;\nprintf("My marks are %d", marks);',
    choices: ["My marks are 64", "My marks are marks", "My marks are %d", "64"],
    expected: "My marks are 64",
    hint: "If you picked a message with `marks` or `%d` in it: printf() replaces `%d` with the value stored in the variable. If you picked only `64`: the text inside the quotes is printed too, exactly as written.",
    explanation: "The text `My marks are ` is printed as written. Then `%d` is replaced by the value in `marks`.",
  },
  {
    id: "CH0036.p4.predict-zero", stage: "STG002", chapter: "CH0036", page: 4, heading: "Let's Make It Work!",
    kind: "predict", title: "Predict it again with another value",
    implements: ["CH0036.p4.pr"],
    code: 'int marks = 0;\nprintf("Marks: %d out of 100", marks);',
    choices: ["Marks: 0", "Marks: %d out of 100", "Marks: marks out of 100", "Marks: 0 out of 100"],
    expected: "Marks: 0 out of 100",
    hint: "The `%d` is only one spot in the message. The text after it is still printed. Zero is a value too, so it is shown as `0`.",
    explanation: "printf() prints the text before `%d`, then the value `0`, then the text after it.",
  },
  {
    id: "CH0036.p5.check-int-facts", stage: "STG002", chapter: "CH0036", page: 5, heading: "Quick Recap — Integer (int)",
    kind: "mcq", title: "Which statement about int is true?",
    implements: ["CH0036.p5.chk"],
    question: "Choose the true statement.",
    choices: [
      { text: "An int can only store positive numbers.", why: "An int stores negative numbers and zero too, such as -10 and 0." },
      { text: "An int can store numbers with a decimal part, like 3.5.", why: "A number with a decimal part is not a whole number. Use float for it." },
      { text: "An int stores a whole number: positive, negative or zero.", correct: true, why: "That is exactly what an int is for." },
    ],
    explanation: "WHOLE NUMBER, int, store the value, `%d` or `%i` to display it.",
  },
  {
    id: "CH0036.p5.check-display-int", stage: "STG002", chapter: "CH0036", page: 5, heading: "Quick Recap — Integer (int)",
    kind: "mcq", title: "Which line displays an int?",
    implements: ["CH0036.p5.chk"],
    question: "The variable is `int age = 18;`. Which line displays its value?",
    choices: [
      { text: '`printf("age");`', why: "This prints the word `age`. It does not show the number stored in the variable." },
      { text: '`printf("%c", age);`', why: "`%c` is for a single character. A whole number needs `%d` or `%i`." },
      { text: '`printf("%d", age);`', correct: true, why: "`%d` is the spot for a whole number, and `age` supplies the value." },
      { text: "`printf(age);`", why: "printf() needs the double-quoted text first, with a `%d` spot in it, and then the variable." },
    ],
    explanation: "Store with `int`, display with `%d` or `%i`.",
  },
]);
