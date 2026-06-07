-- =====================================================================
-- Fixture oficial: equipos y partidos de fase de grupos (Mundial 2026)
-- =====================================================================
-- 48 selecciones repartidas en 12 grupos (A-L) de 4 equipos cada uno,
-- con los 72 partidos de la fase de grupos (6 por grupo). Los horarios
-- están en hora de Argentina (ART = UTC-3) y los goles quedan en NULL
-- (sin jugarse) hasta que el admin cargue el resultado real desde
-- /admin → Resultados.
--
-- Las fases eliminatorias (dieciseisavos en adelante) no se cargan acá
-- porque sus cruces dependen de las posiciones finales de cada grupo;
-- se agregan desde /admin una vez que termina la fase de grupos.

-- Limpia datos previos (no toca participantes ni predicciones)
delete from matches;
delete from teams;

-- flag_url apunta a flagcdn.com (imágenes reales por código ISO de país,
-- se muestran recortadas en un círculo tipo "foto de perfil" en vez de
-- depender de los emojis de bandera, que varían según el sistema operativo
-- y no existen para algunas selecciones como Escocia o Inglaterra).
insert into teams (name, country_code, flag_emoji, flag_url, group_name) values
  ('México', 'MEX', '🇲🇽', 'https://flagcdn.com/w160/mx.png', 'A'),
  ('Sudáfrica', 'RSA', '🇿🇦', 'https://flagcdn.com/w160/za.png', 'A'),
  ('República de Corea', 'KOR', '🇰🇷', 'https://flagcdn.com/w160/kr.png', 'A'),
  ('República Checa', 'CZE', '🇨🇿', 'https://flagcdn.com/w160/cz.png', 'A'),
  ('Canadá', 'CAN', '🇨🇦', 'https://flagcdn.com/w160/ca.png', 'B'),
  ('Bosnia y Herzegovina', 'BIH', '🇧🇦', 'https://flagcdn.com/w160/ba.png', 'B'),
  ('Qatar', 'QAT', '🇶🇦', 'https://flagcdn.com/w160/qa.png', 'B'),
  ('Suiza', 'SUI', '🇨🇭', 'https://flagcdn.com/w160/ch.png', 'B'),
  ('Brasil', 'BRA', '🇧🇷', 'https://flagcdn.com/w160/br.png', 'C'),
  ('Marruecos', 'MAR', '🇲🇦', 'https://flagcdn.com/w160/ma.png', 'C'),
  ('Haití', 'HAI', '🇭🇹', 'https://flagcdn.com/w160/ht.png', 'C'),
  ('Escocia', 'SCO', '🏴', 'https://flagcdn.com/w160/gb-sct.png', 'C'),
  ('Estados Unidos', 'USA', '🇺🇸', 'https://flagcdn.com/w160/us.png', 'D'),
  ('Paraguay', 'PAR', '🇵🇾', 'https://flagcdn.com/w160/py.png', 'D'),
  ('Australia', 'AUS', '🇦🇺', 'https://flagcdn.com/w160/au.png', 'D'),
  ('Turquía', 'TUR', '🇹🇷', 'https://flagcdn.com/w160/tr.png', 'D'),
  ('Alemania', 'GER', '🇩🇪', 'https://flagcdn.com/w160/de.png', 'E'),
  ('Curazao', 'CUW', '🇨🇼', 'https://flagcdn.com/w160/cw.png', 'E'),
  ('Costa de Marfil', 'CIV', '🇨🇮', 'https://flagcdn.com/w160/ci.png', 'E'),
  ('Ecuador', 'ECU', '🇪🇨', 'https://flagcdn.com/w160/ec.png', 'E'),
  ('Países Bajos', 'NED', '🇳🇱', 'https://flagcdn.com/w160/nl.png', 'F'),
  ('Japón', 'JPN', '🇯🇵', 'https://flagcdn.com/w160/jp.png', 'F'),
  ('Suecia', 'SWE', '🇸🇪', 'https://flagcdn.com/w160/se.png', 'F'),
  ('Túnez', 'TUN', '🇹🇳', 'https://flagcdn.com/w160/tn.png', 'F'),
  ('Bélgica', 'BEL', '🇧🇪', 'https://flagcdn.com/w160/be.png', 'G'),
  ('Egipto', 'EGY', '🇪🇬', 'https://flagcdn.com/w160/eg.png', 'G'),
  ('Irán', 'IRN', '🇮🇷', 'https://flagcdn.com/w160/ir.png', 'G'),
  ('Nueva Zelanda', 'NZL', '🇳🇿', 'https://flagcdn.com/w160/nz.png', 'G'),
  ('España', 'ESP', '🇪🇸', 'https://flagcdn.com/w160/es.png', 'H'),
  ('Cabo Verde', 'CPV', '🇨🇻', 'https://flagcdn.com/w160/cv.png', 'H'),
  ('Arabia Saudita', 'KSA', '🇸🇦', 'https://flagcdn.com/w160/sa.png', 'H'),
  ('Uruguay', 'URU', '🇺🇾', 'https://flagcdn.com/w160/uy.png', 'H'),
  ('Francia', 'FRA', '🇫🇷', 'https://flagcdn.com/w160/fr.png', 'I'),
  ('Senegal', 'SEN', '🇸🇳', 'https://flagcdn.com/w160/sn.png', 'I'),
  ('Irak', 'IRQ', '🇮🇶', 'https://flagcdn.com/w160/iq.png', 'I'),
  ('Noruega', 'NOR', '🇳🇴', 'https://flagcdn.com/w160/no.png', 'I'),
  ('Argentina', 'ARG', '🇦🇷', 'https://flagcdn.com/w160/ar.png', 'J'),
  ('Argelia', 'ALG', '🇩🇿', 'https://flagcdn.com/w160/dz.png', 'J'),
  ('Austria', 'AUT', '🇦🇹', 'https://flagcdn.com/w160/at.png', 'J'),
  ('Jordania', 'JOR', '🇯🇴', 'https://flagcdn.com/w160/jo.png', 'J'),
  ('Portugal', 'POR', '🇵🇹', 'https://flagcdn.com/w160/pt.png', 'K'),
  ('RD Congo', 'COD', '🇨🇩', 'https://flagcdn.com/w160/cd.png', 'K'),
  ('Uzbekistán', 'UZB', '🇺🇿', 'https://flagcdn.com/w160/uz.png', 'K'),
  ('Colombia', 'COL', '🇨🇴', 'https://flagcdn.com/w160/co.png', 'K'),
  ('Inglaterra', 'ENG', '🏴', 'https://flagcdn.com/w160/gb-eng.png', 'L'),
  ('Croacia', 'CRO', '🇭🇷', 'https://flagcdn.com/w160/hr.png', 'L'),
  ('Ghana', 'GHA', '🇬🇭', 'https://flagcdn.com/w160/gh.png', 'L'),
  ('Panamá', 'PAN', '🇵🇦', 'https://flagcdn.com/w160/pa.png', 'L');

