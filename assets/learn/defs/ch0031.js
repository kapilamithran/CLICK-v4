/*
 * CH0031 - Intro (Stage 0). PILOT chapter.
 *
 * The Learn text names the compiler but never shows the whole Edit -> Compile -> Link -> Run journey,
 * while the chapter test asks about it. The page-2 activity teaches those stages by letting the student
 * send real programs through them one stage at a time, including a program that stops at Compile and one
 * that stops at Link. The chapter test and the Learn text are unchanged.
 * Compiler and linker messages are authored (copied from real gcc output and trimmed) and labelled "Simulated".
 */
ClickLearn.define([
  {
    id: "CH0031.p1.tap-hello", stage: "STG001", chapter: "CH0031", page: 1, heading: "Structure in C — First C Program",
    kind: "reveal", title: "Tap each part of the program",
    implements: ["CH0031.p1.ace"],
    code: '#include <stdio.h>\n\nint main() {\n   printf("Hello World!");\n   return 0;\n}',
    notes: [
      { text: "#include <stdio.h>", note: "Brings in the toolbox that contains `printf()`. Without it, C would not know what `printf` is." },
      { text: "int main()", note: "The starting point. When the program runs, C begins here." },
      { text: "{", note: "The opening brace. The instructions of `main()` start after it." },
      { text: 'printf("Hello World!");', note: "Displays the text between the quotes. The `;` ends the instruction." },
      { text: "return 0;", note: "Tells C the program finished successfully." },
      { text: "}", note: "The closing brace. The instructions of `main()` end here." },
    ],
    explanation: "Six small pieces, each with one job. The recipe analogy above, now on the real program.",
  },
  {
    id: "CH0031.p2.build-pipeline", stage: "STG001", chapter: "CH0031", page: 2, heading: "Compiler",
    kind: "pipeline", title: "Send a program through the build pipeline",
    implements: ["CH0031.p2.tr"],
    intro: "The compiler is one step in a longer journey from your code to a running program. Pick a program, then press **Next stage** to move it forward one step at a time.",
    stages: [
      { id: "edit", label: "Edit", what: "You write or change the source code in a `.c` file. Nothing runs yet." },
      { id: "compile", label: "Compile", what: "The compiler checks your code against C's rules (its syntax) and translates it into machine instructions. Syntax mistakes are found here." },
      { id: "link", label: "Link", what: "The linker joins your machine code with the ready-made code your program uses, such as `printf`, and looks for `main`, the starting point." },
      { id: "run", label: "Run", what: "The computer starts at `main()` and follows your instructions. The output appears." },
    ],
    scenarios: [
      {
        label: "A correct program",
        code: '#include <stdio.h>\n\nint main() {\n   printf("Hello World!");\n   return 0;\n}',
        output: "Hello World!",
      },
      {
        label: "A missing semicolon",
        code: '#include <stdio.h>\n\nint main() {\n   printf("Hello World!")\n   return 0;\n}',
        fails: "compile", message: "hello.c: In function 'main':\nhello.c:4:26: error: expected ';' before 'return'",
        lesson: "The compiler found a syntax mistake and stopped. There is no machine code yet, so nothing can link or run. Fix the source (back to **Edit**) and compile again.",
      },
      {
        label: "main spelled wrong",
        code: '#include <stdio.h>\n\nint mian() {\n   printf("Hello World!");\n   return 0;\n}',
        fails: "link", message: "undefined reference to `main'\ncollect2: error: ld returned 1 exit status",
        lesson: "The compiler was happy: `mian` is a legal function name. The linker looks for `main`, the starting point, and cannot find it. On Windows the message may name `WinMain` instead, but the meaning is the same.",
      },
    ],
  },
  {
    id: "CH0031.p3.missing-semicolon", stage: "STG001", chapter: "CH0031", page: 3, heading: "Syntax",
    kind: "error", mode: "toggle", title: "Break it, read the message, fix it",
    implements: ["CH0031.p3.bug"],
    question: "This program is missing its semicolon. Press **Compile** to see what the compiler says, then **Apply the fix** and compile again.",
    broken: '#include <stdio.h>\n\nint main() {\n   printf("Hello")\n   return 0;\n}',
    fixed: '#include <stdio.h>\n\nint main() {\n   printf("Hello");\n   return 0;\n}',
    diagnostic: "hello.c: In function 'main':\nhello.c:4:19: error: expected ';' before 'return'",
    outputAfterFix: "Hello",
    explanation: "The compiler expected a `;` to end the `printf(\"Hello\")` statement and found `return` instead. The message gives the file, the line number and what was expected.",
    fixNote: "With the `;` back, the statement has a clear end, so the program is valid C again.",
  },
  {
    id: "CH0031.p4.which-header", stage: "STG001", chapter: "CH0031", page: 4, heading: "Header Files",
    kind: "assign", title: "Which toolbox has the tool?",
    implements: ["CH0031.p4.match"],
    question: "Each function lives in a header file. Which header provides each one?",
    buckets: [{ id: "stdio", label: "stdio.h" }, { id: "math", label: "math.h (coming later)" }, { id: "string", label: "string.h (coming later)" }],
    items: [
      { text: "printf()", bucket: "stdio", why: "printf() displays output, so it comes from stdio.h, the standard input/output header." },
      { text: "scanf()", bucket: "stdio", why: "scanf() takes input. Input and output tools are both in stdio.h." },
      { text: "sqrt()", bucket: "math", why: "sqrt() is a maths tool. Maths tools live in math.h, which you will meet later." },
      { text: "strlen()", bucket: "string", why: "strlen() works on text. Text tools live in string.h, which you will meet later." },
    ],
    explanation: "Header file = toolbox, function = tool. For now only stdio.h matters: it gives you printf() and scanf().",
  },
  {
    id: "CH0031.p5.change-greeting", stage: "STG001", chapter: "CH0031", page: 5, heading: "Main Function in C — Quick Recap",
    kind: "run", title: "Change the greeting and run it",
    implements: ["CH0031.p5.run"],
    code: '#include <stdio.h>\n\nint main()\n{\n   printf("Hello World!");\n   return 0;\n}',
    initialOutput: "Hello World!",
    tasks: ["Change the words inside the quotes (try your own name) and press Run.", "Look at the output. Which line of the program made it appear?"],
    goal: { changed: true }, goalHint: "Change the text between the quotation marks in the `printf` line, then press Run again.",
    explanation: "Execution began at `main()`, ran the `printf` line, then reached `return 0;`. Only the text inside the quotes changed the output.",
  },
]);
