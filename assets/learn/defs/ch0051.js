/*
 * CH0051 - if Statement (Stage 5).
 * p1: age-gate lab (slider + editable limit), p3: = versus == (lab toggle + predict the branch),
 * p4: match real-life scenarios to conditions. Pages 2 and 5 stay static.
 * Only `if` is used: `else` is taught in the next chapter (CH0052).
 * The = versus == demo is a logic bug, not a compile error, so it uses a lab toggle and a predict
 * (the `error` kind expects code that fails to compile).
 */
ClickLearn.define([
  {
    id: "CH0051.p1.age-gate", stage: "STG005", chapter: "CH0051", page: 1, heading: "What is if?",
    kind: "lab", title: "The age gate",
    implements: ["CH0051.p1.flow"],
    observe: "Slide `age` and watch the message and the highlighted lines. Then change the minimum age and slide again.",
    controls: [
      { id: "age", type: "range", label: "age", min: 0, max: 30, step: 1, value: 20 },
      { id: "limit", type: "number", label: "Minimum age", min: 1, max: 30, value: 18 },
    ],
    code: 'int age = {{age}};\n\nif (age >= {{limit}})\n{\n   printf("You can vote");\n}',
    show: ["lines"],
    summary: "Is `{{age}} >= {{limit}}`? If it is TRUE, the block runs and the message appears. If it is FALSE, C skips the whole block and prints nothing.",
  },
  {
    id: "CH0051.p3.equals-vs-assign", stage: "STG005", chapter: "CH0051", page: 3, heading: "Conditions We Can Check",
    kind: "lab", title: "Compare == with =",
    implements: ["CH0051.p3.bug"],
    observe: "Set `age` to 15. Flip the switch on and off and watch the message and the last line. Then try `age` = 18.",
    controls: [
      { id: "age", type: "range", label: "age", min: 10, max: 25, step: 1, value: 15 },
      { id: "op", type: "toggle", label: "Use = instead of ==", on: "=", off: "==", checked: false },
    ],
    code: 'int age = {{age}};\n\nif (age {{op}} 18)\n{\n   printf("Age is 18\\n");\n}\nprintf("age is now %d", age);',
    show: ["lines"],
    summary: "`age == 18` only asks a question and leaves `age` alone. `age = 18` stores 18 in `age` (see the last line), and C treats any value other than 0 as TRUE, so the block always runs.",
  },
  {
    id: "CH0051.p3.predict-branch", stage: "STG005", chapter: "CH0051", page: 3, heading: "Conditions We Can Check",
    kind: "predict", title: "Predict the branch",
    implements: ["CH0051.p3.bug"],
    question: "`age` is 15. What does this program print?",
    code: 'int age = 15;\n\nif (age = 18)\n{\n   printf("Adult");\n}',
    choices: ["Adult", "Nothing is printed", "The program does not compile"],
    expected: "Adult",
    hint: "Look at the condition again. Is it comparing `age` with 18, or doing something else?",
    explanation: "`age = 18` is an assignment, not a comparison. It stores 18 in `age`, and the condition takes the value 18. C treats any value other than 0 as TRUE, so the block runs and prints Adult.\nThe program does compile. gcc only warns: \"suggest parentheses around assignment used as truth value\". To compare, write `age == 18`.",
  },
  {
    id: "CH0051.p4.match-scenarios", stage: "STG005", chapter: "CH0051", page: 4, heading: "if in Real Programs",
    kind: "assign", title: "Match each scenario to its condition",
    implements: ["CH0051.p4.match"],
    question: "Which condition belongs to each real-life scenario?",
    buckets: [
      { id: "bank", label: "Banking: allow the withdrawal" },
      { id: "shop", label: "Shopping: the product is available" },
      { id: "game", label: "Games: show Game Over" },
      { id: "login", label: "Login: let the user in" },
    ],
    items: [
      { text: "balance >= amount", bucket: "bank", why: "The balance must be at least the amount asked for, so it uses >= (greater than or equal)." },
      { text: "stock > 0", bucket: "shop", why: "There must be at least one item left, so stock has to be greater than 0." },
      { text: "health <= 0", bucket: "game", why: "The game ends when health reaches zero or goes below, so it uses <= (less than or equal)." },
      { text: "password == correctPassword", bucket: "login", why: "The two passwords must be equal, so it uses == (a check), not = (an assignment)." },
    ],
    explanation: "INPUT → CHECK → DECISION → ACTION. Each scenario turns a real-life question into a comparison.",
  },
]);
