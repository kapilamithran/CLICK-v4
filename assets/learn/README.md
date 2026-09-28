# CLICK Learn activity layer

> **Update: activities now live inside chapters.** Learn is no longer a page students open: a chapter is one run of slides
> (`assets/chapter/`), and its hands-on slides are the activities defined here, mounted **by id** with `ClickLearn.mountActivity(container, id, { onDone })`
> (loaded per chapter with `ClickLearnLoader.ensure(chapter)`). The engine, every kind, the interpreter and every definition below are unchanged; a new
> activity is still added to `defs/chNNNN.js` as described here, then referenced from the chapter's deck. The old page-anchored mounting
> (`mountPage`, the heading guard) still exists but nothing in the app calls it any more.

Interactive activities drawn **underneath** the existing Learn page text. The Learn content
(`learn_content.pages_text` in the database) stays the source of truth and is never edited.
Activities are plain configuration in this folder, version-controlled with the frontend.

```
Existing Learn page text  +  activity configuration  =  interactive Learn page
                             (defs/chNNNN.js)
```

Activities are **learning interactions, not assessments**: no XP, no hearts, no effect on Take Test,
chapter completion, Practice, the leaderboard or Next/Back. A student can skip, get it wrong,
refresh or close an activity and still continue. Progress is a small optional "completed before"
tick kept in the browser (`localStorage`, per user).

## Files

| File | Purpose |
|---|---|
| `loader.js` | Only file `index.html` loads. Knows which chapter pages have activities (`MANIFEST`) and lazy-loads everything else. A page without activities downloads nothing more. |
| `engine.js` | Registry, validation, mounting, feedback, persistence + kinds `mcq predict fill order error assign builder reveal` (no code execution). |
| `kinds-visual.js` | Kinds `pipeline buffer bits evalorder` (visual explorers, no code execution). |
| `kinds-code.js` | Kinds `run lab trace tracetable challenge` (use the interpreter). |
| `c-interp.js` | Sandboxed C-subset interpreter (pure JS, no `eval`, step/time/output limits). Verified against real gcc. |
| `c-interp-worker.js` | Web Worker wrapper: student code runs off the page and can be terminated on timeout. |
| `activities.css` | Styling; reuses CLICK theme tokens so light and dark both work. |
| `defs/chNNNN.js` | Activities for one chapter. Loaded on demand. |
| `build-manifest.js` | `node assets/learn/build-manifest.js` regenerates `MANIFEST` in `loader.js` from `defs/`. |

## Adding an activity

Create or edit `defs/ch0035.js`:

```js
ClickLearn.define([
  {
    id: "CH0035.p4.sort-types",       // chapter.pPAGE.slug  (unique)
    stage: "STG001", chapter: "CH0035", page: 4,
    heading: "Basic Data Types",       // first line of that page. If the page heading changes the
                                       // activity is skipped, so it never appears on the wrong page.
    kind: "assign",
    title: "Sort the values into their type boxes",
    implements: ["CH0035.p4.mem"],     // optional: audit recommendation id(s) this covers
    /* ...kind-specific fields below... */
    explanation: "Shown after a correct answer.",
  },
]);
```

Then run `node assets/learn/build-manifest.js` and `node --test "tests/learn/*.test.js"`. While working on one chapter,
`CHAPTERS=CH0035 node --test tests/learn/defs.test.js` checks only that chapter's file.

After changing any file in this folder that students download, bump `VERSION` in `loader.js` **and** the
`?v=` on `LEARN_ACTIVITY_LOADER` in `index.html`, so browsers fetch the new files.

