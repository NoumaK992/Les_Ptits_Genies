-- Révision 2 (appliquée le 2026-10-04) : exercices déjà vus (anti-répétition) et deux jeux par séance.
create table public.items_vus (
  user_id uuid not null references public.profiles(id) on delete cascade,
  jeu text not null,
  item_id text not null,
  vu_le timestamptz not null default now(),
  primary key (user_id, jeu, item_id)
);
alter table public.items_vus enable row level security;
create policy "items_vus_select_own" on public.items_vus for select using ((select auth.uid()) = user_id);
create policy "items_vus_insert_own" on public.items_vus for insert with check ((select auth.uid()) = user_id);
create policy "items_vus_update_own" on public.items_vus for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.parcours add column manche smallint not null default 0 check (manche in (0, 1));
