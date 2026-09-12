-- Adds the STRUCTURAL placeholders for Stages 6-10 (ARRAYS, STRINGS,
-- SEARCHING & SORTING, FUNCTIONS, POINTERS): stage + chapter metadata only.
--
-- Explicitly NOT added by this migration (per the task's own scope): no
-- learn_content, no questions/options/test_hints, no glossary/question_terms,
-- no practice_bank/practice_tests/practice_progress. Those tables are
-- untouched here - Stages 6-10 have zero rows in any of them, which is what
-- keeps them out of the Practice tab and the Profile "Practice Progress"
-- section automatically (both already filter to stages that have real
-- practice_bank rows - see index.html's stagePracticeQuestions() /
-- renderPracticeProgress()). No frontend code change was required for any
-- of this: stage/chapter rendering, the Learn stage/chapter selectors, the
-- stage-journey cards, and chapter-tile locking are already fully
-- data-driven over whatever rows exist in `stages`/`chapters`/`prerequisites`.
--
-- LOCKING MECHANISM: this reuses the existing, already-wired but previously
-- unused STAGE-level prerequisite gate (`prerequisiteStatus("STAGE", ...)` in
-- the backend, `stageGate`/`p.unlocked` in index.html - the exact code path
-- that already renders a stage as `.stage-path.is-locked` with a 🔒 button
-- and cascades the lock to every chapter tile inside it). Verified live: zero
-- STAGE-level prerequisite rows exist today for Stages 0-5 (their locking is
-- entirely chapter/practice-level), so this is the first real use of that
-- code path - nothing for Stages 0-5 to collide with.
--
-- Each new stage's prerequisite rule points at ITSELF
-- (target_id = prerequisite_id), which can never be satisfied - a stage can
-- only ever appear in `stageCompleteIds` once every one of its own chapters
-- has a completed chapter test, and these new chapters have no test
-- questions to complete at all. This keeps Stages 6-10 locked unconditionally
-- (not "locked until Stage 5 is finished" - locked, full stop) until a real
-- content task deliberately removes/replaces these five rows once the actual
-- learning content for a stage is ready.
--
-- IDs: stages STG007-STG011 and chapters CH0062-CH0114 continue the existing
-- sequential ID conventions with no collisions (current data: stage_id up to
-- STG006, chapter_id up to CH0061).

insert into stages (stage_id, stage_no, title, "order", active) values
  ('STG007', 6, 'ARRAYS', 6, true),
  ('STG008', 7, 'STRINGS', 7, true),
  ('STG009', 8, 'SEARCHING & SORTING', 8, true),
  ('STG010', 9, 'FUNCTIONS', 9, true),
  ('STG011', 10, 'POINTERS', 10, true);

insert into chapters (chapter_id, stage_id, chapter_no, title, "order", active, question_limit) values
  -- Stage 6 - ARRAYS (11 chapters)
  ('CH0062', 'STG007', 1, 'Introduction to Array', 1, true, null),
  ('CH0063', 'STG007', 2, 'Array Indexing and Accessing Element', 2, true, null),
  ('CH0064', 'STG007', 3, 'Initializing Array', 3, true, null),
  ('CH0065', 'STG007', 4, 'Combining Loops with Array', 4, true, null),
  ('CH0066', 'STG007', 5, 'Out-of-Bounds Errors & Safety', 5, true, null),
  ('CH0067', 'STG007', 6, 'Basic Array Operations- Math & Metric', 6, true, null),
  ('CH0068', 'STG007', 7, 'Searching in an Array', 7, true, null),
  ('CH0069', 'STG007', 8, 'Introduction to Multi-Dimensional Arrays', 8, true, null),
  ('CH0070', 'STG007', 9, 'Working with 2D Array', 9, true, null),
  ('CH0071', 'STG007', 10, 'Character Array (Introduction to Strings)', 10, true, null),
  ('CH0072', 'STG007', 11, 'Arrays and Functions', 11, true, null),

  -- Stage 7 - STRINGS (6 chapters)
  ('CH0073', 'STG008', 1, 'String Basics & Declaration', 1, true, null),
  ('CH0074', 'STG008', 2, 'String Input & Output', 2, true, null),
  ('CH0075', 'STG008', 3, 'Accessing & Traversing Strings', 3, true, null),
  ('CH0076', 'STG008', 4, 'String Length & Basic Operations', 4, true, null),
  ('CH0077', 'STG008', 5, 'String Library Functions', 5, true, null),
  ('CH0078', 'STG008', 6, 'Basic String Programs', 6, true, null),

  -- Stage 8 - SEARCHING & SORTING (15 chapters)
  ('CH0079', 'STG009', 1, 'Searching Basics', 1, true, null),
  ('CH0080', 'STG009', 2, 'Linear Search', 2, true, null),
  ('CH0081', 'STG009', 3, 'Linear Search Algorithm', 3, true, null),
  ('CH0082', 'STG009', 4, 'Linear Search with Arrays', 4, true, null),
  ('CH0083', 'STG009', 5, 'Search Occurrence & Count', 5, true, null),
  ('CH0084', 'STG009', 6, 'Binary Search Basics', 6, true, null),
  ('CH0085', 'STG009', 7, 'Binary Search Algorithm', 7, true, null),
  ('CH0086', 'STG009', 8, 'Binary Search with Arrays', 8, true, null),
  ('CH0087', 'STG009', 9, 'Linear Search vs Binary Search (Quick Recap)', 9, true, null),
  ('CH0088', 'STG009', 10, 'Sorting Basics', 10, true, null),
  ('CH0089', 'STG009', 11, 'Sorting in Ascending & Descending Order', 11, true, null),
  ('CH0090', 'STG009', 12, 'Bubble Sort', 12, true, null),
  ('CH0091', 'STG009', 13, 'Selection Sort', 13, true, null),
  ('CH0092', 'STG009', 14, 'Insertion Sort', 14, true, null),
  ('CH0093', 'STG009', 15, 'Comparing Sorting Methods', 15, true, null),

  -- Stage 9 - FUNCTIONS (9 chapters)
  ('CH0094', 'STG010', 1, 'What is a Function?', 1, true, null),
  ('CH0095', 'STG010', 2, 'Creating and Calling a Function', 2, true, null),
  ('CH0096', 'STG010', 3, 'Functions with Parameters', 3, true, null),
  ('CH0097', 'STG010', 4, 'Functions with Return Values', 4, true, null),
  ('CH0098', 'STG010', 5, 'Types of Functions', 5, true, null),
  ('CH0099', 'STG010', 6, 'Multiple Parameters and Arguments', 6, true, null),
  ('CH0100', 'STG010', 7, 'Local and Global Variables', 7, true, null),
  ('CH0101', 'STG010', 8, 'Functions with Arrays and Strings', 8, true, null),
  ('CH0102', 'STG010', 9, 'Recursive Functions', 9, true, null),

  -- Stage 10 - POINTERS (12 chapters)
  ('CH0103', 'STG011', 1, 'Pointer Basics', 1, true, null),
  ('CH0104', 'STG011', 2, 'Declaring & Initializing Pointers', 2, true, null),
  ('CH0105', 'STG011', 3, 'Address Operator &', 3, true, null),
  ('CH0106', 'STG011', 4, 'Dereference Operator *', 4, true, null),
  ('CH0107', 'STG011', 5, 'Pointers and Data Types', 5, true, null),
  ('CH0108', 'STG011', 6, 'Pointers and Variables', 6, true, null),
  ('CH0109', 'STG011', 7, 'Pointer Arithmetic', 7, true, null),
  ('CH0110', 'STG011', 8, 'Pointers and Arrays', 8, true, null),
  ('CH0111', 'STG011', 9, 'Pointers and Strings', 9, true, null),
  ('CH0112', 'STG011', 10, 'Pointers with Functions', 10, true, null),
  ('CH0113', 'STG011', 11, 'Pointers with Structures', 11, true, null),
  ('CH0114', 'STG011', 12, 'Common Pointer Problems', 12, true, null);

insert into prerequisites (target_id, prerequisite_id, condition, description, active) values
  ('STG007', 'STG007', 'completed', 'Stage 6 — ARRAYS: content is coming soon.', true),
  ('STG008', 'STG008', 'completed', 'Stage 7 — STRINGS: content is coming soon.', true),
  ('STG009', 'STG009', 'completed', 'Stage 8 — SEARCHING & SORTING: content is coming soon.', true),
  ('STG010', 'STG010', 'completed', 'Stage 9 — FUNCTIONS: content is coming soon.', true),
  ('STG011', 'STG011', 'completed', 'Stage 10 — POINTERS: content is coming soon.', true);
