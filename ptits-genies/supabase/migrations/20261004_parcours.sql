-- Sous-projet B : table du parcours (appliquée le 2026-10-04 sur le projet Supabase « Les Ptits Genies »)
create table public.parcours (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  groupe text not null check (groupe ~ '^[A-Z]$'),
  place smallint not null check (place between 1 and 8),
  niveau smallint not null default 1 check (niveau between 1 and 21),
  etape text not null default 'jeu' check (etape in ('jeu', 'boss')),
  echecs_boss smallint not null default 0 check (echecs_boss >= 0),
  updated_at timestamptz not null default now()
);

alter table public.parcours enable row level security;

create policy "parcours_select_own" on public.parcours for select using ((select auth.uid()) = user_id);
create policy "parcours_insert_own" on public.parcours for insert with check ((select auth.uid()) = user_id);
create policy "parcours_update_own" on public.parcours for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
