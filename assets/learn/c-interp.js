/*
 * CLICK C-subset interpreter (Learn activities).
 *
 * A small, sandboxed interpreter for the C that the Stage 0-5 and Stage 6 (Arrays) Learn
 * pages teach: scalar variables (int, char, float, double, bool, const), operators, printf,
 * scanf/fgets on a simulated stdin, if/else/switch/ternary, for/while/do-while,
 * break/continue, simple functions (including array parameters, passed by reference like
 * real C), one- and two-dimensional arrays (char arrays as strings) and a few <string.h>
 * helpers.
 *
 * It is NOT a compiler. It never uses eval/Function, has no access to the DOM,
 * network or file system, and enforces hard step / output / time limits.
 * Behaviour that real C leaves undefined (uninitialised reads, wrong printf
 * specifiers, out-of-range array access, ...) stops with an explanatory error
 * instead of printing invented values.
 *
 * Works in a browser page, a Web Worker and Node (UMD). No dependencies.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ClickInterp = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  class CError extends Error {
    constructor(kind, message, line) { super(message); this.kind = kind; this.line = line || 0; }
  }
  const UNINIT = { uninit: true };
  const INT_MIN = -2147483648;

  // ---------------------------------------------------------------- lexer
  const TYPE_WORDS = new Set(["int", "char", "float", "double", "void", "bool", "_Bool", "short", "long", "signed", "unsigned", "const", "static"]);
  const KEYWORDS = new Set(["if", "else", "switch", "case", "default", "for", "while", "do", "break", "continue", "return", "sizeof", "struct", "typedef", "enum", "union", "goto", "extern", "register", "volatile"]);
  const OPS3 = ["<<=", ">>=", "..."];
  const OPS2 = ["++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>", "<=", ">=", "==", "!=", "&&", "||", "->"];

  function unescapeChar(src, i, line) {
    // src[i] === "\\"; returns [charCode, nextIndex]
    const c = src[i + 1];
    const map = { n: 10, t: 9, r: 13, "0": 0, a: 7, b: 8, f: 12, v: 11, "\\": 92, "'": 39, '"': 34, "?": 63 };
    if (c === "x") {
      let j = i + 2, h = "";
      while (/[0-9a-fA-F]/.test(src[j] || "")) h += src[j++];
      if (!h) throw new CError("syntax", "Bad \\x escape in a character or string.", line);
      return [parseInt(h, 16) & 255, j];
    }
    if (/[0-7]/.test(c || "")) {
      let j = i + 1, o = "";
      while (o.length < 3 && /[0-7]/.test(src[j] || "")) o += src[j++];
      return [parseInt(o, 8) & 255, j];
    }
    if (c in map) return [map[c], i + 2];
    throw new CError("syntax", "Unknown escape sequence \\" + c + ".", line);
  }

  function lex(src) {
    const toks = [], includes = [];
    let i = 0, line = 1;
    const n = src.length;
    const push = (t, v, s, extra) => toks.push(Object.assign({ t, v, line, s, e: i }, extra || {}));
    while (i < n) {
      const c = src[i];
      if (c === "\n") { line++; i++; continue; }
      if (c === " " || c === "\t" || c === "\r") { i++; continue; }
      if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") {
        const start = line; i += 2;
        while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line++; i++; }
        if (i >= n) throw new CError("syntax", "A comment starts with /* but is never closed with */.", start);
        i += 2; continue;
      }
      if (c === "#") {
        let j = i; while (j < n && src[j] !== "\n") j++;
        const text = src.slice(i, j).trim();
        const m = /^#\s*include\s*[<"]([^>"]+)[>"]/.exec(text);
        if (!m) throw new CError("unsupported", "Only #include lines are supported in this simulator.", line);
        includes.push(m[1]); i = j; continue;
      }
      const s = i;
      if (/[A-Za-z_]/.test(c)) {
        while (i < n && /\w/.test(src[i])) i++;
        const w = src.slice(s, i);
        push(TYPE_WORDS.has(w) ? "type" : KEYWORDS.has(w) ? "kw" : "id", w, s); continue;
      }
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] || ""))) {
        let m = /^0[xX][0-9a-fA-F]+/.exec(src.slice(i));
        if (m) { i += m[0].length; push("num", parseInt(m[0], 16), s, { ty: "int" }); continue; }
        m = /^(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?[fF]?/.exec(src.slice(i));
        const text = m[0];
        i += text.length;
        const isF = /[fF]$/.test(text), isFloat = /[.eE]/.test(text) || isF;
        if (/^[lLuU]/.test(src[i] || "")) throw new CError("unsupported", "Number suffixes like L or U are not supported in this simulator.", line);
        const val = parseFloat(text);
        if (!isFloat && val > 2147483647) throw new CError("unsupported", "Numbers larger than an int are not supported in this simulator.", line);
        push("num", isF ? Math.fround(val) : val, s, { ty: isF ? "float" : isFloat ? "double" : "int" });
        continue;
      }
      if (c === "'") {
        i++;
        let code;
        if (src[i] === "\\") { const r = unescapeChar(src, i, line); code = r[0]; i = r[1]; }
        else { code = src.charCodeAt(i); i++; }
        if (src[i] !== "'") throw new CError("syntax", "A character constant must hold exactly one character, like 'A'.", line);
        i++; push("num", code, s, { ty: "int", isChar: true }); continue;
      }
      if (c === '"') {
        i++;
        let str = "";
        while (i < n && src[i] !== '"') {
          if (src[i] === "\n") throw new CError("syntax", "A string is missing its closing double quote.", line);
          if (src[i] === "\\") { const r = unescapeChar(src, i, line); str += String.fromCharCode(r[0]); i = r[1]; }
          else { str += src[i]; i++; }
        }
        if (i >= n) throw new CError("syntax", "A string is missing its closing double quote.", line);
        i++; push("str", str, s); continue;
      }
      const t3 = src.substr(i, 3), t2 = src.substr(i, 2);
      if (OPS3.includes(t3)) { i += 3; push("op", t3, s); continue; }
      if (OPS2.includes(t2)) { i += 2; push("op", t2, s); continue; }
      if ("+-*/%=<>!~&|^?:;,.(){}[]".includes(c)) { i++; push("op", c, s); continue; }
      throw new CError("syntax", "Unexpected character '" + c + "'.", line);
    }
    toks.push({ t: "eof", v: "", line, s: n, e: n });
    return { toks, includes };
  }

  // --------------------------------------------------------------- parser
  const BIN_PREC = { "||": 1, "&&": 2, "|": 3, "^": 4, "&": 5, "==": 6, "!=": 6, "<": 7, "<=": 7, ">": 7, ">=": 7, "<<": 8, ">>": 8, "+": 9, "-": 9, "*": 10, "/": 10, "%": 10 };
  const ASSIGN_OPS = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="]);

  class Parser {
    constructor(toks, src) { this.toks = toks; this.p = 0; this.src = src; }
    peek(k) { return this.toks[Math.min(this.p + (k || 0), this.toks.length - 1)]; }
    next() { return this.toks[this.p++]; }
    is(v, k) { const t = this.peek(k); return (t.t === "op" || t.t === "kw" || t.t === "type") && t.v === v; }
    prevLine() { return this.p > 0 ? this.toks[this.p - 1].line : 1; }
    accept(v) { if (this.is(v)) { this.p++; return true; } return false; }
    expect(v, what) {
      if (this.is(v)) return this.next();
      const t = this.peek();
      const where = t.t === "eof" ? "the end of the program" : "'" + t.v + "'";
      const line = (v === ";" || v === ")" || v === "}" || v === "]") ? this.prevLine() : t.line;
      throw new CError("syntax", "Expected '" + v + "'" + (what ? " " + what : "") + " before " + where + ".", line);
    }
    fail(msg, tok) { throw new CError("syntax", msg, (tok || this.peek()).line); }

    isTypeStart(k) { const t = this.peek(k); return t.t === "type"; }

    parseType() {
      const start = this.peek();
      let base = null, isConst = false, unsupported = null, words = [];
      while (this.peek().t === "type") {
        const w = this.next().v; words.push(w);
        if (w === "const") isConst = true;
        else if (w === "static") { /* ignore */ }
        else if (w === "unsigned" || w === "short" || w === "long" || w === "signed") unsupported = unsupported || w;
        else base = w === "_Bool" ? "bool" : w;
      }
      if (!base) { if (unsupported) base = "int"; else this.fail("Expected a type name.", start); }
      let ptr = 0;
      while (this.accept("*")) ptr++;
      return { base, isConst, ptr, unsupported, line: start.line };
    }

    // ------------- expressions
    parseExpr() { // comma expression
      let l = this.parseAssign();
      while (this.is(",")) { const tk = this.next(); const r = this.parseAssign(); l = { t: "comma", l, r, line: tk.line, s: l.s, en: r.en }; }
      return l;
    }
    parseAssign() {
      const l = this.parseCond();
      const t = this.peek();
      if (t.t === "op" && ASSIGN_OPS.has(t.v)) {
        if (!["id", "index"].includes(l.t)) this.fail("The left side of an assignment must be a variable (or an array element).", t);
        this.next();
        const r = this.parseAssign();
        return { t: "assign", op: t.v, l, r, line: t.line, s: l.s, en: r.en, opPos: t.s };
      }
      return l;
    }
    parseCond() {
      const c = this.parseBin(1);
      if (this.is("?")) {
        const q = this.next();
        const a = this.parseExpr();
        this.expect(":", "in the ? : expression");
        const b = this.parseCond();
        return { t: "cond", c, a, b, line: q.line, s: c.s, en: b.en };
      }
      return c;
    }
    parseBin(minPrec) {
      let l = this.parseUnary();
      for (;;) {
        const t = this.peek();
        const prec = t.t === "op" ? BIN_PREC[t.v] : undefined;
        if (!prec || prec < minPrec) return l;
        this.next();
        const r = this.parseBin(prec + 1);
        l = { t: "bin", op: t.v, l, r, line: t.line, s: l.s, en: r.en, opPos: t.s };
      }
    }
    parseUnary() {
      const t = this.peek();
      if (t.t === "op" && ["+", "-", "!", "~"].includes(t.v)) { this.next(); const e = this.parseUnary(); return { t: "un", op: t.v, e, line: t.line, s: t.s, en: e.en, opPos: t.s }; }
      if (t.t === "op" && (t.v === "++" || t.v === "--")) {
        this.next(); const e = this.parseUnary();
        if (!["id", "index"].includes(e.t)) this.fail("++ and -- need a variable.", t);
        return { t: "pre", op: t.v, e, line: t.line, s: t.s, en: e.en, opPos: t.s };
      }
      if (t.t === "op" && t.v === "&") { this.next(); const e = this.parseUnary(); return { t: "addr", e, line: t.line, s: t.s, en: e.en }; }
      if (t.t === "op" && t.v === "*") this.fail("Pointer dereference (*) is not supported in this simulator.", t);
      if (t.t === "kw" && t.v === "sizeof") {
        this.next();
        if (this.is("(") && this.isTypeStart(1)) { this.next(); const ty = this.parseType(); const c = this.expect(")"); return { t: "sizeofT", ty, line: t.line, s: t.s, en: c.e }; }
        const e = this.parseUnary();
        return { t: "sizeofE", e, line: t.line, s: t.s, en: e.en };
      }
      if (t.t === "op" && t.v === "(" && this.isTypeStart(1)) {
        this.next(); const ty = this.parseType(); this.expect(")"); const e = this.parseUnary();
        return { t: "cast", ty, e, line: t.line, s: t.s, en: e.en };
      }
      return this.parsePostfix();
    }
    parsePostfix() {
      let e = this.parsePrimary();
      for (;;) {
        const t = this.peek();
        if (t.t === "op" && t.v === "(") {
          if (e.t !== "id") this.fail("Only named functions can be called.", t);
          this.next();
          const args = [];
          if (!this.is(")")) { do { args.push(this.parseAssign()); } while (this.accept(",")); }
          const c = this.expect(")", "to close the function call");
          e = { t: "call", name: e.name, args, line: e.line, s: e.s, en: c.e };
        } else if (t.t === "op" && t.v === "[") {
          this.next(); const i = this.parseExpr(); const c = this.expect("]");
          e = { t: "index", e, i, line: t.line, s: e.s, en: c.e };
        } else if (t.t === "op" && (t.v === "++" || t.v === "--")) {
          if (!["id", "index"].includes(e.t)) this.fail("++ and -- need a variable.", t);
          this.next(); e = { t: "post", op: t.v, e, line: t.line, s: e.s, en: t.e, opPos: t.s };
        } else if (t.t === "op" && (t.v === "." || t.v === "->")) this.fail("Structs are not supported in this simulator.", t);
        else return e;
      }
    }
    parsePrimary() {
      const t = this.next();
      if (t.t === "num") return { t: "num", v: t.v, ty: t.ty, line: t.line, s: t.s, en: t.e, isChar: t.isChar };
      if (t.t === "str") {
        let v = t.v, e = t.e;
        while (this.peek().t === "str") { const u = this.next(); v += u.v; e = u.e; }
        return { t: "str", v, line: t.line, s: t.s, en: e };
      }
      if (t.t === "id") return { t: "id", name: t.v, line: t.line, s: t.s, en: t.e };
      if (t.t === "op" && t.v === "(") { const e = this.parseExpr(); const c = this.expect(")"); return Object.assign({}, e, { s: t.s, en: c.e, paren: true }); }
      if (t.t === "eof") throw new CError("syntax", "The program ends unexpectedly. Something is missing (a } or a ;?).", t.line);
      throw new CError("syntax", "Unexpected '" + t.v + "' in an expression.", t.line);
    }

    // ------------- statements
    // { expr, expr, {nested}, ... } - used for array initializers. Nesting one level per
    // array dimension (e.g. { {10, 20, 30}, {40, 50, 60} } for a [2][3] array) is allowed;
    // whether the nesting depth actually matches the array's dimensions is checked later,
    // once the array's own dimensions are known.
    parseInitList() {
      const open = this.expect("{");
      const items = [];
      if (!this.is("}")) {
        do {
          if (this.is("}")) break;
          items.push(this.is("{") ? this.parseInitList() : this.parseAssign());
        } while (this.accept(","));
      }
      this.expect("}");
      return { t: "list", items, line: open.line };
    }
    parseDeclInit(ty) {
      const items = [];
      do {
        let ptr = ty.ptr; while (this.accept("*")) ptr++;
        const nameTok = this.next();
        if (nameTok.t !== "id") this.fail("Expected a variable name.", nameTok);
        let dims = [], hasBrackets = false;
        while (this.is("[")) {
          this.next(); hasBrackets = true;
          dims.push(this.is("]") ? null : this.parseAssign());
          this.expect("]");
        }
        if (dims.length > 2) this.fail("Only one- and two-dimensional arrays are supported in this simulator.");
        let init = null;
        if (this.accept("=")) {
          init = this.is("{") ? this.parseInitList() : this.parseAssign();
        }
        items.push({ name: nameTok.v, ptr, hasBrackets, dims, init, line: nameTok.line, s: nameTok.s });
      } while (this.accept(","));
      return items;
    }
    parseDecl() {
      const startTok = this.peek();
      const ty = this.parseType();
      const items = this.parseDeclInit(ty);
      const semi = this.expect(";", "after the declaration");
      return { t: "decl", ty, items, line: startTok.line, s: startTok.s, en: semi.e };
    }
    parseBlock() {
      const open = this.expect("{");
      const body = [];
      while (!this.is("}")) {
        if (this.peek().t === "eof") throw new CError("syntax", "A { block is never closed with }.", open.line);
        body.push(this.parseStmt());
      }
      this.next();
      return { t: "block", body, line: open.line };
    }
    parseStmt() {
      const t = this.peek();
      if (t.t === "op" && t.v === "{") return this.parseBlock();
      if (t.t === "op" && t.v === ";") { this.next(); return { t: "empty", line: t.line }; }
      if (t.t === "type") return this.parseDecl();
      if (t.t === "kw") {
        switch (t.v) {
          case "if": {
            this.next(); this.expect("("); const c = this.parseExpr(); this.expect(")", "after the if condition");
            const a = this.parseStmt(); let b = null;
            if (this.is("else")) { this.next(); b = this.parseStmt(); }
            return { t: "if", c, a, b, line: t.line };
          }
          case "while": {
            this.next(); this.expect("("); const c = this.parseExpr(); this.expect(")", "after the while condition");
            return { t: "while", c, body: this.parseStmt(), line: t.line };
          }
          case "do": {
            this.next(); const body = this.parseStmt();
            if (!this.is("while")) this.fail("A do { } loop must end with while (condition);");
            this.next(); this.expect("("); const c = this.parseExpr(); this.expect(")"); this.expect(";", "after do...while(...)");
            return { t: "do", c, body, line: t.line };
          }
          case "for": {
            this.next(); this.expect("(");
            let init = null;
            if (this.is(";")) this.next();
            else if (this.peek().t === "type") { init = this.parseDecl(); }
            else { const e = this.parseExpr(); const semi = this.expect(";"); init = { t: "expr", e, line: e.line, s: e.s, en: semi.e }; }
            let c = null; if (!this.is(";")) c = this.parseExpr(); this.expect(";", "after the for condition");
            let upd = null; if (!this.is(")")) upd = this.parseExpr(); this.expect(")", "after the for header");
            return { t: "for", init, c, upd, body: this.parseStmt(), line: t.line };
          }
          case "switch": {
            this.next(); this.expect("("); const e = this.parseExpr(); this.expect(")");
            const open = this.expect("{"); const items = [];
            while (!this.is("}")) {
              if (this.peek().t === "eof") throw new CError("syntax", "The switch block is never closed with }.", open.line);
              if (this.is("case")) { const ct = this.next(); const v = this.parseCond(); this.expect(":"); items.push({ label: "case", v, line: ct.line }); }
              else if (this.is("default")) { const dt = this.next(); this.expect(":"); items.push({ label: "default", line: dt.line }); }
              else items.push({ stmt: this.parseStmt() });
            }
            this.next();
            return { t: "switch", e, items, line: t.line };
          }
          case "break": this.next(); this.expect(";", "after break"); return { t: "break", line: t.line };
          case "continue": this.next(); this.expect(";", "after continue"); return { t: "continue", line: t.line };
          case "return": {
            this.next(); let e = null; if (!this.is(";")) e = this.parseExpr();
            this.expect(";", "after return"); return { t: "return", e, line: t.line };
          }
          case "else": this.fail("This else has no matching if.", t); break;
          case "case": case "default": this.fail("'" + t.v + "' can only be used inside a switch.", t); break;
          default: this.fail("'" + t.v + "' is not supported in this simulator.", t);
        }
      }
      const e = this.parseExpr();
      const semi = this.expect(";", "after the statement");
      return { t: "expr", e, line: e.line, s: e.s, en: semi.e };
    }

    // ------------- program
    isFunctionDef() {
      if (this.peek().t !== "type") return false;
      let k = 0; while (this.peek(k).t === "type") k++;
      while (this.peek(k).t === "op" && this.peek(k).v === "*") k++;
      if (this.peek(k).t !== "id" || !(this.peek(k + 1).t === "op" && this.peek(k + 1).v === "(")) return false;
      // find matching ")" then "{" or ";"
      let depth = 0, j = k + 1;
      for (; j < this.toks.length; j++) {
        const tk = this.toks[this.p + j]; if (!tk) return false;
        if (tk.t === "op" && tk.v === "(") depth++;
        else if (tk.t === "op" && tk.v === ")") { depth--; if (depth === 0) break; }
      }
      const after = this.toks[this.p + j + 1];
      return !!after && after.t === "op" && (after.v === "{" || after.v === ";");
    }
    parseFunction() {
      const ty = this.parseType();
      const nameTok = this.next();
      this.expect("(");
      const params = [];
      if (this.is("void") && this.is(")", 1)) this.next();
      else if (!this.is(")")) {
        do {
          const pt = this.parseType(); const pn = this.next();
          if (pn.t !== "id") this.fail("Expected a parameter name.", pn);
          let isArray = false;
          if (this.is("[")) {
            this.next();
            if (!this.is("]")) this.parseAssign(); // a size here is legal C but ignored: arrays decay to a reference
            this.expect("]");
            if (this.is("[")) this.fail("Multi-dimensional array parameters are not supported in this simulator.");
            isArray = true;
          }
          params.push({ ty: pt, name: pn.v, isArray });
        } while (this.accept(","));
      }
      this.expect(")");
      if (this.accept(";")) return { t: "proto", name: nameTok.v };
      const body = this.parseBlock();
      return { t: "func", name: nameTok.v, ret: ty, params, body, line: nameTok.line };
    }
    parseProgram() {
      const funcs = new Map(), globals = [], loose = [];
      let hasMain = false;
      while (this.peek().t !== "eof") {
        if (this.isFunctionDef()) {
          const f = this.parseFunction();
          if (f.t === "func") { funcs.set(f.name, f); if (f.name === "main") hasMain = true; }
        } else {
          const st = this.parseStmt();
          (st.t === "decl" ? globals : loose).push(st);
        }
      }
      return { funcs, globals, loose, hasMain };
    }
  }

  // ------------------------------------------------------------ formatting
  function pow10(n) { let r = 1n; for (let i = 0; i < n; i++) r *= 10n; return r; }
  // Exact decimal rendering of a double with round-half-to-even (like glibc/UCRT printf).
  function fmtFixed(x, prec) {
    if (Number.isNaN(x)) return "nan";
    if (!Number.isFinite(x)) return x < 0 ? "-inf" : "inf";
    const neg = x < 0 || Object.is(x, -0);
    x = Math.abs(x);
    const buf = new DataView(new ArrayBuffer(8)); buf.setFloat64(0, x);
    const hi = buf.getUint32(0), lo = buf.getUint32(4);
    const expBits = (hi >>> 20) & 0x7ff;
    let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
    let e2;
    if (expBits === 0) e2 = -1074; else { mant |= 1n << 52n; e2 = expBits - 1075; }
    let q;
    if (e2 >= 0) q = (mant << BigInt(e2)) * pow10(prec);
    else {
      const num = mant * pow10(prec), den = 1n << BigInt(-e2);
      q = num / den; const r = num % den, twice = r * 2n;
      if (twice > den || (twice === den && (q & 1n) === 1n)) q += 1n;
    }
    let s = q.toString();
    if (prec > 0) { s = s.padStart(prec + 1, "0"); s = s.slice(0, s.length - prec) + "." + s.slice(s.length - prec); }
    return (neg ? "-" : "") + s;
  }

  function formatPrintf(fmt, args, line, readStr) {
    let out = "", ai = 0;
    for (let i = 0; i < fmt.length; i++) {
      const c = fmt[i];
      if (c !== "%") { out += c; continue; }
      i++;
      if (fmt[i] === "%") { out += "%"; continue; }
      let flags = ""; while ("-+ #0".includes(fmt[i]) && fmt[i]) flags += fmt[i++];
      let width = ""; if (fmt[i] === "*") throw new CError("unsupported", "A * width in printf is not supported in this simulator.", line);
      while (/\d/.test(fmt[i] || "")) width += fmt[i++];
      let prec = null;
      if (fmt[i] === ".") { i++; let p = ""; while (/\d/.test(fmt[i] || "")) p += fmt[i++]; prec = p === "" ? 0 : parseInt(p, 10); }
      let len = ""; while ("hlLzjt".includes(fmt[i]) && fmt[i]) len += fmt[i++];
      const conv = fmt[i];
      if (conv === undefined) throw new CError("runtime", "The printf format ends with a lone %.", line);
      if (len && !/^(l|h|hh)$/.test(len) && !(len === "l" && conv === "f")) throw new CError("unsupported", "The length modifier '" + len + "' is not supported in this simulator.", line);
      if (ai >= args.length) throw new CError("ub", "printf has more format specifiers than arguments. Real C would print unpredictable values here (undefined behavior).", line);
      const a = args[ai++];
      let body;
      const isIntT = a.t === "int", isFl = a.t === "float" || a.t === "double";
      switch (conv) {
        case "d": case "i": {
          if (!isIntT) throw new CError("ub", "%" + conv + " expects an int, but the value is " + describeType(a) + ". Real C would print unpredictable output (undefined behavior).", line);
          let v = a.v; const neg = v < 0; let digits = String(Math.abs(v));
          if (prec !== null) digits = digits.padStart(prec, "0");
          const sign = neg ? "-" : flags.includes("+") ? "+" : flags.includes(" ") ? " " : "";
          body = sign + digits;
          if (width && flags.includes("0") && !flags.includes("-") && prec === null) body = sign + digits.padStart(parseInt(width, 10) - sign.length, "0");
          break;
        }
        case "u": {
          if (!isIntT) throw new CError("ub", "%u expects an unsigned int, but the value is " + describeType(a) + ".", line);
          body = String(a.v >>> 0); break;
        }
        case "x": case "X": case "o": {
          if (!isIntT) throw new CError("ub", "%" + conv + " expects an int, but the value is " + describeType(a) + ".", line);
          const u = a.v >>> 0; body = conv === "o" ? u.toString(8) : u.toString(16);
          if (conv === "X") body = body.toUpperCase();
          if (flags.includes("#") && u !== 0) body = (conv === "o" ? "0" : conv === "x" ? "0x" : "0X") + body;
          if (prec !== null) body = body.padStart(prec, "0");
          break;
        }
        case "c": {
          if (!isIntT) throw new CError("ub", "%c expects a character, but the value is " + describeType(a) + ".", line);
          body = String.fromCharCode(a.v & 255); break;
        }
        case "s": {
          if (a.t !== "str" && a.t !== "arr") throw new CError("ub", "%s expects a string, but the value is " + describeType(a) + ". Real C would crash or print garbage (undefined behavior).", line);
          let s = readStr(a);
          if (prec !== null) s = s.slice(0, prec);
          body = s; break;
        }
        case "f": case "F": {
          if (!isFl) throw new CError("ub", "%f expects a float or double, but the value is " + describeType(a) + ". Real C would print unpredictable output (undefined behavior).", line);
          const p = prec === null ? 6 : prec;
          let s = fmtFixed(a.v, p);
          if (flags.includes("+") && !s.startsWith("-")) s = "+" + s; else if (flags.includes(" ") && !s.startsWith("-")) s = " " + s;
          body = s;
          if (width && flags.includes("0") && !flags.includes("-") && Number.isFinite(a.v)) {
            const sign = /^[+\- ]/.test(body) ? body[0] : ""; body = sign + body.slice(sign.length).padStart(parseInt(width, 10) - sign.length, "0");
          }
          break;
        }
        default:
          throw new CError("unsupported", "The printf conversion %" + conv + " is not supported in this simulator.", line);
      }
      const w = width ? parseInt(width, 10) : 0;
      if (body.length < w) body = flags.includes("-") ? body.padEnd(w, " ") : body.padStart(w, " ");
      out += body;
    }
    if (ai < args.length) { /* extra args are ignored by C; not an error */ }
    return out;
  }

  function describeType(a) {
    if (a.t === "double") return "a double";
    if (a.t === "float") return "a float";
    if (a.t === "int") return "an int";
    if (a.t === "str") return "a string";
    if (a.t === "arr") return "an array";
    return "another kind of value";
  }

  // ------------------------------------------------------------- runtime
  const HEADERS_FOR = {
    printf: "stdio.h", scanf: "stdio.h", fgets: "stdio.h", puts: "stdio.h", putchar: "stdio.h", getchar: "stdio.h", stdin: "stdio.h",
    strlen: "string.h", strcspn: "string.h", strcmp: "string.h", strcpy: "string.h", strcat: "string.h", strchr: "string.h",
    sqrt: "math.h", pow: "math.h", fabs: "math.h", abs: "stdlib.h", exit: "stdlib.h",
  };

  class Reader {
    constructor(s) { this.s = s || ""; this.p = 0; }
    eof() { return this.p >= this.s.length; }
    peek() { return this.s[this.p]; }
    next() { return this.s[this.p++]; }
  }

  function typeSize(base, ptr) { if (ptr) return 8; return base === "double" ? 8 : base === "char" || base === "bool" ? 1 : base === "void" ? 1 : 4; }

  function run(source, opts) {
    opts = opts || {};
    const limits = Object.assign({ steps: 3000000, output: 20000, ms: 2000, trace: 2500, depth: 200 }, opts.limits || {});
    const t0 = Date.now();
    let callDepth = 0;   // user-function calls running right now (the scope stack is reset for every call, so its length cannot be used)
    const result = { ok: true, stdout: "", error: null, trace: opts.trace ? [] : null, steps: 0, exitCode: 0, truncated: false };
    let out = "";
    let steps = 0;
    const rd = new Reader(opts.input);
    let program;
    try {
      const { toks, includes } = lex(String(source));
      const parser = new Parser(toks, String(source));
      program = parser.parseProgram();
      program.includes = new Set(includes);
    } catch (e) {
      if (e instanceof CError) { result.ok = false; result.error = { kind: e.kind, message: e.message, line: e.line }; return result; }
      throw e;
    }
    const src = String(source);
    const snippet = !program.hasMain;
    if (snippet) for (const h of ["stdio.h", "stdbool.h", "string.h", "math.h", "stdlib.h"]) program.includes.add(h);
    const needHeader = (name, line) => { const h = HEADERS_FOR[name]; if (h && !program.includes.has(h)) throw new CError("syntax", "'" + name + "' is used but <" + h + "> is not included. Add #include <" + h + "> at the top.", line); };

    // ---- environment
    const globalScope = new Map();
    let scope = globalScope;
    const scopes = [globalScope];
    const pushScope = () => { scope = new Map(); scopes.push(scope); };
    const popScope = () => { scopes.pop(); scope = scopes[scopes.length - 1]; };
    const lookup = (name, line) => {
      for (let i = scopes.length - 1; i >= 0; i--) { const c = scopes[i].get(name); if (c) return c; }
      throw new CError("syntax", "'" + name + "' is not declared. Declare it first, for example: int " + name + ";", line);
    };
    const tick = (line) => {
      if (++steps > limits.steps) throw new CError("limit", "The program ran for more than " + limits.steps.toLocaleString("en-US") + " steps. It looks like an infinite loop, so the simulator stopped it.", line);
      if ((steps & 1023) === 0 && Date.now() - t0 > limits.ms) throw new CError("limit", "The program took too long to run, so the simulator stopped it. Check the loop condition.", line);
    };
    const emit = (s, line) => {
      out += s;
      if (out.length > limits.output) throw new CError("limit", "The program printed more than " + limits.output.toLocaleString("en-US") + " characters, so the simulator stopped it.", line);
    };

    // ---- values
    const V = (t, v) => ({ t, v });
    const readStr = (a) => {
      if (a.t === "str") return a.v;
      const arr = a.v.a; let s = "";
      for (let i = 0; i < arr.length; i++) { const c = arr[i]; if (c === UNINIT) throw new CError("ub", "The string uses characters that were never set (undefined behavior).", 0); if (c === 0) break; s += String.fromCharCode(c & 255); }
      return s;
    };
    const truthy = (a) => (a.t === "str" ? true : a.t === "arr" ? true : a.v !== 0);
    const toInt32 = (x) => { if (!Number.isFinite(x) || x >= 2147483648 || x < INT_MIN) return INT_MIN; return Math.trunc(x) | 0; };
    const convertTo = (a, base, line) => {
      if (base === "void") return a;
      if (a.t === "str" || a.t === "arr" || a.t === "ref") throw new CError("runtime", "A string or address cannot be stored in a number variable.", line);
      const x = a.v;
      switch (base) {
        case "int": return V("int", a.t === "int" ? x : toInt32(x));
        case "char": { const i = a.t === "int" ? x : toInt32(x); return V("int", ((i & 255) << 24) >> 24); }
        case "bool": return V("int", x !== 0 ? 1 : 0);
        case "float": return V("float", Math.fround(x));
        case "double": return V("double", +x);
      }
      throw new CError("runtime", "Unknown type " + base, line);
    };
    const storeConv = (a, cell, line) => {
      const ty = cell.ty;
      if (ty.ptr) {
        if (ty.base === "char" && (a.t === "str" || a.t === "arr")) return a.t === "arr" ? V("str", readStr(a)) : a;
        if (a.t === "int" && a.v === 0) return V("str", null);
        throw new CError("unsupported", "Pointers are only supported as char * strings in this simulator.", line);
      }
      return convertTo(a, ty.base, line);
    };
    const rank = (t) => (t === "double" ? 3 : t === "float" ? 2 : 1);

    // ---- trace
    const traceOn = !!opts.trace;
    const showVal = (cell) => {
      const v = cell.val;
      if (v === UNINIT) return "?";
      if (cell.arr) {
        const a = v.a; const dims = cell.dims || [a.length];
        if (cell.ty.base === "char" && dims.length === 1) { let s = ""; for (let i = 0; i < a.length; i++) { if (a[i] === UNINIT) { s += "?"; continue; } if (a[i] === 0) { s += "\\0"; break; } s += String.fromCharCode(a[i] & 255).replace("\n", "\\n"); } return '"' + s + '"'; }
        const render = (offset, dimIdx) => {
          const stride = dims.slice(dimIdx + 1).reduce((x, y) => x * y, 1);
          const parts = [];
          for (let k = 0; k < dims[dimIdx]; k++) parts.push(dimIdx === dims.length - 1 ? (a[offset + k] === UNINIT ? "?" : a[offset + k]) : render(offset + k * stride, dimIdx + 1));
          return "[" + parts.join(", ") + "]";
        };
        return render(0, 0);
      }
      if (v && v.t === "str") return v.v === null ? "NULL" : '"' + v.v.replace(/\n/g, "\\n") + '"';
      if (cell.ty.base === "char") return "'" + (v === 10 ? "\\n" : v === 0 ? "\\0" : String.fromCharCode(v & 255)) + "' (" + v + ")";
      if (cell.ty.base === "bool") return v ? "true (1)" : "false (0)";
      if (cell.ty.base === "float") return String(+v.toPrecision(9));
      if (cell.ty.base === "double") return Number.isInteger(v) ? String(v) : String(+v.toPrecision(15));
      return String(v);
    };
    const snapshot = () => {
      const seen = new Map();
      for (let i = 0; i < scopes.length; i++) for (const [name, cell] of scopes[i]) { if (cell.hidden) continue; seen.delete(name); seen.set(name, { name, type: (cell.ty.base + (cell.ty.ptr ? " *" : "") + (cell.arr ? (cell.dims || [cell.val.a.length]).map((d) => "[" + d + "]").join("") : "")), value: showVal(cell), scope: i }); }
      return [...seen.values()];
    };
    const rec = (kind, node, extra) => {
      if (!traceOn) return;
      if (result.trace.length >= limits.trace) { result.truncated = true; return; }
      result.trace.push(Object.assign({ n: result.trace.length, kind, line: node ? node.line : 0, text: node && node.s !== undefined && node.en !== undefined ? src.slice(node.s, node.en).trim() : "", vars: snapshot(), outLen: out.length }, extra || {}));
    };

    // ---- expression evaluation
    const builtins = {
      printf(args, line) {
        if (!args.length || args[0].t !== "str") throw new CError("runtime", "printf needs a format string in double quotes as its first argument.", line);
        const s = formatPrintf(args[0].v, args.slice(1), line, readStr);
        emit(s, line); return V("int", s.length);
      },
      puts(args, line) { const s = readStr(args[0]) + "\n"; emit(s, line); return V("int", s.length); },
      putchar(args, line) { emit(String.fromCharCode(args[0].v & 255), line); return V("int", args[0].v); },
      getchar() { return V("int", rd.eof() ? -1 : rd.next().charCodeAt(0)); },
      strlen(args) { return V("int", readStr(args[0]).length); },
      strcmp(args) { const a = readStr(args[0]), b = readStr(args[1]); return V("int", a === b ? 0 : a < b ? -1 : 1); },
      strcspn(args) { const s = readStr(args[0]), set = readStr(args[1]); let i = 0; while (i < s.length && !set.includes(s[i])) i++; return V("int", i); },
      strcpy(args, line) {
        if (args[0].t !== "arr") throw new CError("unsupported", "strcpy needs a char array as its destination.", line);
        const s = readStr(args[1]); const a = args[0].v.a;
        if (s.length + 1 > a.length) throw new CError("ub", "strcpy would write past the end of the array (undefined behavior).", line);
        for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); a[s.length] = 0; return args[0];
      },
      strcat(args, line) {
        if (args[0].t !== "arr") throw new CError("unsupported", "strcat needs a char array as its destination.", line);
        const a = args[0].v.a, s = readStr(args[0]) + readStr(args[1]);
        if (s.length + 1 > a.length) throw new CError("ub", "strcat would write past the end of the array (undefined behavior): the joined text needs " + (s.length + 1) + " slots but the array has " + a.length + ".", line);
        for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); a[s.length] = 0; return args[0];
      },
      strchr(args) {
        const s = readStr(args[0]), c = args[1].v & 255;
        if (c === 0) return V("str", "");
        const at = s.indexOf(String.fromCharCode(c));
        return V("str", at < 0 ? null : s.slice(at));
      },
      fgets(args, line) {
        if (args[0].t !== "arr") throw new CError("unsupported", "fgets needs a char array as its first argument.", line);
        const a = args[0].v.a, n = args[1].v;
        if (n > a.length) throw new CError("ub", "fgets was told to read " + n + " characters into an array of size " + a.length + " (undefined behavior).", line);
        if (n <= 0) return V("int", 0);
        if (rd.eof()) return V("int", 0);
        let i = 0;
        while (i < n - 1 && !rd.eof()) { const ch = rd.next(); a[i++] = ch.charCodeAt(0); if (ch === "\n") break; }
        a[i] = 0; return args[0];
      },
      scanf(args, line) {
        if (!args.length || args[0].t !== "str") throw new CError("runtime", "scanf needs a format string in double quotes as its first argument.", line);
        return V("int", doScanf(args[0].v, args.slice(1), line));
      },
      sqrt(args) { return V("double", Math.sqrt(args[0].v)); },
      pow(args) { return V("double", Math.pow(args[0].v, args[1].v)); },
      fabs(args) { return V("double", Math.abs(args[0].v)); },
      abs(args) { return V("int", Math.abs(args[0].v) | 0); },
      exit(args) { throw { exit: args[0] ? args[0].v : 0 }; },
    };

    function doScanf(fmt, targets, line) {
      let count = 0, ti = 0;
      const isWs = (c) => c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f" || c === "\v";
      for (let i = 0; i < fmt.length;) {
        const c = fmt[i];
        if (isWs(c)) { while (!rd.eof() && isWs(rd.peek())) rd.next(); i++; continue; }
        if (c !== "%") { if (rd.eof()) return count === 0 ? -1 : count; if (rd.peek() !== c) return count; rd.next(); i++; continue; }
        i++;
        let width = ""; while (/\d/.test(fmt[i] || "")) width += fmt[i++];
        let len = ""; while ("hlL".includes(fmt[i]) && fmt[i]) len += fmt[i++];
        const conv = fmt[i++];
        if (conv === "%") { while (!rd.eof() && isWs(rd.peek())) rd.next(); if (rd.peek() !== "%") return count; rd.next(); continue; }
        const target = targets[ti++];
        if (!target || (target.t !== "ref" && target.t !== "arr")) throw new CError("ub", "scanf needs the address of a variable (write &name) for each %-conversion. Without the &, real C would write to a random place in memory (undefined behavior).", line);
        const cell = target.cell, ty = cell.ty;
        const wmax = width ? parseInt(width, 10) : Infinity;
        if (conv !== "c") { while (!rd.eof() && isWs(rd.peek())) rd.next(); }
        if (rd.eof()) return count === 0 ? -1 : count;
        if (conv === "d" || conv === "i") {
          if (target.t !== "ref" || ty.base !== "int" || ty.ptr) throw new CError("ub", "%" + conv + " must be given the address of an int variable. Real C would misbehave (undefined behavior).", line);
          let s = ""; if (rd.peek() === "+" || rd.peek() === "-") s += rd.next();
          let nd = 0; while (!rd.eof() && /\d/.test(rd.peek()) && s.length < wmax) { s += rd.next(); nd++; }
          if (!nd) return count;
          cell.val = V("int", toInt32(parseInt(s, 10))).v; count++;
        } else if (conv === "f" || conv === "e" || conv === "g") {
          const wantDouble = len === "l";
          if (target.t !== "ref" || (wantDouble ? ty.base !== "double" : ty.base !== "float") || ty.ptr) throw new CError("ub", "scanf must use %f for a float variable and %lf for a double variable. Mixing them up is undefined behavior in real C.", line);
          const m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rd.s.slice(rd.p));
          if (!m) return count;
          rd.p += m[0].length; const v = parseFloat(m[0]);
          cell.val = wantDouble ? v : Math.fround(v); count++;
        } else if (conv === "c") {
          if (target.t !== "ref" || (ty.base !== "char" && ty.base !== "int")) throw new CError("ub", "%c must be given the address of a char variable.", line);
          const ch = rd.next().charCodeAt(0); cell.val = ty.base === "char" ? ((ch & 255) << 24) >> 24 : ch; count++;
        } else if (conv === "s") {
          if (target.t !== "arr" || ty.base !== "char") throw new CError("ub", "%s must be given a char array to fill.", line);
          let s = ""; while (!rd.eof() && !isWs(rd.peek()) && s.length < wmax) s += rd.next();
          const a = cell.val.a;
          if (s.length + 1 > a.length) throw new CError("ub", "The word \"" + s + "\" needs " + (s.length + 1) + " slots (including the end marker) but the array has only " + a.length + ". Real C would write past the array (undefined behavior). Use a width like %" + (a.length - 1) + "s.", line);
          for (let k = 0; k < s.length; k++) a[k] = s.charCodeAt(k); a[s.length] = 0; count++;
        } else throw new CError("unsupported", "The scanf conversion %" + conv + " is not supported in this simulator.", line);
      }
      return count;
    }

    const readCell = (cell, name, line) => {
      if (cell.val === UNINIT) throw new CError("ub", "The variable '" + name + "' is used before it was given a value. Real C would use a random leftover value (undefined behavior).", line);
      return cell;
    };

    // node is a chain of `index` nodes ending in an `id` (matrix[i][j] parses as
    // index(index(id(matrix), i), j)). Walk down to the base variable, then require exactly
    // as many [ ] as it has dimensions (no partial indexing - a[i] on a 2D array is a row
    // pointer in real C, which this simulator does not model) and fold them into one flat
    // offset, since a cell's storage is always a single flat array.
    const getElement = (node, forWrite) => {
      const indices = [];
      let cur = node;
      while (cur.t === "index") { indices.unshift(cur.i); cur = cur.e; }
      if (cur.t !== "id") throw new CError("runtime", "Only an array variable can be indexed.", node.line);
      const cell = lookup(cur.name, node.line);
      if (!cell.arr) throw new CError("runtime", "'" + cur.name + "' is not an array.", node.line);
      const dims = cell.dims;
      if (indices.length !== dims.length) throw new CError("unsupported", "'" + cur.name + "' has " + dims.length + " dimension(s); index it with " + cur.name + dims.map(() => "[i]").join("") + ".", node.line);
      let offset = 0;
      for (let d = 0; d < dims.length; d++) {
        const iv = evalE(indices[d]);
        if (iv.t !== "int") throw new CError("runtime", "An array index must be a whole number.", node.line);
        if (iv.v < 0 || iv.v >= dims[d]) throw new CError("ub", "Index " + iv.v + " is outside " + (dims.length > 1 ? "dimension " + (d + 1) + " of " : "") + "'" + cur.name + "' (valid indexes are 0 to " + (dims[d] - 1) + "). Real C would read or write outside the array (undefined behavior).", node.line);
        offset = offset * dims[d] + iv.v;
      }
      return { cell, arrIdx: offset, a: cell.val.a };
    };

    const arith = (op, l, r, line) => {
      const rk = Math.max(rank(l.t), rank(r.t));
      if (l.t === "str" || r.t === "str" || l.t === "arr" || r.t === "arr") throw new CError("runtime", "Operator " + op + " cannot be used with strings.", line);
      if (rk === 1) { // int
        const a = l.v, b = r.v;
        switch (op) {
          case "+": return V("int", (a + b) | 0);
          case "-": return V("int", (a - b) | 0);
          case "*": return V("int", Math.imul(a, b));
          case "/": if (b === 0) throw new CError("runtime", "Division by zero. A real program would crash here.", line); return V("int", (Math.trunc(a / b)) | 0);
          case "%": if (b === 0) throw new CError("runtime", "Remainder by zero. A real program would crash here.", line); return V("int", (a % b) | 0);
          case "&": return V("int", a & b);
          case "|": return V("int", a | b);
          case "^": return V("int", a ^ b);
          case "<<": if (b < 0 || b >= 32) throw new CError("ub", "Shifting by " + b + " bits is undefined behavior for a 32-bit int.", line); return V("int", a << b);
          case ">>": if (b < 0 || b >= 32) throw new CError("ub", "Shifting by " + b + " bits is undefined behavior for a 32-bit int.", line); return V("int", a >> b);
        }
      } else {
        if (op === "%" || op === "&" || op === "|" || op === "^" || op === "<<" || op === ">>") throw new CError("syntax", "Operator " + op + " needs whole numbers (int), but one side is a " + (rk === 3 ? "double" : "float") + ".", line);
        const t = rk === 3 ? "double" : "float"; let x;
        switch (op) { case "+": x = l.v + r.v; break; case "-": x = l.v - r.v; break; case "*": x = l.v * r.v; break; case "/": x = l.v / r.v; break; }
        return V(t, t === "float" ? Math.fround(x) : x);
      }
      throw new CError("runtime", "Unsupported operator " + op, line);
    };

    const staticType = (n) => {
      switch (n.t) {
        case "num": return n.ty;
        case "str": return "str";
        case "id": { const c = lookup(n.name, n.line); return c.arr ? "arr" : c.ty.ptr ? "str" : (c.ty.base === "float" || c.ty.base === "double") ? c.ty.base : "int"; }
        case "index": { let cur = n; while (cur.t === "index") cur = cur.e; const c = lookup(cur.name, n.line); return (c.ty.base === "float" || c.ty.base === "double") ? c.ty.base : "int"; }
        case "cast": return (n.ty.base === "float" || n.ty.base === "double") ? n.ty.base : "int";
        case "bin": { if (["<", "<=", ">", ">=", "==", "!=", "&&", "||"].includes(n.op)) return "int"; if (n.op === "<<" || n.op === ">>") return "int"; const a = staticType(n.l), b = staticType(n.r); const k = Math.max(rank(a), rank(b)); return k === 3 ? "double" : k === 2 ? "float" : "int"; }
        case "un": return n.op === "!" ? "int" : staticType(n.e);
        case "cond": { const a = staticType(n.a), b = staticType(n.b); if (a === "str" || b === "str") return "str"; const k = Math.max(rank(a), rank(b)); return k === 3 ? "double" : k === 2 ? "float" : "int"; }
        case "call": { const f = program.funcs.get(n.name); if (f) return (f.ret.base === "float" || f.ret.base === "double") ? f.ret.base : "int"; return (n.name === "sqrt" || n.name === "pow" || n.name === "fabs") ? "double" : "int"; }
        case "assign": case "pre": case "post": return staticType(n.l || n.e);
        default: return "int";
      }
    };

    const applyIncDec = (node, op) => {
      const target = node.e;
      let cell, get, set;
      if (target.t === "id") {
        cell = lookup(target.name, node.line);
        if (cell.arr) throw new CError("runtime", "You cannot use ++ or -- on a whole array.", node.line);
        readCell(cell, target.name, node.line);
        get = () => cell.val; set = (nv) => { cell.val = nv; };
      } else {
        const el = getElement(target, true); cell = el.cell;
        if (el.a[el.arrIdx] === UNINIT) throw new CError("ub", "An array element is used before it was set (undefined behavior).", node.line);
        get = () => el.a[el.arrIdx]; set = (nv) => { el.a[el.arrIdx] = nv; };
      }
      const cur = get();
      const isF = cell.ty.base === "float" || cell.ty.base === "double";
      const oldV = V(isF ? cell.ty.base : "int", cur);
      const nv = convertTo(arith(op === "++" ? "+" : "-", oldV, V("int", 1), node.line), cell.ty.base, node.line);
      set(nv.v);
      return { old: oldV, nu: V(nv.t, nv.v) };
    };

    function evalE(n) {
      tick(n.line);
      switch (n.t) {
        case "num": return V(n.ty, n.v);
        case "str": return V("str", n.v);
        case "id": {
          if (n.name === "true") return V("int", 1);
          if (n.name === "false") return V("int", 0);
          if (n.name === "NULL") return V("int", 0);
          if (n.name === "stdin") { needHeader("stdin", n.line); return V("int", 0); }
          if (n.name === "true" || n.name === "false") { if (!program.includes.has("stdbool.h")) throw new CError("syntax", "'" + n.name + "' needs #include <stdbool.h>.", n.line); }
          const cell = lookup(n.name, n.line);
          if (cell.arr) return { t: "arr", v: cell.val, cell };
          readCell(cell, n.name, n.line);
          if (cell.ty.ptr) return cell.val;
          return V(cell.ty.base === "float" || cell.ty.base === "double" ? cell.ty.base : "int", cell.val);
        }
        case "index": {
          const el = getElement(n, false);
          const v = el.a[el.arrIdx];
          if (v === UNINIT) throw new CError("ub", "The array element " + n.e.name + "[" + el.arrIdx + "] is used before it was set (undefined behavior).", n.line);
          return V(el.cell.ty.base === "float" || el.cell.ty.base === "double" ? el.cell.ty.base : "int", v);
        }
        case "addr": {
          if (n.e.t === "id") { const cell = lookup(n.e.name, n.line); return { t: "ref", cell }; }
          if (n.e.t === "index") { const el = getElement(n.e, true); return { t: "ref", cell: { ty: el.cell.ty, get val() { return el.a[el.arrIdx]; }, set val(x) { el.a[el.arrIdx] = x; } } }; }
          throw new CError("unsupported", "& can only be applied to a variable in this simulator.", n.line);
        }
        case "un": {
          const v = evalE(n.e);
          if (v.t === "str" || v.t === "arr") { if (n.op === "!") return V("int", 0); throw new CError("runtime", "Operator " + n.op + " cannot be used with a string.", n.line); }
          switch (n.op) {
            case "-": return v.t === "int" ? V("int", (-v.v) | 0) : V(v.t, -v.v);
            case "+": return v;
            case "!": return V("int", v.v === 0 ? 1 : 0);
            case "~": if (v.t !== "int") throw new CError("syntax", "Operator ~ needs a whole number (int).", n.line); return V("int", ~v.v);
          }
          break;
        }
        case "bin": {
          if (n.op === "&&") { const l = evalE(n.l); if (!truthy(l)) return V("int", 0); return V("int", truthy(evalE(n.r)) ? 1 : 0); }
          if (n.op === "||") { const l = evalE(n.l); if (truthy(l)) return V("int", 1); return V("int", truthy(evalE(n.r)) ? 1 : 0); }
          const l = evalE(n.l), r = evalE(n.r);
          if (["<", "<=", ">", ">=", "==", "!="].includes(n.op)) {
            if ((n.op === "==" || n.op === "!=") && ((l.t === "str" && r.t === "int" && r.v === 0) || (r.t === "str" && l.t === "int" && l.v === 0))) {
              const isNull = (l.t === "str" ? l.v : r.v) === null; // comparing a char * with NULL (what strchr returns when it finds nothing)
              return V("int", (n.op === "==") === isNull ? 1 : 0);
            }
            if (l.t === "str" || r.t === "str" || l.t === "arr" || r.t === "arr") throw new CError("unsupported", "Comparing strings with " + n.op + " compares addresses in real C. Use strcmp instead.", n.line);
            let a = l.v, b = r.v, res;
            switch (n.op) { case "<": res = a < b; break; case "<=": res = a <= b; break; case ">": res = a > b; break; case ">=": res = a >= b; break; case "==": res = a === b; break; case "!=": res = a !== b; break; }
            return V("int", res ? 1 : 0);
          }
          return arith(n.op, l, r, n.line);
        }
        case "cond": {
          const c = evalE(n.c);
          const chosen = truthy(c) ? n.a : n.b;
          const st = staticType(chosen === n.a ? n.b : n.a), me = staticType(chosen);
          const v = evalE(chosen);
          if (v.t === "str" || v.t === "arr") return v;
          const k = Math.max(rank(me), rank(st));
          return k === 3 ? V("double", v.v) : k === 2 ? V("float", Math.fround(v.v)) : v;
        }
        case "cast": {
          const v = evalE(n.e);
          if (n.ty.ptr) throw new CError("unsupported", "Pointer casts are not supported in this simulator.", n.line);
          return convertTo(v, n.ty.base, n.line);
        }
        case "sizeofT": return V("int", typeSize(n.ty.base, n.ty.ptr));
        case "sizeofE": {
          if (n.e.t === "id") { const c = lookup(n.e.name, n.line); if (c.arr) return V("int", c.val.a.length * typeSize(c.ty.base, 0)); return V("int", typeSize(c.ty.base, c.ty.ptr)); }
          const st = staticType(n.e); return V("int", st === "double" ? 8 : st === "str" ? 8 : 4);
        }
        case "comma": evalE(n.l); return evalE(n.r);
        case "pre": { const r = applyIncDec(n, n.op); return r.nu; }
        case "post": { const r = applyIncDec(n, n.op); return r.old; }
        case "assign": return doAssign(n);
        case "call": return doCall(n);
        default: throw new CError("runtime", "Cannot evaluate this expression (" + n.t + ").", n.line);
      }
      throw new CError("runtime", "Cannot evaluate this expression.", n.line);
    }

    function doAssign(n) {
      const isId = n.l.t === "id";
      let cell, el = null;
      if (isId) {
        cell = lookup(n.l.name, n.line);
        if (cell.arr) throw new CError("unsupported", "You cannot assign to a whole array. Use strcpy for strings.", n.line);
        if (cell.ty.isConst) throw new CError("syntax", "Cannot assign to '" + n.l.name + "' because it was declared const (read-only).", n.line);
      } else { el = getElement(n.l, true); cell = el.cell; if (cell.ty.isConst) throw new CError("syntax", "Cannot assign to a const array element.", n.line); }
      const setv = (x) => { if (isId) cell.val = x; else el.a[el.arrIdx] = x; };
      const cur = () => (isId ? cell.val : el.a[el.arrIdx]);
      const base = cell.ty.base, isF = (base === "float" || base === "double") && !cell.ty.ptr;
      if (n.op === "=") {
        const rv = evalE(n.r);
        const conv = isId && cell.ty.ptr ? storeConv(rv, cell, n.line) : convertTo(rv, base, n.line);
        setv(isId && cell.ty.ptr ? conv : conv.v);
        return isId && cell.ty.ptr ? conv : V(isF ? base : "int", conv.v);
      }
      const opc = n.op.slice(0, -1);
      if (cur() === UNINIT) throw new CError("ub", "The variable is used in " + n.op + " before it was given a value (undefined behavior).", n.line);
      const lv = V(isF ? base : "int", cur());
      const rv = evalE(n.r);
      const res = convertTo(arith(opc, lv, rv, n.line), base, n.line);
      setv(res.v);
      return V(isF ? base : "int", res.v);
    }

    function doCall(n) {
      const f = program.funcs.get(n.name);
      if (f) {
        if (f.params.length !== n.args.length) throw new CError("syntax", "'" + n.name + "' expects " + f.params.length + " argument(s) but got " + n.args.length + ".", n.line);
        if (callDepth >= limits.depth) throw new CError("limit", "Too many nested function calls (possible endless recursion).", n.line);
        const argv = n.args.map((a) => evalE(a));
        const saved = scopes.slice(), savedScope = scope;
        scopes.length = 1; scope = globalScope; pushScope();
        f.params.forEach((p, i) => {
          if (p.isArray && argv[i].t === "str" && argv[i].v !== null && p.ty.base === "char") {
            // A string literal passed for a char name[] parameter (greet("Arun")): in real C the literal decays to a
            // pointer to its characters, so the function sees them, followed by the end marker.
            const s = argv[i].v, a = new Array(s.length + 1).fill(0);
            for (let k = 0; k < s.length; k++) a[k] = s.charCodeAt(k);
            scope.set(p.name, { ty: p.ty, arr: true, dims: [a.length], val: { a } });
          } else if (p.isArray) {
            if (argv[i].t !== "arr") throw new CError("runtime", "'" + n.name + "' expects an array for its '" + p.name + "' parameter.", n.line);
            // A real C array parameter decays to a pointer: the callee shares the caller's
            // storage (`.val` is the same {a:[...]} object), so writes are visible after the call.
            scope.set(p.name, { ty: p.ty, arr: true, dims: argv[i].cell.dims, val: argv[i].v });
          } else {
            scope.set(p.name, { ty: p.ty, arr: false, val: p.ty.ptr ? (argv[i].t === "arr" ? V("str", readStr(argv[i])) : argv[i]) : convertTo(argv[i], p.ty.base, n.line).v });
          }
        });
        rec("call", n, { note: "Call " + n.name + "(" + n.args.map((a) => src.slice(a.s, a.en)).join(", ") + ")" });
        let sig; callDepth++; try { sig = execBlockBody(f.body.body); } finally { callDepth--; }
        scopes.length = 0; saved.forEach((s) => scopes.push(s)); scope = savedScope;
        const rv = sig && sig.t === "return" ? sig.v : null;
        rec("return", n, { note: "Return from " + n.name + (rv ? " with " + rv.v : "") });
        if (f.ret.base === "void" && !f.ret.ptr) return V("int", 0);
        if (!rv) throw new CError("ub", "Function '" + n.name + "' did not return a value (undefined behavior).", n.line);
        return f.ret.ptr ? rv : convertTo(rv, f.ret.base, n.line);
      }
      if (!Object.prototype.hasOwnProperty.call(builtins, n.name)) throw new CError("syntax", "'" + n.name + "' is not a known function here. Declare or define it first.", n.line);
      needHeader(n.name, n.line);
      const args = n.args.map((a) => evalE(a));
      return builtins[n.name](args, n.line);
    }

    // ---- statements
    // Fills a flat array from a (possibly nested) initializer list, C-style: missing trailing
    // values default to 0 (a real, taught behaviour - see Array3's partial-initialization
    // slide), and one { } level is required per dimension beyond the last.
    const buildArrayFromInit = (dims, initNode, base, line) => {
      const total = dims.reduce((a, b) => a * b, 1);
      const flat = new Array(total).fill(0);
      const fillDim = (items, dimIdx, offsetBase) => {
        if (items.length > dims[dimIdx]) throw new CError("syntax", "Too many initial values for the array.", line);
        const stride = dims.slice(dimIdx + 1).reduce((a, b) => a * b, 1);
        items.forEach((it, idx) => {
          if (dimIdx === dims.length - 1) {
            if (it.t === "list") throw new CError("syntax", "This array does not have another dimension for a nested { }.", line);
            flat[offsetBase + idx] = convertTo(evalE(it), base, line).v;
          } else {
            if (it.t !== "list") throw new CError("syntax", "Expected a nested { } here: this array has more than one dimension.", line);
            fillDim(it.items, dimIdx + 1, offsetBase + idx * stride);
          }
        });
      };
      fillDim(initNode.items, 0, 0);
      return flat;
    };
    const declare = (d) => {
      const ty = d.ty;
      if (ty.unsupported) throw new CError("unsupported", "The type '" + ty.unsupported + "' is not supported in this simulator yet (use int, char, float, double or bool).", d.line);
      if (ty.base === "bool" && !program.includes.has("stdbool.h")) throw new CError("syntax", "Unknown type 'bool'. Add #include <stdbool.h> to use bool, true and false.", d.line);
      if (ty.base === "void" && !ty.ptr) throw new CError("syntax", "A variable cannot have the type void.", d.line);
      for (const it of d.items) {
        tick(it.line);
        const cty = { base: ty.base, isConst: ty.isConst, ptr: it.ptr };
        const cell = { ty: cty, arr: false, val: UNINIT };
        if (it.hasBrackets) {
          if (it.ptr) throw new CError("unsupported", "Arrays of pointers are not supported in this simulator.", it.line);
          cell.arr = true;
          const dims = it.dims.map((d) => {
            if (d == null) return null;
            const dv = evalE(d);
            if (dv.t !== "int" || dv.v <= 0) throw new CError("syntax", "An array size must be a positive whole number.", it.line);
            return dv.v;
          });
          if (dims.slice(1).some((n) => n === null)) throw new CError("syntax", "Only an array's first dimension may be left empty.", it.line);
          if (it.init && it.init.t === "str" && ty.base === "char" && dims.length === 1) {
            const s = it.init.v; let size = dims[0];
            if (size === null) size = s.length + 1;
            if (s.length + 1 > size) throw new CError("syntax", "The string \"" + s + "\" needs " + (s.length + 1) + " slots (with the end marker) but the array only has " + size + ".", it.line);
            const a = new Array(size).fill(0);
            for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
            cell.val = { a }; cell.dims = [size];
          } else if (it.init && it.init.t === "list") {
            if (dims[0] === null) dims[0] = it.init.items.length;
            const flat = buildArrayFromInit(dims, it.init, ty.base, it.line);
            cell.val = { a: flat }; cell.dims = dims;
          } else {
            if (dims.some((n) => n === null)) throw new CError("syntax", "An array needs a size or initial values.", it.line);
            if (it.init) throw new CError("syntax", "Invalid array initializer.", it.line);
            const total = dims.reduce((a, b) => a * b, 1);
            cell.val = { a: new Array(total).fill(UNINIT) }; cell.dims = dims;
          }
        } else if (it.init) {
          if (it.init.t === "list") throw new CError("syntax", "A single variable cannot be initialised with { }.", it.line);
          const iv = evalE(it.init);
          if (cty.ptr) cell.val = storeConv(iv, cell, it.line); else cell.val = convertTo(iv, ty.base, it.line).v;
        } else if (cty.ptr) cell.val = UNINIT;
        scope.set(it.name, cell);
      }
    };

    function execBlockBody(list) {
      for (const st of list) { const sig = exec(st); if (sig) return sig; }
      return null;
    }

    function exec(st) {
      tick(st.line);
      switch (st.t) {
        case "decl": declare(st); rec("decl", st); return null;
        case "expr": evalE(st.e); rec("expr", st); return null;
        case "empty": return null;
        case "block": { pushScope(); try { return execBlockBody(st.body); } finally { popScope(); } }
        case "if": {
          const c = truthy(evalE(st.c));
          rec("cond", st.c, { result: c, note: "Is " + src.slice(st.c.s, st.c.en) + " true? " + (c ? "Yes" : "No") });
          if (c) return exec(st.a);
          if (st.b) return exec(st.b);
          return null;
        }
        case "while": {
          let iter = 0;
          for (;;) {
            const c = truthy(evalE(st.c));
            rec("cond", st.c, { result: c, iter: iter + 1, note: "Is " + src.slice(st.c.s, st.c.en) + " true? " + (c ? "Yes, run the body" : "No, leave the loop") });
            if (!c) break;
            iter++;
            const sig = exec(st.body);
            if (sig) { if (sig.t === "break") break; if (sig.t === "continue") continue; return sig; }
          }
          return null;
        }
        case "do": {
          let iter = 0;
          for (;;) {
            iter++;
            const sig = exec(st.body);
            if (sig) { if (sig.t === "break") break; if (sig.t === "continue") { /* fall to the check */ } else return sig; }
            const c = truthy(evalE(st.c));
            rec("cond", st.c, { result: c, iter, note: "Is " + src.slice(st.c.s, st.c.en) + " true? " + (c ? "Yes, repeat" : "No, leave the loop") });
            if (!c) break;
          }
          return null;
        }
        case "for": {
          pushScope();
          try {
            if (st.init) { if (st.init.t === "decl") declare(st.init); else evalE(st.init.e); rec("for-init", st.init, { note: "Start: " + src.slice(st.init.s, st.init.en).replace(/;$/, "") }); }
            let iter = 0;
            for (;;) {
              let c = true;
              if (st.c) { c = truthy(evalE(st.c)); rec("cond", st.c, { result: c, iter: iter + 1, note: "Is " + src.slice(st.c.s, st.c.en) + " true? " + (c ? "Yes, run the body" : "No, leave the loop") }); }
              if (!c) break;
              iter++;
              const sig = exec(st.body);
              if (sig) { if (sig.t === "break") break; if (sig.t !== "continue") return sig; }
              if (st.upd) { evalE(st.upd); rec("update", st.upd, { note: "Update: " + src.slice(st.upd.s, st.upd.en) }); }
            }
          } finally { popScope(); }
          return null;
        }
        case "switch": {
          const v = evalE(st.e);
          if (v.t !== "int") throw new CError("syntax", "A switch needs a whole number (int or char).", st.line);
          let start = -1, def = -1;
          for (let i = 0; i < st.items.length; i++) {
            const it = st.items[i];
            if (it.label === "case") { const cv = evalE(it.v); if (start < 0 && cv.v === v.v) start = i; }
            else if (it.label === "default") def = i;
          }
          const chosen = start >= 0 ? start : def;
          rec("switch", st, { note: chosen < 0 ? "No case matches " + v.v + " and there is no default" : start >= 0 ? "The value " + v.v + " matches a case" : "No case matches " + v.v + ", so default runs", result: chosen >= 0 });
          if (chosen < 0) return null;
          pushScope();
          try {
            for (let i = chosen; i < st.items.length; i++) {
              const it = st.items[i];
              if (it.stmt) { const sig = exec(it.stmt); if (sig) { if (sig.t === "break") return null; return sig; } }
            }
          } finally { popScope(); }
          return null;
        }
        case "break": rec("break", st, { note: "break: leave the loop or switch now" }); return { t: "break" };
        case "continue": rec("continue", st, { note: "continue: skip the rest of this round" }); return { t: "continue" };
        case "return": { const v = st.e ? evalE(st.e) : null; return { t: "return", v }; }
      }
      throw new CError("runtime", "Cannot run this statement (" + st.t + ").", st.line);
    }

    // ---- go
    try {
      // globals
      for (const g of program.globals) declare(g);
      if (snippet) {
        // Functions but no main() and nothing to run: a real linker stops with "undefined reference to main".
        if (program.funcs.size && !program.loose.length) throw new CError("link", "undefined reference to `main`. Every C program needs a function named main(): it is where the program starts.", 0);
        pushScope();
        try { const sig = execBlockBody(program.loose); if (sig && sig.t === "return" && sig.v) result.exitCode = sig.v.v; }
        finally { popScope(); }
      } else {
        if (program.loose.length) throw new CError("syntax", "Statements must be inside a function such as main().", program.loose[0].line);
        const main = program.funcs.get("main");
        if (main.params.length) throw new CError("unsupported", "main() with parameters is not supported in this simulator.", main.line);
        pushScope();
        try { const sig = execBlockBody(main.body.body); result.exitCode = sig && sig.t === "return" && sig.v ? sig.v.v : 0; }
        finally { popScope(); }
      }
    } catch (e) {
      if (e && typeof e === "object" && "exit" in e && !(e instanceof Error)) result.exitCode = e.exit;
      else if (e instanceof CError) { result.ok = false; result.error = { kind: e.kind, message: e.message, line: e.line }; }
      else if (e instanceof RangeError) { result.ok = false; result.error = { kind: "limit", message: "The program nested too deeply, so the simulator stopped it.", line: 0 }; }
      else throw e;
    }
    result.stdout = out; result.steps = steps;
    return result;
  }

  // Parse a single expression (used by the evaluation-order explorer).
  function parseExpression(source) {
    const { toks } = lex(String(source));
    const p = new Parser(toks, String(source));
    const e = p.parseExpr();
    if (p.peek().t !== "eof") throw new CError("syntax", "Unexpected '" + p.peek().v + "' after the expression.", p.peek().line);
    return e;
  }

  // Wrap a snippet the way gcc-based checks need it (a real, complete program).
  function asProgram(source) {
    if (/\bmain\s*\(/.test(source)) return source;
    const funcs = [], body = [];
    // split off leading function definitions so they stay at file scope
    const lines = source.split("\n");
    let depth = 0, cur = [], inFunc = false;
    for (const ln of lines) {
      if (!inFunc && depth === 0 && /^\s*(void|int|float|double|char|bool)\s+\**\w+\s*\([^;]*\)\s*\{?\s*$/.test(ln)) inFunc = true;
      (inFunc ? funcs : body).push(ln);
      for (const ch of ln) { if (ch === "{") depth++; else if (ch === "}") depth--; }
      if (inFunc && depth === 0 && /\}\s*$/.test(ln)) inFunc = false;
    }
    return "#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n#include <math.h>\n#include <stdlib.h>\n" + funcs.join("\n") + "\nint main() {\n" + body.join("\n") + "\nreturn 0;\n}\n";
  }

  return { run, parseExpression, asProgram, lex, formatPrintf, fmtFixed, CError, version: "1.0.0" };
});
