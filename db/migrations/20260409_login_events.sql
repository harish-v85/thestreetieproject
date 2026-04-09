create table if not exists public.login_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_in_at timestamptz not null default now()
);

create index if not exists login_events_user_id_idx on public.login_events (user_id);
create index if not exists login_events_logged_in_at_idx on public.login_events (logged_in_at desc);
