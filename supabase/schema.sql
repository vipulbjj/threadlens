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

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_premium, ai_questions_today, ai_day)
  values (new.id, coalesce(new.email, ''), false, 0, to_char(now() at time zone 'utc', 'YYYY-MM-DD'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
