import { createClient } from "@/lib/supabase/server";
import { TeamBadge } from "@/components/TeamBadge";
import { StatusPill } from "@/components/StatusPill";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import type { MatchWithTeams } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "Próximo", tone: "proximo" },
  live: { label: "En juego", tone: "en juego" },
  finished: { label: "Finalizado", tone: "finalizado" },
};

export default async function FixturePage() {
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("phase", "group")
    .order("match_date", { ascending: true });

  const groups = groupByGroupName((matches ?? []) as unknown as MatchWithTeams[]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Fixture</h1>
        <p className="mt-1 text-sm text-ink/60">
          Fase de grupos del Mundial 2026. Acá vas a ver fechas, horarios y resultados a
          medida que se vayan jugando los partidos.
        </p>
      </header>

      {groups.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink/60">
          El fixture todavía no está cargado. ¡Vuelve pronto! 📅
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
            {groupMatches.map((match) => {
              const status = STATUS_LABEL[match.status] ?? STATUS_LABEL.scheduled;
              const played = match.home_score !== null && match.away_score !== null;
              return (
                <li
                  key={match.id}
                  className="rounded-3xl border border-line bg-white p-4 shadow-sm shadow-pink/5 sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink/40">
                    <span>
                      {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} hs
                    </span>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <TeamBadge team={match.home_team} />
                    <div className="rounded-2xl bg-cream px-3 py-1.5 text-center font-display text-lg font-bold text-ink">
                      {played ? `${match.home_score} – ${match.away_score}` : "vs"}
                    </div>
                    <TeamBadge team={match.away_team} align="end" />
                  </div>
                </li>
              );
            })}
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
