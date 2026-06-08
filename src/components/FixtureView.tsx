"use client";

import { useState } from "react";
import { TeamBadge } from "@/components/TeamBadge";
import { StatusPill } from "@/components/StatusPill";
import { formatMatchTime } from "@/lib/format";
import type { MatchWithTeams } from "@/lib/supabase/types";

type Tab = "proximos" | "pasados";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  scheduled: { label: "Próximo", tone: "proximo" },
  live: { label: "En juego", tone: "en juego" },
  finished: { label: "Finalizado", tone: "finalizado" },
};

export function FixtureView({
  upcomingDays,
  pastDays,
}: {
  upcomingDays: [string, MatchWithTeams[]][];
  pastDays: [string, MatchWithTeams[]][];
}) {
  const [tab, setTab] = useState<Tab>("proximos");
  const days = tab === "proximos" ? upcomingDays : pastDays;

  return (
    <div className="space-y-5">
      <div className="inline-flex w-full gap-1 rounded-full bg-cream p-1 sm:w-auto">
        <TabButton active={tab === "proximos"} onClick={() => setTab("proximos")}>
          📅 Próximos partidos
        </TabButton>
        <TabButton active={tab === "pasados"} onClick={() => setTab("pasados")}>
          🏁 Partidos pasados
        </TabButton>
      </div>

      {days.length === 0 && (
        <p className="premium-card p-6 text-center text-sm text-ink/60">
          {tab === "proximos"
            ? "No hay partidos próximos por el momento. ⚽️"
            : "Todavía no se jugó ningún partido. ⚽️"}
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2 text-xs font-black uppercase tracking-tight transition-colors sm:flex-none ${
        active ? "bg-purple text-pink shadow-sm" : "text-ink/40 hover:text-ink/60"
      }`}
    >
      {children}
    </button>
  );
}
