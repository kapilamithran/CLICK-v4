/*
 * CH0083 - Search Occurrence & Count (Stage 8, STG009).
 *
 * Why these activities: the PDF's central point is "count every match, do not stop at the first one",
 * shown through a worked count-up trace, an explicit find-vs-count contrast, three named outcomes for
 * the final count, and the one-line change (count++ instead of break) that makes counting work.
 */
ClickLearn.define([
  {
    id: "CH0083.p2.trace-count", stage: "STG009", chapter: "CH0083", page: 2, heading: "Counting Occurrences Using a Counter",
    kind: "trace", title: "Step through counting",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {5, 10, 5, 20, 5};",
      "   int target = 5;",
      "   int count = 0;",
      "",
      "   for (int i = 0; i < 5; i++)",
      "   {",
      "      if (numbers[i] == target)",
      "      {",
      "         count++;",
      "      }",
      "   }",
      "",
      "   printf(\"count = %d\", count);",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "5 appears at index 0, 2 and 4, so count goes 0 -> 1 -> 1 -> 2 -> 2 -> 3, ending at 3.",
  },
  {
    id: "CH0083.p3.find-vs-count", stage: "STG009", chapter: "CH0083", page: 3, heading: "Finding All Occurrences",
    kind: "assign", title: "Finding one vs. counting all",
    question: "Match each goal to what the loop should do when it finds a match.",
    buckets: [
      { id: "one", label: "Find one target" }, { id: "all", label: "Count all occurrences" },
    ],
    items: [
      { text: "Match -> break", bucket: "one", why: "Once the target is found, there is no need to keep searching." },
      { text: "Match -> count++, then keep going", bucket: "all", why: "Counting needs every element checked, so the loop must not stop early." },
    ],
    explanation: "Stopping early (break) finds one occurrence; continuing (count++, no break) finds all of them.",
  },
  {
    id: "CH0083.p4.three-results", stage: "STG009", chapter: "CH0083", page: 4, heading: "What If the Target Is Not Present?",
    kind: "reveal", title: "Tap each result to see what it means",
    cards: [
      { label: "count = 0", body: "The target has no occurrences in the array - it simply is not there." },
      { label: "count = 1", body: "The target appears exactly once." },
      { label: "count > 1", body: "The target appears multiple times - repeated." },
    ],
    explanation: "The final value of count always tells you exactly how many times the target appeared: 0, 1, or more.",
  },
  {
    id: "CH0083.p2.build-counter", stage: "STG009", chapter: "CH0083", page: 2, heading: "Counting Occurrences Using a Counter",
    kind: "builder", title: "Build the counting step",
    question: "Complete the block so a match adds to the count instead of stopping the search.",
    template: "if (numbers[i] == target) { {step} }",
    slots: {
      step: { label: "action", options: ["count++;", "count--;", "break;"], answer: "count++;", why: "count++ adds one to the running total; break would stop the loop after only the first match." },
    },
    explanation: "if (numbers[i] == target) { count++; } counts every match because the loop is never broken out of early.",
  },
]);
