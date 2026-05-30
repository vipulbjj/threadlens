-- Run in Supabase SQL editor after creating a project.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  is_premium boolean not null default false,
  ai_questions_today int not null default 0,
  ai_day text,
  created_at timestamptz not null default now()
);

create table if not exists public.premium_requests (
  id bigint generated always as identity primary key,
  email text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.premium_requests enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Service role manages profiles"
  on public.profiles for all
  using (true)
  with check (true);

-- Premium requests: insert via service role only (API route uses service key).
