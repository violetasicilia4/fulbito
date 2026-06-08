import { createClient } from "@/lib/supabase/server";
import { getCurrentParticipant } from "@/lib/auth";
import { HowToScoreSection, ShareInviteButton, LogoutButton } from "@/components/ProfileInteractive";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
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

  const scored = (me?.exact_results ?? 0) + (me?.correct_outcomes ?? 0);
  const effectiveness = me && me.predictions_count > 0 ? Math.round((scored / me.predictions_count) * 100) : 0;
  const effectivenessNote =
    effectiveness >= 70 ? "Excelente promedio" : effectiveness >= 40 ? "Buen promedio" : "A seguir sumando";
  const rankNote = myRank === 1 ? "Líder del grupo" : myRank ? `${myRank}° en el ranking general` : "Sin posición todavía";

  const initials = (participant?.display_name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="space-y-3.5">
      <header>
        <span className="eyebrow">Tu cuenta</span>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">Perfil</h1>
      </header>

      <section className="premium-card flex flex-col items-center gap-2.5 p-5 text-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-cream shadow-[0_8px_24px_-6px_rgba(7,27,74,0.18)] ring-1 ring-purple/10">
          {participant?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={participant.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-2xl font-black text-purple">{initials || "?"}</span>
          )}
        </div>
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">{participant?.display_name}</h2>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <div className="premium-card p-3.5">
          <span className="eyebrow">Puntos ganados</span>
          <p className="mt-1 font-display text-2xl font-black text-purple">{me?.total_points ?? 0}</p>
          <p className="mt-1 text-[11px] font-semibold text-ink/40">{rankNote}</p>
        </div>
        <div className="premium-card p-3.5">
          <span className="eyebrow">Efectividad</span>
          <p className="mt-1 font-display text-2xl font-black text-purple">{effectiveness}%</p>
          <p className="mt-1 text-[11px] font-semibold text-ink/40">{effectivenessNote}</p>
        </div>
      </section>

      <section className="premium-card divide-y divide-line">
        <InfoRow label="Predicciones guardadas" value={`${me?.predictions_count ?? 0}`} />
        <InfoRow label="Posición global" value={myRank ? `${myRank}°` : "—"} />
        <InfoRow label="Mundial oficial" value="Mundial 2026" />
      </section>

      <HowToScoreSection />

      <div className="space-y-2">
        <ShareInviteButton />
        <LogoutButton />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm font-semibold text-ink/70">{label}</span>
      <span className="text-sm font-black text-ink">{value}</span>
    </div>
  );
}
