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
      <FlagBubble team={team} />
      <span className="text-xs font-semibold leading-tight text-ink sm:text-sm">{name}</span>
    </div>
  );
}

function FlagBubble({ team }: { team: Team | null }) {
  if (team?.flag_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.flag_url}
        alt={`Bandera de ${team.name}`}
        className="h-10 w-10 shrink-0 rounded-full border border-line object-cover shadow-sm"
      />
    );
  }

  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-xl leading-none"
      aria-hidden
    >
      {team?.flag_emoji ?? "🏳️"}
    </span>
  );
}
