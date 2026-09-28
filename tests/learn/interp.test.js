// Interpreter tests: behaviour vs real gcc (when installed) + safety, error reporting and limits.
// Run: node --test "tests/learn/*.test.js"
const test = require("node:test");
const assert = require("node:assert/strict");
const { Interp, hasGcc, gccRun, normOut } = require("./helpers.js");

const H = "#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n";
const P = (body) => H + "int main() {\n" + body + "\nreturn 0;\n}\n";

// Programs whose output must match gcc exactly. `input` is the simulated keyboard.
const PROGRAMS = [
  ["hello", P('printf("Hello World!");')],
  ["newline escapes", P('printf("Hello\\nWorld\\t!\\n");')],
  ["int arithmetic", P('int x = 10, y = 3; printf("%d %d %d %d %d\\n", x + y, x - y, x * y, x / y, x % y);')],
  ["negative division", P('printf("%d %d %d %d\\n", -17 / 5, -17 % 5, 17 / -5, 17 % -5);')],
  ["integer division vs cast", P('int a = 5, b = 2; printf("%d %f %f %f\\n", a / b, (float)a / b, (double)a / b, (float)(a / b));')],
  ["float printing", P('float h = 5.8; double p = 3.1415926535; printf("%f %f %.2f %.4f %lf\\n", h, p, h, p, p);')],
  ["float precision", P('float f = 3.1415926535; double d = 3.1415926535; printf("%.10f %.10f\\n", f, d);')],
  ["float rounds", P('float p = 99.99; printf("%f %.2f\\n", p, p);')],
  ["double rounding ties", P('printf("%.0f %.0f %.0f %.1f %.2f\\n", 0.5, 1.5, 2.5, 0.25, 1.005);')],
  ["char printing", P("char g = 'A'; printf(\"%c %d %c\\n\", g, g, g + 1);")],
  ["bool", P("bool p = true; bool q = false; printf(\"%d %d %d\\n\", p, q, p && !q);")],
  ["relational to int", P('int a = 10, b = 4; printf("%d %d %d %d %d %d\\n", a > b, a >= b, a < b, a <= b, a == b, a != b);')],
  ["logical ops", P('int a = 5; printf("%d %d %d %d\\n", a > 0 && a < 10, a < 0 || a > 3, !(a > 3), !a);')],
  ["pre/post increment", P('int a = 1, b = 1; printf("%d %d\\n", --a, b--); printf("%d %d\\n", a, b);')],
  ["inc in expressions", P('int i = 5; int j = i++ + ++i; printf("%d %d\\n", i, j - j);')],
  ["compound assign", P('int a = 5; a += 3; a -= 1; a *= 4; a /= 3; a %= 5; printf("%d\\n", a);')],
  ["bitwise assign", P('int a = 60, b = 13; a &= b; printf("%d ", a); a = 60; a |= b; printf("%d ", a); a = 60; a ^= b; printf("%d ", a); a = 60; a <<= 2; printf("%d ", a); a = 60; a >>= 2; printf("%d\\n", a);')],
  ["bitwise ops", P('printf("%d %d %d %d %d %d\\n", 5 & 3, 5 | 3, 5 ^ 3, ~5, 5 << 1, 10 >> 1);')],
  ["chained assignment", P('int a, b, c; a = b = c = 20; printf("%d %d %d\\n", a, b, c);')],
  ["truncating assignment", P('int x = 3.14; int y = 9.99; printf("%d %d\\n", x, y);')],
  ["cast to int", P('float p = 9.8; int a = (int)p; printf("%d %d\\n", a, (int)-9.8);')],
  ["precedence", P('printf("%d %d %d %d\\n", 2 + 3 * 4, (2 + 3) * 4, 10 - 5 + 2, 5 > 3 && 2 < 4);')],
  ["ternary", P('int age = 20; printf("%s %s\\n", (age >= 18) ? "Adult" : "Minor", age > 30 ? "old" : "young");')],
  ["ternary mixed types", P('int c = 1; printf("%f\\n", c ? 1 : 2.5);')],
  ["if else chain", P('int marks = 85; if (marks >= 90) printf("A"); else if (marks >= 80) printf("B"); else printf("C");')],
  ["else if order bug", P('int m = 85; if (m >= 70) printf("C"); else if (m >= 80) printf("B"); else printf("D");')],
  ["nested if", P('int age = 30, ok = 1; if (age >= 18) { if (age <= 60) { printf("Eligible"); } else printf("old"); } else printf("young");')],
  ["switch with break", P('int d = 2; switch (d) { case 1: printf("Mon"); break; case 2: printf("Tue"); break; default: printf("Other"); }')],
  ["switch fallthrough", P('int d = 2; switch (d) { case 1: printf("A"); case 2: printf("B"); case 3: printf("C"); break; case 4: printf("D"); }')],
  ["switch default", P('int d = 9; switch (d) { case 1: printf("A"); break; default: printf("Other"); }')],
  ["for loop", P('for (int i = 1; i <= 5; i++) { printf("%d ", i); }')],
  ["for loop no braces", P('for (int i = 0; i < 3; i++) printf("Hello\\n");')],
  ["while loop", P('int i = 1; while (i <= 5) { printf("%d ", i); i++; }')],
  ["while zero times", P('int i = 10; while (i < 5) { printf("x"); i++; } printf("done");')],
  ["do while once", P('int i = 10; do { printf("%d", i); } while (i <= 5);')],
  ["do while loop", P('int i = 1; do { printf("%d ", i); i++; } while (i <= 3);')],
  ["break", P('for (int i = 1; i <= 5; i++) { if (i == 3) { break; } printf("%d\\n", i); }')],
  ["continue", P('for (int i = 1; i <= 5; i++) { if (i == 3) continue; printf("%d ", i); }')],
  ["continue in while", P('int i = 0; while (i < 6) { i++; if (i % 2 == 0) continue; printf("%d ", i); }')],
  ["nested loops stars", P('for (int i = 1; i <= 3; i++) { for (int j = 1; j <= 4; j++) { printf("* "); } printf("\\n"); }')],
  ["nested loops values", P('for (int i = 1; i <= 2; i++) { for (int j = 1; j <= 3; j++) { printf("%d%d ", i, j); } }')],
  ["nested with break", P('for (int i = 1; i <= 3; i++) { for (int j = 1; j <= 3; j++) { if (j == 2) break; printf("%d%d ", i, j); } }')],
  ["width and flags", P('printf("[%5d] [%-5d] [%05d] [%+d] [%5.1f] [%-8s] [%8s]\\n", 42, 42, 42, 42, 3.14159, "ab", "cd");')],
  ["hex and octal", P('printf("%x %X %o %d %u\\n", 255, 255, 8, 0x1F, 7);')],
  ["percent literal", P('printf("100%% sure %d%%\\n", 5);')],
  ["const", P('const int MAX = 100; printf("Max: %d\\n", MAX);')],
  ["unsigned literal-free int overflow wraps", P('int big = 2147483647; big = big + 1; printf("%d\\n", big);')],
  ["float ops stay float", P('float a = 0.1; float b = 0.2; printf("%.10f %.10f\\n", a + b, (double)a + (double)b);')],
  ["char arithmetic", P("char c = 'a'; c = c + 1; printf(\"%c %d\\n\", c, c);")],
  ["char array string", P('char name[] = "Arun"; printf("%s %d %d\\n", name, (int)sizeof(name), (int)strlen(name));')],
  ["char array sized", P('char name[20] = "Hi"; printf("%s|%d\\n", name, (int)sizeof(name));')],
  ["string pointer ternary", P('int marks = 75; char *result = (marks >= 50) ? "Pass" : "Fail"; printf("%s\\n", result);')],
  ["sizeof types", P('printf("%d %d %d %d\\n", (int)sizeof(int), (int)sizeof(float), (int)sizeof(double), (int)sizeof(char));')],
  ["void function", H + 'void greet() { printf("Hello, student!"); }\nint main() { greet(); return 0; }\n'],
  ["value function", H + "int getNumber() { return 10; }\nint main() { printf(\"%d\", getNumber()); return 0; }\n"],
  ["function with params", H + "int add(int a, int b) { return a + b; }\nint main() { printf(\"%d\", add(2, 3) * 2); return 0; }\n"],
  ["recursion", H + "int fact(int n) { if (n <= 1) return 1; return n * fact(n - 1); }\nint main() { printf(\"%d\", fact(5)); return 0; }\n"],
  ["snippet without main", 'int age = 18; printf("%d", age);'],
  ["comments", P('// a note\nprintf("Hello!"); // trailing\n/* block\n comment */ printf(" C");')],
  ["scanf int", P('int age; scanf("%d", &age); printf("age=%d", age);'), "18\n"],
  ["scanf two values", P('int a; float h; scanf("%d %f", &a, &h); printf("%d %.1f", a, h);'), "18 5.8\n"],
  ["scanf return value", P('int age; if (scanf("%d", &age) == 1) printf("ok"); else printf("bad");'), "hello\n"],
  ["scanf return value ok", P('int age; if (scanf("%d", &age) == 1) printf("ok %d", age); else printf("bad");'), "20\n"],
  ["scanf newline problem", P('int age; char grade; scanf("%d", &age); scanf("%c", &grade); printf("[%d][%d]", age, grade);'), "18\nA\n"],
  ["scanf space fix", P('int age; char grade; scanf("%d", &age); scanf(" %c", &grade); printf("[%d][%c]", age, grade);'), "18\nA\n"],
  ["scanf word", P('char name[20]; scanf("%19s", name); printf("Hello %s", name);'), "Arun Kumar\n"],
  ["fgets line", P('char name[50]; fgets(name, sizeof(name), stdin); printf("Hello %s!", name);'), "Arun Kumar\n"],
  ["fgets after scanf", P('int n; char s[20]; scanf("%d", &n); fgets(s, 20, stdin); printf("[%s]", s);'), "5\nabc\n"],
  ["strcspn strip newline", P('char s[50]; fgets(s, 50, stdin); s[strcspn(s, "\\n")] = 0; printf("Hello %s!", s);'), "Arun Kumar\n"],
  ["strcat joins two strings", P('char first[30] = "Hello "; char second[] = "World"; strcat(first, second); printf("%s", first);')],
  ["strchr found and not found", P('char word[] = "HELLO"; if (strchr(word, \'L\') != NULL) printf("found "); if (strchr(word, \'Z\') == NULL) printf("missing"); if (strchr(word, \'Z\') != NULL) printf("BAD");')],
  ["strchr result is the rest of the string", P('char word[] = "HELLO"; printf("%s", strchr(word, \'L\'));')],
  ["strcmp equal and different", P('char a[] = "CAT"; char b[] = "CAT"; char c[] = "DOG"; printf("%d ", strcmp(a, b) == 0); printf("%d", strcmp(a, c) == 0);')],
  ["strcpy then strlen", P('char source[] = "Hello"; char destination[20]; strcpy(destination, source); printf("%s %d", destination, (int)strlen(destination));')],
  ["reverse a string with strlen", P('char word[] = "CODE"; int i; for (i = strlen(word) - 1; i >= 0; i--) printf("%c", word[i]);')],
  ["traverse to the end marker", P('char word[] = "CODING"; for (int i = 0; word[i] != \'\\0\'; i++) printf("%c ", word[i]);')],
  ["count one letter in a string", P('char word[] = "BANANA"; int count = 0; for (int i = 0; word[i] != \'\\0\'; i++) { if (word[i] == \'A\') { count++; } } printf("%d", count);')],
  ["modify one character", P('char word[] = "HELLO"; word[1] = \'A\'; printf("%s", word);')],
  ["scanf multiple int", P('int a, b; scanf("%d %d", &a, &b); printf("%d", a + b);'), "10 20\n"],
  ["scanf char", P('char c; scanf(" %c", &c); printf("You entered %c", c);'), "Y\n"],
];

