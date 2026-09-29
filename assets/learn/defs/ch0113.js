/*
 * CH0113 - Pointers with Structures (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer11.pdf. The PDF creates a structure pointer (struct Student *p = &s;), accesses a member
 * through it with (*p).age, introduces the shorter -> as an equivalent (p->age), and shows a member being
 * changed through the pointer.
 *
 * This simulator does not model struct / . / -> (see the comment above refRead/refWrite in
 * assets/learn/c-interp.js) -- adding real struct support would be a much larger, separate change than this
 * one chapter justifies. Every activity here therefore uses a kind that does not execute code: reveal
 * (cards), assign (sorting), builder (assembling a statement from pieces) and order (noRun: true) -- exactly
 * the same kinds already used throughout this stage for non-executing content, just used consistently here.
 * The Code Explorer (slide 1 of the deck) is real, gcc-verified C shown with mayNotRun: true for the same
 * reason.
 */
ClickLearn.define([
  {
    id: "CH0113.p1.card-basics", stage: "STG011", chapter: "CH0113", page: 1, heading: "What Is a Pointer to a Structure?",
    kind: "reveal", title: "See how a structure pointer relates to the structure",
    intro: "A structure pointer works exactly like an int or char pointer -- it stores an address. Open each card.",
    cards: [
      { label: "struct Student s;", body: "Creates a structure variable that can store more than one piece of data together, such as age and marks." },
      { label: "&s", body: "Gets the address where the whole structure s is stored -- the same & operator used for any other variable." },
      { label: "struct Student *p = &s;", body: "Stores that address in a structure pointer. p does not hold the structure's data itself, only where to find it." },
      { label: "(*p).age", body: "Dereferences p to reach the structure, then accesses its age member. The parentheses matter: * has to apply to p before . can reach a member." },
    ],
    explanation: "A structure pointer stores the address of a structure variable, exactly as any other pointer stores an address. (*p).age dereferences the pointer first, then reaches the member.",
  },
  {
    id: "CH0113.p3.match-equivalent", stage: "STG011", chapter: "CH0113", page: 3, heading: "The Arrow Operator ->",
    kind: "assign", title: "Match each expression to its equivalent",
    question: "Sort each expression into the one that means exactly the same thing.",
    buckets: [
      { id: "age", label: "Same as (*p).age" },
      { id: "marks", label: "Same as (*p).marks" },
    ],
    items: [
      { text: "p->age", bucket: "age", why: "-> is the shorter way to write (*p).age -- dereference p, then access age." },
      { text: "p->marks", bucket: "marks", why: "-> is the shorter way to write (*p).marks -- dereference p, then access marks." },
      { text: "(*p).age", bucket: "age", why: "This is the longer form: dereference p with *, then access age with ." },
      { text: "(*p).marks", bucket: "marks", why: "This is the longer form: dereference p with *, then access marks with ." },
    ],
    explanation: "p->member and (*p).member always mean the same thing: dereference the pointer, then access the member. -> is simply the shorter, more common way to write it.",
  },
  {
    id: "CH0113.p4.build-change", stage: "STG011", chapter: "CH0113", page: 4, heading: "Changing Structure Data Using a Pointer",
    kind: "builder", title: "Build the statement that changes a member",
    question: "p already points to a structure with an age member. Build the statement that sets age to 21 through the pointer.",
    template: "p{op}age {eq} 21;",
    slots: {
      op: {
        label: "reach the member",
        options: ["->", ".", "*"],
        answer: "->",
        why: "-> reaches a member through a pointer in one step. . is for a plain structure variable, not a pointer, and * alone does not reach a member at all.",
      },
      eq: {
        label: "assign",
        options: ["=", "==", "+="],
        answer: "=",
        why: "A single = assigns the new value. == only compares, and += would add 21 to the existing value instead of setting it.",
      },
    },
    explanation: "p->age = 21; reaches the age member through the pointer p with the arrow operator, then assigns 21 to it -- exactly the same effect as (*p).age = 21;.",
  },
  {
    id: "CH0113.p1.order-steps", stage: "STG011", chapter: "CH0113", page: 1, heading: "What Is a Pointer to a Structure?",
    kind: "order", title: "Put the structure-pointer steps in order",
    noRun: true,
    question: "You are given a structure and asked to change one of its members through a pointer. Put these steps in the order a careful programmer follows them. One step is a trap.",
    lines: [
      "Create the structure variable",
      "Get its address with &",
      "Store the address in a structure pointer",
      "Access a member with ->",
    ],
    distractors: ["Access a member with -> before the pointer has an address"],
    explanation: "Create the structure, get its address, store it in a structure pointer, then access a member with ->. Using -> before the pointer holds a valid address is undefined behavior, exactly as with any other pointer.",
  },
]);
