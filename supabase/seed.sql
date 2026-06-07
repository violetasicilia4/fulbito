-- =====================================================================
-- Datos de ejemplo: equipos y partidos de fase de grupos (Mundial 2026)
-- =====================================================================
-- ATENCIÓN: estos equipos, grupos, fechas y horarios son de EJEMPLO,
-- generados para poder probar el MVP de punta a punta. Reemplazalos
-- por el fixture oficial real desde el panel /admin (o reescribiendo
-- este archivo) apenas esté confirmado.

-- Limpia datos de ejemplo previos (no toca participantes ni predicciones)
delete from matches;
delete from teams;

insert into teams (name, country_code, flag_emoji, group_name) values
  ('México', 'MEX', '🇲🇽', 'A'),
  ('Canadá', 'CAN', '🇨🇦', 'A'),
  ('Polonia', 'POL', '🇵🇱', 'A'),
  ('Argelia', 'ALG', '🇩🇿', 'A'),
  ('Estados Unidos', 'USA', '🇺🇸', 'B'),
  ('Gales', 'WAL', '🏴', 'B'),
  ('Costa de Marfil', 'CIV', '🇨🇮', 'B'),
  ('Australia', 'AUS', '🇦🇺', 'B'),
  ('Argentina', 'ARG', '🇦🇷', 'C'),
  ('Uruguay', 'URU', '🇺🇾', 'C'),
  ('Nigeria', 'NGA', '🇳🇬', 'C'),
  ('Catar', 'QAT', '🇶🇦', 'C'),
  ('Francia', 'FRA', '🇫🇷', 'D'),
  ('Países Bajos', 'NED', '🇳🇱', 'D'),
  ('Senegal', 'SEN', '🇸🇳', 'D'),
  ('Panamá', 'PAN', '🇵🇦', 'D'),
  ('España', 'ESP', '🇪🇸', 'E'),
  ('Croacia', 'CRO', '🇭🇷', 'E'),
  ('Ecuador', 'ECU', '🇪🇨', 'E'),
  ('Ghana', 'GHA', '🇬🇭', 'E'),
  ('Brasil', 'BRA', '🇧🇷', 'F'),
  ('Suiza', 'SUI', '🇨🇭', 'F'),
  ('Japón', 'JPN', '🇯🇵', 'F'),
  ('Egipto', 'EGY', '🇪🇬', 'F'),
  ('Portugal', 'POR', '🇵🇹', 'G'),
  ('Bélgica', 'BEL', '🇧🇪', 'G'),
  ('Irán', 'IRN', '🇮🇷', 'G'),
  ('Sudáfrica', 'RSA', '🇿🇦', 'G'),
  ('Inglaterra', 'ENG', '🏴', 'H'),
  ('Alemania', 'GER', '🇩🇪', 'H'),
  ('Colombia', 'COL', '🇨🇴', 'H'),
  ('Corea del Sur', 'KOR', '🇰🇷', 'H');

-- Partidos de ejemplo (2 fechas por grupo). Los goles quedan en NULL
-- (sin jugarse) y el estado en 'scheduled' hasta que el admin cargue
-- el resultado real.
insert into matches (phase, group_name, home_team_id, away_team_id, match_date, status)
select 'group', m.group_name, home.id, away.id, m.match_date::timestamptz, 'scheduled'
from (values
  ('A', 'México', 'Canadá', '2026-06-11T18:00:00-06:00'),
  ('A', 'Polonia', 'Argelia', '2026-06-11T21:00:00-06:00'),
  ('A', 'México', 'Polonia', '2026-06-15T18:00:00-06:00'),
  ('A', 'Canadá', 'Argelia', '2026-06-15T21:00:00-06:00'),
  ('B', 'Estados Unidos', 'Gales', '2026-06-12T18:00:00-06:00'),
  ('B', 'Costa de Marfil', 'Australia', '2026-06-12T21:00:00-06:00'),
  ('B', 'Estados Unidos', 'Costa de Marfil', '2026-06-16T18:00:00-06:00'),
  ('B', 'Gales', 'Australia', '2026-06-16T21:00:00-06:00'),
  ('C', 'Argentina', 'Uruguay', '2026-06-13T18:00:00-06:00'),
  ('C', 'Nigeria', 'Catar', '2026-06-13T21:00:00-06:00'),
  ('C', 'Argentina', 'Nigeria', '2026-06-17T18:00:00-06:00'),
  ('C', 'Uruguay', 'Catar', '2026-06-17T21:00:00-06:00'),
  ('D', 'Francia', 'Países Bajos', '2026-06-14T18:00:00-06:00'),
  ('D', 'Senegal', 'Panamá', '2026-06-14T21:00:00-06:00'),
  ('D', 'Francia', 'Senegal', '2026-06-18T18:00:00-06:00'),
  ('D', 'Países Bajos', 'Panamá', '2026-06-18T21:00:00-06:00'),
  ('E', 'España', 'Croacia', '2026-06-15T18:00:00-06:00'),
  ('E', 'Ecuador', 'Ghana', '2026-06-15T21:00:00-06:00'),
  ('E', 'España', 'Ecuador', '2026-06-19T18:00:00-06:00'),
  ('E', 'Croacia', 'Ghana', '2026-06-19T21:00:00-06:00'),
  ('F', 'Brasil', 'Suiza', '2026-06-16T18:00:00-06:00'),
  ('F', 'Japón', 'Egipto', '2026-06-16T21:00:00-06:00'),
  ('F', 'Brasil', 'Japón', '2026-06-20T18:00:00-06:00'),
  ('F', 'Suiza', 'Egipto', '2026-06-20T21:00:00-06:00'),
  ('G', 'Portugal', 'Bélgica', '2026-06-17T18:00:00-06:00'),
  ('G', 'Irán', 'Sudáfrica', '2026-06-17T21:00:00-06:00'),
  ('G', 'Portugal', 'Irán', '2026-06-21T18:00:00-06:00'),
  ('G', 'Bélgica', 'Sudáfrica', '2026-06-21T21:00:00-06:00'),
  ('H', 'Inglaterra', 'Alemania', '2026-06-18T18:00:00-06:00'),
  ('H', 'Colombia', 'Corea del Sur', '2026-06-18T21:00:00-06:00'),
  ('H', 'Inglaterra', 'Colombia', '2026-06-22T18:00:00-06:00'),
  ('H', 'Alemania', 'Corea del Sur', '2026-06-22T21:00:00-06:00')
) as m(group_name, home_name, away_name, match_date)
join teams home on home.name = m.home_name and home.group_name = m.group_name
join teams away on away.name = m.away_name and away.group_name = m.group_name;

