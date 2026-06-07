import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";
import { PredictionCard } from "@/components/PredictionCard";
import type { MatchWithTeams, Prediction } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function PrediccionesPage() {
  const supabase = await createClient();
  const participant = await getCurrentParticipant();

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .eq("phase", "group")
      .order("match_date", { ascending: true }),
    participant
      ? supabase.from("predictions").select("*").eq("user_id", participant.id)
      : Promise.resolve({ data: [] as Prediction[] }),
  ]);

  const predictionByMatch = new Map((predictions ?? []).map((p) => [p.match_id, p]));
  const groups = groupByGroupName((matches ?? []) as unknown as MatchWithTeams[]);

  const totalMatches = matches?.length ?? 0;
  const totalPredicted = predictions?.length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Mis predicciones</h1>
        <p className="mt-1 text-sm text-ink/60">
          Cargá el resultado que imaginás para cada partido de la fase de grupos. Podés
          editarlas hasta el horario en que arranca cada uno.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-mint/15 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          ✏️ {totalPredicted} de {totalMatches} partidos con predicción cargada
        </div>
      </header>

      {groups.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink/60">
          Todavía no hay partidos cargados. Cuando la organizadora publique el fixture vas a
          poder cargar tus predicciones acá. ⚽️
        </p>
      )}

      {groups.map(([groupName, groupMatches]) => (
        <section key={groupName}>
          <h2 className="mb-3 inline-flex items-center gap-2 font-display text-lg font-bold text-purple">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple/15 text-sm">
              {groupName}
            </span>
            Grupo {groupName}
          </h2>
          <ul className="space-y-3">
            {groupMatches.map((match) => (
              <PredictionCard
                key={match.id}
                match={match}
                prediction={predictionByMatch.get(match.id) ?? null}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function groupByGroupName(matches: MatchWithTeams[]): [string, MatchWithTeams[]][] {
  const map = new Map<string, MatchWithTeams[]>();
  for (const match of matches) {
    const key = match.group_name ?? "Sin grupo";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(match);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
