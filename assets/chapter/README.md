# CLICK unified chapters

A chapter is **one short run of 5-10 slides** that teaches, practises and assesses at once. There is no separate "read the lesson,
then take the test". Tapping a chapter on the Home path opens slide 1.

```
Home path -> chapter -> slide 1 (Code Explorer) -> slides 2..N (activities + graded questions) -> chapter complete -> next chapter
```

The old Learn text (`learn_content.pages_text`) is now **source material**: it is reorganised into the glossary, the code explanations,
the slide takeaways and the activities. It is not shown as pages any more.

## Files

| File | Purpose |
|---|---|
| `chapter.js` | Deck registry, validator, run planner, lazy loader for one chapter's deck. |
| `explorer.js` | The Code Explorer ("tap any underlined part of the code"). |
| `glossary.js` | The reusable glossary sheet, inline term links and "Words to know" chips. |
| `chapter.css` | Styling; uses the CLICK theme tokens, so dark and light both work. |
| `defs/chNNNN.js` | One chapter's deck. Loaded only when that chapter is opened. |

## Slide kinds

| kind | what the student does | how it is checked | hearts / XP |
|---|---|---|---|
| `explorer` | taps underlined parts of a small C program to read what each does | needs `minTaps` different parts opened | none |
| `activity` | uses an existing interactive activity from `assets/learn` (predict, fill, order, trace, ...) | the activity's own `done()` | none |
| `question` | answers one of the chapter's **real** questions (MCQ, predict output, blank, code fill, order, type code ...) | server-validated: 3 attempts | a heart is lost only when all 3 attempts fail; XP once, when the chapter completes |

Slide 1 is always the Code Explorer. A deck has 5-10 slides, at least one `activity`, and exactly the questions the server serves for a run
(the chapter's `question_limit`, default 5, capped at 8 for a unified run, in `order`). Hearts, XP, unlocking and the "XP only once per
chapter" rule are the existing server rules; a deck cannot change them.

## A deck

```js
ClickChapter.define({
  chapter: "CH0034", stage: "STG001", title: "Variables",       // title = the chapter's title
  goal: "Create a variable, store a number in it, print it, and change it.",
  references: [{ title: "<the video's real title>", channel: "<real channel>", url: "https://www.youtube.com/watch?v=..." }],
  glossary: { variable: { term, short, explain, example?, mistake?, remember?, related?: [ids] } },
  slides: [
    { id: "s1", kind: "explorer", title, objective, glossary: [ids], code: "…«id|text»…", targets: { id: {title, explain, example?, mistake?, remember?, terms?: [ids]} }, minTaps: 3, input?: "stdin for scanf" },
    { id: "s2", kind: "activity", activity: "CH0034.p1.build-the-box", title, objective, glossary: [ids], lead?, takeaway? },
    { id: "s3", kind: "question", question: "Q000166",               title, objective, glossary: [ids], lead?, takeaway? },
  ],
});
```

`node --test "tests/chapter/*.test.js"` validates every deck (`CHAPTERS=CH0034 node --test tests/chapter/decks.test.js` for one), and
`node tests/chapter/verify-references.js CH0034` checks each YouTube link against YouTube itself.

### Code Explorer markup

Wrap each tappable part like `«id|text»`. The code shown is the text with the markers removed, so a target can never drift out of sync with
the code (no character offsets are stored). Every id needs an entry in `targets`, and every target must appear in the code.
Keep it to **14 lines of 44 characters** so a 360px phone does not scroll sideways, and make it a small **correct, runnable** C program
(the tests run it in the interpreter and, when installed, gcc). Underline what a beginner would wonder about (a keyword, a name, an
operator, a literal, a format specifier, a function, a statement), not every character. Aim for 6-10 targets.

### Inline glossary links

In `lead`, `takeaway` and target text, `{{variable}}` or `{{variable|the box}}` becomes a tappable term. Slide `glossary: [...]` becomes the
"Words to know" chips (1-4 per slide: contextual, never one giant list).

## Writing for a complete beginner

Assume the student has never programmed. For every term answer: **what is it, why do we use it, what does it look like, what does it do,
one tiny example, and (when useful) a common mistake.**

- `short`: one plain sentence (8-140 characters). `explain`: 40-480 characters. No unexplained jargon, no circular definitions.
- Bad: "A relational operator compares operands." Good: "A relational operator compares two values and tells us whether the
  comparison is true or false. Example: `10 > 5` is true because 10 is greater than 5."
- Use `` `code` `` for code inside sentences. Keep every sentence short.
- `takeaway` is one line shown after a slide: the thing to remember. The question bank often has no explanation, so this is the feedback.
- Do not paste the old Learn pages. Split them: definitions -> glossary, "what does this part do" -> code targets, the trick to remember ->
  takeaway/remember, the practice -> activities and questions. Keep every fact, example, warning and edge case that the old pages taught.
- Every slide teaches one thing (`objective`). No filler slides, no repeated questions.
- Order slides so the student learns before being asked: explorer, then a hands-on activity, then questions that build on it, the
  simplest recall question last or first (your call), ending on something that feels like progress.

## References

Every chapter has 1-3 real YouTube videos, shown at the bottom of every slide (never autoplayed; opened only when tapped). Prefer clear,
beginner, topic-specific videos from reputable educational channels. Never guess a URL: find it, then run
`node tests/chapter/verify-references.js CHxxxx`; the title and channel in the deck must be exactly what YouTube reports.

## Future chapters

Stages 6-10 have no Learn content yet, so they have no decks. When their content exists: add the chapter's questions, then a
`defs/chNNNN.js` deck with the same shape. Nothing in the player has to change.
