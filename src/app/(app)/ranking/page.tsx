import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Ranking</h1>
        <p className="mt-1 text-sm text-ink/60">
          Se ordena automáticamente por puntos totales. Resultado exacto = 3 puntos,
          acertar ganador o empate = 1 punto.
        </p>
      </header>

      {rows.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line bg-white p-6 text-center text-sm text-ink/60">
          Todavía no hay puntos cargados. En cuanto se jueguen los primeros partidos y se
          carguen los resultados, el ranking va a empezar a tomar forma. 🏆
        </p>
      )}

      <ul className="space-y-2.5">
        {rows.map((row, index) => {
          const isMe = participant?.id === row.user_id;
          return (
            <li
              key={row.user_id}
              className={`flex items-center gap-3 rounded-3xl border p-4 shadow-sm shadow-pink/5 transition-colors ${
                isMe ? "border-pink bg-pink/10" : "border-line bg-white"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream font-display text-base font-bold text-ink/70">
                {MEDALS[index] ?? `#${index + 1}`}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-ink">
                  {row.display_name} {isMe && <span className="text-pink-dark">(vos)</span>}
                </p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {row.exact_results} resultados exactos · {row.correct_outcomes} aciertos de
                  ganador/empate · {row.predictions_count} predicciones cargadas
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-display text-2xl font-extrabold text-pink-dark">
                  {row.total_points}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                  puntos
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
