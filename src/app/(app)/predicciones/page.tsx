import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";
import { PredictionsView } from "@/components/PredictionsView";
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

  const matchList = (matches ?? []) as unknown as MatchWithTeams[];
  const predictionList = (predictions ?? []) as Prediction[];
  const groups = groupByGroupName(matchList);

  const totalMatches = matchList.length;
  const totalPredicted = predictionList.length;

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Pronósticos oficiales</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Mis predicciones</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          Cargá el resultado que imaginás para cada partido de la fase de grupos. Probá el{" "}
          <strong className="font-bold text-purple">modo rápido</strong>: deslizá cada tarjeta a la
          derecha para enviar tu pronóstico o a la izquierda para dejarlo para más tarde — como en
          una app de citas, pero con fútbol. Podés editarlas hasta el horario en que arranca cada
          partido.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-purple px-3 py-1.5 text-xs font-black uppercase tracking-tight text-pink">
          ✏️ {totalPredicted} de {totalMatches} partidos con predicción cargada
        </div>
      </header>

      <PredictionsView groups={groups} matches={matchList} predictions={predictionList} />
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
