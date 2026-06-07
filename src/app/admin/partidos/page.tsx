import { createClient } from "@/lib/supabase/server";
import { MatchesAdmin } from "./MatchesAdmin";
import type { MatchWithTeams, Team } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const supabase = await createClient();

  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from("teams").select("*").order("group_name").order("name"),
    supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .order("match_date", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Partidos</h1>
        <p className="mt-1 text-sm text-ink/60">
          Cargá el fixture: elegí los equipos, el grupo y la fecha/hora exacta de inicio
          (ese horario es el que bloquea las predicciones).
        </p>
      </div>

      <MatchesAdmin teams={(teams ?? []) as Team[]} initialMatches={(matches ?? []) as unknown as MatchWithTeams[]} />
    </div>
  );
}
