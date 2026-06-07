const STYLES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  guardada: "bg-emerald-100 text-emerald-700",
  cerrada: "bg-zinc-200 text-zinc-600",
  proximo: "bg-purple-light/30 text-purple",
  "en juego": "bg-pink/15 text-pink-dark",
  finalizado: "bg-zinc-200 text-zinc-600",
  puntos: "bg-gold/20 text-amber-800",
};

export function StatusPill({
  children,
  tone = "pendiente",
}: {
  children: React.ReactNode;
  tone?: keyof typeof STYLES | string;
}) {
  const cls = STYLES[tone] ?? STYLES.pendiente;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}
