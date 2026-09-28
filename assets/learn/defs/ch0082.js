/*
 * CH0082 - Linear Search with Arrays (Stage 8, STG009).
 *
 * Why these activities: the PDF's whole point is "array + index + loop + target = Linear Search in C".
 * A full step trace over the complete program shows all four pieces working together at once; matching
 * index to value reinforces "i tells WHERE, numbers[i] tells WHAT"; a reveal explains why a loop replaces
 * writing one if per element; and a builder activity practices choosing a loop bound that matches the
 * array's real size (the PDF's own "for(int i = 0; i < 5; i++)" boundary).
 */
ClickLearn.define([
  {
    id: "CH0082.p3.trace-program", stage: "STG009", chapter: "CH0082", page: 3, heading: "Searching an Array Using a Loop",
    kind: "trace", title: "Step through the complete program",
    code: [
      "#include <stdio.h>",
      "",
      "int main()",
      "{",
      "   int numbers[] = {10, 25, 40, 15, 30};",
      "   int target = 15;",
      "",
      "   for (int i = 0; i < 5; i++)",
      "   {",
      "      if (numbers[i] == target)",
      "      {",
      "         printf(\"Found\");",
      "         break;",
      "      }",
      "   }",
      "",
      "   return 0;",
      "}",
    ].join("\n"),
    explanation: "i moves through 0, 1, 2, 3; numbers[3] is 15, which matches the target, so the program prints Found and breaks out of the loop.",
  },
  {
    id: "CH0082.p1.match-index-value", stage: "STG009", chapter: "CH0082", page: 1, heading: "Connecting Linear Search with Arrays",
    kind: "assign", title: "Match each index to its value",
    question: "int numbers[] = {8, 12, 20, 25}; - drag each index to the value stored there.",
    buckets: [
      { id: "i0", label: "Index 0" }, { id: "i1", label: "Index 1" }, { id: "i2", label: "Index 2" }, { id: "i3", label: "Index 3" },
    ],
    items: [
      { text: "8", bucket: "i0", why: "8 is the first value written, so it sits at index 0." },
      { text: "12", bucket: "i1", why: "12 is the second value written, so it sits at index 1." },
      { text: "20", bucket: "i2", why: "20 is the third value written, so it sits at index 2." },
      { text: "25", bucket: "i3", why: "25 is the fourth value written, so it sits at index 3." },
    ],
    explanation: "numbers[i] means \"the value at position i\": i tells WHERE, numbers[i] tells WHAT.",
  },
  {
    id: "CH0082.p3.why-loop", stage: "STG009", chapter: "CH0082", page: 3, heading: "Searching an Array Using a Loop",
    kind: "reveal", title: "Tap to see why a loop replaces many ifs",
    cards: [
      { label: "Without a loop", body: "if(numbers[0]==target) if(numbers[1]==target) if(numbers[2]==target) ... one line per element - this does not scale to large arrays." },
      { label: "With a loop", body: "for(int i = 0; i < 5; i++) { if(numbers[i]==target) {...} } repeats the same check for every index automatically." },
    ],
    explanation: "A loop lets the same one-line check run for as many elements as the array has, without writing it out by hand.",
  },
  {
    id: "CH0082.p2.build-bound", stage: "STG009", chapter: "CH0082", page: 2, heading: "Using Index to Check Each Element",
    kind: "builder", title: "Build a safe loop bound",
    question: "int numbers[] = {10, 25, 40, 15, 30}; - complete the loop so it checks every element exactly once.",
    template: "for (int i = 0; i {bound} 5; i++)",
    slots: {
      bound: { label: "bound", options: ["<", "<=", ">"], answer: "<", why: "i < 5 stops after i reaches 4, the array's last valid index; i <= 5 would go one past the end." },
    },
    explanation: "for (int i = 0; i < 5; i++) visits indexes 0 through 4 - exactly the 5 elements this array has.",
  },
]);
