-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run.
-- Creates the table that stores newsletter signups.

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text default 'website',
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security and add NO public policies.
-- This means the table is locked down: only the secret service_role key
-- (used by the /api/subscribe serverless function on the server) can read or
-- write it. The public/anon key cannot touch it, so signups stay private.
alter table public.subscribers enable row level security;

-- Optional: faster lookups / exports by date.
create index if not exists subscribers_created_at_idx on public.subscribers (created_at desc);
