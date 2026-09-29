ClickChapter.define({
  chapter: "CH0105",
  stage: "STG011",
  title: "Address Operator &",
  goal: "Use & to find a variable's memory address, and know why scanf() needs it.",

  references: [
    { title: "Pointer Operators in C | Address of(&) and Value at(*) Op. | C Programming Tutorial for Beginners", channel: "Sandip Bhattacharya (Coding Archive)", url: "https://www.youtube.com/watch?v=Xl-7nlKnLcA" },
  ],

  glossary: {
    "address-of": {
      term: "&",
      short: "The address-of operator: finds the memory address of a variable.",
      explain: "&x does not give x's value; it gives the location where x is stored. That location is different every run, but it is always where x lives for that run.",
      example: "&x -> the address of x",
      remember: "& asks \"Where is it?\"",
    },
    scanf: {
      term: "scanf()",
      short: "Reads input from the user.",
      explain: "scanf() needs the address of a variable, not its value, so it knows where in memory to store what the user types.",
      example: "scanf(\"%d\", &age);",
      mistake: "Writing scanf(\"%d\", age); without the & -- scanf then has no address to write to.",
    },
  },

  slides: [
    {
      id: "s1", kind: "explorer",
      title: "Explore the address operator",
      objective: "See & used to initialize a pointer and to print an address with %p.",
      glossary: ["address-of"],
      minTaps: 3,
      // %p prints a real address, which is never the same twice -- not on two runs of the same program, and
      // never the same as this simulator's own synthetic one. Only the exact bytes are exempted from the
      // gcc comparison; the interpreter must still run this correctly, and gcc must still accept it.
      addressOutputVaries: true,
      code: [
        "#include <stdio.h>",
        "",
        "int main() {",
        "   int num = 50;",
        "   int *ptr;",
        "",
        "   ptr = «addr|&num»;",
        "",
        "   printf(\"Address = %p\\n\", «cast|(void*)ptr»);",
        "   printf(\"Value = %d\", «deref|*ptr»);",
        "   return 0;",
        "}",
      ].join("\n"),
      targets: {
        addr: { title: "&num: find num's address", explain: "& is the address-of operator. &num gives the location where num is stored, not its value 50.", example: "&num -> num's address", terms: ["address-of"] },
        cast: { title: "(void*)ptr: prepare an address for %p", explain: "%p expects a plain pointer; (void*) is the usual way to hand it one. The actual address printed differs on every run and every machine.", example: "printf(\"%p\", (void*)ptr);" },
        deref: { title: "*ptr: read the value at that address", explain: "Once ptr holds &num, *ptr reads num's current value through the pointer.", example: "*ptr -> 50" },
      },
    },
    {
      id: "s2", kind: "question", question: "Q000618",
      title: "What Does &x Represent?",
      objective: "Say what &x actually gives you.",
      glossary: ["address-of"],
      takeaway: "&x is the address of x, not its value.",
    },
    {
      id: "s3", kind: "activity", activity: "CH0105.p3.trace-address",
      title: "Trace & connecting a variable to a pointer",
      objective: "Follow num and ptr as & links them together.",
      glossary: ["address-of"],
      lead: "{{address-of|&num}} connects num to ptr, once and for good.",
      takeaway: "ptr is set from &num once; from then on, *ptr always reads num's current value, however num changes.",
    },
    {
      id: "s4", kind: "question", question: "Q000619",
      title: "Complete the Pointer Initialization",
      objective: "Fill in the address a pointer needs.",
      glossary: ["address-of"],
      takeaway: "int *p = &n; gives p the address of n.",
    },
    {
      id: "s5", kind: "question", question: "Q000620",
      title: "What Is the Output?",
      objective: "Predict what *p prints.",
      glossary: ["address-of"],
      takeaway: "*p reads the value at the address p holds, so it prints 40.",
    },
    {
      id: "s6", kind: "activity", activity: "CH0105.p4.match-scanf",
      title: "Match each use of & to its purpose",
      objective: "Sort statements by why & is needed there.",
      glossary: ["address-of", "scanf"],
      lead: "{{scanf|scanf()}} needs an address, not a value, so it uses {{address-of|&}}.",
      takeaway: "& gives scanf() the address to write into, initializes a pointer, and is the opposite of * (dereference).",
    },
    {
      id: "s7", kind: "question", question: "Q000621",
      title: "Why Is &age Used Here?",
      objective: "Say why scanf needs &age, not age.",
      glossary: ["scanf"],
      takeaway: "scanf() needs the address of age so it knows where to store the input.",
    },
    {
      id: "s8", kind: "question", question: "Q000622",
      title: "True or False",
      objective: "Say whether & gives a value or an address.",
      glossary: ["address-of"],
      takeaway: "False: & gives the address of a variable, not the value stored inside it.",
    },
    {
      id: "s9", kind: "question", question: "Q000623",
      title: "What Does This Mean?",
      objective: "Say what int *p = &x; means.",
      glossary: ["address-of"],
      takeaway: "int *p = &x; means p stores the address of x.",
    },
    {
      id: "s10", kind: "question", question: "Q000624",
      title: "Arrange the Steps",
      objective: "Put the steps for creating and using a pointer in order.",
      glossary: ["address-of"],
      takeaway: "Create the variable, get its address with &, store it in the pointer, then dereference it.",
    },
  ],
});
