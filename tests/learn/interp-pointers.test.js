// Pointer support in the CLICK C interpreter (assets/learn/c-interp.js), added for Stage 12 (POINTERS).
// The interpreter models a pointer as a "ref" value ({t:"ref", cell, idx?}) that safely refers to one of the
// interpreter's own existing cells -- never a real machine address -- so every pointer operation stays
// sandboxed and deterministic. See the comment above refRead/refWrite in c-interp.js for the full picture.
//   node --test tests/learn/interp-pointers.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { Interp, hasGcc, gccRun, normOut } = require("./helpers.js");

const H = "#include <stdio.h>\n";
const P = (body) => H + "int main() {\n" + body + "\nreturn 0;\n}\n";

// ---- correct behavior: every program a beginner following the Pointers PDFs would actually run, checked
// against real gcc whenever it is installed (never for a program that prints a memory address: real
// addresses are never reproducible between two runs, let alone between this simulator and gcc).
const PROGRAMS = [
  ["declare, initialize, dereference", P("int x = 10;\nint *p = &x;\nprintf(\"%d\", *p);")],
  ["declare then initialize separately", P("int x = 25;\nint *p;\np = &x;\nprintf(\"%d\", *p);")],
  ["write through a pointer changes the variable", P("int x = 10;\nint *p = &x;\n*p = 20;\nprintf(\"%d\", x);")],
  ["read before and after writing through the pointer", P("int x = 50;\nint *p = &x;\nprintf(\"Value: %d\\n\", *p);\n*p = 100;\nprintf(\"New value: %d\", x);")],
  ["pointer reassigned to a different variable", P("int x = 1, y = 2;\nint *p = &x;\np = &y;\nprintf(\"%d\", *p);")],
  ["float pointer", P("float marks = 85.5;\nfloat *p = &marks;\nprintf(\"%.1f\", *p);")],
  ["char pointer to a single char", P("char ch = 'A';\nchar *p = &ch;\nprintf(\"%c\", *p);")],
  ["NULL pointer initialized then checked safely", P("int *p = NULL;\nif (p != NULL) {\n    printf(\"%d\", *p);\n} else {\n    printf(\"no value\");\n}")],
  ["scanf still works (unrelated & usage is untouched)", P('int age;\nscanf("%d", &age);\nprintf("Age = %d", age);'), "20\n"],
  ["array name decays to a pointer to the first element", P("int a[] = {10, 20, 30};\nint *p = a;\nprintf(\"%d\", *p);")],
  ["p++ moves to the next array element", P("int a[] = {10, 20, 30};\nint *p = a;\np++;\nprintf(\"%d\", *p);")],
  ["address of an element, then p-- moves back", P("int a[] = {10, 20, 30};\nint *p = &a[2];\np--;\nprintf(\"%d\", *p);")],
  ["p + n reads n elements ahead", P("int a[] = {100, 200, 300, 400};\nint *p = a;\nprintf(\"%d\", *(p + 2));")],
  ["p = p + n moves the pointer itself", P("int a[] = {10, 20, 30, 40};\nint *p = a;\np = p + 2;\nprintf(\"%d\", *p);")],
  ["traverse a whole array with *(p + i)", P("int a[] = {10, 20, 30, 40};\nint *p = a;\nfor (int i = 0; i < 4; i++) {\n    printf(\"%d \", *(p + i));\n}")],
  ["char * traverses a string", P("char str[] = \"HELLO\";\nchar *p = str;\nwhile (*p != '\\0') {\n    printf(\"%c\", *p);\n    p++;\n}")],
  ["*(p + i) reads characters of a string in order", P("char str[] = \"CODE\";\nchar *p = str;\nfor (int i = 0; i < 4; i++) {\n    printf(\"%c\", *(p + i));\n}")],
  ["function modifies the caller's variable through a pointer parameter", H + "void change(int *p) {\n    *p = 100;\n}\nint main() {\n    int x = 10;\n    change(&x);\n    printf(\"%d\", x);\n    return 0;\n}"],
  ["function modifies two caller variables", H + "void add(int *a, int *b) {\n    *a = *a + 10;\n    *b = *b + 10;\n}\nint main() {\n    int x = 5, y = 10;\n    add(&x, &y);\n    printf(\"%d %d\", x, y);\n    return 0;\n}"],
  ["saved original vs a pointer both read the same value (Number Crunching's own comparison, now with a pointer)", P("int x = 100;\nint *p = &x;\nprintf(\"%d %d\", x, *p);")],
];
for (const [name, code, input] of PROGRAMS) {
  test("pointers: " + name + (hasGcc ? " (vs gcc)" : ""), (t) => {
    const r = Interp.run(code, { input: input || "" });
    assert.ok(r.ok, name + " should run: " + (r.error && r.error.message));
    if (!hasGcc) { t.diagnostic("gcc not installed: comparison skipped"); return; }
    const g = gccRun(code, input || "", true);
    assert.ok(g.ok, "gcc should accept the program: " + g.error);
    assert.equal(normOut(r.stdout), normOut(g.stdout));
  });
}

