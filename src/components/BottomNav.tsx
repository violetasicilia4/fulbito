"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Calendar, Trophy, UserRound } from "lucide-react";

const ITEMS = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/predicciones", label: "Pronós", icon: Sparkles },
  { href: "/fixture", label: "Fixture", icon: Calendar },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-30 sm:hidden">
      <ul className="mx-auto flex max-w-3xl items-center justify-between gap-1 rounded-[22px] border border-line bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li
              key={item.href}
              className={`flex transition-[flex-grow] duration-300 ease-out ${active ? "flex-[1.3]" : "flex-1"}`}
            >
              <Link
                href={item.href}
                className={`flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[10px] font-black uppercase tracking-tight transition-all duration-200 ${
                  active ? "bg-purple text-pink shadow-md shadow-purple/20" : "text-ink/40 hover:text-purple"
                }`}
              >
                <Icon
                  className={`shrink-0 transition-all duration-200 ${
                    active ? "h-3.5 w-3.5 stroke-[2.5px]" : "h-5 w-5 stroke-[1.8px]"
                  }`}
                />
                {active && <span className="leading-none">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
