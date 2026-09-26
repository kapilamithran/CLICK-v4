/*
 * CH0040 - type casting (Stage 2, STG002).
 *
 * Why these activities: the pages state that `5 / 2` gives 2 and that `(float)5 / 2` gives 2.5, and that
 * 9.8 becomes 9 in an int. Here the student flips the cast on and off, watches values change type, sorts
 * implicit from explicit lines and predicts two casts before seeing the real output.
 */
ClickLearn.define([
  {
    id: "CH0040.p1.cast-switch", stage: "STG002", chapter: "CH0040", page: 1, heading: "What is Type Casting?",
    kind: "lab", title: "Flip the cast on and off",
    implements: ["CH0040.p1.lab"],
    observe: "Set a = 5 and b = 2. Flip the switch and compare the two outputs. Then try a = 9 and b = 3. When does the cast make a real difference to the value?",
    controls: [
      { id: "a", type: "range", label: "a (the top number)", min: 1, max: 20, step: 1, value: 5 },
      { id: "b", type: "range", label: "b (the bottom number)", min: 1, max: 20, step: 1, value: 2 },
      { id: "calc", type: "toggle", label: "Cast a to float", on: 'float result = (float)a / b;\nprintf("%f", result);', off: 'int result = a / b;\nprintf("%d", result);', checked: false },
    ],
    code: "int a = {{a}};\nint b = {{b}};\n{{calc}}",
    explanation: "Without the cast, both numbers are int, so C does integer division and the decimal part is lost. With `(float)a`, one side is a float, so the decimal part is kept.",
  },
  {
    id: "CH0040.p2.whole-vs-decimal", stage: "STG002", chapter: "CH0040", page: 2, heading: "Think of It Like Changing a Container",
    kind: "lab", title: "Watch a value change containers",
    implements: ["CH0040.p2.mem"],
    observe: "Move the first slider: the whole number turns into a float. Then slide the decimal number. Is the part after the point rounded, or just dropped? Try 9.9.",
    controls: [
      { id: "n", type: "range", label: "Whole number", min: 0, max: 50, step: 1, value: 5 },
      { id: "price", type: "range", label: "Decimal number", min: 0, max: 20, step: 0.1, value: 9.8 },
    ],
    variants: [
      { label: "A whole number goes into a float", code: 'int number = {{n}};\nfloat result = number;\nprintf("number = %d\\n", number);\nprintf("result = %f\\n", result);' },
      { label: "A decimal number goes into an int", code: 'float price = {{price}};\nint amount = (int)price;\nprintf("price  = %f\\n", price);\nprintf("amount = %d\\n", amount);' },
    ],
    explanation: "A float can show 5 as 5.0 without losing anything. An int stores whole numbers only, so it has no place to keep a decimal part.",
  },
  {
    id: "CH0040.p3.implicit-or-explicit", stage: "STG002", chapter: "CH0040", page: 3, heading: "Two Ways C Can Convert",
    kind: "assign", title: "Implicit or explicit?",
    implements: ["CH0040.p3.match"],
    question: "Assume `x`, `number` and `count` are int variables, and `price` is a float variable. Who does the conversion in each line?",
    buckets: [{ id: "implicit", label: "Implicit: C does it" }, { id: "explicit", label: "Explicit: you tell C" }],
    items: [
      { text: "float y = x;", bucket: "implicit", why: "No type is written in brackets. C converts the int for you because y needs a float." },
      { text: "int y = (int)price;", bucket: "explicit", why: "You wrote (int) yourself, so you told C exactly which type to use." },
      { text: "float total = count;", bucket: "implicit", why: "The receiving variable is a float, so C converts the int automatically." },
      { text: "float half = (float)number / 2;", bucket: "explicit", why: "(float) is written by you, so this is an explicit cast." },
      { text: "int whole = price;", bucket: "implicit", why: "No cast is written. C converts by itself because whole is an int, and the decimal part is dropped." },
      { text: "float f = (float)count;", bucket: "explicit", why: "The (float) in front is a cast that you wrote." },
    ],
    explanation: "Implicit: C decides, and you write nothing. Explicit: you decide, and you write the type in brackets. Look for the brackets.",
  },
  {
    id: "CH0040.p4.predict-float-division", stage: "STG002", chapter: "CH0040", page: 4, heading: "Let's See Why It Matters!",
    kind: "predict", title: "Predict a cast in a division",
    implements: ["CH0040.p4.pr"],
    code: 'printf("%f", (float)7 / 2);',
    expected: "3.500000",
    choices: ["3", "3.5", "3.500000", "4.000000"],
    hint: "`%f` always shows six digits after the decimal point. And ask: after `(float)7`, is this still integer division?",
    explanation: "`(float)7` turns 7 into 7.0 first, so the division is 7.0 / 2 = 3.5, and `%f` shows it as 3.500000. Plain `7 / 2` with two ints would give 3.",
  },
  {
    id: "CH0040.p4.predict-int-cast", stage: "STG002", chapter: "CH0040", page: 4, heading: "Let's See Why It Matters!",
    kind: "predict", title: "Predict a cast to int",
    implements: ["CH0040.p4.pr"],
    code: 'printf("%d", (int)6.99);',
    expected: "6",
    choices: ["6", "7", "6.99", "0.99"],
    hint: "Does converting to int round to the nearest whole number, or does it just throw the decimal part away?",
    explanation: "`(int)` keeps the whole-number part and discards everything after the decimal point. It does not round, so 6.99 becomes 6.",
  },
]);
