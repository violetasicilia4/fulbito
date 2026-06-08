import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/auth";

const ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/participantes", label: "Participantes" },
  { href: "/admin/partidos", label: "Partidos" },
  { href: "/admin/resultados", label: "Resultados" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const participant = await getCurrentParticipant();

  if (!participant) redirect("/login");
  if (!participant.is_admin) redirect("/inicio");

  return (
    <div className="min-h-svh bg-cream">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="font-display text-lg font-bold text-purple">Panel admin</p>
            <p className="text-xs text-ink/50">Prode Mundial 2026 · {participant.display_name}</p>
          </div>
          <Link
            href="/inicio"
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink/70 transition-colors hover:border-pink hover:text-pink-dark"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
            Volver al prode
          </Link>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-ink/60 transition-colors hover:bg-purple/10 hover:text-purple"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