-- Los 72 partidos de la fase de grupos (11 al 27 de junio de 2026, hora
-- de Argentina). Los goles quedan en NULL y el estado en 'scheduled'
-- hasta que el admin cargue el resultado real.
insert into matches (phase, group_name, home_team_id, away_team_id, match_date, status)
select 'group', m.group_name, home.id, away.id, m.match_date::timestamptz, 'scheduled'
from (values
  -- jueves 11/6
  ('A', 'México', 'Sudáfrica', '2026-06-11T16:00:00-03:00'),
  ('A', 'República de Corea', 'República Checa', '2026-06-11T23:00:00-03:00'),
  -- viernes 12/6
  ('B', 'Canadá', 'Bosnia y Herzegovina', '2026-06-12T16:00:00-03:00'),
  ('D', 'Estados Unidos', 'Paraguay', '2026-06-12T22:00:00-03:00'),
  -- sábado 13/6
  ('B', 'Qatar', 'Suiza', '2026-06-13T16:00:00-03:00'),
  ('C', 'Brasil', 'Marruecos', '2026-06-13T19:00:00-03:00'),
  ('C', 'Haití', 'Escocia', '2026-06-13T22:00:00-03:00'),
  -- domingo 14/6
  ('D', 'Australia', 'Turquía', '2026-06-14T01:00:00-03:00'),
  ('E', 'Alemania', 'Curazao', '2026-06-14T14:00:00-03:00'),
  ('F', 'Países Bajos', 'Japón', '2026-06-14T17:00:00-03:00'),
  ('E', 'Costa de Marfil', 'Ecuador', '2026-06-14T20:00:00-03:00'),
  ('F', 'Suecia', 'Túnez', '2026-06-14T23:00:00-03:00'),
  -- lunes 15/6
  ('H', 'España', 'Cabo Verde', '2026-06-15T13:00:00-03:00'),
  ('G', 'Bélgica', 'Egipto', '2026-06-15T16:00:00-03:00'),
  ('H', 'Arabia Saudita', 'Uruguay', '2026-06-15T19:00:00-03:00'),
  ('G', 'Irán', 'Nueva Zelanda', '2026-06-15T22:00:00-03:00'),
  -- martes 16/6
  ('I', 'Francia', 'Senegal', '2026-06-16T16:00:00-03:00'),
  ('I', 'Irak', 'Noruega', '2026-06-16T19:00:00-03:00'),
  ('J', 'Argentina', 'Argelia', '2026-06-16T22:00:00-03:00'),
  -- miércoles 17/6
  ('J', 'Austria', 'Jordania', '2026-06-17T01:00:00-03:00'),
  ('K', 'Portugal', 'RD Congo', '2026-06-17T14:00:00-03:00'),
  ('L', 'Inglaterra', 'Croacia', '2026-06-17T17:00:00-03:00'),
  ('L', 'Ghana', 'Panamá', '2026-06-17T20:00:00-03:00'),
  ('K', 'Uzbekistán', 'Colombia', '2026-06-17T23:00:00-03:00'),
  -- jueves 18/6
  ('A', 'República Checa', 'Sudáfrica', '2026-06-18T13:00:00-03:00'),
  ('B', 'Suiza', 'Bosnia y Herzegovina', '2026-06-18T16:00:00-03:00'),
  ('B', 'Canadá', 'Qatar', '2026-06-18T19:00:00-03:00'),
  ('A', 'México', 'República de Corea', '2026-06-18T22:00:00-03:00'),
  -- viernes 19/6
  ('D', 'Estados Unidos', 'Australia', '2026-06-19T16:00:00-03:00'),
  ('C', 'Escocia', 'Marruecos', '2026-06-19T19:00:00-03:00'),
  ('C', 'Brasil', 'Haití', '2026-06-19T21:30:00-03:00'),
  -- sábado 20/6
  ('D', 'Turquía', 'Paraguay', '2026-06-20T00:00:00-03:00'),
  ('F', 'Países Bajos', 'Suecia', '2026-06-20T14:00:00-03:00'),
  ('E', 'Alemania', 'Costa de Marfil', '2026-06-20T17:00:00-03:00'),
  ('E', 'Ecuador', 'Curazao', '2026-06-20T21:00:00-03:00'),
  -- domingo 21/6
  ('F', 'Túnez', 'Japón', '2026-06-21T01:00:00-03:00'),
  ('H', 'España', 'Arabia Saudita', '2026-06-21T13:00:00-03:00'),
  ('G', 'Bélgica', 'Irán', '2026-06-21T16:00:00-03:00'),
  ('H', 'Uruguay', 'Cabo Verde', '2026-06-21T19:00:00-03:00'),
  ('G', 'Nueva Zelanda', 'Egipto', '2026-06-21T22:00:00-03:00'),
  -- lunes 22/6
  ('J', 'Argentina', 'Austria', '2026-06-22T14:00:00-03:00'),
  ('I', 'Francia', 'Irak', '2026-06-22T18:00:00-03:00'),
  ('I', 'Noruega', 'Senegal', '2026-06-22T21:00:00-03:00'),
  -- martes 23/6
  ('J', 'Jordania', 'Argelia', '2026-06-23T00:00:00-03:00'),
  ('K', 'Portugal', 'Uzbekistán', '2026-06-23T14:00:00-03:00'),
  ('L', 'Inglaterra', 'Ghana', '2026-06-23T17:00:00-03:00'),
  ('L', 'Panamá', 'Croacia', '2026-06-23T20:00:00-03:00'),
  ('K', 'Colombia', 'RD Congo', '2026-06-23T23:00:00-03:00'),
  -- miércoles 24/6
  ('B', 'Suiza', 'Canadá', '2026-06-24T16:00:00-03:00'),
  ('B', 'Bosnia y Herzegovina', 'Qatar', '2026-06-24T16:00:00-03:00'),
  ('C', 'Escocia', 'Brasil', '2026-06-24T19:00:00-03:00'),
  ('C', 'Marruecos', 'Haití', '2026-06-24T19:00:00-03:00'),
  ('A', 'República Checa', 'México', '2026-06-24T22:00:00-03:00'),
  ('A', 'Sudáfrica', 'República de Corea', '2026-06-24T22:00:00-03:00'),
  -- jueves 25/6
  ('E', 'Curazao', 'Costa de Marfil', '2026-06-25T17:00:00-03:00'),
  ('E', 'Ecuador', 'Alemania', '2026-06-25T17:00:00-03:00'),
  ('F', 'Japón', 'Suecia', '2026-06-25T20:00:00-03:00'),
  ('F', 'Túnez', 'Países Bajos', '2026-06-25T20:00:00-03:00'),
  ('D', 'Turquía', 'Estados Unidos', '2026-06-25T23:00:00-03:00'),
  ('D', 'Paraguay', 'Australia', '2026-06-25T23:00:00-03:00'),
  -- viernes 26/6
  ('I', 'Noruega', 'Francia', '2026-06-26T16:00:00-03:00'),
  ('I', 'Senegal', 'Irak', '2026-06-26T16:00:00-03:00'),
  ('H', 'Cabo Verde', 'Arabia Saudita', '2026-06-26T21:00:00-03:00'),
  ('H', 'Uruguay', 'España', '2026-06-26T21:00:00-03:00'),
  -- sábado 27/6
  ('G', 'Egipto', 'Irán', '2026-06-27T00:00:00-03:00'),
  ('G', 'Nueva Zelanda', 'Bélgica', '2026-06-27T00:00:00-03:00'),
  ('L', 'Panamá', 'Inglaterra', '2026-06-27T18:00:00-03:00'),
  ('L', 'Croacia', 'Ghana', '2026-06-27T18:00:00-03:00'),
  ('K', 'Colombia', 'Portugal', '2026-06-27T20:30:00-03:00'),
  ('K', 'RD Congo', 'Uzbekistán', '2026-06-27T20:30:00-03:00'),
  ('J', 'Argelia', 'Austria', '2026-06-27T23:00:00-03:00'),
  ('J', 'Jordania', 'Argentina', '2026-06-27T23:00:00-03:00')
) as m(group_name, home_name, away_name, match_date)
join teams home on home.name = m.home_name and home.group_name = m.group_name
join teams away on away.name = m.away_name and away.group_name = m.group_name;
