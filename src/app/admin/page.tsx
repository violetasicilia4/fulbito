import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [{ count: participants }, { count: matches }, { count: predictions }, { count: pending }] =
    await Promise.all([
      supabase.from("participants").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("predictions").select("*", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .lte("match_date", new Date().toISOString())
        .is("home_score", null),
    ]);

  const cards = [
    { label: "Participantes", value: participants ?? 0, emoji: "👯‍♀️" },
    { label: "Partidos cargados", value: matches ?? 0, emoji: "📅" },
    { label: "Predicciones cargadas", value: predictions ?? 0, emoji: "✏️" },
    { label: "Partidos sin resultado cargado (ya empezaron)", value: pending ?? 0, emoji: "⏳" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Resumen</h1>
        <p className="mt-1 text-sm text-ink/60">
          Desde acá podés crear participantes, cargar el fixture y actualizar los
          resultados reales para que el ranking se recalcule solo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-line bg-white p-4 shadow-sm shadow-purple/5">
            <p className="text-2xl">{card.emoji}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink">{card.value}</p>
            <p className="mt-1 text-xs leading-snug text-ink/50">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminLink
          href="/admin/participantes"
          title="Participantes"
          description="Crear, editar y compartir el acceso de cada amiga."
          emoji="👯‍♀️"
        />
        <AdminLink
          href="/admin/partidos"
          title="Partidos"
          description="Cargar o editar el fixture: equipos, fechas y horarios."
          emoji="📅"
        />
        <AdminLink
          href="/admin/resultados"
          title="Resultados"
          description="Cargar el resultado real de cada partido y recalcular puntos."
          emoji="🏆"
        />
      </div>
    </div>
  );
}

function AdminLink({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-line bg-white p-5 shadow-sm shadow-purple/5 transition-transform hover:-translate-y-0.5 hover:border-purple/40"
    >
      <p className="text-2xl">{emoji}</p>
      <p className="mt-2 font-display text-base font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink/60">{description}</p>
    </Link>
  );
}
