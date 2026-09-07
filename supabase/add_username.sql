-- Adds a display username to users, separate from their real name.
-- The leaderboard shows this instead of `name` once a user has set one.
-- Existing users get username = NULL, which the frontend treats as
-- "must set a username before continuing" -- same gate new signups hit.

alter table users add column if not exists username text unique;
