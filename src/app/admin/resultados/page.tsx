import { createClient } from "@/lib/supabase/server";
import { ResultsAdmin } from "./ResultsAdmin";
import type { MatchWithTeams } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .order("match_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Resultados</h1>
        <p className="mt-1 text-sm text-ink/60">
          Cargá el resultado real de cada partido apenas termine. Al guardar, marcamos el
          partido como finalizado y recalculamos automáticamente los puntos de todas las
          participantes para ese partido.
        </p>
      </div>

      <ResultsAdmin initialMatches={(matches ?? []) as unknown as MatchWithTeams[]} />
    </div>
  );
}
