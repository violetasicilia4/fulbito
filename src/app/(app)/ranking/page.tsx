import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];
const DOT_COLORS = ["bg-purple", "bg-pink", "bg-purple-light", "bg-pink-dark", "bg-ink/25"];

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
    <div className="space-y-6">
      <header>
        <span className="eyebrow">General · Mundial 2026</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Ranking</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink/60">
          Se ordena automáticamente por puntos totales. Resultado exacto = 3 puntos,
          acertar ganador o empate = 1 punto.
        </p>
      </header>

      {me && (
        <div className="relative overflow-hidden rounded-[24px] bg-purple p-4 text-white shadow-[0_12px_30px_-10px_rgba(11,25,87,0.35)]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-light/15 blur-2xl" />
          <div className="relative grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-pink">Tu posición</span>
              <span className="mt-0.5 block text-2xl font-black tracking-tight">{myRank}° lugar</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-pink">Tus puntos</span>
              <span className="mt-0.5 block text-2xl font-black tracking-tight">
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
        <p className="premium-card p-6 text-center text-sm text-ink/60">
          Todavía no hay puntos cargados. En cuanto se jueguen los primeros partidos y se
          carguen los resultados, el ranking va a empezar a tomar forma. 🏆
        </p>
      )}

      {rows.length > 0 && (
        <section className="space-y-1.5">
          <span className="eyebrow pl-1">Posiciones</span>
          <ul className="premium-card space-y-2.5 p-3">
            {rows.map((row, index) => {
              const isMe = participant?.id === row.user_id;
              const dot = DOT_COLORS[index % DOT_COLORS.length];
              return (
                <li
                  key={row.user_id}
                  className={`flex items-center justify-between gap-3 rounded-2xl px-2.5 py-2 transition-colors ${
                    isMe ? "border border-line bg-cream" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
                    <span className="w-6 shrink-0 text-center text-sm font-black text-ink/40">
                      {MEDALS[index] ?? `#${index + 1}`}
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
                      <span className="font-display text-xl font-black text-purple">{row.total_points}</span>
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
