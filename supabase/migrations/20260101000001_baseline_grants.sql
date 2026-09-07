-- ============================================================================
-- BASELINE MIGRATION -- DO NOT let this be executed by `supabase db push`
-- without first checking `supabase migration list` (see the companion file
-- 20260101000000_baseline_schema.sql for the full explanation). This grant
-- statement is idempotent (safe to re-run) unlike the schema file, but it
-- should still be marked applied via `migration repair` together with the
-- baseline schema so both are treated consistently as historical.
-- ============================================================================

-- Restores the default Supabase privilege grants on the public schema that
-- get wiped out when the schema is dropped and recreated. RLS (already
-- enabled on every table with zero policies) still blocks anon/authenticated
-- from touching any row directly -- only service_role (used server-side by
-- the Edge Function) actually bypasses RLS, so this is safe to run broadly.

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
