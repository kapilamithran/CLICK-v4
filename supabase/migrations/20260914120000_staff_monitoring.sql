-- Staff monitoring infrastructure: staff accounts/sessions, sections, and
-- student-section assignments. Purely additive -- no existing table is
-- altered and no student-facing behavior changes.
--
-- Architecture notes (see supabase/config.toml and click-backend/index.ts):
--   - This project does not use Supabase Auth. Every table has RLS enabled
--     with zero policies (deny-all for the anon/authenticated roles); the
--     click-backend Edge Function is the only thing that ever talks to
--     Postgres, and it always uses the service-role key, which bypasses RLS.
--     All real authorization therefore lives in the Edge Function's own
--     code, not in Postgres policies. The new tables below follow the exact
--     same posture (RLS on, no policies) for consistency and defense in
--     depth, not as the actual enforcement layer.
--   - Staff identity is deliberately a separate table family from `users`
--     (which is deeply student-shaped: hearts, XP, streak, current_stage,
--     ...). `users.role` already exists but has only ever held 'student' and
--     is not read anywhere for authorization -- it is left untouched.
--   - No new "activity" table is created. `attempts`, `test_runs`,
--     `learn_progress`, `practice_progress` and `sessions` already carry the
--     real, timestamped student activity the dashboard needs.

create table if not exists staff_users (
  staff_id text primary key,
  name text not null,
  email text not null,
  password_hash text not null,
  password_salt text not null,
  role text not null default 'STAFF',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  last_logout_at timestamptz
);
create unique index if not exists idx_staff_users_email on staff_users (lower(email));

create table if not exists staff_sessions (
  session_id text primary key,
  session_token text not null,
  staff_id text not null references staff_users(staff_id) on delete cascade,
  login_time timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  logout_time timestamptz,
  device text,
  active boolean not null default true
);
create unique index if not exists idx_staff_sessions_token on staff_sessions (session_token);
create index if not exists idx_staff_sessions_staff on staff_sessions (staff_id);

create table if not exists sections (
  section_id text primary key,
  section_code text not null,
  section_name text not null,
  capacity integer not null default 65,
  active boolean not null default true,
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists idx_sections_code on sections (section_code);

create table if not exists student_section_assignments (
  assignment_id text primary key,
  student_id text not null references users(user_id) on delete cascade,
  section_id text not null references sections(section_id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by text references staff_users(staff_id),
  active boolean not null default true
);
-- At most one ACTIVE section per student at a time (re-assignment marks the
-- old row inactive and inserts a new one, preserving assignment history).
create unique index if not exists idx_assignment_one_active_per_student
  on student_section_assignments (student_id) where active;
create index if not exists idx_assignment_section_active
  on student_section_assignments (section_id) where active;

alter table staff_users enable row level security;
alter table staff_sessions enable row level security;
alter table sections enable row level security;
alter table student_section_assignments enable row level security;

-- Indexes to support "today"/date-range aggregation across all students
-- without per-student N+1 queries. Justified directly by the dashboard's
-- daily-activity and section-summary queries (filter/aggregate by date
-- across every student, then group by section).
create index if not exists idx_attempts_attempted_at on attempts (attempted_at);
create index if not exists idx_test_runs_started_at on test_runs (started_at);
create index if not exists idx_learn_progress_updated_at on learn_progress (updated_at);
create index if not exists idx_sessions_last_seen on sessions (last_seen);
create index if not exists idx_practice_progress_completed_at on practice_progress (completed_at);

-- The seven initial sections. Capacity is data (see column above), not a
-- frontend constant. No student rows are created or assigned here.
insert into sections (section_id, section_code, section_name, capacity, active, "order") values
  ('SEC001', 'A', 'Section A', 65, true, 1),
  ('SEC002', 'B', 'Section B', 65, true, 2),
  ('SEC003', 'C', 'Section C', 65, true, 3),
  ('SEC004', 'D', 'Section D', 65, true, 4),
  ('SEC005', 'E', 'Section E', 65, true, 5),
  ('SEC006', 'F', 'Section F', 65, true, 6),
  ('SEC007', 'G', 'Section G', 65, true, 7)
on conflict (section_id) do nothing;
