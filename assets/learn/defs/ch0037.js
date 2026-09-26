/*
 * CH0037 - float & double (STG002).
 *
 * Students read that double keeps more digits than float and that %f / %lf differ, but never see it.
 * A precision lab shows float and double side by side; a sorting task fills the printf/scanf specifier
 * table; a prediction covers %f versus %.2f; a run activity lets them change the price and specifier.
 *
 * NOTE for maintainers: page 4 of the Learn text says a float 99.99 prints 99.990000. Real gcc prints
 * 99.989998, because 99.99 has no exact float value. Every value used in these activities prints exactly
 * as shown (49.75, 25.5, 5.8 at six digits, pi at any digit count), so nothing here contradicts gcc.
 */
ClickLearn.define([
  {
    id: "CH0037.p3.precision-lab", stage: "STG002", chapter: "CH0037", page: 3, heading: "float vs double",
    kind: "lab", title: "Precision lab: float next to double",
    implements: ["CH0037.p3.lab"],
    observe: "Pick a number and move the slider to show more digits. Compare the float output with the double output.",
    controls: [
      { id: "v", type: "select", label: "Number to store", value: "3.1415926535", options: [{ v: "3.1415926535", l: "pi = 3.1415926535" }, { v: "5.8", l: "height = 5.8" }, { v: "12.34567", l: "a = 12.34567" }] },
      { id: "d", type: "range", label: "Digits after the decimal point", min: 0, max: 10, step: 1, value: 6 },
    ],
    variants: [
      { label: "float", code: 'float number = {{v}};\nprintf("%.{{d}}f", number);' },
      { label: "double", code: 'double number = {{v}};\nprintf("%.{{d}}f", number);' },
    ],
    explanation: "A float keeps only about 6 to 7 digits correctly. Digits beyond that are leftover rounding, so they can differ from what you stored. A double keeps about 15.",
  },
  {
    id: "CH0037.p3.specifier-table", stage: "STG002", chapter: "CH0037", page: 3, heading: "float vs double",
    kind: "assign", title: "Complete the specifier table",
    implements: ["CH0037.p3.match"],
    question: "Which specifier goes in each cell of the printf() and scanf() table?",
    buckets: [{ id: "f", label: "%f" }, { id: "lf", label: "%lf" }],
    items: [
      { text: "float with printf()", bucket: "f", why: "printf() displays a float with %f." },
      { text: "float with scanf()", bucket: "f", why: "scanf() reads a float with %f too." },
      { text: "double with printf()", bucket: "f", why: "The table above uses %f for printing a double. The special %lf is for scanf()." },
      { text: "double with scanf()", bucket: "lf", why: "Reading a double with scanf() is the one place that needs %lf." },
    ],
    explanation: "Three cells use %f. Only reading a double with scanf() needs %lf. You will use scanf() in the input chapter.",
  },
  {
    id: "CH0037.p4.predict-price", stage: "STG002", chapter: "CH0037", page: 4, heading: "Let's Use Them!",
    kind: "predict", title: "%f versus %.2f",
    implements: ["CH0037.p4.pr"],
    question: "What will this print?",
    code: 'float price = 49.75;\nprintf("Price: %f\\n", price);\nprintf("Price: %.2f", price);',
    choices: [
      "Price: 49.75\nPrice: 49.75",
      "Price: 49.750000\nPrice: 49.750000",
      "Price: 49.750000 Price: 49.75",
      "Price: 49.750000\nPrice: 49.75",
    ],
    expected: "Price: 49.750000\nPrice: 49.75",
    hint: "%f shows six digits after the decimal point, even when the number needs fewer. A precision such as %.2f limits that to two digits. The `\\n` in the first line puts the second price on its own line.",
    explanation: "`%f` shows six digits after the point, so 49.75 appears as `49.750000`. `%.2f` shows only two digits: `49.75`.",
  },
  {
    id: "CH0037.p5.change-price", stage: "STG002", chapter: "CH0037", page: 5, heading: "Quick Recap — Float & Double in 30 Seconds",
    kind: "run", title: "Change the price and the specifier",
    implements: ["CH0037.p5.run"],
    code: '#include <stdio.h>\n\nint main() {\n   float price = 25.5;\n   printf("Price: %f", price);\n   return 0;\n}',
    initialOutput: "Price: 25.500000",
    tasks: ["Change `25.5` to another price, such as `49.75`, and press Run.", "Change `%f` to `%.2f` and press Run. How many digits are shown now?", "Change `float` to `double`. Does the output for these prices change?"],
    goal: { changed: true }, goalHint: "Change the price or the specifier, then press Run again.",
    explanation: "The price you store sets the value. The specifier decides how many digits are displayed: `%f` shows six, `%.2f` shows two.",
  },
]);