// ---- %p / (void*): the printed address is synthetic and never compared with gcc (a real address is never
// reproducible), but both engines must accept and run the program.
const ADDR_PROGRAMS = [
  ["(void*) on &x", P('int x = 10;\nprintf("Address: %p\\n", (void*)&x);\nprintf("Value: %d", x);')],
  ["(void*) on a pointer variable", P("int x = 10;\nint *p = &x;\nprintf(\"%p\", (void*)p);")],
];
for (const [name, code] of ADDR_PROGRAMS) {
  test("pointers: " + name + " runs in the interpreter" + (hasGcc ? " and compiles with gcc (output not compared)" : ""), (t) => {
    const r = Interp.run(code, {});
    assert.ok(r.ok, name + " should run: " + (r.error && r.error.message));
    assert.match(r.stdout, /0x[0-9a-f]+/, "prints something address-shaped");
    if (!hasGcc) { t.diagnostic("gcc not installed: compile check skipped"); return; }
    const g = gccRun(code, "", true);
    assert.ok(g.ok, "gcc should accept the program: " + g.error);
  });
}
test("pointers: a NULL pointer prints (nil) for %p", () => {
  const r = Interp.run(P('int *p = NULL;\nprintf("%p", (void*)p);'), {});
  assert.ok(r.ok, r.error && r.error.message);
  assert.equal(r.stdout, "(nil)");
});
test("pointers: two elements of the same array print addresses 4 bytes apart (an int is 4 bytes)", () => {
  const r = Interp.run(P('int a[] = {10, 20};\nint *p = a;\nprintf("%p %p", (void*)p, (void*)(p + 1));'), {});
  assert.ok(r.ok, r.error && r.error.message);
  const [a0, a1] = r.stdout.split(" ").map((s) => parseInt(s, 16));
  assert.equal(a1 - a0, 4);
});

