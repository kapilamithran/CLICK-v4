-- TERM024 and TERM028 are referenced by question_terms in 20260911120000_content_stage123.sql
-- (Q000219 and Q000204) but were never inserted by any migration. Both belong to the original
-- TERM001-TERM030 glossary block, which -- like stage STG000 -- predates this migration history
-- and was hand-seeded directly on the live database before migrations existed. OLD already had
-- these rows out-of-band, so content_stage123.sql has always applied cleanly there; a from-scratch
-- target fails on its glossary FK without this. Content sourced from `CSVs/CLICK v2 - Glossary.csv`
-- (a real export of the legacy glossary), not invented. on conflict: safe to re-run, and a no-op if
-- these rows already exist (e.g. on OLD, where this migration is new but the rows are pre-existing).
insert into glossary (term_id, term, definition, color, aliases, active) values
  ('TERM024', 'assignment', 'Assignment stores a value in a variable. In C the assignment operator `=` puts the value of the right-hand expression into the variable on the left.', '#EA580C', 'assignments', true),
  ('TERM028', 'const', 'The `const` qualifier tells the compiler that a variable is intended not to be modified through that name after initialization.', '#059669', 'consts', true)
on conflict (term_id) do nothing;
