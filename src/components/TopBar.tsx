"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/inicio", label: "Inicio" },
  { href: "/predicciones", label: "Mis predicciones" },
  { href: "/fixture", label: "Fixture" },
  { href: "/ranking", label: "Ranking" },
  { href: "/perfil", label: "Perfil" },
];

export function TopBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/inicio" className="flex items-center gap-2 font-display text-lg font-bold text-pink-dark">
          <span aria-hidden>⚽️</span>
          Prode 2026
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-purple text-pink shadow-sm shadow-purple/20"
                    : "text-ink/60 hover:bg-purple/10 hover:text-purple"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                pathname?.startsWith("/admin")
                  ? "bg-purple/15 text-purple"
                  : "text-ink/60 hover:bg-purple/10 hover:text-purple"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink/70 transition-colors hover:border-pink hover:text-pink-dark"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
