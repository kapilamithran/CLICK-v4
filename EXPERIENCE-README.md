# CLICK: ten-level chapter experience

## What changed

- Ten coordinated themes, from warm white/sage to midnight/gold, in `assets/experience/levels.css`.
- Ten original, instrumental, 30-second seamless WAV loops: one eight-bar theme at 64 BPM with increasingly full arrangements. Render source: `assets/experience/render-music.py` (NumPy required).
- Phase-matched 1.1-second crossfades, gentle bloops, correct/completion chimes, spring feedback, reduced-motion support, independent mute and volume controls, and music ducking while a video plays.
- Every two distinct correctly answered questions increases the atmosphere level, capped at 10. Activities do not increase the level.
- A new chapter starts at Level 1. Leaving an unfinished chapter, returning, or refreshing preserves its atmosphere, queue, attempt counts, and earned question progress in the same browser and account. Refresh reopens the active unfinished chapter after authentication.
- After three incorrect attempts a question is appended to the end, once in the remaining queue. Each return grants three fresh attempts. This repeats until it is correct.
- New graded chapter runs include **all active questions in that chapter**, rather than applying the former 8-question cap. Both frontend and backend require each question to be correct before completion. Short chapters naturally end before Level 10; Level 10 requires 18 unique correct answers in one test.
- New mastery runs do not deduct hearts or end because of zero hearts. Existing legacy runs and historical heart-recovery records keep their previous behavior.
- Completion XP is awarded once per chapter. Persisted answer saves use request IDs; failed saves remain in a local outbox and replay before finishing. Already saved answers and activities do not award rewards twice on replay.
- Results retain the earned theme; leaving completed results resets to Level 1. Completed-chapter reviews use the same local retry queue and award no additional XP.

## Deployment order (required)

1. Apply the existing repository migrations, then `supabase/migrations/20261003100000_mastery_runs.sql`.
2. Deploy `supabase/functions/click-backend/index.ts` using your existing Supabase deployment workflow.
3. Deploy the frontend, including **all** files in `assets/experience/`.

The new migration stores the mastery policy and served question IDs on the run and adds a unique client request ID for answer retries. The frontend reports a deployment error if a graded run comes from an older backend without mastery support. No live database, account, or hosting deployment was performed while preparing this archive.

## Preview

Serve this folder over HTTP and open `experience-preview.html` to inspect all ten themes, loops, and sounds without an account. For example: `python3 -m http.server 8000`.

For the real application in offline demo mode with production chapter fixtures:

```sh
node tests/e2e/preview.js 3391 --open-all
```

Open `http://127.0.0.1:3391/?demo=1`; use the demo credentials displayed by the app. Demo progress is browser-local. This does not connect to production.

## Verification performed

- Five frontend tests: level boundaries/unique answers, inline script syntax, actual answer-handler deferrals and completion, persistence/outbox replay after a failed save, and audio source loop/crossfade/mute wiring with a mocked AudioContext.
- Fifteen backend scenarios using the real edge function and existing in-memory Supabase harness: thirteen legacy regression scenarios plus mastery retries, resume ownership, zero hearts, completion guards, idempotent rewards, and XP once.
- 722 existing chapter/component/home-model checks passed.
- All ten WAV files are 30 seconds, have matching sample rates/lengths, zero sample discontinuity at the loop boundary, and conservative peak levels. Theme body text, secondary text, and button text were checked numerically at the palette endpoints: minimum contrast above 4.5:1.

Commands:

```sh
node --test tests/experience/frontend.test.js
node --experimental-transform-types tests/experience/backend-run.mjs
node --test tests/chapter/components.test.js tests/chapter/decks.test.js tests/home/path-model.test.js
```

The backend compatibility runner requires Node 24. The existing Deno harness remains available for Deno users.

## Browser verification still needed

A browser executable was unavailable in the build environment. Live visual rendering, playback/listening, phone layouts, and browser autoplay behavior have not been verified. Before production use, check the preview and a full chapter on desktop and mobile: refresh after two wrong answers, defer multiple questions, refresh after a deferral, mute both audio channels, play a video, enable reduced motion, finish all questions correctly, and return Home.

Browsers may require the first click/tap/key press before audible playback. The app starts sound on that interaction and supplies an explicit Enable music button. Resume data is browser-local; clearing browser storage or switching devices will not restore the local queue. Existing server-side answers and rewards remain attached to their run.
