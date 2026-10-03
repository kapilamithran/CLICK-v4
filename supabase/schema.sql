-- CLICK backend schema for Supabase (Postgres)
-- Mirrors the 21 Google Sheets tabs from the Apps Script TABS map.
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query -> paste -> Run).

-- ============================================================
-- Content tables (owned by you/admin; read by everyone via the Edge Function)
-- ============================================================

create table stages (
  stage_id    text primary key,
  stage_no    integer,
  title       text not null,
  "order"     integer not null default 0,
  active      boolean not null default true
);

create table chapters (
  chapter_id  text primary key,
  stage_id    text not null references stages(stage_id) on delete cascade,
  chapter_no  integer,
  title       text not null,
  "order"     integer not null default 0,
  active      boolean not null default true
);
create index idx_chapters_stage on chapters(stage_id);

create table learn_content (
  learn_id    text primary key,
  stage_id    text not null references stages(stage_id) on delete cascade,
  chapter_id  text not null references chapters(chapter_id) on delete cascade,
  title       text,
  pages_text  text,
  active      boolean not null default true,
  updated_at  timestamptz not null default now()
);
create index idx_learn_content_chapter on learn_content(chapter_id);

create table questions (
  question_id text primary key,
  stage_id    text not null references stages(stage_id) on delete cascade,
  chapter_id  text not null references chapters(chapter_id) on delete cascade,
  type        text not null default 'MCQ',
  prompt      text,
  code        text,
  answer      text,
  explanation text,
  hint        text,
  xp          integer not null default 1,
  "order"     integer not null default 0,
  active      boolean not null default true
);
create index idx_questions_chapter on questions(chapter_id);

create table options (
  option_id   text primary key,
  question_id text not null references questions(question_id) on delete cascade,
  option_text text,
  "order"     integer not null default 0,
  active      boolean not null default true
);
create index idx_options_question on options(question_id);

create table test_hints (
  hint_id     text primary key,
  question_id text not null references questions(question_id) on delete cascade,
  hint_text   text,
  active      boolean not null default true,
  "order"     integer not null default 0
);
create index idx_test_hints_question on test_hints(question_id);

create table glossary (
  term_id     text primary key,
  term        text not null,
  definition  text,
  color       text,
  aliases     text,
  active      boolean not null default true
);

create table question_terms (
  id            bigint generated always as identity primary key,
  question_id   text not null references questions(question_id) on delete cascade,
  term_id       text not null references glossary(term_id) on delete cascade,
  display_text  text,
  "order"       integer not null default 0,
  active        boolean not null default true
);
create index idx_question_terms_question on question_terms(question_id);

create table practice_bank (
  practice_id             text primary key,
  stage_id                text not null references stages(stage_id) on delete cascade,
  title                   text,
  objective               text,
  problem_statement       text,
  constraints             text,
  sample_input            text,
  sample_output           text,
  starter_code            text,
  hint_1                  text,
  hint_2                  text,
  hint_3                  text,
  success_message         text,
  technique_after_success text,
  "order"                 integer not null default 0,
  active                  boolean not null default true
);
create index idx_practice_bank_stage on practice_bank(stage_id);

create table practice_tests (
  test_id           text primary key,
  practice_id       text not null references practice_bank(practice_id) on delete cascade,
  name              text,
  input             text,
  expected_output   text,
  hidden            boolean not null default false,
  timeout_ms        integer default 5000,
  active            boolean not null default true,
  "order"           integer not null default 0
);
create index idx_practice_tests_practice on practice_tests(practice_id);

create table practice_mistakes (
  mistake_id  text primary key,
  practice_id text not null references practice_bank(practice_id) on delete cascade,
  rule_type   text default 'source_regex',
  pattern     text,
  message     text,
  "order"     integer not null default 0,
  active      boolean not null default true
);
create index idx_practice_mistakes_practice on practice_mistakes(practice_id);

create table announcements (
  announcement_id text primary key,
  title           text,
  message         text,
  category        text,
  active          boolean not null default true,
  publish_date    date,
  expire_date     date
);

create table kabi_phrases (
  phrase_id text primary key,
  category  text,
  phrase    text not null,
  active    boolean not null default true
);

-- target_id / prerequisite_id are polymorphic (can point at a stage, chapter, or
-- practice id) so this is intentionally not a foreign key.
create table prerequisites (
  target_id        text not null,
  prerequisite_id  text not null,
  condition        text default 'completed',
  description      text,
  active           boolean not null default true,
  primary key (target_id, prerequisite_id)
);
create index idx_prerequisites_target on prerequisites(target_id);

create table settings (
  key         text primary key,
  value       text,
  description text
);

-- ============================================================
-- User / account tables
-- ============================================================

