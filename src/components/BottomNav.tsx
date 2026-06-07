"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/predicciones", label: "Predicciones", icon: "⚽️" },
  { href: "/fixture", label: "Fixture", icon: "📅" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/reglas", label: "Reglas", icon: "📋" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:hidden">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${
                  active ? "text-pink-dark" : "text-zinc-400"
                }`}
              >
                <span className={`text-lg ${active ? "scale-110" : ""} transition-transform`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
