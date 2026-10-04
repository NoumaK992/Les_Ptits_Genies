-- Révision 1 du parcours (appliquée le 2026-10-04) : entraînement en plusieurs parties,
-- lecture de fin de niveau, un niveau par jour, persévérance.
alter table public.parcours drop constraint if exists parcours_etape_check;
alter table public.parcours add constraint parcours_etape_check check (etape in ('jeu', 'boss', 'lecture'));
alter table public.parcours add column parties_faites smallint not null default 0 check (parties_faites >= 0);
alter table public.parcours add column niveau_valide_le date;
alter table public.parcours add column boss_apres_echec smallint not null default 0 check (boss_apres_echec >= 0);