for (const [name, code, input] of PROGRAMS) {
  test("interpreter: " + name + (hasGcc ? " (vs gcc)" : ""), (t) => {
    const r = Interp.run(code, { input: input || "" });
    assert.ok(r.ok, name + " should run: " + (r.error && r.error.message));
    if (!hasGcc) { t.diagnostic("gcc not installed: comparison skipped"); return; }
    const g = gccRun(code, input || "");
    assert.ok(g.ok, "gcc should accept the program: " + g.error);
    assert.equal(normOut(r.stdout), normOut(g.stdout));
  });
}

// ---- undefined behaviour is explained, not invented
const UB = [
  ["uninitialised variable", P("int x; printf(\"%d\", x);"), "ub"],
  ["%d with a double", P('double d = 2.5; printf("%d", d);'), "ub"],
  ["%f with an int", P('int i = 5; printf("%f", i);'), "ub"],
  ["%s with an int", P('int i = 5; printf("%s", i);'), "ub"],
  ["missing & in scanf", P('int age; scanf("%d", age);'), "ub"],
  ["array out of range", P("int a[3] = {1,2,3}; printf(\"%d\", a[5]);"), "ub"],
  ["scanf %s overflow", P('char n[4]; scanf("%s", n);'), "ub"],
  ["strcat past the end of the array", P('char a[8] = "Hello "; char b[] = "World"; strcat(a, b);'), "ub"],
  ["%f into a double var with scanf", P('double d; scanf("%f", &d);'), "ub"],
];
for (const [name, code, kind] of UB) {
  test("undefined behavior is flagged: " + name, () => {
    const r = Interp.run(code, { input: "abcdefgh\n" });
    assert.equal(r.ok, false);
    assert.equal(r.error.kind, kind);
  });
}

