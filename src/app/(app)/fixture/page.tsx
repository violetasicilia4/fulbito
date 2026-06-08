import { createClient } from "@/lib/supabase/server";
import { FixtureView } from "@/components/FixtureView";
import { formatMatchDate, hasKickedOff } from "@/lib/format";
import type { MatchWithTeams } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function FixturePage() {
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .eq("phase", "group")
    .order("match_date", { ascending: true });

  const matchList = (matches ?? []) as unknown as MatchWithTeams[];
  const now = new Date();
  const upcoming = matchList.filter((match) => !hasKickedOff(match.match_date, now));
  const past = matchList.filter((match) => hasKickedOff(match.match_date, now)).reverse();

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Fixture &amp; calendario</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Fixture oficial</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          Fase de grupos del Mundial 2026.
        </p>
      </header>

      <FixtureView upcomingDays={groupByDate(upcoming)} pastDays={groupByDate(past)} />
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
