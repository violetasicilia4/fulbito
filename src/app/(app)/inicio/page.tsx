import Link from "next/link";
import { Bell, Sparkles, Calendar, LayoutGrid, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";
import { PredictionCard } from "@/components/PredictionCard";
import { StatusPill } from "@/components/StatusPill";
import { formatMatchDate, formatMatchTime, hasKickedOff } from "@/lib/format";
import type { MatchWithTeams, Prediction } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const supabase = await createClient();
  const participant = await getCurrentParticipant();

  const [{ data: matches }, { data: predictions }, { data: ranking }] = await Promise.all([
    supabase
      .from("matches")
      .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
      .eq("phase", "group")
      .order("match_date", { ascending: true }),
    participant
      ? supabase.from("predictions").select("*").eq("user_id", participant.id)
      : Promise.resolve({ data: [] as Prediction[] }),
    supabase
      .from("ranking")
      .select("*")
      .order("total_points", { ascending: false })
      .order("exact_results", { ascending: false })
      .order("display_name", { ascending: true }),
  ]);

  const allMatches = (matches ?? []) as unknown as MatchWithTeams[];
  const predictionByMatch = new Map((predictions ?? []).map((p) => [p.match_id, p]));
  const rows = ranking ?? [];
  const me = rows.find((row) => row.user_id === participant?.id);
  const myRank = me ? rows.indexOf(me) + 1 : null;

  const totalMatches = allMatches.length;
  const totalPredicted = predictions?.length ?? 0;
  const progressPct = totalMatches > 0 ? Math.round((totalPredicted / totalMatches) * 100) : 0;

  const now = new Date();
  const upcoming = allMatches.filter((match) => !hasKickedOff(match.match_date, now));
  const [featured, ...rest] = upcoming;
  const otherPending = rest.slice(0, 4);

  const firstName = (participant?.display_name ?? "").trim().split(/\s+/)[0] || "Hola";

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <span className="eyebrow">Mundial 2026</span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Hola, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-ink/60">¡Bienvenido de vuelta!</p>
        </div>
        <span className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <Bell className="h-4 w-4" strokeWidth={2} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-pink" aria-hidden />
        </span>
      </header>

      <section className="relative overflow-hidden rounded-[28px] bg-purple p-5 text-white shadow-[0_16px_40px_-14px_rgba(11,25,87,0.4)]">
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-pink/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-purple-light/15 blur-2xl" />

        <div className="relative grid grid-cols-2 gap-3">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-pink">Posición actual</span>
            <span className="mt-0.5 block text-2xl font-black tracking-tight">
              {myRank ? `${myRank}° lugar` : "—"}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-pink">Puntos totales</span>
            <span className="mt-0.5 block text-2xl font-black tracking-tight">
              {me?.total_points ?? 0} <span className="text-xs font-semibold text-pink">pts</span>
            </span>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/80">
            <span>Pronósticos completados</span>
            <span>
              {totalPredicted} de {totalMatches} · {progressPct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-pink transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        <ActionPill href="/predicciones" icon={Sparkles} label="Pronosticar" />
        <ActionPill href="/fixture" icon={Calendar} label="Ver fixture" />
        <ActionPill href="/ranking" icon={LayoutGrid} label="Ranking" />
      </section>

      <section className="space-y-3">
        <span className="eyebrow pl-1">Próximos partidos</span>

        {!featured && (
          <p className="premium-card p-6 text-center text-sm text-ink/60">
            No hay partidos pendientes por el momento. ⚽️
          </p>
        )}

        {featured && (
          <div className="space-y-2">
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-pink/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple">
              ⭐ Destacado de la comunidad
            </span>
            <ul>
              <PredictionCard match={featured} prediction={predictionByMatch.get(featured.id) ?? null} />
            </ul>
            <p className="px-1 text-center text-[11px] font-semibold text-ink/40">
              Sumá puntos: resultado exacto +6 🎯
            </p>
          </div>
        )}

        {otherPending.length > 0 && (
          <ul className="premium-card space-y-2 p-3">
            {otherPending.map((match) => (
              <li
                key={match.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink/80">
                  <span className="truncate">{match.home_team?.name ?? "A definir"}</span>
                  <span className="text-ink/30">vs</span>
                  <span className="truncate">{match.away_team?.name ?? "A definir"}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-[10px] font-semibold uppercase text-ink/40 sm:inline">
                    {formatMatchDate(match.match_date)} · {formatMatchTime(match.match_date)} hs
                  </span>
                  <StatusPill tone="pendiente">Pendiente</StatusPill>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActionPill({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-white px-2 py-3.5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-transform active:scale-[0.97]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-pink">
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </span>
      <span className="text-[10px] font-black uppercase tracking-tight text-ink/70">{label}</span>
    </Link>
  );
}
