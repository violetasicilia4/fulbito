import type { Team } from "@/lib/supabase/types";

export function TeamBadge({
  team,
  align = "start",
}: {
  team: Team | null;
  align?: "start" | "end";
}) {
  const name = team?.name ?? "A definir";
  const flag = team?.flag_emoji ?? "🏳️";

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "end" ? "flex-row-reverse text-right" : "text-left"
      }`}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {flag}
      </span>
      <span className="truncate text-sm font-semibold text-ink sm:text-base">{name}</span>
    </div>
  );
}