// ---- invalid pointer usage and NULL / undefined behavior: every one of these must stop with a clear,
// explanatory error - never a crash, a hang, or a silently wrong number.
const UB = [
  ["dereferencing an uninitialized pointer", P("int *p;\nprintf(\"%d\", *p);"), "ub", /used before it was given a value/],
  ["dereferencing a NULL pointer", P("int *p = NULL;\n*p = 10;"), "ub", /is NULL/],
  ["dereferencing a NULL pointer to read", P("int *p = NULL;\nprintf(\"%d\", *p);"), "ub", /is NULL/],
  ["a dangling pointer (its target's block has ended)", P("int *p;\n{\n    int x = 10;\n    p = &x;\n}\nprintf(\"%d\", *p);"), "ub", /dangling|gone out of scope/],
  ["pointer arithmetic reads outside the array", P("int a[] = {1, 2, 3};\nint *p = a;\np = p + 5;\nprintf(\"%d\", *p);"), "ub", /outside the array/],
  ["pointer arithmetic reads before the array", P("int a[] = {1, 2, 3};\nint *p = a;\np = p - 1;\nprintf(\"%d\", *p);"), "ub", /outside the array/],
  ["mismatched pointer type", P("int x = 10;\nfloat *p = &x;\nprintf(\"%d\", *p);"), "unsupported", /does not match the type/],
  ["a pointer to a pointer is not supported", P("int x = 10;\nint *p = &x;\nint **pp = &p;\nprintf(\"%d\", **pp);"), "unsupported", /pointer to a pointer/],
  ["dereferencing something that is not a pointer", P('int x = 5;\nprintf("%d", *x);'), "runtime", /can only be used to dereference/],
  ["comparing two pointers with < is not supported", P("int x = 1;\nint y = 2;\nint *p = &x;\nint *q = &y;\nif (p < q) printf(\"a\");"), "unsupported", /pointer with NULL/],
  ["%d given a pointer instead of its dereferenced value", P("int x = 5;\nint *p = &x;\nprintf(\"%d\", p);"), "ub", /an address/],
  ["assigning a plain number to a pointer other than 0/NULL", P("int x = 5;\nint *p = &x;\np = 99;\nprintf(\"%d\", *p);"), "unsupported", /Pointers are only supported/],
  ["char * pointer cannot move backward", P("char str[] = \"HI\";\nchar *p = str;\np++;\np--;\nprintf(\"%c\", *p);"), "unsupported", /backward/],
];
for (const [name, code, kind, msg] of UB) {
  test("pointers: undefined/invalid usage is flagged - " + name, () => {
    const r = Interp.run(code, {});
    assert.equal(r.ok, false, name + " should not silently succeed");
    assert.equal(r.error.kind, kind, name + ": " + JSON.stringify(r.error));
    if (msg) assert.match(r.error.message, msg, name);
  });
}

// ---- NULL specifics
test("pointers: p == NULL and p != NULL both read correctly for a real address and for NULL", () => {
  const r1 = Interp.run(P('int x = 1;\nint *p = &x;\nprintf("%d %d", p == NULL, p != NULL);'), {});
  assert.ok(r1.ok, r1.error && r1.error.message);
  assert.equal(r1.stdout, "0 1");
  const r2 = Interp.run(P('int *p = NULL;\nprintf("%d %d", p == NULL, p != NULL);'), {});
  assert.ok(r2.ok, r2.error && r2.error.message);
  assert.equal(r2.stdout, "1 0");
});
test("pointers: assigning the literal 0 to a pointer is the same as NULL", () => {
  const r = Interp.run(P("int x = 1;\nint *p = &x;\np = 0;\nprintf(\"%d\", p == NULL);"), {});
  assert.ok(r.ok, r.error && r.error.message);
  assert.equal(r.stdout, "1");
});
test("pointers: a NULL pointer is falsy in a bare if (p) check", () => {
  const r = Interp.run(P('int *p = NULL;\nprintf("%d", p ? 1 : 0);'), {});
  assert.ok(r.ok, r.error && r.error.message);
  assert.equal(r.stdout, "0");
});

// ---- pointer reassignment keeps the two pointer variables independent (no accidental aliasing)
test("pointers: two pointers to the same variable can move independently once one of them is reassigned", () => {
  const r = Interp.run(P("int a[] = {10, 20, 30};\nint *p = a;\nint *q = p;\nq++;\nprintf(\"%d %d\", *p, *q);"), {});
  assert.ok(r.ok, r.error && r.error.message);
  assert.equal(r.stdout, "10 20");
});
test("pointers: writing through one alias is visible through the other (they still point at the same variable)", () => {
  const r = Interp.run(P("int x = 1;\nint *p = &x;\nint *q = p;\n*q = 42;\nprintf(\"%d %d\", *p, x);"), {});
  assert.ok(r.ok, r.error && r.error.message);
  assert.equal(r.stdout, "42 42");
});

// ---- compound assignment on the pointer itself (p += n), not required by the source but must not silently misbehave
test("pointers: p += n and p -= n move the pointer, matching p = p + n / p = p - n", () => {
  const r = Interp.run(P("int a[] = {10, 20, 30, 40};\nint *p = a;\np += 2;\nprintf(\"%d \", *p);\np -= 1;\nprintf(\"%d\", *p);"), {});
  assert.ok(r.ok, r.error && r.error.message);
  assert.equal(r.stdout, "30 20");
});

