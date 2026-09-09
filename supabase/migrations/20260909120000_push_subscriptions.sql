-- Push subscriptions + reminder prefs (PWA web notifications)

alter table public.users
  add column if not exists timezone text not null default 'America/Argentina/Buenos_Aires',
  add column if not exists remind_am boolean not null default true,
  add column if not exists remind_pm boolean not null default true;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  last_am_sent_on date,
  last_pm_sent_on date,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "push_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "push_update_own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
