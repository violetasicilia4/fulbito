import { Medal, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PODIUM = [
  { badge: "bg-amber-100 text-amber-600" },
  { badge: "bg-slate-200 text-slate-500" },
  { badge: "bg-orange-100 text-orange-600" },
];

export default async function RankingPage() {
  const supabase = await createClient();
  const participant = await getCurrentParticipant();

  const { data: ranking } = await supabase
    .from("ranking")
    .select("*")
    .order("total_points", { ascending: false })
    .order("exact_results", { ascending: false })
    .order("display_name", { ascending: true });

  const rows = ranking ?? [];
  const me = rows.find((row) => row.user_id === participant?.id);
  const myRank = me ? rows.indexOf(me) + 1 : null;

  return (
    <div className="space-y-4">
      <header>
        <span className="eyebrow">General · Mundial 2026</span>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">Ranking</h1>
      </header>

      {me && (
        <div className="relative overflow-hidden rounded-[24px] bg-purple p-4 text-white shadow-[0_12px_30px_-10px_rgba(7,27,74,0.35)]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-light/15 blur-2xl" />
          <div className="relative grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-pink">Tu posición</span>
              <span className="mt-0.5 block text-xl font-black tracking-tight">{myRank}° lugar</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-pink">Tus puntos</span>
              <span className="mt-0.5 block text-xl font-black tracking-tight">
                {me.total_points} <span className="text-xs font-semibold text-pink">pts</span>
              </span>
            </div>
          </div>
          <div className="relative mt-3 flex items-center justify-between border-t border-pink/15 pt-3 text-[11px] font-semibold text-white/80">
            <span>{me.exact_results} resultados exactos</span>
            <span>{me.correct_outcomes} aciertos de ganador/empate</span>
          </div>
        </div>
      )}

      {rows.length === 0 && (
        <div className="premium-card flex flex-col items-center gap-2 p-5 text-center text-sm text-ink/60">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink/20 text-purple">
            <Trophy className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <p>
            Todavía no hay puntos cargados. En cuanto se jueguen los primeros partidos y se
            carguen los resultados, el ranking va a empezar a tomar forma.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <section className="space-y-1.5">
          <span className="eyebrow pl-1">Posiciones</span>
          <ul className="premium-card space-y-1.5 p-2.5">
            {rows.map((row, index) => {
              const isMe = participant?.id === row.user_id;
              const podium = PODIUM[index];
              const isLeader = index === 0;
              return (
                <li
                  key={row.user_id}
                  className={`flex items-center justify-between gap-3 rounded-2xl px-2.5 py-2 transition-colors ${
                    isMe ? "border border-line bg-cream" : isLeader ? "bg-amber-50/60" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                        podium ? podium.badge : "bg-cream text-ink/40"
                      }`}
                    >
                      {podium ? <Medal className="h-4 w-4" strokeWidth={2.4} /> : `#${index + 1}`}
                    </span>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-display text-sm font-bold text-ink sm:text-base">
                        {row.display_name}
                      </span>
                      {isMe && (
                        <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink bg-purple">
                          Vos
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-[10px] font-semibold uppercase tracking-tight text-ink/40 sm:inline">
                      {row.exact_results} exactos · {row.correct_outcomes} aciertos
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-2xl font-black text-purple">{row.total_points}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-ink/40">pts</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