// ---- struct/member access stays unsupported: this curriculum's one chapter that needs it (Pointers with
// Structures) is presented without live execution instead (see ch0113's mayNotRun Explorer slide)
test("pointers: struct member access (. and ->) is still explicitly unsupported, unchanged by this feature", () => {
  const r1 = Interp.run(P("struct S { int a; };\nstruct S s;\ns.a = 5;"), {});
  assert.equal(r1.ok, false);
  assert.match(r1.error.message, /[Ss]truct/);
  const r2 = Interp.run(P("struct S { int a; };\nstruct S s;\nstruct S *p = &s;\np->a = 5;"), {});
  assert.equal(r2.ok, false);
  assert.match(r2.error.message, /[Ss]truct/);
});

// ---- trace: a pointer variable shows something readable (its synthetic address and what it points to),
// not "[object Object]"
test("pointers: the trace shows a readable value for a pointer variable, not a raw object", () => {
  const r = Interp.run(P("int x = 7;\nint *p = &x;\nprintf(\"%d\", *p);"), { trace: true });
  assert.ok(r.ok, r.error && r.error.message);
  const row = r.trace.find((e) => e.vars.some((v) => v.name === "p"));
  const pVar = row.vars.find((v) => v.name === "p");
  assert.equal(pVar.type, "int *");
  assert.match(pVar.value, /^0x[0-9a-f]+ \(-> 7\)$/);
});
test("pointers: the trace shows NULL for a NULL pointer and a dangling note for one whose target left scope", () => {
  const r1 = Interp.run(P("int *p = NULL;\nprintf(\"%d\", 1);"), { trace: true });
  const row1 = r1.trace.find((e) => e.vars.some((v) => v.name === "p"));
  assert.equal(row1.vars.find((v) => v.name === "p").value, "NULL");
  const r2 = Interp.run(P("int *p;\n{\n    int x = 10;\n    p = &x;\n}\nprintf(\"%d\", 1);"), { trace: true });
  const row2 = [...r2.trace].reverse().find((e) => e.vars.some((v) => v.name === "p"));
  assert.equal(row2.vars.find((v) => v.name === "p").value, "invalid (dangling)");
});

// ---- a bug this feature exposed (pre-existing, but never reachable before): a declaration with several
// names, such as int *p, *q;, was counting the SECOND name's pointer stars on top of the type's own leading
// star instead of starting over for each name, so *q silently became a "pointer to a pointer" and was wrongly
// rejected once pointer-to-pointer detection existed. Fixed in parseDeclInit: only the first declarator
// inherits the type's own leading *(s); every later one starts at zero and counts only its own.
test("pointers: a multi-name declaration gives each name its own pointer level (real C rule)", () => {
  const r1 = Interp.run(P("int x = 1;\nint y = 2;\nint *p = &x, *q = &y;\nprintf(\"%d %d\", *p, *q);"), {});
  assert.ok(r1.ok, r1.error && r1.error.message);
  assert.equal(r1.stdout, "1 2");
  const r2 = Interp.run(P("int x = 5;\nint y = 9;\nint *p = &x, q = y;\nprintf(\"%d %d\", *p, q);"), {});
  assert.ok(r2.ok, "the second name without its own * must be a plain int, not a pointer: " + (r2.error && r2.error.message));
  assert.equal(r2.stdout, "5 9");
});

// ---- safety limits are unchanged by this feature: a pointer cannot be used to build an infinite loop that
// escapes the existing step limit, and array bounds are still enforced through pointer arithmetic
test("pointers: a loop driven by pointer arithmetic is still stopped by the existing step limit", () => {
  const r = Interp.run(P("int a[] = {1, 2, 3};\nint *p = a;\nwhile (1) {\n    p++;\n}"), { limits: { steps: 5000 } });
  assert.equal(r.ok, false);
  assert.equal(r.error.kind, "limit");
});