// ---- compile-time style errors carry a useful line number
test("syntax error: missing semicolon reports the previous line", () => {
  const r = Interp.run(P('printf("Hello")\nprintf("World");'));
  assert.equal(r.ok, false);
  assert.equal(r.error.kind, "syntax");
  assert.match(r.error.message, /Expected ';'/);
  assert.equal(r.error.line, 5);
});
test("error: printf without stdio.h in a full program", () => {
  const r = Interp.run('int main() { printf("x"); return 0; }');
  assert.equal(r.ok, false); assert.match(r.error.message, /stdio\.h/);
});
test("error: bool needs stdbool.h in a full program", () => {
  const r = Interp.run('#include <stdio.h>\nint main() { bool b = 1; return 0; }');
  assert.equal(r.ok, false); assert.match(r.error.message, /stdbool\.h/);
});
test("error: assigning to a const", () => {
  const r = Interp.run(P("const int PRICE = 50; PRICE = 100;"));
  assert.equal(r.ok, false); assert.match(r.error.message, /const/);
});
test("error: undeclared variable", () => {
  const r = Interp.run(P('printf("%d", nope);'));
  assert.equal(r.ok, false); assert.match(r.error.message, /not declared/);
});
test("error: assigning to a non-variable", () => {
  const r = Interp.run(P("int x = 1; 10 = x;"));
  assert.equal(r.ok, false); assert.equal(r.error.kind, "syntax");
});
test("error: unclosed comment", () => {
  const r = Interp.run(P('/* never closed\nprintf("x");'));
  assert.equal(r.ok, false); assert.match(r.error.message, /never closed/);
});
test("division by zero stops with an explanation", () => {
  const r = Interp.run(P("int a = 1, b = 0; printf(\"%d\", a / b);"));
  assert.equal(r.ok, false); assert.match(r.error.message, /Division by zero/);
});

