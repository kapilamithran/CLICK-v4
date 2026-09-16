-- Pre-launch cleanup: the site currently only has dev-team/QA test accounts
-- and a handful of early signups from before the real 490-student rollout.
-- Clearing all of them except the two accounts the team is actively using,
-- so the student roster starts clean for the real launch. Every other table
-- keyed on user_id (sessions, attempts, test_runs, learn_progress,
-- practice_progress, practice_pairings, student_section_assignments,
-- staff_messages) references users(user_id) on delete cascade, so deleting
-- here is sufficient -- no other cleanup needed.
delete from users where user_id not in ('U1A8B0A6D8810', 'U485B9DDDA04E');
