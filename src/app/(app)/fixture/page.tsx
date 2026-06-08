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

  const days = groupByDate((matches ?? []) as unknown as MatchWithTeams[]);

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Fixture &amp; calendario</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Fixture oficial</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          Fase de grupos del Mundial 2026.
        </p>
      </header>

      {days.length === 0 && (
        <p className="premium-card p-6 text-center text-sm text-ink/60">
          El fixture todavía no está cargado. ¡Vuelve pronto! 📅
        </p>
      )}

      {days.map(([dateLabel, dayMatches]) => (
        <section key={dateLabel}>
          <h2 className="mb-3 inline-flex items-center gap-2 font-display text-lg font-bold capitalize tracking-tight text-purple">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink/20 text-sm">
              📅
            </span>
            {dateLabel}
          </h2>
          <ul className="space-y-3">
            {dayMatches.map((match) => {
              const status = STATUS_LABEL[match.status] ?? STATUS_LABEL.scheduled;
              const played = match.home_score !== null && match.away_score !== null;
              return (
                <li key={match.id} className="premium-card p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="eyebrow">
                      Grupo {match.group_name} · {formatMatchTime(match.match_date)} hs
                    </span>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <TeamBadge team={match.home_team} />
                    <div className="rounded-2xl bg-purple px-3 py-1.5 text-center font-display text-lg font-bold text-pink">
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

function groupByDate(matches: MatchWithTeams[]): [string, MatchWithTeams[]][] {
  const map = new Map<string, MatchWithTeams[]>();
  for (const match of matches) {
    const key = formatMatchDate(match.match_date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(match);
  }
  return Array.from(map.entries());
}
