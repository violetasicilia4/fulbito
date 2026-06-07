const STYLES: Record<string, string> = {
  pendiente: "bg-cream text-ink/50 border border-line",
  guardada: "bg-purple text-pink border border-purple",
  cerrada: "bg-cream text-ink/40 border border-line",
  proximo: "bg-pink/15 text-purple border border-pink/30",
  "en juego": "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse",
  finalizado: "bg-cream text-ink/40 border border-line",
  puntos: "bg-pink text-purple border border-pink-dark/30",
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${cls}`}
    >
      {children}
    </span>
  );
}
