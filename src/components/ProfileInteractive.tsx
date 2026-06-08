"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const POINTS_INFO = [
  { points: 6, label: "Resultado exacto" },
  { points: 3, label: "Acertás el ganador o el empate" },
  { points: 0, label: "No acertás nada" },
];

export function HowToScoreSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="premium-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-bold text-ink">¿Cómo sumar puntos?</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple">
          {open ? "Ocultar" : "Mostrar"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} strokeWidth={2.5} />
        </span>
      </button>

      {open && (
        <ul className="space-y-2 border-t border-line px-4 py-3.5">
          {POINTS_INFO.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-3 py-2 text-sm">
              <span className="text-ink/70">{item.label}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                  item.points === 6
                    ? "bg-purple text-pink"
                    : item.points === 3
                      ? "bg-pink/20 text-purple"
                      : "bg-line text-ink/40"
                }`}
              >
                +{item.points} {item.points === 1 ? "punto" : "puntos"}
              </span>
            </li>
          ))}
          <Link
            href="/reglas"
            className="flex items-center justify-center gap-1 rounded-2xl bg-purple px-3 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-pink transition-opacity hover:opacity-90"
          >
            Ver reglas y ejemplos completos
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} />
          </Link>
        </ul>
      )}
    </div>
  );
}

export function ShareInviteButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "Prode Mundial 2026",
      text: "Sumate a competir conmigo en el prode del Mundial 2026.",
      url: typeof window !== "undefined" ? window.location.origin : "",
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // el usuario canceló el share o el navegador no lo permite: no hacemos nada
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-pink px-4 py-3.5 text-sm font-black uppercase tracking-tight text-purple shadow-md shadow-pink/30 transition-transform active:scale-[0.98]"
    >
      <Share2 className="h-4 w-4" strokeWidth={2.5} />
      {copied ? "¡Link copiado!" : "Compartir / Invitar amigas"}
    </button>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-black uppercase tracking-tight text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60"
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
