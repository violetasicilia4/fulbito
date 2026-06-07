-- =====================================================================
-- Prode Mundial 2026 — esquema de base de datos para Supabase (Postgres)
-- =====================================================================
-- Cómo aplicarlo: pegar este archivo en el SQL Editor de tu proyecto de
-- Supabase y ejecutarlo una vez (o usar `supabase db push` si trabajás
-- con la CLI). Después correr `supabase/seed.sql` para cargar equipos
-- y partidos de ejemplo.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- participants: una fila por participante del prode.
-- Se vincula 1 a 1 con un usuario de Supabase Auth (auth_user_id).
-- ---------------------------------------------------------------------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table participants is 'Perfil de cada participante del prode, vinculado a auth.users';

-- ---------------------------------------------------------------------
-- teams: selecciones del Mundial, agrupadas por grupo de fase de grupos.
-- ---------------------------------------------------------------------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null,
  flag_emoji text,
  flag_url text,
  group_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- matches: partidos del fixture (fase de grupos primero, eliminación luego)
-- ---------------------------------------------------------------------
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  phase text not null default 'group',
  group_name text,
  home_team_id uuid references teams (id),
  away_team_id uuid references teams (id),
  match_date timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'live', 'finished')),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  external_api_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists matches_match_date_idx on matches (match_date);
create index if not exists matches_group_idx on matches (group_name);

-- ---------------------------------------------------------------------
-- predictions: una predicción por participante y partido.
-- ---------------------------------------------------------------------
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references participants (id) on delete cascade,
  match_id uuid not null references matches (id) on delete cascade,
  predicted_home_score integer not null check (predicted_home_score >= 0),
  predicted_away_score integer not null check (predicted_away_score >= 0),
  points integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists predictions_match_idx on predictions (match_id);
create index if not exists predictions_user_idx on predictions (user_id);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists matches_set_updated_at on matches;
create trigger matches_set_updated_at
  before update on matches
  for each row execute function set_updated_at();

drop trigger if exists predictions_set_updated_at on predictions;
create trigger predictions_set_updated_at
  before update on predictions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Bloqueo de predicciones a nivel de base de datos: ni siquiera con un
-- request manual a la API se puede crear/editar una predicción una vez
-- que el partido ya empezó. Esta es la garantía "dura"; la UI además
-- deshabilita los inputs y el route handler valida lo mismo para poder
-- mostrar un mensaje claro antes de llegar a la base.
-- ---------------------------------------------------------------------
create or replace function prevent_locked_prediction_writes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  kickoff timestamptz;
begin
  select match_date into kickoff from matches where id = new.match_id;

  if kickoff is null then
    raise exception 'El partido no existe.';
  end if;

  if kickoff <= now() then
    raise exception 'La predicción ya está cerrada porque el partido comenzó.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists predictions_lock_check on predictions;
create trigger predictions_lock_check
  before insert or update on predictions
  for each row execute function prevent_locked_prediction_writes();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table participants enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;

-- Cualquier persona logueada puede ver los nombres de las participantes
-- (se necesita para el ranking y la navegación), pero solo el admin
-- (vía service role, que ignora RLS) puede crear/editar participantes.
drop policy if exists participants_select on participants;
create policy participants_select on participants
  for select
  to authenticated
  using (true);

-- Equipos y partidos son de solo lectura para cualquier usuaria logueada.
-- Las altas/bajas las hace el panel admin con la service role key.
drop policy if exists teams_select on teams;
create policy teams_select on teams
  for select
  to authenticated
  using (true);

drop policy if exists matches_select on matches;
create policy matches_select on matches
  for select
  to authenticated
  using (true);

-- Predicciones: cada participante únicamente puede ver y modificar las suyas.
drop policy if exists predictions_select_own on predictions;
create policy predictions_select_own on predictions
  for select
  to authenticated
  using (
    user_id in (select id from participants where auth_user_id = auth.uid())
  );

drop policy if exists predictions_insert_own on predictions;
create policy predictions_insert_own on predictions
  for insert
  to authenticated
  with check (
    user_id in (select id from participants where auth_user_id = auth.uid())
  );

drop policy if exists predictions_update_own on predictions;
create policy predictions_update_own on predictions
  for update
  to authenticated
  using (
    user_id in (select id from participants where auth_user_id = auth.uid())
  )
  with check (
    user_id in (select id from participants where auth_user_id = auth.uid())
  );

-- =====================================================================
-- Vista de ranking
-- =====================================================================
-- Expone solo datos agregados (nombre + puntos) para que el ranking
-- pueda mostrar a todo el grupo sin filtrar las predicciones de cada
-- participante (esas siguen protegidas por las policies de arriba).
-- Se crea con security_invoker = off (comportamiento por defecto del
-- dueño de la vista) a propósito, para poder agregar entre filas que
-- el RLS de `predictions` no dejaría leer a otra usuaria directamente.
drop view if exists ranking;
create view ranking as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.points) filter (where pr.points is not null), 0)::int as total_points,
  count(*) filter (where pr.points = 3) as exact_results,
  count(*) filter (where pr.points = 1) as correct_outcomes,
  count(pr.id) as predictions_count
from participants p
left join predictions pr on pr.user_id = p.id
group by p.id, p.display_name;

grant select on ranking to authenticated;
