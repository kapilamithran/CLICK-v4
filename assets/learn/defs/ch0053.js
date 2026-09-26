/*
 * CH0053 - Switch-Case (Stage 4, id STG005).
 *
 * The pages describe switch, case, break and default, but a student never sees which case is chosen or what
 * happens when break is missing. These activities let them change the value, watch the matching line light up,
 * take the break away, and match each decision statement to the job it fits.
 */
ClickLearn.define([
  {
    id: "CH0053.p2.match-case", stage: "STG005", chapter: "CH0053", page: 2, heading: "How Does Switch Work?",
    kind: "lab", title: "Change choice and watch the switch",
    implements: ["CH0053.p2.lab"],
    observe: "Slide `choice` from 0 to 4. The lit lines are the lines that ran. What runs when no case matches?",
    controls: [{ id: "choice", type: "range", label: "choice", min: 0, max: 4, step: 1, value: 2 }],
    show: ["lines"],
    code: 'int choice = {{choice}};\n\nswitch (choice) {\n    case 1: printf("Start"); break;\n    case 2: printf("Stop"); break;\n    default: printf("Invalid");\n}',
    summary: "With `choice = {{choice}}` the switch prints **{{out}}**.",
    explanation: "switch compares `choice` with each case. The matching case runs, and `break` leaves the switch. When no case matches, `default` runs.",
  },
  {
    id: "CH0053.p3.fall-through", stage: "STG005", chapter: "CH0053", page: 3, heading: "Case + Break + Default",
    kind: "lab", title: "Take the break away",
    implements: ["CH0053.p3.tr"],
    observe: "Pick option 1 or 2 and switch the break statements off. What else gets printed? Then try option 4.",
    controls: [
      { id: "option", type: "select", label: "option", options: [{ v: "1", l: "1" }, { v: "2", l: "2" }, { v: "3", l: "3" }, { v: "4", l: "4" }], value: "2" },
      { id: "brk", type: "toggle", label: "Keep break in every case", on: "break;", off: "// break is missing", checked: true },
    ],
    show: ["lines"],
    code: 'int option = {{option}};\n\nswitch (option) {\n    case 1: printf("Play\\n"); {{brk}}\n    case 2: printf("Pause\\n"); {{brk}}\n    case 3: printf("Stop\\n"); {{brk}}\n    default: printf("Invalid\\n");\n}',
    explanation: "`break` makes C leave the switch right after the matching case. Without it, C keeps running the cases below (this is called fall-through), even ones that do not match. It can even run `default`. Option 4 matches no case, so there `default` runs on its own.",
  },
  {
    id: "CH0053.p5.which-statement", stage: "STG005", chapter: "CH0053", page: 5, heading: "Recap — Switch-Case = Multiple Fixed Choices",
    kind: "assign", title: "Which statement fits the job?",
    implements: ["CH0053.p5.match"],
    question: "Use the comparison table above. Choose the statement that fits each job best.",
    buckets: [{ id: "if", label: "if" }, { id: "ifelse", label: "if-else" }, { id: "switch", label: "switch" }, { id: "ternary", label: "ternary" }],
    items: [
      { text: "Print \"Low battery\" only when the battery is below 20. Do nothing otherwise.", bucket: "if", why: "There is one condition and nothing to do when it is FALSE. That is a plain if." },
      { text: "Give a discount only when the customer is a member.", bucket: "if", why: "One condition, and nothing happens otherwise. That is a plain if." },
      { text: "When the ticket is valid, open the gate and print a welcome. Otherwise print an error and keep the gate shut.", bucket: "ifelse", why: "Two paths, and each path runs its own block of statements. That is if-else." },
      { text: "Run one set of steps when the player has health left and a different set when the health is 0.", bucket: "ifelse", why: "Two paths with a whole block each. That is if-else." },
      { text: "Turn a menu number from 1 to 4 into the matching action.", bucket: "switch", why: "One value is compared with several fixed options. That is switch." },
      { text: "Turn the numbers 1 to 7 into the names of the days.", bucket: "switch", why: "One value, several fixed choices. That is switch." },
      { text: "Get one of two values, \"Hot\" or \"Cool\", in a single short expression.", bucket: "ternary", why: "It picks between two values compactly. That is the ternary operator." },
      { text: "Choose between the two values \"Eligible\" and \"Not Eligible\" in one short line.", bucket: "ternary", why: "Two values, one short line. That is the ternary operator." },
    ],
    explanation: "if: one condition. if-else: two paths. switch: one value with several fixed choices. ternary: a short two-way choice of a value.",
  },
]);
