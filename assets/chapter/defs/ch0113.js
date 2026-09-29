ClickChapter.define({
  chapter: "CH0113",
  stage: "STG011",
  title: "Pointers with Structures",
  goal: "Say how a structure pointer relates to (*p).member and its shorter form, p->member.",

  references: [
    { title: "Structure Pointer, using Dot vs Arrow Operator | C Programming Language Tutorial", channel: "LearningLad", url: "https://www.youtube.com/watch?v=k3hZELZg4_U" },
  ],

  glossary: {
    "struct-pointer": {
      term: "structure pointer",
      short: "A pointer that stores the address of a structure variable.",
      explain: "struct Student s; struct Student *p = &s; -- p stores the address of the structure s, the same way an int pointer stores the address of an int.",
      example: "struct Student *p = &s;",
    },
    arrow: {
      term: "->",
      short: "The arrow operator: accesses a structure member through a pointer.",
      explain: "(*p).age and p->age mean exactly the same thing: p is dereferenced to reach the structure, and then the member is accessed. -> is just the shorter, more common way to write it.",
      example: "p->age is the same as (*p).age",
      remember: "p->member = (*p).member.",
    },
  },

  slides: [
    {
      id: "s1", kind: "explorer",
      title: "Explore a structure pointer",
      objective: "See a structure pointer created with & and used with -> to read and change a member.",
      glossary: ["struct-pointer", "arrow"],
      minTaps: 3,
      // This simulator does not support struct / . / -> (see assets/learn/c-interp.js): the topic of this whole
      // chapter is outside its intentionally minimal pointer subset. The program below is real, gcc-verified C;
      // it is shown for reading and exploring, not executed live.
      mayNotRun: true,
      code: [
        "#include <stdio.h>",
        "",
        "struct Student {",
        "   int age;",
        "};",
        "",
        "int main() {",
        "   struct Student s;",
        "   «ptr|struct Student *p = &s;»",
        "",
        "   «arrow|p->age = 21;»",
        "   printf(\"%d\", «read|p->age»);",
        "   return 0;",
        "}",
      ].join("\n"),
      targets: {
        ptr: { title: "struct Student *p = &s: a structure pointer", explain: "p stores the address of the structure s -- a structure pointer works the same way an int or char pointer does.", example: "p now points to s", terms: ["struct-pointer"] },
        arrow: { title: "p->age = 21: change a member through the pointer", explain: "-> dereferences p and reaches the age member in one step, then assigns 21 to it.", example: "p->age = 21; is the same as (*p).age = 21;", terms: ["arrow"] },
        read: { title: "p->age: read a member through the pointer", explain: "The same arrow syntax reads the member back, now 21.", example: "p->age -> 21" },
      },
    },
    {
      id: "s2", kind: "question", question: "Q000661",
      title: "What Does struct Student *p Create?",
      objective: "Say what a structure pointer declaration creates.",
      glossary: ["struct-pointer"],
      takeaway: "struct Student *p; creates a pointer to a structure.",
    },
    {
      id: "s3", kind: "activity", activity: "CH0113.p1.card-basics",
      title: "See how a structure pointer relates to the structure",
      objective: "Open cards explaining the structure/address/pointer relationship.",
      glossary: ["struct-pointer"],
      lead: "A {{struct-pointer|structure pointer}} stores the structure's own address.",
      takeaway: "&s gets the structure's address; struct Student *p stores it, exactly as an int pointer stores an int's address.",
    },
    {
      id: "s4", kind: "question", question: "Q000662",
      title: "What Is the Output?",
      objective: "Predict a member's value after setting it through a pointer.",
      glossary: ["arrow"],
      takeaway: "p->age = 20; sets the member, so p->age then reads 20.",
    },
    {
      id: "s5", kind: "activity", activity: "CH0113.p3.match-equivalent",
      title: "Match each expression to its equivalent",
      objective: "Pair p->age with the longer form it is short for.",
      glossary: ["arrow"],
      lead: "p->age is short for {{arrow|(*p).age}}.",
      takeaway: "p->age and (*p).age always mean the same thing: dereference p, then access the member.",
    },
    {
      id: "s6", kind: "question", question: "Q000663",
      title: "What Does p->age Mean?",
      objective: "Say what the arrow operator does.",
      glossary: ["arrow"],
      takeaway: "p->age accesses the age member through pointer p.",
    },
    {
      id: "s7", kind: "activity", activity: "CH0113.p4.build-change",
      title: "Build the statement that changes a member",
      objective: "Assemble the arrow-operator statement that sets a structure member.",
      glossary: ["arrow"],
      lead: "{{arrow|p->age = 21;}} changes the member through the pointer.",
      takeaway: "p->age = 21; dereferences p with -> and assigns 21 to the age member.",
    },
    {
      id: "s8", kind: "question", question: "Q000664",
      title: "Complete the Code",
      objective: "Fill in the statement that changes a member using the pointer.",
      glossary: ["arrow"],
      takeaway: "p->age = 21; changes the age member through the structure pointer.",
    },
    {
      id: "s9", kind: "activity", activity: "CH0113.p1.order-steps",
      title: "Put the structure-pointer steps in order",
      objective: "Order creating a structure, getting its address, storing it, and accessing a member.",
      glossary: ["struct-pointer", "arrow"],
      lead: "Create the structure, get its address, store it, then {{arrow|access a member}}.",
      takeaway: "Create the structure variable, get its address with &, store it in a structure pointer, then access a member with ->.",
    },
    {
      id: "s10", kind: "question", question: "Q000665",
      title: "Which Statement Is Equivalent to p->age?",
      objective: "Pick the longer form that means the same as p->age.",
      glossary: ["arrow"],
      takeaway: "(*p).age dereferences p first, then accesses age -- exactly what p->age does in one step.",
    },
  ],
});
