/*
 * CH0114 - Common Pointer Problems (Stage 12 POINTERS, STG011).
 *
 * Source: Pointer12.pdf. The PDF walks through three concrete pointer mistakes -- an uninitialized pointer,
 * a NULL pointer that is dereferenced without checking, and a dangling pointer left over after its target's
 * scope ends -- and closes with a recap checklist: check the pointer is valid, check it points to a real
 * object, only then dereference it. There is no quiz section in the source, matching the 5 original
 * questions already authored for this chapter.
 *
 * All three mistakes are genuine undefined behavior that the interpreter's new pointer support now detects
 * directly (uninitialized read, NULL dereference, dangling/out-of-scope dereference -- see refCheckLive in
 * assets/learn/c-interp.js), so each is a real, executable "error" activity rather than an authored-only
 * simulation. skipGcc is set on all three: real gcc does not reliably fail on any of these (verified directly --
 * it compiles and "succeeds", printing a leftover/garbage value, an empty read, or a reused stack value), so
 * comparing against gcc's output would be flaky by definition. The interpreter's own broken/fixed behavior is
 * still fully exercised and asserted by the shared test suite.
 */
ClickLearn.define([
  {
    id: "CH0114.p2.error-uninitialized", stage: "STG011", chapter: "CH0114", page: 2, heading: "Uninitialized Pointer",
    kind: "error", mode: "toggle", title: "What happens when a pointer is never given an address?",
    skipGcc: true,
    question: "p is declared but never given an address before it is dereferenced. Press Compile to see what goes wrong, then apply the fix and compile again.",
    broken: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int *p;",
      "   printf(\"%d\", *p);",
      "   return 0;",
      "}",
    ].join("\n"),
    fixed: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int x = 5;",
      "   int *p = &x;",
      "   printf(\"%d\", *p);",
      "   return 0;",
      "}",
    ].join("\n"),
    diagnostic: "note: 'p' is used uninitialized in this function\n    5 | printf(\"%d\", *p);\n      |                ^\nRunning it anyway reads whatever leftover address happens to already be there and dereferences it -- undefined behavior.",
    explanation: "int *p; only reserves space for a pointer -- it does not give p a real address to point to. Dereferencing it with *p reads through whatever leftover address happens to already be sitting in that space, which is undefined behavior: it can crash, or silently produce a meaningless value.",
    fixNote: "int *p = &x; gives p a real, valid address before it is ever dereferenced, so *p safely reads x's value.",
    outputAfterFix: "5",
  },
  {
    id: "CH0114.p3.error-null", stage: "STG011", chapter: "CH0114", page: 3, heading: "NULL Pointer",
    kind: "error", mode: "toggle", title: "What happens when a NULL pointer is dereferenced?",
    skipGcc: true,
    question: "p is set to NULL, which means it does not point to any variable, but the code dereferences it anyway. Press Compile to see what goes wrong, then apply the fix and compile again.",
    broken: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int *p = NULL;",
      "   printf(\"%d\", *p);",
      "   return 0;",
      "}",
    ].join("\n"),
    fixed: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int *p = NULL;",
      "   if (p != NULL) {",
      "      printf(\"%d\", *p);",
      "   } else {",
      "      printf(\"no value\");",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    diagnostic: "Segmentation fault (core dumped)\nNULL means p does not point to any variable at all -- dereferencing it has no valid memory to read from.",
    explanation: "NULL is a special value that means \"this pointer does not point to any variable.\" Dereferencing a NULL pointer with *p has no valid memory to read, which is undefined behavior and typically crashes the program.",
    fixNote: "if (p != NULL) checks p before it is ever dereferenced, so *p only runs when p genuinely points somewhere valid. Here p is NULL, so the safe else branch runs instead.",
    outputAfterFix: "no value",
  },
  {
    id: "CH0114.p4.error-dangling", stage: "STG011", chapter: "CH0114", page: 4, heading: "Dangling Pointer",
    kind: "error", mode: "toggle", title: "What happens when a pointer outlives its target?",
    skipGcc: true,
    question: "p is set to point at x, a variable declared inside a { } block. Once that block ends, x no longer exists. Press Compile to see what goes wrong, then apply the fix and compile again.",
    broken: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int *p;",
      "   {",
      "      int x = 10;",
      "      p = &x;",
      "   }",
      "   printf(\"%d\", *p);",
      "   return 0;",
      "}",
    ].join("\n"),
    fixed: [
      "#include <stdio.h>",
      "",
      "int main() {",
      "   int *p;",
      "   {",
      "      int x = 10;",
      "      p = &x;",
      "      printf(\"%d\", *p);",
      "   }",
      "   return 0;",
      "}",
    ].join("\n"),
    diagnostic: "warning: using dangling pointer 'p' to 'x' [-Wdangling-pointer=]\n    9 | printf(\"%d\", *p);\n      | ^\nnote: 'x' declared here\n    6 | int x = 10;\nx's storage no longer exists once the block ends. p still holds its old address, but *p now reads memory that is no longer valid -- undefined behavior.",
    explanation: "x is declared inside the { } block: once that block ends, x's storage is gone. p still holds x's old address, but that address is no longer valid -- p has become a dangling pointer, and dereferencing it is undefined behavior, even though p itself looks unchanged.",
    fixNote: "Using *p while x is still inside its block, before it goes out of scope, reads a real, valid value. Once the block ends, x is gone and p must not be dereferenced again.",
    outputAfterFix: "10",
  },
  {
    id: "CH0114.p5.order-checklist", stage: "STG011", chapter: "CH0114", page: 5, heading: "Common Pointer Problems Recap",
    kind: "order", title: "Put the pointer safety checklist in order",
    noRun: true,
    question: "You are about to dereference a pointer. Put these checks in the order a careful programmer follows them, before ever writing *p. One step is a trap.",
    lines: [
      "Check the pointer was given a real address, not left uninitialized",
      "Check the pointer is not NULL",
      "Check its target is still in scope (not dangling)",
      "Only then dereference it with *p",
    ],
    distractors: ["Dereference it with *p first, then check whether it was safe"],
    explanation: "Uninitialized, NULL, and dangling are the three ways a pointer can fail to point to a real, valid object. Checking for all three, in order, before ever writing *p, is what keeps a pointer safe to use. Dereferencing first and checking afterward is already too late -- the undefined behavior has already happened.",
  },
]);
