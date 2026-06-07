# Prode Mundial 2026 🏆⚽️

MVP de una webapp privada para que un grupo de ~30-40 amigas cargue sus
predicciones de los partidos del Mundial 2026, vea el fixture, compita en un
ranking y consulte las reglas del juego. Pensada mobile-first para compartirse
por WhatsApp.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
(Postgres + Auth), pensada para deployarse en Vercel.

## Pantallas

- **/login** — ingreso o registro con email + foto de perfil + clave
  (cualquiera puede crear su cuenta desde acá subiendo una foto obligatoria;
  el primer registro queda como participante normal y el rol admin se asigna
  a mano).
- **/predicciones** — pantalla principal: cargar/editar predicciones de la
  fase de grupos, agrupadas por grupo, con banderas, validaciones, guardado
  con feedback y bloqueo automático al iniciar cada partido.
- **/fixture** — fixture completo de fase de grupos: fecha, hora, equipos,
  resultado real (si ya se jugó) y estado (próximo / en juego / finalizado).
- **/ranking** — tabla de posiciones ordenada por puntos totales, con
  resultados exactos, aciertos de ganador/empate y predicciones cargadas.
- **/reglas** — explicación del sistema de puntaje con ejemplos.
- **/admin** — panel protegido (solo para participantes con `is_admin = true`)
  para crear/editar participantes, cargar el fixture y cargar resultados
  reales (recalcula puntos automáticamente).

## Cómo correr el proyecto localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear un proyecto en [Supabase](https://supabase.com) y, en el SQL Editor,
   ejecutar en orden:
   - `supabase/schema.sql` (tablas, RLS, triggers de bloqueo, vista de ranking)
   - `supabase/seed.sql` (equipos y partidos de **ejemplo** — reemplazar por el
     fixture oficial real apenas esté confirmado, desde `/admin` o reescribiendo
     este archivo)
3. Creá tu primera cuenta directamente desde `/login → Crear cuenta` (queda
   como participante normal). Para convertirla en admin, actualizá esa fila en
   `participants` poniendo `is_admin = true` desde el SQL Editor o el dashboard
   de Supabase. Desde ahí ya podés gestionar al resto desde `/admin`, o dejar
   que cada quien cree su propia cuenta desde `/login`.
4. Copiar `.env.local.example` a `.env.local` y completar las variables (ver
   abajo).
5. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000).
6. (Opcional) Correr los tests del cálculo de puntaje:
   ```bash
   npm test
   ```

## Variables de entorno

Definidas en `.env.local` (ver `.env.local.example`):

| Variable | Dónde se usa | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y servidor | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y servidor | Clave pública `anon`, respeta RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** (`/api/admin/*`) | Clave `service_role`; nunca debe llegar al navegador |

En Vercel, configurá las mismas variables en *Project Settings → Environment
Variables* (marcando `SUPABASE_SERVICE_ROLE_KEY` como secreta / solo server).

## Modelo de datos

Ver `supabase/schema.sql` para el detalle completo (incluye RLS y triggers).
Resumen de tablas:

- **participants** — perfil de cada participante, vinculado 1 a 1 con
  `auth.users` vía `auth_user_id`. Guarda `email`, `display_name` y
  `avatar_url` (foto de perfil, obligatoria al registrarse, subida al bucket
  de Storage `avatars`).
- **teams** — selecciones, bandera (emoji + `flag_url` con la imagen real de
  la bandera, mostrada como avatar circular) y grupo.
- **matches** — partidos: fase, grupo, equipos, fecha/hora, estado, resultado
  real y `external_api_id` (para integrarlo luego con una API de resultados).
- **predictions** — una predicción por participante y partido (constraint
  `unique(user_id, match_id)`), con sus puntos calculados.
- **ranking** (vista) — agregación de puntos/aciertos por participante, para
  no exponer las predicciones individuales de otras personas.

Seguridad a nivel de base de datos:

- RLS habilitado en todas las tablas: cada participante solo puede leer/crear/
  editar **sus propias** predicciones (`predictions_*_own` policies).
- Un trigger (`prevent_locked_prediction_writes`) impide insertar o editar una
  predicción si `match_date <= now()`, sin importar por dónde llegue el
  request — ni la API ni un acceso directo a la base pueden saltearlo.

## Lógica de puntaje

Centralizada en `src/lib/scoring.ts` (`calculatePoints`), con tests en
`src/lib/scoring.test.ts`:

- Resultado exacto → **3 puntos**
- Acertar ganador o empate (sin el resultado exacto) → **1 punto**
- Cualquier otro caso → **0 puntos**

La usa tanto el endpoint de carga manual de resultados
(`/api/admin/results`) como, en el futuro, cualquier job de sincronización
automática — la regla vive en un solo lugar.

## Conectar una API de resultados real (pendiente)

La arquitectura ya está preparada para esto:

- Cada partido guarda un `external_api_id` (columna en `matches`).
- El cálculo de puntos está separado en `calculatePoints` y se invoca desde
  un único endpoint (`/api/admin/results`) que recibe `match_id` + resultado.

Para conectar una API real (API-Football, Sportmonks, etc.) faltaría:

1. Un servicio (`src/lib/football-api/...`) que llame a la API externa, mapee
   sus IDs a `external_api_id` y normalice el resultado a `{ home_score,
   away_score, status }`.
2. Un job/cron (Vercel Cron Job o Supabase Edge Function programada) que
   recorra los partidos `scheduled`/`live` cuyo `match_date` ya pasó, traiga
   el resultado actualizado y llame a la misma lógica que usa
   `/api/admin/results` (o factorizarla a una función compartida) para guardar
   el resultado y recalcular puntos.
3. Mapear el estado de la API externa a `scheduled` / `live` / `finished`.
4. Manejo de credenciales de la API (env var nueva, ej. `FOOTBALL_API_KEY`,
   solo en el servidor).

Mientras tanto, el modo manual desde `/admin → Resultados` cubre el MVP
completo: cargar el resultado ahí marca el partido como finalizado y
recalcula los puntos de todas las participantes al instante.

## Diseño

Mobile-first, con una estética minimalista en verde lima sobre blanco/gris
claro (definida en `src/app/globals.css` como tokens de Tailwind: `pink`,
`purple`, `gold`, `mint`, `cream`, `ink`, `line` — los nombres se mantuvieron
para no romper las clases existentes, pero ahora apuntan a la nueva paleta
verde), tipografía geométrica limpia (`Plus Jakarta Sans`), cards con bordes
redondeados y sombras suaves, banderas con emoji
(sin depender de un CDN externo) y estados siempre visibles (pendiente /
guardada / cerrada / puntos obtenidos / próximo / en juego / finalizado).

## Deploy

Pensado para Vercel: conectar el repo, configurar las tres variables de
entorno de Supabase y deployar. El middleware (`src/proxy.ts`) refresca la
sesión de Supabase Auth y protege las rutas privadas en cada request.