create table users (
  user_id                     text primary key,
  name                        text not null,
  roll_no                     text not null unique,
  department                  text,
  email                       text not null unique,
  phone                       text,
  password_hash               text not null,
  password_salt                text not null,
  joined_at                   timestamptz not null default now(),
  last_login                  timestamptz,
  last_logout                 timestamptz,
  total_xp                    integer not null default 0,
  streak                      integer not null default 0,
  current_stage               text,
  current_chapter             text,
  hearts                      integer not null default 3,
  tests_completed             integer not null default 0,
  questions_attempted         integer not null default 0,
  correct_answers             integer not null default 0,
  accuracy_percent            numeric(5,2) not null default 0,
  onboarding_completed        boolean not null default false,
  status                      text not null default 'active',
  stages_completed            integer not null default 0,
  last_completed_stage        text,
  last_learn_stage            text,
  last_learn_chapter          text,
  heart_recovery_stage_id     text,
  heart_recovery_chapter_id   text,
  role                        text not null default 'student',
  username                    text unique
);
create index idx_users_email on users(lower(email));

create table sessions (
  session_id    text primary key,
  session_token text not null unique,
  user_id       text not null references users(user_id) on delete cascade,
  login_time    timestamptz not null default now(),
  last_seen     timestamptz not null default now(),
  logout_time   timestamptz,
  device        text,
  active        boolean not null default true,
  duration_sec  integer
);
create index idx_sessions_token on sessions(session_token);
create index idx_sessions_user on sessions(user_id);

create table learn_progress (
  learn_progress_id  text primary key,
  user_id             text not null references users(user_id) on delete cascade,
  stage_id            text not null,
  chapter_id          text not null,
  times_completed     integer not null default 0,
  last_completed_at   timestamptz,
  pages_viewed        integer default 0,
  completed           boolean not null default false,
  updated_at          timestamptz not null default now(),
  unique (user_id, chapter_id)
);
create index idx_learn_progress_user on learn_progress(user_id);

create table test_runs (
  test_run_id     text primary key,
  user_id         text not null references users(user_id) on delete cascade,
  stage_id        text not null,
  chapter_id      text not null,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null default 'active',
  hearts_start    integer,
  hearts_end      integer,
  pending_xp      integer not null default 0,
  committed_xp    integer not null default 0,
  correct_count   integer not null default 0,
  question_count  integer not null default 0,
  mastery         boolean not null default false,
  question_ids    jsonb not null default '[]'::jsonb,
  attempt_no      integer not null default 1
);
create index idx_test_runs_user_chapter on test_runs(user_id, chapter_id);

create table attempts (
  attempt_id          text primary key,
  user_id             text not null references users(user_id) on delete cascade,
  stage_id            text not null,
  chapter_id          text not null,
  question_id         text not null,
  client_attempt_id text,
  question_attempt_no integer not null default 1,
  answer              text,
  correct             boolean not null default false,
  hearts_before       integer,
  hearts_after        integer,
  xp_earned           integer not null default 0,
  response_ms         integer,
  device              text,
  attempted_at        timestamptz not null default now(),
  test_run_id         text not null references test_runs(test_run_id) on delete cascade,
  question_xp         integer not null default 0,
  xp_committed        boolean not null default false
);
create index idx_attempts_test_run on attempts(test_run_id);
create index idx_attempts_user on attempts(user_id);

-- ============================================================
-- Practice (VS Code extension) tables
-- ============================================================

create table practice_progress (
  progress_id   text primary key,
  user_id       text not null references users(user_id) on delete cascade,
  practice_id   text not null references practice_bank(practice_id) on delete cascade,
  stage_id      text not null,
  status        text not null default 'in_progress',
  attempt_count integer not null default 0,
  last_result   text,
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (user_id, practice_id)
);
create index idx_practice_progress_user on practice_progress(user_id);

create table practice_pairings (
  pairing_id        text primary key,
  pair_code         text,
  user_id           text not null references users(user_id) on delete cascade,
  status            text not null default 'pending',
  created_at        timestamptz not null default now(),
  expires_at        timestamptz,
  device_name       text,
  device_token_hash text,
  connected_at      timestamptz,
  last_seen         timestamptz
);
create index idx_practice_pairings_user on practice_pairings(user_id);
create index idx_practice_pairings_code on practice_pairings(pair_code);
create index idx_practice_pairings_token on practice_pairings(device_token_hash);

-- ============================================================
-- Row Level Security
-- ============================================================
-- The Edge Function will use the service_role key, which bypasses RLS entirely,
-- so the app keeps working with zero policies. We still lock every table down
-- by default so the anon/public key (if ever exposed) can't read or write
-- anything directly.

do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

create unique index attempts_client_request_unique on attempts(test_run_id, client_attempt_id) where client_attempt_id is not null;
