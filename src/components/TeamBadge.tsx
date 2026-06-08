import { FlagImage } from "@/components/FlagImage";
import type { Team } from "@/lib/supabase/types";

export function TeamBadge({
  team,
  align = "start",
}: {
  team: Team | null;
  align?: "start" | "end";
}) {
  const name = team?.name ?? "A definir";

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${align === "end" ? "items-end text-right" : "items-start text-left"}`}>
      <FlagImage team={team} size="md" />
      <span className="text-xs font-semibold leading-tight text-ink sm:text-sm">{name}</span>
    </div>
  );
}
