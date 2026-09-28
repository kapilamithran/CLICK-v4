/*
 * CH0086 - Binary Search with Arrays (Stage 8, STG009).
 *
 * Why these activities: this chapter puts the full while-loop program together, so (1) a real step
 * trace reproduces the PDF's own Round 1 / Round 2 worked trace exactly, (2) a builder activity
 * practices the low-update line the PDF singles out, and (3) a reveal ties every variable and
 * statement in the finished program to its one job, straight from the PDF's own "What is each part
 * doing?" list. Six of this chapter's own quiz questions already fill the remaining slides, so only
 * three activity slides are used here (still within the chapter deck's 1-4 activity range).
 */
ClickLearn.define([
  {
    id: "CH0086.p4.trace-full", stage: "STG009", chapter: "CH0086", page: 4, heading: "Complete Binary Search Program",
    kind: "trace", title: "Step through the whole program",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {10, 20, 30, 40, 50, 60, 70};",
      "   int target = 60;",
      "",
      "   int low = 0;",
      "   int high = 6;",
      "   int mid;",
      "",
      "   while (low <= high)",
      "   {",
      "      mid = (low + high) / 2;",
      "",
      "      if (numbers[mid] == target)",
      "      {",
      "         printf(\"Found\");",
      "         break;",
      "      }",
      "      else if (target < numbers[mid])",
      "      {",
      "         high = mid - 1;",
      "      }",
      "      else",
      "      {",
      "         low = mid + 1;",
      "      }",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "Round 1: mid=3, numbers[3]=40, 60>40 so low becomes 4. Round 2: mid=5, numbers[5]=60 - a match, so the loop prints Found and breaks.",
  },
  {
    id: "CH0086.p3.build-update", stage: "STG009", chapter: "CH0086", page: 3, heading: "Updating Low and High",
    kind: "builder", title: "Build the boundary update",
    question: "Complete the statement that runs when the target is bigger than the middle value.",
    template: "if (target > numbers[mid]) { low = {expr}; }",
    slots: {
      expr: { label: "new low", options: ["mid + 1", "mid", "mid - 1"], answer: "mid + 1", why: "Everything up to and including mid has already been ruled out, so low must move to just past it." },
    },
    explanation: "if (target > numbers[mid]) { low = mid + 1; } moves the search area's start past the middle that was just checked.",
  },
  {
    id: "CH0086.p4.parts-reveal", stage: "STG009", chapter: "CH0086", page: 4, heading: "Complete Binary Search Program",
    kind: "reveal", title: "Tap each part to see its job",
    cards: [
      { label: "numbers[]", body: "Stores the sorted values Binary Search looks through." },
      { label: "target", body: "The value we are trying to find." },
      { label: "low / high", body: "Mark the beginning and end of the current search area." },
      { label: "mid", body: "The middle position, recalculated every round." },
      { label: "while (low <= high)", body: "Keeps searching only while a real search area remains." },
      { label: "low / high update", body: "Shrinks the search area by ruling out the half that cannot contain the target." },
    ],
    explanation: "Every piece of the program has exactly one job; together they repeatedly narrow the search area until the target is found.",
  },
]);
