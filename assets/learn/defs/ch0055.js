/*
 * CH0055 - Nested if-else (Stage 4, id STG005).
 *
 * The pages say the inner if is only checked after the outer one is reached, but a student never sees a path
 * being skipped. These activities light up the path through two gates, ask which message prints for several
 * marks, and check whether the student can tell when a deep nest should be flattened.
 */
ClickLearn.define([
  {
    id: "CH0055.p2.two-gates", stage: "STG005", chapter: "CH0055", page: 2, heading: "How Does It Work?",
    kind: "lab", title: "Walk through the two gates",
    implements: ["CH0055.p2.flow"],
    observe: "Change `age` and `marks`. The lit lines show the path C took. Set `age` below 18: does the line with `marks` light up?",
    controls: [
      { id: "age", type: "range", label: "age", min: 10, max: 30, step: 1, value: 20 },
      { id: "marks", type: "range", label: "marks", min: 20, max: 100, step: 5, value: 60 },
    ],
    show: ["lines"],
    code: 'int age = {{age}};\nint marks = {{marks}};\n\nif (age >= 18) {\n    if (marks >= 50) {\n        printf("Entry allowed");\n    } else {\n        printf("Marks too low");\n    }\n} else {\n    printf("Too young");\n}',
    summary: "With `age = {{age}}` and `marks = {{marks}}` the program prints **{{out}}**.",
    explanation: "The outer gate is checked first. The inner `if` is only checked after the outer condition is TRUE. When the outer gate stops you, the inner line stays dark.",
  },
  {
    id: "CH0055.p3.which-message", stage: "STG005", chapter: "CH0055", page: 3, heading: "Decision Level-Up",
    kind: "mcq", title: "Which message prints?",
    implements: ["CH0055.p3.pr"],
    question: "The program below runs three times. In the first run `marks` is 40, in the second run it is 60, and in the third run it is 80. Which list shows what it prints, in that order?",
    code: '// marks is 40, then 60, then 80\nif (marks >= 50) {\n    if (marks >= 75) {\n        printf("Distinction");\n    } else {\n        printf("Pass");\n    }\n} else {\n    printf("Fail");\n}',
    choices: [
      { text: "Fail, Distinction, Distinction", why: "60 passes the outer gate (`marks >= 50`), but the inner gate needs 75 or more. It reaches the inner `else` and prints Pass." },
      { text: "Fail, Pass, Distinction", correct: true, why: "40 stops at the outer gate. 60 passes the outer gate but not the inner one. 80 passes both gates." },
      { text: "Pass, Pass, Distinction", why: "40 fails the outer check `marks >= 50`, so C never looks at the inner `if`. The outer `else` prints Fail." },
      { text: "Fail, Pass, Pass", why: "80 passes the outer gate and the inner gate (`80 >= 75`), so the inner `if` branch runs and prints Distinction." },
    ],
    explanation: "Follow one value at a time. Ask the outer question first. Only if the answer is TRUE, ask the inner question.",
  },
  {
    id: "CH0055.p5.flatten", stage: "STG005", chapter: "CH0055", page: 5, heading: "Recap — Nested if-else",
    kind: "mcq", title: "Too much nesting?",
    implements: ["CH0055.p5.chk"],
    question: "This program does its job, but it is three levels deep. Booked must print only when all three checks are TRUE. What is the best way to make it easier to read without changing what it does?",
    code: 'if (age >= 18) {\n    if (hasTicket == 1) {\n        if (seats > 0) {\n            printf("Booked");\n        }\n    }\n}',
    choices: [
      { text: "Nest even deeper, so every check gets its own level", why: "More levels make the code harder to follow, not easier. That is the problem the recap warns about." },
      { text: "Delete the innermost check, `if (seats > 0)`", why: "That changes what the program does. It would print Booked even when there are no seats left." },
      { text: "Join the three checks into one condition with `&&`", correct: true, why: "All three checks must be TRUE for Booked to print, and that is exactly what `&&` means. One flat `if` is easier to read." },
      { text: "Swap the order so `seats > 0` is checked first", why: "The three levels are still there. Changing the order does not make the code flatter." },
    ],
    explanation: "When every check has to be TRUE and there is no separate action in between, `&&` joins them into one flat `if (age >= 18 && hasTicket == 1 && seats > 0)`. Keep the nesting when the inner decision needs its own separate result, such as its own `else` message.",
  },
]);
