-- Apply before deploying the updated click-backend and frontend.
alter table public.test_runs add column if not exists mastery boolean not null default false;
alter table public.test_runs add column if not exists question_ids jsonb not null default '[]'::jsonb;
alter table public.attempts add column if not exists client_attempt_id text;
create unique index if not exists attempts_client_request_unique on public.attempts(test_run_id, client_attempt_id) where client_attempt_id is not null;
