-- Tracks when staff has viewed a student's reply, so the "Students" tab
-- badge and the per-student row badge (see staffUnseenReplies /
-- staffStudentMessages in the backend) can clear independently: opening one
-- student's message thread stamps staff_seen_at on their unseen replies,
-- and the tab badge only clears once every student with an unseen reply has
-- been opened this way.
alter table staff_messages add column staff_seen_at timestamptz;