Only teach what the chapter has taught. Feedback should explain the concept ("Not quite. Look at
the value of `i` when..."), never just "Wrong". Never reveal an answer before an attempt unless the
activity is an explanation activity.

## Kinds

Common fields: `id stage chapter page heading kind title` and optional `intro`, `explanation`, `implements`.

| kind | required fields | notes |
|---|---|---|
| `mcq` | `question`, `choices:[{text, correct?, why?}]` | exactly one `correct`. `code` optional. |
| `predict` | `code`, `expected`, and `choices:[...]` **or** `typed:true` | `expected` is verified against the interpreter and gcc by the tests. `input`, `hint`, `question` optional. |
| `fill` | `code` containing `___`, `blanks:[{answers:[...], hint?, label?, expects?, placeholder?}]` | one blank per `___`. Give each blank a short `label` (and what it `expects`) when the blanks mean different things: they appear as a visible key under the code, so the learner never has to guess which blank is which. `placeholder` is text shown inside an empty box - keep it short and never put the answer there. |
| `order` | `lines:[...]` (correct order) | `distractors:[...]`, `alternatives:[[...]]` optional. |
| `error` | `mode:"find"` + `lines`, `bug`(index), `diagnostic`, `fixed` **or** `mode:"toggle"` + `broken`, `fixed`, `diagnostic` | the diagnostic is an authored, *simulated* compiler message. |
| `assign` | `items:[{text, bucket, why?}]`, `buckets:[{id,label}]` | match/sort. Uses selects, so it is keyboard and touch friendly. |
| `builder` | `template:"{type} {name} = {value};"`, `slots:{type:{options,answer,label,why}, ...}` | assemble a valid statement. |
| `reveal` | `code` + `notes:[{text, note}]` **or** `cards:[{label, body}]` | tap-to-explain. Each `text` must occur in `code`. |
| `pipeline` | `stages`, `scenarios:[{label, code, fails?, message?, output?}]` | Edit/Compile/Link/Run explorer. |
| `buffer` | `code:[lines]`, `calls:[{fmt, var, line, fixFmt?}]`, `input` | input-buffer simulator (`%d %f %lf %c " %c" %s fgets`). `fixToggle:true` adds the space-before-%c switch. |
| `bits` | `mode: ops \| not \| shift \| parity` | 8-bit flipper. |
| `evalorder` | `expr` (e.g. `"2 + 3 * 4"`), `vars?` | pick the operator that runs next. |
| `run` | `code` | editable code + Run. `input`, `tasks:[...]`, `goal:{contains\|equals}` optional. |
| `lab` | `controls:[{id,type,label,...}]` and `code` (or `variants:[{label,code}]`) with `{{id}}` placeholders | controls: `range{min,max,step,value}`, `select{options:[{v,l}],value}`, `toggle{on,off,checked}`, `number`. `show:["lines"]` highlights executed lines. `summary` may use `{{out}}`. |
| `trace` | `code` | step through with variable table and output. `input`, `notes:{line:text}` optional. |
| `tracetable` | `code`, `columns:[{key,label,kind:var\|cond\|out,var?}]`, `fill:[keys]` | expected rows are derived from a real run of `code`. |
| `challenge` | `prompt`, `starter`, `tests:[{input?,expected}]`, `hints:[...]`, `solution` | solution opens after a correct attempt or on request. Optional `uses:[{re, ask}]` requires a construct in the student's code (comments and strings are ignored), so printing the answer by hand does not pass. On the four spoiler pages (CH0056/59/60/61 page 5) solving it, or asking for the solution, also opens the worked solution in the page text. |

Notes: `predict` choices are plain strings (the per-mistake explanation goes in `hint` and `explanation`). `mcq` choices
are shown in the order written. `buffer` with an `fgets` call also draws the stored string box by box (newline and end marker).

Flags used by the definition tests only (never shown to students): `noRun:true` (on `fill`, `order`, `error`) when the
code is not a runnable program, `skipGcc:true` when gcc disagrees with the simulator on purpose (for example gcc only
warns about a wrong format specifier), `mayFail:true` on a `lab` whose settings may legitimately stop the program.

## Verification

`node --test "tests/learn/*.test.js"` validates every definition (schema, page heading vs. the live-content
snapshot, uniqueness) and **runs the code**: predicted outputs, lab controls, trace code and challenge
solutions are executed with the interpreter and, when gcc is installed, cross-checked against gcc.
It also unit-tests the engine (`engine.test.js`), the interpreter (`interp.test.js`, differential against gcc) and checks
that `loader.js`'s MANIFEST is current.

`node tests/learn/coverage-report.js` prints, per chapter, the pages with activities and their kinds, the pages left
static on purpose, and which audit recommendations (`tests/learn/audit-recommendations.json`) are implemented.
`tests/learn/learn-content-snapshot.json` holds the page headings the definitions are checked against; refresh it if the
Learn content is edited on purpose (an activity whose heading no longer matches its page is skipped at run time).

## The interpreter

`c-interp.js` runs the C that Stage 0-5 and Stage 6 (Arrays) teach: `int char float double bool const`, all
operators, `printf` (`%d %i %u %c %s %f %lf %x %o` with width/flags/precision), `scanf`/`fgets` on a
simulated stdin, `if/else/switch/?:`, `for/while/do-while/break/continue`, simple functions (including array
parameters, `int a[]`, passed by reference like real C), one- and two-dimensional arrays, `char` arrays and
`strlen strcspn strcmp strcpy strcat strchr` (`strchr` may be compared with `NULL`). Real-C undefined behaviour (unset variables, wrong format specifiers,
out-of-range indexes, missing `&`) stops with an explanation instead of inventing output. It is not a
compiler: pointers, structs, `long`/`unsigned`, files and the rest of C are out of scope.
Student code runs in a Web Worker and is terminated after 3.5 seconds; the interpreter also stops
after 3,000,000 steps (about a quarter of a second), 2 seconds of running time or 20,000 characters of
output, and refuses programs longer than 20,000 characters. If Web Workers are unavailable it falls back to the
main thread with tighter limits (400,000 steps, 0.8 s).

## Future chapters (Stages 9-10)

Stage 6 (Arrays, CH0062-CH0072 and CH0116) now has full activity defs - see `defs/ch0062.js` onward for the
`trace`/`builder`/`assign`/`reveal`/`mcq`/`fill` patterns used for array indexing, 2D arrays and array
function parameters. Stage 7 (Strings, CH0073-CH0078) has full activity defs too: `assign`/`reveal`/`builder`
for characters, indexes and declarations, `buffer` for `scanf("%s")` versus `fgets` (which also draws the stored
string box by box), `trace` for string loops and the `<string.h>` functions (a char array is shown as its text),
`lab` for `strlen`/`strcmp`/`strchr` and character changes, `error` for the single-quote mistake, and `order`
with `noRun: true` for plain-English steps. Stage 8 (Searching & Sorting, CH0079-CH0093) also has full activity defs: `trace` for
linear/binary search and bubble/selection/insertion sort, `assign`/`reveal`/`builder`/`order`/`predict` for the
concept work (`order` activities that sequence plain-English algorithm steps set `noRun: true`). The remaining
chapters (Functions, Pointers) still have no Learn content. Nothing here needs to change for them: when their Learn pages exist, add `defs/chNNNN.js` files
that point at the real page headings and reuse the same kinds (`trace` for sorting steps, `lab`/`run` for
small experiments, `order`/`fill` for structure). Kinds for those topics can be added to `kinds-visual.js`
by registering `ClickLearn.kind(name, {...})`. Do not write activities for chapters whose Learn text does
not exist yet.