// ---- safety limits
test("infinite loop is stopped by the step limit", () => {
  const r = Interp.run(P("int i = 1; while (i > 0) { i = i + 0; }"), { limits: { steps: 50000 } });
  assert.equal(r.ok, false); assert.equal(r.error.kind, "limit");
});
test("runaway output is capped", () => {
  const r = Interp.run(P('while (1) { printf("aaaaaaaaaa"); }'), { limits: { output: 500 } });
  assert.equal(r.ok, false); assert.equal(r.error.kind, "limit");
  assert.ok(r.stdout.length <= 520);
});
test("runaway recursion is stopped", () => {
  const r = Interp.run(H + "int f(int n) { return f(n + 1); }\nint main() { return f(0); }\n");
  assert.equal(r.ok, false); assert.equal(r.error.kind, "limit");
});
test("no access to the host: eval-like names are simply unknown functions", () => {
  for (const name of ["eval", "require", "fetch", "system", "process", "window", "document"]) {
    const r = Interp.run(P(name + '("x");'));
    assert.equal(r.ok, false, name);
    assert.equal(r.error.kind, "syntax", name);
  }
});

// ---- tracing
test("trace records condition results, iterations and variable values", () => {
  const r = Interp.run(P('for (int i = 1; i <= 3; i++) { printf("%d ", i); }'), { trace: true });
  assert.ok(r.ok);
  const conds = r.trace.filter((e) => e.kind === "cond");
  assert.deepEqual(conds.map((c) => c.result), [true, true, true, false]);
  const i2 = conds[1].vars.find((v) => v.name === "i");
  assert.equal(i2.value, "2");
  assert.equal(r.trace[r.trace.length - 1].outLen, r.stdout.length);
});
test("trace marks break and switch decisions", () => {
  const r = Interp.run(P('int d = 2; switch (d) { case 1: printf("a"); break; case 2: printf("b"); break; }\nfor (int i = 0; i < 5; i++) { if (i == 1) break; }'), { trace: true });
  assert.ok(r.ok);
  assert.ok(r.trace.some((e) => e.kind === "switch" && /matches a case/.test(e.note)));
  assert.ok(r.trace.some((e) => e.kind === "break"));
});

test("expression parser exposes operator positions for the evaluation-order explorer", () => {
  const ast = Interp.parseExpression("2 + 3 * 4");
  assert.equal(ast.op, "+"); assert.equal(ast.r.op, "*");
  assert.ok(ast.opPos < ast.r.opPos);
});

test("formatting helper: exact fixed-point rounding", () => {
  assert.equal(Interp.fmtFixed(2.5, 0), "2");
  assert.equal(Interp.fmtFixed(0.125, 2), "0.12");
  assert.equal(Interp.fmtFixed(1.005, 2), "1.00");
  assert.equal(Interp.fmtFixed(-0.0004, 3), "-0.000");
  assert.equal(Interp.fmtFixed(123456789, 1), "123456789.0");
});
