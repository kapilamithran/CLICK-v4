/*
 * CH0049 - Character & String Input (Stage 4).
 * p2: the space before %c against a leftover newline (input simulator with the fix switch),
 * p3: the cells of char name[20] and why the width is %19s, p4: scanf %s versus fgets on "Arun Kumar".
 * Pages 1 and 5 stay static.
 * The end-of-string marker \0 is not spelled out on page 3, so the p3 activity introduces it as a clearly
 * labelled preview (the audit recommendation asks for it).
 */
ClickLearn.define([
  {
    id: "CH0049.p2.skip-whitespace", stage: "STG004", chapter: "CH0049", page: 2, heading: "Why Is There a Space Before %c?",
    kind: "buffer", title: "Type 18, press Enter, then type A",
    implements: ["CH0049.p2.inp"],
    question: "The user types `18`, presses Enter, then types `A` and presses Enter. Press \"Run all\" with the switch off and look at `grade`. Then turn the switch on and run it again.",
    code: ["int age;", "char grade;", "", 'scanf("%d", &age);', 'scanf("%c", &grade);'],
    calls: [{ fmt: "%d", var: "age", line: 4 }, { fmt: "%c", var: "grade", line: 5, fixFmt: " %c" }],
    input: "18\nA\n",
    fixToggle: true,
    explanation: "`%d` reads the 18 but leaves the Enter (↵) waiting. Plain `%c` reads any character, so it takes that Enter. The space in `\" %c\"` tells scanf to skip whitespace first, so it finds the A.",
  },
  {
    id: "CH0049.p3.name-cells", stage: "STG004", chapter: "CH0049", page: 3, heading: "What is a String?",
    kind: "assign", title: "What sits in each cell of name?",
    implements: ["CH0049.p3.mem"],
    // Part 1 of the recommendation (the cells and the end marker); the mcq below covers the %19s part.
    intro: "A quick preview: a string ends with a hidden end marker, written `\\0`. It tells C where the word stops.",
    question: "`char name[20]` has 20 cells, numbered 0 to 19. The user types `Arun` and `scanf(\"%19s\", name)` stores it. What is in each cell?",
    buckets: [
      { id: "letter", label: "A letter of Arun" },
      { id: "end", label: "The end marker \\0" },
      { id: "unused", label: "Nothing written yet" },
    ],
    items: [
      { text: "name[0]", bucket: "letter", why: "Cell 0 holds the first letter, A." },
      { text: "name[1]", bucket: "letter", why: "Cell 1 holds r." },
      { text: "name[3]", bucket: "letter", why: "Cell 3 holds n, the last letter of Arun." },
      { text: "name[4]", bucket: "end", why: "Arun has 4 letters (cells 0 to 3). The very next cell gets the end marker." },
      { text: "name[5]", bucket: "unused", why: "scanf wrote 4 letters and the end marker. Cell 5 was not touched." },
      { text: "name[19]", bucket: "unused", why: "The last cell is far beyond the word, so scanf did not write to it." },
    ],
    explanation: "Arun uses cells 0 to 3, and the end marker uses cell 4. The other 15 cells are not written.",
  },
  {
    id: "CH0049.p3.why-19", stage: "STG004", chapter: "CH0049", page: 3, heading: "What is a String?",
    kind: "mcq", title: "Why %19s and not %20s?",
    implements: ["CH0049.p3.mem"],
    question: "`char name[20]` has 20 cells. Why does the page read the word with `%19s` and not `%20s`?",
    choices: [
      { text: "Cells are counted from 0, so cell number 20 does not exist.", why: "The cells are numbered 0 to 19, but the array still has 20 cells to use. The number after % is a limit on how many characters scanf may read, not a cell number." },
      { text: "One cell must stay free for the end marker `\\0`, so at most 19 letters fit.", correct: true, why: "20 cells = up to 19 letters + 1 cell for the end marker. `%19s` makes scanf stop after 19 characters, so the marker always fits." },
      { text: "`%19s` reads 19 words.", why: "The number is a limit on characters, not words. `%s` always reads a single word." },
      { text: "The user must type exactly 19 letters.", why: "Shorter words work fine. `%19s` only sets the maximum." },
    ],
    explanation: "Room for the letters plus one cell for `\\0`: an array of 20 cells reads at most `%19s`.",
  },
  {
    id: "CH0049.p4.scanf-word", stage: "STG004", chapter: "CH0049", page: 4, heading: "scanf(\"%s\") vs fgets()",
    kind: "buffer", title: "scanf(\"%s\") reads one word",
    implements: ["CH0049.p4.inp"],
    question: "The user types `Arun Kumar` and presses Enter. Press \"Run next input call\" and see what `name` gets. Which characters are left in the queue?",
    code: ["char name[20];", "", 'scanf("%19s", name);'],
    calls: [{ fmt: "%s", var: "name", line: 3 }],
    input: "Arun Kumar\n",
    explanation: "`%s` stops at the first space, so `name` gets only `Arun`. The space, `Kumar` and the Enter are still waiting.",
  },
  {
    id: "CH0049.p4.fgets-line", stage: "STG004", chapter: "CH0049", page: 4, heading: "scanf(\"%s\") vs fgets()",
    kind: "buffer", title: "fgets() reads the whole line",
    implements: ["CH0049.p4.inp"],
    question: "Same typing as before: `Arun Kumar` and Enter. This time the program uses `fgets`. Press \"Run next input call\" and compare with the `%s` version.",
    code: ["char name[50];", "", "fgets(name, sizeof(name), stdin);"],
    calls: [{ fmt: "fgets", var: "name", line: 3, size: 50 }],
    input: "Arun Kumar\n",
    explanation: "`fgets` reads the whole line, spaces included, up to the Enter. Nothing is left in the queue. One word: `scanf(\"%s\", ...)`. A whole line: `fgets()`.",
  },
]);
