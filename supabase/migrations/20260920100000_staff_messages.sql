-- Targeted staff -> student messages ("Notify" feature). The existing
-- `announcements` table is global-only (no recipient column) and is served
-- through the cached publicContent() path shared by every user, so it can't
-- represent "one message to one student." This is the one genuinely new
-- table this feature needs; everything else (student progress, sections)
-- reuses tables that already exist.
--
-- delivered_at: set the first time the flying-mail animation has been shown
-- to the student, so it never replays on a later login for the same message.
-- read_at: set when the student opens the Announcements tab, clearing the
-- unread badge for that message.
-- reply/replied_at: the student's one reply back to this specific message.
-- dismissed_at: student has cleared this notification from their list.
-- Enforced server-side (not just client UI): a staff message can only be
-- dismissed once it has a reply -- see studentDismissMessage in the backend.
create table staff_messages (
  message_id   text primary key,
  student_id   text not null references users(user_id) on delete cascade,
  staff_id     text not null references staff_users(staff_id) on delete cascade,
  message      text not null,
  sent_at      timestamptz not null default now(),
  delivered_at timestamptz,
  read_at      timestamptz,
  reply        text,
  replied_at   timestamptz,
  dismissed_at timestamptz
);
create index idx_staff_messages_student on staff_messages(student_id);
create index idx_staff_messages_staff on staff_messages(staff_id);

-- RLS on, no policies -- same posture as every other table (deny-all for
-- anon/authenticated; only the Edge Function's service-role key, which
-- bypasses RLS, ever touches this). Grants are already handled globally by
-- the baseline's `alter default privileges`, so nothing extra is needed here.
alter table staff_messages enable row level security;
